/**
 * Non-Greenways Marketplace sustainable products catalog.
 * File: data/sustainable-products-catalog.json
 * Grants: run scripts/enrich-sustainable-products-grants.js (uses combined-grants-loader + schemes.json)
 */
const fs = require('fs');
const path = require('path');
const { addCombinedGrantsToProduct } = require('../combined-grants-loader');

const CATALOG_PATH = path.join(__dirname, '..', 'data', 'sustainable-products-catalog.json');
const DEFAULT_REGION = 'nl';

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((v) => String(v).trim()).filter(Boolean)));
}

function mergeSearch(existing = {}, incoming = {}) {
  return {
    keywords: uniqueStrings([...(existing.keywords || []), ...(incoming.keywords || [])]),
    equipmentTypes: uniqueStrings([...(existing.equipmentTypes || []), ...(incoming.equipmentTypes || [])]),
    profiles: uniqueStrings([...(existing.profiles || []), ...(incoming.profiles || [])])
  };
}

function normalizeNameKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function namesAreClose(a, b) {
  const left = normalizeNameKey(a);
  const right = normalizeNameKey(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function readCatalogFile() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeCatalogFile(catalog) {
  catalog.updatedAt = new Date().toISOString();
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
}

/**
 * Map catalog row to equipment-intelligence external alternative shape.
 */
function toExternalAlternativeRow(product) {
  const profile = product.utilityProfile || {};
  return {
    id: product.id,
    source: product.source || 'sustainable_products_catalog',
    catalogLayer: product.catalogLayer || 'non_marketplace',
    marketplaceStatus: product.marketplaceStatus || 'external',
    promotedToProductId: product.promotedToProductId || null,
    name: product.name,
    brand: product.brand || '',
    model: product.model || '',
    type: product.type || 'other',
    category: product.category || null,
    subcategory: product.subcategory || null,
    summary: product.summary || '',
    imageUrl: product.imageUrl || null,
    utilityProfile: {
      dailyKwh: Number(profile.dailyKwh) || 0,
      dailyWaterLitres: Number(profile.dailyWaterLitres) || 0,
      dailyGasKwh: Number(profile.dailyGasKwh) || 0
    },
    impactFactors: product.impactFactors || null,
    specs: product.specs || {},
    sustainability: product.sustainability || {},
    search: product.search || {},
    enrichment: product.enrichment || {},
    grants: Array.isArray(product.grants) ? product.grants : []
  };
}

/**
 * Attach scheme-backed grants (same pipeline as marketplace products).
 */
function attachGrantsToCatalogProduct(product, region = DEFAULT_REGION) {
  const grantShape = {
    id: product.id,
    name: product.name,
    category: product.category || product.type || 'Other',
    subcategory: product.subcategory || product.type || 'Other',
    brand: product.brand,
    model: product.model
  };
  const enriched = addCombinedGrantsToProduct(grantShape, region);
  return {
    ...product,
    grants: enriched.grants || [],
    grantsTotal: enriched.grantsTotal || 0,
    grantsCount: enriched.grantsCount || 0,
    grantsRegion: enriched.grantsRegion || region,
    enrichment: {
      ...(product.enrichment || {}),
      grantsStatus: (enriched.grants || []).length ? 'matched' : 'none',
      grantsCheckedAt: new Date().toISOString().slice(0, 10)
    }
  };
}

function loadCatalog(options = {}) {
  const { attachGrants = false, region = DEFAULT_REGION, status = 'external' } = options;
  let catalog;
  try {
    catalog = readCatalogFile();
  } catch (error) {
    console.error('⚠️ sustainable-products-catalog: failed to load', error.message);
    return [];
  }
  let products = Array.isArray(catalog.products) ? catalog.products : [];
  if (status) {
    products = products.filter((p) => (p.marketplaceStatus || 'external') === status);
  }
  if (attachGrants) {
    products = products.map((p) => attachGrantsToCatalogProduct(p, region));
  }
  return products.map(toExternalAlternativeRow);
}

function getProductById(id) {
  const catalog = readCatalogFile();
  const product = (catalog.products || []).find((p) => p.id === id);
  return product ? toExternalAlternativeRow(product) : null;
}

function listCatalogMeta() {
  const catalog = readCatalogFile();
  return {
    schemaVersion: catalog.schemaVersion,
    updatedAt: catalog.updatedAt,
    count: (catalog.products || []).length
  };
}

/**
 * Append or update a product from Sustainability Product Finder / intake flow.
 */
function upsertProduct(payload = {}) {
  const catalog = readCatalogFile();
  const products = Array.isArray(catalog.products) ? catalog.products : [];
  const name = String(payload.name || '').trim();
  if (!name) {
    return { success: false, message: 'Product name is required.' };
  }

  const id =
    String(payload.id || '').trim() ||
    `sust_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48)}_${Date.now()}`;

  const utilityProfile = payload.utilityProfile || {
    dailyKwh: Number(payload.dailyKwh) || 0,
    dailyWaterLitres: Number(payload.dailyWaterLitres) || 0,
    dailyGasKwh: Number(payload.dailyGasKwh) || 0
  };

  const row = {
    id,
    catalogLayer: 'non_marketplace',
    marketplaceStatus: payload.marketplaceStatus || 'external',
    promotedToProductId: payload.promotedToProductId || null,
    source: payload.source || 'sustainable_product_finder',
    name,
    brand: payload.brand || '',
    model: payload.model || '',
    type: payload.type || 'other',
    category: payload.category || payload.type || 'Other',
    subcategory: payload.subcategory || '',
    summary: payload.summary || '',
    imageUrl: payload.imageUrl || null,
    utilityProfile,
    impactFactors: payload.impactFactors || null,
    specs: payload.specs || {},
    sustainability: payload.sustainability || { benefits: [], certifications: [] },
    search: payload.search || { keywords: [], equipmentTypes: [], profiles: [] },
    enrichment: {
      statsStatus: payload.enrichment?.statsStatus || 'pending',
      statsSource: payload.enrichment?.statsSource || 'finder',
      grantsStatus: 'pending'
    },
    grants: []
  };

  let created = false;
  const idx = products.findIndex((p) => p.id === id);
  if (idx >= 0) {
    const prev = products[idx];
    const session = {
      query: payload.finderQuery || payload.lastFinderQuery || null,
      source: payload.source || prev.source,
      at: new Date().toISOString()
    };
    const sessions = Array.isArray(prev.finderSessions) ? prev.finderSessions.slice() : [];
    if (session.query) {
      sessions.unshift(session);
    }
    products[idx] = {
      ...prev,
      ...row,
      search: mergeSearch(prev.search, row.search),
      enrichment: { ...(prev.enrichment || {}), ...(payload.enrichment || {}), ...(row.enrichment || {}) },
      grants: prev.grants?.length && !payload.attachGrants ? prev.grants : row.grants,
      finderSessions: sessions.slice(0, 24),
      lastSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (payload.attachGrants) {
      products[idx] = attachGrantsToCatalogProduct(products[idx], payload.region || DEFAULT_REGION);
    }
  } else {
    created = true;
    const session = payload.finderQuery
      ? [{ query: payload.finderQuery, source: payload.source || 'sustainable_product_finder', at: new Date().toISOString() }]
      : [];
    let createdRow = { ...row, finderSessions: session, firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
    if (payload.attachGrants) {
      createdRow = attachGrantsToCatalogProduct(createdRow, payload.region || DEFAULT_REGION);
    }
    products.unshift(createdRow);
  }

  catalog.products = products;
  writeCatalogFile(catalog);
  const saved = products.find((p) => p.id === id) || products[0];
  return { success: true, created, product: toExternalAlternativeRow(saved) };
}

/**
 * Persist finder / alternatives results into the catalogue (dedupe by id or name).
 */
function persistFinderResults(session = {}) {
  const {
    finderQuery = '',
    finderSource = 'sustainable_product_finder',
    region = DEFAULT_REGION,
    attachGrants = true,
    externalAlternatives = [],
    createDiscoveryIfUnmatched = true
  } = session;

  const queryTokens = uniqueStrings(
    String(finderQuery || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((t) => t.length > 2)
  );

  const saved = [];
  let updated = 0;
  let created = 0;

  (externalAlternatives || []).forEach((item) => {
    const result = upsertProduct({
      id: item.id && String(item.id).startsWith('sust_') ? item.id : undefined,
      name: item.name,
      brand: item.brand,
      model: item.model,
      type: item.type,
      category: item.category,
      subcategory: item.subcategory,
      summary: item.summary,
      imageUrl: item.imageUrl,
      utilityProfile: item.utilityProfile,
      impactFactors: item.impactFactors,
      specs: item.specs,
      sustainability: item.sustainability,
      source: finderSource,
      finderQuery: finderQuery,
      attachGrants,
      region,
      search: {
        keywords: uniqueStrings([...(item.search?.keywords || []), ...queryTokens, item.type]),
        equipmentTypes: item.search?.equipmentTypes || [item.type].filter(Boolean),
        profiles: item.search?.profiles || []
      },
      enrichment: {
        ...(item.enrichment || {}),
        statsSource: item.enrichment?.statsSource || 'finder_session',
        lastFinderQuery: finderQuery
      }
    });
    if (result.success) {
      saved.push(result.product.id);
      if (result.created) created += 1;
      else updated += 1;
    }
  });

  const hasClose = (externalAlternatives || []).some((item) => namesAreClose(item.name, finderQuery));
  if (createDiscoveryIfUnmatched && finderQuery && !hasClose) {
    const discovery = upsertProduct({
      name: finderQuery,
      brand: session.brand || '',
      model: session.model || '',
      type: session.type || 'other',
      category: session.category || 'Discovery',
      subcategory: 'Finder query',
      summary: `Logged from ${finderSource} — stats pending review.`,
      utilityProfile: session.utilityProfile || {
        dailyKwh: Number(session.actualDailyKwh) || 0,
        dailyWaterLitres: Number(session.actualDailyWaterLitres) || 0,
        dailyGasKwh: Number(session.actualDailyGasKwh) || 0
      },
      source: finderSource,
      finderQuery,
      attachGrants,
      region,
      search: {
        keywords: queryTokens,
        equipmentTypes: [session.type].filter(Boolean),
        profiles: []
      },
      enrichment: {
        statsStatus: 'pending',
        statsSource: 'finder_discovery',
        lastFinderQuery: finderQuery
      }
    });
    if (discovery.success) {
      saved.push(discovery.product.id);
      created += 1;
    }
  }

  return {
    success: true,
    savedIds: uniqueStrings(saved),
    created,
    updated,
    total: saved.length
  };
}

function markPromotedToMarketplace(catalogId, marketplaceProductId) {
  const catalog = readCatalogFile();
  const products = catalog.products || [];
  const idx = products.findIndex((p) => p.id === catalogId);
  if (idx < 0) return { success: false, message: 'Catalog product not found.' };
  products[idx].marketplaceStatus = 'listed';
  products[idx].promotedToProductId = marketplaceProductId;
  products[idx].promotedAt = new Date().toISOString();
  catalog.products = products;
  writeCatalogFile(catalog);
  return { success: true, product: products[idx] };
}

module.exports = {
  CATALOG_PATH,
  DEFAULT_REGION,
  loadCatalog,
  getProductById,
  listCatalogMeta,
  upsertProduct,
  persistFinderResults,
  markPromotedToMarketplace,
  attachGrantsToCatalogProduct,
  toExternalAlternativeRow,
  readCatalogFile,
  writeCatalogFile
};
