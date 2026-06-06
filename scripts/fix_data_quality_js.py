# -*- coding: utf-8 -*-
from pathlib import Path
p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
t = p.read_text(encoding="utf-8")
old = """  panel.innerHTML = rows.map((r) => {
    const fillCls = r.warn ? ' ops-meter-fill--warn' : '';
    const freshAttr = r.fresh ? ' data-ops-fresh="elec" class="ops-fresh-live"' : '';
    const confCls = r.conf ? ' class="compare-good"' : '';
    return (
      '<div class="ops-meter-row">' +
      '<div class="ops-meter-label"><span>' + r.label + '</span><strong' + freshAttr + confCls + '>' + r.value + '</strong></div>' +
      '<div class="ops-meter-track"><motion></div></motion>' +
      '</div>'
    ).replace('<motion>', '</div>');
  }).join('') + '<div><button type="button" id="opsOpenSensorDashboard">Open sensor dashboard →</button></div>';
  panel.innerHTML = panel.innerHTML.replace('<div>', '<div class="ops-link-row">');
  const btn = document.getElementById('opsOpenSensorDashboard');
  if (btn) btn.addEventListener('click', () => openConnectSensors());
}"""

old = old.replace("<motion></div></motion>", "<div></div></motion>").replace("</motion>", "</div>").replace("<motion>", "<div>")
# fix - use exact file content
old = """  panel.innerHTML = rows.map((r) => {
    const fillCls = r.warn ? ' ops-meter-fill--warn' : '';
    const freshAttr = r.fresh ? ' data-ops-fresh="elec" class="ops-fresh-live"' : '';
    const confCls = r.conf ? ' class="compare-good"' : '';
    return (
      '<div class="ops-meter-row">' +
      '<div class="ops-meter-label"><span>' + r.label + '</span><strong' + freshAttr + confCls + '>' + r.value + '</strong></div>' +
      '<div class="ops-meter-track"><div></div></motion>' +
      '</div>'
    ).replace('<div>', '</div>');
  }).join('') + '<div><button type="button" id="opsOpenSensorDashboard">Open sensor dashboard →</button></div>';
  panel.innerHTML = panel.innerHTML.replace('<div>', '<motion class="ops-link-row">');
  const btn = document.getElementById('opsOpenSensorDashboard');
  if (btn) btn.addEventListener('click', () => openConnectSensors());
}"""

# read exact from file between function updateDataQualityPanel and updateAuditTrail
i0 = t.index("function updateDataQualityPanel()")
i1 = t.index("function updateAuditTrail(app)")
block = t[i0:i1]
print(repr(block[400:700]))

new = """function updateDataQualityPanel() {
  const panel = document.getElementById('dataQualityPanel');
  if (!panel) return;
  const plugPct = Math.round((opsLiveState.plugsOnline / opsLiveState.plugsTotal) * 100);
  const rows = [
    { label: 'Electricity freshness', value: formatOpsFreshness(opsLiveState.freshSec), pct: 92, warn: false, fresh: true },
    { label: 'Gas freshness', value: formatOpsFreshness(opsLiveState.freshGasSec), pct: 78, warn: true },
    { label: 'Water freshness', value: formatOpsFreshness(opsLiveState.freshWaterSec), pct: 85, warn: false },
    { label: 'Smart plug online ratio', value: opsLiveState.plugsOnline + '/' + opsLiveState.plugsTotal, pct: plugPct, warn: plugPct < 90 },
    { label: 'Sensor confidence', value: 'High', pct: 96, warn: false, conf: true }
  ];
  panel.innerHTML = rows.map((r) => {
    const fillCls = r.warn ? ' ops-meter-fill--warn' : '';
    const freshAttr = r.fresh ? ' data-ops-fresh="elec" class="ops-fresh-live"' : '';
    const confCls = r.conf ? ' class="compare-good"' : '';
    return (
      '<div class="ops-meter-row">' +
      '<div class="ops-meter-label"><span>' + r.label + '</span><strong' + freshAttr + confCls + '>' + r.value + '</strong></div>' +
      '<div class="ops-meter-track"><div class="ops-meter-fill' + fillCls + '" style="width:' + r.pct + '%"></div></div>' +
      '</div>'
    );
  }).join('') + '<div class="ops-link-row"><button type="button" id="opsOpenSensorDashboard">Open sensor dashboard →</button></motion>';
  const btn = document.getElementById('opsOpenSensorDashboard');
  if (btn) btn.addEventListener('click', () => openConnectSensors());
}

"""
new = new.replace("</motion>", "</div>").replace("<motion ", "<div ")

t = t[:i0] + new + t[i1:]
p.write_text(t, encoding="utf-8")
print("fixed data quality panel")
