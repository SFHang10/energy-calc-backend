/**
 * Optional LLM layer for Live Music Finder guide.
 * Uses MUSIC_GUIDE_* env vars, falling back to shared ASSISTANT_* (Cortecs / OpenRouter).
 */
const { maybeCallGreenwaysLlm, isLlmConfigured } = require('./greenways-agent-llm');

const MUSIC_GUIDE_PREFIX = 'MUSIC_GUIDE';

function buildMusicGuideSystemPrompt(mode = 'enhance') {
  const lines = [
    'You are Live Music Finder For Artists — Amsterdam venue guide for musicians.',
    'Only recommend venues listed in suggestions. Never invent venues, dates, prices, or URLs.',
    'Be concise, warm, and practical (sign-up timing, inquiry form, what to bring).',
    'City focus: Amsterdam open mics, jams, and recurring sessions.'
  ];
  if (mode === 'enhance') {
    lines.push(
      'TASK: Rewrite originalAnswer only — clearer prose for a musician.',
      'Keep every factual claim from originalAnswer and suggestions.',
      'Plain markdown only — no JSON wrapper.'
    );
  } else {
    lines.push(
      'Compose an answer from suggestions only.',
      'If suggestions are empty, explain what to try next without inventing venues.'
    );
  }
  return lines.join(' ');
}

function slimSuggestions(suggestions) {
  return (suggestions || []).slice(0, 8).map((v) => ({
    id: v.id,
    name: v.name,
    genre: v.genre,
    schedule: v.schedule || '',
    address: v.address || '',
    url: v.url || ''
  }));
}

async function maybeEnhanceMusicGuideAnswer({ question, profile, groundedAnswer, suggestions, intentId }) {
  if (!isLlmConfigured(MUSIC_GUIDE_PREFIX) || !groundedAnswer) return '';

  return maybeCallGreenwaysLlm({
    prefix: MUSIC_GUIDE_PREFIX,
    systemPrompt: buildMusicGuideSystemPrompt('enhance'),
    userPayload: {
      question,
      city: 'Amsterdam',
      profile,
      intentId: intentId || null,
      originalAnswer: groundedAnswer,
      suggestions: slimSuggestions(suggestions)
    },
    maxTokens: 800
  });
}

async function maybeComposeMusicGuideAnswer({ question, profile, suggestions }) {
  if (!isLlmConfigured(MUSIC_GUIDE_PREFIX)) return '';

  return maybeCallGreenwaysLlm({
    prefix: MUSIC_GUIDE_PREFIX,
    systemPrompt: buildMusicGuideSystemPrompt('compose'),
    userPayload: {
      question,
      city: 'Amsterdam',
      profile,
      suggestions: slimSuggestions(suggestions)
    },
    maxTokens: 800
  });
}

/**
 * Finish /ask response — knowledge or heuristic grounding, optional LLM polish/compose.
 */
async function finishMusicGuideAskResponse(knowledge, question, profile = {}) {
  const groundedAnswer = String(knowledge?.answer || '').trim();
  const suggestions = knowledge?.suggestions || [];
  const intentId = knowledge?.intentId || null;

  const enhanced = await maybeEnhanceMusicGuideAnswer({
    question,
    profile,
    groundedAnswer,
    suggestions,
    intentId
  });

  if (enhanced) {
    return {
      ok: true,
      answer: enhanced,
      suggestions,
      source: 'llm',
      intentId
    };
  }

  const composed = groundedAnswer
    ? ''
    : await maybeComposeMusicGuideAnswer({ question, profile, suggestions });

  return {
    ok: true,
    answer: composed || groundedAnswer,
    suggestions,
    source: composed ? 'llm' : intentId ? 'knowledge' : 'heuristic',
    intentId
  };
}

module.exports = {
  finishMusicGuideAskResponse,
  isMusicGuideLlmEnabled: () => isLlmConfigured(MUSIC_GUIDE_PREFIX)
};
