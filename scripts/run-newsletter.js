#!/usr/bin/env node
/**
 * Newsletter publish orchestrator — one command after monthly HTML is in review.
 *
 * Usage:
 *   npm run run:newsletter                  # dry-run checklist + gap report
 *   npm run run:newsletter -- --validate    # fail if Looking Ahead / editions missing
 *   npm run run:newsletter -- --publish     # rebuild agent feeds + smokes
 *   npm run run:newsletter -- --watchlist   # only build looking-ahead watchlist JSON
 *
 * See Skills/newsletter-run-playbook.md
 */

const { spawnSync } = require('child_process');
const path = require('path');
const { buildLookingAheadWatchlist } = require('../services/newsletter-looking-ahead');

const ROOT = path.join(__dirname, '..');
const PLAYBOOK = 'Skills/newsletter-run-playbook.md';

const PUBLISH_STEPS = [
  {
    id: 'watchlist',
    label: 'Looking Ahead watchlist',
    command: 'node scripts/build-newsletter-watchlist.js',
    skipOnWatchlistOnly: false
  },
  {
    id: 'media-brief',
    label: 'Cheryce media daily brief (Sustainability + Tech editions)',
    command: 'npm run build:media-daily-brief',
    agents: ['Cheryce']
  },
  {
    id: 'finance-external',
    label: 'Vincent external RSS headlines (EU Commission + EIB)',
    command: 'npm run build:finance-external-news',
    agents: ['Vincent']
  },
  {
    id: 'finance-review',
    label: 'Vincent daily price review',
    command: 'npm run build:finance-daily-review',
    agents: ['Vincent']
  },
  {
    id: 'finance-feed',
    label: 'Vincent finance news roundup feed',
    command: 'npm run build:finance-news-feed',
    agents: ['Vincent']
  },
  {
    id: 'agent-highlights',
    label: 'Agent highlights (sidebar This week)',
    command: 'npm run build:agent-highlights',
    agents: ['all seven'],
    optional: true
  },
  {
    id: 'smoke-ask',
    label: 'Agent knowledge smoke',
    command: 'npm run smoke:agents-ask',
    optional: true
  }
];

function runCommand(command, label) {
  console.log(`\n▶ ${label}\n   ${command}\n`);
  const result = spawnSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: process.env
  });
  if (result.status !== 0) {
    console.error(`\n✗ Failed: ${label} (exit ${result.status})`);
    process.exit(result.status || 1);
  }
  console.log(`\n✓ Done: ${label}`);
}

function printManualSteps() {
  console.log('\n--- Manual steps (not automated) ---');
  console.log('  1. Draft BOTH editions for the same month (YYYY-MM):');
  console.log('     • content-ops/drafts/sustainability-news/YYYY-MM-sustainability-news.html');
    console.log('     • content-ops/drafts/sustainability-news/YYYY-MM-new-in-tech.html');
  console.log('  2. Add *-sources.md for each with carry-forward tables (prior Looking Ahead → this month)');
  console.log('  3. Move approved files to review/:');
  console.log('     • content-ops/review/sustainability-news/');
  console.log('     • content-ops/review/new-in-tech/');
  console.log('  4. Update wix-integration/member-content/content-catalog.json if Wix listings change');
  console.log('  5. git commit → push → verify /health; spot-check Cheryce (both editions) + Vincent');
  console.log('     (Edwardo systems-tech-news page is planned — same pipeline, not built yet)');
  console.log('');
}

function printPairSummary(watchlist) {
  const meta = watchlist.meta || {};
  const sust = watchlist.editions.sustainability?.current;
  const tech = watchlist.editions.tech?.current;
  console.log('--- Monthly pair (Sustainability + New in Tech) ---');
  if (meta.pairedEdition) {
    console.log(`  Edition month: ${meta.pairedEdition}`);
    console.log(`  Sustainability News: ${sust?.folder || '?'} (${sust?.lookingAheadCount || 0} looking ahead)`);
    console.log(`  New in Tech:         ${tech?.folder || '?'} (${tech?.lookingAheadCount || 0} looking ahead)`);
    console.log(`  Both in review: ${meta.bothInReview ? 'yes' : 'no — move both before --publish'}`);
  } else if (sust?.edition || tech?.edition) {
    console.log(`  ⚠ Mismatch or incomplete: Sustainability ${sust?.edition || 'missing'} · Tech ${tech?.edition || 'missing'}`);
  } else {
    console.log('  (no editions found yet)');
  }
  console.log('');
}

function printLookingAheadReport(watchlist) {
  console.log('\n--- Looking Ahead continuity ---');
  for (const type of ['sustainability', 'tech']) {
    const pack = watchlist.editions[type];
    const cur = pack?.current;
    console.log(`\n${type}:`);
    if (!cur) {
      console.log('  (no edition found)');
      continue;
    }
    console.log(`  Current: ${cur.edition} (${cur.folder}) — ${cur.lookingAheadCount} ahead, ${cur.carryForwardCount} carry-forward rows`);
    if (pack.previous) {
      console.log(`  Previous: ${pack.previous.edition} — ${pack.previous.lookingAheadCount} ahead items`);
    }
    const needsReview = (pack.priorLookingAheadFollowUp || []).filter((r) => r.status === 'needs_review');
    if (needsReview.length) {
      console.log('  ⚠ Prior ahead items without sources-table coverage:');
      needsReview.forEach((r) => console.log(`    • ${r.item.slice(0, 100)}`));
    } else if (pack.previous) {
      console.log('  ✓ Prior Looking Ahead items have carry-forward rows (or none to track)');
    }
    if (pack.lookingAhead?.length) {
      console.log('  This edition Looking Ahead:');
      pack.lookingAhead.slice(0, 5).forEach((i) => {
        console.log(`    • ${i.when ? i.when + ': ' : ''}${i.headline.slice(0, 90)}`);
      });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const validate = args.includes('--validate');
  const publish = args.includes('--publish');
  const watchlistOnly = args.includes('--watchlist');
  const dryRun = !validate && !publish && !watchlistOnly;
  const strict = validate || publish;

  console.log('\nGreenways newsletter run');
  console.log('Playbook:', PLAYBOOK);
  console.log('Mode:', publish ? 'publish' : validate ? 'validate' : watchlistOnly ? 'watchlist' : 'dry-run');
  console.log('Pair:   Sustainability News + New in Tech (same YYYY-MM month)');
  console.log('');

  const watchlist = await buildLookingAheadWatchlist({ strict });
  printPairSummary(watchlist);
  printLookingAheadReport(watchlist);

  if (watchlist.gaps.length) {
    console.log('\n--- Gaps ---');
    watchlist.gaps.forEach((g) => console.log(`  [${g.level}] ${g.type}: ${g.message}`));
  }

  if (validate && !watchlist.readyToPublish) {
    console.error('\n✗ Validation failed — fix errors above before --publish\n');
    process.exit(1);
  }

  if (validate) {
    console.log('\n✓ Validation passed — both editions match, Looking Ahead present, both in review.\n');
    return;
  }

  if (dryRun) {
    console.log('\n--- Publish pipeline (run with --publish) ---');
    PUBLISH_STEPS.forEach((step, i) => {
      console.log(`  ${i + 1}. [${step.id}] ${step.label}`);
      console.log(`     ${step.command}`);
      if (step.agents) console.log(`     → ${step.agents.join(', ')}`);
    });
    printManualSteps();
    console.log('Dry-run only. When BOTH HTML files are in review: npm run run:newsletter -- --publish\n');
    return;
  }

  if (watchlistOnly) {
    runCommand('node scripts/build-newsletter-watchlist.js', 'Looking Ahead watchlist');
    return;
  }

  if (publish) {
    if (!watchlist.readyToPublish) {
      console.error('\n✗ Refusing publish — fix error-level gaps first (try --validate)\n');
      process.exit(1);
    }
    console.log('\n--- Publishing agent feeds from newsletter ---');
    for (const step of PUBLISH_STEPS) {
      runCommand(step.command, step.label);
    }
    printManualSteps();
    console.log('✓ Newsletter publish pipeline complete.\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
