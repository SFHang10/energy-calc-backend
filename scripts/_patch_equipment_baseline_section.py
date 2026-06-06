from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")
d = "d" + "iv"
marker = (
    "    <" + d + ' id="tab-equipment" class="tab-content">\n\n'
    "      <" + d + ' style="display:flex;'
)
block = (
    "    <" + d + ' id="tab-equipment" class="tab-content">\n\n'
    '      <section class="equipment-baseline-callout" id="equipment-baseline" aria-labelledby="equipment-baseline-title">\n'
    '        <span class="baseline-tag">Equipment baseline</span>\n'
    '        <h3 id="equipment-baseline-title">Why we baseline each asset class</h3>\n'
    "        <p>\n"
    "          Baselines define “normal” draw, duty cycle, and cost for each equipment type on your site. Live telemetry, anomaly alerts,\n"
    "          and savings claims all compare against that reference—so drift shows up before it becomes a surprise bill.\n"
    "        </p>\n"
    "        <ul>\n"
    "          <li>Zone tiles and instance detail show share of site and €/mo against the class curve.</li>\n"
    "          <li>Priority queue and anomaly feed flag assets persistently above expected baseline.</li>\n"
    "          <li>Audit trail records baseline revisions when you retrofit or recommission (CSRD-ready traceability).</li>\n"
    "        </ul>\n"
    "      </section>\n\n"
    "      <" + d + ' style="display:flex;'
)
if 'id="equipment-baseline"' in text:
    print("baseline section already present")
elif marker not in text:
    raise SystemExit("marker not found")
else:
    p.write_text(text.replace(marker, block, 1), encoding="utf-8")
    print("inserted equipment-baseline section")
