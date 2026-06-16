/**
 * Cross-agent referral context — handoff brief → receiving agent welcome.
 * Knowledge-first: welcome copy + samples come from grounded data, not LLM invention.
 */

const PRODUCT_INTENT_TOPICS = {
  equipment_lookup: (profile) =>
    `you were checking manufacturer energy baseline and efficient equipment for your ${profile.sector || 'site'}`,
  electricity_lane: (profile) =>
    `you were exploring **electricity-lane** efficient products for your ${profile.sector || 'site'}`,
  gas_lane: (profile) =>
    `you were exploring **gas-lane** efficient kitchen equipment for your ${profile.sector || 'site'}`,
  water_lane: (profile) =>
    `you were looking at **water-saving** products and fixtures for your ${profile.sector || 'site'}`,
  find_fridge: () => 'you were shortlisting efficient refrigeration options',
  find_combi: () => 'you were comparing efficient combi steamers and ovens',
  find_wok: () => 'you were looking at efficient wok and gas cooking options',
  find_fryer: () => 'you were comparing efficient fryer options',
  find_dishwasher: () => 'you were exploring efficient dishwasher and warewashing options',
  product_search: (profile) =>
    `you were searching the sustainable product catalog for your ${profile.sector || 'site'}`,
  eco_journey: (profile) =>
    `you were planning an eco journey and equipment path for your ${profile.sector || 'site'}`,
  product_grants: () => 'you were checking grants on marketplace product picks',
  recycling: () => 'you were exploring trade-in and replacement equipment paths',
  product_deal_spotlights: () => 'you were reviewing efficient product deal spotlights'
};

const MEDIA_INTENT_TOPICS = {
  daily_brief: () => "you were reading today's sustainability news briefing",
  funding_news: () => 'you were following funding and subsidy headlines',
  policy_news: () => 'you were reading policy and compliance news',
  country_news: (profile) =>
    `you were reading country-specific sustainability news for ${profile.region || 'your region'}`,
  monthly_news: () => 'you were browsing the latest monthly sustainability edition',
  energy_prices: () => 'you were checking how energy prices affect upgrade timing',
  sustainability_map: () => 'you were exploring sustainability map case studies',
  sustainability_map_explained: () => 'you were learning how the sustainability map works',
  energy_examples: () => 'you were looking at energy-saving examples from real sites',
  how_this_helps: () => 'you wanted to know how the latest news applies to your business',
  circular_news: () => 'you were reading circular economy and recycling news',
  tech_news: () => 'you were catching up on green tech news',
  restaurant_videos: () => 'you were watching restaurant sustainability explainers',
  overview: (profile) => `you were exploring sustainability media for your ${profile.sector || 'site'}`
};

const DEALS_INTENT_TOPICS = {
  deals_feed_scan: () => 'you were scanning the live deals feed for offers',
  new_deals: () => 'you were checking new deal highlights this week',
  energy_deals: () => 'you were comparing energy tariff and supply deals',
  water_deals: () => 'you were looking at water-saving deal lanes',
  product_deals: () => 'you were reviewing product deal spotlights',
  sustainability_deals: () => 'you were browsing sustainability lane offers',
  tariff_compare: () => 'you were comparing retail tariffs and packages',
  nl_restaurant_energy: (profile) =>
    `you were checking Netherlands restaurant energy offers for ${profile.sector || 'your site'}`,
  uk_green_tariff: () => 'you were exploring UK green tariff options',
  green_tariff: () => 'you were comparing green tariff packages',
  payback_savings: () => 'you were linking deals to payback and savings',
  eligibility_grants: () => 'you were checking how deals pair with grants'
};

const FINANCE_INTENT_TOPICS = {
  bnpl: () => 'you were exploring BNPL for restaurant equipment',
  equipment_finance: () => 'you were comparing equipment finance and lease paths',
  green_loans: () => 'you were looking at green loan options',
  energy_prices: () => 'you were modelling how energy prices affect upgrade timing',
  price_upgrade_case: () => 'you were building a price-driven upgrade business case',
  compare_tariffs: () => 'you were comparing tariffs before financing upgrades',
  calculators_tools: () => 'you were using finance calculators and audit tools',
  etl_products: () => 'you were stacking finance on ETL-verified equipment picks',
  sustainability_finance_news: () => 'you were reading sustainability finance headlines',
  funding_news: () => 'you were following funding news for finance stacks',
  grants_tab: () => 'you were checking how grants stack with finance paths'
};

const EQUIPMENT_INTENT_TOPICS = {
  lifecycle_cost: () => 'you were comparing lifecycle cost for equipment upgrades',
  etl_verification: () => 'you were checking ETL verification on kitchen equipment',
  deep_dive: () => 'you were using the equipment deep dive for side-by-side compare',
  renovation: (profile) => `you were planning a renovation path for your ${profile.sector || 'site'}`,
  renovation_grants: () => 'you were linking renovation work to grant eligibility',
  kitchen: () => 'you were shortlisting efficient kitchen equipment',
  refrigeration: () => 'you were comparing efficient refrigeration options',
  hvac: () => 'you were exploring HVAC and ventilation upgrades',
  savings_projection: () => 'you were modelling savings projection for an upgrade',
  grants_on_equipment: () => 'you were checking grants on specific equipment picks',
  monitoring_handoff: () => 'you were planning upgrades after reviewing equipment depth'
};

const GRANTS_INTENT_TOPICS = {
  region_filter: (profile) => `you were filtering schemes for ${profile.region || 'your region'}`,
  sector_match: (profile) => `you were matching grants to your ${profile.sector || 'sector'}`,
  equipment: () => 'you were checking equipment-linked grant programmes',
  deadlines: () => 'you were reviewing scheme deadlines',
  compare_schemes: () => 'you were comparing two subsidy programmes',
  nl_hub: () => 'you were using the Netherlands business.gov scheme finder',
  product_grants: () => 'you were checking grants on marketplace products'
};

/** @type {[string, string][]} receivingSlug, fromSlug */
const REFERRAL_WELCOME_PAIRS = [
  ['equipment-agent', 'sustainable-products-agent'],
  ['equipment-agent', 'deals-agent'],
  ['grants-agent', 'media-agent'],
  ['grants-agent', 'sustainable-products-agent'],
  ['grants-agent', 'equipment-agent'],
  ['grants-agent', 'finance-agent'],
  ['grants-agent', 'deals-agent'],
  ['finance-agent', 'deals-agent'],
  ['finance-agent', 'equipment-agent'],
  ['sustainable-products-agent', 'media-agent'],
  ['deals-agent', 'sustainable-products-agent'],
  ['deals-agent', 'media-agent'],
  ['media-agent', 'grants-agent']
];

const SPECIALIST_FROM_SLUGS = new Set([
  'grants-agent',
  'finance-agent',
  'equipment-agent',
  'sustainable-products-agent',
  'deals-agent',
  'media-agent'
]);

/**
 * @param {object} handoff — from sessionStorage / profile.handoff
 * @returns {object|null}
 */
function normalizeHandoffContext(handoff) {
  if (!handoff || typeof handoff !== 'object') return null;
  const fromSlug = String(handoff.fromSlug || '').trim();
  if (!fromSlug) return null;
  return {
    fromSlug,
    fromName: String(handoff.fromName || 'Another specialist').trim(),
    question: String(handoff.question || '').trim(),
    summary: String(handoff.summary || '').trim(),
    topicSummary: String(handoff.topicSummary || handoff.summary || '').trim(),
    fromIntentId: String(handoff.fromIntentId || '').trim(),
    handoffKey: String(handoff.handoffKey || '').trim()
  };
}

function topicFromMap(map, intentId, profile, question, summary) {
  const fn = map[intentId];
  if (fn) return fn(profile);
  if (summary) return summary;
  if (question) return `you asked: ${question}`;
  return '';
}

/**
 * @param {string} fromSlug
 * @param {string} fromIntentId
 * @param {object} profile
 * @param {string} [question]
 * @param {string} [summary]
 */
function buildHandoffTopicSummary(fromSlug, fromIntentId, profile = {}, question = '', summary = '') {
  const intentId = String(fromIntentId || '').trim();
  const sector = profile.sector || 'site';

  if (fromSlug === 'sustainable-products-agent') {
    const line = topicFromMap(PRODUCT_INTENT_TOPICS, intentId, profile, question, summary);
    if (line) return line;
    return `you were exploring sustainable products for your ${sector}`;
  }

  if (fromSlug === 'media-agent') {
    const line = topicFromMap(MEDIA_INTENT_TOPICS, intentId, profile, question, summary);
    if (line) return line;
    return `you were reading sustainability news and examples for your ${sector}`;
  }

  if (fromSlug === 'deals-agent') {
    const line = topicFromMap(DEALS_INTENT_TOPICS, intentId, profile, question, summary);
    if (line) return line;
    return `you were browsing deals and tariff offers for your ${sector}`;
  }

  if (fromSlug === 'finance-agent') {
    const line = topicFromMap(FINANCE_INTENT_TOPICS, intentId, profile, question, summary);
    if (line) return line;
    return `you were exploring finance paths for your ${sector}`;
  }

  if (fromSlug === 'equipment-agent') {
    const line = topicFromMap(EQUIPMENT_INTENT_TOPICS, intentId, profile, question, summary);
    if (line) return line;
    return `you were comparing ETL equipment and renovation options for your ${sector}`;
  }

  if (fromSlug === 'grants-agent') {
    const line = topicFromMap(GRANTS_INTENT_TOPICS, intentId, profile, question, summary);
    if (line) return line;
    return `you were reviewing grants and schemes for your ${sector}`;
  }

  if (summary) return summary;
  if (question) return `you asked: ${question}`;
  return `you were continuing a topic for your ${sector}`;
}

/**
 * @param {string} receivingSlug — e.g. equipment-agent
 * @param {object} handoff
 */
function isReferralWelcomePair(receivingSlug, handoff) {
  const ho = normalizeHandoffContext(handoff);
  if (!ho) return false;
  if (receivingSlug === 'systems-agent' && SPECIALIST_FROM_SLUGS.has(ho.fromSlug)) {
    return true;
  }
  return REFERRAL_WELCOME_PAIRS.some(([recv, from]) => recv === receivingSlug && from === ho.fromSlug);
}

function grantsReferralAngle(fromSlug) {
  const map = {
    'media-agent': 'scheme detail from sustainability news',
    'sustainable-products-agent': 'grants on your product shortlist',
    'equipment-agent': 'kitchen and building retrofit schemes',
    'finance-agent': 'non-repayable support to stack with finance',
    'deals-agent': 'subsidies that pair with offers and tariff timing'
  };
  return map[fromSlug] || 'scheme detail';
}

function listReferralHandoffsLive() {
  const nameBySlug = {
    'grants-agent': 'Andrieus',
    'finance-agent': 'Vincent',
    'equipment-agent': 'Artemis',
    'sustainable-products-agent': 'Zyanne',
    'deals-agent': 'Zara',
    'media-agent': 'Cheryce',
    'systems-agent': 'Edwardo'
  };
  const rows = REFERRAL_WELCOME_PAIRS.map(([recv, from]) => ({
    from: nameBySlug[from] || from,
    to: nameBySlug[recv] || recv,
    pair: `${from} → ${recv}`
  }));
  for (const from of SPECIALIST_FROM_SLUGS) {
    rows.push({
      from: nameBySlug[from] || from,
      to: 'Edwardo',
      pair: `${from} → systems-agent`
    });
  }
  return rows;
}

module.exports = {
  normalizeHandoffContext,
  buildHandoffTopicSummary,
  isReferralWelcomePair,
  grantsReferralAngle,
  listReferralHandoffsLive,
  PRODUCT_INTENT_TOPICS,
  MEDIA_INTENT_TOPICS,
  DEALS_INTENT_TOPICS,
  FINANCE_INTENT_TOPICS,
  EQUIPMENT_INTENT_TOPICS,
  GRANTS_INTENT_TOPICS,
  REFERRAL_WELCOME_PAIRS
};
