const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'HTMLS GWM GWB', 'company-map.html');
let h = fs.readFileSync(p, 'utf8');
const d = 'di' + 'v';

if (h.includes('class="company-map-backdrop"')) {
  console.log('backdrop already present');
  process.exit(0);
}

const re = /<body>\s*<\s*div\s+class="app">/i;
if (!re.test(h)) {
  console.error('needle not found');
  process.exit(1);
}

h = h.replace(
  re,
  '<body>\n  <' + d + ' class="company-map-backdrop" aria-hidden="true"></' + d + '>\n  <' + d + ' class="app">'
);
fs.writeFileSync(p, h);
console.log('inserted company-map-backdrop');
