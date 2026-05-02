"""
Extract readable text from a .pptx (OOXML) for inventory / dashboard seeding.

Usage:
  python scripts/extract-pptx-text.py path/to/file.pptx [--json-out path/out.json]

Requires: stdlib only.
"""
from __future__ import annotations

import argparse
import json
import re
import zipfile
from datetime import UTC, datetime
from xml.etree import ElementTree as ET


NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}

# Lines that rarely represent equipment names
SKIP_PREFIXES_RE = re.compile(
    r"^\s*$|^(slide|notes|thank you|overview|introduction|questions?)\s*:?\s*$",
    re.I,
)


def text_from_slide_xml(xml_bytes: bytes) -> list[str]:
    root = ET.fromstring(xml_bytes)
    chunks: list[str] = []
    for t_el in root.findall(".//a:t", NS):
        if t_el.text:
            chunks.append(t_el.text)
    # Join adjacent runs minimally; OOXML separates runs arbitrarily
    raw = " ".join(chunks).replace("\xa0", " ")
    raw = re.sub(r"\s+", " ", raw).strip()
    if not raw:
        return []

    lines: list[str] = []
    for part in re.split(r"[\u2029\u2028\n\r]", raw):
        p = part.strip()
        if p:
            lines.append(p)
    # If slide has no embedded newlines, treat whole block as one line
    return lines if lines else []


def load_slides(z: zipfile.ZipFile) -> list[tuple[int, list[str]]]:
    names = sorted(
        [
            n
            for n in z.namelist()
            if n.startswith("ppt/slides/slide") and n.endswith(".xml")
            and "/_rels/" not in n
        ]
    )

    def slide_num(path: str) -> int:
        m = re.search(r"slide(\d+)\.xml$", path)
        return int(m.group(1)) if m else 0

    out: list[tuple[int, list[str]]] = []
    for path in sorted(names, key=slide_num):
        with z.open(path) as f:
            lines = text_from_slide_xml(f.read())
        out.append((slide_num(path), lines))
    return out


def candidate_items(lines: list[str]) -> list[str]:
    items: list[str] = []
    for line in lines:
        ln = line.strip()
        if not ln or SKIP_PREFIXES_RE.match(ln):
            continue
        items.append(ln)
    return items


def dedupe_preserve(seq: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for s in seq:
        key = s.casefold().strip()
        if key not in seen:
            seen.add(key)
            out.append(s.strip())
    return out


def fix_common_typos(name: str) -> str:
    n = re.sub(r"^S mall\b", "Small", name.strip())
    n = re.sub(r"\bD esired\b", "Desired", n)
    return n.strip()


def slugify(label: str) -> str:
    s = fix_common_typos(label).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "item"


def infer_utilities(summary: str) -> list[str]:
    t = summary.casefold()
    tags: list[str] = []
    if (
        "real time energy" in t
        or "energy monitoring" in t
        or "power quality analysis" in t
    ):
        tags.append("electricity")
    if "gas use" in t or "gas meter" in t:
        tags.append("gas")
    if (
        "water use" in t
        or "water meter" in t
        or "leak detection" in t
        or "water use/ flow" in t
    ):
        tags.append("water")
    if "temperature" in t:
        tags.append("temperature_humidity")
    # order stable unique
    return dedupe_preserve(tags)


def parse_equipment_slide(slide_no: int, line: str) -> dict | None:
    ln = line.strip()
    ln = re.sub(r"\s+D\s+esired\s+Measurements\b", " Desired Measurements", ln, flags=re.I)
    if "Desired Measurements" not in ln:
        return None
    prefix, sep, measurements = ln.partition(" Desired Measurements")
    name = fix_common_typos(prefix)
    measurements = measurements.strip()

    lc = ln.casefold()
    if lc.startswith("equipment measurements") or "conclusion for data task" in lc:
        return None
    if name.casefold().startswith(("please find a list", "thank you")):
        return None
    # narrative-only slides without a concise asset prefix
    if len(name.split()) > 24:
        return None

    equip = {
        "id": f"w2w-equip-{slide_no:03d}",
        "slideNumber": slide_no,
        "slug": slugify(name),
        "name": name,
        "measurementsSummary": measurements,
        "utilities": infer_utilities(measurements),
        "equipmentIntelligenceType": infer_equipment_type(name, measurements),
    }
    return equip


FOOD_PREP = re.compile(r"fryer|wok|rice|cooker|dishwasher|induction|coffee|milks|kettle|meat", re.I)
REFRIG = re.compile(r"fridge|freezer|cooler|chiller|glass fridge", re.I)
LIGHTING_RE = re.compile(r"\blights?\b|lighting|light board|advertising", re.I)


def infer_equipment_type(name: str, summary: str) -> str | None:
    n = fix_common_typos(name).casefold()
    bundle = (name + " " + summary).casefold()

    if "hand dryer" in n:
        return "restroom"

    if "ac unit" in n or "hvac" in bundle:
        return "hvac"

    if LIGHTING_RE.search(name):
        return "lighting"

    if "dishwasher" in n:
        return "warewashing"

    if "tap" in n or "dispenser" in n:
        return "misc"
    if "washing machine" in n:
        return "laundry"
    if re.search(r"(?<![\w])dryer(?![\w])", name, re.I) and "hand" not in n:
        return "laundry"
    if REFRIG.search(name):
        return "refrigeration"
    if FOOD_PREP.search(name):
        return "cooking"
    if "heater" in n:
        return "comfort_heat"
    if "dryer" in n and "hand" in n:
        return "restroom"

    return "other"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx_path")
    parser.add_argument("--json-out", dest="json_out")
    parser.add_argument("--brand", dest="brand", default="Wok To Walk")
    args = parser.parse_args()

    pptx_path = args.pptx_path
    with zipfile.ZipFile(pptx_path, "r") as z:
        slides = load_slides(z)

    slides_payload = [
        {"slideNumber": sn, "lines": lines}
        for sn, lines in slides
        if lines
    ]

    all_lines: list[str] = []
    for _, lines in slides:
        all_lines.extend(candidate_items(lines))

    items_legacy = dedupe_preserve(all_lines)

    equipment_out: list[dict] = []
    for sn, lines in slides:
        for line in lines:
            parsed = parse_equipment_slide(sn, line)
            if parsed:
                equipment_out.append(parsed)

    bundle = {
        "brand": args.brand,
        "extractedFrom": pptx_path.split("/")[-1].split("\\")[-1],
        "extractedAt": datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "schemaVersion": 2,
        "slides": slides_payload,
        "equipment": equipment_out,
        "items": [
            {"id": row["id"], "name": row["name"], "slideNumber": row["slideNumber"]}
            for row in equipment_out
        ],
        "itemsLegacyFlattened": [{"id": f"w2w-{i + 1:04d}", "name": name} for i, name in enumerate(items_legacy)],
        "slideCount": len(slides),
        "equipmentCount": len(equipment_out),
        "uniqueLineCountLegacy": len(items_legacy),
    }

    txt = json.dumps(bundle, indent=2, ensure_ascii=False)
    if args.json_out:
        path = args.json_out
        with open(path, "w", encoding="utf-8") as f:
            f.write(txt)
        print(f"Wrote {path} ({bundle['equipmentCount']} equipment rows)")
    else:
        print(txt)


if __name__ == "__main__":
    main()
