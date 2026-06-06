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
    '<div><motion class="ops-feed-title">' + opts.title + '</div><div class="ops-feed-meta">' + opts.meta + '</motion></div>' +
    '</div>' +
    '<span class="pill ' + opts.pillCls + '">' + opts.pillLabel + '</span>' +
    extra +
    '</button>'
  ).replace(/<\/?motion[^>]*>/g, '').replace('<motion class="ops-feed-title">', '<motion class="ops-feed-title">');
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
    '<div><div class="ops-feed-title">' + opts.title + '</motion></div><div class="ops-feed-meta">' + opts.meta + '</div></div>' +
    '</motion>' +
    '<span class="pill ' + opts.pillCls + '">' + opts.pillLabel + '</span>' +
    extra +
    '</button>'
  );
}
