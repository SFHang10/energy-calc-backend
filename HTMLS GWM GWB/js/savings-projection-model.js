/**
 * Equipment replacement savings & payback projection (cumulative cost model).
 * Feed any product/scenario; outputs timeline for Chart.js and KPI chips.
 */
(function (global) {
  var ELEC = (global.SiteEnergyModel && global.SiteEnergyModel.ELEC_EUR_PER_KWH) || 0.3;

  /** Purchase price slider bounds (commercial kitchen equipment up to ~€25k; building-scale later). */
  var CAPEX_MIN = 200;
  var CAPEX_MAX = 25000;
  var CAPEX_MAX_BUILDING = 150000;

  var CAPEX_TIERS_BUILDING = [
    5000, 8000, 10000, 15000, 20000, 25000, 35000, 50000, 65000, 80000,
    100000, 120000, 150000
  ];

  /**
   * Snap points for purchase slider — finer steps at low €, coarser at commercial €.
   * (80 / 100 omitted as min purchase is €200 for this product view.)
   */
  var CAPEX_TIERS = [
    200, 400, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500,
    8000, 10000, 12000, 15000, 18000, 20000, 25000
  ];

  function num(v, fb) {
    var n = Number(v);
    return Number.isFinite(n) ? n : fb;
  }

  function monthlyFromDailyKwh(dailyKwh) {
    return num(dailyKwh, 0) * 30 * ELEC;
  }

  /**
   * @param {object} input
   * @param {number} input.baselineMonthlyEur - current running cost €/mo
   * @param {number} input.proposedMonthlyEur - new equipment running cost €/mo
   * @param {number} input.capexEur - purchase price
   * @param {number} [input.grantsEur] - direct grant / subsidy off purchase
   * @param {number} [input.taxBenefitEur] - illustrative tax relief (treated like cash back on net cost)
   * @param {number} [input.purchaseMonth] - month index when buy happens (0 = now)
   * @param {number} [input.horizonMonths] - chart length (default 120)
   */
  function buildProjection(input) {
    var baselineMo = Math.max(0, num(input.baselineMonthlyEur, 0));
    var proposedMo = Math.max(0, num(input.proposedMonthlyEur, 0));
    var capex = Math.max(0, num(input.capexEur, 0));
    var grants = Math.max(0, num(input.grantsEur, 0));
    var taxBenefit = Math.max(0, num(input.taxBenefitEur, 0));
    var purchaseMonth = Math.max(0, Math.round(num(input.purchaseMonth, 0)));
    var horizon = Math.max(12, Math.round(num(input.horizonMonths, 120)));

    var totalIncentives = Math.min(capex, grants + taxBenefit);
    var netUpfront = Math.max(0, capex - totalIncentives);
    var monthlySavings = Math.max(0, baselineMo - proposedMo);
    var paybackMonths = monthlySavings > 0 && netUpfront > 0
      ? netUpfront / monthlySavings
      : (netUpfront <= 0 ? 0 : Infinity);
    var paybackWithoutGrant = monthlySavings > 0 && capex > 0
      ? capex / monthlySavings
      : (capex <= 0 ? 0 : Infinity);

    var labels = [];
    var baselineCum = [];
    var proposedCum = [];
    var savingsCum = [];
    var savingsTowardPayback = [];
    var paybackTarget = [];
    var breakEvenMonth = null;

    for (var m = 0; m <= horizon; m++) {
      labels.push(m === 0 ? 'Now' : 'M' + m);
      var base = m * baselineMo;
      var prop = (m >= purchaseMonth ? netUpfront : 0) + m * proposedMo;
      baselineCum.push(round2(base));
      proposedCum.push(round2(prop));
      var sav = base - prop;
      savingsCum.push(round2(sav));

      var toward = m <= purchaseMonth ? 0 : round2((m - purchaseMonth) * monthlySavings);
      savingsTowardPayback.push(toward);
      paybackTarget.push(round2(netUpfront));

      if (breakEvenMonth === null && m >= purchaseMonth && toward >= netUpfront && netUpfront > 0) {
        breakEvenMonth = m;
      }
    }

    if (breakEvenMonth === null && netUpfront <= 0) breakEvenMonth = purchaseMonth;

    var endSavings = savingsCum[savingsCum.length - 1] || 0;
    var endToward = savingsTowardPayback[savingsTowardPayback.length - 1] || 0;

    return {
      baselineMonthlyEur: baselineMo,
      proposedMonthlyEur: proposedMo,
      monthlySavingsEur: round2(monthlySavings),
      annualSavingsEur: round2(monthlySavings * 12),
      capexEur: capex,
      grantsEur: grants,
      taxBenefitEur: round2(taxBenefit),
      totalIncentivesEur: round2(totalIncentives),
      netUpfrontEur: round2(netUpfront),
      purchaseMonth: purchaseMonth,
      horizonMonths: horizon,
      paybackMonths: paybackMonths,
      paybackMonthsWithoutGrant: paybackWithoutGrant,
      breakEvenMonth: breakEvenMonth,
      totalSavingsAtHorizonEur: round2(endSavings),
      totalEnergySavedAtHorizonEur: round2(endToward),
      labels: labels,
      baselineCumulative: baselineCum,
      proposedCumulative: proposedCum,
      savingsCumulative: savingsCum,
      savingsTowardPayback: savingsTowardPayback,
      paybackTarget: paybackTarget,
      markers: buildMarkers(purchaseMonth, breakEvenMonth, grants, taxBenefit, horizon, paybackMonths)
    };
  }

  /** Rough grant estimate when catalogue has a scheme name but no € amount (illustrative). */
  function suggestGrantEur(capexEur, knownGrantEur) {
    var capex = Math.max(0, num(capexEur, 0));
    var known = Math.max(0, num(knownGrantEur, 0));
    if (known > 0) return Math.round(known);
    if (capex <= 0) return 0;
    return Math.round(Math.min(capex * 0.2, Math.max(80, capex * 0.12)));
  }

  /** Illustrative business tax relief on eligible energy equipment (not tax advice). */
  function suggestTaxBenefitEur(capexEur, pct) {
    var capex = Math.max(0, num(capexEur, 0));
    var rate = Math.min(0.35, Math.max(0, num(pct, 0.13)));
    return Math.round(capex * rate);
  }

  function buildMarkers(purchaseMonth, breakEvenMonth, grants, taxBenefit, horizon, paybackMonths) {
    var list = [
      { month: purchaseMonth, type: 'purchase', label: 'You buy' }
    ];
    if (grants > 0) {
      list.push({ month: purchaseMonth, type: 'grant', label: 'Grant / subsidy' });
    }
    if (taxBenefit > 0) {
      list.push({ month: purchaseMonth, type: 'tax', label: 'Tax benefit (illustrative)' });
    }
    if (breakEvenMonth != null && breakEvenMonth <= horizon) {
      var yr = (breakEvenMonth / 12).toFixed(1);
      list.push({
        month: breakEvenMonth,
        type: 'breakeven',
        label: breakEvenMonth < 24 ? 'Paid back' : 'Paid back (~' + yr + ' yr)'
      });
    } else if (Number.isFinite(paybackMonths) && paybackMonths > horizon) {
      list.push({
        month: horizon,
        type: 'breakeven',
        label: 'Payback beyond chart — lower price or higher savings'
      });
    }
    return list;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function formatEur(n) {
    if (!Number.isFinite(n)) return '—';
    return '€' + Math.round(n).toLocaleString('en-GB');
  }

  function formatPayback(months) {
    if (months === Infinity || !Number.isFinite(months)) return 'Not in horizon';
    if (months <= 0) return 'Immediate';
    if (months < 12) return Math.round(months) + ' months';
    var y = months / 12;
    if (y < 2) return y.toFixed(1) + ' years';
    return y.toFixed(1) + ' years';
  }

  function formatHorizonLabel(monthIndex, horizonMonths) {
    if (monthIndex === 0) return 'Now';
    if (horizonMonths > 84 && monthIndex % 12 === 0) {
      return 'Yr ' + monthIndex / 12;
    }
    if (horizonMonths > 48 && monthIndex % 6 === 0) {
      return monthIndex / 12 + 'y';
    }
    return 'M' + monthIndex;
  }

  function snapCapexEur(value, buildingMode) {
    var max = buildingMode ? CAPEX_MAX_BUILDING : CAPEX_MAX;
    var min = buildingMode ? 5000 : CAPEX_MIN;
    var tiers = buildingMode ? CAPEX_TIERS_BUILDING : CAPEX_TIERS;
    var v = Math.max(min, Math.min(max, Math.round(num(value, min))));
    var best = tiers[0];
    var bestDist = Math.abs(v - best);
    for (var i = 1; i < tiers.length; i++) {
      var d = Math.abs(v - tiers[i]);
      if (d < bestDist) {
        best = tiers[i];
        bestDist = d;
      }
    }
    return best;
  }

  /** Whole-site illustrative upgrade (restaurant data page). */
  function suggestBuildingRetrofitCapex(baselineMonthlyEur, improvementPct) {
    var base = Math.max(0, num(baselineMonthlyEur, 0));
    var pct = Math.min(0.45, Math.max(0.08, num(improvementPct, 0.18)));
    var monthlySav = base * pct;
    if (monthlySav < 1) return 25000;
    var fromPayback = Math.round(monthlySav * 12 * 5);
    return snapCapexEur(fromPayback, true);
  }

  global.SavingsProjectionModel = {
    ELEC_EUR_PER_KWH: ELEC,
    CAPEX_MIN: CAPEX_MIN,
    CAPEX_MAX: CAPEX_MAX,
    CAPEX_MAX_BUILDING: CAPEX_MAX_BUILDING,
    CAPEX_TIERS: CAPEX_TIERS,
    CAPEX_TIERS_BUILDING: CAPEX_TIERS_BUILDING,
    monthlyFromDailyKwh: monthlyFromDailyKwh,
    buildProjection: buildProjection,
    suggestGrantEur: suggestGrantEur,
    suggestTaxBenefitEur: suggestTaxBenefitEur,
    snapCapexEur: snapCapexEur,
    suggestBuildingRetrofitCapex: suggestBuildingRetrofitCapex,
    formatEur: formatEur,
    formatPayback: formatPayback,
    formatHorizonLabel: formatHorizonLabel
  };
})(typeof window !== 'undefined' ? window : globalThis);
