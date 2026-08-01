#!/usr/bin/env node
/**
 * Smoke — Greenways content modules + agent demo contract (no server required).
 *
 * Guards growth: valid registry JSON, required module ids, HTML files present,
 * demo helpers emit demo=1 queries.
 *
 * Run: npm run smoke:agent-modules
 *      node scripts/smoke-agent-modules.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'greenways-content-modules.json');
const GWB = path.join(ROOT, 'HTMLS GWM GWB');

const REQUIRED_MODULE_IDS = [
  'agent-market',
  'shortlist-compare',
  'upgrade-plan-studio',
  'restaurant-energy-sketch',
  'restaurant-energy-snapshot',
  'scheme-fit',
  'water-line-sketch',
  'service-hour-cost-board',
  'finance-finder',
  'savings-projection',
  'equipment-deep-dive',
  'schemes-portal-restaurant'
];

const REQUIRED_HTML = {
  'agent-market': 'greenways-agent-market.html',
  'shortlist-compare': 'greenways-shortlist-compare.html',
  'upgrade-plan-studio': 'greenways-upgrade-plan-studio.html',
  'restaurant-energy-sketch': 'greenways-restaurant-energy-sketch.html',
  'restaurant-energy-snapshot': 'greenways-site-brief.html',
  'scheme-fit': 'greenways-scheme-fit.html',
  'water-line-sketch': 'greenways-water-line-sketch.html',
  'service-hour-cost-board': 'greenways-service-hour-cost-board.html',
  'finance-finder': 'finance-finder-restaurant.html',
  'savings-projection': 'equipment-savings-projection.html'
};

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('OK:', msg);
}

function resolveModuleHrefFile(href) {
  const rel = String(href || '').trim();
  if (!rel || /^https?:\/\//i.test(rel)) return '';
  let file = rel.replace(/^\.\//, '').split('?')[0].split('#')[0];
  try {
    file = decodeURIComponent(file);
  } catch (_) {
    /* keep raw */
  }
  if (file.startsWith('../HTMLs/')) {
    return path.join(ROOT, 'HTMLs', file.slice('../HTMLs/'.length));
  }
  if (file.startsWith('../content-ops/')) {
    return path.join(ROOT, 'content-ops', file.slice('../content-ops/'.length));
  }
  if (file.startsWith('/')) {
    return path.join(ROOT, file.replace(/^\//, '').replace(/%20/g, ' '));
  }
  return path.join(GWB, file);
}

function main() {
  console.log('smoke:agent-modules — content registry + demo contract\n');

  if (!fs.existsSync(REGISTRY_PATH)) {
    fail('missing data/greenways-content-modules.json');
    return;
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    ok('greenways-content-modules.json parses');
  } catch (err) {
    fail('greenways-content-modules.json invalid JSON: ' + err.message);
    return;
  }

  const modules = Array.isArray(registry.modules) ? registry.modules : [];
  if (!modules.length) {
    fail('registry.modules is empty');
    return;
  }
  ok(`${modules.length} modules in registry`);

  const byId = new Map();
  const dupes = [];
  for (const mod of modules) {
    const id = String(mod && mod.id || '').trim();
    if (!id) {
      fail('module missing id');
      continue;
    }
    if (byId.has(id)) dupes.push(id);
    byId.set(id, mod);
  }
  if (dupes.length) {
    fail('duplicate module ids: ' + dupes.join(', '));
  } else {
    ok('no duplicate module ids');
  }

  for (const id of REQUIRED_MODULE_IDS) {
    if (!byId.has(id)) fail(`required module missing: ${id}`);
    else ok(`required module present: ${id}`);
  }

  for (const [id, filename] of Object.entries(REQUIRED_HTML)) {
    const mod = byId.get(id);
    const filePath = path.join(GWB, filename);
    if (!fs.existsSync(filePath)) {
      fail(`HTML missing for ${id}: ${filename}`);
      continue;
    }
    ok(`HTML present: ${filename}`);
    if (mod && mod.href) {
      const resolved = resolveModuleHrefFile(mod.href);
      if (resolved && !fs.existsSync(resolved)) {
        fail(`registry href file missing for ${id}: ${mod.href}`);
      }
    }
  }

  const demoJs = path.join(GWB, 'js', 'greenways-module-demo.js');
  const demoSvc = path.join(ROOT, 'services', 'greenways-module-demo.js');
  if (!fs.existsSync(demoJs)) fail('missing HTMLS GWM GWB/js/greenways-module-demo.js');
  else ok('client greenways-module-demo.js present');
  if (!fs.existsSync(demoSvc)) fail('missing services/greenways-module-demo.js');
  else ok('server greenways-module-demo.js present');

  try {
    const demo = require(demoSvc);
    const checks = [
      ['financeFinderDemo', demo.financeFinderDemo({ tab: 'bnpl', q: 'dishwasher' })],
      ['savingsProjectionDemo', demo.savingsProjectionDemo({ scenario: 'fridge' })],
      ['agentMarketDemo', demo.agentMarketDemo({ lane: 'kitchen' })],
      ['shortlistCompareDemo', demo.shortlistCompareDemo({ ids: ['etl_14_86293'] })],
      ['upgradePlanStudioDemo', demo.upgradePlanStudioDemo({ vertical: 'fridge' })],
      ['restaurantEnergySketchDemo', demo.restaurantEnergySketchDemo({ profile: 'busy-kitchen' })],
      ['siteBriefDemo', demo.siteBriefDemo({ site: 'w2w-amsterdam-02' })],
      ['schemeFitDemo', demo.schemeFitDemo({ region: 'nl', lane: 'fridge' })],
      ['waterLineSketchDemo', demo.waterLineSketchDemo({ profile: 'busy-kitchen' })],
      ['serviceHourCostBoardDemo', demo.serviceHourCostBoardDemo({ profile: 'busy-kitchen' })]
    ];
    for (const [name, row] of checks) {
      if (!row || !row.moduleId) {
        fail(`${name} missing moduleId`);
        continue;
      }
      const q = String(row.query || '');
      if (!/(^|&)demo=1(&|$)/.test(q) && !q.includes('demo=1')) {
        fail(`${name} query missing demo=1: ${q}`);
        continue;
      }
      if (!row.agentNote || !row.agentNote.body) {
        fail(`${name} missing agentNote.body`);
        continue;
      }
      ok(`${name} → ${row.moduleId} (${q.slice(0, 72)}${q.length > 72 ? '…' : ''})`);
    }
  } catch (err) {
    fail('demo helper require/run failed: ' + err.message);
  }

  const shortlistKey = 'greenways-product-shortlist';
  const shortlistJs = path.join(GWB, 'js', 'greenways-agent-product-shortlist.js');
  if (fs.existsSync(shortlistJs)) {
    const raw = fs.readFileSync(shortlistJs, 'utf8');
    if (!raw.includes(shortlistKey)) fail(`shortlist JS missing storage key ${shortlistKey}`);
    else ok(`shortlist storage key stable: ${shortlistKey}`);
  } else {
    fail('missing greenways-agent-product-shortlist.js');
  }

  if (process.exitCode) {
    console.error('\nsmoke:agent-modules FAILED');
    process.exit(1);
  }
  console.log('\nsmoke:agent-modules PASSED');
}

main();
