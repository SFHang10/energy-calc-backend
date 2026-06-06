/**
 * Merge website links (and optional logo placeholders) from
 * "HTMLS GWM GWB/First 200 additional organisations html.txt"
 * into data/companies.json by matching organisation name (case-insensitive).
 *
 * - Keeps existing descriptions
 * - Adds `url` when available
 * - If a company lacks `imageUrl`, assigns a small inline SVG placeholder
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SOURCE_HTML = path.join(process.cwd(), 'HTMLS GWM GWB', 'First 200 additional organisations html.txt');
const COMPANIES_JSON = path.join(process.cwd(), 'data', 'companies.json');

const PLACEHOLDER_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0c2a3a"/><stop offset="1" stop-color="#173a2a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Segoe UI, Arial" font-size="28" fill="#9fdfff">Sustainability Project</text>
  </svg>`
);

function extractOrgsArray(html) {
  // Find the "const orgs = [ ... ];" block
  const m = html.match(/const\s+orgs\s*=\s*\[(.*?)\];/s);
  if (!m) throw new Error('Could not locate orgs array in source file');
  const arrayLiteral = `[${m[1]}]`;
  // Evaluate safely in a VM to handle JS object literals
  const script = new vm.Script(arrayLiteral);
  const ctx = vm.createContext({});
  const result = script.runInContext(ctx);
  if (!Array.isArray(result)) throw new Error('Parsed orgs is not an array');
  return result;
}

function main() {
  const html = fs.readFileSync(SOURCE_HTML, 'utf8');
  const orgs = extractOrgsArray(html);

  const raw = fs.readFileSync(COMPANIES_JSON, 'utf8');
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items)) throw new Error('companies.json items not found');

  const byName = new Map(items.map(c => [(c.name || '').toLowerCase(), c]));
  let updated = 0, linked = 0, placeholders = 0;
  for (const o of orgs) {
    const key = (o.name || '').toLowerCase();
    const c = byName.get(key);
    if (!c) continue;
    // Add url if missing
    if (!c.url && o.url) {
      c.url = o.url;
      linked++;
    }
    // Add placeholder image if missing
    if (!c.imageUrl || c.imageUrl === '') {
      c.imageUrl = PLACEHOLDER_SVG;
      placeholders++;
    }
    updated++;
  }

  const payload = Array.isArray(parsed) ? items : { ...parsed, items };
  fs.writeFileSync(COMPANIES_JSON, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Merged links for ${linked} items, set ${placeholders} placeholders, matched ${updated} of ${orgs.length}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Merge failed:', e.message);
    process.exit(1);
  }
}

