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

function formatToolsBullets(tools) {
  return tools
    .map((t) => `- **${t.title}** — ${t.description}\n  → ${t.href}`)
    .join('\n');
}

module.exports = {
  loadFinanceTools,
  rankTools,
  toolsToLinkItems,
  formatToolsBullets
};
