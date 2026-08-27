/**
 * Fetch allowlisted EU/EIB RSS headlines for Vincent's daily layer.
 * Run: npm run build:finance-external-news
 */

const { buildFinanceExternalNews, DAILY_OUT, ROLLING_OUT } = require('../services/finance-external-news');

async function main() {
  const { daily, rolling, candidateUpsert } = await buildFinanceExternalNews({ write: true });
  const errNote = daily.meta.errors?.length ? ` (${daily.meta.errors.length} source errors)` : '';
  const queueNote = daily.meta.queueCount ? `, ${daily.meta.queueCount} queued (${candidateUpsert?.added || 0} new)` : '';
  console.log(
    `OK finance-external-news → ${DAILY_OUT} (${daily.items.length} today, ${rolling.items.length} rolling${queueNote})${errNote}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
