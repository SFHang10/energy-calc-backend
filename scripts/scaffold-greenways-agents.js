/**
 * Clone greenways-grants-agent.html into Finance / Equipment / Deals agents
 * with distinct accent themes and agent-specific copy.
 *
 * Run: node scripts/scaffold-greenways-agents.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'HTMLS GWM GWB', 'greenways-grants-agent.html');
const OUT_DIR = path.join(ROOT, 'HTMLS GWM GWB');

const AGENTS = [
  {
    slug: 'finance',
    filename: 'greenways-finance-agent.html',
    title: 'Greenways Finance Agent — loans, BNPL &amp; green funding',
    avatar: '💶',
    brandName: 'Greenways Finance Agent',
    brandSub: 'Grants, BNPL, equipment finance &amp; green loans',
    sessionKey: 'gw-finance-agent-session-v1',
    agentLabel: 'Finance Agent',
    apiPath: '/api/finance-agent',
    bannerLabel: 'Finance &amp; upgrade picks',
    bannerHint: 'Tap a photo — finance finder or marketplace',
    welcomeTitle: 'Ask the Finance Agent',
    welcomeBody:
      'Answers cover the <strong>finance finder</strong> tabs — grants, BNPL, equipment finance, green loans, and EU programmes — plus scheme matches from <strong>schemes.json</strong>.',
    welcomeTags: [
      ['BNPL for kitchen equipment', 'What BNPL options exist for commercial kitchen equipment?'],
      ['Green loans NL', 'What green loans and BMKB-Groen routes fit a Dutch restaurant?'],
      ['Solar finance', 'How do I finance solar panels for my restaurant?'],
      ['Open finance finder', 'Where is the Greenways finance finder portal?']
    ],
    placeholder: 'Ask about BNPL, green loans, equipment finance, solar funding…',
    showcaseAria: 'Finance &amp; product showcase',
    askBtnLabel: 'Ask about finance',
    askPromptPrefix: 'What finance options apply to',
    compareHidden: true,
    sourceKnowledge: 'finance knowledge',
    helpers: [
      { id: 'grants', icon: '🏛️', name: 'Grants tab', desc: 'Non-repayable schemes', prompt: 'What grants tab options should a restaurant know about in the finance finder?' },
      { id: 'bnpl', icon: '💳', name: 'BNPL', desc: 'Pay-later paths', prompt: 'Explain BNPL options for restaurant equipment on Greenways.' },
      { id: 'equip', icon: '🍳', name: 'Equipment finance', desc: 'Leases & HP', prompt: 'What equipment finance options exist for commercial kitchens?' },
      { id: 'loans', icon: '🌿', name: 'Green loans', desc: 'BMKB & banks', prompt: 'What green loan programmes fit a Netherlands restaurant?' },
      { id: 'portal', icon: '🔗', name: 'Finance finder', desc: 'Full portal', prompt: 'Where is the finance finder and what tabs does it have?' }
    ],
    sidebarLinks: [
      ['./finance-finder-restaurant.html', 'Finance finder (restaurant) →'],
      ['./savings.html', 'Savings hub — Financial assistance →'],
      ['./Full%20Schemes%20Portal%20Restaurant.html', 'Restaurant schemes portal →'],
      ['/greenways/grants-agent', 'Grants Agent →']
    ],
    theme: {
      '--bg': '#0c0f0a',
      '--panel': '#121810',
      '--panel2': '#1a2216',
      '--bubble-in': '#9a7b2e',
      '--bubble-in-edge': '#c9a961',
      '--bubble-out': '#1a2218',
      '--border': 'rgba(201, 169, 97, 0.24)',
      '--accent': '#c9a961',
      '--accent-lt': '#e8c974',
      '--send': '#b8860b'
    },
    avatarGradient: '#8b6914, var(--accent-lt)',
    avatarShadow: 'rgba(201, 169, 97, 0.35)',
    mainGradient: '#121810 0%, #0a0e08 100%'
  },
  {
    slug: 'equipment',
    filename: 'greenways-equipment-agent.html',
    title: 'Greenways Equipment Agent — marketplace &amp; deep dive',
    avatar: '🍳',
    brandName: 'Greenways Equipment Agent',
    brandSub: 'Marketplace alternatives, specs &amp; savings paths',
    sessionKey: 'gw-equipment-agent-session-v1',
    agentLabel: 'Equipment Agent',
    apiPath: '/api/equipment-agent',
    bannerLabel: 'Efficient equipment picks',
    bannerHint: 'Tap a product — marketplace or deep dive',
    welcomeTitle: 'Ask the Equipment Agent',
    welcomeBody:
      'Answers cover marketplace ETL products, equipment deep dive comparisons, and sustainable alternatives — same product data as <strong>products-with-grants.json</strong>.',
    welcomeTags: [
      ['Combi steamer upgrade', 'What efficient combi steamer alternatives exist for a restaurant?'],
      ['Refrigeration grants', 'Which grants apply to commercial refrigeration upgrades?'],
      ['Deep dive tool', 'How does the restaurant equipment deep dive work?'],
      ['Kitchen HVAC', 'What ventilation and HVAC upgrades should a restaurant consider?']
    ],
    placeholder: 'Ask about kitchen equipment, refrigeration, deep dive, alternatives…',
    showcaseAria: 'Efficient marketplace equipment',
    askBtnLabel: 'Ask about this equipment',
    askPromptPrefix: 'Tell me about upgrades and alternatives for',
    compareHidden: true,
    sourceKnowledge: 'equipment knowledge',
    helpers: [
      { id: 'kitchen', icon: '🔥', name: 'Kitchen equipment', desc: 'Ovens & steamers', prompt: 'What kitchen equipment upgrades save the most energy in a restaurant?' },
      { id: 'cold', icon: '❄️', name: 'Refrigeration', desc: 'Fridges & freezers', prompt: 'What refrigeration alternatives are on the Greenways marketplace?' },
      { id: 'hvac', icon: '💨', name: 'HVAC', desc: 'Ventilation', prompt: 'What HVAC and extraction upgrades fit restaurant kitchens?' },
      { id: 'grants', icon: '🏛️', name: 'Grants on equipment', desc: 'Funding overlay', prompt: 'How do grants attach to marketplace equipment products?' },
      { id: 'deep', icon: '📊', name: 'Deep dive', desc: 'Compare & project', prompt: 'How do I use the equipment deep dive and savings projection?' }
    ],
    sidebarLinks: [
      ['./restaurant-equipment-deep-dive.html', 'Equipment deep dive →'],
      ['./equipment_intelligence_tool.html', 'Equipment intelligence tool →'],
      ['./sustainable_product_deal_finder_portal.html', 'Sustainable product finder →'],
      ['/greenways/grants-agent', 'Grants Agent →']
    ],
    theme: {
      '--bg': '#0a120e',
      '--panel': '#0e1a14',
      '--panel2': '#132218',
      '--bubble-in': '#1e7e34',
      '--bubble-in-edge': '#28a745',
      '--bubble-out': '#152018',
      '--border': 'rgba(40, 167, 69, 0.24)',
      '--accent': '#28a745',
      '--accent-lt': '#5dd879',
      '--send': '#1e7e34'
    },
    avatarGradient: '#145a32, var(--accent-lt)',
    avatarShadow: 'rgba(40, 167, 69, 0.35)',
    mainGradient: '#0e1812 0%, #08100c 100%'
  },
  {
    slug: 'deals',
    filename: 'greenways-deals-agent.html',
    title: 'Greenways Deals Agent — energy, water &amp; sustainability',
    avatar: '🏷️',
    brandName: 'Greenways Deals Agent',
    brandSub: 'Electricity &amp; gas packages + product deals — from deals-feed.json',
    sessionKey: 'gw-deals-agent-session-v1',
    agentLabel: 'Deals Agent',
    apiPath: '/api/deals-agent',
    bannerLabel: 'Energy &amp; deal picks',
    bannerHint: 'Tariffs, packages &amp; offers — tap to open portal',
    welcomeTitle: 'Ask the Deals Agent',
    welcomeBody:
      'Covers <strong>electricity &amp; gas packages</strong> (European energy portal) and <strong>product deals</strong> from <strong>deals-feed.json</strong>. Full shell: <strong>Deals.html</strong>.',
    welcomeTags: [
      ['Compare tariffs', 'How do I compare energy tariffs and packages for my restaurant?'],
      ['NL restaurant rates', 'What NL business and hospitality energy rates are in the feed?'],
      ['UK green tariff', 'What UK green tariff deals are available?'],
      ['Deals.html &amp; portals', 'Where is the full Greenways Deals page and energy portal?']
    ],
    placeholder: 'Ask about energy tariffs, NL/UK packages, water savings, product deals…',
    showcaseAria: 'Featured deals from feed',
    askBtnLabel: 'Ask about this deal',
    askPromptPrefix: 'Tell me more about the deal',
    compareHidden: true,
    sourceKnowledge: 'deals knowledge',
    grantLabelFallback: 'tags',
    helpers: [
      { id: 'compare', icon: '⚡', name: 'Compare tariffs', desc: 'EU packages', prompt: 'How do I compare energy tariffs and packages for my restaurant?' },
      { id: 'nl', icon: '🇳🇱', name: 'NL restaurant rates', desc: 'Hospitality energy', prompt: 'What NL business and hospitality energy rates are in the feed?' },
      { id: 'green', icon: '🌿', name: 'Green tariff', desc: 'Renewable supply', prompt: 'What UK and EU green tariff deals are available?' },
      { id: 'water', icon: '💧', name: 'Water deals', desc: 'Saving kits', prompt: 'What water saving deals and finders are available?' },
      { id: 'page', icon: '🏷️', name: 'Deals.html', desc: 'Full page shell', prompt: 'Where is the full Greenways Deals page and energy portal?' }
    ],
    sidebarLinks: [
      ['./Deals.html', 'Full Deals page →'],
      ['./european_energy_deals_portal.html', 'Energy portal (tariffs) →'],
      ['./deals-ticker-hub.html', 'Deals ticker hub →'],
      ['./water-saving-finder.html', 'Water Saving Finder →'],
      ['./sustainable_product_deal_finder_portal.html', 'Product deal finder →']
    ],
    theme: {
      '--bg': '#0a1018',
      '--panel': '#0e1524',
      '--panel2': '#121c2e',
      '--bubble-in': '#2d8cff',
      '--bubble-in-edge': '#4da6ff',
      '--bubble-out': '#141e30',
      '--border': 'rgba(77, 166, 255, 0.24)',
      '--accent': '#ff8c1a',
      '--accent-lt': '#ffb04d',
      '--send': '#4da6ff'
    },
    avatarGradient: '#cc6a00, var(--accent-lt)',
    avatarShadow: 'rgba(255, 140, 26, 0.35)',
    mainGradient: '#0e1420 0%, #080c14 100%'
  },
  {
    slug: 'systems',
    filename: 'greenways-systems-agent.html',
    title: 'Greenways Systems Agent — data freshness &amp; health',
    avatar: '🔧',
    brandName: 'Greenways Systems Agent',
    brandSub: 'Grants · products · catalog · deals — verify status',
    sessionKey: 'gw-systems-agent-session-v1',
    agentLabel: 'Systems Agent',
    apiPath: '/api/systems-agent',
    bannerLabel: 'System status',
    bannerHint: 'Tap a row · use Verify selected in sidebar',
    welcomeTitle: 'Ask the Systems Agent',
    welcomeBody:
      'Lightweight <strong>health &amp; freshness</strong> checks — grants vs <code>schemes.json</code>, product export dates, sustainable catalog, deals feed, and news KB. <strong>Verify selected</strong> re-checks without running build scripts.',
    welcomeTags: [
      ['Full status', 'Give me a full system health overview'],
      ['Grants sync', 'Are grants and schemes in sync with products?'],
      ['Product export', 'Is the product grants overlay up to date?'],
      ['How verify works', 'How does the sync verify button work?']
    ],
    placeholder: 'Ask about grants sync, product status, catalog freshness…',
    showcaseAria: 'System health status rows',
    askBtnLabel: 'Ask about this check',
    askPromptPrefix: 'Explain status for',
    compareHidden: true,
    sourceKnowledge: 'systems health',
    grantLabelFallback: 'tags',
    helpers: [
      { id: 'all', icon: '📊', name: 'Full status', desc: 'All checks', prompt: 'Give me a full system health overview' },
      { id: 'grants', icon: '🏛️', name: 'Grants sync', desc: 'schemes.json', prompt: 'Are grants and schemes in sync with products?' },
      { id: 'products', icon: '📦', name: 'Products', desc: 'Export overlay', prompt: 'Is the product grants overlay up to date?' },
      { id: 'catalog', icon: '♻️', name: 'Catalog', desc: 'sust_* rows', prompt: 'Is the sustainable products catalog up to date?' },
      { id: 'sync', icon: '🔄', name: 'Verify button', desc: 'Read-only', prompt: 'How does the sync verify button work?' }
    ],
    sidebarLinks: [
      ['./AGENTS.md', '../AGENTS.md — staff workflows →'],
      ['/health', '/health — API health →'],
      ['/greenways/grants-agent', 'Grants Agent →'],
      ['/greenways/sustainable-products-agent', 'Sustainable Products Agent →']
    ],
    theme: {
      '--bg': '#0f1114',
      '--panel': '#161a1f',
      '--panel2': '#1c2229',
      '--bubble-in': '#64748b',
      '--bubble-in-edge': '#94a3b8',
      '--bubble-out': '#1a1f26',
      '--border': 'rgba(148, 163, 184, 0.22)',
      '--accent': '#f59e0b',
      '--accent-lt': '#fbbf24',
      '--send': '#d97706'
    },
    avatarGradient: '#475569, var(--accent-lt)',
    avatarShadow: 'rgba(245, 158, 11, 0.3)',
    mainGradient: '#14181e 0%, #0a0c10 100%'
  },
  {
    slug: 'sustainable-products',
    filename: 'greenways-sustainable-products-agent.html',
    title: 'Greenways Sustainable Products Agent — water, electricity &amp; gas',
    avatar: '♻️',
    brandName: 'Greenways Sustainable Products Agent',
    brandSub: 'Water · electricity · gas — marketplace + catalog finders',
    sessionKey: 'gw-sustainable-products-agent-session-v1',
    agentLabel: 'Sustainable Products Agent',
    apiPath: '/api/sustainable-products-agent',
    bannerLabel: 'Efficient product picks',
    bannerHint: 'On Greenways &amp; market alternatives — tap to open',
    welcomeTitle: 'Ask the Sustainable Products Agent',
    welcomeBody:
      'One agent, <strong>three utility lanes</strong> — merges <strong>On Greenways</strong> marketplace (\`etl_*\`) and <strong>Market alternative</strong> catalog (\`sust_*\`) from the same API as the dashboard finders.',
    welcomeTags: [
      ['Water-saving dishwasher', 'Find water-saving commercial dishwashers for my restaurant'],
      ['Efficient refrigeration', 'What efficient refrigeration options are on Greenways?'],
      ['Gas cooking upgrades', 'What gas-saving fryer or wok upgrades are in the catalog?'],
      ['Open product finders', 'Where are the water and sustainable product finders?']
    ],
    placeholder: 'Ask about water, electricity, or gas-saving products…',
    showcaseAria: 'Sustainable product showcase by utility lane',
    askBtnLabel: 'Ask about this product',
    askPromptPrefix: 'Tell me about savings and alternatives for',
    compareHidden: true,
    sourceKnowledge: 'product finder knowledge',
    grantLabelFallback: 'tags',
    helpers: [
      { id: 'water', icon: '💧', name: 'Water lane', desc: 'Dishwashers & aerators', prompt: 'Find water-saving commercial dishwashers and aerators for my restaurant' },
      { id: 'elec', icon: '⚡', name: 'Electricity lane', desc: 'ETL & refrigeration', prompt: 'What efficient refrigeration and ETL products are on Greenways?' },
      { id: 'gas', icon: '🔥', name: 'Gas lane', desc: 'Wok & fryer', prompt: 'What gas-saving fryer or wok upgrades are in the catalog?' },
      { id: 'sources', icon: '🏷️', name: 'Two sources', desc: 'etl vs sust', prompt: 'Explain On Greenways vs Market alternative product sources' },
      { id: 'portal', icon: '🔗', name: 'Full finders', desc: 'Open pages', prompt: 'Where are the water and sustainable product finders?' }
    ],
    sidebarLinks: [
      ['./water-saving-finder.html', 'Water Saving Finder →'],
      ['./sustainable_product_deal_finder_portal.html', 'Sustainable Product Finder →'],
      ['./restaurant-equipment-deep-dive.html', 'Equipment deep dive →'],
      ['./equipment_intelligence_tool.html', 'Equipment intelligence tool →'],
      ['/greenways/equipment-agent', 'Equipment Agent →'],
      ['/greenways/deals-agent', 'Deals Agent →']
    ],
    theme: {
      '--bg': '#081418',
      '--panel': '#0c1e24',
      '--panel2': '#102a32',
      '--bubble-in': '#0891b2',
      '--bubble-in-edge': '#22d3ee',
      '--bubble-out': '#0f2228',
      '--border': 'rgba(34, 211, 255, 0.24)',
      '--accent': '#22d3ee',
      '--accent-lt': '#67e8f9',
      '--send': '#0891b2'
    },
    avatarGradient: '#0e7490, var(--accent-lt)',
    avatarShadow: 'rgba(34, 211, 255, 0.35)',
    mainGradient: '#0c1c22 0%, #060e12 100%'
  },
  {
    slug: 'media',
    filename: 'greenways-media-agent.html',
    title: 'Greenways Media Agent — news, video &amp; photos',
    avatar: '🎬',
    brandName: 'Greenways Media Agent',
    brandSub: 'Sustainability news, Wix videos &amp; site visuals',
    sessionKey: 'gw-media-agent-session-v1',
    agentLabel: 'Media Agent',
    apiPath: '/api/media-agent',
    bannerLabel: 'News &amp; media picks',
    bannerHint: 'Stories, videos &amp; photos — tap to open',
    welcomeTitle: 'Ask the Media Agent',
    welcomeBody:
      'Covers <strong>sustainability news</strong> from our knowledge base, <strong>Wix videos</strong> by topic, and <strong>photo</strong> cards linking to site pages.',
    welcomeTags: [
      ['Policy news', 'What EU policy news should restaurants know about?'],
      ['Restaurant videos', 'Show restaurant and kitchen energy saving videos'],
      ['Monthly roundup', 'Give me a sustainability news roundup'],
      ['Wix video library', 'What videos are in the Greenways Wix library?']
    ],
    placeholder: 'Ask about news, videos, policy, funding, photos…',
    showcaseAria: 'News, video and photo showcase',
    askBtnLabel: 'Ask about this',
    askPromptPrefix: 'Tell me more about',
    compareHidden: true,
    sourceKnowledge: 'media knowledge',
    grantLabelFallback: 'tags',
    helpers: [
      { id: 'policy', icon: '📜', name: 'Policy news', desc: 'EU & UK rules', prompt: 'What EU policy news should restaurants know about?' },
      { id: 'funding', icon: '💶', name: 'Funding news', desc: 'Horizon & grants', prompt: 'What funding and Horizon Europe news is on file?' },
      { id: 'video', icon: '🎬', name: 'Wix videos', desc: 'By topic', prompt: 'What videos are in the Greenways Wix library?' },
      { id: 'rest', icon: '🍳', name: 'Restaurant media', desc: 'Kitchen savings', prompt: 'Show restaurant and kitchen energy saving videos' },
      { id: 'news', icon: '📰', name: 'News pages', desc: 'Full roundups', prompt: 'Where are the sustainability news pages on Greenways?' }
    ],
    sidebarLinks: [
      ['./January%20Sustainable%20News%20Original%20.html', 'Sustainability news →'],
      ['./Sustainable%20References%20.HTML', 'Sustainable references →'],
      ['./Importance%20of%20Energy%20Monitoring.html', 'Energy monitoring guide →'],
      ['./water-saving-finder.html', 'Water saving finder →'],
      ['./deals-ticker-hub.html', 'Deals hub →']
    ],
    theme: {
      '--bg': '#100a18',
      '--panel': '#160e22',
      '--panel2': '#1c1230',
      '--bubble-in': '#7c3aed',
      '--bubble-in-edge': '#a855f7',
      '--bubble-out': '#1a1028',
      '--border': 'rgba(168, 85, 247, 0.24)',
      '--accent': '#a855f7',
      '--accent-lt': '#c084fc',
      '--send': '#7c3aed'
    },
    avatarGradient: '#5b21b6, var(--accent-lt)',
    avatarShadow: 'rgba(168, 85, 247, 0.35)',
    mainGradient: '#140e1e 0%, #0a0612 100%'
  }
];

function buildRootCss(theme) {
  return Object.entries(theme)
    .map(([k, v]) => `    ${k}: ${v};`)
    .join('\n');
}

function buildWelcomeTags(tags) {
  return tags
    .map(
      ([label, prompt]) =>
        `            <button type="button" class="welcome-tag" data-prompt="${prompt}">${label}</button>`
    )
    .join('\n');
}

function buildHelpers(helpers) {
  return helpers
    .map(
      (h) =>
        `    { id: "${h.id}", icon: "${h.icon}", name: "${h.name}", desc: "${h.desc}", prompt: "${h.prompt}" }`
    )
    .join(',\n');
}

function buildSidebarLinks(links) {
  return links
    .map(([href, label]) => {
      const isAbs = href.startsWith('/');
      const target = isAbs ? ' target="_top"' : ' target="_top"';
      return `      <a class="sidebar-link" href="${href}"${target} rel="noopener">${label}</a>`;
    })
    .join('\n');
}

function scaffoldAgent(src, agent) {
  let html = src;

  // Theme
  html = html.replace(
    /:root \{[\s\S]*?--radius: 14px;\n  \}/,
    `:root {\n${buildRootCss(agent.theme)}\n    --radius: 14px;\n  }`
  );
  html = html.replace(
    /background: linear-gradient\(135deg, #1d4ed8, var\(--accent-lt\)\)/,
    `background: linear-gradient(135deg, ${agent.avatarGradient})`
  );
  html = html.replace(
    /box-shadow: 0 0 16px rgba\(37, 99, 235, 0\.35\)/,
    `box-shadow: 0 0 16px ${agent.avatarShadow}`
  );
  html = html.replace(
    /background: linear-gradient\(180deg, #0d1528 0%, #0a101c 100%\)/,
    `background: linear-gradient(180deg, ${agent.mainGradient})`
  );

  // Branding & API
  html = html
    .replace(/Greenways Grants Agent — schemes &amp; funding/g, agent.title)
    .replace(/Greenways Grants Agent/g, agent.brandName)
    .replace(/Schemes, subsidies &amp; finance — from schemes\.json/g, agent.brandSub)
    .replace(/🏛️/g, agent.avatar)
    .replace(/gw-grants-agent-session-v1/g, agent.sessionKey)
    .replace(/Grants Agent/g, agent.agentLabel)
    .replace(/\/api\/grants-agent/g, agent.apiPath)
    .replace(/Grant-eligible marketplace picks/g, agent.bannerLabel)
    .replace(/Tap a product to view schemes on file/g, agent.bannerHint)
    .replace(/Ask the Grants Agent/g, agent.welcomeTitle)
    .replace(
      /<p>Answers are built from <strong>schemes\.json<\/strong>[\s\S]*?<\/p>/,
      `<p>${agent.welcomeBody}</p>`
    )
    .replace(
      /<div class="welcome-tags">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<div class="profile-nudge"/,
      `<div class="welcome-tags">\n${buildWelcomeTags(agent.welcomeTags)}\n          </div>\n        </div>\n      </div>\n\n    <div class="profile-nudge"`
    )
    .replace(
      /placeholder="Ask about grants, regions, equipment funding, NL schemes…"/,
      `placeholder="${agent.placeholder}"`
    )
    .replace(
      /aria-label="Grant-eligible marketplace products"/,
      `aria-label="${agent.showcaseAria}"`
    )
    .replace(/Ask about grants/g, agent.askBtnLabel)
    .replace(
      /What grants and schemes apply to /g,
      `${agent.askPromptPrefix} `
    )
    .replace(/schemes knowledge/g, agent.sourceKnowledge)
    .replace(/Could not reach the grants agent/g, `Could not reach the ${agent.slug} agent`)
    .replace(/Deploy \/api\/grants-agent/g, `Deploy ${agent.apiPath}`);

  // Compare dock hidden for non-grants agents
  if (agent.compareHidden) {
    html = html.replace(
      /<div class="compare-dock is-collapsed" id="compare-dock">[\s\S]*?<\/div>\s*\n\s*<div class="quick-reply-bar"/,
      '<div class="quick-reply-bar"'
    );
    // Remove compare-related JS chunks (minimal - leave dead code or strip)
    html = html.replace(/compareSelection[\s\S]*?compareRunBtn\.disabled[\s\S]*?;\n  \}/, '/* compare disabled */');
  }

  // Sidebar helpers section - replace helper list in script
  html = html.replace(
    /const HELPERS = \[[\s\S]*?\];/,
    `const HELPERS = [\n${buildHelpers(agent.helpers)}\n  ];`
  );

  // Sidebar links - find first sidebar-section with quick links
  const sidebarStart = html.indexOf('<aside class="guide-sidebar"');
  if (sidebarStart >= 0) {
    const linkBlock = html.match(
      /<a class="sidebar-link" href="\.\/Full%20Schemes%20Portal%20Restaurant\.html"[\s\S]*?<\/aside>/
    );
    if (linkBlock) {
      const newAside = linkBlock[0].replace(
        /<a class="sidebar-link"[\s\S]*?(?=<div class="sidebar-section">|<\/aside>)/,
        `${buildSidebarLinks(agent.sidebarLinks)}\n      `
      );
      html = html.replace(linkBlock[0], newAside);
    }
  }

  // Deals: grant chip label uses tags
  if (agent.grantLabelFallback === 'tags') {
    html = html.replace(
      /\(p\.grantsCount \? \(p\.grantsCount \+ " grant"/,
      '(p.topGrants && p.topGrants[0] ? escapeHtml(p.topGrants[0]) : (p.grantsCount ? (p.grantsCount + " grant"'
    );
  }

  // Remove scheme compare endpoint references in offline answers if any remain
  html = html.replace(/\/api\/grants-agent\/compare/g, `${agent.apiPath}/ask`);

  return html;
}

function main() {
  const only = process.argv[2];
  const src = fs.readFileSync(SRC, 'utf8');
  const agents = only ? AGENTS.filter((a) => a.slug === only) : AGENTS;
  if (!agents.length) {
    console.error('Unknown agent slug:', only);
    process.exitCode = 1;
    return;
  }
  for (const agent of agents) {
    const out = scaffoldAgent(src, agent);
    const outPath = path.join(OUT_DIR, agent.filename);
    fs.writeFileSync(outPath, out, 'utf8');
    console.log('Written', path.relative(ROOT, outPath));
  }
}

main();
