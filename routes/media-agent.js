const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples,
  loadFullNewsCatalog
} = require('../services/media-agent-knowledge');
const { rankNewsItems } = require('../services/media-news-loader');
const { getVideosForAgent } = require('../services/wix-media-service');

const router = express.Router();

router.get('/samples', async (req, res) => {
  try {
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 3));
    const productSamples = await getDefaultProductSamples(limit);
    res.json({ ok: true, productSamples });
  } catch (error) {
    console.error('Media agent samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load media samples.' });
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
      items = rankNewsItems(items, q, Math.min(50, Math.max(1, Number(req.query.limit) || 20)));
    } else {
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 40));
      items = items.slice(0, limit);
    }
    res.json({
      ok: true,
      stats: catalog.stats,
      editions: catalog.editions,
      total: items.length,
      items
    });
  } catch (error) {
    console.error('Media agent news error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load news catalogue.' });
  }
});

router.get('/videos', async (req, res) => {
  try {
    const category = String(req.query.category || '').trim().toLowerCase();
    const { videos, source } = await getVideosForAgent();
    let list = videos;
    if (category) {
      list = videos.filter((v) => v.category === category);
      if (!list.length && category === 'energy') {
        list = videos.filter((v) => v.category === 'general');
      }
    }
    res.json({ ok: true, videos: list, total: list.length, source });
  } catch (error) {
    console.error('Media agent videos error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load videos.' });
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
        editionChips: knowledge.editionChips || [],
        productSamples: knowledge.productSamples || [],
        source: knowledge.source || 'knowledge',
        intentId: knowledge.intentId || null
      });
    }

    res.json({
      ok: true,
      answer:
        `No news or media matches for "${question}". Try **policy**, **funding**, **monthly news**, **tech news**, **Wix videos**, or **photos**.`,
      suggestions: [],
      productSamples: await getDefaultProductSamples(3),
      source: 'heuristic'
    });
  } catch (error) {
    console.error('Media agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
