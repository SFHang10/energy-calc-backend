const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'Greenways Interface .html');
let html = fs.readFileSync(filePath, 'utf8');

const OPS_CSS = `
  .ops-live-zone { margin-top: 14px; display: flex; flex-direction: column; gap: 12px; }
  .ops-live-banner {
    display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px;
    padding: 12px 14px; border-radius: 10px;
    border: 1px solid rgba(0, 245, 130, 0.22);
    background: linear-gradient(135deg, rgba(8, 28, 20, 0.95), rgba(12, 40, 28, 0.88));
  }
  .ops-live-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--accent-green); border: 1px solid rgba(0, 245, 130, 0.35);
    border-radius: 999px; padding: 4px 10px; background: rgba(0, 245, 130, 0.08);
  }
  .ops-live-banner-copy strong { display: block; font-size: 13px; margin-bottom: 4px; }
  .ops-live-banner-copy p { margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.45; max-width: 720px; }
  .ops-panels-row { margin: 0; }
  .mini-panel--live {
    border-color: rgba(0, 245, 130, 0.18);
    background: linear-gradient(180deg, rgba(10, 24, 18, 0.92), rgba(8, 18, 14, 0.88));
  }
  .mini-panel-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
  .mini-panel-head .mini-title { margin-bottom: 0; }
  .mini-live-tag {
    font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    color: rgba(0, 245, 130, 0.85); border: 1px solid rgba(0, 245, 130, 0.25);
    border-radius: 999px; padding: 3px 8px;
  }
  .ops-card-list { display: flex; flex-direction: column; gap: 8px; }
  .ops-feed-card {
    display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto;
    gap: 6px 10px; padding: 10px 12px; border-radius: 9px;
    border: 1px solid rgba(0, 245, 130, 0.14); background: rgba(0, 0, 0, 0.22);
    cursor: pointer; text-align: left; width: 100%; font: inherit; color: inherit;
    transition: border-color 0.15s, background 0.15s;
  }
  .ops-feed-card:hover, .ops-feed-card:focus-visible {
    border-color: rgba(83, 184, 255, 0.45); background: rgba(83, 184, 255, 0.08); outline: none;
  }
  .ops-feed-card--active { border-color: rgba(255, 184, 48, 0.55); box-shadow: 0 0 0 1px rgba(255, 184, 48, 0.2); }
  .ops-feed-card-main { display: flex; align-items: flex-start; gap: 10px; grid-column: 1 / 2; }
  .ops-rank { font-size: 11px; font-weight: 800; color: var(--accent-amber); min-width: 14px; }
  .ops-feed-icon { font-size: 14px; line-height: 1; }
  .ops-feed-title { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .ops-feed-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
  .ops-savings-bar { grid-column: 1 / -1; height: 4px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .ops-savings-bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--accent-green), rgba(83,184,255,0.9)); }
  .ops-meter-row { margin-bottom: 10px; }
  .ops-meter-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
  .ops-meter-track { height: 5px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .ops-meter-fill { height: 100%; background: linear-gradient(90deg, var(--accent-green), rgba(83,184,255,0.85)); }
  .ops-meter-fill--warn { background: linear-gradient(90deg, var(--accent-amber), #ff6b4a); }
  .ops-fresh-live { color: var(--accent-green); }
  .ops-link-row { margin-top: 8px; }
  .ops-link-row button { background: none; border: none; padding: 0; color: rgba(83,184,255,0.95); cursor: pointer; font-size: 11px; font-weight: 600; text-decoration: underline; }
  .audit-hub { display: grid; grid-template-columns: minmax(140px, 200px) 1fr; gap: 14px; }
  @media (max-width: 720px) { .audit-hub { grid-template-columns: 1fr; } }
  .audit-visual-wrap { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid rgba(0,245,130,0.2); min-height: 140px; background: rgba(0,0,0,0.35); }
  .audit-visual-bg { width: 100%; height: auto; display: block; opacity: 0.55; }
  .audit-scan-beam { position: absolute; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, var(--accent-green), transparent); animation: auditScan 3.2s ease-in-out infinite; }
  @keyframes auditScan { 0%, 100% { top: 12%; } 50% { top: 78%; } }
  .audit-visual-ring { position: absolute; inset: 18%; border: 1px dashed rgba(0,245,130,0.35); border-radius: 50%; animation: auditRing 4s linear infinite; }
  @keyframes auditRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .audit-visual-badge { position: absolute; left: 8px; bottom: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #d8fff0; background: rgba(0,0,0,0.55); padding: 4px 8px; border-radius: 6px; }
  .audit-feed-intro { font-size: 11px; color: var(--text-muted); margin: 0 0 10px; line-height: 1.45; }
  .audit-feed { display: flex; flex-direction: column; gap: 8px; }
  .audit-feed-item { display: flex; gap: 10px; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(0,245,130,0.1); background: rgba(0,0,0,0.2); }
  .audit-feed-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-green); margin-top: 5px; flex-shrink: 0; }
  .audit-feed-text { font-size: 12px; font-weight: 600; }
  .audit-feed-time { font-size: 10px; color: var(--text-muted); }
  .audit-feed-sub { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
`;

if (!html.includes('.ops-live-zone')) {
  html = html.replace('  .toolbar-inline {', OPS_CSS + '\n  .toolbar-inline {');
}

const htmlStart = html.indexOf('        <div class="stack-grid-2">\n          <motion class="mini-panel">'.replace(/motion/g, X));
const htmlStart2 = html.indexOf(
  '        <div class="stack-grid-2">\n          <div class="mini-panel">\n            <div class="mini-title">Priority Queue (ROI)</motion>'
    .replace('</motion>', xd)
);
const i0 = htmlStart2 >= 0 ? htmlStart2 : html.indexOf(
  '        <motion class="stack-grid-2">\n          <motion class="mini-panel">\n            <motion class="mini-title">Priority Queue (ROI)</motion>'
    .replace(/<\/?motion/g, (m) => m.replace('motion', X))
);
const i0real = html.indexOf('            <div class="mini-title">Priority Queue (ROI)</div>');
const i0block = html.lastIndexOf('        <div class="stack-grid-2">', i0real);

const iEnd = html.indexOf('        <motion style="position:relative;height:120px;display:none" id="detailChart">'.replace('motion', X));
const iEnd2 = html.indexOf('        <div style="position:relative;height:120px;display:none" id="detailChart">');

const endIdx = iEnd2 >= 0 ? iEnd2 : iEnd;

if (i0block < 0 || endIdx < 0) {
  console.error('HTML block anchors missing', i0block, endIdx);
  process.exit(1);
}

const opsHtml =
  `        <${X} class="ops-live-zone" aria-label="Live operations and audit intelligence">` +
  `\n          <${X} class="ops-live-banner">` +
  `\n            <span class="ops-live-badge"><span class="pulse-dot" aria-hidden="true"></span> Live lane</span>` +
  `\n            <${X} class="ops-live-banner-copy">` +
  `\n              <strong>Operations intelligence — preview mode</strong>` +
  `\n              <p>Priority savings, anomalies, tasks, and sensor health update as you select equipment. Click any row to focus that asset; Ctrl+click opens equipment deep dive.</p>` +
  `\n            ${xd}` +
  `\n          ${xd}` +
  `\n          <${X} class="stack-grid-2 ops-panels-row">` +
  `\n            <${X} class="mini-panel mini-panel--live">` +
  `\n              <${X} class="mini-panel-head"><${X} class="mini-title">Priority Queue (ROI)${xd}<span class="mini-live-tag">Ranked savings</span>${xd}` +
  `\n              <${X} id="priorityQueue" class="ops-card-list">${xd}` +
  `\n            ${xd}` +
  `\n            <${X} class="mini-panel mini-panel--live">` +
  `\n              <${X} class="mini-panel-head"><${X} class="mini-title">Top 5 Anomalies Today${xd}<span class="mini-live-tag">Alert feed</span>${xd}` +
  `\n              <${X} id="alertFeed" class="ops-card-list">${xd}` +
  `\n            ${xd}` +
  `\n          ${xd}` +
  `\n          <${X} class="stack-grid-2 ops-panels-row">` +
  `\n            <${X} class="mini-panel mini-panel--live">` +
  `\n              <${X} class="mini-panel-head"><${X} class="mini-title">Action Tasks${xd}<span class="mini-live-tag">Assigned work</span>${xd}` +
  `\n              <${X} id="taskList" class="ops-card-list">${xd}` +
  `\n            ${xd}` +
  `\n            <${X} class="mini-panel mini-panel--live">` +
  `\n              <${X} class="mini-panel-head"><${X} class="mini-title">Data Quality &amp; Sensor Health${xd}<span class="mini-live-tag">Telemetry</span>${xd}` +
  `\n              <${X} id="dataQualityPanel">${xd}` +
  `\n            ${xd}` +
  `\n          ${xd}` +
  `\n          <${X} class="mini-panel mini-panel--live audit-hub-panel">` +
  `\n            <${X} class="mini-panel-head"><${X} class="mini-title">Audit Trail${xd}<span class="mini-live-tag">Governance log</span>${xd}` +
  `\n            <${X} class="audit-hub">` +
  `\n              <${X} class="audit-visual-wrap" role="img" aria-label="Animated energy audit scan preview">` +
  `\n                <img class="audit-visual-bg" src="./iot_restaurant_green.svg" alt="" width="200" height="160" />` +
  `\n                <${X} class="audit-scan-beam" aria-hidden="true">${xd}` +
  `\n                <${X} class="audit-visual-ring" aria-hidden="true">${xd}` +
  `\n                <span class="audit-visual-badge">Audit scan · live preview</span>` +
  `\n              ${xd}` +
  `\n              <${X} class="audit-feed-wrap">` +
  `\n                <p class="audit-feed-intro">Every view, baseline change, and export appears here for CSRD-ready traceability — tied to the appliance you select.</p>` +
  `\n                <${X} id="auditTrailPanel" class="audit-feed">${xd}` +
  `\n              ${xd}` +
  `\n            ${xd}` +
  `\n          ${xd}` +
  `\n        ${xd}\n`;

if (!html.includes('ops-live-zone')) {
  html = html.slice(0, i0block) + opsHtml + html.slice(endIdx);
}

const jsStart = html.indexOf('function updatePriorityQueue() {');
const jsEnd = html.indexOf('function initComparisonHorizon() {');
if (jsStart < 0 || jsEnd < 0) {
  console.error('JS markers missing');
  process.exit(1);
}

const jsBlock = fs.readFileSync(path.join(__dirname, '_ops_js_interactive.js'), 'utf8');
html = html.slice(0, jsStart) + jsBlock + html.slice(jsEnd);

if (!html.includes('initOpsLivePulse();')) {
  html = html.replace('initExportActions();', 'initExportActions();\ninitOpsLivePulse();');
}
if (!html.includes('updatePriorityQueue();\n  updateDataQualityPanel();')) {
  html = html.replace(
    '  updateSavingsPipeline();\n})();',
    '  updateSavingsPipeline();\n  updatePriorityQueue();\n  updateDataQualityPanel();\n})();'
  );
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('equipment ops interactive patch ok');
