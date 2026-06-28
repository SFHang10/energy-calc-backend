/**
 * Server LLM layer for interactive Greenways HTML modules (finance finder, tariff portal, equipment intelligence).
 * Uses the same ASSISTANT_* / per-agent env keys as chat agents — keys never ship to the browser.
 */
const fs = require('fs');
const path = require('path');
const { maybeCallGreenwaysLlm, resolveLlmConfig, isLlmConfigured } = require('./greenways-agent-llm');
const { loadSchemes, rankSchemes, formatSchemeBullets } = require('./greenways-agent-shared');
const { EquipmentIntelligenceService } = require('./equipment-intelligence-service');
const { loadCatalog: loadSustainableCatalog } = require('./sustainable-products-catalog');

const DEALS_FEED_PATH = path.join(__dirname, '..', 'data', 'deals-feed.json');

const TAB_FOCUS = {
  grants: 'grants',
  bnpl: 'finance',
  equipment: 'equipment',
  loans: 'finance',
  compare: 'general'
};

function normalizeRegion(country = '') {
  const c = String(country || '').trim().toLowerCase();
  const map = {
    netherlands: 'nl',
    nl: 'nl',
    uk: 'uk',
    'united kingdom': 'uk',
    germany: 'de',
    de: 'de',
    france: 'fr',
    fr: 'fr',
    belgium: 'be',
    be: 'be',
    spain: 'es',
    es: 'es',
    italy: 'it',
    it: 'it',
    portugal: 'pt',
    pt: 'pt',
    europe: 'eu',
    eu: 'eu'
  };
  return map[c] || c.slice(0, 2) || 'nl';
}

async function callAnthropicWebSearch({ apiKey, model, prompt, maxTokens = 1500 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = String(err?.error?.message || err?.message || '').slice(0, 160);
    } catch (_) {
      detail = '';
    }
    console.warn('Finance finder anthropic web search error:', res.status, detail);
    return '';
  }
  const data = await res.json();
  return (data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n')
    .trim();
}

async function callModuleLlm({ prefix, systemPrompt, userPayload, maxTokens = 1500, rawPrompt, useWebSearch = false }) {
  const cfg = resolveLlmConfig(prefix);
  if (!cfg) return { text: '', source: 'none' };

  if (useWebSearch && cfg.provider === 'anthropic' && !cfg.useOpenRouter && rawPrompt) {
    const text = await callAnthropicWebSearch({
      apiKey: cfg.apiKey,
      model: cfg.model,
      prompt: rawPrompt,
      maxTokens
    });
    if (text) return { text, source: 'anthropic_web_search' };
  }

  const text = await maybeCallGreenwaysLlm({
    systemPrompt,
    userPayload,
    maxTokens,
    prefix
  });
  return { text: text || '', source: text ? 'llm' : 'none' };
}

function catalogueFallbackAnswer(schemes, tab) {
  if (!schemes.length) {
    return {
      ok: false,
      error: 'llm_not_configured',
      answer:
        'Live AI search is not configured on the server yet. Set ASSISTANT_PROVIDER, ASSISTANT_API_KEY, and ASSISTANT_MODEL on Render — or ask Vincent in chat for grounded scheme cards.',
      source: 'none'
    };
  }
  const intro =
    tab === 'bnpl'
      ? 'BNPL and equipment finance — catalogue matches (verify with lenders):'
      : tab === 'loans'
        ? 'Green loan schemes from the Greenways catalogue:'
        : 'Matching grants and schemes from the Greenways catalogue:';
  return {
    ok: true,
    answer: `${intro}\n\n${formatSchemeBullets(schemes, 10)}\n\n_Configure server LLM keys for richer live-search answers. Always verify eligibility on official links._`,
    source: 'catalogue',
    schemesUsed: schemes.length
  };
}

async function askFinanceFinder(body = {}) {
  const prompt = String(body.prompt || '').trim();
  const tab = String(body.tab || 'grants').trim().toLowerCase();
  const country = String(body.country || body.meta?.country || 'Netherlands').trim();
  const meta = body.meta && typeof body.meta === 'object' ? body.meta : {};

  if (!prompt) {
    return { ok: false, error: 'prompt is required.' };
  }

  const profile = {
    region: normalizeRegion(country),
    sector: String(meta.businessType || meta.sector || 'restaurant').toLowerCase(),
    focus: TAB_FOCUS[tab] || 'general'
  };

  const schemes = await loadSchemes();
  const ranked = rankSchemes(schemes, prompt, profile, 14);
  const schemeContext = ranked.map((s) => ({
    id: s.id,
    title: s.title,
    region: s.region,
    type: s.type,
    description: String(s.description || '').slice(0, 240),
    link: Array.isArray(s.links) && s.links[0] ? s.links[0].url : ''
  }));

  const systemPrompt = [
    'You are Vincent, Greenways finance specialist for European hospitality businesses.',
    'Answer in clear prose with headings and bullet lists where helpful.',
    'Prefer Greenways scheme catalogue entries when they match; cite scheme names, regions, and amounts.',
    'Always remind users to verify eligibility on official links before applying.',
    'Year context: 2026. Do not invent scheme IDs not present in greenwaysSchemes unless clearly labelled as general market context.',
    `Active finance finder tab: ${tab}. Country focus: ${country}.`
  ].join(' ');

  const userPayload = { prompt, tab, country, meta, greenwaysSchemes: schemeContext };
  const useWebSearch = process.env.FINANCE_FINDER_WEB_SEARCH !== '0';

  const { text, source } = await callModuleLlm({
    prefix: 'FINANCE_AGENT',
    systemPrompt,
    userPayload,
    maxTokens: 1500,
    rawPrompt: prompt,
    useWebSearch
  });

  if (text) {
    return {
      ok: true,
      answer: text,
      source,
      schemesUsed: schemeContext.length,
      llmConfigured: true
    };
  }

  const fallback = catalogueFallbackAnswer(ranked, tab);
  return { ...fallback, llmConfigured: isLlmConfigured('FINANCE_AGENT') };
}

function heuristicTariffSummary(pack) {
  const deals = pack.deals || [];
  const schemes = pack.schemes || [];
  const country = pack.countryName || pack.country || 'your country';
  const lines = [
    `**Energy pack for ${country}** (${pack.propertyType || 'site'})`,
    '',
    `Indicative annual benchmark: **€${Number(pack.estCost || 0).toLocaleString()}** (${pack.elecUsage || 0} kWh/yr${pack.gasUsage ? ` · ${pack.gasUsage} m³ gas/yr` : ''}). These are catalogue benchmarks — not supplier quotes.`,
    '',
    deals.length
      ? `**${deals.length} curated deal route(s)** from the Greenways feed — open cards for comparison portals and supplier journeys.`
      : 'No energy deal cards matched this region filter — try EU-wide routes or refresh the deals feed.',
    schemes.length
      ? `**${schemes.length} scheme(s)** from schemes.json may stack with tariff switches (verify eligibility).`
      : 'No matching energy schemes in the catalogue for this filter.',
    '',
    '_Configure ASSISTANT_* on the server for an AI narrative over this pack; Vincent and Zara can also open this portal from chat._'
  ];
  return lines.join('\n');
}

async function summarizeTariffPack(body = {}) {
  const pack = body && typeof body === 'object' ? body : {};
  const deals = Array.isArray(pack.deals) ? pack.deals.slice(0, 12) : [];
  const schemes = Array.isArray(pack.schemes) ? pack.schemes.slice(0, 10) : [];

  const systemPrompt = [
    'You are Vincent/Zara, Greenways energy deals specialist.',
    'Summarize the provided energy pack in 3–5 short paragraphs for a hospitality operator.',
    'Reference curated deal cards and scheme catalogue entries from the JSON — do not invent suppliers.',
    'Stress that €/year totals are indicative benchmarks, not live quotes.',
    'Recommend practical next steps: compare tariffs externally, check green contract lens, stack eligible schemes.'
  ].join(' ');

  const userPayload = {
    country: pack.country,
    countryName: pack.countryName,
    propertyType: pack.propertyType,
    postcode: pack.postcode,
    elecUsage: pack.elecUsage,
    gasUsage: pack.gasUsage,
    estCost: pack.estCost,
    priority: pack.priority,
    contractType: pack.contractType,
    deals: deals.map((d) => ({
      title: d.title,
      line: d.line,
      region: d.region,
      tags: d.tags,
      href: d.href
    })),
    schemes: schemes.map((s) => ({
      title: s.title,
      region: s.region,
      type: s.type,
      description: String(s.description || '').slice(0, 180)
    }))
  };

  const { text, source } = await callModuleLlm({
    prefix: 'DEALS_AGENT',
    systemPrompt,
    userPayload,
    maxTokens: 900
  });

  if (text) {
    return { ok: true, summary: text, source, llmConfigured: true };
  }

  return {
    ok: true,
    summary: heuristicTariffSummary({ ...pack, deals, schemes }),
    source: 'heuristic',
    llmConfigured: isLlmConfigured('DEALS_AGENT')
  };
}

const EQUIPMENT_BRANDS = [
  'rational',
  'hobart',
  'electrolux',
  'scotsman',
  'winterhalter',
  'miele',
  'falcon',
  'meiko',
  'unox',
  'convotherm'
];

const EQUIPMENT_TYPES = [
  'combi oven',
  'dishwasher',
  'refrigerator',
  'fryer',
  'ice machine',
  'wok',
  'oven',
  'fridge',
  'freezer'
];

function heuristicExtractEquipment(question) {
  const q = String(question || '').trim();
  if (!q) return {};
  const lower = q.toLowerCase();
  const brand = EQUIPMENT_BRANDS.find((b) => lower.includes(b)) || '';
  const type = EQUIPMENT_TYPES.find((t) => lower.includes(t)) || '';
  let model = '';
  const modelMatch = q.match(/\b([A-Z]{2,}[\s-]?[A-Z0-9]{2,}(?:\s[A-Z0-9]+)?)\b/);
  if (modelMatch) model = modelMatch[1].trim();
  return {
    name: q.slice(0, 120),
    brand: brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '',
    model,
    type
  };
}

async function parseEquipmentQuery(question) {
  const heuristic = heuristicExtractEquipment(question);
  if (!isLlmConfigured('EQUIPMENT_AGENT')) {
    return { params: heuristic, source: 'heuristic' };
  }

  const systemPrompt =
    'Extract restaurant equipment search fields from the user question. Return ONLY valid JSON: {"name":"","brand":"","model":"","type":""}. Use empty strings when unknown. type should be one of: combi oven, dishwasher, refrigerator, fryer, ice machine, or empty.';

  const raw = await maybeCallGreenwaysLlm({
    systemPrompt,
    userPayload: { question },
    maxTokens: 220,
    prefix: 'EQUIPMENT_AGENT'
  });

  if (!raw) return { params: heuristic, source: 'heuristic' };

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { params: heuristic, source: 'heuristic' };
    const parsed = JSON.parse(match[0]);
    return {
      params: {
        name: String(parsed.name || heuristic.name || '').trim(),
        brand: String(parsed.brand || heuristic.brand || '').trim(),
        model: String(parsed.model || heuristic.model || '').trim(),
        type: String(parsed.type || heuristic.type || '').trim()
      },
      source: 'llm'
    };
  } catch (_) {
    return { params: heuristic, source: 'heuristic' };
  }
}

async function askEquipmentIntelligence(body = {}) {
  const question = String(body.question || body.q || '').trim();
  if (!question) {
    return { ok: false, error: 'question is required.' };
  }

  const { params, source: parseSource } = await parseEquipmentQuery(question);
  const service = new EquipmentIntelligenceService();
  const searchResult = service.search(params);

  let summary = '';
  if (isLlmConfigured('EQUIPMENT_AGENT')) {
    const systemPrompt = [
      'You are Artemis, Greenways equipment specialist.',
      'Summarize the equipment intelligence search for a restaurant operator in 2–4 short paragraphs.',
      'Use only facts from searchResult JSON. Mention benchmark range, confidence, and next step (deep dive / alternatives) when present.',
      'If no match, suggest refining brand/model or trying a known example.'
    ].join(' ');

    summary = await maybeCallGreenwaysLlm({
      systemPrompt,
      userPayload: { question, extractedParams: params, parseSource, searchResult },
      maxTokens: 700,
      prefix: 'EQUIPMENT_AGENT'
    });
  }

  if (!summary) {
    if (searchResult.found) {
      const eq = searchResult.equipment || {};
      summary = `Found **${eq.name || 'equipment'}** (${eq.brand || ''} ${eq.model || ''}). Confidence: **${searchResult.confidence || 'medium'}**. Use the structured results below for benchmarks and comparison hints.`;
    } else {
      summary =
        searchResult.message ||
        'No close benchmark match — try a brand + model (e.g. Rational SCC WE 61) or pick a Wok To Walk inventory chip.';
    }
  }

  return {
    ok: true,
    question,
    extractedParams: params,
    parseSource,
    searchResult,
    summary,
    llmConfigured: isLlmConfigured('EQUIPMENT_AGENT')
  };
}

function loadDealsFeedSnapshot() {
  try {
    const raw = fs.readFileSync(DEALS_FEED_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { deals: [] };
  }
}

const WATER_TAB_FOCUS = {
  products: 'water',
  tips: 'water',
  calculator: 'water',
  grants: 'grants'
};

function schemeWaterRelevant(scheme) {
  const blob = (
    (scheme.title || '') +
    ' ' +
    (scheme.description || '') +
    ' ' +
    (Array.isArray(scheme.keywords) ? scheme.keywords.join(' ') : '')
  ).toLowerCase();
  return /water|efficien|rain|irrigation|leak|harvest|conservation|sanitation|drain|waste\s*water|tap|aerator|dish|rinse|shower|flush/i.test(
    blob
  );
}

function rankWaterCatalog(products, query, limit = 8) {
  const tokens = String(query || '')
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  return products
    .map((p) => {
      const hay = [
        p.name,
        p.brand,
        p.model,
        p.type,
        p.summary,
        ...(p.search?.keywords || [])
      ]
        .join(' ')
        .toLowerCase();
      let score = 0;
      if (/water|tap|aerator|dish|rinse|shower|flush|leak|rain|conservation/i.test(hay)) score += 2;
      for (const token of tokens) {
        if (hay.includes(token)) score += 3;
      }
      return { product: p, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.product);
}

function waterCatalogueFallbackAnswer(schemes, catalogRows, tab) {
  const parts = [];
  if (catalogRows.length) {
    parts.push(
      '**Water-saving catalog matches:**\n' +
        catalogRows
          .map(
            (p) =>
              `- **${p.name}**${p.brand ? ` (${p.brand})` : ''} — ${String(p.summary || '').slice(0, 120)}`
          )
          .join('\n')
    );
  }
  if (schemes.length) {
    const intro =
      tab === 'grants'
        ? '**Water-related schemes from Greenways catalogue:**'
        : '**Related water schemes:**';
    parts.push(`${intro}\n${formatSchemeBullets(schemes, 8)}`);
  }
  if (!parts.length) {
    return {
      ok: false,
      error: 'llm_not_configured',
      answer:
        'Live AI search is not configured on the server yet. Set ASSISTANT_* keys on Render — or ask Zyanne in chat for water product and scheme cards.',
      source: 'none'
    };
  }
  return {
    ok: true,
    answer: `${parts.join('\n\n')}\n\n_Configure server LLM keys for richer live-search answers. Always verify products and eligibility on official links._`,
    source: 'catalogue',
    schemesUsed: schemes.length,
    catalogUsed: catalogRows.length
  };
}

async function askWaterFinder(body = {}) {
  const prompt = String(body.prompt || '').trim();
  const tab = String(body.tab || 'products').trim().toLowerCase();
  const country = String(body.country || body.meta?.country || 'Netherlands').trim();
  const meta = body.meta && typeof body.meta === 'object' ? body.meta : {};

  if (!prompt) {
    return { ok: false, error: 'prompt is required.' };
  }

  const profile = {
    region: normalizeRegion(country),
    sector: String(meta.setting || meta.applicant || meta.sector || 'restaurant').toLowerCase(),
    focus: WATER_TAB_FOCUS[tab] || 'water'
  };

  const schemes = (await loadSchemes()).filter(schemeWaterRelevant);
  const rankedSchemes = rankSchemes(schemes, prompt, profile, 14);
  const schemeContext = rankedSchemes.map((s) => ({
    id: s.id,
    title: s.title,
    region: s.region,
    type: s.type,
    description: String(s.description || '').slice(0, 240),
    link: Array.isArray(s.links) && s.links[0] ? s.links[0].url : ''
  }));

  const catalogRows = rankWaterCatalog(loadSustainableCatalog(), prompt, 8).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    model: p.model,
    type: p.type,
    summary: String(p.summary || '').slice(0, 180)
  }));

  const systemPrompt = [
    'You are Zyanne, Greenways sustainable products and water savings specialist.',
    'Answer in clear prose with headings and bullet lists where helpful.',
    'Prefer greenwaysSchemes and waterCatalog entries when they match; cite product names and scheme titles.',
    'Include practical litres saved, payback hints, and retailer or application routes when known.',
    'Always remind users to verify prices, eligibility, and certifications on official links.',
    'Year context: 2026.',
    `Active water finder tab: ${tab}. Country focus: ${country}.`
  ].join(' ');

  const userPayload = { prompt, tab, country, meta, greenwaysSchemes: schemeContext, waterCatalog: catalogRows };
  const useWebSearch = process.env.WATER_FINDER_WEB_SEARCH !== '0';

  const { text, source } = await callModuleLlm({
    prefix: 'SUSTAINABLE_PRODUCTS_AGENT',
    systemPrompt,
    userPayload,
    maxTokens: 1500,
    rawPrompt: prompt,
    useWebSearch
  });

  if (text) {
    return {
      ok: true,
      answer: text,
      source,
      schemesUsed: schemeContext.length,
      catalogUsed: catalogRows.length,
      llmConfigured: true
    };
  }

  const fallback = waterCatalogueFallbackAnswer(rankedSchemes, catalogRows, tab);
  return { ...fallback, llmConfigured: isLlmConfigured('SUSTAINABLE_PRODUCTS_AGENT') };
}

function heuristicWaterPackSummary(pack) {
  const mp = pack.marketplaceMatches || [];
  const ext = pack.externalAlternatives || [];
  const deals = pack.waterDeals || [];
  const schemes = pack.schemes || [];
  return [
    `**Water match pack — ${pack.product || 'query'}** (${pack.country || ''} · ${pack.setting || ''})`,
    '',
    mp.length
      ? `**${mp.length} marketplace SKU(s)** with modelled water deltas — open product pages for grants.`
      : 'No marketplace SKUs matched — try “dishwasher”, “tap aerator”, or a brand name.',
    ext.length ? `**${ext.length} efficient archetype(s)** for benchmarking.` : '',
    deals.length ? `**${deals.length} curated water deal route(s)** from the feed.` : '',
    schemes.length ? `**${schemes.length} water-related scheme(s)** may stack with retrofits.` : '',
    '',
    '_Configure ASSISTANT_* on the server for an AI narrative; Zyanne can also open this finder from chat._'
  ]
    .filter(Boolean)
    .join('\n');
}

async function summarizeWaterFinderPack(body = {}) {
  const pack = body && typeof body === 'object' ? body : {};
  const marketplaceMatches = (Array.isArray(pack.marketplaceMatches) ? pack.marketplaceMatches : []).slice(0, 8);
  const externalAlternatives = (Array.isArray(pack.externalAlternatives) ? pack.externalAlternatives : []).slice(0, 6);
  const waterDeals = (Array.isArray(pack.waterDeals) ? pack.waterDeals : []).slice(0, 8);
  const schemes = (Array.isArray(pack.schemes) ? pack.schemes : []).slice(0, 10);

  const systemPrompt = [
    'You are Zyanne, Greenways water savings specialist.',
    'Summarize this water finder result pack in 3–5 short paragraphs for a hospitality or home operator.',
    'Reference marketplace matches, external archetypes, deal cards, and schemes from the JSON only.',
    'Recommend which lane to open first (marketplace SKU vs grant vs deal route) and one behaviour tip.',
    'Stress that savings figures are modelled — verify with utility bills and suppliers.'
  ].join(' ');

  const userPayload = {
    product: pack.product,
    setting: pack.setting,
    country: pack.country,
    budget: pack.budget,
    focus: pack.focus,
    marketplaceMatches: marketplaceMatches.map((m) => ({
      id: m.id,
      name: m.name,
      brand: m.brand,
      annualWaterSavedLitres: m.savings?.annualWaterSavedLitres,
      annualEstimatedCostSavedEur: m.savings?.annualEstimatedCostSavedEur
    })),
    externalAlternatives: externalAlternatives.map((e) => ({
      name: e.name,
      brand: e.brand,
      summary: String(e.summary || '').slice(0, 160)
    })),
    waterDeals: waterDeals.map((d) => ({ title: d.title, line: d.line, region: d.region })),
    schemes: schemes.map((s) => ({
      title: s.title,
      region: s.region,
      description: String(s.description || '').slice(0, 160)
    }))
  };

  const { text, source } = await callModuleLlm({
    prefix: 'SUSTAINABLE_PRODUCTS_AGENT',
    systemPrompt,
    userPayload,
    maxTokens: 900
  });

  if (text) {
    return { ok: true, summary: text, source, llmConfigured: true };
  }

  return {
    ok: true,
    summary: heuristicWaterPackSummary({ ...pack, marketplaceMatches, externalAlternatives, waterDeals, schemes }),
    source: 'heuristic',
    llmConfigured: isLlmConfigured('SUSTAINABLE_PRODUCTS_AGENT')
  };
}

module.exports = {
  askFinanceFinder,
  summarizeTariffPack,
  askEquipmentIntelligence,
  askWaterFinder,
  summarizeWaterFinderPack,
  isLlmConfigured,
  loadDealsFeedSnapshot
};
