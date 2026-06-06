const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'company-map.html');
let html = fs.readFileSync(filePath, 'utf8');

const marker = 'id="siteSnapshotZone"';
let first = html.indexOf(marker);
let second = html.indexOf(marker, first + marker.length);
if (second < 0) {
  console.log('Only one snapshot block — OK');
  process.exit(0);
}

const secStart = html.lastIndexOf('<section class="snapshot-zone', second);
const secEnd = html.indexOf('</section>', second) + '</section>'.length;
let chunk = html.slice(secStart, secEnd);
// trim trailing newline
if (html[secEnd] === '\r') html = html.slice(0, secStart) + html.slice(secEnd + 2);
else if (html[secEnd] === '\n') html = html.slice(0, secStart) + html.slice(secEnd + 1);
else html = html.slice(0, secStart) + html.slice(secEnd);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Removed duplicate snapshot (' + chunk.length + ' chars)');
