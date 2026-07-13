const path = require('path');
const fs = require('fs/promises');
const { profileContextBlock } = require('./greenways-agent-shared');

const DEFAULT_REGION_LABELS = {
  nl: 'Netherlands',
  eu: 'EU-wide',
  uk: 'United Kingdom',
  ie: 'Ireland',
  de: 'Germany',
  fr: 'France',
  be: 'Belgium',
  es: 'Spain',
  pt: 'Portugal'
};

const voiceCache = new Map();

function pickLine(lines, seed = '') {
  const pool = (Array.isArray(lines) ? lines : []).map((s) => String(s || '').trim()).filter(Boolean);
  if (!pool.length) return '';
  if (pool.length === 1) return pool[0];
  let hash = 0;
  const key = String(seed || Date.now());
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

function stripTrailingTips(text) {
  let body = String(text || '').trim();
  let prev;
  do {
    prev = body;
    const lastBlock = body.lastIndexOf('\n\n_');
    if (lastBlock < 0) break;
    const tail = body.slice(lastBlock);
    const tipMatch = tail.match(/^\n\n_([^_\n][\s\S]*?)_\s*$/);
    if (tipMatch) {
      body = body.slice(0, lastBlock).trim();
    } else {
      break;
    }
  } while (body !== prev);
  return body;
}

function stripMarkdownForSpeech(text) {
  return String(text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function spokenSummary(text, maxWords = 45) {
  const plain = stripMarkdownForSpeech(stripTrailingTips(text));
  if (!plain) return '';
  const sentences = plain.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [plain];
  const first = sentences.slice(0, 2).join(' ').trim();
  const words = first.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return first;
  return `${words.slice(0, maxWords).join(' ')}…`;
}

function pickOpener(voice = {}, intentId = '', question = '') {
  const openers = voice.openers || {};
  const pool =
    openers[intentId] ||
    openers.default ||
    [];
  return pickLine(pool, `${intentId}:${question}`);
}

function pickHandoffLine(voice = {}, handoffId = 'media', question = '') {
  const lines = voice.handoffLines?.[handoffId] || voice.handoffLines?.default || [];
  return pickLine(lines, `${handoffId}:${question}`);
}

function pickTip(staticTips = [], intentId = '', options = {}) {
  const skip = new Set(options.skipIntentIds || ['media_handoff']);
  if (skip.has(intentId)) return '';
  const tips = (Array.isArray(staticTips) ? staticTips : []).map((t) => String(t || '').trim()).filter(Boolean);
  if (!tips.length) return '';
  return pickLine(tips, intentId);
}

const AGENT_INTRO_FALLBACKS = {
  grants:
    "Hi — I'm **Andrieus**, your grants and schemes specialist. I match funding programmes to your region and equipment upgrades so you see what's worth applying for before you commit capex.",
  finance:
    "Hi — I'm **Vincent**, your finance and payback specialist. I help you model costs, tariffs, and funding options so upgrades make sense on the bill as well as on paper.",
  equipment:
    "Hi — I'm **Artemis**, your equipment and renovation specialist. I guide you from baseline usage to verified alternatives, grants, and payback — without drowning you in spec sheets.",
  products:
    "Hi — I'm **Zyanne**, your sustainable products specialist. I help homes, restaurants, and SMEs compare efficient options across water, electricity, and gas so choices feel achievable.",
  deals:
    "Hi — I'm **Zara**, your deals and tariffs specialist. I separate real savings from marketing headlines and point you to credible energy, water, and sustainability offers.",
  media:
    "Hi — I'm **Cheryce**, your news and media specialist. I turn sustainability headlines into practical context for your bills, timing, and next steps on Greenways.",
  systems:
    "Hi — I'm **Edwardo**, your systems and monitoring specialist. I help you measure first, read dashboard signals, and verify platform health before you scale upgrades."
};

function agentIntroParagraph(agentKey, briefing = {}) {
  const key = String(agentKey || '').trim().toLowerCase();
  const line =
    String(briefing.roleSummaryFirstPerson || '').trim() ||
    AGENT_INTRO_FALLBACKS[key] ||
    '';
  return line ? `${line}\n\n` : '';
}

function profileLine(profile = {}, regionLabels = DEFAULT_REGION_LABELS) {
  const region = String(profile.region || '').toLowerCase().trim();
  const sector = String(profile.sector || '').trim();
  if (!region || region === 'all') return '';
  const regionLabel = regionLabels[region] || region.toUpperCase();
  const sectorLabel =
    sector && sector !== 'any'
      ? sector.charAt(0).toUpperCase() + sector.slice(1)
      : 'your business';
  return `Schemes, examples, and links below are filtered for **${regionLabel}** · **${sectorLabel}**.`;
}

function shouldUseProfileLine(voice = {}, intentId = '') {
  const list = voice.profileIntents || ['region_filter', 'sector_match', 'equipment', 'nl_hub', 'nl_schemes', 'uk_schemes'];
  return list.includes(intentId);
}

function withTip(body, tip) {
  const text = String(body || '').trim();
  if (!tip) return text;
  return `${text}\n\n_${tip}_`;
}

function applyPersona(result, ctx = {}) {
  if (!result?.answer) return result;

  const voice = ctx.voice || {};
  const intentId = ctx.intentId || result.intentId || 'default';
  const question = ctx.question || '';
  const profile = ctx.profile || {};
  const regionLabels = ctx.regionLabels || DEFAULT_REGION_LABELS;

  let body = stripTrailingTips(result.answer);
  const skipOpener = new Set(voice.skipOpenerIntents || []);
  let opener = skipOpener.has(intentId) ? '' : pickOpener(voice, intentId, question);

  if (intentId === 'grant_news' || intentId === 'media_handoff') {
    opener = pickHandoffLine(voice, 'media', question) || opener;
  }

  if (voice.handoffLines?.grants && intentId === 'grants_tab') {
    opener = pickHandoffLine(voice, 'grants', question) || opener;
  }

  if (opener && body.toLowerCase().startsWith(opener.toLowerCase().slice(0, 24))) {
    opener = '';
  }

  const pLine = shouldUseProfileLine(voice, intentId)
    ? profileContextBlock(profileLine(profile, regionLabels))
    : '';
  const tip = ctx.tip != null ? ctx.tip : pickTip(ctx.staticTips, intentId, { skipIntentIds: voice.skipTipIntents });

  const chunks = [opener, pLine, body].filter(Boolean);
  result.answer = withTip(chunks.join('\n\n'), tip);
  result.spokenSummary = spokenSummary(
    result.answer,
    Number(voice.spokenMaxWords) || 45
  );
  return result;
}

async function loadAgentVoice(voicePath) {
  const key = voicePath || '__default__';
  if (voiceCache.has(key)) return voiceCache.get(key);
  let voice = {};
  if (voicePath) {
    try {
      const raw = await fs.readFile(voicePath, 'utf8');
      voice = JSON.parse(raw);
    } catch (_) {
      voice = {};
    }
  }
  voiceCache.set(key, voice);
  return voice;
}

module.exports = {
  DEFAULT_REGION_LABELS,
  pickLine,
  pickOpener,
  pickHandoffLine,
  pickTip,
  agentIntroParagraph,
  profileLine,
  shouldUseProfileLine,
  spokenSummary,
  stripMarkdownForSpeech,
  stripTrailingTips,
  withTip,
  applyPersona,
  loadAgentVoice
};
