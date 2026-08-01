/**
 * Restaurant Energy Sketch — illustrative kitchen setups + €/mo from projection scenarios.
 */
const path = require('path');
const fs = require('fs/promises');

const sketchPath = path.join(__dirname, '..', 'data', 'restaurant-energy-sketch.json');
let cache = null;

async function loadSketch() {
  if (cache) return cache;
  const raw = await fs.readFile(sketchPath, 'utf8');
  cache = JSON.parse(raw);
  return cache;
}

function enrichProfile(profile, meta = {}) {
  const equipment = Array.isArray(profile.equipment) ? profile.equipment : [];
  const monthlyTotal = equipment.reduce((sum, row) => sum + (Number(row.monthlyEur) || 0), 0);
  const byUtility = {};
  equipment.forEach((row) => {
    const u = String(row.utility || 'other').toLowerCase();
    byUtility[u] = (byUtility[u] || 0) + (Number(row.monthlyEur) || 0);
  });
  const withShare = equipment.map((row) => {
    const monthly = Number(row.monthlyEur) || 0;
    const sharePct = monthlyTotal > 0 ? Math.round((monthly / monthlyTotal) * 100) : 0;
    return { ...row, monthlyEur: monthly, sharePct };
  });
  return {
    ...profile,
    equipment: withShare,
    totals: {
      monthlyEur: Math.round(monthlyTotal),
      annualEur: Math.round(monthlyTotal * 12),
      byUtility: Object.fromEntries(
        Object.entries(byUtility).map(([k, v]) => [k, Math.round(v)])
      )
    },
    trustNote: meta.trustNote || '',
    tariffNote: meta.tariffNote || ''
  };
}

async function listProfiles() {
  const bundle = await loadSketch();
  return (bundle.profiles || []).map((p) => ({
    id: p.id,
    title: p.title,
    blurb: p.blurb,
    seatsHint: p.seatsHint
  }));
}

async function getSketchPayload({ profileId = 'busy-kitchen' } = {}) {
  const bundle = await loadSketch();
  const profiles = bundle.profiles || [];
  const profile =
    profiles.find((p) => p.id === profileId) ||
    profiles.find((p) => p.id === 'busy-kitchen') ||
    profiles[0];
  if (!profile) return null;
  return {
    ok: true,
    meta: bundle.meta || {},
    profile: enrichProfile(profile, bundle.meta || {}),
    availableProfiles: await listProfiles()
  };
}

module.exports = {
  loadSketch,
  getSketchPayload,
  listProfiles,
  enrichProfile
};
