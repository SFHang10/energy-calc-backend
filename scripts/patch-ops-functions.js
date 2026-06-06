const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'Greenways Interface .html');
let html = fs.readFileSync(filePath, 'utf8');

const startMark = 'function updatePriorityQueue() {';
const endMark = 'function initComparisonHorizon() {';
const i0 = html.indexOf(startMark);
const i1 = html.indexOf(endMark);
if (i0 < 0 || i1 < 0 || i1 <= i0) {
  console.error('Markers not found', { i0, i1 });
  process.exit(1);
}

const finalBlock = `let opsLivePulseTimer = null;
const opsLiveState = { freshSec: 35, freshGasSec: 132, freshWaterSec: 65, plugsOnline: 11, plugsTotal: 12 };

function formatOpsFreshness(totalSec) {
  if (totalSec < 60) return totalSec + 's';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m + 'm ' + String(s).padStart(2, '0') + 's';
}

function tickOpsLiveFreshness() {
  opsLiveState.freshSec = Math.max(18, Math.min(52, opsLiveState.freshSec + (Math.random() > 0.45 ? 1 : -1)));
  const elec = document.querySelector('[data-ops-fresh="elec"]');
  if (elec) elec.textContent = formatOpsFreshness(opsLiveState.freshSec);
}

function initOpsLivePulse() {
  if (opsLivePulseTimer) clearInterval(opsLivePulseTimer);
  tickOpsLiveFreshness();
  opsLivePulseTimer = setInterval(tickOpsLiveFreshness, 4200);
}

function updatePriorityQueue() {
  const queue = document.getElementById('priorityQueue');
  if (!queue) return;
  const ranked = equipmentGroups
    .flatMap((g) => visibleAppliancesList(g).map((a) => ({ app: a, saving: Math.max(0, parseEuroMonthly(a.cost) - Number(a.replacementMonthlyCost ?? 0)) })))
    .sort((a, b) => b.saving - a.saving)
    .slice(0, 5);
  const maxSaving = Math.max(1, ...ranked.map((r) => r.saving));
  queue.innerHTML = ranked.map((item, idx) => {
    const cls = item.saving > 10 ? 'pill-high' : (item.saving > 4 ? 'pill-med' : 'pill-low');
    const label = item.saving > 10 ? 'Immediate' : (item.saving > 4 ? 'This Quarter' : 'Monitor');
    const pct = Math.round((item.saving / maxSaving) * 100);
    return (
      '<article class="ops-feed-card">' +
        '<${X} class="ops-feed-card-main">' +
          '<span class="ops-rank">' + (idx + 1) + '</span>' +
          '<span class="ops-feed-icon" aria-hidden="true">€</span>' +
          '<${X}>' +
            '<${X} class="ops-feed-title">' + item.app.name + '${xd}' +
            '<${X} class="ops-feed-meta">Est. monthly upside vs replacement${xd}' +
          '${xd}' +
        '${xd}' +
        '<span class="pill ' + cls + '">' + label + '</span>' +
        '<${X} class="ops-savings-bar" aria-hidden="true"><span style="width:' + pct + '%"></span>${xd}' +
        '<span class="ops-feed-meta" style="grid-column:2;text-align:right">€' + item.saving.toFixed(0) + '/mo</span>' +
      '</article>'
    );
  }).join('');
}

function updateAlertFeed(app) {
  const feed = document.getElementById('alertFeed');
  if (!feed || !app) return;
  const alerts = [
    { text: app.name + ': idle draw above expected baseline', level: 'High', icon: '⚡' },
    { text: 'Fridge: compressor duty cycle increased 14%', level: 'High', icon: '❄' },
    { text: 'Dining Lighting Circuit: on outside schedule window', level: 'Medium', icon: '💡' },
    { text: 'HVAC Unit A Dining: pre-cooling overlap detected', level: 'Medium', icon: '🌡' },
    { text: app.name + ': warm-up / cycle duration above target window', level: 'Medium', icon: '⏱' }
  ];
  feed.innerHTML = alerts.map((a, i) => {
    const pillCls = i < 2 ? 'pill-high' : 'pill-med';
    return (
      '<article class="ops-feed-card ops-feed-card--alert">' +
        '<${X} class="ops-feed-card-main">' +
          '<span class="ops-feed-icon" aria-hidden="true">' + a.icon + '</span>' +
          '<${X}>' +
            '<${X} class="ops-feed-title">' + a.text + '${xd}' +
            '<${X} class="ops-feed-meta">Live anomaly lane · meters & BMS${xd}' +
          '${xd}' +
        '${xd}' +
        '<span class="pill ' + pillCls + '">' + a.level + '</span>' +
      '</article>'
    );
  }).join('');
}

function updateTaskList(app) {
  const list = document.getElementById('taskList');
  if (!list || !app) return;
  const tasks = [
    { text: 'Reduce ' + app.name + ' idle preheat by 15 mins', owner: 'Owner', icon: '✓' },
    { text: 'Validate schedule against occupancy', owner: 'Ops', icon: '◎' },
    { text: 'Create replacement proposal for ' + (app.replacement || 'efficient model'), owner: 'Ops', icon: '↗' },
    { text: 'Assign sensor calibration check', owner: 'Ops', icon: '◎' }
  ];
  list.innerHTML = tasks.map((t, i) => {
    const pillCls = i === 0 ? 'pill-high' : 'pill-low';
    return (
      '<article class="ops-feed-card">' +
        '<${X} class="ops-feed-card-main">' +
          '<span class="ops-feed-icon" aria-hidden="true">' + t.icon + '</span>' +
          '<${X}>' +
            '<${X} class="ops-feed-title">' + t.text + '${xd}' +
            '<${X} class="ops-feed-meta">Synced to action queue when live${xd}' +
          '${xd}' +
        '${xd}' +
        '<span class="pill ' + pillCls + '">' + t.owner + '</span>' +
      '</article>'
    );
  }).join('');
}

function updateDataQualityPanel() {
  const panel = document.getElementById('dataQualityPanel');
  if (!panel) return;
  const plugPct = Math.round((opsLiveState.plugsOnline / opsLiveState.plugsTotal) * 100);
  const rows = [
    { label: 'Electricity freshness', value: formatOpsFreshness(opsLiveState.freshSec), pct: 92, warn: false, fresh: true },
    { label: 'Gas freshness', value: formatOpsFreshness(opsLiveState.freshGasSec), pct: 78, warn: true },
    { label: 'Water freshness', value: formatOpsFreshness(opsLiveState.freshWaterSec), pct: 85, warn: false },
    { label: 'Smart plug online ratio', value: opsLiveState.plugsOnline + '/' + opsLiveState.plugsTotal, pct: plugPct, warn: plugPct < 90 },
    { label: 'Sensor confidence', value: 'High', pct: 96, warn: false, conf: true }
  ];
  panel.innerHTML = rows.map((r) => {
    const fillCls = r.warn ? ' ops-meter-fill--warn' : '';
    const freshAttr = r.fresh ? ' data-ops-fresh="elec" class="ops-fresh-live"' : '';
    const confCls = r.conf ? ' class="compare-good"' : '';
    return (
      '<${X} class="ops-meter-row">' +
        '<${X} class="ops-meter-label"><span>' + r.label + '</span><strong' + freshAttr + confCls + '>' + r.value + '</strong>${xd}' +
        '<${X} class="ops-meter-track"><${X} class="ops-meter-fill' + fillCls + '" style="width:' + r.pct + '%"></${X}>${xd}' +
      '${xd}'
    );
  }).join('');
}

function updateAuditTrail(app) {
  const panel = document.getElementById('auditTrailPanel');
  if (!panel || !app) return;
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const items = [
    { time: now, text: 'Appliance viewed', sub: app.name, live: true },
    { time: 'Today 09:15', text: 'Baseline revision', sub: 'Efficiency model v2.1' },
    { time: 'Yesterday', text: 'Recommendation updated', sub: 'ROI queue refreshed' },
    { time: 'This week', text: 'Latest report export', sub: 'CSRD pack · PDF' },
    { time: 'Soon', text: 'Full audit stream', sub: 'Greenways API · immutable log', soon: true }
  ];
  panel.innerHTML = items.map((item) => {
    const cls = 'audit-feed-item' + (item.soon ? ' audit-feed-item--soon' : '');
    const subSuffix = item.live ? ' · preview' : (item.soon ? ' · connects when live' : '');
    return (
      '<${X} class="' + cls + '">' +
        '<span class="audit-feed-dot" aria-hidden="true"></span>' +
        '<${X} class="audit-feed-body">' +
          '<${X} style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">' +
            '<span class="audit-feed-text">' + item.text + '</span>' +
            '<span class="audit-feed-time">' + item.time + '</span>' +
          '${xd}' +
          '<${X} class="audit-feed-sub">' + item.sub + subSuffix + '${xd}' +
        '${xd}' +
      '${xd}'
    );
  }).join('');
}

`.replace(/\$\{X\}/g, X).replace(/\$\{xd\}/g, xd);

html = html.slice(0, i0) + finalBlock + html.slice(i1);

if (!html.includes('initOpsLivePulse();')) {
  html = html.replace('initExportActions();', 'initExportActions();\ninitOpsLivePulse();');
}

if (!html.includes('updatePriorityQueue();\n  updateDataQualityPanel();')) {
  html = html.replace(
    '  updateSavingsPipeline();\n})();',
    '  updateSavingsPipeline();\n  updatePriorityQueue();\n  updateDataQualityPanel();\n})();'
  );
}

const minified =
  '          <div class="stack-grid-2 ops-panels-row">          <motion class="mini-panel mini-panel--live">';
if (html.includes('ops-panels-row">          <div class="mini-panel mini-panel--live">')) {
  const row1 =
    '          <div class="stack-grid-2 ops-panels-row">\n' +
    '            <' + X + ' class="mini-panel mini-panel--live">\n' +
    '              <' + X + ' class="mini-panel-head">\n' +
    '                <' + X + ' class="mini-title">Priority Queue (ROI)' + xd + '\n' +
    '                <span class="mini-live-tag">Ranked savings</span>\n' +
    '              ' + xd + '\n' +
    '              <' + X + ' id="priorityQueue" class="ops-card-list">' + xd + '\n' +
    '            ' + xd + '\n' +
    '            <' + X + ' class="mini-panel mini-panel--live">\n' +
    '              <' + X + ' class="mini-panel-head">\n' +
    '                <' + X + ' class="mini-title">Top 5 Anomalies Today' + xd + '\n' +
    '                <span class="mini-live-tag">Alert feed</span>\n' +
    '              ' + xd + '\n' +
    '              <' + X + ' id="alertFeed" class="ops-card-list">' + xd + '\n' +
    '            ' + xd + '\n' +
    '          ' + xd;

  const row2 =
    '          <motion class="stack-grid-2 ops-panels-row">\n' +
    '            <motion class="mini-panel mini-panel--live">\n' +
    '              <motion class="mini-panel-head">\n' +
    '                <motion class="mini-title">Action Tasks</motion>\n' +
    '                <span class="mini-live-tag">Assigned work</span>\n' +
    '              </motion>\n' +
    '              <motion id="taskList" class="ops-card-list"></motion>\n' +
    '            </motion>\n' +
    '            <motion class="mini-panel mini-panel--live">\n' +
    '              <motion class="mini-panel-head">\n' +
    '                <motion class="mini-title">Data Quality &amp; Sensor Health</motion>\n' +
    '                <span class="mini-live-tag">Telemetry</span>\n' +
    '              </motion>\n' +
    '              <motion id="dataQualityPanel"></motion>\n' +
    '            </motion>\n' +
    '          </motion>';

  const row2clean = row2.replace(/<\/?motion/g, (m) => m.replace('motion', X));

  html = html.replace(
    /<div class="stack-grid-2 ops-panels-row">\s+<div class="mini-panel mini-panel--live">\s+<motion class="mini-panel-head">[\s\S]*?<div id="alertFeed" class="ops-card-list"><\/div>\s+<\/div>\s+<\/motion>\s+<\/div>/,
    row1
  );

  html = html.replace(
    /<div class="stack-grid-2 ops-panels-row">\s+<div class="mini-panel mini-panel--live">\s+<div class="mini-panel-head">\s+<div class="mini-title">Action Tasks<\/div>[\s\S]*?<motion id="dataQualityPanel"><\/div>\s+<\/div>\s+<\/div>/,
    row2clean
  );
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Patched ops JS functions');
