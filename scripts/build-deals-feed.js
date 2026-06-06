/**
 * Builds consumer-facing data/deals-feed.json from:
 *   - data/deals-feed-seeds.json (curated rows + highlights)
 *   - data/deals-weekly-input.json (optional product deals → sustainability rows)
 *
 * Run: node scripts/build-deals-feed.js
 * Or: npm run build:deals-feed
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEEDS_PATH = path.join(ROOT, 'data', 'deals-feed-seeds.json');
const WEEKLY_PATH = path.join(ROOT, 'data', 'deals-weekly-input.json');
const OUT_PATH = path.join(ROOT, 'data', 'deals-feed.json');

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function weeklyToFeedDeals(weekly, generatedAt) {
  if (!weekly || !Array.isArray(weekly.deals)) return [];
  return weekly.deals
    .filter((d) => d && d.productId)
    .map((d, i) => ({
      id: `weekly-${d.productId}-${i}`,
      category: 'sustainability',
      title: d.name || 'Product deal',
      line: [d.price, d.expires ? `until ${d.expires}` : null].filter(Boolean).join(' · ') || 'From weekly deal intake',
      region: 'EU',
      tags: ['product', 'weekly'],
      href: d.url || './sustainable_product_deal_finder_portal.html',
      isNew: true,
      addedAt: generatedAt.slice(0, 10),
      productId: d.productId
    }));
}

function main() {
  const seeds = readJsonSafe(SEEDS_PATH);
  if (!seeds || !Array.isArray(seeds.deals)) {
    console.error('Missing or invalid', SEEDS_PATH);
    process.exitCode = 1;
    return;
  }

  const generatedAt = new Date().toISOString();
  const weekly = readJsonSafe(WEEKLY_PATH);
  const merged = [...seeds.deals, ...weeklyToFeedDeals(weekly, generatedAt)];

  const payload = {
    meta: {
      ...(seeds.meta || {}),
      version: 1,
      generatedAt,
      sources: ['deals-feed-seeds.json', 'deals-weekly-input.json (merged when present)']
    },
    deals: merged,
    highlights: Array.isArray(seeds.highlights) ? seeds.highlights : []
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
  console.log('Written', path.relative(ROOT, OUT_PATH));
  console.log('Deals:', merged.length, '| Highlights:', payload.highlights.length);
}

main();
