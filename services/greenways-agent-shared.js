const path = require('path');
const fs = require('fs/promises');

const schemesPath = path.join(__dirname, '..', 'schemes.json');
const PRODUCT_FILES = [
  path.join(__dirname, '..', 'products-with-grants-and-collection.json'),
  path.join(__dirname, '..', 'energy-calculator', 'products-with-grants-and-collection.json'),
  path.join(__dirname, '..', 'products-with-grants.json'),
  path.join(__dirname, '..', 'energy-calculator', 'products-with-grants.json')
];

const REGION_LABELS = {
  nl: 'Netherlands',
  eu: 'EU-wide',
  uk: 'United Kingdom',
  ie: 'Ireland',
  de: 'Germany',
  fr: 'France',
  be: 'Belgium',
  es: 'Spain',
  pt: 'Portugal'
};

const PORTAL_LINKS = {
  restaurant: './Full%20Schemes%20Portal%20Restaurant.html',
  eu: './Full%20Schemes%20Portal%20html.html',
  finance: './finance-finder-restaurant.html',
  savings: './savings.html',
  deals: './deals-ticker-hub.html',
  dealsFullPage: './Deals.html',
  europeanEnergy: './european_energy_deals_portal.html',
  deepDive: './restaurant-equipment-deep-dive.html',
  equipmentTool: './equipment_intelligence_tool.html',
  sustainableRenovations: './Sustainable%20Renovations%20New%20.html',
  insulationGuide: './Insulation%20.html',
  renovationPlans: '../HTMLs/Renovation%20project%20plans.html',
  retrofitRoiGuide: '../HTMLs/Retrofit-Tabbed.html',
  restaurantDesign: '../HTMLs/Restauarant%20Design%20.html',
  energyTicker: '../content-ops/drafts/energy-ticker/energy-ticker-green-wire.html',
  utilityDetail: './utility-detail.html',
  savingsProjection: './equipment-savings-projection.html',
  energySavingsTrajectory: './energy-savings-trajectory.html',
  energyCostGuide: './energy-cost-guide.html',
  savingsHub: './savings.html',
  energyCalculator: '/energy-calculator/energy-calculator-enhanced-2.html',
  etlMarketplace: './equipment_intelligence_tool.html',
  energyTechnologyList: './energy_technology_list_etl.html',
  productMarketplace: '/product-page-v2-marketplace.html',
  energyAudit: '/energy-audit-widget-main.html',
  membersSection: '/wix-integration/members-section.html',
  restaurantData: './restaurant-data.html',
  sensorDashboard: './sensor-dashboard.html',
  greenwaysDashboard: './Greenways%20Interface%20.html',
  energyMonitoring: './Importance%20of%20Energy%20Monitoring.html',
  lowEnergyGuide: './Low%20Energy%20New%20.HTML',
  applianceComparison: './Restuarant%20Appliance%20Comparison%20-%20Marketplace%20variant.html',
  discoverSavings: './Discover%20Energy%20Savings%20.html',
  europeSavings: './Europes%20Energy%20Saving%20.html',
  ecoProjectPlanning: '../HTMLs/eco_project_planning_guide_fixed.html',
  grantsAgent: '/greenways/grants-agent',
  mediaAgent: '/greenways/media-agent',
  equipmentAgent: '/greenways/equipment-agent',
  dealsAgent: '/greenways/deals-agent',
  sustainableProductsAgent: '/greenways/sustainable-products-agent'
};

let productsWithGrantsCache = null;

async function loadIntentsFrom(intentsPath) {
  try {
    const raw = await fs.readFile(intentsPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { intents: [], staticTips: [] };
  }
}

async function loadSchemes() {
  try {
    const raw = await fs.readFile(schemesPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => s.status !== 'retired') : [];
  } catch (_) {
    return [];
  }
}

function schemeHaystack(scheme) {
  return [
    scheme.title,
    scheme.description,
    scheme.relevance,
    scheme.requirements,
    scheme.type,
    scheme.region,
    ...(scheme.keywords || []),
    ...(scheme.categories || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function primaryLink(scheme) {
  const links = Array.isArray(scheme.links) ? scheme.links : [];
  const apply = links.find((l) => l.type === 'apply') || links[0];
  return apply?.url || '';
}

function toSuggestion(scheme) {
  return {
    id: scheme.id,
    title: scheme.title,
    region: scheme.region,
    type: scheme.type,
    url: primaryLink(scheme),
    description: String(scheme.description || '').slice(0, 160),
    deadline: scheme.deadline || null,
    requirements: String(scheme.requirements || '').slice(0, 120),
    relevance: scheme.relevance || null
  };
}

function matchIntent(question, intents) {
  const q = question.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const intent of intents.intents || []) {
    let score = 0;
    for (const pattern of intent.patterns || []) {
      const p = pattern.toLowerCase().trim();
      if (!p) continue;
      if (q.includes(p)) score += p.length >= 8 ? 3 : 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return bestScore > 0 ? best : null;
}

function profileRegion(profile) {
  const r = String(profile.region || '').toLowerCase().trim();
  if (r && r !== 'all') return r;
  return '';
}

function schemeMatchesRegion(scheme, region) {
  if (!region) return true;
  const sr = String(scheme.region || 'eu').toLowerCase();
  if (region === 'eu') return sr === 'eu';
  return sr === region;
}

function scoreScheme(scheme, question, profile = {}) {
  const q = question.toLowerCase();
  const hay = schemeHaystack(scheme);
  let score = 0;

  if (scheme.title?.toLowerCase().includes(q)) score += 10;
  const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (hay.includes(token)) score += 2;
  }

  const pr = profileRegion(profile);
  if (pr && schemeMatchesRegion(scheme, pr)) score += 4;

  const sector = String(profile.sector || '').toLowerCase();
  if (sector && sector !== 'any') {
    if (hay.includes(sector)) score += 5;
    if (sector === 'restaurant' && (hay.includes('hospitality') || hay.includes('sme'))) score += 3;
  }

  const focus = String(profile.focus || '').toLowerCase();
  if (focus && focus !== 'general') {
    if (hay.includes(focus)) score += 4;
    if (focus === 'equipment' && (hay.includes('appliance') || hay.includes('machinery'))) score += 3;
    if (focus === 'energy' && (hay.includes('energy') || hay.includes('efficiency'))) score += 3;
  }

  if (scheme.priority) score += 6;
  return score;
}

function rankSchemes(schemes, question, profile, limit = 8) {
  return schemes
    .map((s) => ({ scheme: s, score: scoreScheme(s, question, profile) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.scheme);
}

function formatSchemeBullets(schemes, max = 8) {
  return schemes.slice(0, max).map((s) => {
    const link = primaryLink(s);
    const head = `**${s.title}** (${String(s.region || 'eu').toUpperCase()}) — ${String(s.description || '').slice(0, 140)}`;
    return link ? `- ${head}\n  → ${link}` : `- ${head}`;
  }).join('\n');
}

function withTip(body, tip) {
  const text = String(body || '').trim();
  if (!tip) return text;
  return `${text}\n\n_${tip}_`;
}

function toLinkItem(title, url, description) {
  return {
    title: String(title || '').trim(),
    url: String(url || '').trim(),
    description: String(description || '').slice(0, 160)
  };
}

/** Root-absolute path for agent module iframes (from PORTAL_LINKS-style paths). */
function resolvePortalPathToRootHref(path) {
  let p = String(path || '').trim();
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith('/')) return p;
  if (p.startsWith('./')) p = p.slice(2);
  if (p.startsWith('../content-ops/')) return `/${p.slice(3)}`;
  if (p.startsWith('../HTMLs/')) return `/${p.slice(3)}`;
  return `/HTMLS%20GWM%20GWB/${p}`;
}

function moduleEmbedHref(path, extraQuery = '') {
  const base = resolvePortalPathToRootHref(path);
  if (!base) return '';
  const sep = base.includes('?') ? '&' : '?';
  const q = String(extraQuery || '')
    .replace(/^\?/, '')
    .replace(/^&/, '');
  return `${base}${sep}embed=1&popup=1${q ? `&${q}` : ''}`;
}

/**
 * Content-module tablet payload — use in blocks[] with type: "module".
 * @see HTMLS GWM GWB/js/greenways-agent-content-module.js
 */
function toModuleItem(opts = {}) {
  const path = opts.href || opts.portalPath || '';
  const full = resolvePortalPathToRootHref(opts.fullPageHref || path);
  const embed = opts.embedHref || moduleEmbedHref(path, opts.query || opts.extraQuery || '');
  return {
    moduleId: opts.moduleId || 'portal',
    title: opts.title || 'Greenways tool',
    description: String(opts.description || '').slice(0, 220),
    usageHint: String(opts.usageHint || '').slice(0, 220),
    href: embed,
    fullPageHref: full,
    kind: 'html',
    openSize: opts.openSize || '',
    theme: opts.theme || 'default',
    agentName: opts.agentName || 'Agent'
  };
}

/** Copy rules for all Greenways agents — left = summary; right = blocks/banner. See Skills/greenways-chat-interface-skill.md */
const CONVERSATIONAL_ANSWER_RULES = {
  leftColumn: [
    'Summarise in plain language — explain why it matters and how it can affect bills, timing, or planning.',
    'Do not dump long bullet lists, raw HTML paths, or article catalogues in the left column.',
    'Do not mention JSON filenames or file extensions — say Schemes, deals feed, product catalogue, etc.',
    'Use **equipment** (not **kit**) for appliances and upgrades — keep **kit** only in official supplier product names.',
    'Offer a follow-up when jargon may be unfamiliar (e.g. "Should I explain CBAM and what it means for your imports?").'
  ],
  rightColumn: [
    'Put concrete examples, portals, and editions in link tablets (blocks) or banner cards — Zara-style.',
    'Use module blocks for heavy HTML (maps, finders, tickers); chat stays open behind.'
  ]
};

function conversationalSystemLines() {
  return [
    'LEFT column only: 2–4 short paragraphs — friendly helper tone, not a catalogue dump.',
    'Do NOT list articles, deals, schemes, or products as markdown bullets in the left column.',
    'Point users to link tablets, module blocks, or banner cards on the right for examples.',
    'Explain unfamiliar sustainability terms briefly or offer to explain them.',
    'End with an optional follow-up question when it helps the user decide next step.'
  ];
}

/** Third-person agent description — rendered as system highlight in chat UI (not agent voice). */
function agentProfileBlock(...parts) {
  const body = parts
    .filter(Boolean)
    .map((p) => String(p).trim())
    .filter(Boolean)
    .join('\n\n');
  if (!body) return '';
  return `:::agent-profile\n${body}\n:::\n\n`;
}

async function loadProductsWithGrants() {
  if (productsWithGrantsCache) return productsWithGrantsCache;
  for (const filePath of PRODUCT_FILES) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const products = Array.isArray(parsed) ? parsed : parsed.products || [];
      if (products.length) {
        productsWithGrantsCache = { products, source: filePath };
        return productsWithGrantsCache;
      }
    } catch (_) {
      /* try next */
    }
  }
  productsWithGrantsCache = { products: [], source: null };
  return productsWithGrantsCache;
}

function normalizeImageUrl(imageUrl) {
  const url = String(imageUrl || '').trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return `/product-placement/${url.replace(/^\.?\//, '')}`;
}

function marketplaceHref(productId) {
  return `/product-page-v2-marketplace.html?product=${encodeURIComponent(productId)}&fromPopup=true`;
}

function deepDiveHref(productId) {
  return `${PORTAL_LINKS.deepDive}?equipment=${encodeURIComponent(productId)}`;
}

function toProductSample(product, label, extras = {}) {
  const grants = Array.isArray(product.grants) ? product.grants : [];
  const topGrants = grants
    .slice(0, 2)
    .map((g) => g.name || g.title)
    .filter(Boolean);
  return {
    id: product.id,
    name: product.name || product.id,
    subcategory: product.subcategory || product.category || '',
    imageUrl: normalizeImageUrl(product.imageUrl),
    label: label || '',
    grantsCount: grants.length,
    topGrants,
    marketplaceHref: marketplaceHref(product.id),
    deepDiveHref: deepDiveHref(product.id),
    ...extras
  };
}

function scoreProductForQuery(product, question, profile, extraTokens = []) {
  const q = String(question || '').toLowerCase();
  const hay = [
    product.name,
    product.subcategory,
    product.category,
    product.brand,
    ...(Array.isArray(product.grants) ? product.grants.map((g) => g.name) : [])
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  if (String(product.id || '').startsWith('etl_')) score += 2;
  if (product.imageUrl) score += 5;
  const grants = product.grants || [];
  if (grants.length) score += grants.length * 2;

  const equipTokens = [
    'oven',
    'fridge',
    'freezer',
    'steamer',
    'combi',
    'refrigerat',
    'kitchen',
    'hvac',
    'heat pump',
    'boiler',
    'wok',
    'dishwasher',
    ...extraTokens
  ];
  equipTokens.forEach((token) => {
    if (q.includes(token) && hay.includes(token)) score += 8;
  });

  if (profile.sector === 'restaurant' && /food|kitchen|combi|oven|refrigerat|steamer/i.test(hay)) {
    score += 6;
  }
  if (profile.focus === 'equipment' && /food|kitchen|appliance|combi|oven|freezer/i.test(hay)) {
    score += 4;
  }
  if (profile.focus === 'energy' && /heat pump|hvac|boiler/i.test(hay)) {
    score += 4;
  }

  return score;
}

async function loadShowcaseConfig(showcasePath) {
  try {
    const raw = await fs.readFile(showcasePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { products: [] };
  }
}

async function pickProductSamples(showcasePath, question, profile = {}, limit = 3, options = {}) {
  const { requireGrants = true, extraTokens = [] } = options;
  const { products } = await loadProductsWithGrants();
  const showcase = await loadShowcaseConfig(showcasePath);
  const byId = new Map(products.map((p) => [String(p.id), p]));

  const eligible = products.filter((p) => {
    const grants = Array.isArray(p.grants) ? p.grants : [];
    const hasGrants = requireGrants ? grants.length > 0 : true;
    return p.id && hasGrants && p.imageUrl;
  });

  const curated = [];
  for (const row of showcase.products || []) {
    const product = byId.get(String(row.id));
    if (product) {
      const sample = toProductSample(product, row.label);
      if (row.imageUrl) sample.imageUrl = normalizeImageUrl(row.imageUrl);
      curated.push(sample);
    }
    if (curated.length >= limit) break;
  }

  if (!String(question || '').trim() || String(question).length < 4) {
    return curated.slice(0, limit);
  }

  const ranked = eligible
    .map((p) => ({ p, score: scoreProductForQuery(p, question, profile, extraTokens) }))
    .filter((row) => row.score > 5)
    .sort((a, b) => b.score - a.score);

  const dynamic = [];
  const seen = new Set();
  for (const { p } of ranked) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    dynamic.push(toProductSample(p));
    if (dynamic.length >= limit) break;
  }

  if (dynamic.length >= limit) return dynamic.slice(0, limit);

  const merged = [...dynamic];
  for (const sample of curated) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === sample.id)) merged.push(sample);
  }
  return merged.slice(0, limit);
}

async function getDefaultProductSamples(showcasePath, limit = 3, options = {}) {
  return pickProductSamples(showcasePath, '', {}, limit, options);
}

/**
 * One-line "what this means for you" from profile + intent context (launch mode Track A).
 * @param {object} profile — region, sector, focus
 * @param {object} [context] — topic, intentId, subject
 */
function meaningForProfile(profile = {}, context = {}) {
  const region = profileRegion(profile);
  const sector = String(profile.sector || '').trim().toLowerCase();
  const focus = String(profile.focus || '').trim().toLowerCase();
  const topic = String(context.topic || context.intentId || '').replace(/_/g, ' ').trim();

  const where =
    region && REGION_LABELS[region]
      ? `In **${REGION_LABELS[region]}**`
      : 'For your profile';

  let audience = '';
  if (sector === 'restaurant') {
    audience = 'a **restaurant**';
  } else if (sector && sector !== 'any') {
    audience = `a **${sector}** site`;
  }

  const focusHint =
    focus === 'equipment'
      ? 'equipment upgrades and lifecycle cost'
      : focus === 'energy'
        ? 'energy use and tariffs'
        : focus === 'water'
          ? 'water and utility bills'
          : 'running costs and upgrade timing';

  const topicHint = topic
    ? `this **${topic}** topic`
    : 'these options';

  if (audience) {
    return `${where}, ${topicHint} usually affects **${focusHint}** for ${audience} — not just headline savings.`;
  }
  return `${where}, ${topicHint} is about **${focusHint}** and what you can act on next.`;
}

/**
 * Shared handoff chip builder — replaces duplicated buildHandoffs() per agent over time.
 * @param {object} briefing — agent briefing with handoffs map
 * @param {object} opts
 * @param {string} [opts.question]
 * @param {string} [opts.intentId]
 * @param {Array<{ intents?: string[], keys: string[], prompts?: Record<string,string> }>} [opts.rules]
 * @param {string[]} [opts.fallbackKeys]
 * @param {number} [opts.limit=3]
 */
function buildAgentHandoff(briefing, opts = {}) {
  const h = briefing?.handoffs || {};
  const q = String(opts.question || '').trim();
  const intentId = String(opts.intentId || '').trim();
  const rules = Array.isArray(opts.rules) ? opts.rules : [];
  const fallbackKeys = Array.isArray(opts.fallbackKeys) ? opts.fallbackKeys : [];
  const limit = Math.min(4, Math.max(1, Number(opts.limit) || 3));
  const keys = [];

  for (const rule of rules) {
    const intents = rule.intents || [];
    if (intents.length && !intents.includes(intentId)) continue;
    for (const key of rule.keys || []) {
      if (!keys.includes(key)) keys.push(key);
    }
  }
  if (!keys.length) {
    for (const key of fallbackKeys) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  const out = [];
  const seen = new Set();
  for (const key of keys) {
    const row = h[key];
    if (!row) continue;
    const id = row.agentId || key;
    if (seen.has(id)) continue;
    seen.add(id);
    let defaultPrompt = `Ask ${row.agentName || id} about this topic for my profile`;
    for (const rule of rules) {
      if (rule.prompts?.[key]) {
        defaultPrompt = rule.prompts[key];
        break;
      }
    }
    out.push({
      id,
      name: row.agentName || id,
      href: row.agentPath || '',
      prompt: q || defaultPrompt
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Preset handoff rules — pass to buildAgentHandoff when migrating an agent. */
const MEDIA_HANDOFF_RULES = [
  {
    intents: ['funding_news', 'policy_news', 'country_news', 'monthly_news', 'how_this_helps'],
    keys: ['grantsToAndrieus'],
    prompts: { grantsToAndrieus: 'What grants apply from this sustainability news in my region?' }
  },
  {
    intents: ['energy_prices', 'monthly_news', 'energy_examples', 'overview'],
    keys: ['financeToVincent', 'dealsToZara'],
    prompts: {
      financeToVincent: 'How do current energy prices affect my upgrade payback?',
      dealsToZara: 'What energy or sustainability deals are live this week?'
    }
  },
  {
    intents: ['sustainability_map', 'sustainability_map_explained', 'energy_examples', 'restaurant_videos'],
    keys: ['equipmentToArtemis', 'productsToZyanne'],
    prompts: {
      equipmentToArtemis: 'What ETL equipment matches this map case study?',
      productsToZyanne: 'Find efficient products like those in the map examples'
    }
  }
];

const FINANCE_HANDOFF_RULES = [
  {
    intents: [
      'grants_tab',
      'funding_news',
      'overview',
      'price_upgrade_case',
      'etl_products',
      'green_loans',
      'equipment_finance',
      'bnpl',
      'category'
    ],
    keys: ['grantsToAndrieus'],
    prompts: { grantsToAndrieus: 'Which grants and subsidies fit my upgrade and region?' }
  },
  {
    intents: [
      'energy_prices',
      'price_upgrade_case',
      'compare_tariffs',
      'sustainability_finance_news',
      'funding_news'
    ],
    keys: ['mediaToCheryce'],
    prompts: {
      mediaToCheryce: 'What sustainability news affects energy prices and finance timing?'
    }
  }
];

module.exports = {
  REGION_LABELS,
  PORTAL_LINKS,
  loadIntentsFrom,
  loadSchemes,
  schemeHaystack,
  primaryLink,
  toSuggestion,
  matchIntent,
  profileRegion,
  schemeMatchesRegion,
  scoreScheme,
  rankSchemes,
  formatSchemeBullets,
  withTip,
  toLinkItem,
  resolvePortalPathToRootHref,
  moduleEmbedHref,
  toModuleItem,
  CONVERSATIONAL_ANSWER_RULES,
  conversationalSystemLines,
  agentProfileBlock,
  loadProductsWithGrants,
  normalizeImageUrl,
  marketplaceHref,
  deepDiveHref,
  toProductSample,
  pickProductSamples,
  getDefaultProductSamples,
  meaningForProfile,
  buildAgentHandoff,
  MEDIA_HANDOFF_RULES,
  FINANCE_HANDOFF_RULES
};
