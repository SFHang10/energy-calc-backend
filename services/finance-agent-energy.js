const path = require('path');
const fs = require('fs/promises');

const demoPath = path.join(__dirname, '..', 'data', 'energy-ticker-demo.json');

const REGION_TO_MARKET = {
  nl: 'NL',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  pt: 'PT',
  it: 'IT',
  pl: 'PL',
  eu: 'NL'
};

let snapshotCache = null;

async function loadEnergySnapshot() {
  if (snapshotCache) return snapshotCache;
  try {
    const raw = await fs.readFile(demoPath, 'utf8');
    snapshotCache = JSON.parse(raw);
    return snapshotCache;
  } catch (_) {
    snapshotCache = {
      modellingTariffs: {
        electricityEurPerKwh: 0.3,
        gasEurPerKwhThermal: 0.11,
        gasKwhPerM3: 10.55
      },
      allEnergy: [],
      renewableShare: []
    };
    return snapshotCache;
  }
}

function formatChange(changePct) {
  const n = Number(changePct);
  if (!Number.isFinite(n) || n === 0) return 'flat';
  const arrow = n > 0 ? '▲' : '▼';
  return `${arrow}${Math.abs(n).toFixed(1)}%`;
}

function findMarketRow(snapshot, profile = {}) {
  const code = REGION_TO_MARKET[String(profile.region || '').toLowerCase()];
  if (!code) return null;
  return (snapshot.allEnergy || []).find((r) => r.code === code) || null;
}

function formatModellingTariffLine(tariffs) {
  if (!tariffs) return '';
  const elec = Number(tariffs.electricityEurPerKwh);
  const gasKwh = Number(tariffs.gasKwhPerM3) * Number(tariffs.gasEurPerKwhThermal);
  if (!Number.isFinite(elec)) return '';
  const gasPart = Number.isFinite(gasKwh) ? ` · gas ~€${gasKwh.toFixed(2)}/m³` : '';
  return `Site modelling uses **€${elec.toFixed(2)}/kWh** electricity${gasPart} for payback examples.`;
}

function formatWholesaleBullets(snapshot, profile, limit = 4) {
  const code = REGION_TO_MARKET[String(profile.region || '').toLowerCase()];
  const rows = snapshot.allEnergy || [];
  let picked = code ? rows.filter((r) => r.code === code) : [];
  if (!picked.length) picked = rows.slice(0, limit);
  else if (picked.length < limit) {
    const extra = rows.filter((r) => r.code !== code).slice(0, limit - picked.length);
    picked = [...picked, ...extra];
  }
  return picked.slice(0, limit).map((row) => {
    const price = Number(row.priceEurMwh);
    const priceText = Number.isFinite(price) ? `€${price.toFixed(2)}/MWh` : '—';
    return `- **${row.name}** — ${priceText} wholesale (${formatChange(row.changePct)} vs prior)`;
  });
}

function volatilityHint(snapshot, profile) {
  const row = findMarketRow(snapshot, profile);
  const change = row ? Number(row.changePct) : NaN;
  if (Number.isFinite(change) && change > 1) {
    return 'Wholesale prices are **rising** in your selected market — efficient kit lowers the kWh you buy, so upgrades pay back faster when unit costs climb.';
  }
  if (Number.isFinite(change) && change < -1) {
    return 'Wholesale prices are **easing** — still worth upgrading: lower consumption keeps bills down when tariffs rebound, and grants/finance are often time-limited.';
  }
  return 'Prices are **mixed or stable** — combine lower kWh demand (efficient equipment) with grants, BNPL, or green loans so capex is not all upfront.';
}

module.exports = {
  loadEnergySnapshot,
  formatModellingTariffLine,
  formatWholesaleBullets,
  volatilityHint,
  findMarketRow
};
