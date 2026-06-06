const CALCULATION_VERSION = 'energy-guidance-core-v1';

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeRates(input = {}) {
  const defaults = {
    electricityRateEurPerKwh: 0.30,
    gasRateEurPerKwh: 0.11,
    waterRateEurPerLitre: 0.0025
  };
  const fallbackRatesUsed = [];
  const rates = {};

  Object.entries(defaults).forEach(([key, fallback]) => {
    const raw = toNumber(input[key]);
    if (raw === null || raw < 0) {
      rates[key] = fallback;
      fallbackRatesUsed.push(key);
    } else {
      rates[key] = raw;
    }
  });

  return { rates, fallbackRatesUsed };
}

function buildAssumptions({ fallbackRatesUsed = [], missingUtilities = [] } = {}) {
  return {
    ratesFallbackUsed: fallbackRatesUsed.length > 0,
    fallbackRatesUsed,
    missingUtilities
  };
}

function calculateConfidence({
  sourceQuality = {},
  benchmarkAvailable = true,
  matchScore = null,
  explicitRates = false
} = {}) {
  let score = 0;
  const reasons = [];

  if (sourceQuality.electricity === 'meter') {
    score += 35;
    reasons.push('Electricity usage provided by measured source.');
  } else if (sourceQuality.electricity === 'estimated') {
    score += 15;
    reasons.push('Electricity usage estimated.');
  }

  if (sourceQuality.gas === 'meter') score += 20;
  else if (sourceQuality.gas === 'estimated') score += 8;

  if (sourceQuality.water === 'meter') score += 20;
  else if (sourceQuality.water === 'estimated') score += 8;

  if (typeof matchScore === 'number' && matchScore >= 60) {
    score += 15;
    reasons.push('Strong equipment/category match confidence.');
  }

  if (explicitRates) {
    score += 10;
    reasons.push('Rates provided explicitly by user/system.');
  }

  if (!benchmarkAvailable) {
    score -= 10;
    reasons.push('Benchmark range unavailable.');
  }

  const band = score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low';
  return {
    score: Math.max(0, Math.min(100, score)),
    band,
    reasons
  };
}

module.exports = {
  CALCULATION_VERSION,
  normalizeRates,
  buildAssumptions,
  calculateConfidence
};
