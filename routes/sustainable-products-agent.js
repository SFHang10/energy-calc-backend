const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples
} = require('../services/sustainable-products-agent-knowledge');

const router = express.Router();

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
  try {
    const question = String(req.body?.question || '').trim();
    const profile = {
      region: String(req.body?.profile?.region || '').trim(),
      sector: String(req.body?.profile?.sector || '').trim(),
      focus: String(req.body?.profile?.focus || '').trim(),
      lane: String(req.body?.profile?.lane || '').trim().toLowerCase()
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
        productSamples: knowledge.productSamples || [],
        source: knowledge.source || 'knowledge',
        intentId: knowledge.intentId || null,
        lane: knowledge.lane || null
      });
    }

    res.json({
      ok: true,
      answer:
        `No product finder match for "${question}". Try **water savings**, **efficient fridge**, **gas fryer**, or **open product finder**.`,
      suggestions: [],
      productSamples: await getDefaultProductSamples(3),
      source: 'heuristic'
    });
  } catch (error) {
    console.error('Sustainable products agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
