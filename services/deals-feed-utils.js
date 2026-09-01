/**
 * Shared deals feed v2 helpers — spotlights, stack hints, validation constants.
 */

const LANES = ['energy', 'water', 'sustainability'];

const TRUST_VALUES = ['live', 'curated', 'illustrative'];

const STACK_HINT_AGENTS = {
  'grants-agent': {
    id: 'grants-agent',
    name: 'Andrieus',
    label: 'Check grants',
    href: '/greenways/grants-agent',
    defaultPrompt: 'grants and schemes for this upgrade'
  },
  'finance-agent': {
    id: 'finance-agent',
    name: 'Vincent',
    label: 'Payback & prices',
    href: '/greenways/finance-agent',
    defaultPrompt: 'payback case and energy prices'
  },
  'equipment-agent': {
    id: 'equipment-agent',
    name: 'Artemis',
    label: 'Equipment fit',
    href: '/greenways/equipment-agent',
    defaultPrompt: 'equipment upgrade and renovation options'
  }
};

const DESK_TAB_BY_LANE = {
  energy: 'energy',
  water: 'water',
  sustainability: 'hub'
};

function normalizeDealHref(href) {
  const raw = String(href || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `/HTMLS%20GWM%20GWB/${raw.replace(/^\.\//, '')}`;
}

function newestDealPerLane(deals) {
  const picks = [];
  for (const lane of LANES) {
    const laneDeals = (deals || []).filter((d) => String(d.category || '').toLowerCase() === lane);
    laneDeals.sort((a, b) => {
      const dateCmp = String(b.addedAt || '').localeCompare(String(a.addedAt || ''));
      if (dateCmp !== 0) return dateCmp;
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    });
    if (laneDeals[0]) picks.push(laneDeals[0]);
  }
  return picks;
}

function dealToWireSpotlight(deal) {
  const category = String(deal.category || 'sustainability').toLowerCase();
  return {
    id: deal.id,
    title: deal.title || deal.id,
    kicker: `${category} · ${deal.region || 'EU'}`,
    summary: deal.line || '',
    deskTab: DESK_TAB_BY_LANE[category] || 'hub',
    href: normalizeDealHref(deal.href),
    trust: deal.trust || 'curated',
    sourceName: deal.sourceName || '',
    stackHints: Array.isArray(deal.stackHints) ? deal.stackHints : []
  };
}

function buildFeedSpotlights(deals) {
  return newestDealPerLane(deals).map(dealToWireSpotlight);
}

function stackHintsToHandoffs(stackHints, question = '') {
  const out = [];
  const seen = new Set();
  for (const hint of stackHints || []) {
    const key = String(hint || '').trim();
    if (!key || seen.has(key)) continue;
    const row = STACK_HINT_AGENTS[key];
    if (!row) continue;
    seen.add(key);
    out.push({
      id: row.id,
      name: row.name,
      href: row.href,
      prompt: String(question || '').trim() || row.defaultPrompt
    });
  }
  return out;
}

function handoffsFromDeals(deals, question = '') {
  const seen = new Set();
  const out = [];
  for (const deal of deals || []) {
    for (const handoff of stackHintsToHandoffs(deal.stackHints, question)) {
      if (seen.has(handoff.id)) continue;
      seen.add(handoff.id);
      out.push(handoff);
    }
  }
  return out;
}

function dedupeHandoffs(rows) {
  const seen = new Set();
  return (rows || []).filter((row) => {
    const id = String(row.id || '');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function countByLane(deals) {
  const counts = { energy: 0, water: 0, sustainability: 0 };
  for (const deal of deals || []) {
    const cat = String(deal.category || 'sustainability').toLowerCase();
    if (counts[cat] != null) counts[cat] += 1;
    else counts.sustainability += 1;
  }
  return counts;
}

module.exports = {
  LANES,
  TRUST_VALUES,
  STACK_HINT_AGENTS,
  normalizeDealHref,
  newestDealPerLane,
  dealToWireSpotlight,
  buildFeedSpotlights,
  stackHintsToHandoffs,
  handoffsFromDeals,
  dedupeHandoffs,
  countByLane
};
