const path = require('path');
const {
  PORTAL_LINKS,
  loadIntentsFrom,
  loadSchemes,
  matchIntent,
  rankSchemes,
  formatSchemeBullets,
  toSuggestion,
  withTip,
  toLinkItem,
  pickProductSamples,
  getDefaultProductSamples: getDefaultProductSamplesFromShowcase
} = require('./greenways-agent-shared');

const intentsPath = path.join(__dirname, '..', 'data', 'equipment-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'equipment-agent-showcase.json');

const CATEGORY_TOKENS = {
  kitchen: ['combi', 'steamer', 'oven', 'wok', 'fryer', 'dishwasher', 'kitchen'],
  refrigeration: ['fridge', 'freezer', 'refrigerat', 'cold', 'cooling'],
  hvac: ['hvac', 'ventilation', 'heat recovery', 'extract', 'air con']
};

const RENOVATION_FOCUS = {
  insulation: ['insulation', 'fabric', 'envelope', 'glazing', 'draught', 'wall', 'roof'],
  building: ['heat pump', 'building', 'fabric', 'retrofit', 'hvac', 'solar'],
  general: ['renovation', 'retrofit', 'upgrade', 'equipment', 'kitchen', 'efficient']
};

async function loadIntents() {
  return loadIntentsFrom(intentsPath);
}

async function pickEquipmentSamples(question, profile = {}, limit = 3) {
  return pickProductSamples(showcasePath, question, profile, limit, {
    requireGrants: false,
    extraTokens: ['dishwasher', 'wok', 'hood']
  });
}

function buildOverviewAnswer(tip) {
  return {
    answer:
      `**Greenways Equipment Agent** — kit upgrades **and premises renovation** on one path:\n\n` +
      `- **Marketplace** — grant-enriched ETL product cards with specs\n` +
      `- **Equipment deep dive** — ${PORTAL_LINKS.deepDive}\n` +
      `- **Renovation & retrofit** — ${PORTAL_LINKS.sustainableRenovations}\n` +
      `- **Insulation & fabric** — ${PORTAL_LINKS.insulationGuide}\n` +
      `- **Savings projection** — on alternative cards in deep dive\n\n` +
      `Changing how your site runs often means **new equipment plus building improvements** — ask about either.\n\n_${tip}_`,
    suggestions: []
  };
}

function equipmentPortalLinks() {
  return [
    toLinkItem('Equipment deep dive', PORTAL_LINKS.deepDive, 'Compare current vs efficient kit with grants'),
    toLinkItem('Intelligence tool', PORTAL_LINKS.equipmentTool, 'Marketplace alternatives and specs'),
    toLinkItem('Sustainable renovations', PORTAL_LINKS.sustainableRenovations, 'Building retrofit pathways'),
    toLinkItem('Insulation guide', PORTAL_LINKS.insulationGuide, 'Fabric and envelope improvements'),
    toLinkItem('Grants Agent', '/greenways/grants-agent', 'Schemes chat for funding options'),
    toLinkItem('Finance Agent', '/greenways/finance-agent', 'Loans, BNPL and green finance')
  ];
}

function buildCategoryAnswer(category, schemes, question, profile, tip) {
  const tokens = CATEGORY_TOKENS[category] || [category];
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const relatedSchemes = rankSchemes(schemes, `${tokens.join(' ')} restaurant`, profile, 5);
  return {
    answer: withTip(
      `Looking at **${label.toLowerCase()} equipment**? I pulled **${relatedSchemes.length}** funding scheme${relatedSchemes.length === 1 ? '' : 's'} that may apply — cards on the right.\n\n` +
        'For side-by-side specs, open the **equipment deep dive** or tap a product in the banner above.',
      tip
    ),
    suggestions: relatedSchemes.map(toSuggestion)
  };
}

function buildGrantsLinkAnswer(schemes, profile, tip) {
  const related = rankSchemes(schemes, 'equipment grant restaurant kitchen', profile, 6);
  return {
    answer: withTip(
      `Grants are attached to marketplace products automatically. Here are **${related.length}** scheme${related.length === 1 ? '' : 's'} that often relate to kitchen and equipment upgrades — or open any banner product for the full overlay.`,
      tip
    ),
    suggestions: related.map(toSuggestion)
  };
}

function buildDeepDiveAnswer(tip) {
  return {
    answer:
      `**Equipment deep dive** — compare current vs efficient alternatives with grant chips and savings projection modal.\n\n` +
      `→ ${PORTAL_LINKS.deepDive}\n\n` +
      `Ask about a specific appliance (e.g. combi steamer, freezer) and I'll surface matching marketplace picks in the banner.\n\n_${tip}_`,
    suggestions: []
  };
}

function buildSustainableAnswer(tip) {
  return {
    answer:
      `**Sustainable catalog** — non-marketplace \`sust_*\` rows and finder sessions persist to data/sustainable-products-catalog.json.\n\n` +
      `- Sustainable product finder portal\n` +
      `- Water Saving Finder\n` +
      `- API: GET /api/equipment-intelligence/sustainable-products\n\n_${tip}_`,
    suggestions: []
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer: withTip(
      '**Equipment and renovation on Greenways** — pick a portal on the right to browse kit, deep dives, or building guides.',
      tip
    ),
    blocks: [{ type: 'link', items: equipmentPortalLinks() }]
  };
}

function buildRenovationAnswer(focus, schemes, profile, tip) {
  const tokens = RENOVATION_FOCUS[focus] || RENOVATION_FOCUS.general;
  const label =
    focus === 'insulation' ? 'Insulation & building fabric' : 'Premises renovation & retrofit';
  const relatedSchemes = rankSchemes(schemes, `${tokens.join(' ')} restaurant building`, profile, 6);
  const extra =
    focus === 'insulation'
      ? `Start with fabric and insulation before oversized HVAC or kitchen kit — lower baseload makes equipment upgrades pay back faster.\n\n`
      : `Combine **building improvements** (fabric, HVAC, monitoring) with **efficient equipment** swaps — same grants stack may apply across both.\n\n`;
  return {
    answer:
      `**${label}** — updating premises and how you operate:\n\n` +
      extra +
      (relatedSchemes.length
        ? `**Funding that may apply:**\n${formatSchemeBullets(relatedSchemes, 5)}\n\n`
        : '') +
      `**Guides:**\n` +
      `- Sustainable renovations: ${PORTAL_LINKS.sustainableRenovations}\n` +
      `- Insulation: ${PORTAL_LINKS.insulationGuide}\n` +
      `- Equipment deep dive (kit): ${PORTAL_LINKS.deepDive}\n\n` +
      `For payback and loans see **Finance Agent** (/greenways/finance-agent).\n\n_${tip}_`,
    suggestions: relatedSchemes.map(toSuggestion)
  };
}

function buildRenovationGrantsAnswer(schemes, profile, tip) {
  const related = rankSchemes(
    schemes,
    'renovation retrofit insulation building heat pump restaurant',
    profile,
    8
  );
  return {
    answer:
      `**Renovation & building grants** — schemes that often pair with equipment upgrades:\n\n` +
      `${formatSchemeBullets(related, 7) || '_Browse Grants Agent or schemes portals for your region._'}\n\n` +
      `- **Grants Agent:** /greenways/grants-agent\n` +
      `- **Finance Agent** (loans / BNPL): /greenways/finance-agent\n` +
      `- **Renovation guides:** ${PORTAL_LINKS.sustainableRenovations}\n\n_${tip}_`,
    suggestions: related.map(toSuggestion)
  };
}

function buildRenovationPlanAnswer(tip) {
  return {
    answer:
      `**Renovation project planning** — phased upgrades for premises + equipment:\n\n` +
      `1. **Baseline** — current energy use and priority areas (kitchen, HVAC, fabric)\n` +
      `2. **Quick wins** — insulation, monitoring, efficient kit with short payback\n` +
      `3. **Grants & finance** — stack schemes before capex (Grants + Finance agents)\n` +
      `4. **Equipment** — marketplace + deep dive for ETL alternatives\n` +
      `5. **Timeline** — align grant deadlines with install windows\n\n` +
      `**Project plan template:** ${PORTAL_LINKS.renovationPlans}\n` +
      `**Sustainable renovations hub:** ${PORTAL_LINKS.sustainableRenovations}\n\n_${tip}_`,
    suggestions: []
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntents();
  const schemes = await loadSchemes();
  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);
  if (!intent) return null;

  let result;
  switch (intent.answerType) {
    case 'overview':
      result = buildOverviewAnswer(tip);
      break;
    case 'category':
      result = buildCategoryAnswer(intent.category, schemes, question, profile, tip);
      break;
    case 'grants_link':
      result = buildGrantsLinkAnswer(schemes, profile, tip);
      break;
    case 'deep_dive':
      result = buildDeepDiveAnswer(tip);
      break;
    case 'sustainable':
      result = buildSustainableAnswer(tip);
      break;
    case 'portals':
      result = buildPortalsAnswer(tip);
      break;
    case 'renovation':
      result = buildRenovationAnswer(intent.focus || 'general', schemes, profile, tip);
      break;
    case 'renovation_grants':
      result = buildRenovationGrantsAnswer(schemes, profile, tip);
      break;
    case 'renovation_plan':
      result = buildRenovationPlanAnswer(tip);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = intent.id;
    result.productSamples = await pickEquipmentSamples(question, profile, 3);
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickEquipmentSamples,
  getDefaultProductSamples: (limit = 3) =>
    getDefaultProductSamplesFromShowcase(showcasePath, limit, { requireGrants: false })
};
