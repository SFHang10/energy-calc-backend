const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'greenways-tenant-agent-packs.json');
const PACKS_DIR = path.join(ROOT, 'data', 'tenant-agent-packs');

async function loadRegistry() {
  const raw = await fsPromises.readFile(REGISTRY_PATH, 'utf8');
  return JSON.parse(raw);
}

async function loadPack(chainId) {
  const id = String(chainId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-');
  if (!id) {
    const err = new Error('chainId is required');
    err.status = 400;
    throw err;
  }

  const packPath = path.join(PACKS_DIR, `${id}.json`);
  if (!fs.existsSync(packPath)) {
    const err = new Error(`Tenant pack not found: ${id}`);
    err.status = 404;
    throw err;
  }

  const raw = await fsPromises.readFile(packPath, 'utf8');
  const pack = JSON.parse(raw);
  return {
    ...pack,
    chainId: pack.chainId || id,
    _meta: {
      packFile: path.relative(ROOT, packPath).replace(/\\/g, '/'),
      loadedAt: new Date().toISOString()
    }
  };
}

async function listPacks() {
  const registry = await loadRegistry();
  const packs = [];
  for (const row of registry.packs || []) {
    try {
      const full = await loadPack(row.chainId);
      packs.push({
        chainId: full.chainId,
        brandName: full.brandName,
        status: full.status || row.status,
        hubRoute: row.hubRoute || `/greenways/tenants/${full.chainId}`,
        assistRoute: full.primaryAssist?.route || row.assistRoute,
        tagline: full.tagline || '',
        agentCount: (full.agents || []).length,
        surfaceCount: (full.surfaces || []).length
      });
    } catch (_) {
      packs.push({
        chainId: row.chainId,
        brandName: row.brandName,
        status: 'error',
        hubRoute: row.hubRoute,
        assistRoute: row.assistRoute,
        error: 'Pack file missing or invalid'
      });
    }
  }
  return {
    ok: true,
    updatedAt: registry.updatedAt || null,
    meta: registry.meta || {},
    packs
  };
}

async function getPack(chainId) {
  const pack = await loadPack(chainId);
  return { ok: true, pack };
}

module.exports = {
  listPacks,
  getPack,
  loadRegistry,
  loadPack
};
