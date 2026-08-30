const path = require('path');
const fs = require('fs/promises');

const PRODUCT_FILES = [
  path.join(__dirname, '..', 'products-with-grants-and-collection.json'),
  path.join(__dirname, '..', 'energy-calculator', 'products-with-grants-and-collection.json'),
  path.join(__dirname, '..', 'products-with-grants.json'),
  path.join(__dirname, '..', 'energy-calculator', 'products-with-grants.json')
];

const FEED_PATH = path.join(__dirname, '..', 'data', 'equipment-wire-feed.json');
const SHOWCASE_PATH = path.join(__dirname, '..', 'data', 'equipment-agent-showcase.json');

const BUCKET_RULES = {
  cookline: ['cook', 'wok', 'oven', 'combi', 'fryer', 'range', 'steamer', 'grill', 'hob', 'microwave'],
  refrigeration: ['fridge', 'freezer', 'cold', 'refrig', 'cooler', 'chiller', 'display case'],
  ventilation: ['hvac', 'vent', 'extractor', 'heat pump', 'air con', 'ahu', 'fan', 'heating', 'cooling']
};

let snapshotCache = null;
let cacheTimestamp = 0;
const CACHE_MS = 5 * 60 * 1000;

function bucketForProduct(product) {
  const hay = [
    product.id,
    product.name,
    product.category,
    product.subcategory,
    product.manufacturer
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [bucket, keywords] of Object.entries(BUCKET_RULES)) {
    if (keywords.some((kw) => hay.includes(kw))) return bucket;
  }
  return 'other';
}

async function loadProductsFile() {
  for (const filePath of PRODUCT_FILES) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(raw);
      const products = Array.isArray(data) ? data : data.products || [];
      if (products.length) {
        const stat = await fs.stat(filePath);
        return { products, source: path.basename(filePath), mtime: stat.mtime };
      }
    } catch (_) {
      /* try next */
    }
  }
  return { products: [], source: null, mtime: null };
}

async function loadJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function countGrants(product) {
  const grants = product.grants || product.matchedGrants || [];
  return Array.isArray(grants) ? grants.length : 0;
}

function enrichShowcaseRow(product, showcaseMeta) {
  const override = (showcaseMeta && showcaseMeta.label) || '';
  return {
    id: product.id,
    name: product.name || product.id,
    label: override || product.name || product.id,
    category: product.category || '',
    subcategory: product.subcategory || '',
    imageUrl: showcaseMeta?.imageUrl || product.imageUrl || product.image_url || '',
    grantsCount: countGrants(product),
    href: `/product-page-v2-marketplace.html?product=${encodeURIComponent(product.id)}&fromPopup=true`
  };
}

async function buildEquipmentWireSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - cacheTimestamp < CACHE_MS) {
    return snapshotCache;
  }

  const [{ products: allProducts, source, mtime }, feed, showcaseFile] = await Promise.all([
    loadProductsFile(),
    loadJson(FEED_PATH, { newThisMonth: [], spotlights: [], showcaseProductIds: [] }),
    loadJson(SHOWCASE_PATH, { products: [] })
  ]);

  const etlProducts = allProducts.filter((p) => String(p.id || '').startsWith('etl_'));
  const buckets = { cookline: 0, refrigeration: 0, ventilation: 0, other: 0 };
  const categoryCounts = {};

  etlProducts.forEach((product) => {
    const bucket = bucketForProduct(product);
    buckets[bucket] = (buckets[bucket] || 0) + 1;
    const cat = String(product.category || 'Uncategorised').trim();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const grantsEnriched = etlProducts.filter((p) => countGrants(p) > 0).length;
  const grantsRefreshedAt = (mtime && mtime.toISOString().slice(0, 10)) || feed.updatedAt || null;

  const showcaseMap = new Map(
    (showcaseFile.products || []).map((row) => [row.id, row])
  );
  const showcaseIds = (feed.showcaseProductIds && feed.showcaseProductIds.length
    ? feed.showcaseProductIds
    : (showcaseFile.products || []).map((p) => p.id)
  ).filter(Boolean);

  const productById = new Map(etlProducts.map((p) => [p.id, p]));
  const showcase = showcaseIds
    .map((id) => {
      const product = productById.get(id);
      if (!product) return null;
      return enrichShowcaseRow(product, showcaseMap.get(id));
    })
    .filter(Boolean);

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const snapshot = {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: source || 'none',
    totalProducts: etlProducts.length,
    grantsEnriched,
    grantsRefreshedAt,
    buckets,
    topCategories,
    showcase,
    newThisMonth: feed.newThisMonth || [],
    spotlights: feed.spotlights || [],
    meta: {
      illustrativeSpotlights: Boolean(feed.meta && feed.meta.illustrative),
      illustrativeNewRows: Boolean(feed.meta && feed.meta.illustrative),
      countsTrust: 'live',
      showcaseTrust: 'live',
      newRowsTrust: feed.meta && feed.meta.illustrative ? 'illustrative' : 'live',
      spotlightsTrust: feed.meta && feed.meta.illustrative ? 'illustrative' : 'live',
      trustLine: grantsRefreshedAt
        ? `Live counts from UK ETL marketplace · grants refreshed ${grantsRefreshedAt}`
        : 'Live counts from UK ETL marketplace · grants overlay from enriched export',
      spotlightsTrustLine: feed.meta && feed.meta.illustrative
        ? 'Desk spotlight cards and “new this month” ticker rows are illustrative curated links — ETL counts and showcase picks above are live'
        : 'Desk spotlights from equipment wire feed'
    }
  };

  snapshotCache = snapshot;
  cacheTimestamp = now;
  return snapshot;
}

module.exports = {
  buildEquipmentWireSnapshot,
  bucketForProduct
};
