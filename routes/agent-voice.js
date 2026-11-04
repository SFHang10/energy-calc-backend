const express = require('express');
const {
  getTtsProviderStatus,
  getAgentTtsConfig,
  synthesizeSpeech,
  MAX_TTS_CHARS
} = require('../services/agent-voice-service');

const router = express.Router();

router.get('/health', async (req, res) => {
  const providers = getTtsProviderStatus();
  const payload = {
    ok: true,
    service: 'agent-voice',
    version: '2',
    maxChars: MAX_TTS_CHARS,
    providers,
    ttsAvailable: providers.available
  };
  if (req.query.probe === '1' && providers.available) {
    try {
      const audio = await synthesizeSpeech('Greenways voice probe.', 'grants-agent');
      payload.probe = {
        ok: true,
        provider: audio.provider,
        bytes: audio.buffer?.length || 0,
        voiceId: audio.voiceId || null
      };
    } catch (error) {
      payload.probe = {
        ok: false,
        code: error.code || 'TTS_PROBE_FAILED',
        error: error.message || 'probe failed',
        fallback: 'browser'
      };
    }
  }
  res.json(payload);
});

router.post('/tts', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    const agentSlug = String(req.body?.agentSlug || 'grants-agent').trim();
    if (!text) {
      return res.status(400).json({ ok: false, error: 'text is required' });
    }

    const agentCfg = getAgentTtsConfig(agentSlug);
    const audio = await synthesizeSpeech(text, agentSlug);
    res.setHeader('Content-Type', audio.contentType || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Agent-Voice-Provider', audio.provider || 'unknown');
    if (agentCfg.voiceId) res.setHeader('X-Agent-Voice-Id', agentCfg.voiceId);
    return res.send(audio.buffer);
  } catch (error) {
    const code = error.code || 'TTS_ERROR';
    const fallback = code === 'TTS_UNAVAILABLE' || code === 'TTS_FAILED';
    return res.status(fallback ? 503 : 400).json({
      ok: false,
      error: error.message || 'TTS failed',
      code,
      fallback: fallback ? 'browser' : undefined
    });
  }
});

module.exports = router;
