/**
 * Grant checker for data/sustainable-products-catalog.json
 * Uses combined-grants-loader.js (schemes.json + hardcoded) — same source as marketplace integrator.
 *
 * Usage: node scripts/enrich-sustainable-products-grants.js [region]
 * Default region: nl
 */
const path = require('path');
const {
  readCatalogFile,
  writeCatalogFile,
  attachGrantsToCatalogProduct,
  CATALOG_PATH
} = require('../services/sustainable-products-catalog');

const region = process.argv[2] || 'nl';

function main() {
  const catalog = readCatalogFile();
  const products = Array.isArray(catalog.products) ? catalog.products : [];
  let matched = 0;

  catalog.products = products.map((product) => {
    const enriched = attachGrantsToCatalogProduct(product, region);
    if ((enriched.grants || []).length) matched += 1;
    return enriched;
  });

  writeCatalogFile(catalog);
  console.log(`✅ Enriched ${catalog.products.length} sustainable catalog products (${matched} with grants)`);
  console.log(`   File: ${CATALOG_PATH}`);
  console.log(`   Region: ${region}`);
}

main();
