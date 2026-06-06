const fs = require('fs');
const path = require('path');

const PRODUCTS_PRIMARY = path.join(__dirname, 'energy-calculator', 'products-with-grants-and-collection.json');
const PRODUCTS_FALLBACK = path.join(__dirname, 'energy-calculator', 'products-with-grants.json');
const KNOWLEDGE_FILE = path.join(__dirname, 'data', 'news-category-knowledge.json');
const IMPACT_MAP_FILE = path.join(__dirname, 'data', 'personalized-impact-map.json');

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

const normalizeProductUrl = (productId) => (
  `${RENDER_BASE}${PRODUCT_PATH}?product=${productId}&fromPopup=true`
);

const parseProductIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/product=([a-z0-9_]+)/i);
  return match ? match[1] : null;
};

const buildImpactIndex = (impactMap) => {
  const items = (impactMap && impactMap.items) || [];
  return items.map((item) => ({
    raw: item,
    topic: normalize(item.topic),
    keywords: (item.keywords || []).map(normalize),
  }));
};

const findImpactMatch = (headline, impactIndex) => {
  const title = normalize(headline);
  let match = impactIndex.find((item) => item.topic && (title.includes(item.topic) || item.topic.includes(title)));
  if (match) return match.raw;
  match = impactIndex.find((item) => item.keywords.some((keyword) => title.includes(keyword)));
  return match ? match.raw : null;
};

const scoreProduct = (product, keywords) => {
  const haystack = normalize([product.name, product.brand, product.category, product.subcategory, product.descriptionShort].join(' '));
  let score = 0;
  keywords.forEach((keyword) => {
    if (keyword && haystack.includes(keyword)) score += 1;
  });
  return score;
};

const suggestProducts = (headline, limit) => {
  const impactMap = readJson(IMPACT_MAP_FILE);
  const knowledge = readJson(KNOWLEDGE_FILE);
  const productsData = readJson(pickProductsFile());
  const productList = (productsData && productsData.products) || productsData || [];
  const productLookup = new Map(productList.map((item) => [item.id, item]));

  const impactIndex = buildImpactIndex(impactMap);
  const impact = findImpactMatch(headline, impactIndex);

  if (impact) {
    const productIds = Array.isArray(impact.productIds)
      ? impact.productIds
      : [parseProductIdFromUrl(impact.exampleLink)].filter(Boolean);
    const recommendations = productIds
      .filter((id) => productLookup.has(id))
      .map((id) => {
        const product = productLookup.get(id);
        return {
          productId: id,
          productName: product && product.name ? product.name : id,
          reason: impact.exampleAction || 'Mapped via impact rules.',
          url: normalizeProductUrl(id),
        };
      });
    return recommendations.slice(0, limit);
  }

  const keywordSet = new Set();
  const knowledgeItems = Object.values((knowledge && knowledge.categories) || {}).flat();
  knowledgeItems.forEach((entry) => {
    if (!entry || !entry.title) return;
    const title = normalize(entry.title);
    if (normalize(headline).includes(title)) {
      normalize(entry.summary).split(' ').forEach((word) => keywordSet.add(word));
    }
  });

  const fallbackKeywords = normalize(headline).split(' ').filter((word) => word.length > 3);
  fallbackKeywords.forEach((word) => keywordSet.add(word));

  const keywords = Array.from(keywordSet).filter(Boolean);
  const scored = productList
    .map((product) => ({
      product,
      score: scoreProduct(product, keywords),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      reason: `Keyword match (${item.score})`,
      url: normalizeProductUrl(item.product.id),
    }));

  return scored;
};

const args = process.argv.slice(2);
const headline = args.find((arg) => !arg.startsWith('--')) || '';
const limitArg = args.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 3;

if (!headline) {
  console.log('Usage: node suggest-news-products.js "Headline here" --limit=3');
  process.exit(0);
}

try {
  const suggestions = suggestProducts(headline, limit);
  if (!suggestions.length) {
    console.log('No suggestions found. Consider adding to personalized-impact-map.json.');
    process.exit(0);
  }
  console.log(JSON.stringify({ headline, suggestions }, null, 2));
} catch (error) {
  console.error('Failed to suggest products:', error.message);
  process.exitCode = 1;
}
