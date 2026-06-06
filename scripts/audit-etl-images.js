/**
 * Audit ETL product images — placeholders vs product-specific.
 * Usage: node scripts/audit-etl-images.js [--sqlite]
 */
const fs = require('fs');
const path = require('path');

const CATEGORY_PLACEHOLDERS = [
  'generic-placeholder',
  'motor-drive-placeholder',
  'hvac-cooling-placeholder',
  'foodservice-placeholder',
  'heat-pump-placeholder',
  'microwave-placeholder',
  'commercial-refrigeration-placeholder',
  'combio-oven-placeholder',
  'commercial-oven-placeholder',
  'office-equipment-placeholder',
  'refrigerator-placeholder',
  'commercial-dishwasher-placeholder',
];

function collectUrls(p) {
  const urls = [];
  if (p.imageUrl) urls.push(String(p.imageUrl));
  if (p.wixImageUrl) urls.push(String(p.wixImageUrl));
  let imgs = p.images;
  if (typeof imgs === 'string') {
    try {
      imgs = JSON.parse(imgs);
    } catch {
      imgs = [];
    }
  }
  if (Array.isArray(imgs)) imgs.forEach((u) => u && urls.push(String(u)));
  return urls.filter(Boolean);
}

function classify(urls) {
  if (!urls.length) return 'no_image';
  const lower = urls.map((u) => u.toLowerCase());
  if (lower.some((u) => /via\.placeholder|placeholder\.com/.test(u))) return 'via_placeholder';
  if (lower.some((u) => CATEGORY_PLACEHOLDERS.some((ph) => u.includes(ph)))) {
    return 'category_placeholder_file';
  }
  if (lower.some((u) => u.includes('placeholder'))) return 'other_placeholder_string';
  return 'has_url';
}

function auditProducts(products, label) {
  const etl = products.filter((p) => p.id && String(p.id).startsWith('etl_'));
  const counts = {};
  const urlFreq = new Map();
  const wixFreq = new Map();

  for (const p of etl) {
    const urls = collectUrls(p);
    const kind = classify(urls);
    counts[kind] = (counts[kind] || 0) + 1;
    for (const u of urls) {
      if (u.startsWith('http')) urlFreq.set(u, (urlFreq.get(u) || 0) + 1);
      if (/static\.wixstatic\.com/i.test(u)) wixFreq.set(u, (wixFreq.get(u) || 0) + 1);
    }
  }

  const placeholderTotal =
    (counts.no_image || 0) +
    (counts.via_placeholder || 0) +
    (counts.category_placeholder_file || 0) +
    (counts.other_placeholder_string || 0);

  const sharedWix5 = [...wixFreq.entries()].filter(([, n]) => n >= 5);
  let sharedWixOnlyProducts = 0;
  const sharedWixSet = new Set(sharedWix5.map(([u]) => u));
  for (const p of etl) {
    const wixUrls = collectUrls(p).filter((u) => /static\.wixstatic\.com/i.test(u));
    if (
      wixUrls.length > 0 &&
      wixUrls.every((u) => sharedWixSet.has(u)) &&
      !collectUrls(p).some((u) => /img\.etl\.energysecurity/.test(u))
    ) {
      sharedWixOnlyProducts++;
    }
  }

  const etlCdnOnly = etl.filter((p) => {
    const u = collectUrls(p);
    return u.length && u.every((x) => /img\.etl\.energysecurity/.test(x));
  }).length;

  const wixProduct = etl.filter((p) => {
    const u = collectUrls(p);
    return u.some((x) => /static\.wixstatic\.com/.test(x));
  }).length;

  console.log(`\n=== ${label} ===`);
  console.log(`ETL products: ${etl.length}`);
  console.log(`Explicit placeholders (no image / via.placeholder / *-placeholder.*): ${placeholderTotal}`);
  console.log(`  - no_image: ${counts.no_image || 0}`);
  console.log(`  - via_placeholder: ${counts.via_placeholder || 0}`);
  console.log(`  - category_placeholder_file: ${counts.category_placeholder_file || 0}`);
  console.log(`  - other_placeholder_string: ${counts.other_placeholder_string || 0}`);
  console.log(`ETL CDN only (img.etl.energysecurity.gov.uk): ${etlCdnOnly}`);
  console.log(`Any Wix static URL: ${wixProduct}`);
  console.log(`Only shared Wix URL (used by 5+ products, no ETL CDN): ${sharedWixOnlyProducts}`);
  console.log(`Has some image URL (non-placeholder): ${counts.has_url || 0}`);

  const topShared = [...urlFreq.entries()]
    .filter(([, n]) => n >= 20)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topShared.length) {
    console.log('Top repeated URLs (20+ products):');
    topShared.forEach(([u, n]) => console.log(`  ${n}x ${u.slice(0, 85)}...`));
  }

  return { etl: etl.length, placeholderTotal, etlCdnOnly, wixProduct, sharedWixOnlyProducts };
}

// FULL-DATABASE
const fullPath = path.join(__dirname, '..', 'FULL-DATABASE-5554.json');
const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
auditProducts(full.products || [], 'FULL-DATABASE-5554.json');

// products-with-grants (runtime overlay)
const grantsPath = path.join(__dirname, '..', 'products-with-grants.json');
if (fs.existsSync(grantsPath)) {
  const grants = JSON.parse(fs.readFileSync(grantsPath, 'utf8'));
  const list = grants.products || grants;
  auditProducts(Array.isArray(list) ? list : [], 'products-with-grants.json');
}

// SQLite optional
if (process.argv.includes('--sqlite')) {
  const sqlite3 = require('sqlite3').verbose();
  const dbFile = path.join(__dirname, '..', 'database', 'energy_calculator_central.db');
  const db = new sqlite3.Database(dbFile);
  db.all(
    `SELECT id, name, imageUrl, images FROM products WHERE id LIKE 'etl_%'`,
    [],
    (err, rows) => {
      if (err) {
        console.error('SQLite error:', err.message);
      } else {
        auditProducts(rows, 'SQLite energy_calculator_central.db');
      }
      db.close();
    }
  );
}
