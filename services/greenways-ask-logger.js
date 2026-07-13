const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOG_PATH = path.join(ROOT, 'data', 'greenways-agent-ask-log.jsonl');

const MAX_BYTES = Number(process.env.GREENWAYS_AGENT_ASK_LOG_MAX_BYTES || 2_000_000); // ~2MB
const ENABLED = process.env.GREENWAYS_AGENT_ASK_LOGGING !== '0';

function safeText(value, maxLen) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
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
    const rotated = LOG_PATH.replace(/\.jsonl$/, '') + `.old.jsonl`;
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
    const payload = {
      ts: new Date().toISOString(),
      agent: safeText(event.agent, 40),
      ok: Boolean(event.ok),
      source: safeText(event.source, 24),
      intentId: safeText(event.intentId, 80),
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
  readRecentAskLogs
};

