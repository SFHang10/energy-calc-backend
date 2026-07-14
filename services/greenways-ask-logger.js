const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOG_PATH = path.join(ROOT, 'data', 'greenways-agent-ask-log.jsonl');
const LOG_PATH_OLD = LOG_PATH.replace(/\.jsonl$/, '.old.jsonl');

const MAX_BYTES = Number(process.env.GREENWAYS_AGENT_ASK_LOG_MAX_BYTES || 2_000_000); // ~2MB
const ENABLED = process.env.GREENWAYS_AGENT_ASK_LOGGING !== '0';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'it', 'its', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'how',
  'when', 'where', 'why', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
  'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'also', 'please', 'tell', 'show', 'give', 'find',
  'help', 'need', 'want', 'like', 'know', 'any', 'there'
]);

function safeText(value, maxLen) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function normalizeQuestionPattern(question) {
  const raw = String(question || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return '';
  const tokens = raw
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .slice(0, 8);
  return safeText(tokens.join(' '), 80);
}

function safeProfile(profile = {}) {
  return {
    region: safeText(profile.region, 32),
    sector: safeText(profile.sector, 64),
    lane: safeText(profile.lane, 24),
    focus: safeText(profile.focus, 80),
    tier: safeText(profile.tier, 32),
    memberId: safeText(profile.memberId, 40),
    siteId: safeText(profile.siteId, 48)
  };
}

function ensureDir() {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function maybeRotate() {
  try {
    if (!fs.existsSync(LOG_PATH)) return;
    const stat = fs.statSync(LOG_PATH);
    if (!stat?.size || stat.size <= MAX_BYTES) return;
    const rotated = LOG_PATH_OLD;
    try {
      if (fs.existsSync(rotated)) fs.unlinkSync(rotated);
    } catch (_err) {
      // ignore
    }
    fs.renameSync(LOG_PATH, rotated);
  } catch (_err) {
    // ignore rotation errors
  }
}

function logAskEvent(event = {}) {
  if (!ENABLED) return;
  try {
    ensureDir();
    maybeRotate();
    const question = event.question != null ? String(event.question) : '';
    const questionNorm = event.questionNorm != null
      ? safeText(event.questionNorm, 80)
      : normalizeQuestionPattern(question);
    const payload = {
      ts: new Date().toISOString(),
      agent: safeText(event.agent, 40),
      ok: Boolean(event.ok),
      source: safeText(event.source, 24),
      intentId: safeText(event.intentId, 80),
      questionLength: question ? Math.min(question.length, 9999) : null,
      questionNorm: questionNorm || '',
      ms: typeof event.ms === 'number' ? Math.round(event.ms) : null,
      profile: safeProfile(event.profile),
      http: {
        ip: safeText(event.ip, 80),
        ua: safeText(event.ua, 160)
      },
      error: event.error ? safeText(event.error, 220) : ''
    };
    fs.appendFileSync(LOG_PATH, `${JSON.stringify(payload)}\n`, 'utf8');
  } catch (_err) {
    // Never break /ask if logging fails
  }
}

function createAskLogger(req, startedAt, profile, question) {
  return function logAsk(partial = {}) {
    logAskEvent({
      ms: Date.now() - startedAt,
      profile,
      ip: req.ip,
      ua: req.headers['user-agent'],
      question,
      ...partial
    });
  };
}

function readLogLinesFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw.split(/\r?\n/).filter(Boolean);
}

function parseLogLines(lines) {
  const items = [];
  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch (_err) {
      // ignore bad lines
    }
  }
  return items;
}

function readAllAskLogItems() {
  const lines = [...readLogLinesFromFile(LOG_PATH_OLD), ...readLogLinesFromFile(LOG_PATH)];
  return parseLogLines(lines);
}

function isMissEvent(event = {}) {
  if (!event) return false;
  if (event.ok === false || event.source === 'error') return true;
  const source = String(event.source || '').toLowerCase();
  if (source === 'fallback' || source === 'heuristic' || source === 'llm') return true;
  if (!event.intentId && source && !source.startsWith('knowledge')) return true;
  return false;
}

function aggregateTopMisses(options = {}) {
  const days = Math.min(30, Math.max(1, Number(options.days) || 7));
  const limit = Math.min(25, Math.max(1, Number(options.limit) || 10));
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const items = readAllAskLogItems().filter((row) => {
    const ts = Date.parse(row.ts || '');
    return Number.isFinite(ts) && ts >= cutoff;
  });

  const buckets = new Map();
  for (const row of items) {
    if (!isMissEvent(row)) continue;
    const agent = row.agent || 'unknown';
    const pattern = row.questionNorm || row.intentId || row.source || 'unknown';
    const key = `${agent}::${pattern}`;
    const prev = buckets.get(key) || {
      agent,
      pattern,
      source: row.source || '',
      intentId: row.intentId || '',
      count: 0,
      lastTs: row.ts || '',
      avgQuestionLength: 0,
      regions: {}
    };
    prev.count += 1;
    if ((row.ts || '') > prev.lastTs) prev.lastTs = row.ts || '';
    if (row.questionLength) {
      prev.avgQuestionLength += row.questionLength;
    }
    const region = row.profile?.region;
    if (region) prev.regions[region] = (prev.regions[region] || 0) + 1;
    buckets.set(key, prev);
  }

  const ranked = [...buckets.values()]
    .map((row) => ({
      ...row,
      avgQuestionLength: row.count ? Math.round(row.avgQuestionLength / row.count) : null,
      topRegion: Object.entries(row.regions).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    }))
    .sort((a, b) => b.count - a.count || String(b.lastTs).localeCompare(String(a.lastTs)))
    .slice(0, limit);

  return {
    ok: true,
    days,
    limit,
    logPath: path.relative(ROOT, LOG_PATH).replace(/\\/g, '/'),
    totalEvents: items.length,
    missEvents: items.filter(isMissEvent).length,
    items: ranked
  };
}

function readRecentAskLogs(limit = 200) {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return { ok: true, logPath: path.relative(ROOT, LOG_PATH).replace(/\\/g, '/'), total: 0, items: [] };
    }
    const raw = fs.readFileSync(LOG_PATH, 'utf8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const slice = lines.slice(Math.max(0, lines.length - limit));
    const items = [];
    for (const line of slice) {
      try {
        items.push(JSON.parse(line));
      } catch (_err) {
        // ignore bad lines
      }
    }
    return {
      ok: true,
      logPath: path.relative(ROOT, LOG_PATH).replace(/\\/g, '/'),
      total: items.length,
      items
    };
  } catch (error) {
    return { ok: false, error: error.message || 'Failed to read logs.' };
  }
}

module.exports = {
  LOG_PATH,
  logAskEvent,
  createAskLogger,
  readRecentAskLogs,
  readAllAskLogItems,
  normalizeQuestionPattern,
  isMissEvent,
  aggregateTopMisses
};

