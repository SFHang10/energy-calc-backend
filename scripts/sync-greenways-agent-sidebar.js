/**
 * Wire shared sidebar UI into all Greenways agent HTML pages.
 * Run: node scripts/sync-greenways-agent-sidebar.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GWB = path.join(ROOT, 'HTMLS GWM GWB');
const CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/greenways-agent-sidebar-config.json'), 'utf8')
);

const AGENTS = [
  { file: 'greenways-grants-agent.html', slug: 'grants-agent' },
  { file: 'greenways-finance-agent.html', slug: 'finance-agent' },
  { file: 'greenways-equipment-agent.html', slug: 'equipment-agent' },
  { file: 'greenways-deals-agent.html', slug: 'deals-agent' },
  { file: 'greenways-media-agent.html', slug: 'media-agent' },
  { file: 'greenways-sustainable-products-agent.html', slug: 'sustainable-products-agent' },
  { file: 'greenways-systems-agent.html', slug: 'systems-agent' }
];

const CSS_LINK =
  '<link rel="stylesheet" href="/HTMLS%20GWM%20GWB/js/greenways-agent-sidebar.css">';
const JS_SCRIPT =
  '<script src="/HTMLS%20GWM%20GWB/js/greenways-agent-sidebar.js"></script>';

const STORY_LINK_SCRIPT =
  '<script src="/HTMLS%20GWM%20GWB/js/greenways-agent-story-link.js"></script>';

const ASK_ABOUT_SECTION = `    <div class="sidebar-section sidebar-section--helpers">
      <div class="sidebar-label">Ask about</div>
      <p class="sidebar-hint" id="gw-sidebar-helpers-hint"></p>
      <div class="helper-list" id="helper-list"></div>
    </div>`;

const QUICK_LINKS_SECTION = `    <div class="sidebar-section sidebar-section--links">
      <div class="sidebar-label">Quick links</div>
      <p class="sidebar-hint" id="gw-sidebar-links-hint"></p>
      <div class="gw-sidebar-ql-list" id="gw-agent-quick-links" role="navigation" aria-label="Quick links"></div>
    </div>`;

function ensureAssets(html) {
  let out = html;
  if (!out.includes('greenways-agent-sidebar.css')) {
    out = out.replace(
      /(<link rel="stylesheet" href="[^"]*greenways-agent-team\.css">)/,
      `$1\n${CSS_LINK}`
    );
    if (!out.includes('greenways-agent-sidebar.css')) {
      out = out.replace(
        /(<link rel="stylesheet" href="[^"]*greenways-agent-turn-ui\.css">)/,
        `$1\n${CSS_LINK}`
      );
    }
  }
  if (!out.includes('greenways-agent-sidebar.js')) {
    out = out.replace(
      /(<script src="[^"]*greenways-agent-team\.js"><\/script>)/,
      `$1\n${JS_SCRIPT}`
    );
    if (!out.includes('greenways-agent-sidebar.js')) {
      out = out.replace(
        /(<script src="[^"]*greenways-agent-turn-ui\.js"><\/script>)/,
        `$1\n${JS_SCRIPT}`
      );
    }
  }
  if (!out.includes('greenways-agent-story-link.js') && out.includes('greenways-agent-chat-shell.css')) {
    out = out.replace(
      /(<link rel="stylesheet" href="[^"]*greenways-agent-chat-shell\.css">)/,
      `$1\n${STORY_LINK_SCRIPT}`
    );
  }
  return out;
}

function stripLegacySidebarBlocks(html) {
  return html
    .replace(
      /<div class="sidebar-block--helpers">[\s\S]*?<div class="helper-list" id="helper-list"><\/div>\s*<\/div>\s*/g,
      ''
    )
    .replace(
      /<div class="sidebar-section sidebar-section--helpers">[\s\S]*?<div class="helper-list" id="helper-list"><\/div>\s*<\/div>\s*/g,
      ''
    )
    .replace(
      /<div class="sidebar-section sidebar-section--links">[\s\S]*?id="gw-agent-quick-links"[\s\S]*?<\/div>\s*<\/div>\s*/g,
      ''
    )
    .replace(/<div class="helper-list" id="helper-list"><\/div>\s*/g, '');
}

function normalizeDefaultAgentSidebar(html) {
  html = stripLegacySidebarBlocks(html);
  const asideRe =
    /(<aside class="guide-sidebar"[^>]*>)([\s\S]*?)(<div class="status-bar")/;
  if (!asideRe.test(html) || html.includes('Ops · verify selected')) return html;
  return html.replace(
    asideRe,
    `$1\n${ASK_ABOUT_SECTION}\n${QUICK_LINKS_SECTION}\n$3`
  );
}

const OPS_SECTION = `    <div class="sidebar-section">
      <div class="sidebar-label">Ops · verify selected</div>
      <p class="sync-note">Tick items to re-check freshness on disk.</p>
      <div class="sync-checks" id="sync-checks"></div>
      <button type="button" class="sync-verify-btn" id="sync-verify-btn">🔄 Verify selected</button>
      <p class="sync-note">Does not run integrator or build commands — confirms status only.</p>
    </div>`;

function normalizeSystemsAgentSidebar(html) {
  html = html.replace(
    /<aside class="guide-sidebar">[\s\S]*?<div class="status-bar"/,
    `<aside class="guide-sidebar">\n${OPS_SECTION}\n${QUICK_LINKS_SECTION}\n${ASK_ABOUT_SECTION}\n<div class="status-bar"`
  );
  return html;
}

function removeHelpersForEach(html) {
  return html.replace(
    /\n\s*HELPERS\.forEach\(function \(h\) \{[\s\S]*?\n\s*\}\);\n/g,
    '\n'
  );
}

function removeFinanceQuickLinksBlock(html) {
  return html
    .replace(/\n\s*const QUICK_LINKS = \[[\s\S]*?\n\s*\];\n/, '\n')
    .replace(/\n\s*function renderQuickLinks\(\) \{[\s\S]*?\n\s*\}\n\n\s*renderQuickLinks\(\);\n/, '\n')
    .replace(/\n\s*const quickLinksList = document\.getElementById\("[^"]+"\);\n/, '\n');
}

function removeInitSidebarGwbLinks(html) {
  return html
    .replace(/\n\s*function initSidebarGwbLinks\(\) \{[\s\S]*?\n\s*\}\n/, '\n')
    .replace(/\n\s*initSidebarGwbLinks\(\);\n/, '\n');
}

function patchSidebarInit(html, slug) {
  const cfg = CONFIG.agents[slug];
  if (!cfg) return html;

  const mediaExtra =
    slug === 'media-agent'
      ? `,
      onQuickLinkClick: function (link, el, e) {
        if (link.mapOpen && typeof openSustainabilityMapModule === "function") {
          e.preventDefault();
          openSustainabilityMapModule();
        }
      }`
      : '';

  const initBlock = `  if (window.GreenwaysAgentSidebar) {
    GreenwaysAgentSidebar.init({
      quickLinks: ${JSON.stringify(cfg.quickLinks)},
      linksHint: ${JSON.stringify(cfg.linksHint)},
      helpersHint: ${JSON.stringify(cfg.helpersHint)},
      helpers: HELPERS,
      onAsk: function (prompt) { sendQuestion(prompt); }${mediaExtra},
      compactNameLen: 16
    });
  }`;

  if (html.includes('GreenwaysAgentSidebar.init')) {
    return html.replace(
      /if \(window\.GreenwaysAgentSidebar\) \{[\s\S]*?GreenwaysAgentSidebar\.init\(\{[\s\S]*?\}\);\s*\}/,
      initBlock
    );
  }

  const snippet = `\n${initBlock}\n`;
  const anchor = 'document.getElementById("new-chat-btn").addEventListener("click", clearChat);';
  if (html.includes(anchor)) {
    return html.replace(anchor, anchor + snippet);
  }
  const anchor2 = 'updateCompareUi();';
  if (html.includes(anchor2)) {
    return html.replace(anchor2, snippet + '  ' + anchor2);
  }
  throw new Error(`Could not find insert point in ${slug}`);
}

function patchSystemsHelpers(html) {
  return html.replace(
    /document\.getElementById\("helper-list"\)\.innerHTML = HELPERS\.map\(function \(h\) \{[\s\S]*?\}\)\.join\(""\);\n/,
    ''
  );
}

function stripDuplicateSidebarCss(html) {
  if (!html.includes('greenways-agent-sidebar.css')) return html;
  return html
    .replace(/\n  \.sidebar-section--links \{[\s\S]*?\n  \}\n  \.sidebar-block--helpers \{[\s\S]*?\n  \}\n/g, '\n')
    .replace(/\n  \.guide-sidebar \.gw-fin-ql[\s\S]*?\n  \.guide-sidebar a\.gw-fin-ql-card\.is-agent \.gw-fin-ql-icon \{[\s\S]*?\n  \}\n/g, '\n');
}

function run() {
  let ok = 0;
  for (const { file, slug } of AGENTS) {
    const filePath = path.join(GWB, file);
    let html = fs.readFileSync(filePath, 'utf8');
    html = ensureAssets(html);
    if (slug === 'systems-agent') {
      html = normalizeSystemsAgentSidebar(html);
      html = patchSystemsHelpers(html);
    } else {
      html = normalizeDefaultAgentSidebar(html);
    }
    html = removeHelpersForEach(html);
    if (slug === 'finance-agent') html = removeFinanceQuickLinksBlock(html);
    if (slug === 'media-agent') html = removeInitSidebarGwbLinks(html);
    html = stripDuplicateSidebarCss(html);
    html = patchSidebarInit(html, slug);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('OK', file);
    ok += 1;
  }
  console.log(`\nSynced sidebar UI to ${ok} agent pages.`);
}

run();
