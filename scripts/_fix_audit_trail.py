from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")
d = "d" + "iv"
close = "</" + d + ">"
old = (
    "      '<" + d + " class=\"audit-feed-sub\">' + item.sub + subSuffix + '' +\n"
    "      '" + close + close + "'\n"
    "    ).replace('', '" + close + "');\n"
    "  }).join('');\n"
    "}"
)
new = (
    "      '<" + d + " class=\"audit-feed-sub\">' + item.sub + subSuffix + '" + close + "' +\n"
    "      '" + close + close + "'\n"
    "    );\n"
    "  }).join('');\n"
    "}"
)
if old not in text:
    raise SystemExit("pattern not found")
p.write_text(text.replace(old, new, 1), encoding="utf-8")
print("fixed updateAuditTrail")
