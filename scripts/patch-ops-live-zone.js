const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';

const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'Greenways Interface .html');
let html = fs.readFileSync(filePath, 'utf8');

const anchor = html.indexOf('Priority Queue (ROI)');
const auditAnchor = html.indexOf('Audit Trail', anchor);
if (anchor < 0 || auditAnchor < 0) {
  console.error('Anchors not found', { anchor, auditAnchor });
  process.exit(1);
}
const i0 = html.lastIndexOf(`        <${X} class="stack-grid-2">`, anchor);
const auditPanelStart = html.lastIndexOf(`        <${X} class="mini-panel">`, auditAnchor);
const iEnd = html.indexOf(xd, html.indexOf('auditTrailPanel', auditPanelStart)) + xd.length;
const i1 = html.indexOf(xd, iEnd) + xd.length; // close mini-panel

function panel(cls, title, tag, bodyId, bodyCls) {
  const clsAttr = bodyCls ? ` class="${bodyCls}"` : '';
  return (
    `          <${X} class="${cls}">` +
    `            <${X} class="mini-panel-head">` +
    `              <${X} class="mini-title">${title}${xd}` +
    `              <span class="mini-live-tag">${tag}</span>` +
    `            ${xd}` +
    `            <${X} id="${bodyId}"${clsAttr}>${xd}` +
    `          ${xd}`
  );
}

const block =
  `        <${X} class="ops-live-zone" aria-label="Live operations and audit intelligence">` +
  `\n          <${X} class="ops-live-banner">` +
  `\n            <span class="ops-live-badge"><span class="pulse-dot" aria-hidden="true"></span> Live lane</span>` +
  `\n            <${X} class="ops-live-banner-copy">` +
  `\n              <strong>Operations intelligence — streaming soon</strong>` +
  `\n              <p>Priority savings, anomalies, tasks, sensor health, and audit events will populate from smart meters, BMS, and Greenways audit exports. Preview below updates as you explore equipment.</p>` +
  `\n            ${xd}` +
  `\n          ${xd}` +
  `\n          <${X} class="stack-grid-2 ops-panels-row">` +
  panel('mini-panel mini-panel--live', 'Priority Queue (ROI)', 'Ranked savings', 'priorityQueue', 'ops-card-list') +
  panel('mini-panel mini-panel--live', 'Top 5 Anomalies Today', 'Alert feed', 'alertFeed', 'ops-card-list') +
  `\n          ${xd}` +
  `\n          <${X} class="stack-grid-2 ops-panels-row">` +
  panel('mini-panel mini-panel--live', 'Action Tasks', 'Assigned work', 'taskList', 'ops-card-list') +
  panel('mini-panel mini-panel--live', 'Data Quality &amp; Sensor Health', 'Telemetry', 'dataQualityPanel', '') +
  `\n          ${xd}` +
  `\n          <${X} class="mini-panel mini-panel--live audit-hub-panel">` +
  `\n            <${X} class="mini-panel-head">` +
  `\n              <${X} class="mini-title">Audit Trail${xd}` +
  `\n              <span class="mini-live-tag">Governance log</span>` +
  `\n            ${xd}` +
  `\n            <${X} class="audit-hub">` +
  `\n              <${X} class="audit-visual-wrap" role="img" aria-label="Animated energy audit scan preview">` +
  `\n                <img class="audit-visual-bg" src="./iot_restaurant_green.svg" alt="" width="200" height="160" />` +
  `\n                <${X} class="audit-scan-beam" aria-hidden="true">${xd}` +
  `\n                <${X} class="audit-visual-ring" aria-hidden="true">${xd}` +
  `\n                <span class="audit-visual-badge">Audit scan · live preview</span>` +
  `\n              ${xd}` +
  `\n              <${X} class="audit-feed-wrap">` +
  `\n                <p class="audit-feed-intro">Every view, baseline change, and export will appear here for CSRD-ready traceability — tied to the appliance you select.</p>` +
  `\n                <${X} id="auditTrailPanel" class="audit-feed">${xd}` +
  `\n              ${xd}` +
  `\n            ${xd}` +
  `\n          ${xd}` +
  `\n        ${xd}\n`;

html = html.slice(0, i0) + block + html.slice(i1);
fs.writeFileSync(filePath, html, 'utf8');
console.log('Patched ops-live-zone HTML');
