const path = require('path');
const fs = require('fs/promises');

const CATALOG_PATH = path.join(__dirname, '..', 'data', 'sustainable-products-catalog.json');
const SHOWCASE_PATH = path.join(__dirname, '..', 'data', 'sustainable-products-agent-showcase.json');
const WIRE_FEED_PATH = path.join(__dirname, '..', 'data', 'products-wire-feed.json');

const LANE_LABELS = {
  water: 'Water savings',
  electricity: 'Electricity savings',
  gas: 'Gas savings'
};

let snapshotCache = null;
let cacheTimestamp = 0;
const CACHE_MS = 5 * 60 * 1000;

function catalogMatchesLane(product, lane) {
  const up = product.utilityProfile || {};
  const water = Number(up.dailyWaterLitres || 0);
  const gas = Number(up.dailyGasKwh || 0);
  const kwh = Number(up.dailyKwh || 0);
  const hay = [product.name, product.category, product.type, product.summary, ...(product.search?.keywords || [])]
    .join(' ')
    .toLowerCase();
  if (lane === 'water') {
    return water > 10 || /water|aerator|dishwasher|tap|rinse|warewash/.test(hay);
  }
  if (lane === 'gas') {
    return gas > 5 || /gas|wok|fryer|cooking|burner/.test(hay);
  }
  return kwh > 0 || /refrigerat|fridge|lighting|etl|electric|oven|steamer/.test(hay);
}

async function loadJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

async function buildProductsWireSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - cacheTimestamp < CACHE_MS) {
    return snapshotCache;
  }

  const [catalog, showcase, wireFeed, catalogStat] = await Promise.all([
    loadJson(CATALOG_PATH, { products: [] }),
    loadJson(SHOWCASE_PATH, { products: [] }),
    loadJson(WIRE_FEED_PATH, { spotlights: [] }),
    fs.stat(CATALOG_PATH).catch(() => null)
  ]);

  const products = Array.isArray(catalog.products) ? catalog.products : [];
  const lanes = {
    water: 0,
    electricity: 0,
    gas: 0
  };
  let grantsCount = 0;

  products.forEach((product) => {
    if (catalogMatchesLane(product, 'water')) lanes.water += 1;
    if (catalogMatchesLane(product, 'electricity')) lanes.electricity += 1;
    if (catalogMatchesLane(product, 'gas')) lanes.gas += 1;
    const grants = Number(product.grantsCount || product.grants?.length || 0);
    if (grants > 0) grantsCount += 1;
  });

  const topLanes = ['water', 'electricity', 'gas']
    .map((code) => ({
      code,
      name: LANE_LABELS[code] || code,
      count: lanes[code]
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const newSpotlights = products
    .slice()
    .sort((a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0))
    .slice(0, 6)
    .map((row) => ({
      id: row.id,
      title: row.name || row.id,
      lane: catalogMatchesLane(row, 'water')
        ? 'water'
        : catalogMatchesLane(row, 'gas')
          ? 'gas'
          : 'electricity'
    }));

  const showcaseRows = (showcase.products || []).slice(0, 6).map((row) => ({
    id: row.id,
    title: row.label || row.id,
    lane: row.lane || ''
  }));

  const refreshedAt =
    (catalogStat && catalogStat.mtime.toISOString().slice(0, 10)) ||
    (catalog.updatedAt && String(catalog.updatedAt).slice(0, 10)) ||
    wireFeed.updatedAt ||
    null;

  const snapshot = {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: 'sustainable-products-catalog.json',
    totalProducts: products.length,
    grantsCount,
    lanes,
    topLanes,
    newSpotlights,
    showcase: showcaseRows,
    spotlights: wireFeed.spotlights || [],
    meta: {
      illustrativeSpotlights: Boolean(wireFeed.meta && wireFeed.meta.illustrative),
      countsTrust: 'live',
      laneTrust: 'live',
      newRowsTrust: 'live',
      spotlightsTrust: wireFeed.meta && wireFeed.meta.illustrative ? 'illustrative' : 'live',
      trustLine: refreshedAt
        ? `Live counts from sustainable-products-catalog.json · refreshed ${refreshedAt}`
        : 'Live counts from sustainable-products-catalog.json',
      spotlightsTrustLine: wireFeed.meta && wireFeed.meta.illustrative
        ? 'Desk spotlight cards are illustrative curated links — lane counts above are live'
        : 'Desk spotlights from products wire feed'
    }
  };

  snapshotCache = snapshot;
  cacheTimestamp = now;
  return snapshot;
}

module.exports = {
  buildProductsWireSnapshot,
  LANE_LABELS,
  catalogMatchesLane
};
