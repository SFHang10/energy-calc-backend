const path = require('path');
const fs = require('fs/promises');
const {
  PORTAL_LINKS,
  loadIntentsFrom,
  matchIntent,
  loadProductsWithGrants,
  normalizeImageUrl,
  toLinkItem,
  toModuleItem,
  agentProfileBlock
} = require('./greenways-agent-shared');
const { mergeModuleRow, loadRegistrySync, getModuleById, enrichKnowledgeAnswer } = require('./greenways-content-modules');
const { resolveGlossaryFromIntent, tryBuildGlossaryAnswer } = require('./greenways-sustainability-glossary');
const {
  applyPersona,
  loadAgentVoice,
  pickTip
} = require('./greenways-agent-persona');
const {
  buildHandoffTopicSummary,
  isReferralWelcomePair
} = require('./greenways-agent-handoff');

const intentsPath = path.join(__dirname, '..', 'data', 'deals-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'deals-agent-showcase.json');
const dealsFeedPath = path.join(__dirname, '..', 'data', 'deals-feed.json');
const briefingPath = path.join(__dirname, '..', 'data', 'deals-agent-briefing.json');
const voicePath = path.join(__dirname, '..', 'data', 'deals-agent-voice.json');
const referencesPath = path.join(__dirname, '..', 'data', 'deals-agent-references.json');

const REGION_LABELS = { nl: 'Netherlands', uk: 'United Kingdom', eu: 'EU-wide' };

const DEALS_MODULE = { theme: 'deals', agentName: 'Zara' };

const PORTAL_PATH_MODULE_IDS = [
  ['deals.html', 'deals-full-page'],
  ['european_energy_deals_portal', 'european-energy'],
  ['deals-ticker-hub', 'deals-ticker'],
  ['water-saving-finder', 'water-saving-finder'],
  ['sustainable_product_deal_finder_portal', 'sustainable-product-finder'],
  ['savings.html', 'savings-tour'],
  ['finance-finder-restaurant', 'finance-finder'],
  ['low%20energy%20new', 'low-energy-equipment']
];

function isAgentChatPath(path) {
  return /^\/greenways\//.test(String(path || '').trim());
}

function portalPathToModuleId(path) {
  const hay = String(path || '').toLowerCase();
  if (!hay || isAgentChatPath(path)) return '';
  for (const [needle, moduleId] of PORTAL_PATH_MODULE_IDS) {
    if (hay.includes(needle.toLowerCase())) return moduleId;
  }
  return '';
}

function dealsModuleBlock(rows) {
  const registry = loadRegistrySync();
  return {
    type: 'module',
    items: rows.map((row) => {
      const mod = getModuleById(registry, row.moduleId);
      const punch = String(row.usageHint || '').trim();
      const registryUsage = String(mod?.usageHint || '').trim();
      const merged = mergeModuleRow({ ...row, usageHint: '' });
      if (punch && punch !== merged.description) {
        merged.usageHint = registryUsage && registryUsage !== punch
          ? `${punch} — ${registryUsage}`
          : (registryUsage || punch);
      }
      return toModuleItem({ ...DEALS_MODULE, ...merged });
    })
  };
}

function linkOrModuleBlocks(items) {
  const modules = [];
  const links = [];
  for (const item of items) {
    if (/^https?:\/\//i.test(item.url)) {
      links.push(item);
      continue;
    }
    const moduleId = portalPathToModuleId(item.url);
    if (moduleId) {
      modules.push({
        moduleId,
        title: item.title,
        usageHint: item.description || item.usageHint || '',
        openSize: 'near-full'
      });
    } else {
      links.push(item);
    }
  }
  const blocks = [];
  if (modules.length) blocks.push(dealsModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

let dealsCache = null;

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

  if (['product_deals', 'sustainability_deals', 'sustainable', 'deals_feed_scan', 'new_deals'].includes(intentId) || intentId === 'category') {
    push('productsToZyanne', 'Search water-saving and efficient products in the sustainable catalog');
  }
  if (['tariff_compare', 'nl_restaurant_energy', 'uk_green_tariff', 'green_tariff', 'energy_deals', 'overview', 'tariff_basics', 'payback_savings', 'deals_feed_scan'].includes(intentId)) {
    push('financeToVincent', 'How do current energy prices affect my upgrade payback?');
  }
  if (['product_deals', 'sustainability_deals', 'category'].includes(intentId)) {
    push('equipmentToArtemis', 'What ETL equipment upgrades pair with current deals?');
  }
  if (['eligibility_grants', 'water_deals', 'sustainability_deals', 'savings_portal', 'water_finder'].includes(intentId)) {
    push('grantsToAndrieus', 'What grants and rebates am I eligible for in my region?');
  }
  if (!out.length) {
    push('productsToZyanne', 'Find efficient products beyond the deals feed spotlights');
  }
  return out.slice(0, 3);
}

function dealsTariffBlocks(limit = 3) {
  return linkOrModuleBlocks(dealsPortalLinkItems().slice(0, limit));
}

function dealsEnergyBlocks() {
  return linkOrModuleBlocks([
    toLinkItem('European energy portal', PORTAL_LINKS.europeanEnergy, 'Compare tariffs & packages'),
    toLinkItem('Full Deals page', PORTAL_LINKS.dealsFullPage, 'Ticker hub + sidebar portals'),
    toLinkItem('Deals ticker hub', PORTAL_LINKS.deals, 'Three lanes + search')
  ]);
}

function dealsSpotlightBlocks() {
  return linkOrModuleBlocks([
    toLinkItem('Full Deals page', PORTAL_LINKS.dealsFullPage, 'Ticker hub + sidebar portals'),
    toLinkItem('Deals ticker hub', PORTAL_LINKS.deals, 'Three lanes + search'),
    toLinkItem('Sustainable Products Agent', PORTAL_LINKS.sustainableProductsAgent, 'Full catalog search')
  ]);
}

function dealsPortalLinkItems() {
  return [
    toLinkItem('European energy portal', PORTAL_LINKS.europeanEnergy, 'Compare tariffs & packages'),
    toLinkItem('Water Saving Finder', './water-saving-finder.html', 'Water products, tips & grants'),
    toLinkItem('Savings portal', PORTAL_LINKS.savingsHub || './savings.html', 'Grants & financial assistance'),
    toLinkItem('Full Deals page', PORTAL_LINKS.dealsFullPage, 'Ticker hub + sidebar portals'),
    toLinkItem('Deals ticker hub', PORTAL_LINKS.deals, 'Three lanes + search'),
    toLinkItem('Sustainable Products Agent', PORTAL_LINKS.sustainableProductsAgent, 'Full catalog search')
  ];
}

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

function buildOverviewAnswer(deals, feedMeta, briefing, tip) {
  const energy = filterByCategory(deals, 'energy').length;
  const water = filterByCategory(deals, 'water').length;
  const sust = filterByCategory(deals, 'sustainability').length;
  const productSpotlights = deals.filter(isProductDealRow).length;
  const newest = deals.filter((d) => d.isNew).slice(0, 4);
  const generated = feedMeta?.generatedAt ? `\n_Feed generated: ${String(feedMeta.generatedAt).slice(0, 10)}_\n\n` : '';

  return {
    answer:
      agentProfileBlock(
        `**Zara — Deals & spotlights**`,
        briefing.roleSummary || 'Curated deals across energy, water, and sustainability lanes.'
      ) +
      `**${deals.length}** rows in the **deals feed**:\n` +
      `- **Energy tariffs & packages:** ${energy}\n` +
      `- **Water savings:** ${water}\n` +
      `- **Sustainability lane:** ${sust} (**${productSpotlights}** product spotlight${productSpotlights === 1 ? '' : 's'})\n\n` +
      generated +
      (newest.length ? `**Recently added:**\n${formatDealBullets(newest, 4)}\n\n` : '') +
      `**Two paths:** (1) **Supply** — compare tariffs on the energy portal; (2) **Product spotlights** — weekly offers here; **full catalog** → Sustainable Products Agent.\n\n` +
      portalFooter(tip),
    blocks: linkOrModuleBlocks(dealsPortalLinkItems()),
    suggestions: []
  };
}

function buildWhyDealsAnswer(briefing, tip) {
  const core = (briefing.coreUnderstandings || []).slice(0, 5);
  const ethics = (briefing.ethicsNotes || []).slice(0, 2);
  const statLabels = ['Usage match', 'True savings', 'Stack upgrades', 'Confirm live', 'Catalog lane'];
  const statItems = core.slice(0, 4).map((line, i) => ({
    label: statLabels[i] || 'Principle',
    value: String(line).length > 52 ? `${String(line).slice(0, 49)}…` : line
  }));

  return {
    answer:
      `**Why Zara curates deals**\n\n` +
      `${briefing.bestOfferPrinciple || ''}\n\n` +
      `I match tariffs, grants, rebates, and upgrade offers to how you actually consume — not the loudest headline price.\n\n` +
      (ethics.length ? `${ethics.join(' ')}\n\n` : '') +
      `Use the portal cards on the right to compare unit rate, contract length, and region before you switch.\n\n` +
      `_${tip}_`,
    blocks: [
      ...(statItems.length ? [{ type: 'stat', items: statItems }] : []),
      ...linkOrModuleBlocks(dealsPortalLinkItems().slice(0, 4))
    ],
    suggestions: []
  };
}

function buildTariffBasicsAnswer(briefing, tip) {
  const basics = briefing.tariffBasics || [];
  return {
    answer:
      `**Energy tariff basics** — what to compare before switching:\n\n` +
      `${basics.map((b) => `- ${b}`).join('\n')}\n\n` +
      `**Live compare:** ${PORTAL_LINKS.europeanEnergy}\n\n` +
      `For unit-cost impact on upgrades after you pick a direction → **Vincent**. Even on a better tariff, **efficient equipment** lowers the kWh you buy — open the **low energy equipment guide** on the right.\n\n` +
      portalFooter(tip),
    blocks: [
      ...linkOrModuleBlocks([
        toLinkItem('European energy portal', PORTAL_LINKS.europeanEnergy, 'Postcode-style compare'),
        toLinkItem('Finance Agent', '/greenways/finance-agent', 'Prices & payback')
      ]),
      dealsModuleBlock([
        {
          moduleId: 'low-energy-equipment',
          usageHint: 'See how efficient equipment cuts demand — stack on top of a better tariff'
        }
      ])
    ],
    suggestions: []
  };
}

function buildEligibilityGrantsAnswer(briefing, tip) {
  const must = (briefing.mustKnows || []).filter((m) => /eligib|grant|rebate/i.test(m)).slice(0, 4);
  return {
    answer:
      `**Eligibility & grants** — many offers depend on property type, income, business size, geography, or heating system.\n\n` +
      `${must.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**On Greenways:**\n` +
      `- **Savings portal** — ${PORTAL_LINKS.savingsHub || './savings.html'} (Grants · EU schemes · Financial assistance)\n` +
      `- **Andrieus (Grants Agent)** — scheme compare, deadlines, and product-linked grants\n\n` +
      `_Zara flags deal lanes; Andrieus confirms eligibility._\n\n` +
      portalFooter(tip),
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'eligibility_grants')
  };
}

function buildPaybackSavingsAnswer(briefing, tip) {
  return {
    answer:
      `**Payback & real savings**\n\n` +
      `- **Lifetime cost** — purchase, install, maintenance, and running kWh/gas/water all count.\n` +
      `- **Tariff direction** — compare unit rate + standing charge on ${PORTAL_LINKS.europeanEnergy}\n` +
      `- **Upgrade stack** — businesses often pair deals with controls, heat pumps, solar, or monitoring (Artemis / Edwardo)\n` +
      `- **Finance case** — Vincent models payback, BNPL, and green loans after numbers look sensible\n\n` +
      `${briefing.bestOfferPrinciple || ''}\n\n` +
      `Even when you find a good deal on supply, **efficient equipment** lowers the kWh you still pay for — open the guide on the right.\n\n` +
      portalFooter(tip),
    blocks: [
      ...linkOrModuleBlocks([
        toLinkItem('European energy portal', PORTAL_LINKS.europeanEnergy, 'Normalise €/kWh first'),
        toLinkItem('Finance Agent', '/greenways/finance-agent', 'Payback & funding'),
        toLinkItem('Equipment savings projection', PORTAL_LINKS.savingsProjection, 'Upgrade payback chart')
      ]),
      dealsModuleBlock([
        {
          moduleId: 'low-energy-equipment',
          usageHint: 'Control bills two ways — cut demand with efficient equipment, not tariffs alone'
        }
      ])
    ],
    suggestions: []
  };
}

function buildWaterFinderAnswer(deals, tip) {
  const waterRows = filterByCategory(deals, 'water').slice(0, 4);
  return {
    answer:
      `**Water savings on Greenways**\n\n` +
      `**Water Saving Finder** — products, tips, grants, and savings calculator:\n` +
      `→ ./water-saving-finder.html\n\n` +
      (waterRows.length
        ? `**Feed rows:**\n${formatDealBullets(waterRows, 4)}\n\n`
        : '') +
      `Focus: leak reduction, efficient fixtures, submetering before grant-funded retrofit.\n\n` +
      portalFooter(tip),
    blocks: linkOrModuleBlocks([
          toLinkItem('Water Saving Finder', './water-saving-finder.html', 'Full water portal'),
          toLinkItem('Grants Agent', '/greenways/grants-agent', 'Water-related schemes')
        ]),
    suggestions: []
  };
}

function buildSavingsPortalAnswer(briefing, tip) {
  const paths = briefing.portalPaths || {};
  const savingsHref = paths.savingsPortal || PORTAL_LINKS.savingsHub || './savings.html';

  return {
    answer:
      `I'm **Zara**. When you ask about the **savings portal**, you're really asking where Greenways pulls **grants and financial help** together — the step after you know *what* you want to change, not just where to buy energy.\n\n` +
      `Our **Savings tour** page is that hub. It groups three paths in plain view: **restaurant grants**, **EU schemes**, and **financial assistance** (things like BNPL, equipment finance, and green loans). I point people here once a tariff or product direction makes sense and the next question is "how do I pay for it?" — grants can lower upfront cost, finance spreads it, and the EU tab covers wider schemes.\n\n` +
      `On your sustainable journey, I'd usually compare supply on the **European energy portal** first if bills are the driver, then open the savings tab that matches (grant vs loan vs EU catalogue). **Andrieus** is who I send you to for scheme eligibility and side-by-side compare; **Vincent** for payback and which finance option fits your numbers.\n\n` +
      `The tablets on the right open the savings tour, finance finder, and grants chat — each says what it is and how it can help. Would you like the restaurant grants tab or financial assistance first?\n\n` +
      `_${tip}_`,
    blocks: linkOrModuleBlocks([
      toLinkItem(
        'Savings tour',
        savingsHref,
        'Start here — grants, EU schemes, and financial assistance in one walkthrough.'
      ),
      toLinkItem(
        'Restaurant finance finder',
        './finance-finder-restaurant.html',
        'Open the **Financial assistance** lane — BNPL, equipment finance, and green loans with examples.'
      ),
      toLinkItem(
        'Grants Agent (Andrieus)',
        '/greenways/grants-agent',
        'Scheme detail, deadlines, and compare when you know your upgrade category.'
      ),
      toLinkItem(
        'European energy portal',
        PORTAL_LINKS.europeanEnergy,
        'Compare tariffs first — unit rate shapes every grant and payback story that follows.'
      )
    ]),
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, 'savings portal grants financial assistance', 'savings_portal')
  };
}

function buildFeedFreshnessAnswer(feedMeta, briefing, tip) {
  const wf = briefing.feedWorkflow || {};
  return {
    answer:
      `**Deals feed freshness**\n\n` +
      `The **deals feed** is rebuilt from curated seeds and weekly product input.` +
      (feedMeta?.generatedAt ? ` Last updated **${feedMeta.generatedAt}**.\n` : '\n') +
      `\nWeekly product spotlights are merged in when the feed is refreshed. **Edwardo** can run read-only freshness checks if you need ops detail.\n\n` +
      portalFooter(tip),
    suggestions: []
  };
}

async function buildRoleResourcesAnswer(question, briefing, tip) {
  const refs = await loadReferences();
  const guides = refs.internalGuides || [];
  const must = (briefing.mustKnows || []).slice(0, 6);

  return {
    answer:
      agentProfileBlock(`**Zara — role & references**`, briefing.roleProfile || '') +
      `**Must-know:**\n${must.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**Greenways pages:**\n${guides.map((g) => `- **${g.title}** — ${g.summary}`).join('\n')}\n\n` +
      portalFooter(tip),
    blocks: linkOrModuleBlocks(guides.slice(0, 6).map((g) => toLinkItem(g.title, g.href, g.summary))),
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
    suggestions: [],
    blocks: linkOrModuleBlocks([
          toLinkItem('Sustainable Products Agent', PORTAL_LINKS.sustainableProductsAgent, 'Full catalog search'),
          toLinkItem('Product deal finder', './sustainable_product_deal_finder_portal.html', 'Category search')
        ])
  };
}

function buildTariffCompareAnswer(deals, briefing, tip) {
  const energy = filterByCategory(deals, 'energy');
  const flagship = findDealById(deals, 'energy-eu-compare') || energy[0];
  const rows = flagship ? [flagship, ...energy.filter((d) => d.id !== flagship?.id)].slice(0, 5) : energy.slice(0, 5);
  const basics = (briefing?.tariffBasics || []).slice(0, 2);
  return {
    answer:
      `**Compare energy tariffs & packages** — match supply to your **usage pattern**, not headline price alone.\n\n` +
      (basics.length ? `${basics.map((b) => `- ${b}`).join('\n')}\n\n` : '') +
      `${formatDealBullets(rows, 5) || '_Energy lane empty — open the portal directly._'}\n\n` +
      `→ **Live compare:** ${PORTAL_LINKS.europeanEnergy}` +
      portalFooter(tip),
    suggestions: [],
    blocks: linkOrModuleBlocks(dealsPortalLinkItems().slice(0, 3))
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
    suggestions: [],
    blocks: dealsEnergyBlocks()
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
    suggestions: [],
    blocks: dealsEnergyBlocks()
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
    suggestions: [],
    blocks: dealsEnergyBlocks()
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
    suggestions: [],
    blocks: dealsEnergyBlocks()
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
    suggestions: [],
    blocks: category === 'sustainability'
      ? dealsSpotlightBlocks()
      : category === 'water'
        ? linkOrModuleBlocks([
            toLinkItem('Water Saving Finder', './water-saving-finder.html', 'Water products, tips & grants'),
            toLinkItem('Deals ticker hub', PORTAL_LINKS.deals, 'Three lanes + search')
          ])
        : dealsTariffBlocks(2)
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
    suggestions: [],
    blocks: region === 'NL' || region === 'UK' ? dealsEnergyBlocks() : dealsTariffBlocks(3)
  };
}

async function buildNewDealsAnswer(deals, tip) {
  return buildDealsFeedScanAnswer(deals, {}, {}, 'new deals this week', tip, { focus: 'new' });
}

function shouldTryDealsFeedScan(question) {
  const q = String(question || '').toLowerCase();
  return /\b(check|scan|look at|refresh)\b.*\b(deals?|feed)\b/.test(q) ||
    /\b(interesting|new).*\b(deals?|market)\b/.test(q) ||
    /\bdeals?\s+feed\s+now\b/.test(q);
}

function rankDealsForScan(deals, question, profile) {
  return deals
    .map((d) => ({ d, score: scoreDeal(d, question, profile) + (d.isNew ? 6 : 0) }))
    .sort((a, b) => b.score - a.score);
}

function pickDealsForScan(deals, question, profile, limit = 5) {
  const ranked = rankDealsForScan(deals, question, profile);
  const pr = String(profile.region || '').toLowerCase();
  const picks = [];
  const seen = new Set();
  const add = (d) => {
    if (!d || seen.has(d.id) || picks.length >= limit) return;
    seen.add(d.id);
    picks.push(d);
  };

  for (const { d } of ranked) {
    if (d.isNew) add(d);
  }
  if (pr) {
    for (const { d } of ranked) {
      const region = String(d.region || '').toLowerCase();
      if (region === pr || region === 'eu') add(d);
    }
  }
  for (const { d } of ranked) add(d);
  return picks;
}

function dealsFeedStatItems(feedMeta, deals, profile) {
  const generated = feedMeta?.generatedAt ? String(feedMeta.generatedAt).slice(0, 10) : '—';
  const pr = String(profile.region || '').toLowerCase();
  const regionPicks = pr
    ? deals.filter((d) => String(d.region || '').toLowerCase() === pr || String(d.region || '').toUpperCase() === 'EU').length
    : filterByCategory(deals, 'energy').length;
  return [
    { label: 'Feed updated', value: generated },
    { label: 'Rows in feed', value: String(deals.length) },
    { label: 'New highlights', value: String(deals.filter((d) => d.isNew).length) },
    {
      label: pr ? `${REGION_LABELS[pr] || pr.toUpperCase()} rows` : 'Energy lane',
      value: String(regionPicks)
    }
  ];
}

async function dealSamplesFromDeals(dealRows, limit = 3) {
  const showcase = await loadDealsShowcase();
  const { products } = await loadProductsWithGrants();
  const productById = new Map(products.map((p) => [String(p.id), p]));
  const samples = [];
  for (const deal of dealRows) {
    const imageUrl = await resolveDealImage(deal, showcase, productById);
    samples.push(toDealSample(deal, imageUrl));
    if (samples.length >= limit) break;
  }
  return samples;
}

async function buildDealsFeedScanAnswer(deals, feedMeta, profile, question, tip, options = {}) {
  const { focus = 'all' } = options;
  const generated = feedMeta?.generatedAt ? String(feedMeta.generatedAt).slice(0, 10) : 'recently';
  const pr = String(profile.region || '').toLowerCase();
  const newCount = deals.filter((d) => d.isNew).length;
  const spotlightCount = deals.filter(isProductDealRow).length;

  let picks = pickDealsForScan(deals, question, profile, 5);
  if (focus === 'new') {
    picks = deals.filter((d) => d.isNew).slice(0, 5);
    if (!picks.length) picks = pickDealsForScan(deals, question, profile, 5);
  }

  const statItems = dealsFeedStatItems(feedMeta, deals, profile);
  const profileNote = pr ? ` for **${REGION_LABELS[pr] || pr.toUpperCase()}**` : '';

  const intro =
    (focus === 'new'
      ? `I checked the deals feed for **new highlights** (last built **${generated}**).\n\n`
      : `I checked the **deals feed** just now (last built **${generated}**).\n\n`) +
    `There are **${deals.length}** curated rows — **${newCount}** flagged as new` +
    (spotlightCount ? ` and **${spotlightCount}** product spotlight${spotlightCount === 1 ? '' : 's'}` : '') +
    `.\n\n` +
    `On the right are live examples${profileNote} — open a card for tariffs, water savings, or product spotlights on the live portal.\n\n` +
    `_Prices and contract terms change — confirm on the linked page before switching._`;

  const linkItems = picks.map((d) =>
    toLinkItem(
      `${d.isNew ? '🆕 ' : ''}${d.title || d.id}`,
      dealHref(d),
      `${String(d.line || d.category || 'Deal').slice(0, 90)} · ${d.region || 'EU'}`
    )
  );

  const blocks = [
    { type: 'stat', items: statItems },
    ...linkOrModuleBlocks([
      ...linkItems,
      toLinkItem('Deals ticker hub', PORTAL_LINKS.deals, 'Search all three lanes'),
      toLinkItem('European energy portal', PORTAL_LINKS.europeanEnergy, 'Live tariff compare')
    ])
  ];

  const productSamples = await dealSamplesFromDeals(picks, 3);

  return {
    answer: `${intro}\n\n_${tip}_`,
    suggestions: [],
    blocks,
    productSamples,
    intentId: focus === 'new' ? 'new_deals' : 'deals_feed_scan'
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
    suggestions: [],
    blocks: linkOrModuleBlocks([
      toLinkItem('Full Deals page', PORTAL_LINKS.dealsFullPage, 'Ticker + sidebar portals'),
      toLinkItem('European energy portal', PORTAL_LINKS.europeanEnergy, 'Tariff compare'),
      toLinkItem('Deals ticker hub', PORTAL_LINKS.deals, 'Three lanes + search')
    ])
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
    suggestions: [],
    blocks: linkOrModuleBlocks(dealsPortalLinkItems())
  };
}

async function buildReferralWelcomeAnswer(question, profile, tip, deals, feedMeta, briefing) {
  const handoff = profile.handoff;
  if (!isReferralWelcomePair('deals-agent', handoff)) return null;
  if (!deals.length) return null;

  const fromName = handoff.fromName || 'Another specialist';
  const topic =
    handoff.topicSummary ||
    buildHandoffTopicSummary(
      handoff.fromSlug,
      handoff.fromIntentId,
      profile,
      handoff.question || question,
      handoff.summary
    );
  const searchQ = handoff.question || question;
  const scan = await buildDealsFeedScanAnswer(deals, feedMeta, profile, searchQ, tip);
  const fromProducts = handoff.fromSlug === 'sustainable-products-agent';
  const fromMedia = handoff.fromSlug === 'media-agent';
  const lead =
    fromProducts
      ? 'live deal spotlights that may match your product lane'
      : fromMedia
        ? 'tariff and offer lanes after energy-price or policy news'
        : 'curated deals from the weekly feed';
  const scanBody = String(scan.answer || '').replace(/\n\n_[\s\S]*_$/, '');

  return {
    ...scan,
    answer:
      `**${fromName}** suggested you continue with me for **${lead}**.\n\n` +
      `From your chat: _${topic}_\n\n` +
      `${scanBody}\n\n_${tip}_`,
    intentId: 'agent_referral_welcome',
    agentHandoffs: buildHandoffs(briefing, searchQ, 'agent_referral_welcome')
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntents();
  const voice = await loadAgentVoice(voicePath);
  const briefing = await loadBriefing();
  const feed = await loadDealsFeed();
  const deals = Array.isArray(feed.deals) ? feed.deals : [];
  if (!deals.length) return null;

  const referralTip = pickTip(intents.staticTips, 'agent_referral_welcome', {
    skipIntentIds: voice.skipTipIntents
  });
  if (profile.handoff) {
    const referral = await buildReferralWelcomeAnswer(
      question,
      profile,
      referralTip,
      deals,
      feed.meta || {},
      briefing
    );
    if (referral?.answer) {
      referral.source = 'knowledge';
      applyPersona(referral, {
        voice,
        intentId: 'agent_referral_welcome',
        question,
        profile,
        staticTips: intents.staticTips,
        tip: referralTip
      });
      return referral;
    }
  }

  const intent = matchIntent(question, intents);
  const tip = pickTip(
    intents.staticTips,
    intent?.id,
    { skipIntentIds: voice.skipTipIntents }
  );

  let result = resolveGlossaryFromIntent(intent, question, profile, tip, 'deals');
  if (!result && !intent && shouldTryDealsFeedScan(question)) {
    result = await buildDealsFeedScanAnswer(deals, feed.meta || {}, profile, question, tip);
  } else if (!result && !intent) {
    result = tryBuildGlossaryAnswer(question, profile, tip, { agentKey: 'deals', minScore: 24 });
    if (!result) return null;
  } else if (!result && intent) {
  switch (intent.answerType) {
    case 'overview':
      result = buildOverviewAnswer(deals, feed.meta || {}, briefing, tip);
      break;
    case 'why_deals':
      result = buildWhyDealsAnswer(briefing, tip);
      break;
    case 'tariff_basics':
      result = buildTariffBasicsAnswer(briefing, tip);
      break;
    case 'eligibility_grants':
      result = buildEligibilityGrantsAnswer(briefing, tip);
      break;
    case 'payback_savings':
      result = buildPaybackSavingsAnswer(briefing, tip);
      break;
    case 'water_finder':
      result = buildWaterFinderAnswer(deals, tip);
      break;
    case 'savings_portal':
      result = buildSavingsPortalAnswer(briefing, tip);
      break;
    case 'feed_freshness':
      result = buildFeedFreshnessAnswer(feed.meta || {}, briefing, tip);
      break;
    case 'role_resources':
      result = await buildRoleResourcesAnswer(question, briefing, tip);
      break;
    case 'tariff_compare':
      result = buildTariffCompareAnswer(deals, briefing, tip);
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
      result.intentId = intent.id === 'energy_deals' ? 'energy_deals' : intent.id;
      break;
    case 'region':
      result = buildRegionAnswer(intent.region, deals, tip);
      break;
    case 'new_deals':
      result = await buildNewDealsAnswer(deals, tip);
      break;
    case 'deals_feed_scan':
      result = await buildDealsFeedScanAnswer(deals, feed.meta || {}, profile, question, tip);
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
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = result.intentId || intent?.id || 'sustainability_glossary';
    result.agentHandoffs = buildHandoffs(briefing, question, result.intentId);
    if (!result.productSamples?.length) {
      result.productSamples = await pickDealSamples(question, profile, 3);
    }
    enrichKnowledgeAnswer(result, {
      agentKey: 'deals',
      question,
      intentId: result.intentId,
      profile
    });
    applyPersona(result, {
      voice,
      intentId: result.intentId,
      question,
      profile,
      staticTips: intents.staticTips,
      regionLabels: REGION_LABELS,
      tip
    });
  }
  return result;
}

function getDefaultPortalBlocks(limit = 4) {
  return linkOrModuleBlocks(dealsPortalLinkItems().slice(0, limit));
}

module.exports = {
  answerFromKnowledge,
  pickDealSamples,
  loadBriefing,
  loadReferences,
  buildDealsFeedScanAnswer,
  getDefaultPortalBlocks,
  getDefaultProductSamples: (limit = 3) => pickDealSamples('', {}, limit)
};
