const defaultAdapters = require('./default-adapters');
const vendorAAdapters = require('./vendor-a-adapters');
const vendorBAdapters = require('./vendor-b-adapters');
const vendorCAdapters = require('./vendor-c-adapters');
const iqbiAdapters = require('./iqbi-adapters');

const profiles = {
  default: defaultAdapters,
  vendorA: vendorAAdapters,
  vendorB: vendorBAdapters,
  vendorC: vendorCAdapters,
  iqbi: iqbiAdapters
};

function getProviderProfileAdapters(profile = 'default') {
  return profiles[profile] || profiles.default;
}

function getAvailableProviderProfiles() {
  return Object.keys(profiles);
}

module.exports = {
  getProviderProfileAdapters,
  getAvailableProviderProfiles
};
