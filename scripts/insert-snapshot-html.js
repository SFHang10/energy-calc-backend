const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'company-map.html');
let html = fs.readFileSync(filePath, 'utf8');

if (html.includes('class="snapshot-zone card tablet"')) {
  console.log('Snapshot HTML already present');
  process.exit(0);
}

const block =
  '      <section class="snapshot-zone card tablet" id="siteSnapshotZone" aria-label="High-level restaurant snapshot">\n' +
  '        <' + X + ' class="snapshot-head">\n' +
  '          <' + X + ' class="tablet-title" style="margin:0;">Restaurant snapshot · high level' + xd + '\n' +
  '          <span class="snapshot-live"><span class="snapshot-live-dot" aria-hidden="true"></span> Live preview</span>\n' +
  '        ' + xd + '\n' +
  '        <' + X + ' class="snapshot-kpis" id="snapshotKpis">' + xd + '\n' +
  '        <' + X + ' class="snapshot-grid" id="snapshotGrid">' + xd + '\n' +
  '        <p class="snapshot-footnote">High-level view for the selected site — streams from meters, BMS, and Greenways audit when connected.</p>\n' +
  '      </section>\n';

const mainTag = '    </main>';
const mainIdx = html.indexOf(mainTag);
if (mainIdx < 0) {
  console.error('</main> not found');
  process.exit(1);
}

html = html.slice(0, mainIdx) + block + html.slice(mainIdx);
fs.writeFileSync(filePath, html, 'utf8');
console.log('Inserted snapshot HTML before </main>');
