/**
 * Module tablet helpers for Edwardo (systems-agent) — in-panel opens, chat right column.
 */

const { toLinkItem, toModuleItem } = require('./greenways-agent-shared');
const { mergeModuleRow, loadRegistrySync, getModuleById } = require('./greenways-content-modules');

const SYSTEMS_MODULE = { theme: 'systems', agentName: 'Edwardo' };

const TOOL_ID_MODULE_IDS = {
  'restaurant-energy-monitoring-guide': 'restaurant-energy-monitoring-guide',
  'energy-monitoring-guide': 'energy-monitoring',
  'smart-sensor-monitoring': 'smart-sensor-monitoring',
  'sensor-dashboard': 'sensor-dashboard',
  'greenways-dashboard': 'greenways-dashboard',
  'utility-detail': 'utility-detail',
  'restaurant-data': 'restaurant-data',
  'energy-audit': 'energy-audit'
};

const REF_MODULE_IDS = {
  'greenways-dashboard': 'greenways-dashboard',
  'energy-monitoring': 'energy-monitoring',
  'smart-sensors': 'smart-sensor-monitoring',
  'sensor-dashboard': 'sensor-dashboard',
  'deep-dive': 'equipment-deep-dive',
  'low-energy': 'low-energy-equipment',
  'discover-savings': 'discover-savings',
  'europe-savings': 'europe-savings',
  'etl-list': 'etl-finder'
};

const PORTAL_PATH_MODULE_IDS = [
  ['sensor-dashboard', 'sensor-dashboard'],
  ['greenways%20interface', 'greenways-dashboard'],
  ['utility-detail', 'utility-detail'],
  ['importance%20of%20energy%20monitoring', 'energy-monitoring'],
  ['restaurant-energy-monitoring-guide', 'restaurant-energy-monitoring-guide'],
  ['smart%20sensor%20monitoring', 'smart-sensor-monitoring'],
  ['restaurant-data', 'restaurant-data'],
  ['restaurant-equipment-deep-dive', 'equipment-deep-dive'],
  ['equipment-savings-projection', 'savings-projection'],
  ['energy-savings-trajectory', 'savings-trajectory'],
  ['equipment_intelligence_tool', 'etl-finder'],
  ['low%20energy', 'low-energy-equipment'],
  ['discover%20energy%20savings', 'discover-savings'],
  ['europes%20energy%20saving', 'europe-savings'],
  ['energy-audit-widget', 'energy-audit']
];

function isAgentChatPath(path) {
  return /^\/greenways\//.test(String(path || '').trim());
}

function portalPathToModuleId(path) {
  const hay = String(path || '').toLowerCase();
  if (!hay || isAgentChatPath(path) || hay === '/health') return '';
  for (const [needle, moduleId] of PORTAL_PATH_MODULE_IDS) {
    if (hay.includes(needle.toLowerCase())) return moduleId;
  }
  return '';
}

function systemsModuleBlock(rows) {
  const registry = loadRegistrySync();
  return {
    type: 'module',
    items: rows.map((row) => {
      const mod = getModuleById(registry, row.moduleId);
      const punch = String(row.usageHint || '').trim();
      const registryUsage = String(mod?.usageHint || '').trim();
      const merged = mergeModuleRow({ ...row, usageHint: '' });
      if (punch && punch !== merged.description) {
        merged.usageHint = registryUsage && registryUsage !== punch
          ? `${punch} — ${registryUsage}`
          : (registryUsage || punch);
      }
      return toModuleItem({ ...SYSTEMS_MODULE, ...merged });
    })
  };
}

function linkOrModuleBlocks(items) {
  const modules = [];
  const links = [];
  for (const item of items) {
    if (/^https?:\/\//i.test(item.url)) {
      links.push(item);
      continue;
    }
    const moduleId = portalPathToModuleId(item.url);
    if (moduleId) {
      modules.push({
        moduleId,
        title: item.title,
        usageHint: item.description || '',
        openSize: 'near-full',
        query: item.url && item.url.includes('?') ? item.url.split('?').slice(1).join('?') : undefined
      });
    } else {
      links.push(item);
    }
  }
  const blocks = [];
  if (modules.length) blocks.push(systemsModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

function toolToModuleRow(tool = {}) {
  const moduleId = TOOL_ID_MODULE_IDS[tool.id] || portalPathToModuleId(tool.href);
  if (!moduleId) return null;
  const row = { moduleId, title: tool.title, usageHint: tool.summary || '', openSize: 'near-full' };
  const href = String(tool.href || '');
  if (href.includes('?')) row.query = href.split('?').slice(1).join('?');
  return row;
}

function toolsToModuleBlocks(tools, max = 5) {
  const modules = [];
  const links = [];
  for (const tool of (tools || []).slice(0, max)) {
    const row = toolToModuleRow(tool);
    if (row) modules.push(row);
    else if (tool.href) links.push(toLinkItem(tool.title, tool.href, tool.summary));
  }
  const blocks = [];
  if (modules.length) blocks.push(systemsModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

function referenceToModuleRow(ref = {}) {
  const moduleId = REF_MODULE_IDS[ref.id] || portalPathToModuleId(ref.href || ref.url);
  if (!moduleId) return null;
  const row = { moduleId, title: ref.title, usageHint: ref.summary || '', openSize: 'near-full' };
  const href = String(ref.href || ref.url || '');
  if (href.includes('?')) row.query = href.split('?').slice(1).join('?');
  return row;
}

function guidesToModuleBlocks(picks) {
  const modules = [];
  const links = [];
  for (const ref of picks) {
    if (ref.url && /^https?:\/\//i.test(ref.url)) {
      links.push(toLinkItem(ref.title, ref.url, ref.summary || ''));
      continue;
    }
    const row = referenceToModuleRow(ref);
    if (row) modules.push(row);
    else if (ref.href || ref.url) links.push(toLinkItem(ref.title, ref.href || ref.url, ref.summary || ''));
  }
  const blocks = [];
  if (modules.length) blocks.push(systemsModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

module.exports = {
  SYSTEMS_MODULE,
  linkOrModuleBlocks,
  toolsToModuleBlocks,
  guidesToModuleBlocks,
  systemsModuleBlock
};
