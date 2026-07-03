/**
 * Greenways content module registry — shared HTML/video illustrations for agents.
 * Client opens modules via greenways-agent-content-module.js (modal iframe).
 */

const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

const registryPath = path.join(__dirname, '..', 'data', 'greenways-content-modules.json');

/** Client-facing ids that map to a canonical registry row */
const MODULE_ID_ALIASES = {
  'energy-ticker': 'energy-prices-ticker'
};

let registryCache = null;

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

/**
 * Merge agent row overrides with registry copy (description + usageHint) and defaults.
 * @param {object} row — moduleId, optional title, portalPath/href, query, openSize
 */
function mergeModuleRow(row = {}) {
  const registry = loadRegistrySync();
  const mod = getModuleById(registry, row.moduleId);
  const requestedId = String(row.moduleId || mod?.id || '').trim();
  return {
    ...row,
    moduleId: requestedId || mod?.id || 'portal',
    title: row.title || mod?.title || 'Greenways tool',
    description: row.description || mod?.description || '',
    usageHint: row.usageHint || mod?.usageHint || '',
    portalPath: row.portalPath || row.href || mod?.href || '',
    openSize: row.openSize || mod?.defaultOpenSize || ''
  };
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

function appendEmbedParams(href, profile = {}, module = {}) {
  const rel = resolveModuleWebHref(String(href || '').trim());
  if (!rel) return rel;
  const qIndex = rel.indexOf('?');
  const pathPart = qIndex >= 0 ? rel.slice(0, qIndex) : rel;
  const params = new URLSearchParams(qIndex >= 0 ? rel.slice(qIndex + 1) : '');
  if (!params.has('embed')) params.set('embed', '1');
  if (!params.has('popup')) params.set('popup', '1');
  const region = String(profile.region || '').trim();
  const sector = String(profile.sector || '').trim();
  if (region && (module.supportsParams || []).includes('region') && !params.has('region')) {
    params.set('region', region);
  }
  if (sector && (module.supportsParams || []).includes('sector') && !params.has('sector')) {
    params.set('sector', sector);
  }
  const q = params.toString();
  return q ? `${pathPart}?${q}` : pathPart;
}

function fullPageHref(href) {
  const rel = String(href || '');
  if (!rel.includes('?')) return rel;
  const [pathPart, query] = rel.split('?');
  const params = new URLSearchParams(query);
  params.delete('embed');
  params.delete('popup');
  const q = params.toString();
  return q ? `${pathPart}?${q}` : pathPart;
}

function toModuleItem(module, profile = {}, overrides = {}) {
  if (!module) return null;
  const baseHref = resolveModuleWebHref(overrides.href || module.href);
  const modalHref = appendEmbedParams(baseHref, profile, module);
  return {
    moduleId: overrides.moduleId || module.id,
    title: overrides.title || module.title,
    description: String(overrides.description || module.description || '').slice(0, 220),
    usageHint: String(overrides.usageHint || module.usageHint || '').slice(0, 220),
    href: modalHref,
    fullPageHref: overrides.fullPageHref || module.fullPageHref || fullPageHref(baseHref),
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
    equipment_data_capture: ['equipment-data-capture', 'equipment-deep-dive'],
    kitchen: ['equipment-deep-dive', 'etl-finder'],
    refrigeration: ['equipment-deep-dive', 'etl-finder'],
    hvac: ['equipment-deep-dive', 'retrofit-roi-guide'],
    sustainable: ['sustainable-renovations', 'equipment-deep-dive'],
    trajectory: ['savings-trajectory', 'equipment-deep-dive'],
    portals: ['equipment-deep-dive', 'etl-finder', 'savings-projection']
  },
  finance: {
    overview: ['finance-finder', 'energy-prices-ticker'],
    energy_prices: ['energy-prices-ticker', 'savings-trajectory', 'utility-detail'],
    price_upgrade_case: ['energy-prices-ticker', 'savings-projection', 'low-energy-equipment'],
    compare_tariffs: ['european-energy', 'declining-cost-renewables', 'deals-ticker'],
    renewable_costs: ['declining-cost-renewables', 'savings-projection'],
    bnpl: ['finance-finder', 'savings-projection'],
    equipment_finance: ['finance-finder', 'etl-calculator', 'etl-finder'],
    green_loans: ['finance-finder', 'sustainable-renovations'],
    grants_tab: ['finance-finder', 'schemes-portal-restaurant'],
    europe_finance: ['finance-finder', 'schemes-portal-eu'],
    calculators_tools: ['etl-calculator', 'savings-projection', 'energy-cost-guide'],
    audit_calculator: ['energy-audit', 'etl-calculator'],
    etl_products: ['etl-finder', 'etl-calculator', 'savings-projection'],
    portals: ['finance-finder', 'european-energy', 'energy-prices-ticker'],
    solar_finance: ['declining-cost-renewables', 'finance-finder'],
    heat_pump_finance: ['finance-finder', 'savings-projection']
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
    portals: ['schemes-portal-restaurant', 'schemes-portal-eu', 'finance-finder']
  },
  deals: {
    overview: ['deals-full-page', 'deals-ticker', 'european-energy'],
    deals_feed_scan: ['deals-ticker', 'deals-full-page'],
    tariff_compare: ['european-energy', 'deals-ticker', 'energy-prices-ticker'],
    nl_restaurant_energy: ['european-energy', 'deals-ticker'],
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
    payback_savings: ['savings-projection', 'low-energy-equipment']
  },
  media: {
    overview: ['sustainability-map', 'sustainability-news-page'],
    sustainability_map: ['sustainability-map'],
    sustainability_map_explained: ['sustainability-map'],
    energy_examples: ['sustainability-map', 'energy-prices-ticker'],
    monthly_news: ['sustainability-news-page', 'tech-news-edition'],
    daily_brief: ['sustainability-news-page', 'tech-news-edition'],
    policy_news: ['sustainability-news-page', 'sustainable-references'],
    funding_news: ['sustainability-news-page', 'schemes-portal-eu'],
    energy_prices: ['energy-prices-ticker', 'savings-trajectory'],
    portals: ['sustainability-map', 'energy-prices-ticker', 'sustainable-references'],
    tech_news: ['tech-news-edition', 'sustainability-news-page']
  },
  products: {
    overview: ['sustainable-product-finder', 'water-saving-finder'],
    water_lane: ['water-saving-finder', 'water-saving-guide'],
    water_saving_guide: ['water-saving-guide', 'water-saving-finder'],
    electricity_lane: ['sustainable-product-finder', 'etl-finder'],
    gas_lane: ['sustainable-product-finder', 'low-energy-equipment'],
    water_finder_page: ['water-saving-finder', 'water-saving-guide'],
    product_finder_page: ['sustainable-product-finder', 'etl-finder'],
    eco_journey: ['eco-project-planner', 'sustainable-product-finder'],
    product_grants: ['etl-finder', 'schemes-portal-restaurant'],
    portals: ['water-saving-finder', 'sustainable-product-finder', 'equipment-deep-dive'],
    find_combi: ['etl-finder', 'equipment-deep-dive'],
    find_fridge: ['etl-finder', 'equipment-deep-dive'],
    find_wok: ['etl-finder', 'equipment-deep-dive'],
    equipment_lookup: ['sustainable-product-finder', 'etl-finder']
  },
  systems: {
    consumer_overview: ['greenways-dashboard', 'sensor-dashboard', 'energy-monitoring'],
    monitoring_why: ['energy-monitoring', 'equipment-data-capture'],
    sensors_restaurant: ['sensor-dashboard', 'greenways-dashboard'],
    sensors_home: ['sensor-dashboard', 'energy-monitoring'],
    sensors_office: ['sensor-dashboard', 'greenways-dashboard'],
    monitoring_products: ['equipment-data-capture', 'sensor-dashboard'],
    greenways_dashboard: ['greenways-dashboard', 'utility-detail'],
    dashboard_math: ['greenways-dashboard', 'utility-detail'],
    time_of_use: ['utility-detail', 'greenways-dashboard'],
    etl_systems_savings: ['equipment-data-capture', 'low-energy-equipment'],
    deep_dive_systems: ['equipment-deep-dive', 'equipment-data-capture'],
    portals: ['greenways-dashboard', 'sensor-dashboard', 'utility-detail']
  }
};

const KNOWLEDGE_SECTION_MARKER = '**What the linked tools cover**';

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

  if (!String(result.answer).includes(KNOWLEDGE_SECTION_MARKER)) {
    const ranked = rankModulesForKnowledge(agentKey, question, intentId, { limit: 2 });
    const prose = formatModuleKnowledgeProse(ranked, agentKey, { maxBullets: 3 });
    if (prose) result.answer = insertBeforeAnswerTip(result.answer, prose);
  }

  const { attachWorkedExample } = require('./greenways-module-examples');
  attachWorkedExample(result, { agentKey, question, intentId, profile });
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
