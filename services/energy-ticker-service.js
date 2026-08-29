/**
 * Shared energy ticker payload for /api/energy-ticker and finance wire snapshot.
 */
const demoEnergyTickerData = {
  allEnergy: [
    { code: 'FR', name: 'France', priceEurMwh: 101.31, changePct: -2.5 },
    { code: 'ES', name: 'Spain', priceEurMwh: 101.54, changePct: -2.2 },
    { code: 'PT', name: 'Portugal', priceEurMwh: 101.54, changePct: -2.1 },
    { code: 'DE', name: 'Germany', priceEurMwh: 156.17, changePct: 1.2 },
    { code: 'NL', name: 'Netherlands', priceEurMwh: 122.76, changePct: -1.2 },
    { code: 'IT', name: 'Italy', priceEurMwh: 142.24, changePct: -0.3 },
    { code: 'PL', name: 'Poland', priceEurMwh: 141.0, changePct: 0.0 },
    { code: 'SE1', name: 'Sweden SE1', priceEurMwh: 160.5, changePct: 2.3 },
    { code: 'DK1', name: 'Denmark West', priceEurMwh: 163.26, changePct: 1.6 },
    { code: 'NO1', name: 'Norway SE1', priceEurMwh: 138.26, changePct: 0.3 }
  ],
  renewableShare: [
    { code: 'FR', name: 'France', sharePct: 52.4, changePct: 0.8 },
    { code: 'ES', name: 'Spain', sharePct: 61.1, changePct: 1.2 },
    { code: 'PT', name: 'Portugal', sharePct: 67.3, changePct: 0.5 },
    { code: 'DE', name: 'Germany', sharePct: 58.4, changePct: -1.2 },
    { code: 'NL', name: 'Netherlands', sharePct: 39.8, changePct: -0.4 },
    { code: 'IT', name: 'Italy', sharePct: 45.2, changePct: 0.1 },
    { code: 'PL', name: 'Poland', sharePct: 27.6, changePct: 0.2 },
    { code: 'SE1', name: 'Sweden SE1', sharePct: 74.9, changePct: 0.6 },
    { code: 'DK1', name: 'Denmark West', sharePct: 69.8, changePct: 0.4 },
    { code: 'NO1', name: 'Norway SE1', sharePct: 96.2, changePct: 0.1 }
  ]
};

const CACHE_MS = Number(process.env.ENERGY_TICKER_CACHE_MS || 30 * 60 * 1000);
let cache = { at: 0, data: null };

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const nodeFetch = await import('node-fetch');
    return nodeFetch.default;
  } catch (_) {
    return null;
  }
}

function resolveExternalUrl(urlTemplate, apiKey) {
  if (!urlTemplate) return null;
  if (apiKey) return urlTemplate.replace('{API_KEY}', apiKey);
  return urlTemplate;
}

async function fetchJsonFromUrl(url) {
  if (!url) return null;
  const fetchFn = await getFetch();
  if (!fetchFn) return null;
  const response = await fetchFn(url);
  if (!response.ok) return null;
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

async function buildEnergyTickerPayload({ bypassCache = false } = {}) {
  const now = Date.now();
  if (!bypassCache && cache.data && now - cache.at < CACHE_MS) {
    return cache.data;
  }

  const sourceUrl = process.env.ENERGY_TICKER_URL;
  const entsoeApiKey = process.env.ENTSOE_API_KEY;
  const entsoePriceUrl = resolveExternalUrl(process.env.ENTSOE_PRICE_URL, entsoeApiKey);
  const entsoeRenewableUrl = resolveExternalUrl(process.env.ENTSOE_RENEWABLE_URL, entsoeApiKey);
  let payload = null;

  if (entsoePriceUrl || entsoeRenewableUrl) {
    const [priceData, renewableData] = await Promise.all([
      fetchJsonFromUrl(entsoePriceUrl),
      fetchJsonFromUrl(entsoeRenewableUrl)
    ]);
    const allEnergy = priceData?.allEnergy || priceData;
    const renewableShare = renewableData?.renewableShare || renewableData;
    if (Array.isArray(allEnergy) && Array.isArray(renewableShare)) {
      payload = {
        updatedAt: new Date().toISOString(),
        isLive: true,
        source: 'ENTSO-E',
        allEnergy,
        renewableShare
      };
    }
  } else if (sourceUrl) {
    const externalData = await fetchJsonFromUrl(sourceUrl);
    if (externalData && externalData.allEnergy && externalData.renewableShare) {
      payload = {
        updatedAt: externalData.updatedAt || new Date().toISOString(),
        isLive: true,
        source: sourceUrl,
        allEnergy: externalData.allEnergy,
        renewableShare: externalData.renewableShare
      };
    }
  }

  if (!payload) {
    payload = {
      updatedAt: new Date().toISOString(),
      isLive: false,
      source: sourceUrl || entsoePriceUrl || entsoeRenewableUrl || 'demo',
      allEnergy: demoEnergyTickerData.allEnergy,
      renewableShare: demoEnergyTickerData.renewableShare
    };
  }

  cache = { at: now, data: payload };
  return payload;
}

module.exports = {
  buildEnergyTickerPayload,
  demoEnergyTickerData
};
