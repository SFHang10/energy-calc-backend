#!/usr/bin/env node
/**
 * SkillBoss / ElevenLabs TTS smoke for demo cast agents.
 * Usage: SKILLBOSS_API_KEY=... npm run smoke:agent-voice
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const {
  getTtsProviderStatus,
  getAgentTtsConfig,
  synthesizeSpeech,
  normalizeTtsText
} = require('../services/agent-voice-service');

const DEMO_SLUGS = ['grants-agent', 'finance-agent', 'deals-agent', 'equipment-agent'];
const SAMPLE =
  'This is a short Greenways voice test. Wholesale prices are a guide, not your retail bill.';

function loadDemoSlugs() {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'data', 'greenways-agent-voice-config.json'), 'utf8')
    );
    if (Array.isArray(cfg.demoCast?.slugs) && cfg.demoCast.slugs.length) {
      return cfg.demoCast.slugs;
    }
  } catch (_) {
    /* default */
  }
  return DEMO_SLUGS;
}

async function main() {
  const status = getTtsProviderStatus();
  console.log('Agent voice TTS smoke');
  console.log('  Provider status:', status);

  if (!status.available) {
    console.error('\nNo TTS provider — set SKILLBOSS_API_KEY on Render (recommended) or ELEVENLABS_API_KEY locally.');
    process.exit(1);
  }

  const slugs = loadDemoSlugs();
  let failed = 0;

  for (const slug of slugs) {
    const agentCfg = getAgentTtsConfig(slug);
    if (!agentCfg.useServerTts) {
      console.warn(`  skip ${slug} — useServerTts false`);
      continue;
    }
    if (!agentCfg.voiceId) {
      console.error(`  FAIL ${slug} — missing voiceId`);
      failed += 1;
      continue;
    }
    try {
      const audio = await synthesizeSpeech(SAMPLE, slug);
      const kb = Math.round((audio.buffer?.length || 0) / 1024);
      console.log(`  OK ${slug} (${agentCfg.name}) — ${audio.provider}, ${kb} KB, voice ${agentCfg.voiceId}`);
    } catch (err) {
      console.error(`  FAIL ${slug}:`, err.message || err);
      failed += 1;
    }
  }

  const plain = normalizeTtsText('**Grants** — [scheme portal](https://example.com)');
  if (plain.includes('**') || plain.includes('[')) {
    console.error('  FAIL markdown strip in normalizeTtsText');
    failed += 1;
  }

  if (failed) process.exit(2);
  console.log('\nDemo cast TTS ready. Open /greenways/{agent} on Render (no embed=1) and tap Listen.');
}

main().catch((e) => {
  console.error(e);
  process.exit(99);
});
