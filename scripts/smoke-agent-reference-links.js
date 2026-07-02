#!/usr/bin/env node
/**
 * HEAD-check external URLs in agent *-references.json and schemes.json primary links.
 * Run: node scripts/smoke-agent-reference-links.js
 * Exit 1 if any URL fails (non-2xx/3xx or network error).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const TIMEOUT_MS = 15000;

function collectReferenceFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.endsWith('-references.json'))
    .map((name) => path.join(DATA_DIR, name));
}

function addUrl(map, url, source) {
  const u = String(url || '').trim();
  if (!u || !/^https?:\/\//i.test(u)) return;
  if (!map.has(u)) map.set(u, []);
  map.get(u).push(source);
}

async function headCheck(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const fetchOpts = {
    redirect: 'follow',
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml'
    }
  };
  try {
    const res = await fetch(url, { method: 'HEAD', ...fetchOpts });
    if (res.status >= 200 && res.status < 400) {
      clearTimeout(timer);
      return { ok: true, status: res.status };
    }
  } catch (_) {
    /* some hosts block HEAD — fall through to GET */
  }
  try {
    const getRes = await fetch(url, { method: 'GET', ...fetchOpts });
    clearTimeout(timer);
    return { ok: getRes.status >= 200 && getRes.status < 400, status: getRes.status };
  } catch (error) {
    clearTimeout(timer);
    return { ok: false, error: error.message };
  }
}

async function main() {
  const urlSources = new Map();

  for (const filePath of collectReferenceFiles()) {
    const rel = path.relative(ROOT, filePath);
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error('Skip unreadable', rel, error.message);
      continue;
    }
    for (const row of parsed.external || []) {
      addUrl(urlSources, row.url, `${rel} → ${row.id || row.title}`);
    }
    for (const row of parsed.internalGuides || []) {
      addUrl(urlSources, row.url, `${rel} → ${row.id || row.title}`);
    }
  }

  const schemesPath = path.join(ROOT, 'schemes.json');
  if (fs.existsSync(schemesPath)) {
    const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
    for (const scheme of Array.isArray(schemes) ? schemes : []) {
      const link = Array.isArray(scheme.links) && scheme.links[0] ? scheme.links[0].url : '';
      addUrl(urlSources, link, `schemes.json → ${scheme.id || scheme.title}`);
    }
  }

  const urls = [...urlSources.keys()].sort();
  console.log(`Checking ${urls.length} unique external URLs…\n`);

  const failures = [];
  for (const url of urls) {
    const result = await headCheck(url);
    const label = urlSources.get(url).join('; ');
    if (result.ok) {
      console.log(`OK  ${result.status || ''}  ${url}`);
    } else {
      console.log(`FAIL ${result.status || result.error || '?'}  ${url}`);
      console.log(`     ${label}`);
      failures.push({ url, label, result });
    }
  }

  console.log(`\nDone: ${urls.length - failures.length} ok, ${failures.length} failed.`);
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
