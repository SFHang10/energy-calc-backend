/**
 * Shared LLM fallback when agent knowledge intents do not match.
 * Knowledge path always runs first in routes; this only handles misses.
 */
const { maybeCallGreenwaysLlm, resolveLlmConfig } = require('./greenways-agent-llm');
const {
  loadSchemes,
  rankSchemes,
  toSuggestion,
  conversationalSystemLines,
  meaningForProfile
} = require('./greenways-agent-shared');
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
  formatWholesaleBullets,
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
      'Point users to scheme cards on the right — do NOT list schemes as bullet points in the left column.',
      'Only mention schemes from the provided suggestions JSON.',
      'Explain why a scheme might matter for their profile before naming it.',
      'Offer to explain unfamiliar terms (e.g. MIA/Vamil, Horizon Europe).',
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
      'Summarise payback and finance options conversationally — link tablets carry detail.',
      'Point to finance finder, savings projections, and any scheme or product highlights provided.',
      'Use energyPriceContext when discussing payback or tariffs — do not invent retail bill amounts.',
      'Ask if they want a term explained (BNPL, green loan, unit rate vs standing charge).',
      'Do NOT list items as markdown bullets in the left column.'
    ]
  },
  equipment: {
    name: 'Artemis',
    prefix: 'EQUIPMENT_AGENT',
    role: 'Equipment upgrades and premises renovation specialist',
    instructions: [
      'Explain why an upgrade path matters (lifecycle cost, grants) in plain language.',
      'Reference product highlights and link blocks — not long product lists in the left column.',
      'Suggest equipment deep dive or renovation guides for next steps.',
      'Offer to explain ETL, deep dive, or insulation terms if the user is new to them.'
    ]
  },
  deals: {
    name: 'Zara',
    prefix: 'DEALS_AGENT',
    role: 'Deals, tariffs, and weekly product spotlights specialist',
    instructions: [
      'Match Zara-style tone: short summary left, examples on the right (deal cards / link tablets).',
      'Reference deal highlights and banner cards — energy tariffs vs product spotlights.',
      'Explain why comparing unit rate + contract length beats chasing cheapest headline price.',
      'Point users to Deals.html or the European energy portal when relevant.',
      'Do NOT invent prices or offers not in dealHighlights.'
    ]
  },
  media: {
    name: 'Cheryce',
    prefix: 'MEDIA_AGENT',
    role: 'News, policy, video, and sustainability media specialist',
    instructions: [
      'Summarise news and map context — do NOT list headlines or case studies as bullets in the left column.',
      'Explain how stories or map examples could affect bills, timing, or inspiration for upgrades.',
      'Reference newsItems, videos, and map cards from the payload only.',
      'Offer to explain policy jargon (CBAM, CSRD, Horizon Europe) when it appears.',
      'Put editions, map entries, and tools in link/module blocks — not raw HTML paths in prose.'
    ]
  },
  'sustainable-products': {
    name: 'Zyanne',
    prefix: 'SUSTAINABLE_PRODUCTS_AGENT',
    role: 'Sustainable products finder (water, electricity, gas lanes)',
    instructions: [
      'Keep left column conversational — product rows live in banner cards and link tablets.',
      'Reference productHighlights and the lane field when provided.',
      'Explain why efficient products matter for running costs before listing categories.',
      'Distinguish On Greenways (etl_*) vs market alternatives when shown.',
      'Point to water or sustainable product finders for full search.'
    ]
  },
  systems: {
    name: 'Edwardo',
    prefix: 'SYSTEMS_AGENT',
    role: 'Systems and equipment specialist — monitoring, Greenways dashboard maths, ETL systems savings',
    instructions: [
      'Explain monitoring and dashboard concepts in plain language — offer to define KPIs if needed.',
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
    ...conversationalSystemLines(),
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

function polishAllowlist() {
  const raw = String(process.env.GREENWAYS_AGENT_POLISH_AGENTS || 'finance').trim();
  if (raw === 'all') return null;
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function isPolishEnabled(agentKey) {
  if (process.env.GREENWAYS_AGENT_POLISH === '0') return false;
  const prefix = AGENT_PROFILES[agentKey]?.prefix;
  if (prefix && process.env[`${prefix}_POLISH`] === '0') return false;
  if (process.env.GREENWAYS_AGENT_POLISH === '1') return true;
  const list = polishAllowlist();
  if (list && !list.has(agentKey)) return false;
  return Boolean(resolveLlmConfig(prefix));
}

function slimKnowledgeForPolish(knowledge) {
  return {
    intentId: knowledge.intentId || null,
    suggestions: (knowledge.suggestions || []).slice(0, 6).map((s) => ({
      id: s.id,
      title: s.title,
      region: s.region
    })),
    blockTypes: (knowledge.blocks || []).map((b) => b.type || b.id || 'block').slice(0, 8),
    productCount: (knowledge.productSamples || []).length,
    handoffCount: (knowledge.agentHandoffs || []).length
  };
}

function buildPolishSystemPrompt(agentKey) {
  return [
    buildSystemPrompt(agentKey),
    'TASK: Rewrite originalAnswer only — warmer, clearer, 2–4 short paragraphs.',
    'Do NOT add schemes, products, URLs, prices, or dates not in groundedFacts or originalAnswer.',
    'Do NOT use markdown bullet lists in the reply.',
    'Keep all factual claims from originalAnswer; you may reorder and explain jargon.',
    'Return plain markdown prose only — no JSON wrapper.'
  ].join(' ');
}

/**
 * Optional LLM polish on knowledge hits (launch mode Track A). Blocks/suggestions unchanged.
 */
async function maybePolishKnowledgeAnswer(agentKey, knowledge, question, profile = {}) {
  if (!knowledge?.answer || !isPolishEnabled(agentKey)) return knowledge;

  const polished = await maybeCallGreenwaysLlm({
    prefix: AGENT_PROFILES[agentKey].prefix,
    systemPrompt: buildPolishSystemPrompt(agentKey),
    userPayload: {
      task: 'polish_knowledge_answer',
      question,
      profile,
      originalAnswer: knowledge.answer,
      meaningLine: knowledge.meaningLine || '',
      groundedFacts: slimKnowledgeForPolish(knowledge)
    },
    maxTokens: 700
  });

  const text = String(polished || '').trim();
  if (!text || text.length < 40) return knowledge;

  return {
    ...knowledge,
    answer: text,
    source: knowledge.source === 'knowledge' ? 'knowledge+llm' : knowledge.source
  };
}

function enrichWithMeaning(knowledge, profile, context = {}) {
  if (!knowledge?.answer) return knowledge;
  if (/what this means|for your (business|site|restaurant|profile)/i.test(knowledge.answer)) {
    return knowledge;
  }
  const meaningLine = meaningForProfile(profile, {
    intentId: knowledge.intentId,
    topic: context.topic
  });
  if (!meaningLine) return knowledge;
  return {
    ...knowledge,
    meaningLine,
    answer: `${String(knowledge.answer).trim()}\n\n_${meaningLine}_`
  };
}

/**
 * Standard knowledge-hit response for agent routes (meaning line + optional polish).
 */
async function finishKnowledgeAskResponse(agentKey, knowledge, question, profile = {}, context = {}) {
  if (!knowledge?.answer) return null;
  const withMeaning =
    process.env.GREENWAYS_AGENT_MEANING === '0'
      ? knowledge
      : enrichWithMeaning(knowledge, profile, context);
  const final = await maybePolishKnowledgeAnswer(agentKey, withMeaning, question, profile);
  return {
    ok: true,
    answer: final.answer,
    suggestions: final.suggestions || [],
    blocks: final.blocks || [],
    productSamples: final.productSamples || [],
    agentHandoffs: final.agentHandoffs || [],
    editionChips: final.editionChips || [],
    spokenSummary: final.spokenSummary || '',
    source: final.source || 'knowledge',
    intentId: final.intentId || null,
    meaningLine: final.meaningLine || ''
  };
}

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
  buildGrantsFallback,
  maybePolishKnowledgeAnswer,
  finishKnowledgeAskResponse,
  enrichWithMeaning,
  isPolishEnabled
};
