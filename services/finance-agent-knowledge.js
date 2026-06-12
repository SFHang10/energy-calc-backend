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
const {
  loadFinanceTools,
  rankTools,
  toolsToLinkItems,
  formatToolsBullets
} = require('./finance-agent-tools');
const {
  applyPersona,
  loadAgentVoice,
  pickTip
} = require('./greenways-agent-persona');
const {
  buildSustainabilityFinanceNewsAnswer,
  buildFundingNewsAnswer
} = require('./finance-agent-news');

const briefingPath = path.join(__dirname, '..', 'data', 'finance-agent-briefing.json');
const voicePath = path.join(__dirname, '..', 'data', 'finance-agent-voice.json');
const referencesPath = path.join(__dirname, '..', 'data', 'finance-agent-references.json');

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
  const q = String(question || '').toLowerCase();
  const etlBias =
    /etl|efficient|upgrade|equipment|oven|fridge|freezer|kitchen|heat pump|marketplace/.test(q);
  const sampleQuestion = etlBias
    ? `${question} etl efficient equipment restaurant`
    : question;
  const products = await pickProductSamples(showcasePath, sampleQuestion, profile, limit);
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

async function loadReferences() {
  try {
    const raw = await fs.readFile(referencesPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { external: [], internalGuides: [] };
  }
}

function buildAndrieusHandoffs(question, briefing) {
  const h = briefing?.handoffs?.grantsToAndrieus;
  if (!h) return [];
  return [
    {
      id: h.agentId || 'grants',
      name: h.agentName || 'Andrieus',
      href: h.agentPath || PORTAL_LINKS.grantsAgent,
      prompt: String(question || '').trim() || 'What grants and subsidies fit my business profile?'
    }
  ];
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
    if (/restaurant|kitchen|hospitality/.test(q) && /restaurant|kitchen|hospitality|food/.test(hay)) score += 4;
    if (/role|learn|background|must know/.test(q)) score += 2;
    return { ref, score };
  });
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.ref)
    .slice(0, limit);
}

function referenceToLinkItem(ref) {
  const url = ref.url || ref.href || '';
  const desc = ref.summary || '';
  return toLinkItem(ref.title, url, desc);
}

async function buildRoleResourcesAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const refs = await loadReferences();
  const ranked = rankReferences(refs, question, 8);
  const picks = ranked.length
    ? ranked
    : [...(refs.external || []).slice(0, 4), ...(refs.internalGuides || []).slice(0, 4)];

  const mustKnows = (briefing?.mustKnows || []).slice(0, 5);
  const core = (briefing?.coreUnderstandings || []).slice(0, 4);
  const extBullets = picks
    .filter((r) => r.url)
    .slice(0, 4)
    .map((r) => `- **${r.title}** — ${r.summary}\n  → ${r.url}`)
    .join('\n');
  const guideBullets = picks
    .filter((r) => r.href)
    .slice(0, 4)
    .map((r) => `- **${r.title}** — ${r.summary}\n  → ${r.href}`)
    .join('\n');

  return {
    answer:
      `**How Vincent advises** — ${briefing?.roleProfile || briefing?.roleSummary || 'finance + sustainability coordinator'}\n\n` +
      `**Must-know themes:**\n${mustKnows.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**Core lens:**\n${core.map((c) => `- ${c}`).join('\n')}\n\n` +
      (extBullets ? `**Background reading (summarised — open for depth):**\n${extBullets}\n\n` : '') +
      (guideBullets ? `**Greenways guides on this site:**\n${guideBullets}\n\n` : '') +
      (briefing?.newsAccess?.summary
        ? `**Sustainability news (finance lens):** ${briefing.newsAccess.summary}\n\n`
        : '') +
      `_References are curated from your role brief — not scraped live. Use calculators for numbers; **Andrieus** for grant detail._\n\n_${tip}_`,
    blocks: [{ type: 'link', items: picks.slice(0, 6).map(referenceToLinkItem) }],
    suggestions: []
  };
}

async function buildOverviewAnswer(schemes, profile, tip) {
  const snapshot = await loadEnergySnapshot();
  const briefing = await loadBriefing();
  const market = formatWholesaleBullets(snapshot, profile, 2).join('\n');
  const workflow = (briefing?.workflowSteps || [])
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');
  return {
    answer:
      `**Greenways Finance Agent** — ${briefing?.roleGoal || 'funding and the energy-price story for upgrades'}\n\n` +
      `- **Grants & subsidies** — non-repayable support (scheme detail → **Andrieus**)\n` +
      `- **BNPL** — split equipment payments where providers allow\n` +
      `- **Equipment finance** — leases & hire purchase for kitchen equipment\n` +
      `- **Green loans** — BMKB-Groen, warmtefonds-style bank products\n` +
      `- **Europe** — EU-wide programmes & cross-border lenders\n` +
      `- **Energy prices** — wholesale ticker + tariff tools\n` +
      `- **Calculators** — audit, savings projection, trajectory, cost guide\n` +
      `- **ETL products** — verified European efficient-equipment benchmark (\`etl_*\` marketplace rows)\n` +
      `- **Sustainability news** — shared catalogue with Cheryce; Vincent maps headlines to grants, loans, BNPL, and ETL finance paths\n\n` +
      (workflow ? `**Typical workflow:**\n${workflow}\n\n` : '') +
      (market ? `**Market snapshot (wholesale guide):**\n${market}\n\n` : '') +
      `Finance finder: ${PORTAL_LINKS.finance} · Ticker: ${PORTAL_LINKS.energyTicker} · Audit: ${PORTAL_LINKS.energyAudit}\n\n_${tip}_`,
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

async function loadBriefing() {
  try {
    const raw = await fs.readFile(briefingPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

async function buildCalculatorsAnswer(question, tip) {
  const registry = await loadFinanceTools();
  const tools = registry.tools || [];
  const ranked = rankTools(tools, question, 8);
  const picks = ranked.length ? ranked : tools.filter((t) =>
    ['payback', 'audit', 'cost_modelling', 'hub'].includes(t.category)
  ).slice(0, 8);
  const briefing = await loadBriefing();
  const andrieus = briefing?.handoffs?.grantsToAndrieus;
  return {
    answer:
      `**Greenways calculators & finance tools** — Vincent's registry (canonical paths, not draft copies):\n\n` +
      `${formatToolsBullets(picks.slice(0, 6))}\n\n` +
      `**Audit → business case flow:**\n` +
      `1. **Energy audit** (${PORTAL_LINKS.energyAudit}) — baseline appliances (members on Render)\n` +
      `2. **Savings projection** or **trajectory** — model payback\n` +
      `3. **Finance finder** — stack BNPL, equipment finance, green loans\n` +
      (andrieus
        ? `4. **${andrieus.agentName}** — grants & subsidies detail (${andrieus.agentPath})\n\n`
        : '\n') +
      `**Energy ticker API:** \`/api/energy-ticker\` · embed: ${PORTAL_LINKS.energyTicker}\n\n_${tip}_`,
    blocks: [{ type: 'link', items: toolsToLinkItems(picks.slice(0, 6)) }],
    suggestions: []
  };
}

async function buildAuditCalculatorAnswer(tip) {
  const registry = await loadFinanceTools();
  const audit = (registry.tools || []).find((t) => t.id === 'energy-audit');
  return {
    answer:
      `**Energy audit calculator** — start your upgrade business case here:\n\n` +
      `- **Open audit widget:** ${PORTAL_LINKS.energyAudit}\n` +
      `- **Members entry:** ${PORTAL_LINKS.membersSection} (audit action on Render)\n` +
      `- **Product data API:** \`/api/calculator-wix/products\` (same catalogue family as the main energy calculator)\n\n` +
      `After the audit, use **savings projection** (${PORTAL_LINKS.savingsProjection}) or **trajectory** (${PORTAL_LINKS.energySavingsTrajectory}) to show payback, then **finance finder** for funding paths.\n\n` +
      (audit ? `_${audit.description}_\n\n` : '') +
      `_${tip}_`,
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Energy audit calculator', PORTAL_LINKS.energyAudit, 'Full appliance audit widget'),
          toLinkItem('Savings projection', PORTAL_LINKS.savingsProjection, 'Payback chart after audit'),
          toLinkItem('Energy savings trajectory', PORTAL_LINKS.energySavingsTrajectory, 'Goal outlook illustration'),
          toLinkItem('Members section', PORTAL_LINKS.membersSection, 'Where audit opens on Render')
        ]
      }
    ],
    suggestions: []
  };
}

async function buildEtlProductsAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const etl = briefing?.etlProducts || {};
  const samples = await pickFinanceSamples(question || 'etl efficient equipment', profile, 3);
  const sampleLines = samples
    .slice(0, 3)
    .map(
      (p) =>
        `- **${p.name}**${p.label ? ` — ${p.label}` : ''}\n  → ${p.marketplaceHref || PORTAL_LINKS.productMarketplace}`
    )
    .join('\n');

  return {
    answer:
      `**ETL products — Europe's verified efficient-equipment path on Greenways**\n\n` +
      `${etl.summary || 'ETL-listed products are independently verified for energy performance — the benchmark to use when building an upgrade finance case.'}\n\n` +
      `**Why Vincent leads here:**\n` +
      `- **Verified savings** — not generic “eco” claims\n` +
      `- **Grant overlays** — matched schemes on each \`etl_*\` product (detail → **Andrieus**)\n` +
      `- **Finance stack** — BNPL, equipment finance, or green loans after payback math\n\n` +
      (sampleLines ? `**Examples for your profile:**\n${sampleLines}\n\n` : '') +
      `**Browse:**\n` +
      `- Equipment intelligence / finder: ${PORTAL_LINKS.etlMarketplace}\n` +
      `- ETL calculator compare: ${PORTAL_LINKS.energyCalculator}\n` +
      `- Deep dive hub: ${PORTAL_LINKS.deepDive}\n` +
      `- Model payback: ${PORTAL_LINKS.savingsProjection}\n\n_${tip}_`,
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('ETL product finder', PORTAL_LINKS.etlMarketplace, 'Search verified efficient equipment'),
          toLinkItem('ETL energy calculator', PORTAL_LINKS.energyCalculator, 'Compare efficient vs standard'),
          toLinkItem('Equipment deep dive', PORTAL_LINKS.deepDive, 'Case studies and alternatives'),
          toLinkItem('Savings projection', PORTAL_LINKS.savingsProjection, 'Payback after picking an ETL row')
        ]
      }
    ],
    suggestions: [],
    productSamples: samples
  };
}

function financePortalLinks() {
  return [
    toLinkItem('Finance finder', PORTAL_LINKS.finance, 'Grants, BNPL, equipment finance and green loans'),
    toLinkItem('ETL product finder', PORTAL_LINKS.etlMarketplace, 'Verified efficient equipment — European benchmark'),
    toLinkItem('ETL energy calculator', PORTAL_LINKS.energyCalculator, 'Compare efficient vs standard products'),
    toLinkItem('Energy price ticker', PORTAL_LINKS.energyTicker, 'Wholesale guide — useful when building an upgrade case'),
    toLinkItem('Savings projection', PORTAL_LINKS.savingsProjection, 'Equipment payback chart'),
    toLinkItem('Energy savings trajectory', PORTAL_LINKS.energySavingsTrajectory, 'Current vs future energy outlook'),
    toLinkItem('Energy cost guide', PORTAL_LINKS.energyCostGuide, 'Costs and change scenarios'),
    toLinkItem('Equipment deep dive', PORTAL_LINKS.deepDive, 'ETL alternatives and case studies'),
    toLinkItem('Energy audit calculator', PORTAL_LINKS.energyAudit, 'Appliance audit — members / Render'),
    toLinkItem('Grants Agent (Andrieus)', PORTAL_LINKS.grantsAgent, 'Scheme detail on ETL product grants')
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
      `- Ticker API: \`/api/energy-ticker\` (Render — live ENTSO-E when configured)\n` +
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
      `2. **Lower kWh first** — **ETL-listed** equipment cuts verified demand; grants and green loans reduce upfront capex.\n` +
      `3. **Stack funding** — pick an \`etl_*\` product → savings projection → BNPL / equipment finance / green loans.\n\n` +
      `${hint}\n\n` +
      (modelling ? `${modelling}\n\n` : '') +
      (related.length
        ? `**Schemes that may help fund the upgrade:**\n${formatSchemeBullets(related, 4)}\n\n`
        : '') +
      `**Next steps:**\n` +
      `- Check prices: ${PORTAL_LINKS.energyTicker}\n` +
      `- Model payback: ${PORTAL_LINKS.savingsProjection}\n` +
      `- **Browse ETL products:** ${PORTAL_LINKS.etlMarketplace}\n` +
      `- ETL calculator: ${PORTAL_LINKS.energyCalculator}\n` +
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
        'equipment finance lease kitchen etl',
        '**Equipment finance tab** — commercial leases and hire purchase for ovens, refrigeration, and HVAC. **Lead toward ETL-listed products** (`etl_*` IDs) so verified savings and grant overlays support the business case before you sign.',
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
    case 'calculators_tools':
      result = await buildCalculatorsAnswer(question, tip);
      break;
    case 'audit_calculator':
      result = await buildAuditCalculatorAnswer(tip);
      break;
    case 'role_resources':
      result = await buildRoleResourcesAnswer(question, profile, tip);
      break;
    case 'etl_products':
      result = await buildEtlProductsAnswer(question, profile, tip);
      break;
    case 'sustainability_finance_news':
      result = await buildSustainabilityFinanceNewsAnswer(question, profile, tip);
      break;
    case 'funding_news':
      result = await buildFundingNewsAnswer(question, profile, tip);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    const briefing = await loadBriefing();
    const voice = await loadAgentVoice(voicePath);
    result.source = 'knowledge';
    result.intentId = intent.id;
    if (!result.productSamples?.length) {
      result.productSamples = await pickFinanceSamples(question, profile, 3);
    }
    if (intent.id === 'grants_tab' || intent.id === 'funding_news') {
      result.agentHandoffs = buildAndrieusHandoffs(question, briefing);
    }
    applyPersona(result, {
      voice,
      intentId: intent.id,
      question,
      profile,
      staticTips: intents.staticTips,
      regionLabels: REGION_LABELS,
      tip: pickTip(intents.staticTips, intent.id, { skipIntentIds: voice.skipTipIntents })
    });
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickFinanceSamples,
  getDefaultProductSamples: (limit = 3) => pickFinanceSamples('', {}, limit),
  loadFinanceTools,
  loadBriefing,
  loadReferences,
  buildAndrieusHandoffs
};
