/**
 * Curated hospitality sustainability glossary — shared across Greenways agents.
 * Source: Sustainability tool kit.md (cleaned, deduped).
 */

const path = require('path');
const fs = require('fs');

const glossaryPath = path.join(__dirname, '..', 'data', 'greenways-sustainability-glossary.json');

const GLOSSARY_MARKER = '**Greenways glossary:**';

const AGENT_ANGLES = {
  media:
    'I unpack policy and market headlines that use this language — pair with a news edition when timing matters.',
  equipment:
    'On site, this often connects to fabric, kitchen loads, or efficient kit — I can shortlist upgrades or renovation paths next.',
  finance: 'For payback and funding, I model costs against tariffs and grants once you know which lever matters.',
  grants: 'Reporting schemes and tax relief often reference this — I match catalogue rows to your region.',
  products: 'Product lanes (water, electricity, gas) and catalog search help turn definitions into spec lists.',
  deals: 'Tariffs and supplier deals change the € impact of the same efficiency move — worth stacking both levers.',
  systems: 'Metering and dashboards make these concepts measurable before capex — measure first, then buy.'
};

const AGENT_HANDOFFS = {
  media: { id: 'media', name: 'Cheryce', href: '/greenways/media-agent' },
  equipment: { id: 'equipment', name: 'Artemis', href: '/greenways/equipment-agent' },
  finance: { id: 'finance', name: 'Vincent', href: '/greenways/finance-agent' },
  grants: { id: 'grants', name: 'Andrieus', href: '/greenways/grants-agent' },
  products: { id: 'products', name: 'Zyanne', href: '/greenways/sustainable-products-agent' },
  deals: { id: 'deals', name: 'Zara', href: '/greenways/deals-agent' },
  systems: { id: 'systems', name: 'Edwardo', href: '/greenways/systems-agent' }
};

let glossaryCache = null;

function loadGlossary() {
  if (glossaryCache) return glossaryCache;
  try {
    glossaryCache = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
  } catch (_) {
    glossaryCache = { terms: [] };
  }
  return glossaryCache;
}

function normalizeAgentKey(agentKey) {
  const key = String(agentKey || '').trim().toLowerCase();
  if (key === 'sustainable-products') return 'products';
  return key;
}

function scoreTerm(term, question, agentKey) {
  const key = normalizeAgentKey(agentKey);
  const agents = term.agents || [];
  if (agents.length && key && !agents.includes(key)) return 0;

  const q = String(question || '').toLowerCase();
  let score = 0;

  const termLabel = String(term.term || '').toLowerCase();
  if (termLabel && q.includes(termLabel)) score += 40;

  for (const kw of term.keywords || []) {
    const k = String(kw).toLowerCase().trim();
    if (k.length >= 3 && q.includes(k)) score += k.length >= 10 ? 14 : 10;
  }

  for (const topic of term.topics || []) {
    const t = String(topic).toLowerCase();
    if (t.length >= 4 && q.includes(t)) score += 4;
  }

  if (key && term.primaryAgent === key) score += 6;
  else if (key && agents.includes(key)) score += 3;

  if (/what is|what does|what are|define|meaning of|explain|glossary/.test(q)) score += 4;

  return score;
}

function rankTerms(question, agentKey, { limit = 5, minScore = 12, preferId = '' } = {}) {
  const catalog = loadGlossary();
  const ranked = (catalog.terms || [])
    .map((term) => ({ term, score: scoreTerm(term, question, agentKey) }))
    .filter((row) => row.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (preferId) {
    const idx = ranked.findIndex((r) => r.term.id === preferId);
    if (idx > 0) {
      const [hit] = ranked.splice(idx, 1);
      ranked.unshift(hit);
    } else if (idx < 0) {
      const direct = (catalog.terms || []).find((t) => t.id === preferId);
      if (direct) ranked.unshift({ term: direct, score: minScore + 20 });
    }
  }

  return ranked.slice(0, limit).map((r) => r.term);
}

function lookupTerms(question, agentKey, options = {}) {
  return rankTerms(question, agentKey, options);
}

function formatHowToReduce(term) {
  const rows = term.howToReduce || [];
  if (!rows.length) return '';
  return `\n\n**Practical levers:**\n${rows.map((r) => `- ${r}`).join('\n')}`;
}

function formatRelatedTerms(terms, primaryId) {
  const others = terms.filter((t) => t.id !== primaryId).slice(0, 3);
  if (!others.length) return '';
  return `\n\n**Related terms:** ${others.map((t) => `**${t.term}**`).join(' · ')}`;
}

function handoffsForTerm(term, currentAgentKey) {
  const current = normalizeAgentKey(currentAgentKey);
  const targets = new Set();
  if (term.primaryAgent) targets.add(term.primaryAgent);
  for (const a of term.agents || []) targets.add(a);
  targets.delete(current);

  return [...targets]
    .map((id) => AGENT_HANDOFFS[id])
    .filter(Boolean)
    .slice(0, 2)
    .map((h) => ({
      ...h,
      prompt: `Explain ${term.term} for my ${current === 'equipment' ? 'restaurant' : 'site'}`
    }));
}

function buildGlossaryAnswer(question, profile = {}, options = {}) {
  const agentKey = normalizeAgentKey(options.agentKey);
  const tip = options.tip || '';
  const preferId = options.preferId || options.preferTermId || '';
  const minScore = options.minScore != null ? options.minScore : 12;

  const hits = rankTerms(question, agentKey, { limit: 4, minScore, preferId });
  if (!hits.length) return null;

  const primary = hits[0];
  const angle = AGENT_ANGLES[agentKey] || '';
  const sector = profile.sector ? ` (${profile.sector})` : '';

  let answer =
    `**${primary.term}**\n\n` +
    `${primary.short}` +
    (primary.long ? `\n\n${primary.long}` : '') +
    formatHowToReduce(primary) +
    formatRelatedTerms(hits, primary.id);

  if (angle) {
    answer += `\n\n_${angle}_`;
  }

  if (agentKey === 'equipment' && (primary.topics || []).includes('energy')) {
    answer += `\n\n_For kitchens${sector}, efficient equipment and fabric upgrades often cut the kWh and gas behind these metrics._`;
  }
  if (agentKey === 'media' && (primary.topics || []).includes('policy')) {
    answer += `\n\n_When regulators or industry bodies move on this, I surface it in sustainability and tech news editions._`;
  }

  if (tip) answer += `\n\n_${tip}_`;

  return {
    answer: answer.includes(GLOSSARY_MARKER) ? answer : `${GLOSSARY_MARKER}\n\n${answer}`,
    blocks: [],
    suggestions: hits.slice(1, 4).map((t) => `What is ${t.term}?`),
    agentHandoffs: handoffsForTerm(primary, agentKey),
    glossaryTermIds: hits.map((t) => t.id)
  };
}

function tryBuildGlossaryAnswer(question, profile, tip, options = {}) {
  return buildGlossaryAnswer(question, profile, { ...options, tip });
}

/** Map glossary intents (scope_3 / sustainability_glossary) to a knowledge result, or null. */
function resolveGlossaryFromIntent(intent, question, profile, tip, agentKey) {
  if (!intent) return null;
  if (intent.answerType === 'scope_3') {
    return buildGlossaryAnswer(question, profile, { agentKey, tip, preferId: 'scope-3' });
  }
  if (intent.answerType === 'sustainability_glossary') {
    return buildGlossaryAnswer(question, profile, {
      agentKey,
      tip,
      preferId: intent.preferTermId || ''
    });
  }
  return null;
}

module.exports = {
  loadGlossary,
  scoreTerm,
  rankTerms,
  lookupTerms,
  buildGlossaryAnswer,
  tryBuildGlossaryAnswer,
  resolveGlossaryFromIntent,
  GLOSSARY_MARKER
};
