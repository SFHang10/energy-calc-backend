const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'restaurant-data.html');
let html = fs.readFileSync(filePath, 'utf8');

html = html.replace(/<\/?motion>/g, (tag) => tag.replace(/motion/g, 'motion' === 'motion' ? 'div' : 'motion'));

const utilityFn = `    function utilityBlock(label, icon, cls, native, unit, eur, pct) {
      return (
        '<article class="glass-block glass-block--' + cls + '" tabindex="0">' +
          '<div class="block-head">' +
            '<span class="block-icon">' + icon + '</span>' +
            '<span class="block-pct">' + Math.round(pct) + '%</span>' +
          '</div>' +
          ringHtml(pct, label) +
          '<motion class="block-name">' + label + '</motion>' +
          '<motion class="block-stat"><span>Volume</span><strong>' + fmt(native) + ' ' + unit + '</strong></motion>' +
          '<motion class="block-stat"><span>Est. cost</span><strong>' + euro(eur) + '/mo</strong></motion>' +
        '</article>'
      );
    }`;

// Fix utilityBlock in file - replace broken section
const start = html.indexOf('    function utilityBlock(');
const end = html.indexOf('    function fixMotion(');
if (start >= 0 && end > start) {
  const X = 'di' + 'v';
  const xd = '</' + X + '>';
  const cleanFn =
    '    function utilityBlock(label, icon, cls, native, unit, eur, pct) {\n' +
    '      return (\n' +
    "        '<article class=\"glass-block glass-block--' + cls + '\" tabindex=\"0\">' +\n" +
    "          '<" + X + " class=\"block-head\">' +\n" +
    "            '<span class=\"block-icon\">' + icon + '</span>' +\n" +
    "            '<span class=\"block-pct\">' + Math.round(pct) + '%</span>' +\n" +
    "          '" + xd + "' +\n" +
    '          ringHtml(pct, label) +\n' +
    "          '<" + X + " class=\"block-name\">' + label + '" + xd + "' +\n" +
    "          '<" + X + " class=\"block-stat\"><span>Volume</span><strong>' + fmt(native) + ' ' + unit + '</strong>" + xd + "' +\n" +
    "          '<" + X + " class=\"block-stat\"><span>Est. cost</span><strong>' + euro(eur) + '/mo</strong>" + xd + "' +\n" +
    "        '</article>'\n" +
    '      );\n' +
    '    }\n\n';
  html = html.slice(0, start) + cleanFn + html.slice(end);
  html = html.replace(/\n    function fixMotion[\s\S]*?\n    function renderBuilding/, '\n    function renderBuilding');
}

// Fix renderBuilding innerHTML - remove fixMotion calls
html = html.replace(/fixMotion\(utilityBlock/g, 'utilityBlock');
html = html.replace(/fixMotion\(document\.getElementById\('hvacBlock'\)\.innerHTML\);/g, '');
html = html.replace(/document\.getElementById\('hvacBlock'\)\.innerHTML = fixMotion\(document\.getElementById\('hvacBlock'\)\.innerHTML\);/g, '');

const renderStart = html.indexOf('      const elecPct =');
if (renderStart >= 0) {
  const renderEnd = html.indexOf('      document.getElementById(\'utilityRow\').innerHTML =');
  const replacement =
    '      const elecShare = (u.elecEur / u.totalEur) * 100;\n' +
    '      const gasShare = (u.gasEur / u.totalEur) * 100;\n' +
    '      const waterShare = (u.waterEur / u.totalEur) * 100;\n\n';
  html = html.slice(0, renderStart) + replacement + html.slice(renderEnd);
}

html = html.replace(
  /document\.getElementById\('utilityRow'\)\.innerHTML =[\s\S]*?\+ fixMotion\(utilityBlock\('water'/,
  "document.getElementById('utilityRow').innerHTML =\n        utilityBlock('Electricity', '⚡', 'elec', u.elec, 'kWh/mo', u.elecEur, elecShare) +\n        utilityBlock('Gas', '🔥', 'gas', u.gas, 'm³/mo', u.gasEur, gasShare) +\n        utilityBlock('Water', '💧', 'water'"
);

html = html.replace(
  /document\.getElementById\('equipmentGrid'\)\.innerHTML = equip\.map[\s\S]*?join\(''\);\s*document\.getElementById\('equipmentGrid'\)\.innerHTML = fixMotion\(document\.getElementById\('equipmentGrid'\)\.innerHTML\);/,
  `document.getElementById('equipmentGrid').innerHTML = equip.map((item) => {
        const pct = item.share * 55;
        const cost = equipEurPool * item.share;
        const X = 'di' + 'v';
        const xd = '</' + X + '>';
        return (
          '<article class="glass-block glass-block--equip" style="--accent:' + item.accent + ';--glow:' + item.accent + '55" tabindex="0">' +
          ringHtml(pct, item.name) +
          '<' + X + ' class="block-name">' + item.icon + ' ' + item.name + xd +
          '<' + X + ' class="block-stat"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong>' + xd +
          '<' + X + ' class="block-stat"><span>Est. cost</span><strong>~' + euro(cost) + '/mo</strong>' + xd +
          '</article>'
        );
      }).join('');`
);

// Fix hvac block innerHTML to use div
const hvacInner = `      document.getElementById('hvacBlock').innerHTML =
        ringHtml(hvacPct, 'HVAC') +
        '<div class="hvac-copy">' +
          '<h2>Main heating &amp; HVAC</h2>' +
          '<p>Climate control, ventilation, and heating typically draw a large share of restaurant energy — especially gas for heating and electricity for fans and cooling.</p>' +
        '</motion>' +
        '<div style="text-align:right">' +
          '<span class="block-pct">' + Math.round(hvacPct) + '%</span>' +
          '<div class="block-stat" style="margin-top:8px"><span>Est. cost</span><strong>' + euro(hvacEur) + '/mo</strong></div>' +
        '</div>';`;

html = html.replace(/document\.getElementById\('hvacBlock'\)\.innerHTML =[\s\S]*?fixMotion[\s\S]*?;/, hvacInner.replace(/<\/?motion>/g, (t) => t.replace('motion', 'motion' === 'motion' ? 'div' : 'motion')));

html = html.replace(/<\/?motion>/g, (tag) => tag.replace(/motion/g, 'div'));

fs.writeFileSync(filePath, html, 'utf8');
console.log('Fixed restaurant-data.html');
