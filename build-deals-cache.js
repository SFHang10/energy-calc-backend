const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUTPUT_PATH = path.join(ROOT, 'data', 'deals-cache.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeDeal(deal) {
  if (!deal || !deal.productId) return null;
  return {
    productId: deal.productId,
    name: deal.name || deal.title || 'Deal',
    url: deal.url || deal.link || null,
    price: deal.price || null,
    expires: deal.expires || deal.validUntil || null,
    source: deal.source || 'weekly-manual'
  };
}

function buildByProductId(deals) {
  const byProductId = {};
  deals.forEach((deal) => {
    const normalized = normalizeDeal(deal);
    if (!normalized) return;
    if (!byProductId[normalized.productId]) {
      byProductId[normalized.productId] = [];
    }
    byProductId[normalized.productId].push(normalized);
  });
  return byProductId;
}

function loadDealsFromInput(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const data = readJson(inputPath);

  if (data && data.byProductId && typeof data.byProductId === 'object') {
    return { byProductId: data.byProductId, source: data.source || 'weekly-manual' };
  }

  if (Array.isArray(data)) {
    return { byProductId: buildByProductId(data), source: 'weekly-manual' };
  }

  if (data && Array.isArray(data.deals)) {
    return { byProductId: buildByProductId(data.deals), source: data.source || 'weekly-manual' };
  }

  throw new Error('Unsupported deals input format');
}

function ensureOutputDir() {
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node build-deals-cache.js <input-json-path>');
    process.exitCode = 1;
    return;
  }

  const resolvedPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(process.cwd(), inputPath);

  const { byProductId, source } = loadDealsFromInput(resolvedPath);
  const payload = {
    generatedAt: new Date().toISOString(),
    source,
    byProductId
  };

  ensureOutputDir();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`✅ Deals cache written: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`📦 Products with deals: ${Object.keys(byProductId).length}`);
}

main();
