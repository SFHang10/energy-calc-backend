const express = require('express');
const jwt = require('jsonwebtoken');
const { DashboardLiveService } = require('../services/dashboard-live-service');
const { getAvailableProviderProfiles } = require('../services/dashboard-providers');

const router = express.Router();
const service = new DashboardLiveService();
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key-2025';

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

function parseMemberFromToken(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.id || decoded.sub || null,
      email: decoded.email || null
    };
  } catch (error) {
    return null;
  }
}

router.get('/live', async (req, res) => {
  try {
    const member = parseMemberFromToken(req);
    const mode = String(req.query.mode || '');
    const companyId = String(req.query.companyId || '');
    const siteId = String(req.query.siteId || '');
    const forceRefresh = String(req.query.forceRefresh || '').toLowerCase() === 'true';

    const payload = await service.getLiveData({
      mode,
      companyId,
      siteId,
      member,
      forceRefresh
    });

    res.json(payload);
  } catch (error) {
    console.error('❌ Dashboard live route error:', error.message);
    res.status(500).json({ error: 'Failed to load dashboard live data' });
  }
});

router.get('/providers', (req, res) => {
  res.json({
    message: 'Dashboard provider adapter configuration',
    availableProfiles: getAvailableProviderProfiles(),
    selectedProfile: process.env.DASHBOARD_PROVIDER_PROFILE || 'default',
    providers: {
      electricity: Boolean(process.env.DASHBOARD_ELECTRICITY_SOURCE_URL),
      gas: Boolean(process.env.DASHBOARD_GAS_SOURCE_URL),
      water: Boolean(process.env.DASHBOARD_WATER_SOURCE_URL),
      smartPlugs: Boolean(process.env.DASHBOARD_SMARTPLUG_SOURCE_URL),
      sensors: Boolean(process.env.DASHBOARD_SENSOR_SOURCE_URL),
      unifiedLiveFeed: Boolean(process.env.DASHBOARD_LIVE_SOURCE_URL),
      iqbi: {
        profileEnabled: (process.env.DASHBOARD_PROVIDER_PROFILE || 'default') === 'iqbi',
        baseUrl: Boolean(process.env.IQBI_BASE_URL),
        tokenAuth: Boolean(process.env.IQBI_API_TOKEN),
        credentialAuth: Boolean(process.env.IQBI_USERNAME && process.env.IQBI_PASSWORD && process.env.IQBI_AUTH_URL),
        officialApiMode: Boolean(process.env.IQBI_BASE_URL && process.env.IQBI_MEASUREMENT_POINT_GROUP_IDS),
        measurementPointGroups: Boolean(process.env.IQBI_MEASUREMENT_POINT_GROUP_IDS),
        interval: process.env.IQBI_INTERVAL || 'hourly',
        electricity: Boolean(process.env.IQBI_ELECTRICITY_URL),
        gas: Boolean(process.env.IQBI_GAS_URL),
        water: Boolean(process.env.IQBI_WATER_URL),
        smartPlugs: Boolean(process.env.IQBI_SMARTPLUG_URL),
        sensors: Boolean(process.env.IQBI_SENSOR_URL)
      }
    },
    mode: process.env.DASHBOARD_LIVE_MODE || 'mock'
  });
});

module.exports = router;
