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
const { upsertHeadlineCandidates } = require('./finance-headline-candidates');

const RVO_BASE = 'https://www.rvo.nl';

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
  if (/fund|grant|eib|loan|subsidy|subsidie|invest|lending|finance/i.test(hay)) return 'FUNDING';
  if (/price|wholesale|tariff|electricity|gas|energy market/i.test(hay)) return 'PRICES';
  if (/omnibus|eprel|label|policy|regulation|directive/i.test(hay)) return 'POLICY';
  return 'NEWS';
}

function financeAngleFor(hay) {
  if (/boiler upgrade|bus grant|warm home|ecr|energy bills rebate|net zero/i.test(hay)) {
    return 'UK funding signal — cross-check schemes.json UK rows, BUS/ECO grants, and Finance finder.';
  }
  if (/grant|fund|subsidy|subsidie|horizon|eib|loan/i.test(hay)) {
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

function buildExternalItem(source, { title, url, summary, publishedAtRaw }) {
  if (!title || !url) return null;
  const summaryText = decodeEntities(summary || '').slice(0, 280);
  const hay = `${title} ${summaryText}`.toLowerCase();
  const publishedAt = publishedAtRaw ? new Date(decodeEntities(publishedAtRaw)).toISOString() : null;
  const tag = pickTag(title, hay);
  const tab = tag.toLowerCase() === 'funding' ? 'funding' : tag.toLowerCase() === 'prices' ? 'prices' : 'policy';
  return {
    id: `ext-${source.id}-${itemId(url, title)}`,
    title,
    summary: summaryText,
    url,
    href: url,
    source: source.name,
    sourceId: source.id,
    region: source.region || 'EU',
    publishedAt: publishedAt && !Number.isNaN(Date.parse(publishedAt)) ? publishedAt : null,
    fetchedAt: new Date().toISOString(),
    tag,
    financeAngle: financeAngleFor(hay),
    tab
  };
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
    const summary = descMatch ? descMatch[1] : '';
    const hay = `${title} ${decodeEntities(summary)}`.toLowerCase();
    if (!financeRe.test(hay)) continue;
    const row = buildExternalItem(source, {
      title,
      url,
      summary,
      publishedAtRaw: dateMatch ? dateMatch[1] : null
    });
    if (row) items.push(row);
  }
  return items;
}

function parseAtomItems(xml, source, financeRe, limit = 20) {
  const items = [];
  const blocks = String(xml).split(/<entry[\s>]/i).slice(1);
  for (const block of blocks) {
    if (items.length >= limit) break;
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch =
      block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ||
      block.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i) ||
      block.match(/<link[^>]*href=["']([^"']+)["']/i);
    const summaryMatch = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    const dateMatch =
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
    const title = decodeEntities(titleMatch ? titleMatch[1] : '');
    const url = decodeEntities(linkMatch ? linkMatch[1] : '').trim();
    const summary = summaryMatch ? summaryMatch[1] : '';
    const hay = `${title} ${decodeEntities(summary)}`.toLowerCase();
    if (!financeRe.test(hay)) continue;
    const row = buildExternalItem(source, {
      title,
      url,
      summary,
      publishedAtRaw: dateMatch ? dateMatch[1] : null
    });
    if (row) items.push(row);
  }
  return items;
}

async function fetchXmlFeed(source, financeRe) {
  const response = await axios.get(source.url, {
    timeout: 20000,
    headers: {
      'User-Agent': 'Greenways-Vincent-FinanceBot/1.0 (+https://energy-calc-backend.onrender.com)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
    },
    responseType: 'text',
    validateStatus: (s) => s >= 200 && s < 400
  });
  const type = String(source.type || 'rss').toLowerCase();
  const limit = source.maxItems || 20;
  if (type === 'atom') return parseAtomItems(response.data, source, financeRe, limit);
  return parseRssItems(response.data, source, financeRe, limit);
}

async function fetchFeed(source, financeRe) {
  return fetchXmlFeed(source, financeRe);
}

function rvoArticleUrl(row) {
  const rel = String(row.url || '').trim();
  if (!rel) return `${RVO_BASE}/nieuws`;
  return rel.startsWith('http') ? rel : `${RVO_BASE}${rel.startsWith('/') ? '' : '/'}${rel}`;
}

function mapExternalRow(source, row, financeRe) {
  const title = decodeEntities(row.title);
  const summary = decodeEntities(row.summary || row.intro || '').slice(0, 280);
  const url = row.url || row.href;
  if (!title || !url) return null;
  const hay = `${title} ${summary}`.toLowerCase();
  if (!financeRe.test(hay)) return null;
  const publishedAt = row.publishedAt || row.changed || row.created || null;
  const iso =
    publishedAt && !Number.isNaN(Date.parse(publishedAt)) ? new Date(publishedAt).toISOString() : null;
  return {
    id: row.id || `ext-${source.id}-${itemId(url, title)}`,
    title,
    summary,
    url,
    href: url,
    source: source.name,
    sourceId: source.id,
    region: source.region || 'EU',
    publishedAt: iso,
    fetchedAt: new Date().toISOString(),
    tag: pickTag(title, hay),
    financeAngle: financeAngleFor(hay),
    tab: pickTag(title, hay).toLowerCase() === 'funding' ? 'funding' : pickTag(title, hay).toLowerCase() === 'prices' ? 'prices' : 'policy'
  };
}

async function fetchRvoArticles(source, financeRe) {
  const response = await axios.get(`${RVO_BASE}/api/v1/opendata/articles`, {
    timeout: 25000,
    params: { limit: source.maxItems || 40 },
    headers: {
      'User-Agent': 'Greenways-Vincent-FinanceBot/1.0 (+https://energy-calc-backend.onrender.com)',
      Accept: 'application/json'
    },
    validateStatus: (s) => s >= 200 && s < 400
  });
  const items = [];
  for (const row of response.data || []) {
    const mapped = mapExternalRow(
      source,
      {
        ...row,
        url: rvoArticleUrl(row),
        summary: row.intro
      },
      financeRe
    );
    if (mapped) items.push(mapped);
  }
  return items;
}

function parseStaticItems(source) {
  const fetchedAt = new Date().toISOString();
  return (source.items || []).map((row) => {
    const title = decodeEntities(row.title);
    const summary = decodeEntities(row.summary || '').slice(0, 280);
    const url = row.url || row.href;
    const hay = `${title} ${summary}`.toLowerCase();
    return {
      id: row.id || `ext-${source.id}-${itemId(url, title)}`,
      title,
      summary,
      url,
      href: url,
      source: source.name,
      sourceId: source.id,
      region: source.region || 'NL',
      publishedAt: row.publishedAt || fetchedAt,
      fetchedAt,
      tag: row.tag || pickTag(title, hay),
      financeAngle: row.financeAngle || financeAngleFor(hay),
      tab: row.tab || 'funding',
      static: true
    };
  });
}

async function fetchSource(source, financeRe) {
  const type = String(source.type || 'rss').toLowerCase();
  if (type === 'rvo-articles') return fetchRvoArticles(source, financeRe);
  if (type === 'static') return parseStaticItems(source);
  if (type === 'atom' || type === 'rss') return fetchXmlFeed(source, financeRe);
  return fetchFeed(source, financeRe);
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

async function buildFinanceExternalNews({ write = true, upsertCandidates = true } = {}) {
  const config = await loadSourcesConfig();
  const financeRe = buildFinanceRegex(config.financeKeywords);
  const fetchedAt = new Date().toISOString();
  const briefDate = fetchedAt.slice(0, 10);
  const errors = [];
  const autoItems = [];
  const queueItems = [];

  for (const source of config.sources || []) {
    try {
      const rows = await fetchSource(source, financeRe);
      if (source.autoPublish === false) {
        queueItems.push(...rows);
      } else {
        autoItems.push(...rows);
      }
    } catch (err) {
      errors.push({ sourceId: source.id, error: err.message });
    }
  }

  const sortByDate = (a, b) => {
    const ta = Date.parse(a.publishedAt || a.fetchedAt || 0);
    const tb = Date.parse(b.publishedAt || b.fetchedAt || 0);
    return tb - ta;
  };
  autoItems.sort(sortByDate);
  queueItems.sort(sortByDate);

  let priorRolling = null;
  try {
    priorRolling = JSON.parse(await fs.readFile(ROLLING_OUT, 'utf8'));
  } catch (_) {
    /* first run */
  }

  const rolling = await mergeRolling(priorRolling, autoItems, config.retentionDays || 14);

  const todayItems = [...rolling.items]
    .sort((a, b) => {
      if (a.staffPromoted && !b.staffPromoted) return -1;
      if (!a.staffPromoted && b.staffPromoted) return 1;
      return sortByDate(a, b);
    })
    .slice(0, 12);

  let candidateUpsert = { added: 0 };
  if (upsertCandidates && queueItems.length) {
    candidateUpsert = await upsertHeadlineCandidates(queueItems, { write });
  }

  const dailyPayload = {
    meta: {
      version: 1,
      briefDate,
      fetchedAt,
      ok: errors.length < (config.sources || []).length,
      sourceCount: (config.sources || []).length,
      matchCount: autoItems.length + queueItems.length,
      autoPublishCount: autoItems.length,
      queueCount: queueItems.length,
      candidatesAdded: candidateUpsert.added || 0,
      errors,
      disclaimer:
        'Headlines from official EU, EIB, RVO, and business.gov.nl sources — finance-framed for hospitality. NL rows may await staff review. Verify on source site before acting.'
    },
    items: todayItems
  };

  if (write) {
    await fs.writeFile(DAILY_OUT, `${JSON.stringify(dailyPayload, null, 2)}\n`, 'utf8');
    await fs.writeFile(ROLLING_OUT, `${JSON.stringify(rolling, null, 2)}\n`, 'utf8');
  }

  return { daily: dailyPayload, rolling, queueItems, candidateUpsert };
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
  parseRssItems,
  parseAtomItems,
  fetchSource,
  mergeRolling
};
