/**
 * Greenways Guide — parallel specialist briefings for one project question.
 * Returns journey-shaped lanes + synthesized action plan (no full HTML in prompts).
 */

const { loadRoster, rankAgents, findRosterEntry } = require('./guide-agent-knowledge');
const { summarizeJourney, buildHeuristicPlan } = require('./guide-agent-journey-summary');

const KNOWLEDGE_LOADERS = {
  grants: () => require('./grants-agent-knowledge'),
  finance: () => require('./finance-agent-knowledge'),
  equipment: () => require('./equipment-agent-knowledge'),
  products: () => require('./sustainable-products-agent-knowledge'),
  deals: () => require('./deals-agent-knowledge'),
  media: () => require('./media-agent-knowledge'),
  systems: () => require('./systems-agent-knowledge')
};

const MAX_LANES = 4;
const MIN_LANE_SCORE = 4;

/**
 * When true, Orchestra answers with parallel specialist lanes (no separate button).
 */
function shouldCollaborateAsTeam(question, profile, ranked) {
  if (!ranked || ranked.length < 2) return false;

  const q = String(question || '').toLowerCase();
  const top = ranked[0];
  const second = ranked[1];

  const projectSignals =
    /upgrade|retrofit|renovation|evaluate|evaluation|project plan|whole building|wok line|kitchen line/.test(
      q
    ) || (/\binsulation\b/.test(q) && /\b(equipment|kitchen|wok|upgrade)/.test(q));

  if (projectSignals) return true;

  const strongLanes = ranked.filter((row) => row.score >= MIN_LANE_SCORE);
  if (strongLanes.length < 2) return false;

  const grantOnly =
    /\b(grants?|schemes?|subsidy|subsid)/.test(q) &&
    !/\b(upgrade|retrofit|renovation|evaluate|insulation|payback|finance loan|equipment upgrade)/.test(q);
  if (grantOnly && top.id === 'grants' && top.score >= 8) return false;

  const newsOnly = /\b(news|briefing|video|edition)\b/.test(q) && top.id === 'media' && top.score >= 8;
  if (newsOnly && (!second || second.score < 6)) return false;

  const dealsFeedOnly =
    /\b(deals? feed|spotlight|ticker)\b/.test(q) && top.id === 'deals' && (!second || second.score < 6);
  if (dealsFeedOnly) return false;

  const topicHints = [
    'grant',
    'scheme',
    'equipment',
    'insulation',
    'payback',
    'finance',
    'tariff',
    'renovation',
    'monitor',
    'capex'
  ];
  const topicCount = topicHints.filter((token) => q.includes(token)).length;
  const competitiveTop =
    second && second.score >= MIN_LANE_SCORE && top.score > 0 && second.score >= top.score * 0.55;

  if (topicCount >= 2 && competitiveTop) return true;
  if (strongLanes.length >= 3) return true;

  return false;
}

function buildTeamOrchestraResponse(teamResult) {
  const names = (teamResult.specialists || []).join(', ');
  const intro = names
    ? `This touches more than one lane — **${names}** weighed in together on your question. Tap a portrait to go deeper with whoever fits best.`
    : 'A few specialists weighed in together on your question. Tap a portrait to continue in their chat.';

  return {
    answer: intro,
    responseMode: 'team',
    source: 'orchestrator_team',
    primaryAgent: teamResult.agentIds?.[0] || null,
    routedTo: teamResult.agentIds || [],
    plan: teamResult.plan || '',
    planSource: teamResult.planSource || 'heuristic',
    lanes: teamResult.lanes || [],
    turns: teamResult.turns || [],
    specialists: teamResult.specialists || [],
    agentIds: teamResult.agentIds || [],
    laneCount: teamResult.laneCount || 0,
    agentHandoffs: (teamResult.lanes || []).map((lane) => ({
      id: lane.id,
      name: lane.agentName,
      href: lane.path,
      prompt: lane.question
    })),
    suggestions: [],
    productSamples: []
  };
}

function normalizeProfile(profile = {}) {
  return {
    region: String(profile.region || '').trim(),
    sector: String(profile.sector || '').trim(),
    focus: String(profile.focus || '').trim()
  };
}

function pickEvaluationAgents(question, profile, roster) {
  const ranked = rankAgents(question, profile, roster, null);
  const byId = new Map();

  ranked
    .filter((row) => row.score >= MIN_LANE_SCORE)
    .slice(0, MAX_LANES)
    .forEach((row) => byId.set(row.id, row));

  const q = String(question || '').toLowerCase();
  const isProject =
    /upgrade|retrofit|renovation|evaluate|evaluation|project|kitchen|equipment|capex|payback|insulation|grant|finance/.test(
      q
    );

  if (isProject || byId.size < 2) {
    const core = ['equipment', 'grants', 'finance'];
    if (/tariff|deal|energy price|supplier|wholesale/.test(q)) core.push('deals');
    if (/water|fixture|catalog|product finder/.test(q)) core.push('products');
    if (/monitor|sensor|baseline|dashboard/.test(q)) core.push('systems');
    if (/news|policy|case study|map/.test(q)) core.push('media');

    for (const id of core) {
      if (byId.size >= MAX_LANES) break;
      if (byId.has(id)) continue;
      const entry = findRosterEntry(roster, id);
      if (entry) byId.set(id, { id, score: 12, entry });
    }
  }

  return [...byId.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_LANES);
}

function extractHighlights(blocks) {
  const highlights = [];
  for (const block of blocks || []) {
    if (block.type === 'module' && Array.isArray(block.items)) {
      for (const item of block.items.slice(0, 2)) {
        highlights.push({
          kind: 'module',
          label: String(item.title || 'Open tool').trim(),
          href: String(item.href || '').trim(),
          moduleId: String(item.moduleId || '').trim()
        });
      }
    }
    if (block.type === 'link' && Array.isArray(block.items)) {
      for (const item of block.items.slice(0, 1)) {
        highlights.push({
          kind: 'link',
          label: String(item.title || 'Open link').trim(),
          href: String(item.url || item.href || '').trim()
        });
      }
    }
  }
  return highlights.filter((h) => h.label).slice(0, 4);
}

function compactSummary(answer, maxLen = 360) {
  let text = String(answer || '')
    .replace(/:::agent-profile[\s\S]*?:::/g, '')
    .replace(/:::profile-context[\s\S]*?:::/g, '')
    .replace(/\*\*Greenways Guide\*\* → \*\*[^*]+\*\*\n\n/g, '')
    .replace(/\n\n\*\*Continue with a specialist:\*\*[\s\S]*$/m, '')
    .replace(/\n\n\*\*What the linked tools cover\*\*[\s\S]*?(?=\n\n\*\*Worked example:|\n\n_|$)/m, '')
    .replace(/\n\n\*\*Worked example:\*\*[^\n]+/g, '')
    .replace(/\n\n_Also relevant:[\s\S]*?(?=\n\n\*\*Continue|\n\n_|$)/m, '')
    .replace(/\n\n_[^_]+_\s*$/m, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > maxLen) text = `${text.slice(0, maxLen - 1).trim()}…`;
  return text;
}

function tailoredQuestion(agentId, question) {
  const q = String(question || '').trim();
  if (!q) return q;

  const slices = {
    grants: `Which grants and schemes could support this project? ${q}`,
    finance: `What finance options, payback, and energy price context apply to this project? ${q}`,
    equipment: `What equipment upgrades and renovation steps fit this project? ${q}`,
    products: `Which sustainable product alternatives should we compare for this project? ${q}`,
    deals: `Which deals, tariffs, or supplier offers are relevant to this project? ${q}`,
    media: `What news, policy, or case-study context matters for this project? ${q}`,
    systems: `What monitoring, sensors, or baseline data should we set up for this project? ${q}`
  };

  return slices[agentId] || q;
}

async function briefSpecialist(agentId, question, profile, roster, row) {
  const loader = KNOWLEDGE_LOADERS[agentId];
  if (!loader) return null;

  const entry = row.entry || findRosterEntry(roster, agentId);
  const attempts = [question, tailoredQuestion(agentId, question)];
  if (entry?.prompt && !attempts.includes(entry.prompt)) {
    attempts.push(`${entry.prompt} Context: ${question}`);
  }

  try {
    const svc = loader();
    let result = null;

    for (const attempt of attempts) {
      const hit = await svc.answerFromKnowledge(attempt, profile);
      const summary = compactSummary(hit?.answer);
      if (summary) {
        result = { hit, summary, asked: attempt };
        break;
      }
    }

    if (!result) return null;

    return {
      slug: entry?.slug || `${agentId}-agent`,
      id: agentId,
      agentName: entry?.name || agentId,
      label: entry?.label || '',
      imageUrl: entry?.imageUrl || '',
      path: entry?.path || `/greenways/${agentId}-agent`,
      question: result.asked,
      summary: result.summary,
      intentId: result.hit.intentId || '',
      highlights: extractHighlights(result.hit.blocks),
      score: row.score
    };
  } catch (err) {
    console.warn(`Team evaluate: ${agentId} briefing failed:`, err.message);
    return null;
  }
}

/**
 * @param {string} question
 * @param {object} profile
 * @returns {Promise<object>}
 */
async function evaluateProject(question, profile = {}) {
  const q = String(question || '').trim();
  if (!q) {
    const err = new Error('question is required.');
    err.status = 400;
    throw err;
  }

  const normalizedProfile = normalizeProfile(profile);
  const roster = await loadRoster();
  const picks = pickEvaluationAgents(q, normalizedProfile, roster);

  if (!picks.length) {
    const err = new Error('Could not select specialists for this question — try mentioning grants, equipment, finance, or deals.');
    err.status = 400;
    throw err;
  }

  const laneResults = await Promise.all(
    picks.map((row) => briefSpecialist(row.id, q, normalizedProfile, roster, row))
  );
  const lanes = laneResults.filter(Boolean);

  if (lanes.length < 2) {
    const err = new Error('Not enough specialist briefings for a team view — try a more specific project question.');
    err.status = 422;
    throw err;
  }

  const turns = lanes.map((lane) => ({
    slug: lane.slug,
    agentName: lane.agentName,
    question: lane.question,
    summary: lane.summary,
    intentId: lane.intentId,
    highlights: lane.highlights
  }));

  let plan = '';
  let planSource = 'heuristic';
  try {
    const planResult = await summarizeJourney({
      profile: normalizedProfile,
      startedAt: new Date().toISOString(),
      turns
    });
    plan = planResult.plan;
    planSource = planResult.source;
  } catch (_) {
    plan = buildHeuristicPlan({
      profile: normalizedProfile,
      startedAt: new Date().toISOString(),
      turns
    });
  }

  return {
    question: q,
    profile: normalizedProfile,
    plan,
    planSource,
    laneCount: lanes.length,
    specialists: lanes.map((l) => l.agentName),
    agentIds: lanes.map((l) => l.id),
    lanes,
    turns
  };
}

module.exports = {
  evaluateProject,
  pickEvaluationAgents,
  shouldCollaborateAsTeam,
  buildTeamOrchestraResponse,
  compactSummary,
  extractHighlights,
  tailoredQuestion
};
