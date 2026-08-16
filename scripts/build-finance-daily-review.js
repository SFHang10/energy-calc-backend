/**
 * Build data/finance-daily-review.json — Vincent's thin daily price + news brief.
 *
 * Run: npm run build:finance-daily-review
 * Optional LLM polish: FINANCE_DAILY_REVIEW_LLM=1 (uses ASSISTANT_* / FINANCE_AGENT_* env)
 * Prefer after: npm run build:media-daily-brief when editions change.
 */

const fs = require('fs/promises');
const {
  OUT_PATH,
  composeFinanceDailyReview
} = require('../services/finance-daily-review');

async function maybePolishWithLlm(review) {
  if (process.env.FINANCE_DAILY_REVIEW_LLM !== '1') return review;
  try {
    const { maybeCallGreenwaysLlm } = require('../services/greenways-agent-llm');
    const polished = await maybeCallGreenwaysLlm({
      prefix: 'FINANCE_AGENT',
      maxTokens: 420,
      systemPrompt:
        'You are Vincent, Greenways Finance Agent. Rewrite the daily review as 1 headline + max 4 short bullets. ' +
        'Stay grounded only in the JSON facts. Wholesale ≠ retail. No invented prices or schemes. Plain markdown.',
      userPayload: {
        task: 'daily_price_review',
        review
      }
    });
    if (!polished || typeof polished !== 'string') return review;
    const lines = polished
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return review;
    const headline = lines[0].replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '');
    const bullets = lines
      .slice(1)
      .filter((l) => /^[-*]/.test(l) || l.length > 20)
      .slice(0, 4)
      .map((l, i) => ({
        id: `llm-${i}`,
        kind: 'llm',
        text: l.replace(/^[-*]\s*/, '')
      }));
    return {
      ...review,
      meta: { ...review.meta, source: 'heuristic+llm' },
      headline: headline || review.headline,
      bullets: bullets.length ? bullets : review.bullets
    };
  } catch (err) {
    console.warn('Finance daily review LLM polish skipped:', err.message);
    return review;
  }
}

async function main() {
  let review = await composeFinanceDailyReview({
    profile: { region: 'nl', sector: 'restaurant' },
    source: 'heuristic'
  });
  review = await maybePolishWithLlm(review);
  await fs.writeFile(OUT_PATH, `${JSON.stringify(review, null, 2)}\n`, 'utf8');
  console.log(
    `OK finance-daily-review → ${OUT_PATH} (${review.meta.briefDate}, ${review.bullets.length} bullets, ${review.stories.length} stories)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
