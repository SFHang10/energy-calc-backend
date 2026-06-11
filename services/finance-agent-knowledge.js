const path = require('path');
const fs = require('fs/promises');
const {
  PORTAL_LINKS,
  REGION_LABELS,
  loadIntentsFrom,
  loadSchemes,
  matchIntent,
  rankSchemes,
  formatSchemeBullets,
  toSuggestion,
  withTip,
  toLinkItem,
  pickProductSamples,
  getDefaultProductSamples
} = require('./greenways-agent-shared');

const intentsPath = path.join(__dirname, '..', 'data', 'finance-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'finance-agent-showcase.json');
const {
  loadEnergySnapshot,
  formatModellingTariffLine,
  formatWholesaleBullets,
  volatilityHint
} = require('./finance-agent-energy');

const FINANCE_KEYWORDS = ['loan', 'finance', 'leasing', 'lease', 'bnpl', 'credit', 'lending', 'warmtefonds', 'bmkb'];

async function loadIntents() {
  return loadIntentsFrom(intentsPath);
}

async function loadFinanceShowcase() {
  try {
    const raw = await fs.readFile(showcasePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { products: [], financeHeroes: [] };
  }
}

async function pickFinanceSamples(question, profile = {}, limit = 3) {
  const products = await pickProductSamples(showcasePath, question, profile, limit);
  if (products.length >= limit) return products;

  const showcase = await loadFinanceShowcase();
  const heroes = (showcase.financeHeroes || []).slice(0, limit - products.length).map((h) => ({
    id: h.id,
    name: h.name,
    label: h.label,
    imageUrl: h.imageUrl,
    subcategory: 'Finance finder',
    topGrants: ['Grants & loans'],
    grantsCount: 0,
    marketplaceHref: h.href || PORTAL_LINKS.finance
  }));

  const merged = [...products];
  for (const hero of heroes) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === hero.id)) merged.push(hero);
  }
  return merged.slice(0, limit);
}

function financeSchemes(schemes) {
  return schemes.filter((s) => {
    const hay = [s.title, s.description, s.type, ...(s.keywords || [])].join(' ').toLowerCase();
    return FINANCE_KEYWORDS.some((k) => hay.includes(k)) || /subsidy|grant|tax/i.test(String(s.type || ''));
  });
}

async function buildOverviewAnswer(schemes, profile, tip) {
  const snapshot = await loadEnergySnapshot();
  const market = formatWholesaleBullets(snapshot, profile, 2).join('\n');
  return {
    answer:
      `**Greenways Finance Agent** — funding **and** the energy-price story for upgrades:\n\n` +
      `- **Grants & subsidies** — non-repayable scheme support (same catalogue as Grants Agent)\n` +
      `- **BNPL** — split equipment payments where providers allow\n` +
      `- **Equipment finance** — leases & hire purchase for kitchen kit\n` +
      `- **Green loans** — BMKB-Groen, warmtefonds-style bank products\n` +
      `- **Europe** — EU-wide programmes & cross-border lenders\n` +
      `- **Energy prices** — wholesale ticker + tariff tools; use moves in unit cost to justify efficient equipment\n\n` +
      (market ? `**Market snapshot (wholesale guide):**\n${market}\n\n` : '') +
      `Finance finder: ${PORTAL_LINKS.finance} · Energy ticker: ${PORTAL_LINKS.energyTicker}\n\n_${tip}_`,
    suggestions: financeSchemes(schemes).slice(0, 6).map(toSuggestion)
  };
}

function buildTabAnswer(tabLabel, body, schemes, tip) {
  const related = rankSchemes(financeSchemes(schemes), tabLabel, {}, 6);
  return {
    answer: withTip(
      `${String(body || '').trim()}\n\nI found **${related.length}** related scheme${related.length === 1 ? '' : 's'} in our catalogue — see the cards on the right.`,
      tip
    ),
    suggestions: related.map(toSuggestion)
  };
}

function buildCategoryAnswer(category, schemes, profile, tip) {
  const prompts = {
    solar: 'Solar panels for restaurant — subsidies and green leases',
    heatpump: 'Heat pump or sustainable heating system finance'
  };
  const q = prompts[category] || category;
  const related = rankSchemes(schemes, q, profile, 6);
  const label = category === 'solar' ? 'Solar PV' : 'Heat pump & heating';
  return {
    answer:
      `**${label} finance** — start in the finance finder **Grants** or **Green loans** tabs with your region set.\n\n` +
      `${formatSchemeBullets(related, 6) || '_No tight scheme match — browse the finance finder categories._'}\n\n` +
      `Portal: ${PORTAL_LINKS.finance}\n\n_${tip}_`,
    suggestions: related.map(toSuggestion)
  };
}

function financePortalLinks() {
  return [
    toLinkItem('Finance finder', PORTAL_LINKS.finance, 'Grants, BNPL, equipment finance and green loans'),
    toLinkItem('Energy price ticker', PORTAL_LINKS.energyTicker, 'Wholesale guide — useful when building an upgrade case'),
    toLinkItem('Utility detail', PORTAL_LINKS.utilityDetail + '?type=electricity', 'Site electricity, gas and water views'),
    toLinkItem('Tariff compare portal', PORTAL_LINKS.europeanEnergy, 'Compare business energy packages by region'),
    toLinkItem('Savings projection', PORTAL_LINKS.savingsProjection, 'Payback chart for equipment upgrades'),
    toLinkItem('Grants Agent', '/greenways/grants-agent', 'Schemes and subsidies catalogue chat')
  ];
}

function buildPortalsAnswer(tip) {
  return {
    answer: withTip(
      'Here are the main **finance and energy tools** on Greenways — open a tile on the right to jump in.',
      tip
    ),
    blocks: [{ type: 'link', items: financePortalLinks() }]
  };
}

async function buildEnergyPricesAnswer(profile, tip) {
  const snapshot = await loadEnergySnapshot();
  const bullets = formatWholesaleBullets(snapshot, profile, 4).join('\n');
  const modelling = formatModellingTariffLine(snapshot.modellingTariffs);
  const regionLabel = REGION_LABELS[profile.region] || 'your market';
  return {
    answer:
      `**Energy prices (${regionLabel})** — wholesale guide from the Greenways ticker (retail tariffs vary by contract):\n\n` +
      `${bullets || '_Open the ticker for the latest snapshot._'}\n\n` +
      (modelling ? `${modelling}\n\n` : '') +
      `**Tools:**\n` +
      `- Live ticker: ${PORTAL_LINKS.energyTicker} (also on the buildings dashboard)\n` +
      `- Site utility view: ${PORTAL_LINKS.utilityDetail}?type=electricity\n` +
      `- Business tariff compare: ${PORTAL_LINKS.europeanEnergy}\n` +
      `- Deals Agent: ${PORTAL_LINKS.dealsAgent}\n\n` +
      `_Wholesale €/MWh is a market signal — your bill also depends on supplier, pass-through clauses, and time-of-use._\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildPriceUpgradeCaseAnswer(schemes, profile, tip) {
  const snapshot = await loadEnergySnapshot();
  const hint = volatilityHint(snapshot, profile);
  const modelling = formatModellingTariffLine(snapshot.modellingTariffs);
  const related = rankSchemes(
    schemes,
    'equipment grant subsidy restaurant energy efficiency',
    profile,
    5
  );
  return {
    answer:
      `**Why finance efficient equipment when energy prices move**\n\n` +
      `1. **Unit cost × usage** — if €/kWh or gas rates rise, every inefficient oven, fridge, or HVAC hour costs more.\n` +
      `2. **Lower kWh first** — ETL-grade kit cuts demand; grants and green loans reduce upfront capex.\n` +
      `3. **Stack funding** — grants + BNPL/equipment finance + projected savings (see savings projection).\n\n` +
      `${hint}\n\n` +
      (modelling ? `${modelling}\n\n` : '') +
      (related.length
        ? `**Schemes that may help fund the upgrade:**\n${formatSchemeBullets(related, 4)}\n\n`
        : '') +
      `**Next steps:**\n` +
      `- Check prices: ${PORTAL_LINKS.energyTicker}\n` +
      `- Model payback: ${PORTAL_LINKS.savingsProjection}\n` +
      `- Pick efficient kit: ${PORTAL_LINKS.equipmentAgent}\n` +
      `- Finance finder: ${PORTAL_LINKS.finance}\n\n_${tip}_`,
    suggestions: related.map(toSuggestion)
  };
}

function buildCompareTariffsAnswer(tip) {
  return {
    answer:
      `**Compare tariffs & packages** — retail supply is separate from wholesale ticker moves:\n\n` +
      `- **European energy deals portal** — postcode-style compare for home, restaurant, office: ${PORTAL_LINKS.europeanEnergy}\n` +
      `- **Deals ticker hub** — energy / water / sustainability lanes: ${PORTAL_LINKS.deals}\n` +
      `- **Deals Agent:** ${PORTAL_LINKS.dealsAgent}\n\n` +
      `Even on a better tariff, **efficient equipment** lowers the kWh you buy — pair switching with upgrades.\n\n_${tip}_`,
    suggestions: []
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntents();
  const schemes = await loadSchemes();
  if (!schemes.length) return null;

  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);
  if (!intent) return null;

  let result;
  switch (intent.answerType) {
    case 'overview':
      result = await buildOverviewAnswer(schemes, profile, tip);
      break;
    case 'grants_tab':
      result = buildTabAnswer(
        'grants subsidies restaurant',
        '**Grants tab** — non-repayable support stacked with product-specific overlays. Pair with the Grants Agent for full scheme detail.',
        schemes,
        tip
      );
      break;
    case 'bnpl':
      result = buildTabAnswer(
        'bnpl equipment',
        '**BNPL tab** — split payments for eligible equipment where providers offer pay-later terms. Confirm merchant fees and credit checks.',
        schemes,
        tip
      );
      break;
    case 'equipment_finance':
      result = buildTabAnswer(
        'equipment finance lease kitchen',
        '**Equipment finance tab** — commercial leases and hire purchase for ovens, refrigeration, and HVAC. Useful when capex is lumpy.',
        schemes,
        tip
      );
      break;
    case 'green_loans':
      result = buildTabAnswer(
        'green loan bmkb warmtefonds',
        '**Green loans tab** — bank products tagged for sustainability (e.g. BMKB-Groen, national warmtefonds routes). Often stack with grants.',
        schemes,
        tip
      );
      break;
    case 'europe_finance':
      result = buildTabAnswer(
        'horizon europe finance',
        '**Europe tab** — EU-wide programmes and cross-border lenders. Set profile region to EU for best matches.',
        schemes,
        tip
      );
      break;
    case 'category':
      result = buildCategoryAnswer(intent.category, schemes, profile, tip);
      break;
    case 'portals':
      result = buildPortalsAnswer(tip);
      break;
    case 'energy_prices':
      result = await buildEnergyPricesAnswer(profile, tip);
      break;
    case 'price_upgrade_case':
      result = await buildPriceUpgradeCaseAnswer(schemes, profile, tip);
      break;
    case 'compare_tariffs':
      result = buildCompareTariffsAnswer(tip);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = intent.id;
    result.productSamples = await pickFinanceSamples(question, profile, 3);
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickFinanceSamples,
  getDefaultProductSamples: (limit = 3) => pickFinanceSamples('', {}, limit)
};
