const path = require('path');
const fs = require('fs/promises');
const { loadEnergySnapshot, formatWholesaleBullets, formatModellingTariffLine } = require('./finance-agent-energy');
const { loadSchemes, rankSchemes } = require('./greenways-agent-shared');

const ELEC_EUR_PER_KWH = 0.3;
const GAS_EUR_PER_KWH_THERMAL = 0.11;
const WATER_EUR_PER_L = 0.0025;
const KWH_PER_M3_GAS = 10.55;

const EQUIPMENT_SHARES = [
  { name: 'Wok cookline', icon: '🔥', share: 0.24, color: '#ffb84d' },
  { name: 'Cold storage', icon: '❄', share: 0.14, color: '#7dffcb' },
  { name: 'Extraction & HVAC', icon: '🌬', share: 0.12, color: '#53b8ff' },
  { name: 'Fryer', icon: '🍟', share: 0.11, color: '#ffb84d' },
  { name: 'Dishwash & water', icon: '💧', share: 0.1, color: '#22d4ff' },
  { name: 'Combi oven', icon: '♨', share: 0.09, color: '#ffb84d' },
  { name: 'Dining lighting', icon: '💡', share: 0.07, color: '#ffca58' },
  { name: 'Other loads', icon: '⚡', share: 0.13, color: '#a8b4c8' }
];

const CIBSE_BENCHMARK = {
  label: 'CIBSE / energy-cost-guide medium restaurant benchmark',
  electricityKwhYear: 80000,
  gasKwhYearThermal: 60000,
  note: 'Illustrative UK commercial benchmark — compare to your metered site profile.'
};

function monthlyEur(elecKwh, gasM3, waterM3) {
  const electricity = elecKwh * ELEC_EUR_PER_KWH;
  const gas = gasM3 * KWH_PER_M3_GAS * GAS_EUR_PER_KWH_THERMAL;
  const water = waterM3 * 1000 * WATER_EUR_PER_L;
  return {
    electricity: round(electricity),
    gas: round(gas),
    water: round(water),
    total: round(electricity + gas + water)
  };
}

function round(n) {
  return Math.round(n);
}

async function loadBuildings() {
  const raw = await fs.readFile(path.join(__dirname, '..', 'data', 'company-map-buildings.json'), 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.buildings || parsed.sites || [];
}

async function loadScenarios() {
  const raw = await fs.readFile(path.join(__dirname, '..', 'data', 'savings-projection-scenarios.json'), 'utf8');
  return JSON.parse(raw);
}

function scenarioSavings(row) {
  const baseline = Number(row.baselineMonthlyEur) || 0;
  const proposed = Number(row.proposedMonthlyEur) || 0;
  const grantTotal = (row.grants || []).reduce((s, g) => s + (Number(g.amountEur) || 0), 0);
  return {
    id: row.id,
    title: row.title,
    baselineMonthlyEur: baseline,
    proposedMonthlyEur: proposed,
    monthlySavingEur: round(baseline - proposed),
    annualSavingEur: round((baseline - proposed) * 12),
    capexEur: Number(row.capexEur) || 0,
    grantEur: grantTotal,
    netCapexEur: Math.max(0, round((Number(row.capexEur) || 0) - grantTotal)),
    savingsNote: row.savingsNote || '',
    image: row.image || null
  };
}

function buildNarrative(site, costs, scenarios, grants) {
  const topScenario = scenarios.slice().sort((a, b) => b.annualSavingEur - a.annualSavingEur)[0];
  const grantCount = grants.length;
  return {
    coverTagline: 'Illustrative energy brief — data assembled from site profile, tariffs, and upgrade scenarios.',
    situationSummary:
      `${site.name} models **€${costs.total.toLocaleString('en-GB')}/month** in utility spend ` +
      `(electricity €${costs.electricity.toLocaleString('en-GB')}, gas €${costs.gas.toLocaleString('en-GB')}, water €${costs.water.toLocaleString('en-GB')}). ` +
      'Figures use Greenways SiteEnergyModel tariffs unless live meter feeds are connected.',
    opportunitySummary:
      topScenario
        ? `Top illustrated equipment upgrade (**${topScenario.title}**) could save ~**€${topScenario.annualSavingEur}/year** on that line item before wider building measures.`
        : 'Equipment upgrade scenarios show targeted savings on high-duty kitchen lines.',
    buildingNote:
      'A whole-building fabric + controls package often targets **15–30%** on total utility spend — model separately from single-appliance rows.',
    nextSteps: [
      { label: 'Review utility breakdown', action: 'page-2' },
      { label: 'Compare upgrade scenarios', action: 'page-4' },
      { label: 'Check grants & schemes', action: 'page-5' },
      ...(grantCount ? [{ label: `${grantCount} scheme hints for your region`, action: 'page-5' }] : [])
    ]
  };
}

async function buildRestaurantSnapshot(options = {}) {
  const siteId = options.siteId || 'w2w-amsterdam-02';
  const region = String(options.region || 'nl').toLowerCase();
  const profile = { region, buildingType: 'restaurant' };

  const [buildings, scenariosDoc, energySnap, schemes] = await Promise.all([
    loadBuildings(),
    loadScenarios(),
    loadEnergySnapshot(),
    loadSchemes()
  ]);

  const site = buildings.find((b) => b.id === siteId) || buildings[0];
  if (!site) {
    throw new Error('No site profile found for snapshot.');
  }

  const e = site.energy || {};
  const elecKwh = Number(e.electricityKwhMonth) || 0;
  const gasM3 = Number(e.gasM3Month) || 0;
  const waterM3 = Number(e.waterM3Month) || 0;
  const costs = monthlyEur(elecKwh, gasM3, waterM3);

  const elecMonthlyEur = costs.electricity;
  const equipment = EQUIPMENT_SHARES.map((row) => ({
    ...row,
    sharePct: Math.round(row.share * 100),
    eurMonth: round(elecMonthlyEur * row.share)
  }));

  const scenarios = (scenariosDoc.scenarios || []).map(scenarioSavings);
  const totalScenarioMonthly = scenarios.reduce((s, r) => s + r.monthlySavingEur, 0);

  const grantRows = rankSchemes(
    schemes,
    'restaurant energy efficiency insulation equipment grants Netherlands commercial kitchen',
    profile,
    5
  ).map((s) => ({
    id: s.id,
    title: s.title,
    region: s.region,
    type: s.type,
    url: s.url,
    description: s.description
  }));

  const narrative = buildNarrative(site, costs, scenarios, grantRows);

  return {
    meta: {
      reportType: 'restaurant-energy-snapshot',
      version: 'pilot-1',
      generatedAt: new Date().toISOString(),
      disclaimer:
        'Illustrative brief only. Not an audit, legal advice, or guaranteed savings. Tariffs and grants change — verify before investment.',
      tariffNote: scenariosDoc.meta?.tariffNote || 'Electricity €0.30/kWh (SiteEnergyModel).',
      modellingLine: formatModellingTariffLine(energySnap.modellingTariffs),
      pages: 5
    },
    site: {
      id: site.id,
      name: site.name,
      address: site.address,
      imageUrl: site.imageUrl || null,
      region,
      sensors: site.sensors || []
    },
    consumption: {
      electricityKwhMonth: elecKwh,
      gasM3Month: gasM3,
      waterM3Month: waterM3,
      electricityKwhYear: elecKwh * 12,
      mainPowerKw: Number(e.mainPowerKw) || null
    },
    costs: {
      ...costs,
      annualTotal: round(costs.total * 12),
      currency: 'EUR'
    },
    benchmark: CIBSE_BENCHMARK,
    utilitySplit: [
      { key: 'electricity', label: 'Electricity', eurMonth: costs.electricity, color: '#38b6e8' },
      { key: 'gas', label: 'Gas', eurMonth: costs.gas, color: '#f5a623' },
      { key: 'water', label: 'Water', eurMonth: costs.water, color: '#22d4ff' }
    ],
    equipment,
    scenarios,
    scenarioTotals: {
      monthlySavingIfAllEur: totalScenarioMonthly,
      annualSavingIfAllEur: round(totalScenarioMonthly * 12),
      note: 'Summing line-item scenarios is illustrative — upgrades are not all independent.'
    },
    grants: grantRows,
    energyContext: {
      wholesale: formatWholesaleBullets(energySnap, profile, 3),
      volatility:
        'Wholesale power and gas prices remain volatile — efficiency reduces exposure per kWh and m³ consumed.'
    },
    narrative,
    agentLinks: [
      { name: 'Vincent (Finance)', href: '/greenways/finance-agent?embed=1', prompt: 'Explain energy price risk for my restaurant' },
      { name: 'Andrieus (Grants)', href: '/greenways/grants-agent?embed=1', prompt: 'Which grants apply to restaurant energy upgrades in the Netherlands?' },
      { name: 'Artemis (Equipment)', href: '/greenways/equipment-agent?embed=1', prompt: 'Find sustainable alternatives for my kitchen equipment' }
    ]
  };
}

module.exports = {
  buildRestaurantSnapshot,
  monthlyEur,
  EQUIPMENT_SHARES
};
