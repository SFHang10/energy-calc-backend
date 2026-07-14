#!/usr/bin/env node
const path = require('path');
const {
  loadRestaurantAssets,
  rankEquipmentForQuestion,
  attachRestaurantAssetBenchmark,
  SITE_INVENTORY_MARKER
} = require(path.join(__dirname, '..', 'services', 'restaurant-asset-service'));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const bundle = loadRestaurantAssets('w2w-amsterdam-02');
assert(bundle && bundle.equipment.length > 20, 'w2w site should load equipment list');

const fridgeHits = rankEquipmentForQuestion(bundle.equipment, 'fridge refrigeration baseline');
assert(fridgeHits.some((r) => /fridge/i.test(r.name)), 'should rank fridges for fridge question');

const result = { answer: 'Baseline copy.\n\n_Tip here._' };
attachRestaurantAssetBenchmark(result, {
  question: 'equipment baseline fridge',
  intentId: 'baseline_equipment',
  profile: { siteId: 'w2w-amsterdam-02' }
});
assert(result.answer.includes(SITE_INVENTORY_MARKER), 'should attach site inventory marker');
assert(result.restaurantAssetFile.includes('wok-to-walk-equipment-list.json'), 'should record asset file');

const skipped = { answer: 'No site.' };
attachRestaurantAssetBenchmark(skipped, {
  question: 'equipment baseline',
  intentId: 'baseline_equipment',
  profile: {}
});
assert(!skipped.answer.includes(SITE_INVENTORY_MARKER), 'should fail open without siteId');

console.log('OK restaurant-asset-service');
