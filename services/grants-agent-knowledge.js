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

async function compareSchemesByIds(idA, idB, profile = {}) {
  const schemes = await loadSchemes();
  const a = schemes.find((s) => s.id === idA);
  const b = schemes.find((s) => s.id === idB);
  if (!a || !b) return null;

  const intents = await loadIntents();
  const tip = (intents.staticTips || [])[0] || '';
  const regionLabel = REGION_LABELS[profile.region] || profile.region || 'your region';
  const sectorLabel = profile.sector || 'your sector';

  const answer = withTip(
    `Here is a side-by-side look at **${a.title}** and **${b.title}** for your **${regionLabel}** / **${sectorLabel}** profile.\n\n` +
      `**${a.title}** is listed as a **${a.type || 'scheme'}**${a.deadline ? ` (deadline noted: ${a.deadline})` : ''}. ` +
      `**${b.title}** is a **${b.type || 'scheme'}**${b.deadline ? ` (deadline noted: ${b.deadline})` : ''}.\n\n` +
      'Use the scheme cards on the right for descriptions, official links, and follow-up questions.',
    tip
  );

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

function portalLinkItems() {
  return [
    toLinkItem(
      'Restaurant schemes portal',
      PORTAL_LINKS.restaurant,
      'Hospitality and restaurant grants in one browseable portal'
    ),
    toLinkItem(
      'EU schemes portal',
      PORTAL_LINKS.eu,
      'EU-wide programmes and cross-border funding'
    ),
    toLinkItem(
      'Finance finder',
      PORTAL_LINKS.finance,
      'Grants, BNPL, equipment finance and loans'
    ),
    toLinkItem(
      'Savings tour · Financial assistance',
      PORTAL_LINKS.savings,
      'Grants tab with finance pathways and tools'
    ),
    toLinkItem(
      'business.gov.nl subsidies finder',
      'https://business.gov.nl/subsidies-and-schemes/?subject=environmental-impact&subject=products-services-and-innovations&subject=international-business',
      'Official Dutch government search hub for subsidies and schemes'
    )
  ];
}

function browsePortalLinks() {
  return [
    toLinkItem('Restaurant schemes portal', PORTAL_LINKS.restaurant, 'Browse all restaurant & hospitality schemes'),
    toLinkItem('Finance finder', PORTAL_LINKS.finance, 'Loans, BNPL and equipment finance')
  ];
}

function buildOverviewAnswer(schemes, tip) {
  const byRegion = {};
  for (const s of schemes) {
    const r = String(s.region || 'eu').toLowerCase();
    byRegion[r] = (byRegion[r] || 0) + 1;
  }
  const statItems = Object.keys(byRegion)
    .sort()
    .map((r) => ({
      label: REGION_LABELS[r] || r.toUpperCase(),
      value: String(byRegion[r])
    }));
  return {
    answer: withTip(
      `Good question — we track **${schemes.length}** active funding schemes in the Greenways catalogue, across several regions.\n\n` +
        'On the right you will see how they break down by country, plus a shortlist of priority schemes that are often a sensible place to start.',
      tip
    ),
    blocks: [{ type: 'stat', items: statItems }],
    suggestions: schemes.filter((s) => s.priority).slice(0, 6).map(toSuggestion)
  };
}

function buildNlHubAnswer(schemes, tip) {
  const hub = schemes.find((s) => s.id === 'nl-business-gov-finder');
  const nlTop = schemes
    .filter((s) => s.region === 'nl' && s.id !== 'nl-business-gov-finder')
    .slice(0, 6);
  const intro = hub
    ? `For Dutch subsidies, **${hub.title}** is the best official starting point — ${String(hub.description || '').slice(0, 160).trim()}\n\n` +
      'I have also pulled related schemes from our NL catalogue on the right — tap a card to open the official page or ask a follow-up.'
    : 'For Dutch subsidies, start with **business.gov.nl** — the official government finder. Related NL schemes from our catalogue are on the right.';
  return {
    answer: withTip(intro, tip),
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
      answer:
        `I could not find schemes tagged for **${label}** in our catalogue just now.\n\n` +
        'Try widening your region filter, or browse the EU schemes portal on the right-hand helpers.',
      suggestions: []
    };
  }
  return {
    answer: withTip(
      `I found **${picked.length}** **${label}** scheme${picked.length === 1 ? '' : 's'} that fit what you are asking about.\n\n` +
        'Each card on the right has a summary and official link — tap **Ask about this** if you want a deeper explanation.',
      tip
    ),
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
    answer: withTip(
      `For **restaurant and hospitality** businesses, these **${picked.length}** schemes mention your sector in our catalogue.\n\n` +
        'Scheme cards are on the right — plus quick links if you want to browse the full restaurant portal or finance finder.',
      tip
    ),
    blocks: [{ type: 'link', items: browsePortalLinks() }],
    suggestions: picked.map(toSuggestion)
  };
}

function buildEquipmentAnswer(schemes, question, profile, tip) {
  const tokens = ['equipment', 'appliance', 'machinery', 'etl', 'efficiency', 'refrigerat', 'oven', 'hvac', 'upgrade'];
  const matches = schemes.filter((s) => tokens.some((t) => schemeHaystack(s).includes(t)));
  const ranked = rankSchemes(matches, question, { ...profile, focus: 'equipment' }, 8);
  const picked = ranked.length ? ranked : matches.slice(0, 8);
  return {
    answer: withTip(
      `Upgrading **kitchen equipment or appliances**? These **${picked.length}** schemes from our catalogue often relate to kit, efficiency, or green investment.\n\n` +
        'When you browse a specific product on the marketplace or equipment deep dive, we also attach matched grants to that item — handy once you know what you are buying.',
      tip
    ),
    suggestions: picked.map(toSuggestion)
  };
}

function buildDeadlinesAnswer(schemes, tip) {
  const withDeadline = schemes
    .filter((s) => s.deadline)
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  if (!withDeadline.length) {
    return {
      answer: withTip(
        'We do not have fixed deadlines recorded for current schemes in the catalogue.\n\n' +
          'That does not mean there is no deadline — open each scheme’s official link to check whether it is open, closing soon, or paused.',
        tip
      ),
      suggestions: []
    };
  }
  return {
    answer: withTip(
      `These **${withDeadline.length}** schemes have a **deadline noted** in our catalogue.\n\n` +
        'Treat the dates on the right as a guide only — always confirm on the official site before you plan around them.',
      tip
    ),
    suggestions: withDeadline.slice(0, 6).map(toSuggestion)
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer: withTip(
      'Not sure where to browse? Greenways keeps a few dedicated tools in one place — restaurant and EU scheme portals, a finance finder for loans and BNPL, and the official Dutch government hub.\n\n' +
        'Pick a tile on the right to jump straight in.',
      tip
    ),
    blocks: [{ type: 'link', items: portalLinkItems() }]
  };
}

function buildProductGrantsAnswer(tip) {
  return {
    answer:
      '**How product grants work on Greenways**\n\n' +
      'Think of it in three simple steps:\n\n' +
      '1. **Schemes live in one catalogue** — we maintain 62+ grants and subsidies in our master schemes list.\n' +
      '2. **Products get matched automatically** — when schemes are updated, we run an enrichment step so each marketplace product can show the grants that apply to it.\n' +
      '3. **You see grants where you shop** — open any product on the marketplace or equipment deep dive and the funding options appear on that page.\n\n' +
      'Sample grant-eligible products are highlighted in the banner above — tap a photo to see a real example.\n\n' +
      `_${tip}_`,
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
    answer: withTip(
      `Based on what you asked — *"${question}"* — here are **${picked.length}** scheme${picked.length === 1 ? '' : 's'} from our catalogue that look like the best fit.\n\n` +
        'Browse the cards on the right and tap **Ask about this** if you want help choosing between them.',
      tip
    ),
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
