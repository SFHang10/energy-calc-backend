#!/usr/bin/env node
/**
 * Scaffold a new monthly newsletter pair from the prior edition.
 * Usage:
 *   node scripts/scaffold-newsletter-edition.js --month 2026-07 --from 2026-06
 *
 * Copies review HTML → drafts for both types, updates edition strings, swaps hero strip
 * from data/newsletter-hero-rotation.json, writes stub *-sources.md with carry-forward header.
 */

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ROTATION = path.join(ROOT, 'data', 'newsletter-hero-rotation.json');
const POOL = path.join(ROOT, 'content-ops', 'drafts', 'sustainability-news', 'hero-photo-pool.json');

const PATHS = {
  sustainability: {
    review: path.join(ROOT, 'content-ops', 'review', 'sustainability-news'),
    drafts: path.join(ROOT, 'content-ops', 'drafts', 'sustainability-news'),
    suffix: 'sustainability-news'
  },
  tech: {
    review: path.join(ROOT, 'content-ops', 'review', 'new-in-tech'),
    drafts: path.join(ROOT, 'content-ops', 'drafts', 'sustainability-news'),
    suffix: 'new-in-tech'
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const monthIdx = args.indexOf('--month');
  const fromIdx = args.indexOf('--from');
  if (monthIdx < 0 || fromIdx < 0) {
    console.error('Usage: node scripts/scaffold-newsletter-edition.js --month 2026-07 --from 2026-06');
    process.exit(1);
  }
  return { month: args[monthIdx + 1], from: args[fromIdx + 1] };
}

function monthLabel(ym) {
  const [y, m] = ym.split('-');
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

function buildHeroLookup(pool) {
  const byId = new Map();
  for (const folder of pool.folders || []) {
    for (const img of folder.images || []) {
      const id = img.url.match(/media\/(c123de_[^~]+)/)?.[1];
      if (id) byId.set(id, img);
    }
  }
  return byId;
}

function heroStripHtml(heroIds, lookup) {
  const cards = heroIds.map((id) => {
    const img = lookup.get(id);
    if (!img) throw new Error(`Hero id not in pool: ${id}`);
    return `                <div class="photo-card">
                    <img src="${img.url}" alt="${img.alt.replace(/"/g, '&quot;')}">
                </div>`;
  });
  return `    <section class="hero-photo-strip">
        <div class="container">
            <div class="photo-grid">
${cards.join('\n')}
            </div>
        </div>
    </section>`;
}

async function replaceHeroStrip(html, heroIds, lookup) {
  const stripRe = /<section class="hero-photo-strip">[\s\S]*?<\/section>/;
  const replacement = heroStripHtml(heroIds, lookup);
  if (!stripRe.test(html)) throw new Error('hero-photo-strip section not found');
  return html.replace(stripRe, replacement);
}

function replaceEditionStrings(html, fromYm, toYm) {
  const fromLabel = monthLabel(fromYm);
  const toLabel = monthLabel(toYm);
  let out = html;
  // Edition title / month labels only — do not touch historical dates like "24 June 2026"
  out = out.replace(new RegExp(`${fromLabel} Edition`, 'g'), `${toLabel} Edition`);
  out = out.replace(new RegExp(`${fromLabel} 2026`, 'g'), `${toLabel} 2026`);
  out = out.replace(new RegExp(fromYm, 'g'), toYm);
  out = out.replace(
    /Published [A-Za-z]+ \d+, 2026/g,
    `Published August 17, 2026`
  );
  return out;
}

async function scaffoldType(type, fromYm, toYm, rotation, lookup) {
  const cfg = PATHS[type];
  const srcFile = path.join(cfg.review, `${fromYm}-${cfg.suffix}.html`);
  const destFile = path.join(cfg.drafts, `${toYm}-${cfg.suffix}.html`);
  const srcSources = path.join(cfg.review, `${fromYm}-${cfg.suffix}-sources.md`);
  const destSources = path.join(cfg.drafts, `${toYm}-${cfg.suffix}-sources.md`);

  if (!fsSync.existsSync(srcFile)) {
    const alt = path.join(cfg.drafts, `${fromYm}-${cfg.suffix}.html`);
    if (!fsSync.existsSync(alt)) throw new Error(`Source not found: ${srcFile}`);
    await fs.copyFile(alt, destFile);
  } else {
    await fs.copyFile(srcFile, destFile);
  }

  let html = await fs.readFile(destFile, 'utf8');
  const heroIds = rotation.editions[type][toYm];
  if (!heroIds?.length) throw new Error(`No hero rotation for ${type} ${toYm}`);
  html = await replaceHeroStrip(html, heroIds, lookup);
  html = replaceEditionStrings(html, fromYm, toYm);
  await fs.writeFile(destFile, html, 'utf8');

  const fromLabel = monthLabel(fromYm);
  const toLabel = monthLabel(toYm);
  let sourcesBody = '';
  if (fsSync.existsSync(srcSources)) {
    sourcesBody = await fs.readFile(srcSources, 'utf8');
  }
  const stub = `# ${type === 'tech' ? 'New in Tech' : 'Sustainability News'} Sources — ${toLabel} (Draft)

Verify dates, budgets, and pilot statuses before publishing. Continues **${fromLabel} "Looking Ahead"** items and aligns with the paired ${toLabel} edition.

## ${fromLabel} → ${toLabel.split(' ')[0]} continuity (covered in this edition)

| ${fromLabel} "Looking Ahead" item | ${toLabel.split(' ')[0]} coverage |
|-----------------------------------|-------------------|
| _(fill from prior edition #upcoming)_ | _(section / story)_ |

---

${sourcesBody.includes('## ') ? sourcesBody.split('\n').slice(4).join('\n').trim() : '_Add authoritative source links below._'}
`;
  await fs.writeFile(destSources, stub, 'utf8');
  console.log(`✓ ${type}: ${destFile}`);
  console.log(`  heroes: ${heroIds.join(', ')}`);
}

async function main() {
  const { month, from } = parseArgs();
  const rotation = JSON.parse(await fs.readFile(ROTATION, 'utf8'));
  const pool = JSON.parse(await fs.readFile(POOL, 'utf8'));
  const lookup = buildHeroLookup(pool);

  console.log(`Scaffolding ${month} from ${from} (pair: Sustainability + New in Tech)\n`);
  await scaffoldType('sustainability', from, month, rotation, lookup);
  await scaffoldType('tech', from, month, rotation, lookup);
  console.log('\nNext: edit summaries + Looking Ahead, fill sources continuity table, move to review/, then npm run run:newsletter -- --validate');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
