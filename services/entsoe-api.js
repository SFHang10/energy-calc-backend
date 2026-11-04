/**
 * Shared ENTSO-E Transparency API helpers (XML over REST).
 */

const ENTSOE_API_BASE = 'https://web-api.tp.entsoe.eu/api';

const PSR_TO_FUEL = {
  B01: 'biomass',
  B02: 'biomass',
  B03: 'other',
  B04: 'gas',
  B05: 'coal',
  B06: 'oil',
  B09: 'other',
  B10: 'gas',
  B11: 'gas',
  B12: 'hydro',
  B14: 'nuclear',
  B15: 'other',
  B16: 'solar',
  B17: 'other',
  B18: 'wind',
  B19: 'wind',
  B20: 'other'
};

const RENEWABLE_FUELS = new Set(['wind', 'solar', 'hydro', 'biomass']);

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
}

function entsoePeriodFmt(date) {
  return date.toISOString().replace(/[-:T]/g, '').slice(0, 12);
}

function entsoeXmlHasError(xml) {
  const text = String(xml || '');
  if (!text.trim()) return 'Empty ENTSO-E response';
  if (/<Acknowledgement_MarketDocument/i.test(text) && !/<TimeSeries>/i.test(text)) {
    const reason = text.match(/<text>([^<]+)<\/text>/i);
    return reason ? reason[1].trim() : 'ENTSO-E returned no data for this window';
  }
  return '';
}

async function fetchEntsoeXml(apiKey, queryParams) {
  if (!apiKey) return { error: 'Missing ENTSOE_API_KEY' };
  const params = new URLSearchParams({ securityToken: apiKey, ...queryParams });
  const fetchFn = await getFetch();
  if (!fetchFn) return { error: 'fetch unavailable' };
  try {
    const response = await fetchFn(`${ENTSOE_API_BASE}?${params}`, {
      headers: { Accept: 'application/xml' }
    });
    const xml = await response.text();
    if (!response.ok) {
      return { error: `ENTSO-E HTTP ${response.status}`, xml: xml.slice(0, 400) };
    }
    const xmlError = entsoeXmlHasError(xml);
    if (xmlError) return { error: xmlError, xml: xml.slice(0, 400) };
    return { xml };
  } catch (error) {
    return { error: error.message || String(error) };
  }
}

function parseA44PricePoints(xml) {
  const items = [];
  for (const block of String(xml).split('<TimeSeries>').slice(1)) {
    for (const period of block.split('<Period>').slice(1)) {
      const startMatch = period.match(/<start>([^<]+)<\/start>/i);
      const startMs = startMatch ? Date.parse(startMatch[1]) : 0;
      for (const pm of period.matchAll(
        /<Point>[\s\S]*?<position>(\d+)<\/position>[\s\S]*?<price\.amount>([\d.]+)<\/price\.amount>/gi
      )) {
        const price = Number(pm[2]);
        if (!Number.isFinite(price)) continue;
        items.push({ startMs, position: Number(pm[1]), price });
      }
    }
  }
  items.sort((a, b) => a.startMs - b.startMs || a.position - b.position);
  return items;
}

function priceSummaryFromPoints(points) {
  if (!points.length) return null;
  const latest = points[points.length - 1].price;
  const prevSlice = points.length > 24 ? points.slice(-48, -24) : points.slice(0, Math.max(1, points.length - 1));
  const prevAvg =
    prevSlice.reduce((s, p) => s + p.price, 0) / Math.max(1, prevSlice.length);
  const changePct = prevAvg > 0 ? ((latest - prevAvg) / prevAvg) * 100 : 0;
  return {
    priceEurMwh: Math.round(latest * 100) / 100,
    changePct: Math.round(changePct * 10) / 10
  };
}

function renewableSharePctFromA75Xml(xml) {
  const series = [];
  for (const block of String(xml).split('<TimeSeries>').slice(1)) {
    const psrMatch = block.match(/<psrType>([^<]+)<\/psrType>/);
    const psr = psrMatch ? psrMatch[1].trim() : 'B20';
    const fuel = PSR_TO_FUEL[psr] || 'other';
    const qtyMatches = [...block.matchAll(/<quantity>([\d.]+)<\/quantity>/g)];
    if (!qtyMatches.length) continue;
    const qty = qtyMatches.reduce((s, m) => s + Number(m[1]), 0);
    if (qty <= 0) continue;
    series.push({ fuel, qty });
  }
  const total = series.reduce((s, r) => s + r.qty, 0);
  if (!total) return null;
  const renewableQty = series
    .filter((r) => RENEWABLE_FUELS.has(r.fuel))
    .reduce((s, r) => s + r.qty, 0);
  const sharePct = (renewableQty / total) * 100;
  return Math.round(sharePct * 10) / 10;
}

async function fetchZoneDayAheadPrice(apiKey, domain, { periodStart, periodEnd }) {
  const result = await fetchEntsoeXml(apiKey, {
    documentType: 'A44',
    processType: 'A01',
    in_Domain: domain,
    out_Domain: domain,
    periodStart,
    periodEnd
  });
  if (result.error) return { error: result.error };
  const points = parseA44PricePoints(result.xml);
  const summary = priceSummaryFromPoints(points);
  if (!summary) return { error: 'No price points in A44 response' };
  return summary;
}

async function fetchZoneRenewableShare(apiKey, domain, { periodStart, periodEnd }) {
  const result = await fetchEntsoeXml(apiKey, {
    documentType: 'A75',
    processType: 'A16',
    in_Domain: domain,
    out_Domain: domain,
    periodStart,
    periodEnd
  });
  if (result.error) return { error: result.error };
  const sharePct = renewableSharePctFromA75Xml(result.xml);
  if (sharePct == null) return { error: 'No generation mix in A75 response' };
  return { sharePct, changePct: 0 };
}

function entsoeWindowDays(daysBack = 2) {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 24 * 3600000);
  return {
    periodStart: entsoePeriodFmt(start),
    periodEnd: entsoePeriodFmt(end)
  };
}

function entsoeWindowHours(hoursBack = 6) {
  const end = new Date();
  const start = new Date(end.getTime() - hoursBack * 3600000);
  return {
    periodStart: entsoePeriodFmt(start),
    periodEnd: entsoePeriodFmt(end)
  };
}

module.exports = {
  fetchEntsoeXml,
  entsoeXmlHasError,
  entsoePeriodFmt,
  parseA44PricePoints,
  priceSummaryFromPoints,
  renewableSharePctFromA75Xml,
  fetchZoneDayAheadPrice,
  fetchZoneRenewableShare,
  entsoeWindowDays,
  entsoeWindowHours
};
