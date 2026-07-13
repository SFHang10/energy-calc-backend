const path = require('path');
const fs = require('fs/promises');
const { toLinkItem } = require('./greenways-agent-shared');

const toolsPath = path.join(__dirname, '..', 'data', 'finance-agent-tools.json');

let toolsCache = null;

async function loadFinanceTools() {
  if (toolsCache) return toolsCache;
  try {
    const raw = await fs.readFile(toolsPath, 'utf8');
    toolsCache = JSON.parse(raw);
    return toolsCache;
  } catch (_) {
    toolsCache = { tools: [], handoffs: {}, ticker: {} };
    return toolsCache;
  }
}

function rankTools(tools, question, limit = 8) {
  const q = String(question || '').toLowerCase();
  if (!q.trim()) return tools.slice(0, limit);

  const scored = tools.map((tool) => {
    const hay = [
      tool.title,
      tool.description,
      tool.category,
      ...(tool.tags || [])
    ]
      .join(' ')
      .toLowerCase();
    let score = 0;
    q.split(/\s+/).filter((t) => t.length >= 3).forEach((token) => {
      if (hay.includes(token)) score += 3;
    });
    if (/audit|appliance/.test(q) && tool.id === 'energy-audit') score += 10;
    if (/ticker|wholesale|price/.test(q) && tool.category === 'prices') score += 6;
    if (/projection|payback|roi|trajectory/.test(q) && tool.category === 'payback') score += 6;
    if (/renewable|solar|wind|lcoe|irena/.test(q) && tool.id === 'declining-cost-renewables') score += 10;
    if (/carbon|postcode|grid intensity|gco2|generation mix/.test(q) && tool.id === 'site-energy-reading') score += 10;
    if (/calculator|compare|etl/.test(q) && tool.id === 'energy-calculator') score += 8;
    return { tool, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.tool)
    .slice(0, limit);
}

function toolsToLinkItems(tools) {
  return tools.map((t) =>
    toLinkItem(t.title, t.href, t.description + (t.api ? ` · API: ${t.api}` : ''))
  );
}

/** Map finance-agent-tools.json ids → greenways-content-modules.json ids */
const TOOL_MODULE_IDS = {
  'energy-ticker': 'energy-ticker',
  'savings-projection': 'savings-projection',
  'energy-savings-trajectory': 'savings-trajectory',
  'savings-hub': 'savings-tour',
  'energy-cost-guide': 'energy-cost-guide',
  'etl-marketplace': 'etl-finder',
  'energy-calculator': 'etl-calculator',
  'energy-audit': 'energy-audit',
  'finance-finder': 'finance-finder',
  'utility-detail': 'utility-detail',
  'restaurant-data': 'restaurant-data',
  'tariff-compare': 'european-energy',
  'restaurant-energy-monitoring-guide': 'restaurant-energy-monitoring-guide',
  'site-energy-reading': 'site-energy-reading',
  'energy-monitoring': 'energy-monitoring',
  'low-energy-equipment': 'low-energy-equipment',
  'discover-savings': 'discover-savings',
  'europe-savings': 'europe-savings',
  'quick-benefits': 'sustainability-quick-benefits',
  'prices-and-deals': 'prices-and-deals',
  'eco-project-planning': 'eco-project-planner',
  'declining-cost-renewables': 'declining-cost-renewables',
  'deals-hub': 'deals-ticker'
};

function toolToModuleRow(tool) {
  if (!tool) return null;
  const moduleId = TOOL_MODULE_IDS[tool.id];
  if (!moduleId) return null;
  const row = { moduleId, openSize: 'near-full' };
  const href = String(tool.href || '');
  const qIndex = href.indexOf('?');
  if (qIndex >= 0) row.query = href.slice(qIndex + 1);
  return row;
}

function toolsToModuleRows(tools) {
  return (tools || []).map(toolToModuleRow).filter(Boolean);
}

function formatToolsBullets(tools) {
  return tools
    .map((t) => `- **${t.title}** — ${t.description}\n  → ${t.href}`)
    .join('\n');
}

module.exports = {
  loadFinanceTools,
  rankTools,
  toolsToLinkItems,
  toolsToModuleRows,
  toolToModuleRow,
  TOOL_MODULE_IDS,
  formatToolsBullets
};
