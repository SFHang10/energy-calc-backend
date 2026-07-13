const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples
} = require('../services/sustainable-products-agent-knowledge');
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

router.get('/samples', async (req, res) => {
  try {
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 3));
    const lane = String(req.query.lane || '').trim().toLowerCase();
    const productSamples = await getDefaultProductSamples(limit, lane || 'electricity');
    res.json({ ok: true, productSamples });
  } catch (error) {
    console.error('Sustainable products agent samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load product samples.' });
  }
});

router.post('/ask', async (req, res) => {
  const startedAt = Date.now();
  try {
    const question = String(req.body?.question || '').trim();
    const profile = await enrichAskProfileWithMember(normalizeAskProfile(req.body));
    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required.' });
    }

    const knowledge = await answerFromKnowledge(question, profile);
    const response = await finishKnowledgeAskResponse('sustainable-products', knowledge, question, profile);
    if (response) {
      response.answer = attachProfileContext(response.answer, profile);
      logAskEvent({
        agent: 'sustainable-products',
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

    const fallback = await buildAgentAskFallback('sustainable-products', question, profile);
    if (fallback?.answer) fallback.answer = attachProfileContext(fallback.answer, profile);
    logAskEvent({
      agent: 'sustainable-products',
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
    console.error('Sustainable products agent ask error:', error.message);
    logAskEvent({
      agent: 'sustainable-products',
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
