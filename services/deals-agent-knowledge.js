const path = require('path');
const fs = require('fs/promises');
const {
  PORTAL_LINKS,
  loadIntentsFrom,
  matchIntent,
  loadProductsWithGrants,
  normalizeImageUrl
} = require('./greenways-agent-shared');

const intentsPath = path.join(__dirname, '..', 'data', 'deals-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'deals-agent-showcase.json');
const dealsFeedPath = path.join(__dirname, '..', 'data', 'deals-feed.json');

let dealsCache = null;

async function loadIntents() {
  return loadIntentsFrom(intentsPath);
}

async function loadDealsFeed() {
  if (dealsCache) return dealsCache;
  try {
    const raw = await fs.readFile(dealsFeedPath, 'utf8');
    dealsCache = JSON.parse(raw);
  } catch (_) {
    dealsCache = { deals: [], highlights: [] };
  }
  return dealsCache;
}

async function loadDealsShowcase() {
  try {
    const raw = await fs.readFile(showcasePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { deals: [], categoryImages: {} };
  }
}

async function resolveDealImage(deal, showcase, productById) {
  const curated = (showcase.deals || []).find((d) => d.id === deal.id);
  if (curated?.imageUrl) return curated.imageUrl;
  const productId = deal.productId || curated?.productId;
  if (productId && productById.has(String(productId))) {
    return normalizeImageUrl(productById.get(String(productId)).imageUrl);
  }
  const cat = String(deal.category || '').toLowerCase();
  return showcase.categoryImages?.[cat] || '';
}

function dealHref(deal) {
  const cat = String(deal.category || '').toLowerCase();
  if (cat === 'energy') return deal.href || PORTAL_LINKS.europeanEnergy;
  return deal.href || PORTAL_LINKS.deals;
}

function toDealSample(deal, imageUrl) {
  const tags = Array.isArray(deal.tags) ? deal.tags : [];
  return {
    id: deal.id,
    name: deal.title || deal.id,
    label: deal.line || deal.category || 'Deal',
    subcategory: String(deal.category || 'deal').toUpperCase(),
    imageUrl,
    topGrants: tags.slice(0, 2).length ? tags.slice(0, 2) : [deal.region || 'EU'],
    grantsCount: 0,
    marketplaceHref: dealHref(deal),
    region: deal.region || 'EU',
    isNew: !!deal.isNew
  };
}

function scoreDeal(deal, question, profile) {
  const q = String(question || '').toLowerCase();
  const hay = [deal.title, deal.line, deal.category, deal.region, ...(deal.tags || [])]
    .join(' ')
    .toLowerCase();
  let score = 0;
  if (deal.isNew) score += 3;
  const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (hay.includes(token)) score += 3;
  }
  const pr = String(profile.region || '').toLowerCase();
  if (pr && String(deal.region || '').toLowerCase() === pr) score += 5;
  if (/tariff|electric|gas|energy|compare|package|green|renewable/.test(q)) {
    if (deal.category === 'energy') score += 8;
    if (q.includes('green') && (deal.tags || []).includes('green')) score += 6;
    if (q.includes('restaurant') && (deal.tags || []).includes('restaurant')) score += 6;
  }
  return score;
}

async function pickDealSamples(question, profile = {}, limit = 3) {
  const feed = await loadDealsFeed();
  const showcase = await loadDealsShowcase();
  const { products } = await loadProductsWithGrants();
  const productById = new Map(products.map((p) => [String(p.id), p]));
  const deals = Array.isArray(feed.deals) ? feed.deals : [];

  const curated = [];
  for (const row of showcase.deals || []) {
    const deal = deals.find((d) => d.id === row.id);
    if (deal) {
      const imageUrl = await resolveDealImage(deal, showcase, productById);
      curated.push(toDealSample(deal, imageUrl));
    }
    if (curated.length >= limit) break;
  }

  if (!String(question || '').trim() || String(question).length < 4) {
    return curated.slice(0, limit);
  }

  const ranked = deals
    .map((d) => ({ d, score: scoreDeal(d, question, profile) }))
    .filter((row) => row.score > 2)
    .sort((a, b) => b.score - a.score);

  const dynamic = [];
  const seen = new Set();
  for (const { d } of ranked) {
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    const imageUrl = await resolveDealImage(d, showcase, productById);
    dynamic.push(toDealSample(d, imageUrl));
    if (dynamic.length >= limit) break;
  }

  const merged = [...dynamic];
  for (const sample of curated) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === sample.id)) merged.push(sample);
  }
  return merged.slice(0, limit);
}

function formatDealBullets(deals, max = 6) {
  return deals.slice(0, max).map((d) => {
    const href = dealHref(d);
    return `- **${d.title}** (${d.region || 'EU'}) — ${String(d.line || '').slice(0, 100)}\n  → ${href}`;
  }).join('\n');
}

function filterByCategory(deals, category) {
  return deals.filter((d) => String(d.category || '').toLowerCase() === category);
}

function filterByRegion(deals, region) {
  return deals.filter((d) => String(d.region || '').toUpperCase() === String(region).toUpperCase());
}

function findDealById(deals, id) {
  return deals.find((d) => d.id === id);
}

function portalFooter(tip) {
  return (
    `\n**Open full finders:**\n` +
    `- **Deals page (ticker + sidebar):** ${PORTAL_LINKS.dealsFullPage}\n` +
    `- **European energy portal (tariff compare):** ${PORTAL_LINKS.europeanEnergy}\n` +
    `- **Deals ticker hub:** ${PORTAL_LINKS.deals}\n\n_${tip}_`
  );
}

function isProductDealRow(deal) {
  if (deal?.productId) return true;
  const tags = deal?.tags || [];
  return tags.includes('product') || tags.includes('weekly');
}

function buildOverviewAnswer(deals, tip) {
  const energy = filterByCategory(deals, 'energy').length;
  const water = filterByCategory(deals, 'water').length;
  const sust = filterByCategory(deals, 'sustainability').length;
  const productSpotlights = deals.filter(isProductDealRow).length;
  const newest = deals.filter((d) => d.isNew).slice(0, 4);
  return {
    answer:
      `**Greenways Deals** — **${deals.length}** rows in the deals feed:\n\n` +
      `- **Energy tariffs & packages:** ${energy}\n` +
      `- **Water savings:** ${water}\n` +
      `- **Sustainability lane:** ${sust} (includes **${productSpotlights} product spotlight** row${productSpotlights === 1 ? '' : 's'})\n\n` +
      (newest.length ? `**Recently added:**\n${formatDealBullets(newest, 4)}\n\n` : '') +
      `**Ask about:** supply deals (tariffs) · **product deal spotlights** (weekly offers) · water hardware links.\n` +
      `For **searching the full efficient-product catalog**, use **Sustainable Products Agent** (${PORTAL_LINKS.sustainableProductsAgent}).` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildProductDealsAnswer(deals, tip) {
  const spotlight = deals.filter(isProductDealRow);
  const lane = filterByCategory(deals, 'sustainability');
  const rows = spotlight.length ? spotlight : lane;
  return {
    answer:
      `**Product deal spotlights** — curated offers in the deals feed (weekly product rows + sustainability lane):\n\n` +
      `${formatDealBullets(rows.slice(0, 6), 6) || '_No product spotlight rows yet — open the sustainable product finder or refresh the feed._'}\n\n` +
      `**Two paths (both valid):**\n` +
      `1. **Spotlights & weekly offers** (this agent) — ${PORTAL_LINKS.dealsFullPage} · sustainability lane on ${PORTAL_LINKS.deals}\n` +
      `2. **Search all efficient products** — ${PORTAL_LINKS.sustainableProductsAgent} · ./sustainable_product_deal_finder_portal.html\n\n` +
      `_Prices and availability change — confirm on the linked page before buying._\n\n_${tip}_`,
    suggestions: []
  };
}

function buildTariffCompareAnswer(deals, tip) {
  const energy = filterByCategory(deals, 'energy');
  const flagship = findDealById(deals, 'energy-eu-compare') || energy[0];
  const rows = flagship ? [flagship, ...energy.filter((d) => d.id !== flagship?.id)].slice(0, 5) : energy.slice(0, 5);
  return {
    answer:
      `**Compare energy tariffs & packages** — use the **European energy deals portal** for postcode-style compare (home, restaurant, office).\n\n` +
      `${formatDealBullets(rows, 5) || '_Energy lane empty — open the portal directly._'}\n\n` +
      `→ **Live compare:** ${PORTAL_LINKS.europeanEnergy}` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildNlRestaurantEnergyAnswer(deals, tip) {
  const nlEnergy =
    findDealById(deals, 'energy-nl-restaurant') ||
    filterByRegion(filterByCategory(deals, 'energy'), 'NL')[0];
  const related = filterByCategory(deals, 'energy').filter((d) => d.id !== nlEnergy?.id).slice(0, 3);
  const blocks = nlEnergy ? [nlEnergy, ...related] : filterByCategory(deals, 'energy').slice(0, 4);
  return {
    answer:
      `**NL restaurant & hospitality energy** — business rates, gas + electricity switching tips, VAT-aware estimates.\n\n` +
      `${formatDealBullets(blocks, 4) || '_No NL energy rows — try the European portal with NL selected._'}\n\n` +
      `→ **Compare packages:** ${PORTAL_LINKS.europeanEnergy}` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildUkGreenTariffAnswer(deals, tip) {
  const ukGreen =
    findDealById(deals, 'energy-uk-green-tariff') ||
    filterByRegion(filterByCategory(deals, 'energy'), 'UK').find((d) =>
      (d.tags || []).includes('green')
    );
  const related = filterByCategory(deals, 'energy')
    .filter((d) => d.id !== ukGreen?.id && String(d.region || '').toUpperCase() === 'UK')
    .slice(0, 3);
  const blocks = ukGreen ? [ukGreen, ...related] : filterByRegion(deals, 'UK').slice(0, 4);
  return {
    answer:
      `**UK green tariff check** — renewable-backed supply, renewal dates, and switching windows.\n\n` +
      `${formatDealBullets(blocks, 4) || '_No UK green rows in feed — open the energy portal._'}\n\n` +
      `→ **Green tariff compare:** ${PORTAL_LINKS.europeanEnergy}` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildGreenTariffAnswer(deals, tip) {
  const greenEnergy = filterByCategory(deals, 'energy').filter(
    (d) => (d.tags || []).includes('green') || /green|renewable/i.test(String(d.title || ''))
  );
  const picked = greenEnergy.length ? greenEnergy : filterByCategory(deals, 'energy').slice(0, 4);
  return {
    answer:
      `**Green & renewable energy deals** — tariffs with renewable-backed supply in the feed:\n\n` +
      `${formatDealBullets(picked, 5) || '_Browse the energy portal for green tariff filters._'}\n\n` +
      `→ **Compare green packages:** ${PORTAL_LINKS.europeanEnergy}` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildEnergyCategoryAnswer(deals, tip) {
  const matches = filterByCategory(deals, 'energy').slice(0, 6);
  return {
    answer:
      `**Energy tariffs & packages** — electricity and gas deals for business and hospitality:\n\n` +
      `${formatDealBullets(matches, 6) || '_No energy rows — open the European energy portal._'}\n\n` +
      `→ **Compare packages:** ${PORTAL_LINKS.europeanEnergy}` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildCategoryAnswer(category, deals, tip) {
  if (category === 'energy') return buildEnergyCategoryAnswer(deals, tip);
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const matches = filterByCategory(deals, category).slice(0, 6);
  return {
    answer:
      `**${label} deals** — ${matches.length} matches in the feed:\n\n` +
      `${formatDealBullets(matches, 6) || '_No rows in this lane right now — check the deals hub._'}\n\n` +
      `Hub: ${PORTAL_LINKS.deals}` +
      (category === 'sustainability'
        ? `\n**Product spotlights:** ask "what product deals are live?" · Full catalog search: ${PORTAL_LINKS.sustainableProductsAgent}`
        : '') +
      `\n\n_${tip}_`,
    suggestions: []
  };
}

function buildRegionAnswer(region, deals, tip) {
  const matches = filterByRegion(deals, region).slice(0, 6);
  const energyNote =
    region === 'NL' || region === 'UK'
      ? `\n→ **Energy packages:** ${PORTAL_LINKS.europeanEnergy}`
      : '';
  return {
    answer:
      `**${region} deals** — region-tagged rows:\n\n` +
      `${formatDealBullets(matches, 6) || '_Try EU-wide energy or water lanes for more options._'}` +
      energyNote +
      portalFooter(tip),
    suggestions: []
  };
}

function buildNewDealsAnswer(deals, tip) {
  const newest = deals.filter((d) => d.isNew).slice(0, 8);
  return {
    answer:
      `**New & highlighted deals:**\n\n${formatDealBullets(newest, 8) || '_No isNew flags in feed — run build:deals-feed to refresh._'}` +
      portalFooter(tip),
    suggestions: []
  };
}

function buildDealsPageAnswer(tip) {
  return {
    answer:
      `**Deals.html** — full Greenways Buildings deals shell:\n\n` +
      `- Main view: **deals-ticker-hub** (energy / water / sustainability lanes + search)\n` +
      `- Sidebar: **European energy portal**, Water Saving Finder, Sustainable product finder\n\n` +
      `→ ${PORTAL_LINKS.dealsFullPage}\n` +
      `→ Energy compare: ${PORTAL_LINKS.europeanEnergy}\n\n_${tip}_`,
    suggestions: []
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer:
      `**Deals on Greenways:**\n\n` +
      `- **Full Deals page:** ${PORTAL_LINKS.dealsFullPage}\n` +
      `- **European energy portal (tariffs/packages):** ${PORTAL_LINKS.europeanEnergy}\n` +
      `- **Deals ticker hub:** ${PORTAL_LINKS.deals}\n` +
      `- **Water Saving Finder:** ./water-saving-finder.html\n` +
      `- **Product deal spotlights:** ask here or open sustainability lane on ${PORTAL_LINKS.deals}\n` +
      `- **Search efficient products:** ${PORTAL_LINKS.sustainableProductsAgent}\n\n_${tip}_`,
    suggestions: []
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntents();
  const feed = await loadDealsFeed();
  const deals = Array.isArray(feed.deals) ? feed.deals : [];
  if (!deals.length) return null;

  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);
  if (!intent) return null;

  let result;
  switch (intent.answerType) {
    case 'overview':
      result = buildOverviewAnswer(deals, tip);
      break;
    case 'tariff_compare':
      result = buildTariffCompareAnswer(deals, tip);
      break;
    case 'nl_restaurant_energy':
      result = buildNlRestaurantEnergyAnswer(deals, tip);
      break;
    case 'uk_green_tariff':
      result = buildUkGreenTariffAnswer(deals, tip);
      break;
    case 'green_tariff':
      result = buildGreenTariffAnswer(deals, tip);
      break;
    case 'category':
      result = buildCategoryAnswer(intent.category, deals, tip);
      break;
    case 'region':
      result = buildRegionAnswer(intent.region, deals, tip);
      break;
    case 'new_deals':
      result = buildNewDealsAnswer(deals, tip);
      break;
    case 'deals_page':
      result = buildDealsPageAnswer(tip);
      break;
    case 'portals':
      result = buildPortalsAnswer(tip);
      break;
    case 'product_deals':
      result = buildProductDealsAnswer(deals, tip);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = intent.id;
    result.productSamples = await pickDealSamples(question, profile, 3);
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickDealSamples,
  getDefaultProductSamples: (limit = 3) => pickDealSamples('', {}, limit)
};
