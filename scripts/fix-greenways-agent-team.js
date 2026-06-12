/**
 * Repair team strip HTML + fix broken voice/team init block.
 * Run: node scripts/fix-greenways-agent-team.js
 */
const fs = require('fs');
const path = require('path');

const GWB = path.join(__dirname, '..', 'HTMLS GWM GWB');

const AGENTS = [
  { file: 'greenways-grants-agent.html', slug: 'grants-agent' },
  { file: 'greenways-finance-agent.html', slug: 'finance-agent' },
  { file: 'greenways-equipment-agent.html', slug: 'equipment-agent' },
  { file: 'greenways-deals-agent.html', slug: 'deals-agent' },
  { file: 'greenways-media-agent.html', slug: 'media-agent' },
  { file: 'greenways-sustainable-products-agent.html', slug: 'sustainable-products-agent' },
  { file: 'greenways-systems-agent.html', slug: 'systems-agent' }
];

const TEAM_INIT = (slug) => `
  if (window.GreenwaysAgentTeam) {
    GreenwaysAgentTeam.init({
      stripMount: document.getElementById("gw-team-strip"),
      currentSlug: "${slug}",
      getProfile: typeof getProfile === "function" ? getProfile : null,
      getAgentName: function () { return AGENT_PROFILE && AGENT_PROFILE.name ? AGENT_PROFILE.name : "Agent"; },
      getLastSummary: function () {
        return (window.GreenwaysAgentVoice && GreenwaysAgentVoice.getLastSpokenSummary()) || "";
      },
      getLastQuestion: function () { return typeof lastQuestion !== "undefined" ? lastQuestion : ""; }
    });
  }

  document.addEventListener("gw-team-ready", function (ev) {
    var boot = ev.detail && ev.detail.suggestedPrompt;
    if (boot && typeof sendQuestion === "function") {
      setTimeout(function () { sendQuestion(boot); }, ev.detail.handoffBrief ? 650 : 400);
    }
  }, { once: true });
`;

const BROKEN_BLOCK_RE =
  /var gwVoiceHandle = null;\s*if \(window\.GreenwaysAgentVoice\) \{\s*GreenwaysAgentVoice\.init\(\{[\s\S]*?onTranscript: function \(text\) \{\s*if \(String\(text \|\| ""\)\.trim\(\)\) sendQuestion\(text\);\s*\}\s*if \(window\.GreenwaysAgentTeam\)[\s\S]*?\}, \{ once: true \}\);\s*\}\)\.then\(function \(handle\) \{\s*gwVoiceHandle = handle;\s*\}\);\s*\}/;

const FIXED_VOICE_BLOCK = `var gwVoiceHandle = null;
  if (window.GreenwaysAgentVoice) {
    GreenwaysAgentVoice.init({
      input: input,
      micBtn: document.getElementById("voice-mic-btn"),
      speakBtn: document.getElementById("voice-speak-btn"),
      onTranscript: function (text) {
        if (String(text || "").trim()) sendQuestion(text);
      }
    }).then(function (handle) {
      gwVoiceHandle = handle;
    });
  }`;

function ensureStripNav(html) {
  if (html.includes('id="gw-team-strip"')) return html;
  return html.replace(
    /<button type="button" class="header-ghost-btn" id="new-chat-btn"([^>]*)>([\s\S]*?)<\/button>/,
    '<div class="guide-top-actions">\n        <nav class="gw-team-strip" id="gw-team-strip" aria-label="Greenways agent team" hidden></nav>\n        <button type="button" class="header-ghost-btn" id="new-chat-btn"$1>$2</button>\n      </div>'
  );
}

function fixInitBlock(html, slug) {
  if (BROKEN_BLOCK_RE.test(html)) {
    html = html.replace(BROKEN_BLOCK_RE, FIXED_VOICE_BLOCK + TEAM_INIT(slug));
    return html;
  }

  if (!html.includes('GreenwaysAgentTeam.init')) {
    html = html.replace(/(\n\s+restoreSession\(\);)/, `${TEAM_INIT(slug)}$1`);
  }

  return html;
}

function fixFile({ file, slug }) {
  const filePath = path.join(GWB, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;
  html = ensureStripNav(html);
  html = fixInitBlock(html, slug);
  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Fixed', file);
  } else {
    console.log('OK', file);
  }
}

AGENTS.forEach(fixFile);
console.log('Done.');
