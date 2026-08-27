/**
 * Vincent — daily external headlines from allowlisted official RSS feeds.
 * Output: data/finance-daily-external.json + merge into data/finance-news-rolling.json
 */

const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const axios = require('axios');

const ROOT = path.join(__dirname, '..');
const SOURCES_PATH = path.join(ROOT, 'data', 'finance-external-sources.json');
const DAILY_OUT = path.join(ROOT, 'data', 'finance-daily-external.json');
const ROLLING_OUT = path.join(ROOT, 'data', 'finance-news-rolling.json');

const DEFAULT_FINANCE_RE =
  /energy|climate|finance|grant|loan|eib|cbam|tariff|wholesale|subsidy|invest|sustain|green|carbon|omnibus|budget|fund|electricity|gas|renewable|efficiency|hospitality|restaurant|sme|bank|lending|decarbon/i;

function decodeEntities(text) {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickTag(text, hay) {
  if (/cbam|carbon border|declaration/i.test(hay)) return 'COMPLIANCE';
  if (/fund|grant|eib|loan|subsidy|invest|lending|finance/i.test(hay)) return 'FUNDING';
  if (/price|wholesale|tariff|electricity|gas|energy market/i.test(hay)) return 'PRICES';
  if (/omnibus|eprel|label|policy|regulation|directive/i.test(hay)) return 'POLICY';
  return 'NEWS';
}

function financeAngleFor(hay) {
  if (/grant|fund|subsidy|horizon|eib|loan/i.test(hay)) {
    return 'Funding signal — check Finance finder grants/loans and Andrieus for scheme fit.';
  }
  if (/cbam|carbon|reporting|compliance/i.test(hay)) {
    return 'Compliance cost risk — model payback on verified ETL upgrades and grants stack.';
  }
  if (/price|tariff|wholesale|energy market/i.test(hay)) {
    return 'Price signal — pair wholesale skim on Finance wire with retail tariff compare before contracts.';
  }
  return 'Policy/market signal — map to payback, grants, or green loans on Finance desk.';
}

function itemId(url, title) {
  return crypto.createHash('sha1').update(`${url}|${title}`).digest('hex').slice(0, 16);
}

function parseRssItems(xml, source, financeRe, limit = 20) {
  const items = [];
  const blocks = String(xml).split(/<item[\s>]/i).slice(1);
  for (const block of blocks) {
    if (items.length >= limit) break;
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    const title = decodeEntities(titleMatch ? titleMatch[1] : '');
    const url = decodeEntities(linkMatch ? linkMatch[1] : '').trim();
    if (!title || !url) continue;
    const summary = decodeEntities(descMatch ? descMatch[1] : '').slice(0, 280);
    const hay = `${title} ${summary}`.toLowerCase();
    if (!financeRe.test(hay)) continue;
    const publishedAt = dateMatch ? new Date(decodeEntities(dateMatch[1])).toISOString() : null;
    items.push({
      id: `ext-${source.id}-${itemId(url, title)}`,
      title,
      summary,
      url,
      href: url,
      source: source.name,
      sourceId: source.id,
      region: source.region || 'EU',
      publishedAt: publishedAt && !Number.isNaN(Date.parse(publishedAt)) ? publishedAt : null,
      fetchedAt: new Date().toISOString(),
      tag: pickTag(title, hay),
      financeAngle: financeAngleFor(hay),
      tab: pickTag(title, hay).toLowerCase() === 'funding' ? 'funding' : pickTag(title, hay).toLowerCase() === 'prices' ? 'prices' : 'policy'
    });
  }
  return items;
}

async function fetchFeed(source, financeRe) {
  const response = await axios.get(source.url, {
    timeout: 20000,
    headers: {
      'User-Agent': 'Greenways-Vincent-FinanceBot/1.0 (+https://energy-calc-backend.onrender.com)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*'
    },
    responseType: 'text',
    validateStatus: (s) => s >= 200 && s < 400
  });
  return parseRssItems(response.data, source, financeRe, source.maxItems || 20);
}

async function loadSourcesConfig() {
  try {
    return JSON.parse(await fs.readFile(SOURCES_PATH, 'utf8'));
  } catch (_) {
    return { sources: [], retentionDays: 14, financeKeywords: DEFAULT_FINANCE_RE.source };
  }
}

function buildFinanceRegex(pattern) {
  try {
    return new RegExp(pattern || DEFAULT_FINANCE_RE.source, 'i');
  } catch (_) {
    return DEFAULT_FINANCE_RE;
  }
}

async function mergeRolling(existing, freshItems, retentionDays = 14) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const byUrl = new Map();
  for (const item of [...freshItems, ...(existing?.items || [])]) {
    const key = item.url || item.href || item.id;
    if (!key) continue;
    const ts = Date.parse(item.publishedAt || item.fetchedAt || 0);
    if (Number.isFinite(ts) && ts < cutoff) continue;
    if (!byUrl.has(key)) byUrl.set(key, item);
  }
  const items = [...byUrl.values()].sort((a, b) => {
    const ta = Date.parse(a.publishedAt || a.fetchedAt || 0);
    const tb = Date.parse(b.publishedAt || b.fetchedAt || 0);
    return tb - ta;
  });
  return {
    meta: {
      version: 1,
      updatedAt: new Date().toISOString(),
      retentionDays,
      itemCount: items.length
    },
    items
  };
}

async function buildFinanceExternalNews({ write = true } = {}) {
  const config = await loadSourcesConfig();
  const financeRe = buildFinanceRegex(config.financeKeywords);
  const fetchedAt = new Date().toISOString();
  const briefDate = fetchedAt.slice(0, 10);
  const errors = [];
  const allItems = [];

  for (const source of config.sources || []) {
    try {
      const rows = await fetchFeed(source, financeRe);
      allItems.push(...rows);
    } catch (err) {
      errors.push({ sourceId: source.id, error: err.message });
    }
  }

  allItems.sort((a, b) => {
    const ta = Date.parse(a.publishedAt || a.fetchedAt || 0);
    const tb = Date.parse(b.publishedAt || b.fetchedAt || 0);
    return tb - ta;
  });

  const todayItems = allItems.slice(0, 12);
  let priorRolling = null;
  try {
    priorRolling = JSON.parse(await fs.readFile(ROLLING_OUT, 'utf8'));
  } catch (_) {
    /* first run */
  }

  const rolling = await mergeRolling(priorRolling, allItems, config.retentionDays || 14);

  const dailyPayload = {
    meta: {
      version: 1,
      briefDate,
      fetchedAt,
      ok: errors.length < (config.sources || []).length,
      sourceCount: (config.sources || []).length,
      matchCount: allItems.length,
      errors,
      disclaimer:
        'Headlines from official EU press RSS feeds — finance-framed for hospitality. Verify on source site before acting.'
    },
    items: todayItems
  };

  if (write) {
    await fs.writeFile(DAILY_OUT, `${JSON.stringify(dailyPayload, null, 2)}\n`, 'utf8');
    await fs.writeFile(ROLLING_OUT, `${JSON.stringify(rolling, null, 2)}\n`, 'utf8');
  }

  return { daily: dailyPayload, rolling };
}

async function loadFinanceDailyExternal() {
  try {
    return JSON.parse(await fs.readFile(DAILY_OUT, 'utf8'));
  } catch (_) {
    return null;
  }
}

async function loadFinanceNewsRolling(limit = 20) {
  try {
    const data = JSON.parse(await fs.readFile(ROLLING_OUT, 'utf8'));
    return (data.items || []).slice(0, limit);
  } catch (_) {
    return [];
  }
}

function rollingToStoryShape(item) {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: item.url || item.href,
    financeAngle: item.financeAngle,
    source: item.source,
    publishedAt: item.publishedAt,
    external: true
  };
}

module.exports = {
  DAILY_OUT,
  ROLLING_OUT,
  buildFinanceExternalNews,
  loadFinanceDailyExternal,
  loadFinanceNewsRolling,
  rollingToStoryShape,
  parseRssItems
};
