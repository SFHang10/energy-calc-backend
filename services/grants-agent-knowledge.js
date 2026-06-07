const path = require('path');
const fs = require('fs/promises');

const intentsPath = path.join(__dirname, '..', 'data', 'grants-agent-intents.json');
const schemesPath = path.join(__dirname, '..', 'schemes.json');
const showcasePath = path.join(__dirname, '..', 'data', 'grants-agent-showcase-products.json');
const GRANTS_PRODUCT_FILES = [
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
  savings: './savings.html'
};

let intentsCache = null;
let productsWithGrantsCache = null;
let showcaseCache = null;

async function loadIntents() {
  if (intentsCache) return intentsCache;
  try {
    const raw = await fs.readFile(intentsPath, 'utf8');
    intentsCache = JSON.parse(raw);
  } catch (_) {
    intentsCache = { intents: [], staticTips: [] };
  }
  return intentsCache;
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

function compareField(label, left, right) {
  return `- **${label}:** ${left || '—'} · ${right || '—'}`;
}

async function compareSchemesByIds(idA, idB, profile = {}) {
  const schemes = await loadSchemes();
  const a = schemes.find((s) => s.id === idA);
  const b = schemes.find((s) => s.id === idB);
  if (!a || !b) return null;

  const intents = await loadIntents();
  const tip = (intents.staticTips || [])[0] || '';
  const regionLabel = REGION_LABELS[profile.region] || profile.region || 'your region';
  const sectorLabel = profile.sector || 'your sector';

  const answer =
    `**${a.title}** vs **${b.title}** — side-by-side for **${regionLabel}** / **${sectorLabel}**:\n\n` +
    `${compareField('Region', String(a.region || '').toUpperCase(), String(b.region || '').toUpperCase())}\n` +
    `${compareField('Type', a.type, b.type)}\n` +
    `${compareField('Deadline', a.deadline, b.deadline)}\n` +
    `${compareField('Relevance', a.relevance, b.relevance)}\n\n` +
    `**${a.title}:** ${String(a.description || '').slice(0, 180)}\n\n` +
    `**${b.title}:** ${String(b.description || '').slice(0, 180)}\n\n` +
    `**Requirements snapshot:**\n` +
    `- ${a.title}: ${String(a.requirements || 'See official link').slice(0, 140)}\n` +
    `- ${b.title}: ${String(b.requirements || 'See official link').slice(0, 140)}\n\n` +
    `**Official links:** ${primaryLink(a)} · ${primaryLink(b)}\n\n_${tip}_`;

  return {
    answer,
    suggestions: [toSuggestion(a), toSuggestion(b)],
    source: 'knowledge',
    intentId: 'compare',
    productSamples: await pickProductSamples(`compare ${a.title} ${b.title}`, profile, 3)
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

function buildOverviewAnswer(schemes, tip) {
  const byRegion = {};
  for (const s of schemes) {
    const r = String(s.region || 'eu').toLowerCase();
    byRegion[r] = (byRegion[r] || 0) + 1;
  }
  const lines = Object.keys(byRegion)
    .sort()
    .map((r) => `- **${REGION_LABELS[r] || r.toUpperCase()}:** ${byRegion[r]} schemes`);
  const hub = schemes.find((s) => s.id === 'nl-business-gov-finder');
  const hubLine = hub
    ? `\n\n**NL starting point:** ${hub.title} — official Dutch subsidies finder.\n→ ${primaryLink(hub)}`
    : '';
  return {
    answer:
      `**Greenways grants catalogue** — **${schemes.length}** active schemes in \`schemes.json\`:\n\n${lines.join('\n')}` +
      hubLine +
      `\n\n**On-site tools:** Restaurant schemes portal · EU schemes portal · Finance finder (loans & BNPL).\n\n_${tip}_`,
    suggestions: schemes.filter((s) => s.priority).slice(0, 6).map(toSuggestion)
  };
}

function buildNlHubAnswer(schemes, tip) {
  const hub = schemes.find((s) => s.id === 'nl-business-gov-finder');
  const nlTop = schemes
    .filter((s) => s.region === 'nl' && s.id !== 'nl-business-gov-finder')
    .slice(0, 6);
  const hubBlock = hub
    ? `**${hub.title}**\n${hub.description}\n\n→ ${primaryLink(hub)}`
    : 'Use https://business.gov.nl/subsidies-and-schemes/';
  const bullets = nlTop.length ? `\n\n**Also in our NL catalogue:**\n${formatSchemeBullets(nlTop, 6)}` : '';
  return {
    answer: `${hubBlock}${bullets}\n\n_${tip}_`,
    suggestions: [hub, ...nlTop].filter(Boolean).map(toSuggestion)
  };
}

function buildRegionAnswer(schemes, region, question, profile, tip) {
  const label = REGION_LABELS[region] || region.toUpperCase();
  const matches = schemes.filter((s) => schemeMatchesRegion(s, region));
  const ranked = rankSchemes(matches, question, { ...profile, region }, 8);
  const picked = ranked.length ? ranked : matches.slice(0, 8);
  if (!picked.length) {
    return {
      answer: `No schemes tagged for **${label}** in the catalogue right now. Try the EU portal or widen your region filter.`,
      suggestions: []
    };
  }
  return {
    answer:
      `**${label} schemes** (${picked.length} shown) — matched to your question:\n\n${formatSchemeBullets(picked)}\n\n_${tip}_`,
    suggestions: picked.map(toSuggestion)
  };
}

function buildSectorAnswer(schemes, sector, question, profile, tip) {
  const tokens = sector === 'restaurant'
    ? ['restaurant', 'hospitality', 'catering', 'food', 'sme', 'kitchen']
    : [sector];
  const matches = schemes.filter((s) => {
    const hay = schemeHaystack(s);
    return tokens.some((t) => hay.includes(t));
  });
  const ranked = rankSchemes(matches, question, { ...profile, sector }, 8);
  const picked = ranked.length ? ranked : matches.slice(0, 8);
  return {
    answer:
      `**Restaurant & hospitality funding** — schemes that mention your sector:\n\n${formatSchemeBullets(picked)}\n\n` +
      `**Browse all:** Restaurant schemes portal (${PORTAL_LINKS.restaurant}) · Finance finder (${PORTAL_LINKS.finance})\n\n_${tip}_`,
    suggestions: picked.map(toSuggestion)
  };
}

function buildEquipmentAnswer(schemes, question, profile, tip) {
  const tokens = ['equipment', 'appliance', 'machinery', 'etl', 'efficiency', 'refrigerat', 'oven', 'hvac', 'upgrade'];
  const matches = schemes.filter((s) => tokens.some((t) => schemeHaystack(s).includes(t)));
  const ranked = rankSchemes(matches, question, { ...profile, focus: 'equipment' }, 8);
  const picked = ranked.length ? ranked : matches.slice(0, 8);
  return {
    answer:
      `**Equipment & appliance grants** — subsidies and tax incentives for upgrades:\n\n${formatSchemeBullets(picked)}\n\n` +
      `**Tip:** Open a product on the marketplace or equipment deep dive — grants are attached per product ID after \`product-grants-integrator.js\` enrichment.\n\n_${tip}_`,
    suggestions: picked.map(toSuggestion)
  };
}

function buildDeadlinesAnswer(schemes, tip) {
  const withDeadline = schemes
    .filter((s) => s.deadline)
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  if (!withDeadline.length) {
    return {
      answer: `No fixed deadlines are recorded in \`schemes.json\` for current rows. Check each scheme's official link for open/close dates.\n\n_${tip}_`,
      suggestions: []
    };
  }
  const bullets = withDeadline.slice(0, 12).map((s) => {
    return `- **${s.title}** — deadline **${s.deadline}** (${s.region?.toUpperCase() || 'EU'})`;
  }).join('\n');
  return {
    answer: `**Schemes with recorded deadlines** (verify on official sites):\n\n${bullets}\n\n_${tip}_`,
    suggestions: withDeadline.slice(0, 6).map(toSuggestion)
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer:
      `**Greenways grant & finance tools:**\n\n` +
      `- Restaurant schemes portal — ${PORTAL_LINKS.restaurant}\n` +
      `- EU schemes portal — ${PORTAL_LINKS.eu}\n` +
      `- Finance finder (grants, BNPL, loans) — ${PORTAL_LINKS.finance}\n` +
      `- Savings tour / Financial assistance — ${PORTAL_LINKS.savings}\n\n` +
      `**Official NL hub:** https://business.gov.nl/subsidies-and-schemes/?subject=environmental-impact&subject=products-services-and-innovations&subject=international-business\n\n_${tip}_`,
    suggestions: []
  };
}

function buildProductGrantsAnswer(tip) {
  return {
    answer:
      `**Product-linked grants on Greenways:**\n\n` +
      `1. Canonical schemes live in **\`schemes.json\`** (62+ rows).\n` +
      `2. Run **\`node product-grants-integrator.js\`** after scheme updates → **\`products-with-grants.json\`**.\n` +
      `3. Marketplace widget, equipment deep dive, and **\`/api/product-widget/:id\`** show grants per **ETL product ID**.\n\n` +
      `Sample marketplace products with grants attached are shown below — open a card to see the full overlay.\n\n_${tip}_`,
    suggestions: []
  };
}

async function readProductsFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.products) ? parsed.products : [];
}

function mergeGrantOverlay(products, overlayById) {
  return products.map((product) => {
    const grants = Array.isArray(product.grants) ? product.grants : [];
    if (grants.length) return product;
    const overlayGrants = overlayById.get(String(product.id));
    if (!overlayGrants || !overlayGrants.length) return product;
    return { ...product, grants: overlayGrants };
  });
}

async function loadProductsWithGrants() {
  if (productsWithGrantsCache) return productsWithGrantsCache;

  const overlayById = new Map();
  for (const filePath of GRANTS_PRODUCT_FILES) {
    if (!filePath.includes('products-with-grants.json')) continue;
    try {
      const rows = await readProductsFile(filePath);
      rows.forEach((product) => {
        const grants = Array.isArray(product.grants) ? product.grants : [];
        if (product.id && grants.length) overlayById.set(String(product.id), grants);
      });
      if (overlayById.size) break;
    } catch (_) {
      /* try next grants-only candidate */
    }
  }

  for (const filePath of GRANTS_PRODUCT_FILES) {
    try {
      const products = mergeGrantOverlay(await readProductsFile(filePath), overlayById);
      productsWithGrantsCache = { products, source: path.basename(filePath) };
      return productsWithGrantsCache;
    } catch (_) {
      /* try next candidate */
    }
  }

  productsWithGrantsCache = { products: [], source: null };
  return productsWithGrantsCache;
}

async function loadShowcaseConfig() {
  if (showcaseCache) return showcaseCache;
  try {
    const raw = await fs.readFile(showcasePath, 'utf8');
    showcaseCache = JSON.parse(raw);
  } catch (_) {
    showcaseCache = { products: [] };
  }
  return showcaseCache;
}

function normalizeImageUrl(imageUrl) {
  const url = String(imageUrl || '').trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return `/product-placement/${url.replace(/^\.?\//, '')}`;
}

function marketplaceHref(productId) {
  return `product-page-v2-marketplace.html?product=${encodeURIComponent(productId)}&fromPopup=true`;
}

function toProductSample(product, label) {
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
    marketplaceHref: marketplaceHref(product.id)
  };
}

function scoreProductForQuery(product, question, profile) {
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
    'boiler'
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

async function pickProductSamples(question, profile = {}, limit = 3) {
  const { products } = await loadProductsWithGrants();
  const showcase = await loadShowcaseConfig();
  const byId = new Map(products.map((p) => [String(p.id), p]));

  const eligible = products.filter((p) => {
    const grants = Array.isArray(p.grants) ? p.grants : [];
    return p.id && grants.length > 0 && p.imageUrl;
  });

  const curated = [];
  for (const row of showcase.products || []) {
    const product = byId.get(String(row.id));
    if (product) curated.push(toProductSample(product, row.label));
    if (curated.length >= limit) break;
  }

  if (!String(question || '').trim() || String(question).length < 4) {
    return curated.slice(0, limit);
  }

  const ranked = eligible
    .map((p) => ({ p, score: scoreProductForQuery(p, question, profile) }))
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

async function getDefaultProductSamples(limit = 3) {
  return pickProductSamples('', {}, limit);
}

function buildKeywordFallback(schemes, question, profile, tip) {
  const ranked = rankSchemes(schemes, question, profile, 8);
  const picked = ranked.length ? ranked : schemes.filter((s) => s.priority).slice(0, 6);
  return {
    answer:
      `**Best scheme matches** for "${question}":\n\n${formatSchemeBullets(picked)}\n\n_${tip}_`,
    suggestions: picked.map(toSuggestion),
    source: 'heuristic'
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntents();
  const schemes = await loadSchemes();
  if (!schemes.length) return null;

  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);

  let result;
  if (!intent) return null;

  switch (intent.answerType) {
    case 'overview':
      result = buildOverviewAnswer(schemes, tip);
      break;
    case 'nl_hub':
      result = buildNlHubAnswer(schemes, tip);
      break;
    case 'region_filter':
      result = buildRegionAnswer(schemes, intent.region, question, profile, tip);
      break;
    case 'sector_match':
      result = buildSectorAnswer(schemes, intent.sector || 'restaurant', question, profile, tip);
      break;
    case 'equipment':
      result = buildEquipmentAnswer(schemes, question, profile, tip);
      break;
    case 'deadlines':
      result = buildDeadlinesAnswer(schemes, tip);
      break;
    case 'portals':
      result = buildPortalsAnswer(tip);
      break;
    case 'product_grants':
      result = buildProductGrantsAnswer(tip);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = intent.id;
    result.productSamples = await pickProductSamples(question, profile, 3);
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  loadSchemes,
  loadIntents,
  rankSchemes,
  matchIntent,
  toSuggestion,
  pickProductSamples,
  getDefaultProductSamples,
  compareSchemesByIds
};
