const path = require('path');
const fs = require('fs/promises');
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
const {
  applyPersona,
  loadAgentVoice,
  pickTip
} = require('./greenways-agent-persona');

const intentsPath = path.join(__dirname, '..', 'data', 'equipment-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'equipment-agent-showcase.json');
const briefingPath = path.join(__dirname, '..', 'data', 'equipment-agent-briefing.json');
const voicePath = path.join(__dirname, '..', 'data', 'equipment-agent-voice.json');
const referencesPath = path.join(__dirname, '..', 'data', 'equipment-agent-references.json');
const renovationGuidePath = path.join(__dirname, '..', 'data', 'equipment-agent-renovation-guide.json');

const REGION_LABELS = {
  nl: 'Netherlands',
  uk: 'United Kingdom',
  eu: 'EU-wide'
};

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
    return { external: [], internalGuides: [] };
  }
}

async function loadRenovationGuide() {
  try {
    const raw = await fs.readFile(renovationGuidePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
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

  if (['grants_link', 'renovation_grants'].includes(intentId)) {
    push('grantsToAndrieus', 'What grants fit kitchen equipment and building renovation for my profile?');
  }
  if (['renovation', 'insulation', 'renovation_plan', 'savings_projection'].includes(intentId)) {
    push('financeToVincent', 'How do I finance renovation and ETL equipment upgrades after payback looks good?');
  }
  if (['overview', 'renovation_plan', 'monitoring_handoff', 'why_equipment'].includes(intentId)) {
    push('monitoringToEdwardo', 'Why should I baseline monitoring before upgrading kitchen equipment?');
  }
  if (intentId === 'sustainable') {
    push('catalogToZyanne', 'Find water-saving and gas-efficient alternatives in the sustainable catalog');
  }
  if (!out.length) {
    push('grantsToAndrieus', 'What grants fit equipment upgrades for my business?');
  }
  return out.slice(0, 3);
}

function rankReferences(refs, question, limit = 6) {
  const q = String(question || '').toLowerCase();
  const pool = [...(refs.external || []), ...(refs.internalGuides || [])];
  if (!q.trim()) return pool.slice(0, limit);
  const scored = pool.map((ref) => {
    const hay = [ref.title, ref.summary, ...(ref.topics || [])].join(' ').toLowerCase();
    let score = 0;
    q.split(/\s+/).filter((t) => t.length >= 3).forEach((token) => {
      if (hay.includes(token)) score += 3;
    });
    if (/kitchen|restaurant|wok|combi/.test(q) && /kitchen|restaurant|equipment/.test(hay)) score += 4;
    if (/renovation|insulation|building/.test(q) && /renovation|insulation|building/.test(hay)) score += 4;
    return { ref, score };
  });
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.ref)
    .slice(0, limit);
}

function toolsToBlocks(tools, max = 6) {
  return [{ type: 'link', items: tools.slice(0, max).map((t) => toLinkItem(t.title, t.href, t.summary)) }];
}

function equipmentPortalLinks() {
  return [
    toLinkItem('Equipment deep dive', PORTAL_LINKS.deepDive, 'Compare current vs efficient equipment with grants'),
    toLinkItem('Appliance comparison', './Restuarant%20Appliance%20Comparison.html', 'Standard vs ETL side-by-side'),
    toLinkItem('Intelligence tool', PORTAL_LINKS.equipmentTool, 'Marketplace alternatives and specs'),
    toLinkItem('Sustainable renovations', PORTAL_LINKS.sustainableRenovations, 'Building retrofit pathways'),
    toLinkItem('Insulation guide', PORTAL_LINKS.insulationGuide, 'Fabric and envelope improvements'),
    toLinkItem('Savings projection', PORTAL_LINKS.savingsProjection, 'Payback chart with grants'),
    toLinkItem('Grants Agent', '/greenways/grants-agent', 'Schemes chat for funding options'),
    toLinkItem('Finance Agent', '/greenways/finance-agent', 'Loans, BNPL and green finance')
  ];
}

async function pickEquipmentSamples(question, profile = {}, limit = 3) {
  return pickProductSamples(showcasePath, question, profile, limit, {
    requireGrants: false,
    extraTokens: ['dishwasher', 'wok', 'hood', 'combi', 'freezer']
  });
}

async function buildOverviewAnswer(profile, tip) {
  const briefing = await loadBriefing();
  const guide = await loadRenovationGuide();
  const focus = (briefing.restaurantFocus || []).slice(0, 4);
  const tools = (guide.greenwaysTools || []).slice(0, 5);
  const steps = (briefing.workflowSteps || []).slice(0, 5);

  return {
    answer:
      `**Artemis — Equipment & renovation specialist**\n\n` +
      `${briefing.roleSummary || 'ETL equipment upgrades and premises renovation on Greenways.'}\n\n` +
      `**What I help with:**\n${focus.map((f) => `- ${f}`).join('\n')}\n\n` +
      `**Typical path:**\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
      `**Greenways tools:**\n${tools.map((t) => `- **${t.title}** — ${t.summary}\n  → ${t.href}`).join('\n')}\n\n` +
      `_Ask about a **${profile.sector || 'restaurant'}** category, renovation, deep dive, or savings projection._\n\n_${tip}_`,
    blocks: toolsToBlocks(tools, 6),
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'overview')
  };
}

async function buildWhyEquipmentAnswer(profile, tip) {
  const briefing = await loadBriefing();
  const guide = await loadRenovationGuide();
  const why = guide.whyUpgrade || {};
  const cats = (guide.kitchenCategories || []).slice(0, 4);
  const demos = (guide.demonstrationTools || []).slice(0, 3);

  return {
    answer:
      `**${why.headline || 'Why upgrade equipment'}**\n\n` +
      (briefing.etlPrinciple ? `${briefing.etlPrinciple}\n\n` : '') +
      `${(why.points || []).map((p) => `- ${p}`).join('\n')}\n\n` +
      `**High-impact categories for ${profile.sector || 'restaurants'}:**\n` +
      `${cats.map((c) => `- **${c.name}** — ${c.priority}. _${c.tip}_`).join('\n')}\n\n` +
      (demos.length
        ? `**See it on Greenways:**\n${demos.map((d) => `- **${d.title}** → ${d.href}`).join('\n')}\n\n`
        : '') +
      `_${tip}_`,
    blocks: demos.length ? toolsToBlocks(demos, 5) : [],
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'why_equipment')
  };
}

async function buildLifecycleCostAnswer(tip) {
  const briefing = await loadBriefing();
  const core = (briefing.coreUnderstandings || [])
    .filter((c) => /lifecycle|reliable|repair|efficiency alone|systems/i.test(c))
    .slice(0, 5);
  const fallback = core.length
    ? core
    : [
        'Sustainable choice covers manufacture through disposal — not just running kWh.',
        'High efficiency alone fails if the product is unreliable or poorly matched to duty cycle.',
        'Maintenance keeps equipment near design efficiency for its full life.'
      ];

  return {
    answer:
      `**Lifecycle cost & durability** — Artemis does not pick the lowest-energy label alone.\n\n` +
      `${fallback.map((c) => `- ${c}`).join('\n')}\n\n` +
      `**Specify for:** capacity · duty cycle · service access · controls · repairability · embodied materials.\n\n` +
      `Model **total value** with ${PORTAL_LINKS.savingsProjection} or ${PORTAL_LINKS.energySavingsTrajectory} — then **Vincent** for finance.\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'lifecycle_cost'),
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Savings projection', PORTAL_LINKS.savingsProjection, 'Medium-term payback chart'),
          toLinkItem('Energy savings trajectory', PORTAL_LINKS.energySavingsTrajectory, 'Equipment change over time')
        ]
      }
    ]
  };
}

async function buildEtlVerificationAnswer(profile, tip) {
  const briefing = await loadBriefing();
  const etl = briefing.etlProducts || {};
  const refs = await loadReferences();
  const etlRefs = (refs.external || []).filter((r) => /etl/i.test(r.id || r.title)).slice(0, 3);

  return {
    answer:
      `**Energy Technology List (ETL)** — ${etl.topQuartileNote || 'independently verified efficient equipment'}.\n\n` +
      `${etl.summary || ''}\n\n` +
      `**On Greenways:** \`etl_*\` marketplace ids link specs, grant overlays, deep dive, and projection.\n\n` +
      `**Why it matters:** reduces procurement risk versus unverified "efficient" marketing claims.\n\n` +
      (etlRefs.length
        ? `**Official references:**\n${etlRefs.map((r) => `- [${r.title}](${r.url}) — ${r.summary}`).join('\n')}\n\n`
        : '') +
      `Search products: ${etl.paths?.marketplaceFinder || PORTAL_LINKS.equipmentTool}\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('ETL product search (UK)', 'https://etl.energysecurity.gov.uk/products', 'Official register'),
          toLinkItem('Equipment intelligence tool', PORTAL_LINKS.equipmentTool, 'Greenways finder'),
          toLinkItem('Deep dive', PORTAL_LINKS.deepDive, 'Compare current vs ETL alternatives')
        ]
      }
    ],
    agentHandoffs: buildHandoffs(briefing, '', 'etl_verification')
  };
}

async function buildTrajectoryAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.etlProducts?.paths || {};
  const guide = await loadRenovationGuide();
  const demos = (guide.demonstrationTools || []).filter((d) =>
    /trajectory|projection/i.test((d.tags || []).join(' ') + d.title)
  );

  return {
    answer:
      `**Energy savings trajectory** — show consumers how replacing certain equipment saves money in the **medium term**.\n\n` +
      `- **Trajectory page:** ${paths.trajectory || PORTAL_LINKS.energySavingsTrajectory}\n` +
      `- **Savings projection chart:** ${paths.savingsProjection || PORTAL_LINKS.savingsProjection}\n` +
      `- **With dashboard baseline:** ${paths.trajectoryBaseline || paths.trajectory}\n\n` +
      `Use trajectory for stakeholder stories; use projection for grant + tax bands on a single upgrade.\n\n_${tip}_`,
    suggestions: [],
    blocks: toolsToBlocks(demos.length ? demos : guide.demonstrationTools || [], 5),
    agentHandoffs: buildHandoffs(briefing, '', 'trajectory')
  };
}

async function buildBaselineEquipmentAnswer(tip) {
  const briefing = await loadBriefing();
  const paths = briefing.etlProducts?.paths || {};

  return {
    answer:
      `**Equipment baseline** — what your current kit should be consuming before you specify an upgrade.\n\n` +
      `- **Greenways dashboard** (${PORTAL_LINKS.greenwaysDashboard}) — equipment baseline when site energy data is connected\n` +
      `- **Trajectory example:** ${paths.trajectoryBaseline || paths.trajectory}\n` +
      `- **Equipment intelligence tool:** ${paths.marketplaceFinder || PORTAL_LINKS.equipmentTool} — practical baseline check for consumers\n\n` +
      `Without baseline, lifecycle payback is guesswork — **Edwardo** helps monitoring and dashboard maths when live data is thin.\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'baseline_equipment'),
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Equipment intelligence tool', PORTAL_LINKS.equipmentTool, 'Check expected baseline use'),
          toLinkItem('Trajectory baseline example', paths.trajectoryBaseline || PORTAL_LINKS.energySavingsTrajectory, 'Dashboard-linked demo'),
          toLinkItem('Edwardo (Systems)', '/greenways/systems-agent', 'Monitoring & dashboard maths')
        ]
      }
    ]
  };
}

async function buildEquipmentIntelligenceAnswer(tip) {
  const briefing = await loadBriefing();

  return {
    answer:
      `**Equipment intelligence tool** — practical way to check **what baseline use should look like** and find ETL alternatives.\n\n` +
      `→ ${PORTAL_LINKS.equipmentTool}\n\n` +
      `**Why it matters:** consumers see how efficient kit differs from what they run today before committing capex.\n\n` +
      `Pair with **deep dive** for grants and decision matrix, or **appliance comparison** for visual standard vs ETL stories.\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Open intelligence tool', PORTAL_LINKS.equipmentTool, 'Marketplace + alternatives'),
          toLinkItem('Appliance comparison (marketplace)', './Restuarant%20Appliance%20Comparison%20-%20Marketplace%20variant.html', 'Illustrated savings'),
          toLinkItem('Deep dive', PORTAL_LINKS.deepDive, 'Full compare + projection')
        ]
      }
    ],
    agentHandoffs: buildHandoffs(briefing, '', 'equipment_intelligence')
  };
}

function buildCategoryAnswer(category, schemes, question, profile, tip, guide) {
  const tokens = CATEGORY_TOKENS[category] || [category];
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const relatedSchemes = rankSchemes(schemes, `${tokens.join(' ')} restaurant`, profile, 5);
  const catGuide = (guide.kitchenCategories || []).find((c) =>
    category === 'kitchen'
      ? /combi|wok|kitchen|dishwash/i.test(c.name)
      : category === 'refrigeration'
        ? /refrig|cold/i.test(c.name)
        : /hvac|vent/i.test(c.name)
  );
  const catTip = catGuide ? `\n**Artemis tip:** ${catGuide.tip}\n\n` : '';

  return {
    answer: withTip(
      `Looking at **${label.toLowerCase()} equipment**? I pulled **${relatedSchemes.length}** funding scheme${relatedSchemes.length === 1 ? '' : 's'} that may apply.\n\n` +
        catTip +
        'For side-by-side specs open **equipment deep dive** or **appliance comparison** — tap banner products for marketplace links.',
      tip
    ),
    suggestions: relatedSchemes.map(toSuggestion),
    agentHandoffs: buildHandoffs({}, question, category === 'kitchen' ? 'kitchen' : 'overview')
  };
}

function buildGrantsLinkAnswer(schemes, profile, question, tip) {
  const related = rankSchemes(schemes, 'equipment grant restaurant kitchen', profile, 6);
  return {
    answer: withTip(
      `Grants attach to marketplace **etl_*** product cards automatically. Here are **${related.length}** scheme${related.length === 1 ? '' : 's'} that often relate to kitchen and equipment upgrades.\n\n` +
        'For compare, deadlines, and regional fit — **Andrieus** has the full catalogue.',
      tip
    ),
    suggestions: related.map(toSuggestion),
    agentHandoffs: buildHandoffs({}, question, 'grants_link')
  };
}

function buildDeepDiveAnswer(tip) {
  return {
    answer:
      `**Equipment deep dive** — compare current vs efficient alternatives with grant chips and **Savings projection** modal.\n\n` +
      `→ ${PORTAL_LINKS.deepDive}\n\n` +
      `Each profile includes decision-matrix rows, marketplace links, and optional \`sust_*\` external options.\n\n` +
      `Ask about a specific appliance (combi steamer, wok, freezer) and I'll surface matching picks in the banner.\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Open deep dive', PORTAL_LINKS.deepDive, 'Restaurant equipment profiles'),
          toLinkItem('Savings projection demo', `${PORTAL_LINKS.savingsProjection}?scenario=fridge`, 'Example payback chart')
        ]
      }
    ]
  };
}

function buildSavingsProjectionAnswer(tip) {
  return {
    answer:
      `**Savings projection** — chart **do nothing vs upgrade** with grant chips and illustrative tax bands.\n\n` +
      `- Full page: ${PORTAL_LINKS.savingsProjection}\n` +
      `- From deep dive: **Savings projection** button on each alternative card\n` +
      `- Demo scenario: \`?scenario=fridge\`\n\n` +
      `Use projection to build the case — then **Vincent** for BNPL, equipment finance, or green loans.\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs({}, '', 'savings_projection'),
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Equipment savings projection', PORTAL_LINKS.savingsProjection, 'Payback chart UI'),
          toLinkItem('Finance Agent', '/greenways/finance-agent', 'Stack funding after payback')
        ]
      }
    ]
  };
}

function buildProductComparisonAnswer(tip) {
  return {
    answer:
      `**Restaurant appliance comparison** — visual **standard vs ETL** pages for key categories (ovens, refrigeration, dishwash, HVAC).\n\n` +
      `- **Classic comparison:** ./Restuarant%20Appliance%20Comparison.html\n` +
      `- **Marketplace variant** (illustrations + savings stories): ./Restuarant%20Appliance%20Comparison%20-%20Marketplace%20variant.html\n\n` +
      `Use comparison for stakeholder buy-in; use **deep dive** for grants, decision matrix, and savings projection.\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Appliance comparison', './Restuarant%20Appliance%20Comparison.html', 'Side-by-side visuals'),
          toLinkItem('Marketplace variant', './Restuarant%20Appliance%20Comparison%20-%20Marketplace%20variant.html', 'Product illustrations'),
          toLinkItem('Equipment deep dive', PORTAL_LINKS.deepDive, 'Grants + projection detail')
        ]
      }
    ]
  };
}

function buildSustainableAnswer(question, tip) {
  return {
    answer:
      `**Sustainable catalog** — non-marketplace \`sust_*\` rows plus finder sessions persist to **data/sustainable-products-catalog.json**.\n\n` +
      `- Sustainable product finder portal\n` +
      `- Water Saving Finder\n` +
      `- API: GET /api/equipment-intelligence/sustainable-products\n\n` +
      `Marketplace **etl_*** rows and **sust_*** catalog cover different lanes — both can sit on one upgrade plan.\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs({}, question, 'sustainable')
  };
}

async function buildMonitoringHandoffAnswer(tip) {
  const briefing = await loadBriefing();
  return {
    answer:
      `**Baseline before capex** — if bills hide where energy goes, measure first.\n\n` +
      `- **Edwardo** (Systems) — sensors, sub-metering, Greenways dashboard maths\n` +
      `- **Importance of energy monitoring** — ${PORTAL_LINKS.energyMonitoring}\n\n` +
      `Once you know cookline vs refrigeration vs HVAC share, equipment swaps target the right loads.\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'monitoring_handoff')
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer: withTip(
      '**Equipment and renovation on Greenways** — pick a portal on the right to browse equipment, comparisons, or building guides.',
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
      ? `Start with fabric and insulation before oversized HVAC or heavy kitchen equipment — lower baseload makes equipment upgrades pay back faster.\n\n`
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
      `- Equipment deep dive: ${PORTAL_LINKS.deepDive}\n\n` +
      `For payback and loans see **Vincent** (/greenways/finance-agent).\n\n_${tip}_`,
    suggestions: relatedSchemes.map(toSuggestion),
    agentHandoffs: buildHandoffs({}, '', focus === 'insulation' ? 'insulation' : 'renovation')
  };
}

function buildRenovationGrantsAnswer(schemes, profile, question, tip) {
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
      `- **Andrieus (Grants Agent):** /greenways/grants-agent\n` +
      `- **Vincent (Finance):** /greenways/finance-agent\n` +
      `- **Renovation guides:** ${PORTAL_LINKS.sustainableRenovations}\n\n_${tip}_`,
    suggestions: related.map(toSuggestion),
    agentHandoffs: buildHandoffs({}, question, 'renovation_grants')
  };
}

async function buildRenovationPlanAnswer(tip) {
  const briefing = await loadBriefing();
  const steps = briefing.workflowSteps || [
    'Baseline use',
    'Pick category',
    'Compare ETL alternatives',
    'Model payback',
    'Confirm grants and finance',
    'Plan install'
  ];
  return {
    answer:
      `**Renovation project planning** — phased upgrades for premises + equipment:\n\n` +
      `${steps.map((s, i) => `${i + 1}. **${s}**`).join('\n')}\n\n` +
      `**Project plan template:** ${PORTAL_LINKS.renovationPlans}\n` +
      `**Sustainable renovations hub:** ${PORTAL_LINKS.sustainableRenovations}\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '', 'renovation_plan')
  };
}

async function buildRoleResourcesAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const refs = await loadReferences();
  const ranked = rankReferences(refs, question, 8);
  const picks = ranked.length
    ? ranked
    : [...(refs.external || []).slice(0, 3), ...(refs.internalGuides || []).slice(0, 4)];

  const mustKnows = (briefing.mustKnows || []).slice(0, 5);
  const core = (briefing.coreUnderstandings || []).slice(0, 4);

  return {
    answer:
      `**Artemis — role & references**\n\n` +
      `${briefing.roleProfile || briefing.roleSummary || ''}\n\n` +
      `**Must-know themes:**\n${mustKnows.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**How I advise:**\n${core.map((c) => `- ${c}`).join('\n')}\n\n` +
      `**Curated links:**\n${picks.map((r) => `- **${r.title}** — ${r.summary || ''}`).join('\n')}\n\n_${tip}_`,
    blocks: [
      {
        type: 'link',
        items: picks.slice(0, 6).map((r) => toLinkItem(r.title, r.url || r.href, r.summary || ''))
      }
    ],
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, question, 'role_resources')
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const voice = await loadAgentVoice(voicePath);
  const schemes = await loadSchemes();
  const guide = await loadRenovationGuide();
  const intent = matchIntent(question, intents);
  if (!intent) return null;

  const tip = pickTip(intents.staticTips, intent.id, { skipIntentIds: voice.skipTipIntents });

  let result;
  switch (intent.answerType) {
    case 'overview':
      result = await buildOverviewAnswer(profile, tip);
      break;
    case 'why_equipment':
      result = await buildWhyEquipmentAnswer(profile, tip);
      break;
    case 'lifecycle_cost':
      result = await buildLifecycleCostAnswer(tip);
      break;
    case 'etl_verification':
      result = await buildEtlVerificationAnswer(profile, tip);
      break;
    case 'trajectory':
      result = await buildTrajectoryAnswer(tip);
      break;
    case 'baseline_equipment':
      result = await buildBaselineEquipmentAnswer(tip);
      break;
    case 'equipment_intelligence':
      result = await buildEquipmentIntelligenceAnswer(tip);
      break;
    case 'category':
      result = buildCategoryAnswer(intent.category, schemes, question, profile, tip, guide);
      break;
    case 'grants_link':
      result = buildGrantsLinkAnswer(schemes, profile, question, tip);
      break;
    case 'deep_dive':
      result = buildDeepDiveAnswer(tip);
      break;
    case 'savings_projection':
      result = buildSavingsProjectionAnswer(tip);
      break;
    case 'product_comparison':
      result = buildProductComparisonAnswer(tip);
      break;
    case 'sustainable':
      result = buildSustainableAnswer(question, tip);
      break;
    case 'monitoring_handoff':
      result = await buildMonitoringHandoffAnswer(tip);
      break;
    case 'portals':
      result = buildPortalsAnswer(tip);
      break;
    case 'renovation':
      result = buildRenovationAnswer(intent.focus || 'general', schemes, profile, tip);
      break;
    case 'renovation_grants':
      result = buildRenovationGrantsAnswer(schemes, profile, question, tip);
      break;
    case 'renovation_plan':
      result = await buildRenovationPlanAnswer(tip);
      break;
    case 'role_resources':
      result = await buildRoleResourcesAnswer(question, profile, tip);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = intent.id;
    if (!result.agentHandoffs?.length) {
      const briefing = await loadBriefing();
      result.agentHandoffs = buildHandoffs(briefing, question, intent.id);
    }
    if (!result.productSamples?.length) {
      result.productSamples = await pickEquipmentSamples(question, profile, 3);
    }
    applyPersona(result, {
      voice,
      intentId: intent.id,
      question,
      profile,
      staticTips: intents.staticTips,
      regionLabels: REGION_LABELS,
      tip
    });
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickEquipmentSamples,
  loadBriefing,
  loadReferences,
  getDefaultProductSamples: (limit = 3) =>
    getDefaultProductSamplesFromShowcase(showcasePath, limit, { requireGrants: false })
};
