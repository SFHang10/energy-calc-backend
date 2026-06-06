const { toNum, toArray } = require('../dashboard-providers/helpers');

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
}

function withQuery(urlString, params = {}) {
  const url = new URL(urlString);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item === undefined || item === null || item === '') return;
        url.searchParams.append(k, String(item));
      });
      return;
    }
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

function parseCsvList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function formatDateForInterval(date, interval) {
  const d = new Date(date);
  if (interval === 'daily') {
    return d.toISOString().slice(0, 10);
  }
  if (interval === 'monthly') {
    return d.toISOString().slice(0, 7);
  }
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

class IqbiClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || process.env.IQBI_BASE_URL || '').replace(/\/+$/, '');
    this.apiToken = options.apiToken || process.env.IQBI_API_TOKEN || '';
    this.username = options.username || process.env.IQBI_USERNAME || '';
    this.password = options.password || process.env.IQBI_PASSWORD || '';
    this.authUrl = options.authUrl || process.env.IQBI_AUTH_URL || (this.baseUrl ? `${this.baseUrl}/api/v1/auth/login` : '');
    this.siteId = options.siteId || process.env.IQBI_SITE_ID || '';
    this.companyId = options.companyId || process.env.IQBI_COMPANY_ID || '';
    this.groupIds = parseCsvList(options.groupIds || process.env.IQBI_MEASUREMENT_POINT_GROUP_IDS || '');
    this.defaultInterval = options.defaultInterval || process.env.IQBI_INTERVAL || 'hourly';

    this.electricityUrl = options.electricityUrl || process.env.IQBI_ELECTRICITY_URL || '';
    this.gasUrl = options.gasUrl || process.env.IQBI_GAS_URL || '';
    this.waterUrl = options.waterUrl || process.env.IQBI_WATER_URL || '';
    this.plugsUrl = options.plugsUrl || process.env.IQBI_SMARTPLUG_URL || '';
    this.sensorsUrl = options.sensorsUrl || process.env.IQBI_SENSOR_URL || '';

    this.sessionToken = '';
    this.sessionTokenExpiry = 0;
  }

  isConfigured() {
    return Boolean(
      this.electricityUrl ||
      this.gasUrl ||
      this.waterUrl ||
      this.plugsUrl ||
      this.sensorsUrl ||
      (this.baseUrl && (this.apiToken || (this.username && this.password)))
    );
  }

  async resolveAuthToken() {
    if (this.apiToken) return this.apiToken;

    const isSessionValid = this.sessionToken && Date.now() < this.sessionTokenExpiry;
    if (isSessionValid) return this.sessionToken;

    if (!this.authUrl || !this.username || !this.password) return '';

    const fetchFn = await getFetch();
    const response = await fetchFn(this.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.username, password: this.password })
    });

    if (!response.ok) {
      throw new Error(`IQBI auth failed (${response.status})`);
    }

    const json = await response.json();
    const token = json?.data?.token || json.accessToken || json.token || json.jwt || '';
    const expiresIn = Number(json?.data?.accessTokenTtl || json.accessTokenTtl || json.expiresIn || 1800);
    if (!token) {
      throw new Error('IQBI auth succeeded but no token returned');
    }

    this.sessionToken = token;
    this.sessionTokenExpiry = Date.now() + (expiresIn * 1000) - 15000;
    return this.sessionToken;
  }

  async fetchJson(url, query = {}) {
    if (!url) return null;
    const fetchFn = await getFetch();
    const token = await this.resolveAuthToken();

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchFn(withQuery(url, query), { headers });
    if (!response.ok) {
      throw new Error(`IQBI endpoint failed (${response.status}): ${url}`);
    }

    return response.json();
  }

  async fetchProviderBundle({ siteId = '', companyId = '', memberId = '', memberEmail = '' } = {}) {
    if (this.baseUrl && !this.electricityUrl && !this.gasUrl && !this.waterUrl) {
      return this.fetchBundleFromOfficialApi({ siteId, companyId });
    }

    const resolvedSiteId = siteId || this.siteId;
    const resolvedCompanyId = companyId || this.companyId;
    const query = {
      siteId: resolvedSiteId,
      companyId: resolvedCompanyId,
      memberId,
      memberEmail
    };

    const tasks = [
      ['electricity', this.electricityUrl],
      ['gas', this.gasUrl],
      ['water', this.waterUrl],
      ['plugs', this.plugsUrl],
      ['sensors', this.sensorsUrl]
    ].filter(([, url]) => Boolean(url));

    const settled = await Promise.allSettled(
      tasks.map(async ([key, url]) => {
        const json = await this.fetchJson(url, query);
        return [key, json];
      })
    );

    const bundle = {};
    settled.forEach((result) => {
      if (result.status !== 'fulfilled') return;
      const [key, payload] = result.value;
      bundle[key] = payload;
    });

    return bundle;
  }

  resolveInterval() {
    const interval = String(this.defaultInterval || 'hourly').toLowerCase();
    const allowed = new Set(['fifteen-minutes', 'hourly', 'daily', 'monthly']);
    return allowed.has(interval) ? interval : 'hourly';
  }

  resolveDateRange(interval) {
    const end = new Date();
    const start = new Date(end);
    if (interval === 'fifteen-minutes') {
      start.setHours(start.getHours() - 12);
    } else if (interval === 'hourly') {
      start.setHours(start.getHours() - 12);
    } else if (interval === 'daily') {
      start.setDate(start.getDate() - 12);
    } else {
      start.setMonth(start.getMonth() - 12);
    }
    return {
      startDate: formatDateForInterval(start, interval),
      endDate: formatDateForInterval(end, interval)
    };
  }

  async resolveGroupIds({ siteId = '', companyId = '' } = {}) {
    if (this.groupIds.length) {
      return this.groupIds.map((v) => Number(v)).filter((n) => Number.isFinite(n));
    }

    const numericSiteId = Number(siteId || this.siteId);
    if (Number.isFinite(numericSiteId) && numericSiteId > 0) return [numericSiteId];
    const numericCompanyId = Number(companyId || this.companyId);
    if (Number.isFinite(numericCompanyId) && numericCompanyId > 0) return [numericCompanyId];

    if (!this.baseUrl) return [];
    const groupsUrl = `${this.baseUrl}/api/v1/partner/measurement-point-groups`;
    const groups = await this.fetchJson(groupsUrl, { pageSize: 200, page: 1, type: 'ASSET' });
    const list = Array.isArray(groups?.data?.measurementPointGroups) ? groups.data.measurementPointGroups : [];
    return list
      .map((g) => Number(g.id))
      .filter((id) => Number.isFinite(id))
      .slice(0, 3);
  }

  aggregateUtility(utilityRows = [], matcher) {
    const row = utilityRows.find((item) => matcher(String(item?.utilityType || '').toLowerCase()));
    if (!row) return { total: 0, trend: [] };
    const consumptions = Array.isArray(row.consumptions) ? row.consumptions : [];
    const trend = consumptions.map((c) => toNum(c.consumption, 0));
    const total = trend.reduce((sum, v) => sum + v, 0);
    return { total, trend };
  }

  async fetchBundleFromOfficialApi({ siteId = '', companyId = '' } = {}) {
    const interval = this.resolveInterval();
    const ids = await this.resolveGroupIds({ siteId, companyId });
    if (!ids.length) {
      throw new Error('IQBI measurement point group ids not resolved. Set IQBI_MEASUREMENT_POINT_GROUP_IDS or IQBI_SITE_ID.');
    }

    const range = this.resolveDateRange(interval);
    const consumptionsUrl = `${this.baseUrl}/api/v1/partner/measurement-point-groups/consumptions/${interval}`;
    const raw = await this.fetchJson(consumptionsUrl, {
      measurementPointGroupId: ids,
      startDate: range.startDate,
      endDate: range.endDate
    });

    const groups = Array.isArray(raw?.data?.measurementPointGroupConsumptions)
      ? raw.data.measurementPointGroupConsumptions
      : [];
    const utilityRows = groups.flatMap((group) => (
      Array.isArray(group?.utilityTypes) ? group.utilityTypes : []
    ));

    const electricity = this.aggregateUtility(utilityRows, (t) => t.includes('electricity consumption'));
    const gas = this.aggregateUtility(utilityRows, (t) => t.includes('gas consumption'));
    const water = this.aggregateUtility(utilityRows, (t) => t.includes('water consumption') || t.includes('hot water consumption'));

    return {
      electricity: { data: { totalKwh: electricity.total, trend: electricity.trend } },
      gas: { data: { totalM3: gas.total, trend: gas.trend } },
      water: { data: { totalM3: water.total, trend: water.trend } }
    };
  }

  static mapElectricityPayload(raw, defaults) {
    const data = raw?.data || raw || {};
    return {
      totalKwh: toNum(data.totalKwh ?? data.todayKwh ?? data.consumptionKwh, 0),
      baselineKwh: toNum(data.baselineKwh ?? data.targetKwh, 220),
      deltaPct: toNum(data.deltaPct ?? data.deltaVsYesterdayPct, 0),
      trend: toArray(data.hourlyKwh ?? data.trend, defaults.DEFAULT_ELECTRICITY)
    };
  }

  static mapGasPayload(raw, defaults) {
    const data = raw?.data || raw || {};
    return {
      totalM3: toNum(data.totalM3 ?? data.todayM3 ?? data.consumptionM3, 0),
      baselineM3: toNum(data.baselineM3 ?? data.targetM3, 60),
      deltaPct: toNum(data.deltaPct ?? data.deltaVsYesterdayPct, 0),
      trend: toArray(data.hourlyM3 ?? data.trend, defaults.DEFAULT_GAS)
    };
  }

  static mapWaterPayload(raw, defaults) {
    const data = raw?.data || raw || {};
    return {
      totalM3: toNum(data.totalM3 ?? data.todayM3 ?? data.consumptionM3, 0),
      baselineM3: toNum(data.baselineM3 ?? data.targetM3, 3.0),
      deltaPct: toNum(data.deltaPct ?? data.deltaVsYesterdayPct, 0),
      trend: toArray(data.hourlyM3 ?? data.trend, defaults.DEFAULT_WATER)
    };
  }

  static mapPlugPayload(raw) {
    const list = Array.isArray(raw?.data?.devices) ? raw.data.devices : (Array.isArray(raw?.devices) ? raw.devices : []);
    const devices = list.map((d, idx) => ({
      id: d.id || d.deviceId || `iqbi-plug-${idx + 1}`,
      name: d.name || d.label || `IQBI Plug ${idx + 1}`,
      powerKw: toNum(d.powerKw ?? d.power, 0),
      todayKwh: toNum(d.todayKwh ?? d.energyTodayKwh, 0),
      status: d.status || d.state || 'Standby'
    }));
    return { devices };
  }

  static mapSensorPayload(raw) {
    const s = raw?.data || raw || {};
    return {
      occupancyPct: toNum(s.occupancyPct, 0),
      tempC: toNum(s.tempC ?? s.temperatureC, 0),
      humidityPct: toNum(s.humidityPct, 0),
      co2ppm: toNum(s.co2ppm, 0)
    };
  }
}

module.exports = {
  IqbiClient
};
