/**
 * Lightweight read-only health checks for Systems Agent.
 * Uses file stats + small JSON heads — never loads FULL-DATABASE-5554.json.
 */

const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const PATHS = {
  schemes: path.join(ROOT, 'schemes.json'),
  productsGrants: path.join(ROOT, 'products-with-grants.json'),
  productsGrantsBundle: path.join(ROOT, 'products-with-grants-and-collection.json'),
  catalog: path.join(ROOT, 'data', 'sustainable-products-catalog.json'),
  dealsFeed: path.join(ROOT, 'data', 'deals-feed.json'),
  newsKb: path.join(ROOT, 'data', 'news-category-knowledge.json'),
  checksConfig: path.join(ROOT, 'data', 'systems-agent-checks.json')
};

const AGENT_PAGES = [
  { id: 'grants', path: 'HTMLS GWM GWB/greenways-grants-agent.html', route: '/greenways/grants-agent' },
  { id: 'finance', path: 'HTMLS GWM GWB/greenways-finance-agent.html', route: '/greenways/finance-agent' },
  { id: 'equipment', path: 'HTMLS GWM GWB/greenways-equipment-agent.html', route: '/greenways/equipment-agent' },
  { id: 'deals', path: 'HTMLS GWM GWB/greenways-deals-agent.html', route: '/greenways/deals-agent' },
  { id: 'media', path: 'HTMLS GWM GWB/greenways-media-agent.html', route: '/greenways/media-agent' },
  { id: 'products', path: 'HTMLS GWM GWB/greenways-sustainable-products-agent.html', route: '/greenways/sustainable-products-agent' },
  { id: 'systems', path: 'HTMLS GWM GWB/greenways-systems-agent.html', route: '/greenways/systems-agent' }
];

function readHead(filePath, bytes = 8192) {
  if (!fs.existsSync(filePath)) return '';
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const n = fs.readSync(fd, buf, 0, bytes, 0);
    return buf.slice(0, n).toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

function parseIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysSince(date) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function statusFromAge(days, warnAfter, staleAfter) {
  if (days === null) return 'unknown';
  if (days <= warnAfter) return 'ok';
  if (days <= staleAfter) return 'warn';
  return 'stale';
}

function makeResult(id, label, status, summary, details = {}) {
  return {
    id,
    label,
    status,
    summary,
    checkedAt: new Date().toISOString(),
    ...details
  };
}

async function loadChecksConfig() {
  try {
    return JSON.parse(await fsPromises.readFile(PATHS.checksConfig, 'utf8'));
  } catch (_) {
    return { checks: [], staleDays: {} };
  }
}

async function checkServer() {
  return makeResult(
    'server',
    'API server',
    'ok',
    'Systems Agent API is running on this host.',
    { note: 'Use /health on Render for production uptime.' }
  );
}

async function checkGrants() {
  if (!fs.existsSync(PATHS.schemes)) {
    return makeResult('grants', 'Grants & schemes', 'error', 'schemes.json not found.');
  }

  let schemes;
  try {
    const raw = await fsPromises.readFile(PATHS.schemes, 'utf8');
    schemes = JSON.parse(raw);
  } catch (e) {
    return makeResult('grants', 'Grants & schemes', 'error', `Cannot read schemes.json: ${e.message}`);
  }

  const active = Array.isArray(schemes)
    ? schemes.filter((s) => s.status !== 'retired')
    : [];
  const schemesMtime = fs.statSync(PATHS.schemes).mtime;

  const productsPath = fs.existsSync(PATHS.productsGrantsBundle)
    ? PATHS.productsGrantsBundle
    : PATHS.productsGrants;
  if (!fs.existsSync(productsPath)) {
    return makeResult('grants', 'Grants & schemes', 'warn', `${active.length} schemes on file — product export missing.`, {
      schemesCount: active.length,
      action: 'Run node product-grants-integrator.js'
    });
  }

  const head = readHead(productsPath, 12000);
  const exportMatch = head.match(/"exportDate"\s*:\s*"([^"]+)"/);
  const exportDate = parseIsoDate(exportMatch?.[1]);
  const schemesInExport = head.match(/"schemesJsonGrants"\s*:\s*(\d+)/);

  let status = 'ok';
  let summary = `${active.length} active schemes · export ${exportMatch?.[1] || 'unknown'}`;

  if (exportDate && schemesMtime > exportDate) {
    status = 'stale';
    summary = `schemes.json updated after last product export — re-run integrator.`;
  } else if (schemesInExport && Number(schemesInExport[1]) < active.length - 2) {
    status = 'warn';
    summary = `Scheme count (${active.length}) may exceed export overlay (${schemesInExport[1]}).`;
  }

  return makeResult('grants', 'Grants & schemes', status, summary, {
    schemesCount: active.length,
    exportDate: exportMatch?.[1] || null,
    schemesJsonGrants: schemesInExport ? Number(schemesInExport[1]) : null,
    action: status === 'ok' ? null : 'node product-grants-integrator.js'
  });
}

async function checkProducts() {
  const productsPath = fs.existsSync(PATHS.productsGrantsBundle)
    ? PATHS.productsGrantsBundle
    : PATHS.productsGrants;
  if (!fs.existsSync(productsPath)) {
    return makeResult('products', 'Product grants overlay', 'error', 'products-with-grants export not found.');
  }

  const head = readHead(productsPath, 16000);
  const exportDate = head.match(/"exportDate"\s*:\s*"([^"]+)"/)?.[1];
  const totalProducts = head.match(/"totalProducts"\s*:\s*(\d+)/)?.[1];
  const totalGrants = head.match(/"totalGrants"\s*:\s*(\d+)/)?.[1];
  const age = daysSince(parseIsoDate(exportDate));
  const status = statusFromAge(age, 7, 30);

  return makeResult(
    'products',
    'Product grants overlay',
    status,
    `${totalProducts || '?'} products · ${totalGrants || '?'} grant rows · exported ${exportDate || 'unknown'}`,
    {
      exportDate,
      totalProducts: totalProducts ? Number(totalProducts) : null,
      totalGrants: totalGrants ? Number(totalGrants) : null,
      ageDays: age,
      file: path.basename(productsPath)
    }
  );
}

async function checkCatalog() {
  if (!fs.existsSync(PATHS.catalog)) {
    return makeResult('catalog', 'Sustainable catalog', 'error', 'sustainable-products-catalog.json missing.');
  }
  let data;
  try {
    data = JSON.parse(await fsPromises.readFile(PATHS.catalog, 'utf8'));
  } catch (e) {
    return makeResult('catalog', 'Sustainable catalog', 'error', e.message);
  }
  const count = Array.isArray(data.products) ? data.products.length : 0;
  const updated = parseIsoDate(data.updatedAt);
  const age = daysSince(updated);
  const config = await loadChecksConfig();
  const staleAfter = config.staleDays?.catalog ?? 30;
  const status = statusFromAge(age, Math.floor(staleAfter / 2), staleAfter);

  const withGrants = (data.products || []).filter((p) => (p.grantsCount || 0) > 0 || (p.grants || []).length).length;

  return makeResult(
    'catalog',
    'Sustainable catalog',
    status,
    `${count} sust_* rows · ${withGrants} with grants · updated ${data.updatedAt || 'unknown'}`,
    { productCount: count, withGrants, updatedAt: data.updatedAt, ageDays: age }
  );
}

async function checkDeals() {
  if (!fs.existsSync(PATHS.dealsFeed)) {
    return makeResult('deals', 'Deals feed', 'error', 'deals-feed.json missing.');
  }
  let data;
  try {
    data = JSON.parse(await fsPromises.readFile(PATHS.dealsFeed, 'utf8'));
  } catch (e) {
    return makeResult('deals', 'Deals feed', 'error', e.message);
  }
  const generated = parseIsoDate(data.meta?.generatedAt);
  const age = daysSince(generated);
  const config = await loadChecksConfig();
  const staleAfter = config.staleDays?.deals ?? 14;
  const status = statusFromAge(age, Math.floor(staleAfter / 2), staleAfter);
  const count = Array.isArray(data.deals) ? data.deals.length : 0;

  return makeResult(
    'deals',
    'Deals feed',
    status,
    `${count} deals · generated ${data.meta?.generatedAt || 'unknown'}`,
    { dealCount: count, generatedAt: data.meta?.generatedAt, ageDays: age, action: status !== 'ok' ? 'npm run build:deals-feed' : null }
  );
}

async function checkNews() {
  if (!fs.existsSync(PATHS.newsKb)) {
    return makeResult('news', 'News knowledge', 'error', 'news-category-knowledge.json missing.');
  }
  let data;
  try {
    data = JSON.parse(await fsPromises.readFile(PATHS.newsKb, 'utf8'));
  } catch (e) {
    return makeResult('news', 'News knowledge', 'error', e.message);
  }
  let storyCount = 0;
  for (const rows of Object.values(data.categories || {})) {
    if (Array.isArray(rows)) storyCount += rows.length;
  }
  const updated = parseIsoDate(data.updatedAt);
  const age = daysSince(updated);
  const config = await loadChecksConfig();
  const staleAfter = config.staleDays?.news ?? 45;
  const status = statusFromAge(age, Math.floor(staleAfter / 2), staleAfter);

  return makeResult(
    'news',
    'News knowledge',
    status,
    `${storyCount} KB stories · updated ${data.updatedAt || 'unknown'}`,
    { storyCount, updatedAt: data.updatedAt, ageDays: age }
  );
}

async function checkAgents() {
  const missing = [];
  const present = [];
  for (const agent of AGENT_PAGES) {
    const full = path.join(ROOT, agent.path);
    if (fs.existsSync(full)) present.push(agent.id);
    else missing.push(agent.id);
  }
  const status = missing.length ? 'warn' : 'ok';
  return makeResult(
    'agents',
    'Greenways agents',
    status,
    `${present.length}/${AGENT_PAGES.length} agent pages on disk`,
    { present, missing, routes: AGENT_PAGES.map((a) => a.route) }
  );
}

const RUNNERS = {
  server: checkServer,
  grants: checkGrants,
  products: checkProducts,
  catalog: checkCatalog,
  deals: checkDeals,
  news: checkNews,
  agents: checkAgents
};

async function runChecks(selectedIds = null) {
  const config = await loadChecksConfig();
  const allIds = (config.checks || []).map((c) => c.id).filter((id) => RUNNERS[id]);
  const ids = Array.isArray(selectedIds) && selectedIds.length
    ? selectedIds.filter((id) => RUNNERS[id])
    : allIds;

  const results = [];
  for (const id of ids) {
    try {
      results.push(await RUNNERS[id]());
    } catch (err) {
      results.push(makeResult(id, id, 'error', err.message));
    }
  }

  const counts = { ok: 0, warn: 0, stale: 0, error: 0, unknown: 0 };
  for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }

  const overall =
    counts.error > 0 ? 'error' : counts.stale > 0 ? 'stale' : counts.warn > 0 ? 'warn' : 'ok';

  return {
    ok: true,
    overall,
    checkedAt: new Date().toISOString(),
    results,
    counts,
    note: 'Read-only verify — does not run integrator or build scripts. Staff runs those separately.'
  };
}

function resultsToSamples(results) {
  const statusLabel = { ok: 'Up to date', warn: 'Review', stale: 'Needs sync', error: 'Issue', unknown: 'Unknown' };
  return results.map((r) => ({
    id: r.id,
    name: r.label,
    label: r.summary,
    subcategory: statusLabel[r.status] || r.status,
    imageUrl: '',
    topGrants: [String(r.status).toUpperCase()],
    grantsCount: 0,
    marketplaceHref: '#sync-' + r.id,
    status: r.status,
    checkId: r.id
  }));
}

module.exports = {
  runChecks,
  resultsToSamples,
  loadChecksConfig,
  AGENT_PAGES,
  RUNNERS
};
