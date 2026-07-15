(function (global) {
  'use strict';

  var CONFIG_URL = '/data/greenways-agent-voice-config.json';
  var configCache = null;
  var lastSummary = '';
  var activeAudio = null;

  function speechSupported() {
    return !!(global.speechSynthesis && (global.SpeechRecognition || global.webkitSpeechRecognition));
  }

  function ttsSupported() {
    return !!global.speechSynthesis;
  }

  function sttSupported() {
    return !!(global.SpeechRecognition || global.webkitSpeechRecognition);
  }

  async function loadConfig() {
    if (configCache) return configCache;
    try {
      var res = await fetch(CONFIG_URL);
      if (res.ok) configCache = await res.json();
    } catch (_) {}
    if (!configCache) configCache = { agents: {}, autoSpeakOnReply: false };
    return configCache;
  }

  function agentSlugFromPath() {
    var m = (global.location.pathname || '').match(/\/greenways\/([^/?#]+)/);
    return m ? m[1] : '';
  }

  async function getAgentVoiceConfig(slug) {
    var cfg = await loadConfig();
    var key = slug || agentSlugFromPath();
    var row = (cfg.agents || {})[key] || {};
    return {
      slug: key,
      name: row.name || 'Agent',
      voiceEnabled: row.voiceEnabled !== false,
      lang: row.lang || cfg.defaultLang || 'en-GB',
      speechRate: row.speechRate != null ? row.speechRate : cfg.defaultSpeechRate || 1,
      autoSpeakOnReply: !!cfg.autoSpeakOnReply,
      useServerTts: !!row.useServerTts,
      voiceId: row.voiceId || ''
    };
  }

  function apiBase() {
    if (global.GreenwaysAgentShared && typeof global.GreenwaysAgentShared.apiBase === 'function') {
      return global.GreenwaysAgentShared.apiBase();
    }
    return '';
  }

  function setSpeakingState(speakBtn, isSpeaking) {
    if (!speakBtn) return;
    if (isSpeaking) speakBtn.classList.add('is-speaking');
    else speakBtn.classList.remove('is-speaking');
  }

  function stopActiveAudio() {
    if (!activeAudio) return;
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (_) {}
    if (activeAudio._objectUrl) {
      try {
        URL.revokeObjectURL(activeAudio._objectUrl);
      } catch (_) {}
    }
    activeAudio = null;
  }

  function stripForSpeech(text) {
    return String(text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stopSpeaking() {
    stopActiveAudio();
    if (!ttsSupported()) return;
    global.speechSynthesis.cancel();
  }

  function speakBrowser(text, options) {
    if (!ttsSupported()) return false;
    var plain = stripForSpeech(text);
    if (!plain) return false;
    stopSpeaking();
    var utter = new SpeechSynthesisUtterance(plain);
    utter.lang = (options && options.lang) || 'en-GB';
    utter.rate = (options && options.rate) || 1;
    var btn = options && options.speakBtn;
    if (btn) {
      setSpeakingState(btn, true);
      utter.onend = utter.onerror = function () {
        setSpeakingState(btn, false);
      };
    }
    global.speechSynthesis.speak(utter);
    return true;
  }

  async function speakServer(text, options) {
    var plain = stripForSpeech(text);
    if (!plain) return false;
    var btn = options && options.speakBtn;
    var slug = (options && options.agentSlug) || agentSlugFromPath();
    try {
      var res = await fetch(apiBase() + '/api/agent-voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plain, agentSlug: slug })
      });
      if (!res.ok) return false;
      var blob = await res.blob();
      if (!blob || !blob.size) return false;
      stopSpeaking();
      var url = URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio._objectUrl = url;
      activeAudio = audio;
      if (btn) setSpeakingState(btn, true);
      audio.onended = audio.onerror = function () {
        setSpeakingState(btn, false);
        stopActiveAudio();
      };
      await audio.play();
      return true;
    } catch (_) {
      setSpeakingState(btn, false);
      return false;
    }
  }

  async function speak(text, options) {
    options = options || {};
    if (options.useServerTts) {
      var played = await speakServer(text, options);
      if (played) return true;
    }
    return speakBrowser(text, options);
  }

  function setLastSpokenSummary(summary) {
    lastSummary = String(summary || '').trim();
  }

  function getLastSpokenSummary() {
    return lastSummary;
  }

  /**
   * @param {object} opts
   * @param {string} [opts.agentSlug]
   * @param {HTMLTextAreaElement} opts.input
   * @param {HTMLButtonElement} opts.micBtn
   * @param {HTMLButtonElement} opts.speakBtn
   * @param {function} [opts.onTranscript] — (text) => void, e.g. sendQuestion
   */
  async function init(opts) {
    opts = opts || {};
    var agentCfg = await getAgentVoiceConfig(opts.agentSlug);
    var input = opts.input;
    var micBtn = opts.micBtn;
    var speakBtn = opts.speakBtn;
    var onTranscript = opts.onTranscript;

    if (!agentCfg.voiceEnabled) {
      if (micBtn) micBtn.hidden = true;
      if (speakBtn) speakBtn.hidden = true;
      return { agentCfg: agentCfg, supported: speechSupported() };
    }

    if (!speechSupported()) {
      if (micBtn) micBtn.disabled = true;
      if (speakBtn) speakBtn.disabled = true;
      return { agentCfg: agentCfg, supported: false };
    }

    if (speakBtn) {
      speakBtn.hidden = false;
      speakBtn.addEventListener('click', function () {
        var text = getLastSpokenSummary();
        if (!text && global.GreenwaysAgentTurnUi) {
          /* fallback: last agent bubble intro */
          var bubble = document.querySelector('.msg-row.agent:last-child .typed-body, .msg-row.agent:last-child .msg-bubble .typed-body');
          if (bubble) text = bubble.textContent || '';
        }
        speak(text, {
          lang: agentCfg.lang,
          rate: agentCfg.speechRate,
          speakBtn: speakBtn,
          agentSlug: agentCfg.slug,
          useServerTts: agentCfg.useServerTts
        });
      });
    }

    if (micBtn && sttSupported()) {
      micBtn.hidden = false;
      var Recognition = global.SpeechRecognition || global.webkitSpeechRecognition;
      var rec = new Recognition();
      rec.lang = agentCfg.lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      var listening = false;

      micBtn.addEventListener('click', function () {
        if (listening) {
          rec.stop();
          return;
        }
        try {
          rec.start();
        } catch (_) {}
      });

      rec.onstart = function () {
        listening = true;
        micBtn.classList.add('is-active');
        micBtn.setAttribute('aria-pressed', 'true');
      };

      rec.onend = function () {
        listening = false;
        micBtn.classList.remove('is-active');
        micBtn.setAttribute('aria-pressed', 'false');
      };

      rec.onerror = function () {
        listening = false;
        micBtn.classList.remove('is-active');
      };

      rec.onresult = function (ev) {
        var transcript = ev.results[0][0].transcript;
        if (input) input.value = transcript;
        if (typeof onTranscript === 'function') onTranscript(transcript);
      };
    } else if (micBtn) {
      micBtn.disabled = true;
    }

    return {
      agentCfg: agentCfg,
      supported: true,
      maybeAutoSpeak: function (spokenSummary) {
        setLastSpokenSummary(spokenSummary);
        if (agentCfg.autoSpeakOnReply && spokenSummary) {
          speak(spokenSummary, {
            lang: agentCfg.lang,
            rate: agentCfg.speechRate,
            speakBtn: speakBtn,
            agentSlug: agentCfg.slug,
            useServerTts: agentCfg.useServerTts
          });
        }
      }
    };
  }

  global.GreenwaysAgentVoice = {
    init: init,
    speak: speak,
    stop: stopSpeaking,
    setLastSpokenSummary: setLastSpokenSummary,
    getLastSpokenSummary: getLastSpokenSummary,
    isSupported: speechSupported,
    loadConfig: loadConfig,
    getAgentVoiceConfig: getAgentVoiceConfig
  };
})(typeof window !== 'undefined' ? window : global);
