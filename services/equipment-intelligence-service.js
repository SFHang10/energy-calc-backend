const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'equipment-intelligence-seed.json');
const FULL_DATABASE_PATH = path.join(__dirname, '..', 'FULL-DATABASE-5554.json');
const INTAKE_SUGGESTIONS_PATH = path.join(__dirname, '..', 'data', 'marketplace-intake-suggestions.json');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function safeLower(value) {
  return String(value || '').toLowerCase();
}

class EquipmentIntelligenceService {
  constructor() {
    this.seed = this.loadSeedData();
    this.marketplaceCatalog = this.loadMarketplaceCatalog();
    this.externalAlternatives = this.buildExternalAlternatives();
  }

  loadSeedData() {
    try {
      const raw = fs.readFileSync(DATA_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.equipment) ? parsed.equipment : [];
    } catch (error) {
      console.error('⚠️ Failed to load equipment intelligence seed data:', error.message);
      return [];
    }
  }

  loadMarketplaceCatalog() {
    try {
      const raw = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.products) ? parsed.products : [];
    } catch (error) {
      console.error('⚠️ Failed to load marketplace catalog for alternatives:', error.message);
      return [];
    }
  }

  buildExternalAlternatives() {
    return [
      {
        id: 'external_true_tuc-24-hc',
        source: 'sustainable_product_finder',
        name: 'TRUE TUC-24-HC Undercounter Refrigerator',
        brand: 'TRUE',
        model: 'TUC-24-HC',
        type: 'refrigerator',
        utilityProfile: { dailyKwh: 9.2, dailyWaterLitres: 0, dailyGasKwh: 0 },
        summary: 'Hydrocarbon refrigerant unit with lower compressor duty and improved insulation.'
      },
      {
        id: 'external_hoshizaki_jwe-620',
        source: 'sustainable_product_finder',
        name: 'Hoshizaki JWE-620 Undercounter Dishwasher',
        brand: 'Hoshizaki',
        model: 'JWE-620',
        type: 'dishwasher',
        utilityProfile: { dailyKwh: 14.6, dailyWaterLitres: 190, dailyGasKwh: 0 },
        summary: 'Low-water, heat-recovery commercial dishwasher for medium throughput kitchens.'
      },
      {
        id: 'external_rational_icombi_pro',
        source: 'sustainable_product_finder',
        name: 'Rational iCombi Pro 6-1/1',
        brand: 'Rational',
        model: 'iCombi Pro',
        type: 'oven',
        utilityProfile: { dailyKwh: 10.4, dailyWaterLitres: 48, dailyGasKwh: 0 },
        summary: 'Efficient combi oven with adaptive cooking cycles and reduced idle overhead.'
      },
      {
        id: 'external_frymaster_fpx',
        source: 'sustainable_product_finder',
        name: 'Frymaster FPH155 High-Efficiency Fryer',
        brand: 'Frymaster',
        model: 'FPH155',
        type: 'fryer',
        utilityProfile: { dailyKwh: 0, dailyWaterLitres: 0, dailyGasKwh: 24.5 },
        summary: 'Condensing gas fryer with improved thermal transfer and reduced standby losses.'
      },
      {
        id: 'external_meiko_upster',
        source: 'sustainable_product_finder',
        name: 'MEIKO UPster U 500',
        brand: 'MEIKO',
        model: 'UPster U 500',
        type: 'dishwasher',
        utilityProfile: { dailyKwh: 12.8, dailyWaterLitres: 165, dailyGasKwh: 0 },
        summary: 'Compact warewashing platform with lower water and detergent intensity.'
      }
    ];
  }

  normalizeType(value) {
    const type = safeLower(value);
    if (type.includes('dish')) return 'dishwasher';
    if (type.includes('fridge') || type.includes('freezer') || type.includes('refriger')) return 'refrigerator';
    if (type.includes('oven') || type.includes('combi')) return 'oven';
    if (type.includes('fryer')) return 'fryer';
    return type || 'other';
  }

  estimateMarketplaceDailyKwh(product) {
    const power = toNumber(product.power);
    if (power === null || power <= 0) return null;
    const runHoursPerDay = 8;
    return Number(((power / 1000) * runHoursPerDay).toFixed(2));
  }

  estimateSavings(payload, baseline) {
    const energyRate = toNumber(payload.energyRateEurPerKwh) ?? 0.30;
    const waterRate = toNumber(payload.waterRateEurPerLitre) ?? 0.0025;
    const gasRate = toNumber(payload.gasRateEurPerKwh) ?? 0.11;
    const annualEnergySaved = Math.max(0, (baseline.dailyKwh - payload.dailyKwh) * 365);
    const annualWaterSaved = Math.max(0, (baseline.dailyWaterLitres - payload.dailyWaterLitres) * 365);
    const annualGasSaved = Math.max(0, (baseline.dailyGasKwh - payload.dailyGasKwh) * 365);
    const annualCostSaved = (annualEnergySaved * energyRate) + (annualWaterSaved * waterRate) + (annualGasSaved * gasRate);
    return {
      annualEnergySavedKwh: Number(annualEnergySaved.toFixed(1)),
      annualWaterSavedLitres: Number(annualWaterSaved.toFixed(1)),
      annualGasSavedKwh: Number(annualGasSaved.toFixed(1)),
      annualEstimatedCostSavedEur: Number(annualCostSaved.toFixed(2))
    };
  }

  getAlternatives(query) {
    const normalizedQuery = {
      name: String(query.name || '').trim(),
      brand: String(query.brand || '').trim(),
      model: String(query.model || '').trim(),
      type: this.normalizeType(query.type),
      actualDailyKwh: toNumber(query.actualDailyKwh) ?? 0,
      actualDailyWaterLitres: toNumber(query.actualDailyWaterLitres) ?? 0,
      actualDailyGasKwh: toNumber(query.actualDailyGasKwh) ?? 0
    };

    if (!normalizedQuery.name && !normalizedQuery.type) {
      return {
        success: false,
        message: 'Provide name or type to find alternatives.'
      };
    }

    const searchTokens = uniqueStrings([
      ...tokenize(normalizedQuery.name),
      ...tokenize(normalizedQuery.brand),
      ...tokenize(normalizedQuery.model),
      ...tokenize(normalizedQuery.type)
    ]);

    const baseline = {
      dailyKwh: normalizedQuery.actualDailyKwh,
      dailyWaterLitres: normalizedQuery.actualDailyWaterLitres,
      dailyGasKwh: normalizedQuery.actualDailyGasKwh
    };

    const marketplaceMatches = this.marketplaceCatalog
      .map((product) => {
        const haystack = uniqueStrings([
          ...tokenize(product.name),
          ...tokenize(product.brand),
          ...tokenize(product.modelNumber),
          ...tokenize(product.category),
          ...tokenize(product.subcategory)
        ]);
        let score = 0;
        searchTokens.forEach((token) => {
          if (haystack.includes(token)) score += 8;
          else if (haystack.some((value) => value.includes(token) || token.includes(value))) score += 4;
        });
        if (score === 0) return null;
        const estimatedDailyKwh = this.estimateMarketplaceDailyKwh(product);
        const savings = this.estimateSavings({
          dailyKwh: estimatedDailyKwh ?? baseline.dailyKwh,
          dailyWaterLitres: baseline.dailyWaterLitres,
          dailyGasKwh: baseline.dailyGasKwh
        }, baseline);
        return {
          source: 'greenways_marketplace',
          id: product.id,
          name: product.name,
          brand: product.brand || 'Unknown',
          model: product.modelNumber || null,
          category: product.category || null,
          estimatedDailyKwh,
          imageUrl: product.imageUrl || null,
          score,
          savings
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const externalAlternatives = this.externalAlternatives
      .map((product) => {
        const matchesType = !normalizedQuery.type || normalizedQuery.type === 'other'
          ? true
          : this.normalizeType(product.type) === normalizedQuery.type;
        const haystack = uniqueStrings([
          ...tokenize(product.name),
          ...tokenize(product.brand),
          ...tokenize(product.model),
          ...tokenize(product.type)
        ]);
        let score = matchesType ? 10 : 0;
        searchTokens.forEach((token) => {
          if (haystack.includes(token)) score += 8;
          else if (haystack.some((value) => value.includes(token) || token.includes(value))) score += 4;
        });
        if (score < 10) return null;
        const savings = this.estimateSavings({
          dailyKwh: product.utilityProfile.dailyKwh,
          dailyWaterLitres: product.utilityProfile.dailyWaterLitres,
          dailyGasKwh: product.utilityProfile.dailyGasKwh
        }, baseline);
        return {
          ...product,
          score,
          savings,
          notInMarketplace: true
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const intakeCandidates = externalAlternatives
      .filter((item) => item.savings.annualEstimatedCostSavedEur >= 100)
      .map((item) => ({
        sourceId: item.id,
        name: item.name,
        brand: item.brand,
        model: item.model,
        type: item.type,
        estimatedAnnualCostSavedEur: item.savings.annualEstimatedCostSavedEur,
        reason: 'Strong external alternative with meaningful estimated annual savings.'
      }));

    return {
      success: true,
      lookup: normalizedQuery,
      marketplaceMatches,
      externalAlternatives,
      intakeCandidates
    };
  }

  parseGrants(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  calculateHorizonCosts(option, rates) {
    const dailyKwh = toNumber(option.dailyKwh) ?? 0;
    const dailyGasKwh = toNumber(option.dailyGasKwh) ?? 0;
    const dailyWaterLitres = toNumber(option.dailyWaterLitres) ?? 0;
    const dailyCost =
      (dailyKwh * rates.electricityRateEurPerKwh) +
      (dailyGasKwh * rates.gasRateEurPerKwh) +
      (dailyWaterLitres * rates.waterRateEurPerLitre);
    const multipliers = {
      '1m': 30,
      '6m': 182,
      '1y': 365,
      '2y': 730,
      '10y': 3650
    };
    const horizons = Object.entries(multipliers).reduce((acc, [key, days]) => {
      acc[key] = Number((dailyCost * days).toFixed(2));
      return acc;
    }, {});
    return {
      dailyCost: Number(dailyCost.toFixed(2)),
      horizons
    };
  }

  getDecisionMatrix(query) {
    const type = this.normalizeType(query.type);
    const baseline = {
      source: 'current',
      name: String(query.name || 'Current Equipment').trim() || 'Current Equipment',
      brand: String(query.brand || '').trim() || null,
      model: String(query.model || '').trim() || null,
      type: type || 'other',
      dailyKwh: toNumber(query.actualDailyKwh) ?? 0,
      dailyWaterLitres: toNumber(query.actualDailyWaterLitres) ?? 0,
      dailyGasKwh: toNumber(query.actualDailyGasKwh) ?? 0
    };

    const rates = {
      electricityRateEurPerKwh: toNumber(query.electricityRateEurPerKwh) ?? 0.30,
      gasRateEurPerKwh: toNumber(query.gasRateEurPerKwh) ?? 0.11,
      waterRateEurPerLitre: toNumber(query.waterRateEurPerLitre) ?? 0.0025
    };

    const alternatives = this.getAlternatives({
      name: baseline.name,
      brand: baseline.brand,
      model: baseline.model,
      type: baseline.type,
      actualDailyKwh: baseline.dailyKwh,
      actualDailyWaterLitres: baseline.dailyWaterLitres,
      actualDailyGasKwh: baseline.dailyGasKwh
    });

    if (!alternatives.success) {
      return alternatives;
    }

    const baselineCosts = this.calculateHorizonCosts(baseline, rates);

    const greenwaysOptions = (alternatives.marketplaceMatches || []).map((item) => {
      const catalogProduct = this.marketplaceCatalog.find((p) => p.id === item.id) || {};
      const grants = this.parseGrants(catalogProduct.grants);
      const normalizedOption = {
        source: 'greenways',
        id: item.id,
        name: item.name,
        brand: item.brand || null,
        model: item.model || null,
        type: baseline.type,
        imageUrl: item.imageUrl || catalogProduct.imageUrl || null,
        dailyKwh: toNumber(item.estimatedDailyKwh) ?? baseline.dailyKwh,
        dailyWaterLitres: baseline.dailyWaterLitres,
        dailyGasKwh: baseline.dailyGasKwh,
        grants: grants.slice(0, 4),
        deals: { available: false, action: 'wire_later' }
      };
      const costs = this.calculateHorizonCosts(normalizedOption, rates);
      return {
        ...normalizedOption,
        costs,
        savings: Object.keys(costs.horizons).reduce((acc, key) => {
          acc[key] = Number((baselineCosts.horizons[key] - costs.horizons[key]).toFixed(2));
          return acc;
        }, {})
      };
    });

    const externalOptions = (alternatives.externalAlternatives || []).map((item) => {
      const normalizedOption = {
        source: 'external',
        id: item.id,
        name: item.name,
        brand: item.brand || null,
        model: item.model || null,
        type: item.type || baseline.type,
        imageUrl: null,
        dailyKwh: toNumber(item.utilityProfile?.dailyKwh) ?? baseline.dailyKwh,
        dailyWaterLitres: toNumber(item.utilityProfile?.dailyWaterLitres) ?? baseline.dailyWaterLitres,
        dailyGasKwh: toNumber(item.utilityProfile?.dailyGasKwh) ?? baseline.dailyGasKwh,
        grants: [],
        deals: { available: false, action: 'wire_later' }
      };
      const costs = this.calculateHorizonCosts(normalizedOption, rates);
      return {
        ...normalizedOption,
        costs,
        savings: Object.keys(costs.horizons).reduce((acc, key) => {
          acc[key] = Number((baselineCosts.horizons[key] - costs.horizons[key]).toFixed(2));
          return acc;
        }, {})
      };
    });

    return {
      success: true,
      rates,
      baseline: {
        ...baseline,
        costs: baselineCosts
      },
      greenwaysOptions,
      externalOptions,
      horizons: ['1m', '6m', '1y', '2y', '10y']
    };
  }

  saveIntakeSuggestion(payload) {
    const name = String(payload.name || '').trim();
    const brand = String(payload.brand || '').trim();
    const model = String(payload.model || '').trim();
    const type = String(payload.type || '').trim();
    if (!name) {
      return { success: false, message: 'Suggestion name is required.' };
    }

    const annualCostSaved = toNumber(payload?.expectedSavings?.annualEstimatedCostSavedEur) ?? 0;
    const annualEnergySaved = toNumber(payload?.expectedSavings?.annualEnergySavedKwh) ?? 0;
    const annualWaterSaved = toNumber(payload?.expectedSavings?.annualWaterSavedLitres) ?? 0;
    const annualGasSaved = toNumber(payload?.expectedSavings?.annualGasSavedKwh) ?? 0;
    const utilityType = annualGasSaved > annualEnergySaved
      ? 'gas'
      : annualWaterSaved > annualEnergySaved
        ? 'water'
        : 'electricity';
    const roiBand = annualCostSaved >= 900 ? 'high' : annualCostSaved >= 300 ? 'medium' : 'low';
    const priorityScore = clamp(
      Math.round((annualCostSaved / 30) + (annualEnergySaved / 120) + (annualWaterSaved / 2000) + (annualGasSaved / 100)),
      1,
      100
    );

    const record = {
      id: `intake_${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: payload.source || 'restaurant-equipment-deep-dive',
      name,
      brand: brand || null,
      model: model || null,
      type: type || null,
      reason: String(payload.reason || '').trim() || 'Suggested from deep dive alternatives module.',
      expectedSavings: payload.expectedSavings || null,
      triage: {
        utilityType,
        roiBand,
        priorityScore,
        tags: uniqueStrings([
          `utility:${utilityType}`,
          `roi:${roiBand}`,
          priorityScore >= 70 ? 'priority:urgent' : priorityScore >= 40 ? 'priority:recommended' : 'priority:backlog'
        ])
      },
      status: 'new'
    };

    let existing = [];
    try {
      const raw = fs.readFileSync(INTAKE_SUGGESTIONS_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      existing = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    } catch (error) {
      existing = [];
    }

    const next = {
      updatedAt: new Date().toISOString(),
      suggestions: [record, ...existing]
    };
    fs.writeFileSync(INTAKE_SUGGESTIONS_PATH, JSON.stringify(next, null, 2), 'utf8');
    return { success: true, suggestion: record };
  }

  listIntakeSuggestions() {
    try {
      const raw = fs.readFileSync(INTAKE_SUGGESTIONS_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
      return {
        success: true,
        updatedAt: parsed.updatedAt || null,
        suggestions
      };
    } catch (error) {
      return {
        success: true,
        updatedAt: null,
        suggestions: []
      };
    }
  }

  getIntakeShortlist(query = {}) {
    const status = String(query.status || 'new').trim().toLowerCase();
    const limit = clamp(toNumber(query.limit) ?? 8, 1, 50);
    const listed = this.listIntakeSuggestions();
    if (!listed.success) return listed;

    const shortlist = listed.suggestions
      .filter((item) => (status ? safeLower(item.status) === status : true))
      .sort((a, b) => (toNumber(b?.triage?.priorityScore) ?? 0) - (toNumber(a?.triage?.priorityScore) ?? 0))
      .slice(0, limit);

    return {
      success: true,
      updatedAt: listed.updatedAt,
      total: shortlist.length,
      shortlist
    };
  }

  updateIntakeSuggestionStatus(payload = {}) {
    const suggestionId = String(payload.id || '').trim();
    const nextStatus = String(payload.status || '').trim().toLowerCase();
    const allowedStatuses = ['new', 'in_review', 'approved', 'added', 'rejected'];
    if (!suggestionId) {
      return { success: false, message: 'Suggestion id is required.' };
    }
    if (!allowedStatuses.includes(nextStatus)) {
      return { success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` };
    }

    const listed = this.listIntakeSuggestions();
    const suggestions = Array.isArray(listed.suggestions) ? listed.suggestions : [];
    const index = suggestions.findIndex((item) => String(item.id) === suggestionId);
    if (index < 0) {
      return { success: false, message: 'Suggestion not found.' };
    }

    const current = suggestions[index];
    suggestions[index] = {
      ...current,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    const next = {
      updatedAt: new Date().toISOString(),
      suggestions
    };
    fs.writeFileSync(INTAKE_SUGGESTIONS_PATH, JSON.stringify(next, null, 2), 'utf8');

    return {
      success: true,
      suggestion: suggestions[index]
    };
  }

  scoreEquipment(record, query) {
    const queryTokens = uniqueStrings([
      ...tokenize(query.name),
      ...tokenize(query.brand),
      ...tokenize(query.model),
      ...tokenize(query.type)
    ]);

    if (queryTokens.length === 0) {
      return 0;
    }

    const haystack = uniqueStrings([
      ...tokenize(record.name),
      ...tokenize(record.brand),
      ...tokenize(record.model),
      ...tokenize(record.category),
      ...tokenize(record.type),
      ...((record.aliases || []).flatMap((alias) => tokenize(alias)))
    ]);

    let score = 0;
    queryTokens.forEach((token) => {
      if (haystack.includes(token)) score += 12;
      else if (haystack.some((value) => value.includes(token) || token.includes(value))) score += 6;
    });

    const serial = normalizeText(query.serial);
    if (serial && record.serialPrefix && serial.startsWith(normalizeText(record.serialPrefix))) {
      score += 10;
    }

    if (normalizeText(query.model) && normalizeText(record.model) === normalizeText(query.model)) {
      score += 20;
    }

    return score;
  }

  buildResponse(record, query, score) {
    const confidence = score >= 55 ? 'high' : score >= 35 ? 'medium' : 'low';
    const benchmark = record.benchmarks || {};
    const specs = record.specs || {};

    return {
      success: true,
      found: true,
      confidence,
      lookup: {
        name: query.name || null,
        brand: query.brand || null,
        model: query.model || null,
        serial: query.serial || null,
        type: query.type || null
      },
      equipment: {
        id: record.id,
        name: record.name,
        brand: record.brand || null,
        model: record.model || null,
        category: record.category || null,
        type: record.type || null,
        summary: record.summary || ''
      },
      consumption: {
        connectedLoadKw: specs.connectedLoadKw ?? null,
        kwhPerHourInUse: specs.kwhPerHourInUse ?? null,
        idleKw: specs.idleKw ?? null,
        waterLitresPerHour: specs.waterLitresPerHour ?? null,
        waterLitresPerCycle: specs.waterLitresPerCycle ?? null,
        gasKw: specs.gasKw ?? null,
        heatOutputKw: specs.heatOutputKw ?? null,
        voltage: specs.voltage || null,
        capacity: specs.capacity || null
      },
      benchmarks: {
        energyPerCycleKwh: benchmark.energyPerCycleKwh ?? null,
        energyPerMealKwh: benchmark.energyPerMealKwh ?? null,
        typicalDailyKwhMin: benchmark.typicalDailyKwhMin ?? null,
        typicalDailyKwhMax: benchmark.typicalDailyKwhMax ?? null,
        typicalAnnualKwhMin: benchmark.typicalAnnualKwhMin ?? null,
        typicalAnnualKwhMax: benchmark.typicalAnnualKwhMax ?? null,
        dailyWaterLitresMin: benchmark.dailyWaterLitresMin ?? null,
        dailyWaterLitresMax: benchmark.dailyWaterLitresMax ?? null,
        efficiencyRating: benchmark.efficiencyRating || null
      },
      healthChecks: record.healthChecks || [],
      notes: record.notes || null,
      sources: record.sources || [],
      comparisonHints: [
        'Capture actual daily kWh from meter or dashboard for 7 days.',
        'Compare actual daily usage to benchmark range adjusted for opening hours.',
        'Flag sustained usage >15% above benchmark for maintenance review.'
      ]
    };
  }

  search(query) {
    const normalizedQuery = {
      name: String(query.name || '').trim(),
      brand: String(query.brand || '').trim(),
      model: String(query.model || '').trim(),
      serial: String(query.serial || '').trim(),
      type: String(query.type || '').trim()
    };

    const hasInput = Object.values(normalizedQuery).some(Boolean);
    if (!hasInput) {
      return {
        success: false,
        found: false,
        message: 'Provide at least one lookup field.'
      };
    }

    const ranked = this.seed
      .map((record) => ({ record, score: this.scoreEquipment(record, normalizedQuery) }))
      .sort((a, b) => b.score - a.score);

    const top = ranked[0];
    if (!top || top.score < 20) {
      return {
        success: true,
        found: false,
        message: 'No close equipment match found yet. Try brand + model for better accuracy.',
        suggestions: this.seed.slice(0, 3).map((item) => ({
          name: item.name,
          brand: item.brand,
          model: item.model,
          type: item.type
        }))
      };
    }

    const response = this.buildResponse(top.record, normalizedQuery, top.score);
    response.matchScore = clamp(top.score, 0, 100);
    return response;
  }

  compare(query) {
    const actualDailyKwh = toNumber(query.actualDailyKwh);
    if (actualDailyKwh === null || actualDailyKwh < 0) {
      return {
        success: false,
        found: false,
        message: 'Provide a valid non-negative number for actualDailyKwh.'
      };
    }

    const lookup = this.search(query);
    if (!lookup.success || !lookup.found) {
      return lookup;
    }

    const min = toNumber(lookup.benchmarks.typicalDailyKwhMin);
    const max = toNumber(lookup.benchmarks.typicalDailyKwhMax);
    const hasRange = min !== null && max !== null && max >= min;
    const midpoint = hasRange ? (min + max) / 2 : null;

    let status = 'unknown';
    let deltaKwh = null;
    let deltaPercent = null;

    if (hasRange) {
      if (actualDailyKwh < min) {
        status = 'below_benchmark';
        deltaKwh = min - actualDailyKwh;
      } else if (actualDailyKwh > max) {
        status = 'above_benchmark';
        deltaKwh = actualDailyKwh - max;
      } else {
        status = 'within_benchmark';
        deltaKwh = 0;
      }

      if (midpoint && midpoint > 0) {
        deltaPercent = ((actualDailyKwh - midpoint) / midpoint) * 100;
      }
    }

    const annualizedActualKwh = actualDailyKwh * 365;
    const benchmarkAnnualMin = hasRange ? min * 365 : null;
    const benchmarkAnnualMax = hasRange ? max * 365 : null;
    const excessAnnualKwh = hasRange && status === 'above_benchmark' ? (actualDailyKwh - max) * 365 : 0;

    const guidance = [];
    if (status === 'above_benchmark') {
      guidance.push('Investigate maintenance items first before replacement decisions.');
      guidance.push('Check run-hours and idle periods against kitchen service schedule.');
      guidance.push('Use deep dive comparison to evaluate low-energy replacement options.');
    } else if (status === 'within_benchmark') {
      guidance.push('Performance is in the expected range for this equipment profile.');
      guidance.push('Continue weekly monitoring to detect drift.');
    } else if (status === 'below_benchmark') {
      guidance.push('Usage is below benchmark; validate meter mapping and runtime assumptions.');
      guidance.push('If confirmed, this unit is currently operating efficiently.');
    } else {
      guidance.push('Benchmark range unavailable for this equipment; use category-level estimates.');
    }

    return {
      success: true,
      found: true,
      lookup,
      comparison: {
        actualDailyKwh,
        benchmarkDailyKwhMin: min,
        benchmarkDailyKwhMax: max,
        status,
        deltaKwh: deltaKwh === null ? null : Number(deltaKwh.toFixed(2)),
        deltaPercentFromMidpoint: deltaPercent === null ? null : Number(deltaPercent.toFixed(1)),
        annualizedActualKwh: Number(annualizedActualKwh.toFixed(2)),
        benchmarkAnnualKwhMin: benchmarkAnnualMin === null ? null : Number(benchmarkAnnualMin.toFixed(2)),
        benchmarkAnnualKwhMax: benchmarkAnnualMax === null ? null : Number(benchmarkAnnualMax.toFixed(2)),
        excessAnnualKwh: Number(excessAnnualKwh.toFixed(2))
      },
      guidance
    };
  }
}

module.exports = { EquipmentIntelligenceService };
