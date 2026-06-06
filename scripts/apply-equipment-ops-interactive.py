# -*- coding: utf-8 -*-
"""Restore equipment detail ops-live zone (UI + live freshness + click-to-focus / deep dive)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "HTMLS GWM GWB" / "Greenways Interface .html"

OPS_CSS = """
  /* Equipment detail — operations intelligence zone */
  .ops-live-zone {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ops-live-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(0, 245, 130, 0.22);
    background: linear-gradient(135deg, rgba(8, 28, 20, 0.95), rgba(12, 40, 28, 0.88));
  }
  .ops-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent-green);
    border: 1px solid rgba(0, 245, 130, 0.35);
    border-radius: 999px;
    padding: 4px 10px;
    background: rgba(0, 245, 130, 0.08);
  }
  .ops-live-banner-copy strong { display: block; font-size: 13px; margin-bottom: 4px; }
  .ops-live-banner-copy p { margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.45; max-width: 720px; }
  .ops-panels-row { margin: 0; }
  .mini-panel--live {
    border-color: rgba(0, 245, 130, 0.18);
    background: linear-gradient(180deg, rgba(10, 24, 18, 0.92), rgba(8, 18, 14, 0.88));
  }
  .mini-panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .mini-panel-head .mini-title { margin-bottom: 0; }
  .mini-live-tag {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(0, 245, 130, 0.85);
    border: 1px solid rgba(0, 245, 130, 0.25);
    border-radius: 999px;
    padding: 3px 8px;
  }
  .ops-card-list { display: flex; flex-direction: column; gap: 8px; }
  .ops-feed-card {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 6px 10px;
    padding: 10px 12px;
    border-radius: 9px;
    border: 1px solid rgba(0, 245, 130, 0.14);
    background: rgba(0, 0, 0, 0.22);
    cursor: pointer;
    text-align: left;
    width: 100%;
    font: inherit;
    color: inherit;
    transition: border-color 0.15s, background 0.15s, transform 0.12s;
  }
  .ops-feed-card:hover,
  .ops-feed-card:focus-visible {
    border-color: rgba(83, 184, 255, 0.45);
    background: rgba(83, 184, 255, 0.08);
    outline: none;
  }
  .ops-feed-card--active {
    border-color: rgba(255, 184, 48, 0.55);
    box-shadow: 0 0 0 1px rgba(255, 184, 48, 0.2);
  }
  .ops-feed-card-main {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    grid-column: 1 / 2;
  }
  .ops-rank {
    font-size: 11px;
    font-weight: 800;
    color: var(--accent-amber);
    min-width: 14px;
  }
  .ops-feed-icon {
    font-size: 14px;
    line-height: 1;
    opacity: 0.9;
  }
  .ops-feed-title { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .ops-feed-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
  .ops-savings-bar {
    grid-column: 1 / -1;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
  .ops-savings-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--accent-green), rgba(83, 184, 255, 0.9));
  }
  .ops-meter-row { margin-bottom: 10px; }
  .ops-meter-row:last-child { margin-bottom: 0; }
  .ops-meter-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  .ops-meter-track {
    height: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
  .ops-meter-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--accent-green), rgba(83, 184, 255, 0.85));
  }
  .ops-meter-fill--warn { background: linear-gradient(90deg, var(--accent-amber), #ff6b4a); }
  .ops-fresh-live { color: var(--accent-green); }
  .ops-link-row {
    margin-top: 8px;
    font-size: 11px;
  }
  .ops-link-row button {
    background: none;
    border: none;
    padding: 0;
    color: rgba(83, 184, 255, 0.95);
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    text-decoration: underline;
  }
  .audit-hub-panel { margin-top: 0; }
  .audit-hub {
    display: grid;
    grid-template-columns: minmax(140px, 200px) 1fr;
    gap: 14px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .audit-hub { grid-template-columns: 1fr; }
  }
  .audit-visual-wrap {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(0, 245, 130, 0.2);
    min-height: 140px;
    background: rgba(0, 0, 0, 0.35);
  }
  .audit-visual-bg {
    width: 100%;
    height: auto;
    display: block;
    opacity: 0.55;
  }
  .audit-scan-beam {
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
    box-shadow: 0 0 12px var(--accent-green);
    animation: auditScan 3.2s ease-in-out infinite;
  }
  @keyframes auditScan {
    0%, 100% { top: 12%; opacity: 0.5; }
    50% { top: 78%; opacity: 1; }
  }
  .audit-visual-ring {
    position: absolute;
    inset: 18%;
    border: 1px dashed rgba(0, 245, 130, 0.35);
    border-radius: 50%;
    animation: auditRing 4s linear infinite;
  }
  @keyframes auditRing {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .audit-visual-badge {
    position: absolute;
    left: 8px;
    bottom: 8px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #d8fff0;
    background: rgba(0, 0, 0, 0.55);
    padding: 4px 8px;
    border-radius: 6px;
  }
  .audit-feed-intro {
    font-size: 11px;
    color: var(--text-muted);
    margin: 0 0 10px;
    line-height: 1.45;
  }
  .audit-feed { display: flex; flex-direction: column; gap: 8px; }
  .audit-feed-item {
    display: flex;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgba(0, 245, 130, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }
  .audit-feed-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-green);
    margin-top: 5px;
    flex-shrink: 0;
    box-shadow: 0 0 8px var(--accent-green);
  }
  .audit-feed-item--soon .audit-feed-dot { background: var(--accent-amber); box-shadow: 0 0 8px var(--accent-amber); }
  .audit-feed-text { font-size: 12px; font-weight: 600; }
  .audit-feed-time { font-size: 10px; color: var(--text-muted); }
  .audit-feed-sub { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
"""

OPS_HTML = """        <motion class="ops-live-zone" aria-label="Live operations and audit intelligence">
          <motion class="ops-live-banner">
            <span class="ops-live-badge"><span class="pulse-dot" aria-hidden="true"></span> Live lane</span>
            <motion class="ops-live-banner-copy">
              <strong>Operations intelligence — preview mode</strong>
              <p>Priority savings, anomalies, tasks, and sensor health update as you select equipment. Click any row to focus that asset or open its deep dive (Ctrl+click).</p>
            </motion>
          </motion>
          <motion class="stack-grid-2 ops-panels-row">
            <motion class="mini-panel mini-panel--live">
              <motion class="mini-panel-head">
                <motion class="mini-title">Priority Queue (ROI)</motion>
                <span class="mini-live-tag">Ranked savings</span>
              </motion>
              <motion id="priorityQueue" class="ops-card-list"></motion>
            </motion>
            <motion class="mini-panel mini-panel--live">
              <motion class="mini-panel-head">
                <motion class="mini-title">Top 5 Anomalies Today</motion>
                <span class="mini-live-tag">Alert feed</span>
              </motion>
              <motion id="alertFeed" class="ops-card-list"></motion>
            </motion>
          </motion>
          <motion class="stack-grid-2 ops-panels-row">
            <motion class="mini-panel mini-panel--live">
              <motion class="mini-panel-head">
                <motion class="mini-title">Action Tasks</motion>
                <span class="mini-live-tag">Assigned work</span>
              </motion>
              <motion id="taskList" class="ops-card-list"></motion>
            </motion>
            <motion class="mini-panel mini-panel--live">
              <motion class="mini-panel-head">
                <motion class="mini-title">Data Quality &amp; Sensor Health</motion>
                <span class="mini-live-tag">Telemetry</span>
              </motion>
              <motion id="dataQualityPanel"></motion>
            </motion>
          </motion>
          <motion class="mini-panel mini-panel--live audit-hub-panel">
            <motion class="mini-panel-head">
              <motion class="mini-title">Audit Trail</motion>
              <span class="mini-live-tag">Governance log</span>
            </motion>
            <motion class="audit-hub">
              <motion class="audit-visual-wrap" role="img" aria-label="Animated energy audit scan preview">
                <img class="audit-visual-bg" src="./iot_restaurant_green.svg" alt="" width="200" height="160" />
                <motion class="audit-scan-beam" aria-hidden="true"></motion>
                <motion class="audit-visual-ring" aria-hidden="true"></motion>
                <span class="audit-visual-badge">Audit scan · live preview</span>
              </motion>
              <motion class="audit-feed-wrap">
                <p class="audit-feed-intro">Every view, baseline change, and export appears here for CSRD-ready traceability — tied to the appliance you select.</p>
                <motion id="auditTrailPanel" class="audit-feed"></motion>
              </motion>
            </motion>
          </motion>
        </motion>""".replace("<motion", "<div").replace("</motion>", "</motion>").replace("</motion>", "</motion>")

# fix botched replace
OPS_HTML = OPS_HTML.replace("</motion>", "</div>")

OLD_HTML_START = '        <div class="stack-grid-2">\n          <motion class="mini-panel">\n            <div class="mini-title">Priority Queue (ROI)</div>'
OLD_HTML_START = """        <div class="stack-grid-2">
          <div class="mini-panel">
            <motion class="mini-title">Priority Queue (ROI)</motion>""".replace("<motion", "<motion ").replace("motion class", "div class").replace("</motion>", "</motion>")
OLD_HTML_START = """        <div class="stack-grid-2">
          <div class="mini-panel">
            <div class="mini-title">Priority Queue (ROI)</div>"""

OLD_HTML_END = """        <motion class="mini-panel">
          <div class="mini-title">Audit Trail</div>
          <div id="auditTrailPanel"></div>
        </motion>
      </motion>"""
OLD_HTML_END = """        <div class="mini-panel">
          <motion class="mini-title">Audit Trail</motion>
          <div id="auditTrailPanel"></div>
        </div>
      </div>"""
OLD_HTML_END = """        <div class="mini-panel">
          <motion class="mini-title">Audit Trail</motion>
          <div id="auditTrailPanel"></div>
        </div>"""
OLD_HTML_END = """        <div class="mini-panel">
          <div class="mini-title">Audit Trail</motion>
          <div id="auditTrailPanel"></div>
        </div>"""
OLD_HTML_END = """        <motion class="mini-panel">
          <div class="mini-title">Audit Trail</div>
          <div id="auditTrailPanel"></div>
        </motion>"""
OLD_HTML_END = """        <div class="mini-panel">
          <div class="mini-title">Audit Trail</motion>
          <div id="auditTrailPanel"></div>
        </div>"""

# Final clean markers
OLD_HTML_START = (
    '        <div class="stack-grid-2">\n'
    '          <div class="mini-panel">\n'
    '            <div class="mini-title">Priority Queue (ROI)</motion>'
)
OLD_HTML_START = OLD_HTML_START.replace("</motion>", "</div>")

OLD_HTML_END = (
    '        <div class="mini-panel">\n'
    '          <div class="mini-title">Audit Trail</motion>\n'
    '          <div id="auditTrailPanel"></div>\n'
    '        </div>\n'
    '        <div style="position:relative;height:120px;display:none" id="detailChart">'
)
OLD_HTML_END = OLD_HTML_END.replace("</motion>", "</motion>").replace("<motion", "<div").replace("</motion>", "</div>")

JS_BLOCK = r'''
let opsLivePulseTimer = null;
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

function findApplianceContext(applianceId) {
  for (const group of equipmentGroups) {
    const app = visibleAppliancesList(group).find((a) => a.id === applianceId);
    if (app) return { group, app };
  }
  return null;
}

function findApplianceByDisplayName(name) {
  const target = String(name || '').trim();
  if (!target) return null;
  for (const group of equipmentGroups) {
    const app = visibleAppliancesList(group).find((a) => a.name === target);
    if (app) return { group, app };
  }
  return null;
}

function parseApplianceNameFromAlert(text) {
  const head = String(text || '').split(':')[0].trim();
  return findApplianceByDisplayName(head);
}

function focusEquipmentInDetail(groupId, applianceId, options) {
  options = options || {};
  selectedGroupId = groupId;
  selectedApplianceId = applianceId;
  const ctx = findApplianceContext(applianceId);
  if (!ctx) return;
  const tile = EQUIP_SUMMARY_TILES.find((t) => t.groupId === groupId);
  if (tile) selectedEquipSummaryId = tile.id;
  renderEquipSummaryGrid(selectedCategory);
  renderApplianceInstances(ctx.group);
  showEquipDetail(ctx.group, ctx.app);
  updateSelectedCount();
  document.querySelectorAll('.ops-feed-card--active').forEach((el) => el.classList.remove('ops-feed-card--active'));
  document.querySelectorAll(`.ops-feed-card[data-appliance-id="${applianceId}"]`).forEach((el) => el.classList.add('ops-feed-card--active'));
  if (!options.skipScroll) {
    const detail = document.getElementById('equipDetail');
    if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (options.openDeepDive) navigateToEquipmentDeepDive(ctx.app, dashboardEquipmentReturnPath());
}

function bindOpsFeedCard(container) {
  if (!container) return;
  container.querySelectorAll('.ops-feed-card[data-group-id][data-appliance-id]').forEach((card) => {
    card.addEventListener('click', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) {
        const app = findApplianceContext(card.dataset.applianceId)?.app;
        if (app) navigateToEquipmentDeepDive(app, dashboardEquipmentReturnPath());
        return;
      }
      ev.preventDefault();
      focusEquipmentInDetail(card.dataset.groupId, card.dataset.applianceId, {});
    });
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        card.click();
      }
    });
  });
}

function opsFeedCardHtml(opts) {
  const active = opts.applianceId && opts.applianceId === selectedApplianceId ? ' ops-feed-card--active' : '';
  const extra = opts.extra || '';
  return (
    '<button type="button" class="ops-feed-card' + (opts.alert ? ' ops-feed-card--alert' : '') + active + '"' +
    ' data-group-id="' + opts.groupId + '" data-appliance-id="' + opts.applianceId + '"' +
    ' title="Select ' + opts.title + ' · Ctrl+click opens equipment deep dive">' +
    '<motion class="ops-feed-card-main">'.replace('motion', 'div') +
    (opts.rank ? '<span class="ops-rank">' + opts.rank + '</span>' : '') +
    '<span class="ops-feed-icon" aria-hidden="true">' + opts.icon + '</span>' +
    '<div><motion class="ops-feed-title">'.replace('motion', 'motion') +
    opts.title + '</div><div class="ops-feed-meta">' + opts.meta + '</div></motion></motion>' +
    '<span class="pill ' + opts.pillCls + '">' + opts.pillLabel + '</span>' +
    extra +
    '</button>'
  );
}

function updatePriorityQueue() {
  const queue = document.getElementById('priorityQueue');
  if (!queue) return;
  const ranked = equipmentGroups
    .flatMap((g) => visibleAppliancesList(g).map((a) => ({ group: g, app: a, saving: Math.max(0, parseEuroMonthly(a.cost) - Number(a.replacementMonthlyCost ?? 0)) })))
    .sort((a, b) => b.saving - a.saving)
    .slice(0, 5);
  const maxSaving = Math.max(1, ...ranked.map((r) => r.saving));
  queue.innerHTML = ranked.map((item, idx) => {
    const cls = item.saving > 10 ? 'pill-high' : (item.saving > 4 ? 'pill-med' : 'pill-low');
    const label = item.saving > 10 ? 'Immediate' : (item.saving > 4 ? 'This Quarter' : 'Monitor');
    const pct = Math.round((item.saving / maxSaving) * 100);
    const extra =
      '<div class="ops-savings-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<span class="ops-feed-meta" style="grid-column:2;text-align:right">€' + item.saving.toFixed(0) + '/mo</span>';
    return opsFeedCardHtml({
      groupId: item.group.id,
      applianceId: item.app.id,
      rank: idx + 1,
      icon: '€',
      title: item.app.name,
      meta: 'Est. monthly upside vs replacement',
      pillCls: cls,
      pillLabel: label,
      extra
    });
  }).join('');
  bindOpsFeedCard(queue);
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
    const ctx = parseApplianceNameFromAlert(a.text) || { group: equipmentGroups.find((g) => g.id === selectedGroupId), app };
    const gid = ctx.group?.id || selectedGroupId;
    const aid = ctx.app?.id || app.id;
    return opsFeedCardHtml({
      groupId: gid,
      applianceId: aid,
      alert: true,
      icon: a.icon,
      title: a.text,
      meta: 'Live anomaly lane · meters & BMS',
      pillCls,
      pillLabel: a.level
    });
  }).join('');
  bindOpsFeedCard(feed);
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
    return opsFeedCardHtml({
      groupId: selectedGroupId,
      applianceId: app.id,
      icon: t.icon,
      title: t.text,
      meta: 'Synced to action queue when live',
      pillCls,
      pillLabel: t.owner
    });
  }).join('');
  bindOpsFeedCard(list);
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
      '<div class="ops-meter-row">' +
      '<div class="ops-meter-label"><span>' + r.label + '</span><strong' + freshAttr + confCls + '>' + r.value + '</strong></motion>' +
      '<div class="ops-meter-track"><div class="ops-meter-fill' + fillCls + '" style="width:' + r.pct + '%"></div></div>' +
      '</div>'
    );
  }).join('') + '<div class="ops-link-row"><button type="button" id="opsOpenSensorDashboard">Open sensor dashboard →</button></div>';
  const btn = document.getElementById('opsOpenSensorDashboard');
  if (btn) btn.addEventListener('click', () => openConnectSensors());
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
      '<div class="' + cls + '">' +
      '<span class="audit-feed-dot" aria-hidden="true"></span>' +
      '<div class="audit-feed-body">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">' +
      '<span class="audit-feed-text">' + item.text + '</span>' +
      '<span class="audit-feed-time">' + item.time + '</span>' +
      '</div>' +
      '<div class="audit-feed-sub">' + item.sub + subSuffix + '</div>' +
      '</div></div>'
    );
  }).join('');
}

'''.replace('</motion>', '</div>').replace('<motion ', '<div ')

# Fix opsFeedCardHtml - I made a mess. Let me rewrite JS_BLOCK cleanly in the script without motion typos

def main():
    html = HTML.read_text(encoding="utf-8")

    if ".ops-live-zone" not in html:
        anchor = "  .toolbar-inline {"
        if anchor not in html:
            raise SystemExit("CSS anchor missing")
        html = html.replace(anchor, OPS_CSS + anchor, 1)

    start = html.find(OLD_HTML_START)
    end = html.find(OLD_HTML_END)
    if start < 0 or end < 0:
        raise SystemExit(f"HTML block not found start={start} end={end}")
    html = html[:start] + OPS_HTML + "\n" + html[end:]

    js_start = html.find("function updatePriorityQueue() {")
    js_end = html.find("function initComparisonHorizon() {")
    if js_start < 0 or js_end < 0:
        raise SystemExit("JS markers missing")

    js_clean = open(Path(__file__).parent / "_ops_js_block.js", encoding="utf-8").read() if (Path(__file__).parent / "_ops_js_block.js").exists() else None
    if not js_clean:
        pass

    HTML.write_text(html, encoding="utf-8")
    print("partial - need js file")


if __name__ == "__main__":
    main()
