/**
 * Site knowledge cards — grounded claims from repo data (additive to /ask answers).
 * Catalog: data/greenways-site-knowledge/cards.json
 * Scenarios: data/savings-projection-scenarios.json (when card.scenarioId is set)
 */

const path = require('path');
const fs = require('fs');

const cardsPath = path.join(__dirname, '..', 'data', 'greenways-site-knowledge', 'cards.json');
const scenariosPath = path.join(__dirname, '..', 'data', 'savings-projection-scenarios.json');

const { mergeModuleRow } = require('./greenways-content-modules');
const { toModuleItem } = require('./greenways-agent-shared');
const { AGENT_MODULE_THEME, exampleQueryString, blocksAlreadyShowExample } = require('./greenways-module-examples');

const SITE_EVIDENCE_MARKER = '**Site example:**';

let cardsCache = null;
let scenariosCache = null;

function loadCardsCatalog() {
  if (cardsCache) return cardsCache;
  try {
    cardsCache = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  } catch (_) {
    cardsCache = { cards: [] };
  }
  return cardsCache;
}

function loadScenariosCatalog() {
  if (scenariosCache) return scenariosCache;
  try {
    scenariosCache = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
  } catch (_) {
    scenariosCache = { scenarios: [] };
  }
  return scenariosCache;
}

function scenarioGrantEur(row = {}) {
  const grants = Array.isArray(row.grants) ? row.grants : [];
  return grants.reduce((sum, g) => sum + (Number(g.amountEur) || 0), 0);
}

function hydrateCard(card = {}) {
  if (!card.scenarioId) return { ...card };
  const row = (loadScenariosCatalog().scenarios || []).find((s) => s.id === card.scenarioId);
  if (!row) return { ...card };
  return {
    ...card,
    title: card.title || row.title,
    evidence: {
      title: row.title,
      baselineMonthlyEur: row.baselineMonthlyEur,
      proposedMonthlyEur: row.proposedMonthlyEur,
      capexEur: row.capexEur,
      grantEur: scenarioGrantEur(row),
      savingsNote: row.savingsNote || ''
    }
  };
}

function formatTemplate(template, evidence = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => {
    const val = evidence[key];
    return val == null ? '' : String(val);
  });
}

function formatCardProse(card = {}) {
  if (card.prose) return String(card.prose).trim();
  if (card.proseTemplate && card.evidence) {
    return formatTemplate(card.proseTemplate, card.evidence).trim();
  }
  if (card.claim) return String(card.claim).trim();
  return '';
}

function cardQueryString(card = {}) {
  if (card.query) return String(card.query).replace(/^\?/, '');
  const params = card.params || {};
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && String(v).trim() !== '') usp.set(k, String(v).trim());
  }
  return usp.toString();
}

function scoreCard(card, { agentKey, question, intentId, profile = {} }) {
  const key = String(agentKey || '').trim().toLowerCase();
  if (!(card.agents || []).includes(key)) return 0;

  let score = 0;
  const q = String(question || '').toLowerCase();

  if (intentId && (card.intentIds || []).includes(intentId)) score += 42;

  let keywordHits = 0;
  for (const token of card.keywords || []) {
    const t = String(token).toLowerCase();
    if (t.length >= 3 && q.includes(t)) {
      score += 7;
      keywordHits += 1;
    }
  }

  if (card.scenarioId && keywordHits > 0) score += 28;

  const equipmentTokens = [
    'fridge',
    'refrigeration',
    'dishwasher',
    'dishwash',
    'wok',
    'freezer',
    'hvac',
    'ventilation',
    'cookline'
  ];
  const asksEquipment = equipmentTokens.some((t) => q.includes(t));
  if (asksEquipment && card.id === 'evidence-monitoring-before-capex') score -= 40;
  if (asksEquipment && card.scenarioId) score += 12;

  if (card.scenarioId && q.includes(String(card.scenarioId).replace(/-/g, ' '))) score += 10;
  if (card.scenarioId && q.includes(String(card.scenarioId).toLowerCase())) score += 10;

  const region = String(profile.region || '').trim();
  if (region && card.params?.region === region) score += 8;

  return score;
}

function rankCardsForKnowledge(agentKey, question, intentId, profile = {}, { limit = 2, minScore = 14 } = {}) {
  const catalog = loadCardsCatalog();
  return (catalog.cards || [])
    .map((raw) => hydrateCard(raw))
    .map((card) => ({ card, score: scoreCard(card, { agentKey, question, intentId, profile }) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.card);
}

function pickCardForKnowledge(agentKey, question, intentId, profile = {}) {
  const ranked = rankCardsForKnowledge(agentKey, question, intentId, profile, { limit: 1 });
  return ranked[0] || null;
}

function cardToModuleBlock(card, profile = {}, agentKey = '') {
  if (!card?.moduleId) return null;
  const theme = AGENT_MODULE_THEME[agentKey] || AGENT_MODULE_THEME.equipment;
  const query = cardQueryString(card);
  const row = mergeModuleRow({
    moduleId: card.moduleId,
    title: card.moduleTitle || card.title || 'Open illustration',
    description: card.moduleDescription || formatCardProse(card).slice(0, 180),
    usageHint: card.usageHint || 'Grounded Greenways example — numbers match our projection or guide data.',
    query,
    openSize: card.openSize || 'near-full'
  });
  return {
    type: 'module',
    items: [toModuleItem({ ...theme, ...row })]
  };
}

function insertBeforeAnswerTip(answer, insert) {
  if (!insert) return answer;
  const tipMatch = String(answer || '').match(/\n\n_([^_\n]+)_\s*$/);
  if (tipMatch && typeof tipMatch.index === 'number') {
    return answer.slice(0, tipMatch.index) + insert + answer.slice(tipMatch.index);
  }
  return `${answer}${insert}`;
}

/**
 * Append one grounded site evidence line (+ optional module tablet). Never removes existing copy.
 */
function attachSiteKnowledgeCards(result, { agentKey, question, intentId, profile = {} } = {}) {
  if (!result?.answer) return result;
  if (String(result.answer).includes(SITE_EVIDENCE_MARKER)) return result;

  const card = pickCardForKnowledge(agentKey, question, intentId, profile);
  if (!card) return result;

  const prose = formatCardProse(card);
  if (!prose) return result;

  const block = cardToModuleBlock(card, profile, agentKey);
  if (block && !blocksAlreadyShowExample(result.blocks, { query: cardQueryString(card), params: card.params })) {
    result.blocks = [...(result.blocks || []), block];
  }

  const line = `\n\n${SITE_EVIDENCE_MARKER} ${prose}`;
  result.answer = insertBeforeAnswerTip(result.answer, line);
  result.siteKnowledgeCardId = card.id;
  return result;
}

module.exports = {
  loadCardsCatalog,
  loadScenariosCatalog,
  hydrateCard,
  formatCardProse,
  scoreCard,
  rankCardsForKnowledge,
  pickCardForKnowledge,
  attachSiteKnowledgeCards,
  SITE_EVIDENCE_MARKER
};
