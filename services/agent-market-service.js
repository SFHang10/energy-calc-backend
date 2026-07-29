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

async function getLaneAlternatives(laneId) {
  const lane = String(laneId || 'kitchen').toLowerCase();
  if (!LANE_IDS.includes(lane)) {
    return { ok: false, error: 'Unknown lane', lane, marketplaceMatches: [], externalAlternatives: [] };
  }

  const showcase = await loadShowcase();
  const laneCfg = (showcase.lanes && showcase.lanes[lane]) || {};
  const compareQuery = laneCfg.compareQuery || null;
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

  return {
    ok: true,
    lane,
    label: laneCfg.label || lane,
    compareQuery,
    marketplaceMatches: Array.isArray(payload.marketplaceMatches) ? payload.marketplaceMatches : [],
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
  SHOWCASE_PATH
};
