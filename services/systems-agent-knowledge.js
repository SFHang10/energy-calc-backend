const path = require('path');
const { loadIntentsFrom, matchIntent } = require('./greenways-agent-shared');
const { runChecks, loadChecksConfig, resultsToSamples } = require('./systems-agent-health');

const intentsPath = path.join(__dirname, '..', 'data', 'systems-agent-intents.json');

function formatCheckBullets(results) {
  const icons = { ok: '✅', warn: '⚠️', stale: '🔄', error: '❌', unknown: '❓' };
  return results
    .map((r) => `- ${icons[r.status] || '•'} **${r.label}** — ${r.summary}`)
    .join('\n');
}

function buildOverviewAnswer(report, tip) {
  const { counts, overall } = report;
  return {
    answer:
      `**Greenways Systems Agent** — lightweight health snapshot:\n\n` +
      `**Overall:** ${overall.toUpperCase()} · ` +
      `${counts.ok || 0} ok · ${counts.warn || 0} review · ${counts.stale || 0} stale · ${counts.error || 0} error\n\n` +
      `${formatCheckBullets(report.results)}\n\n` +
      `Use **Verify selected** in the sidebar to re-check specific items (read-only — no scripts run).\n\n_${tip}_`,
    suggestions: [],
    checkReport: report
  };
}

function buildSingleCheckAnswer(result, tip) {
  const icons = { ok: '✅', warn: '⚠️', stale: '🔄', error: '❌' };
  const action = result.action ? `\n\n**Staff action:** \`${result.action}\`` : '';
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
      `**Verify selected (sync button)** — re-runs read-only checks for the boxes you tick:\n\n` +
      `- **Grants & schemes** — compares \`schemes.json\` date vs \`products-with-grants\` export\n` +
      `- **Product overlay** — metadata from grants export (product count, export date)\n` +
      `- **Sustainable catalog** — \`sust_*\` row count & last update\n` +
      `- **Deals feed** — \`deals-feed.json\` generated date\n` +
      `- **News knowledge** — policy/funding KB freshness\n` +
      `- **Greenways agents** — chat HTML pages present\n\n` +
      `This does **not** run \`product-grants-integrator.js\` or other build commands — it only **confirms** status. Staff runs integrators when a check shows **stale**.\n\n_${tip}_`,
    suggestions: []
  };
}

function buildPortalsAnswer(tip) {
  return {
    answer:
      `**Staff references** (full Systems skill — not run from consumer chat):\n\n` +
      `- \`Skills/Systems MD.md\` — Wix MCP, ETL API, Render deploy\n` +
      `- \`AGENTS.md\` — grants workflow: edit \`schemes.json\` → \`node product-grants-integrator.js\`\n` +
      `- \`npm run build:deals-feed\` — refresh deals ticker data\n` +
      `- \`npm run enrich:sustainable-products\` — catalog grant enrichment\n` +
      `- Render health: \`/health\` on energy-calc-backend.onrender.com\n\n_${tip}_`,
    suggestions: []
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);
  const report = await runChecks();

  let result;
  if (intent) {
    switch (intent.answerType) {
      case 'overview':
        result = buildOverviewAnswer(report, tip);
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
    result = buildOverviewAnswer(report, tip);
    result.source = 'heuristic';
  }

  if (result?.answer) {
    result.source = result.source || 'knowledge';
    result.intentId = intent?.id || 'overview';
    result.productSamples = resultsToSamples(result.checkReport?.results || report.results);
    result.checkReport = result.checkReport || report;
  }
  return result;
}

async function getDefaultStatusSamples(limit = 6) {
  const report = await runChecks();
  return resultsToSamples(report.results).slice(0, limit);
}

module.exports = {
  answerFromKnowledge,
  getDefaultStatusSamples,
  runChecks
};
