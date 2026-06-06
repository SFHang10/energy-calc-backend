from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")
d = "d" + "iv"

status_m = re.search(
    r'    <section class="system-status-panel" id="systemStatusPanel"[\s\S]*?    </section>\n',
    text,
)
if not status_m:
    raise SystemExit("status panel not found")
status_block = status_m.group(0)
text = text.replace(status_block, "", 1)

marker = f"      Water\n    </{d}>\n    </{d}>\n"
replacement = f"      Water\n    </{d}>\n" + status_block + f"    </{d}>\n"

if marker not in text:
    raise SystemExit("marker not found")
if text.find("systemStatusPanel") > 0 and marker not in text:
    pass

text = text.replace(marker, replacement, 1)
p.write_text(text, encoding="utf-8")
print("placed system status under Water")
