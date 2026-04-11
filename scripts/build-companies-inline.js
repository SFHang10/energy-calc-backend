/**
 * Build data/companies-inline.js from data/companies.json
 * Output format:
 *   window.COMPANIES_INLINE = [ { ...company }, ... ];
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(process.cwd(), 'data', 'companies.json');
const OUT = path.join(process.cwd(), 'data', 'companies-inline.js');

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('Source not found:', SRC);
    process.exit(1);
  }
  const raw = fs.readFileSync(SRC, 'utf8');
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items) || !items.length) {
    console.error('No items found in data/companies.json');
    process.exit(1);
  }
  // Minify to reduce size
  const payload = `window.COMPANIES_INLINE=${JSON.stringify(items)};`;
  fs.writeFileSync(OUT, payload, 'utf8');
  console.log(`Wrote ${items.length} items to ${OUT}`);
}

if (require.main === module) {
  main();
}

