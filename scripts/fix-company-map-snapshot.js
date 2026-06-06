const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';
const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'company-map.html');
let html = fs.readFileSync(filePath, 'utf8');

const htmlBlock =
  '      <section class="snapshot-zone card tablet" id="siteSnapshotZone" aria-label="High-level restaurant snapshot">\n' +
  '        <' + X + ' class="snapshot-head">\n' +
  '          <' + X + ' class="tablet-title" style="margin:0;">Restaurant snapshot · high level' + xd + '\n' +
  '          <span class="snapshot-live"><span class="snapshot-live-dot" aria-hidden="true"></span> Live preview</span>\n' +
  '        ' + xd + '\n' +
  '        <' + X + ' class="snapshot-kpis" id="snapshotKpis">' + xd + '\n' +
  '        <' + X + ' class="snapshot-grid" id="snapshotGrid">' + xd + '\n' +
  '        <p class="snapshot-footnote" id="snapshotFootnote">High-level view for the selected site — streams from meters, BMS, and Greenways audit when connected.</p>\n' +
  '      </section>\n';

if (!html.includes('id="siteSnapshotZone"')) {
  html = html.replace('      </section>\n    </main>', '      </section>\n' + htmlBlock + '    </main>');
}

const newRenderSiteSnapshot = `    function renderSiteSnapshot(building) {
      const zone = byId('siteSnapshotZone');
      const kpis = byId('snapshotKpis');
      const grid = byId('snapshotGrid');
      if (!zone || !kpis || !grid || !building) return;
      const ins = computeBuildingInsights(building);
      const sensorCount = ins.sensors.length;
      const shortName = (building.name || 'Site').replace(/^Wok To Walk —\\s*/i, '');
      kpis.innerHTML = [
        { k: 'Site health', v: ins.score + '/100', sub: ins.band + ' band' },
        { k: 'Sensors mapped', v: String(sensorCount), sub: ins.hasPowerSensor ? 'Power lane live' : 'Add incomer meter' },
        { k: 'Est. utilities', v: '€' + formatNum(Math.round(ins.estMonthly)), sub: 'Indicative / month' },
        { k: 'Carbon signal', v: ins.co2Tonnes + ' t', sub: 'CO₂e from electricity' }
      ].map((row, i) => (
        '<div class="snapshot-kpi" style="animation-delay:' + (0.04 + i * 0.04) + 's">' +
          '<motion class="k">' + row.k + '</motion>' +
          '<motion class="v">' + row.v + '</motion>' +
          '<motion class="sub">' + row.sub + '</motion>' +
        '</motion>'
      )).join('').replace(/<\\/?motion>/g, (t) => t.replace('motion', 'div'));
      const glance = [
        shortName + ' · Amsterdam restaurant profile',
        'Peak draw ' + formatNum(ins.powerLoad) + ' kW · ' + formatNum(ins.elec) + ' kWh/mo electricity',
        sensorCount + ' sensor points listed · coverage ' + Math.round((ins.covPower + ins.covWater + ins.covGas) / 3) + '% avg',
        'Operational status: ' + ins.band + ' — updates when BMS feed is live'
      ];
      const mixRows = [
        { label: 'Electricity share', pct: ins.mixElec },
        { label: 'Gas share', pct: ins.mixGas },
        { label: 'Water share', pct: ins.mixWater }
      ];
      const focus = ins.band === 'Priority'
        ? 'Priority week: stabilise baseload and confirm gas + water sensor coverage before deep audit.'
        : (ins.band === 'Watch'
          ? 'Watch week: ' + ins.actions[0]
          : 'On track: ' + ins.anomalies[0]);
      grid.innerHTML =
        '<div class="snapshot-panel">' +
          '<h5>At a glance</h5><ul>' + glance.map((g) => '<li>' + g + '</li>').join('') + '</ul>' +
        '</div>' +
        '<div class="snapshot-panel">' +
          '<h5>Utility mix (indicative)</h5>' +
          mixRows.map((r) => (
            '<div class="snapshot-mix-row">' +
              '<div class="snapshot-mix-label"><span>' + r.label + '</span><strong>' + r.pct + '%</strong></motion>' +
              '<div class="snapshot-mix-track"><div class="snapshot-mix-fill" style="width:' + r.pct + '%"></motion></motion>' +
            '</motion>'
          )).join('').replace(/<\\/?motion>/g, (t) => t.replace('motion', 'motion' === 'motion' ? 'div' : 'motion')) +
        '</motion>' +
        '<div class="snapshot-panel">' +
          '<h5>This week · focus</h5>' +
          '<div class="snapshot-focus">' + focus + '</motion>' +
          '<ul style="margin-top:10px;">' + ins.actions.slice(0, 2).map((a) => '<li>' + a + '</li>').join('') + '</ul>' +
        '</motion>';
      grid.innerHTML = grid.innerHTML.replace(/<\\/?motion>/g, (t) => t.replace('motion', 'motion' === 'motion' ? 'div' : 'motion'));
      zone.style.animation = 'none';
      void zone.offsetWidth;
      zone.style.animation = '';
    }
`;

// Write clean version without motion hack
const cleanRender = `    function renderSiteSnapshot(building) {
      const zone = byId('siteSnapshotZone');
      const kpis = byId('snapshotKpis');
      const grid = byId('snapshotGrid');
      if (!zone || !kpis || !grid || !building) return;
      const ins = computeBuildingInsights(building);
      const sensorCount = ins.sensors.length;
      const shortName = (building.name || 'Site').replace(/^Wok To Walk —\\s*/i, '');
      kpis.innerHTML = [
        { k: 'Site health', v: ins.score + '/100', sub: ins.band + ' band' },
        { k: 'Sensors mapped', v: String(sensorCount), sub: ins.hasPowerSensor ? 'Power lane live' : 'Add incomer meter' },
        { k: 'Est. utilities', v: '€' + formatNum(Math.round(ins.estMonthly)), sub: 'Indicative / month' },
        { k: 'Carbon signal', v: ins.co2Tonnes + ' t', sub: 'CO₂e from electricity' }
      ].map((row, i) => (
        '<${X} class="snapshot-kpi" style="animation-delay:' + (0.04 + i * 0.04) + 's">' +
          '<${X} class="k">' + row.k + '${xd}' +
          '<${X} class="v">' + row.v + '${xd}' +
          '<${X} class="sub">' + row.sub + '${xd}' +
        '${xd}'
      )).join('');
      const glance = [
        shortName + ' · Amsterdam restaurant profile',
        'Peak draw ' + formatNum(ins.powerLoad) + ' kW · ' + formatNum(ins.elec) + ' kWh/mo electricity',
        sensorCount + ' sensor points listed · coverage ' + Math.round((ins.covPower + ins.covWater + ins.covGas) / 3) + '% avg',
        'Operational status: ' + ins.band + ' — updates when BMS feed is live'
      ];
      const mixRows = [
        { label: 'Electricity share', pct: ins.mixElec },
        { label: 'Gas share', pct: ins.mixGas },
        { label: 'Water share', pct: ins.mixWater }
      ];
      const focus = ins.band === 'Priority'
        ? 'Priority week: stabilise baseload and confirm gas + water sensor coverage before deep audit.'
        : (ins.band === 'Watch'
          ? 'Watch week: ' + ins.actions[0]
          : 'On track: ' + ins.anomalies[0]);
      grid.innerHTML =
        '<${X} class="snapshot-panel">' +
          '<h5>At a glance</h5><ul>' + glance.map((g) => '<li>' + g + '</li>').join('') + '</ul>' +
        '${xd}' +
        '<${X} class="snapshot-panel">' +
          '<h5>Utility mix (indicative)</h5>' +
          mixRows.map((r) => (
            '<${X} class="snapshot-mix-row">' +
              '<${X} class="snapshot-mix-label"><span>' + r.label + '</span><strong>' + r.pct + '%</strong>${xd}' +
              '<${X} class="snapshot-mix-track"><${X} class="snapshot-mix-fill" style="width:' + r.pct + '%">${xd}${xd}' +
            '${xd}'
          )).join('') +
        '${xd}' +
        '<${X} class="snapshot-panel">' +
          '<h5>This week · focus</h5>' +
          '<${X} class="snapshot-focus">' + focus + '${xd}' +
          '<ul style="margin-top:10px;">' + ins.actions.slice(0, 2).map((a) => '<li>' + a + '</li>').join('') + '</ul>' +
        '${xd}';
      zone.style.animation = 'none';
      void zone.offsetWidth;
      zone.style.animation = '';
    }
`.replace(/\$\{X\}/g, X).replace(/\$\{xd\}/g, xd);

const start = html.indexOf('    function renderSiteSnapshot(building) {');
const end = html.indexOf('    function renderInsightsTablet(building) {');
if (start >= 0 && end > start) {
  html = html.slice(0, start) + cleanRender + '\n\n' + html.slice(end);
}

if (!html.includes('renderSiteSnapshot(b);')) {
  html = html.replace(
    '      renderInsightsTablet(b);\n    }',
    '      renderInsightsTablet(b);\n      renderSiteSnapshot(b);\n    }'
  );
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Fixed snapshot HTML + JS');
