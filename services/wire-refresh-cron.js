/**
 * Weekly in-process cron — refreshes agent wire feeds on Render.
 * Runs: npm run refresh:agents-weekly
 *   → data/deals-feed.json (Zara wire + deals hub)
 *   → data/greenways-agent-highlights.json (sidebar "This week" on all agents)
 *
 * Enable: GREENWAYS_WIRE_REFRESH_CRON_ENABLED=1
 * Schedule: GREENWAYS_WIRE_REFRESH_CRON (default Monday 05:00 UTC)
 */

const cron = require('node-cron');
const { execFile } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CRON_EXPR = process.env.GREENWAYS_WIRE_REFRESH_CRON || '0 5 * * 1';
const ENABLED =
  process.env.GREENWAYS_WIRE_REFRESH_CRON_ENABLED === '1' ||
  (process.env.GREENWAYS_WIRE_REFRESH_CRON_ENABLED !== '0' && Boolean(process.env.RENDER));

let running = false;

function runWireRefresh() {
  if (running) {
    console.log('⏳ wire-refresh cron skipped — previous run still in progress');
    return;
  }
  running = true;
  const started = Date.now();
  console.log('📡 wire-refresh cron starting (deals feed + agent highlights)…');

  execFile(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'refresh:agents-weekly'],
    { cwd: ROOT, env: process.env, maxBuffer: 10 * 1024 * 1024 },
    (error, stdout, stderr) => {
      running = false;
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      if (error) {
        console.error(`❌ wire-refresh cron failed (${secs}s):`, error.message);
        if (stderr) console.error(stderr.slice(0, 2000));
        return;
      }
      const lines = (stdout || '').trim().split('\n').filter(Boolean);
      const tail = lines.slice(-3).join(' | ');
      console.log(`✅ wire-refresh cron OK (${secs}s)${tail ? ` — ${tail}` : ''}`);
    }
  );
}

function startWireRefreshCron() {
  if (!ENABLED) {
    console.log(
      'ℹ️ wire-refresh cron disabled (set GREENWAYS_WIRE_REFRESH_CRON_ENABLED=1, or deploy on Render)'
    );
    return;
  }
  if (!cron.validate(CRON_EXPR)) {
    console.warn(`⚠️ Invalid GREENWAYS_WIRE_REFRESH_CRON: ${CRON_EXPR}`);
    return;
  }
  cron.schedule(CRON_EXPR, runWireRefresh, { timezone: 'UTC' });
  console.log(`📅 wire-refresh cron scheduled (${CRON_EXPR} UTC) → npm run refresh:agents-weekly`);
}

module.exports = {
  startWireRefreshCron,
  runWireRefresh
};
