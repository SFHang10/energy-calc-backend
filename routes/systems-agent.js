const express = require('express');
const {
  answerFromKnowledge,
  getDefaultStatusSamples,
  runChecks
} = require('../services/systems-agent-knowledge');
const { loadChecksConfig } = require('../services/systems-agent-health');

const router = express.Router();

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
  try {
    const question = String(req.body?.question || '').trim();
    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required.' });
    }

    const knowledge = await answerFromKnowledge(question, req.body?.profile || {});
    if (knowledge?.answer) {
      return res.json({
        ok: true,
        answer: knowledge.answer,
        suggestions: knowledge.suggestions || [],
        blocks: knowledge.blocks || [],
        productSamples: knowledge.productSamples || [],
        checkReport: knowledge.checkReport || null,
        source: knowledge.source || 'knowledge',
        intentId: knowledge.intentId || null
      });
    }

    res.json({
      ok: true,
      answer: 'Could not build a systems status answer.',
      productSamples: await getDefaultStatusSamples(6),
      source: 'heuristic'
    });
  } catch (error) {
    console.error('Systems agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
