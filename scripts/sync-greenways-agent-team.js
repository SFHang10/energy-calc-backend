/**
 * Wire team strip + handoff brief into all Greenways agent HTML pages.
 * Run: node scripts/sync-greenways-agent-team.js
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

const CSS_ABS = '<link rel="stylesheet" href="/HTMLS%20GWM%20GWB/js/greenways-agent-team.css">';
const JS_ABS = '<script src="/HTMLS%20GWM%20GWB/js/greenways-agent-team.js"></script>';

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

function ensureAssets(html) {
  if (html.includes('greenways-agent-team.css')) return html;
  if (html.includes('greenways-agent-voice.js')) {
    return html.replace(
      /(<script src="\/HTMLS%20GWM%20GWB\/js\/greenways-agent-voice\.js"><\/script>)/,
      `$1\n${CSS_ABS}\n${JS_ABS}`
    );
  }
  if (html.includes('greenways-agent-turn-ui.js')) {
    return html.replace(
      /(<script src="\/HTMLS%20GWM%20GWB\/js\/greenways-agent-turn-ui\.js"><\/script>)/,
      `$1\n${CSS_ABS}\n${JS_ABS}`
    );
  }
  return html;
}

function ensureTopActions(html) {
  if (html.includes('id="gw-team-strip"')) return html;
  return html.replace(
    /<button type="button" class="header-ghost-btn" id="new-chat-btn"([^>]*)>([\s\S]*?)<\/button>/,
    '<div class="guide-top-actions">\n        <nav class="gw-team-strip" id="gw-team-strip" aria-label="Greenways agent team" hidden></nav>\n        <button type="button" class="header-ghost-btn" id="new-chat-btn"$1>$2</button>\n      </div>'
  );
}

function ensureGuideTopActionsCss(html) {
  if (html.includes('.guide-top-actions')) return html;
  return html.replace(
    /\.header-ghost-btn \{/,
    `.guide-top-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .header-ghost-btn {`
  );
}

function ensureTeamInit(html, slug) {
  if (html.includes('GreenwaysAgentTeam.init')) return html;
  const initBlock = TEAM_INIT(slug);
  if (html.includes('restoreSession();')) {
    return html.replace(/(\n\s+restoreSession\(\);)/, `\n${initBlock}$1`);
  }
  return html.replace(/<\/script>\s*\n<\/body>/, `${initBlock}\n</script>\n</body>`);
}

function removeLegacyBoot(html) {
  return html.replace(
    /\n\s*var params = new URLSearchParams\(location\.search\);\s*\n\s*var boot = params\.get\("q"\)[^;]+;\s*\n\s*if \(boot\) setTimeout\(function \(\) \{ sendQuestion\(boot\); \}, 400\);\s*\n/g,
    '\n'
  );
}

function syncFile({ file, slug }) {
  const filePath = path.join(GWB, file);
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing:', file);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;
  html = ensureAssets(html);
  html = ensureGuideTopActionsCss(html);
  html = ensureTopActions(html);
  html = removeLegacyBoot(html);
  html = ensureTeamInit(html, slug);
  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Updated', file);
  } else {
    console.log('No change', file);
  }
}

AGENTS.forEach(syncFile);
console.log('Done.');
