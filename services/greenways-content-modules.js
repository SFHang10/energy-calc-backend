/**
 * Greenways content module registry — shared HTML/video illustrations for agents.
 * Client opens modules via greenways-agent-content-module.js (modal iframe).
 */

const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

const registryPath = path.join(__dirname, '..', 'data', 'greenways-content-modules.json');
const ROOT = path.join(__dirname, '..');
const DEALS_FEED_PATH = path.join(ROOT, 'data', 'deals-feed.json');
const SCHEMES_PATH = path.join(ROOT, 'schemes.json');

/** Client-facing ids that map to a canonical registry row */
const MODULE_ID_ALIASES = {
  'energy-ticker': 'energy-prices-ticker'
};

let registryCache = null;
let moduleAsOfCache = null;

function resolveModuleId(moduleId) {
  const id = String(moduleId || '').trim();
  return MODULE_ID_ALIASES[id] || id;
}

function loadRegistrySync() {
  if (registryCache) return registryCache;
  try {
    registryCache = JSON.parse(fsSync.readFileSync(registryPath, 'utf8'));
  } catch (_) {
    registryCache = { modules: [] };
  }
  return registryCache;
}

async function loadContentModules() {
  if (registryCache) return registryCache;
  try {
    const raw = await fs.readFile(registryPath, 'utf8');
    registryCache = JSON.parse(raw);
  } catch (_) {
    registryCache = { modules: [] };
  }
  return registryCache;
}

function getModuleById(registry, moduleId) {
  const id = resolveModuleId(moduleId);
  return (registry.modules || []).find((m) => m.id === id) || null;
}

function extractIsoFromJsonHead(filePath, keys = []) {
  try {
    if (!fsSync.existsSync(filePath)) return '';
    const fd = fsSync.openSync(filePath, 'r');
    try {
      const buf = Buffer.alloc(16000);
      const n = fsSync.readSync(fd, buf, 0, buf.length, 0);
      const head = buf.slice(0, n).toString('utf8');
      for (const key of keys) {
        const re = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`);
        const m = head.match(re);
        if (m && m[1]) return m[1];
      }
      return '';
    } finally {
      fsSync.closeSync(fd);
    }
  } catch (_) {
    return '';
  }
}

function formatAsOf(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function moduleAsOfMap() {
  if (moduleAsOfCache) return moduleAsOfCache;
  const dealsAsOf = extractIsoFromJsonHead(DEALS_FEED_PATH, ['generatedAt']) || '';
  const schemesAsOf = extractIsoFromJsonHead(SCHEMES_PATH, ['updatedAt', 'generatedAt']) || '';
  moduleAsOfCache = {
    dealsAsOf,
    schemesAsOf
  };
  return moduleAsOfCache;
}

function asOfSuffixForModuleId(moduleId) {
  const id = resolveModuleId(moduleId);
  const { dealsAsOf, schemesAsOf } = moduleAsOfMap();

  // Deals feed-backed pages.
  if (['deals-ticker', 'deals-full-page', 'deals-ticker-hub'].includes(id)) {
    const when = formatAsOf(dealsAsOf);
    return when ? `Data as of ${when}` : '';
  }

  // Schemes catalogue-backed portals.
  if (['schemes-portal-restaurant', 'schemes-portal-eu'].includes(id)) {
    const when = formatAsOf(schemesAsOf);
    return when ? `Schemes as of ${when}` : '';
  }

  return '';
}

function appendAsOfHint(usageHint, moduleId) {
  const base = String(usageHint || '').trim();
  const suffix = asOfSuffixForModuleId(moduleId);
  if (!suffix) return base;
  if (base.toLowerCase().includes('as of') || base.toLowerCase().includes('data as of')) return base;
  return base ? `${base} · ${suffix}` : suffix;
}

/**
 * Merge agent row overrides with registry copy (description + usageHint) and defaults.
 * @param {object} row — moduleId, optional title, portalPath/href, query, openSize
 */
function mergeModuleRow(row = {}) {
  const registry = loadRegistrySync();
  const mod = getModuleById(registry, row.moduleId);
  const requestedId = String(row.moduleId || mod?.id || '').trim();
  const moduleId = requestedId || mod?.id || 'portal';
  const merged = {
    ...row,
    moduleId,
    title: row.title || mod?.title || 'Greenways tool',
    description: row.description || mod?.description || '',
    usageHint: row.usageHint || mod?.usageHint || '',
    portalPath: row.portalPath || row.href || mod?.href || '',
    fullPageHref:
      row.fullPageHref ||
      (mod?.href ? fullPageHref(resolveModuleWebHref(mod.href)) : mod?.fullPageHref || ''),
    liveSiteHref:
      row.liveSiteHref ||
      (/greenwaysmarket\.com/i.test(String(mod?.fullPageHref || '')) ? mod.fullPageHref : ''),
    openSize: row.openSize || mod?.defaultOpenSize || ''
  };
  merged.usageHint = appendAsOfHint(merged.usageHint, moduleId);
  return merged;
}

function modulesForAgent(registry, agentKey) {
  const key = String(agentKey || '').trim().toLowerCase();
  if (!key) return registry.modules || [];
  return (registry.modules || []).filter((m) => (m.agents || []).includes(key));
}

function resolveModuleWebHref(href) {
  const rel = String(href || '').trim();
  if (!rel || /^https?:\/\//i.test(rel) || rel.startsWith('/')) return rel;
  const qIndex = rel.indexOf('?');
  const pathPart = qIndex >= 0 ? rel.slice(0, qIndex) : rel;
  const query = qIndex >= 0 ? rel.slice(qIndex) : '';
  if (pathPart.startsWith('./')) {
    return `/HTMLS%20GWM%20GWB/${pathPart.slice(2)}${query}`;
  }
  if (pathPart.startsWith('../HTMLs/')) {
    return `/HTMLs/${pathPart.slice('../HTMLs/'.length)}${query}`;
  }
  if (pathPart.startsWith('../content-ops/')) {
    return `/content-ops/${pathPart.slice('../content-ops/'.length)}${query}`;
  }
  return rel;
}

function profileCountryFromRegion(region) {
  const r = String(region || '').toLowerCase();
  if (!r) return '';
  if (r.startsWith('uk') || r.includes('united kingdom')) return 'uk';
  if (r.includes('netherlands') || r === 'nl') return 'nl';
  if (r.includes('spain') || r === 'es') return 'es';
  if (r.includes('portugal') || r === 'pt') return 'pt';
  if (r === 'eu' || r.includes('europe')) return 'nl';
  return '';
}

function appendEmbedParams(href, profile = {}, module = {}) {
  const rel = resolveModuleWebHref(String(href || '').trim());
  if (!rel) return rel;
  const hashIndex = rel.indexOf('#');
  const hash = hashIndex >= 0 ? rel.slice(hashIndex) : '';
  const base = hashIndex >= 0 ? rel.slice(0, hashIndex) : rel;
  const qIndex = base.indexOf('?');
  const pathPart = qIndex >= 0 ? base.slice(0, qIndex) : base;
  const params = new URLSearchParams(qIndex >= 0 ? base.slice(qIndex + 1) : '');
  if (!params.has('embed')) params.set('embed', '1');
  if (!params.has('popup')) params.set('popup', '1');
  const region = String(profile.region || '').trim();
  const sector = String(profile.sector || '').trim();
  if (region && (module.supportsParams || []).includes('region') && !params.has('region')) {
    params.set('region', region);
  }
  if ((module.supportsParams || []).includes('country') && !params.has('country')) {
    const country = profileCountryFromRegion(region);
    if (country) params.set('country', country);
  }
  if (sector && (module.supportsParams || []).includes('sector') && !params.has('sector')) {
    params.set('sector', sector);
  }
  const q = params.toString();
  return `${q ? `${pathPart}?${q}` : pathPart}${hash}`;
}

function fullPageHref(href) {
  const rel = String(href || '');
  const hashIndex = rel.indexOf('#');
  const hash = hashIndex >= 0 ? rel.slice(hashIndex) : '';
  const base = hashIndex >= 0 ? rel.slice(0, hashIndex) : rel;
  if (!base.includes('?')) return rel;
  const [pathPart, query] = base.split('?');
  const params = new URLSearchParams(query);
  params.delete('embed');
  params.delete('popup');
  const q = params.toString();
  return `${q ? `${pathPart}?${q}` : pathPart}${hash}`;
}

function toModuleItem(module, profile = {}, overrides = {}) {
  if (!module) return null;
  const baseHref = resolveModuleWebHref(overrides.href || module.href);
  const modalHref = appendEmbedParams(baseHref, profile, module);
  const usageHint = appendAsOfHint(overrides.usageHint || module.usageHint || '', overrides.moduleId || module.id);
  return {
    moduleId: overrides.moduleId || module.id,
    title: overrides.title || module.title,
    description: String(overrides.description || module.description || '').slice(0, 220),
    usageHint: String(usageHint).slice(0, 220),
    href: modalHref,
    fullPageHref: overrides.fullPageHref || fullPageHref(baseHref),
    liveSiteHref:
      overrides.liveSiteHref ||
      (/greenwaysmarket\.com/i.test(String(module.fullPageHref || '')) ? module.fullPageHref : ''),
    openMode: module.openMode || 'modal',
    kind: module.kind || 'html',
    openSize: overrides.openSize || module.defaultOpenSize || ''
  };
}

function toModuleBlock(moduleId, profile = {}, overrides = {}) {
  const registry = registryCache || loadRegistrySync();
  const module = getModuleById(registry, moduleId);
  const item = toModuleItem(module, profile, { ...overrides, moduleId: overrides.moduleId || moduleId });
  if (!item) return null;
  return {
    type: 'module',
    items: [item]
  };
}

async function moduleBlockFor(moduleId, profile = {}, overrides = {}) {
  await loadContentModules();
  return toModuleBlock(moduleId, profile, overrides);
}

async function moduleBlocksForAgent(agentKey, profile = {}, limit = 3) {
  const registry = await loadContentModules();
  return modulesForAgent(registry, agentKey)
    .slice(0, limit)
    .map((m) => toModuleBlock(m.id, profile))
    .filter(Boolean);
}

/** Intent → primary module ids for grounded knowledge bullets (pilot: equipment + finance). */
const INTENT_MODULE_HINTS = {
  equipment: {
    overview: ['equipment-deep-dive', 'etl-finder'],
    deep_dive: ['equipment-deep-dive', 'savings-projection'],
    savings_projection: ['savings-projection', 'equipment-deep-dive'],
    equipment_intelligence: ['etl-finder', 'equipment-deep-dive'],
    etl_verification: ['etl-official-site', 'etl-finder', 'equipment-deep-dive'],
    product_comparison: ['appliance-comparison', 'equipment-deep-dive'],
    renovation: ['sustainable-renovations', 'insulation-guide', 'renovation-plans'],
    insulation: ['insulation-guide', 'sustainable-renovations'],
    renovation_plan: ['renovation-plans', 'sustainable-renovations'],
    retrofit_benefits: ['retrofit-roi-guide', 'equipment-deep-dive'],
    restaurant_design: ['restaurant-design-sustainability', 'equipment-deep-dive'],
    equipment_data_capture: ['restaurant-energy-monitoring-guide', 'equipment-data-capture', 'equipment-deep-dive'],
    kitchen: ['equipment-deep-dive', 'etl-finder'],
    refrigeration: ['equipment-deep-dive', 'etl-finder'],
    hvac: ['marketplace-hvac', 'equipment-deep-dive', 'retrofit-roi-guide'],
    sustainable: ['sustainable-renovations', 'equipment-deep-dive'],
    trajectory: ['savings-trajectory', 'equipment-deep-dive'],
    portals: ['equipment-deep-dive', 'etl-finder', 'savings-projection'],
    sustainability_glossary: ['restaurant-energy-monitoring-guide', 'energy-monitoring', 'insulation-guide', 'low-energy-equipment'],
    scope_3: ['equipment-deep-dive', 'savings-projection']
  },
  finance: {
    overview: ['finance-finder', 'energy-prices-ticker'],
    energy_prices: ['energy-prices-ticker', 'site-energy-reading', 'savings-trajectory', 'utility-detail'],
    price_upgrade_case: ['restaurant-energy-monitoring-guide', 'energy-prices-ticker', 'savings-projection', 'low-energy-equipment'],
    compare_tariffs: ['european-energy', 'declining-cost-renewables', 'deals-ticker'],
    renewable_costs: ['declining-cost-renewables', 'savings-projection'],
    bnpl: ['finance-finder', 'savings-projection'],
    equipment_finance: ['finance-finder', 'etl-calculator', 'etl-finder'],
    green_loans: ['finance-finder', 'sustainable-renovations'],
    grants_tab: ['finance-finder', 'schemes-portal-restaurant'],
    europe_finance: ['finance-finder', 'schemes-portal-eu'],
    calculators_tools: ['restaurant-energy-monitoring-guide', 'etl-calculator', 'savings-projection', 'energy-cost-guide'],
    audit_calculator: ['energy-audit', 'etl-calculator'],
    etl_products: ['etl-finder', 'etl-calculator', 'savings-projection'],
    portals: ['finance-finder', 'european-energy', 'energy-prices-ticker'],
    solar_finance: ['declining-cost-renewables', 'finance-finder'],
    heat_pump_finance: ['finance-finder', 'savings-projection'],
    sustainability_glossary: ['finance-finder', 'savings-projection'],
    scope_3: ['savings-projection', 'energy-prices-ticker'],
    explain_net_zero: ['declining-cost-renewables', 'finance-finder'],
    explain_co2e: ['site-energy-reading', 'savings-projection', 'energy-cost-guide']
  },
  grants: {
    overview: ['schemes-portal-restaurant', 'schemes-portal-eu', 'finance-finder'],
    nl_hub: ['schemes-portal-restaurant', 'finance-finder'],
    nl_schemes: ['schemes-portal-restaurant', 'finance-finder'],
    eu_schemes: ['schemes-portal-eu', 'schemes-portal-restaurant'],
    uk_schemes: ['schemes-portal-restaurant', 'schemes-portal-eu'],
    restaurant: ['schemes-portal-restaurant', 'finance-finder'],
    equipment: ['schemes-portal-restaurant', 'equipment-deep-dive'],
    deadlines: ['schemes-portal-restaurant', 'schemes-portal-eu'],
    finance_portal: ['finance-finder', 'schemes-portal-restaurant'],
    product_grants: ['etl-finder', 'schemes-portal-restaurant'],
    why_grants: ['schemes-portal-restaurant', 'eco-project-planner'],
    portals: ['schemes-portal-restaurant', 'schemes-portal-eu', 'finance-finder'],
    sustainability_glossary: ['schemes-portal-eu', 'schemes-portal-restaurant'],
    scope_3: ['schemes-portal-eu', 'finance-finder'],
    explain_csrd: ['schemes-portal-eu'],
    explain_esg: ['schemes-portal-eu', 'schemes-portal-restaurant']
  },
  deals: {
    overview: ['deals-full-page', 'deals-ticker', 'marketplace-home', 'european-energy'],
    deals_feed_scan: ['deals-ticker', 'deals-full-page'],
    tariff_compare: ['site-energy-reading', 'european-energy', 'deals-ticker', 'energy-prices-ticker'],
    nl_restaurant_energy: ['site-energy-reading', 'european-energy', 'deals-ticker'],
    uk_green_tariff: ['european-energy', 'deals-ticker'],
    green_tariff: ['european-energy', 'declining-cost-renewables'],
    energy_deals: ['deals-ticker', 'european-energy'],
    water_deals: ['water-saving-finder', 'deals-ticker'],
    product_deals: ['sustainable-product-finder', 'deals-ticker'],
    sustainability_deals: ['deals-ticker', 'sustainability-map'],
    water_finder: ['water-saving-finder', 'water-saving-guide'],
    savings_portal: ['savings-tour', 'deals-ticker'],
    deals_page: ['deals-full-page', 'deals-ticker'],
    portals: ['deals-full-page', 'european-energy', 'water-saving-finder'],
    payback_savings: ['savings-projection', 'low-energy-equipment'],
    sustainability_glossary: ['european-energy', 'deals-ticker'],
    scope_3: ['european-energy', 'low-energy-equipment'],
    explain_renewable: ['european-energy', 'declining-cost-renewables']
  },
  media: {
    overview: ['sustainability-map', 'sustainability-news-page'],
    sustainability_map: ['sustainability-map'],
    sustainability_map_explained: ['sustainability-map'],
    energy_examples: ['restaurant-energy-monitoring-guide', 'sustainability-map', 'energy-prices-ticker'],
    monthly_news: ['sustainability-news-page', 'tech-news-edition'],
    daily_brief: ['sustainability-news-page', 'tech-news-edition'],
    policy_news: ['sustainability-news-page', 'sustainable-references'],
    funding_news: ['sustainability-news-page', 'schemes-portal-eu'],
    energy_prices: ['energy-prices-ticker', 'savings-trajectory'],
    portals: ['sustainability-map', 'energy-prices-ticker', 'sustainable-references'],
    tech_news: ['tech-news-edition', 'sustainability-news-page'],
    sustainability_glossary: ['sustainable-references', 'sustainability-map'],
    scope_3: ['sustainability-news-page', 'sustainable-references']
  },
  products: {
    overview: ['marketplace-about', 'sustainable-product-finder', 'water-saving-finder'],
    marketplace_explainer: ['marketplace-about', 'sustainable-product-finder', 'etl-finder'],
    water_lane: ['water-saving-finder', 'water-saving-guide'],
    water_saving_guide: ['water-saving-guide', 'water-saving-finder'],
    electricity_lane: ['sustainable-product-finder', 'etl-finder'],
    gas_lane: ['sustainable-product-finder', 'low-energy-equipment'],
    water_finder_page: ['water-saving-finder', 'water-saving-guide'],
    product_finder_page: ['sustainable-product-finder', 'etl-finder'],
    eco_journey: ['eco-project-planner', 'sustainable-product-finder'],
    product_grants: ['etl-finder', 'schemes-portal-restaurant'],
    portals: ['marketplace-home', 'water-saving-finder', 'sustainable-product-finder', 'equipment-deep-dive'],
    find_combi: ['etl-finder', 'equipment-deep-dive'],
    find_fridge: ['etl-finder', 'equipment-deep-dive'],
    find_wok: ['etl-finder', 'equipment-deep-dive'],
    equipment_lookup: ['sustainable-product-finder', 'etl-finder'],
    sustainability_glossary: ['water-saving-guide', 'sustainable-product-finder'],
    scope_3: ['water-saving-finder', 'sustainable-product-finder'],
    explain_water_efficiency: ['water-saving-guide', 'water-saving-finder'],
    explain_circular: ['water-saving-finder', 'eco-project-planner']
  },
  systems: {
    consumer_overview: ['restaurant-energy-monitoring-guide', 'greenways-dashboard', 'sensor-dashboard', 'energy-monitoring'],
    monitoring_why: ['restaurant-energy-monitoring-guide', 'energy-monitoring', 'smart-sensor-monitoring'],
    sensors_restaurant: ['site-energy-reading', 'restaurant-energy-monitoring-guide', 'sensor-dashboard', 'greenways-dashboard'],
    sensors_home: ['sensor-dashboard', 'energy-monitoring'],
    sensors_office: ['sensor-dashboard', 'greenways-dashboard'],
    monitoring_products: ['equipment-data-capture', 'sensor-dashboard'],
    greenways_dashboard: ['greenways-dashboard', 'utility-detail'],
    dashboard_math: ['greenways-dashboard', 'utility-detail'],
    time_of_use: ['site-energy-reading', 'utility-detail', 'greenways-dashboard'],
    etl_systems_savings: ['equipment-data-capture', 'low-energy-equipment'],
    deep_dive_systems: ['equipment-deep-dive', 'equipment-data-capture'],
    portals: ['greenways-dashboard', 'sensor-dashboard', 'utility-detail'],
    sustainability_glossary: ['energy-monitoring', 'smart-sensor-monitoring'],
    scope_3: ['equipment-data-capture', 'sensor-dashboard'],
    explain_monitoring_baseline: ['energy-monitoring', 'equipment-data-capture']
  }
};

const KNOWLEDGE_SECTION_MARKER = '**Good to know**';

function getAgentNote(module, agentKey) {
  if (!module?.agentNotes) return null;
  const key = String(agentKey || '').trim().toLowerCase();
  return module.agentNotes[key] || module.agentNotes.default || null;
}

function moduleKnowledgeBullets(module, agentKey) {
  const key = String(agentKey || '').trim().toLowerCase();
  const kb = module?.knowledgeBullets;
  if (!kb) return [];
  return kb[key] || kb.default || [];
}

function scoreModuleForQuestion(module, question, agentKey) {
  const q = String(question || '').toLowerCase();
  if (!q.trim()) return 0;
  const bullets = moduleKnowledgeBullets(module, agentKey);
  const hay = [
    module.title,
    module.description,
    module.usageHint,
    ...(module.topics || []),
    ...bullets
  ]
    .join(' ')
    .toLowerCase();
  let score = 0;
  q.split(/\s+/)
    .filter((t) => t.length >= 3)
    .forEach((token) => {
      if (hay.includes(token)) score += 2;
    });
  if (/combi|wok|oven|fridge|freezer|kitchen|dishwash/.test(q) && /kitchen|restaurant|equipment/.test(hay)) {
    score += 4;
  }
  if (/renovation|insulation|fabric|retrofit/.test(q) && /renovation|insulation|fabric|retrofit/.test(hay)) {
    score += 4;
  }
  if (/tariff|wholesale|price|bill|finance|loan|bnpl/.test(q) && /tariff|price|finance|loan|bnpl|bill/.test(hay)) {
    score += 4;
  }
  if (/marketplace|market place|greenways market|greenwaysmarket|about us|shop hub/.test(q) && /marketplace|shop|greenways market/.test(hay)) {
    score += 5;
  }
  if (/hvac|ventilation|air con|cheetah|quintex/.test(q) && /hvac|ventilation/.test(hay)) {
    score += 5;
  }
  if (bullets.length) score += 3;
  if (getAgentNote(module, agentKey)) score += 2;
  return score;
}

function rankModulesForKnowledge(agentKey, question, intentId, { limit = 3 } = {}) {
  const registry = loadRegistrySync();
  const key = String(agentKey || '').trim().toLowerCase();
  const hints = (INTENT_MODULE_HINTS[key] || {})[intentId] || [];
  const agentModules = modulesForAgent(registry, key);
  const byId = new Map(agentModules.map((m) => [m.id, m]));

  const candidates = new Map();
  hints.forEach((id, idx) => {
    const mod = byId.get(id) || getModuleById(registry, id);
    if (!mod) return;
    const prior = candidates.get(mod.id)?.score || 0;
    candidates.set(mod.id, { mod, score: Math.max(prior, 50 - idx * 8) });
  });

  for (const mod of agentModules) {
    const qScore = scoreModuleForQuestion(mod, question, key);
    if (qScore <= 0 && !hints.includes(mod.id)) continue;
    const prior = candidates.get(mod.id);
    const score = (prior?.score || 0) + qScore;
    candidates.set(mod.id, { mod, score });
  }

  // Pull in related modules when top pick has relatedModuleIds
  const top = [...candidates.values()].sort((a, b) => b.score - a.score).slice(0, 2);
  for (const { mod } of top) {
    for (const relId of mod.relatedModuleIds || []) {
      if (candidates.size >= limit + 2) break;
      const rel = byId.get(relId) || getModuleById(registry, relId);
      if (!rel || candidates.has(rel.id)) continue;
      if (!(rel.agents || []).includes(key)) continue;
      candidates.set(rel.id, { mod: rel, score: 8 });
    }
  }

  return [...candidates.values()]
    .filter(({ mod, score }) => score > 0 && (moduleKnowledgeBullets(mod, key).length || getAgentNote(mod, key)))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ mod }) => mod);
}

function formatModuleKnowledgeProse(modules, agentKey, { maxBullets = 3 } = {}) {
  const bullets = [];
  for (const mod of modules || []) {
    for (const b of moduleKnowledgeBullets(mod, agentKey)) {
      if (bullets.length >= maxBullets) break;
      bullets.push(String(b).trim());
    }
    if (bullets.length >= maxBullets) break;
  }
  if (!bullets.length) {
    for (const mod of modules || []) {
      const note = getAgentNote(mod, agentKey);
      if (!note?.body) continue;
      const sentence = String(note.body).split(/(?<=[.!?])\s+/)[0];
      if (sentence) bullets.push(sentence.trim());
      if (bullets.length >= maxBullets) break;
    }
  }
  if (!bullets.length) return '';
  return `\n\n${KNOWLEDGE_SECTION_MARKER}\n${bullets.map((b) => `- ${b}`).join('\n')}`;
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
 * Append grounded module knowledge bullets to a knowledge /ask result (left column).
 * Optionally attaches one curated worked example as a deep-linked module tablet.
 */
function enrichKnowledgeAnswer(result, { agentKey, question, intentId, profile = {} } = {}) {
  if (!result?.answer) return result;

  const skipKnowledgeBullets = intentId === 'marketplace_explainer';

  if (!skipKnowledgeBullets && !String(result.answer).includes(KNOWLEDGE_SECTION_MARKER)) {
    const ranked = rankModulesForKnowledge(agentKey, question, intentId, { limit: 2 });
    const prose = formatModuleKnowledgeProse(ranked, agentKey, { maxBullets: 3 });
    if (prose) result.answer = insertBeforeAnswerTip(result.answer, prose);
  }

  const { attachWorkedExample } = require('./greenways-module-examples');
  attachWorkedExample(result, { agentKey, question, intentId, profile });

  const { attachSiteKnowledgeCards } = require('./greenways-site-knowledge');
  attachSiteKnowledgeCards(result, { agentKey, question, intentId, profile });

  if (agentKey === 'equipment') {
    const { attachRestaurantAssetBenchmark } = require('./restaurant-asset-service');
    attachRestaurantAssetBenchmark(result, { question, intentId, profile });
  }

  return result;
}

module.exports = {
  loadContentModules,
  loadRegistrySync,
  resolveModuleId,
  getModuleById,
  mergeModuleRow,
  modulesForAgent,
  resolveModuleWebHref,
  appendEmbedParams,
  toModuleItem,
  toModuleBlock,
  moduleBlockFor,
  moduleBlocksForAgent,
  INTENT_MODULE_HINTS,
  getAgentNote,
  moduleKnowledgeBullets,
  scoreModuleForQuestion,
  rankModulesForKnowledge,
  formatModuleKnowledgeProse,
  enrichKnowledgeAnswer
};
