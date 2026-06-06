from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")
d = "d" + "iv"
marker = "        </ul>\n      </section>\n\n      <" + d + ' style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">\n        <' + d + ">\n          <" + d + ' style="font-size:16px;font-weight:700;color:var(--text-primary)">Building Equipment</' + d + ">"
if "Open full baseline on trajectory page" in text:
    print("CTA already present")
elif marker not in text:
    raise SystemExit("marker not found")
else:
    insert = (
        "        </ul>\n"
        '        <' + d + ' class="baseline-cta-row">\n'
        '          <a class="action-btn" href="./energy-savings-trajectory.html?return=Greenways%20Interface%20.html%3Ftab%3Dequipment%23equipment-baseline#trajectoryBaselineDetails">Open full baseline on trajectory page →</a>\n'
        '          <span class="baseline-cta-hint">Why efficiency against baselines matters — example equipment reads and expanded guidance.</span>\n'
        "        </" + d + ">\n"
        "      </section>\n\n"
        "      <" + d + ' style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">\n        <' + d + ">\n          <" + d + ' style="font-size:16px;font-weight:700;color:var(--text-primary)">Building Equipment</' + d + ">"
    )
    text = text.replace(marker, insert, 1)
    p.write_text(text, encoding="utf-8")
    print("added baseline CTA")
