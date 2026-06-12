const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples,
  loadFinanceTools,
  loadBriefing,
  loadReferences
} = require('../services/finance-agent-knowledge');
const { loadEnergySnapshot, formatWholesaleBullets, formatModellingTariffLine } = require('../services/finance-agent-energy');
const { loadFullNewsCatalog } = require('../services/media-news-loader');
const { rankFinanceNews } = require('../services/finance-agent-news');
const { buildAgentAskFallback, normalizeAskProfile } = require('../services/greenways-agent-llm-fallback');

const router = express.Router();

router.get('/tools', async (req, res) => {
  try {
    const registry = await loadFinanceTools();
    res.json({
      ok: true,
      ticker: registry.ticker || {},
      tools: registry.tools || [],
      handoffs: registry.handoffs || {}
    });
  } catch (error) {
    console.error('Finance agent tools error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load finance tools registry.' });
  }
});

router.get('/energy-prices', async (req, res) => {
  try {
    const profile = normalizeAskProfile({ profile: req.query });
    const snapshot = await loadEnergySnapshot();
    res.json({
      ok: true,
      profile,
      wholesale: formatWholesaleBullets(snapshot, profile, 6),
      modelling: formatModellingTariffLine(snapshot.modellingTariffs),
      note: 'For live ENTSO-E data on Render, use GET /api/energy-ticker'
    });
  } catch (error) {
    console.error('Finance agent energy-prices error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load energy price snapshot.' });
  }
});

router.get('/briefing', async (_req, res) => {
  try {
    const briefing = await loadBriefing();
    res.json({ ok: true, briefing: briefing || {} });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to load briefing.' });
  }
});

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

router.get('/references', async (_req, res) => {
  try {
    const references = await loadReferences();
    res.json({ ok: true, references });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to load references.' });
  }
});

router.get('/news', async (req, res) => {
  try {
    const catalog = await loadFullNewsCatalog();
    const category = String(req.query.category || '').trim().toLowerCase();
    const edition = String(req.query.edition || '').trim();
    const q = String(req.query.q || '').trim();
    let items = catalog.items;
    if (category) {
      items = items.filter((i) => i.newsCategory === category);
    }
    if (edition) {
      items = items.filter((i) => i.edition === edition);
    }
    if (q) {
      items = rankFinanceNews(items, q, Math.min(50, Math.max(1, Number(req.query.limit) || 20)));
    } else {
      items = rankFinanceNews(items, 'funding finance grant loan eib horizon', Math.min(100, Math.max(1, Number(req.query.limit) || 40)));
    }
    res.json({
      ok: true,
      lens: 'finance',
      stats: catalog.stats,
      editions: catalog.editions,
      total: items.length,
      items
    });
  } catch (error) {
    console.error('Finance agent news error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load finance news catalogue.' });
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
        agentHandoffs: knowledge.agentHandoffs || [],
        editionChips: knowledge.editionChips || [],
        spokenSummary: knowledge.spokenSummary || '',
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
