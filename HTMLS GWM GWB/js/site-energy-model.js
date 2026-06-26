/**
 * Shared site-level energy cost model (aligns with restaurant-equipment-deep-dive
 * decision matrix / analytics: €/kWh elec, €/kWh gas thermal, €/L water).
 * Gas bills in m³ are converted using an indicative kWh(th)/m³ factor for modelling only.
 */
(function (global) {
  var ELEC_EUR_PER_KWH = 0.3;
  var GAS_EUR_PER_KWH_THERMAL = 0.11;
  var WATER_EUR_PER_L = 0.0025;
  var KWH_PER_M3_NATURAL_GAS = 10.55;

  function num(v, fb) {
    var n = Number(v);
    return Number.isFinite(n) ? n : fb;
  }

  function gasM3ToThermalKwh(m3) {
    return num(m3, 0) * KWH_PER_M3_NATURAL_GAS;
  }

  function waterM3ToLitres(m3) {
    return num(m3, 0) * 1000;
  }

  /** Monthly € for a whole-resource total (native units: kWh/mo, m³/mo gas, m³/mo water). */
  function monthlyEurFromResourceTotal(resourceKey, monthlyNative) {
    if (resourceKey === "electricity") return num(monthlyNative, 0) * ELEC_EUR_PER_KWH;
    if (resourceKey === "gas") return gasM3ToThermalKwh(monthlyNative) * GAS_EUR_PER_KWH_THERMAL;
    if (resourceKey === "water") return waterM3ToLitres(monthlyNative) * WATER_EUR_PER_L;
    return 0;
  }

  /** Marginal € per one native unit (1 kWh, 1 m³ gas, 1 m³ water) for that resource. */
  function marginalEurPerNativeUnit(resourceKey) {
    if (resourceKey === "electricity") return ELEC_EUR_PER_KWH;
    if (resourceKey === "gas") return KWH_PER_M3_NATURAL_GAS * GAS_EUR_PER_KWH_THERMAL;
    if (resourceKey === "water") return 1000 * WATER_EUR_PER_L;
    return 0;
  }

  function tariffSummaryLine() {
    return (
      "Electricity €" +
      ELEC_EUR_PER_KWH.toFixed(2) +
      "/kWh · Gas ~€" +
      (KWH_PER_M3_NATURAL_GAS * GAS_EUR_PER_KWH_THERMAL).toFixed(2) +
      "/m³ (thermal @ " +
      KWH_PER_M3_NATURAL_GAS +
      " kWh/m³) · Water €" +
      WATER_EUR_PER_L.toFixed(4) +
      "/L"
    );
  }

  global.SiteEnergyModel = {
    ELEC_EUR_PER_KWH: ELEC_EUR_PER_KWH,
    GAS_EUR_PER_KWH_THERMAL: GAS_EUR_PER_KWH_THERMAL,
    WATER_EUR_PER_L: WATER_EUR_PER_L,
    KWH_PER_M3_NATURAL_GAS: KWH_PER_M3_NATURAL_GAS,
    monthlyEurFromResourceTotal: monthlyEurFromResourceTotal,
    marginalEurPerNativeUnit: marginalEurPerNativeUnit,
    tariffSummaryLine: tariffSummaryLine
  };
})(typeof window !== "undefined" ? window : globalThis);
