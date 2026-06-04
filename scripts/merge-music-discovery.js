/**
 * Runs the full approve→publish pipeline for Live Music Finder discovery queues.
 *
 * Order: venues → media → events feed → map fallback
 *
 * Run: npm run merge:music-discovery
 *      node scripts/merge-music-discovery.js --dry-run
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const flag = dryRun ? ' --dry-run' : '';

const steps = [
  ['Venue profiles', `node scripts/merge-music-venue-candidates.js${flag}`],
  ['Media gallery', `node scripts/merge-music-media-candidates.js${flag}`],
  ['Events listings', `node scripts/merge-live-events-candidates.js${flag}${dryRun ? '' : ''}`]
];

console.log(dryRun ? '=== Music discovery merge (dry-run) ===' : '=== Music discovery merge ===');

for (const [label, cmd] of steps) {
  console.log('\n—', label);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    process.exitCode = e.status || 1;
    break;
  }
}

if (!dryRun && !process.exitCode) {
  console.log('\n— Map fallback sync');
  execSync('node scripts/sync-music-venues-fallback.js', { cwd: ROOT, stdio: 'inherit' });
  console.log('\nDone. Test map + hub locally.');
}
