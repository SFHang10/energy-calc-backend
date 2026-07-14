/**
 * File-based restaurant equipment inventory (per siteId) for Artemis benchmark lines.
 * Source: data/restaurant-assets/*.json — see data/restaurant-assets/README.md
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'data', 'restaurant-assets');

const SITE_INVENTORY_MARKER = '**Site inventory:**';

const SITE_ASSET_RULES = [
  {
    file: 'wok-to-walk-equipment-list.json',
    test: (siteId) => /^w2w-/i.test(siteId) || /wok[- ]?to[- ]?walk/i.test(siteId)
  }
];

const INTENT_IDS = new Set(['baseline_equipment']);

const TYPE_LABELS = {
  cooking: 'cooking',
  refrigeration: 'refrigeration',
  warewashing: 'warewashing',
  hvac: 'HVAC',
  lighting: 'lighting',
  ops: 'operations',
  other: 'other'
};

let assetCache = new Map();

function safeText(value, maxLen = 120) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function insertBeforeAnswerTip(answer, insert) {
  const tipMatch = String(answer || '').match(/\n\n_([^_\n]+)_\s*$/);
  if (tipMatch && typeof tipMatch.index === 'number') {
    return answer.slice(0, tipMatch.index) + insert + answer.slice(tipMatch.index);
  }
  return `${answer}${insert}`;
}

function resolveAssetFile(siteId) {
  const id = String(siteId || '').trim();
  if (!id) return '';
  for (const rule of SITE_ASSET_RULES) {
    if (rule.test(id)) return rule.file;
  }
  return '';
}

function loadRestaurantAssets(siteId) {
  const id = String(siteId || '').trim();
  const file = resolveAssetFile(id);
  if (!file) return null;

  const cacheKey = `${id}::${file}`;
  if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);

  const fullPath = path.join(ASSETS_DIR, file);
  try {
    const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const equipment = Array.isArray(raw.equipment) ? raw.equipment : [];
    const bundle = {
      siteId: id,
      sourceFile: path.relative(ROOT, fullPath).replace(/\\/g, '/'),
      brand: safeText(raw.brand || raw.label, 80),
      label: safeText(raw.label || raw.brand, 120),
      equipment
    };
    assetCache.set(cacheKey, bundle);
    return bundle;
  } catch (_err) {
    assetCache.set(cacheKey, null);
    return null;
  }
}

function summarizeByType(equipment = []) {
  const counts = {};
  for (const row of equipment) {
    const key = row.equipmentIntelligenceType || 'other';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${count}× ${TYPE_LABELS[type] || type}`)
    .slice(0, 5)
    .join(', ');
}

function rankEquipmentForQuestion(equipment = [], question = '') {
  const q = String(question || '').toLowerCase();
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  if (!tokens.length) return [];

  return equipment
    .map((row) => {
      const hay = [
        row.name,
        row.slug,
        row.equipmentIntelligenceType,
        ...(row.utilities || [])
      ]
        .join(' ')
        .toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (hay.includes(token)) score += 1;
      }
      return { row, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
    .slice(0, 4)
    .map((entry) => entry.row);
}

function formatBenchmarkLine(bundle, question) {
  const equipment = bundle.equipment || [];
  const brand = bundle.brand || bundle.label || 'this site';
  const typeSummary = summarizeByType(equipment);
  const matched = rankEquipmentForQuestion(equipment, question);
  const matchedNames = matched.map((row) => `**${row.name}**`).join(', ');
  const deepDive = './restaurant-equipment-deep-dive.html';

  let line = `**${brand}** inventory on file for site \`${bundle.siteId}\` — **${equipment.length}** tracked items`;
  if (typeSummary) line += ` (${typeSummary})`;
  if (matchedNames) line += `. Relevant to your question: ${matchedNames}`;
  line += `. Open [equipment deep dive](${deepDive}) for ETL alternatives, grants, and savings projection.`;
  return line;
}

/**
 * Prepend-only benchmark line when profile.siteId maps to a restaurant-assets JSON file.
 */
function attachRestaurantAssetBenchmark(result, { question, intentId, profile = {} } = {}) {
  if (!result?.answer) return result;
  if (!INTENT_IDS.has(intentId)) return result;

  const siteId = String(profile.siteId || '').trim();
  if (!siteId) return result;
  if (String(result.answer).includes(SITE_INVENTORY_MARKER)) return result;

  const bundle = loadRestaurantAssets(siteId);
  if (!bundle?.equipment?.length) return result;

  const prose = formatBenchmarkLine(bundle, question);
  result.answer = insertBeforeAnswerTip(result.answer, `\n\n${SITE_INVENTORY_MARKER} ${prose}`);
  result.restaurantAssetSiteId = siteId;
  result.restaurantAssetFile = bundle.sourceFile;
  return result;
}

module.exports = {
  SITE_INVENTORY_MARKER,
  resolveAssetFile,
  loadRestaurantAssets,
  summarizeByType,
  rankEquipmentForQuestion,
  formatBenchmarkLine,
  attachRestaurantAssetBenchmark
};
