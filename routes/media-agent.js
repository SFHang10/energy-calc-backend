const express = require('express');
const {
  answerFromKnowledge,
  getDefaultProductSamples,
  loadFullNewsCatalog,
  pickRelatedVideos,
  resolveVideoSeed,
  relatedStoryLine,
  MEDIA_KNOWLEDGE_VERSION
} = require('../services/media-agent-knowledge');
const { rankNewsItems } = require('../services/media-news-loader');
const { getVideosForAgent } = require('../services/wix-media-service');
const {
  buildAgentAskFallback,
  normalizeAskProfile,
  finishKnowledgeAskResponse
} = require('../services/greenways-agent-llm-fallback');
const { createAskLogger } = require('../services/greenways-ask-logger');
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
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 4));
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

router.get('/videos/related', async (req, res) => {
  try {
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 4));
    const seed = await resolveVideoSeed(req.query);
    const related = await pickRelatedVideos(seed, limit);
    res.json({
      ok: true,
      related,
      storyLine: relatedStoryLine(seed),
      seedId: seed.id || null
    });
  } catch (error) {
    console.error('Media agent related videos error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load related videos.' });
  }
});

router.post('/ask', async (req, res) => {
  const startedAt = Date.now();
  const question = String(req.body?.question || '').trim();
  try {
    const profile = await enrichAskProfileWithMember(normalizeAskProfile(req.body));
    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required.' });
    }
    const logAsk = createAskLogger(req, startedAt, profile, question);

    const knowledge = await answerFromKnowledge(question, profile);
    const response = await finishKnowledgeAskResponse('media', knowledge, question, profile, {
      responseExtras: { knowledgeVersion: MEDIA_KNOWLEDGE_VERSION }
    });
    if (response) {
      response.answer = attachProfileContext(response.answer, profile);
      logAsk({
        agent: 'media',
        ok: true,
        source: response.source,
        intentId: response.intentId
      });
      return res.json(response);
    }

    const fallback = await buildAgentAskFallback('media', question, profile);
    if (fallback?.answer) fallback.answer = attachProfileContext(fallback.answer, profile);
    logAsk({
      agent: 'media',
      ok: true,
      source: fallback?.source || 'fallback',
      intentId: fallback?.intentId || null
    });
    res.json(fallback);
  } catch (error) {
    console.error('Media agent ask error:', error.message);
    const profile = await enrichAskProfileWithMember(normalizeAskProfile(req.body));
    createAskLogger(req, startedAt, profile, question)({
      agent: 'media',
      ok: false,
      source: 'error',
      intentId: null,
      error: error.message
    });
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
