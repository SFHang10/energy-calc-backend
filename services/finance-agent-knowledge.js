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
  getDefaultProductSamples,
  buildAgentHandoff,
  FINANCE_HANDOFF_RULES,
  toModuleItem,
  agentProfileBlock
} = require('./greenways-agent-shared');
const { mergeModuleRow, enrichKnowledgeAnswer } = require('./greenways-content-modules');
const {
  financeFinderDemo,
  savingsProjectionDemo,
  siteBriefDemo,
  serviceHourCostBoardDemo,
  countryLabelFromProfile
} = require('./greenways-module-demo');
const { resolveGlossaryFromIntent, tryBuildGlossaryAnswer } = require('./greenways-sustainability-glossary');

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
  toolsToModuleRows,
  formatToolsBullets
} = require('./finance-agent-tools');
const {
  applyPersona,
  loadAgentVoice,
  pickTip,
  agentIntroParagraph
} = require('./greenways-agent-persona');
const {
  profileContextLine,
  profileContextPrompt,
  fundingStackGuide,
  paybackSensitivityLine,
  buildGroundedUpgradeCase
} = require('./finance-agent-context');
const {
  buildSustainabilityFinanceNewsAnswer,
  buildFundingNewsAnswer
} = require('./finance-agent-news');
const { buildDailyReviewAnswer, loadFinanceDailyReview } = require('./finance-daily-review');
const { buildFinanceWireSnapshot } = require('./finance-wire-snapshot');
const {
  buildHandoffTopicSummary,
  isReferralWelcomePair
} = require('./greenways-agent-handoff');

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

function attachFinanceHandoffs(result, briefing, question, intentId) {
  if (!result) return result;
  result.agentHandoffs = buildAgentHandoff(briefing, {
    question,
    intentId,
    rules: FINANCE_HANDOFF_RULES,
    fallbackKeys: ['grantsToAndrieus']
  });
  return result;
}

const VINCENT_MODULE = { theme: 'finance', agentName: 'Vincent' };

function financeModuleBlock(rows) {
  return {
    type: 'module',
    items: rows.map((row) => toModuleItem({ ...VINCENT_MODULE, ...mergeModuleRow(row) }))
  };
}

function financeWireModuleRow(overrides = {}) {
  return {
    moduleId: 'finance-wire',
    title: 'Finance wire',
    description: 'Wholesale ticker, daily review, and market spotlights in one hub.',
    usageHint: 'Skim wire main, then open Finance desk for payback and funding paths.',
    openSize: 'near-full',
    ...overrides
  };
}

function formatFinanceWireSnapshotBlock(snapshot) {
  if (!snapshot?.ok) return '';
  const hubs = Number(snapshot.hubCount || 0);
  const stories = Number(snapshot.spotlightCount || 0);
  const focus = snapshot.focusMarket;
  const refreshed =
    String(snapshot.meta?.trustLine || '').replace(
      /^Finance wire from finance-news-feed\.json \+ wholesale ticker · refreshed /,
      ''
    ) || String(snapshot.generatedAt || '').slice(0, 10);

  let block =
    `**Finance wire scan (live):** **${hubs}** wholesale hubs` +
    (stories ? ` · **${stories}** market spotlights` : '') +
    (refreshed ? ` · refreshed ${refreshed}` : '') +
    '.\n';
  if (focus && Number.isFinite(focus.priceEurMwh)) {
    block += `- **Focus hub:** ${focus.name} — €${focus.priceEurMwh.toFixed(1)}/MWh wholesale (${focus.changeLabel || 'flat'})\n`;
  }
  if (snapshot.dailyReview?.headline) {
    block += `- **Today's review:** ${snapshot.dailyReview.headline}\n`;
  }
  const top = (snapshot.spotlights || []).slice(0, 3);
  if (top.length) {
    block += `- **Spotlights:** ${top.map((row) => row.title).join(' · ')}\n`;
  }
  return block;
}

async function buildFinanceWireAnswer(profile, tip) {
  const snapshot = await buildFinanceWireSnapshot();
  const scan = formatFinanceWireSnapshotBlock(snapshot);
  const desk = (snapshot.deskSpotlights || []).slice(0, 3);
  const deskLine = desk.length
    ? `**Desk spotlights:** ${desk.map((row) => row.title).join(' · ')}\n\n`
    : '';

  return {
    answer:
      `**Finance wire** — my scan + desk hub on Greenways.\n\n` +
      (scan ? `${scan}\n` : '') +
      deskLine +
      `Scroll the scan rail for wholesale lanes and market tablets, then use the desk below for prices board, finance finder, and payback projection. ` +
      `Counts refresh from **finance-news-feed.json** and the wholesale ticker — same source as the wire page.\n\n` +
      `_${tip}_`,
    blocks: [
      financeModuleBlock([
        financeWireModuleRow(),
        { moduleId: 'finance-desk', openSize: 'near-full' },
        { moduleId: 'finance-prices-board', openSize: 'expanded' }
      ])
    ],
    suggestions: []
  };
}

function financeAgentLinkBlock(title, path, description) {
  if (isAgentChatPath(path)) {
    return { type: 'link', items: [toLinkItem(title, path, description)] };
  }
  const moduleId = portalPathToModuleId(path);
  if (moduleId) {
    return financeModuleBlock([{ moduleId, title, openSize: 'near-full' }]);
  }
  return { type: 'link', items: [toLinkItem(title, path, description)] };
}

function isAgentChatPath(path) {
  return /^\/greenways\//.test(String(path || '').trim());
}

/** Internal guide ids from finance-agent-references.json */
const REF_MODULE_IDS = {
  trajectory: 'savings-trajectory',
  'cost-guide': 'energy-cost-guide',
  monitoring: 'restaurant-energy-monitoring-guide',
  'site-energy-reading': 'site-energy-reading',
  'low-energy': 'low-energy-equipment',
  'discover-savings': 'discover-savings',
  'quick-benefits': 'sustainability-quick-benefits',
  'prices-deals': 'prices-and-deals',
  'eco-planning': 'eco-project-planner',
  'declining-cost-renewables': 'declining-cost-renewables'
};

/** Map PORTAL_LINKS-style paths to registry module ids */
const PORTAL_PATH_MODULE_IDS = [
  ['finance-finder-restaurant', 'finance-finder'],
  ['full%20schemes%20portal%20restaurant', 'schemes-portal-restaurant'],
  ['full%20schemes%20portal%20html', 'schemes-portal-eu'],
  ['energy-ticker-green-wire', 'energy-ticker'],
  ['energy-ticker-colour-swap', 'energy-ticker'],
  ['utility-detail', 'utility-detail'],
  ['european_energy_deals_portal', 'european-energy'],
  ['equipment-savings-projection', 'savings-projection'],
  ['energy-savings-trajectory', 'savings-trajectory'],
  ['energy-cost-guide%20(1)', 'energy-cost-guide'],
  ['energy-cost-guide', 'energy-cost-guide'],
  ['greenways-finance-desk', 'finance-desk'],
  ['finance-desk', 'finance-desk'],
  ['/greenways/energy-cost-guide', 'energy-cost-guide'],
  ['/greenways/finance-finder', 'finance-finder'],
  ['/greenways/energy-ticker', 'energy-ticker'],
  ['equipment_intelligence_tool', 'etl-finder'],
  ['energy-calculator-enhanced', 'etl-calculator'],
  ['energy-audit-widget', 'energy-audit'],
  ['savings.html', 'savings-tour'],
  ['deals-ticker-hub', 'deals-ticker'],
  ['restaurant-equipment-deep-dive', 'equipment-deep-dive'],
  ['restaurant-data', 'restaurant-data'],
  ['Importance%20of%20Energy%20Monitoring', 'energy-monitoring'],
  ['restaurant-energy-monitoring-guide', 'restaurant-energy-monitoring-guide'],
  ['site-energy-reading', 'site-energy-reading'],
  ['Low%20Energy%20New', 'low-energy-equipment'],
  ['Discover%20Energy%20Savings', 'discover-savings'],
  ['Europes%20Energy%20Saving', 'europe-savings'],
  ['Sustaniability%20Quick%20Benefits', 'sustainability-quick-benefits'],
  ['Prices%20and%20Deals', 'prices-and-deals'],
  ['eco_project_planning_guide', 'eco-project-planner'],
  ['members-section', 'members-section'],
  ['declining_cost_renewable_energy', 'declining-cost-renewables']
];

function portalPathToModuleId(path) {
  const hay = String(path || '').toLowerCase();
  if (!hay || isAgentChatPath(path)) return '';
  for (const [needle, moduleId] of PORTAL_PATH_MODULE_IDS) {
    if (hay.includes(needle.toLowerCase())) return moduleId;
  }
  return '';
}

function referenceToModuleRow(ref) {
  const moduleId = REF_MODULE_IDS[ref.id] || portalPathToModuleId(ref.href || ref.url);
  if (!moduleId) return null;
  const row = { moduleId, openSize: 'near-full' };
  const href = String(ref.href || '');
  if (href.includes('?')) row.query = href.split('?').slice(1).join('?');
  return row;
}

function splitReferenceBlocks(picks) {
  const modules = [];
  const links = [];
  for (const ref of picks) {
    if (ref.url && /^https?:\/\//i.test(ref.url)) {
      links.push(referenceToLinkItem(ref));
      continue;
    }
    const row = referenceToModuleRow(ref);
    if (row) modules.push(row);
    else if (ref.href || ref.url) links.push(referenceToLinkItem(ref));
  }
  const blocks = [];
  if (modules.length) blocks.push(financeModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

function utilityTypeForProfile(profile) {
  const focus = String(profile.focus || '').toLowerCase();
  if (focus === 'water') return 'water';
  if (focus === 'energy' || focus === 'equipment') return 'electricity';
  return 'electricity';
}

function energyToolkitModules(profile, extras = []) {
  const utilType = utilityTypeForProfile(profile);
  const base = [
    { moduleId: 'finance-prices-board', openSize: 'expanded' },
    { moduleId: 'energy-ticker', openSize: 'expanded' },
    {
      moduleId: 'utility-detail',
      title: `Utility detail — ${utilType}`,
      query: `type=${utilType}`
    },
    { moduleId: 'european-energy', openSize: 'near-full' }
  ];
  return financeModuleBlock(base.concat(extras));
}

function financeStackModules(profile) {
  const country = countryLabelFromProfile(profile && profile.region);
  return financeModuleBlock([
    financeFinderDemo({
      tab: 'grants',
      q: 'kitchen equipment',
      country: country || undefined,
      label: 'Vincent — Finance Finder'
    }),
    savingsProjectionDemo({
      scenario: 'fridge',
      label: 'Vincent — payback demo',
      note: 'Fridge example payback — adjust capex and grants to match the equipment you shortlisted.'
    }),
    { moduleId: 'etl-finder', openSize: 'near-full' }
  ]);
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
    if (/renewable|solar|wind|lcoe|irena|green tariff/.test(q) && /renewable|solar|wind|lcoe/.test(hay)) score += 6;
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
      agentIntroParagraph('finance', briefing) +
      agentProfileBlock(
        `**How Vincent advises**`,
        briefing?.roleProfile || briefing?.roleSummary || 'finance + sustainability coordinator'
      ) +
      `**Must-know themes:**\n${mustKnows.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**Core lens:**\n${core.map((c) => `- ${c}`).join('\n')}\n\n` +
      (extBullets ? `**Background reading (summarised — open for depth):**\n${extBullets}\n\n` : '') +
      (guideBullets ? `**Greenways guides on this site:**\n${guideBullets}\n\n` : '') +
      (briefing?.newsAccess?.summary
        ? `**Sustainability news (finance lens):** ${briefing.newsAccess.summary}\n\n`
        : '') +
      `_References are curated from your role brief — not scraped live. Use calculators for numbers; **Andrieus** for grant detail._\n\n_${tip}_`,
    blocks: splitReferenceBlocks(picks.slice(0, 6)),
    suggestions: []
  };
}

async function buildOverviewAnswer(schemes, profile, tip) {
  const [snapshot, briefing, wireSnapshot] = await Promise.all([
    loadEnergySnapshot(),
    loadBriefing(),
    buildFinanceWireSnapshot()
  ]);
  const scan = formatFinanceWireSnapshotBlock(wireSnapshot);
  const market = formatWholesaleBullets(snapshot, profile, 2).join('\n');
  const workflow = (briefing?.workflowSteps || [])
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');
  const ctx = profileContextLine(profile);
  const stack = fundingStackGuide();
  const ctxPrompt = profileContextPrompt(profile);
  return {
    answer:
      agentIntroParagraph('finance', briefing) +
      `${ctx}\n\n` +
      `**Focus:** ${briefing?.roleGoal || 'funding and the energy-price story for upgrades'}\n\n` +
      (scan ? `${scan}\n` : '') +
      `${stack}\n\n` +
      `- **Grants & subsidies** — non-repayable support (scheme detail → **Andrieus**)\n` +
      `- **BNPL** — split equipment payments where providers allow\n` +
      `- **Equipment finance** — leases & hire purchase for kitchen equipment\n` +
      `- **Green loans** — BMKB-Groen, warmtefonds-style bank products\n` +
      `- **Europe** — EU-wide programmes & cross-border lenders\n` +
      `- **Energy prices** — prices board + wholesale ticker + tariff tools\n` +
      `- **Product Calculator** — Greenways compare tool (efficient products incl. ETL-listed); plus audit, projection, trajectory, cost guide\n` +
      `- **ETL products** — verified European efficient-equipment benchmark (\`etl_*\` marketplace rows)\n` +
      `- **Sustainability news** — shared catalogue with Cheryce; Vincent maps headlines to grants, loans, BNPL, and ETL finance paths\n\n` +
      (workflow ? `**Typical workflow:**\n${workflow}\n\n` : '') +
      (market ? `**Market snapshot (wholesale guide):**\n${market}\n\n` : '') +
      (ctxPrompt ? `${ctxPrompt}\n\n` : '') +
      `Open the modules on the right for finance finder, prices board, audit, and calculators.\n\n_${tip}_`,
    blocks: [
      financeModuleBlock([
        financeWireModuleRow(),
        { moduleId: 'finance-finder', openSize: 'near-full' },
        { moduleId: 'finance-prices-board', openSize: 'expanded' },
        { moduleId: 'energy-ticker', openSize: 'expanded' },
        { moduleId: 'energy-audit', openSize: 'near-full' },
        { moduleId: 'etl-calculator', openSize: 'near-full' }
      ])
    ],
    suggestions: financeSchemes(schemes).slice(0, 6).map(toSuggestion)
  };
}

function buildTabAnswer(tabLabel, body, schemes, tip, profile) {
  const related = rankSchemes(financeSchemes(schemes), tabLabel, {}, 6);
  const tabMap = {
    bnpl: 'bnpl',
    'buy now': 'bnpl',
    equipment: 'equipment',
    lease: 'equipment',
    loan: 'loans',
    green: 'loans',
    europe: 'compare',
    horizon: 'compare',
    grant: 'grants'
  };
  const hay = String(tabLabel || '').toLowerCase();
  let tab = 'grants';
  Object.keys(tabMap).forEach((k) => {
    if (hay.includes(k)) tab = tabMap[k];
  });
  const country = countryLabelFromProfile(profile && profile.region);
  return {
    answer: withTip(
      `${String(body || '').trim()}\n\nI found **${related.length}** related scheme${related.length === 1 ? '' : 's'} in our catalogue — see the cards on the right. I also primed **Finance Finder** so you can run a live search in that tab.`,
      tip
    ),
    blocks: [
      financeModuleBlock([
        financeFinderDemo({
          tab,
          q: String(tabLabel || 'restaurant equipment').slice(0, 80),
          country: country || undefined,
          label: 'Vincent — Finance Finder'
        })
      ])
    ],
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
  const solarExtra =
    category === 'solar'
      ? `**Supply-side context:** IRENA’s 2024 data shows 91% of new renewable capacity beat fossil alternatives on cost, and solar PV LCOE fell ~90% since 2010 — see the renewable cost chart for the full curve through 2026 (2025–26 are illustrative projections).\n\n`
      : '';
  const blocks =
    category === 'solar'
      ? [
          financeModuleBlock([
            { moduleId: 'declining-cost-renewables', openSize: 'near-full' },
            { moduleId: 'finance-finder', openSize: 'near-full' },
            { moduleId: 'savings-projection', openSize: 'near-full' }
          ])
        ]
      : [financeModuleBlock([{ moduleId: 'finance-finder', openSize: 'near-full' }])];
  return {
    answer:
      `**${label} finance** — start in the finance finder **Grants** or **Green loans** tabs with your region set.\n\n` +
      solarExtra +
      `${formatSchemeBullets(related, 6) || '_No tight scheme match — browse the finance finder categories._'}\n\n` +
      `Open the modules on the right — ${category === 'solar' ? 'renewable cost chart, ' : ''}finance finder, and payback tools.\n\n_${tip}_`,
    blocks,
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
      `**Greenways calculators & finance tools** — Vincent's registry (canonical paths, not draft copies).\n\n` +
      `**Product Calculator** is Greenways' compare tool — it models energy use for **efficient equipment** (including ETL-listed rows today; more product lanes over time). It is not an ETL-owned calculator.\n\n` +
      `${formatToolsBullets(picks.slice(0, 6))}\n\n` +
      `**Audit → business case flow:**\n` +
      `1. **Energy audit** (${PORTAL_LINKS.energyAudit}) — baseline appliances (members on Render)\n` +
      `2. **Savings projection** or **trajectory** — model payback\n` +
      `3. **Finance finder** — stack BNPL, equipment finance, green loans\n` +
      (andrieus
        ? `4. **${andrieus.agentName}** — grants & subsidies detail (${andrieus.agentPath})\n\n`
        : '\n') +
      `**Energy ticker API:** \`/api/energy-ticker\` — open the modules on the right for calculators and tools.\n\n_${tip}_`,
    blocks: (() => {
      const rows = toolsToModuleRows(picks.slice(0, 8));
      return rows.length ? [financeModuleBlock(rows)] : [];
    })(),
    suggestions: []
  };
}

async function buildAuditCalculatorAnswer(tip) {
  const registry = await loadFinanceTools();
  const audit = (registry.tools || []).find((t) => t.id === 'energy-audit');
  return {
    answer:
      `**Energy audit calculator** — start your upgrade business case here:\n\n` +
      `After the audit, open **savings projection** or **trajectory** modules to show payback, then **finance finder** for funding paths.\n\n` +
      (audit ? `_${audit.description}_\n\n` : '') +
      `_${tip}_`,
    blocks: [
      financeModuleBlock([
        { moduleId: 'energy-audit', openSize: 'near-full' },
        { moduleId: 'savings-projection', openSize: 'near-full' },
        { moduleId: 'savings-trajectory', openSize: 'near-full' },
        { moduleId: 'finance-finder', openSize: 'near-full' }
      ])
    ],
    suggestions: []
  };
}

async function buildEtlProductsAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const etl = briefing?.etlProducts || {};
  const samples = await pickFinanceSamples(question || 'etl efficient equipment', profile, 3);

  return {
    answer:
      `**ETL products — Europe's verified efficient-equipment path on Greenways**\n\n` +
      `${etl.summary || 'ETL-listed products are independently verified for energy performance — the benchmark to use when building an upgrade finance case.'}\n\n` +
      `Vincent leads here because verified savings beat generic “eco” claims, grant overlays attach to each \`etl_*\` row, and you can stack BNPL, equipment finance, or green loans after payback math. Banner cards above show examples; open the modules for browse paths.\n\n_${tip}_`,
    blocks: [financeStackModules(profile)],
    suggestions: [],
    productSamples: samples
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer: withTip(
      'Here are the main **finance and energy tools** on Greenways — open a module on the right to stay inside Vincent (description + how to use at the top).',
      tip
    ),
    blocks: [
      financeModuleBlock([
        { moduleId: 'finance-finder', openSize: 'near-full' },
        { moduleId: 'etl-finder', openSize: 'near-full' },
        { moduleId: 'etl-calculator', openSize: 'near-full' },
        { moduleId: 'energy-ticker', openSize: 'expanded' },
        { moduleId: 'savings-projection', openSize: 'near-full' },
        { moduleId: 'savings-trajectory', openSize: 'near-full' },
        { moduleId: 'energy-cost-guide', openSize: 'near-full' },
        { moduleId: 'equipment-deep-dive', openSize: 'near-full' },
        { moduleId: 'energy-audit', openSize: 'near-full' }
      ]),
      financeAgentLinkBlock('Grants Agent (Andrieus)', PORTAL_LINKS.grantsAgent, 'Scheme detail on ETL product grants')
    ]
  };
}

function buildRestaurantSnapshotAnswer(profile, tip) {
  const region = String(profile.region || '').trim().toLowerCase();
  const regionParam = region.startsWith('uk.') ? 'uk' : region.startsWith('nl') || !region ? 'nl' : region.slice(0, 2);
  const siteId = String(profile.siteId || '').trim() || 'w2w-amsterdam-02';

  return {
    answer: withTip(
      'I opened a **Site Brief** — a shareable overview of modelled utility costs, upgrade signals, and scheme hints for your site.\n\n' +
        '**Copy brief** for a GM or landlord, then Ask about payback or open Finance Finder when net capex is clearer. Figures are illustrative until live meters are connected.',
      tip
    ),
    blocks: [
      financeModuleBlock([
        siteBriefDemo({
          site: siteId,
          region: regionParam,
          label: 'Vincent — Site Brief',
          note: 'Site primed from your profile — switch locations inside the tool, then copy or ask about payback.'
        }),
        savingsProjectionDemo({
          scenario: 'fridge',
          label: 'Vincent — payback next',
          note: 'After the brief, model do-nothing vs upgrade on a priority line.'
        })
      ])
    ],
    suggestions: []
  };
}

function buildServiceHourCostBoardAnswer(tip) {
  return {
    answer: withTip(
      '**Service-hour cost board** — same kitchen profiles as Energy Sketch, split into **peak service hours** vs **off-peak**, with an **after shift** column for warewash and pre-cool.\n\n' +
        'Rates are **illustrative** (flat €0.30 · peak €0.38 · off-peak €0.22/kWh) — not your live tariff. Use it to see whether timing changes the bill story before you compare suppliers or model payback.\n\n' +
        'I primed a **busy kitchen** board on the right.',
      tip
    ),
    blocks: [
      financeModuleBlock([
        serviceHourCostBoardDemo({
          profile: 'busy-kitchen',
          label: 'Vincent — Service-hour cost board',
          note: 'Busy-kitchen TOU board — switch café / wok line, then tariff compare or payback.'
        }),
        {
          moduleId: 'european-energy',
          title: 'Tariff compare',
          usageHint: 'Shop time-of-use / business rates after you see the shift story',
          openSize: 'near-full'
        },
        savingsProjectionDemo({
          scenario: 'dishwasher',
          label: 'Vincent — warewash payback',
          note: 'If shift savings matter, model dishwasher upgrade payback next.'
        })
      ])
    ],
    suggestions: []
  };
}

async function buildEnergyPricesAnswer(profile, tip) {
  const [snapshot, wireSnapshot, daily] = await Promise.all([
    loadEnergySnapshot(),
    buildFinanceWireSnapshot(),
    loadFinanceDailyReview()
  ]);
  const scan = formatFinanceWireSnapshotBlock(wireSnapshot);
  const bullets = formatWholesaleBullets(snapshot, profile, 4);
  const modelling = formatModellingTariffLine(snapshot.modellingTariffs);
  const regionLabel = REGION_LABELS[profile.region] || 'your market';
  const headline = bullets.length
    ? bullets[0].replace(/^-\s*/, '')
    : 'Open the prices board for the latest wholesale snapshot.';
  const ctx = profileContextLine(profile);
  const sensitivity = paybackSensitivityLine(snapshot, profile);
  const ctxPrompt = profileContextPrompt(profile);
  const dailyLine = daily?.headline
    ? `**Today's brief (${daily.meta?.briefDate || 'latest'}):** ${daily.headline} — ask *today's price review* for the full skim.\n\n`
    : '';

  return {
    answer:
      `${ctx}\n\n` +
      (scan ? `${scan}\n` : '') +
      dailyLine +
      `**Energy prices (${regionLabel})** — wholesale €/MWh helps you time upgrades and tariff reviews. Your bill also depends on supplier, pass-through clauses, and time-of-use, so retail contracts can move differently from the board.\n\n` +
      `${headline}\n\n` +
      (modelling ? `${modelling}\n\n` : '') +
      (sensitivity ? `${sensitivity}\n\n` : '') +
      `When unit costs rise, **ETL-listed equipment** lowers the kWh you still buy — open **Prices board** first, then tariff compare and Product Calculator.\n\n` +
      (ctxPrompt ? `${ctxPrompt}\n\n` : '') +
      `_${tip}_`,
    blocks: [
      energyToolkitModules(profile),
      financeAgentLinkBlock('Deals Agent', PORTAL_LINKS.dealsAgent, 'Tariff lanes and supply deals')
    ],
    suggestions: []
  };
}

async function buildPriceUpgradeCaseAnswer(schemes, profile, tip) {
  const snapshot = await loadEnergySnapshot();
  const hint = volatilityHint(snapshot, profile);
  const related = rankSchemes(
    schemes,
    'equipment grant subsidy restaurant energy efficiency',
    profile,
    5
  );
  const showcase = await loadFinanceShowcase();
  const product = (showcase.products || []).find((p) => p.id === 'etl_14_86293') || showcase.products[0] || {};
  const grounded = buildGroundedUpgradeCase(profile, snapshot, product);
  const ctx = profileContextLine(profile);
  const stack = fundingStackGuide();

  return {
    answer:
      `${ctx}\n\n` +
      `**Why finance efficient equipment when energy prices move**\n\n` +
      `Unit cost × usage drives your bill — when €/kWh or gas rates rise, every inefficient hour on ovens, refrigeration, or HVAC costs more. **ETL-listed products** cut verified demand; grants and green loans can reduce upfront capex.\n\n` +
      `${grounded}\n\n` +
      `${hint}\n\n` +
      `${stack}\n\n` +
      (related.length
        ? `I found **${related.length}** scheme${related.length === 1 ? '' : 's'} that may help fund the upgrade — see the cards on the right.\n\n`
        : '') +
      `_${tip}_`,
    blocks: [
      energyToolkitModules(profile, [
        savingsProjectionDemo({
          scenario: 'fridge',
          label: 'Vincent — why upgrade now',
          note: 'Example payback under rising unit costs — swap in your equipment figures next.'
        }),
        financeFinderDemo({
          tab: 'bnpl',
          q: 'commercial kitchen equipment',
          country: countryLabelFromProfile(profile && profile.region) || undefined,
          label: 'Vincent — fund the upgrade'
        })
      ])
    ],
    suggestions: related.map(toSuggestion)
  };
}

function buildFundingStackAnswer(schemes, profile, tip) {
  const country = countryLabelFromProfile(profile && profile.region);
  const ctx = profileContextLine(profile);
  const related = rankSchemes(financeSchemes(schemes), 'grant equipment restaurant', profile, 4);
  return {
    answer:
      `${ctx}\n\n` +
      `${fundingStackGuide()}\n\n` +
      `I opened **Finance Finder** on the right — start on **Grants**, then move to the tab that matches what's left after scheme support.\n\n_${tip}_`,
    blocks: [
      financeModuleBlock([
        financeFinderDemo({
          tab: 'grants',
          q: 'restaurant equipment energy',
          country: country || undefined,
          label: 'Vincent — start with grants'
        }),
        savingsProjectionDemo({
          scenario: 'fridge',
          label: 'Vincent — payback before borrowing'
        }),
        { moduleId: 'finance-desk', openSize: 'near-full' }
      ]),
      financeAgentLinkBlock('Grants Agent (Andrieus)', PORTAL_LINKS.grantsAgent, 'Scheme detail and eligibility')
    ],
    suggestions: related.map(toSuggestion)
  };
}

function buildBnplAnswer(schemes, profile, tip) {
  const related = rankSchemes(financeSchemes(schemes), 'bnpl equipment restaurant', profile, 6);
  const country = countryLabelFromProfile(profile && profile.region);
  return {
    answer:
      `**BNPL for restaurant equipment** — pay-later or split-payment paths can spread capex when a verified upgrade makes sense. Confirm merchant fees, credit checks, and who holds title before you sign.\n\n` +
      `Pair BNPL with **ETL-listed products** so verified savings and grant overlays support the business case. I opened **Finance Finder → BNPL** on the right with a starter search — run it or change the topic.\n\n_${tip}_`,
    blocks: [
      financeModuleBlock([
        financeFinderDemo({
          tab: 'bnpl',
          q: 'commercial dishwasher oven refrigeration',
          country: country || undefined,
          label: 'Vincent — BNPL demo'
        }),
        savingsProjectionDemo({
          scenario: 'dishwasher',
          label: 'Vincent — payback first',
          note: 'Quick payback check before you commit to a BNPL term.'
        }),
        { moduleId: 'etl-finder', openSize: 'near-full' }
      ]),
      financeAgentLinkBlock('Grants Agent (Andrieus)', PORTAL_LINKS.grantsAgent, 'Scheme detail on product grants')
    ],
    suggestions: related.map(toSuggestion)
  };
}

function buildGreenLoansAnswer(schemes, profile, tip) {
  const related = rankSchemes(financeSchemes(schemes), 'green loan bmkb warmtefonds', profile, 6);
  const country = countryLabelFromProfile(profile && profile.region);
  return {
    answer:
      `**Green loans** — bank products tagged for sustainability (e.g. BMKB-Groen, national warmtefonds routes). They often stack with grants on the same upgrade, so model payback before you borrow.\n\n` +
      `I opened **Finance Finder → Green loans** and a payback demo on the right — set your region, then confirm eligibility with the lender.\n\n_${tip}_`,
    blocks: [
      financeModuleBlock([
        financeFinderDemo({
          tab: 'loans',
          q: 'green loan restaurant energy efficiency',
          country: country || undefined,
          label: 'Vincent — green loans'
        }),
        savingsProjectionDemo({
          scenario: 'fridge',
          label: 'Vincent — payback before borrowing'
        })
      ]),
      financeAgentLinkBlock('Grants Agent (Andrieus)', PORTAL_LINKS.grantsAgent, 'Non-repayable support to stack with loans')
    ],
    suggestions: related.map(toSuggestion)
  };
}

function buildCompareTariffsAnswer(tip) {
  return {
    answer:
      `**Compare tariffs & packages** — retail supply is separate from wholesale ticker moves. Green tariffs often track falling renewable LCOE — solar and wind supply costs keep edging down through 2026 even when your bill feels volatile.\n\n` +
      `Even on a better tariff, **efficient equipment** lowers the kWh you buy — pair switching with upgrades.\n\n` +
      `Open the tariff portal, renewable cost chart, and deals hub in the modules on the right, or ask **Zara** (Deals Agent) for live lanes.\n\n_${tip}_`,
    blocks: [
      financeModuleBlock([
        { moduleId: 'european-energy', openSize: 'near-full' },
        { moduleId: 'declining-cost-renewables', openSize: 'near-full' },
        { moduleId: 'deals-ticker', openSize: 'expanded' }
      ]),
      financeAgentLinkBlock('Deals Agent (Zara)', PORTAL_LINKS.dealsAgent, 'Product spotlights and tariff compare')
    ],
    suggestions: []
  };
}

function buildRenewableCostsAnswer(tip) {
  return {
    answer:
      `**Declining cost of renewable energy (2014–2026)**\n\n` +
      `Global levelized costs for solar PV, onshore wind, and offshore wind keep falling — **IRENA** (*Renewable Power Generation Costs in 2024*, July 2025) reports **91%** of newly commissioned utility-scale renewables in 2024 undercut the cheapest new fossil option. That supports better green-tariff and rooftop-solar finance cases even when retail bills spike.\n\n` +
      `**How to use this in a finance case:**\n` +
      `1. Open the chart — IRENA 2024 solar PV global average **USD 0.043/kWh** (~€0.04/kWh on the chart)\n` +
      `2. Stack **grants** or **green loans** on your chosen technology\n` +
      `3. Model site payback in **savings projection** before you sign\n\n` +
      `Open the renewable cost module on the right.\n\n_${tip}_`,
    blocks: [
      financeModuleBlock([
        { moduleId: 'declining-cost-renewables', openSize: 'near-full' },
        { moduleId: 'savings-projection', openSize: 'near-full' },
        { moduleId: 'finance-finder', openSize: 'near-full' }
      ])
    ],
    suggestions: []
  };
}

async function buildReferralWelcomeAnswer(question, profile, tip) {
  const handoff = profile.handoff;
  if (!isReferralWelcomePair('finance-agent', handoff)) return null;

  const schemes = await loadSchemes();
  if (!schemes.length) return null;

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
  const searchQ = [handoff.question, question, handoff.fromIntentId].filter(Boolean).join(' ');
  const related = rankSchemes(financeSchemes(schemes), searchQ, profile, 5);
  const fromDeals = handoff.fromSlug === 'deals-agent';
  const fromEquipment = handoff.fromSlug === 'equipment-agent';
  const angle = fromDeals
    ? 'BNPL, equipment finance, and payback after deal selection'
    : fromEquipment
      ? 'lifecycle payback and finance stacks for ETL equipment'
      : 'finance paths for your upgrade';

  const moduleRows = fromDeals
    ? [
        { moduleId: 'finance-finder', openSize: 'near-full' },
        { moduleId: 'deals-ticker', openSize: 'expanded' },
        { moduleId: 'savings-projection', openSize: 'near-full' }
      ]
    : [
        { moduleId: 'finance-finder', openSize: 'near-full' },
        { moduleId: 'savings-projection', openSize: 'near-full' },
        { moduleId: 'equipment-deep-dive', openSize: 'near-full' }
      ];

  return {
    answer:
      `**${fromName}** suggested you continue with me for **${angle}**.\n\n` +
      `From your chat: _${topic}_\n\n` +
      `Open the finance finder modules on the right — stack **grants** (Andrieus), **BNPL**, **equipment finance**, or **green loans** with your savings projection.\n\n_${tip}_`,
    blocks: [financeModuleBlock(moduleRows)],
    suggestions: related.map(toSuggestion),
    agentHandoffs: buildAgentHandoff(await loadBriefing(), {
      question: handoff.question || question,
      intentId: 'agent_referral_welcome',
      rules: FINANCE_HANDOFF_RULES,
      fallbackKeys: ['grantsToAndrieus']
    })
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntents();
  const schemes = await loadSchemes();
  if (!schemes.length) return null;

  const voice = await loadAgentVoice(voicePath);

  if (profile.handoff) {
    const referralTip = pickTip(intents.staticTips, 'agent_referral_welcome', {
      skipIntentIds: voice.skipTipIntents
    });
    const referral = await buildReferralWelcomeAnswer(question, profile, referralTip);
    if (referral?.answer) {
      referral.source = 'knowledge';
      referral.intentId = 'agent_referral_welcome';
      if (!referral.productSamples?.length) {
        referral.productSamples = await pickFinanceSamples(
          profile.handoff?.question || question,
          profile,
          3
        );
      }
      applyPersona(referral, {
        voice,
        intentId: 'agent_referral_welcome',
        question,
        profile,
        staticTips: intents.staticTips,
        regionLabels: REGION_LABELS,
        tip: referralTip
      });
      return referral;
    }
  }

  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);

  let result = resolveGlossaryFromIntent(intent, question, profile, tip, 'finance');
  if (!result && intent) {
  switch (intent.answerType) {
    case 'overview':
      result = await buildOverviewAnswer(schemes, profile, tip);
      break;
    case 'finance_wire':
      result = await buildFinanceWireAnswer(profile, tip);
      break;
    case 'grants_tab':
      result = buildTabAnswer(
        'grants subsidies restaurant',
        '**Grants tab** — non-repayable support stacked with product-specific overlays. Pair with the Grants Agent for full scheme detail.',
        schemes,
        tip,
        profile
      );
      break;
    case 'bnpl':
      result = buildBnplAnswer(schemes, profile, tip);
      break;
    case 'equipment_finance':
      result = buildTabAnswer(
        'equipment finance lease kitchen etl',
        '**Equipment finance tab** — commercial leases and hire purchase for ovens, refrigeration, and HVAC. **Lead toward ETL-listed products** (`etl_*` IDs) so verified savings and grant overlays support the business case before you sign.',
        schemes,
        tip,
        profile
      );
      break;
    case 'green_loans':
      result = buildGreenLoansAnswer(schemes, profile, tip);
      break;
    case 'europe_finance':
      result = buildTabAnswer(
        'horizon europe finance',
        '**Europe tab** — EU-wide programmes and cross-border lenders. Set profile region to EU for best matches.',
        schemes,
        tip,
        profile
      );
      break;
    case 'category':
      result = buildCategoryAnswer(intent.category, schemes, profile, tip);
      break;
    case 'portals':
      result = buildPortalsAnswer(tip);
      break;
    case 'restaurant_energy_snapshot':
      result = buildRestaurantSnapshotAnswer(profile, tip);
      break;
    case 'service_hour_cost_board':
      result = buildServiceHourCostBoardAnswer(tip);
      break;
    case 'energy_prices':
      result = await buildEnergyPricesAnswer(profile, tip);
      break;
    case 'daily_price_review':
      result = await buildDailyReviewAnswer(profile, tip);
      break;
    case 'price_upgrade_case':
      result = await buildPriceUpgradeCaseAnswer(schemes, profile, tip);
      break;
    case 'funding_stack':
      result = buildFundingStackAnswer(schemes, profile, tip);
      break;
    case 'compare_tariffs':
      result = buildCompareTariffsAnswer(tip);
      break;
    case 'renewable_costs':
      result = buildRenewableCostsAnswer(tip);
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
  } else if (!result) {
    result = tryBuildGlossaryAnswer(question, profile, tip, { agentKey: 'finance', minScore: 24 });
    if (!result) return null;
  }

  if (result?.answer) {
    const briefing = await loadBriefing();
    const voice = await loadAgentVoice(voicePath);
    result.source = 'knowledge';
    result.intentId = result.intentId || intent?.id || 'sustainability_glossary';
    if (!result.productSamples?.length) {
      result.productSamples = await pickFinanceSamples(question, profile, 3);
    }
    attachFinanceHandoffs(result, briefing, question, result.intentId);
    enrichKnowledgeAnswer(result, {
      agentKey: 'finance',
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
      tip: pickTip(intents.staticTips, result.intentId, { skipIntentIds: voice.skipTipIntents })
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
  attachFinanceHandoffs
};
