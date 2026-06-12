/**
 * Shared LLM fallback when agent knowledge intents do not match.
 * Knowledge path always runs first in routes; this only handles misses.
 */
const { maybeCallGreenwaysLlm } = require('./greenways-agent-llm');
const { loadSchemes, rankSchemes, toSuggestion } = require('./greenways-agent-shared');
const {
  pickProductSamples: pickGrantsProductSamples,
  getDefaultProductSamples: getGrantsDefaultSamples,
  loadBriefing,
  buildMediaHandoffAnswer
} = require('./grants-agent-knowledge');
const { spokenSummary, applyPersona, loadAgentVoice } = require('./greenways-agent-persona');
const path = require('path');
const grantsVoicePath = path.join(__dirname, '..', 'data', 'grants-agent-voice.json');
const {
  pickFinanceSamples,
  getDefaultProductSamples: getFinanceDefaultSamples
} = require('./finance-agent-knowledge');
const {
  loadEnergySnapshot,
  formatModellingTariffLine,
  volatilityHint
} = require('./finance-agent-energy');
const {
  pickEquipmentSamples,
  getDefaultProductSamples: getEquipmentDefaultSamples
} = require('./equipment-agent-knowledge');
const {
  pickDealSamples,
  getDefaultProductSamples: getDealsDefaultSamples
} = require('./deals-agent-knowledge');
const {
  loadFullNewsCatalog,
  pickMediaSamples,
  getDefaultProductSamples: getMediaDefaultSamples
} = require('./media-agent-knowledge');
const { rankNewsItems } = require('./media-news-loader');
const { getVideosForAgent } = require('./wix-media-service');
const {
  pickProductSamples: pickSustainableSamples,
  getDefaultProductSamples: getSustainableDefaultSamples,
  detectLane
} = require('./sustainable-products-agent-knowledge');
const {
  getDefaultStatusSamples,
  getDefaultConsumerSamples,
  runChecks
} = require('./systems-agent-knowledge');

const AGENT_PROFILES = {
  grants: {
    name: 'Andrieus',
    prefix: 'GRANTS_AGENT',
    role: 'Grants & schemes specialist',
    instructions: [
      'Explain what you found and point the user to the scheme cards on the right — do NOT list schemes as bullet points.',
      'Only mention schemes from the provided suggestions JSON.',
      'Greenways primary markets are Netherlands and UK — prefer those when profile.region is empty or nl.',
      'For breaking news or policy headlines, say Cheryce (Media agent) covers that depth — do not invent recent announcements.',
      'Remind them gently to verify eligibility on official links.'
    ]
  },
  finance: {
    name: 'Vincent',
    prefix: 'FINANCE_AGENT',
    role: 'Finance, BNPL, green loans, and energy prices specialist',
    instructions: [
      'Point to finance finder, savings projections, and any scheme or product highlights provided.',
      'Use energyPriceContext when discussing payback or tariffs — do not invent retail bill amounts.',
      'Do NOT list items as markdown bullets; keep the left column conversational.'
    ]
  },
  equipment: {
    name: 'Artemis',
    prefix: 'EQUIPMENT_AGENT',
    role: 'Equipment upgrades and premises renovation specialist',
    instructions: [
      'Reference product highlights and any related schemes when provided.',
      'Suggest equipment deep dive or renovation guides for next steps.',
      'Do NOT list products as bullet points in the left column.'
    ]
  },
  deals: {
    name: 'Zara',
    prefix: 'DEALS_AGENT',
    role: 'Deals, tariffs, and weekly product spotlights specialist',
    instructions: [
      'Reference deal highlights and banner cards — energy tariffs vs product spotlights.',
      'Point users to Deals.html or the European energy portal when relevant.',
      'Do NOT invent prices or offers not in dealHighlights.'
    ]
  },
  media: {
    name: 'Cheryce',
    prefix: 'MEDIA_AGENT',
    role: 'News, policy, video, and sustainability media specialist',
    instructions: [
      'Reference newsItems and videos from the payload only.',
      'Mention sustainability map or full news editions when helpful.',
      'Do NOT list headlines as bullets in the left column.'
    ]
  },
  'sustainable-products': {
    name: 'Zyanne',
    prefix: 'SUSTAINABLE_PRODUCTS_AGENT',
    role: 'Sustainable products finder (water, electricity, gas lanes)',
    instructions: [
      'Reference productHighlights and the lane field when provided.',
      'Distinguish On Greenways (etl_*) vs market alternatives when shown.',
      'Point to water or sustainable product finders for full search.'
    ]
  },
  systems: {
    name: 'Edwardo',
    prefix: 'SYSTEMS_AGENT',
    role: 'Systems and equipment specialist — monitoring, Greenways dashboard maths, ETL systems savings',
    instructions: [
      'Explain Greenways energy dashboard KPIs and site-energy-model tariffs (€/kWh, gas m³, water).',
      'Cover time-of-use: peak vs off-peak and batch timing for restaurants and homes.',
      'Link equipment deep dive and ETL examples to euro savings, not just percentages.',
      'Note dashboard embed is in development on Render — maths and HTML pages still apply.',
      'For ops health questions only: summarise healthChecks; Verify selected is read-only.'
    ]
  }
};

function buildSystemPrompt(agentKey) {
  const profile = AGENT_PROFILES[agentKey];
  if (!profile) throw new Error(`Unknown agent key: ${agentKey}`);
  return [
    `You are ${profile.name}, the Greenways ${profile.role}.`,
    'Write a short friendly intro (2–4 sentences) for the LEFT column only.',
    'Use plain language; prefer Netherlands and UK hospitality context when profile.region is nl or uk or empty.',
    ...profile.instructions
  ].join(' ');
}

function slimProducts(samples) {
  return (samples || []).slice(0, 6).map((p) => ({
    id: p.id,
    name: p.name,
    label: p.label || '',
    subcategory: p.subcategory || '',
    topGrants: p.topGrants || []
  }));
}

function slimNews(items) {
  return (items || []).slice(0, 6).map((n) => ({
    title: n.title || n.name,
    category: n.newsCategory || n.category,
    edition: n.edition,
    summary: String(n.summary || n.description || '').slice(0, 140)
  }));
}

function slimVideos(videos) {
  return (videos || []).slice(0, 4).map((v) => ({
    title: v.title,
    category: v.category,
    videoUrl: v.videoUrl || v.url
  }));
}

function slimChecks(results) {
  return (results || []).slice(0, 8).map((r) => ({
    id: r.id,
    label: r.label,
    status: r.status,
    summary: r.summary
  }));
}

async function callAgentLlm(agentKey, question, profile, userPayload) {
  return maybeCallGreenwaysLlm({
    prefix: AGENT_PROFILES[agentKey].prefix,
    systemPrompt: buildSystemPrompt(agentKey),
    userPayload: { question, profile, ...userPayload },
    maxTokens: 900
  });
}

const NEWS_QUESTION_RE = /\b(news|headline|announced|policy update|recently launched|new scheme|in the press|media coverage|appearing on the market)\b/i;

async function enrichGrantsSpoken(payload, question, profile, intentId) {
  const voice = await loadAgentVoice(grantsVoicePath);
  applyPersona(payload, {
    voice,
    intentId: intentId || 'default',
    profile,
    question,
    staticTips: [],
    tip: ''
  });
  if (!payload.spokenSummary && payload.answer) {
    payload.spokenSummary = spokenSummary(payload.answer, voice.spokenMaxWords || 45);
  }
  return payload;
}

async function buildGrantsFallback(question, profile) {
  const briefing = await loadBriefing();
  if (NEWS_QUESTION_RE.test(question)) {
    const handoff = buildMediaHandoffAnswer(question, briefing, '');
    const productSamples = await pickGrantsProductSamples(question, profile, 3);
    return enrichGrantsSpoken({
      ok: true,
      answer: handoff.answer,
      suggestions: [],
      blocks: [],
      productSamples,
      agentHandoffs: handoff.agentHandoffs || [],
      source: 'knowledge'
    }, question, profile, 'grant_news');
  }

  const schemes = await loadSchemes();
  const ranked = rankSchemes(schemes, question, profile, 8);
  const picked = ranked.length ? ranked : schemes.filter((s) => s.priority).slice(0, 6);
  const suggestions = picked.map(toSuggestion);
  const productSamples = await pickGrantsProductSamples(question, profile, 3);
  const heuristicAnswer =
    `Thanks for your question. I matched **${picked.length}** scheme${picked.length === 1 ? '' : 's'} from our catalogue that may fit what you are looking for.\n\n` +
    'The cards on the right have summaries and official links — and you can always ask a follow-up if you want help narrowing down.';
  const llmAnswer = await callAgentLlm('grants', question, profile, { suggestions });
  return enrichGrantsSpoken({
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions,
    blocks: [],
    productSamples,
    agentHandoffs: [],
    source: llmAnswer ? 'llm' : 'heuristic'
  }, question, profile, 'default');
}

async function buildFinanceFallback(question, profile) {
  const schemes = await loadSchemes();
  const ranked = rankSchemes(schemes, question, profile, 6);
  const suggestions = (ranked.length ? ranked : schemes.filter((s) => s.priority).slice(0, 4)).map(toSuggestion);
  const productSamples = await pickFinanceSamples(question, profile, 3);
  const snapshot = await loadEnergySnapshot();
  const energyPriceContext = {
    modellingTariff: formatModellingTariffLine(snapshot),
    volatility: volatilityHint(snapshot, profile)
  };
  const heuristicAnswer =
    `I could not match a finance intent for "${question}". ` +
    'Try asking about **BNPL**, **green loans**, **energy prices**, or open the **finance finder** — ' +
    'or browse related schemes on the right if any match your upgrade.';
  const llmAnswer = await callAgentLlm('finance', question, profile, {
    suggestions,
    productHighlights: slimProducts(productSamples),
    energyPriceContext
  });
  return {
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions,
    blocks: [],
    productSamples,
    source: llmAnswer ? 'llm' : 'heuristic'
  };
}

async function buildEquipmentFallback(question, profile) {
  const schemes = await loadSchemes();
  const ranked = rankSchemes(schemes, question, profile, 4);
  const suggestions = ranked.map(toSuggestion);
  const productSamples = await pickEquipmentSamples(question, profile, 3);
  const heuristicAnswer =
    `No equipment intent matched "${question}". Try **kitchen equipment**, **refrigeration**, **renovation**, **insulation**, or the **equipment deep dive**.`;
  const llmAnswer = await callAgentLlm('equipment', question, profile, {
    suggestions,
    productHighlights: slimProducts(productSamples)
  });
  return {
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions,
    blocks: [],
    productSamples,
    source: llmAnswer ? 'llm' : 'heuristic'
  };
}

async function buildDealsFallback(question, profile) {
  const productSamples = await pickDealSamples(question, profile, 3);
  const dealHighlights = productSamples.map((s) => ({
    id: s.id,
    title: s.name,
    category: s.subcategory,
    region: s.region,
    label: s.label
  }));
  const heuristicAnswer =
    `No deals intent matched "${question}". Try **product spotlights**, **energy tariffs**, **NL restaurant rates**, or open **Deals.html**.`;
  const llmAnswer = await callAgentLlm('deals', question, profile, { dealHighlights });
  return {
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions: [],
    blocks: [],
    productSamples,
    source: llmAnswer ? 'llm' : 'heuristic'
  };
}

async function buildMediaFallback(question, profile) {
  const catalog = await loadFullNewsCatalog();
  const newsItems = slimNews(rankNewsItems(catalog.items || [], question, 8));
  let videos = [];
  try {
    const videoResult = await getVideosForAgent();
    videos = slimVideos(videoResult.videos || []);
  } catch (_) {
    videos = [];
  }
  const productSamples = await pickMediaSamples(question, profile, 3);
  const heuristicAnswer =
    `No news or media matches for "${question}". Try **policy**, **funding**, **monthly news**, **tech news**, **Wix videos**, or the **sustainability map**.`;
  const llmAnswer = await callAgentLlm('media', question, profile, {
    newsItems,
    videos,
    mediaHighlights: slimProducts(productSamples)
  });
  return {
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions: [],
    blocks: [],
    editionChips: [],
    productSamples,
    source: llmAnswer ? 'llm' : 'heuristic'
  };
}

async function buildSustainableProductsFallback(question, profile) {
  const lane = detectLane(question, profile);
  const profileWithLane = { ...profile, lane };
  const productSamples = await pickSustainableSamples(question, profileWithLane, 3);
  const heuristicAnswer =
    `No product finder match for "${question}". Try **water savings**, **efficient fridge**, **gas fryer**, or open the **product finder**.`;
  const llmAnswer = await callAgentLlm('sustainable-products', question, profileWithLane, {
    lane,
    productHighlights: slimProducts(productSamples)
  });
  return {
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions: [],
    blocks: [],
    productSamples,
    lane,
    source: llmAnswer ? 'llm' : 'heuristic'
  };
}

async function buildSystemsFallback(question, profile) {
  const { buildConsumerOverviewAnswer } = require('./systems-agent-monitoring');
  const productSamples = await getDefaultConsumerSamples(3);
  const heuristic = await buildConsumerOverviewAnswer(profile || {}, '');
  const heuristicAnswer = heuristic.answer || `Ask me about **monitoring**, **restaurant sensors**, or **home energy visibility**.`;
  const llmAnswer = await callAgentLlm('systems', question, profile || {}, {
    monitoringFocus: profile?.sector || 'restaurant',
    productHighlights: slimProducts(productSamples),
    dashboardTariffs: (await require('./systems-agent-dashboard').loadDashboardMath()).tariffs
  });
  return {
    ok: true,
    answer: llmAnswer || heuristicAnswer,
    suggestions: [],
    blocks: heuristic.blocks || [],
    productSamples,
    agentHandoffs: heuristic.agentHandoffs || [],
    source: llmAnswer ? 'llm' : 'heuristic'
  };
}

const FALLBACK_BUILDERS = {
  grants: buildGrantsFallback,
  finance: buildFinanceFallback,
  equipment: buildEquipmentFallback,
  deals: buildDealsFallback,
  media: buildMediaFallback,
  'sustainable-products': buildSustainableProductsFallback,
  systems: buildSystemsFallback
};

async function buildAgentAskFallback(agentKey, question, profile = {}) {
  const builder = FALLBACK_BUILDERS[agentKey];
  if (!builder) {
    throw new Error(`No LLM fallback builder for agent: ${agentKey}`);
  }
  return builder(question, profile);
}

function normalizeAskProfile(body) {
  return {
    region: String(body?.profile?.region || '').trim(),
    sector: String(body?.profile?.sector || '').trim(),
    focus: String(body?.profile?.focus || '').trim(),
    lane: String(body?.profile?.lane || '').trim().toLowerCase()
  };
}

module.exports = {
  AGENT_PROFILES,
  buildAgentAskFallback,
  normalizeAskProfile,
  buildGrantsFallback
};
