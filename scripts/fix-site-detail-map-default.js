const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'Greenways Interface .html');
let html = fs.readFileSync(filePath, 'utf8');

const openTag = '<' + X + ' class="site-detail-company-map" id="siteDetailCompanyMapEmbed">';
html = html.replace(
  /<(?:div|motion) class="site-detail-company-map(?: collapsed)?" id="siteDetailCompanyMapEmbed">/,
  openTag
);

html = html.replace(
  'title="Company Map Embedded"\n            loading="lazy"',
  'title="Company Map Embedded"\n            loading="eager"'
);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Site Detail company map default: open');
