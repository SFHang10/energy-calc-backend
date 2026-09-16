/**
 * Build / refresh data/grants-daily-brief.json
 * - Closing-soon rows always regenerate from schemes.json (live)
 * - Headline / bullets / comingSoon merge from grants-daily-brief.static.json if present,
 *   otherwise keep curated fields already in grants-daily-brief.json
 *
 * Run: node scripts/build-grants-daily-brief.js
 * Later: wire into a daily cron like Vincent's build:finance-daily-review
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCHEMES = path.join(ROOT, 'schemes.json');
const OUT = path.join(ROOT, 'data', 'grants-daily-brief.json');
const STATIC = path.join(ROOT, 'data', 'grants-daily-brief.static.json');

function parseDeadlineValue(deadline) {
  const raw = String(deadline || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}$/.test(raw)) return `${raw}-12-31`;
  return null;
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function formatEu(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return String(iso || '');
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function main() {
  const schemes = readJson(SCHEMES, []);
  const prev = readJson(OUT, {});
  const curated = readJson(STATIC, null) || prev;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 120);

  const closingSoon = [];
  let active = 0;
  (Array.isArray(schemes) ? schemes : []).forEach((scheme) => {
    const status = String(scheme.status || 'active').toLowerCase();
    if (!scheme.status || status === 'active') active += 1;
    const deadline = parseDeadlineValue(scheme.deadline);
    if (!deadline) return;
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) return;
    if (deadlineDate >= today && deadlineDate <= horizon) {
      const days = Math.round((deadlineDate - today) / 86400000);
      closingSoon.push({
        id: scheme.id,
        title: scheme.title || scheme.id,
        region: scheme.region || '',
        deadline,
        deadlineLabel: formatEu(deadline),
        daysLeft: days,
        tag: days <= 30 ? 'CLOSING' : 'DEADLINE'
      });
    }
  });
  closingSoon.sort((a, b) => a.deadline.localeCompare(b.deadline));

  const soonCount = closingSoon.length;
  const nearest = closingSoon[0];
  const autoHeadline = nearest
    ? `${soonCount} scheme deadline${soonCount === 1 ? '' : 's'} in the next 120 days · next: ${nearest.title}`
    : `${active} active schemes in catalogue · no fixed deadlines in the next 120 days`;

  const out = {
    meta: {
      version: 1,
      briefDate: new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      source: 'schemes.json + curated',
      activeSchemes: active,
      closingSoonCount: soonCount,
      disclaimer:
        (curated.meta && curated.meta.disclaimer) ||
        'Catalogue deadlines are live from schemes.json. Coming-soon notes are curated until a full Andrieus refresh pipeline is live.'
    },
    headline: (curated.headline && String(curated.headline).trim()) || autoHeadline,
    bullets: Array.isArray(curated.bullets) && curated.bullets.length
      ? curated.bullets
      : [
          {
            id: 'closing',
            kind: 'deadline',
            text: nearest
              ? `**Closing soon:** ${nearest.title} (${nearest.deadlineLabel || nearest.deadline}) — check official eligibility before the window moves.`
              : 'No fixed catalogue deadlines in the next 120 days — still verify each official scheme page.'
          },
          {
            id: 'action',
            kind: 'action',
            text: 'Open **Scheme Fit** for region + equipment shortlists, or Ask Andrieus to compare two schemes side by side.'
          }
        ],
    closingSoon: closingSoon.slice(0, 6),
    comingSoon: Array.isArray(curated.comingSoon) ? curated.comingSoon : [],
    notes: Array.isArray(curated.notes) ? curated.notes : []
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(
    'Wrote',
    path.relative(ROOT, OUT),
    '· closingSoon',
    out.closingSoon.length,
    '· comingSoon',
    out.comingSoon.length
  );
}

main();
