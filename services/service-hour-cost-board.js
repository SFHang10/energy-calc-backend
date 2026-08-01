/**
 * Service-hour cost board — peak vs off-peak / shift effect on kitchen sketch €/mo.
 */
const path = require('path');
const fs = require('fs/promises');

const dataPath = path.join(__dirname, '..', 'data', 'service-hour-cost-board.json');
let cache = null;

async function loadBoard() {
  if (cache) return cache;
  const raw = await fs.readFile(dataPath, 'utf8');
  cache = JSON.parse(raw);
  return cache;
}

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

function enrichLine(line, tariffs) {
  const flat = Number(line.monthlyEurFlat) || 0;
  const peakShare = Math.min(1, Math.max(0, Number(line.peakShare) || 0));
  const shiftableShare = Math.min(1, Math.max(0, Number(line.shiftableShare) || 0));
  const utility = String(line.utility || 'electricity').toLowerCase();
  const isTou = utility === 'electricity';

  if (!isTou) {
    const peakEur = round1(flat * peakShare);
    const offPeakEur = round1(flat - peakEur);
    return {
      ...line,
      monthlyEurFlat: Math.round(flat),
      peakShare,
      shiftableShare,
      isTou: false,
      peakEur,
      offPeakEur,
      touTodayEur: Math.round(flat),
      touShiftedEur: Math.round(flat),
      savingsEur: 0
    };
  }

  const F = Number(tariffs.flatEurPerKwh) || 0.3;
  const P = Number(tariffs.peakEurPerKwh) || 0.38;
  const O = Number(tariffs.offPeakEurPerKwh) || 0.22;
  const kwh = F > 0 ? flat / F : 0;
  const peakKwh = kwh * peakShare;
  const offKwh = kwh * (1 - peakShare);
  const touToday = peakKwh * P + offKwh * O;
  const moved = peakKwh * shiftableShare;
  const touShifted = (peakKwh - moved) * P + (offKwh + moved) * O;

  return {
    ...line,
    monthlyEurFlat: Math.round(flat),
    peakShare,
    shiftableShare,
    isTou: true,
    peakEur: round1(peakKwh * P),
    offPeakEur: round1(offKwh * O),
    peakEurShifted: round1((peakKwh - moved) * P),
    offPeakEurShifted: round1((offKwh + moved) * O),
    touTodayEur: Math.round(touToday),
    touShiftedEur: Math.round(touShifted),
    savingsEur: Math.round(touToday - touShifted)
  };
}

function enrichProfile(profile, tariffs, meta = {}) {
  const lines = (Array.isArray(profile.lines) ? profile.lines : []).map((row) =>
    enrichLine(row, tariffs)
  );
  const flatMonthly = lines.reduce((s, r) => s + (r.monthlyEurFlat || 0), 0);
  const touToday = lines.reduce((s, r) => s + (r.touTodayEur || 0), 0);
  const touShifted = lines.reduce((s, r) => s + (r.touShiftedEur || 0), 0);
  const shiftSavings = Math.max(0, touToday - touShifted);
  const vsFlat = touToday - flatMonthly;

  return {
    ...profile,
    lines,
    totals: {
      flatMonthlyEur: Math.round(flatMonthly),
      flatAnnualEur: Math.round(flatMonthly * 12),
      touTodayMonthlyEur: Math.round(touToday),
      touTodayAnnualEur: Math.round(touToday * 12),
      touShiftedMonthlyEur: Math.round(touShifted),
      touShiftedAnnualEur: Math.round(touShifted * 12),
      shiftSavingsMonthlyEur: Math.round(shiftSavings),
      shiftSavingsAnnualEur: Math.round(shiftSavings * 12),
      touPremiumVsFlatMonthlyEur: Math.round(vsFlat)
    },
    trustNote: meta.trustNote || '',
    tariffNote: meta.tariffNote || ''
  };
}

async function listProfiles() {
  const bundle = await loadBoard();
  return (bundle.profiles || []).map((p) => ({
    id: p.id,
    title: p.title,
    blurb: p.blurb,
    seatsHint: p.seatsHint
  }));
}

async function getServiceHourPayload({ profileId = 'busy-kitchen' } = {}) {
  const bundle = await loadBoard();
  const tariffs = bundle.tariffs || {};
  const profiles = bundle.profiles || [];
  const profile =
    profiles.find((p) => p.id === profileId) ||
    profiles.find((p) => p.id === 'busy-kitchen') ||
    profiles[0];
  if (!profile) return null;
  return {
    ok: true,
    meta: bundle.meta || {},
    tariffs,
    profile: enrichProfile(profile, tariffs, bundle.meta || {}),
    availableProfiles: await listProfiles()
  };
}

module.exports = {
  loadBoard,
  getServiceHourPayload,
  listProfiles,
  enrichProfile,
  enrichLine
};
