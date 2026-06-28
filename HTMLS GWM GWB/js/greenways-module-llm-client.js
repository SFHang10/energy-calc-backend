/**
 * Browser client for Greenways module LLM routes (/api/greenways-module/*).
 * Keeps API keys on the server — same ASSISTANT_* stack as chat agents.
 */
(function (global) {
  function resolveApiUrl(pathname) {
    if (/^https?:\/\//i.test(pathname)) return pathname;
    if (global.location && global.location.protocol === 'file:') {
      return 'http://localhost:4000' + pathname;
    }
    return pathname;
  }

  async function postJson(path, body) {
    const res = await fetch(resolveApiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    let data = {};
    try {
      data = await res.json();
    } catch (_) {
      data = {};
    }
    if (!res.ok || data.ok === false) {
      const msg = data.answer || data.error || data.message || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  async function askFinanceFinder(prompt, meta) {
    const data = await postJson('/api/greenways-module/finance-finder/ask', {
      prompt,
      tab: meta && meta.tab,
      country: meta && meta.country,
      meta: meta || {}
    });
    return data.answer || '';
  }

  async function summarizeTariffPack(pack) {
    const data = await postJson('/api/greenways-module/tariff-portal/summarize', pack || {});
    return data.summary || '';
  }

  async function askEquipmentIntelligence(question) {
    return postJson('/api/greenways-module/equipment-intelligence/ask', { question });
  }

  async function askWaterFinder(prompt, meta) {
    const data = await postJson('/api/greenways-module/water-finder/ask', {
      prompt,
      tab: meta && meta.tab,
      country: meta && meta.country,
      meta: meta || {}
    });
    return data.answer || '';
  }

  async function summarizeWaterFinderPack(pack) {
    const data = await postJson('/api/greenways-module/water-finder/summarize', pack || {});
    return data.summary || '';
  }

  global.GreenwaysModuleLlm = {
    resolveApiUrl,
    askFinanceFinder,
    summarizeTariffPack,
    askEquipmentIntelligence,
    askWaterFinder,
    summarizeWaterFinderPack
  };
})(typeof window !== 'undefined' ? window : globalThis);
