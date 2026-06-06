const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'HTMLS GWM GWB', 'restaurant-data.html');
let h = fs.readFileSync(p, 'utf8');
const tag = ['d', 'i', 'v'].join('');
const o = '<' + tag;
const c = '</' + tag + '>';

const equipFn = [
  '    function equipCardHtml(item, pct, cost) {',
  '      const href = deepDiveHref(item);',
  '      const alt = item.name;',
  '      const img = item.image || FINDER_IMG.induction;',
  '      return (',
  "        '<a class=\"equip-card-link\" href=\"' + href + '\" title=\"Open deep dive for ' + alt + '\">' +",
  "          '<article class=\"glass-block glass-block--equip\" style=\"--accent:' + item.accent + ';--glow:' + item.accent + '55\">' +",
  "            '" + o + " class=\"equip-photo-wrap\">' +",
  "              '<img class=\"equip-photo\" src=\"' + img + '\" alt=\"' + alt + '\" width=\"120\" height=\"92\" loading=\"lazy\" decoding=\"async\" />' +",
  "            '" + c + ">' +",
  "            '" + o + " class=\"equip-card-body\">' +",
  '              ringHtml(pct) +',
  "              '" + o + " class=\"block-name\">' + item.icon + ' ' + item.name + '" + c + ">' +",
  "              '" + o + " class=\"block-stat\"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong>" + c + ">' +",
  "              '" + o + " class=\"block-stat\"><span>Est. cost</span><strong>~' + euro(cost) + '/mo</strong>" + c + ">' +",
  "              '" + o + " class=\"equip-deep-dive-hint\">Open equipment deep dive →" + c + ">' +",
  "            '" + c + ">' +",
  "          '</article>' +",
  "        '</a>'",
  '      );',
  '    }',
  ''
].join('\n');

const startEquip = h.indexOf('    function equipCardHtml');
const endEquip = h.indexOf('    function ringHtml', startEquip);
if (startEquip === -1 || endEquip === -1) {
  console.error('equipCardHtml markers not found');
  process.exit(1);
}
h = h.slice(0, startEquip) + equipFn + h.slice(endEquip);

const gridOld =
  "      document.getElementById('equipmentGrid').innerHTML = equip.map((item) => {\n" +
  '        const pct = item.share * 55;\n' +
  '        const cost = equipEurPool * item.share;\n' +
  '        return (\n' +
  "          '<article class=\"glass-block glass-block--equip\" style=\"--accent:' + item.accent + ';--glow:' + item.accent + '55\" tabindex=\"0\">' +\n" +
  '            ringHtml(pct, item.name) +\n' +
  "            '" + o + " class=\"block-name\">' + item.icon + ' ' + item.name + '" + c + ">' +\n" +
  "            '" + o + " class=\"block-stat\"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong>" + c + ">' +\n" +
  "            '" + o + " class=\"block-stat\"><span>Est. cost</span><strong>~' + euro(cost) + '/mo</strong>" + c + ">' +\n" +
  "          '</article>'\n" +
  '        );\n' +
  "      }).join('');";

const gridNew = `      document.getElementById('equipmentGrid').innerHTML = equip.map((item) => {
        const pct = item.share * 55;
        const cost = equipEurPool * item.share;
        return equipCardHtml(item, pct, cost);
      }).join('');`;

if (h.includes(gridOld)) {
  h = h.replace(gridOld, gridNew);
} else if (!h.includes('return equipCardHtml(item, pct, cost)')) {
  h = h.replace(
    /      document\.getElementById\('equipmentGrid'\)\.innerHTML = equip\.map\(\(item\) => \{[\s\S]*?\}\)\.join\(''\);/,
    gridNew
  );
}

const fixStart = h.indexOf('function equipCardHtml');
const fixEnd = h.indexOf('function ringHtml', fixStart);
if (fixStart !== -1 && fixEnd !== -1) {
  let blk = h.slice(fixStart, fixEnd);
  const badClose = '</' + tag + '>>';
  const goodClose = '</' + tag + '>';
  while (blk.includes(badClose)) blk = blk.split(badClose).join(goodClose);
  h = h.slice(0, fixStart) + blk + h.slice(fixEnd);
}

fs.writeFileSync(p, h);
console.log('ok equipCardHtml', h.includes('equip-photo-wrap'));
console.log('double close fixed', !h.includes('</' + tag + '>>'));
console.log('ok grid link', h.includes('return equipCardHtml(item, pct, cost)'));
console.log('bad motion tags', (h.match(/<motion/g) || []).length);
