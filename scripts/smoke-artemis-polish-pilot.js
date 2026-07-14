#!/usr/bin/env node
const path = require('path');
const {
  isPolishIntentAllowed,
  EQUIPMENT_POLISH_INTENT_DEFAULTS
} = require(path.join(__dirname, '..', 'services', 'greenways-agent-llm-fallback'));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// polishAllowlist is not exported — check via intent helper
for (const intentId of EQUIPMENT_POLISH_INTENT_DEFAULTS) {
  assert(isPolishIntentAllowed('equipment', intentId), `pilot intent ${intentId}`);
}
assert(!isPolishIntentAllowed('equipment', 'overview'), 'overview not in pilot');
assert(isPolishIntentAllowed('finance', 'energy_prices'), 'finance not intent-gated');

console.log('OK Artemis polish pilot intents:', EQUIPMENT_POLISH_INTENT_DEFAULTS.join(', '));
