/**
 * Venue field lists for candidate merge (create / enrich).
 */

const CREATE_REQUIRED = ['name', 'address', 'genre'];

const ENRICH_FIELDS = [
  'name',
  'genre',
  'format',
  'schedule',
  'sessionTime',
  'recurrence',
  'nextSession',
  'signUpNotes',
  'entryCost',
  'skillLevel',
  'jamDetails',
  'address',
  'city',
  'country',
  'lng',
  'lat',
  'desc',
  'imageUrl',
  'url',
  'agendaUrl',
  'contactEmail',
  'phone',
  'instagramUrl',
  'mapsUrl',
  'vibeTags',
  'youtubeVideos',
  'verificationStatus',
  'lastVerified',
  'source',
  'sourceNote'
];

function isEmptyValue(val) {
  if (val == null) return true;
  if (typeof val === 'string') return !val.trim();
  if (Array.isArray(val)) return val.length === 0;
  return false;
}

function shouldApplyField(field, existing, incoming, overwriteAll, overwriteFields) {
  if (incoming == null) return false;
  if (overwriteAll || (Array.isArray(overwriteFields) && overwriteFields.includes(field))) {
    if (typeof incoming === 'string') return incoming.trim().length > 0;
    if (Array.isArray(incoming)) return incoming.length > 0;
    return true;
  }
  return isEmptyValue(existing);
}

function isEmptyValue(val) {
  if (val == null) return true;
  if (typeof val === 'string') return !val.trim();
  if (Array.isArray(val)) return val.length === 0;
  return false;
}

function pickVenuePayload(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const v = raw.venue && typeof raw.venue === 'object' ? raw.venue : raw;
  const out = {};
  for (const f of ENRICH_FIELDS) {
    if (v[f] !== undefined) out[f] = v[f];
  }
  return out;
}

module.exports = {
  CREATE_REQUIRED,
  ENRICH_FIELDS,
  isEmptyValue,
  shouldApplyField,
  pickVenuePayload
};
