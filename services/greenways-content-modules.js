/**
 * Greenways content module registry — shared HTML/video illustrations for agents.
 * Client opens modules via greenways-agent-content-module.js (modal iframe).
 */

const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

const registryPath = path.join(__dirname, '..', 'data', 'greenways-content-modules.json');

/** Client-facing ids that map to a canonical registry row */
const MODULE_ID_ALIASES = {
  'energy-ticker': 'energy-prices-ticker'
};

let registryCache = null;

function resolveModuleId(moduleId) {
  const id = String(moduleId || '').trim();
  return MODULE_ID_ALIASES[id] || id;
}

function loadRegistrySync() {
  if (registryCache) return registryCache;
  try {
    registryCache = JSON.parse(fsSync.readFileSync(registryPath, 'utf8'));
  } catch (_) {
    registryCache = { modules: [] };
  }
  return registryCache;
}

async function loadContentModules() {
  if (registryCache) return registryCache;
  try {
    const raw = await fs.readFile(registryPath, 'utf8');
    registryCache = JSON.parse(raw);
  } catch (_) {
    registryCache = { modules: [] };
  }
  return registryCache;
}

function getModuleById(registry, moduleId) {
  const id = resolveModuleId(moduleId);
  return (registry.modules || []).find((m) => m.id === id) || null;
}

/**
 * Merge agent row overrides with registry copy (description + usageHint) and defaults.
 * @param {object} row — moduleId, optional title, portalPath/href, query, openSize
 */
function mergeModuleRow(row = {}) {
  const registry = loadRegistrySync();
  const mod = getModuleById(registry, row.moduleId);
  const requestedId = String(row.moduleId || mod?.id || '').trim();
  return {
    ...row,
    moduleId: requestedId || mod?.id || 'portal',
    title: row.title || mod?.title || 'Greenways tool',
    description: row.description || mod?.description || '',
    usageHint: row.usageHint || mod?.usageHint || '',
    portalPath: row.portalPath || row.href || mod?.href || '',
    openSize: row.openSize || mod?.defaultOpenSize || ''
  };
}

function modulesForAgent(registry, agentKey) {
  const key = String(agentKey || '').trim().toLowerCase();
  if (!key) return registry.modules || [];
  return (registry.modules || []).filter((m) => (m.agents || []).includes(key));
}

function resolveModuleWebHref(href) {
  const rel = String(href || '').trim();
  if (!rel || /^https?:\/\//i.test(rel) || rel.startsWith('/')) return rel;
  const qIndex = rel.indexOf('?');
  const pathPart = qIndex >= 0 ? rel.slice(0, qIndex) : rel;
  const query = qIndex >= 0 ? rel.slice(qIndex) : '';
  if (pathPart.startsWith('./')) {
    return `/HTMLS%20GWM%20GWB/${pathPart.slice(2)}${query}`;
  }
  if (pathPart.startsWith('../HTMLs/')) {
    return `/HTMLs/${pathPart.slice('../HTMLs/'.length)}${query}`;
  }
  if (pathPart.startsWith('../content-ops/')) {
    return `/content-ops/${pathPart.slice('../content-ops/'.length)}${query}`;
  }
  return rel;
}

function appendEmbedParams(href, profile = {}, module = {}) {
  const rel = resolveModuleWebHref(String(href || '').trim());
  if (!rel) return rel;
  const qIndex = rel.indexOf('?');
  const pathPart = qIndex >= 0 ? rel.slice(0, qIndex) : rel;
  const params = new URLSearchParams(qIndex >= 0 ? rel.slice(qIndex + 1) : '');
  if (!params.has('embed')) params.set('embed', '1');
  if (!params.has('popup')) params.set('popup', '1');
  const region = String(profile.region || '').trim();
  const sector = String(profile.sector || '').trim();
  if (region && (module.supportsParams || []).includes('region') && !params.has('region')) {
    params.set('region', region);
  }
  if (sector && (module.supportsParams || []).includes('sector') && !params.has('sector')) {
    params.set('sector', sector);
  }
  const q = params.toString();
  return q ? `${pathPart}?${q}` : pathPart;
}

function fullPageHref(href) {
  const rel = String(href || '');
  if (!rel.includes('?')) return rel;
  const [pathPart, query] = rel.split('?');
  const params = new URLSearchParams(query);
  params.delete('embed');
  params.delete('popup');
  const q = params.toString();
  return q ? `${pathPart}?${q}` : pathPart;
}

function toModuleItem(module, profile = {}, overrides = {}) {
  if (!module) return null;
  const baseHref = resolveModuleWebHref(overrides.href || module.href);
  const modalHref = appendEmbedParams(baseHref, profile, module);
  return {
    moduleId: overrides.moduleId || module.id,
    title: overrides.title || module.title,
    description: String(overrides.description || module.description || '').slice(0, 220),
    usageHint: String(overrides.usageHint || module.usageHint || '').slice(0, 220),
    href: modalHref,
    fullPageHref: fullPageHref(baseHref),
    openMode: module.openMode || 'modal',
    kind: module.kind || 'html',
    openSize: overrides.openSize || module.defaultOpenSize || ''
  };
}

function toModuleBlock(moduleId, profile = {}, overrides = {}) {
  const registry = registryCache || loadRegistrySync();
  const module = getModuleById(registry, moduleId);
  const item = toModuleItem(module, profile, { ...overrides, moduleId: overrides.moduleId || moduleId });
  if (!item) return null;
  return {
    type: 'module',
    items: [item]
  };
}

async function moduleBlockFor(moduleId, profile = {}, overrides = {}) {
  await loadContentModules();
  return toModuleBlock(moduleId, profile, overrides);
}

async function moduleBlocksForAgent(agentKey, profile = {}, limit = 3) {
  const registry = await loadContentModules();
  return modulesForAgent(registry, agentKey)
    .slice(0, limit)
    .map((m) => toModuleBlock(m.id, profile))
    .filter(Boolean);
}

module.exports = {
  loadContentModules,
  loadRegistrySync,
  resolveModuleId,
  getModuleById,
  mergeModuleRow,
  modulesForAgent,
  resolveModuleWebHref,
  appendEmbedParams,
  toModuleItem,
  toModuleBlock,
  moduleBlockFor,
  moduleBlocksForAgent
};
