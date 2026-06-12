const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples
} = require('../services/finance-agent-knowledge');
const { buildAgentAskFallback, normalizeAskProfile } = require('../services/greenways-agent-llm-fallback');

const router = express.Router();

router.get('/samples', async (req, res) => {
  try {
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 3));
    const productSamples = await getDefaultProductSamples(limit);
    res.json({ ok: true, productSamples });
  } catch (error) {
    console.error('Finance agent samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load finance samples.' });
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
    if (knowledge?.answer) {
      return res.json({
        ok: true,
        answer: knowledge.answer,
        suggestions: knowledge.suggestions || [],
        blocks: knowledge.blocks || [],
        productSamples: knowledge.productSamples || [],
        source: knowledge.source || 'knowledge',
        intentId: knowledge.intentId || null
      });
    }

    res.json(await buildAgentAskFallback('finance', question, profile));
  } catch (error) {
    console.error('Finance agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
