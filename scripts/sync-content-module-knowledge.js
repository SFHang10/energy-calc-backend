/**
 * Draft knowledgeBullets for greenways-content-modules.json from page headings.
 * Run: node scripts/sync-content-module-knowledge.js          (dry-run report)
 *      node scripts/sync-content-module-knowledge.js --apply  (write JSON)
 *      node scripts/sync-content-module-knowledge.js --apply --force  (overwrite existing)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'greenways-content-modules.json');

const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');
const verbose = process.argv.includes('--verbose');

function hrefToFsPath(href) {
  const rel = String(href || '').trim();
  if (!rel || /^https?:\/\//i.test(rel)) return null;
  const pathPart = rel.split('?')[0];
  const decoded = decodeURIComponent(pathPart);
  if (decoded.startsWith('./')) {
    return path.join(ROOT, 'HTMLS GWM GWB', decoded.slice(2));
  }
  if (decoded.startsWith('../HTMLs/')) {
    return path.join(ROOT, 'HTMLs', decoded.slice('../HTMLs/'.length));
  }
  if (decoded.startsWith('../content-ops/')) {
    return path.join(ROOT, 'content-ops', decoded.slice('../content-ops/'.length));
  }
  if (decoded.startsWith('/')) {
    return path.join(ROOT, decoded.replace(/^\//, ''));
  }
  return null;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanBullet(text) {
  let s = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\.html\b/gi, ' page')
    .replace(/\bHTML\b/g, 'page')
    .trim();
  if (/escapeHtml|'\s*\+|`\$\{|Loading site|Create Account \(Legacy\)/i.test(s)) return '';
  if (s.length < 12 || s.length > 160) {
    if (s.length > 160) s = `${s.slice(0, 157).trim()}…`;
    else return '';
  }
  if (s && !/[.!?]$/.test(s)) s += '.';
  return s;
}

function extractHeadingBullets(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const bullets = [];
  const seen = new Set();

  const push = (text) => {
    const b = cleanBullet(text);
    if (!b || b.length < 12) return;
    const key = b.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    bullets.push(b);
  };

  const headingRe = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let m;
  while ((m = headingRe.exec(raw)) !== null && bullets.length < 8) {
    push(stripHtml(m[1]));
  }

  const labelRe = /class="[^"]*(?:sidebar-label|section-title|card-title|tab-label)[^"]*"[^>]*>([\s\S]*?)<\//gi;
  while ((m = labelRe.exec(raw)) !== null && bullets.length < 8) {
    push(stripHtml(m[1]));
  }

  const tabRe = /class="[^"]*tab-btn[^"]*"[^>]*>([\s\S]*?)<\//gi;
  while ((m = tabRe.exec(raw)) !== null && bullets.length < 8) {
    push(stripHtml(m[1]));
  }

  return bullets.slice(0, 3);
}

function draftFromRegistry(mod) {
  const bullets = [];
  if (mod.description) bullets.push(cleanBullet(mod.description));
  if (mod.usageHint) bullets.push(cleanBullet(mod.usageHint));
  return bullets.filter(Boolean).slice(0, 3);
}

function agentNeedsBullets(mod, agentKey) {
  const kb = mod.knowledgeBullets || {};
  return force || !(kb[agentKey] && kb[agentKey].length);
}

function syncModule(mod) {
  const agents = mod.agents || [];
  if (!agents.length) return { changed: false, reason: 'no-agents' };

  const needsAny = force || !mod.knowledgeBullets || agents.some((a) => agentNeedsBullets(mod, a));
  if (!needsAny) return { changed: false, reason: 'already-has-bullets' };

  const filePath = hrefToFsPath(mod.href);
  let bullets = extractHeadingBullets(filePath);
  let source = 'headings';
  if (!bullets.length) {
    bullets = draftFromRegistry(mod);
    source = 'registry';
  }
  if (!bullets.length) return { changed: false, reason: 'no-source', filePath };

  if (!mod.knowledgeBullets) mod.knowledgeBullets = {};
  const touched = [];
  for (const agent of agents) {
    if (!agentNeedsBullets(mod, agent)) continue;
    mod.knowledgeBullets[agent] = bullets.slice(0, 3);
    touched.push(agent);
  }

  return {
    changed: touched.length > 0,
    source,
    filePath,
    touched,
    bullets: bullets.slice(0, 3)
  };
}

function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const modules = registry.modules || [];
  let changedCount = 0;
  const report = [];

  for (const mod of modules) {
    const result = syncModule(mod);
    if (result.changed) {
      changedCount += 1;
      report.push({ id: mod.id, ...result });
      if (verbose || !apply) {
        console.log(`\n${mod.id} (${result.source})`);
        console.log(`  file: ${result.filePath || '—'}`);
        console.log(`  agents: ${result.touched.join(', ')}`);
        result.bullets.forEach((b) => console.log(`  · ${b}`));
      }
    }
  }

  if (!apply) {
    console.log(`\nDry run: ${changedCount} module(s) would get knowledgeBullets.`);
    console.log('Run with --apply to write data/greenways-content-modules.json');
    return;
  }

  if (!changedCount) {
    console.log('No changes — all modules already have knowledgeBullets (use --force to overwrite).');
    return;
  }

  registry.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  console.log(`Updated ${changedCount} module(s) in greenways-content-modules.json`);
}

main();
