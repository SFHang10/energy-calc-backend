const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'Greenways Interface .html');
let html = fs.readFileSync(filePath, 'utf8');

if (html.includes('class="site-detail-page-wrap"')) {
  console.log('Site detail wrap already present');
  process.exit(0);
}

const openWrap =
  '    <' + X + ' id="tab-site-detail" class="tab-content">\n' +
  '      <' + X + ' class="site-detail-page-wrap">\n' +
  '        <' + X + ' class="site-detail-page-backdrop" aria-hidden="true">' + xd + '\n' +
  '        <' + X + ' class="site-detail-page-inner">\n';

const closeWrap =
  '        ' + xd + '\n' +
  '      ' + xd + '\n' +
  '    ' + xd + '<!-- /tab-site-detail -->';

html = html.replace(
  '    <' + X + ' id="tab-site-detail" class="tab-content">\n      <' + X + ' class="card">',
  openWrap + '      <' + X + ' class="card">'
);

html = html.replace(
  '      ' + xd + '\n    ' + xd + '<!-- /tab-site-detail -->',
  '      ' + xd + '\n' + closeWrap
);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Wrapped Site Detail with backdrop layer');
