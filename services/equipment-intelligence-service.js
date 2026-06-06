const fs = require('fs');
const path = require('path');
const {
  CALCULATION_VERSION,
  normalizeRates,
  buildAssumptions,
  calculateConfidence
} = require('./energy-guidance-core');

const DATA_PATH = path.join(__dirname, '..', 'data', 'equipment-intelligence-seed.json');
const FULL_DATABASE_PATH = path.join(__dirname, '..', 'FULL-DATABASE-5554.json');
const INTAKE_SUGGESTIONS_PATH = path.join(__dirname, '..', 'data', 'marketplace-intake-suggestions.json');
const {
  loadCatalog: loadSustainableProductsCatalog,
  persistFinderResults
} = require('./sustainable-products-catalog');

/**
 * Product-level grants attached to marketplace rows must match the enriched export built from
 * schemes.json (see product-grants-integrator.js + combined-grants-loader.js).
 * Order: root bundle first (same default as routes/product-widget.js), then energy-calculator mirrors.
 */
const GRANTS_PRODUCT_OVERLAY_CANDIDATES = [
  path.join(__dirname, '..', 'products-with-grants-and-collection.json'),
  path.join(__dirname, '..', 'energy-calculator', 'products-with-grants-and-collection.json'),
  path.join(__dirname, '..', 'products-with-grants.json'),
  path.join(__dirname, '..', 'energy-calculator', 'products-with-grants.json')
];

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
    this.productGrantsOverlay = this.loadProductGrantsOverlay();
    this.externalAlternatives = this.loadExternalAlternatives();
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

  loadProductGrantsOverlay() {
    const overlay = new Map();
    for (const filePath of GRANTS_PRODUCT_OVERLAY_CANDIDATES) {
      if (!fs.existsSync(filePath)) continue;
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        const products = Array.isArray(parsed.products) ? parsed.products : [];
        products.forEach((p) => {
          if (p && p.id != null) overlay.set(String(p.id), p.grants);
        });
        console.log(
          `✅ Equipment intelligence: merged grants overlay from ${path.basename(filePath)} (${overlay.size} product rows)`
        );
        return overlay;
      } catch (error) {
        console.error(`⚠️ Equipment intelligence: skipped grants overlay ${filePath}:`, error.message);
      }
    }
    console.warn(
      '⚠️ Equipment intelligence: no products-with-grants JSON found — marketplace grants fall back to FULL-DATABASE only'
    );
    return overlay;
  }

  /** Grants for a catalogue product: enriched overlay (from schemes-backed export) overrides FULL-DATABASE. */
  grantsForCatalogProduct(product) {
    const id = product && product.id != null ? String(product.id) : '';
    if (id && this.productGrantsOverlay.has(id)) {
      return this.parseGrants(this.productGrantsOverlay.get(id));
    }
    return this.parseGrants(product.grants);
  }

  /** Non-marketplace catalog: data/sustainable-products-catalog.json */
  loadExternalAlternatives() {
    const rows = loadSustainableProductsCatalog({ attachGrants: true, status: 'external' });
    if (rows.length) return rows;
    console.warn('⚠️ sustainable-products-catalog empty — external alternatives lane unavailable');
    return [];
  }

  reloadExternalCatalog() {
    this.externalAlternatives = this.loadExternalAlternatives();
  }

  shouldPersistFinderCatalog(query = {}) {
    return (
      query.persistCatalog === true ||
      query.persistCatalog === '1' ||
      query.saveToCatalog === true ||
      query.saveToCatalog === '1'
    );
  }

  mapCountryToGrantsRegion(countryOrRegion) {
    const key = String(countryOrRegion || 'nl').trim().toLowerCase();
    const map = {
      netherlands: 'nl',
      nl: 'nl',
      germany: 'de',
      de: 'de',
      belgium: 'be',
      be: 'be',
      'united kingdom': 'uk',
      uk: 'uk',
      france: 'fr',
      fr: 'fr',
      spain: 'es',
      es: 'es',
      italy: 'it',
      it: 'it',
      portugal: 'pt',
      pt: 'pt',
      ireland: 'ie',
      ie: 'ie'
    };
    return map[key] || (key.length === 2 ? key : 'nl');
  }

  persistFinderCatalogFromQuery(query, externalAlternatives) {
    const region = this.mapCountryToGrantsRegion(query.region || query.country);
    const catalogPersisted = persistFinderResults({
      finderQuery: String(query.name || '').trim(),
      finderSource: query.finderSource || query.source || 'sustainable_product_finder',
      region: region === 'uk' ? 'uk' : region === 'ie' ? 'ie' : region === 'de' ? 'de' : 'nl',
      brand: query.brand,
      model: query.model,
      type: this.normalizeType(query.type),
      actualDailyKwh: query.actualDailyKwh,
      actualDailyWaterLitres: query.actualDailyWaterLitres,
      actualDailyGasKwh: query.actualDailyGasKwh,
      externalAlternatives
    });
    this.reloadExternalCatalog();
    return catalogPersisted;
  }

  buildExternalDecisionOptions(externalAlternatives, baseline, rates) {
    const baselineCosts = this.calculateHorizonCosts(baseline, rates);
    return (externalAlternatives || []).map((item) => {
      let dailyKwh = baseline.dailyKwh;
      let dailyWaterLitres = baseline.dailyWaterLitres;
      let dailyGasKwh = baseline.dailyGasKwh;
      const factors = item.impactFactors;
      if (factors) {
        dailyGasKwh = baseline.dailyGasKwh * (1 - (Number(factors.gasReductionPct) || 0));
        dailyWaterLitres = baseline.dailyWaterLitres * (1 - (Number(factors.waterReductionPct) || 0));
        if (factors.electricityReductionPct != null) {
          dailyKwh = baseline.dailyKwh * (1 - (Number(factors.electricityReductionPct) || 0));
        }
      } else {
        dailyKwh = toNumber(item.utilityProfile?.dailyKwh) ?? baseline.dailyKwh;
        dailyWaterLitres = toNumber(item.utilityProfile?.dailyWaterLitres) ?? baseline.dailyWaterLitres;
        dailyGasKwh = toNumber(item.utilityProfile?.dailyGasKwh) ?? baseline.dailyGasKwh;
      }
      const normalizedOption = {
        source: 'external',
        id: item.id,
        catalogId: item.id,
        name: item.name,
        brand: item.brand || null,
        model: item.model || null,
        type: item.type || baseline.type,
        imageUrl: item.imageUrl || null,
        dailyKwh,
        dailyWaterLitres,
        dailyGasKwh,
        grants: Array.isArray(item.grants) ? item.grants.slice(0, 4) : [],
        impactFactors: item.impactFactors || null,
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
  }

  runFinderSession(body = {}) {
    const result = this.getAlternatives({
      ...body,
      persistCatalog: true
    });
    return result;
  }

  normalizeType(value) {
    const type = safeLower(value);
    if (type.includes('dish')) return 'dishwasher';
    if (type.includes('fridge') || type.includes('freezer') || type.includes('refriger')) return 'refrigerator';
    if (type.includes('oven') || type.includes('combi')) return 'oven';
    if (type.includes('fryer')) return 'fryer';
    if (type.includes('wok')) return 'wok';
    if (type.includes('water')) return 'water saving';
    return type || 'other';
  }

  externalProductMatchesQuery(product, normalizedQuery) {
    const queryType = normalizedQuery.type;
    if (!queryType || queryType === 'other') return true;
    if (this.normalizeType(product.type) === queryType) return true;
    const equipmentTypes = product.search?.equipmentTypes || [];
    if (equipmentTypes.some((t) => this.normalizeType(t) === queryType)) return true;
    const profiles = product.search?.profiles || [];
    if (profiles.some((p) => queryType.includes(safeLower(p)) || safeLower(p).includes(queryType))) {
      return true;
    }
    if (queryType === 'wok' && safeLower(product.type).includes('wok')) return true;
    return false;
  }

  estimateMarketplaceDailyKwh(product) {
    const power = toNumber(product.power);
    if (power === null || power <= 0) return null;
    const runHoursPerDay = 8;
    return Number(((power / 1000) * runHoursPerDay).toFixed(2));
  }

  estimateSavings(payload, baseline, rates) {
    const energyRate = rates.electricityRateEurPerKwh;
    const waterRate = rates.waterRateEurPerLitre;
    const gasRate = rates.gasRateEurPerKwh;
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
    const providedElectricity = toNumber(query.actualDailyKwh) !== null;
    const providedWater = toNumber(query.actualDailyWaterLitres) !== null;
    const providedGas = toNumber(query.actualDailyGasKwh) !== null;
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
    const { rates, fallbackRatesUsed } = normalizeRates({
      electricityRateEurPerKwh: query.electricityRateEurPerKwh,
      gasRateEurPerKwh: query.gasRateEurPerKwh,
      waterRateEurPerLitre: query.waterRateEurPerLitre
    });
    const assumptions = buildAssumptions({
      fallbackRatesUsed,
      missingUtilities: [
        !providedElectricity ? 'electricity' : null,
        !providedGas ? 'gas' : null,
        !providedWater ? 'water' : null
      ].filter(Boolean)
    });

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
        }, baseline, rates);
        const productDaily = {
          dailyKwh: estimatedDailyKwh ?? baseline.dailyKwh,
          dailyWaterLitres: baseline.dailyWaterLitres,
          dailyGasKwh: baseline.dailyGasKwh
        };
        const grants = this.grantsForCatalogProduct(product);
        const consumer = this.buildConsumerInsight(baseline, productDaily, rates);
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
          savings,
          consumer,
          grants: grants.slice(0, 4)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const externalAlternatives = this.externalAlternatives
      .map((product) => {
        const matchesType = this.externalProductMatchesQuery(product, normalizedQuery);
        const haystack = uniqueStrings([
          ...tokenize(product.name),
          ...tokenize(product.brand),
          ...tokenize(product.model),
          ...tokenize(product.type),
          ...(product.search?.keywords || []).flatMap((k) => tokenize(k)),
          ...(product.search?.profiles || []).flatMap((p) => tokenize(p))
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
        }, baseline, rates);
        const productDaily = {
          dailyKwh: product.utilityProfile.dailyKwh,
          dailyWaterLitres: product.utilityProfile.dailyWaterLitres,
          dailyGasKwh: product.utilityProfile.dailyGasKwh
        };
        const consumer = this.buildConsumerInsight(baseline, productDaily, rates);
        return {
          ...product,
          score,
          savings,
          notInMarketplace: true,
          consumer
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    let catalogPersisted = null;
    if (this.shouldPersistFinderCatalog(query)) {
      catalogPersisted = this.persistFinderCatalogFromQuery(query, externalAlternatives);
    }

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
      calculationVersion: CALCULATION_VERSION,
      assumptions,
      confidence: calculateConfidence({
        sourceQuality: {
          electricity: providedElectricity ? 'meter' : 'estimated',
          gas: providedGas ? 'meter' : 'estimated',
          water: providedWater ? 'meter' : 'estimated'
        },
        benchmarkAvailable: true,
        matchScore: marketplaceMatches[0]?.score ?? null,
        explicitRates: fallbackRatesUsed.length === 0
      }),
      lookup: normalizedQuery,
      rates,
      marketplaceMatches,
      externalAlternatives,
      intakeCandidates,
      catalogPersisted
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

  /**
   * Consumer-facing running-cost comparison vs baseline (same horizon math as decision matrix).
   * @param {object} baseline - { dailyKwh, dailyWaterLitres, dailyGasKwh }
   * @param {object} productDaily - same shape for the suggested product
   * @param {object} rates - normalized utility rates
   */
  buildConsumerInsight(baseline, productDaily, rates) {
    const bl = {
      dailyKwh: toNumber(baseline.dailyKwh) ?? 0,
      dailyWaterLitres: toNumber(baseline.dailyWaterLitres) ?? 0,
      dailyGasKwh: toNumber(baseline.dailyGasKwh) ?? 0
    };
    const op = {
      dailyKwh: toNumber(productDaily.dailyKwh) ?? 0,
      dailyWaterLitres: toNumber(productDaily.dailyWaterLitres) ?? 0,
      dailyGasKwh: toNumber(productDaily.dailyGasKwh) ?? 0
    };
    const baselineCosts = this.calculateHorizonCosts(bl, rates);
    const productCosts = this.calculateHorizonCosts(op, rates);
    const savings1m = Number((baselineCosts.horizons['1m'] - productCosts.horizons['1m']).toFixed(0));
    const savings1y = Number((baselineCosts.horizons['1y'] - productCosts.horizons['1y']).toFixed(0));
    const fmtEuro = (n) => `€${Math.round(Number(n) || 0).toLocaleString('en-GB')}`;
    let headline;
    if (savings1y > 15) {
      headline = `Based on your usage, this option could lower indicative running cost by about ${fmtEuro(savings1y)} per year vs your baseline (roughly ${fmtEuro(savings1m)} per month at these rate assumptions).`;
    } else if (savings1y < -15) {
      headline = 'At these assumptions, indicative running cost is similar or higher than your baseline — verify with your actual tariff and meter data before deciding.';
    } else {
      headline = 'Indicative running cost is close to your baseline at these assumptions — small changes in use or tariff band can flip the outcome.';
    }
    return {
      baselineDaily: {
        electricityKwh: Number(bl.dailyKwh.toFixed(2)),
        waterLitres: Number(bl.dailyWaterLitres.toFixed(1)),
        gasKwh: Number(bl.dailyGasKwh.toFixed(2))
      },
      productDaily: {
        electricityKwh: Number(op.dailyKwh.toFixed(2)),
        waterLitres: Number(op.dailyWaterLitres.toFixed(1)),
        gasKwh: Number(op.dailyGasKwh.toFixed(2))
      },
      runningCost: {
        baselineEurPerMonth: baselineCosts.horizons['1m'],
        productEurPerMonth: productCosts.horizons['1m'],
        eurSavedVsBaselinePerMonth: savings1m,
        eurSavedVsBaselinePerYear: savings1y,
        productDailyEur: productCosts.dailyCost,
        baselineDailyEur: baselineCosts.dailyCost
      },
      headline
    };
  }

  getDecisionMatrix(query) {
    const providedElectricity = toNumber(query.actualDailyKwh) !== null;
    const providedWater = toNumber(query.actualDailyWaterLitres) !== null;
    const providedGas = toNumber(query.actualDailyGasKwh) !== null;
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

    const normalizedRates = normalizeRates({
      electricityRateEurPerKwh: query.electricityRateEurPerKwh,
      gasRateEurPerKwh: query.gasRateEurPerKwh,
      waterRateEurPerLitre: query.waterRateEurPerLitre
    });
    const rates = normalizedRates.rates;
    const assumptions = buildAssumptions({
      fallbackRatesUsed: normalizedRates.fallbackRatesUsed,
      missingUtilities: [
        !providedElectricity ? 'electricity' : null,
        !providedGas ? 'gas' : null,
        !providedWater ? 'water' : null
      ].filter(Boolean)
    });

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
      const grants = this.grantsForCatalogProduct(catalogProduct);
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

    const externalOptions = this.buildExternalDecisionOptions(
      alternatives.externalAlternatives || [],
      baseline,
      rates
    );

    return {
      success: true,
      calculationVersion: CALCULATION_VERSION,
      assumptions,
      confidence: calculateConfidence({
        sourceQuality: {
          electricity: providedElectricity ? 'meter' : 'estimated',
          gas: providedGas ? 'meter' : 'estimated',
          water: providedWater ? 'meter' : 'estimated'
        },
        benchmarkAvailable: true,
        matchScore: alternatives.marketplaceMatches?.[0]?.score ?? null,
        explicitRates: normalizedRates.fallbackRatesUsed.length === 0
      }),
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
    record.catalogId = payload.catalogId || payload.sourceId || null;

    return { success: true, suggestion: record };
  }

  listSustainableCatalog(query = {}) {
    const { loadCatalog, listCatalogMeta } = require('./sustainable-products-catalog');
    const status = query.status || 'external';
    const products = loadCatalog({ attachGrants: true, status });
    return {
      success: true,
      meta: listCatalogMeta(),
      products
    };
  }

  upsertSustainableCatalogProduct(payload) {
    const { upsertProduct } = require('./sustainable-products-catalog');
    const result = upsertProduct(payload);
    if (result.success) {
      this.reloadExternalCatalog();
    }
    return result;
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
