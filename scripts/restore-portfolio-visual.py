# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")

# Trim duplicate EOF tags
text = text.strip()
while text.endswith("</html>"):
    text = text[:-7].strip()
while text.endswith("</body>"):
    text = text[:-7].strip()
text += "\n</body>\n</html>\n"

OLD_CSS = """  .building-visual-media {
    position: relative;
    margin-top: 4px;
    border-radius: 12px;
    border: 1px solid var(--border);
    min-height: 260px;
    background:
      radial-gradient(circle at 15% 20%, rgba(0,245,130,0.22), transparent 42%),
      radial-gradient(circle at 82% 85%, rgba(34,212,255,0.2), transparent 45%),
      linear-gradient(135deg, #0f1f17 0%, #0d2418 42%, #0a1711 100%);
    background-size: cover;
    background-position: center;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }"""

NEW_CSS = OLD_CSS.replace("padding: 18px;", "padding: 14px;").replace(
    "justify-content: flex-end;", "justify-content: flex-start;"
) + """
  .portfolio-visual-split {
    display: grid;
    grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
    gap: 14px; align-items: stretch; flex: 1; width: 100%; margin-top: 4px; min-height: 220px;
  }
  .portfolio-visual-left { display: flex; flex-direction: column; min-width: 0; gap: 8px; }
  .portfolio-visual-right { display: flex; flex-direction: column; justify-content: flex-end; gap: 10px; min-width: 0; }
  .portfolio-iot-wrap {
    position: relative; min-height: 132px; max-height: 168px; flex: 1 1 auto;
    border-radius: 10px; border: 1px solid rgba(0, 245, 130, 0.15);
    background: rgba(5, 14, 9, 0.35); overflow: hidden;
  }
  .portfolio-profile-label { font-size: 10px; letter-spacing: 0.11em; text-transform: uppercase; color: #6ecfff; margin: 0; }
  .portfolio-profile-card {
    border: 1px solid rgba(56, 212, 255, 0.22); border-radius: 10px; background: rgba(5, 14, 10, 0.5);
    padding: 10px; display: grid; gap: 6px; flex: 1;
  }
  .portfolio-profile-card img { width: 100%; height: 118px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); background: #0a1711; }
  .portfolio-profile-card h4 { margin: 0; font-size: 16px; line-height: 1.25; color: var(--text-primary); }
  .portfolio-profile-card .addr { margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.35; }
  .portfolio-profile-hint {
    margin: 0; font-size: 11px; color: var(--text-muted); line-height: 1.35;
    border: 1px dashed rgba(0, 245, 130, 0.2); border-radius: 6px; padding: 6px 8px; background: rgba(4, 12, 8, 0.35);
  }
  .portfolio-tab.portfolio-tab-site.active {
    border-color: rgba(245, 166, 35, 0.5); color: #ffd49a; background: rgba(245, 166, 35, 0.1);
    box-shadow: 0 0 10px rgba(245, 166, 35, 0.18);
  }"""

OLD_HTML = """          <motion class="portfolio-tab-label">Asset type view</motion>
          <div class="portfolio-tabs" id="portfolioTabs">
            <button type="button" class="portfolio-tab active" data-asset="restaurant">Restaurant</button>
            <button type="button" class="portfolio-tab" data-asset="office">Office</button>
            <button type="button" class="portfolio-tab" data-asset="home">Home</button>
          </div>
          <div class="building-visual-media" id="buildingVisualMedia" data-asset="restaurant">
            <div id="portfolioAssetSurface" class="portfolio-asset-surface" aria-label="Restaurant portfolio visual"></div>
            <div class="portfolio-chip-row">
              <button type="button" class="portfolio-chip chip-electricity" onclick="openUtilityDetail('electricity')">Electricity</button>
              <button type="button" class="portfolio-chip chip-gas" onclick="openUtilityDetail('gas')">Gas</button>
              <button type="button" class="portfolio-chip chip-water" onclick="openUtilityDetail('water')">Water</button>
              <button type="button" class="portfolio-chip chip-equipment" onclick="switchTab('equipment')">Equipment</button>
            </div>
            <button class="building-cta" id="openSiteDetailBtn" type="button" onclick="openSiteDetail()">Open Site Detail</button>
          </motion>"""

OLD_HTML = OLD_HTML.replace("<motion ", "<div ").replace("</motion>", "</div>")

NEW_HTML = """          <div class="portfolio-tab-label">Restaurant sites</div>
          <div class="portfolio-tabs" id="portfolioTabs"></div>
          <div class="building-visual-media" id="buildingVisualMedia" data-asset="restaurant">
            <div class="portfolio-visual-split">
              <aside class="portfolio-visual-left">
                <p class="portfolio-profile-label">Restaurant building profile</p>
                <div class="portfolio-profile-card">
                  <img id="portfolioSiteHeroImg" src="" alt="" />
                  <h4 id="portfolioSiteTitle">Loading\u2026</h4>
                  <p id="portfolioSiteAddr" class="addr"></p>
                  <p class="portfolio-profile-hint">Pick a site above to preview its storefront. Utility chips and gauges below use the shared demo model until fully wired per venue.</p>
                </div>
              </aside>
              <motion class="portfolio-visual-right">
                <div class="portfolio-iot-wrap">
                  <div id="portfolioAssetSurface" class="portfolio-asset-surface" aria-label="Restaurant IoT schematic"></div>
                </div>
                <div class="portfolio-chip-row">
                  <button type="button" class="portfolio-chip chip-electricity" onclick="openUtilityDetail('electricity')">Electricity</button>
                  <button type="button" class="portfolio-chip chip-gas" onclick="openUtilityDetail('gas')">Gas</button>
                  <button type="button" class="portfolio-chip chip-water" onclick="openUtilityDetail('water')">Water</button>
                  <button type="button" class="portfolio-chip chip-equipment" onclick="switchTab('equipment')">Equipment</button>
                </div>
                <button class="building-cta" id="openSiteDetailBtn" type="button" onclick="openSiteDetail()">Open Site Detail</button>
              </div>
            </div>
          </div>"""

NEW_HTML = NEW_HTML.replace("<motion ", "<div ").replace("</motion>", "</motion>")
NEW_HTML = NEW_HTML.replace("</motion>", "</div>")

text = text.replace(OLD_CSS, NEW_CSS, 1)
text = text.replace(
    "background-position: var(--asset-position, left center);",
    "background-position: var(--asset-position, center bottom);",
    1,
)
text = text.replace("transform-origin: center center;", "transform-origin: center bottom;", 1)
text = text.replace(OLD_HTML, NEW_HTML, 1)

PORTFOLIO_JS = open(Path(__file__).parent / "_portfolio_js_snippet.js", encoding="utf-8").read() if (Path(__file__).parent / "_portfolio_js_snippet.js").exists() else ""

# inline JS if snippet missing
if not PORTFOLIO_JS:
    PORTFOLIO_JS = Path(__file__).read_text(encoding="utf-8").split("PORTFOLIO_JS_INLINE = '''")[1].split("'''")[0] if "PORTFOLIO_JS_INLINE" in Path(__file__).read_text(encoding="utf-8") else ""
