const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples,
  loadFullNewsCatalog,
  MEDIA_KNOWLEDGE_VERSION
} = require('../services/media-agent-knowledge');
const { rankNewsItems } = require('../services/media-news-loader');
const { getVideosForAgent } = require('../services/wix-media-service');
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
    const { videos, source, channels, youtubeCount } = await getVideosForAgent();
    let list = videos;
    if (category) {
      list = videos.filter((v) => v.category === category);
      if (!list.length && category === 'energy') {
        list = videos.filter((v) => v.category === 'general');
      }
    }
    res.json({ ok: true, videos: list, total: list.length, source, channels: channels || [], youtubeCount: youtubeCount || 0 });
  } catch (error) {
    console.error('Media agent videos error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load videos.' });
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
    const response = await finishKnowledgeAskResponse('media', knowledge, question, profile, {
      responseExtras: { knowledgeVersion: MEDIA_KNOWLEDGE_VERSION }
    });
    if (response) {
      return res.json(response);
    }

    res.json(await buildAgentAskFallback('media', question, profile));
  } catch (error) {
    console.error('Media agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
