(function (global) {
  'use strict';

  var CONFIG_URL = '/data/greenways-agent-voice-config.json';
  var LISTEN_MODE_KEY = 'gw-voice-listen-mode-v1';
  var configCache = null;
  var lastSummary = '';
  var activeAudio = null;
  var speakingActive = false;

  function speechSupported() {
    return ttsSupported() || sttSupported();
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

  function readJsonLocal(key) {
    try {
      var raw = global.localStorage && global.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function resolveProfile(getProfile) {
    var base = {};
    if (typeof getProfile === 'function') {
      try {
        base = getProfile() || {};
      } catch (_) {
        base = {};
      }
    }
    if (global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.profileForAsk === 'function') {
      try {
        return global.GreenwaysAgentTeam.profileForAsk(base, agentSlugFromPath()) || base;
      } catch (_) {
        /* fall through */
      }
    }
    var shared =
      global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.readSharedProfile === 'function'
        ? global.GreenwaysAgentTeam.readSharedProfile()
        : readJsonLocal('gw-team-profile-v1');
    var member = readJsonLocal('greenways_member_context_v1');
    var out = {};
    Object.keys(base || {}).forEach(function (k) {
      out[k] = base[k];
    });
    if (shared && typeof shared === 'object') {
      Object.keys(shared).forEach(function (k) {
        if (out[k] == null || out[k] === '') out[k] = shared[k];
      });
    }
    if (member && typeof member === 'object') {
      if (!out.tier && member.tier) out.tier = String(member.tier);
      if (!out.memberId && member.memberId != null) out.memberId = String(member.memberId);
      if (!out.siteId && member.siteId) out.siteId = String(member.siteId);
    }
    return out;
  }

  function isMemberProfile(profile) {
    var tier = String((profile && profile.tier) || '')
      .trim()
      .toLowerCase();
    return tier === 'member' || tier === 'paid' || tier === 'pro';
  }

  function getListenMode() {
    try {
      return global.localStorage && global.localStorage.getItem(LISTEN_MODE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function setListenMode(on) {
    try {
      if (global.localStorage) {
        if (on) global.localStorage.setItem(LISTEN_MODE_KEY, '1');
        else global.localStorage.removeItem(LISTEN_MODE_KEY);
      }
    } catch (_) {
      /* ignore */
    }
  }

  function setSpeakingState(speakBtn, isSpeaking) {
    speakingActive = !!isSpeaking;
    if (!speakBtn) return;
    if (isSpeaking) {
      speakBtn.classList.add('is-speaking');
      speakBtn.setAttribute('aria-label', 'Stop reading aloud');
      speakBtn.setAttribute('title', 'Stop');
      speakBtn.textContent = '⏹';
    } else {
      speakBtn.classList.remove('is-speaking');
      speakBtn.setAttribute('aria-label', 'Read last answer aloud');
      speakBtn.setAttribute('title', 'Listen');
      speakBtn.textContent = '🔊';
    }
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

  function stopSpeaking(speakBtn) {
    stopActiveAudio();
    if (ttsSupported()) {
      try {
        global.speechSynthesis.cancel();
      } catch (_) {}
    }
    setSpeakingState(speakBtn, false);
  }

  function speakBrowser(text, options) {
    if (!ttsSupported()) return false;
    var plain = stripForSpeech(text);
    if (!plain) return false;
    var btn = options && options.speakBtn;
    stopSpeaking(btn);
    var utter = new SpeechSynthesisUtterance(plain);
    utter.lang = (options && options.lang) || 'en-GB';
    utter.rate = (options && options.rate) || 1;
    if (btn) {
      setSpeakingState(btn, true);
      utter.onend = utter.onerror = function () {
        setSpeakingState(btn, false);
      };
    } else {
      speakingActive = true;
      utter.onend = utter.onerror = function () {
        speakingActive = false;
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
      stopSpeaking(btn);
      var url = URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio._objectUrl = url;
      activeAudio = audio;
      if (btn) setSpeakingState(btn, true);
      else speakingActive = true;
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

  function syncAutoSpeakUi(autoSpeakBtn, enabled, on) {
    if (!autoSpeakBtn) return;
    if (!enabled) {
      autoSpeakBtn.hidden = true;
      autoSpeakBtn.classList.remove('is-on');
      autoSpeakBtn.setAttribute('aria-pressed', 'false');
      return;
    }
    autoSpeakBtn.hidden = false;
    autoSpeakBtn.classList.toggle('is-on', !!on);
    autoSpeakBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    autoSpeakBtn.setAttribute(
      'title',
      on ? 'Auto-listen on — click to turn off' : 'Auto-listen off — read each answer aloud'
    );
    autoSpeakBtn.setAttribute(
      'aria-label',
      on ? 'Turn off auto-listen mode' : 'Turn on auto-listen mode'
    );
  }

  /**
   * @param {object} opts
   * @param {string} [opts.agentSlug]
   * @param {HTMLTextAreaElement} opts.input
   * @param {HTMLButtonElement} opts.micBtn
   * @param {HTMLButtonElement} opts.speakBtn
   * @param {HTMLButtonElement} [opts.autoSpeakBtn]
   * @param {function} [opts.getProfile]
   * @param {function} [opts.onTranscript] — (text) => void, e.g. sendQuestion
   */
  async function init(opts) {
    opts = opts || {};
    var agentCfg = await getAgentVoiceConfig(opts.agentSlug);
    var input = opts.input;
    var micBtn = opts.micBtn;
    var speakBtn = opts.speakBtn;
    var autoSpeakBtn = opts.autoSpeakBtn;
    var onTranscript = opts.onTranscript;
    var getProfile = opts.getProfile;

    function memberNow() {
      return isMemberProfile(resolveProfile(getProfile));
    }

    function listenModeOn() {
      return getListenMode();
    }

    function refreshMemberUi() {
      var member = memberNow();
      var on = member && listenModeOn();
      syncAutoSpeakUi(autoSpeakBtn, member && ttsSupported(), on);
      return { member: member, listenMode: on };
    }

    if (!agentCfg.voiceEnabled) {
      if (micBtn) micBtn.hidden = true;
      if (speakBtn) speakBtn.hidden = true;
      if (autoSpeakBtn) autoSpeakBtn.hidden = true;
      return { agentCfg: agentCfg, supported: speechSupported() };
    }

    if (!ttsSupported() && !sttSupported()) {
      if (micBtn) micBtn.disabled = true;
      if (speakBtn) speakBtn.disabled = true;
      if (autoSpeakBtn) autoSpeakBtn.hidden = true;
      return { agentCfg: agentCfg, supported: false };
    }

    refreshMemberUi();

    try {
      global.addEventListener('gw-profile-changed', refreshMemberUi);
    } catch (_) {
      /* ignore */
    }

    if (autoSpeakBtn) {
      autoSpeakBtn.addEventListener('click', function () {
        if (!memberNow()) {
          refreshMemberUi();
          return;
        }
        var next = !listenModeOn();
        setListenMode(next);
        refreshMemberUi();
        if (!next) stopSpeaking(speakBtn);
      });
    }

    if (speakBtn && ttsSupported()) {
      speakBtn.hidden = false;
      speakBtn.disabled = false;
      speakBtn.addEventListener('click', function () {
        if (speakingActive) {
          stopSpeaking(speakBtn);
          return;
        }
        var text = getLastSpokenSummary();
        if (!text) {
          var bubble = document.querySelector(
            '.msg-row.agent:last-child .typed-body, .msg-row.agent:last-child .msg-bubble .typed-body'
          );
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
    } else if (speakBtn) {
      speakBtn.disabled = true;
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
      isMember: memberNow,
      getListenMode: listenModeOn,
      setListenMode: setListenMode,
      refreshMemberUi: refreshMemberUi,
      stop: function () {
        stopSpeaking(speakBtn);
      },
      maybeAutoSpeak: function (spokenSummary) {
        setLastSpokenSummary(spokenSummary);
        var state = refreshMemberUi();
        var allow =
          Boolean(spokenSummary) &&
          state.member &&
          (state.listenMode || agentCfg.autoSpeakOnReply);
        if (!allow) return;
        speak(spokenSummary, {
          lang: agentCfg.lang,
          rate: agentCfg.speechRate,
          speakBtn: speakBtn,
          agentSlug: agentCfg.slug,
          useServerTts: agentCfg.useServerTts
        });
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
    getAgentVoiceConfig: getAgentVoiceConfig,
    isMemberProfile: isMemberProfile,
    getListenMode: getListenMode,
    setListenMode: setListenMode,
    LISTEN_MODE_KEY: LISTEN_MODE_KEY
  };
})(typeof window !== 'undefined' ? window : global);
