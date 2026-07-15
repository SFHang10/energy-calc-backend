/**
 * Smoke — Gap 10 video knowledge enrich helpers (no network captions required).
 * Run: node scripts/smoke-video-knowledge-enrich.js
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const {
  loadSourceVideos,
  loadKnowledge,
  heuristicSummary,
  guessModules,
  mergeApprovedDrafts,
  upsertDraft,
  DRAFTS_PATH
} = require(path.join(ROOT, 'services/video-knowledge-enrich'));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  const source = loadSourceVideos();
  assert(source.length >= 5, `expected several YouTube ids, got ${source.length}`);
  console.log('OK source videos with videoId:', source.length);

  const knowledge = loadKnowledge();
  assert(Array.isArray(knowledge.items), 'knowledge.items missing');
  assert(knowledge.items.length >= 1, 'expected at least one live pointer');
  console.log('OK live knowledge pointers:', knowledge.items.length);

  const sample = source.find((v) => v.videoId === 'HaGFrVGMzb4') || source[0];
  const heuristic = heuristicSummary(sample, 'Rammed earth walls store heat. This lowers peak heating demand.');
  assert(heuristic.summary && heuristic.summary.length > 20, 'heuristic summary empty');
  assert(heuristic.takeaways.length >= 2, 'heuristic takeaways missing');
  assert(guessModules({ category: 'restaurant' }).includes('savings-projection'), 'module guess weak');
  console.log('OK heuristic summary for', sample.id);

  const drafts = { items: [] };
  upsertDraft(drafts, {
    id: 'smoke-test-video',
    videoId: 'smoke123',
    title: 'Smoke test',
    summary: 'A short smoke summary for merge testing.',
    takeaways: ['One', 'Two'],
    relatedModuleIds: ['sustainability-map'],
    status: 'approved'
  });
  assert(drafts.items[0].status === 'approved', 'upsert failed');

  // dry-run merge should not write files
  const before = fs.existsSync(DRAFTS_PATH) ? fs.readFileSync(DRAFTS_PATH, 'utf8') : null;
  const dry = mergeApprovedDrafts({ dryRun: true });
  assert(typeof dry.merged === 'number', 'merge dry-run broken');
  const after = fs.existsSync(DRAFTS_PATH) ? fs.readFileSync(DRAFTS_PATH, 'utf8') : null;
  assert(before === after, 'dry-run must not mutate drafts file');
  console.log('OK merge dry-run safe');

  console.log('\nAll video-knowledge enrich smokes passed.');
}

main();
