const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ENRICHED_PATHS = [
  path.join(ROOT, 'energy-calculator', 'products-with-grants-and-collection.json'),
  path.join(ROOT, 'energy-calculator', 'products-with-grants.json')
];
const DEALS_PATH = path.join(ROOT, 'data', 'deals-cache.json');
const OUTPUT_DIR = path.join(ROOT, 'data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'hover-data.json');

const MAX_GRANTS = 2;
const MAX_DEALS = 2;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadEnrichedProducts() {
  for (const filePath of ENRICHED_PATHS) {
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const data = readJson(filePath);
    const products = data.products || data.data || [];
    return { products, sourcePath: filePath };
  }
  return { products: [], sourcePath: null };
}

function loadDealsCache() {
  if (!fs.existsSync(DEALS_PATH)) {
    return { byProductId: {}, sourcePath: null };
  }
  const data = readJson(DEALS_PATH);

  if (data && data.byProductId && typeof data.byProductId === 'object') {
    return { byProductId: data.byProductId, sourcePath: DEALS_PATH };
  }

  if (Array.isArray(data)) {
    const byProductId = {};
    data.forEach((deal) => {
      if (!deal || !deal.productId) return;
      byProductId[deal.productId] = byProductId[deal.productId] || [];
      byProductId[deal.productId].push(deal);
    });
    return { byProductId, sourcePath: DEALS_PATH };
  }

  return { byProductId: {}, sourcePath: DEALS_PATH };
}

function sortGrants(grants) {
  return grants.slice().sort((a, b) => {
    const aAmount = Number(a.amount) || 0;
    const bAmount = Number(b.amount) || 0;
    if (bAmount !== aAmount) return bAmount - aAmount;
    const aDate = a.validUntil ? new Date(a.validUntil).getTime() : 0;
    const bDate = b.validUntil ? new Date(b.validUntil).getTime() : 0;
    return bDate - aDate;
  });
}

function isGrantValid(grant) {
  if (!grant || !grant.validUntil) return true;
  const ts = new Date(grant.validUntil).getTime();
  if (Number.isNaN(ts)) return true;
  return ts >= Date.now();
}

function normalizeGrant(grant) {
  return {
    name: grant.name || 'Grant',
    url: grant.applicationUrl || grant.url || null,
    amount: typeof grant.amount === 'number' ? grant.amount : (Number(grant.amount) || null),
    currency: grant.currency || null,
    validUntil: grant.validUntil || null
  };
}

function normalizeDeal(deal) {
  return {
    name: deal.name || deal.title || 'Deal',
    url: deal.url || deal.link || null,
    price: deal.price || null,
    expires: deal.expires || deal.validUntil || null
  };
}

function buildHoverItem(product, dealsByProductId) {
  const productId = product.id || product.sku || null;
  const productName = product.name || 'Unknown Product';
  const productUrl =
    product.productPageUrl ||
    `product-page-v2-marketplace.html?product=${encodeURIComponent(productId || '')}`;

  const rawGrants = Array.isArray(product.grants) ? product.grants : [];
  const grantsPreview = sortGrants(rawGrants)
    .filter(isGrantValid)
    .slice(0, MAX_GRANTS)
    .map(normalizeGrant);

  const rawDeals = (productId && dealsByProductId[productId]) || [];
  const dealsPreview = rawDeals.slice(0, MAX_DEALS).map(normalizeDeal);

  return {
    productId,
    productName,
    productUrl,
    grantsPreview,
    dealsPreview
  };
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function main() {
  const { products, sourcePath } = loadEnrichedProducts();
  const { byProductId, sourcePath: dealsSource } = loadDealsCache();

  if (!products.length) {
    console.error('No enriched products found. Hover cache not generated.');
    process.exitCode = 1;
    return;
  }

  const hoverItems = products.map((product) => buildHoverItem(product, byProductId));

  const payload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalProducts: hoverItems.length,
      maxGrantsPerProduct: MAX_GRANTS,
      maxDealsPerProduct: MAX_DEALS,
      grantsSource: sourcePath ? path.relative(ROOT, sourcePath) : null,
      dealsSource: dealsSource ? path.relative(ROOT, dealsSource) : null
    },
    products: hoverItems
  };

  ensureOutputDir();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));

  console.log(`✅ Hover cache written: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`📦 Products: ${hoverItems.length}`);
  console.log(`🎯 Grants source: ${payload.metadata.grantsSource || 'none'}`);
  console.log(`🏷️ Deals source: ${payload.metadata.dealsSource || 'none'}`);
}

main();
