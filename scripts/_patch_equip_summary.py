# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")

marker = "const INSTANCE_CHIPS_MAX = 6;"
insert = '''const EQUIP_SUMMARY_TILES = [
  {
    id: 'wok-cookline',
    name: 'Wok cookline',
    icon: '🔥',
    accent: '#ffb84d',
    glow: 'rgba(255, 184, 48, 0.35)',
    image: EQUIPMENT_PHOTO.wokBurner,
    cat: 'kitchen',
    groupId: 'ovens',
    applianceId: 'ov1',
    wokSlug: 'wok-burner-1',
    shareWeight: 0.24
  },
  {
    id: 'cold-storage',
    name: 'Cold storage',
    icon: '❄️',
    accent: '#7dffcb',
    glow: 'rgba(125, 255, 203, 0.35)',
    image: EQUIPMENT_PHOTO.fridge,
    cat: 'refrigeration',
    groupId: 'cold',
    applianceId: 'rf1',
    profileKey: 'fridge',
    shareWeight: 0.14
  },
  {
    id: 'fryer',
    name: 'Fryer',
    icon: '🍟',
    accent: '#ffb84d',
    glow: 'rgba(255, 184, 48, 0.35)',
    image: EQUIPMENT_PHOTO.fryer,
    cat: 'kitchen',
    groupId: 'ovens',
    applianceId: 'ov6',
    wokSlug: 'fryer',
    shareWeight: 0.11
  },
  {
    id: 'dishwash-water',
    name: 'Dishwash & water',
    icon: '💧',
    accent: '#22d4ff',
    glow: 'rgba(34, 212, 255, 0.35)',
    image: EQUIPMENT_PHOTO.dishwasher,
    cat: 'other',
    groupId: 'ops',
    applianceId: 'op1',
    profileKey: 'dishwasher',
    shareWeight: 0.1
  }
];

let selectedEquipSummaryId = 'wok-cookline';

'''

if marker not in text:
    raise SystemExit('marker missing')
if 'EQUIP_SUMMARY_TILES' not in text:
    text = text.replace(marker, insert + marker, 1)

old_render = """function renderEquipGrid(filter='all') {
  selectedCategory = filter;
  const grid = document.getElementById('equipGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const groups = filter === 'all' ? equipmentGroups : equipmentGroups.filter(g => g.cat === filter);
  if (!groups.some((g) => g.id === selectedGroupId)) {
    selectedGroupId = groups[0]?.id || 'ovens';
  }
  groups.forEach((group) => {
    const card = document.createElement('motion');
    const vis = visibleAppliancesList(group);
    const monitoredCount = vis.filter((a) => a.status !== 'Offline').length;
    const isActive = group.id === selectedGroupId;
    card.className = 'equip-card' + (isActive ? ' selected' : '');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    card.innerHTML = `
      <span class="equip-icon">${group.icon}</span>
      <div class="equip-name">${group.title}</div>
      <div class="equip-watt">${vis.length} appliances</div>
      <motion class="equip-status">${monitoredCount} active now</div>
      <div class="equip-card-hint">${isActive ? 'Selected category' : 'View category'}</div>
    `;
    card.addEventListener('click', () => {
      const wasSame = selectedGroupId === group.id;
      selectedGroupId = group.id;
      if (!wasSame) {
        selectedApplianceId = firstVisibleApplianceId(group);
      }
      renderEquipGrid(filter);
    });
    grid.appendChild(card);
  });

  const activeGroup = equipmentGroups.find((g) => g.id === selectedGroupId);
  if (activeGroup) {
    if (!visibleAppliancesList(activeGroup).some((a) => a.id === selectedApplianceId)) {
      selectedApplianceId = firstVisibleApplianceId(activeGroup);
    }
    renderApplianceInstances(activeGroup);
    const app = resolveApplianceInGroup(activeGroup, selectedApplianceId);
    if (app) showEquipDetail(activeGroup, app);
  }
  updateSelectedCount();
}"""

# read actual from file
start = text.index("function renderEquipGrid(filter='all') {")
end = text.index("function updateSelectedCount()", start)
old_render = text[start:end]

new_render = r'''function parseMonthlyCostEur(costStr) {
  const m = String(costStr || '').match(/€\s*([\d.,]+)/);
  if (!m) return 0;
  return Number(String(m[1]).replace(',', '')) || 0;
}

function siteMonthlyCostEur() {
  const t = lastOverviewData?.totals?.costEur;
  return Number.isFinite(t) && t > 0 ? t : 84;
}

function equipSummaryDeepDiveHref(tile) {
  const params = new URLSearchParams();
  if (tile.wokSlug) params.set('wok', tile.wokSlug);
  else if (tile.profileKey) params.set('profile', tile.profileKey);
  params.set('return', encodeURIComponent('./Greenways%20Interface%20.html?tab=equipment'));
  return './restaurant-equipment-deep-dive.html?' + params.toString();
}

function equipSummaryRingHtml(pct, accent) {
  const deg = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 360);
  return (
    '<div class="equip-summary-ring" style="--deg:' + deg + 'deg;--accent:' + accent + ';--glow:' + (tileGlow(accent)) + '">' +
    '<span>' + Math.round(pct) + '%</span></motion>'
  );
}

function tileGlow(accent) {
  return accent + '55';
}

function tileMetrics(tile) {
  const group = equipmentGroups.find((g) => g.id === tile.groupId);
  let cost = 0;
  if (group) {
    const app = resolveApplianceInGroup(group, tile.applianceId) || visibleAppliancesList(group)[0];
    if (app) cost = parseMonthlyCostEur(app.cost);
  }
  if (!cost) cost = Math.round(siteMonthlyCostEur() * tile.shareWeight);
  const site = siteMonthlyCostEur();
  const pct = site > 0 ? (cost / site) * 100 : tile.shareWeight * 100;
  return { pct, cost };
}

function selectEquipSummaryTile(tile, filter) {
  selectedEquipSummaryId = tile.id;
  selectedGroupId = tile.groupId;
  const group = equipmentGroups.find((g) => g.id === tile.groupId);
  if (!group) return;
  const app = resolveApplianceInGroup(group, tile.applianceId) || visibleAppliancesList(group)[0];
  selectedApplianceId = app?.id || firstVisibleApplianceId(group);
  renderEquipSummaryGrid(filter);
  renderApplianceInstances(group);
  if (app) showEquipDetail(group, app);
  updateSelectedCount();
  const detail = document.getElementById('equipDetail');
  if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderEquipSummaryGrid(filter = 'all') {
  const grid = document.getElementById('equipSummaryGrid');
  if (!grid) return;
  const tiles = EQUIP_SUMMARY_TILES.filter((t) => filter === 'all' || t.cat === filter);
  if (!tiles.some((t) => t.id === selectedEquipSummaryId)) {
    selectedEquipSummaryId = tiles[0]?.id || EQUIP_SUMMARY_TILES[0].id;
    const first = EQUIP_SUMMARY_TILES.find((t) => t.id === selectedEquipSummaryId);
    if (first) {
      selectedGroupId = first.groupId;
      selectedApplianceId = first.applianceId;
    }
  }
  grid.innerHTML = '';
  tiles.forEach((tile) => {
    const { pct, cost } = tileMetrics(tile);
    const href = equipSummaryDeepDiveHref(tile);
    const isSel = tile.id === selectedEquipSummaryId;
    const link = document.createElement('a');
    link.className = 'equip-summary-link' + (isSel ? ' is-selected' : '');
    link.href = href;
    link.title = 'Open deep dive for ' + tile.name;
    link.innerHTML =
      '<article class="equip-summary-card" style="--accent:' + tile.accent + ';--glow:' + tile.glow + '">' +
      '<div class="equip-summary-photo-wrap">' +
      '<img class="equip-summary-photo" src="' + tile.image + '" alt="' + tile.name + '" loading="lazy" decoding="async" />' +
      '</div>' +
      '<div class="equip-summary-body">' +
      equipSummaryRingHtml(pct, tile.accent).replace('</motion>', '</div>') +
      '<div class="equip-summary-name">' + tile.icon + ' ' + tile.name + '</div>' +
      '<div class="equip-summary-stat"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong></div>' +
      '<div class="equip-summary-stat"><span>Est. cost</span><strong>~€' + Math.round(cost) + '/mo</strong></div>' +
      '<div class="equip-summary-hint">Open equipment deep dive →</div>' +
      '</div></article>';
    link.addEventListener('click', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
      ev.preventDefault();
      selectEquipSummaryTile(tile, filter);
    });
    grid.appendChild(link);
  });
}

function renderEquipGrid(filter = 'all') {
  selectedCategory = filter;
  renderEquipSummaryGrid(filter);
  const groups = filter === 'all' ? equipmentGroups : equipmentGroups.filter((g) => g.cat === filter);
  if (!groups.some((g) => g.id === selectedGroupId)) {
    const tile = EQUIP_SUMMARY_TILES.find((t) => t.id === selectedEquipSummaryId) || EQUIP_SUMMARY_TILES[0];
    if (tile) selectedGroupId = tile.groupId;
    else selectedGroupId = groups[0]?.id || 'ovens';
  }
  const activeGroup = equipmentGroups.find((g) => g.id === selectedGroupId);
  if (activeGroup) {
    if (!visibleAppliancesList(activeGroup).some((a) => a.id === selectedApplianceId)) {
      selectedApplianceId = firstVisibleApplianceId(activeGroup);
    }
    renderApplianceInstances(activeGroup);
    const app = resolveApplianceInGroup(activeGroup, selectedApplianceId);
    if (app) showEquipDetail(activeGroup, app);
  }
  updateSelectedCount();
}

'''

# Fix the broken new_render - I introduced motion tags and broken equipSummaryRingHtml
new_render = new_render.replace('</motion>', '</motion>').replace('<motion ', '<div ').replace('</motion>', '</motion>')
new_render = new_render.replace("document.createElement('motion')", "document.createElement('motion')")
# rewrite new_render cleanly without motion

new_render = '''function parseMonthlyCostEur(costStr) {
  const m = String(costStr || '').match(/€\\s*([\\d.,]+)/);
  if (!m) return 0;
  return Number(String(m[1]).replace(',', '')) || 0;
}

function siteMonthlyCostEur() {
  const t = lastOverviewData?.totals?.costEur;
  return Number.isFinite(t) && t > 0 ? t : 84;
}

function equipSummaryDeepDiveHref(tile) {
  const params = new URLSearchParams();
  if (tile.wokSlug) params.set('wok', tile.wokSlug);
  else if (tile.profileKey) params.set('profile', tile.profileKey);
  params.set('return', encodeURIComponent('./Greenways%20Interface%20.html?tab=equipment'));
  return './restaurant-equipment-deep-dive.html?' + params.toString();
}

function equipSummaryRingHtml(pct, accent, glow) {
  const deg = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 360);
  return (
    '<motion class="equip-summary-ring" style="--deg:' + deg + 'deg;--accent:' + accent + ';--glow:' + glow + '">' +
    '<span>' + Math.round(pct) + '%</span></div>'
  );
}

function tileMetrics(tile) {
  const group = equipmentGroups.find((g) => g.id === tile.groupId);
  let cost = 0;
  if (group) {
    const app = resolveApplianceInGroup(group, tile.applianceId) || visibleAppliancesList(group)[0];
    if (app) cost = parseMonthlyCostEur(app.cost);
  }
  if (!cost) cost = Math.round(siteMonthlyCostEur() * tile.shareWeight);
  const site = siteMonthlyCostEur();
  const pct = site > 0 ? (cost / site) * 100 : tile.shareWeight * 100;
  return { pct, cost };
}

function selectEquipSummaryTile(tile, filter) {
  selectedEquipSummaryId = tile.id;
  selectedGroupId = tile.groupId;
  const group = equipmentGroups.find((g) => g.id === tile.groupId);
  if (!group) return;
  const app = resolveApplianceInGroup(group, tile.applianceId) || visibleAppliancesList(group)[0];
  selectedApplianceId = app?.id || firstVisibleApplianceId(group);
  renderEquipSummaryGrid(filter);
  renderApplianceInstances(group);
  if (app) showEquipDetail(group, app);
  updateSelectedCount();
  const detail = document.getElementById('equipDetail');
  if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderEquipSummaryGrid(filter = 'all') {
  const grid = document.getElementById('equipSummaryGrid');
  if (!grid) return;
  const tiles = EQUIP_SUMMARY_TILES.filter((t) => filter === 'all' || t.cat === filter);
  if (!tiles.some((t) => t.id === selectedEquipSummaryId)) {
    selectedEquipSummaryId = tiles[0]?.id || EQUIP_SUMMARY_TILES[0].id;
    const first = EQUIP_SUMMARY_TILES.find((t) => t.id === selectedEquipSummaryId);
    if (first) {
      selectedGroupId = first.groupId;
      selectedApplianceId = first.applianceId;
    }
  }
  grid.innerHTML = '';
  tiles.forEach((tile) => {
    const { pct, cost } = tileMetrics(tile);
    const href = equipSummaryDeepDiveHref(tile);
    const isSel = tile.id === selectedEquipSummaryId;
    const link = document.createElement('a');
    link.className = 'equip-summary-link' + (isSel ? ' is-selected' : '');
    link.href = href;
    link.title = 'Open deep dive for ' + tile.name;
    link.innerHTML =
      '<article class="equip-summary-card" style="--accent:' + tile.accent + ';--glow:' + tile.glow + '">' +
      '<div class="equip-summary-photo-wrap">' +
      '<img class="equip-summary-photo" src="' + tile.image + '" alt="' + tile.name + '" loading="lazy" decoding="async" />' +
      '</div>' +
      '<div class="equip-summary-body">' +
      equipSummaryRingHtml(pct, tile.accent, tile.glow) +
      '<div class="equip-summary-name">' + tile.icon + ' ' + tile.name + '</motion>' +
      '<div class="equip-summary-stat"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong></div>' +
      '<div class="equip-summary-stat"><span>Est. cost</span><strong>~€' + Math.round(cost) + '/mo</strong></div>' +
      '<div class="equip-summary-hint">Open equipment deep dive →</div>' +
      '</div></article>';
    link.addEventListener('click', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
      ev.preventDefault();
      selectEquipSummaryTile(tile, filter);
    });
    grid.appendChild(link);
  });
}

function renderEquipGrid(filter = 'all') {
  selectedCategory = filter;
  renderEquipSummaryGrid(filter);
  const groups = filter === 'all' ? equipmentGroups : equipmentGroups.filter((g) => g.cat === filter);
  if (!groups.some((g) => g.id === selectedGroupId)) {
    const tile = EQUIP_SUMMARY_TILES.find((t) => t.id === selectedEquipSummaryId) || EQUIP_SUMMARY_TILES[0];
    if (tile) selectedGroupId = tile.groupId;
    else selectedGroupId = groups[0]?.id || 'ovens';
  }
  const activeGroup = equipmentGroups.find((g) => g.id === selectedGroupId);
  if (activeGroup) {
    if (!visibleAppliancesList(activeGroup).some((a) => a.id === selectedApplianceId)) {
      selectedApplianceId = firstVisibleApplianceId(activeGroup);
    }
    renderApplianceInstances(activeGroup);
    const app = resolveApplianceInGroup(activeGroup, selectedApplianceId);
    if (app) showEquipDetail(activeGroup, app);
  }
  updateSelectedCount();
}

'''

new_render = new_render.replace('<motion ', '<div ').replace('</motion>', '</div>')

text = text[:start] + new_render + text[end:]

# refresh summary when dashboard data updates
needle = "  updateAdvancedAnalytics(ranged);\n  updateSystemStatusPanel({"
if needle in text and 'renderEquipSummaryGrid(selectedCategory)' not in text:
    text = text.replace(
        needle,
        "  updateAdvancedAnalytics(ranged);\n  if (document.getElementById('equipSummaryGrid')) renderEquipSummaryGrid(selectedCategory);\n  updateSystemStatusPanel({",
        1,
    )

# reduced motion
if '.equip-summary-ring,' not in text.split('@media (prefers-reduced-motion')[1][:400]:
    text = text.replace(
        "    .grant-radar-viewport { transition: none; }\n  }",
        "    .grant-radar-viewport { transition: none; }\n    .equip-summary-ring { animation: none; }\n  }",
        1,
    )

p.write_text(text, encoding="utf-8")
print("equip summary ok")
