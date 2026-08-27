/**
 * Staff review queue for Vincent daily headlines (NL RVO + promoted picks).
 */

const path = require('path');
const fs = require('fs/promises');

const ROOT = path.join(__dirname, '..');
const STORE_PATH = path.join(ROOT, 'data', 'finance-headline-candidates.json');

async function readStore() {
  try {
    const parsed = JSON.parse(await fs.readFile(STORE_PATH, 'utf8'));
    return {
      meta: parsed.meta || {},
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates : []
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { meta: {}, candidates: [] };
    }
    throw error;
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const payload = {
    meta: {
      version: 1,
      updatedAt: new Date().toISOString().slice(0, 10),
      ...(store.meta || {})
    },
    candidates: store.candidates || []
  };
  await fs.writeFile(STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

function candidateKey(item) {
  return item.url || item.href || item.id;
}

/**
 * Upsert fetched headlines into the review queue (does not auto-publish).
 */
async function upsertHeadlineCandidates(incoming, { write = true } = {}) {
  const store = await readStore();
  const byKey = new Map();
  for (const c of store.candidates) {
    const key = candidateKey(c);
    if (key) byKey.set(key, c);
  }

  const today = new Date().toISOString().slice(0, 10);
  let added = 0;

  for (const item of incoming || []) {
    const key = candidateKey(item);
    if (!key || !item.title) continue;
    if (byKey.has(key)) {
      const existing = byKey.get(key);
      existing.lastSeenAt = today;
      if (!existing.summary && item.summary) existing.summary = item.summary;
      continue;
    }
    const row = {
      id: item.id || `fh-${key.slice(-16)}`,
      title: item.title,
      summary: item.summary || '',
      url: item.url || item.href,
      href: item.url || item.href,
      source: item.source,
      sourceId: item.sourceId,
      region: item.region || 'NL',
      publishedAt: item.publishedAt || null,
      tag: item.tag || 'NEWS',
      financeAngle: item.financeAngle || '',
      tab: item.tab || 'policy',
      proposedAt: today,
      lastSeenAt: today,
      approved: false,
      promotedAt: null,
      rejectedAt: null,
      notes: ''
    };
    byKey.set(key, row);
    added += 1;
  }

  const candidates = [...byKey.values()].sort((a, b) => {
    const ta = Date.parse(a.publishedAt || a.proposedAt || 0);
    const tb = Date.parse(b.publishedAt || b.proposedAt || 0);
    return tb - ta;
  });

  const next = { ...store, candidates };
  if (write) await writeStore(next);
  return { store: next, added };
}

module.exports = {
  STORE_PATH,
  readStore,
  writeStore,
  upsertHeadlineCandidates
};
