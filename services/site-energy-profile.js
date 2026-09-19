/**
 * Site energy reading → agent ask profile helpers.
 * Connections saved from /greenways/site-energy-reading flow into shared profile.
 */

function normalizeSiteConnections(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const keys = ['electricity', 'gas', 'water'];
  const hasAny = keys.some((k) => Object.prototype.hasOwnProperty.call(raw, k));
  if (!hasAny) return null;
  return {
    electricity: !!raw.electricity,
    gas: !!raw.gas,
    water: !!raw.water
  };
}

/**
 * @param {{ electricity?: boolean, gas?: boolean, water?: boolean }|null} connections
 * @returns {string} e.g. "electricity, gas, and water"
 */
function formatSiteConnectionsLabel(connections) {
  const c = normalizeSiteConnections(connections);
  if (!c) return '';
  const parts = [];
  if (c.electricity) parts.push('electricity');
  if (c.gas) parts.push('gas');
  if (c.water) parts.push('water');
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

/**
 * Short assumption line for agent answers, or '' when no connections.
 * @param {object} profile
 */
function siteConnectionsBrief(profile = {}) {
  const connections = normalizeSiteConnections(profile?.siteConnections);
  if (!connections) return '';
  const label = formatSiteConnectionsLabel(connections);
  if (!label) return '';

  const postcode = String(profile.sitePostcode || '').trim();
  const confirmed = Boolean(String(profile.siteEnergyUpdatedAt || '').trim());
  const status = confirmed
    ? 'confirmed in Site energy reading'
    : 'illustrative from Site energy reading';

  if (postcode) {
    return `Assuming this site runs on ${label} (postcode ${postcode} — ${status}).`;
  }
  return `Assuming this site runs on ${label} (${status}).`;
}

/**
 * Prepend site-connections brief when missing from the answer.
 * @param {string} answer
 * @param {object} profile
 */
function prependSiteConnectionsBrief(answer, profile = {}) {
  const text = String(answer || '').trim();
  if (!text) return answer;
  const brief = siteConnectionsBrief(profile);
  if (!brief) return answer;
  if (/assuming this site/i.test(text)) return answer;
  if (/site connections|runs on electricity|runs on gas|runs on water/i.test(text)) {
    return answer;
  }
  return `${brief}\n\n${text}`;
}

module.exports = {
  normalizeSiteConnections,
  formatSiteConnectionsLabel,
  siteConnectionsBrief,
  prependSiteConnectionsBrief
};
