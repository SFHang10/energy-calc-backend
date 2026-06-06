const { toNum, toArray } = require('./helpers');

// Template for vendors returning "metrics" envelopes.
function mapElectricityPayload(raw, defaults) {
  const metric = raw.metrics || {};
  return {
    totalKwh: toNum(metric.day_total_kwh, 0),
    baselineKwh: toNum(metric.target_kwh, 220),
    deltaPct: toNum(metric.delta_pct, 0),
    trend: toArray(metric.hourly_kwh, defaults.DEFAULT_ELECTRICITY)
  };
}

function mapGasPayload(raw, defaults) {
  const metric = raw.metrics || {};
  return {
    totalM3: toNum(metric.day_total_m3, 0),
    baselineM3: toNum(metric.target_m3, 60),
    deltaPct: toNum(metric.delta_pct, 0),
    trend: toArray(metric.hourly_m3, defaults.DEFAULT_GAS)
  };
}

function mapWaterPayload(raw, defaults) {
  const metric = raw.metrics || {};
  return {
    totalM3: toNum(metric.day_total_m3, 0),
    baselineM3: toNum(metric.target_m3, 3.0),
    deltaPct: toNum(metric.delta_pct, 0),
    trend: toArray(metric.hourly_m3, defaults.DEFAULT_WATER)
  };
}

function mapPlugPayload(raw) {
  const list = Array.isArray(raw.plugs) ? raw.plugs : [];
  const devices = list.map((p, index) => ({
    id: p.plug_id || `plug-a-${index + 1}`,
    name: p.label || p.name || `Plug ${index + 1}`,
    powerKw: toNum(p.instant_power_kw, 0),
    todayKwh: toNum(p.energy_today_kwh, 0),
    status: p.state || 'Standby'
  }));
  return { devices };
}

function mapSensorPayload(raw) {
  const latest = raw.latest || {};
  return {
    occupancyPct: toNum(latest.occupancy_percent, 0),
    tempC: toNum(latest.temperature_c, 0),
    humidityPct: toNum(latest.humidity_percent, 0),
    co2ppm: toNum(latest.co2_ppm, 0)
  };
}

module.exports = {
  mapElectricityPayload,
  mapGasPayload,
  mapWaterPayload,
  mapPlugPayload,
  mapSensorPayload
};
