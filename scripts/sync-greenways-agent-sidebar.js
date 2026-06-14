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

const SIDEBAR_LINKS_BLOCK = `    <div class="sidebar-section sidebar-section--links">
      <div class="sidebar-label">Quick links</div>
      <p class="sidebar-hint" id="gw-sidebar-links-hint"></p>
      <div class="gw-sidebar-ql-list" id="gw-agent-quick-links" role="navigation" aria-label="Quick links"></div>
    </div>
    <div class="sidebar-block--helpers">
      <div class="sidebar-label">Ask about</div>
      <p class="sidebar-hint" id="gw-sidebar-helpers-hint"></p>
      <div class="helper-list" id="helper-list"></div>
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
  return out;
}

function replaceQuickLinksSection(html) {
  // Standard single quick-links section (most agents)
  const standardRe =
    /<div class="sidebar-section(?: sidebar-section--links)?">\s*<div class="sidebar-label">Quick links<\/div>[\s\S]*?(?=<div class="helper-list"|<div class="status-bar"|<\/aside>)/;
  if (standardRe.test(html)) {
    return html.replace(standardRe, SIDEBAR_LINKS_BLOCK + '\n');
  }
  return html;
}

function wrapOrphanHelperList(html) {
  if (html.includes('sidebar-block--helpers')) return html;
  return html.replace(
    /<div class="helper-list" id="helper-list"><\/div>/,
    SIDEBAR_LINKS_BLOCK.replace(
      /[\s\S]*<div class="helper-list" id="helper-list"><\/div>/,
      `<div class="sidebar-block--helpers">
      <div class="sidebar-label">Ask about</div>
      <p class="sidebar-hint" id="gw-sidebar-helpers-hint"></p>
      <div class="helper-list" id="helper-list"></div>
    </div>`
    )
  );
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

function insertSidebarInit(html, slug) {
  if (html.includes('GreenwaysAgentSidebar.init')) return html;

  const cfg = CONFIG.agents[slug];
  if (!cfg) throw new Error(`No sidebar config for ${slug}`);

  const mediaExtra =
    slug === 'media-agent'
      ? `
    onQuickLinkClick: function (link, el, e) {
      if (link.mapOpen && typeof openSustainabilityMapModule === "function") {
        e.preventDefault();
        openSustainabilityMapModule();
      }
    },`
      : '';

  const snippet = `
  if (window.GreenwaysAgentSidebar) {
    GreenwaysAgentSidebar.init({
      quickLinks: ${JSON.stringify(cfg.quickLinks)},
      linksHint: ${JSON.stringify(cfg.linksHint)},
      helpersHint: ${JSON.stringify(cfg.helpersHint)},
      helpers: HELPERS,
      onAsk: function (prompt) { sendQuestion(prompt); },${mediaExtra}
      compactNameLen: 16
    });
  } else {
    HELPERS.forEach(function (h) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "helper-card";
      card.innerHTML = h.name;
      card.addEventListener("click", function () { sendQuestion(h.prompt); });
      document.getElementById("helper-list").appendChild(card);
    });
  }
`;

  const anchor = 'document.getElementById("new-chat-btn").addEventListener("click", clearChat);';
  if (html.includes(anchor)) {
    return html.replace(anchor, anchor + snippet);
  }

  const anchor2 = 'updateCompareUi();';
  if (html.includes(anchor2)) {
    return html.replace(anchor2, snippet + '\n  ' + anchor2);
  }

  throw new Error(`Could not find insert point in ${slug}`);
}

function stripDuplicateSidebarCss(html) {
  // Remove finance-specific gw-fin-ql rules if shared CSS loaded
  if (!html.includes('greenways-agent-sidebar.css')) return html;
  return html
    .replace(/\n  \.sidebar-section--links \{[\s\S]*?\n  \}\n  \.sidebar-block--helpers \{[\s\S]*?\n  \}\n/g, '\n')
    .replace(/\n  \.guide-sidebar \.gw-fin-ql[\s\S]*?\n  \.guide-sidebar a\.gw-fin-ql-card\.is-agent \.gw-fin-ql-icon \{[\s\S]*?\n  \}\n/g, '\n');
}

function patchSystemsSidebar(html) {
  // Edwardo: ops block stays; replace only the quick-links sidebar-section before helper-list
  if (!html.includes('Ops · verify selected')) return html;

  const opsQuickRe =
    /<div class="sidebar-section">\s*<div class="sidebar-label">Quick links<\/div>[\s\S]*?(?=<div class="helper-list")/;
  const replacement = `<div class="sidebar-section sidebar-section--links">
      <div class="sidebar-label">Quick links</div>
      <p class="sidebar-hint" id="gw-sidebar-links-hint"></p>
      <div class="gw-sidebar-ql-list" id="gw-agent-quick-links" role="navigation" aria-label="Quick links"></div>
    </div>
    <div class="sidebar-block--helpers">
      <div class="sidebar-label">Ask about</div>
      <p class="sidebar-hint" id="gw-sidebar-helpers-hint"></p>
      `;

  if (opsQuickRe.test(html)) {
    html = html.replace(
      opsQuickRe,
      replacement
    );
    html = html.replace(
      /<div class="helper-list" id="helper-list"><\/div>/,
      '<div class="helper-list" id="helper-list"></div>\n    </div>'
    );
  }
  return html;
}

function patchSystemsHelpers(html) {
  // Replace innerHTML map pattern for helpers
  return html.replace(
    /document\.getElementById\("helper-list"\)\.innerHTML = HELPERS\.map\(function \(h\) \{[\s\S]*?\}\)\.join\(""\);\n/,
    ''
  );
}

function run() {
  let ok = 0;
  for (const { file, slug } of AGENTS) {
    const filePath = path.join(GWB, file);
    let html = fs.readFileSync(filePath, 'utf8');
    html = ensureAssets(html);
    if (slug === 'systems-agent') {
      html = patchSystemsSidebar(html);
      html = patchSystemsHelpers(html);
    } else {
      html = replaceQuickLinksSection(html);
    }
    html = removeHelpersForEach(html);
    if (slug === 'finance-agent') html = removeFinanceQuickLinksBlock(html);
    if (slug === 'media-agent') html = removeInitSidebarGwbLinks(html);
    html = stripDuplicateSidebarCss(html);
    html = insertSidebarInit(html, slug);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('OK', file);
    ok += 1;
  }
  console.log(`\nSynced sidebar UI to ${ok} agent pages.`);
}

run();
