const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const MEMBERS_DB_PATH = path.join(__dirname, '..', 'database', 'members.db');

function toText(value, max = 120) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function inferRegionFromLocation(locationRaw) {
  const loc = toText(locationRaw, 80).toLowerCase();
  if (!loc) return '';

  // Netherlands / NL
  if (/\b(netherlands|nederland|holland|amsterdam|rotterdam|utrecht|den haag|the hague)\b/.test(loc)) {
    return 'eu.netherlands';
  }
  // UK
  if (/\b(uk|united kingdom|england|scotland|wales|london|manchester|birmingham|edinburgh|glasgow)\b/.test(loc)) {
    return 'uk.england';
  }
  // Ireland
  if (/\b(ireland|dublin|cork)\b/.test(loc)) return 'eu.ireland';
  // Germany
  if (/\b(germany|deutschland|berlin|hamburg|munich|münchen|cologne|köln)\b/.test(loc)) return 'eu.germany';
  // France
  if (/\b(france|paris|lyon|marseille)\b/.test(loc)) return 'eu.france';
  // Spain / Portugal (primary targets for site-energy-reading EU rollouts)
  if (/\b(spain|españa|madrid|barcelona|valencia)\b/.test(loc)) return 'eu.spain';
  if (/\b(portugal|lisbon|lisboa|porto)\b/.test(loc)) return 'eu.portugal';

  return '';
}

function openMembersDb() {
  return new sqlite3.Database(MEMBERS_DB_PATH);
}

function getMemberById(memberId) {
  const idNum = Number(memberId);
  if (!Number.isFinite(idNum) || idNum <= 0) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const db = openMembersDb();
    db.get(
      'SELECT id, subscription_tier, subscription_status, company, job_title, location FROM members WHERE id = ?',
      [idNum],
      (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

/**
 * Best-effort enrichment for agent profile context.
 * - Fail-open (returns input profile if lookup fails)
 * - Does NOT add email/name/phone or any sensitive fields to the chat payload
 */
async function enrichAskProfileWithMember(profile = {}) {
  const out = { ...profile };
  if (!out.memberId) return out;

  try {
    const row = await getMemberById(out.memberId);
    if (!row) return out;

    // Tier/status can come from client, but server lookup is more trustworthy.
    if (!out.tier && row.subscription_tier) out.tier = toText(row.subscription_tier, 32);
    if (!out.status && row.subscription_status) out.status = toText(row.subscription_status, 24);

    // Only fill region/sector when empty; do not overwrite user-selected values.
    if (!out.region) {
      const inferred = inferRegionFromLocation(row.location);
      if (inferred) out.region = inferred;
    }
    if (!out.sector) {
      // Keep this conservative: only fill if it looks like a restaurant/hospitality business.
      const hay = `${row.company || ''} ${row.job_title || ''}`.toLowerCase();
      if (/\b(restaurant|hospitality|cafe|café|kitchen|hotel|bar)\b/.test(hay)) {
        out.sector = 'restaurant';
      }
    }

    return out;
  } catch (_err) {
    return out;
  }
}

module.exports = {
  enrichAskProfileWithMember,
  inferRegionFromLocation
};

