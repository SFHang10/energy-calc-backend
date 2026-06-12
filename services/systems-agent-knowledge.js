const path = require('path');
const { loadIntentsFrom, matchIntent, toLinkItem } = require('./greenways-agent-shared');
const { runChecks, loadChecksConfig, resultsToSamples } = require('./systems-agent-health');
const {
  buildConsumerOverviewAnswer,
  buildMonitoringWhyAnswer,
  buildSensorsSiteAnswer,
  buildMonitoringProductsAnswer,
  buildDashboardDemoAnswer,
  pickConsumerSamples,
  buildHandoffs
} = require('./systems-agent-monitoring');
const {
  buildGreenwaysDashboardAnswer,
  buildDashboardMathAnswer,
  buildTimeOfUseAnswer,
  buildEtlSystemsSavingsAnswer,
  buildDeepDiveSystemsAnswer,
  buildRoleResourcesAnswer
} = require('./systems-agent-dashboard');
const {
  applyPersona,
  loadAgentVoice,
  pickTip
} = require('./greenways-agent-persona');

const intentsPath = path.join(__dirname, '..', 'data', 'systems-agent-intents.json');
const voicePath = path.join(__dirname, '..', 'data', 'systems-agent-voice.json');

const OPS_ANSWER_TYPES = new Set(['health_overview', 'check', 'sync_help', 'portals']);

function formatCheckBullets(results) {
  const icons = { ok: '✅', warn: '⚠️', stale: '🔄', error: '❌', unknown: '❓' };
  return results
    .map((r) => `- ${icons[r.status] || '•'} **${r.label}** — ${r.summary}`)
    .join('\n');
}

function buildHealthOverviewAnswer(report, tip) {
  const { counts, overall } = report;
  return {
    answer:
      `**Platform health snapshot** (read-only ops view):\n\n` +
      `**Overall:** ${overall.toUpperCase()} · ` +
      `${counts.ok || 0} ok · ${counts.warn || 0} review · ${counts.stale || 0} stale · ${counts.error || 0} error\n\n` +
      `${formatCheckBullets(report.results)}\n\n` +
      `Use **Verify selected** in the sidebar to re-check specific items — no build scripts run.\n\n_${tip}_`,
    suggestions: [],
    checkReport: report
  };
}

function buildSingleCheckAnswer(result, tip) {
  const icons = { ok: '✅', warn: '⚠️', stale: '🔄', error: '❌' };
  const action = result.action ? `\n\n**Ops action:** \`${result.action}\`` : '';
  return {
    answer:
      `${icons[result.status] || '•'} **${result.label}**\n\n` +
      `${result.summary}${action}\n\n` +
      `_Checked ${result.checkedAt}_\n\n_${tip}_`,
    suggestions: [],
    checkReport: { results: [result], overall: result.status }
  };
}

function buildSyncHelpAnswer(tip) {
  return {
    answer:
      `**Verify selected** — re-runs read-only checks for the boxes you tick:\n\n` +
      `- **Grants & schemes** — \`schemes.json\` vs \`products-with-grants\` export\n` +
      `- **Product overlay** — grants export metadata\n` +
      `- **Sustainable catalog** — \`sust_*\` row count & update date\n` +
      `- **Deals feed** — \`deals-feed.json\` generated date\n` +
      `- **News knowledge** — policy/funding KB freshness\n` +
      `- **Greenways agents** — chat HTML pages present\n\n` +
      `Does **not** run \`product-grants-integrator.js\` or other build commands.\n\n_${tip}_`,
    suggestions: []
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer:
      `**Ops references** (full Systems skill — not run from consumer chat):\n\n` +
      `- \`Skills/Systems MD.md\` — Wix MCP, ETL API, Render deploy\n` +
      `- \`AGENTS.md\` — edit \`schemes.json\` → \`node product-grants-integrator.js\`\n` +
      `- \`npm run build:deals-feed\` — refresh deals ticker\n` +
      `- Render: \`/health\` on energy-calc-backend.onrender.com\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [toLinkItem('API health', '/health', 'Server heartbeat')]
      }
    ]
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const voice = await loadAgentVoice(voicePath);
  const tip = pickTip(intents.staticTips, null, { skipIntentIds: voice.skipTipIntents });
  const intent = matchIntent(question, intents);

  let result = null;
  let report = null;

  if (intent) {
    const needsReport = OPS_ANSWER_TYPES.has(intent.answerType);
    if (needsReport) report = await runChecks();

    switch (intent.answerType) {
      case 'consumer_overview':
        result = await buildConsumerOverviewAnswer(profile, tip);
        break;
      case 'monitoring_why':
        result = await buildMonitoringWhyAnswer(question, profile, tip);
        break;
      case 'sensors_restaurant':
        result = await buildSensorsSiteAnswer('restaurant', question, profile, tip);
        break;
      case 'sensors_home':
        result = await buildSensorsSiteAnswer('home', question, profile, tip);
        break;
      case 'sensors_office':
        result = await buildSensorsSiteAnswer('office', question, profile, tip);
        break;
      case 'monitoring_products':
        result = await buildMonitoringProductsAnswer(question, profile, tip);
        break;
      case 'greenways_dashboard':
        result = await buildGreenwaysDashboardAnswer(profile, tip);
        break;
      case 'dashboard_math':
        result = await buildDashboardMathAnswer(question, profile, tip);
        break;
      case 'time_of_use':
        result = await buildTimeOfUseAnswer(profile, tip);
        break;
      case 'etl_systems_savings':
        result = await buildEtlSystemsSavingsAnswer(question, tip);
        break;
      case 'deep_dive_systems':
        result = await buildDeepDiveSystemsAnswer(profile, tip);
        break;
      case 'role_resources':
        result = await buildRoleResourcesAnswer(question, tip);
        break;
      case 'health_overview':
        result = buildHealthOverviewAnswer(report, tip);
        break;
      case 'check':
        result = buildSingleCheckAnswer(
          report.results.find((r) => r.id === intent.check) || report.results[0],
          tip
        );
        break;
      case 'sync_help':
        result = buildSyncHelpAnswer(tip);
        break;
      case 'portals':
        result = buildPortalsAnswer(tip);
        break;
      default:
        result = null;
    }
  }

  if (!result) {
    result = await buildConsumerOverviewAnswer(profile, tip);
    result.source = 'heuristic';
  }

  if (result?.answer) {
    result.source = result.source || 'knowledge';
    result.intentId = intent?.id || 'consumer_overview';

    const isOps = intent && OPS_ANSWER_TYPES.has(intent.answerType);
    if (isOps) {
      if (!report) report = await runChecks();
      result.productSamples = resultsToSamples(result.checkReport?.results || report.results);
      result.checkReport = result.checkReport || report;
    } else {
      if (!result.agentHandoffs?.length) {
        const { loadBriefing } = require('./systems-agent-monitoring');
        const briefing = await loadBriefing();
        result.agentHandoffs = buildHandoffs(briefing, question);
      }
      if (!result.productSamples?.length) {
        result.productSamples = await pickConsumerSamples(question, profile, 3);
      }
    }

    applyPersona(result, {
      voice,
      intentId: result.intentId,
      question,
      profile,
      staticTips: intents.staticTips,
      tip: pickTip(intents.staticTips, result.intentId, { skipIntentIds: voice.skipTipIntents })
    });
  }

  return result;
}

async function getDefaultStatusSamples(limit = 6) {
  const report = await runChecks();
  return resultsToSamples(report.results).slice(0, limit);
}

async function getDefaultConsumerSamples(limit = 3) {
  return pickConsumerSamples('monitoring sensor dashboard', {}, limit);
}

module.exports = {
  answerFromKnowledge,
  getDefaultStatusSamples,
  getDefaultConsumerSamples,
  runChecks,
  loadChecksConfig
};
