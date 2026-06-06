const fs = require('fs');
const path = require('path');

const X = 'di' + 'v';
const xd = '</' + X + '>';

const filePath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'company-map.html');
let html = fs.readFileSync(filePath, 'utf8');

const cssBlock = `
    .snapshot-zone {
      margin: 0 14px 14px;
      border: 1px solid rgba(83,184,255,.38);
      background:
        radial-gradient(120% 90% at 0% 0%, rgba(0,245,130,.10), transparent 55%),
        radial-gradient(90% 70% at 100% 100%, rgba(83,184,255,.08), transparent 50%),
        rgba(9, 28, 22, 0.92);
      box-shadow: 0 0 24px rgba(83,184,255,.12), inset 0 0 0 1px rgba(0,245,130,.08);
      animation: snapshotZoneIn .55s ease backwards;
    }
    @keyframes snapshotZoneIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .snapshot-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .snapshot-live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #caffea;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid rgba(0,245,130,.35);
      background: rgba(0,245,130,.10);
    }
    .snapshot-live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 10px rgba(0,245,130,.7);
      animation: snapshotDotPulse 1.8s ease-in-out infinite;
    }
    @keyframes snapshotDotPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(.82); opacity: .55; }
    }
    .snapshot-kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }
    .snapshot-kpi {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px;
      background: rgba(0,0,0,.22);
      animation: snapshotKpiIn .5s ease backwards;
    }
    .snapshot-kpi:nth-child(1) { animation-delay: .04s; }
    .snapshot-kpi:nth-child(2) { animation-delay: .08s; }
    .snapshot-kpi:nth-child(3) { animation-delay: .12s; }
    .snapshot-kpi:nth-child(4) { animation-delay: .16s; }
    @keyframes snapshotKpiIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .snapshot-kpi .k {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--muted);
    }
    .snapshot-kpi .v {
      margin-top: 5px;
      font-size: 22px;
      font-weight: 900;
      color: #dbfff0;
      line-height: 1.1;
    }
    .snapshot-kpi .sub {
      margin-top: 4px;
      font-size: 11px;
      color: #9ad4ff;
    }
    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .snapshot-panel {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px;
      background: rgba(0,0,0,.18);
      min-height: 120px;
    }
    .snapshot-panel h5 {
      margin: 0 0 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #9ad4ff;
      font-weight: 800;
    }
    .snapshot-panel ul {
      margin: 0;
      padding-left: 18px;
      line-height: 1.6;
      color: #d4f7e4;
      font-size: 12px;
    }
    .snapshot-mix-row {
      margin-bottom: 8px;
    }
    .snapshot-mix-row:last-child { margin-bottom: 0; }
    .snapshot-mix-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--muted);
      margin-bottom: 4px;
    }
    .snapshot-mix-label strong { color: #c8ffe2; }
    .snapshot-mix-track {
      height: 8px;
      border-radius: 999px;
      background: rgba(255,255,255,.06);
      overflow: hidden;
    }
    .snapshot-mix-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, rgba(83,184,255,.45), rgba(0,245,130,.55));
      box-shadow: 0 0 12px rgba(0,245,130,.25);
      transition: width .7s ease;
    }
    .snapshot-focus {
      border-left: 3px solid var(--green);
      padding-left: 10px;
      font-size: 13px;
      line-height: 1.55;
      color: #e8fff1;
      animation: snapshotFocusGlow 3s ease-in-out infinite;
    }
    @keyframes snapshotFocusGlow {
      0%, 100% { border-left-color: rgba(0,245,130,.55); }
      50% { border-left-color: rgba(83,184,255,.85); }
    }
    .snapshot-footnote {
      margin: 10px 0 0;
      font-size: 11px;
      color: var(--muted);
      line-height: 1.45;
    }
    @media (max-width: 980px) {
      .snapshot-kpis { grid-template-columns: repeat(2, 1fr); }
      .snapshot-grid { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) {
      .snapshot-zone,
      .snapshot-kpi,
      .snapshot-live-dot,
      .snapshot-focus { animation: none !important; }
    }
`;

if (!html.includes('.snapshot-zone')) {
  html = html.replace('    @media (max-width: 980px) {', cssBlock + '    @media (max-width: 980px) {');
}

html = html.replace(
  'grid-template-rows: auto auto 1fr;',
  'grid-template-rows: auto auto 1fr auto;'
);

const htmlBlock =
  '      <section class="snapshot-zone card tablet" id="siteSnapshotZone" aria-label="High-level restaurant snapshot">' +
  '\n        <' + X + ' class="snapshot-head">' +
  '\n          <' + X + ' class="tablet-title" style="margin:0;">Restaurant snapshot · high level' + xd +
  '\n          <span class="snapshot-live"><span class="snapshot-live-dot" aria-hidden="true"></span> Live preview</span>' +
  '\n        ' + xd +
  '\n        <' + X + ' class="snapshot-kpis" id="snapshotKpis">' + xd +
  '\n        <' + X + ' class="snapshot-grid" id="snapshotGrid">' + xd +
  '\n        <p class="snapshot-footnote" id="snapshotFootnote">High-level view for the selected site — streams from meters, BMS, and Greenways audit when connected.</p>' +
  '\n      </section>\n';

if (!html.includes('id="siteSnapshotZone"')) {
  html = html.replace('      </section>\n    </main>', '      </section>\n' + htmlBlock + '    </main>');
}

const jsBlock = `
    function computeBuildingInsights(building) {
      const e = building.energy || {};
      const sensors = Array.isArray(building.sensors) ? building.sensors : [];
      const hasPowerSensor = sensors.some((s) => /power|electric|meter|kwh|incomer/i.test(s));
      const hasWaterSensor = sensors.some((s) => /water|flow|leak/i.test(s));
      const hasGasSensor = sensors.some((s) => /gas|pressure|burner/i.test(s));
      const powerLoad = safeNum(e.mainPowerKw, 0);
      const elec = safeNum(e.electricityKwhMonth, 0);
      const gas = safeNum(e.gasM3Month, 0);
      const water = safeNum(e.waterM3Month, 0);
      let score = 62;
      if (powerLoad <= 65) score += 8;
      else if (powerLoad >= 85) score -= 8;
      if (elec <= 16000) score += 6; else if (elec >= 19500) score -= 6;
      if (gas <= 850) score += 5; else if (gas >= 1000) score -= 5;
      if (water <= 190) score += 5; else if (water >= 235) score -= 5;
      score += hasPowerSensor ? 6 : -5;
      score += hasWaterSensor ? 4 : -3;
      score += hasGasSensor ? 4 : -3;
      score = Math.max(35, Math.min(96, score));
      const band = score >= 80 ? 'Normal' : (score >= 62 ? 'Watch' : 'Priority');
      const covPower = hasPowerSensor ? 94 : 42;
      const covWater = hasWaterSensor ? 86 : 35;
      const covGas = hasGasSensor ? 82 : 28;
      const actions = [];
      actions.push(elec > 17000 ? 'Trim electrical baseload overnight (target: -8%).' : 'Maintain current electrical schedule and monitor drift.');
      actions.push(water > 200 ? 'Run wash-cycle and leak-check review this week.' : 'Water usage stable; keep weekly leak checks.');
      actions.push(gas > 900 ? 'Tune burner / gas setpoints during prep periods.' : 'Gas line profile is acceptable; validate monthly.');
      const anomalies = [];
      anomalies.push(powerLoad > 80 ? 'Main power draw above preferred band in peak windows.' : 'No major power spikes flagged in baseline profile.');
      anomalies.push(water > 220 ? 'Water trend higher than benchmark for this building type.' : 'Water trend within expected range.');
      anomalies.push(hasGasSensor ? 'Gas sensor telemetry available for anomaly detection.' : 'Gas sensor missing — add for faster fault isolation.');
      const estElecCost = elec * 0.26;
      const estGasCost = gas * 0.09;
      const estWaterCost = water * 2.1;
      const estMonthly = estElecCost + estGasCost + estWaterCost;
      const utilityTotal = Math.max(1, elec + gas * 10 + water * 5);
      const mixElec = Math.round((elec / utilityTotal) * 100);
      const mixGas = Math.round(((gas * 10) / utilityTotal) * 100);
      const mixWater = Math.max(0, 100 - mixElec - mixGas);
      const co2Tonnes = ((elec * 0.21) / 1000).toFixed(1);
      return {
        score, band, powerLoad, elec, gas, water, sensors, hasPowerSensor, hasWaterSensor, hasGasSensor,
        covPower, covWater, covGas, actions, anomalies, estMonthly, mixElec, mixGas, mixWater, co2Tonnes
      };
    }

    function renderSiteSnapshot(building) {
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
        '<' + X + ' class="snapshot-kpi" style="animation-delay:' + (0.04 + i * 0.04) + 's">' +
          '<' + X + ' class="k">' + row.k + xd +
          '<' + X + ' class="v">' + row.v + xd +
          '<' + X + ' class="sub">' + row.sub + xd +
        xd
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
        '<' + X + ' class="snapshot-panel">' +
          '<h5>At a glance</h5><ul>' + glance.map((g) => '<li>' + g + '</li>').join('') + '</ul>' +
        xd +
        '<' + X + ' class="snapshot-panel">' +
          '<h5>Utility mix (indicative)</h5>' +
          mixRows.map((r) => (
            '<' + X + ' class="snapshot-mix-row">' +
              '<' + X + ' class="snapshot-mix-label"><span>' + r.label + '</span><strong>' + r.pct + '%</strong>' + xd +
              '<' + X + ' class="snapshot-mix-track"><' + X + ' class="snapshot-mix-fill" style="width:' + r.pct + '%">' + xd + xd +
            xd
          )).join('') +
        xd +
        '<' + X + ' class="snapshot-panel">' +
          '<h5>This week · focus</h5>' +
          '<' + X + ' class="snapshot-focus">' + focus + xd +
          '<ul style="margin-top:10px;">' + ins.actions.slice(0, 2).map((a) => '<li>' + a + '</li>').join('') + '</ul>' +
        xd;
      zone.style.animation = 'none';
      void zone.offsetWidth;
      zone.style.animation = '';
    }

`;

if (!html.includes('function computeBuildingInsights')) {
  html = html.replace('    function renderInsightsTablet(building) {', jsBlock + '    function renderInsightsTablet(building) {');
}

const newRenderInsights = `    function renderInsightsTablet(building) {
      const ins = computeBuildingInsights(building);
      const bandEl = byId('healthBand');
      bandEl.textContent = ins.band;
      if (ins.band === 'Normal') {
        bandEl.style.borderColor = 'rgba(0,245,130,.45)';
        bandEl.style.background = 'rgba(0,245,130,.14)';
        bandEl.style.color = '#caffea';
      } else if (ins.band === 'Watch') {
        bandEl.style.borderColor = 'rgba(255,202,88,.45)';
        bandEl.style.background = 'rgba(255,202,88,.14)';
        bandEl.style.color = '#ffe8b4';
      } else {
        bandEl.style.borderColor = 'rgba(255,120,120,.45)';
        bandEl.style.background = 'rgba(255,120,120,.16)';
        bandEl.style.color = '#ffd1d1';
      }
      byId('healthScore').textContent = String(ins.score);
      const gaugeDeg = Math.round((ins.score / 100) * 360);
      byId('healthGauge').style.background = \`conic-gradient(var(--green) 0deg, var(--green) \${gaugeDeg}deg, rgba(255,255,255,.08) \${gaugeDeg}deg, rgba(255,255,255,.08) 360deg)\`;
      byId('covPower').style.width = ins.covPower + '%';
      byId('covWater').style.width = ins.covWater + '%';
      byId('covGas').style.width = ins.covGas + '%';
      byId('topActions').innerHTML = ins.actions.map((x) => '<li>' + x + '</li>').join('');
      byId('anomalyList').innerHTML = ins.anomalies.map((x) => '<li>' + x + '</li>').join('');
    }`;

if (html.includes('function renderInsightsTablet(building) {') && html.includes('let score = 62;')) {
  const start = html.indexOf('    function renderInsightsTablet(building) {');
  const end = html.indexOf('    function setImageByUrl() {');
  html = html.slice(0, start) + newRenderInsights + '\n\n' + html.slice(end);
}

if (!html.includes('renderSiteSnapshot(b);')) {
  html = html.replace(
    '      renderInsightsTablet(b);\n    }',
    '      renderInsightsTablet(b);\n      renderSiteSnapshot(b);\n    }'
  );
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Patched company-map snapshot block');
