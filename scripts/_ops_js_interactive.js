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
  return findApplianceByDisplayName(String(text || '').split(':')[0].trim());
}

function focusEquipmentInDetail(groupId, applianceId, options) {
  options = options || {};
  const ctx = findApplianceContext(applianceId);
  if (!ctx) return;
  selectedGroupId = groupId;
  selectedApplianceId = applianceId;
  const tile = EQUIP_SUMMARY_TILES.find((t) => t.groupId === groupId);
  if (tile) selectedEquipSummaryId = tile.id;
  renderEquipSummaryGrid(selectedCategory);
  renderApplianceInstances(ctx.group);
  showEquipDetail(ctx.group, ctx.app);
  updateSelectedCount();
  document.querySelectorAll('.ops-feed-card--active').forEach((el) => el.classList.remove('ops-feed-card--active'));
  document.querySelectorAll('.ops-feed-card[data-appliance-id="' + applianceId + '"]').forEach((el) => el.classList.add('ops-feed-card--active'));
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
        const ctx = findApplianceContext(card.dataset.applianceId);
        if (ctx) navigateToEquipmentDeepDive(ctx.app, dashboardEquipmentReturnPath());
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
  const alertCls = opts.alert ? ' ops-feed-card--alert' : '';
  const rank = opts.rank ? '<span class="ops-rank">' + opts.rank + '</span>' : '';
  const extra = opts.extra || '';
  return (
    '<button type="button" class="ops-feed-card' + alertCls + active + '"' +
    ' data-group-id="' + opts.groupId + '" data-appliance-id="' + opts.applianceId + '"' +
    ' title="Select ' + opts.title + ' · Ctrl+click opens equipment deep dive">' +
    '<div class="ops-feed-card-main">' +
    rank +
    '<span class="ops-feed-icon" aria-hidden="true">' + opts.icon + '</span>' +
    '<div><div class="ops-feed-title">' + opts.title + '</div><div class="ops-feed-meta">' + opts.meta + '</div></div>' +
    '</div>' +
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
    return opsFeedCardHtml({
      groupId: ctx.group.id,
      applianceId: ctx.app.id,
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
      '<div class="ops-meter-label"><span>' + r.label + '</span><strong' + freshAttr + confCls + '>' + r.value + '</strong></div>' +
      '<div class="ops-meter-track"><div></div></div>' +
      '</div>'
    ).replace('<div>', '</div>');
  }).join('') + '<div><button type="button" id="opsOpenSensorDashboard">Open sensor dashboard →</button></div>';
  panel.innerHTML = panel.innerHTML.replace('<div>', '<div class="ops-link-row">');
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
      '<div class="audit-feed-sub">' + item.sub + subSuffix + '' +
      '</div></div>'
    ).replace('', '</div>');
  }).join('');
}

