/**
 * Water Line Sketch — illustrative hospitality water €/mo + m³/mo by line.
 */
const path = require('path');
const fs = require('fs/promises');

const sketchPath = path.join(__dirname, '..', 'data', 'water-line-sketch.json');
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
  const monthlyM3Total = equipment.reduce((sum, row) => sum + (Number(row.monthlyM3) || 0), 0);
  const byLine = {};
  equipment.forEach((row) => {
    const line = String(row.line || 'other').toLowerCase();
    byLine[line] = (byLine[line] || 0) + (Number(row.monthlyEur) || 0);
  });
  const withShare = equipment.map((row) => {
    const monthly = Number(row.monthlyEur) || 0;
    const sharePct = monthlyTotal > 0 ? Math.round((monthly / monthlyTotal) * 100) : 0;
    return {
      ...row,
      monthlyEur: monthly,
      monthlyM3: Number(row.monthlyM3) || 0,
      sharePct
    };
  });
  return {
    ...profile,
    equipment: withShare,
    totals: {
      monthlyEur: Math.round(monthlyTotal),
      annualEur: Math.round(monthlyTotal * 12),
      monthlyM3: Math.round(monthlyM3Total),
      annualM3: Math.round(monthlyM3Total * 12),
      byLine: Object.fromEntries(Object.entries(byLine).map(([k, v]) => [k, Math.round(v)]))
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

async function getWaterSketchPayload({ profileId = 'busy-kitchen' } = {}) {
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
  getWaterSketchPayload,
  listProfiles,
  enrichProfile
};
