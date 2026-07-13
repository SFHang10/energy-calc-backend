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
const mediaBriefPath = path.join(__dirname, '..', 'data', 'media-daily-brief.json');
const companiesPath = path.join(__dirname, '..', 'data', 'companies.json');
const orgsInlinePath = path.join(__dirname, '..', 'data', 'orgs-directory-inline.js');
const dashboardMathPath = path.join(__dirname, '..', 'data', 'systems-agent-dashboard-math.json');
const monitoringGuidePath = path.join(__dirname, '..', 'data', 'systems-agent-monitoring-guide.json');
const systemsChecksPath = path.join(__dirname, '..', 'data', 'systems-agent-checks.json');
const newsKbPath = path.join(__dirname, '..', 'data', 'news-category-knowledge.json');

const { mergeModuleRow } = require('./greenways-content-modules');
const { toModuleItem } = require('./greenways-agent-shared');
const { AGENT_MODULE_THEME, exampleQueryString, blocksAlreadyShowExample, blocksAlreadyShowModule } = require('./greenways-module-examples');

const SITE_EVIDENCE_MARKER = '**Site example:**';

let cardsCache = null;
let scenariosCache = null;
let dealsFeedCache = null;
let schemesCache = null;
let sustCatalogCache = null;
let mediaBriefCache = null;
let mapStatsCache = null;
let dashboardMathCache = null;
let monitoringGuideCache = null;
let systemsChecksCache = null;

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

function loadMediaDailyBrief() {
  if (mediaBriefCache) return mediaBriefCache;
  try {
    mediaBriefCache = JSON.parse(fs.readFileSync(mediaBriefPath, 'utf8'));
  } catch (_) {
    mediaBriefCache = { meta: {}, stories: [], techStories: [] };
  }
  return mediaBriefCache;
}

function loadMapStats() {
  if (mapStatsCache) return mapStatsCache;
  let caseStudyCount = 0;
  let directoryCount = 0;
  try {
    const parsed = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
    const companies = Array.isArray(parsed) ? parsed : parsed.items || [];
    caseStudyCount = companies.length;
  } catch (_) {
    caseStudyCount = 0;
  }
  try {
    const raw = fs.readFileSync(orgsInlinePath, 'utf8');
    const match = raw.match(/ORGS_DIRECTORY_INLINE=(\[[\s\S]*\]);/);
    directoryCount = match ? JSON.parse(match[1]).length : 0;
  } catch (_) {
    directoryCount = 0;
  }
  mapStatsCache = { caseStudyCount, directoryCount };
  return mapStatsCache;
}

function findBriefStory(brief = {}, keyword = '') {
  const stories = brief.stories || [];
  const kw = String(keyword || '').trim().toLowerCase();
  if (kw) {
    const hit = stories.find((s) => String(s.title || '').toLowerCase().includes(kw));
    if (hit) return hit;
  }
  return stories[0] || null;
}

function findTechBriefStory(brief = {}, keyword = '') {
  const stories = brief.techStories || [];
  const kw = String(keyword || '').trim().toLowerCase();
  if (kw) {
    const hit = stories.find((s) => String(s.title || '').toLowerCase().includes(kw));
    if (hit) return hit;
  }
  return stories[0] || null;
}

function hydrateDailyBriefEditionCard(card = {}) {
  const brief = loadMediaDailyBrief();
  const meta = brief.meta || {};
  const lead = findBriefStory(brief, card.newsStoryKeyword);
  return {
    ...card,
    evidence: {
      edition: meta.edition || '',
      editionTitle: meta.editionTitle || '',
      storyCount: meta.storyCount || (brief.stories || []).length,
      catalogItems: meta.catalogItems || '',
      leadStoryTitle: lead?.title || '',
      leadStorySummary: String(lead?.summary || '').slice(0, 140)
    }
  };
}

function hydrateTechEditionCard(card = {}) {
  const brief = loadMediaDailyBrief();
  const tech = brief.meta?.tech || {};
  const lead = findTechBriefStory(brief, card.newsStoryKeyword);
  return {
    ...card,
    evidence: {
      edition: tech.edition || '',
      editionTitle: tech.title || '',
      storyCount: tech.storyCount || (brief.techStories || []).length,
      leadStoryTitle: lead?.title || '',
      leadStorySummary: String(lead?.summary || '').slice(0, 140)
    }
  };
}

function hydrateMapStatsCard(card = {}) {
  const stats = loadMapStats();
  return {
    ...card,
    evidence: {
      caseStudyCount: stats.caseStudyCount,
      directoryCount: stats.directoryCount
    }
  };
}

function loadDashboardMath() {
  if (dashboardMathCache) return dashboardMathCache;
  try {
    dashboardMathCache = JSON.parse(fs.readFileSync(dashboardMathPath, 'utf8'));
  } catch (_) {
    dashboardMathCache = { tariffs: {}, formulas: [] };
  }
  return dashboardMathCache;
}

function loadMonitoringGuide() {
  if (monitoringGuideCache) return monitoringGuideCache;
  try {
    monitoringGuideCache = JSON.parse(fs.readFileSync(monitoringGuidePath, 'utf8'));
  } catch (_) {
    monitoringGuideCache = { siteProfiles: {}, sensorTypes: [] };
  }
  return monitoringGuideCache;
}

function loadSystemsChecksConfig() {
  if (systemsChecksCache) return systemsChecksCache;
  try {
    systemsChecksCache = JSON.parse(fs.readFileSync(systemsChecksPath, 'utf8'));
  } catch (_) {
    systemsChecksCache = { checks: [] };
  }
  return systemsChecksCache;
}

function hydrateDashboardTariffCard(card = {}) {
  const math = loadDashboardMath();
  const t = math.tariffs || {};
  const example = (math.formulas || []).find((f) => f.id === 'monthly-electricity-cost');
  return {
    ...card,
    evidence: {
      tariffSummary: t.summary || '',
      electricityEurPerKwh: t.electricityEurPerKwh,
      formulaExample: example?.example || ''
    }
  };
}

function hydrateRestaurantSensorCard(card = {}) {
  const guide = loadMonitoringGuide();
  const rest = guide.siteProfiles?.restaurant || {};
  const sensors = rest.prioritySensors || [];
  return {
    ...card,
    evidence: {
      priorityCount: sensors.length,
      topSensor: sensors[0] || '',
      exampleSites: rest.exampleSites || ''
    }
  };
}

function hydrateSystemsOpsCard(card = {}) {
  const cfg = loadSystemsChecksConfig();
  return {
    ...card,
    evidence: {
      checkCount: (cfg.checks || []).length
    }
  };
}

function hydrateNewsKbStatsCard(card = {}) {
  const brief = loadMediaDailyBrief();
  let storyCount = 0;
  let updatedAt = '';
  try {
    const kb = JSON.parse(fs.readFileSync(newsKbPath, 'utf8'));
    updatedAt = kb.updatedAt || '';
    for (const rows of Object.values(kb.categories || {})) {
      if (Array.isArray(rows)) storyCount += rows.length;
    }
  } catch (_) {
    storyCount = 0;
  }
  return {
    ...card,
    evidence: {
      storyCount,
      updatedAt,
      latestEdition: brief.meta?.edition || '',
      editionTitle: brief.meta?.editionTitle || ''
    }
  };
}

function hydrateDealsFeedStatsCard(card = {}) {
  const feed = loadDealsFeedCatalog();
  const generatedAt = feed.meta?.generatedAt ? String(feed.meta.generatedAt).slice(0, 10) : '';
  return {
    ...card,
    evidence: {
      dealCount: Array.isArray(feed.deals) ? feed.deals.length : 0,
      generatedAt
    }
  };
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
  if (card.useDailyBriefEdition) return hydrateDailyBriefEditionCard(card);
  if (card.useTechEditionStats) return hydrateTechEditionCard(card);
  if (card.useMapCatalogStats) return hydrateMapStatsCard(card);
  if (card.useDashboardTariffs) return hydrateDashboardTariffCard(card);
  if (card.useRestaurantSensorProfile) return hydrateRestaurantSensorCard(card);
  if (card.useSystemsOpsChecks) return hydrateSystemsOpsCard(card);
  if (card.useNewsKbStats) return hydrateNewsKbStatsCard(card);
  if (card.useDealsFeedStats) return hydrateDealsFeedStatsCard(card);
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

function formatAsOfDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    // Handle YYYY-MM-DD style strings
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const parts = raw.split('-').map(Number);
      const dd = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!Number.isNaN(dd.getTime())) {
        return dd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    return raw;
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function appendFreshness(prose, evidence = {}) {
  const body = String(prose || '').trim();
  if (!body) return body;
  const already = /\bas of\b/i.test(body);
  if (already) return body;
  const generatedAt = evidence.generatedAt || evidence.generated || '';
  const updatedAt = evidence.updatedAt || evidence.updated || '';
  const when = formatAsOfDate(generatedAt || updatedAt);
  if (!when) return body;
  return `${body} _(as of ${when})_`;
}

function formatCardProse(card = {}) {
  if (card.prose) return appendFreshness(String(card.prose).trim(), card.evidence || {});
  if (card.proseTemplate && card.evidence) {
    return appendFreshness(formatTemplate(card.proseTemplate, card.evidence).trim(), card.evidence || {});
  }
  if (card.claim) return appendFreshness(String(card.claim).trim(), card.evidence || {});
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
  if (card.useDailyBriefEdition && (intentId === 'monthly_news' || intentId === 'daily_brief')) score += 18;
  if (card.useTechEditionStats && intentId === 'tech_news') score += 20;
  if (card.useMapCatalogStats && (intentId === 'sustainability_map' || intentId === 'sustainability_map_explained')) score += 20;
  if (intentId === 'policy_news' && card.id === 'evidence-cbam-declaration-runway') score += 18;
  if (intentId === 'policy_news' && card.id === 'evidence-energy-omnibus-xii') score += 18;
  if (intentId === 'daily_brief' && card.id === 'evidence-daily-brief-headlines') score += 20;
  if (intentId === 'monthly_news' && card.id === 'evidence-latest-sustainability-edition') score += 20;
  if (intentId === 'tech_news' && card.id === 'evidence-tech-omnibus-eprel') score += 20;
  if (intentId === 'role_resources' && card.id === 'evidence-cheryce-news-curation') score += 18;
  if (card.useDashboardTariffs && (intentId === 'dashboard_math' || intentId === 'greenways_dashboard')) score += 20;
  if (card.useRestaurantSensorProfile && intentId === 'sensors_restaurant') score += 20;
  if (card.useSystemsOpsChecks && (intentId === 'health_overview' || intentId === 'sync_help')) score += 20;
  if (card.useNewsKbStats && intentId === 'news_status') score += 20;
  if (card.useDealsFeedStats && intentId === 'deals_status') score += 20;
  if (intentId === 'monitoring_why' && card.id === 'evidence-edwardo-measure-first') score += 22;
  if (intentId === 'deep_dive_systems' && card.id === 'evidence-systems-deep-dive-view') score += 18;
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

  const asksOmnibus = /\b(omnibus|eprel|labelling|labeling)\b/.test(q);
  const asksCbam = /\b(cbam|carbon border|embedded emissions)\b/.test(q);
  const asksTechNews = /\b(tech news|green tech|innovation|qr registry|product registry)\b/.test(q);
  const asksMap = /\b(sustainability map|case stud|company map|payback example)\b/.test(q);
  if (asksOmnibus && (card.id === 'evidence-energy-omnibus-xii' || card.id === 'evidence-tech-omnibus-eprel')) score += 16;
  if (asksCbam && card.id === 'evidence-cbam-declaration-runway') score += 16;
  if (asksTechNews && card.id === 'evidence-tech-omnibus-eprel') score += 14;
  if (asksMap && card.id === 'evidence-sustainability-map-catalogue') score += 16;

  const asksMonitoring = /\b(monitor|sensor|submeter|sub-meter|baseline|m&v|dashboard math|cost formula)\b/.test(q);
  const asksRestaurantSensor = /\b(restaurant|kitchen|cookline|cold room|hospitality|wok)\b/.test(q);
  const asksOps = /\b(health|verify|sync|status|ops|platform health)\b/.test(q);
  if (asksMonitoring && card.id === 'evidence-edwardo-measure-first') score += 16;
  if (asksMonitoring && card.id === 'evidence-dashboard-tariff-model') score += 14;
  if (asksRestaurantSensor && card.id === 'evidence-restaurant-sensor-priority') score += 16;
  if (asksOps && card.id === 'evidence-edwardo-verify-readonly') score += 16;
  if (asksEquipment && card.id === 'evidence-edwardo-measure-first') score += 12;

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
  if (intentId === 'marketplace_explainer') return result;

  const card = pickCardForKnowledge(agentKey, question, intentId, profile);
  if (!card) return result;

  const prose = formatCardProse(card);
  if (!prose) return result;

  const block = cardToModuleBlock(card, profile, agentKey);
  if (
    block &&
    !blocksAlreadyShowExample(result.blocks, { query: cardQueryString(card), params: card.params }) &&
    !blocksAlreadyShowModule(result.blocks, card.moduleId)
  ) {
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
