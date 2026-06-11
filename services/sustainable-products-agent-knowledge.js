/**
 * Sustainable Products Agent — lightweight knowledge (no FULL-DATABASE-5554 load).
 * Deep product search: consumer opens water-saving-finder / sustainable_product_deal_finder_portal
 * or /api/equipment-intelligence/alternatives on those HTML pages.
 */

const path = require('path');
const fs = require('fs/promises');
const {
  PORTAL_LINKS,
  loadIntentsFrom,
  matchIntent,
  normalizeImageUrl,
  marketplaceHref
} = require('./greenways-agent-shared');

const intentsPath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-showcase.json');
const catalogPath = path.join(__dirname, '..', 'data', 'sustainable-products-catalog.json');

const FINDER_LINKS = {
  water: './water-saving-finder.html',
  products: './sustainable_product_deal_finder_portal.html',
  deepDive: './restaurant-equipment-deep-dive.html',
  equipmentTool: './equipment_intelligence_tool.html'
};

const LANE_LABELS = {
  water: '💧 Water savings',
  electricity: '⚡ Electricity savings',
  gas: '🔥 Gas savings'
};

let catalogCache = null;

async function loadCatalog() {
  if (catalogCache) return catalogCache;
  try {
    const raw = await fs.readFile(catalogPath, 'utf8');
    catalogCache = JSON.parse(raw);
  } catch (_) {
    catalogCache = { products: [] };
  }
  return catalogCache;
}

async function loadShowcase() {
  try {
    const raw = await fs.readFile(showcasePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { products: [], laneImages: {} };
  }
}

function detectLane(question, profile = {}) {
  const lane = String(profile.lane || '').toLowerCase();
  if (lane === 'water' || lane === 'electricity' || lane === 'gas') return lane;
  const q = String(question || '').toLowerCase();
  if (/water|aerator|dishwasher|tap|leak|litre|liter|submeter|rinse/.test(q)) return 'water';
  if (/gas|wok|fryer|cooking|burner|heating/.test(q)) return 'gas';
  if (/electric|kwh|lighting|refrigerat|fridge|freezer|etl|combi|steamer|oven/.test(q)) return 'electricity';
  return 'electricity';
}

function catalogMatchesLane(product, lane) {
  const up = product.utilityProfile || {};
  const water = Number(up.dailyWaterLitres || 0);
  const gas = Number(up.dailyGasKwh || 0);
  const kwh = Number(up.dailyKwh || 0);
  const hay = [product.name, product.category, product.type, product.summary, ...(product.search?.keywords || [])]
    .join(' ')
    .toLowerCase();
  if (lane === 'water') {
    return water > 10 || /water|aerator|dishwasher|tap|rinse|warewash/.test(hay);
  }
  if (lane === 'gas') {
    return gas > 5 || /gas|wok|fryer|cooking|burner/.test(hay);
  }
  return kwh > 0 || /refrigerat|fridge|lighting|etl|electric|oven|steamer/.test(hay);
}

function itemHaystack(item) {
  return [
    item.name,
    item.type,
    item.category,
    item.subcategory,
    item.summary,
    item.label,
    item.id,
    ...(item.search?.keywords || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreLocalItem(item, tokens) {
  const hay = itemHaystack(item);
  let score = 0;
  for (const token of tokens) {
    if (token.length < 2) continue;
    if (hay.includes(token)) score += token.length >= 5 ? 4 : 3;
  }
  return score;
}

function searchTokens(question, extra = '') {
  const raw = `${question || ''} ${extra || ''}`.toLowerCase();
  return [...new Set(raw.split(/\s+/).filter((t) => t.length >= 2))];
}

/** Local search — sust_* catalog + showcase etl_* rows only (fast). */
function searchLocalProducts(catalog, showcase, question, profile = {}) {
  const lane = detectLane(question, profile);
  const tokens = searchTokens(question, profile.searchType || '');
  const external = (catalog.products || [])
    .filter((p) => catalogMatchesLane(p, lane))
    .map((item) => ({ item, score: scoreLocalItem(item, tokens) }))
    .filter((row) => (tokens.length ? row.score > 0 : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((row) => row.item);

  const marketplace = [];
  for (const row of showcase.products || []) {
    if (row.lane && row.lane !== lane) continue;
    if (row.source === 'market_alternative' || String(row.id).startsWith('sust_')) continue;
    const pseudo = { id: row.id, name: row.label, label: row.label, lane: row.lane };
    const score = tokens.length ? scoreLocalItem(pseudo, tokens) : 1;
    if (score > 0) {
      marketplace.push({
        id: row.id,
        name: row.label || row.id,
        grants: [],
        summary: row.label,
        source: 'greenways_marketplace',
        score
      });
    }
  }

  if (!marketplace.length && !tokens.length) {
    for (const row of (showcase.products || []).filter((p) => !p.lane || p.lane === lane)) {
      if (row.source === 'market_alternative' || String(row.id).startsWith('sust_')) continue;
      marketplace.push({
        id: row.id,
        name: row.label || row.id,
        grants: [],
        summary: row.label,
        source: 'greenways_marketplace'
      });
      if (marketplace.length >= 2) break;
    }
  }

  return {
    success: true,
    lane,
    marketplaceMatches: marketplace.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4),
    externalAlternatives: external
  };
}

function formatMarketplaceBullet(item) {
  const grants = (item.grants || []).slice(0, 2).map((g) => g.name || g.title).filter(Boolean);
  const grantBit = grants.length ? ` · ${grants.join(', ')}` : '';
  const detail = String(item.summary || item.label || 'On Greenways marketplace').slice(0, 90);
  return (
    `- **${item.name}** _(On Greenways)_ — ${detail}${grantBit}\n` +
    `  → ${marketplaceHref(item.id)}`
  );
}

function formatExternalBullet(item, lane) {
  const href = lane === 'water' ? FINDER_LINKS.water : FINDER_LINKS.products;
  const summary = String(item.summary || '').slice(0, 100);
  return `- **${item.name}** _(Market alternative)_ — ${summary || 'Catalog row'}\n  → ${href}`;
}

function formatSearchAnswer(result, lane, tip) {
  const marketplace = result.marketplaceMatches || [];
  const external = result.externalAlternatives || [];
  const label = LANE_LABELS[lane] || 'Sustainable products';
  const bullets = [
    ...marketplace.slice(0, 3).map(formatMarketplaceBullet),
    ...external.slice(0, 3).map((item) => formatExternalBullet(item, lane))
  ].join('\n');
  return {
    answer:
      `${label} — matches from showcase + \`sust_*\` catalog:\n\n` +
      `${bullets || '_No close matches in chat — use the full finder with your appliance name._'}\n\n` +
      `**Full search (all marketplace rows):**\n` +
      `- Water: ${FINDER_LINKS.water}\n` +
      `- Products: ${FINDER_LINKS.products}\n\n_${tip}_`,
    suggestions: []
  };
}

function toProductSample(item, lane, showcase) {
  const isMarket =
    item.source === 'greenways_marketplace' || String(item.id || '').startsWith('etl_');
  const curated = (showcase.products || []).find((p) => p.id === item.id);
  const grants = (item.grants || []).slice(0, 2).map((g) => g.name || g.title).filter(Boolean);
  const laneImage = showcase.laneImages?.[lane] || '';
  return {
    id: item.id,
    name: item.name || item.id,
    label: curated?.label || (isMarket ? 'On Greenways' : 'Market alternative'),
    subcategory: (item.subcategory || item.category || lane || 'PRODUCT').toUpperCase(),
    imageUrl: normalizeImageUrl(item.imageUrl) || laneImage,
    topGrants: grants.length ? grants : [isMarket ? 'On Greenways' : 'Market alternative'],
    grantsCount: grants.length,
    marketplaceHref: isMarket
      ? marketplaceHref(item.id)
      : lane === 'water'
        ? FINDER_LINKS.water
        : FINDER_LINKS.products,
    source: isMarket ? 'greenways_marketplace' : 'market_alternative',
    lane
  };
}

async function pickShowcaseSamplesOnly(profile = {}, limit = 3) {
  const showcase = await loadShowcase();
  const catalog = await loadCatalog();
  const catalogById = new Map((catalog.products || []).map((p) => [String(p.id), p]));
  const lane = profile.lane || detectLane('', profile);
  const curatedRows = (showcase.products || []).filter((p) => !p.lane || p.lane === lane);
  const samples = [];
  for (const row of curatedRows) {
    let item;
    if (row.source === 'market_alternative' || String(row.id).startsWith('sust_')) {
      item = catalogById.get(row.id) || {
        id: row.id,
        name: row.label || row.id,
        category: row.lane,
        source: 'market_alternative'
      };
    } else {
      item = {
        id: row.id,
        name: row.label || row.id,
        imageUrl: showcase.laneImages?.[row.lane || lane],
        source: 'greenways_marketplace',
        grants: []
      };
    }
    samples.push(toProductSample({ ...item, source: item.source || 'greenways_marketplace' }, row.lane || lane, showcase));
    if (samples.length >= limit) break;
  }
  return samples.slice(0, limit);
}

async function pickProductSamples(question, profile = {}, limit = 3) {
  if (!String(question || '').trim() || String(question).length < 4) {
    return pickShowcaseSamplesOnly(profile, limit);
  }

  const showcase = await loadShowcase();
  const catalog = await loadCatalog();
  const lane = detectLane(question, profile);
  const search = searchLocalProducts(catalog, showcase, question, profile);
  const samples = [];

  for (const item of [...(search.marketplaceMatches || []), ...(search.externalAlternatives || [])]) {
    if (samples.length >= limit) break;
    samples.push(toProductSample(item, lane, showcase));
  }

  if (samples.length < limit) {
    const extra = await pickShowcaseSamplesOnly({ ...profile, lane }, limit - samples.length);
    for (const row of extra) {
      if (samples.some((s) => s.id === row.id)) continue;
      samples.push(row);
      if (samples.length >= limit) break;
    }
  }

  return samples.slice(0, limit);
}

function buildProductDealSpotlightsAnswer(tip) {
  return {
    answer:
      `**Product deal spotlights** are curated rows in the deals feed (weekly offers, limited-time product links) — not the same as searching this catalog.\n\n` +
      `→ **Deals Agent:** ${PORTAL_LINKS.dealsAgent}\n` +
      `→ **Full Deals page:** ${PORTAL_LINKS.dealsFullPage}\n` +
      `→ **Sustainability lane ticker:** ${PORTAL_LINKS.deals}\n\n` +
      `Stay on **this agent** when you want to **find and compare** efficient products (water / electricity / gas lanes, \`etl_*\` vs \`sust_*\`).\n\n_${tip}_`,
    suggestions: []
  };
}

function buildOverviewAnswer(catalog, tip) {
  const rows = catalog.products || [];
  const water = rows.filter((p) => catalogMatchesLane(p, 'water')).length;
  const elec = rows.filter((p) => catalogMatchesLane(p, 'electricity')).length;
  const gas = rows.filter((p) => catalogMatchesLane(p, 'gas')).length;
  return {
    answer:
      `**Greenways Sustainable Products Agent** — one chat, **three utility lanes**:\n\n` +
      `- ${LANE_LABELS.water} — ${water} \`sust_*\` catalog rows + marketplace dishwashers & aerators\n` +
      `- ${LANE_LABELS.electricity} — ${elec} rows + ETL refrigeration & cooking\n` +
      `- ${LANE_LABELS.gas} — ${gas} rows + wok, fryer & cooking retrofits\n\n` +
      `Chat shows **On Greenways** showcase picks + **Market alternative** catalog rows. ` +
      `Open the full finders for complete marketplace search.\n\n` +
      `**Limited-time product deals:** curated **spotlights & weekly offers** live on **Deals Agent** (${PORTAL_LINKS.dealsAgent}) — sustainability lane on ${PORTAL_LINKS.deals}. Ask here to **search** the catalog; ask Deals for **what's on offer this week**.\n\n` +
      `**Full finders:**\n` +
      `- ${FINDER_LINKS.water}\n` +
      `- ${FINDER_LINKS.products}\n\n_${tip}_`,
    suggestions: []
  };
}

function buildLaneAnswer(lane, catalog, showcase, tip) {
  const rows = (catalog.products || []).filter((p) => catalogMatchesLane(p, lane)).slice(0, 4);
  const marketShowcase = (showcase.products || []).filter(
    (p) =>
      (!p.lane || p.lane === lane) &&
      p.source !== 'market_alternative' &&
      !String(p.id).startsWith('sust_')
  );
  const bullets = [
    ...marketShowcase.slice(0, 2).map((row) =>
      formatMarketplaceBullet({ id: row.id, name: row.label, grants: [], summary: row.label })
    ),
    ...rows.slice(0, 4).map((p) => formatExternalBullet(p, lane))
  ].join('\n');
  const finder = lane === 'water' ? FINDER_LINKS.water : FINDER_LINKS.products;
  return {
    answer:
      `${LANE_LABELS[lane]} — efficient product paths for restaurants:\n\n` +
      `${bullets || '_Browse the full finder for your appliance type._'}\n\n` +
      `→ **Open finder:** ${finder}\n\n_${tip}_`,
    suggestions: []
  };
}

function buildSourcesAnswer(tip) {
  return {
    answer:
      `**Two product columns** (same as dashboard finders):\n\n` +
      `| Badge | Source | What it is |\n` +
      `|-------|--------|------------|\n` +
      `| **On Greenways** | \`etl_*\` | Listed marketplace products with grants overlay & photos |\n` +
      `| **Market alternative** | \`sust_*\` | Broader catalog — gas/water/retrofit options not yet on marketplace |\n\n` +
      `This chat uses showcase + catalog for fast answers. **Full marketplace search** runs on the finder HTML pages via \`/api/equipment-intelligence/alternatives\`.\n\n` +
      `**Suggest for Greenways** intake stays on finder pages (staff workflow).\n\n_${tip}_`,
    suggestions: []
  };
}

function buildPortalsAnswer(portal, tip) {
  const lines = [];
  if (portal === 'water' || portal === 'all') lines.push(`- **Water Saving Finder:** ${FINDER_LINKS.water}`);
  if (portal === 'products' || portal === 'all') {
    lines.push(`- **Sustainable Product Finder:** ${FINDER_LINKS.products}`);
  }
  lines.push(`- **Equipment deep dive:** ${FINDER_LINKS.deepDive}`);
  lines.push(`- **Equipment intelligence tool:** ${FINDER_LINKS.equipmentTool}`);
  return {
    answer: `**Sustainable product finders on Greenways:**\n\n${lines.join('\n')}\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildSearchIntentAnswer(intent, catalog, showcase, tip) {
  const lane = intent.lane || detectLane(intent.searchType, {});
  const result = searchLocalProducts(catalog, showcase, intent.searchType, {
    lane,
    searchType: intent.searchType
  });
  if (!(result.marketplaceMatches || []).length && !(result.externalAlternatives || []).length) {
    const fallbackRows = (catalog.products || []).filter((p) => catalogMatchesLane(p, lane)).slice(0, 4);
    result.externalAlternatives = fallbackRows;
  }
  const out = formatSearchAnswer(result, lane, tip);
  out.intentId = intent.id;
  return out;
}

async function buildFallbackSearchAnswer(question, profile, catalog, showcase, tip) {
  const lane = detectLane(question, profile);
  const result = searchLocalProducts(catalog, showcase, question, profile);
  if (!(result.marketplaceMatches || []).length && !(result.externalAlternatives || []).length) {
    return null;
  }
  const out = formatSearchAnswer(result, lane, tip);
  out.source = 'product-search';
  out.intentId = 'product_search';
  return out;
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const [catalog, showcase] = await Promise.all([loadCatalog(), loadShowcase()]);
  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);

  let result;
  if (intent) {
    switch (intent.answerType) {
      case 'overview':
        result = buildOverviewAnswer(catalog, tip);
        break;
      case 'lane':
        result = buildLaneAnswer(intent.lane, catalog, showcase, tip);
        break;
      case 'search':
        result = await buildSearchIntentAnswer(intent, catalog, showcase, tip);
        break;
      case 'sources':
        result = buildSourcesAnswer(tip);
        break;
      case 'portals':
        result = buildPortalsAnswer(intent.portal || 'all', tip);
        break;
      case 'product_deal_spotlights':
        result = buildProductDealSpotlightsAnswer(tip);
        break;
      default:
        result = null;
    }
  }

  if (!result) {
    result = await buildFallbackSearchAnswer(question, profile, catalog, showcase, tip);
  }

  if (result?.answer) {
    const lane = intent?.lane || detectLane(question, profile);
    const profileWithLane = { ...profile, lane, searchType: intent?.searchType };
    result.source = result.source || 'knowledge';
    result.intentId = result.intentId || intent?.id || null;
    result.lane = lane;
    result.productSamples = await pickProductSamples(question, profileWithLane, 3);
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickProductSamples,
  pickShowcaseSamplesOnly,
  getDefaultProductSamples: (limit = 3, lane = 'electricity') =>
    pickShowcaseSamplesOnly({ lane: lane || 'electricity' }, limit),
  detectLane,
  FINDER_LINKS
};
