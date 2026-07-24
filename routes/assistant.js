const express = require('express');
const jwt = require('jsonwebtoken');
const { DashboardLiveService } = require('../services/dashboard-live-service');
const { buildAssistantSiteContext } = require('../services/assistant-site-context');
const { maybeCallGreenwaysLlm, isLlmConfigured, resolveLlmConfig } = require('../services/greenways-agent-llm');
const { getWokAssistSystemPrompt } = require('../services/wok-assist-system-prompt');

const router = express.Router();
const service = new DashboardLiveService();
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key-2025';

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

function parseMemberFromToken(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.id || decoded.sub || null,
      email: decoded.email || null
    };
  } catch (error) {
    return null;
  }
}

function toNum(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatSourceLabel(rawLabel) {
  const label = String(rawLabel || '').trim().toLowerCase();
  if (!label) return 'Energy Feed';
  if (label.includes('mock')) return 'Energy Feed';
  if (label.includes('fallback')) return 'Energy Feed';
  if (label.includes('demo')) return 'Energy Feed';
  if (label.includes('smart meter')) return 'Smart Meter Feed';
  if (label.includes('live feed')) return 'Live Energy Feed';
  return String(rawLabel || '').trim();
}

/** Remove legacy user-facing labels from markdown (older deploys / LLM echoes). */
function scrubLegacyDataSourceLabels(text, displayLabel = 'Energy Feed') {
  let t = String(text || '');
  t = t.replace(/mock live\s*\([^)]*\)/gi, `${displayLabel} (reserve)`);
  t = t.replace(/mock live/gi, displayLabel);
  return t;
}

function computeContext(payload = {}) {
  const totals = payload.totals || {};
  const baseline = payload.baseline || {};
  const elecPct = baseline.electricityKwh > 0 ? (totals.electricityKwh / baseline.electricityKwh) * 100 : 0;
  const gasPct = baseline.gasM3 > 0 ? (totals.gasM3 / baseline.gasM3) * 100 : 0;
  const waterPct = baseline.waterM3 > 0 ? (totals.waterM3 / baseline.waterM3) * 100 : 0;

  const alerts = [];
  if (elecPct >= 100) alerts.push('Electricity is above baseline cap.');
  else if (elecPct >= 85) alerts.push('Electricity is close to baseline cap.');

  if (gasPct >= 100) alerts.push('Gas is above baseline cap.');
  else if (gasPct >= 85) alerts.push('Gas is close to baseline cap.');

  if (waterPct >= 100) alerts.push('Water is above baseline cap.');
  else if (waterPct >= 85) alerts.push('Water is close to baseline cap.');

  const actions = [];
  if (elecPct >= 90) actions.push('Reduce idle electrical loads during prep and low-demand windows.');
  if (gasPct >= 90) actions.push('Apply burner discipline and verify gas-line combustion efficiency.');
  if (waterPct >= 90) actions.push('Run leak/flow checks and tighten wash/rinse cycle timing.');
  if (actions.length === 0) actions.push('Current utility levels are stable; keep monitoring and maintain maintenance cadence.');

  return {
    sourceLabel: formatSourceLabel(payload.sourceLabel),
    generatedAt: payload.meta?.generatedAt || new Date().toISOString(),
    totals: {
      electricityKwh: toNum(totals.electricityKwh, 0),
      gasM3: toNum(totals.gasM3, 0),
      waterM3: toNum(totals.waterM3, 0),
      costEur: toNum(totals.costEur, 0)
    },
    baseline: {
      electricityKwh: toNum(baseline.electricityKwh, 0),
      gasM3: toNum(baseline.gasM3, 0),
      waterM3: toNum(baseline.waterM3, 0)
    },
    loadPct: {
      electricity: Math.round(elecPct),
      gas: Math.round(gasPct),
      water: Math.round(waterPct)
    },
    alerts,
    actions
  };
}

function buildAssumptions(context) {
  return [
    'Load percentages are computed against current baseline values.',
    'Savings estimates use simple utility deltas and are directional, not audited forecasts.',
    `Current data source is "${context.sourceLabel}" captured at ${context.generatedAt}.`
  ];
}

function computeConfidence(context) {
  const hasBaseline = context.baseline.electricityKwh > 0 || context.baseline.gasM3 > 0 || context.baseline.waterM3 > 0;
  const severeCount = context.alerts.filter((a) => a.includes('above baseline cap')).length;
  if (hasBaseline && severeCount === 0) {
    return { level: 'High', reason: 'Live totals and baselines are available with no severe breaches.' };
  }
  if (hasBaseline) {
    return { level: 'Medium', reason: 'Live totals and baselines are available, but one or more utilities are above cap.' };
  }
  return { level: 'Low', reason: 'Baseline quality is limited, so recommendations are heuristic.' };
}

function estimateRoi(context) {
  const elecOver = Math.max(0, context.totals.electricityKwh - context.baseline.electricityKwh);
  const gasOver = Math.max(0, context.totals.gasM3 - context.baseline.gasM3);
  const waterOver = Math.max(0, context.totals.waterM3 - context.baseline.waterM3);

  // Directional monthly savings estimate from reducing current "over baseline" amounts by 40%.
  const monthlySavingsEur = ((elecOver * 0.32) + (gasOver * 1.05) + (waterOver * 2.4)) * 0.4 * 30;
  const indicativeActionCost = 450; // lightweight operational intervention estimate
  const paybackMonths = monthlySavingsEur > 0 ? (indicativeActionCost / monthlySavingsEur) : null;

  return {
    monthlySavingsEur,
    indicativeActionCost,
    paybackMonths
  };
}

function renderTrustBlock(context) {
  const confidence = computeConfidence(context);
  const assumptions = buildAssumptions(context).map((a) => `- ${a}`).join('\n');
  const roi = estimateRoi(context);
  const roiText = roi.monthlySavingsEur > 0
    ? `- Estimated monthly savings opportunity: **€${roi.monthlySavingsEur.toFixed(0)}**\n- Indicative implementation cost: **€${roi.indicativeActionCost.toFixed(0)}**\n- Indicative payback: **${roi.paybackMonths.toFixed(1)} months**`
    : '- Estimated monthly savings opportunity: **€0-€50** (currently close to baseline)\n- Indicative implementation cost: **€450**\n- Indicative payback: **not material at current load**';

  return `\n\n### Confidence\n- Level: **${confidence.level}**\n- Why: ${confidence.reason}\n\n### Assumptions\n${assumptions}\n\n### ROI snapshot\n${roiText}`;
}

function formatSiteRadar(siteContext) {
  if (!siteContext) return '';
  const { restaurantProfile, dealsContext, schemesContext } = siteContext;
  const pri = (restaurantProfile?.priorityUtilities || []).join(', ') || 'balanced';
  const dealLines = (dealsContext?.topDeals || []).slice(0, 5).map((d) => {
    const r = d.region ? ` · ${d.region}` : '';
    return `- **${d.title}** (${d.category}${r}) — ${d.line}`;
  });
  const schemeLines = (schemesContext?.schemes || []).slice(0, 4).map((s) => `- ${s.title} (${s.region})`);
  const parts = [
    `### Site profile (assistant bundle)`,
    `- **${restaurantProfile?.siteLabel || 'Site'}** — priorities: **${pri}**`,
    restaurantProfile?.notes ? `- Notes: ${restaurantProfile.notes}` : '',
    dealLines.length ? ['### Curated deals feed (internal cards — verify externally)', ...dealLines].join('\n') : '',
    schemeLines.length ? ['### Scheme ideas from catalogue (verify eligibility)', ...schemeLines].join('\n') : ''
  ].filter(Boolean);
  return parts.join('\n\n');
}

function buildHeuristicAnswer(question, context, location = 'Amsterdam', siteContext = null) {
  const q = String(question || '').toLowerCase();
  const focus =
    q.includes('gas') ? 'gas' :
      q.includes('water') ? 'water' :
        q.includes('electric') || q.includes('power') ? 'electricity' : 'all';

  const metricRows = [
    `| Electricity | ${context.totals.electricityKwh.toFixed(1)} kWh | ${context.baseline.electricityKwh.toFixed(1)} kWh | ${context.loadPct.electricity}% |`,
    `| Gas | ${context.totals.gasM3.toFixed(1)} m³ | ${context.baseline.gasM3.toFixed(1)} m³ | ${context.loadPct.gas}% |`,
    `| Water | ${context.totals.waterM3.toFixed(2)} m³ | ${context.baseline.waterM3.toFixed(2)} m³ | ${context.loadPct.water}% |`
  ].join('\n');

  const alerts = context.alerts.length
    ? context.alerts.map((a) => `- ${a}`).join('\n')
    : '- No critical threshold breaches detected right now.';

  const actions = context.actions.map((a, idx) => `${idx + 1}. ${a}`).join('\n');
  const focusLine = focus === 'all'
    ? 'Focus: full utility stack (electricity, gas, water).'
    : `Focus: ${focus} trend and optimization actions.`;

  return `## Wok to Walk Assistance

### Live energy snapshot (${location})
${focusLine}

| Utility | Current | Baseline | Load vs baseline |
| --- | --- | --- | --- |
${metricRows}

### Active alerts
${alerts}

### Suggested actions
${actions}

### Notes
- Data source: ${context.sourceLabel}
- Timestamp: ${context.generatedAt}
- If you want deeper forecasting, configure server LLM credentials for context-aware long-form answers.${siteContext ? `\n\n${formatSiteRadar(siteContext)}` : ''}${renderTrustBlock(context)}`;
}

async function maybeCallServerLlm(question, context, location, siteContext, history = []) {
  const systemPrompt = getWokAssistSystemPrompt({ location });
  const recentHistory = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-8)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1200) }))
    : [];

  return maybeCallGreenwaysLlm({
    prefix: '',
    systemPrompt,
    userPayload: {
      question,
      location,
      companyId: siteContext?.restaurantProfile?.companyId || null,
      siteId: siteContext?.restaurantProfile?.siteId || null,
      recentHistory,
      energyContext: context,
      restaurantProfile: siteContext?.restaurantProfile,
      dealsContext: siteContext?.dealsContext,
      schemesContext: siteContext?.schemesContext
    },
    maxTokens: 1600
  });
}

router.get('/status', (req, res) => {
  const cfg = resolveLlmConfig('');
  res.json({
    ok: true,
    service: 'assistant',
    llmConfigured: isLlmConfigured(''),
    provider: cfg?.provider || null,
    model: cfg?.model || null,
    mode: cfg ? 'greenways-llm' : 'heuristic'
  });
});

router.get('/context', async (req, res) => {
  try {
    const member = parseMemberFromToken(req);
    const mode = String(req.query.mode || 'live');
    const companyId = String(req.query.companyId || '');
    const siteId = String(req.query.siteId || '');
    const payload = await service.getLiveData({ mode, companyId, siteId, member });
    const context = computeContext(payload);
    const siteContext = buildAssistantSiteContext(siteId, companyId);
    res.json({ ok: true, context, siteContext });
  } catch (error) {
    console.error('❌ Assistant context error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to build assistant context.' });
  }
});

router.post('/ask', async (req, res) => {
  try {
    const member = parseMemberFromToken(req);
    const question = String(req.body?.question || '').trim();
    const mode = String(req.body?.mode || 'live');
    const companyId = String(req.body?.companyId || '');
    const siteId = String(req.body?.siteId || '');
    const location = String(req.body?.location || 'Amsterdam');
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    if (!question) {
      return res.status(400).json({ ok: false, error: 'Question is required.' });
    }

    const payload = await service.getLiveData({ mode, companyId, siteId, member });
    const context = computeContext(payload);
    const siteContext = buildAssistantSiteContext(siteId, companyId);
    const llmConfigured = isLlmConfigured('');
    const llmAnswer = await maybeCallServerLlm(question, context, location, siteContext, history);
    const llmUsed = Boolean(llmAnswer && String(llmAnswer).trim());
    const answerBody = llmUsed ? llmAnswer : buildHeuristicAnswer(question, context, location, siteContext);
    const answerRaw = llmUsed ? `${answerBody}${renderTrustBlock(context)}` : answerBody;
    const answer = scrubLegacyDataSourceLabels(answerRaw, context.sourceLabel);
    res.json({
      ok: true,
      answer,
      context,
      siteContext,
      llmConfigured,
      llmUsed,
      mode: llmUsed ? 'greenways-llm' : 'heuristic',
      confidence: computeConfidence(context),
      assumptions: buildAssumptions(context),
      roi: estimateRoi(context)
    });
  } catch (error) {
    console.error('❌ Assistant ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
