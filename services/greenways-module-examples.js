/**
 * Curated worked examples — deep-linked module tablets for agent /ask responses.
 * Catalog: data/greenways-module-examples.json
 */

const path = require('path');
const fs = require('fs');

const examplesPath = path.join(__dirname, '..', 'data', 'greenways-module-examples.json');
const { mergeModuleRow } = require('./greenways-content-modules');
const { toModuleItem } = require('./greenways-agent-shared');

const WORKED_EXAMPLE_MARKER = '**Worked example:**';

const AGENT_MODULE_THEME = {
  equipment: { theme: 'equipment', agentName: 'Artemis' },
  finance: { theme: 'finance', agentName: 'Vincent' },
  grants: { theme: 'grants', agentName: 'Andrieus' },
  deals: { theme: 'deals', agentName: 'Zara' },
  media: { theme: 'media', agentName: 'Cheryce' },
  products: { theme: 'products', agentName: 'Zyanne' },
  systems: { theme: 'systems', agentName: 'Edwardo' }
};

let examplesCache = null;

function loadExamplesCatalog() {
  if (examplesCache) return examplesCache;
  try {
    examplesCache = JSON.parse(fs.readFileSync(examplesPath, 'utf8'));
  } catch (_) {
    examplesCache = { examples: [] };
  }
  return examplesCache;
}

function exampleQueryString(example) {
  if (example?.query) return String(example.query).replace(/^\?/, '');
  const params = example?.params || {};
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && String(v).trim() !== '') usp.set(k, String(v).trim());
  }
  return usp.toString();
}

function scoreExample(example, { agentKey, question, intentId, profile = {} }) {
  const key = String(agentKey || '').trim().toLowerCase();
  if (!(example.agents || []).includes(key)) return 0;

  let score = 0;
  const q = String(question || '').toLowerCase();

  if (intentId && (example.intentIds || []).includes(intentId)) score += 45;

  for (const token of (example.keywords || [])) {
    const t = String(token).toLowerCase();
    if (t.length >= 3 && q.includes(t)) score += 8;
  }
  for (const topic of example.topics || []) {
    if (q.includes(String(topic).toLowerCase())) score += 4;
  }
  if (example.title && q.includes(String(example.title).toLowerCase().slice(0, 12))) score += 6;

  const region = String(profile.region || '').trim();
  if (region && example.params?.region === region) score += 12;
  if (region && /netherlands|nl/.test(q) && /nl|netherlands/.test(JSON.stringify(example.keywords || []))) {
    score += 6;
  }

  return score;
}

function rankExamplesForKnowledge(agentKey, question, intentId, profile = {}, { limit = 3, minScore = 14 } = {}) {
  const catalog = loadExamplesCatalog();
  return (catalog.examples || [])
    .map((ex) => ({ ex, score: scoreExample(ex, { agentKey, question, intentId, profile }) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.ex);
}

function pickExampleForKnowledge(agentKey, question, intentId, profile = {}) {
  const ranked = rankExamplesForKnowledge(agentKey, question, intentId, profile, { limit: 1 });
  return ranked[0] || null;
}

function exampleToModuleBlock(example, profile = {}, agentKey = '') {
  if (!example?.moduleId) return null;
  const theme = AGENT_MODULE_THEME[agentKey] || AGENT_MODULE_THEME.equipment;
  const query = exampleQueryString(example);
  const row = mergeModuleRow({
    moduleId: example.moduleId,
    title: example.title,
    description: example.summary || example.description || '',
    usageHint: example.usageHint || 'Live worked example — adjust values in the page if needed.',
    query,
    openSize: example.openSize || 'near-full'
  });
  return {
    type: 'module',
    items: [toModuleItem({ ...theme, ...row })]
  };
}

function blocksAlreadyShowExample(blocks, example) {
  const sig = exampleQueryString(example);
  if (!sig) return false;
  const parts = sig.split('&').filter(Boolean);
  for (const block of blocks || []) {
    if (block.type !== 'module') continue;
    for (const item of block.items || []) {
      const href = String(item.href || '');
      if (parts.every((p) => href.includes(p))) return true;
    }
  }
  return false;
}

function insertBeforeAnswerTip(answer, insert) {
  if (!insert) return answer;
  const tipMatch = String(answer || '').match(/\n\n_([^_\n]+)_\s*$/);
  if (tipMatch && typeof tipMatch.index === 'number') {
    return answer.slice(0, tipMatch.index) + insert + answer.slice(tipMatch.index);
  }
  return `${answer}${insert}`;
}

function attachWorkedExample(result, { agentKey, question, intentId, profile = {} } = {}) {
  if (!result?.answer) return result;
  if (String(result.answer).includes(WORKED_EXAMPLE_MARKER)) return result;

  const example = pickExampleForKnowledge(agentKey, question, intentId, profile);
  if (!example) return result;

  const block = exampleToModuleBlock(example, profile, agentKey);
  if (!block) return result;

  if (!blocksAlreadyShowExample(result.blocks, example)) {
    result.blocks = [...(result.blocks || []), block];
  }

  const line = `\n\n${WORKED_EXAMPLE_MARKER} **${example.title}** — ${example.summary || 'Open the module on the right for the live view.'}`;
  result.answer = insertBeforeAnswerTip(result.answer, line);
  return result;
}

module.exports = {
  loadExamplesCatalog,
  exampleQueryString,
  scoreExample,
  rankExamplesForKnowledge,
  pickExampleForKnowledge,
  exampleToModuleBlock,
  blocksAlreadyShowExample,
  attachWorkedExample,
  AGENT_MODULE_THEME,
  WORKED_EXAMPLE_MARKER
};
