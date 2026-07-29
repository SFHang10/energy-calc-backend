/**
 * Agent Market — curated lane samples from products-with-grants* overlay.
 */
const path = require('path');
const fs = require('fs').promises;
const {
  loadProductsWithGrants,
  toProductSample,
  isUsableBannerImageUrl
} = require('./greenways-agent-shared');
const { EquipmentIntelligenceService } = require('./equipment-intelligence-service');

const SHOWCASE_PATH = path.join(__dirname, '..', 'data', 'agent-market-showcase.json');

const LANE_IDS = ['kitchen', 'hvac', 'water', 'premises'];

const BASELINE_BY_TYPE = {
  dishwasher: { actualDailyKwh: 14, actualDailyWaterLitres: 220, actualDailyGasKwh: 0 },
  refrigerator: { actualDailyKwh: 22, actualDailyWaterLitres: 45, actualDailyGasKwh: 0 },
  oven: { actualDailyKwh: 32, actualDailyWaterLitres: 25, actualDailyGasKwh: 0 },
  fryer: { actualDailyKwh: 3, actualDailyWaterLitres: 8, actualDailyGasKwh: 22 },
  other: { actualDailyKwh: 10, actualDailyWaterLitres: 30, actualDailyGasKwh: 0 }
};

let showcaseCache = null;
let equipmentIntelligence = null;

function getEquipmentIntelligence() {
  if (!equipmentIntelligence) {
    equipmentIntelligence = new EquipmentIntelligenceService();
  }
  return equipmentIntelligence;
}

async function loadShowcase() {
  if (showcaseCache) return showcaseCache;
  try {
    const raw = await fs.readFile(SHOWCASE_PATH, 'utf8');
    showcaseCache = JSON.parse(raw);
  } catch (_) {
    showcaseCache = { lanes: {} };
  }
  return showcaseCache;
}

function inferEquipmentType(text) {
  const t = String(text || '').toLowerCase();
  if (t.includes('dish')) return 'dishwasher';
  if (t.includes('fridge') || t.includes('freezer') || t.includes('refriger') || t.includes('cooler')) {
    return 'refrigerator';
  }
  if (t.includes('oven') || t.includes('combi') || t.includes('steamer')) return 'oven';
  if (t.includes('fryer') || t.includes('wok')) return 'fryer';
  if (t.includes('heat pump') || t.includes('hvac') || t.includes('ventil')) return 'other';
  if (t.includes('water') || t.includes('dishwash')) return 'dishwasher';
  return 'other';
}

function mergeCompareQuery(laneFallback, overrides = {}) {
  const type =
    String(overrides.type || '').trim() ||
    inferEquipmentType(
      [overrides.name, overrides.brand, overrides.model, overrides.subcategory, overrides.category]
        .filter(Boolean)
        .join(' ')
    );
  const baseline = BASELINE_BY_TYPE[type] || BASELINE_BY_TYPE.other;
  const laneBase = laneFallback && typeof laneFallback === 'object' ? laneFallback : {};

  return {
    name: String(overrides.name || laneBase.name || '').trim(),
    brand: String(overrides.brand || laneBase.brand || '').trim(),
    model: String(overrides.model || laneBase.model || '').trim(),
    type,
    actualDailyKwh: overrides.actualDailyKwh ?? laneBase.actualDailyKwh ?? baseline.actualDailyKwh,
    actualDailyWaterLitres:
      overrides.actualDailyWaterLitres ??
      laneBase.actualDailyWaterLitres ??
      baseline.actualDailyWaterLitres,
    actualDailyGasKwh:
      overrides.actualDailyGasKwh ?? laneBase.actualDailyGasKwh ?? baseline.actualDailyGasKwh,
    electricityRateEurPerKwh: laneBase.electricityRateEurPerKwh || '0.30',
    gasRateEurPerKwh: laneBase.gasRateEurPerKwh || '0.11',
    waterRateEurPerLitre: laneBase.waterRateEurPerLitre || '0.0025',
    country: laneBase.country || 'NL',
    productId: overrides.productId || null
  };
}

function buildCompareQueryForProduct(product, laneFallback) {
  return mergeCompareQuery(laneFallback, {
    productId: product.id,
    name: product.name || product.id,
    brand: product.brand || '',
    model: product.modelNumber || product.model || '',
    subcategory: product.subcategory || '',
    category: product.category || ''
  });
}

function featureBullets(product, sample) {
  const bullets = [];
  const sub = String(product.subcategory || product.category || '').trim();
  if (sub) bullets.push(sub);
  if (sample.grantsCount > 0) {
    bullets.push(
      sample.grantsCount === 1
        ? '1 scheme match on file'
        : `${sample.grantsCount} scheme matches on file`
    );
  } else {
    bullets.push('Check marketplace detail for regional schemes');
  }
  if (sample.topGrants && sample.topGrants[0]) {
    bullets.push(sample.topGrants[0]);
  }
  return bullets.slice(0, 3);
}

async function getLaneSamples(laneId, limit = 6) {
  const lane = String(laneId || 'kitchen').toLowerCase();
  if (!LANE_IDS.includes(lane)) {
    return { ok: false, error: 'Unknown lane', lane, productSamples: [] };
  }

  const showcase = await loadShowcase();
  const laneCfg = (showcase.lanes && showcase.lanes[lane]) || {};
  const rows = Array.isArray(laneCfg.products) ? laneCfg.products : [];
  const { products } = await loadProductsWithGrants();
  const byId = new Map(products.map((p) => [String(p.id), p]));

  const productSamples = [];
  const seen = new Set();
  for (const row of rows) {
    if (productSamples.length >= limit) break;
    const id = String(row.id || '').trim();
    if (!id || seen.has(id)) continue;
    const product = byId.get(id);
    if (!product) continue;
    seen.add(id);
    const sample = toProductSample(product, row.label || '');
    if (!isUsableBannerImageUrl(sample.imageUrl)) {
      sample.imageUrl = '';
    }
    sample.lane = lane;
    sample.brand = product.brand || '';
    sample.model = product.modelNumber || product.model || '';
    sample.category = product.category || '';
    sample.compareQuery = buildCompareQueryForProduct(product, laneCfg.compareQuery);
    sample.features = featureBullets(product, sample);
    sample.projectionHref =
      '/HTMLS%20GWM%20GWB/equipment-savings-projection.html?popup=1&embed=1&product=' +
      encodeURIComponent(id);
    productSamples.push(sample);
  }

  return {
    ok: true,
    lane,
    label: laneCfg.label || lane,
    blurb: laneCfg.blurb || '',
    productSamples
  };
}

async function getLaneAlternatives(laneId, options = {}) {
  const lane = String(laneId || 'kitchen').toLowerCase();
  if (!LANE_IDS.includes(lane)) {
    return { ok: false, error: 'Unknown lane', lane, marketplaceMatches: [], externalAlternatives: [] };
  }

  const showcase = await loadShowcase();
  const laneCfg = (showcase.lanes && showcase.lanes[lane]) || {};
  const laneFallback = laneCfg.compareQuery || null;

  let compareQuery = null;
  const productId = String(options.productId || '').trim();

  if (productId) {
    const { products } = await loadProductsWithGrants();
    const product = products.find((p) => String(p.id) === productId);
    if (!product) {
      return {
        ok: false,
        error: 'Unknown product id',
        lane,
        marketplaceMatches: [],
        externalAlternatives: []
      };
    }
    compareQuery = buildCompareQueryForProduct(product, laneFallback);
  } else if (options.name || options.type) {
    compareQuery = mergeCompareQuery(laneFallback, {
      name: options.name,
      brand: options.brand,
      model: options.model,
      type: options.type,
      productId: options.productId || null
    });
  } else if (laneFallback && (laneFallback.name || laneFallback.type)) {
    compareQuery = mergeCompareQuery(laneFallback, {});
  }

  if (!compareQuery || (!compareQuery.name && !compareQuery.type)) {
    return {
      ok: false,
      error: 'No compare query configured for lane',
      lane,
      marketplaceMatches: [],
      externalAlternatives: []
    };
  }

  const payload = getEquipmentIntelligence().getAlternatives({
    name: compareQuery.name || '',
    brand: compareQuery.brand || '',
    model: compareQuery.model || '',
    type: compareQuery.type || '',
    actualDailyKwh: compareQuery.actualDailyKwh,
    actualDailyWaterLitres: compareQuery.actualDailyWaterLitres,
    actualDailyGasKwh: compareQuery.actualDailyGasKwh,
    electricityRateEurPerKwh: compareQuery.electricityRateEurPerKwh || '0.30',
    gasRateEurPerKwh: compareQuery.gasRateEurPerKwh || '0.11',
    waterRateEurPerLitre: compareQuery.waterRateEurPerLitre || '0.0025',
    persistCatalog: '1',
    finderSource: 'agent-market',
    country: compareQuery.country || 'NL'
  });

  if (!payload.success) {
    return {
      ok: false,
      error: payload.message || 'Failed to load alternatives',
      lane,
      marketplaceMatches: [],
      externalAlternatives: []
    };
  }

  let marketplaceMatches = Array.isArray(payload.marketplaceMatches) ? payload.marketplaceMatches : [];
  if (productId) {
    const pinned = marketplaceMatches.find((row) => String(row.id) === productId);
    if (pinned) {
      marketplaceMatches = [
        pinned,
        ...marketplaceMatches.filter((row) => String(row.id) !== productId)
      ];
    }
  }

  return {
    ok: true,
    lane,
    label: laneCfg.label || lane,
    compareQuery,
    compareSource: productId ? 'product' : 'lane',
    productId: productId || null,
    marketplaceMatches,
    externalAlternatives: Array.isArray(payload.externalAlternatives) ? payload.externalAlternatives : [],
    assumptions: Array.isArray(payload.assumptions) ? payload.assumptions : [],
    catalogPersisted: payload.catalogPersisted || null
  };
}

async function getAllLaneMeta() {
  const showcase = await loadShowcase();
  return LANE_IDS.map((id) => {
    const cfg = (showcase.lanes && showcase.lanes[id]) || {};
    return {
      id,
      label: cfg.label || id,
      blurb: cfg.blurb || '',
      count: Array.isArray(cfg.products) ? cfg.products.length : 0
    };
  });
}

module.exports = {
  LANE_IDS,
  getLaneSamples,
  getLaneAlternatives,
  getAllLaneMeta,
  SHOWCASE_PATH,
  inferEquipmentType,
  buildCompareQueryForProduct
};
