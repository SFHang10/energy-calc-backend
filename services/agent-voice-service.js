const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'greenways-agent-voice-config.json');
const MAX_TTS_CHARS = 500;
const DEFAULT_MODEL = 'eleven_multilingual_v2';

let configCache = null;

function loadVoiceConfig() {
  if (configCache) return configCache;
  try {
    configCache = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (_) {
    configCache = { agents: {} };
  }
  return configCache;
}

function getAgentTtsConfig(agentSlug) {
  const cfg = loadVoiceConfig();
  const row = (cfg.agents || {})[agentSlug] || {};
  return {
    slug: agentSlug,
    name: row.name || 'Agent',
    useServerTts: Boolean(row.useServerTts),
    ttsProvider: String(row.ttsProvider || cfg.defaultTtsProvider || 'auto').toLowerCase(),
    voiceId: String(row.voiceId || cfg.defaultVoiceId || '').trim(),
    modelId: String(row.ttsModelId || cfg.defaultTtsModelId || DEFAULT_MODEL).trim()
  };
}

function getTtsProviderStatus() {
  const skillboss = Boolean(process.env.SKILLBOSS_API_KEY);
  const elevenlabs = Boolean(process.env.ELEVENLABS_API_KEY);
  const preferred = String(process.env.AGENT_VOICE_TTS_PROVIDER || 'auto').toLowerCase();
  let active = null;
  if (preferred === 'skillboss' && skillboss) active = 'skillboss';
  else if (preferred === 'elevenlabs' && elevenlabs) active = 'elevenlabs';
  else if (preferred === 'auto') {
    if (skillboss) active = 'skillboss';
    else if (elevenlabs) active = 'elevenlabs';
  }
  return {
    skillboss,
    elevenlabs,
    preferred,
    active,
    available: Boolean(active)
  };
}

function normalizeTtsText(text) {
  const plain = String(text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  return plain.length > MAX_TTS_CHARS ? `${plain.slice(0, MAX_TTS_CHARS - 1)}…` : plain;
}

async function fetchBuffer(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`TTS HTTP ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`);
  }
  const contentType = res.headers.get('content-type') || 'audio/mpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType };
}

async function synthesizeViaSkillBoss(text, voiceConfig) {
  const apiKey = process.env.SKILLBOSS_API_KEY;
  if (!apiKey) return null;
  const voice = voiceConfig.voiceId || 'default';
  const model = `elevenlabs/${voiceConfig.modelId || DEFAULT_MODEL}`;
  try {
    return await fetchBuffer('https://api.skillboss.co/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: text,
        voice
      })
    });
  } catch (error) {
    console.warn('[agent-voice] SkillBoss TTS failed:', error.message || error);
    return null;
  }
}

async function synthesizeViaElevenLabs(text, voiceConfig) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = voiceConfig.voiceId;
  if (!apiKey || !voiceId) return null;
  try {
    return await fetchBuffer(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: voiceConfig.modelId || DEFAULT_MODEL
      })
    });
  } catch (error) {
    console.warn('[agent-voice] ElevenLabs TTS failed:', error.message || error);
    return null;
  }
}

async function synthesizeSpeech(text, agentSlug = 'grants-agent') {
  const plain = normalizeTtsText(text);
  if (!plain) {
    throw new Error('No text to synthesize.');
  }

  const voiceConfig = getAgentTtsConfig(agentSlug);
  const status = getTtsProviderStatus();
  if (!status.available) {
    const err = new Error('Server TTS not configured — use browser speechSynthesis.');
    err.code = 'TTS_UNAVAILABLE';
    throw err;
  }

  const trySkillboss = () => synthesizeViaSkillBoss(plain, voiceConfig);
  const tryElevenlabs = () => synthesizeViaElevenLabs(plain, voiceConfig);

  let result = null;
  if (status.active === 'skillboss') {
    result = await trySkillboss();
    if (!result && status.elevenlabs) result = await tryElevenlabs();
  } else if (status.active === 'elevenlabs') {
    result = await tryElevenlabs();
    if (!result && status.skillboss) result = await trySkillboss();
  }

  if (!result?.buffer?.length) {
    const err = new Error('TTS provider returned no audio — use browser speechSynthesis.');
    err.code = 'TTS_FAILED';
    throw err;
  }

  return {
    ...result,
    provider: status.active,
    agentSlug,
    voiceId: voiceConfig.voiceId || null,
    charCount: plain.length
  };
}

module.exports = {
  MAX_TTS_CHARS,
  loadVoiceConfig,
  getAgentTtsConfig,
  getTtsProviderStatus,
  normalizeTtsText,
  synthesizeSpeech
};
