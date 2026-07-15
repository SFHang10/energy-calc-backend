#!/usr/bin/env node
/**
 * Cheryce video knowledge enrich (Gap 10)
 *
 * Captions → summarise → draft rows for human approve → merge into
 * data/greenways-video-knowledge.json
 *
 * Usage:
 *   npm run enrich:video-knowledge
 *   npm run enrich:video-knowledge -- --limit 5
 *   npm run enrich:video-knowledge -- --only yt-restaurant-energy-star
 *   npm run enrich:video-knowledge -- --skip-captions   # metadata-only drafts
 *   npm run enrich:video-knowledge -- --merge           # approve status=approved → live JSON
 *   npm run enrich:video-knowledge -- --dry-run
 */
const path = require('path');
const {
  loadSourceVideos,
  loadKnowledge,
  loadDrafts,
  saveDrafts,
  enrichOne,
  upsertDraft,
  mergeApprovedDrafts,
  DRAFTS_PATH,
  KNOWLEDGE_PATH
} = require('../services/video-knowledge-enrich');

function parseArgs(argv) {
  const args = {
    limit: null,
    only: null,
    merge: false,
    dryRun: false,
    skipCaptions: false,
    skipLlm: false,
    forceMissing: true
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--merge') args.merge = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--skip-captions') args.skipCaptions = true;
    else if (a === '--skip-llm') args.skipLlm = true;
    else if (a === '--all') args.forceMissing = false;
    else if (a === '--limit') args.limit = Number(argv[++i]) || null;
    else if (a === '--only') args.only = String(argv[++i] || '').trim();
    else if (/^\d+$/.test(a) && args.limit == null) args.limit = Number(a);
  }
  return args;
}

async function runEnrich(args) {
  const source = loadSourceVideos();
  const knowledge = loadKnowledge();
  const knownIds = new Set((knowledge.items || []).map((i) => i.id).filter(Boolean));
  const knownVideoIds = new Set(
    (knowledge.items || []).map((i) => i.videoId).filter((id) => String(id || '').trim())
  );

  let candidates = source.slice();
  if (args.only) {
    candidates = candidates.filter(
      (v) => v.id === args.only || v.videoId === args.only
    );
  } else if (args.forceMissing) {
    candidates = candidates.filter(
      (v) => !knownIds.has(v.id) && !knownVideoIds.has(v.videoId)
    );
  }
  if (args.limit != null) candidates = candidates.slice(0, args.limit);

  console.log(`Source videos with videoId: ${source.length}`);
  console.log(`Knowledge pointers: ${(knowledge.items || []).length}`);
  console.log(`To enrich this run: ${candidates.length}`);

  if (!candidates.length) {
    console.log('Nothing to enrich. Use --all to refresh existing, or --only <id>.');
    return;
  }

  let drafts = loadDrafts();
  let wrote = 0;
  for (const video of candidates) {
    process.stdout.write(`… ${video.id || video.videoId} `);
    const row = await enrichOne(video, {
      skipCaptions: args.skipCaptions,
      skipLlm: args.skipLlm,
      saveTranscript: !args.dryRun
    });
    console.log(
      `→ ${row.enrichMeta.source}` +
        (row.enrichMeta.captionError ? ` (captions: ${row.enrichMeta.captionError})` : '')
    );
    if (!args.dryRun) {
      drafts = upsertDraft(drafts, row);
      wrote += 1;
    }
  }

  if (!args.dryRun && wrote) {
    saveDrafts(drafts);
    console.log(`\nWrote ${wrote} draft(s) → ${path.relative(process.cwd(), DRAFTS_PATH)}`);
    console.log('Next: review drafts, set status to "approved", then:');
    console.log('  npm run enrich:video-knowledge -- --merge');
  } else if (args.dryRun) {
    console.log('\nDry run — no files written.');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.merge) {
    const result = mergeApprovedDrafts({ dryRun: args.dryRun });
    console.log(result.message || `Merged ${result.merged} approved draft(s)`);
    if (result.merged && !args.dryRun) {
      console.log(`Updated ${path.relative(process.cwd(), KNOWLEDGE_PATH)}`);
    }
    return;
  }
  await runEnrich(args);
}

main().catch((error) => {
  console.error('FAIL', error.message || error);
  process.exit(1);
});
