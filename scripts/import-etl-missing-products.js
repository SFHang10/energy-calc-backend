#!/usr/bin/env node
/**
 * Import ETL API products missing from FULL-DATABASE (motors excluded by default).
 * Follows Skills/product-addition-workflow.md:
 *   validate → add to FULL-DATABASE + SQLite → product-grants-integrator → grants bundle
 *
 * Usage:
 *   node scripts/import-etl-missing-products.js              # dry-run report
 *   node scripts/import-etl-missing-products.js --apply      # write + enrich grants
 *   node scripts/import-etl-missing-products.js --apply --include-motors
 *
 * Env: ETL_API_KEY
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const { addCombinedGrantsToProduct } = require('../combined-grants-loader');

const ROOT = path.join(__dirname, '..');
const FULL_DB_PATH = path.join(ROOT, 'FULL-DATABASE-5554.json');
const SQLITE_PATH = path.join(ROOT, 'database', 'energy_calculator_central.db');
const REPORT_PATH = path.join(ROOT, 'data', 'etl-missing-import-report.json');

const ETL_API_KEY = process.env.ETL_API_KEY || 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';
const HEADERS = { 'x-api-key': ETL_API_KEY, 'Content-Type': 'application/json' };

const SKIP_TECH_IDS = new Set([11]); // Motors — deferred per product roadmap
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const INCLUDE_MOTORS = args.includes('--include-motors');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugManufacturer(name) {
  return String(name || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function extractPowerFromFeatures(features) {
  if (!features || !Array.isArray(features)) return 'Unknown';
  const powerFeature = features.find(
    (f) =>
      f.name &&
      (/power|consumption|watt|kw/i.test(f.name))
  );
  if (powerFeature?.numericValue != null) return String(powerFeature.numericValue);
  if (powerFeature?.value) {
    const n = parseFloat(powerFeature.value);
    return Number.isNaN(n) ? 'Unknown' : String(n);
  }
  return 'Unknown';
}

function extractEnergyRatingFromFeatures(features) {
  if (!features || !Array.isArray(features)) return 'Unknown';
  const ratingFeature = features.find(
    (f) => f.name && /rating|efficiency|energy/i.test(f.name)
  );
  return ratingFeature?.value || 'Unknown';
}

function extractApiImageUrl(apiProduct) {
  if (!apiProduct?.images?.length) return null;
  const img = apiProduct.images[0];
  return img.url || img.src || null;
}

function buildAffiliateInfo(brand, name) {
  const manufacturer = slugManufacturer(brand);
  const affiliateId = `ETL_${String(brand || 'ETL').toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_001`;
  const baseUrl = `https://www.${String(brand || 'etl').toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`;
  return JSON.stringify({
    manufacturer,
    affiliateId,
    baseUrl,
    affiliateLink: `${baseUrl}/products?affiliate=${affiliateId}&source=greenways_market&product=${encodeURIComponent(name || '')}`,
  });
}

function buildFullDatabaseRow(apiProduct, techName) {
  const techId = apiProduct.technologyId;
  const id = `etl_${techId}_${apiProduct.id}`;
  const brand = apiProduct.manufacturer?.name || 'ETL Certified';
  const name = apiProduct.name || 'ETL Certified Product';
  const power = extractPowerFromFeatures(apiProduct.features);
  const energyRating = extractEnergyRatingFromFeatures(apiProduct.features);
  const imageUrl = extractApiImageUrl(apiProduct) || 'Product Placement/Motor.jpg';
  const imageSource = /img\.etl\.energysecurity\.gov\.uk/i.test(imageUrl) ? 'etl-api' : 'placeholder-auto';
  const now = new Date().toISOString();
  const techLabel = techName || `Technology ${techId}`;

  const descriptionShort = `${brand} ${name} - High efficiency`;
  const descriptionFull = `${brand} ${name}. ETL ${techLabel}. Power: ${power}kW, Energy Rating: ${energyRating}, Annual Running Cost: €0`;

  return {
    id,
    name,
    brand,
    category: 'ETL Technology',
    subcategory: brand,
    power,
    energyRating,
    efficiency: 'High',
    runningCostPerYear: 0,
    modelNumber: apiProduct.modelNumber || null,
    imageUrl,
    sku: String(apiProduct.id),
    price: 0,
    powerDisplay: `${power}kW`,
    images: imageUrl ? JSON.stringify([imageUrl]) : '[]',
    videos: '[]',
    descriptionShort,
    descriptionFull,
    additionalInfo: JSON.stringify([
      `Power: ${power}kW`,
      `Energy Rating: ${energyRating}`,
      `Efficiency: High`,
      'Annual Running Cost: €0',
      'Source: ETL',
      `ETL Technology: ${techLabel}`,
    ]),
    specifications: JSON.stringify({
      'Power Rating': `${power}kW`,
      'Energy Rating': energyRating,
      Efficiency: 'High',
      'Running Cost (Annual)': '€0',
      Source: 'ETL',
      'ETL Technology': techLabel,
    }),
    marketingInfo: JSON.stringify({
      'Product Benefits': 'High efficiency High design',
      'Energy Savings': 'Optimized for energy efficiency',
      'ROI Information': 'Payback period varies by usage',
      Support: 'Technical support available',
    }),
    calculatorData: JSON.stringify({
      icon: '⚡',
      type: 'etl',
      category: 'commercial',
      powerConsumption: power,
      energyEfficiency: energyRating,
      annualRunningCost: 0,
      installationComplexity: 'professional',
      maintenanceFrequency: 'annual',
      etlTechnology: techLabel,
    }),
    productPageUrl: `product-page-v2-marketplace-test.html?product=${id}`,
    affiliateInfo: buildAffiliateInfo(brand, name),
    createdAt: now,
    updatedAt: now,
    extractedFrom: 'etl_api_import',
    extractionDate: now,
    grants: '[]',
    grants_total: 0,
    grants_currency: 'EUR',
    grants_region: 'uk.england',
    grants_count: 0,
    collectionAgencies: [],
    collectionIncentiveTotal: 0,
    collectionCurrency: 'GBP',
    collectionRegion: 'uk.england',
    collectionAgenciesCount: 0,
    imageSource,
    etlTechnologyId: techId,
    etlTechnologyName: techLabel,
  };
}

function buildSqliteRow(fullRow) {
  return {
    id: fullRow.id,
    name: fullRow.name,
    brand: fullRow.brand,
    category: fullRow.category,
    subcategory: fullRow.subcategory,
    sku: fullRow.sku,
    modelNumber: fullRow.modelNumber,
    price: fullRow.price,
    power: fullRow.power === 'Unknown' ? 0 : parseFloat(fullRow.power) || 0,
    powerDisplay: fullRow.powerDisplay,
    energyRating: fullRow.energyRating,
    efficiency: fullRow.efficiency,
    runningCostPerYear: fullRow.runningCostPerYear,
    imageUrl: fullRow.imageUrl,
    images: fullRow.images,
    videos: fullRow.videos,
    descriptionShort: fullRow.descriptionShort,
    descriptionFull: fullRow.descriptionFull,
    additionalInfo: fullRow.additionalInfo,
    specifications: fullRow.specifications,
    marketingInfo: fullRow.marketingInfo,
    calculatorData: fullRow.calculatorData,
    productPageUrl: fullRow.productPageUrl,
    affiliateInfo: fullRow.affiliateInfo,
    createdAt: fullRow.createdAt,
    updatedAt: fullRow.updatedAt,
    extractedFrom: fullRow.extractedFrom,
    extractionDate: fullRow.extractionDate,
  };
}

async function fetchTechnologies() {
  const res = await axios.get(`${ETL_BASE_URL}/technologies`, { headers: HEADERS, timeout: 30000 });
  const map = new Map();
  for (const t of res.data.technologies || []) {
    map.set(t.id, t.name || `Technology ${t.id}`);
  }
  return map;
}

async function fetchMissingFromApi(localIds, techNames) {
  const apiByKey = new Map();
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await axios.get(`${ETL_BASE_URL}/products`, {
      headers: HEADERS,
      params: { page, size: 200, listingStatus: 'current' },
      timeout: 60000,
    });
    totalPages = res.data.page?.totalPages ?? 1;

    for (const p of res.data.products || []) {
      const key = `etl_${p.technologyId}_${p.id}`;
      if (!apiByKey.has(key)) apiByKey.set(key, p);
    }
    page++;
    await sleep(40);
  }

  const missing = [];
  const byTech = new Map();
  for (const [key, p] of apiByKey) {
    if (localIds.has(key)) continue;
    if (!INCLUDE_MOTORS && SKIP_TECH_IDS.has(p.technologyId)) continue;
    const techName = techNames.get(p.technologyId) || `Technology ${p.technologyId}`;
    missing.push({ apiProduct: p, techName, key });
    const tid = String(p.technologyId);
    byTech.set(tid, (byTech.get(tid) || 0) + 1);
  }

  return { missing, byTech };
}

function loadLocalIds() {
  const db = JSON.parse(fs.readFileSync(FULL_DB_PATH, 'utf8'));
  const products = db.products || [];
  return { db, ids: new Set(products.map((p) => String(p.id))), products };
}

function previewGrants(rows) {
  const byTech = new Map();
  let withGrants = 0;
  const samples = [];

  for (const row of rows) {
    const enriched = addCombinedGrantsToProduct(
      {
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        subcategory: row.subcategory,
        descriptionFull: row.descriptionFull,
      },
      'uk.england'
    );
    const tid = String(row.etlTechnologyId);
    const bucket = byTech.get(tid) || { name: row.etlTechnologyName, total: 0, withGrants: 0 };
    bucket.total += 1;
    if (enriched.grantsCount > 0) {
      withGrants += 1;
      bucket.withGrants += 1;
      if (samples.length < 8) {
        samples.push({
          id: row.id,
          name: row.name,
          grantsCount: enriched.grantsCount,
          grantsTotal: enriched.grantsTotal,
        });
      }
    }
    byTech.set(tid, bucket);
  }

  return { withGrants, withoutGrants: rows.length - withGrants, byTech, samples };
}

function insertSqliteRows(rows) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(SQLITE_PATH);
    const sql = `
      INSERT OR IGNORE INTO products (
        id, name, brand, category, subcategory, sku, modelNumber,
        price, power, powerDisplay, energyRating, efficiency, runningCostPerYear,
        imageUrl, images, videos, descriptionShort, descriptionFull,
        additionalInfo, specifications, marketingInfo, calculatorData,
        productPageUrl, affiliateInfo, createdAt, updatedAt,
        extractedFrom, extractionDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    let inserted = 0;
    let skipped = 0;

    db.serialize(() => {
      const stmt = db.prepare(sql);
      for (const r of rows) {
        const s = buildSqliteRow(r);
        stmt.run(
          [
            s.id, s.name, s.brand, s.category, s.subcategory, s.sku, s.modelNumber,
            s.price, s.power, s.powerDisplay, s.energyRating, s.efficiency, s.runningCostPerYear,
            s.imageUrl, s.images, s.videos, s.descriptionShort, s.descriptionFull,
            s.additionalInfo, s.specifications, s.marketingInfo, s.calculatorData,
            s.productPageUrl, s.affiliateInfo, s.createdAt, s.updatedAt,
            s.extractedFrom, s.extractionDate,
          ],
          function onRun(err) {
            if (err) console.warn(`SQLite skip ${s.id}: ${err.message}`);
            else if (this.changes) inserted += 1;
            else skipped += 1;
          }
        );
      }
      stmt.finalize((err) => {
        db.close();
        if (err) reject(err);
        else resolve({ inserted, skipped });
      });
    });
  });
}

function runEnrichmentPipeline() {
  console.log('\n▶ node product-grants-integrator.js');
  execSync('node product-grants-integrator.js', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n▶ npm run build:products-grants-bundle');
  execSync('npm run build:products-grants-bundle', { cwd: ROOT, stdio: 'inherit' });
}

async function main() {
  console.log('ETL missing product import (motors excluded:', !INCLUDE_MOTORS, ')');
  console.log('Mode:', APPLY ? 'APPLY' : 'DRY-RUN');
  console.log('Playbook: Skills/product-addition-workflow.md\n');

  if (!fs.existsSync(FULL_DB_PATH)) {
    throw new Error(`Missing ${FULL_DB_PATH}`);
  }

  const techNames = await fetchTechnologies();
  const local = loadLocalIds();
  const { missing: missingRaw, byTech } = await fetchMissingFromApi(local.ids, techNames);

  const rows = missingRaw.map(({ apiProduct, techName }) => buildFullDatabaseRow(apiProduct, techName));
  const grantsPreview = previewGrants(rows);

  console.log(`Local etl_* products: ${[...local.ids].filter((id) => id.startsWith('etl_')).length}`);
  console.log(`Missing from ETL API (excl. motors): ${rows.length}\n`);

  console.log('By ETL technology:');
  const techRows = [...byTech.entries()]
    .map(([tid, count]) => ({
      tid,
      name: techNames.get(Number(tid)) || techNames.get(tid),
      count,
    }))
    .sort((a, b) => b.count - a.count);
  for (const r of techRows) {
    const g = grantsPreview.byTech.get(r.tid);
    const grantNote = g ? ` · ${g.withGrants}/${g.total} with grants` : '';
    console.log(`  ${String(r.tid).padStart(2)} ${r.name}: ${r.count}${grantNote}`);
  }

  console.log(`\nGrants preview (uk.england): ${grantsPreview.withGrants} with grants, ${grantsPreview.withoutGrants} without`);
  if (grantsPreview.samples.length) {
    console.log('Samples with grants:');
    grantsPreview.samples.forEach((s) => {
      console.log(`  ${s.id} · ${s.grantsCount} grants · €${s.grantsTotal} · ${s.name.slice(0, 50)}`);
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    skipTechnologyIds: [...SKIP_TECH_IDS],
    includeMotors: INCLUDE_MOTORS,
    missingCount: rows.length,
    grantsWith: grantsPreview.withGrants,
    grantsWithout: grantsPreview.withoutGrants,
    byTechnology: techRows,
    productIds: rows.map((r) => r.id),
  };
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${REPORT_PATH}`);

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to import + run grants integrator + bundle.');
    return;
  }

  const backupPath = path.join(
    ROOT,
    `FULL-DATABASE-5554-BACKUP-before-etl-import-${Date.now()}.json`
  );
  fs.copyFileSync(FULL_DB_PATH, backupPath);
  console.log(`\nBackup: ${backupPath}`);

  const existingIds = new Set(local.products.map((p) => p.id));
  const toAdd = rows.filter((r) => !existingIds.has(r.id));
  local.db.products.push(...toAdd);
  local.db.metadata = {
    ...(local.db.metadata || {}),
    totalProducts: local.db.products.length,
    extractionDate: new Date().toISOString(),
    lastEtlImportAt: new Date().toISOString(),
    lastEtlImportCount: toAdd.length,
    lastEtlImportNote: 'import-etl-missing-products.js (motors excluded unless --include-motors)',
  };
  fs.writeFileSync(FULL_DB_PATH, JSON.stringify(local.db, null, 2));
  console.log(`✅ FULL-DATABASE: added ${toAdd.length} products (total ${local.db.products.length})`);

  if (!fs.existsSync(SQLITE_PATH)) {
    console.warn(`⚠️ SQLite not found at ${SQLITE_PATH} — grants integrator may fail until DB exists`);
  } else {
    const sqliteResult = await insertSqliteRows(toAdd);
    console.log(`✅ SQLite: inserted ${sqliteResult.inserted}, skipped ${sqliteResult.skipped}`);
  }

  runEnrichmentPipeline();
  console.log('\n✅ Import + grants enrichment complete.');
  console.log('Next: commit FULL-DATABASE, products-with-grants*.json, push to Render.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
