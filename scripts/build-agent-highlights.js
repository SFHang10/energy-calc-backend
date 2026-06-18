/**
 * Weekly snapshot of Greenways agent highlights — one grounded /ask per specialist.
 * Run: npm run build:agent-highlights
 * Schedule on Render/cron weekly after deploy (optional).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'greenways-agent-highlights.json');
const ROSTER = path.join(ROOT, 'data', 'greenways-agent-roster.json');

const PROFILE = { region: 'nl', sector: 'restaurant', focus: 'energy' };

const AGENT_META = {
  grants: {
    roleLine: 'Grants & schemes',
    theme: 'grants',
    accent: '#007bff',
    skills: ['Schemes', 'Compare', 'EU & NL funding', 'Product grants']
  },
  finance: {
    roleLine: 'Finance, prices & payback',
    theme: 'finance',
    accent: '#c9a961',
    skills: ['BNPL', 'Green loans', 'Energy prices', 'Payback']
  },
  equipment: {
    roleLine: 'Equipment & renovation',
    theme: 'equipment',
    accent: '#28a745',
    skills: ['Marketplace', 'Deep dive', 'Insulation', 'Renovation']
  },
  deals: {
    roleLine: 'Deals & spotlights',
    theme: 'deals',
    accent: '#ff8c1a',
    skills: ['Tariffs', 'Deals feed', 'Water deals', 'Ticker']
  },
  media: {
    roleLine: 'News & media',
    theme: 'media',
    accent: '#a78bfa',
    skills: ['Daily brief', 'Newsletters', 'Sustainability map', 'Video']
  },
  products: {
    roleLine: 'Sustainable products',
    theme: 'products',
    accent: '#22d3ee',
    skills: ['Water lane', 'Electricity lane', 'Gas lane', 'Catalog']
  },
  systems: {
    roleLine: 'Systems & monitoring',
    theme: 'systems',
    accent: '#fbbf24',
    skills: ['Monitoring', 'Sensors', 'Dashboards', 'Ops verify']
  }
};

const AGENT_LOADERS = [
  {
    id: 'grants',
    slug: 'grants-agent',
    question: 'What restaurant grants fit kitchen equipment in the Netherlands?',
    load: () => require(path.join(ROOT, 'services/grants-agent-knowledge'))
  },
  {
    id: 'finance',
    slug: 'finance-agent',
    question: 'How do energy prices affect upgrade payback for my restaurant?',
    load: () => require(path.join(ROOT, 'services/finance-agent-knowledge'))
  },
  {
    id: 'equipment',
    slug: 'equipment-agent',
    question: 'Where should I start with insulation and equipment upgrades?',
    load: () => require(path.join(ROOT, 'services/equipment-agent-knowledge'))
  },
  {
    id: 'deals',
    slug: 'deals-agent',
    question: 'What interesting deals are in the feed right now?',
    load: () => require(path.join(ROOT, 'services/deals-agent-knowledge'))
  },
  {
    id: 'media',
    slug: 'media-agent',
    question: "What's in today's sustainability news briefing?",
    load: () => require(path.join(ROOT, 'services/media-agent-knowledge'))
  },
  {
    id: 'products',
    slug: 'sustainable-products-agent',
    question: 'Show water-saving products for a restaurant kitchen',
    load: () => require(path.join(ROOT, 'services/sustainable-products-agent-knowledge'))
  },
  {
    id: 'systems',
    slug: 'systems-agent',
    question: 'How do I use the sensor dashboard and buildings overview?',
    load: () => require(path.join(ROOT, 'services/systems-agent-knowledge'))
  }
];

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function weekLabel(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function trimSuggestions(list, max) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, max).map((row) => ({
    id: row.id,
    title: row.title || row.name,
    region: row.region,
    type: row.type,
    description: row.description ? String(row.description).slice(0, 220) : undefined
  }));
}

function trimBlocks(blocks, maxItems) {
  if (!Array.isArray(blocks)) return [];
  return blocks.slice(0, 4).map((block) => {
    if (!block || typeof block !== 'object') return block;
    const copy = { ...block };
    if (Array.isArray(copy.items)) {
      copy.items = copy.items.slice(0, maxItems).map((item) => ({
        moduleId: item.moduleId,
        title: item.title,
        description: item.description ? String(item.description).slice(0, 160) : undefined,
        label: item.label,
        href: item.href,
        name: item.name
      }));
    }
    if (Array.isArray(copy.videos)) {
      copy.videos = copy.videos.slice(0, maxItems).map((v) => ({
        title: v.title,
        label: v.label
      }));
    }
    return copy;
  });
}

function trimAnswer(text, maxLen) {
  const s = String(text || '').trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1).trim() + '…';
}

async function build() {
  const roster = JSON.parse(fs.readFileSync(ROSTER, 'utf8'));
  const rosterById = Object.fromEntries((roster.agents || []).map((a) => [a.id, a]));
  const now = new Date();
  const agents = [];

  for (const spec of AGENT_LOADERS) {
    const meta = AGENT_META[spec.id] || {};
    const row = rosterById[spec.id] || {};
    const mod = spec.load();
    const hit = await mod.answerFromKnowledge(spec.question, PROFILE);
    if (!hit || !hit.answer) {
      throw new Error(`No answer for ${spec.id}: ${spec.question}`);
    }

    agents.push({
      id: spec.id,
      slug: spec.slug,
      name: row.name || spec.id,
      shortLabel: row.shortLabel || meta.roleLine,
      imageUrl: row.imageUrl,
      path: row.path || `/greenways/${spec.slug}`,
      roleLine: meta.roleLine,
      theme: meta.theme,
      accent: meta.accent,
      skills: meta.skills || [],
      highlight: {
        question: spec.question,
        intentId: hit.intentId || null,
        source: hit.source || 'knowledge',
        answer: trimAnswer(hit.answer, 1200),
        suggestions: trimSuggestions(hit.suggestions, 3),
        blocks: trimBlocks(hit.blocks, 2)
      }
    });
    console.log('OK', spec.id, '→', hit.intentId || '(no intent)');
  }

  const payload = {
    updatedAt: now.toISOString(),
    meta: {
      title: 'Greenways Agents Highlights',
      description:
        'Weekly snapshot of what each Transition Agent is answering — refreshed from live knowledge, not stale demos.',
      weekKey: isoWeekKey(now),
      weekLabel: `Week snapshot · ${weekLabel(now)}`,
      profileNote: 'Sample profile: Netherlands · restaurant · energy focus'
    },
    agents
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('Wrote', OUT, '—', agents.length, 'agents');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
