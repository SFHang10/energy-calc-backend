#!/usr/bin/env node
/**
 * Smoke: ask miss aggregation (W7 US-021).
 */
const path = require('path');
const {
  normalizeQuestionPattern,
  isMissEvent,
  aggregateTopMisses
} = require(path.join(__dirname, '..', 'services', 'greenways-ask-logger'));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const norm = normalizeQuestionPattern('What grants are available for restaurant fridge upgrades in Netherlands?');
assert(norm.includes('grants'), 'normalizeQuestionPattern should keep grants');
assert(norm.includes('restaurant'), 'normalizeQuestionPattern should keep restaurant');
assert(!norm.includes('what'), 'normalizeQuestionPattern should drop stop words');

assert(isMissEvent({ source: 'fallback', ok: true }), 'fallback is miss');
assert(isMissEvent({ source: 'knowledge', intentId: 'overview', ok: true }) === false, 'knowledge hit not miss');
assert(isMissEvent({ source: 'error', ok: false }), 'error is miss');

const agg = aggregateTopMisses({ days: 7, limit: 10 });
assert(agg.ok === true, 'aggregateTopMisses ok');
assert(Array.isArray(agg.items), 'aggregateTopMisses items array');
console.log('OK ask-misses aggregation:', agg.missEvents, 'misses from', agg.totalEvents, 'events');
