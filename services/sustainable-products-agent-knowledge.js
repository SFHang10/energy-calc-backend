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
  marketplaceHref,
  toLinkItem
} = require('./greenways-agent-shared');
const {
  applyPersona,
  loadAgentVoice,
  pickTip
} = require('./greenways-agent-persona');

const intentsPath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-showcase.json');
const catalogPath = path.join(__dirname, '..', 'data', 'sustainable-products-catalog.json');
const briefingPath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-briefing.json');
const voicePath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-voice.json');
const referencesPath = path.join(__dirname, '..', 'data', 'sustainable-products-agent-references.json');

const REGION_LABELS = { nl: 'Netherlands', uk: 'United Kingdom', eu: 'EU-wide' };

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

async function loadBriefing() {
  try {
    const raw = await fs.readFile(briefingPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

async function loadReferences() {
  try {
    const raw = await fs.readFile(referencesPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { internalGuides: [] };
  }
}

function buildHandoffs(briefing, question, intentId = '') {
  const out = [];
  const h = briefing?.handoffs || {};
  const q = String(question || '').trim();
  const push = (key, defaultPrompt) => {
    const row = h[key];
    if (!row) return;
    out.push({
      id: row.agentId,
      name: row.agentName,
      href: row.agentPath,
      prompt: q || defaultPrompt
    });
  };

  if (intentId === 'product_deal_spotlights') {
    push('dealsToZara', 'What product deal spotlights are live this week?');
  }
  if (
    ['find_fridge', 'find_combi', 'find_wok', 'find_fryer', 'electricity_lane', 'gas_lane', 'product_search'].includes(
      intentId
    )
  ) {
    push('equipmentToArtemis', 'Explain ETL lifecycle cost for this equipment upgrade');
    if (!['water_lane', 'find_dishwasher'].includes(intentId)) {
      push('grantsToAndrieus', 'What grants apply to these marketplace products in my region?');
    }
  }
  if (['water_lane', 'find_dishwasher'].includes(intentId)) {
    push('grantsToAndrieus', 'What water-saving grants apply in my region?');
  }
  if (['overview', 'role_resources', 'marketplace_explainer', 'portals'].includes(intentId)) {
    push('dealsToZara', 'What weekly product deal spotlights are in the deals feed?');
  }
  if (intentId === 'product_deal_spotlights' || intentId === 'overview') {
    push('financeToVincent', 'How does payback work after I pick efficient products?');
  }
  if (intentId === 'product_grants') {
    push('grantsToAndrieus', 'What grants apply to these marketplace products in my region?');
  }
  if (intentId === 'eco_journey') {
    push('equipmentToArtemis', 'What equipment upgrades fit my restaurant eco plan?');
    push('grantsToAndrieus', 'What grants support my eco project in my region?');
  }
  if (intentId === 'recycling') {
    push('equipmentToArtemis', 'How do I spec replacement equipment after trade-in?');
  }
  if (!out.length) {
    push('equipmentToArtemis', 'How does ETL equipment compare for my kitchen upgrade?');
    push('dealsToZara', 'Are there weekly deal spotlights for efficient products?');
  }
  const seen = new Set();
  return out.filter((row) => {
    const key = row.id || row.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
}

function rankReferences(refs, question, limit = 6) {
  const q = String(question || '').toLowerCase();
  const pool = [...(refs.external || []), ...(refs.internalGuides || [])];
  if (!q.trim()) return pool.slice(0, limit);
  const scored = pool.map((ref) => {
    const hay = [ref.title, ref.summary, ...(ref.topics || [])].join(' ').toLowerCase();
    let score = 0;
    q.split(/\s+/).filter((t) => t.length >= 3).forEach((token) => {
      if (hay.includes(token)) score += 3;
    });
    if (/water|dishwasher|aerator/.test(q) && /water/.test(hay)) score += 4;
    if (/fridge|refrig|etl|electric/.test(q) && /electric|etl|refrig/.test(hay)) score += 4;
    if (/wok|fryer|gas/.test(q) && /gas/.test(hay)) score += 4;
    if (/deal|spotlight/.test(q) && /deal/.test(hay)) score += 4;
    if (/recycl|circular|trade/.test(q) && /recycl|circular/.test(hay)) score += 5;
    if (/journey|planner|eco|start/.test(q) && /journey|planner|eco/.test(hay)) score += 5;
    if (/citizen|benefit|co2|climate/.test(q) && /citizen|benefit/.test(hay)) score += 4;
    if (/news|headline|latest/.test(q) && /news/.test(hay)) score += 5;
    if (/transition|impact|field/.test(q) && /transition|impact/.test(hay)) score += 4;
    if (/european|building|case/.test(q) && /european|building|case/.test(hay)) score += 4;
    if (/credential|etl|deep/.test(q) && /credential|etl|deep/.test(hay)) score += 4;
    return { ref, score };
  });
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.ref)
    .slice(0, limit);
}

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

function buildProductDealSpotlightsAnswer(tip, briefing) {
  return {
    answer:
      `**Product deal spotlights** are curated rows in the deals feed (weekly offers, limited-time product links) — not the same as searching this catalog.\n\n` +
      `→ **Deals Agent (Zara):** ${PORTAL_LINKS.dealsAgent}\n` +
      `→ **Full Deals page:** ${PORTAL_LINKS.dealsFullPage}\n` +
      `→ **Sustainability lane ticker:** ${PORTAL_LINKS.deals}\n\n` +
      `Stay on **Zyanne** when you want to **find and compare** efficient products (water / electricity / gas lanes, \`etl_*\` vs \`sust_*\`).\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing || {}, '', 'product_deal_spotlights')
  };
}

async function buildRoleResourcesAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const refs = await loadReferences();
  const ranked = rankReferences(refs, question, 8);
  const picks = ranked.length
    ? ranked
    : [...(refs.external || []).slice(0, 2), ...(refs.internalGuides || []).slice(0, 5)];
  const mustKnows = (briefing.mustKnows || []).slice(0, 5);
  const core = (briefing.coreUnderstandings || []).slice(0, 4);
  const region = profile.region ? REGION_LABELS[profile.region] || profile.region : 'your region';

  return {
    answer:
      `**Zyanne — sustainable products specialist** (${region})\n\n` +
      `${briefing.roleProfile || briefing.roleSummary || ''}\n\n` +
      `**Must-know themes:**\n${mustKnows.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**How I advise:**\n${core.map((c) => `- ${c}`).join('\n')}\n\n` +
      `**Curated links:**\n${picks.map((r) => `- **${r.title}** — ${r.summary || ''}`).join('\n')}\n\n_${tip}_`,
    blocks: [
      {
        type: 'link',
        items: picks.slice(0, 6).map((r) => toLinkItem(r.title, r.url || r.href, r.summary || ''))
      }
    ],
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, question, 'role_resources')
  };
}

async function buildOverviewAnswer(catalog, tip, briefing) {
  const rows = catalog.products || [];
  const water = rows.filter((p) => catalogMatchesLane(p, 'water')).length;
  const elec = rows.filter((p) => catalogMatchesLane(p, 'electricity')).length;
  const gas = rows.filter((p) => catalogMatchesLane(p, 'gas')).length;
  const b = briefing || (await loadBriefing());
  const paths = b.guidePaths || {};
  const journey = b.journeyPrinciple || '';
  return {
    answer:
      `**Zyanne — sustainable products specialist**\n\n` +
      `${b.roleSummary || ''}\n\n` +
      `**Three utility lanes:**\n` +
      `- ${LANE_LABELS.water} — ${water} \`sust_*\` catalog rows + marketplace dishwashers & aerators\n` +
      `- ${LANE_LABELS.electricity} — ${elec} rows + ETL refrigeration & cooking\n` +
      `- ${LANE_LABELS.gas} — ${gas} rows + wok, fryer & cooking retrofits\n\n` +
      `${journey ? `**Journey:** ${journey}\n\n` : ''}` +
      `Chat shows **On Greenways** showcase picks + **Market alternative** catalog rows. ` +
      `I explain **how** products help — not only links. Open finders for full marketplace search.\n\n` +
      `**Toolbox:** eco planner ${paths.ecoProjectPlanning || PORTAL_LINKS.ecoProjectPlanning} · ` +
      `case studies ${paths.europeanBuildings || './sustainable_european_buildings_eco_materials.html'} · ` +
      `recycling ${paths.recycling || '../HTMLs/Recycling.html'}\n\n` +
      `**Deal spotlights:** **Zara** (${PORTAL_LINKS.dealsAgent}) — I search the full catalog here.\n\n` +
      `**Full finders:**\n` +
      `- ${FINDER_LINKS.water}\n` +
      `- ${FINDER_LINKS.products}\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(b, '', 'overview')
  };
}

function guideLinkBlock(title, href, narrative, tip) {
  return {
    answer:
      `**${title}**\n\n` +
      `${narrative}\n\n` +
      `→ **Open guide:** ${href}\n\n_${tip}_`,
    suggestions: [],
    blocks: [{ type: 'link', items: [toLinkItem(title, href, narrative)] }]
  };
}

async function buildEcoJourneyAnswer(profile, tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.ecoProjectPlanning || PORTAL_LINKS.ecoProjectPlanning;
  const narrative = briefing.guideNarratives?.ecoJourney || '';
  const region = profile.region ? REGION_LABELS[profile.region] || profile.region : 'your region';
  const sector = String(profile.sector || 'restaurant').toLowerCase();
  const site =
    sector === 'restaurant' || sector === 'hospitality'
      ? 'Restaurant'
      : /home|domestic/.test(sector)
        ? 'Home'
        : 'Office / SME';
  return {
    answer:
      `**Eco project journey** (${site} · ${region})\n\n` +
      `${narrative}\n\n` +
      `**Practical path:**\n` +
      `1. Set your region and site type (Home · Restaurant · Office)\n` +
      `2. Pick a utility lane — water, electricity, or gas\n` +
      `3. Shortlist efficient products here; open finders for full compare\n` +
      `4. Stack grants via **Andrieus** and deals via **Zara** when timing matters\n\n` +
      `→ **Eco project planner:** ${href}\n\n_${tip}_`,
    suggestions: [],
    blocks: [{ type: 'link', items: [toLinkItem('Eco project planning guide', href, narrative)] }],
    agentHandoffs: buildHandoffs(briefing, '', 'eco_journey')
  };
}

async function buildCitizenBenefitsAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.citizenBenefits || '../HTMLs/Citizen%20benefits%20Guide%202%20brown.html';
  const narrative = briefing.guideNarratives?.citizenBenefits || '';
  return guideLinkBlock('Citizen benefits of sustainability', href, narrative, tip);
}

async function buildRecyclingAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.recycling || '../HTMLs/Recycling.html';
  const narrative =
    briefing.guideNarratives?.recycling ||
    'Recycling old equipment improves your sustainability profile and can return value through trade-in or collection paths.';
  const out = guideLinkBlock('Recycling & circular economy', href, narrative, tip);
  out.agentHandoffs = buildHandoffs(briefing, '', 'recycling');
  return out;
}

async function buildProductTransitionAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.productTransition || '../HTMLs/Product%20Transition.html';
  const narrative = briefing.guideNarratives?.productTransition || '';
  return guideLinkBlock('Product transition & field impact', href, narrative, tip);
}

async function buildLowEnergyExamplesAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.lowEnergyExamples || '../HTMLs/low-energy-equipment-savings.html';
  const narrative = briefing.guideNarratives?.lowEnergyExamples || '';
  return guideLinkBlock('Low-energy equipment examples', href, narrative, tip);
}

async function buildEuropeanBuildingsAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.europeanBuildings || './sustainable_european_buildings_eco_materials.html';
  const narrative = briefing.guideNarratives?.europeanBuildings || '';
  return guideLinkBlock('European buildings & eco materials', href, narrative, tip);
}

async function buildProductCredentialsAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const legacy = paths.productDeepDiveLegacy || '../HTMLs/Product%20Deep%20Dive.html';
  const live = FINDER_LINKS.deepDive;
  const narrative = briefing.guideNarratives?.productCredentials || '';
  return {
    answer:
      `**Product credentials & ETL deep dive**\n\n` +
      `${narrative}\n\n` +
      `**Live compare (Greenways):** ${live}\n` +
      `**Credentials guide:** ${legacy}\n\n` +
      `Verified \`etl_*\` rows carry scheme overlays — **Andrieus** confirms grant fit in your region.\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Restaurant equipment deep dive', live, 'Side-by-side alternatives with grants'),
          toLinkItem('Product Deep Dive guide', legacy, 'ETL credentials framing')
        ]
      }
    ],
    agentHandoffs: buildHandoffs(briefing, '', 'product_credentials')
  };
}

async function buildSustainabilityNewsAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.guidePaths || {};
  const href = paths.sustainabilityNews || '../content-ops/drafts/sustainability-news/2026-04-sustainability-news.html';
  const narrative = briefing.guideNarratives?.sustainabilityNews || '';
  return guideLinkBlock('Sustainability news', href, narrative, tip);
}

async function buildProductGrantsAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const note =
    briefing.productGrantsNote ||
    'Scheme detail lives with Andrieus — I flag products while we keep searching here.';
  const region = profile.region ? REGION_LABELS[profile.region] || profile.region : 'your region';
  return {
    answer:
      `**Grants on marketplace products** (${region})\n\n` +
      `${note}\n\n` +
      `**On Greenways** \`etl_*\` rows include grants overlay when enriched from \`schemes.json\`. ` +
      `Ask with a product name or lane — I shortlist kit here and open **Andrieus** with your product context.\n\n` +
      `→ **Grants Agent:** ${PORTAL_LINKS.grantsAgent}\n` +
      `→ **Deep dive compare:** ${FINDER_LINKS.deepDive}\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, question, 'product_grants')
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
  const voice = await loadAgentVoice(voicePath);
  const briefing = await loadBriefing();
  const [catalog, showcase] = await Promise.all([loadCatalog(), loadShowcase()]);
  const intent = matchIntent(question, intents);
  const tip = pickTip(intents.staticTips, intent?.id, { skipIntentIds: voice.skipTipIntents });

  let result;
  if (intent) {
    switch (intent.answerType) {
      case 'overview':
        result = await buildOverviewAnswer(catalog, tip, briefing);
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
        result = buildProductDealSpotlightsAnswer(tip, briefing);
        break;
      case 'role_resources':
        result = await buildRoleResourcesAnswer(question, profile, tip);
        break;
      case 'eco_journey':
        result = await buildEcoJourneyAnswer(profile, tip);
        break;
      case 'citizen_benefits':
        result = await buildCitizenBenefitsAnswer(tip);
        break;
      case 'recycling':
        result = await buildRecyclingAnswer(tip);
        break;
      case 'product_transition':
        result = await buildProductTransitionAnswer(tip);
        break;
      case 'low_energy_examples':
        result = await buildLowEnergyExamplesAnswer(tip);
        break;
      case 'european_buildings':
        result = await buildEuropeanBuildingsAnswer(tip);
        break;
      case 'product_credentials':
        result = await buildProductCredentialsAnswer(tip);
        break;
      case 'sustainability_news':
        result = await buildSustainabilityNewsAnswer(tip);
        break;
      case 'product_grants':
        result = await buildProductGrantsAnswer(question, profile, tip);
        break;
      default:
        result = null;
    }
  }

  if (!result) {
    result = await buildFallbackSearchAnswer(question, profile, catalog, showcase, tip);
  }

  if (result?.answer) {
    const lane = intent?.lane || result.lane || detectLane(question, profile);
    const profileWithLane = { ...profile, lane, searchType: intent?.searchType };
    const intentId = result.intentId || intent?.id || null;
    result.source = result.source || 'knowledge';
    result.intentId = intentId;
    result.lane = lane;
    if (!result.agentHandoffs?.length) {
      result.agentHandoffs = buildHandoffs(briefing, question, intentId || 'product_search');
    }
    result.productSamples = await pickProductSamples(question, profileWithLane, 3);
    applyPersona(result, {
      voice,
      intentId: intentId || 'overview',
      question,
      profile,
      staticTips: intents.staticTips,
      regionLabels: REGION_LABELS,
      tip
    });
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickProductSamples,
  pickShowcaseSamplesOnly,
  loadBriefing,
  loadReferences,
  getDefaultProductSamples: (limit = 3, lane = 'electricity') =>
    pickShowcaseSamplesOnly({ lane: lane || 'electricity' }, limit),
  detectLane,
  FINDER_LINKS
};
