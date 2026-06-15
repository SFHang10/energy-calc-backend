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
    const fn = PRODUCT_INTENT_TOPICS[intentId];
    if (fn) return fn(profile);
    if (summary) return summary;
    if (question) return `you asked: ${question}`;
    return `you were exploring sustainable products for your ${sector}`;
  }

  if (fromSlug === 'media-agent') {
    const fn = MEDIA_INTENT_TOPICS[intentId];
    if (fn) return fn(profile);
    if (summary) return summary;
    if (question) return `you asked: ${question}`;
    return `you were reading sustainability news and examples for your ${sector}`;
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
  if (receivingSlug === 'equipment-agent' && ho.fromSlug === 'sustainable-products-agent') return true;
  if (receivingSlug === 'grants-agent' && ho.fromSlug === 'media-agent') return true;
  return false;
}

module.exports = {
  normalizeHandoffContext,
  buildHandoffTopicSummary,
  isReferralWelcomePair,
  PRODUCT_INTENT_TOPICS,
  MEDIA_INTENT_TOPICS
};
