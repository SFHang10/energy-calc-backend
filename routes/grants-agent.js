const express = require('express');
const {
  answerFromKnowledge,
  loadSchemes,
  rankSchemes,
  toSuggestion,
  pickProductSamples,
  getDefaultProductSamples,
  compareSchemesByIds
} = require('../services/grants-agent-knowledge');
const { maybeCallGreenwaysLlm } = require('../services/greenways-agent-llm');

const router = express.Router();

async function maybeCallServerLlm(question, suggestions, profile = {}) {
  const systemPrompt = [
    'You are the Greenways Grants Agent for restaurants and SMEs.',
    'Only recommend schemes from the provided suggestions JSON.',
    'Mention region, type (grant/subsidy/tax), and verify eligibility on official links.',
    'Be concise; prefer NL and EU hospitality context when profile.region is nl.'
  ].join(' ');

  return maybeCallGreenwaysLlm({
    prefix: 'GRANTS_AGENT',
    systemPrompt,
    userPayload: { question, profile, suggestions },
    maxTokens: 900
  });
}

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
    const profile = {
      region: String(req.body?.profile?.region || '').trim(),
      sector: String(req.body?.profile?.sector || '').trim(),
      focus: String(req.body?.profile?.focus || '').trim()
    };
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
      productSamples: result.productSamples || [],
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
        source: knowledge.source || 'knowledge',
        intentId: knowledge.intentId || null
      });
    }

    const schemes = await loadSchemes();
    const ranked = rankSchemes(schemes, question, profile, 8);
    const picked = ranked.length ? ranked : schemes.filter((s) => s.priority).slice(0, 6);
    const suggestions = picked.map(toSuggestion);

    const bullets = picked
      .map((s) => `- **${s.title}** (${String(s.region || 'eu').toUpperCase()}) — ${String(s.description || '').slice(0, 120)}`)
      .join('\n');

    const fallbackAnswer =
      `Here are scheme matches from **schemes.json** for: "${question}"\n\n${bullets}\n\n` +
      'Verify eligibility on official links. Use the restaurant schemes portal or finance finder for more detail.';

    const llmAnswer = await maybeCallServerLlm(question, suggestions, profile);
    const productSamples = await pickProductSamples(question, profile, 3);
    res.json({
      ok: true,
      answer: llmAnswer || fallbackAnswer,
      suggestions,
      productSamples,
      source: llmAnswer ? 'llm' : 'heuristic'
    });
  } catch (error) {
    console.error('Grants agent ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
