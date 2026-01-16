/**
 * PRODUCT DEEP DIVE BUILDER
 * Merges base product data with curated deep-dive content.
 *
 * Input:
 *  - products-with-grants-and-collection.json (preferred)
 *  - products-with-grants.json (fallback)
 *  - deep-dive-content.json (manual deep-dive enrichment)
 *
 * Output:
 *  - products-deep-dive.json
 *  - energy-calculator/products-deep-dive.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE_INPUT_PATHS = [
  path.join(ROOT, 'products-with-grants-and-collection.json'),
  path.join(ROOT, 'products-with-grants.json')
];
const DEEP_DIVE_CONTENT_PATH = path.join(ROOT, 'deep-dive-content.json');
const OUTPUT_PATH = path.join(ROOT, 'products-deep-dive.json');
const OUTPUT_CALC_PATH = path.join(ROOT, 'energy-calculator', 'products-deep-dive.json');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function safeWriteJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf-8');
}

function findBaseInput() {
  for (const candidate of BASE_INPUT_PATHS) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function buildDeepDive() {
  const basePath = findBaseInput();
  if (!basePath) {
    throw new Error('Base product file not found. Expected products-with-grants-and-collection.json or products-with-grants.json');
  }

  const baseData = loadJson(basePath);
  if (!baseData || !Array.isArray(baseData.products)) {
    throw new Error(`Invalid base product format in ${basePath}`);
  }

  const deepDiveContent = fs.existsSync(DEEP_DIVE_CONTENT_PATH)
    ? loadJson(DEEP_DIVE_CONTENT_PATH)
    : { updatedAt: null, products: {} };

  const deepDiveMap = deepDiveContent.products || {};
  let deepDiveCount = 0;

  const products = baseData.products.map((product) => {
    const deepDive = deepDiveMap[product.id];
    if (deepDive) {
      deepDiveCount += 1;
      return {
        ...product,
        deepDive
      };
    }
    return product;
  });

  const output = {
    ...baseData,
    metadata: {
      ...baseData.metadata,
      deepDiveGeneratedAt: new Date().toISOString(),
      deepDiveContentUpdatedAt: deepDiveContent.updatedAt || null,
      deepDiveSource: path.basename(basePath)
    },
    deepDiveStats: {
      totalProducts: products.length,
      deepDiveProducts: deepDiveCount,
      missingDeepDive: products.length - deepDiveCount
    },
    products
  };

  safeWriteJson(OUTPUT_PATH, output);
  safeWriteJson(OUTPUT_CALC_PATH, output);

  console.log('✅ Product Deep Dive build complete');
  console.log(`   Base input: ${path.basename(basePath)}`);
  console.log(`   Deep dive entries: ${deepDiveCount}`);
  console.log(`   Output: ${OUTPUT_PATH}`);
  console.log(`   Output (calculator): ${OUTPUT_CALC_PATH}`);
}

try {
  buildDeepDive();
} catch (error) {
  console.error('❌ Product Deep Dive build failed');
  console.error(error.message);
  process.exit(1);
}

