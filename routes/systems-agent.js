const express = require('express');
const {
  answerFromKnowledge,
  getDefaultStatusSamples,
  runChecks
} = require('../services/systems-agent-knowledge');
const { loadChecksConfig } = require('../services/systems-agent-health');
const {
  buildAgentAskFallback,
  normalizeAskProfile,
  finishKnowledgeAskResponse
} = require('../services/greenways-agent-llm-fallback');
const { logAskEvent } = require('../services/greenways-ask-logger');
const { enrichAskProfileWithMember } = require('../services/greenways-member-context');
const { profileLine } = require('../services/greenways-agent-persona');
const { profileContextBlock } = require('../services/greenways-agent-shared');

const router = express.Router();

function attachProfileContext(answer, profile) {
  const body = String(answer || '').trim();
  if (!body) return body;
  if (body.includes(':::profile-context')) return body;
  if (!profile?.region && !profile?.sector && !profile?.tier && !profile?.memberId) return body;

  const pLine = profileLine(profile);
  if (!pLine) return body;
  return `${profileContextBlock(pLine)}${body}`;
}

router.get('/checks', async (req, res) => {
  try {
    const config = await loadChecksConfig();
    res.json({ ok: true, checks: config.checks || [] });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to load check definitions.' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const report = await runChecks();
    res.json(report);
  } catch (error) {
    console.error('Systems agent status error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to run health checks.' });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const checks = Array.isArray(req.body?.checks) ? req.body.checks : null;
    const report = await runChecks(checks);
    res.json({
      ...report,
      synced: true,
      message: 'Read-only verify complete — no build scripts were executed.'
    });
  } catch (error) {
    console.error('Systems agent sync error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to verify selected checks.' });
  }
});

router.get('/samples', async (req, res) => {
  try {
    const limit = Math.min(8, Math.max(1, Number(req.query.limit) || 6));
    const productSamples = await getDefaultStatusSamples(limit);
    res.json({ ok: true, productSamples });
  } catch (error) {
    console.error('Systems agent samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load status samples.' });
  }
});

router.post('/ask', async (req, res) => {
  const startedAt = Date.now();
  try {
    const question = String(req.body?.question || '').trim();
    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required.' });
    }

    const profile = await enrichAskProfileWithMember(normalizeAskProfile(req.body));
    const knowledge = await answerFromKnowledge(question, profile);
    const response = await finishKnowledgeAskResponse('systems', knowledge, question, profile);
    if (response) {
      response.answer = attachProfileContext(response.answer, profile);
      logAskEvent({
        agent: 'systems',
        ok: true,
        source: response.source,
        intentId: response.intentId,
        ms: Date.now() - startedAt,
        profile,
        ip: req.ip,
        ua: req.headers['user-agent']
      });
      return res.json(response);
    }

    const fallback = await buildAgentAskFallback('systems', question, profile);
    if (fallback?.answer) fallback.answer = attachProfileContext(fallback.answer, profile);
    logAskEvent({
      agent: 'systems',
      ok: true,
      source: fallback?.source || 'fallback',
      intentId: fallback?.intentId || null,
      ms: Date.now() - startedAt,
      profile,
      ip: req.ip,
      ua: req.headers['user-agent']
    });
    res.json(fallback);
  } catch (error) {
    console.error('Systems agent ask error:', error.message);
    logAskEvent({
      agent: 'systems',
      ok: false,
      source: 'error',
      intentId: null,
      ms: Date.now() - startedAt,
      profile: await enrichAskProfileWithMember(normalizeAskProfile(req.body)),
      ip: req.ip,
      ua: req.headers['user-agent'],
      error: error.message
    });
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
