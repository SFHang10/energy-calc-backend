/**
 * Promote staff-approved finance headline candidates into the rolling buffer.
 *
 * Run: npm run merge:finance-headlines
 *      npm run merge:finance-headlines -- --dry-run
 */

const fs = require('fs');
const path = require('path');
const { readStore, writeStore } = require('../services/finance-headline-candidates');
const { ROLLING_OUT, mergeRolling } = require('../services/finance-external-news');

const ROOT = path.join(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const store = await readStore();
  const candidates = store.candidates || [];
  const toPromote = candidates.filter((c) => c.approved === true && !c.promotedAt && !c.rejectedAt);

  if (!toPromote.length) {
    console.log('No approved, unpromoted finance headline candidates.');
    return;
  }

  const promotedAt = new Date().toISOString();
  const promotedItems = toPromote.map((c) => ({
    id: c.id,
    title: c.title,
    summary: c.summary,
    url: c.url || c.href,
    href: c.url || c.href,
    source: c.source,
    sourceId: c.sourceId,
    region: c.region || 'NL',
    publishedAt: c.publishedAt || promotedAt,
    fetchedAt: promotedAt,
    tag: c.tag || 'NEWS',
    financeAngle: c.financeAngle,
    tab: c.tab || 'policy',
    staffPromoted: true,
    promotedAt: promotedAt.slice(0, 10)
  }));

  let priorRolling = null;
  try {
    priorRolling = readJson(ROLLING_OUT);
  } catch (_) {
    /* first run */
  }

  const rolling = await mergeRolling(priorRolling, promotedItems, priorRolling?.meta?.retentionDays || 14);

  if (dryRun) {
    console.log(`Dry run: would promote ${toPromote.length} headline(s) into rolling buffer.`);
    toPromote.forEach((c) => console.log(' -', c.title));
    return;
  }

  writeJson(ROLLING_OUT, rolling);

  const nextCandidates = candidates.map((c) => {
    if (toPromote.some((p) => p.id === c.id)) {
      return { ...c, promotedAt: promotedAt.slice(0, 10) };
    }
    return c;
  });
  await writeStore({ ...store, candidates: nextCandidates });

  console.log(
    `OK merge:finance-headlines → ${path.relative(ROOT, ROLLING_OUT)} (+${toPromote.length} promoted, ${rolling.items.length} rolling)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
