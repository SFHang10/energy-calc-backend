const path = require('path');
const { loadIntentsFrom, matchIntent, toLinkItem } = require('./greenways-agent-shared');
const { enrichKnowledgeAnswer } = require('./greenways-content-modules');
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
const {
  buildHandoffTopicSummary,
  isReferralWelcomePair
} = require('./greenways-agent-handoff');

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

function formatCheckTimestamp(iso) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCheckSummary(result) {
  if (result.id === 'deals' && result.dealCount != null) {
    const when = formatCheckTimestamp(result.generatedAt);
    let line = `**${result.dealCount}** deals in the feed · last built **${when}**`;
    if (result.ageDays != null && result.status !== 'ok') {
      line += ` (${Math.round(result.ageDays)} days ago)`;
    }
    return line;
  }
  return result.summary;
}

function checkStatusPhrase(status) {
  const map = {
    ok: 'looks up to date',
    warn: 'may need a refresh soon',
    stale: 'is stale — refresh recommended',
    error: 'needs attention'
  };
  return map[status] || String(status || 'unknown');
}

function buildDealsFeedCheckAnswer(result) {
  const when = formatCheckTimestamp(result.generatedAt);
  const ageNote =
    result.ageDays != null && result.status !== 'ok'
      ? ` — about **${Math.round(result.ageDays)} days** ago`
      : '';
  const statusExplain = {
    ok: 'The deals export looks current. Zara’s hub and tickers should show these spotlights.',
    warn: 'The deals export is ageing. Spotlights may not reflect the latest offers.',
    stale: 'The deals export is out of date. Deal spotlights in the hub may not be current.',
    error: 'The deals export could not be read. Deal spotlights may be unavailable.'
  };
  const { linkOrModuleBlocks } = require('./systems-agent-module-blocks');
  return {
    answer:
      `**Deals feed** (read-only check)\n\n` +
      `This is the **weekly deal spotlights** file Zara uses in the **Deals hub** and ticker — not live tariff switching.\n\n` +
      `**${statusExplain[result.status] || 'Status unknown.'}**\n\n` +
      `**${result.dealCount ?? 0}** deals · last updated **${when}**${ageNote}\n\n` +
      `Edwardo only **reads** this file on disk. He does not refresh or rebuild the feed.\n\n` +
      `_To browse deals, open **Zara (Deals Agent)** or the Deals hub._`,
    suggestions: [],
    blocks: linkOrModuleBlocks([
      { title: 'Deals ticker hub', url: './deals-ticker-hub.html', description: 'Search and marquee lanes' },
      { title: 'Full Deals page', url: './Deals.html', description: 'Ticker + sidebar portals' }
    ]),
    agentHandoffs: [
      {
        id: 'dealsToZara',
        name: 'Zara (Deals)',
        href: '/greenways/deals-agent',
        prompt: 'What deal spotlights are in the weekly feed?'
      }
    ],
    checkReport: { results: [result], overall: result.status }
  };
}

function buildSingleCheckAnswer(result, tip) {
  const detail = formatCheckSummary(result);
  const tail = tip ? `\n\n_${tip}_` : '\n\n_Read-only check — no scripts were run from this chat._';
  return {
    answer:
      `**${result.label}** ${checkStatusPhrase(result.status)}.\n\n` +
      `${detail}\n\n` +
      `Edwardo only **reads** files on disk — he does not run builds or change exports.${tail}`,
    suggestions: [],
    checkReport: { results: [result], overall: result.status }
  };
}

function buildSyncHelpAnswer(tip) {
  return {
    answer:
      `**Verify selected** — re-runs read-only checks for the boxes you tick:\n\n` +
      `- **Grants & schemes** — Schemes catalogue vs marketplace product grants export\n` +
      `- **Product overlay** — grants export metadata\n` +
      `- **Sustainable catalog** — \`sust_*\` row count & update date\n` +
      `- **Deals feed** — last refresh date on the live feed\n` +
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
      `- \`AGENTS.md\` — update the **Schemes** catalogue → run product grants enrichment\n` +
      `- Refresh the **deals feed** when weekly spotlights change\n` +
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

async function buildReferralWelcomeAnswer(question, profile, tip) {
  const handoff = profile.handoff;
  if (!isReferralWelcomePair('systems-agent', handoff)) return null;

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
  const { loadBriefing } = require('./systems-agent-monitoring');
  const briefing = await loadBriefing();
  const overview = await buildConsumerOverviewAnswer(profile, tip);
  const body = String(overview.answer || '').replace(/\n\n_[\s\S]*_$/, '');

  return {
    ...overview,
    answer:
      `**${fromName}** suggested establishing a **monitoring baseline** before upgrades.\n\n` +
      `From your chat: _${topic}_\n\n` +
      `${body}\n\n_${tip}_`,
    intentId: 'agent_referral_welcome',
    agentHandoffs: buildHandoffs(briefing, handoff.question || question)
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const voice = await loadAgentVoice(voicePath);
  const tip = pickTip(intents.staticTips, null, { skipIntentIds: voice.skipTipIntents });

  if (profile.handoff) {
    const referralTip = pickTip(intents.staticTips, 'agent_referral_welcome', {
      skipIntentIds: voice.skipTipIntents
    });
    const referral = await buildReferralWelcomeAnswer(question, profile, referralTip);
    if (referral?.answer) {
      referral.source = 'knowledge';
      applyPersona(referral, {
        voice: {
          ...voice,
          skipOpenerIntents: [
            ...new Set([...(voice.skipOpenerIntents || []), 'agent_referral_welcome', 'consumer_overview'])
          ]
        },
        intentId: 'agent_referral_welcome',
        question,
        profile,
        staticTips: intents.staticTips,
        tip: referralTip
      });
      return referral;
    }
  }

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
      case 'check': {
        const checkResult =
          report.results.find((r) => r.id === intent.check) || report.results[0];
        result =
          intent.check === 'deals'
            ? buildDealsFeedCheckAnswer(checkResult)
            : buildSingleCheckAnswer(checkResult, tip);
        break;
      }
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

    if (!isOps) {
      enrichKnowledgeAnswer(result, {
        agentKey: 'systems',
        question,
        intentId: result.intentId,
        profile
      });
    }

    applyPersona(result, {
      voice: isOps
        ? {
            ...voice,
            skipOpenerIntents: [
              ...new Set([...(voice.skipOpenerIntents || []), result.intentId, 'consumer_overview'])
            ]
          }
        : voice,
      intentId: result.intentId,
      question,
      profile,
      staticTips: intents.staticTips,
      tip: isOps ? '' : pickTip(intents.staticTips, result.intentId, { skipIntentIds: voice.skipTipIntents })
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
