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

const SKILLBOSS_API_BASE = String(process.env.SKILLBOSS_API_BASE || 'https://api.skillboss.co/v1').replace(
  /\/$/,
  ''
);

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

function skillBossAuthHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}

function extractAudioUrl(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const inner = payload.result && typeof payload.result === 'object' ? payload.result : payload;
  return (
    inner.audio_url ||
    inner.audioUrl ||
    inner.url ||
    (inner.data && (inner.data.audio_url || inner.data.url)) ||
    null
  );
}

async function synthesizeViaSkillBossRun(text, voiceConfig, apiKey) {
  const voiceId = voiceConfig.voiceId || '';
  const model = `elevenlabs/${voiceConfig.modelId || DEFAULT_MODEL}`;
  const res = await fetch(`${SKILLBOSS_API_BASE}/run`, {
    method: 'POST',
    headers: skillBossAuthHeaders(apiKey),
    body: JSON.stringify({
      model,
      inputs: {
        text,
        input: text,
        voice: voiceId,
        voice_id: voiceId
      }
    })
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`SkillBoss /run ${res.status}: ${detail.slice(0, 180)}`);
  }
  if (contentType.includes('audio')) {
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 256) {
      return { buffer, contentType: contentType || 'audio/mpeg' };
    }
  }
  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch (_) {
    throw new Error('SkillBoss /run returned non-JSON without audio content-type');
  }
  const audioUrl = extractAudioUrl(json);
  if (audioUrl) {
    return fetchBuffer(audioUrl, { method: 'GET' });
  }
  const b64 =
    json.audio_base64 ||
    json.audioBase64 ||
    (json.result && (json.result.audio_base64 || json.result.audioBase64));
  if (b64) {
    return { buffer: Buffer.from(b64, 'base64'), contentType: 'audio/mpeg' };
  }
  throw new Error('SkillBoss /run response had no audio payload');
}

async function synthesizeViaSkillBossSpeech(text, voiceConfig, apiKey) {
  const voice = voiceConfig.voiceId || 'default';
  const model = `elevenlabs/${voiceConfig.modelId || DEFAULT_MODEL}`;
  return fetchBuffer(`${SKILLBOSS_API_BASE}/audio/speech`, {
    method: 'POST',
    headers: skillBossAuthHeaders(apiKey),
    body: JSON.stringify({
      model,
      input: text,
      voice
    })
  });
}

async function synthesizeViaSkillBoss(text, voiceConfig) {
  const apiKey = process.env.SKILLBOSS_API_KEY;
  if (!apiKey) return null;
  const errors = [];
  try {
    return await synthesizeViaSkillBossRun(text, voiceConfig, apiKey);
  } catch (error) {
    errors.push(`run: ${error.message || error}`);
  }
  try {
    return await synthesizeViaSkillBossSpeech(text, voiceConfig, apiKey);
  } catch (error) {
    errors.push(`speech: ${error.message || error}`);
  }
  console.warn('[agent-voice] SkillBoss TTS failed:', errors.join(' · '));
  return null;
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
