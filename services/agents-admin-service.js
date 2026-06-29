const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const { runChecks } = require('./systems-agent-health');
const { listReferralHandoffsLive } = require('./greenways-agent-handoff');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'greenways-agent-admin-registry.json');
const ROSTER_PATH = path.join(ROOT, 'data', 'greenways-agent-roster.json');
const CONTENT_MODULES_PATH = path.join(ROOT, 'data', 'greenways-content-modules.json');
const MODULE_EXAMPLES_PATH = path.join(ROOT, 'data', 'greenways-module-examples.json');
const ORCHESTRA_MAP_IMAGE =
  'https://static.wixstatic.com/media/c123de_7cad20d715d045e4a9f684d5936bab3a~mv2.jpg';

function resolveRepoPath(relPath) {
  return path.join(ROOT, String(relPath || '').replace(/^\//, ''));
}

function readHead(filePath, bytes = 12000) {
  if (!fs.existsSync(filePath)) return '';
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const n = fs.readSync(fd, buf, 0, bytes, 0);
    return buf.slice(0, n).toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

function parseIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysSince(date) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function statusFromAge(days, warnAfter = 14, staleAfter = 45) {
  if (days === null) return 'unknown';
  if (days <= warnAfter) return 'ok';
  if (days <= staleAfter) return 'warn';
  return 'stale';
}

function extractJsonMeta(head) {
  const meta = {};
  const patterns = [
    ['updatedAt', /"updatedAt"\s*:\s*"([^"]+)"/],
    ['generatedAt', /"generatedAt"\s*:\s*"([^"]+)"/],
    ['exportDate', /"exportDate"\s*:\s*"([^"]+)"/],
    ['edition', /"edition"\s*:\s*"([^"]+)"/]
  ];
  for (const [key, re] of patterns) {
    const m = head.match(re);
    if (m) meta[key] = m[1];
  }
  const countMatch = head.match(/"totalProducts"\s*:\s*(\d+)/);
  if (countMatch) meta.totalProducts = Number(countMatch[1]);
  const grantsMatch = head.match(/"totalGrants"\s*:\s*(\d+)/);
  if (grantsMatch) meta.totalGrants = Number(grantsMatch[1]);
  const storyMatch = head.match(/"storyCount"\s*:\s*(\d+)/);
  if (storyMatch) meta.storyCount = Number(storyMatch[1]);
  return meta;
}

async function statDataSource(sourceDef) {
  const primary = resolveRepoPath(sourceDef.path);
  const fallback = sourceDef.fallback ? resolveRepoPath(sourceDef.fallback) : null;
  const filePath = fs.existsSync(primary) ? primary : fallback && fs.existsSync(fallback) ? fallback : primary;

  if (!fs.existsSync(filePath)) {
    return {
      id: sourceDef.id,
      label: sourceDef.label,
      path: sourceDef.path,
      exists: false,
      status: 'error',
      summary: 'File not found',
      lastModified: null,
      ageDays: null
    };
  }

  const stat = fs.statSync(filePath);
  const head = readHead(filePath);
  const meta = extractJsonMeta(head);
  const contentDate = parseIsoDate(meta.generatedAt || meta.exportDate || meta.updatedAt);
  const mtimeDate = stat.mtime;
  const effectiveDate = contentDate && contentDate > mtimeDate ? contentDate : mtimeDate;
  const age = daysSince(effectiveDate);
  const status = statusFromAge(age, sourceDef.warnDays ?? 14, sourceDef.staleDays ?? 45);

  let summary = `Modified ${mtimeDate.toISOString().slice(0, 10)}`;
  if (meta.exportDate) summary = `Export ${meta.exportDate}`;
  else if (meta.generatedAt) summary = `Generated ${meta.generatedAt}`;
  else if (meta.updatedAt) summary = `Updated ${meta.updatedAt}`;
  if (meta.totalProducts) summary += ` · ${meta.totalProducts} products`;
  if (meta.totalGrants) summary += ` · ${meta.totalGrants} grant rows`;
  if (meta.storyCount) summary += ` · ${meta.storyCount} stories`;
  if (meta.edition) summary += ` · edition ${meta.edition}`;

  return {
    id: sourceDef.id,
    label: sourceDef.label,
    path: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    exists: true,
    status,
    summary,
    lastModified: mtimeDate.toISOString(),
    contentDate: contentDate ? contentDate.toISOString() : null,
    ageDays: age,
    meta
  };
}

async function loadRegistry() {
  const raw = await fsPromises.readFile(REGISTRY_PATH, 'utf8');
  return JSON.parse(raw);
}

async function loadRoster() {
  try {
    const raw = await fsPromises.readFile(ROSTER_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { agents: [] };
  }
}

async function loadContentModules() {
  try {
    const raw = await fsPromises.readFile(CONTENT_MODULES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.modules) ? parsed : { modules: [] };
  } catch (_) {
    return { modules: [] };
  }
}

async function loadModuleExamples() {
  try {
    const raw = await fsPromises.readFile(MODULE_EXAMPLES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.examples) ? parsed.examples : [];
  } catch (_) {
    return [];
  }
}

function slugifyModuleId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function addContentModule(input = {}) {
  const id = slugifyModuleId(input.id || input.title);
  const title = String(input.title || '').trim();
  const href = String(input.href || '').trim();
  const agents = Array.isArray(input.agents)
    ? [...new Set(input.agents.map((a) => String(a).trim()).filter(Boolean))]
    : [];

  if (!id) throw new Error('Module id is required.');
  if (!title) throw new Error('Title is required.');
  if (!href) throw new Error('Page URL or href is required.');
  if (!agents.length) throw new Error('Assign at least one agent.');

  const catalog = await loadContentModules();
  if ((catalog.modules || []).some((row) => row.id === id)) {
    throw new Error(`Module id "${id}" already exists.`);
  }

  const topics = Array.isArray(input.topics)
    ? input.topics.map((t) => String(t).trim()).filter(Boolean)
    : String(input.topics || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

  const moduleRow = {
    id,
    title,
    description: String(input.description || '').trim(),
    usageHint: String(input.usageHint || '').trim(),
    href,
    openMode: 'modal',
    kind: /^https?:\/\//i.test(href) ? 'external' : 'html',
    agents,
    topics,
    defaultOpenSize: 'near-full'
  };

  catalog.modules = catalog.modules || [];
  catalog.modules.push(moduleRow);
  catalog.updatedAt = new Date().toISOString().slice(0, 10);
  await fsPromises.writeFile(
    CONTENT_MODULES_PATH,
    `${JSON.stringify(catalog, null, 2)}\n`,
    'utf8'
  );
  return moduleRow;
}

async function loadBriefing(relPath) {
  try {
    const raw = await fsPromises.readFile(resolveRepoPath(relPath), 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function rosterAgentFor(roster, id, slug) {
  return (roster.agents || []).find((a) => a.id === id || a.slug === slug) || null;
}

async function buildAgentOverview(agentDef, roster) {
  const briefing = await loadBriefing(agentDef.briefingPath);
  const face = rosterAgentFor(roster, agentDef.id, agentDef.slug);
  const dataSources = [];
  for (const ds of agentDef.dataSources || []) {
    dataSources.push(await statDataSource(ds));
  }

  const handoffs = briefing?.handoffs ? Object.values(briefing.handoffs) : [];
  const worstStatus = dataSources.reduce((worst, row) => {
    const order = { error: 4, stale: 3, warn: 2, ok: 1, unknown: 0 };
    return (order[row.status] || 0) > (order[worst] || 0) ? row.status : worst;
  }, 'ok');

  return {
    id: agentDef.id,
    slug: agentDef.slug,
    name: face?.name || agentDef.id,
    shortLabel: face?.shortLabel || '',
    imageUrl: face?.imageUrl || '',
    chatRoute: agentDef.chatRoute,
    roleLine: briefing?.roleSummary || agentDef.roleLine,
    briefingUpdatedAt: briefing?.updatedAt || null,
    handoffs: handoffs.map((h) => ({
      agentName: h.agentName,
      agentPath: h.agentPath,
      reason: h.reason
    })),
    knowledgeService: agentDef.knowledgeService,
    intentsPath: agentDef.intentsPath,
    briefingPath: agentDef.briefingPath,
    skills: agentDef.skills || [],
    tasks: agentDef.tasks || [],
    dataSources,
    dataStatus: dataSources.length ? worstStatus : 'unknown'
  };
}

async function getOverview() {
  const registry = await loadRegistry();
  const roster = await loadRoster();
  const platformChecks = await runChecks();

  const agents = [];
  for (const agentDef of registry.agents || []) {
    agents.push(await buildAgentOverview(agentDef, roster));
  }

  const sharedChecks = (platformChecks.results || []).map((r) => ({
    id: r.id,
    label: r.label,
    status: r.status,
    summary: r.summary,
    action: r.action || null
  }));

  return {
    ok: true,
    phase: 1,
    readOnly: true,
    generatedAt: new Date().toISOString(),
    registryUpdatedAt: registry.updatedAt,
    links: registry.links || {},
    referralHandoffsLive: listReferralHandoffsLive(),
    globalTasks: registry.globalTasks || [],
    orchestrator: registry.orchestrator || null,
    platform: {
      overall: platformChecks.overall,
      checkedAt: platformChecks.checkedAt,
      checks: sharedChecks
    },
    agents
  };
}

function agentIdFromHandoff(handoff, agents) {
  if (!handoff) return null;
  const byName = agents.find((a) => a.name === handoff.agentName);
  if (byName) return byName.id;
  const path = String(handoff.agentPath || '');
  const byPath = agents.find((a) => a.chatRoute === path || path.endsWith(a.slug));
  return byPath ? byPath.id : null;
}

async function layoutGraph(overview) {
  const CX = 500;
  const CY = 500;
  const agentRadius = 360;
  const dataRadiusShared = 175;
  const dataRadiusSolo = 240;
  const moduleRadius = 300;

  const nodes = [];
  const edges = [];
  const agents = overview.agents || [];
  const agentIds = new Set(agents.map((a) => a.id));

  nodes.push({
    id: 'orchestra',
    type: 'orchestrator',
    label: overview.orchestrator?.label || 'Greenways Orchestra',
    imageUrl: overview.orchestrator?.imageUrl || ORCHESTRA_MAP_IMAGE,
    chatRoute: overview.orchestrator?.chatRoute || '/greenways/orchestra-hub',
    x: CX,
    y: CY
  });

  agents.forEach((agent, i) => {
    const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: agent.id,
      type: 'agent',
      label: agent.name,
      shortLabel: agent.shortLabel,
      imageUrl: agent.imageUrl,
      chatRoute: agent.chatRoute,
      roleLine: agent.roleLine,
      dataStatus: agent.dataStatus,
      x: CX + agentRadius * Math.cos(angle),
      y: CY + agentRadius * Math.sin(angle),
      angle
    });
    edges.push({ id: `route:${agent.id}`, from: 'orchestra', to: agent.id, type: 'routes' });
  });

  const pathMap = new Map();
  for (const agent of agents) {
    for (const ds of agent.dataSources || []) {
      const key = ds.path;
      if (!pathMap.has(key)) {
        pathMap.set(key, {
          id: ds.id,
          label: ds.label,
          path: key,
          status: ds.status,
          agents: []
        });
      }
      const row = pathMap.get(key);
      if (!row.agents.includes(agent.id)) row.agents.push(agent.id);
      const order = { error: 4, stale: 3, warn: 2, ok: 1, unknown: 0 };
      if ((order[ds.status] || 0) > (order[row.status] || 0)) row.status = ds.status;
    }
  }

  const dataRows = [...pathMap.values()].sort((a, b) => {
    if (b.agents.length !== a.agents.length) return b.agents.length - a.agents.length;
    return a.label.localeCompare(b.label);
  });

  dataRows.forEach((ds, i) => {
    const shared = ds.agents.length >= 2;
    const angle = (i / dataRows.length) * Math.PI * 2 - Math.PI / 2 + 0.15;
    const r = shared ? dataRadiusShared : dataRadiusSolo;
    const nodeId = `ds:${ds.path}`;
    nodes.push({
      id: nodeId,
      type: shared ? 'shared-data' : 'data',
      label: ds.label,
      path: ds.path,
      status: ds.status,
      agentCount: ds.agents.length,
      shared,
      x: CX + r * Math.cos(angle),
      y: CY + r * Math.sin(angle)
    });
    for (const agentId of ds.agents) {
      edges.push({
        id: `uses:${agentId}:${ds.path}`,
        from: agentId,
        to: nodeId,
        type: 'uses'
      });
    }
  });

  for (const agent of agents) {
    for (const handoff of agent.handoffs || []) {
      const toId = agentIdFromHandoff(handoff, agents);
      if (!toId || toId === agent.id) continue;
      edges.push({
        id: `handoff:${agent.id}:${toId}`,
        from: agent.id,
        to: toId,
        type: 'handoff',
        reason: handoff.reason
      });
    }
  }

  for (const ref of listReferralHandoffsLive()) {
    const fromAgent = agents.find((a) => a.name === ref.from);
    const toAgent = agents.find((a) => a.name === ref.to);
    if (!fromAgent || !toAgent) continue;
    edges.push({
      id: `referral:${fromAgent.id}:${toAgent.id}`,
      from: fromAgent.id,
      to: toAgent.id,
      type: 'referral-live',
      pair: ref.pair
    });
  }

  const sharedRows = dataRows.filter((ds) => ds.agents.length >= 2);
  for (const ds of sharedRows) {
    const ids = ds.agents;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        edges.push({
          id: `co-use:${ids[i]}:${ids[j]}:${ds.path}`,
          from: ids[i],
          to: ids[j],
          type: 'co-use',
          via: ds.label,
          path: ds.path
        });
      }
    }
  }

  const contentCatalog = await loadContentModules();
  const moduleExamples = await loadModuleExamples();
  const examplesByModule = new Map();
  for (const ex of moduleExamples) {
    if (!ex.moduleId) continue;
    if (!examplesByModule.has(ex.moduleId)) examplesByModule.set(ex.moduleId, []);
    examplesByModule.get(ex.moduleId).push({
      id: ex.id,
      title: ex.title,
      summary: ex.summary || '',
      params: ex.params || {},
      agents: ex.agents || []
    });
  }
  const contentModules = (contentCatalog.modules || []).slice().sort((a, b) => {
    const aCount = (a.agents || []).length;
    const bCount = (b.agents || []).length;
    if (bCount !== aCount) return bCount - aCount;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });

  contentModules.forEach((mod, i) => {
    const linkedAgents = (mod.agents || []).filter((id) => agentIds.has(id));
    if (!linkedAgents.length) return;

    const angle = (i / Math.max(contentModules.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.08;
    const nodeId = `mod:${mod.id}`;
    const shared = linkedAgents.length >= 2;

    const knowledgeBullets = mod.knowledgeBullets || {};
    const agentNotes = mod.agentNotes || {};
    const knowledgeAgents = linkedAgents.filter(
      (id) => (knowledgeBullets[id] || []).length || agentNotes[id]
    );

    nodes.push({
      id: nodeId,
      type: 'content-module',
      label: mod.title || mod.id,
      moduleId: mod.id,
      href: mod.href || '',
      description: mod.description || '',
      usageHint: mod.usageHint || '',
      topics: mod.topics || [],
      kind: mod.kind || 'html',
      knowledgeBullets,
      agentNotes,
      relatedModuleIds: mod.relatedModuleIds || [],
      knowledgeAgentCount: knowledgeAgents.length,
      workedExamples: examplesByModule.get(mod.id) || [],
      shared,
      agentCount: linkedAgents.length,
      x: CX + moduleRadius * Math.cos(angle),
      y: CY + moduleRadius * Math.sin(angle)
    });

    for (const agentId of linkedAgents) {
      edges.push({
        id: `module:${agentId}:${mod.id}`,
        from: agentId,
        to: nodeId,
        type: 'module',
        shared
      });
    }
  });

  const moduleRows = contentModules.filter((mod) =>
    (mod.agents || []).some((id) => agentIds.has(id))
  );
  const sharedModuleRows = moduleRows.filter((mod) => {
    const count = (mod.agents || []).filter((id) => agentIds.has(id)).length;
    return count >= 2;
  });
  for (const mod of sharedModuleRows) {
    const ids = (mod.agents || []).filter((id) => agentIds.has(id));
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        edges.push({
          id: `co-module:${ids[i]}:${ids[j]}:${mod.id}`,
          from: ids[i],
          to: ids[j],
          type: 'co-module',
          via: mod.title || mod.id,
          moduleId: mod.id
        });
      }
    }
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    contentModulesUpdatedAt: contentCatalog.updatedAt || null,
    layout: { width: 1000, height: 1000, center: { x: CX, y: CY } },
    stats: {
      agentCount: agents.length,
      dataSourceCount: dataRows.length,
      sharedDataCount: sharedRows.length,
      contentModuleCount: moduleRows.length,
      sharedContentModuleCount: sharedModuleRows.length,
      handoffEdgeCount: edges.filter((e) => e.type === 'handoff').length,
      referralLiveCount: edges.filter((e) => e.type === 'referral-live').length,
      coUseEdgeCount: edges.filter((e) => e.type === 'co-use').length,
      moduleEdgeCount: edges.filter((e) => e.type === 'module').length
    },
    nodes,
    edges
  };
}

async function getGraph() {
  const overview = await getOverview();
  return layoutGraph(overview);
}

module.exports = {
  getOverview,
  getGraph,
  loadRegistry,
  loadContentModules,
  addContentModule,
  statDataSource
};
