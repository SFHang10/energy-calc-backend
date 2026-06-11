const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'HTMLS GWM GWB');
const src = path.join(dir, 'greenways-finance-agent.html');
const dest = path.join(dir, 'greenways-guide-agent.html');

let html = fs.readFileSync(src, 'utf8');

const STATIC_ROSTER = `  const STATIC_PRODUCT_SAMPLES = [
    { id: "grants", name: "Grants Agent", icon: "🏛️", label: "Schemes & subsidies", isSpecialist: true, marketplaceHref: "/greenways/grants-agent?q=What+grants+fit+a+restaurant+upgrading+kitchen+equipment%3F" },
    { id: "finance", name: "Finance Agent", icon: "💶", label: "Loans, BNPL & energy prices", isSpecialist: true, marketplaceHref: "/greenways/finance-agent?q=What+finance+options+exist+for+restaurant+equipment%3F" },
    { id: "equipment", name: "Equipment Agent", icon: "🍳", label: "Kit & renovation", isSpecialist: true, marketplaceHref: "/greenways/equipment-agent?q=What+efficient+equipment+upgrades+should+a+restaurant+consider%3F" },
    { id: "products", name: "Sustainable Products", icon: "♻️", label: "Search water / elec / gas kit", isSpecialist: true, marketplaceHref: "/greenways/sustainable-products-agent?q=Find+water-saving+commercial+dishwashers" },
    { id: "deals", name: "Deals Agent", icon: "🏷️", label: "Tariffs & product spotlights", isSpecialist: true, marketplaceHref: "/greenways/deals-agent?q=What+product+deals+are+in+the+feed%3F" },
    { id: "media", name: "Media Agent", icon: "📰", label: "News, video & policy", isSpecialist: true, marketplaceHref: "/greenways/media-agent?q=What+sustainability+news+matters+for+restaurants%3F" }
  ];`;

const HELPERS = `  const HELPERS = [
    { id: "roster", icon: "🎼", name: "All agents", desc: "Who can help?", prompt: "Which Greenways agents can help me?" },
    { id: "grants_finance", icon: "🏛️", name: "Grants + finance", desc: "Stack funding", prompt: "What grants and finance options fit a restaurant upgrading kitchen equipment?" },
    { id: "products", icon: "♻️", name: "Find products", desc: "Catalog search", prompt: "Find water-saving commercial dishwashers for my restaurant" },
    { id: "deals", icon: "🏷️", name: "Deals", desc: "Tariffs & spotlights", prompt: "What product deals and energy tariffs are in the feed?" },
    { id: "equipment", icon: "🍳", name: "Equipment", desc: "Kit & renovation", prompt: "What efficient equipment upgrades should a restaurant consider?" },
    { id: "news", icon: "📰", name: "Media", desc: "News & policy", prompt: "What sustainability news matters for restaurants this month?" }
  ];`;

const extraCss = `
  .product-sample-img-wrap.specialist-icon {
    font-size: 1.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a3d28, #2d8f5f);
  }
  .specialist-card .product-sample-grant { color: var(--accent-lt); }
  .agent-handoff-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .agent-handoff-chip {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    text-decoration: none;
    color: var(--text);
    background: rgba(40, 167, 69, 0.18);
    border: 1px solid rgba(40, 167, 69, 0.45);
  }
  .agent-handoff-chip:hover {
    background: rgba(40, 167, 69, 0.32);
    border-color: var(--accent-lt);
  }
  .agent-handoff-hint {
    font-size: 0.68rem;
    color: var(--muted);
    margin-top: 4px;
    width: 100%;
  }`;

html = html.replace(
  '<title>Greenways Finance Agent — loans, BNPL &amp; green funding</title>',
  '<title>Greenways Guide — specialist agent conductor</title>'
);
html = html.replace('--bubble-in: #9a7b2e;', '--bubble-in: #1e5c3a;');
html = html.replace('--bubble-in-edge: #c9a961;', '--bubble-in-edge: #28a745;');
html = html.replace(
  '    .welcome-card p { font-size: 0.76rem; margin-bottom: 12px; }\n  }\n</style>',
  '    .welcome-card p { font-size: 0.76rem; margin-bottom: 12px; }\n  }' + extraCss + '\n</style>'
);

html = html.replace(/Finance Agent/g, 'Greenways Guide');
html = html.replace(/finance agent/g, 'Greenways Guide');
html = html.replace(/💶/g, '🎼');
html = html.replace(
  '<h1>Greenways Guide</h1>\n          <p>Funding, energy prices &amp; the case for efficient upgrades</p>',
  '<h1>Greenways Guide</h1>\n          <p>Hub conductor — routes you to the right specialist agent</p>'
);
html = html.replace(
  'aria-label="Finance &amp; product showcase"',
  'aria-label="Specialist agent roster"'
);
html = html.replace('Finance &amp; upgrade picks', 'Specialist agents');
html = html.replace('Tap a photo — finance finder or marketplace', 'Tap a card — open full chat on their page');
html = html.replace(
  /<h2>Ask the Greenways Guide<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*\n\s*<div class="profile-nudge"/,
  `<h2>Ask the Greenways Guide</h2>
          <p>I route your question to the best specialist — <strong>Grants</strong>, <strong>Finance</strong>, <strong>Equipment</strong>, <strong>Products</strong>, <strong>Deals</strong>, or <strong>Media</strong> — and link you to their full chat.</p>
          <div class="welcome-tags">
            <button type="button" class="welcome-tag" data-prompt="What grants and finance options fit a restaurant upgrading kitchen equipment?">Grants + finance</button>
            <button type="button" class="welcome-tag" data-prompt="Find water-saving commercial dishwashers for my restaurant">Find products</button>
            <button type="button" class="welcome-tag" data-prompt="What product deals and energy tariffs are in the feed?">Deals &amp; tariffs</button>
            <button type="button" class="welcome-tag" data-prompt="Which Greenways agents can help me?">List all agents</button>
          </div>
        </div>
      </div>

    <div class="profile-nudge"`
);
html = html.replace(
  'placeholder="Ask about finance, energy prices, payback, BNPL, green loans…"',
  'placeholder="Ask anything — grants, finance, equipment, products, deals, news…"'
);
html = html.replace(
  /<aside class="guide-sidebar"[\s\S]*?<\/aside>/,
  `<aside class="guide-sidebar" aria-label="Specialist agents">
    <div class="sidebar-section">
      <div class="sidebar-label">Specialist chats</div>
      <p style="font-size:0.72rem;color:var(--muted);line-height:1.45;">Open a dedicated agent for deeper conversation.</p>
      <a class="sidebar-link" href="/greenways/grants-agent" target="_top" rel="noopener">Grants Agent →</a>
      <a class="sidebar-link" href="/greenways/finance-agent" target="_top" rel="noopener">Finance Agent →</a>
      <a class="sidebar-link" href="/greenways/equipment-agent" target="_top" rel="noopener">Equipment Agent →</a>
      <a class="sidebar-link" href="/greenways/sustainable-products-agent" target="_top" rel="noopener">Sustainable Products →</a>
      <a class="sidebar-link" href="/greenways/deals-agent" target="_top" rel="noopener">Deals Agent →</a>
      <a class="sidebar-link" href="/greenways/media-agent" target="_top" rel="noopener">Media Agent →</a>
    </div>
    <div class="helper-list" id="helper-list"></div>
    <div class="status-bar" id="status-bar">Ready · orchestrator routing</div>
  </aside>`
);

html = html.replace(/const STATIC_PRODUCT_SAMPLES = \[[\s\S]*?\];/, STATIC_ROSTER);
html = html.replace(/const HELPERS = \[[\s\S]*?\];/, HELPERS);
html = html.replace('gw-finance-agent-session-v1', 'gw-guide-agent-session-v1');
html = html.replace('/api/finance-agent/', '/api/guide-agent/');

html = html.replace(
  /function renderProductCards\(samples\) \{[\s\S]*?\n  \}/,
  `function handoffHref(h) {
    const base = apiBase();
    const path = h.href || "";
    const q = h.prompt ? "?q=" + encodeURIComponent(h.prompt) : "";
    if (path.startsWith("http")) return path + q;
    if (base) return base + path + q;
    return path + q;
  }

  function agentHandoffChipsHtml(handoffs) {
    if (!Array.isArray(handoffs) || !handoffs.length) return "";
    const chips = handoffs.map(function (h) {
      return '<a class="agent-handoff-chip" href="' + escapeHtml(handoffHref(h)) + '" target="_top" rel="noopener">' + escapeHtml(h.name || h.id) + "</a>";
    }).join("");
    return '<div class="agent-handoff-chips" aria-label="Open specialist agent">' + chips + '</div><div class="agent-handoff-hint">Opens the specialist chat with your question</div>';
  }

  function renderProductCards(samples) {
    if (!Array.isArray(samples) || !samples.length) return "";
    return samples.slice(0, 6).map(function (p) {
      const name = escapeHtml(p.name || p.id || "Agent");
      const rawName = String(p.name || p.id || "this agent");
      const href = escapeHtml(p.marketplaceHref || "/greenways/grants-agent");
      const askPrompt = "Route my question to " + rawName;
      if (p.isSpecialist || p.icon) {
        const icon = escapeHtml(p.icon || "•");
        const meta = escapeHtml(p.label || p.subcategory || "Specialist");
        return (
          '<div class="product-sample-card specialist-card">' +
          '<a class="product-sample-link" href="' + href + '" target="_top" rel="noopener" style="text-decoration:none;color:inherit;display:flex;flex:1;min-width:0">' +
          '<div class="product-sample-img-wrap specialist-icon">' + icon + "</div>" +
          '<div class="product-sample-body">' +
          '<span class="product-sample-name">' + name + "</span>" +
          '<span class="product-sample-meta">' + meta + "</span>" +
          '<span class="product-sample-grant">Open chat →</span>' +
          "</div></a>" +
          '<button type="button" class="product-ask-btn" data-prompt="' + escapeHtml(askPrompt) + '">Ask via Guide</button>' +
          "</div>"
        );
      }
      const img = p.imageUrl ? '<img src="' + escapeHtml(p.imageUrl) + '" alt="" loading="lazy">' : '<span aria-hidden="true">📦</span>';
      const grantLabel = (p.topGrants && p.topGrants[0]) ? escapeHtml(p.topGrants[0]) : "Specialist";
      const meta = escapeHtml(p.label || p.subcategory || "Agent");
      return (
        '<div class="product-sample-card">' +
        '<a class="product-sample-link" href="' + href + '" target="_top" rel="noopener" style="text-decoration:none;color:inherit;display:flex;flex:1;min-width:0">' +
        '<div class="product-sample-img-wrap">' + img + "</div>" +
        '<div class="product-sample-body">' +
        '<span class="product-sample-name">' + name + "</span>" +
        '<span class="product-sample-meta">' + meta + "</span>" +
        '<span class="product-sample-grant">' + grantLabel + "</span>" +
        "</div></a>" +
        '<button type="button" class="product-ask-btn" data-prompt="' + escapeHtml(askPrompt) + '">Ask via Guide</button>' +
        "</div>"
      );
    }).join("");
  }`
);

html = html.replace(
  /function followUpChips\(intentId, profile, question\) \{[\s\S]*?\n  \}/,
  `function followUpChips(intentId, profile, question) {
    const pool = [
      { label: "All agents", prompt: "Which Greenways agents can help me?" },
      { label: "Grants + finance", prompt: "What grants and finance options fit a restaurant upgrading kitchen equipment?" },
      { label: "Find products", prompt: "Find water-saving commercial dishwashers for my restaurant" },
      { label: "Deals", prompt: "What product deals and energy tariffs are in the feed?" }
    ];
    if (/grant|scheme/i.test(String(question || ""))) {
      pool.unshift({ label: "Grants Agent", prompt: "What grants fit a restaurant upgrading kitchen equipment?" });
    }
    if (/finance|loan|bnpl/i.test(String(question || ""))) {
      pool.unshift({ label: "Finance Agent", prompt: "What finance options exist for restaurant equipment upgrades?" });
    }
    const items = pool.slice(0, 4);
    const chips = items.map(function (item) {
      return '<button type="button" class="follow-up-chip" data-prompt="' + escapeHtml(item.prompt) + '">' + escapeHtml(item.label) + "</button>";
    }).join("");
    return '<div class="follow-up-chips" aria-label="Suggested follow-ups">' + chips + "</div>";
  }`
);

html = html.replace(
  /function quickReplyChips\(intentId, profile\) \{[\s\S]*?\n  \}/,
  `function quickReplyChips(intentId, profile) {
    return [
      { label: "Grants + finance", prompt: "What grants and finance options fit a restaurant upgrading kitchen equipment?" },
      { label: "Find products", prompt: "Find water-saving commercial dishwashers for my restaurant" },
      { label: "Equipment", prompt: "What efficient equipment upgrades should a restaurant consider?" },
      { label: "List agents", prompt: "Which Greenways agents can help me?" }
    ];
  }`
);

html = html.replace(
  /function sourceLabel\(source\) \{[\s\S]*?\n  \}/,
  `function sourceLabel(source) {
    if (source === "orchestrator") return "routed answer";
    if (source === "llm") return "AI enhanced";
    return "guide routing";
  }`
);

html = html.replace(
  `    const tail =
      schemeChipsHtml(payload.suggestions || []) +
      followUpChips(intentId, profile, payload.question || lastQuestion) +
      '<span class="source-pill">' + escapeHtml(src) + "</span>";`,
  `    const tail =
      schemeChipsHtml(payload.suggestions || []) +
      agentHandoffChipsHtml(payload.agentHandoffs || []) +
      followUpChips(intentId, profile, payload.question || lastQuestion) +
      '<span class="source-pill">' + escapeHtml(src) + "</span>";`
);

html = html.replace(
  /function isProductGrantsQuestion[\s\S]*?function getProfile/,
  `function getProfile`
);

html = html.replace(
  'Could not reach the Greenways Guide. Deploy /api/guide-agent to Render for live answers.',
  'Could not reach the Greenways Guide. Deploy /api/guide-agent to Render for live answers.'
);

html = html.replace(
  /if \(isProductGrantsQuestion\(q\)\) \{[\s\S]*?setStatus\("Offline answer · sample products shown", "warn"\);\s*\} else \{/,
  'if (false) {} else {'
);

html = html.replace(
  /function profileNudgePrompt\(profile\) \{[\s\S]*?\n  \}/,
  `function profileNudgePrompt(profile) {
    const sector = profile.sector || "restaurant";
    const region = profile.region || "nl";
    return "What grants and finance options fit a " + sector + " in " + region + " upgrading kitchen equipment?";
  }`
);

html = html.replace(
  /card\.innerHTML =[\s\S]*?'<button type="button" class="welcome-tag" data-prompt="Where is the Greenways finance finder portal\?">Open finance finder<\/button>' \+/,
  `card.innerHTML =
      '<h2>Ask the Greenways Guide</h2>' +
      '<p>I route your question to the best specialist and link you to their full chat.</p>' +
      '<div class="welcome-tags">' +
      '<button type="button" class="welcome-tag" data-prompt="What grants and finance options fit a restaurant upgrading kitchen equipment?">Grants + finance</button>' +
      '<button type="button" class="welcome-tag" data-prompt="Find water-saving commercial dishwashers for my restaurant">Find products</button>' +
      '<button type="button" class="welcome-tag" data-prompt="What product deals and energy tariffs are in the feed?">Deals &amp; tariffs</button>' +
      '<button type="button" class="welcome-tag" data-prompt="Which Greenways agents can help me?">List all agents</button>' +`
);

html = html.replace('samples?limit=3', 'samples?limit=6');

fs.writeFileSync(dest, html);
console.log('Wrote', dest, '(' + html.length + ' bytes)');
