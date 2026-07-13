/**
 * Consumer-facing monitoring & sensor knowledge for Edwardo (Systems & equipment).
 */

const path = require('path');
const fs = require('fs/promises');
const { pickProductSamples, agentProfileBlock } = require('./greenways-agent-shared');
const { toolsToModuleBlocks } = require('./systems-agent-module-blocks');

const guidePath = path.join(__dirname, '..', 'data', 'systems-agent-monitoring-guide.json');
const briefingPath = path.join(__dirname, '..', 'data', 'systems-agent-briefing.json');
const buildingsPath = path.join(__dirname, '..', 'data', 'company-map-buildings.json');
const showcasePath = path.join(__dirname, '..', 'data', 'systems-agent-showcase.json');

let guideCache = null;

async function loadMonitoringGuide() {
  if (guideCache) return guideCache;
  try {
    const raw = await fs.readFile(guidePath, 'utf8');
    guideCache = JSON.parse(raw);
  } catch (_) {
    guideCache = { sensorTypes: [], greenwaysTools: [], productReviewThemes: [], siteProfiles: {} };
  }
  return guideCache;
}

async function loadBriefing() {
  try {
    const raw = await fs.readFile(briefingPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

async function loadExampleSiteSensors() {
  try {
    const raw = await fs.readFile(buildingsPath, 'utf8');
    const data = JSON.parse(raw);
    return (data.buildings || []).slice(0, 2).map((b) => ({
      name: b.name,
      sensors: b.sensors || []
    }));
  } catch (_) {
    return [];
  }
}

function rankByQuestion(items, question, textKeys = ['title', 'summary', 'tags']) {
  const q = String(question || '').toLowerCase();
  if (!q.trim()) return items;
  return items
    .map((item) => {
      const hay = textKeys
        .flatMap((k) => {
          const v = item[k];
          return Array.isArray(v) ? v : [v];
        })
        .join(' ')
        .toLowerCase();
      let score = 0;
      q.split(/\s+/).filter((t) => t.length >= 3).forEach((token) => {
        if (hay.includes(token)) score += 3;
      });
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item);
}

function toolsToBlocks(tools, max = 5) {
  return toolsToModuleBlocks(tools, max);
}

/** Conversational one-liner for left-column prose — no raw HTML paths. */
function greenwaysToolHelpSentence(tool = {}) {
  const summary = String(tool.summary || '').trim().replace(/\.\s*$/, '');
  const byId = {
    'restaurant-energy-monitoring-guide':
      'The **restaurant energy monitoring guide** is our full UK & EU walkthrough — calculator, equipment split, demo dashboard, and case studies — I open it when a kitchen team needs the “why monitor?” story with numbers.',
    'energy-monitoring-guide':
      'Our **energy monitoring guide** explains in everyday language why measuring use *before* a big purchase saves money — I send people here when bills feel vague and they are not sure where to start.',
    'smart-sensor-monitoring':
      '**Smart sensor monitoring** walks restaurant and commercial IoT lanes — power, gas, water, cold chain, and leak alerts — so you can see what to measure before you buy hardware.',
    'energy-audit':
      'The **energy audit walkthrough** helps you map appliance-level use room by room, so you know which circuits deserve a sensor or upgrade first.',
    'sensor-dashboard':
      'The **sensor dashboard** is a live-style demo — you can see power, gas, and water signals across sites and learn what “good visibility” looks like before you buy hardware.',
    'greenways-dashboard':
      'The **buildings dashboard** rolls electricity, gas, and water into portfolio KPIs — useful once you want site-level context, not just one meter.',
    'utility-detail':
      '**Utility detail** lets you drill into electricity, gas, or water on its own with charts and targets when one bill is the problem.',
    'restaurant-data':
      '**Restaurant site data** ties a single venue to whole-building savings projection — handy when you are planning a kitchen retrofit with numbers.',
    'discover-savings':
      '**Discover energy savings** walks consumer quick wins once monitoring shows where waste actually lives.'
  };
  if (byId[tool.id]) return byId[tool.id];
  if (summary) {
    return `**${tool.title}** — ${summary.charAt(0).toLowerCase()}${summary.slice(1)}.`;
  }
  return `**${tool.title}** — open the tablet when you are ready to explore that path.`;
}

function greenwaysToolTabletHint(tool = {}) {
  const hints = {
    'restaurant-energy-monitoring-guide':
      'UK or Europe — set your bill, see savings estimate, equipment breakdown, and real hospitality case studies.',
    'energy-monitoring-guide':
      'Start here if monitoring is new — why measure first, and what to look for before capex.',
    'smart-sensor-monitoring':
      'IoT sensor lanes for restaurants — see what to meter and where alerts pay back before hardware spend.',
    'energy-audit':
      'Room-by-room audit — spot the appliances and circuits worth metering first.',
    'sensor-dashboard':
      'Demo live power, gas, and water lanes — see what actionable signals look like.',
    'greenways-dashboard':
      'Portfolio KPI tiles — electricity, gas, water, and site drill-down.',
    'utility-detail':
      'Chart one utility at a time when a single bill needs investigation.',
    'restaurant-data':
      'Single-site data plus whole-building savings projection.',
    'discover-savings':
      'Consumer quick-win paths after you know where waste is.'
  };
  return hints[tool.id] || tool.summary || '';
}

function toolsToBlocksWithHints(tools, max = 5) {
  const enriched = (tools || []).slice(0, max).map((t) => ({
    ...t,
    summary: greenwaysToolTabletHint(t)
  }));
  return toolsToModuleBlocks(enriched, max);
}

function greenwaysToolsClosingParagraph(tools) {
  if (!tools?.length) return '';
  const sentences = tools.map(greenwaysToolHelpSentence);
  return (
    `**Where to explore on Greenways:** ${sentences.join(' ')} ` +
    `I put each one on a tablet to the right — open when you want the full page; the tablet tells you what you will see and how it can help your next step.\n\n`
  );
}

function sectorMonitoringAdvice(profile = {}) {
  const sector = String(profile.sector || 'your site').toLowerCase();
  if (sector === 'home') {
    return 'At home, I usually start with one incomer or circuit meter on your fuse board, then add gas or water monitoring where bills surprise you — heating, hot water, and always-on loads are the usual culprits.';
  }
  if (sector === 'restaurant') {
    return 'In restaurants, I start with incomer power, then refrigeration and dishwash lines — lunch peaks and overnight HVAC drift are where monitoring pays back fastest.';
  }
  if (sector === 'office') {
    return 'In offices, tenant submeters and HVAC runtime monitors often expose after-hours waste before you spend on fabric upgrades.';
  }
  return `For **${profile.sector || 'your site'}**, start with one incomer or circuit meter, then add gas and water where bills hurt most.`;
}

function buildHandoffs(briefing, question) {
  const out = [];
  const eq = briefing?.handoffs?.equipmentToArtemis;
  const fin = briefing?.handoffs?.financeToVincent;
  if (eq) {
    out.push({
      id: eq.agentId,
      name: eq.agentName,
      href: eq.agentPath,
      prompt: String(question || '').trim() || 'What equipment upgrades fit after I have monitoring data?'
    });
  }
  if (fin) {
    out.push({
      id: fin.agentId,
      name: fin.agentName,
      href: fin.agentPath,
      prompt: 'How do I finance monitoring hardware and efficient upgrades after baseline measurement?'
    });
  }
  return out;
}

async function buildConsumerOverviewAnswer(profile, tip) {
  const briefing = await loadBriefing();
  const guide = await loadMonitoringGuide();
  const focus = (briefing.consumerFocus || []).slice(0, 5);
  const tools = (guide.greenwaysTools || []).slice(0, 4);

  return {
    answer:
      agentProfileBlock(
        `**Edwardo — Systems & equipment specialist**`,
        briefing.roleSummary ||
          'Monitoring, sensors, and building-system visibility for homes and restaurants.'
      ) +
      `**What I help with:**\n${focus.map((f) => `- ${f}`).join('\n')}\n\n` +
      greenwaysToolsClosingParagraph(tools) +
      `**Energy dashboard:** portfolio KPIs on Greenways — I can explain the maths even while the live embed is being finalised.\n\n` +
      `_Ask about sensors for your **${profile.sector || 'site'}**, why monitoring matters, or product review themes._\n\n_${tip}_`,
    blocks: toolsToBlocksWithHints(tools, 5),
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, '')
  };
}

async function buildMonitoringWhyAnswer(question, profile, tip) {
  const guide = await loadMonitoringGuide();
  const why = guide.whyMonitoring || {};
  const tools = rankByQuestion(guide.greenwaysTools || [], question || 'monitoring audit').slice(0, 3);
  if (!tools.length) tools.push(...(guide.greenwaysTools || []).slice(0, 3));

  return {
    answer:
      `**${why.headline || 'Why monitoring matters'}**\n\n` +
      `${(why.points || []).map((p) => `- ${p}`).join('\n')}\n\n` +
      `${sectorMonitoringAdvice(profile)}\n\n` +
      greenwaysToolsClosingParagraph(tools) +
      `_${tip}_`,
    blocks: toolsToBlocksWithHints(tools, 4),
    suggestions: []
  };
}

async function buildSensorsSiteAnswer(siteKey, question, profile, tip) {
  const guide = await loadMonitoringGuide();
  const site = guide.siteProfiles?.[siteKey] || guide.siteProfiles?.restaurant;
  const sensors = rankByQuestion(guide.sensorTypes || [], question, ['name', 'measures', 'restaurantUse', 'homeUse']);
  const sensorBullets = (sensors.length ? sensors : guide.sensorTypes || [])
    .slice(0, 5)
    .map((s) => {
      const use = siteKey === 'home' ? s.homeUse : s.restaurantUse;
      return `- **${s.name}** — ${s.measures}. _${siteKey === 'office' ? s.restaurantUse : use}_`;
    })
    .join('\n');

  const examples = siteKey === 'restaurant' ? await loadExampleSiteSensors() : [];
  const exampleBlock = examples.length
    ? `\n**Example sensor sets (Amsterdam Wok To Walk sites):**\n${examples
        .map((e) => `- **${e.name}:** ${e.sensors.slice(0, 4).join(' · ')}`)
        .join('\n')}\n`
    : '';

  const tools = (guide.greenwaysTools || []).filter((t) =>
    (t.tags || []).some((tag) => ['sensor', 'monitoring', 'dashboard', siteKey].includes(tag))
  );
  const toolPicks = tools.length ? tools.slice(0, 3) : (guide.greenwaysTools || []).slice(0, 3);

  return {
    answer:
      `**Sensors for ${site?.label || siteKey}**\n\n` +
      `**Priority installs:**\n${(site?.prioritySensors || []).map((s) => `- ${s}`).join('\n')}\n\n` +
      `**Sensor types that matter:**\n${sensorBullets}\n\n` +
      `**Quick wins:**\n${(site?.quickWins || []).map((w) => `- ${w}`).join('\n')}\n` +
      exampleBlock +
      `\n` +
      greenwaysToolsClosingParagraph(toolPicks) +
      `_${tip}_`,
    blocks: toolsToBlocksWithHints(toolPicks, 4),
    suggestions: [],
    agentHandoffs: buildHandoffs(await loadBriefing(), question)
  };
}

async function buildMonitoringProductsAnswer(question, profile, tip) {
  const guide = await loadMonitoringGuide();
  const themes = rankByQuestion(guide.productReviewThemes || [], question, ['title', 'reviewAngle', 'tags']);
  const picks = (themes.length ? themes : guide.productReviewThemes || []).slice(0, 5);
  const tools = (guide.greenwaysTools || []).filter((t) => (t.tags || []).includes('monitoring')).slice(0, 3);

  let productSamples = [];
  try {
    productSamples = await pickProductSamples(showcasePath, `${question} monitoring meter sensor`, profile, 3);
  } catch (_) {
    productSamples = [];
  }

  return {
    answer:
      `**Monitoring product review lens**\n\n` +
      picks
        .map((t) => `- **${t.title}** — ${t.reviewAngle}`)
        .join('\n') +
      `\n\n**How I review:** fit-for-site granularity · alert quality · install cost · data export for grants/M&V · pairing with efficient equipment.\n\n` +
      (tools.length ? greenwaysToolsClosingParagraph(tools) : '') +
      `_Hardware varies by electrician and region — confirm compatibility before purchase._\n\n_${tip}_`,
    blocks: toolsToBlocksWithHints(guide.greenwaysTools || [], 5),
    productSamples,
    suggestions: [],
    agentHandoffs: buildHandoffs(await loadBriefing(), question)
  };
}

async function buildDashboardDemoAnswer(tip) {
  const guide = await loadMonitoringGuide();
  const dash = (guide.greenwaysTools || []).find((t) => t.id === 'sensor-dashboard');
  const portfolio = (guide.greenwaysTools || []).find((t) => t.id === 'greenways-dashboard');

  return {
    answer:
      `**Live-style dashboards on Greenways**\n\n` +
      `Use these to show stakeholders *where* energy goes before you quote upgrades or finance.\n\n` +
      greenwaysToolsClosingParagraph([dash, portfolio].filter(Boolean)) +
      `**Utility detail** charts one utility at a time when you need to isolate a single bill — ask me to open electricity, gas, or water.\n\n` +
      `_${tip}_`,
    blocks: toolsToBlocksWithHints([dash, portfolio].filter(Boolean), 2),
    suggestions: []
  };
}

async function pickConsumerSamples(question, profile, limit = 3) {
  try {
    const samples = await pickProductSamples(showcasePath, `${question} meter monitoring sensor`, profile, limit);
    if (samples.length) return samples;
  } catch (_) {}
  return [];
}

module.exports = {
  loadMonitoringGuide,
  loadBriefing,
  buildConsumerOverviewAnswer,
  buildMonitoringWhyAnswer,
  buildSensorsSiteAnswer,
  buildMonitoringProductsAnswer,
  buildDashboardDemoAnswer,
  pickConsumerSamples,
  buildHandoffs
};
