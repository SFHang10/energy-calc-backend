const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GWB = path.join(ROOT, 'HTMLS GWM GWB');

const PAGES = [
  'Greenways Interface .html',
  'restaurant-data.html',
  'savings.html',
  'company-map.html',
];

function resolveHref(baseFile, href) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('http')) return { ok: true, skip: true };
  const clean = href.split('?')[0].split('#')[0];
  if (!clean || clean === './' || clean === '.') return { ok: true, skip: true };
  const baseDir = path.dirname(path.join(GWB, baseFile));
  let target = path.normalize(path.join(baseDir, decodeURIComponent(clean)));
  if (clean.startsWith('../')) {
    target = path.normalize(path.join(GWB, clean));
  }
  if (!target.startsWith(ROOT)) target = path.normalize(path.join(ROOT, clean.replace(/^\.\//, '')));
  const exists = fs.existsSync(target);
  return { ok: exists, target, href: clean };
}

function scan(file) {
  const full = path.join(GWB, file);
  const html = fs.readFileSync(full, 'utf8');
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  const broken = [];
  let m;
  while ((m = re.exec(html))) {
    const r = resolveHref(file, m[1]);
    if (r.skip) continue;
    if (!r.ok) broken.push({ file, href: m[1], resolved: r.target });
  }
  return broken;
}

let all = [];
for (const p of PAGES) all = all.concat(scan(p));
const uniq = [];
const seen = new Set();
for (const b of all) {
  const k = b.file + b.href;
  if (seen.has(k)) continue;
  seen.add(k);
  uniq.push(b);
}
if (uniq.length) {
  console.log('BROKEN LOCAL HREFS:');
  uniq.forEach((b) => console.log(`  ${b.file} → ${b.href}\n    (${b.resolved})`));
  process.exit(1);
}
console.log('All local href targets OK on', PAGES.join(', '));
