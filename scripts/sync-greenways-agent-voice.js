/**
 * Wire shared voice UI (mic + read-aloud + member auto-listen) into all Greenways agent HTML pages.
 * Run: node scripts/sync-greenways-agent-voice.js
 */
const fs = require('fs');
const path = require('path');

const GWB = path.join(__dirname, '..', 'HTMLS GWM GWB');
const AGENTS = [
  'greenways-grants-agent.html',
  'greenways-finance-agent.html',
  'greenways-equipment-agent.html',
  'greenways-deals-agent.html',
  'greenways-media-agent.html',
  'greenways-sustainable-products-agent.html',
  'greenways-systems-agent.html'
];

const CSS_ABS = '<link rel="stylesheet" href="/HTMLS%20GWM%20GWB/js/greenways-agent-voice.css">';
const JS_ABS = '<script src="/HTMLS%20GWM%20GWB/js/greenways-agent-voice.js"></script>';

const MIC_BTN =
  '<button type="button" class="gw-voice-btn" id="voice-mic-btn" aria-label="Speak your question" title="Speak">🎤</button>';
const SPEAK_BTN =
  '<button type="button" class="gw-voice-btn" id="voice-speak-btn" aria-label="Read last answer aloud" title="Listen">🔊</button>';
const AUTO_BTN =
  '<button type="button" class="gw-voice-btn" id="voice-auto-btn" aria-label="Turn on auto-listen mode" title="Auto-listen" aria-pressed="false" hidden>🔁</button>';

const VOICE_INIT = `
  var gwVoiceHandle = null;
  if (window.GreenwaysAgentVoice) {
    GreenwaysAgentVoice.init({
      input: input,
      micBtn: document.getElementById("voice-mic-btn"),
      speakBtn: document.getElementById("voice-speak-btn"),
      autoSpeakBtn: document.getElementById("voice-auto-btn"),
      getProfile: typeof profileForAsk === "function" ? profileForAsk : (typeof getProfile === "function" ? getProfile : null),
      onTranscript: function (text) {
        if (String(text || "").trim()) sendQuestion(text);
      }
    }).then(function (handle) {
      gwVoiceHandle = handle;
    });
  }
`;

function ensureAssets(html) {
  let out = html;
  if (!out.includes('greenways-agent-voice.css')) {
    out = out.replace(
      /(<script src="\/HTMLS%20GWM%20GWB\/js\/greenways-agent-turn-ui\.js"><\/script>)/,
      `$1\n${CSS_ABS}\n${JS_ABS}`
    );
    if (!out.includes('greenways-agent-voice.css')) {
      out = out.replace(
        /(<script src="js\/greenways-agent-turn-ui\.js"><\/script>)/,
        `$1\n<link rel="stylesheet" href="js/greenways-agent-voice.css">\n<script src="js/greenways-agent-voice.js"></script>`
      );
    }
  }
  return out;
}

function ensureComposeButtons(html) {
  let out = html;
  if (!out.includes('id="voice-mic-btn"')) {
    out = out.replace(
      /(<div class="compose-row">\s*\n?\s*<textarea id="chat-input"[^>]*><\/textarea>\s*\n?)/,
      `$1        ${MIC_BTN}\n        ${SPEAK_BTN}\n        ${AUTO_BTN}\n`
    );
  }
  if (!out.includes('id="voice-auto-btn"')) {
    out = out.replace(
      /(<button type="button" class="gw-voice-btn" id="voice-speak-btn"[^>]*>🔊<\/button>\s*\n?)/,
      `$1        ${AUTO_BTN}\n`
    );
  }
  return out;
}

function ensureVoiceOnTurn(html) {
  if (html.includes('gwVoiceHandle.maybeAutoSpeak')) return html;
  if (html.includes('gwVoiceHandle') && html.includes('maybeAutoSpeak')) return html;
  const marker = 'setStatus("Answered · " + src';
  if (!html.includes(marker)) return html;

  const hook =
    '      if (gwVoiceHandle && gwVoiceHandle.maybeAutoSpeak && payload.spokenSummary) {\n' +
    '        gwVoiceHandle.maybeAutoSpeak(payload.spokenSummary);\n' +
    '      } else if (window.GreenwaysAgentVoice && payload.spokenSummary) {\n' +
    '        GreenwaysAgentVoice.setLastSpokenSummary(payload.spokenSummary);\n' +
    '      }\n';

  return html.replace(/(\s+setStatus\("Answered · " \+ src)/, `\n${hook}$1`);
}

function ensureVoiceInit(html) {
  if (html.includes('autoSpeakBtn: document.getElementById("voice-auto-btn")')) {
    return html;
  }
  if (html.includes('gwVoiceHandle = null') || html.includes('let gwVoiceHandle = null')) {
    return html.replace(
      /GreenwaysAgentVoice\.init\(\{\s*\n?\s*input:\s*input,\s*\n?\s*micBtn:\s*document\.getElementById\("voice-mic-btn"\),\s*\n?\s*speakBtn:\s*document\.getElementById\("voice-speak-btn"\),\s*\n?\s*onTranscript:/,
      `GreenwaysAgentVoice.init({\n      input: input,\n      micBtn: document.getElementById("voice-mic-btn"),\n      speakBtn: document.getElementById("voice-speak-btn"),\n      autoSpeakBtn: document.getElementById("voice-auto-btn"),\n      getProfile: typeof profileForAsk === "function" ? profileForAsk : (typeof getProfile === "function" ? getProfile : null),\n      onTranscript:`
    );
  }
  const markers = ['restoreSession();', 'bindWelcomeTags();', 'loadBannerSamples();'];
  for (const marker of markers) {
    if (html.includes(marker)) {
      return html.replace(marker, `${VOICE_INIT}\n  ${marker}`);
    }
  }
  return html.replace(/<\/script>\s*\n<\/body>/, `  ${VOICE_INIT}\n</script>\n</body>`);
}

function syncFile(name) {
  const filePath = path.join(GWB, name);
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing:', name);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;
  html = ensureAssets(html);
  html = ensureComposeButtons(html);
  html = ensureVoiceOnTurn(html);
  html = ensureVoiceInit(html);
  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Updated', name);
  } else {
    console.log('No change', name);
  }
}

AGENTS.forEach(syncFile);
console.log('Done.');
