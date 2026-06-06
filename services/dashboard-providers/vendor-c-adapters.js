const { toNum, toArray } = require('./helpers');

// Vendor C template: designed for payloads that separate channels + telemetry.
// Adjust these mappings to your real provider response with minimal code changes.
function mapElectricityPayload(raw, defaults) {
  const channel = raw.channels?.electricity || raw.electricity || {};
  return {
    totalKwh: toNum(channel.day?.valueKwh ?? channel.todayKwh ?? channel.totalKwh, 0),
    baselineKwh: toNum(channel.target?.kwh ?? channel.baselineKwh, 220),
    deltaPct: toNum(channel.delta?.vsYesterdayPct ?? channel.deltaPct, 0),
    trend: toArray(channel.series?.hourlyKwh ?? channel.hourlyKwh, defaults.DEFAULT_ELECTRICITY)
  };
}

function mapGasPayload(raw, defaults) {
  const channel = raw.channels?.gas || raw.gas || {};
  return {
    totalM3: toNum(channel.day?.valueM3 ?? channel.todayM3 ?? channel.totalM3, 0),
    baselineM3: toNum(channel.target?.m3 ?? channel.baselineM3, 60),
    deltaPct: toNum(channel.delta?.vsYesterdayPct ?? channel.deltaPct, 0),
    trend: toArray(channel.series?.hourlyM3 ?? channel.hourlyM3, defaults.DEFAULT_GAS)
  };
}

function mapWaterPayload(raw, defaults) {
  const channel = raw.channels?.water || raw.water || {};
  return {
    totalM3: toNum(channel.day?.valueM3 ?? channel.todayM3 ?? channel.totalM3, 0),
    baselineM3: toNum(channel.target?.m3 ?? channel.baselineM3, 3.0),
    deltaPct: toNum(channel.delta?.vsYesterdayPct ?? channel.deltaPct, 0),
    trend: toArray(channel.series?.hourlyM3 ?? channel.hourlyM3, defaults.DEFAULT_WATER)
  };
}

function mapPlugPayload(raw) {
  const plugs = Array.isArray(raw.telemetry?.smartPlugs)
    ? raw.telemetry.smartPlugs
    : Array.isArray(raw.smartPlugs)
      ? raw.smartPlugs
      : [];

  const devices = plugs.map((plug, idx) => ({
    id: plug.id || plug.deviceId || `plug-c-${idx + 1}`,
    name: plug.name || plug.label || `Smart Plug ${idx + 1}`,
    powerKw: toNum(plug.livePowerKw ?? plug.powerKw ?? plug.power, 0),
    todayKwh: toNum(plug.energyTodayKwh ?? plug.todayKwh, 0),
    status: plug.state || plug.status || 'Standby'
  }));

  return { devices };
}

function mapSensorPayload(raw) {
  const sensors = raw.telemetry?.sensors || raw.sensors || {};
  return {
    occupancyPct: toNum(sensors.occupancyPct ?? sensors.occupancy?.percent, 0),
    tempC: toNum(sensors.temperatureC ?? sensors.temperature?.c, 0),
    humidityPct: toNum(sensors.humidityPct ?? sensors.humidity?.percent, 0),
    co2ppm: toNum(sensors.co2ppm ?? sensors.air?.co2ppm, 0)
  };
}

module.exports = {
  mapElectricityPayload,
  mapGasPayload,
  mapWaterPayload,
  mapPlugPayload,
  mapSensorPayload
};
