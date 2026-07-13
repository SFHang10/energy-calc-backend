/**
 * Site energy reading — UK (Carbon Intensity API) + EU NL/ES/PT (geocode + ENTSO-E / Electricity Maps / baseline).
 */

const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'site-energy-reading-config.json');

const INDEX_THRESHOLDS = [
  { key: 'very low', max: 100 },
  { key: 'low', max: 180 },
  { key: 'moderate', max: 280 },
  { key: 'high', max: 380 },
  { key: 'very high', max: Infinity }
];

const EMISSION_FACTORS = {
  biomass: 230,
  coal: 820,
  gas: 490,
  oil: 650,
  nuclear: 12,
  solar: 45,
  wind: 11,
  hydro: 24,
  other: 420,
  unknown: 400
};

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

const FUEL_COLORS = {
  gas: '#c1544c',
  coal: '#7a5c4a',
  biomass: '#a97a3d',
  nuclear: '#8f8f9c',
  hydro: '#4fa097',
  imports: '#93a099',
  other: '#5b655e',
  wind: '#4fa097',
  solar: '#e8a33d',
  oil: '#cf7a3d'
};

let configCache = null;

function loadConfig() {
  if (configCache) return configCache;
  try {
    configCache = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (_) {
    configCache = { countries: {} };
  }
  return configCache;
}

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
}

function extractOutcode(fullPostcode) {
  const cleaned = String(fullPostcode || '').replace(/\s+/g, '').toUpperCase();
  const match = cleaned.match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/);
  return match ? match[1] : cleaned;
}

function intensityToIndex(gco2) {
  const v = Number(gco2);
  if (!Number.isFinite(v)) return 'moderate';
  for (const row of INDEX_THRESHOLDS) {
    if (v <= row.max) return row.key;
  }
  return 'very high';
}

function normalizeCountry(raw) {
  const c = String(raw || '').toLowerCase().trim();
  if (!c || c === 'uk' || c.startsWith('uk')) return 'uk';
  if (c === 'nl' || c.includes('netherlands') || c === 'eu.netherlands') return 'nl';
  if (c === 'es' || c.includes('spain') || c === 'eu.spain') return 'es';
  if (c === 'pt' || c.includes('portugal') || c === 'eu.portugal') return 'pt';
  return c;
}

function kitchenRecommendations(ctx) {
  const idx = ctx.intensity.index;
  const renewableShare = ctx.renewableShare || 0;
  const operator = ctx.grid.operator || 'your network operator';
  const recs = [];

  recs.push({
    title: idx === 'very low' || idx === 'low' ? 'Good window to batch-cook' : 'Batch-cooking timing',
    body:
      idx === 'very low' || idx === 'low'
        ? 'Grid is relatively clean right now — a sensible window to run ovens, combi-steamers or batch prep that can flex.'
        : 'If prep can flex, shifting batch cooking to cleaner overnight or early-morning hours usually lines up with lower grid carbon.'
  });

  recs.push({
    title: 'Refrigeration & walk-ins',
    body:
      renewableShare >= 40
        ? `Renewables are roughly ${Math.round(renewableShare)}% of the current mix — a fair time for scheduled defrost cycles if the unit allows it.`
        : 'Schedule defrost cycles against forecast dips in carbon intensity rather than a fixed daily time.'
  });

  recs.push({
    title: 'Who to call',
    body: `This site sits on the ${operator.split(' (')[0]} network. Save ${ctx.grid.powerCutLine} for outages and safety issues.`
  });

  recs.push({
    title: 'Building-level data',
    body:
      ctx.country === 'uk'
        ? "This reading covers the grid, not the building. Pull the site's Energy Performance Certificate from the official UK register."
        : 'This reading covers the grid zone, not the building. Check your national energy certificate register for the site rating and heating type.'
  });

  return recs;
}

async function fetchJson(url, options = {}) {
  const fetchFn = await getFetch();
  const res = await fetchFn(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchText(url, options = {}) {
  const fetchFn = await getFetch();
  const res = await fetchFn(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function mapUkMix(generationmix = []) {
  return generationmix
    .slice()
    .sort((a, b) => b.perc - a.perc)
    .map((m) => ({
      fuel: m.fuel,
      perc: Number(m.perc) || 0,
      color: FUEL_COLORS[m.fuel] || '#4fa097'
    }));
}

function renewableShareFromMix(mix) {
  const fuels = new Set(['wind', 'solar', 'hydro', 'biomass', 'nuclear']);
  return mix.filter((m) => fuels.has(m.fuel)).reduce((s, m) => s + m.perc, 0);
}

function buildForecastWindow(periods) {
  if (!periods?.length) return null;
  const values = periods.map((p) => p.intensity.forecast).filter((v) => v != null);
  if (!values.length) return null;

  let bestStart = 0;
  let bestAvg = Infinity;
  for (let i = 0; i <= periods.length - 4; i++) {
    const slice = periods.slice(i, i + 4);
    if (slice.some((p) => p.intensity.forecast == null)) continue;
    const avg = slice.reduce((s, p) => s + p.intensity.forecast, 0) / 4;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }

  const fmt = (d) =>
    new Date(d).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/London'
    });

  return {
    start: periods[bestStart].from,
    end: periods[Math.min(bestStart + 3, periods.length - 1)].to,
    startLabel: fmt(periods[bestStart].from),
    endLabel: fmt(periods[Math.min(bestStart + 3, periods.length - 1)].to),
    avgForecast: Math.round(bestAvg)
  };
}

async function lookupUk(postcode) {
  const pcData = await fetchJson(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
  );
  const info = pcData.result;
  if (!info) throw new Error('Postcode not recognised — check it and try again.');

  const outcode = extractOutcode(info.postcode);
  const ciData = await fetchJson(`https://api.carbonintensity.org.uk/regional/postcode/${outcode}`);
  const region = ciData.data && ciData.data[0];
  if (!region) throw new Error('No grid data available for that area.');
  const period = region.data[0];

  const from = new Date().toISOString().split('.')[0] + 'Z';
  let forecastPeriods = [];
  try {
    const fcData = await fetchJson(
      `https://api.carbonintensity.org.uk/regional/intensity/${from}/fw24h/postcode/${outcode}`
    );
    forecastPeriods = (fcData.data && fcData.data[0] && fcData.data[0].data) || [];
  } catch (_) {
    forecastPeriods = [];
  }

  const mix = mapUkMix(period.generationmix || []);
  const forecast = period.intensity.forecast;
  const actual = period.intensity.actual;

  return {
    ok: true,
    region: 'uk',
    country: 'uk',
    postcode: info.postcode,
    locality: {
      label: `${info.postcode} · ${info.admin_district || info.parish || ''} · ${info.region || info.country}`,
      adminDistrict: info.admin_district || '',
      region: info.region || info.country || 'United Kingdom'
    },
    intensity: {
      index: (period.intensity.index || intensityToIndex(forecast)).toLowerCase(),
      forecast,
      actual
    },
    generationMix: mix,
    renewableShare: renewableShareFromMix(mix),
    grid: {
      operator: region.dnoregion || 'UK distribution network',
      zone: region.shortname || 'GB',
      powerCutLine: '105 (free)'
    },
    forecast: {
      periods: forecastPeriods.map((p) => ({
        from: p.from,
        to: p.to,
        intensity: {
          forecast: p.intensity.forecast,
          index: (p.intensity.index || intensityToIndex(p.intensity.forecast)).toLowerCase()
        }
      })),
      bestWindow: buildForecastWindow(forecastPeriods)
    },
    source: 'carbonintensity.org.uk',
    live: true
  };
}

async function geocodeEu(countryKey, postcode) {
  const cfg = loadConfig().countries[countryKey];
  const countryName = cfg?.label || countryKey;
  const q = new URLSearchParams({
    postalcode: String(postcode).trim(),
    country: countryName,
    format: 'json',
    limit: '1'
  });
  const data = await fetchJson(`https://nominatim.openstreetmap.org/search?${q}`, {
    headers: { 'User-Agent': 'GreenwaysMarket-SiteEnergyReading/1.0 (energy-cal-backend)' }
  });
  if (!Array.isArray(data) || !data.length) {
    throw new Error('Postcode not recognised — check format and try again.');
  }
  const hit = data[0];
  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    displayName: hit.display_name,
    city: hit.address?.city || hit.address?.town || hit.address?.village || hit.address?.municipality || ''
  };
}

function mixFromEntsoeXml(xml) {
  const series = [];
  const blocks = xml.split('<TimeSeries>').slice(1);
  for (const block of blocks) {
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
  if (!total) return { mix: [], intensity: null };
  const byFuel = {};
  for (const row of series) {
    byFuel[row.fuel] = (byFuel[row.fuel] || 0) + row.qty;
  }
  const mix = Object.entries(byFuel)
    .map(([fuel, qty]) => ({
      fuel,
      perc: (qty / total) * 100,
      color: FUEL_COLORS[fuel] || '#4fa097'
    }))
    .sort((a, b) => b.perc - a.perc);
  const intensity = mix.reduce((s, m) => s + (m.perc / 100) * (EMISSION_FACTORS[m.fuel] || 400), 0);
  return { mix, intensity: Math.round(intensity) };
}

async function lookupEntsoe(countryKey, geo) {
  const cfg = loadConfig().countries[countryKey];
  const apiKey = process.env.ENTSOE_API_KEY;
  if (!apiKey || !cfg?.entsoeDomain) return null;

  const end = new Date();
  const start = new Date(end.getTime() - 3 * 3600000);
  const fmt = (d) => d.toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const params = new URLSearchParams({
    securityToken: apiKey,
    documentType: 'A75',
    processType: 'A16',
    in_Domain: cfg.entsoeDomain,
    out_Domain: cfg.entsoeDomain,
    periodStart: fmt(start),
    periodEnd: fmt(end)
  });
  const xml = await fetchText(`https://web-api.tp.entsoe.eu/api?${params}`);
  const { mix, intensity } = mixFromEntsoeXml(xml);
  if (!mix.length || !intensity) return null;

  return {
    mix,
    intensity,
    source: 'ENTSO-E',
    live: true
  };
}

async function lookupElectricityMaps(geo) {
  const apiKey = process.env.ELECTRICITY_MAPS_API_KEY;
  if (!apiKey) return null;

  const headers = { 'auth-token': apiKey };
  const latest = await fetchJson(
    `https://api.electricitymaps.com/v3/carbon-intensity/latest?lat=${geo.lat}&lon=${geo.lon}`,
    { headers }
  );
  const forecast = await fetchJson(
    `https://api.electricitymaps.com/v3/carbon-intensity/forecast?lat=${geo.lat}&lon=${geo.lon}`,
    { headers }
  ).catch(() => null);

  const carbon = latest?.carbonIntensity;
  if (carbon == null) return null;

  const mix = (latest.fossilFuelPercentage != null
    ? [
        { fuel: 'wind', perc: Math.max(0, 100 - latest.fossilFuelPercentage - 15), color: FUEL_COLORS.wind },
        { fuel: 'solar', perc: 8, color: FUEL_COLORS.solar },
        { fuel: 'gas', perc: latest.fossilFuelPercentage * 0.65, color: FUEL_COLORS.gas },
        { fuel: 'other', perc: latest.fossilFuelPercentage * 0.35, color: FUEL_COLORS.other }
      ]
    : []
  ).filter((m) => m.perc > 0);

  const forecastPeriods =
    forecast?.forecast?.map((p) => ({
      from: p.datetime,
      to: p.datetime,
      intensity: {
        forecast: p.carbonIntensity,
        index: intensityToIndex(p.carbonIntensity)
      }
    })) || [];

  return {
    mix,
    intensity: Math.round(carbon),
    forecastPeriods,
    source: 'Electricity Maps',
    live: true
  };
}

function lookupBaseline(countryKey) {
  const cfg = loadConfig().countries[countryKey];
  const intensity = cfg.baselineIntensity || 280;
  const renewable = cfg.baselineRenewablePct || 35;
  const fossil = Math.max(0, 100 - renewable);
  const mix = [
    { fuel: 'wind', perc: renewable * 0.45, color: FUEL_COLORS.wind },
    { fuel: 'solar', perc: renewable * 0.25, color: FUEL_COLORS.solar },
    { fuel: 'hydro', perc: renewable * 0.15, color: FUEL_COLORS.hydro },
    { fuel: 'gas', perc: fossil * 0.7, color: FUEL_COLORS.gas },
    { fuel: 'other', perc: fossil * 0.3, color: FUEL_COLORS.other }
  ].filter((m) => m.perc > 1);

  return {
    mix,
    intensity,
    forecastPeriods: [],
    source: 'Greenways zone benchmark (illustrative)',
    live: false
  };
}

async function lookupEu(countryKey, postcode) {
  const cfg = loadConfig().countries[countryKey];
  if (!cfg) throw new Error('Country not supported yet. Use Netherlands, Spain, or Portugal.');

  const geo = await geocodeEu(countryKey, postcode);
  let reading =
    (await lookupElectricityMaps(geo)) ||
    (await lookupEntsoe(countryKey, geo)) ||
    lookupBaseline(countryKey);

  const intensityVal = reading.intensity;
  const index = intensityToIndex(intensityVal);
  const mix = reading.mix;
  const renewableShare = renewableShareFromMix(mix);

  const payload = {
    ok: true,
    region: 'eu',
    country: countryKey,
    postcode: String(postcode).trim(),
    locality: {
      label: `${postcode} · ${geo.city || geo.displayName.split(',')[0]} · ${cfg.label}`,
      adminDistrict: geo.city || '',
      region: cfg.label
    },
    intensity: {
      index,
      forecast: intensityVal,
      actual: intensityVal
    },
    generationMix: mix,
    renewableShare,
    grid: {
      operator: cfg.dsoHint,
      zone: cfg.zoneName,
      powerCutLine: cfg.powerCutHint
    },
    forecast: {
      periods: reading.forecastPeriods || [],
      bestWindow: buildForecastWindow(reading.forecastPeriods || [])
    },
    source: reading.source,
    live: reading.live
  };

  if (!payload.live) {
    payload.note =
      'Illustrative zone benchmark — set ENTSOE_API_KEY or ELECTRICITY_MAPS_API_KEY on Render for live EU grid mix.';
  }

  return payload;
}

async function lookupSiteEnergyReading({ region, country, postcode }) {
  const pc = String(postcode || '').trim();
  if (!pc) throw new Error('Enter a postcode or postal code first.');

  const countryKey = normalizeCountry(country || region);
  const regionMode = countryKey === 'uk' ? 'uk' : 'eu';

  if (regionMode === 'uk') {
    return lookupUk(pc);
  }

  if (!['nl', 'es', 'pt'].includes(countryKey)) {
    throw new Error('Supported EU countries: Netherlands (nl), Spain (es), Portugal (pt).');
  }

  return lookupEu(countryKey, pc);
}

function enrichWithRecommendations(payload) {
  return {
    ...payload,
    recommendations: kitchenRecommendations(payload)
  };
}

module.exports = {
  loadConfig,
  lookupSiteEnergyReading,
  enrichWithRecommendations,
  normalizeCountry,
  intensityToIndex
};
