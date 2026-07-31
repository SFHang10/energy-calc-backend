/**
 * Agent → module demo / prefill helpers.
 * Agents open content modules with query params so tools start primed from the conversation.
 *
 * Client counterpart: HTMLS GWM GWB/js/greenways-module-demo.js
 */

function mergeQuery(existing, extra) {
  const params = new URLSearchParams(String(existing || '').replace(/^\?/, ''));
  const add = new URLSearchParams(String(extra || '').replace(/^\?/, ''));
  add.forEach((value, key) => {
    if (value != null && String(value).trim() !== '') params.set(key, String(value));
  });
  return params.toString();
}

function encodeDemoNote(note) {
  return String(note || '')
    .trim()
    .slice(0, 280);
}

/**
 * Build a module row with demo=1 + tool-specific prefill + agentNote for the shell.
 * @param {object} row — { moduleId, title?, query?, openSize? }
 * @param {object} demo — { note?, label?, tab?, q?, country?, region?, lane?, product?, scenario?, auto? }
 */
function withModuleDemo(row = {}, demo = {}) {
  const note = encodeDemoNote(
    demo.note ||
      'I primed this tool from our conversation — check the values, then adjust anything before you decide.'
  );
  const label = String(demo.label || '').trim() || undefined;
  const parts = { demo: '1' };
  if (demo.tab) parts.tab = demo.tab;
  if (demo.q) parts.q = demo.q;
  if (demo.country) parts.country = demo.country;
  if (demo.region) parts.region = demo.region;
  if (demo.lane) parts.lane = demo.lane;
  if (demo.product) parts.product = demo.product;
  if (demo.productId) parts.product = demo.productId;
  if (demo.scenario) parts.scenario = demo.scenario;
  if (demo.ids) parts.ids = demo.ids;
  if (demo.auto) parts.auto = '1';
  if (note) parts.demoNote = note;
  if (label) parts.demoLabel = label;

  const query = mergeQuery(row.query, new URLSearchParams(parts).toString());
  const agentNote = {
    label: label || 'Agent demonstration',
    body: note
  };
  return {
    ...row,
    query,
    agentNote
  };
}

function financeFinderDemo(overrides = {}) {
  const {
    label,
    note,
    tab,
    q,
    country,
    region,
    auto,
    moduleId,
    openSize,
    title,
    query,
    description,
    usageHint
  } = overrides;
  return withModuleDemo(
    {
      moduleId: moduleId || 'finance-finder',
      openSize: openSize || 'near-full',
      title,
      query,
      description,
      usageHint
    },
    {
      label: label || 'Vincent — finance demo',
      note:
        note ||
        'I opened Finance Finder on the right tab with a starter search — run it or change the topic.',
      tab: tab || 'grants',
      q: q || 'kitchen equipment',
      country,
      region,
      auto: auto === true
    }
  );
}

function savingsProjectionDemo(overrides = {}) {
  const {
    label,
    note,
    scenario,
    product,
    productId,
    moduleId,
    openSize,
    title,
    query,
    description,
    usageHint
  } = overrides;
  return withModuleDemo(
    {
      moduleId: moduleId || 'savings-projection',
      openSize: openSize || 'near-full',
      title,
      query,
      description,
      usageHint
    },
    {
      label: label || 'Payback demonstration',
      note:
        note ||
        'I loaded a worked payback example — move the sliders to match your site before you finance.',
      scenario: scenario || 'fridge',
      product: product || productId
    }
  );
}

function agentMarketDemo(overrides = {}) {
  const {
    label,
    note,
    lane,
    product,
    productId,
    moduleId,
    openSize,
    title,
    query,
    description,
    usageHint
  } = overrides;
  return withModuleDemo(
    {
      moduleId: moduleId || 'agent-market',
      openSize: openSize || 'near-full',
      title,
      query,
      description,
      usageHint
    },
    {
      label: label || 'Agent Market demo',
      note:
        note ||
        'I opened Agent Market on this lane — save a product, then ask me about grants or payback.',
      lane: lane || 'kitchen',
      product: product || productId
    }
  );
}

function shortlistCompareDemo(overrides = {}) {
  const {
    label,
    note,
    ids,
    products,
    moduleId,
    openSize,
    title,
    query,
    description,
    usageHint
  } = overrides;
  const idList = Array.isArray(ids)
    ? ids
    : Array.isArray(products)
      ? products
      : String(ids || products || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  return withModuleDemo(
    {
      moduleId: moduleId || 'shortlist-compare',
      openSize: openSize || 'near-full',
      title,
      query,
      description,
      usageHint
    },
    {
      label: label || 'Shortlist Compare',
      note:
        note ||
        'Side-by-side board for products you saved — pick two or three, then ask Vincent or Andrieus.',
      ids: idList.length ? idList.join(',') : undefined
    }
  );
}

/** Map profile.region-ish values to Finance Finder country option strings. */
function countryLabelFromProfile(regionOrCountry) {
  const r = String(regionOrCountry || '')
    .trim()
    .toLowerCase();
  if (!r) return '';
  if (r.startsWith('uk') || r.includes('united kingdom') || r === 'gb') return 'United Kingdom';
  if (r.includes('netherland') || r === 'nl') return 'Netherlands';
  if (r.includes('german') || r === 'de') return 'Germany';
  if (r.includes('belgium') || r === 'be') return 'Belgium';
  if (r.includes('france') || r === 'fr') return 'France';
  if (r.includes('spain') || r === 'es') return 'Spain';
  if (r.includes('portugal') || r === 'pt') return 'Portugal';
  if (r.includes('italy') || r === 'it') return 'Italy';
  return '';
}

module.exports = {
  mergeQuery,
  withModuleDemo,
  financeFinderDemo,
  savingsProjectionDemo,
  agentMarketDemo,
  shortlistCompareDemo,
  countryLabelFromProfile
};
