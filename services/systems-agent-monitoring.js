/**
 * Consumer-facing monitoring & sensor knowledge for Edwardo (Systems & equipment).
 */

const path = require('path');
const fs = require('fs/promises');
const { PORTAL_LINKS, pickProductSamples } = require('./greenways-agent-shared');
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
      `**Edwardo — Systems & equipment specialist**\n\n` +
      `${briefing.roleSummary || 'Monitoring, sensors, and building-system visibility for homes and restaurants.'}\n\n` +
      `**What I help with:**\n${focus.map((f) => `- ${f}`).join('\n')}\n\n` +
      `**Greenways entry points:**\n${tools.map((t) => `- **${t.title}** — ${t.summary}\n  → ${t.href}`).join('\n')}\n\n` +
      `**Energy dashboard:** ${PORTAL_LINKS.greenwaysDashboard} — portfolio KPIs (embed still being finalised; Edwardo can explain the maths today).\n\n` +
      `_Ask about sensors for your **${profile.sector || 'site'}**, why monitoring matters, or product review themes._\n\n_${tip}_`,
    blocks: toolsToBlocks(tools, 5),
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
      `For **${profile.sector || 'your site'}**, start with one incomer or circuit meter, then add gas/water where bills hurt most.\n\n` +
      `**On Greenways:**\n${tools.map((t) => `- ${t.title} → ${t.href}`).join('\n')}\n\n_${tip}_`,
    blocks: toolsToBlocks(tools, 4),
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
      `\n**Explore on Greenways:**\n${toolPicks.map((t) => `- ${t.title} → ${t.href}`).join('\n')}\n\n_${tip}_`,
    blocks: toolsToBlocks(toolPicks, 4),
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
      (tools.length ? `**Greenways guides:**\n${tools.map((t) => `- ${t.title} → ${t.href}`).join('\n')}\n\n` : '') +
      `_Hardware varies by electrician and region — confirm compatibility before purchase._\n\n_${tip}_`,
    blocks: toolsToBlocks(guide.greenwaysTools || [], 5),
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
      `- **Sensor intelligence dashboard** — ${dash?.href || './sensor-dashboard.html'} — demo power/gas/water signals for a multi-site restaurant portfolio.\n` +
      `- **Buildings dashboard** — ${portfolio?.href || './Greenways%20Interface%20.html'} — KPI tiles for electricity, gas, water; open site detail for utility drill-down.\n` +
      `- **Utility detail** — ${PORTAL_LINKS.utilityDetail}?type=electricity — chart one utility at a time.\n\n` +
      `Use these to show stakeholders *where* energy goes before you quote upgrades or finance.\n\n_${tip}_`,
    blocks: toolsToBlocks([dash, portfolio].filter(Boolean), 2),
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
