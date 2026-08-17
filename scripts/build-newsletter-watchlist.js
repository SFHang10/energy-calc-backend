/**
 * Extract Looking Ahead + carry-forward status → data/newsletter-looking-ahead-watchlist.json
 * Run: npm run build:newsletter-watchlist
 */

const fs = require('fs/promises');
const path = require('path');
const { buildLookingAheadWatchlist } = require('../services/newsletter-looking-ahead');

const OUT = path.join(__dirname, '..', 'data', 'newsletter-looking-ahead-watchlist.json');

async function main() {
  const watchlist = await buildLookingAheadWatchlist({ strict: true });
  await fs.writeFile(OUT, `${JSON.stringify(watchlist, null, 2)}\n`, 'utf8');

  const { gaps, editions, meta } = watchlist;
  const sust = editions.sustainability?.current;
  const tech = editions.tech?.current;
  console.log(`Wrote ${OUT}`);
  console.log(`  Pair: ${meta.pairedEdition || 'mismatch'} (both in review: ${meta.bothInReview ? 'yes' : 'no'})`);
  console.log(
    `  Sustainability: ${sust?.edition || 'none'} (${sust?.lookingAheadCount || 0} looking ahead, ${sust?.carryForwardCount || 0} carry-forward rows)`
  );
  console.log(
    `  Tech: ${tech?.edition || 'none'} (${tech?.lookingAheadCount || 0} looking ahead, ${tech?.carryForwardCount || 0} carry-forward rows)`
  );
  if (gaps.length) {
    console.log('\nGaps:');
    gaps.forEach((g) => console.log(`  [${g.level}] ${g.type}: ${g.message}`));
  } else {
    console.log('\nNo gaps flagged.');
  }
  if (!watchlist.readyToPublish) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
