# -*- coding: utf-8 -*-
"""Repair UTF-8 mojibake from cp1252 mis-read (PowerShell Set-Content damage)."""
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
raw = p.read_bytes()

# Try decode as utf-8
text = raw.decode("utf-8")

def try_fix(s: str) -> str:
    return s.encode("cp1252").decode("utf-8")

samples = ["\u20ac", "\u2014", "\u00b7", "\u2192"]
# find a mojibake euro in file
if "\u20ac" not in text and "â‚¬" in text:
    samples = ["â‚¬", "â€”", "Â·", "â†’"]

for s in ["â‚¬", "â€”", "Â·"]:
    if s in text:
        try:
            print(repr(s), "->", repr(try_fix(s)))
        except Exception as e:
            print(repr(s), "FAIL", e)

try:
    fixed = try_fix(text)
except UnicodeError as e:
    print("Full file cp1252 fix failed:", e)
    raise SystemExit(1)

# sanity checks
checks = [
    ("Greenways Buildings", "Greenways Buildings" in fixed or "Wok To Walk" in fixed),
    ("euro sign", "\u20ac" in fixed),
    ("no mojibake euro", "â‚¬" not in fixed),
    ("em dash ok", "\u2014" in fixed or "Energy Dashboard" in fixed),
]
for name, ok in checks:
    print(name, "OK" if ok else "FAIL")

if "â‚¬" in fixed:
    print("Still has mojibake - aborting")
    raise SystemExit(1)

backup = p.with_suffix(".html.bak-encoding")
if not backup.exists():
    backup.write_bytes(raw)
    print("Backup:", backup)

p.write_text(fixed, encoding="utf-8", newline="\n")
print("Repaired:", p)
