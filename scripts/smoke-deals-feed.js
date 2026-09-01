#!/usr/bin/env node
/**
 * Smoke test — deals feed v2 structure and product id references.
 * Run: npm run smoke:deals-feed
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FEED_PATH = path.join(ROOT, 'data', 'deals-feed.json');
const SEEDS_PATH = path.join(ROOT, 'data', 'deals-feed-seeds.json');
const {
  LANES,
  TRUST_VALUES,
  countByLane
} = require(path.join(ROOT, 'services', 'deals-feed-utils'));

const REQUIRED_FIELDS = ['id', 'category', 'title', 'line', 'region', 'href', 'trust', 'sourceName', 'addedAt'];

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadProductIds() {
  const etl = new Set();
  const sust = new Set();

  const grantsPath = path.join(ROOT, 'products-with-grants.json');
  if (fs.existsSync(grantsPath)) {
    const data = loadJson(grantsPath);
    const products = data.products || data;
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p && p.id) etl.add(String(p.id));
      });
    }
  }

  const catalogPath = path.join(ROOT, 'data', 'sustainable-products-catalog.json');
  if (fs.existsSync(catalogPath)) {
    const data = loadJson(catalogPath);
    (data.products || []).forEach((p) => {
      if (p && p.id) sust.add(String(p.id));
    });
  }

  return { etl, sust };
}

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function main() {
  console.log('\nDeals feed v2 smoke\n');

  const feed = loadJson(FEED_PATH);
  const seeds = loadJson(SEEDS_PATH);
  const deals = Array.isArray(feed.deals) ? feed.deals : [];
  const seedDeals = Array.isArray(seeds.deals) ? seeds.deals : [];

  if (!deals.length) fail('deals-feed.json has no deals');
  ok(`Feed rows: ${deals.length}`);

  if (!feed.meta || !feed.meta.generatedAt) {
    fail('deals-feed.json meta.generatedAt is required');
  }
  ok(`Generated: ${String(feed.meta.generatedAt).slice(0, 10)}`);

  const laneCounts = countByLane(deals);
  for (const lane of LANES) {
    if (laneCounts[lane] < 3) {
      fail(`Lane "${lane}" has ${laneCounts[lane]} rows — expected at least 3`);
    }
    ok(`Lane ${lane}: ${laneCounts[lane]} rows`);
  }

  const ids = new Set();
  const { etl, sust } = loadProductIds();

  deals.forEach((deal, index) => {
    const label = deal.id || `index ${index}`;
    for (const field of REQUIRED_FIELDS) {
      if (deal[field] == null || String(deal[field]).trim() === '') {
        fail(`Deal "${label}" missing required field: ${field}`);
      }
    }
    if (!TRUST_VALUES.includes(deal.trust)) {
      fail(`Deal "${label}" has invalid trust: ${deal.trust}`);
    }
    if (!LANES.includes(String(deal.category).toLowerCase())) {
      fail(`Deal "${label}" has invalid category: ${deal.category}`);
    }
    if (ids.has(deal.id)) fail(`Duplicate deal id: ${deal.id}`);
    ids.add(deal.id);

    if (deal.productId) {
      const pid = String(deal.productId);
      if (pid.startsWith('etl_') && etl.size && !etl.has(pid)) {
        fail(`Deal "${label}" references unknown ETL productId: ${pid}`);
      }
      if (pid.startsWith('sust_') && sust.size && !sust.has(pid)) {
        fail(`Deal "${label}" references unknown catalog productId: ${pid}`);
      }
    }
  });
  ok(`All ${deals.length} rows have v2 required fields`);

  if (seedDeals.length < 9) {
    fail(`deals-feed-seeds.json has ${seedDeals.length} rows — expected at least 9 for thin slice`);
  }
  ok(`Seeds: ${seedDeals.length} curated rows`);

  const seedLaneCounts = countByLane(seedDeals);
  for (const lane of LANES) {
    if (seedLaneCounts[lane] < 3) {
      fail(`Seeds lane "${lane}" has ${seedLaneCounts[lane]} rows — expected at least 3`);
    }
  }
  ok('Seeds: 3+ rows per lane');

  if (!Array.isArray(feed.highlights) || feed.highlights.length < 3) {
    fail('deals-feed.json should have 3 highlight rows');
  }
  ok(`Highlights: ${feed.highlights.length}`);

  console.log('\n✓ Deals feed smoke passed.\n');
}

main();
