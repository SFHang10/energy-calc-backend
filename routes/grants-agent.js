const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples,
  compareSchemesByIds
} = require('../services/grants-agent-knowledge');
const {
  buildAgentAskFallback,
  normalizeAskProfile,
  finishKnowledgeAskResponse
} = require('../services/greenways-agent-llm-fallback');

const router = express.Router();

router.get('/samples', async (req, res) => {
  try {
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 3));
    const productSamples = await getDefaultProductSamples(limit);
    res.json({ ok: true, productSamples });
  } catch (error) {
    console.error('Grants agent samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load product samples.' });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.schemeIds) ? req.body.schemeIds.map(String).filter(Boolean) : [];
    const profile = normalizeAskProfile(req.body);
    if (ids.length !== 2) {
      return res.status(400).json({ ok: false, error: 'schemeIds must contain exactly two scheme ids.' });
    }
    const result = await compareSchemesByIds(ids[0], ids[1], profile);
    if (!result?.answer) {
      return res.status(404).json({ ok: false, error: 'One or both schemes were not found.' });
    }
    res.json({
      ok: true,
      answer: result.answer,
      suggestions: result.suggestions || [],
      blocks: result.blocks || [],
      productSamples: result.productSamples || [],
      spokenSummary: result.spokenSummary || '',
      source: result.source || 'knowledge',
      intentId: result.intentId || 'compare'
    });
  } catch (error) {
    console.error('Grants agent compare error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to compare schemes.' });
  }
});

router.post('/ask', async (req, res) => {
  try {
    const question = String(req.body?.question || '').trim();
    const profile = normalizeAskProfile(req.body);
    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required.' });
    }

    const knowledge = await answerFromKnowledge(question, profile);
    const response = await finishKnowledgeAskResponse('grants', knowledge, question, profile);
    if (response) {
      return res.json(response);
    }

    res.json(await buildAgentAskFallback('grants', question, profile));
  } catch (error) {
    console.error('Grants agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
