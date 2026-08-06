/**
 * Restaurant CSR KPI map — thin answers for Cheryce / Guide.
 * Source: data/restaurant-csr-kpi-map.json (Excel stays operator-side).
 */

const path = require('path');
const fs = require('fs');

const mapPath = path.join(__dirname, '..', 'data', 'restaurant-csr-kpi-map.json');

const AGENT_LINKS = {
  andrieus: { id: 'grants', name: 'Andrieus', href: '/greenways/grants-agent' },
  vincent: { id: 'finance', name: 'Vincent', href: '/greenways/finance-agent' },
  artemis: { id: 'equipment', name: 'Artemis', href: '/greenways/equipment-agent' },
  zara: { id: 'deals', name: 'Zara', href: '/greenways/deals-agent' },
  cheryce: { id: 'media', name: 'Cheryce', href: '/greenways/media-agent' },
  zyanne: { id: 'products', name: 'Zyanne', href: '/greenways/sustainable-products-agent' },
  edwardo: { id: 'systems', name: 'Edwardo', href: '/greenways/systems-agent' },
  guide: { id: 'guide', name: 'Guide', href: '/greenways/orchestra-hub' }
};

let mapCache = null;

function loadCsrMap() {
  if (mapCache) return mapCache;
  try {
    mapCache = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } catch (_) {
    mapCache = { pillars: [], kpis: [], agentRouting: {}, meta: {} };
  }
  return mapCache;
}

function envKpis(map) {
  return (map.kpis || []).filter((k) => k.pillar === 'environmental');
}

function kpiLine(k) {
  const gri = (k.gri || []).join(', ');
  const target = k.sampleTarget != null ? ` · illustrative target ${k.sampleTarget} ${k.unit || ''}`.trim() : '';
  return `- **${k.name}** (${gri}) — ${k.description}${target}`;
}

function handoffFromPrimary(nameKey, prompt) {
  const row = AGENT_LINKS[nameKey];
  if (!row) return null;
  return { id: row.id, name: row.name, href: row.href, prompt: prompt || '' };
}

/**
 * Cheryce conversational CSR overview with specialist handoffs.
 */
function buildCsrOverviewAnswer(question, profile = {}, tip = '') {
  const map = loadCsrMap();
  const pillars = map.pillars || [];
  const env = envKpis(map).slice(0, 6);
  const weights = map.meta?.defaultPillarWeights || {};

  const pillarLines = pillars.map((p) => {
    const w = weights[p.id] != null ? weights[p.id] : p.defaultWeightPct;
    return `- **${p.name}** (${w}%) — ${p.why}`;
  });

  const tipLine = tip ? `\n\n_${tip}_` : '';

  const answer =
    `**Restaurant CSR in four pillars** — a practical scorecard language for hospitality, aligned with **GRI** disclosures and useful as you prepare for **CSRD**-style reporting.\n\n` +
    `Greenways is strongest on the **Environmental** (and parts of **Economic**) pillar: measure → cut waste → fund upgrades → prove results. Ethical and philanthropic KPIs matter for a full CSR story — we acknowledge them and leave HR / community compliance to your team.\n\n` +
    `**Pillars (default materiality weights)**\n${pillarLines.join('\n')}\n\n` +
    `**Environmental KPIs we can help you act on**\n${env.map(kpiLine).join('\n')}\n\n` +
    `**How to use this**\n` +
    `- Score maturity **0–5** per KPI when you have data (0 = not measured → 5 = verified).\n` +
    `- Sample targets in our map are **illustrative** — calibrate for your concept and country.\n` +
    `- Ask Edwardo about metering for energy/water intensity; Vincent for payback and carbon cost; Andrieus for funding; Zyanne for packaging and sourcing products; Zara for green tariffs.\n` +
    tipLine;

  const blocks = [
    {
      type: 'stat',
      label: 'CSR pillars',
      value: String(pillars.length || 4),
      hint: 'Environmental · Ethical · Philanthropic · Economic'
    },
    {
      type: 'stat',
      label: 'Mapped KPIs',
      value: String((map.kpis || []).length || 22),
      hint: 'GRI-linked hospitality indicators'
    },
    {
      type: 'stat',
      label: 'Env. weight',
      value: `${weights.environmental || 40}%`,
      hint: 'Default materiality for restaurants'
    },
    {
      type: 'module',
      items: [
        {
          moduleId: 'energy-monitoring',
          title: 'Importance of energy monitoring',
          description: 'Why measure first — consumer guide before upgrades',
          href: './Importance%20of%20Energy%20Monitoring.html',
          theme: 'media',
          agentName: 'Cheryce',
          openSize: 'near-full'
        },
        {
          moduleId: 'restaurant-energy-monitoring-guide',
          title: 'Restaurant energy monitoring guide',
          description: 'UK & EU hospitality walkthrough with calculator and case studies',
          href: './restaurant-energy-monitoring-guide.html',
          theme: 'media',
          agentName: 'Cheryce',
          openSize: 'near-full'
        }
      ]
    }
  ];

  const agentHandoffs = [
    handoffFromPrimary('edwardo', 'How do we meter energy and water intensity for CSR reporting?'),
    handoffFromPrimary('vincent', 'How do energy savings and carbon intensity affect payback?'),
    handoffFromPrimary('andrieus', 'What grants support metering and efficiency for our CSR plan?'),
    handoffFromPrimary('zyanne', 'Find packaging and water-saving products for our CSR KPIs'),
    handoffFromPrimary('zara', 'Show green electricity tariffs to raise renewable share')
  ].filter(Boolean);

  const suggestions = [
    'What is GRI?',
    'Explain energy intensity for restaurants',
    'What is CSRD?',
    'Show sustainability map examples'
  ];

  return {
    answer,
    blocks,
    agentHandoffs: agentHandoffs.slice(0, 4),
    suggestions,
    productSamples: [],
    intentId: 'csr_overview',
    source: 'knowledge',
    awareness: [
      'Sample KPI targets are templates — adjust for covers, cuisine, and region.',
      'Ethical KPIs (wages, H&S, diversity) need your HR data — we do not invent compliance advice.',
      'GRI mapping supports disclosure language; it is not a substitute for a formal assurance engagement.'
    ]
  };
}

module.exports = {
  loadCsrMap,
  buildCsrOverviewAnswer
};
