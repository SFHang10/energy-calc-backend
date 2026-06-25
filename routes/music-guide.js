const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { answerFromKnowledge } = require('../services/music-guide-knowledge');
const { finishMusicGuideAskResponse } = require('../services/music-guide-llm');

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
    const knowledge = await answerFromKnowledge(question, venues, profile);
    if (knowledge?.answer) {
      return res.json(await finishMusicGuideAskResponse(knowledge, question, profile));
    }

    const ranked = venues
      .map((v) => ({ venue: v, score: scoreVenue(v, question, profile) }))
      .filter((v) => v.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((v) => v.venue);

    const response = buildHeuristicReply(question, ranked.length ? ranked : venues, profile);
    res.json(
      await finishMusicGuideAskResponse(
        { answer: response.answer, suggestions: response.suggestions },
        question,
        profile
      )
    );
  } catch (error) {
    console.error('Music guide ask error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to answer question.' });
  }
});

module.exports = router;
