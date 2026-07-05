/**
 * Site knowledge cards — grounded claims from repo data (additive to /ask answers).
 * Catalog: data/greenways-site-knowledge/cards.json
 * Scenarios: data/savings-projection-scenarios.json (when card.scenarioId is set)
 */

const path = require('path');
const fs = require('fs');

const cardsPath = path.join(__dirname, '..', 'data', 'greenways-site-knowledge', 'cards.json');
const scenariosPath = path.join(__dirname, '..', 'data', 'savings-projection-scenarios.json');
const dealsFeedPath = path.join(__dirname, '..', 'data', 'deals-feed.json');
const schemesPath = path.join(__dirname, '..', 'schemes.json');
const sustCatalogPath = path.join(__dirname, '..', 'data', 'sustainable-products-catalog.json');

const { mergeModuleRow } = require('./greenways-content-modules');
const { toModuleItem } = require('./greenways-agent-shared');
const { AGENT_MODULE_THEME, exampleQueryString, blocksAlreadyShowExample } = require('./greenways-module-examples');

const SITE_EVIDENCE_MARKER = '**Site example:**';

let cardsCache = null;
let scenariosCache = null;
let dealsFeedCache = null;
let schemesCache = null;
let sustCatalogCache = null;

function loadCardsCatalog() {
  if (cardsCache) return cardsCache;
  try {
    cardsCache = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  } catch (_) {
    cardsCache = { cards: [] };
  }
  return cardsCache;
}

function loadScenariosCatalog() {
  if (scenariosCache) return scenariosCache;
  try {
    scenariosCache = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
  } catch (_) {
    scenariosCache = { scenarios: [] };
  }
  return scenariosCache;
}

function loadDealsFeedCatalog() {
  if (dealsFeedCache) return dealsFeedCache;
  try {
    dealsFeedCache = JSON.parse(fs.readFileSync(dealsFeedPath, 'utf8'));
  } catch (_) {
    dealsFeedCache = { deals: [], meta: {} };
  }
  return dealsFeedCache;
}

function loadSchemesCatalog() {
  if (schemesCache) return schemesCache;
  try {
    const raw = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
    schemesCache = Array.isArray(raw) ? raw : [];
  } catch (_) {
    schemesCache = [];
  }
  return schemesCache;
}

function loadSustProductsCatalog() {
  if (sustCatalogCache) return sustCatalogCache;
  try {
    const raw = JSON.parse(fs.readFileSync(sustCatalogPath, 'utf8'));
    sustCatalogCache = Array.isArray(raw.products) ? raw.products : [];
  } catch (_) {
    sustCatalogCache = [];
  }
  return sustCatalogCache;
}

function catalogProductMatchesLane(product, lane) {
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

function scenarioGrantEur(row = {}) {
  const grants = Array.isArray(row.grants) ? row.grants : [];
  return grants.reduce((sum, g) => sum + (Number(g.amountEur) || 0), 0);
}

function hydrateSchemeCard(card = {}, scheme = {}) {
  const desc = String(scheme.description || '').trim();
  return {
    ...card,
    title: card.title || scheme.title,
    evidence: {
      title: scheme.title || '',
      descriptionSnippet: desc.length > 120 ? `${desc.slice(0, 117)}…` : desc,
      region: scheme.region || '',
      type: scheme.type || '',
      schemeId: scheme.id || card.schemeId || '',
      deadline: scheme.deadline || ''
    }
  };
}

function hydrateCatalogStatsCard(card = {}) {
  const schemes = loadSchemesCatalog();
  let nlCount = 0;
  let ukCount = 0;
  for (const s of schemes) {
    const r = String(s.region || '').toLowerCase();
    if (r === 'nl') nlCount += 1;
    else if (r === 'uk') ukCount += 1;
  }
  return {
    ...card,
    evidence: {
      schemeCount: schemes.length,
      nlCount,
      ukCount
    }
  };
}

function hydrateSustCatalogLaneStatsCard(card = {}) {
  const products = loadSustProductsCatalog();
  let waterCount = 0;
  let electricityCount = 0;
  let gasCount = 0;
  for (const p of products) {
    if (catalogProductMatchesLane(p, 'water')) waterCount += 1;
    if (catalogProductMatchesLane(p, 'electricity')) electricityCount += 1;
    if (catalogProductMatchesLane(p, 'gas')) gasCount += 1;
  }
  return {
    ...card,
    evidence: {
      catalogCount: products.length,
      waterCount,
      electricityCount,
      gasCount
    }
  };
}

function hydrateCatalogProductCard(card = {}, product = {}) {
  const up = product.utilityProfile || {};
  const impact = product.impactFactors || {};
  const gasPct =
    impact.gasReductionPct != null && !Number.isNaN(Number(impact.gasReductionPct))
      ? Math.round(Number(impact.gasReductionPct) * 100)
      : null;
  const waterPct =
    impact.waterReductionPct != null && !Number.isNaN(Number(impact.waterReductionPct))
      ? Math.round(Number(impact.waterReductionPct) * 100)
      : null;
  const summary = String(product.summary || '').trim();
  return {
    ...card,
    title: card.title || product.name,
    evidence: {
      name: product.name || '',
      summarySnippet: summary.length > 100 ? `${summary.slice(0, 97)}…` : summary,
      dailyKwh: up.dailyKwh != null ? String(up.dailyKwh) : '',
      dailyWaterLitres: up.dailyWaterLitres != null ? String(up.dailyWaterLitres) : '',
      dailyGasKwh: up.dailyGasKwh != null ? String(up.dailyGasKwh) : '',
      gasReductionPct: gasPct != null ? `${gasPct}%` : '',
      waterReductionPct: waterPct != null ? `${waterPct}%` : '',
      catalogId: product.id || card.catalogId || ''
    }
  };
}

function hydrateDealCard(card = {}, deal = {}) {
  return {
    ...card,
    title: card.title || deal.title,
    evidence: {
      title: deal.title || '',
      line: deal.line || '',
      region: deal.region || '',
      category: deal.category || '',
      dealId: deal.id || card.dealId || ''
    }
  };
}

function hydrateCard(card = {}) {
  if (card.dealId) {
    const deal = (loadDealsFeedCatalog().deals || []).find((d) => d.id === card.dealId);
    if (deal) return hydrateDealCard(card, deal);
  }
  if (card.schemeId) {
    const scheme = loadSchemesCatalog().find((s) => s.id === card.schemeId);
    if (scheme) return hydrateSchemeCard(card, scheme);
  }
  if (card.catalogId) {
    const product = loadSustProductsCatalog().find((p) => p.id === card.catalogId);
    if (product) return hydrateCatalogProductCard(card, product);
  }
  if (card.useCatalogStats) return hydrateCatalogStatsCard(card);
  if (card.useSustCatalogLaneStats) return hydrateSustCatalogLaneStatsCard(card);
  if (!card.scenarioId) return { ...card };
  const row = (loadScenariosCatalog().scenarios || []).find((s) => s.id === card.scenarioId);
  if (!row) return { ...card };
  return {
    ...card,
    title: card.title || row.title,
    evidence: {
      title: row.title,
      baselineMonthlyEur: row.baselineMonthlyEur,
      proposedMonthlyEur: row.proposedMonthlyEur,
      capexEur: row.capexEur,
      grantEur: scenarioGrantEur(row),
      savingsNote: row.savingsNote || ''
    }
  };
}

function formatTemplate(template, evidence = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => {
    const val = evidence[key];
    return val == null ? '' : String(val);
  });
}

function formatCardProse(card = {}) {
  if (card.prose) return String(card.prose).trim();
  if (card.proseTemplate && card.evidence) {
    return formatTemplate(card.proseTemplate, card.evidence).trim();
  }
  if (card.claim) return String(card.claim).trim();
  return '';
}

function cardQueryString(card = {}) {
  if (card.query) return String(card.query).replace(/^\?/, '');
  const params = card.params || {};
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && String(v).trim() !== '') usp.set(k, String(v).trim());
  }
  return usp.toString();
}

function scoreCard(card, { agentKey, question, intentId, profile = {} }) {
  const key = String(agentKey || '').trim().toLowerCase();
  if (!(card.agents || []).includes(key)) return 0;

  let score = 0;
  const q = String(question || '').toLowerCase();

  if (intentId && (card.intentIds || []).includes(intentId)) score += 42;

  let keywordHits = 0;
  for (const token of card.keywords || []) {
    const t = String(token).toLowerCase();
    if (t.length >= 3 && q.includes(t)) {
      score += 7;
      keywordHits += 1;
    }
  }

  if (card.scenarioId && keywordHits > 0) score += 28;
  if (card.dealId && keywordHits > 0) score += 24;
  if (card.schemeId && keywordHits > 0) score += 24;
  if (card.catalogId && keywordHits > 0) score += 24;
  if (card.useCatalogStats && intentId === 'overview') score += 12;
  if (card.useSustCatalogLaneStats && (intentId === 'overview' || intentId === 'role_resources')) score += 14;
  if (intentId === 'product_grants' && card.id === 'evidence-product-grants-enrichment') score += 20;
  if (intentId === 'nl_hub' && card.id === 'evidence-nl-business-gov-hub') score += 20;
  if (intentId === 'deadlines' && card.id === 'evidence-grants-deadline-verify') score += 20;
  if (intentId === 'marketplace_explainer' && card.id === 'evidence-two-product-columns') score += 20;
  if (intentId === 'water_saving_guide' && card.id === 'evidence-water-guide-before-finder') score += 20;
  if (intentId === 'find_dishwasher' && card.id === 'evidence-water-efficient-dishwasher') score += 20;
  if (intentId === 'find_wok' && card.id === 'evidence-sust-wok-gas-retrofit') score += 20;
  if (intentId === 'find_fridge' && card.id === 'evidence-fridge-catalog-benchmark') score += 20;
  if (intentId === 'gas_lane' && card.id === 'evidence-sust-wok-gas-retrofit') score += 16;
  if (intentId === 'water_lane' && card.id === 'evidence-water-efficient-dishwasher') score += 16;
  if (intentId === 'electricity_lane' && card.id === 'evidence-fridge-catalog-benchmark') score += 16;

  if (card.dealId && card.evidence?.region) {
    const dealRegion = String(card.evidence.region).toUpperCase();
    const pr = String(profile.region || '').toUpperCase();
    if (pr && (dealRegion === pr || dealRegion === 'EU')) score += 10;
  }

  if (card.schemeId && card.evidence?.region) {
    const schemeRegion = String(card.evidence.region).toLowerCase();
    const pr = String(profile.region || '').toLowerCase();
    if (pr && (schemeRegion === pr || schemeRegion === 'eu')) score += 10;
  }

  const asksNl = /\b(nl|netherlands|dutch|amsterdam|hospitality|mia|vamil|business\.gov)\b/.test(q);
  const asksUk = /\b(uk|british|united kingdom|warm homes|england|scotland)\b/.test(q) || /\bgreen tariff\b/.test(q);
  const equipmentTokens = [
    'fridge',
    'refrigeration',
    'dishwasher',
    'dishwash',
    'wok',
    'freezer',
    'hvac',
    'ventilation',
    'cookline',
    'equipment',
    'appliance',
    'oven'
  ];
  const asksEquipment = equipmentTokens.some((t) => q.includes(t));
  if (asksNl && card.id === 'evidence-nl-restaurant-energy') score += 18;
  if (asksNl && (card.id === 'evidence-nl-business-gov-hub' || card.id === 'evidence-nl-mia-vamil')) score += 18;
  if (asksUk && card.id === 'evidence-uk-green-tariff') score += 18;
  if (asksUk && card.id === 'evidence-uk-warm-homes') score += 18;
  if (asksEquipment && card.id === 'evidence-nl-mia-vamil') score += 14;
  if (asksEquipment && card.id === 'evidence-fridge-catalog-benchmark') score += 12;
  if (/\b(wok|burner|cookline)\b/.test(q) && card.id === 'evidence-sust-wok-gas-retrofit') score += 16;
  if (/\b(dishwasher|warewash|aerator|water)\b/.test(q) && card.id === 'evidence-water-efficient-dishwasher') score += 14;
  if (/\b(fridge|refrigerat|cold storage)\b/.test(q) && card.id === 'evidence-fridge-catalog-benchmark') score += 14;

  if (asksEquipment && card.id === 'evidence-monitoring-before-capex') score -= 40;
  if (asksEquipment && card.scenarioId) score += 12;

  if (card.scenarioId && q.includes(String(card.scenarioId).replace(/-/g, ' '))) score += 10;
  if (card.scenarioId && q.includes(String(card.scenarioId).toLowerCase())) score += 10;

  const region = String(profile.region || '').trim();
  if (region && card.params?.region === region) score += 8;

  return score;
}

function rankCardsForKnowledge(agentKey, question, intentId, profile = {}, { limit = 2, minScore = 14 } = {}) {
  const catalog = loadCardsCatalog();
  return (catalog.cards || [])
    .map((raw) => hydrateCard(raw))
    .map((card) => ({ card, score: scoreCard(card, { agentKey, question, intentId, profile }) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.card);
}

function pickCardForKnowledge(agentKey, question, intentId, profile = {}) {
  const ranked = rankCardsForKnowledge(agentKey, question, intentId, profile, { limit: 1 });
  return ranked[0] || null;
}

function cardToModuleBlock(card, profile = {}, agentKey = '') {
  if (!card?.moduleId) return null;
  const theme = AGENT_MODULE_THEME[agentKey] || AGENT_MODULE_THEME.equipment;
  const query = cardQueryString(card);
  const row = mergeModuleRow({
    moduleId: card.moduleId,
    title: card.moduleTitle || card.title || 'Open illustration',
    description: card.moduleDescription || formatCardProse(card).slice(0, 180),
    usageHint: card.usageHint || 'Grounded Greenways example — numbers match our projection or guide data.',
    query,
    openSize: card.openSize || 'near-full'
  });
  return {
    type: 'module',
    items: [toModuleItem({ ...theme, ...row })]
  };
}

function insertBeforeAnswerTip(answer, insert) {
  if (!insert) return answer;
  const tipMatch = String(answer || '').match(/\n\n_([^_\n]+)_\s*$/);
  if (tipMatch && typeof tipMatch.index === 'number') {
    return answer.slice(0, tipMatch.index) + insert + answer.slice(tipMatch.index);
  }
  return `${answer}${insert}`;
}

/**
 * Append one grounded site evidence line (+ optional module tablet). Never removes existing copy.
 */
function attachSiteKnowledgeCards(result, { agentKey, question, intentId, profile = {} } = {}) {
  if (!result?.answer) return result;
  if (String(result.answer).includes(SITE_EVIDENCE_MARKER)) return result;

  const card = pickCardForKnowledge(agentKey, question, intentId, profile);
  if (!card) return result;

  const prose = formatCardProse(card);
  if (!prose) return result;

  const block = cardToModuleBlock(card, profile, agentKey);
  if (block && !blocksAlreadyShowExample(result.blocks, { query: cardQueryString(card), params: card.params })) {
    result.blocks = [...(result.blocks || []), block];
  }

  const line = `\n\n${SITE_EVIDENCE_MARKER} ${prose}`;
  result.answer = insertBeforeAnswerTip(result.answer, line);
  result.siteKnowledgeCardId = card.id;
  return result;
}

module.exports = {
  loadCardsCatalog,
  loadScenariosCatalog,
  loadDealsFeedCatalog,
  loadSchemesCatalog,
  loadSustProductsCatalog,
  hydrateCard,
  formatCardProse,
  scoreCard,
  rankCardsForKnowledge,
  pickCardForKnowledge,
  attachSiteKnowledgeCards,
  SITE_EVIDENCE_MARKER
};
