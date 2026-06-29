const path = require('path');
const fs = require('fs/promises');
const { loadIntentsFrom, matchIntent } = require('./greenways-agent-shared');

const intentsPath = path.join(__dirname, '..', 'data', 'guide-agent-intents.json');
const rosterPath = path.join(__dirname, '..', 'data', 'guide-agent-roster.json');

const SPECIALIST_LOADERS = {
  grants: () => require('./grants-agent-knowledge'),
  finance: () => require('./finance-agent-knowledge'),
  equipment: () => require('./equipment-agent-knowledge'),
  products: () => require('./sustainable-products-agent-knowledge'),
  deals: () => require('./deals-agent-knowledge'),
  media: () => require('./media-agent-knowledge')
};

const ROUTE_TOKENS = {
  grants: ['grant', 'scheme', 'subsidy', 'mia', 'vamil', 'isde', 'deadline', 'funding'],
  finance: ['finance', 'loan', 'bnpl', 'payback', 'roi', 'warmtefonds', 'bmkb', 'energy price', 'tariff cost', '€/kwh'],
  equipment: ['equipment', 'deep dive', 'renovation', 'insulation', 'marketplace', 'combi', 'steamer', 'hvac', 'retrofit'],
  products: ['find', 'water saving', 'aerator', 'dishwasher', 'refrigerat', 'catalog', 'sust_', 'gas saving', 'efficient'],
  deals: ['deal', 'tariff', 'ticker', 'spotlight', 'switch supplier', 'weekly offer', 'deals feed'],
  media: ['news', 'video', 'policy', 'edition', 'sustainability news', 'tech news'],
  systems: ['systems agent', 'health check', 'verify selected', 'stale feed', 'server status', 'deploy']
};

let rosterCache = null;

async function loadRoster() {
  if (rosterCache) return rosterCache;
  try {
    const raw = await fs.readFile(rosterPath, 'utf8');
    rosterCache = JSON.parse(raw);
    return rosterCache;
  } catch (_) {
    rosterCache = { specialists: [], staffOnly: [] };
    return rosterCache;
  }
}

function allRosterEntries(roster) {
  return [...(roster.specialists || []), ...(roster.staffOnly || [])];
}

function findRosterEntry(roster, id) {
  return allRosterEntries(roster).find((r) => r.id === id) || null;
}

function scoreAgent(question, profile, agentId) {
  const q = String(question || '').toLowerCase();
  const tokens = ROUTE_TOKENS[agentId] || [];
  let score = 0;
  tokens.forEach((token) => {
    if (q.includes(token)) score += token.length >= 6 ? 3 : 2;
  });
  if (/\bgrants?\b|\bschemes?\b|\bsubsid/.test(q) && agentId === 'grants') score += 8;
  if (/\bdeals?\b|\btariffs?\b|\bspotlight/.test(q) && agentId === 'deals') score += 8;
  if (/\bnews\b|\bbriefing\b|\bvideo/.test(q) && agentId === 'media') score += 8;
  if (/\bfinance\b|\bbnpl\b|\bloans?\b|\bpayback/.test(q) && agentId === 'finance') score += 8;
  if (/\bfind\b|\bcatalog\b|\bwater saving/.test(q) && agentId === 'products') score += 6;
  if (profile.focus === 'energy' && (agentId === 'finance' || agentId === 'deals')) score += 2;
  if (profile.focus === 'equipment' && (agentId === 'equipment' || agentId === 'products')) score += 2;
  if (profile.focus === 'building' && agentId === 'equipment') score += 2;
  if (agentId === 'systems') score = Math.max(0, score - 5);
  return score;
}

function rankAgents(question, profile, roster, forcedId) {
  const ids = Object.keys(SPECIALIST_LOADERS);
  if (forcedId && ids.includes(forcedId)) {
    return [{ id: forcedId, score: 100, entry: findRosterEntry(roster, forcedId) }];
  }
  const ranked = ids
    .map((id) => ({
      id,
      score: scoreAgent(question, profile, id),
      entry: findRosterEntry(roster, id)
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked;
}

function buildHandoffs(roster, ranked, question) {
  return ranked.slice(0, 3).map((row) => {
    const entry = row.entry || findRosterEntry(roster, row.id);
    return {
      id: row.id,
      name: entry?.name || row.id,
      href: entry?.path || `/greenways/${row.id}-agent`,
      prompt: question || entry?.prompt || ''
    };
  });
}

function formatHandoffBlock(handoffs) {
  if (!handoffs.length) return '';
  const lines = handoffs.map(
    (h) => `- **${h.name}** — ${h.href}${h.prompt ? ` (continue with your question)` : ''}`
  );
  return `\n\n**Continue with a specialist:**\n${lines.join('\n')}`;
}

function buildOverviewAnswer(roster, tip) {
  const lines = (roster.specialists || []).map(
    (s) => `- ${s.icon || '•'} **${s.name}** — ${s.label} → ${s.path}`
  );
  return {
    answer:
      `**Greenways Guide** — your conductor for the specialist agents:\n\n` +
      `${lines.join('\n')}\n\n` +
      `Ask anything in plain language. I'll route to the best expert and link you to their full chat.\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: (roster.specialists || []).slice(0, 6).map((s) => ({
      id: s.id,
      name: s.name,
      href: s.path,
      prompt: s.prompt
    }))
  };
}

function buildHandoffOnlyAnswer(entry, question, tip) {
  return {
    answer:
      `**${entry?.name || 'Systems Agent'}** handles this — staff-oriented health checks (read-only verify).\n\n` +
      `Open the specialist for the full panel: ${entry?.path || '/greenways/systems-agent'}\n\n` +
      (question ? `_Your question: "${question}"_\n\n` : '') +
      `_${tip}_`,
    suggestions: [],
    agentHandoffs: entry
      ? [{ id: entry.id, name: entry.name, href: entry.path, prompt: question || entry.prompt }]
      : [],
    routedTo: entry ? [entry.id] : [],
    primaryAgent: entry?.id || null
  };
}

async function delegateToSpecialist(agentId, question, profile, roster, ranked) {
  const loader = SPECIALIST_LOADERS[agentId];
  if (!loader) return null;

  const svc = loader();
  const specialist = await svc.answerFromKnowledge(question, profile);
  const handoffs = buildHandoffs(roster, ranked, question);
  const entry = findRosterEntry(roster, agentId);
  const name = entry?.name || agentId;

  if (!specialist?.answer) {
    return {
      answer:
        `**Greenways Guide** → **${name}**\n\n` +
        `I matched **${name}** but need a more specific question. Try one of their welcome prompts on ${entry?.path || ''}.` +
        formatHandoffBlock(handoffs) +
        `\n\n_${(await loadIntentsFrom(intentsPath)).staticTips?.[0] || ''}_`,
      agentHandoffs: handoffs,
      routedTo: ranked.map((r) => r.id),
      primaryAgent: agentId,
      suggestions: [],
      productSamples: typeof svc.getDefaultProductSamples === 'function' ? await svc.getDefaultProductSamples(3) : []
    };
  }

  const secondary =
    ranked[1] && ranked[1].score >= ranked[0].score * 0.55
      ? `\n\n_Also relevant: **${ranked[1].entry?.name || ranked[1].id}** — use a handoff chip below._`
      : '';

  return {
    answer:
      `**Greenways Guide** → **${name}**\n\n` +
      specialist.answer +
      secondary +
      formatHandoffBlock(handoffs),
    agentHandoffs: handoffs,
    routedTo: ranked.map((r) => r.id),
    primaryAgent: agentId,
    suggestions: specialist.suggestions || [],
    productSamples: specialist.productSamples || []
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const roster = await loadRoster();
  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);

  if (intent?.answerType === 'overview' || intent?.answerType === 'roster') {
    const result = buildOverviewAnswer(roster, tip);
    result.source = 'orchestrator';
    result.intentId = intent.id;
    return result;
  }

  if (intent?.answerType === 'handoff_only') {
    const entry = findRosterEntry(roster, intent.agent) || roster.staffOnly?.[0];
    const result = buildHandoffOnlyAnswer(entry, question, tip);
    result.source = 'orchestrator';
    result.intentId = intent.id;
    return result;
  }

  const forced = intent?.answerType === 'route' ? intent.agent : null;
  const qLower = String(question || '').toLowerCase();
  let routeAgent = forced;
  if (forced === 'equipment' && /\bgrants?\b|\bschemes?\b|\bsubsid/.test(qLower)) routeAgent = 'grants';
  if (forced === 'products' && /\bgrants?\b|\bschemes?\b/.test(qLower)) routeAgent = 'grants';

  const fullRanked = rankAgents(question, profile, roster, null);
  const {
    evaluateProject,
    shouldCollaborateAsTeam,
    buildTeamOrchestraResponse
  } = require('./guide-agent-team-evaluate');

  if (shouldCollaborateAsTeam(question, profile, fullRanked)) {
    try {
      const team = await evaluateProject(question, profile);
      const result = buildTeamOrchestraResponse(team);
      result.intentId = intent?.id || 'team_collaboration';
      return result;
    } catch (err) {
      console.warn('Orchestra team collaboration fallback:', err.message);
    }
  }

  const ranked = routeAgent ? rankAgents(question, profile, roster, routeAgent) : fullRanked;

  if (!ranked.length) {
    const overview = buildOverviewAnswer(roster, tip);
    overview.answer =
      `I couldn't pick a specialist yet — try being more specific (grants, finance, equipment, products, deals, or news).\n\n` +
      overview.answer;
    overview.source = 'orchestrator';
    overview.intentId = 'fallback';
    return overview;
  }

  const primaryId = ranked[0].id;
  const result = await delegateToSpecialist(primaryId, question, profile, roster, ranked);
  if (result) {
    result.source = 'orchestrator';
    result.intentId = intent?.id || `route_${primaryId}`;
    result.responseMode = 'route';
  }
  return result;
}

async function getDefaultRosterCards(limit = 6) {
  const roster = await loadRoster();
  return (roster.specialists || []).slice(0, limit).map((s) => ({
    id: s.id,
    name: s.name,
    subcategory: s.label,
    imageUrl: s.imageUrl || '',
    label: s.label,
    icon: s.icon,
    marketplaceHref: s.path + (s.prompt ? `?q=${encodeURIComponent(s.prompt)}` : ''),
    isSpecialist: true
  }));
}

module.exports = {
  answerFromKnowledge,
  getDefaultRosterCards,
  loadRoster,
  rankAgents,
  findRosterEntry
};
