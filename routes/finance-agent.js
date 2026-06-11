const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples
} = require('../services/finance-agent-knowledge');

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
    const profile = {
      region: String(req.body?.profile?.region || '').trim(),
      sector: String(req.body?.profile?.sector || '').trim(),
      focus: String(req.body?.profile?.focus || '').trim()
    };
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

    res.json({
      ok: true,
      answer:
        `I could not match a finance intent for "${question}". Try asking about BNPL, green loans, equipment finance, or open the finance finder.`,
      suggestions: [],
      blocks: [],
      productSamples: await getDefaultProductSamples(3),
      source: 'heuristic'
    });
  } catch (error) {
    console.error('Finance agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
