#!/usr/bin/env node
/**
 * Consumer Agents Dashboard overview smoke (local service, no server required).
 * Usage: npm run smoke:agents-dashboard
 * Optional: BASE_URL=https://energy-calc-backend.onrender.com node scripts/smoke-agents-dashboard.js
 */

const { buildAgentsDashboardOverview } = require('../services/agents-dashboard-service');

const BASE = (process.env.BASE_URL || '').replace(/\/$/, '');

async function smokeLocal() {
  const payload = await buildAgentsDashboardOverview();
  if (!payload.ok) throw new Error('overview ok=false');
  const agents = payload.agents || [];
  if (agents.length !== 7) {
    throw new Error(`expected 7 agents, got ${agents.length}`);
  }
  const withTablets = agents.filter((a) => Array.isArray(a.tablets) && a.tablets.length > 0);
  if (withTablets.length < 5) {
    throw new Error(`expected most agents to have tablets, got ${withTablets.length}/7`);
  }
  const gallery = payload.gallery || [];
  if (gallery.length < 3) {
    throw new Error(`expected gallery items, got ${gallery.length}`);
  }
  console.log('Agents dashboard smoke (local)');
  console.log('  agents:', agents.length);
  console.log('  with tablets:', withTablets.length);
  console.log('  gallery:', gallery.length);
  console.log('  weekLabel:', payload.meta?.weekLabel || '(none)');
  return payload;
}

async function smokeRemote() {
  const url = `${BASE}/api/agents-dashboard/overview`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const payload = await res.json();
  if (!payload.ok || !(payload.agents || []).length) {
    throw new Error('remote overview invalid');
  }
  console.log('Agents dashboard smoke (remote)', url);
  console.log('  agents:', payload.agents.length);
  console.log('  gallery:', (payload.gallery || []).length);
}

async function main() {
  await smokeLocal();
  if (BASE) await smokeRemote();
  console.log('OK');
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});
