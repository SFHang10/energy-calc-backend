# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
html = p.read_text(encoding="utf-8")

needle_title = '            <div class="mini-title">Priority Queue (ROI)</motion>'
needle_title = '            <div class="mini-title">Priority Queue (ROI)</div>'
i0 = html.index(needle_title)
i0 = html.rindex('        <div class="stack-grid-2">', 0, i0)
i1 = html.index('        <div style="position:relative;height:120px;display:none" id="detailChart">')

ops = """        <div class="ops-live-zone" aria-label="Live operations and audit intelligence">
          <div class="ops-live-banner">
            <span class="ops-live-badge"><span class="pulse-dot" aria-hidden="true"></span> Live lane</span>
            <div class="ops-live-banner-copy">
              <strong>Operations intelligence — preview mode</strong>
              <p>Priority savings, anomalies, tasks, and sensor health update as you select equipment. Click any row to focus that asset; Ctrl+click opens equipment deep dive.</p>
            </div>
          </motion>
          <div class="stack-grid-2 ops-panels-row">
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Priority Queue (ROI)</div>
                <span class="mini-live-tag">Ranked savings</span>
              </motion>
              <div id="priorityQueue" class="ops-card-list"></div>
            </motion>
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <motion class="mini-title">Top 5 Anomalies Today</motion>
                <span class="mini-live-tag">Alert feed</span>
              </motion>
              <div id="alertFeed" class="ops-card-list"></div>
            </motion>
          </motion>
          <div class="stack-grid-2 ops-panels-row">
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Action Tasks</div>
                <span class="mini-live-tag">Assigned work</span>
              </motion>
              <div id="taskList" class="ops-card-list"></div>
            </motion>
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Data Quality &amp; Sensor Health</div>
                <span class="mini-live-tag">Telemetry</span>
              </motion>
              <div id="dataQualityPanel"></div>
            </motion>
          </motion>
          <div class="mini-panel mini-panel--live audit-hub-panel">
            <motion class="mini-panel-head">
              <div class="mini-title">Audit Trail</div>
              <span class="mini-live-tag">Governance log</span>
            </motion>
            <div class="audit-hub">
              <div class="audit-visual-wrap" role="img" aria-label="Animated energy audit scan preview">
                <img class="audit-visual-bg" src="./iot_restaurant_green.svg" alt="" width="200" height="160" />
                <div class="audit-scan-beam" aria-hidden="true"></div>
                <div class="audit-visual-ring" aria-hidden="true"></div>
                <span class="audit-visual-badge">Audit scan · live preview</span>
              </motion>
              <div class="audit-feed-wrap">
                <p class="audit-feed-intro">Every view, baseline change, and export appears here for CSRD-ready traceability — tied to the appliance you select.</p>
                <div id="auditTrailPanel" class="audit-feed"></div>
              </motion>
            </motion>
          </motion>
        </motion>
"""

ops = ops.replace("<motion", "<div").replace("</motion>", "</div>")

html = html[:i0] + ops + "\n" + html[i1:]
p.write_text(html, encoding="utf-8")
print("ops html block ok", i0, i1)
