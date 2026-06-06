const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'company-map.html');
let html = fs.readFileSync(filePath, 'utf8');

const snapshotBlock =
  '        <section class="snapshot-zone card tablet" id="siteSnapshotZone" aria-label="High-level restaurant snapshot">\n' +
  '          <' + X + ' class="snapshot-head">\n' +
  '            <' + X + ' class="tablet-title" style="margin:0;">Restaurant snapshot · high level' + xd + '\n' +
  '            <span class="snapshot-live"><span class="snapshot-live-dot" aria-hidden="true"></span> Live preview</span>\n' +
  '          ' + xd + '\n' +
  '          <' + X + ' class="snapshot-kpis" id="snapshotKpis">' + xd + '\n' +
  '          <' + X + ' class="snapshot-grid" id="snapshotGrid">' + xd + '\n' +
  '          <p class="snapshot-footnote">High-level view for the selected site — streams from meters, BMS, and Greenways audit when connected.</p>\n' +
  '        </section>\n';

// Remove duplicate snapshot outside content (between </section> and </main>)
const outsidePattern =
  /      <section class="snapshot-zone card tablet" id="siteSnapshotZone"[\s\S]*?      <\/section>\n(?=    <\/main>)/;
html = html.replace(outsidePattern, '');

// Insert inside content before addBuildingCard if not already there
const anchor = '        <' + X + ' class="card hidden" id="addBuildingCard">';
if (html.includes(anchor) && !html.includes(snapshotBlock.trim().split('\n')[0] + '\n' + '          <')) {
  // check if snapshot already inside content
  const contentStart = html.indexOf('<section class="content">');
  const contentEnd = html.indexOf('      </section>', contentStart);
  const contentChunk = html.slice(contentStart, contentEnd);
  if (!contentChunk.includes('id="siteSnapshotZone"')) {
    html = html.replace(anchor, snapshotBlock + anchor);
  }
} else if (!html.includes('id="siteSnapshotZone"')) {
  html = html.replace(anchor, snapshotBlock + anchor);
}

// Ensure grid rows
html = html.replace('grid-template-rows: auto auto 1fr auto;', 'grid-template-rows: auto auto 1fr;');

// Remove duplicate snapshot between content </section> and </main>
const dupRe = /\n      <section class="snapshot-zone card tablet" id="siteSnapshotZone"[\s\S]*?\n      <\/section>(?=\n    <\/main>)/;
if ((html.match(/id="siteSnapshotZone"/g) || []).length > 1) {
  html = html.replace(dupRe, '');
}

fs.writeFileSync(filePath, html, 'utf8');
const count = (html.match(/id="siteSnapshotZone"/g) || []).length;
console.log('Restored company-map layout; snapshot blocks:', count);
