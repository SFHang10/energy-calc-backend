/**
 * Greenways Guide — synthesize cross-agent journey ledger into an action plan.
 * Grounded in client-provided turns only; optional LLM polish via GUIDE_AGENT_* / ASSISTANT_*.
 */

const { maybeCallGreenwaysLlm } = require('./greenways-agent-llm');

const MIN_TURNS = 2;
const MAX_TURNS = 24;

function normalizeProfile(profile = {}) {
  return {
    region: String(profile.region || '').trim(),
    sector: String(profile.sector || '').trim(),
    focus: String(profile.focus || '').trim()
  };
}

function normalizeTurn(turn, index) {
  if (!turn || typeof turn !== 'object') return null;
  const agentName = String(turn.agentName || turn.slug || 'Specialist').trim();
  const question = String(turn.question || '').trim();
  const summary = String(turn.summary || '').trim();
  if (!summary && !question) return null;

  const highlights = Array.isArray(turn.highlights)
    ? turn.highlights
        .map((h) => ({
          kind: String(h?.kind || '').trim(),
          label: String(h?.label || '').trim(),
          href: String(h?.href || '').trim(),
          moduleId: String(h?.moduleId || '').trim()
        }))
        .filter((h) => h.label)
        .slice(0, 8)
    : [];

  return {
    index: index + 1,
    slug: String(turn.slug || '').trim(),
    agentName,
    question,
    summary: summary || question,
    intentId: String(turn.intentId || '').trim(),
    at: String(turn.at || '').trim(),
    highlights
  };
}

function normalizeJourneyInput(body = {}) {
  const profile = normalizeProfile(body.profile);
  const rawTurns = Array.isArray(body.turns) ? body.turns : [];
  const turns = rawTurns.map(normalizeTurn).filter(Boolean).slice(-MAX_TURNS);

  return {
    profile,
    startedAt: String(body.startedAt || '').trim(),
    turns
  };
}

function countDistinctAgents(turns) {
  const slugs = new Set();
  turns.forEach((t) => {
    if (t.slug) slugs.add(t.slug);
    else if (t.agentName) slugs.add(t.agentName);
  });
  return slugs.size;
}

function collectHighlightLabels(turns) {
  const labels = [];
  turns.forEach((t) => {
    (t.highlights || []).forEach((h) => {
      if (h.label && !labels.includes(h.label)) labels.push(h.label);
    });
  });
  return labels.slice(0, 6);
}

function regionLabel(region) {
  const map = {
    nl: 'Netherlands',
    uk: 'United Kingdom',
    eu: 'EU-wide',
    ie: 'Ireland',
    de: 'Germany'
  };
  return map[region] || region || 'your region';
}

function buildHeuristicPlan(journey) {
  const { profile, turns, startedAt } = journey;
  const agents = [...new Set(turns.map((t) => t.agentName))];
  const sector = profile.sector || 'site';
  const region = regionLabel(profile.region);
  const highlights = collectHighlightLabels(turns);

  let plan =
    `**Your Greenways action plan** (${sector} · ${region})\n\n` +
    `This visit brought together **${agents.join('**, **')}**` +
    (startedAt ? ' — review before you act on the details below.' : '.');

  plan += '\n\n**What we covered**\n';
  turns.forEach((t) => {
    const q = t.question ? ` — “${t.question}”` : '';
    plan += `- **${t.agentName}**${q}: ${t.summary}\n`;
  });

  plan += '\n**Suggested next steps**\n';
  if (highlights.length) {
    highlights.forEach((label) => {
      plan += `- Follow up on **${label}** in the specialist chat or linked tool\n`;
    });
  } else {
    plan += '- Re-open any specialist above for deeper detail on schemes, equipment, or finance\n';
    plan += '- Use **handoff chips** when one agent points you to another expert\n';
    plan += '- Compare grants and payback before committing to an upgrade\n';
  }

  if (agents.length === 1) {
    plan += '\n_Tip: ask another specialist (grants, finance, equipment) to broaden this plan._';
  }

  return plan.trim();
}

async function maybeCallJourneyLlm(journey) {
  const systemPrompt = [
    'You are the Greenways Guide orchestrator — a sustainability transition portal for businesses.',
    'Synthesize the user journey across specialist agents into a short, practical action plan.',
    'Rules:',
    '- Use ONLY facts from the provided turns, summaries, and highlights — never invent schemes, products, prices, or deadlines.',
    '- Format in markdown: one short intro paragraph, then **What we covered** (3–6 bullets), then **Suggested next steps** (2–4 bullets).',
    '- Name specialists (Andrieus, Vincent, Artemis, Zyanne, Zara, Cheryce, Edwardo) when their turn is relevant.',
    '- Keep under 200 words. Be direct and actionable for a restaurant or SME owner.',
    '- If data is thin, say what is confirmed and what still needs a follow-up question.'
  ].join(' ');

  return maybeCallGreenwaysLlm({
    prefix: 'GUIDE_AGENT',
    systemPrompt,
    userPayload: {
      profile: journey.profile,
      startedAt: journey.startedAt || null,
      turnCount: journey.turns.length,
      distinctAgents: countDistinctAgents(journey.turns),
      turns: journey.turns.map((t) => ({
        agentName: t.agentName,
        question: t.question,
        summary: t.summary,
        intentId: t.intentId,
        highlights: (t.highlights || []).map((h) => h.label)
      }))
    },
    maxTokens: 650
  });
}

/**
 * @param {object} body — { profile, startedAt, turns[] }
 * @returns {Promise<{ plan: string, source: string, turnCount: number, agentCount: number }>}
 */
async function summarizeJourney(body = {}) {
  const journey = normalizeJourneyInput(body);

  if (journey.turns.length < MIN_TURNS) {
    const err = new Error(`At least ${MIN_TURNS} answers are needed to generate a plan.`);
    err.status = 400;
    throw err;
  }

  const agentCount = countDistinctAgents(journey.turns);
  const heuristic = buildHeuristicPlan(journey);
  const llmPlan = await maybeCallJourneyLlm(journey);
  const plan = String(llmPlan || heuristic).trim();

  return {
    plan,
    source: llmPlan ? 'llm' : 'heuristic',
    turnCount: journey.turns.length,
    agentCount,
    specialists: [...new Set(journey.turns.map((t) => t.agentName))]
  };
}

module.exports = {
  MIN_TURNS,
  summarizeJourney,
  normalizeJourneyInput,
  buildHeuristicPlan,
  countDistinctAgents
};
