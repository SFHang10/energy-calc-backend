const DEFAULT_HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];
const DEFAULT_ELECTRICITY = [8, 10, 12, 18, 22, 20, 25, 28, 24, 22, 19, 17, 18];
const DEFAULT_GAS = [2, 2, 3, 5, 6, 5, 7, 8, 6, 5, 4, 4, 5];
const DEFAULT_WATER = [5, 6, 8, 14, 18, 16, 20, 22, 19, 17, 14, 13, 14];
const DEFAULT_WEEKLY = [198, 185, 190, 175, 210, 230, 142];
const DEFAULT_BREAKDOWN = [58, 22, 12, 8];
const { getProviderProfileAdapters } = require('./dashboard-providers');
const { IqbiClient } = require('./integrations/iqbi-client');

async function getFetch() {
  if (typeof fetch !== 'undefined') {
    return fetch;
  }

  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
}

function toNum(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toArray(values, fallback) {
  return Array.isArray(values) && values.length > 0 ? values : fallback;
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((sum, n) => sum + toNum(n, 0), 0) / values.length;
}

function jitter(value, spread) {
  return Math.max(0, value + (Math.random() * spread * 2 - spread));
}

function createMockPayload() {
  return {
    sourceLabel: 'Energy Feed',
    totals: {
      electricityKwh: jitter(142, 8),
      gasM3: jitter(38, 4),
      waterM3: jitter(1.8, 0.4),
      costEur: jitter(84, 10)
    },
    baseline: {
      electricityKwh: 220,
      gasM3: 60,
      waterM3: 3.0
    },
    deltaVsYesterday: {
      electricityPct: jitter(-8, 3),
      gasPct: jitter(3, 2),
      waterPct: jitter(-5, 2)
    },
    deltaVsTargetEur: jitter(-12, 6),
    trend: {
      labels: DEFAULT_HOURS,
      electricity: DEFAULT_ELECTRICITY.map((v) => Math.round(jitter(v, 3))),
      gas: DEFAULT_GAS.map((v) => Math.round(jitter(v, 2))),
      water: DEFAULT_WATER.map((v) => Math.round(jitter(v, 2)))
    },
    breakdown: DEFAULT_BREAKDOWN,
    weeklyKwh: DEFAULT_WEEKLY,
    equipment: []
  };
}

function normalizePayload(payload, sourceLabel = 'Live Feed') {
  return {
    sourceLabel: payload.sourceLabel || sourceLabel,
    totals: {
      electricityKwh: toNum(payload.totals?.electricityKwh, 0),
      gasM3: toNum(payload.totals?.gasM3, 0),
      waterM3: toNum(payload.totals?.waterM3, 0),
      costEur: toNum(payload.totals?.costEur, 0)
    },
    baseline: {
      electricityKwh: toNum(payload.baseline?.electricityKwh, 220),
      gasM3: toNum(payload.baseline?.gasM3, 60),
      waterM3: toNum(payload.baseline?.waterM3, 3.0)
    },
    deltaVsYesterday: {
      electricityPct: toNum(payload.deltaVsYesterday?.electricityPct, 0),
      gasPct: toNum(payload.deltaVsYesterday?.gasPct, 0),
      waterPct: toNum(payload.deltaVsYesterday?.waterPct, 0)
    },
    deltaVsTargetEur: toNum(payload.deltaVsTargetEur, 0),
    trend: {
      labels: toArray(payload.trend?.labels, DEFAULT_HOURS),
      electricity: toArray(payload.trend?.electricity, DEFAULT_ELECTRICITY),
      gas: toArray(payload.trend?.gas, DEFAULT_GAS),
      water: toArray(payload.trend?.water, DEFAULT_WATER)
    },
    breakdown: toArray(payload.breakdown, DEFAULT_BREAKDOWN),
    weeklyKwh: toArray(payload.weeklyKwh, DEFAULT_WEEKLY),
    equipment: Array.isArray(payload.equipment) ? payload.equipment : []
  };
}

function createCache(ttlMs) {
  return {
    ttlMs,
    cachedAt: 0,
    value: null
  };
}

function readFromCache(cache) {
  if (!cache.value) return null;
  if ((Date.now() - cache.cachedAt) > cache.ttlMs) return null;
  return cache.value;
}

function writeToCache(cache, value) {
  cache.cachedAt = Date.now();
  cache.value = value;
}

function resolveQuery(url, { member, companyId, siteId }) {
  if (companyId) url.searchParams.set('companyId', companyId);
  if (siteId) url.searchParams.set('siteId', siteId);
  if (member?.id) url.searchParams.set('memberId', String(member.id));
  if (member?.email) url.searchParams.set('memberEmail', String(member.email));
}

function sumDevicePowerKw(devices) {
  if (!Array.isArray(devices)) return 0;
  return devices.reduce((sum, d) => sum + toNum(d.powerKw ?? d.power, 0), 0);
}

function buildEquipmentFromDevices(devices) {
  if (!Array.isArray(devices) || devices.length === 0) return [];
  return devices.slice(0, 12).map((d, idx) => {
    const powerKw = toNum(d.powerKw ?? d.power, 0);
    const todayKwh = toNum(d.todayKwh, powerKw * 8);
    return {
      id: d.id || `plug-${idx + 1}`,
      name: d.name || `Smart Plug ${idx + 1}`,
      watts: `${(powerKw * 1000).toFixed(0)} W`,
      today: `${todayKwh.toFixed(1)} kWh`,
      cost: `€${(todayKwh * 0.32 * 30).toFixed(0)}/mo`,
      status: d.status || (powerKw > 0.02 ? 'Running' : 'Standby'),
      selected: true
    };
  });
}

function aggregateProviders(providerData, adapters, defaults) {
  const electricity = providerData.electricity || adapters.mapElectricityPayload({}, defaults);
  const gas = providerData.gas || adapters.mapGasPayload({}, defaults);
  const water = providerData.water || adapters.mapWaterPayload({}, defaults);
  const plugs = providerData.plugs || adapters.mapPlugPayload({}, defaults);
  const sensors = providerData.sensors || adapters.mapSensorPayload({}, defaults);

  const plugPowerKw = toNum(plugs.plugPowerKw, 0);
  const electricityKwh = toNum(electricity.totalKwh, 0) + (plugPowerKw * 0.5);
  const gasM3 = toNum(gas.totalM3, 0);
  const waterM3 = toNum(water.totalM3, 0);
  const costEur = (electricityKwh * 0.32) + (gasM3 * 1.05) + (waterM3 * 2.4);

  const occupancyFactor = sensors.occupancyPct > 0 ? sensors.occupancyPct / 100 : 0.65;
  const breakdown = [
    Math.round(42 + (occupancyFactor * 16)),
    22,
    12,
    Math.max(8, Math.round(24 - (occupancyFactor * 12)))
  ];

  return {
    sourceLabel: 'Smart Meter Live',
    totals: {
      electricityKwh,
      gasM3,
      waterM3,
      costEur
    },
    baseline: {
      electricityKwh: electricity.baselineKwh,
      gasM3: gas.baselineM3,
      waterM3: water.baselineM3
    },
    deltaVsYesterday: {
      electricityPct: electricity.deltaPct,
      gasPct: gas.deltaPct,
      waterPct: water.deltaPct
    },
    deltaVsTargetEur: costEur - 96,
    trend: {
      labels: DEFAULT_HOURS,
      electricity: electricity.trend,
      gas: gas.trend,
      water: water.trend
    },
    breakdown,
    weeklyKwh: DEFAULT_WEEKLY.map((v) => Math.round((v * 0.75) + (electricityKwh * 0.25))),
    equipment: buildEquipmentFromDevices(plugs.devices),
    telemetry: {
      sensors,
      smartPlugs: {
        devices: plugs.devices.length,
        totalPowerKw: plugs.plugPowerKw,
        avgPowerKw: average(plugs.devices.map((d) => toNum(d.powerKw ?? d.power, 0)))
      }
    }
  };
}

class DashboardLiveService {
  constructor(options = {}) {
    this.sourceUrl = options.sourceUrl || process.env.DASHBOARD_LIVE_SOURCE_URL || '';
    this.sourceAuthToken = options.sourceAuthToken || process.env.DASHBOARD_LIVE_SOURCE_TOKEN || '';
    this.electricitySourceUrl = options.electricitySourceUrl || process.env.DASHBOARD_ELECTRICITY_SOURCE_URL || '';
    this.gasSourceUrl = options.gasSourceUrl || process.env.DASHBOARD_GAS_SOURCE_URL || '';
    this.waterSourceUrl = options.waterSourceUrl || process.env.DASHBOARD_WATER_SOURCE_URL || '';
    this.plugsSourceUrl = options.plugsSourceUrl || process.env.DASHBOARD_SMARTPLUG_SOURCE_URL || '';
    this.sensorsSourceUrl = options.sensorsSourceUrl || process.env.DASHBOARD_SENSOR_SOURCE_URL || '';
    this.providerAuthToken = options.providerAuthToken || process.env.DASHBOARD_PROVIDER_TOKEN || '';
    this.providerProfile = options.providerProfile || process.env.DASHBOARD_PROVIDER_PROFILE || 'default';
    this.adapters = getProviderProfileAdapters(this.providerProfile);
    this.iqbiClient = new IqbiClient();
    this.defaultMode = options.defaultMode || process.env.DASHBOARD_LIVE_MODE || 'mock';
    this.cache = createCache(toNum(options.cacheMs || process.env.DASHBOARD_LIVE_CACHE_MS, 15000));
  }

  async fetchSourcePayload({ member, companyId, siteId }) {
    if (!this.sourceUrl) return null;
    const fetchFn = await getFetch();
    const url = new URL(this.sourceUrl);

    resolveQuery(url, { member, companyId, siteId });

    const headers = {};
    if (this.sourceAuthToken) {
      headers.Authorization = `Bearer ${this.sourceAuthToken}`;
    }

    const response = await fetchFn(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`Dashboard source failed (${response.status})`);
    }

    return response.json();
  }

  async fetchProviderPayload(sourceUrl, queryCtx) {
    if (!sourceUrl) return null;
    const fetchFn = await getFetch();
    const url = new URL(sourceUrl);
    resolveQuery(url, queryCtx);

    const headers = {};
    const authToken = this.providerAuthToken || this.sourceAuthToken;
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetchFn(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`Provider failed (${response.status})`);
    }
    return response.json();
  }

  async fetchProviderSet(queryCtx) {
    const defaults = {
      DEFAULT_ELECTRICITY,
      DEFAULT_GAS,
      DEFAULT_WATER
    };

    const providers = [
      { key: 'electricity', url: this.electricitySourceUrl, mapper: this.adapters.mapElectricityPayload },
      { key: 'gas', url: this.gasSourceUrl, mapper: this.adapters.mapGasPayload },
      { key: 'water', url: this.waterSourceUrl, mapper: this.adapters.mapWaterPayload },
      { key: 'plugs', url: this.plugsSourceUrl, mapper: this.adapters.mapPlugPayload },
      { key: 'sensors', url: this.sensorsSourceUrl, mapper: this.adapters.mapSensorPayload }
    ];

    const enabled = providers.filter((p) => !!p.url);
    if (enabled.length === 0) return null;

    const results = await Promise.allSettled(
      enabled.map(async (provider) => {
        const raw = await this.fetchProviderPayload(provider.url, queryCtx);
        return { key: provider.key, mapped: provider.mapper(raw || {}, defaults) };
      })
    );

    const aggregated = {};
    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      aggregated[result.value.key] = result.value.mapped;
    }
    return aggregated;
  }

  async fetchIqbiProviderSet(queryCtx) {
    if (this.providerProfile !== 'iqbi') return null;
    if (!this.iqbiClient.isConfigured()) return null;

    const defaults = {
      DEFAULT_ELECTRICITY,
      DEFAULT_GAS,
      DEFAULT_WATER
    };

    const rawBundle = await this.iqbiClient.fetchProviderBundle({
      siteId: queryCtx.siteId,
      companyId: queryCtx.companyId,
      memberId: queryCtx.member?.id || '',
      memberEmail: queryCtx.member?.email || ''
    });

    return {
      electricity: this.adapters.mapElectricityPayload(rawBundle.electricity || {}, defaults),
      gas: this.adapters.mapGasPayload(rawBundle.gas || {}, defaults),
      water: this.adapters.mapWaterPayload(rawBundle.water || {}, defaults),
      plugs: this.adapters.mapPlugPayload(rawBundle.plugs || {}, defaults),
      sensors: this.adapters.mapSensorPayload(rawBundle.sensors || {}, defaults)
    };
  }

  async getLiveData({ mode = '', companyId = '', siteId = '', member = null, forceRefresh = false } = {}) {
    const requestedMode = mode || this.defaultMode;
    const cacheKey = `${requestedMode}:${companyId}:${siteId}:${member?.id || 'anon'}`;

    const cached = readFromCache(this.cache);
    if (!forceRefresh && cached && cached.cacheKey === cacheKey) {
      return { ...cached.payload, cached: true };
    }

    let payload;
    let source = 'mock';

    const hasLiveSources = Boolean(
      this.sourceUrl ||
      this.electricitySourceUrl ||
      this.gasSourceUrl ||
      this.waterSourceUrl ||
      this.plugsSourceUrl ||
      this.sensorsSourceUrl
    );
    const hasIqbiProfile = this.providerProfile === 'iqbi' && this.iqbiClient.isConfigured();

    if (requestedMode === 'live' && (hasLiveSources || hasIqbiProfile)) {
      try {
        const queryCtx = { member, companyId, siteId };
        const providerSet = (await this.fetchIqbiProviderSet(queryCtx)) || (await this.fetchProviderSet(queryCtx));
        if (providerSet) {
          payload = normalizePayload(aggregateProviders(providerSet, this.adapters, {
            DEFAULT_ELECTRICITY,
            DEFAULT_GAS,
            DEFAULT_WATER
          }), 'Smart Meter Live');
          source = 'provider-adapters';
        } else {
          const sourcePayload = await this.fetchSourcePayload(queryCtx);
          payload = normalizePayload(sourcePayload, 'Live Feed');
          source = 'live';
        }
      } catch (error) {
        console.warn('Dashboard live provider fetch failed:', error.message);
        payload = normalizePayload(createMockPayload(), 'Energy Feed (reserve)');
        source = 'fallback';
      }
    } else {
      payload = normalizePayload(createMockPayload(), 'Energy Feed');
    }

    const finalPayload = {
      ...payload,
      meta: {
        source,
        providerProfile: this.providerProfile,
        mode: requestedMode,
        companyId: companyId || null,
        siteId: siteId || null,
        memberId: member?.id || null,
        generatedAt: new Date().toISOString()
      },
      cached: false
    };

    writeToCache(this.cache, { cacheKey, payload: finalPayload });
    return finalPayload;
  }
}

module.exports = { DashboardLiveService };
