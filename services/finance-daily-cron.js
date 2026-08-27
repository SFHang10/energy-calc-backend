/**
 * Optional in-process cron for Vincent's daily finance build on Render.
 * Enable: GREENWAYS_FINANCE_DAILY_CRON_ENABLED=1
 * Schedule: GREENWAYS_FINANCE_DAILY_CRON (default 06:00 UTC daily)
 */

const cron = require('node-cron');
const { execFile } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CRON_EXPR = process.env.GREENWAYS_FINANCE_DAILY_CRON || '0 6 * * *';
const ENABLED = process.env.GREENWAYS_FINANCE_DAILY_CRON_ENABLED === '1';

let running = false;

function runFinanceDailyBuild() {
  if (running) {
    console.log('⏳ finance-daily cron skipped — previous run still in progress');
    return;
  }
  running = true;
  const started = Date.now();
  console.log('📰 finance-daily cron starting…');

  execFile(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'build:finance-daily'],
    { cwd: ROOT, env: process.env, maxBuffer: 10 * 1024 * 1024 },
    (error, stdout, stderr) => {
      running = false;
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      if (error) {
        console.error(`❌ finance-daily cron failed (${secs}s):`, error.message);
        if (stderr) console.error(stderr.slice(0, 2000));
        return;
      }
      const line = (stdout || '').trim().split('\n').filter(Boolean).pop();
      console.log(`✅ finance-daily cron OK (${secs}s)${line ? ` — ${line}` : ''}`);
    }
  );
}

function startFinanceDailyCron() {
  if (!ENABLED) {
    console.log('ℹ️ finance-daily cron disabled (set GREENWAYS_FINANCE_DAILY_CRON_ENABLED=1 on Render)');
    return;
  }
  if (!cron.validate(CRON_EXPR)) {
    console.warn(`⚠️ Invalid GREENWAYS_FINANCE_DAILY_CRON: ${CRON_EXPR}`);
    return;
  }
  cron.schedule(CRON_EXPR, runFinanceDailyBuild, { timezone: 'UTC' });
  console.log(`📅 finance-daily cron scheduled (${CRON_EXPR} UTC) → npm run build:finance-daily`);
}

module.exports = {
  startFinanceDailyCron,
  runFinanceDailyBuild
};
