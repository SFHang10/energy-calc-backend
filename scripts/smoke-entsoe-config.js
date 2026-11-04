#!/usr/bin/env node
/**
 * Verify ENTSO-E configuration (local .env or Render).
 * Usage: ENTSOE_API_KEY=... node scripts/smoke-entsoe-config.js
 *        npm run smoke:entsoe
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const {
  getEnergyTickerConfigStatus,
  probeEnergyTickerLive
} = require('../services/energy-ticker-service');
const { getDataSourceStatus } = require('../services/site-energy-reading-service');
const { fetchEntsoeXml, entsoeWindowHours } = require('../services/entsoe-api');

async function main() {
  const apiKey = process.env.ENTSOE_API_KEY;
  const siteSources = getDataSourceStatus();
  const tickerConfig = getEnergyTickerConfigStatus();

  console.log('ENTSO-E smoke');
  console.log('  ENTSOE_API_KEY set:', Boolean(apiKey));
  console.log('  Site energy euLiveReady:', siteSources.entsoe || siteSources.electricityMaps);
  console.log('  Ticker liveMode configured:', tickerConfig.liveMode);

  if (!apiKey) {
    console.log('\nNo ENTSOE_API_KEY — register at https://transparency.entsoe.eu/');
    console.log('Email transparency@entsoe.eu (subject: Restful API access).');
    console.log('Then add the token to Render → Environment → ENTSOE_API_KEY');
    process.exit(1);
  }

  const ping = await fetchEntsoeXml(apiKey, {
    documentType: 'A75',
    processType: 'A16',
    in_Domain: '10YNL----------L',
    out_Domain: '10YNL----------L',
    ...entsoeWindowHours(3)
  });
  if (ping.error) {
    console.error('\nENTSO-E API ping failed:', ping.error);
    if (ping.xml) console.error(ping.xml);
    process.exit(2);
  }
  console.log('\nENTSO-E API ping: OK (NL generation window)');

  const probe = await probeEnergyTickerLive();
  console.log('Energy ticker probe:', probe);
  if (!probe.isLive) {
    console.error('\nTicker still on demo — check zone domains or API quotas.');
    process.exit(3);
  }
  console.log('\nAll ENTSO-E checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
