/**
 * Shared optional LLM layer for Greenways chat agents.
 * Knowledge JSON always runs first; this only polishes grounded answers.
 *
 * Env (per agent prefix, e.g. GRANTS_AGENT_, MUSIC_GUIDE_, or shared ASSISTANT_):
 *   {PREFIX}PROVIDER  — cortecs | openrouter | openai | anthropic | openai-compatible
 *   {PREFIX}API_KEY   — Cortecs: JWT from Contl2 .txt; OpenRouter: sk-or-v1-…
 *   {PREFIX}MODEL
 *   {PREFIX}API_BASE  — optional override (Cortecs default https://api.cortecs.ai/v1)
 */

const CORTECS_API_BASE = 'https://api.cortecs.ai/v1';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

function envKey(prefix, suffix) {
  const p = String(prefix || '').trim();
  if (p) {
    const specific = process.env[`${p}_${suffix}`];
    if (specific) return specific;
  }
  return process.env[`ASSISTANT_${suffix}`] || '';
}

function resolveLlmConfig(prefix = '') {
  const provider = String(envKey(prefix, 'PROVIDER') || '').toLowerCase();
  const apiKey = String(envKey(prefix, 'API_KEY') || '').trim();
  const model = String(envKey(prefix, 'MODEL') || '').trim();
  const apiBase = String(envKey(prefix, 'API_BASE') || process.env.OPENROUTER_API_BASE || '').trim();

  if (!provider || !apiKey || !model) {
    return null;
  }

  const isJwtBearer = apiKey.startsWith('eyJ');
  const customBase = apiBase || process.env.ASSISTANT_GATEWAY_BASE || '';

  const useOpenRouter =
    (provider === 'openrouter' || apiKey.startsWith('sk-or-v1-') || apiBase.includes('openrouter.ai')) &&
    !isJwtBearer &&
    provider !== 'cortecs';

  const useCortecs =
    provider === 'cortecs' || (isJwtBearer && provider !== 'openrouter' && !useOpenRouter && !customBase);

  let chatUrl = '';
  if (useCortecs) {
    const base = customBase || CORTECS_API_BASE;
    chatUrl = `${base.replace(/\/$/, '')}/chat/completions`;
  } else if (useOpenRouter) {
    chatUrl = OPENROUTER_CHAT_URL;
  } else if (provider === 'openai' || provider === 'openai-compatible' || isJwtBearer) {
    if (customBase) {
      chatUrl = `${customBase.replace(/\/$/, '')}/chat/completions`;
    } else if (!isJwtBearer) {
      chatUrl = OPENAI_CHAT_URL;
    }
  }

  if (!chatUrl && isJwtBearer) {
    console.warn('Greenways LLM: JWT bearer key set but no API base — set ASSISTANT_PROVIDER=cortecs or ASSISTANT_API_BASE.');
    return null;
  }

  return {
    provider,
    apiKey,
    model,
    useOpenRouter,
    useCortecs,
    isJwtBearer,
    chatUrl
  };
}

async function callAnthropic({ apiKey, model, systemPrompt, userPayload, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(userPayload) }]
    })
  });
  if (!res.ok) {
    console.warn('Greenways LLM anthropic error:', res.status);
    return '';
  }
  const data = await res.json();
  return data?.content?.[0]?.text || '';
}

async function callOpenAiCompatible({
  chatUrl,
  apiKey,
  model,
  systemPrompt,
  userPayload,
  maxTokens,
  useOpenRouter,
  useCortecs
}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  };
  if (useOpenRouter) {
    headers['HTTP-Referer'] =
      process.env.OPENROUTER_HTTP_REFERER || 'https://energy-calc-backend.onrender.com';
    headers['X-OpenRouter-Title'] = process.env.OPENROUTER_APP_TITLE || 'Greenways Agents';
  }

  const body = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userPayload) }
    ]
  };
  if (useCortecs) {
    body.preference = process.env.CORTECS_PREFERENCE || 'balanced';
  }

  const providerLabel = useCortecs ? 'cortecs' : useOpenRouter ? 'openrouter' : 'openai';

  const res = await fetch(chatUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = String(errJson?.error?.message || errJson?.error || errJson?.message || '').slice(0, 160);
    } catch (_) {
      try {
        detail = String(await res.text()).slice(0, 160);
      } catch (_) {
        detail = '';
      }
    }
    console.warn(
      'Greenways LLM chat error:',
      res.status,
      providerLabel,
      `model=${model}`,
      detail || ''
    );
    return '';
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

/**
 * @param {object} opts
 * @param {string} opts.systemPrompt
 * @param {object} opts.userPayload — grounded facts only (schemes, venues, products…)
 * @param {number} [opts.maxTokens]
 * @param {string} [opts.prefix] — e.g. GRANTS_AGENT, MUSIC_GUIDE
 */
async function maybeCallGreenwaysLlm({ systemPrompt, userPayload, maxTokens = 900, prefix = '' }) {
  const cfg = resolveLlmConfig(prefix);
  if (!cfg) return '';

  try {
    if (cfg.provider === 'anthropic' && !cfg.useOpenRouter) {
      return await callAnthropic({
        apiKey: cfg.apiKey,
        model: cfg.model,
        systemPrompt,
        userPayload,
        maxTokens
      });
    }

    if (cfg.provider === 'openrouter' || cfg.provider === 'openai' || cfg.provider === 'openai-compatible' || cfg.provider === 'cortecs' || cfg.useOpenRouter || cfg.isJwtBearer) {
      if (!cfg.chatUrl) return '';
      return await callOpenAiCompatible({
        chatUrl: cfg.chatUrl,
        apiKey: cfg.apiKey,
        model: cfg.model,
        systemPrompt,
        userPayload,
        maxTokens,
        useOpenRouter: cfg.useOpenRouter,
        useCortecs: cfg.useCortecs
      });
    }

    return '';
  } catch (error) {
    console.warn('Greenways LLM call failed:', error.message);
    return '';
  }
}

function isLlmConfigured(prefix = '') {
  return Boolean(resolveLlmConfig(prefix));
}

module.exports = {
  resolveLlmConfig,
  maybeCallGreenwaysLlm,
  isLlmConfigured
};
