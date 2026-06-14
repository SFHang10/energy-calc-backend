/**
 * Greenways dashboard math & systems narrative for Edwardo.
 */

const path = require('path');
const fs = require('fs/promises');
const { PORTAL_LINKS } = require('./greenways-agent-shared');
const { linkOrModuleBlocks, guidesToModuleBlocks, systemsModuleBlock } = require('./systems-agent-module-blocks');

const mathPath = path.join(__dirname, '..', 'data', 'systems-agent-dashboard-math.json');
const referencesPath = path.join(__dirname, '..', 'data', 'systems-agent-references.json');

let mathCache = null;

async function loadDashboardMath() {
  if (mathCache) return mathCache;
  try {
    mathCache = JSON.parse(await fs.readFile(mathPath, 'utf8'));
  } catch (_) {
    mathCache = { tariffs: {}, formulas: [], timeOfUse: {}, dashboardFeatures: {} };
  }
  return mathCache;
}

async function loadReferences() {
  try {
    return JSON.parse(await fs.readFile(referencesPath, 'utf8'));
  } catch (_) {
    return { external: [], internalGuides: [] };
  }
}

function formatFormulaBullets(formulas, max = 6) {
  return (formulas || [])
    .slice(0, max)
    .map((f) => `- **${f.label}:** \`${f.expression}\`${f.example ? `\n  _Example:_ ${f.example}` : ''}`)
    .join('\n');
}

async function buildGreenwaysDashboardAnswer(profile, tip) {
  const math = await loadDashboardMath();
  const dash = math.dashboardFeatures?.greenwaysInterface || {};
  const util = math.dashboardFeatures?.utilityDetail || {};
  const sensor = math.dashboardFeatures?.sensorDashboard || {};

  return {
    answer:
      `**Greenways energy dashboard**\n\n` +
      `${dash.title || 'Buildings dashboard'} — ${dash.href || PORTAL_LINKS.greenwaysDashboard}\n\n` +
      '_Status: ' +
      (dash.statusNote || 'In development — KPI model works locally; full Render embed still being finalised.') +
      '_\n\n' +
      `**What it shows for ${profile.sector || 'your site'}:**\n` +
      (dash.features || []).map((f) => `- ${f}`).join('\n') +
      `\n\n**Drill-down:**\n` +
      `- **Utility detail** — ${util.href || PORTAL_LINKS.utilityDetail}?type=electricity|gas|water\n` +
      `- **Sensor dashboard** — ${sensor.href || PORTAL_LINKS.sensorDashboard}\n` +
      `- **Equipment deep dive** — ${PORTAL_LINKS.deepDive} (product-level systems math)\n\n` +
      `**Tariff model behind the numbers:** ${math.tariffs?.summary || '€0.30/kWh elec · gas & water per site-energy-model.js'}\n\n` +
      `_Ask me how the dashboard calculates cost, baseline deltas, or why timing equipment use matters._\n\n_${tip}_`,
    blocks: linkOrModuleBlocks([
      { title: 'Buildings dashboard', url: dash.href || PORTAL_LINKS.greenwaysDashboard, description: 'Portfolio KPIs' },
      { title: 'Utility detail', url: `${PORTAL_LINKS.utilityDetail}?type=electricity`, description: 'One utility at a time' },
      { title: 'Sensor dashboard', url: sensor.href || PORTAL_LINKS.sensorDashboard, description: 'IoT-style signals' },
      { title: 'Equipment deep dive', url: PORTAL_LINKS.deepDive, description: 'ETL vs current asset' }
    ]),
    suggestions: []
  };
}

async function buildDashboardMathAnswer(question, profile, tip) {
  const math = await loadDashboardMath();
  const t = math.tariffs || {};

  return {
    answer:
      `**Dashboard maths on Greenways** — shared model (\`site-energy-model.js\` + buildings dashboard):\n\n` +
      `**Modelling tariffs (illustrative):**\n` +
      `- Electricity **€${t.electricityEurPerKwh ?? 0.3}/kWh**\n` +
      `- Gas **€${((t.kwhPerM3NaturalGas || 10.55) * (t.gasEurPerKwhThermal || 0.11)).toFixed(2)}/m³** (${t.kwhPerM3NaturalGas || 10.55} kWh(th)/m³ × €${t.gasEurPerKwhThermal || 0.11}/kWh)\n` +
      `- Water **€${((t.waterEurPerLitre || 0.0025) * 1000).toFixed(2)}/m³**\n\n` +
      `**Formulas:**\n${formatFormulaBullets(math.formulas, 7)}\n\n` +
      `**Systems insight:** the dashboard compares **actual vs baseline** so you see drift before the bill arrives. Deep dive applies the same €/kWh logic **per equipment line** — that is how we justify ETL upgrades in €/day, not just % labels.\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildTimeOfUseAnswer(profile, tip) {
  const math = await loadDashboardMath();
  const tou = math.timeOfUse || {};

  return {
    answer:
      `**${tou.headline || 'When you use energy matters'}**\n\n` +
      `${(tou.points || []).map((p) => `- ${p}`).join('\n')}\n\n` +
      `**For a ${profile.sector || 'restaurant'}:** open the **24h trend** on ${PORTAL_LINKS.utilityDetail}?type=electricity — identify peak band, then ask Artemis which ETL equipment lowers baseline vs peak.\n\n` +
      `**Finance angle:** Vincent can model payback if you shift load *and* upgrade — Edwardo shows *where* the kWh lives.\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildEtlSystemsSavingsAnswer(question, tip) {
  const math = await loadDashboardMath();
  const examples = math.etlExamples || [];

  return {
    answer:
      `**ETL from a systems lens** — certified efficient equipment is not just a label; it changes **kWh, gas, and water curves** the dashboard and deep dive measure:\n\n` +
      examples.map((e) => `- **${e.title}** — ${e.savings}`).join('\n') +
      `\n\n**How to use this on Greenways:**\n` +
      `- **ETL overview:** ${PORTAL_LINKS.energyTechnologyList}\n` +
      `- **Deep dive:** ${PORTAL_LINKS.deepDive} — compare your line vs \`etl_*\` alternatives with daily € model\n` +
      `- **Savings projection:** ${PORTAL_LINKS.savingsProjection}\n\n` +
      `_Example framing: “Site X saved Y kWh/mo — at €0.30/kWh that is €Z/mo off your bill.” Ask for a specific appliance._\n\n_${tip}_`,
    blocks: linkOrModuleBlocks([
      { title: 'ETL technology list', url: './energy_technology_list_etl.html', description: 'Certified equipment savings ranges' },
      { title: 'Equipment deep dive', url: PORTAL_LINKS.deepDive, description: 'Per-line systems comparison' },
      { title: 'Low energy guide', url: PORTAL_LINKS.lowEnergyGuide, description: 'Real-site examples' }
    ]),
    suggestions: []
  };
}

async function buildDeepDiveSystemsAnswer(profile, tip) {
  const math = await loadDashboardMath();
  const dd = math.dashboardFeatures?.equipmentDeepDive || {};

  return {
    answer:
      `**Equipment deep dive — systems view**\n\n` +
      `The deep dive is where dashboard portfolio numbers meet **one asset**:\n\n` +
      `- **Daily utility model:** electricity + gas + water €/day from measured or modelled kWh/L\n` +
      `- **Utility mix:** cookline may be gas-heavy — sub-meter gas and electrical aux separately\n` +
      `- **Decision matrix:** current asset vs marketplace \`etl_*\` rows with grant overlays\n` +
      `- **Why ETL:** verified efficiency → lower baseline in charts → faster payback in projection\n\n` +
      `**Open:** ${dd.href || PORTAL_LINKS.deepDive}${dd.exampleQuery ? dd.exampleQuery.replace('?', '?') : ''}\n\n` +
      `From the **Greenways dashboard** equipment tab you can jump into deep dive for a selected appliance — return path keeps site context.\n\n_${tip}_`,
    blocks: [systemsModuleBlock([{ moduleId: 'equipment-deep-dive', openSize: 'near-full' }])],
    suggestions: []
  };
}

async function buildRoleResourcesAnswer(question, tip) {
  const briefing = JSON.parse(
    await fs.readFile(path.join(__dirname, '..', 'data', 'systems-agent-briefing.json'), 'utf8').catch(() => '{}')
  );
  const refs = await loadReferences();
  const q = String(question || '').toLowerCase();
  const guides = [...(refs.internalGuides || [])];
  const ranked = q.trim()
    ? guides.filter((g) => [g.title, g.summary].join(' ').toLowerCase().includes(q.split(/\s+/)[0] || ''))
    : guides;
  const picks = (ranked.length ? ranked : guides).slice(0, 6);

  return {
    answer:
      `**Edwardo — systems & equipment specialist**\n\n` +
      `${briefing.roleProfile || briefing.roleSummary || ''}\n\n` +
      `**Must-know themes:**\n${(briefing.mustKnows || []).slice(0, 6).map((m) => `- ${m}`).join('\n')}\n\n` +
      `**Core lens:**\n${(briefing.coreUnderstandings || []).slice(0, 4).map((c) => `- ${c}`).join('\n')}\n\n` +
      `**Greenways guides:**\n${picks.map((g) => `- **${g.title}** — ${g.summary}\n  → ${g.href}`).join('\n')}\n\n_${tip}_`,
    blocks: guidesToModuleBlocks(picks),
    suggestions: []
  };
}

module.exports = {
  loadDashboardMath,
  loadReferences,
  buildGreenwaysDashboardAnswer,
  buildDashboardMathAnswer,
  buildTimeOfUseAnswer,
  buildEtlSystemsSavingsAnswer,
  buildDeepDiveSystemsAnswer,
  buildRoleResourcesAnswer
};
