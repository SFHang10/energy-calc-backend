const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'Greenways Interface .html');
let html = fs.readFileSync(filePath, 'utf8');

const row1Old =
  '          <' + X + ' class="stack-grid-2 ops-panels-row">          <' + X + ' class="mini-panel mini-panel--live">            <' + X + ' class="mini-panel-head">              <' + X + ' class="mini-title">Priority Queue (ROI)' + xd + '              <span class="mini-live-tag">Ranked savings</span>            ' + xd + '            <' + X + ' id="priorityQueue" class="ops-card-list">' + xd + '          ' + xd + '          <' + X + ' class="mini-panel mini-panel--live">            <' + X + ' class="mini-panel-head">              <' + X + ' class="mini-title">Top 5 Anomalies Today' + xd + '              <span class="mini-live-tag">Alert feed</span>            ' + xd + '            <' + X + ' id="alertFeed" class="ops-card-list">' + xd + '          ' + xd;

const row1New =
  '          <' + X + ' class="stack-grid-2 ops-panels-row">\n' +
  '            <' + X + ' class="mini-panel mini-panel--live">\n' +
  '              <' + X + ' class="mini-panel-head">\n' +
  '                <' + X + ' class="mini-title">Priority Queue (ROI)' + xd + '\n' +
  '                <span class="mini-live-tag">Ranked savings</span>\n' +
  '              ' + xd + '\n' +
  '              <' + X + ' id="priorityQueue" class="ops-card-list">' + xd + '\n' +
  '            ' + xd + '\n' +
  '            <' + X + ' class="mini-panel mini-panel--live">\n' +
  '              <' + X + ' class="mini-panel-head">\n' +
  '                <' + X + ' class="mini-title">Top 5 Anomalies Today' + xd + '\n' +
  '                <span class="mini-live-tag">Alert feed</span>\n' +
  '              ' + xd + '\n' +
  '              <' + X + ' id="alertFeed" class="ops-card-list">' + xd + '\n' +
  '            ' + xd + '\n';

const row2Old =
  '          <' + X + ' class="stack-grid-2 ops-panels-row">          <' + X + ' class="mini-panel mini-panel--live">            <' + X + ' class="mini-panel-head">              <' + X + ' class="mini-title">Action Tasks' + xd + '              <span class="mini-live-tag">Assigned work</span>            ' + xd + '            <' + X + ' id="taskList" class="ops-card-list">' + xd + '          ' + xd + '          <' + X + ' class="mini-panel mini-panel--live">            <' + X + ' class="mini-panel-head">              <' + X + ' class="mini-title">Data Quality &amp; Sensor Health' + xd + '              <span class="mini-live-tag">Telemetry</span>            ' + xd + '            <' + X + ' id="dataQualityPanel">' + xd + '          ' + xd;

const row2New =
  '          <' + X + ' class="stack-grid-2 ops-panels-row">\n' +
  '            <' + X + ' class="mini-panel mini-panel--live">\n' +
  '              <' + X + ' class="mini-panel-head">\n' +
  '                <' + X + ' class="mini-title">Action Tasks' + xd + '\n' +
  '                <span class="mini-live-tag">Assigned work</span>\n' +
  '              ' + xd + '\n' +
  '              <' + X + ' id="taskList" class="ops-card-list">' + xd + '\n' +
  '            ' + xd + '\n' +
  '            <' + X + ' class="mini-panel mini-panel--live">\n' +
  '              <' + X + ' class="mini-panel-head">\n' +
  '                <' + X + ' class="mini-title">Data Quality &amp; Sensor Health' + xd + '\n' +
  '                <span class="mini-live-tag">Telemetry</span>\n' +
  '              ' + xd + '\n' +
  '              <' + X + ' id="dataQualityPanel">' + xd + '\n' +
  '            ' + xd + '\n';

if (html.includes(row1Old)) {
  html = html.replace(row1Old, row1New);
  console.log('Formatted row 1');
} else {
  console.log('Row 1 already formatted or not found');
}
if (html.includes(row2Old)) {
  html = html.replace(row2Old, row2New);
  console.log('Formatted row 2');
} else {
  console.log('Row 2 already formatted or not found');
}

fs.writeFileSync(filePath, html, 'utf8');
