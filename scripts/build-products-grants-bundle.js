#!/usr/bin/env node
/**
 * Merges fresh products-with-grants.json with collection agency fields into
 * products-with-grants-and-collection.json (preferred runtime overlay).
 *
 * Run after: node product-grants-integrator.js
 * Usage: npm run build:products-grants-bundle
 */

const fs = require('fs');
const path = require('path');
const {
  addCollectionAgenciesToProduct,
  getCollectionAgenciesStats,
  getAvailableCollectionRegions
} = require('../collection-agencies-system');

const ROOT = path.join(__dirname, '..');
const GRANTS_PATH = path.join(ROOT, 'products-with-grants.json');
const BUNDLE_PATH = path.join(ROOT, 'products-with-grants-and-collection.json');
const COLLECTION_PATH = path.join(ROOT, 'products-with-collection.json');
const MIRROR_PATH = path.join(ROOT, 'energy-calculator', 'products-with-grants-and-collection.json');

const COLLECTION_KEYS = [
  'collectionAgencies',
  'collectionIncentiveTotal',
  'collectionCurrency',
  'collectionRegion',
  'collectionAgenciesCount'
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pickCollectionFields(product) {
  const out = {};
  for (const key of COLLECTION_KEYS) {
    if (product[key] !== undefined) out[key] = product[key];
  }
  return out;
}

function buildCollectionMap(sources) {
  const map = new Map();
  for (const source of sources) {
    const rows = source.data?.products;
    if (!Array.isArray(rows)) continue;
    for (const product of rows) {
      if (!product?.id || !product.collectionAgencies?.length) continue;
      if (!map.has(product.id)) map.set(product.id, pickCollectionFields(product));
    }
  }
  return map;
}

function mergeCollection(product, collectionMap, mergeStats) {
  const existing = collectionMap.get(product.id);
  if (existing?.collectionAgencies?.length) {
    mergeStats.preservedFromSource += 1;
    return { ...product, ...existing };
  }

  const region = existing?.collectionRegion || 'uk.england';
  const enriched = addCollectionAgenciesToProduct(product, region);
  if (enriched.collectionAgencies?.length) mergeStats.computedFresh += 1;
  else mergeStats.noCollection += 1;
  return enriched;
}

function countCollectionCoverage(products) {
  let withCollection = 0;
  let withoutCollection = 0;
  for (const product of products) {
    if (product.collectionAgencies?.length) withCollection += 1;
    else withoutCollection += 1;
  }
  return { withCollection, withoutCollection };
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function main() {
  if (!fs.existsSync(GRANTS_PATH)) {
    console.error('Missing', GRANTS_PATH);
    console.error('Run: node product-grants-integrator.js');
    process.exit(1);
  }

  const grants = readJson(GRANTS_PATH);
  if (!Array.isArray(grants.products)) {
    console.error('Invalid grants export — expected products array');
    process.exit(1);
  }

  const sources = [];
  if (fs.existsSync(BUNDLE_PATH)) {
    sources.push({ label: 'existing bundle', data: readJson(BUNDLE_PATH) });
  }
  if (fs.existsSync(COLLECTION_PATH)) {
    sources.push({ label: 'products-with-collection.json', data: readJson(COLLECTION_PATH) });
  }

  const collectionMap = buildCollectionMap(sources);
  const mergeStats = { preservedFromSource: 0, computedFresh: 0, noCollection: 0 };
  const products = grants.products.map((product) => mergeCollection(product, collectionMap, mergeStats));
  const coverage = countCollectionCoverage(products);
  const now = new Date().toISOString();

  const payload = {
    metadata: {
      ...grants.metadata,
      exportDate: now,
      lastUpdated: now,
      totalProducts: products.length,
      grantsSystem: grants.metadata?.grantsSystem || 'Combined Grants System',
      collectionAgenciesSystem: 'Collection Agencies & Recycling Incentives',
      collectionSources: sources.map((s) => s.label),
      mergedFrom: path.basename(GRANTS_PATH),
      grantsSourceExportDate: grants.metadata?.exportDate || null,
      version: '2.1.0'
    },
    grantsStats: grants.grantsStats,
    collectionStats: getCollectionAgenciesStats(),
    availableRegions: grants.availableRegions || getAvailableCollectionRegions(),
    products
  };

  writeJson(BUNDLE_PATH, payload);
  writeJson(MIRROR_PATH, payload);

  console.log('Built products-with-grants-and-collection.json');
  console.log('Products:', products.length);
  console.log('Grants source export:', grants.metadata?.exportDate || 'unknown');
  console.log('Collection preserved from prior export:', mergeStats.preservedFromSource);
  console.log('Collection computed fresh:', mergeStats.computedFresh);
  console.log('Products without collection agencies:', mergeStats.noCollection);
  console.log('Products with collection agencies:', coverage.withCollection);
  console.log('Mirror:', path.relative(ROOT, MIRROR_PATH));
}

main();
