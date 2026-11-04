/**
 * Consumer Agents Dashboard — agent-first highlights + wire tablets + gallery seeds.
 */
const path = require('path');
const fs = require('fs/promises');
const { buildGrantsWireSnapshot } = require('./grants-wire-snapshot');
const { buildDealsWireSnapshot } = require('./deals-wire-snapshot');
const { buildFinanceWireSnapshot } = require('./finance-wire-snapshot');

const HIGHLIGHTS_PATH = path.join(__dirname, '..', 'data', 'greenways-agent-highlights.json');
const ROSTER_PATH = path.join(__dirname, '..', 'data', 'greenways-agent-roster.json');
const DEALS_FEED_PATH = path.join(__dirname, '..', 'data', 'deals-feed.json');
const CALENDAR_DEMO_PATH = path.join(__dirname, '..', 'data', 'greenways-calendar-demo.json');
const VIDEO_PICKS_PATH = path.join(__dirname, '..', 'data', 'agents-dashboard-video-picks.json');
const VIDEO_KNOWLEDGE_PATH = path.join(__dirname, '..', 'data', 'greenways-video-knowledge.json');

function stripMarkdown(text) {
  return String(text || '')
    .replace(/:::profile-context[\s\S]*/gi, '')
    .replace(/:::[\w-]+[\s\S]*?:::/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function teaser(text, max = 200) {
  const plain = stripMarkdown(text);
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}…`;
}

async function loadJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function tabletClosing(row) {
  if (!row) return null;
  return {
    lane: 'CLOSING SOON',
    tag: row.tag || 'DEADLINE',
    title: row.title,
    body: row.region ? `${String(row.region).toUpperCase()} · Ask before the window moves.` : 'Verify official eligibility before the window moves.',
    dateLabel: row.deadlineLabel || row.deadline || '',
    daysLeft: row.daysLeft != null ? row.daysLeft : null
  };
}

function tabletWatch(row) {
  if (!row) return null;
  return {
    lane: 'WATCH / COMING UP',
    tag: row.tag || 'WATCH',
    title: row.title,
    body: row.detail || row.summary || '',
    href: row.href || ''
  };
}

function buildTabletsForAgent(agent, { grantsSnap, dealsSnap, financeSnap }) {
  const slug = agent.slug;
  const tablets = [];

  if (slug === 'grants-agent' && grantsSnap?.brief) {
    const cs = tabletClosing(grantsSnap.brief.closingSoon?.[0]);
    const watch = tabletWatch(grantsSnap.brief.comingSoon?.[0]);
    if (cs) tablets.push(cs);
    if (watch) tablets.push(watch);
  }

  if (slug === 'deals-agent' && dealsSnap) {
    const row = dealsSnap.newThisMonth?.[0] || dealsSnap.showcase?.[0];
    if (row) {
      tablets.push({
        lane: 'DEALS FEED',
        tag: String(row.category || 'deal').toUpperCase(),
        title: row.title || row.label || 'Deal spotlight',
        body: row.cta || `${dealsSnap.totalDeals || 0} live rows across energy, water, and sustainability.`,
        href: '/greenways/deals-agent?q=What+deals+are+new+this+month'
      });
    }
  }

  if (slug === 'finance-agent' && financeSnap) {
    const focus = financeSnap.ticker?.allEnergy?.find((r) => r.code === 'NL') || financeSnap.ticker?.allEnergy?.[0];
    const price = focus?.priceEurMwh;
    tablets.push({
      lane: 'PRICES WIRE',
      tag: financeSnap.ticker?.isLive ? 'LIVE' : 'GUIDE',
      title: focus ? `${focus.name} wholesale guide` : 'Wholesale market scan',
      body:
        price != null
          ? `About €${Number(price).toFixed(1)}/MWh day-ahead guide — wholesale ≠ your retail bill.`
          : 'Pair tariff compare with finance desk and savings projection.',
      href: '/greenways/finance-agent?q=Energy+prices+for+my+restaurant'
    });
  }

  if (slug === 'media-agent' && agent.highlight) {
    tablets.push({
      lane: 'NEWS & STORIES',
      tag: 'CHERYCE',
      title: agent.highlight.question,
      body: teaser(agent.highlight.answer, 180),
      href: `${agent.path}?q=${encodeURIComponent(agent.highlight.question)}`
    });
  }

  if (slug === 'equipment-agent' && agent.highlight) {
    tablets.push({
      lane: 'EQUIPMENT',
      tag: 'UPGRADE',
      title: agent.highlight.question,
      body: teaser(agent.highlight.answer, 180),
      href: `${agent.path}?q=${encodeURIComponent(agent.highlight.question)}`
    });
  }

  if (slug === 'sustainable-products-agent' && agent.highlight) {
    tablets.push({
      lane: 'PRODUCTS',
      tag: 'FIND',
      title: agent.highlight.question,
      body: teaser(agent.highlight.answer, 180),
      href: `${agent.path}?q=${encodeURIComponent(agent.highlight.question)}`
    });
  }

  if (slug === 'systems-agent' && agent.highlight) {
    tablets.push({
      lane: 'SYSTEMS',
      tag: 'OPS',
      title: agent.highlight.question,
      body: teaser(agent.highlight.answer, 180),
      href: `${agent.path}?q=${encodeURIComponent(agent.highlight.question)}`
    });
  }

  if (!tablets.length && agent.highlight) {
    tablets.push({
      lane: 'THIS WEEK',
      tag: 'HIGHLIGHT',
      title: agent.highlight.question,
      body: teaser(agent.highlight.answer, 200),
      href: `${agent.path}?q=${encodeURIComponent(agent.highlight.question)}`
    });
  }

  return tablets.slice(0, 2);
}

function buildGallery(dealsFeed, highlightAgents) {
  const cards = [];
  const seen = new Set();

  (dealsFeed.deals || []).forEach((deal) => {
    if (!deal.imageUrl || seen.has(deal.imageUrl)) return;
    seen.add(deal.imageUrl);
    cards.push({
      id: deal.id,
      title: deal.title,
      line: deal.line || deal.category,
      imageUrl: deal.imageUrl,
      href: deal.href || '/greenways/deals-agent',
      agentSlug: (deal.stackHints && deal.stackHints[0]) || 'deals-agent',
      kind: 'deal'
    });
  });

  highlightAgents.slice(0, 3).forEach((a) => {
    if (!a.imageUrl || seen.has(a.imageUrl)) return;
    seen.add(a.imageUrl);
    cards.push({
      id: `agent-${a.slug}`,
      title: a.name,
      line: a.roleLine || a.shortLabel,
      imageUrl: a.imageUrl,
      href: a.path,
      agentSlug: a.slug,
      kind: 'agent'
    });
  });

  return cards.slice(0, 9);
}

function buildReminderSeeds(calendarDemo) {
  const events = Array.isArray(calendarDemo?.events) ? calendarDemo.events : [];
  return events.slice(0, 6).map((ev) => ({
    id: ev.id,
    date: ev.date,
    title: ev.title,
    summary: ev.summary || '',
    askAgent: ev.askAgent || '',
    askPrompt: ev.askPrompt || '',
    source: ev.source || 'calendar'
  }));
}

function youtubeThumb(videoId) {
  const id = String(videoId || '').trim();
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

function catalogMatch(catalog, knowledgeId, ptr) {
  const vid = ptr?.videoId;
  return (catalog || []).find(
    (v) =>
      v.id === knowledgeId ||
      (vid && (v.videoId === vid || v.youtubeId === vid || String(v.videoUrl || '').includes(vid)))
  );
}

function mergeVideoCard(ptr, pick, apiRow) {
  if (!ptr) return null;
  const videoId = String(ptr.videoId || apiRow?.videoId || apiRow?.youtubeId || '').trim();
  const title = ptr.title || apiRow?.title || 'Greenways video';
  return {
    id: ptr.id,
    title,
    summary: teaser(ptr.summary || apiRow?.description || apiRow?.summary, 160),
    takeaways: Array.isArray(ptr.takeaways) ? ptr.takeaways.slice(0, 2) : [],
    videoId,
    youtubeId: videoId,
    videoUrl:
      apiRow?.videoUrl ||
      (videoId ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : ''),
    thumbnail: apiRow?.thumbnail || apiRow?.imageUrl || youtubeThumb(videoId),
    category: apiRow?.category || 'media',
    lane: pick.lane === 'highlight' ? 'highlight' : 'suggestion',
    kind: 'suggestion',
    suggestedBy: pick.suggestedBy || 'Cheryce',
    agentSlug: pick.agentSlug || 'media-agent'
  };
}

async function buildVideoSuggestions() {
  const [picksCfg, knowledge] = await Promise.all([
    loadJson(VIDEO_PICKS_PATH, { picks: [] }),
    loadJson(VIDEO_KNOWLEDGE_PATH, { items: [] })
  ]);
  const knowledgeById = new Map((knowledge.items || []).map((item) => [item.id, item]));

  let catalog = [];
  try {
    const { getVideosForAgent } = require('./wix-media-service');
    const result = await getVideosForAgent();
    catalog = result.videos || [];
  } catch (_) {
    /* knowledge + YouTube thumbs still work offline */
  }

  const suggestions = (picksCfg.picks || [])
    .map((pick) => {
      const ptr = knowledgeById.get(pick.knowledgeId);
      if (!ptr || !ptr.videoId) return null;
      return mergeVideoCard(ptr, pick, catalogMatch(catalog, pick.knowledgeId, ptr));
    })
    .filter(Boolean);

  return {
    suggestions,
    links: {
      mediaAgent: '/greenways/media-agent',
      videoDesk: '/greenways/media-video-desk',
      askPrompt: 'Show restaurant and kitchen energy saving videos'
    }
  };
}

async function buildAgentsDashboardOverview() {
  const [highlights, roster, dealsFeed, calendarDemo, grantsSnap, dealsSnap, financeSnap, videos] =
    await Promise.all([
      loadJson(HIGHLIGHTS_PATH, { agents: [], meta: {} }),
      loadJson(ROSTER_PATH, { agents: [] }),
      loadJson(DEALS_FEED_PATH, { deals: [] }),
      loadJson(CALENDAR_DEMO_PATH, { events: [] }),
      buildGrantsWireSnapshot().catch(() => null),
      buildDealsWireSnapshot().catch(() => null),
      buildFinanceWireSnapshot().catch(() => null),
      buildVideoSuggestions()
    ]);

  const rosterBySlug = new Map((roster.agents || []).map((a) => [a.slug, a]));
  const wireCtx = { grantsSnap, dealsSnap, financeSnap };

  const agents = (highlights.agents || []).map((row) => {
    const base = rosterBySlug.get(row.slug) || {};
    const tablets = buildTabletsForAgent(row, wireCtx);
    return {
      slug: row.slug,
      id: row.id,
      name: row.name,
      shortLabel: row.shortLabel,
      roleLine: row.roleLine || base.shortLabel || '',
      imageUrl: row.imageUrl || base.imageUrl,
      imageObjectPosition: base.imageObjectPosition || '',
      path: row.path || base.path || `/greenways/${row.slug}`,
      accent: row.accent || '#3dcf7a',
      skills: row.skills || [],
      tablets,
      chatHref:
        row.highlight?.question
          ? `${row.path || base.path}?q=${encodeURIComponent(row.highlight.question)}`
          : row.path || base.path,
      highlight: row.highlight
        ? {
            question: row.highlight.question,
            teaser: teaser(row.highlight.answer, 140)
          }
        : null
    };
  });

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    meta: {
      title: 'Agents Dashboard',
      weekLabel: highlights.meta?.weekLabel || '',
      profileNote: highlights.meta?.profileNote || '',
      trust: {
        grants: grantsSnap?.meta?.trustLine || null,
        deals: dealsSnap?.source || 'deals-feed.json',
        finance: financeSnap?.meta?.trustLine || null
      }
    },
    agents,
    gallery: buildGallery(dealsFeed, highlights.agents || []),
    reminderSeeds: buildReminderSeeds(calendarDemo),
    videos,
    links: {
      customerHub: '/greenways/customer-hub',
      organisationDesk: '/greenways/organisation-desk',
      orchestraHub: '/greenways/orchestra-hub',
      agentsHighlights: '/greenways/agents-highlights',
      mediaAgent: videos?.links?.mediaAgent || '/greenways/media-agent',
      videoDesk: videos?.links?.videoDesk || '/greenways/media-video-desk'
    }
  };
}

module.exports = {
  buildAgentsDashboardOverview,
  buildVideoSuggestions,
  stripMarkdown,
  teaser
};
