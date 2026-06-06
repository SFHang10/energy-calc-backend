const { toNum, toArray } = require('./helpers');

// Template for vendors returning nested "data.readings" structures.
function mapElectricityPayload(raw, defaults) {
  const reading = raw.data?.readings || {};
  return {
    totalKwh: toNum(reading.electricity?.today?.kwh, 0),
    baselineKwh: toNum(reading.electricity?.baseline?.kwh, 220),
    deltaPct: toNum(reading.electricity?.change?.vsYesterdayPct, 0),
    trend: toArray(reading.electricity?.hourly?.kwh, defaults.DEFAULT_ELECTRICITY)
  };
}

function mapGasPayload(raw, defaults) {
  const reading = raw.data?.readings || {};
  return {
    totalM3: toNum(reading.gas?.today?.m3, 0),
    baselineM3: toNum(reading.gas?.baseline?.m3, 60),
    deltaPct: toNum(reading.gas?.change?.vsYesterdayPct, 0),
    trend: toArray(reading.gas?.hourly?.m3, defaults.DEFAULT_GAS)
  };
}

function mapWaterPayload(raw, defaults) {
  const reading = raw.data?.readings || {};
  return {
    totalM3: toNum(reading.water?.today?.m3, 0),
    baselineM3: toNum(reading.water?.baseline?.m3, 3.0),
    deltaPct: toNum(reading.water?.change?.vsYesterdayPct, 0),
    trend: toArray(reading.water?.hourly?.m3, defaults.DEFAULT_WATER)
  };
}

function mapPlugPayload(raw) {
  const nodes = Array.isArray(raw.data?.plugNodes) ? raw.data.plugNodes : [];
  const devices = nodes.map((p, index) => ({
    id: p.id || `plug-b-${index + 1}`,
    name: p.title || p.name || `Smart Node ${index + 1}`,
    powerKw: toNum(p.live?.kw, 0),
    todayKwh: toNum(p.totals?.todayKwh, 0),
    status: p.live?.isOn ? 'Running' : 'Standby'
  }));
  return { devices };
}

function mapSensorPayload(raw) {
  const sensors = raw.data?.sensors || {};
  return {
    occupancyPct: toNum(sensors.occupancy?.currentPct, 0),
    tempC: toNum(sensors.temperature?.celsius, 0),
    humidityPct: toNum(sensors.humidity?.percent, 0),
    co2ppm: toNum(sensors.airQuality?.co2ppm, 0)
  };
}

module.exports = {
  mapElectricityPayload,
  mapGasPayload,
  mapWaterPayload,
  mapPlugPayload,
  mapSensorPayload
};
