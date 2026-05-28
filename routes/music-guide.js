const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();
const venuesPath = path.join(__dirname, '..', 'data', 'music-venues.json');

async function loadVenues() {
  try {
    const raw = await fs.readFile(venuesPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function scoreVenue(venue, query, profile = {}) {
  const q = query.toLowerCase();
  const text = [
    venue.name,
    venue.genre,
    venue.format,
    venue.schedule,
    venue.address,
    venue.desc
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  if (venue.name?.toLowerCase().includes(q)) score += 8;
  if (venue.genre?.toLowerCase().includes(q)) score += 6;
  if (venue.format?.toLowerCase().includes(q)) score += 5;
  if (venue.schedule?.toLowerCase().includes(q)) score += 4;
  if (text.includes(q)) score += 2;

  const tokens = q.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token.length < 3) continue;
    if (text.includes(token)) score += 1;
  }
  const instrument = String(profile.instrument || '').toLowerCase();
  const style = String(profile.style || '').toLowerCase();
  const level = String(profile.level || '').toLowerCase();
  if (instrument && text.includes(instrument)) score += 3;
  if (style && text.includes(style)) score += 4;
  if (level.includes('beginner')) {
    if (text.includes('open mic') || text.includes('mixed') || text.includes('community')) score += 3;
  }
  if (level.includes('advanced') || level.includes('pro')) {
    if (text.includes('jazz') || text.includes('session') || text.includes('club')) score += 2;
  }
  return score;
}

function buildHeuristicReply(question, venues, profile = {}) {
  if (!venues.length) {
    return {
      answer:
        'I could not find matching venues yet. Try asking with a genre (jazz, open mic, open jam) or a day like Tuesday/Sunday.',
      suggestions: []
    };
  }

  const top = venues.slice(0, 5);
  const bullets = top
    .map((v) => `- **${v.name}** — ${v.schedule || 'Schedule not listed'} (${v.format || v.genre || 'Live music'})`)
    .join('\n');

  return {
    answer:
      `Here are the best matches I found in Amsterdam for: "${question}"\n\n${bullets}\n\n` +
      `Profile applied: ${profile.instrument || 'instrument n/a'} · ${profile.style || 'style n/a'} · ${profile.level || 'level n/a'}.\n` +
      'Tip: bring your instrument early for sign-up slots and message the venue directly from the card to confirm availability.',
    suggestions: top.map((v) => ({
      id: v.id,
      name: v.name,
      genre: v.genre,
      schedule: v.schedule || '',
      address: v.address || '',
      url: v.url || ''
    }))
  };
}

async function maybeCallServerLlm(question, suggestions, profile = {}) {
  const provider = String(process.env.MUSIC_GUIDE_PROVIDER || process.env.ASSISTANT_PROVIDER || '').toLowerCase();
  const apiKey = process.env.MUSIC_GUIDE_API_KEY || process.env.ASSISTANT_API_KEY || '';
  const model = process.env.MUSIC_GUIDE_MODEL || process.env.ASSISTANT_MODEL || '';
  if (!provider || !apiKey || !model) return '';

  const system = [
    'You are Live Music Finder For Artists guide.',
    'You only recommend venues from provided suggestions.',
    'Be concise and practical for musicians.',
    'If uncertain, suggest contacting venue via inquiry form.'
  ].join(' ');

  const userPayload = {
    question,
    city: 'Amsterdam',
    profile,
    suggestions
  };

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
        max_tokens: 800,
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
        max_tokens: 800,
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

router.post('/ask', async (req, res) => {
  try {
    const question = String(req.body?.question || '').trim();
    const profile = {
      instrument: String(req.body?.profile?.instrument || '').trim(),
      style: String(req.body?.profile?.style || '').trim(),
      level: String(req.body?.profile?.level || '').trim()
    };
    if (!question) {
      return res.status(400).json({ ok: false, error: 'question is required.' });
    }

    const venues = await loadVenues();
    const ranked = venues
      .map((v) => ({ venue: v, score: scoreVenue(v, question, profile) }))
      .filter((v) => v.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((v) => v.venue);

    const response = buildHeuristicReply(question, ranked, profile);
    const llmAnswer = await maybeCallServerLlm(question, response.suggestions, profile);
    res.json({
      ok: true,
      answer: llmAnswer || response.answer,
      suggestions: response.suggestions,
      source: llmAnswer ? 'llm' : 'heuristic'
    });
  } catch (error) {
    console.error('Music guide ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
