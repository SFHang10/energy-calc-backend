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

const router = express.Router();

async function maybeCallServerLlm(question, suggestions, profile = {}) {
  const provider = String(process.env.GRANTS_AGENT_PROVIDER || process.env.ASSISTANT_PROVIDER || '').toLowerCase();
  const apiKey = process.env.GRANTS_AGENT_API_KEY || process.env.ASSISTANT_API_KEY || '';
  const model = process.env.GRANTS_AGENT_MODEL || process.env.ASSISTANT_MODEL || '';
  if (!provider || !apiKey || !model) return '';

  const system = [
    'You are the Greenways Grants Agent for restaurants and SMEs.',
    'Only recommend schemes from the provided suggestions JSON.',
    'Mention region, type (grant/subsidy/tax), and verify eligibility on official links.',
    'Be concise; prefer NL and EU hospitality context when profile.region is nl.'
  ].join(' ');

  const userPayload = { question, profile, suggestions };

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        system,
        messages: [{ role: 'user', content: JSON.stringify(userPayload) }]
      })
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data?.content?.[0]?.text || '';
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(userPayload) }
        ]
      })
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  return '';
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
