# -*- coding: utf-8 -*-
"""Save preserved working copies of Greenways dashboard HTML (PROJECT-CONTINUITY protocol)."""
from __future__ import annotations

import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_DIR = ROOT / "HTMLS GWM GWB"

# Canonical live files + preserved alias targets
SNAPSHOT_FILES = [
    "Greenways Interface .html",
    "restaurant-data.html",
    "restaurant-equipment-deep-dive.html",
    "company-map.html",
    "Chef 3 W2W .html",
    "utility-detail.html",
    "deals-ticker-hub.html",
]

WORKING_ALIASES = [
    "Greenways Interface - Working.html",
    "Greenways Interface  - Copy.html",
]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    snap_dir = HTML_DIR / "snapshots" / f"working-{day}"
    snap_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "label": "Greenways dashboard working snapshot",
        "createdAt": stamp,
        "purpose": "On-disk baseline to restore if session/chat loss or bad edit; update each milestone.",
        "serveNote": "Open via http://localhost:4000/HTMLS%20GWM%20GWB/... not file://",
        "files": [],
    }

    main_dashboard = HTML_DIR / "Greenways Interface .html"
    if not main_dashboard.is_file():
        raise SystemExit(f"Missing main dashboard: {main_dashboard}")

    for name in SNAPSHOT_FILES:
        src = HTML_DIR / name
        if not src.is_file():
            print(f"skip (missing): {name}")
            continue
        dest = snap_dir / name
        shutil.copy2(src, dest)
        manifest["files"].append(
            {
                "name": name,
                "bytes": src.stat().st_size,
                "sha256": sha256_file(src),
            }
        )
        print(f"snapshot: {dest.relative_to(ROOT)}")

    manifest_path = snap_dir / "MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    for alias in WORKING_ALIASES:
        dest = HTML_DIR / alias
        shutil.copy2(main_dashboard, dest)
        print(f"working alias: {dest.relative_to(ROOT)}")

    latest_ptr = HTML_DIR / "snapshots" / "LATEST-WORKING.txt"
    latest_ptr.write_text(
        f"{snap_dir.relative_to(ROOT).as_posix()}\n"
        f"updated={stamp}\n"
        f"main=HTMLS GWM GWB/Greenways Interface .html\n",
        encoding="utf-8",
    )
    print(f"pointer: {latest_ptr.relative_to(ROOT)}")
    print("done")


if __name__ == "__main__":
    main()
