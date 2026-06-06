const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'HTMLS GWM GWB', 'restaurant-data.html');
let h = fs.readFileSync(p, 'utf8');
const d = 'di' + 'v';

if (h.includes("class=\"hvac-visual\"") && h.includes('hvacBlockLink')) {
  console.log('already patched');
  process.exit(0);
}

const newBlock =
  "      const hvacParams = new URLSearchParams();\n" +
  "      hvacParams.set('equipment', 'HVAC Unit B Kitchen');\n" +
  "      hvacParams.set('return', restaurantDataReturnPath());\n" +
  "      const hvacHref = './restaurant-equipment-deep-dive.html?' + hvacParams.toString();\n" +
  "      const hvacLink = document.getElementById('hvacBlockLink');\n" +
  "      if (hvacLink) {\n" +
  "        hvacLink.href = hvacHref;\n" +
  "        hvacLink.title = 'Open HVAC deep dive';\n" +
  "      }\n" +
  "      document.getElementById('hvacBlock').innerHTML =\n" +
  "        '<" + d + " class=\"hvac-visual\">' +\n" +
  "          '<img src=\"' + FINDER_IMG.hvacUnit + '\" alt=\"HVAC heat recovery unit\" width=\"280\" height=\"168\" loading=\"lazy\" decoding=\"async\" />' +\n" +
  "        '</" + d + ">' +\n" +
  "        ringHtml(hvacPct, 'HVAC') +\n" +
  "        '<" + d + " class=\"hvac-copy\">' +\n" +
  "          '<h2>Main heating &amp; HVAC</h2>' +\n" +
  "          '<p>Climate control, ventilation, and heating typically draw a large share of restaurant energy — especially gas for heating and electricity for fans and cooling.</p>' +\n" +
  "          '<" + d + " class=\"hvac-open-hint\">Open equipment deep dive →</" + d + ">' +\n" +
  "        '</" + d + ">' +\n" +
  "        '<" + d + " class=\"hvac-stats\" style=\"text-align:right\">' +\n" +
  "          '<" + d + " class=\"block-pct\">' + Math.round(hvacPct) + '%</" + d + ">' +\n" +
  "          '<" + d + " class=\"block-stat\" style=\"margin-top:8px\"><span>Est. cost</span><strong>' + euro(hvacEur) + '/mo</strong></" + d + ">' +\n" +
  "        '</" + d + ">';\n";

const start = h.indexOf("      document.getElementById('hvacBlock').innerHTML =");
const end = h.indexOf('      const equip = buildEquipmentList', start);
if (start === -1 || end === -1) {
  console.error('markers not found', start, end);
  process.exit(1);
}

h = h.slice(0, start) + newBlock + h.slice(end);
fs.writeFileSync(p, h);
console.log('patched hvac visual');
