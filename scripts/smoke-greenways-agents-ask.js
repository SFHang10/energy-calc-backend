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
    questions: ['sustainability map examples', 'monthly news', "today's sustainability news briefing"]
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
    questions: ['deals ticker hub', 'energy tariff deals', 'check deals feed now for interesting offers']
  },
  {
    key: 'sustainable-products',
    route: '/api/sustainable-products-agent/ask',
    load: () => require(path.join(ROOT, 'services/sustainable-products-agent-knowledge')),
    questions: ['water saving products', 'efficient refrigeration ETL', 'SCC WE 61 manufacturer energy baseline']
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

  const financeMod = require(path.join(ROOT, 'services/finance-agent-knowledge'));
  const energyHit = await financeMod.answerFromKnowledge('energy prices payback', profile);
  if (!energyHit?.agentHandoffs?.some((h) => /cheryc|media/i.test(h.name || h.id || ''))) {
    throw new Error('Vincent energy_prices: expected Cheryce handoff chip');
  }
  console.log('OK Vincent handoffs energy_prices → Cheryce chip');

  const bnplHit = await financeMod.answerFromKnowledge('BNPL restaurant equipment', profile);
  if (!bnplHit?.blocks?.some((b) => b.type === 'module')) {
    throw new Error('Vincent bnpl: expected module blocks[]');
  }
  console.log('OK Vincent bnpl module blocks');

  const priceHit = await financeMod.answerFromKnowledge('energy prices payback', profile);
  const modBlock = (priceHit?.blocks || []).find((b) => b.type === 'module');
  if (!modBlock?.items?.some((i) => i.moduleId === 'energy-ticker')) {
    throw new Error('Vincent energy_prices: expected energy-ticker module item');
  }
  const tickerItem = modBlock.items.find((i) => i.moduleId === 'energy-ticker');
  if (!tickerItem?.usageHint || !tickerItem?.description) {
    throw new Error('Vincent energy_prices: expected description + usageHint on module item');
  }
  console.log('OK Vincent energy_prices module tablets');

  const siteEvidenceHit = await financeMod.answerFromKnowledge('energy prices payback fridge upgrade', profile);
  if (!siteEvidenceHit?.answer?.includes('**Site example:**')) {
    throw new Error('Vincent price_upgrade: expected **Site example:** grounded line');
  }
  if (!siteEvidenceHit?.siteKnowledgeCardId) {
    throw new Error('Vincent price_upgrade: expected siteKnowledgeCardId');
  }
  console.log('OK Vincent site knowledge card:', siteEvidenceHit.siteKnowledgeCardId);

  const calcHit = await financeMod.answerFromKnowledge('calculators audit projection trajectory', profile);
  const calcMod = (calcHit?.blocks || []).find((b) => b.type === 'module');
  if (!calcMod?.items?.length) {
    throw new Error('Vincent calculators: expected module blocks[] not link tablets');
  }
  console.log('OK Vincent calculators module tablets');

  const portalHit = await financeMod.answerFromKnowledge('Where is the finance finder portal?', profile);
  const portalMod = (portalHit?.blocks || []).find((b) => b.type === 'module');
  if (!portalMod?.items?.some((i) => i.moduleId === 'finance-finder')) {
    throw new Error('Vincent portals: expected finance-finder module item');
  }
  console.log('OK Vincent portals module tablets');

  const grantsMod = require(path.join(ROOT, 'services/grants-agent-knowledge'));
  const portalGrantsHit = await grantsMod.answerFromKnowledge(
    'Where are the Greenways schemes portals and finance finder?',
    profile
  );
  const grantsPortalMod = (portalGrantsHit?.blocks || []).find((b) => b.type === 'module');
  if (!grantsPortalMod?.items?.some((i) => i.moduleId === 'schemes-portal-restaurant')) {
    throw new Error('Andrieus portals: expected schemes-portal-restaurant module item');
  }
  console.log('OK Andrieus portals module tablets');

  const grantsOverviewHit = await grantsMod.answerFromKnowledge('how many grants in the catalogue overview', profile);
  if (!grantsOverviewHit?.answer?.includes('**Site example:**')) {
    throw new Error('Andrieus overview: expected **Site example:** grounded line');
  }
  if (!grantsOverviewHit?.siteKnowledgeCardId) {
    throw new Error('Andrieus overview: expected siteKnowledgeCardId');
  }
  console.log('OK Andrieus site knowledge card:', grantsOverviewHit.siteKnowledgeCardId);

  const grantsNlHit = await grantsMod.answerFromKnowledge('MIA Vamil Netherlands restaurant equipment', {
    ...profile,
    region: 'nl'
  });
  if (!grantsNlHit?.answer?.includes('**Site example:**')) {
    throw new Error('Andrieus nl_schemes: expected **Site example:** grounded line');
  }
  console.log('OK Andrieus NL MIA/Vamil site card:', grantsNlHit.siteKnowledgeCardId);

  const grantsProductHit = await grantsMod.answerFromKnowledge('which grant for my marketplace product', profile);
  if (!grantsProductHit?.answer?.includes('**Site example:**')) {
    throw new Error('Andrieus product_grants: expected **Site example:** grounded line');
  }
  console.log('OK Andrieus product grants site card:', grantsProductHit.siteKnowledgeCardId);

  const equipMod = require(path.join(ROOT, 'services/equipment-agent-knowledge'));
  const etlSiteHit = await equipMod.answerFromKnowledge('what is etl energy technology list', profile);
  if (!etlSiteHit?.answer?.includes('**Site example:**')) {
    throw new Error('Artemis etl_verification: expected **Site example:** grounded line');
  }
  console.log('OK Artemis site knowledge card:', etlSiteHit.siteKnowledgeCardId);

  const referralProfile = {
    ...profile,
    handoff: {
      fromSlug: 'sustainable-products-agent',
      fromName: 'Zyanne',
      question: 'Explain ETL lifecycle cost for this equipment upgrade',
      topicSummary: 'you were exploring electricity-lane efficient products for your restaurant',
      fromIntentId: 'electricity_lane'
    }
  };
  const referralHit = await equipMod.answerFromKnowledge(
    'Explain ETL lifecycle cost for this equipment upgrade',
    referralProfile
  );
  if (referralHit?.intentId !== 'agent_referral_welcome') {
    throw new Error('Artemis referral: expected agent_referral_welcome intent');
  }
  if (!/Zyanne/i.test(referralHit.answer || '')) {
    throw new Error('Artemis referral: expected Zyanne mention in welcome');
  }
  if (!referralHit?.productSamples?.length) {
    throw new Error('Artemis referral: expected productSamples on welcome');
  }
  console.log('OK Artemis Zyanne handoff welcome →', referralHit.productSamples.length, 'samples');

  const grantsReferralProfile = {
    ...profile,
    handoff: {
      fromSlug: 'media-agent',
      fromName: 'Cheryce',
      question: 'What grants apply from this sustainability news in my region?',
      topicSummary: "you were reading today's sustainability news briefing",
      fromIntentId: 'daily_brief'
    }
  };
  const grantsReferralHit = await grantsMod.answerFromKnowledge(
    'What grants apply from this sustainability news in my region?',
    grantsReferralProfile
  );
  if (grantsReferralHit?.intentId !== 'agent_referral_welcome') {
    throw new Error('Andrieus referral: expected agent_referral_welcome intent');
  }
  if (!/Cheryce/i.test(grantsReferralHit.answer || '')) {
    throw new Error('Andrieus referral: expected Cheryce mention in welcome');
  }
  if (!grantsReferralHit?.suggestions?.length) {
    throw new Error('Andrieus referral: expected scheme suggestions on welcome');
  }
  console.log('OK Andrieus Cheryce handoff welcome →', grantsReferralHit.suggestions.length, 'schemes');

  const guideMod = require(path.join(ROOT, 'services/guide-agent-knowledge'));
  const guideHit = await guideMod.answerFromKnowledge('What grants fit kitchen equipment?', profile);
  if (!guideHit?.answer || guideHit.source !== 'orchestrator') {
    throw new Error('Orchestra: expected orchestrator routing for grants question');
  }
  if (!guideHit.primaryAgent) {
    throw new Error('Orchestra: expected primaryAgent on routed answer');
  }
  console.log('OK Orchestra route grants question →', guideHit.primaryAgent);
  if (guideHit.responseMode === 'team') {
    throw new Error('Orchestra grants question: expected single-agent route, not team');
  }

  const teamAsk = await guideMod.answerFromKnowledge(
    'Evaluate upgrading wok line and insulation for an NL restaurant',
    profile
  );
  if (teamAsk.responseMode !== 'team' || !teamAsk.lanes || teamAsk.lanes.length < 2) {
    throw new Error('Orchestra team ask: expected collaborative team response');
  }
  if (!teamAsk.plan || !String(teamAsk.plan).trim()) {
    throw new Error('Orchestra team ask: expected synthesized plan');
  }
  console.log('OK Orchestra team collaboration →', teamAsk.specialists.join(', '));

  const evalMod = require(path.join(ROOT, 'services/guide-agent-team-evaluate'));
  const evalHit = await evalMod.evaluateProject(
    'Evaluate upgrading wok line and insulation for an NL restaurant',
    profile
  );
  if (!evalHit?.lanes || evalHit.lanes.length < 2) {
    throw new Error('Orchestra team evaluate: expected at least 2 specialist lanes');
  }
  if (!evalHit.plan || !String(evalHit.plan).trim()) {
    throw new Error('Orchestra team evaluate: expected synthesized plan');
  }
  console.log('OK Orchestra team evaluate →', evalHit.specialists.join(', '));

  const deepDiveHit = await equipMod.answerFromKnowledge('equipment deep dive compare alternatives', profile);
  const deepDiveMod = (deepDiveHit?.blocks || []).find((b) => b.type === 'module');
  if (!deepDiveMod?.items?.some((i) => i.moduleId === 'equipment-deep-dive')) {
    throw new Error('Artemis deep_dive: expected equipment-deep-dive module item');
  }
  console.log('OK Artemis deep dive module tablets');

  const mediaMod = require(path.join(ROOT, 'services/media-agent-knowledge'));
  const mediaPortalHit = await mediaMod.answerFromKnowledge('where is news page', profile);
  const mediaPortalMod = (mediaPortalHit?.blocks || []).find((b) => b.type === 'module');
  if (!mediaPortalMod?.items?.some((i) => i.moduleId === 'water-saving-finder' || i.moduleId === 'sustainability-news-page')) {
    throw new Error('Cheryce portals: expected media portal module items');
  }
  console.log('OK Cheryce portals module tablets');

  const dealsMod = require(path.join(ROOT, 'services/deals-agent-knowledge'));
  const dealsPortalHit = await dealsMod.answerFromKnowledge('open portal deals hub', profile);
  const dealsPortalMod = (dealsPortalHit?.blocks || []).find((b) => b.type === 'module');
  if (!dealsPortalMod?.items?.some((i) => i.moduleId === 'european-energy' || i.moduleId === 'deals-ticker' || i.moduleId === 'deals-full-page')) {
    throw new Error('Zara portals: expected deals portal module items');
  }
  console.log('OK Zara portals module tablets');

  const zaraTariffHit = await dealsMod.answerFromKnowledge('compare energy tariffs for my restaurant', profile);
  if (!zaraTariffHit?.answer?.includes('**Site example:**')) {
    throw new Error('Zara tariff_compare: expected **Site example:** grounded line');
  }
  if (!zaraTariffHit?.siteKnowledgeCardId) {
    throw new Error('Zara tariff_compare: expected siteKnowledgeCardId');
  }
  console.log('OK Zara site knowledge card:', zaraTariffHit.siteKnowledgeCardId);

  const zaraNlHit = await dealsMod.answerFromKnowledge('nl restaurant energy rates hospitality', {
    ...profile,
    region: 'nl'
  });
  if (!zaraNlHit?.answer?.includes('**Site example:**')) {
    throw new Error('Zara nl_restaurant_energy: expected **Site example:** grounded line');
  }
  console.log('OK Zara NL restaurant site card:', zaraNlHit.siteKnowledgeCardId);

  const zaraFeedHit = await dealsMod.answerFromKnowledge('check deals feed now for interesting offers', profile);
  if (!zaraFeedHit?.answer?.includes('**Site example:**')) {
    throw new Error('Zara deals_feed_scan: expected **Site example:** grounded line');
  }
  console.log('OK Zara feed scan site card:', zaraFeedHit.siteKnowledgeCardId);

  const productsMod = require(path.join(ROOT, 'services/sustainable-products-agent-knowledge'));
  const productsPortalHit = await productsMod.answerFromKnowledge('open portal finder', profile);
  const productsPortalMod = (productsPortalHit?.blocks || []).find((b) => b.type === 'module');
  if (!productsPortalMod?.items?.some((i) => i.moduleId === 'water-saving-finder' || i.moduleId === 'sustainable-product-finder')) {
    throw new Error('Zyanne portals: expected product finder module items');
  }
  console.log('OK Zyanne portals module tablets');

  const systemsMod = require(path.join(ROOT, 'services/systems-agent-knowledge'));
  const dashHit = await systemsMod.answerFromKnowledge('Where is the Greenways energy dashboard?', profile);
  const dashMod = (dashHit?.blocks || []).find((b) => b.type === 'module');
  if (!dashMod?.items?.some((i) => i.moduleId === 'greenways-dashboard' || i.moduleId === 'sensor-dashboard')) {
    throw new Error('Edwardo dashboard: expected greenways-dashboard or sensor-dashboard module items');
  }
  console.log('OK Edwardo dashboard module tablets');

  const REFERRAL_SMOOKES = [
    {
      label: 'Zyanne → Andrieus',
      load: () => grantsMod,
      question: 'What grants apply to these efficient refrigeration picks?',
      handoff: {
        fromSlug: 'sustainable-products-agent',
        fromName: 'Zyanne',
        fromIntentId: 'find_fridge',
        topicSummary: 'you were shortlisting efficient refrigeration options'
      }
    },
    {
      label: 'Zara → Vincent',
      load: () => financeMod,
      question: 'BNPL and payback after this energy deal',
      handoff: {
        fromSlug: 'deals-agent',
        fromName: 'Zara',
        fromIntentId: 'energy_deals',
        topicSummary: 'you were comparing energy tariff and supply deals'
      }
    },
    {
      label: 'Cheryce → Zyanne',
      load: () => productsMod,
      question: 'efficient products from map case study',
      handoff: {
        fromSlug: 'media-agent',
        fromName: 'Cheryce',
        fromIntentId: 'sustainability_map',
        topicSummary: 'you were exploring sustainability map case studies'
      }
    },
    {
      label: 'Artemis → Andrieus',
      load: () => grantsMod,
      question: 'grants for kitchen renovation equipment',
      handoff: {
        fromSlug: 'equipment-agent',
        fromName: 'Artemis',
        fromIntentId: 'renovation_grants',
        topicSummary: 'you were linking renovation work to grant eligibility'
      }
    },
    {
      label: 'Artemis → Vincent',
      load: () => financeMod,
      question: 'savings projection finance path',
      handoff: {
        fromSlug: 'equipment-agent',
        fromName: 'Artemis',
        fromIntentId: 'savings_projection',
        topicSummary: 'you were modelling savings projection for an upgrade'
      }
    },
    {
      label: 'Zyanne → Zara',
      load: () => dealsMod,
      question: 'deal spotlights for efficient products',
      handoff: {
        fromSlug: 'sustainable-products-agent',
        fromName: 'Zyanne',
        fromIntentId: 'product_deal_spotlights',
        topicSummary: 'you were reviewing efficient product deal spotlights'
      }
    },
    {
      label: 'Zara → Artemis',
      load: () => equipMod,
      question: 'ETL equipment for deal category',
      handoff: {
        fromSlug: 'deals-agent',
        fromName: 'Zara',
        fromIntentId: 'product_deals',
        topicSummary: 'you were reviewing product deal spotlights'
      }
    },
    {
      label: 'Cheryce → Zara',
      load: () => dealsMod,
      question: 'deals after energy price news',
      handoff: {
        fromSlug: 'media-agent',
        fromName: 'Cheryce',
        fromIntentId: 'energy_prices',
        topicSummary: 'you were checking how energy prices affect upgrade timing'
      }
    },
    {
      label: 'Andrieus → Cheryce',
      load: () => mediaMod,
      question: 'daily brief from scheme context',
      handoff: {
        fromSlug: 'grants-agent',
        fromName: 'Andrieus',
        fromIntentId: 'product_grants',
        topicSummary: 'you were reviewing grants and schemes for your restaurant'
      }
    },
    {
      label: 'Vincent → Andrieus',
      load: () => grantsMod,
      question: 'grant eligibility after finance exploration',
      handoff: {
        fromSlug: 'finance-agent',
        fromName: 'Vincent',
        fromIntentId: 'grants_tab',
        topicSummary: 'you were checking how grants stack with finance paths'
      }
    },
    {
      label: 'Zyanne → Edwardo',
      load: () => systemsMod,
      question: 'monitoring before product upgrade',
      handoff: {
        fromSlug: 'sustainable-products-agent',
        fromName: 'Zyanne',
        fromIntentId: 'eco_journey',
        topicSummary: 'you were planning an eco journey and equipment path for your restaurant'
      }
    }
  ];

  for (const row of REFERRAL_SMOOKES) {
    const mod = row.load();
    const hit = await mod.answerFromKnowledge(row.question, {
      ...profile,
      handoff: { ...row.handoff, question: row.question }
    });
    if (hit?.intentId !== 'agent_referral_welcome') {
      throw new Error(`${row.label}: expected agent_referral_welcome, got ${hit?.intentId || 'null'}`);
    }
    if (!new RegExp(row.handoff.fromName, 'i').test(hit.answer || '')) {
      throw new Error(`${row.label}: expected ${row.handoff.fromName} in welcome answer`);
    }
    console.log('OK referral welcome', row.label);
  }

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
