/**
 * Wire Email me this preview UI into all Greenways agent HTML pages.
 * Run: node scripts/sync-greenways-agent-mail.js
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

const CSS_ABS = '<link rel="stylesheet" href="/HTMLS%20GWM%20GWB/js/greenways-agent-mail.css">';
const JS_ABS = '<script src="/HTMLS%20GWM%20GWB/js/greenways-agent-mail.js"></script>';

const MAIL_BTN =
  '<button type="button" class="gw-mail-btn" id="mail-preview-btn" aria-label="Email me this answer" title="Email me this">✉️</button>';

const MAIL_INIT = `
  var gwMailHandle = null;
  if (window.GreenwaysAgentMail) {
    gwMailHandle = GreenwaysAgentMail.init({
      mailBtn: document.getElementById("mail-preview-btn"),
      getProfile: typeof profileForAsk === "function" ? profileForAsk : (typeof getProfile === "function" ? getProfile : null)
    });
  }
`;

function ensureAssets(html) {
  let out = html;
  if (out.includes('greenways-agent-mail.js')) return out;
  if (out.includes('greenways-agent-voice.js')) {
    out = out.replace(
      /(<script src="\/HTMLS%20GWM%20GWB\/js\/greenways-agent-voice\.js"><\/script>)/,
      `$1\n${CSS_ABS}\n${JS_ABS}`
    );
  }
  if (!out.includes('greenways-agent-mail.js')) {
    out = out.replace(
      /(<script src="\/HTMLS%20GWM%20GWB\/js\/greenways-agent-turn-ui\.js"><\/script>)/,
      `$1\n${CSS_ABS}\n${JS_ABS}`
    );
  }
  return out;
}

function ensureComposeButton(html) {
  let out = html;
  if (out.includes('id="mail-preview-btn"')) return out;
  if (out.includes('id="voice-auto-btn"')) {
    return out.replace(
      /(<button type="button" class="gw-voice-btn" id="voice-auto-btn"[^>]*>🔁<\/button>\s*\n?)/,
      `$1        ${MAIL_BTN}\n`
    );
  }
  if (out.includes('id="voice-speak-btn"')) {
    return out.replace(
      /(<button type="button" class="gw-voice-btn" id="voice-speak-btn"[^>]*>🔊<\/button>\s*\n?)/,
      `$1        ${MAIL_BTN}\n`
    );
  }
  return out.replace(
    /(<button type="button" class="send-btn" id="send-btn"[^>]*>)/,
    `${MAIL_BTN}\n$1`
  );
}

function ensureMailOnTurn(html) {
  if (html.includes('GreenwaysAgentMail.setLastTurn') || html.includes('gwMailHandle.setLastTurn')) {
    return html;
  }
  const voiceHook =
    '      if (gwVoiceHandle && gwVoiceHandle.maybeAutoSpeak && payload.spokenSummary) {\n' +
    '        gwVoiceHandle.maybeAutoSpeak(payload.spokenSummary);\n' +
    '      } else if (window.GreenwaysAgentVoice && payload.spokenSummary) {\n' +
    '        GreenwaysAgentVoice.setLastSpokenSummary(payload.spokenSummary);\n' +
    '      }';

  const mailHook =
    '\n      if (window.GreenwaysAgentMail) {\n' +
    '        GreenwaysAgentMail.setLastTurn({\n' +
    '          question: payload.question || (typeof lastQuestion !== "undefined" ? lastQuestion : ""),\n' +
    '          answer: typeof answer !== "undefined" ? answer : (payload.answer || ""),\n' +
    '          spokenSummary: payload.spokenSummary || "",\n' +
    '          intentId: typeof intentId !== "undefined" ? intentId : (payload.intentId || ""),\n' +
    '          agentSlug: (typeof AGENT_PROFILE !== "undefined" && AGENT_PROFILE && AGENT_PROFILE.slug) ? AGENT_PROFILE.slug : undefined\n' +
    '        });\n' +
    '      }';

  if (html.includes(voiceHook) && !html.includes('GreenwaysAgentMail.setLastTurn')) {
    return html.replace(voiceHook, voiceHook + mailHook);
  }

  // Systems agent uses a shorter status string.
  if (html.includes('setStatus("Answered"') && !html.includes('GreenwaysAgentMail.setLastTurn')) {
    return html.replace(
      /(else if \(window\.GreenwaysAgentVoice && payload\.spokenSummary\) \{\n\s*GreenwaysAgentVoice\.setLastSpokenSummary\(payload\.spokenSummary\);\n\s*\})/,
      `$1${mailHook}`
    );
  }

  const marker = 'setStatus("Answered · " + src';
  if (!html.includes(marker) || html.includes('GreenwaysAgentMail.setLastTurn')) return html;
  return html.replace(/(\s+setStatus\("Answered · " \+ src)/, `${mailHook}$1`);
}

function ensureMailInit(html) {
  if (html.includes('GreenwaysAgentMail.init')) return html;
  if (html.includes('gwVoiceHandle = null') || html.includes('var gwVoiceHandle = null')) {
    return html.replace(
      /(var gwVoiceHandle = null;|let gwVoiceHandle = null;)/,
      `$1\n${MAIL_INIT}`
    );
  }
  const markers = ['restoreSession();', 'bindWelcomeTags();', 'loadBannerSamples();'];
  for (const marker of markers) {
    if (html.includes(marker)) {
      return html.replace(marker, `${MAIL_INIT}\n  ${marker}`);
    }
  }
  return html.replace(/<\/script>\s*\n<\/body>/, `  ${MAIL_INIT}\n</script>\n</body>`);
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
  html = ensureComposeButton(html);
  html = ensureMailOnTurn(html);
  html = ensureMailInit(html);
  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Updated', name);
  } else {
    console.log('No change', name);
  }
}

AGENTS.forEach(syncFile);
console.log('Done.');
