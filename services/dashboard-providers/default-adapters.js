const { toNum, toArray } = require('./helpers');

function mapElectricityPayload(raw, defaults) {
  return {
    totalKwh: toNum(raw.totalKwh ?? raw.todayKwh ?? raw.consumptionKwh, 0),
    baselineKwh: toNum(raw.baselineKwh ?? raw.targetKwh, 220),
    deltaPct: toNum(raw.deltaPct ?? raw.deltaVsYesterdayPct, 0),
    trend: toArray(raw.hourlyKwh ?? raw.trend, defaults.DEFAULT_ELECTRICITY)
  };
}

function mapGasPayload(raw, defaults) {
  return {
    totalM3: toNum(raw.totalM3 ?? raw.todayM3 ?? raw.consumptionM3, 0),
    baselineM3: toNum(raw.baselineM3 ?? raw.targetM3, 60),
    deltaPct: toNum(raw.deltaPct ?? raw.deltaVsYesterdayPct, 0),
    trend: toArray(raw.hourlyM3 ?? raw.trend, defaults.DEFAULT_GAS)
  };
}

function mapWaterPayload(raw, defaults) {
  return {
    totalM3: toNum(raw.totalM3 ?? raw.todayM3 ?? raw.consumptionM3, 0),
    baselineM3: toNum(raw.baselineM3 ?? raw.targetM3, 3.0),
    deltaPct: toNum(raw.deltaPct ?? raw.deltaVsYesterdayPct, 0),
    trend: toArray(raw.hourlyM3 ?? raw.trend, defaults.DEFAULT_WATER)
  };
}

function mapPlugPayload(raw) {
  return {
    devices: Array.isArray(raw.devices) ? raw.devices : []
  };
}

function mapSensorPayload(raw) {
  return {
    occupancyPct: toNum(raw.occupancyPct, 0),
    tempC: toNum(raw.tempC, 0),
    humidityPct: toNum(raw.humidityPct, 0),
    co2ppm: toNum(raw.co2ppm, 0)
  };
}

module.exports = {
  mapElectricityPayload,
  mapGasPayload,
  mapWaterPayload,
  mapPlugPayload,
  mapSensorPayload
};
