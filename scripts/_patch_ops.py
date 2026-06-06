# -*- coding: utf-8 -*-
import pathlib

p = pathlib.Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
html = p.read_text(encoding="utf-8")

marker = '        <motion class="stack-grid-2">\n          <motion class="mini-panel">\n            <motion class="mini-title">Priority Queue (ROI)</motion>'
marker = marker.replace("<motion", "<div").replace("</motion>", "</motion>")

marker = """        <div class="stack-grid-2">
          <div class="mini-panel">
            <motion class="mini-title">Priority Queue (ROI)</motion>"""
marker = marker.replace("<motion class", "<div class").replace("</motion>", "</motion>")

# build marker correctly
marker = (
    '        <div class="stack-grid-2">\n'
    '          <div class="mini-panel">\n'
    '            <motion class="mini-title">Priority Queue (ROI)</motion>'
)
marker = marker.replace("motion class", "motion class")  # noop

marker = (
    "        <div class=\"stack-grid-2\">\n"
    "          <div class=\"mini-panel\">\n"
    "            <div class=\"mini-title\">Priority Queue (ROI)</motion>"
)
# FIX
e = "</" + "div>"
marker = (
    "        <motion class=\"stack-grid-2\">\n"
    "          <motion class=\"mini-panel\">\n"
    "            <motion class=\"mini-title\">Priority Queue (ROI)</motion>"
).replace("<motion", "<div").replace("</motion>", e)

end_marker = (
    "        <motion class=\"mini-panel\">\n"
    "          <motion class=\"mini-title\">Audit Trail</motion>\n"
    "          <motion id=\"auditTrailPanel\"></motion>\n"
    "        </motion>\n"
    "      </motion>"
).replace("<motion", "<motion").replace("</motion>", e)

end_marker = (
    '        <div class="mini-panel">\n'
    '          <div class="mini-title">Audit Trail</div>\n'
    '          <div id="auditTrailPanel"></div>\n'
    '        </div>\n'
    '      </motion>\n'
).replace("</motion>", e)

new_block = (
    '        <div class="ops-live-zone" aria-label="Live operations and audit intelligence">\n'
    '          <div class="ops-live-banner">\n'
    '            <span class="ops-live-badge"><span class="pulse-dot" aria-hidden="true"></span> Live lane</span>\n'
    '            <div class="ops-live-banner-copy">\n'
    '              <strong>Operations intelligence — streaming soon</strong>\n'
    '              <p>Priority savings, anomalies, tasks, sensor health, and audit events will populate from smart meters, BMS, and Greenways audit exports. Preview below updates as you explore equipment.</p>\n'
    '            </div>\n'
    '          </div>\n'
    '          <div class="stack-grid-2 ops-panels-row">\n'
    '            <div class="mini-panel mini-panel--live">\n'
    '              <div class="mini-panel-head">\n'
    '                <div class="mini-title">Priority Queue (ROI)</div>\n'
    '                <span class="mini-live-tag">Ranked savings</span>\n'
    '              </div>\n'
    '              <div id="priorityQueue" class="ops-card-list"></motion>\n'
).replace("</motion>", e)

# This is getting messy - write new_block to a file first

new_path = pathlib.Path(__file__).resolve().parent / "_ops_block.html"
new_path.write_text("""        <div class="ops-live-zone" aria-label="Live operations and audit intelligence">
          <div class="ops-live-banner">
            <span class="ops-live-badge"><span class="pulse-dot" aria-hidden="true"></span> Live lane</span>
            <motion class="ops-live-banner-copy">
              <strong>Operations intelligence — streaming soon</strong>
              <p>Priority savings, anomalies, tasks, sensor health, and audit events will populate from smart meters, BMS, and Greenways audit exports. Preview below updates as you explore equipment.</p>
            </motion>
          </motion>
          <div class="stack-grid-2 ops-panels-row">
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Priority Queue (ROI)</div>
                <span class="mini-live-tag">Ranked savings</span>
              </motion>
              <div id="priorityQueue" class="ops-card-list"></motion>
            </motion>
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Top 5 Anomalies Today</div>
                <span class="mini-live-tag">Alert feed</span>
              </motion>
              <div id="alertFeed" class="ops-card-list"></motion>
            </motion>
          </motion>
          <div class="stack-grid-2 ops-panels-row">
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Action Tasks</div>
                <span class="mini-live-tag">Assigned work</span>
              </motion>
              <div id="taskList" class="ops-card-list"></motion>
            </motion>
            <div class="mini-panel mini-panel--live">
              <div class="mini-panel-head">
                <div class="mini-title">Data Quality &amp; Sensor Health</div>
                <span class="mini-live-tag">Telemetry</span>
              </motion>
              <div id="dataQualityPanel"></motion>
            </motion>
          </motion>
          <div class="mini-panel mini-panel--live audit-hub-panel">
            <div class="mini-panel-head">
              <div class="mini-title">Audit Trail</div>
              <span class="mini-live-tag">Governance log</span>
            </motion>
            <div class="audit-hub">
              <div class="audit-visual-wrap" role="img" aria-label="Animated energy audit scan preview">
                <img class="audit-visual-bg" src="./iot_restaurant_green.svg" alt="" width="200" height="160" />
                <div class="audit-scan-beam" aria-hidden="true"></motion>
                <div class="audit-visual-ring" aria-hidden="true"></motion>
                <span class="audit-visual-badge">Audit scan · live preview</span>
              </motion>
              <div class="audit-feed-wrap">
                <p class="audit-feed-intro">Every view, baseline change, and export will appear here for CSRD-ready traceability — tied to the appliance you select.</p>
                <div id="auditTrailPanel" class="audit-feed"></motion>
              </motion>
            </motion>
          </motion>
        </motion>
""".replace("<motion", "<div").replace("</motion>", "</" + "motion>").replace("</motion>", e), encoding="utf-8")

print("wrote fragment - fix manually")
