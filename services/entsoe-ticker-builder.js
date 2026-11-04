/**
 * Build energy ticker arrays from ENTSO-E (day-ahead A44 + generation A75).
 */

const path = require('path');
const fs = require('fs');
const {
  fetchZoneDayAheadPrice,
  fetchZoneRenewableShare,
  entsoeWindowDays,
  entsoeWindowHours
} = require('./entsoe-api');

const ZONES_PATH = path.join(__dirname, '..', 'data', 'energy-ticker-zones.json');
const BATCH_SIZE = 3;

function loadTickerZones() {
  try {
    const raw = JSON.parse(fs.readFileSync(ZONES_PATH, 'utf8'));
    return Array.isArray(raw.zones) ? raw.zones : [];
  } catch (_) {
    return [];
  }
}

async function mapInBatches(items, batchSize, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    out.push(...batchResults);
  }
  return out;
}

async function buildEntsoeTickerPayload(apiKey) {
  if (!apiKey) return null;
  const zones = loadTickerZones();
  if (!zones.length) return null;

  const priceWindow = entsoeWindowDays(2);
  const genWindow = entsoeWindowHours(6);

  const rows = await mapInBatches(zones, BATCH_SIZE, async (zone) => {
    const [priceResult, genResult] = await Promise.all([
      fetchZoneDayAheadPrice(apiKey, zone.domain, priceWindow),
      fetchZoneRenewableShare(apiKey, zone.domain, genWindow)
    ]);
    return { zone, priceResult, genResult };
  });

  const allEnergy = [];
  const renewableShare = [];
  const errors = [];

  for (const { zone, priceResult, genResult } of rows) {
    if (priceResult?.priceEurMwh != null) {
      allEnergy.push({
        code: zone.code,
        name: zone.name,
        priceEurMwh: priceResult.priceEurMwh,
        changePct: priceResult.changePct ?? 0
      });
    } else if (priceResult?.error) {
      errors.push(`${zone.code} price: ${priceResult.error}`);
    }
    if (genResult?.sharePct != null) {
      renewableShare.push({
        code: zone.code,
        name: zone.name,
        sharePct: genResult.sharePct,
        changePct: genResult.changePct ?? 0
      });
    } else if (genResult?.error) {
      errors.push(`${zone.code} gen: ${genResult.error}`);
    }
  }

  if (allEnergy.length < 3 || renewableShare.length < 3) {
    if (errors.length) {
      console.warn('[entsoe-ticker]', errors.slice(0, 5).join(' · '));
    }
    return null;
  }

  return {
    updatedAt: new Date().toISOString(),
    isLive: true,
    source: 'ENTSO-E',
    allEnergy,
    renewableShare,
    entsoeMeta: {
      zonesRequested: zones.length,
      priceRows: allEnergy.length,
      renewableRows: renewableShare.length,
      errors: errors.slice(0, 8)
    }
  };
}

module.exports = {
  buildEntsoeTickerPayload,
  loadTickerZones
};
