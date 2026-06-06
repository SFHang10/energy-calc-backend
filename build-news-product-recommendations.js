const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_PRIMARY = path.join(__dirname, 'energy-calculator', 'products-with-grants-and-collection.json');
const PRODUCTS_FALLBACK = path.join(__dirname, 'energy-calculator', 'products-with-grants.json');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'news-category-knowledge.json');
const IMPACT_MAP_FILE = path.join(DATA_DIR, 'personalized-impact-map.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'news-product-recommendations.json');

const RENDER_BASE = 'https://energy-calc-backend.onrender.com';
const PRODUCT_PATH = '/product-page-v2-marketplace.html';

const normalize = (value) => (value || '')
  .toString()
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const pickProductsFile = () => {
  if (fs.existsSync(PRODUCTS_PRIMARY)) return PRODUCTS_PRIMARY;
  if (fs.existsSync(PRODUCTS_FALLBACK)) return PRODUCTS_FALLBACK;
  throw new Error('No enriched products JSON found.');
};

const parseProductIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/product=([a-z0-9_]+)/i);
  return match ? match[1] : null;
};

const normalizeProductUrl = (productId) => (
  `${RENDER_BASE}${PRODUCT_PATH}?product=${productId}&fromPopup=true`
);

const hashString = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
};

const seededShuffle = (array, seed) => {
  const items = array.slice();
  let state = seed || 1;
  for (let i = items.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const index = state % (i + 1);
    [items[i], items[index]] = [items[index], items[i]];
  }
  return items;
};

const buildImpactMapIndex = (impactMap) => {
  const items = (impactMap && impactMap.items) || [];
  return items.map((item) => ({
    raw: item,
    topic: normalize(item.topic),
    keywords: (item.keywords || []).map(normalize),
  }));
};

const findImpactMatch = (entry, impactIndex) => {
  const title = normalize(entry.title);
  const summary = normalize(entry.summary);

  let match = impactIndex.find((item) => item.topic && (title.includes(item.topic) || item.topic.includes(title)));
  if (match) return match.raw;

  match = impactIndex.find((item) => item.keywords.some((keyword) => title.includes(keyword) || summary.includes(keyword)));
  return match ? match.raw : null;
};

const scoreProduct = (product, keywords) => {
  const haystack = normalize([
    product.name,
    product.brand,
    product.category,
    product.subcategory,
    product.descriptionShort,
  ].join(' '));

  let score = 0;
  keywords.forEach((keyword) => {
    if (keyword && haystack.includes(keyword)) score += 1;
  });
  return score;
};

const selectByKeywords = (productList, keywords, limit, seedKey, usedSet) => {
  const scored = productList
    .map((product) => ({ product, score: scoreProduct(product, keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const preferredPool = scored.filter((item) => !usedSet || !usedSet.has(item.product.id));
  const fallbackPool = scored.filter((item) => !preferredPool.includes(item));

  const pool = preferredPool.length ? preferredPool : fallbackPool;
  const seed = hashString(`${seedKey}-${new Date().toISOString().slice(0, 7)}`);
  const shuffled = seededShuffle(pool.slice(0, 10), seed).slice(0, limit);

  return shuffled.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    reason: `Keyword match (${item.score})`,
    url: normalizeProductUrl(item.product.id),
  }));
};

const buildKeywords = (entry) => {
  const text = normalize([entry.title, entry.summary].join(' '));
  const words = text.split(' ').filter((word) => word.length > 3);
  return Array.from(new Set(words));
};

const buildRecommendations = () => {
  const knowledge = readJson(KNOWLEDGE_FILE);
  const impactMap = readJson(IMPACT_MAP_FILE);
  const productsData = readJson(pickProductsFile());
  const productList = (productsData && productsData.products) || productsData || [];

  const productLookup = new Map(productList.map((item) => [item.id, item]));
  const impactIndex = buildImpactMapIndex(impactMap);

  const entries = Object.values((knowledge && knowledge.categories) || {}).flat();
  const items = [];
  const usedProductIds = new Set();

  entries.forEach((entry) => {
    if (!entry || !entry.id) return;
    const impact = findImpactMatch(entry, impactIndex);
    const productIds = impact
      ? (Array.isArray(impact.productIds)
        ? impact.productIds
        : [parseProductIdFromUrl(impact.exampleLink)].filter(Boolean))
      : [];

    let recommendations = productIds
      .filter((id) => productLookup.has(id))
      .map((id) => {
        const product = productLookup.get(id);
        return {
          productId: id,
          productName: product && product.name ? product.name : id,
          reason: impact ? (impact.exampleAction || 'Relevant product for this update.') : 'Relevant product for this update.',
          url: normalizeProductUrl(id),
        };
      });

    if (!recommendations.length) {
      const keywords = buildKeywords(entry);
      recommendations = selectByKeywords(productList, keywords, 3, entry.id, usedProductIds);
    }

    if (!recommendations.length) return;

    recommendations.forEach((rec) => usedProductIds.add(rec.productId));

    items.push({
      newsId: entry.id,
      headline: entry.title,
      recommendations,
      moreLink: (impact && impact.moreLink) || (entry.sources && entry.sources[0]) || null,
    });
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    items,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2));
  return payload;
};

try {
  const result = buildRecommendations();
  console.log(`✅ Wrote ${result.items.length} news recommendations to ${OUTPUT_FILE}`);
} catch (error) {
  console.error('❌ Failed to build news recommendations:', error.message);
  process.exitCode = 1;
}
