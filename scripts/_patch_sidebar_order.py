from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")
d = "d" + "iv"
close = "</" + d + ">\n"

def nav_block(html, nav_id):
    m = re.search(
        rf'    <{d} class="nav-item[^"]*" id="{re.escape(nav_id)}"[\s\S]*?    {re.escape(close)}',
        html,
    )
    return m.group(0) if m else None

status_m = re.search(
    r'    <section class="system-status-panel" id="systemStatusPanel"[\s\S]*?    </section>\n',
    text,
)
if not status_m:
    raise SystemExit("status panel missing")
status_block = status_m.group(0)

aside_m = re.search(r'  <aside class="sidebar">[\s\S]*?  </aside>\n\n  <!-- MAIN CONTENT -->', text)
if not aside_m:
    raise SystemExit("aside block missing")

primary_ids = [
    "sideNavConnectSensors",
    "sideNavWokAssist",
    "sideNavTrajectory",
    "sideNavEquipmentIntelligence",
    "sideNavDeals",
    "sideNavSavings",
]
secondary_ids = [
    "sideNavEquipmentAudit",
    "sideNavCompanyMap",
    "sideNavDeepDive",
    "sideNavElectricity",
    "sideNavGas",
    "sideNavWater",
]

primary = "".join(nav_block(text, i) or "" for i in primary_ids)
secondary = "".join(nav_block(text, i) or "" for i in secondary_ids)
if "sideNavConnectSensors" not in primary:
    raise SystemExit("primary nav incomplete")

new_aside = (
    f'  <aside class="sidebar">\n'
    f'    <{d} class="sidebar-section-label">Quick actions</{d}>\n'
    f'    <{d} class="sidebar-nav-scroll">\n'
    + primary
    + f'    <p class="sidebar-section-label sidebar-section-label--more">More</p>\n'
    + secondary
    + f"    </{d}>\n"
    + status_block
    + f"  </aside>\n\n  <!-- MAIN CONTENT -->"
)

text = text[: aside_m.start()] + new_aside + text[aside_m.end() :]
p.write_text(text, encoding="utf-8")
print("sidebar reordered: menu first, system status last")
