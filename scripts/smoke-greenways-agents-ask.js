/**
 * Smoke test — Greenways agent /ask knowledge path (no server required).
 * Optional live API: SMOKE_BASE=https://energy-calc-backend.onrender.com node scripts/smoke-greenways-agents-ask.js
 *
 * Run: node scripts/smoke-greenways-agents-ask.js
 */
const path = require('path');

const ROOT = path.join(__dirname, '..');

const AGENT_SMOOKES = [
  {
    key: 'finance',
    route: '/api/finance-agent/ask',
    load: () => require(path.join(ROOT, 'services/finance-agent-knowledge')),
    questions: ['What BNPL options do restaurants have?', 'energy prices payback']
  },
  {
    key: 'grants',
    route: '/api/grants-agent/ask',
    load: () => require(path.join(ROOT, 'services/grants-agent-knowledge')),
    questions: ['MIA Vamil Netherlands', 'restaurant grants']
  },
  {
    key: 'media',
    route: '/api/media-agent/ask',
    load: () => require(path.join(ROOT, 'services/media-agent-knowledge')),
    questions: ['sustainability map examples', 'monthly news']
  },
  {
    key: 'equipment',
    route: '/api/equipment-agent/ask',
    load: () => require(path.join(ROOT, 'services/equipment-agent-knowledge')),
    questions: ['insulation guide restaurant', 'equipment deep dive']
  },
  {
    key: 'deals',
    route: '/api/deals-agent/ask',
    load: () => require(path.join(ROOT, 'services/deals-agent-knowledge')),
    questions: ['deals ticker hub', 'energy tariff deals']
  },
  {
    key: 'sustainable-products',
    route: '/api/sustainable-products-agent/ask',
    load: () => require(path.join(ROOT, 'services/sustainable-products-agent-knowledge')),
    questions: ['water saving products', 'efficient refrigeration ETL']
  },
  {
    key: 'systems',
    route: '/api/systems-agent/ask',
    load: () => require(path.join(ROOT, 'services/systems-agent-knowledge')),
    questions: ['sensor dashboard monitoring', 'energy monitoring guide']
  }
];

const profile = { region: 'nl', sector: 'restaurant', focus: 'energy' };

async function runLocalSmokes() {
  const {
    meaningForProfile,
    buildAgentHandoff,
    FINANCE_HANDOFF_RULES
  } = require(path.join(ROOT, 'services/greenways-agent-shared'));
  const { finishKnowledgeAskResponse, isPolishEnabled } = require(path.join(
    ROOT,
    'services/greenways-agent-llm-fallback'
  ));
  const fs = require('fs');

  const meaning = meaningForProfile(profile, { intentId: 'energy_prices' });
  if (!meaning || meaning.length < 20) {
    throw new Error('meaningForProfile returned empty');
  }
  console.log('OK meaningForProfile:', meaning.slice(0, 72) + '…');

  const briefing = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/finance-agent-briefing.json'), 'utf8')
  );
  const handoffs = buildAgentHandoff(briefing, {
    question: 'green loan',
    intentId: 'grants_link',
    rules: FINANCE_HANDOFF_RULES,
    fallbackKeys: ['grantsToAndrieus']
  });
  if (!handoffs.length || !handoffs[0].href) {
    throw new Error('buildAgentHandoff returned no chips');
  }
  console.log('OK buildAgentHandoff:', handoffs.map((h) => h.name).join(', '));

  let hits = 0;
  for (const agent of AGENT_SMOOKES) {
    const mod = agent.load();
    if (typeof mod.answerFromKnowledge !== 'function') {
      throw new Error(`${agent.key}: missing answerFromKnowledge`);
    }
    for (const question of agent.questions) {
      const knowledge = await mod.answerFromKnowledge(question, profile);
      if (!knowledge?.answer) {
        console.warn('WARN', agent.key, 'no knowledge hit for:', question);
        continue;
      }
      hits += 1;
      const finished = await finishKnowledgeAskResponse(agent.key, knowledge, question, profile);
      if (!finished?.answer || !finished.intentId) {
        throw new Error(`${agent.key}: finishKnowledgeAskResponse incomplete for "${question}"`);
      }
      console.log(
        'OK',
        agent.key,
        question.slice(0, 36),
        '→',
        finished.intentId,
        finished.source,
        agent.key === 'finance' && isPolishEnabled('finance') ? '(polish on)' : ''
      );
    }
  }

  if (hits < 8) {
    throw new Error(`Expected at least 8 knowledge hits, got ${hits}`);
  }
  return hits;
}

async function runLiveSmokes(base) {
  const url = base.replace(/\/$/, '');
  const body = JSON.stringify({ question: 'What BNPL options exist?', profile });
  for (const agent of AGENT_SMOOKES.slice(0, 2)) {
    const res = await fetch(`${url}${agent.route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    const data = await res.json();
    if (!res.ok || !data.answer) {
      throw new Error(`Live ${agent.key} failed: ${res.status} ${data.error || ''}`);
    }
    console.log('OK live', agent.key, data.source, data.intentId || '—');
  }
}

(async () => {
  try {
    const hits = await runLocalSmokes();
    const base = process.env.SMOKE_BASE || '';
    if (base) {
      await runLiveSmokes(base);
    } else {
      console.log('Tip: SMOKE_BASE=https://energy-calc-backend.onrender.com for live /ask');
    }
    console.log(`\nAll smokes passed (${hits} local knowledge hits).`);
  } catch (err) {
    console.error('FAIL', err.message);
    process.exit(1);
  }
})();
