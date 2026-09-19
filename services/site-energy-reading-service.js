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

function getEpcCredentials() {
  const email = process.env.EPC_OPEN_DATA_EMAIL || process.env.EPC_API_EMAIL;
  const key = process.env.EPC_OPEN_DATA_API_KEY || process.env.EPC_API_KEY;
  if (!email || !key) return null;
  return { email: String(email).trim(), key: String(key).trim() };
}

function epcAuthHeader(creds) {
  return `Basic ${Buffer.from(`${creds.email}:${creds.key}`).toString('base64')}`;
}

function normalizeEpcRows(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.rows)) return data.rows;
  return [];
}

function epcRowField(row, ...names) {
  if (!row || typeof row !== 'object') return '';
  for (const name of names) {
    if (row[name] != null && row[name] !== '') return row[name];
  }
  const byNorm = {};
  for (const key of Object.keys(row)) {
    byNorm[String(key).toLowerCase().replace(/_/g, '-')] = row[key];
  }
  for (const name of names) {
    const norm = String(name).toLowerCase().replace(/_/g, '-');
    if (byNorm[norm] != null && byNorm[norm] !== '') return byNorm[norm];
  }
  return '';
}

function epcLodgementTime(row) {
  const raw = epcRowField(row, 'lodgement-date', 'lodgement_date', 'LODGEMENT_DATE', 'LODGEMENT-DATE');
  const t = Date.parse(String(raw || ''));
  return Number.isFinite(t) ? t : 0;
}

function isTruthyGasFlag(value) {
  const s = String(value || '')
    .trim()
    .toLowerCase();
  return s === 'y' || s === 'yes' || s === 'true' || s === '1';
}

async function fetchEpcRegisterRows(register, formattedPostcode, creds) {
  const url =
    `https://epc.opendatacommunities.org/api/v1/${register}/search?postcode=` +
    encodeURIComponent(formattedPostcode);
  const data = await fetchJson(url, {
    headers: {
      Accept: 'application/json',
      Authorization: epcAuthHeader(creds)
    }
  });
  return normalizeEpcRows(data).map((row) => ({ ...row, _epcRegister: register }));
}

/**
 * Optional UK heating-fuel hint from MHCLG EPC Open Data.
 * Returns null when keys are missing, the API fails, or there are no usable rows.
 * Never throws to the caller — lookupUk swallows errors around this.
 */
async function lookupUkEpcConnectionHint(postcode) {
  const creds = getEpcCredentials();
  if (!creds) return null;

  const formatted = String(postcode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  if (!formatted) return null;

  const FEW_ROWS = 5;
  const MAX_SAMPLE = 100;

  let nonDomestic = [];
  let domestic = [];
  try {
    nonDomestic = await fetchEpcRegisterRows('non-domestic', formatted, creds);
  } catch (error) {
    console.warn('[site-energy-reading] EPC non-domestic search failed:', error.message || error);
  }

  if (nonDomestic.length < FEW_ROWS) {
    try {
      domestic = await fetchEpcRegisterRows('domestic', formatted, creds);
    } catch (error) {
      console.warn('[site-energy-reading] EPC domestic search failed:', error.message || error);
    }
  }

  const combined = [...nonDomestic, ...domestic]
    .slice()
    .sort((a, b) => epcLodgementTime(b) - epcLodgementTime(a))
    .slice(0, MAX_SAMPLE);

  if (!combined.length) return null;

  let gasLikely = 0;
  let electricHeat = 0;
  let otherFuel = 0;
  let usedNonDomestic = false;
  let usedDomestic = false;

  for (const row of combined) {
    if (row._epcRegister === 'non-domestic') usedNonDomestic = true;
    if (row._epcRegister === 'domestic') usedDomestic = true;

    const fuelText = String(
      epcRowField(
        row,
        'main-fuel',
        'main-heating-fuel',
        'MAINFUEL',
        'MAIN_FUEL',
        'main_fuel',
        'mainheatingfuel'
      ) || ''
    );
    const gasFlag = epcRowField(row, 'mains-gas-flag', 'mains_gas_flag', 'MAINS_GAS_FLAG', 'MAINS-GAS-FLAG');
    const looksGas = isTruthyGasFlag(gasFlag) || /\b(mains\s*)?gas\b/i.test(fuelText);
    const looksElectric = /electric/i.test(fuelText) && !looksGas;

    if (looksGas) gasLikely += 1;
    else if (looksElectric) electricHeat += 1;
    else if (fuelText.trim()) otherFuel += 1;
  }

  const sampleSize = combined.length;
  const gasShare = sampleSize ? gasLikely / sampleSize : 0;
  const electricShare = sampleSize ? electricHeat / sampleSize : 0;
  const gasThreshold = Math.max(1, Math.ceil(sampleSize * 0.35));
  const gasSuggested = gasLikely >= gasThreshold || gasShare > electricShare;

  let register = 'non-domestic';
  if (usedNonDomestic && usedDomestic) register = 'mixed';
  else if (usedDomestic && !usedNonDomestic) register = 'domestic';

  let summary;
  if (gasLikely > 0) {
    summary = `Of ${sampleSize} nearby EPCs, ${gasLikely} list mains gas heating`;
    if (electricHeat > 0) summary += `; ${electricHeat} look electric-heated`;
    if (otherFuel > 0 && !electricHeat) summary += `; ${otherFuel} list other fuels`;
    summary += '.';
  } else if (electricHeat > 0 && electricShare >= 0.5) {
    summary = `Of ${sampleSize} nearby EPCs, ${electricHeat} list electric heating (few or no mains-gas flags).`;
  } else {
    summary = `Of ${sampleSize} nearby EPCs, heating fuel was mixed or unclear — review connections against your bills.`;
  }

  return {
    source: 'uk-epc',
    register,
    sampleSize,
    gasShare: Math.round(gasShare * 1000) / 1000,
    suggested: {
      electricity: true,
      gas: !!gasSuggested,
      water: true
    },
    summary,
    note: 'Hint from open EPC data for this postcode — not a live meter check. Confirm with bills.',
    registerUrl: 'https://find-energy-certificate.service.gov.uk/'
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

  const payload = {
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

  try {
    const hint = await lookupUkEpcConnectionHint(info.postcode);
    if (hint) payload.connectionHint = hint;
  } catch (error) {
    console.warn('[site-energy-reading] EPC connection hint failed:', error.message || error);
  }

  return payload;
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

function entsoeXmlHasError(xml) {
  const text = String(xml || '');
  if (!text.trim()) return 'Empty ENTSO-E response';
  if (/<Acknowledgement_MarketDocument/i.test(text) && !/<TimeSeries>/i.test(text)) {
    const reason = text.match(/<text>([^<]+)<\/text>/i);
    return reason ? reason[1].trim() : 'ENTSO-E returned no data for this window';
  }
  return '';
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

async function lookupEntsoe(countryKey) {
  const cfg = loadConfig().countries[countryKey];
  const apiKey = process.env.ENTSOE_API_KEY;
  if (!apiKey || !cfg?.entsoeDomain) return null;

  try {
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
    const xmlError = entsoeXmlHasError(xml);
    if (xmlError) {
      console.warn('[site-energy-reading] ENTSO-E:', xmlError);
      return null;
    }
    const { mix, intensity } = mixFromEntsoeXml(xml);
    if (!mix.length || !intensity) return null;

    return {
      mix,
      intensity,
      forecastPeriods: [],
      source: 'ENTSO-E',
      live: true
    };
  } catch (error) {
    console.warn('[site-energy-reading] ENTSO-E lookup failed:', error.message || error);
    return null;
  }
}

async function lookupElectricityMaps(geo) {
  const apiKey = process.env.ELECTRICITY_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
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
  } catch (error) {
    console.warn('[site-energy-reading] Electricity Maps lookup failed:', error.message || error);
    return null;
  }
}

function getDataSourceStatus() {
  return {
    entsoe: Boolean(process.env.ENTSOE_API_KEY),
    electricityMaps: Boolean(process.env.ELECTRICITY_MAPS_API_KEY),
    epcOpenData: Boolean(getEpcCredentials()),
    euLiveWhen: 'ENTSO-E gives live generation mix + intensity; Electricity Maps adds forecast when set'
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
    (await lookupEntsoe(countryKey)) ||
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
  intensityToIndex,
  getDataSourceStatus,
  lookupUkEpcConnectionHint
};
