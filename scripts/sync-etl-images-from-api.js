/**
 * Sync ETL product images from the official API without clobbering good images.
 *
 * Rules (safe by design):
 * - SKIP if imageUrl already uses img.etl.energysecurity.gov.uk (incl. shared motor/HVAC art)
 * - SKIP if imageSource is manual (hvac-assigned, cfw*-edited, wix-manual, etl-api)
 * - SKIP if API has no image AND imageSource is placeholder-auto (keep Motor.jpg etc.)
 * - UPDATE only when API returns images[0].url and current URL is missing, via.placeholder, or local placeholder path
 *
 * Usage:
 *   node scripts/sync-etl-images-from-api.js              # dry-run report
 *   node scripts/sync-etl-images-from-api.js --apply      # write FULL-DATABASE + SQLite
 *   node scripts/sync-etl-images-from-api.js --apply --limit=50
 *   node scripts/sync-etl-images-from-api.js --technology=11 --apply
 *
 * Env: ETL_API_KEY (falls back to repo default used by other ETL scripts)
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const ROOT = path.join(__dirname, '..');
const FULL_DB_PATH = path.join(ROOT, 'FULL-DATABASE-5554.json');
const SQLITE_PATH = path.join(ROOT, 'database', 'energy_calculator_central.db');
const REPORT_PATH = path.join(ROOT, 'data', 'etl-image-sync-report.json');

const ETL_API_KEY = process.env.ETL_API_KEY || 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

const PROTECTED_SOURCES = /^etl-api$|^hvac-assigned$|^wix-manual$|^cfw/i;
const LOCAL_PLACEHOLDER_PATH =
  /product placement\/|product-placement\/|placeholder/i;
const ETL_CDN = /img\.etl\.energysecurity\.gov\.uk/i;
const VIA_PLACEHOLDER = /via\.placeholder/i;

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
const techArg = args.find((a) => a.startsWith('--technology='));
const TECH_FILTER = techArg ? techArg.split('=')[1] : null;

function parseEtlId(id) {
  const m = String(id).match(/^etl_(\d+)_(.+)$/);
  if (!m) return null;
  return { technologyId: m[1], productId: m[2] };
}

function extractApiImageUrl(apiProduct) {
  if (!apiProduct?.images?.length) return null;
  const img = apiProduct.images[0];
  return img.url || img.src || null;
}

function normalizeUrl(url) {
  return (url || '').trim();
}

function shouldSkip(product, apiUrl) {
  const current = normalizeUrl(product.imageUrl);
  const source = product.imageSource || '';

  if (PROTECTED_SOURCES.test(source)) {
    return { skip: true, reason: 'protected-imageSource' };
  }

  if (ETL_CDN.test(current)) {
    if (!apiUrl || apiUrl === current) {
      return { skip: true, reason: 'already-etl-cdn' };
    }
    // API differs from stored ETL CDN — still skip to avoid overwriting shared/correct CDN art
    return { skip: true, reason: 'already-etl-cdn-different-api' };
  }

  if (!apiUrl && source === 'placeholder-auto') {
    return { skip: true, reason: 'no-api-image-keep-category-placeholder' };
  }

  if (!apiUrl && current && !VIA_PLACEHOLDER.test(current) && !LOCAL_PLACEHOLDER_PATH.test(current)) {
    return { skip: true, reason: 'no-api-image-keep-current' };
  }

  return { skip: false };
}

function shouldUpdate(product, apiUrl) {
  if (!apiUrl) return false;
  const current = normalizeUrl(product.imageUrl);
  if (apiUrl === current) return false;
  if (VIA_PLACEHOLDER.test(current)) return true;
  if (!current) return true;
  if (LOCAL_PLACEHOLDER_PATH.test(current)) return true;
  if (product.imageSource === 'placeholder-auto') return true;
  return false;
}

async function fetchApiProduct(productId, attempt = 1) {
  try {
    const res = await axios.get(`${ETL_BASE_URL}/products/${productId}`, {
      headers: { 'x-api-key': ETL_API_KEY, 'Content-Type': 'application/json' },
      timeout: 20000,
    });
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 429 && attempt < 5) {
      const waitMs = 2000 * attempt;
      await sleep(waitMs);
      return fetchApiProduct(productId, attempt + 1);
    }
    throw err;
  }
}

/** Skip per-product API call when image cannot change. */
function canSkipApiLookup(product) {
  const current = normalizeUrl(product.imageUrl);
  const source = product.imageSource || '';
  if (PROTECTED_SOURCES.test(source)) {
    return 'protected-imageSource';
  }
  if (ETL_CDN.test(current)) {
    return 'already-etl-cdn';
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('\n🖼️  ETL image sync from API');
  console.log(`   Mode: ${APPLY ? 'APPLY (writes files)' : 'DRY RUN'}`);
  if (TECH_FILTER) console.log(`   Technology filter: ${TECH_FILTER}`);
  if (LIMIT) console.log(`   Limit: ${LIMIT}`);
  console.log('');

  const db = JSON.parse(fs.readFileSync(FULL_DB_PATH, 'utf8'));
  let products = (db.products || []).filter((p) => p.id && p.id.startsWith('etl_'));
  if (TECH_FILTER) {
    products = products.filter((p) => {
      const parsed = parseEtlId(p.id);
      return parsed && parsed.technologyId === String(TECH_FILTER);
    });
  }

  const stats = {
    scanned: 0,
    updated: 0,
    skipped: {},
    errors: 0,
    updates: [],
  };

  let processed = 0;
  for (const product of products) {
    if (LIMIT != null && processed >= LIMIT) break;

    const parsed = parseEtlId(product.id);
    if (!parsed) continue;

    stats.scanned++;
    processed++;

    const skipApi = canSkipApiLookup(product);
    if (skipApi) {
      stats.skipped[skipApi] = (stats.skipped[skipApi] || 0) + 1;
      continue;
    }

    let apiProduct;
    try {
      apiProduct = await fetchApiProduct(parsed.productId);
    } catch (err) {
      stats.errors++;
      if (stats.errors <= 8) {
        console.warn(`   ⚠️  API error ${product.id}: ${err.response?.status || err.message}`);
      }
      await sleep(400);
      continue;
    }

    const apiUrl = extractApiImageUrl(apiProduct);
    const skip = shouldSkip(product, apiUrl);
    if (skip.skip) {
      stats.skipped[skip.reason] = (stats.skipped[skip.reason] || 0) + 1;
      await sleep(200);
      continue;
    }

    if (!shouldUpdate(product, apiUrl)) {
      stats.skipped['no-change-needed'] = (stats.skipped['no-change-needed'] || 0) + 1;
      await sleep(200);
      continue;
    }

    stats.updated++;
    const entry = {
      id: product.id,
      name: product.name,
      from: product.imageUrl,
      to: apiUrl,
      previousImageSource: product.imageSource || null,
    };
    stats.updates.push(entry);

    if (APPLY) {
      product.imageUrl = apiUrl;
      product.imageSource = 'etl-api';
      if (!product.images || (Array.isArray(product.images) && product.images.length === 0)) {
        product.images = [apiUrl];
      } else if (typeof product.images === 'string') {
        product.images = JSON.stringify([apiUrl]);
      } else if (Array.isArray(product.images)) {
        product.images = [apiUrl, ...product.images.filter((u) => u && u !== apiUrl)];
      }
    }

    if (stats.updated <= 10) {
      console.log(`   ✅ Would update ${product.id}`);
      console.log(`      ${(entry.from || '(empty)').slice(0, 55)} → ${apiUrl.slice(0, 55)}`);
    }

    await sleep(250);
  }

  console.log('\n📊 Summary');
  console.log(`   Scanned: ${stats.scanned}`);
  console.log(`   ${APPLY ? 'Updated' : 'Would update'}: ${stats.updated}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log('   Skipped:');
  Object.entries(stats.skipped)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`      ${v}\t${k}`));

  const report = {
    generatedAt: new Date().toISOString(),
    apply: APPLY,
    stats: {
      scanned: stats.scanned,
      updated: stats.updated,
      errors: stats.errors,
      skipped: stats.skipped,
    },
    updates: stats.updates,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n   Report: ${REPORT_PATH}`);

  if (!APPLY) {
    console.log('\n   Run with --apply to write changes.');
    return;
  }

  if (stats.updated === 0) {
    console.log('\n   No changes to save.');
    return;
  }

  const backup = path.join(ROOT, `FULL-DATABASE-5554-BACKUP-before-etl-image-sync-${Date.now()}.json`);
  fs.copyFileSync(FULL_DB_PATH, backup);
  console.log(`\n💾 Backup: ${path.basename(backup)}`);
  fs.writeFileSync(FULL_DB_PATH, JSON.stringify(db, null, 2));
  console.log('✅ Saved FULL-DATABASE-5554.json');

  await updateSqlite(stats.updates);
  console.log('✅ Updated SQLite imageUrl for changed products');
  console.log('\n   Next: node product-grants-integrator.js  (refresh products-with-grants.json)');
}

function updateSqlite(updates) {
  return new Promise((resolve, reject) => {
    const sqlite = new sqlite3.Database(SQLITE_PATH);
    sqlite.serialize(() => {
      const stmt = sqlite.prepare('UPDATE products SET imageUrl = ? WHERE id = ?');
      for (const u of updates) {
        stmt.run(u.to, u.id);
      }
      stmt.finalize((err) => {
        sqlite.close();
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
