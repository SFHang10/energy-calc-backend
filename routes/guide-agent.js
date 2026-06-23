const express = require('express');
const { answerFromKnowledge, getDefaultRosterCards } = require('../services/guide-agent-knowledge');
const { summarizeJourney } = require('../services/guide-agent-journey-summary');

const router = express.Router();

router.get('/samples', async (req, res) => {
  try {
    const limit = Math.min(8, Math.max(1, Number(req.query.limit) || 6));
    const productSamples = await getDefaultRosterCards(limit);
    res.json({ ok: true, productSamples });
  } catch (error) {
    console.error('Guide agent samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load roster cards.' });
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
        productSamples: knowledge.productSamples || [],
        agentHandoffs: knowledge.agentHandoffs || [],
        routedTo: knowledge.routedTo || [],
        primaryAgent: knowledge.primaryAgent || null,
        source: knowledge.source || 'orchestrator',
        intentId: knowledge.intentId || null
      });
    }

    res.json({
      ok: true,
      answer:
        'Ask me about grants, finance, equipment, sustainable products, deals, or news — I will route you to the right Greenways specialist.',
      suggestions: [],
      productSamples: await getDefaultRosterCards(6),
      agentHandoffs: [],
      routedTo: [],
      source: 'heuristic'
    });
  } catch (error) {
    console.error('Guide agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const result = await summarizeJourney({
      profile: req.body?.profile,
      startedAt: req.body?.startedAt,
      turns: req.body?.turns
    });

    res.json({
      ok: true,
      plan: result.plan,
      source: result.source,
      turnCount: result.turnCount,
      agentCount: result.agentCount,
      specialists: result.specialists || []
    });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error('Guide agent summarize error:', error.message);
    res.status(status).json({
      ok: false,
      error: error.message || 'Failed to summarize journey.'
    });
  }
});

module.exports = router;
