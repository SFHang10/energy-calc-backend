const path = require('path');
const fs = require('fs/promises');
const { loadSchemes, rankSchemes, toModuleItem } = require('./greenways-agent-shared');
const { mergeModuleRow } = require('./greenways-content-modules');

const scenariosPath = path.join(__dirname, '..', 'data', 'savings-projection-scenarios.json');

const VERTICAL_ALIASES = {
  fridge: ['fridge', 'refrigerat', 'counter fridge', 'undercounter', 'cold room'],
  'wok-burner': ['wok', 'burner', 'cookline', 'wok line', 'gas line']
};

const VERTICAL_MODULE_QUERY = {
  fridge: { scenario: 'fridge', category: 'refrigeration' },
  'wok-burner': { scenario: 'wok-burner', category: 'kitchen' }
};

let scenariosCache = null;

async function loadScenarios() {
  if (scenariosCache) return scenariosCache;
  try {
    const raw = await fs.readFile(scenariosPath, 'utf8');
    scenariosCache = JSON.parse(raw);
    return scenariosCache;
  } catch (_) {
    scenariosCache = { meta: {}, scenarios: [] };
    return scenariosCache;
  }
}

function detectVertical(question = '') {
  const q = String(question || '').toLowerCase();
  for (const [vertical, tokens] of Object.entries(VERTICAL_ALIASES)) {
    if (tokens.some((token) => q.includes(token))) return vertical;
  }
  return 'fridge';
}

function formatEur(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `€${Math.round(n).toLocaleString('en-GB')}`;
}

function grantTotalFromScenario(scenario) {
  return (scenario.grants || []).reduce((sum, row) => sum + (Number(row.amountEur) || 0), 0);
}

function paybackMonthsFromScenario(scenario) {
  const monthlySaving = Math.max(
    0,
    Number(scenario.baselineMonthlyEur) - Number(scenario.proposedMonthlyEur)
  );
  const grantTotal = grantTotalFromScenario(scenario);
  const netCapex = Math.max(0, Number(scenario.capexEur) - grantTotal);
  if (!monthlySaving) return null;
  return Math.ceil(netCapex / monthlySaving);
}

function totalGrantHint(scenario) {
  const grantTotal = grantTotalFromScenario(scenario);
  if (!grantTotal) return 'Check schemes for non-repayable support in your region.';
  const names = (scenario.grants || [])
    .map((g) => g.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(' + ');
  return `${formatEur(grantTotal)} illustrative grant${names ? ` (${names})` : ''} — from savings-projection scenario`;
}

function paybackHint(scenario, meta = {}) {
  const months = paybackMonthsFromScenario(scenario);
  const monthlySaving = Math.max(
    0,
    Number(scenario.baselineMonthlyEur) - Number(scenario.proposedMonthlyEur)
  );
  if (!months) {
    return meta.tariffNote || 'Model payback in savings projection before you commit capex.';
  }
  return `~${months} month${months === 1 ? '' : 's'} illustrative payback after grant (${formatEur(
    monthlySaving
  )}/mo saving in scenario)`;
}

function schemeHintLine(schemes, question, profile) {
  const ranked = rankSchemes(schemes, question, profile, 2);
  if (!ranked.length) return '';
  return ranked.map((s) => `**${s.title}** (${s.region || 'eu'})`).join(' · ');
}

function buildSteps(vertical, scenario, schemeLine) {
  const query = VERTICAL_MODULE_QUERY[vertical] || VERTICAL_MODULE_QUERY.fridge;
  const steps = [
    {
      order: 1,
      title: 'Baseline the load',
      body:
        'Confirm how much this equipment costs to run today — meter data, sub-metering, or the site snapshot if you have one.',
      moduleId: 'restaurant-energy-snapshot'
    },
    {
      order: 2,
      title: 'Compare verified alternatives',
      body: `Shortlist **ETL-listed** replacements for ${scenario.baselineLabel || 'current equipment'} and read grant chips on each row.`,
      moduleId: 'equipment-deep-dive'
    },
    {
      order: 3,
      title: 'Model payback',
      body: `Chart **do nothing vs upgrade** using the ${scenario.title || 'equipment'} scenario — ${scenario.savingsNote || 'illustrative savings profile'}.`,
      moduleId: 'savings-projection',
      query: `scenario=${query.scenario}`
    },
    {
      order: 4,
      title: 'Confirm grants',
      body: schemeLine
        ? `Cross-check catalogue schemes for your region — e.g. ${schemeLine}. Andrieus owns eligibility detail.`
        : 'Cross-check the schemes catalogue for your region before you assume grant amounts.',
      moduleId: 'schemes-portal-restaurant'
    },
    {
      order: 5,
      title: 'Stack finance',
      body: 'Once net capex is clear, compare BNPL, equipment finance, or green loans for the remaining spend.',
      handoffAgent: 'finance',
      handoffLabel: 'Vincent — finance & payback'
    },
    {
      order: 6,
      title: 'Plan install & handover',
      body: 'Sequence fabric fixes (if needed), install, and post-upgrade monitoring so savings show up on the bill.',
      moduleId: 'renovation-plans'
    }
  ];
  return steps;
}

function upgradePlanBlock({ vertical, scenario, steps, schemeLine, meta }) {
  return {
    type: 'upgrade_plan',
    title: `${scenario.title || 'Equipment'} — upgrade plan`,
    summary:
      `A six-step path from baseline to install for **${scenario.proposedLabel || 'efficient replacement'}**. ` +
      `Figures below come from the **savings-projection scenario** — refresh with live meter data when you have it.`,
    vertical,
    steps,
    totalGrantHint: totalGrantHint(scenario),
    paybackHint: paybackHint(scenario, meta),
    schemeHint: schemeLine || ''
  };
}

function toThemedModuleItem(row = {}) {
  const merged = mergeModuleRow(row);
  return toModuleItem({
    theme: row.theme || 'equipment',
    agentName: row.agentName || 'Artemis',
    ...merged
  });
}

function buildModuleBlocks(vertical) {
  const query = VERTICAL_MODULE_QUERY[vertical] || VERTICAL_MODULE_QUERY.fridge;
  return [
    {
      type: 'module',
      items: [
        toThemedModuleItem({
          moduleId: 'savings-projection',
          theme: 'equipment',
          agentName: 'Artemis',
          title: 'Savings projection',
          usageHint: 'Open the payback chart for this upgrade scenario.',
          query: `scenario=${query.scenario}`,
          openSize: 'near-full'
        }),
        toThemedModuleItem({
          moduleId: 'equipment-deep-dive',
          theme: 'equipment',
          agentName: 'Artemis',
          title: 'Equipment deep dive',
          usageHint: 'Compare alternatives side by side with grant chips.',
          openSize: 'near-full'
        }),
        toThemedModuleItem({
          moduleId: 'schemes-portal-restaurant',
          theme: 'grants',
          agentName: 'Andrieus',
          title: 'Restaurant schemes portal',
          usageHint: 'Confirm eligibility before you quote grant amounts.',
          openSize: 'near-full'
        })
      ]
    }
  ];
}

async function buildUpgradePlan({ vertical, profile = {}, question = '' } = {}) {
  const resolvedVertical = vertical || detectVertical(question);
  const bundle = await loadScenarios();
  const scenario =
    (bundle.scenarios || []).find((row) => row.id === resolvedVertical) ||
    (bundle.scenarios || []).find((row) => row.id === 'fridge');

  if (!scenario) {
    return null;
  }

  const schemes = await loadSchemes();
  const schemeLine = schemeHintLine(schemes, question || scenario.title, profile);
  const steps = buildSteps(resolvedVertical, scenario, schemeLine);
  const planBlock = upgradePlanBlock({
    vertical: resolvedVertical,
    scenario,
    steps,
    schemeLine,
    meta: bundle.meta
  });

  const regionLabel = profile.region ? String(profile.region).replace(/^eu\./, '').toUpperCase() : 'your region';

  return {
    answer:
      `Here is a **step-by-step upgrade plan** for **${scenario.title || 'your equipment'}** (${regionLabel}).\n\n` +
      `I keep the chat short — **follow the numbered plan on the right**, then open the linked tools for specs, grants, and payback. ` +
      `All € figures are from the **illustrative savings-projection scenario**, not live meter data.\n\n` +
      `Want a different appliance? Ask for a **wok line** or **fridge** upgrade plan and I will swap the scenario.`,
    intentId: 'equipment_upgrade_plan',
    blocks: [planBlock, ...buildModuleBlocks(resolvedVertical)],
    suggestions: [
      { title: 'Explain grants on this plan', prompt: 'What grants stack on this refrigeration upgrade?' },
      { title: 'Finance the net capex', prompt: 'What BNPL or equipment finance fits this upgrade?' }
    ],
    agentHandoffs: [
      {
        id: 'grants',
        name: 'Andrieus',
        href: '/greenways/grants-agent',
        prompt: `What grants apply to this ${scenario.title || 'equipment upgrade'}?`
      },
      {
        id: 'finance',
        name: 'Vincent',
        href: '/greenways/finance-agent',
        prompt: 'How should I finance the net capex after grants?'
      }
    ]
  };
}

module.exports = {
  buildUpgradePlan,
  detectVertical,
  loadScenarios,
  paybackMonthsFromScenario,
  grantTotalFromScenario
};
