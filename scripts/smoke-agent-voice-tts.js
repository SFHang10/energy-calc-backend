/**
 * Smoke — agent voice TTS route (no API keys required for local checks).
 * Run: node scripts/smoke-agent-voice-tts.js
 */
const path = require('path');

const ROOT = path.join(__dirname, '..');
const {
  getTtsProviderStatus,
  getAgentTtsConfig,
  normalizeTtsText,
  synthesizeSpeech
} = require(path.join(ROOT, 'services/agent-voice-service'));

async function main() {
  const status = getTtsProviderStatus();
  if (status.available) {
    console.log('OK TTS provider active:', status.active);
  } else {
    console.log('OK TTS provider unavailable locally (expected without env keys)');
  }

  const andrieus = getAgentTtsConfig('grants-agent');
  if (!andrieus.useServerTts || !andrieus.voiceId) {
    throw new Error('grants-agent must have useServerTts + voiceId for pilot');
  }
  console.log('OK Andrieus pilot voice:', andrieus.voiceId);

  const zyanne = getAgentTtsConfig('sustainable-products-agent');
  if (!zyanne.voiceId) {
    throw new Error('sustainable-products-agent must have voiceId mapped');
  }
  console.log('OK Zyanne voice mapping:', zyanne.voiceId);

  const sample = normalizeTtsText('**Hello** — this is a short _spoken summary_ for testing.');
  if (!sample || sample.includes('**')) {
    throw new Error('normalizeTtsText should strip markdown');
  }
  console.log('OK normalizeTtsText:', sample.slice(0, 48) + '…');

  if (!status.available) {
    try {
      await synthesizeSpeech(sample, 'grants-agent');
      throw new Error('expected synthesizeSpeech to fail without keys');
    } catch (error) {
      if (error.code !== 'TTS_UNAVAILABLE') throw error;
      console.log('OK synthesizeSpeech fails open without keys');
    }
  } else {
    const audio = await synthesizeSpeech(sample, 'grants-agent');
    if (!audio.buffer?.length) throw new Error('expected audio buffer from live TTS');
    console.log('OK live TTS bytes:', audio.buffer.length, 'via', audio.provider);
  }

  console.log('\nAll agent-voice smokes passed.');
}

main().catch((error) => {
  console.error('FAIL', error.message || error);
  process.exit(1);
});
