# ⚡ Energy Dashboard Skill

**Skill Type:** Dashboard Strategy + Calculation Cohesion  
**Purpose:** Keep dashboard guidance consistent for energy costs, savings, alternatives, and grants  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 📋 Overview

Use this skill when working on:

- `HTMLS GWM GWB/Greenways Interface .html` (main dashboard: gauges, equipment tab with **`EQUIPMENT_PHOTO`** + **`hidden`**, venue merge, Wok Assist + Green Table embeds, company map, hold toolbar, **system status** sidebar, **KPI** / **charts-row-3** styling)
- `HTMLS GWM GWB/Chef 3 W2W .html` (Wok to Walk assistant; offline intel; optional LLM; assistant API client; **`openEventsTicker`** → Amsterdam events ticker)
- `HTMLS GWM GWB/Events Ticker W2W .html` (events + catering ticker; **back** to Wok Assist when opened with `?return=`)
- `HTMLS GWM GWB/Deals.html` (full-page **Deals** shell — Assistant-style layout; iframe → `deals-ticker-hub.html`; sidebar quick links)
- `HTMLS GWM GWB/deals-ticker-hub.html` (consumer **deals hub**: tickers + search; reads `data/deals-feed.json`; run **`npm run build:deals-feed`**; wide **`--hub-max`** + scaled ticker / controls for **`Deals.html`** iframe)
- `HTMLS GWM GWB/water-saving-finder.html` (Water Saving Finder — full page; **`persistCatalog=1`** on alternatives)
- `HTMLS GWM GWB/sustainable_product_deal_finder_portal.html` (Sustainable Product & Deal Finder — auto-saves matches to catalog)
- `data/sustainable-products-catalog.json` (non-marketplace **`sust_*`** catalogue; grants: **`npm run enrich:sustainable-products`**)
- `services/sustainable-products-catalog.js` (load, upsert, **`persistFinderResults`**)
- `docs/SUSTAINABLE-PRODUCTS-DATA-MODEL.md` (three-layer model: marketplace / sustainable / venue)
- `HTMLS GWM GWB/company-map.html` (embedded map; graceful fetch errors)
- `routes/assistant.js` + `services/dashboard-live-service.js` (assistant context, Energy Feed labelling)
- `HTMLS GWM GWB/utility-detail.html` (hero **Live trend / Load distribution / Period comparison** chips: `<button>` toolbar → `scrollIntoView` to trend / breakdown / comparison blocks; **`chip-active`** + `scroll-margin-top` under sticky header)
- `HTMLS GWM GWB/restaurant-equipment-deep-dive.html` (marketplace alternative cards → **Savings projection** popup)
- `HTMLS GWM GWB/equipment-savings-projection.html` (payback / ROI chart UI; `?popup=1` for modal embed)
- `HTMLS GWM GWB/js/savings-projection-model.js` (shared payback math, capex tiers, grant/tax helpers)
- `data/savings-projection-scenarios.json` (illustrative product scenarios for demos / `?scenario=`)
- `HTMLS GWM GWB/savings.html` (savings tour page — **Grants & schemes** + **Savings projections** + **Deals** rail tabs)
- `HTMLS GWM GWB/restaurant-data.html` (whole-building savings projection under site banner)
- `HTMLS GWM GWB/finance-finder-restaurant.html` (restaurant **green finance** finder — grants, BNPL, equipment replacement, green loans, Europe examples)
- `HTMLS GWM GWB/Full Schemes Portal Restaurant.html` (hospitality schemes browser; restaurant Wix backdrop)
- `HTMLS GWM GWB/Full Schemes Portal html.html` (EU-wide schemes portal — original analyst backdrop)
- `schemes.json` (canonical schemes; ~78 rows after May 2026 NL hub batch — run **`node product-grants-integrator.js`** after edits)
- `HTMLS GWM GWB/equipment_intelligence_tool.html`
- `wix-integration/unified-membership-dashboard.html`
- `routes/equipment-intelligence.js`
- `services/equipment-intelligence-service.js` (marketplace grants overlay + **external lane** from **`sustainable-products-catalog.json`**; **`persistCatalog`** / **`runFinderSession`**; decision matrix **`buildExternalDecisionOptions`** with **`impactFactors`** + catalog grants)
- **Venue equipment inventory (real restaurant asset lists):**
  - `data/restaurant-assets/wok-to-walk-equipment-list.json` (tracked slim list)
  - `data/restaurant-assets/README.md` (extract + refresh instructions)
  - `scripts/extract-pptx-text.py` (PPTX → structured JSON; stdlib only)

Goal: ensure all dashboard modules use the same assumptions, units, savings math, and recommendation logic.

Primary reference spec:

- `docs/energy-guidance-core-spec-v1.md`

Safety references:

- `Skills/Systems MD.md`
- `data_protection_system.js`
- `database/protection/PROTECTION_ACTIVE.txt`
- `database/backups/PROTECTION_BACKUP.txt`

---

## 🖥️ Greenways Interface (`HTMLS GWM GWB/Greenways Interface .html`)

**Single-file main buildings energy dashboard.** Treat this as the primary UI when the user says “energy dashboard,” “Greenways dashboard,” or “main dashboard.”

### Preserved working snapshot (on disk)

- **Edit live:** `HTMLS GWM GWB/Greenways Interface .html`
- **Aliases (same content):** `Greenways Interface - Working.html`, `Greenways Interface  - Copy.html`
- **Dated bundle:** `HTMLS GWM GWB/snapshots/working-YYYY-MM-DD/` + `MANIFEST.json`; pointer `snapshots/LATEST-WORKING.txt`
- **Refresh after milestones:** `npm run save:dashboard-snapshot` — also copies `restaurant-data.html`, `restaurant-equipment-deep-dive.html`, `company-map.html`, `Chef 3 W2W .html`, `utility-detail.html`, `deals-ticker-hub.html`
- Details: `docs/dashboard-build-and-learning.md`, `PROJECT-CONTINUITY.md`

### Hosting & data

- Serve over **`http://localhost:4000/...` or deployed origin** — **not `file://`**. Fetches (venue JSON, assistant, equipment merge, company map) expect a real origin.
- Default data connector is **`MockConnector()`** (jittered KPIs). To bind server feed: `dashboardRuntime.useHttpFeed('/api/dashboard/live', token)` in console or boot script.
- Source badge uses **“Energy Feed”** labelling when synthetic (`services/dashboard-live-service.js`); assistant scrubs legacy “Mock Live” strings in `routes/assistant.js`.

### Overview tab

- **Triple semi-circular gauges:** Electricity (green), Water (blue), Gas (orange) — `triple-gauge-row` / `mini-gauge`.
- **Energy Level period row** (under gauges): **Day / Week / Month** are **`<button type="button">`** cards (`data-dashboard-period="today"|"week"|"month"`) — same horizon as top toolbar **Today / Week / Month / Year** via **`setDashboardPeriodRange()`**. **`lastRawDashboardPayload`** lets period changes re-apply **`applyDashboardData`** without refetching. **`scalePayloadForRange`** + **`getPeriodLoadShape()`**: baseline scales by days (7/30/365); totals get small per-utility shape factors so **needle % vs cap** moves between horizons (until real multi-day aggregates replace the illustrative factors). **Reset hold** syncs gauge buttons to **Today**. Selected card: **`.gauge-context-card--selected`** (animation paused on selection). **`#energyLevelCardSub`** subtitle reflects active horizon.
- **Quick actions** card: layered background (`site-detail-signal-hub-bg.png` + `iot_industrial_green_wireframe.svg`); buttons sit above the graphic.
- Toolbar **Live refresh** / **Reset hold** (pause polling + freeze values for review) — **do not** reintroduce “Demo Live” copy unless the user asks.

### Navigation

- **Green Table:** tab in **top bar + left sidebar** (iframe → `Greenways Green Table .html`).
- **Wok Assist:** orange/black nav; embeds **`Chef 3 W2W .html`** (`wok-assist-wrap`, tall iframe, **Open Full Page** / new tab). **Embed mode:** iframe URL includes **`embed=1`** (`syncWokAssistFrameSrc`); Chef sets **`window.GW_EMBEDDED_ASSISTANT`** + **`html.gw-embedded-assistant`** when `window.self !== window.top` or `?embed=1` — hides **← Back to Dashboard** and the main **← Back** strip, and **`backFromWokAssist()`** does not navigate to **`Greenways Interface .html`** inside the iframe (avoids nested full dashboard). **Open Full Page** / new tab omit `embed` so back links still work standalone.
- **Site Detail:** map embed (`company-map.html`) — failed fetch shows **inline message**, not `alert()` (especially under `file://`). **Company map panel** open by default (`expandCompanyMapEmbed` on tab enter). **Quick actions:** **Connect Sensors** → `sensor-dashboard.html?return=…` (`openConnectSensors()`; Site Detail uses `?tab=site-detail` return); **Open Equipment Audit** → equipment deep dive; **Open Company Map** / **Toggle Company Map Panel** as labelled. Scaffold copy lists utility streams, sensor health, alerts, benchmarks (roadmap; sensor page is live preview).
- **Connect Sensors (sidebar + Site Detail):** `HTMLS GWM GWB/sensor-dashboard.html` — demo telemetry floor plan until IQBI/hardware paired; back link respects `?return=`.
- **Utility detail:** `utility-detail.html?type=electricity|gas|water` — sidebar items and portfolio chips use **`openUtilityDetail(type)`** (same query string). KPI row: first three **Electricity / Gas / Water** tiles are **`<a class="kpi-card" href="…">`** (keyboard + middle-click friendly); **Cost Today** remains a plain `<div class="kpi-card">`. Style **`a.kpi-card`** with no underline, inherited colour, **`cursor: pointer`**, **`focus-visible`** ring. Hero chips (**Live trend** / **Load distribution** / **Period comparison**) jump to **`#sectionUtilityTrend`**, **`#sectionUtilityLoad`**, **`#sectionUtilityCompare`**.

### Overview: system status, KPI strip, analytics row, ticker (May 2026)

- **System status** (sidebar, under nav): `updateSystemStatusPanel` + `setSystemStatusIconStates`; fed from `applyDashboardData` / `dashboardRuntime.refreshNow` (error path updates panel too). Sections **Energy & utilities** and **Sensors & equipment** (equipment + damp lines — extend when real sensor API exists). **Ask in Wok Assist** switches to `wok-assist` tab. `prefers-reduced-motion` disables live pulse on the panel.
- **KPI row** (`.kpi-card`): match **energy ticker** card surface — same gradient and border as `content-ops/drafts/energy-ticker/energy-ticker-green-wire.html` (`.ticker-container`), not the near-black system-status fill.
- **Metric typography:** CSS **`--font-clean`** loads **IBM Plex Sans** (Google Fonts) for large KPI values, analytics headline numbers, target chips, and data-quality numerals; main UI stays **Space Grotesk**. **Alert Center** (`.demo-list`) intentionally **not** forced to `--font-clean` so list copy stays on the lighter default stack.
- **Analytics trio** (`.charts-row-3`): Usage Breakdown, 7-Day Trend, AI Insights — **cyan** rim on `.charts-row-3 > .card` (and hover) so they stand out from generic `.card` borders.
- **Energy ticker** embed: `#energyTickerFrame` → `../content-ops/drafts/energy-ticker/energy-ticker-green-wire.html`; collapse state `localStorage` key `dashboardTickerHidden`.
- **Deals hub:** `deals-ticker-hub.html` + generated `data/deals-feed.json` (`npm run build:deals-feed`); seeds in `data/deals-feed-seeds.json`; optional merge from `deals-weekly-input.json`.
- **Portfolio card** (`.building-visual-card` / `.portfolio-visual-split`): **left** = site photo + name/address + dashed hint; **right** = IoT schematic (`.portfolio-iot-wrap` / `#portfolioAssetSurface` → `iot_restaurant_green.svg`) + utility chips + **Open Site Detail**. Site pills = restaurant venues (`initPortfolioVisual`, `portfolioSitesList`). Chips: **`.portfolio-chip-row`** with **`justify-content: center`** under the schematic. Do **not** use `justify-content: flex-end` on **`.portfolio-visual-right`** (pushes schematic to bottom). Avoid capping the photo column with `minmax(…, 300px)` on the split grid — use proportional `fr` columns (~`1.05fr` / `1.45fr`) so the storefront image stays prominent.
- **KPI row (May 2026 refresh):** all four tiles share the **same dark green gradient** as the energy ticker (`#0e2117` → `#0b1a12`); accent only on top edge / icons — not near-black fills.

### Day / night page backdrop (May 2026)

- **File:** `HTMLS GWM GWB/Greenways Interface .html` — building photo layer only; **does not** change ticker, KPI, cards, or feed logic.
- **Layer:** `.greenways-backdrop` (replaces legacy `body::before`); image from **`--page-backdrop-image`** (`../product-placement/Sustainability Round Up/Building Pic/OIP (24).jpeg`).
- **Toggle:** top bar **`.topbar-meta`**, immediately before **Greenways Buildings** badge — `#btnGreenwaysBackdropTheme` (☀ Day Mode / 🌙 Night Mode); same UX labels as **`live-music-hub.html`**.
- **Persistence:** `localStorage` key **`greenways_backdrop_theme`** (`day` | `night`; default **night**). **Separate** from music hub key **`live_music_hub_backdrop_theme`** — do not merge keys across projects.
- **JS:** `initGreenwaysBackdropTheme()` — body class **`gw-backdrop-day`** when day is active.
- **Night (default / current look):** overlay `rgba(5, 14, 9, 0.52)`, opacity `0.48`, `filter: brightness(1.16)`.
- **Day (tuned May 2026):** lighter overlay `rgba(5, 14, 9, 0.28)` → `0.35`, opacity `0.63`, `filter: brightness(1.26) saturate(1.08) contrast(1.03)` — hub-style lift, then user-requested +10% and +7% bumps on top of base day values.
- **Optional backlog:** light glass blur on `.topbar` in day mode (music hub pattern) — not implemented unless user asks.

### Equipment tab (critical wiring)

- **`equipmentGroups`** drives category cards + instance chips. Venue merge: **`mergeWokVenueInventory()`** loads `data/restaurant-assets/wok-to-walk-equipment-list.json` and **appends** rows by `equipmentIntelligenceType` → group (`ovens`, `cold`, `hvac`, `lighting`, `ops`).
- **`EQUIPMENT_PHOTO`** — canonical **Wix static URLs** for on-site kit photos. **`fridge`** must **never** reuse **`wokBurner`** URL (same media caused Fridge to show the wok still).
- **Three woks:** same **`wokBurner`** image + distinct **`photoTint`** overlays; detail panel uses **`#detailPhotoFrame`** / **`#detailPhotoTint`**.
- **`hidden: true`** on an appliance row **excludes** it from chips, counts, savings pipeline, and priority queue (`visibleAppliancesList()`, `resolveApplianceInGroup()`). Use for kit not on site (keep row for future).
- **`wokPhotoForItem()`** maps merged venue **names** → photo URLs; keep **ice-water chiller** patterns **before** generic fridge regex so “Ice Water Chiller” does not pick the fridge asset.
- **`INSTANCE_CHIPS_SCROLL_ALL`:** all instance chips stay in a **horizontal scroll** row (8+ items) — do not cap visible chips at 6 when the user needs every burner/line visible.
- **Zone detail panel:** selected zone uses **`--equip-zone-accent`** from the zone card (e.g. yellow for Wok); **no `scrollIntoView`** on zone select (avoids whole-page jump).
- **Building Equipment command hub (May 2026):** restyled header block; **Restaurant detail** → `restaurant-data.html?return=…&site=…` via **`buildRestaurantDataHref()`** / **`syncRestaurantDataNavLink()`**; keep Savings Pipeline + Reporting data paths.
- **`INSTANCE_CHIPS_MAX = 6`** — legacy constant; prefer horizontal scroll pattern above for dense cooklines.
- Removed **commercial coffee machine** from ops when venue does not have one; prefer **replace** existing row vs duplicate names when the user says equipment matches.
- **Equipment detail — operations intelligence zone** (below comparison horizon): **`.ops-live-zone`** with live banner, four **`.ops-feed-card`** panels (Priority Queue, Anomalies, Action Tasks, Data Quality) + **Audit Trail** hub (scan visual + feed). **`focusEquipmentInDetail()`** + **`bindOpsFeedCard()`**: click row → select appliance + scroll detail; **Ctrl+click** → `restaurant-equipment-deep-dive.html`. **`initOpsLivePulse()`** ticks electricity freshness on Data Quality panel. **`opsOpenSensorDashboard`** → `openConnectSensors()`. Comparison horizon buttons (**Monthly / Annual / 3-Year**) still drive **`updateComparisonCard()`**.

### Deep dive & intelligence (cross-links)

- From equipment detail: **Open Deep Dive** / marketplace links; venue rows → `restaurant-equipment-deep-dive.html?site=wok-to-walk&wok=<slug>` and prefilled **`equipment_intelligence_tool.html`**.
- **`restaurant-equipment-deep-dive.html`:** collapsible **Savings and Research Tips** (e.g. gas wok, HVAC Aeroseal) before Sustainable Alternatives; profile-driven. **Page hero banner** (analyst image): dark **`::after`** veil + crisp **`image-rendering`** on photo. **Wok burners:** inventory uses **three rows** — **`wok-burner-1`**, **`wok-burner-2`**, **`wok-burner-3`** (replacing single **`wok-stove-burner`**); picker shows **one card per burner** (no shared **`data-equip="wok"`** triple). Legacy **`?wok=wok-stove-burner`** maps to **`wok-burner-1`**. **`?equipment=Wok Burner 1`** (name match) selects after JSON load. **`buildWokProfile`** uses slight **kWh** variance per burner slug for distinct readouts until meters are wired.
- **Savings projection (May 2026):** On **marketplace** alternative cards only (when savings are meaningful), **`Savings projection`** opens **`#savingsProjectionModal`** → iframe **`equipment-savings-projection.html?popup=1&embed=1&…`** built by **`buildAlternativeProjectionUrl()`** (baseline/proposed monthly €, capex from **`inferProjectionCapexEur()`**, grants from **`parseGrantDetailsForProjection()`**). Hero **Open savings projection** may still link full page. Escape / backdrop close. Do **not** add full-page or tablet iframe preview on the tour tab — see **`savings.html`** below.
- **Decision matrix — external lane (May 2026):** **`GET /api/equipment-intelligence/decision-matrix`** builds **`externalOptions`** from the **`sust_*`** catalog via **`buildExternalDecisionOptions()`** — passes through **`grants`**, **`imageUrl`**, **`impactFactors`** (wok gas/water % reductions applied to baseline before horizon math). **Wok profiles:** prefer API **`externalOptions`** when matches exist; **`buildWokAccessoryDecisionOptions()`** is **fallback only** when the API returns none.
- **Sustainable alternatives API:** same catalog powers **`/alternatives`** external lane (up to **8** scored rows). Finder pages persist on each search — see **Sustainable products catalog** below.

---

## 🌿 Sustainable products catalog & finder (non-marketplace layer)

**Purpose:** Gas savers, water savers, wok retrofits, and OEM lines **outside** the Greenways marketplace — shared across **Sustainable Product Finder**, **Water Saving Finder**, **equipment deep dive**, and **decision matrix** without re-keying data.

### Core files

| File | Role |
|------|------|
| `data/sustainable-products-catalog.json` | Canonical **`sust_*`** rows (`utilityProfile`, `impactFactors`, `search.keywords`, `finderSessions`) |
| `services/sustainable-products-catalog.js` | **`loadCatalog`**, **`upsertProduct`**, **`persistFinderResults`**, grants via **`combined-grants-loader.js`** |
| `scripts/enrich-sustainable-products-grants.js` | Batch grant checker — **`npm run enrich:sustainable-products`** |
| `services/equipment-intelligence-service.js` | **`loadExternalAlternatives()`**, **`persistFinderCatalogFromQuery`**, **`reloadExternalCatalog()`**, **`mapCountryToGrantsRegion()`** |
| `docs/SUSTAINABLE-PRODUCTS-DATA-MODEL.md` | Marketplace (`etl_*`) + sustainable (`sust_*`) + venue assets + intake queue |

### Auto-save on finder runs

Both finders call alternatives with **`persistCatalog=1`**:

- **`sustainable_product_deal_finder_portal.html`** — `finderSource=sustainable_product_deal_finder`, `country=` from dropdown (mapped to grants region on server).
- **`water-saving-finder.html`** — `finderSource=water_saving_finder`.

Server behaviour (`getAlternatives` when **`persistCatalog`** or **`saveToCatalog`** is `1`):

1. Score and return marketplace + external matches as usual.
2. **Upsert** each matched external row (merge **`search.keywords`**, append **`finderSessions`**, optional grant re-check).
3. If the user query has **no close name match**, add a **Discovery** row (`category: Discovery`, `statsStatus: pending`).
4. **`reloadExternalCatalog()`** so the same request’s in-memory cache matches disk.
5. Response includes **`catalogPersisted: { savedIds, created, updated, total }`** — finder UI shows a **Catalog · N saved** meta tile when present.

**POST** ` /api/equipment-intelligence/finder-session` — same as alternatives + persist (body carries `name`, `type`, utility baselines, `finderSource`, `country`).

**GET/POST** `/api/equipment-intelligence/sustainable-products` — list or manual upsert (also reloads catalog in service).

### Decision matrix & deep dive

- **`buildExternalDecisionOptions`:** if **`impactFactors`** exist (wok ring, burner head, regulator, bowl jet), apply **`gasReductionPct`** / **`waterReductionPct`** to baseline gas/water before **`calculateHorizonCosts`**; else use **`utilityProfile`** absolutes.
- **Intake:** finder **Suggest for Greenways** sends **`catalogId`** / **`sourceId`** from the card’s **`sust_*`** id → **`marketplace-intake-suggestions.json`**.
- **Three catalog layers:** marketplace **`etl_*`**, sustainable **`sust_*`**, venue **`data/restaurant-assets/*.json`** — do not duplicate wok retrofit rows only in deep-dive JS once catalog rows exist.

### Verify (local)

```text
http://localhost:4000/HTMLS%20GWM%20GWB/sustainable_product_deal_finder_portal.html
→ search "wok burner" → meta shows catalog saved; GET decision-matrix for wok → 4 externalOptions with impactFactors
```

---

## 💶 Savings projections (payback / ROI popup)

**Purpose:** Explain **do nothing vs upgrade** running cost, net purchase after grants + illustrative tax, and when cumulative savings cross the payback line. Real numbers come from the **product the user picks** in deep dive / a new project — tour and demos use illustrative scenarios only.

### Core files

| File | Role |
|------|------|
| `HTMLS GWM GWB/js/savings-projection-model.js` | **`buildProjection()`**, chart series (`savingsTowardPayback`, `paybackTarget`), **`snapCapexEur()`** (product tiers to **€25k**; building to **€150k**), grant/tax suggest helpers |
| `HTMLS GWM GWB/equipment-savings-projection.html` | Chart UI, funding sliders; **`?popup=1`** → `body.is-popup` (hides scenario picker when URL product params present); **`?building=1`** for site retrofit mode |
| `data/savings-projection-scenarios.json` | Example rows (`fridge`, `dishwasher`, …) for **`?scenario=`** |
| `restaurant-equipment-deep-dive.html` | Production entry: card button + modal |
| `restaurant-data.html` | Building entry: banner CTA + same modal pattern (**`buildBuildingProjectionUrl()`**) |
| `savings.html` | Tour only: **Explore** rail **Savings projections** (above **Deals**); one button **See example projection** — no full-page link, no `data-toggle-iframe` preview |

### URL params (product / popup)

Common query keys: `popup=1`, `embed=1`, `from=`, `title`, `baselineMonthly`, `proposedMonthly`, `capex`, `grants`, `grantSuggest`, `grantLabel`, `taxPct`, `horizonMonths`, `image`, `return`, `building=1`.

Demo on tour page:

`./equipment-savings-projection.html?popup=1&embed=1&from=savings&scenario=fridge`

Local smoke: `http://localhost:4000/HTMLS%20GWM%20GWB/equipment-savings-projection.html?scenario=fridge`

### Chart semantics (user-facing)

- **Green:** cumulative savings toward payback.
- **Gold line:** net upfront to recover (purchase − grants − illustrative tax).
- **Faint red:** “do nothing” running spend (reference only).
- KPI: **Equipment pays for itself in …** — if payback exceeds horizon, copy should stay honest (long payback is valid math, not a bug).

### Implementation notes

- **`lockProposedFromUrl`:** when savings come from URL/deep dive, do not let the efficiency slider crush proposed monthly below the passed value (extended cap when not locked).
- **Capex slider:** product mode must reach **~€25k** (commercial equipment); use staged tiers from **`savings-projection-model.js`**, not a flat €4k default for large kit.
- **Modal placement:** `#savingsProjectionModal` must live **before** closing `</body>` script listeners (not after `</script>`).
- **Wix images only** in embeds (`static.wixstatic.com`); larger product thumb in popup (~148px).
- **`company-map.html`:** dashboard back is **sidebar only** — do not re-add a duplicate header **Back to dashboard** button.

### Copy pattern (tour / onboarding)

Tell users to press **Savings projection** on a product card when they see it during equipment compare / new project — the savings tour tab is explanatory; example popup uses sample fridge only.

---

## 💶 Restaurant finance finder & schemes portals (May 2026)

**Purpose:** Help restaurant operators discover **grants, BNPL, replacement schemes, green loans, and EU examples** in one Wix-embeddable page, alongside the existing schemes catalogue browsers.

### Core files

| File | Role |
|------|------|
| `HTMLS GWM GWB/finance-finder-restaurant.html` | **Production** page (sync from `Fianance Finder/Finance Finder .html` when editing draft locally) |
| `HTMLS GWM GWB/savings.html` | **Grants & schemes** tablet tab → **Restaurant schemes portal**, **EU schemes**, **Financial assistance** (green button) |
| `HTMLS GWM GWB/Full Schemes Portal Restaurant.html` | Full catalogue UI; restaurant interior backdrop; header CTA → [Business.gov.nl 3-subject finder](https://business.gov.nl/subsidies-and-schemes/?subject=environmental-impact&subject=products-services-and-innovations&subject=international-business) |
| `HTMLS GWM GWB/Full Schemes Portal html.html` | EU / multi-region portal (house/analyst backdrop) — linked as **EU schemes** from savings |
| `schemes.json` | Catalogue source; includes **`nl-business-gov-finder`** + NL Business.gov detail rows |
| `/api/schemes` | Preferred load path for portals (`loadSchemes()` tries API → `../schemes.json` → `./schemes.json`) |

### Finance finder UX (preserve when editing)

- **Backdrop:** `https://static.wixstatic.com/media/c123de_1fe1c58ec83544f0b0eaf57cf9ac4e02~mv2.avif` + dark overlay; **`meta name="wix-html-scroll" content="no-scroll"`**.
- **Header + tab bar:** dark glass (not forest green); **tab icon slots** use subtle glow on all tabs, **stronger gold glow** on **`.tab-btn.active`**.
- **Five tabs:** Grants & Subsidies · Buy Now Pay Later · Equipment Finance · Green Loans · Europe Examples — each runs AI web-search style prompts via in-page **`askClaude()`** (wire to backend proxy if keys must not live client-side).
- **Grants category grid:** Wix photos on subject tiles; each tile has **`.cat-label`**, **`.cat-hint`** (what you might find), **`.cat-example`** (e.g. ISDE, BMKB-Groen); tiles use **lighter grey glass** on **darker `.card`** panel so buttons read distinct from the panel.
- **Tab icons (TODO):** Top tabs still use emoji in **`.tab-icon-slot`** — swap for `<img src="https://static.wixstatic.com/media/…">` same pattern as grants grid when assets are ready.

### Savings page wiring

| Button | Target |
|--------|--------|
| Restaurant schemes portal | `./Full%20Schemes%20Portal%20Restaurant.html` |
| EU schemes | `./Full%20Schemes%20Portal%20html.html` |
| Financial assistance | `./finance-finder-restaurant.html` |

Do **not** re-add the removed **Classic portal backdrop** toggle on savings unless the user asks.

### Schemes data workflow

1. Edit **`schemes.json`** only (not hardcoded portal JSON for new rows).
2. **`node product-grants-integrator.js`** after catalogue changes.
3. Portals pick up new count on refresh (hard-refresh if cached).

### Local URLs

```text
http://localhost:4000/HTMLS%20GWM%20GWB/finance-finder-restaurant.html
http://localhost:4000/HTMLS%20GWM%20GWB/savings.html  → Grants & schemes tab
http://localhost:4000/HTMLS%20GWM%20GWB/Full%20Schemes%20Portal%20Restaurant.html
```

### Adding a grants tile image

```html
<button type="button" class="cat-btn cat-btn--photo" onclick="pickCat('…', this)">
  <span class="icon"><img src="https://static.wixstatic.com/media/…" alt="" loading="lazy" decoding="async" /></span>
  <span class="cat-copy">
    <span class="cat-label">Title</span>
    <span class="cat-hint">Find …</span>
    <span class="cat-example">e.g. …</span>
  </span>
</button>
```

---

## 🤖 Wok assistant & backend (`routes/assistant.js`, `Chef 3 W2W .html`)

- **`POST /api/assistant/ask`**, **`GET /api/assistant/context`** — uses `DashboardLiveService`, optional server LLM (`ASSISTANT_PROVIDER`, `ASSISTANT_API_KEY`, `ASSISTANT_MODEL`), else heuristic answer + **confidence / assumptions / ROI** block.
- **Site-aware bundle (May 2026):** pass **`siteId`** and optional **`companyId`** on ask/context. Server attaches **`siteContext`**: `restaurantProfile` from **`data/assistant-site-profiles.json`** (layered **default → `byCompanyId` → `w2wPortfolio` (when `siteId` matches `w2w-*` / wok) → `bySiteId`**), **`dealsContext`** (ranked **`data/deals-feed.json`**), **`schemesContext`** (NL/EU slice from **`schemes.json`**; size **`ASSISTANT_SCHEMES_MAX`** default **10**, description length **`ASSISTANT_SCHEME_DESC_CHARS`** default **160**). LLM system prompt honours **`priorityUtilities`**.
- **`data/company-map-buildings.json`** may set root **`companyId`** (e.g. `wok-to-walk`); Greenways maps it onto sites and passes **`companyId`** to the Wok iframe / full page (URL **`?companyId=`** overrides when set for embeds).
- Embedded helper resolves API base: **`file://`** → `http://localhost:4000/api/assistant`; same origin otherwise.
- **`Chef 3 W2W .html`:** reads **`?siteId=`** / **`?companyId=`** / **`embed=1`** and sends **`siteId`** / **`companyId`** with **`/ask`**. **`Greenways Interface .html`:** Wok Assist iframe **`#wokAssistFrame`** syncs `src` when the portfolio site changes (always **`embed=1`** in that URL); **Open Full Page** preserves **`siteId`** without forcing embed. **`Wokto Walk Agent .html`** preview iframe loads Chef with **`?embed=1`** so the same back-link rules apply.
- **`OFFLINE_INTEL`** quick replies (events, energy, etc.); **no “demo”** wording in UI status.
- **Events ticker navigation:** `openEventsTicker(section)` opens `Events Ticker W2W .html` with `?return=` (back link) and `?section=events|catering` (scroll to row). Used for quick actions **Upcoming Events** / **Catering Leads**, domain tabs **Events** / **Catering**, and aligned welcome tags — instead of sending those as chat prompts.

---

## 🎯 Trigger Phrases

Activate this skill when user asks about:

- dashboard strategy
- energy savings logic
- recommendation consistency
- calculator cohesion
- bill baseline and horizons
- confidence scoring
- grants + alternatives + ROI flow
- data ingestion readiness
- restaurant/kitchen operational intelligence
- venue equipment list, site inventory, chips + dropdown UX
- Wok To Walk (or similar) asset deck → dashboard tiles
- PPTX extract vs slim JSON in repo
- **Greenways Interface** / main energy dashboard / triple gauges / Quick actions / Site Detail
- **System status** sidebar panel / **KPI strip** matching energy ticker / **charts-row-3** analytics outline / **utility-detail** links from Electricity Gas Water KPI tiles
- **Wok Assist** / `Chef 3 W2W` / `/api/assistant` / built-in intel / Energy Feed / **Events ticker** (`openEventsTicker`, `Events Ticker W2W`) / **iframe embed** (`embed=1`, `GW_EMBEDDED_ASSISTANT`, hide back-to-dashboard in frame)
- **equipment photos** (Wix `EQUIPMENT_PHOTO`), **hidden appliances**, **Fridge vs wok image** wiring
- **Deals hub** / `deals-ticker-hub` / `deals-feed.json` / `build:deals-feed` / hub layout in **`Deals.html`** iframe
- **GWB consumer HTML** typography (Space Grotesk / Plex / JetBrains) under **`HTMLS GWM GWB/`**
- **Savings and Research Tips** (equipment deep dive collapsible)
- **Savings projection** popup / payback chart / `equipment-savings-projection.html` / `savings-projection-model.js`
- **`savings.html`** — **Grants & schemes** tab (portals + **Financial assistance**); **Savings projections** tab (popup-only demo, above **Deals**)
- **`finance-finder-restaurant.html`** — five finance tabs; informative category tiles; dark glass chrome
- **`Full Schemes Portal Restaurant.html`** / **`Full Schemes Portal html.html`** — schemes browsers + Business.gov.nl hub in **`schemes.json`**
- **Sustainable products catalog** / **`sust_*`** / **`persistCatalog`** / finder auto-save / decision matrix external lane
- **`sustainable_product_deal_finder_portal.html`** / **Water Saving Finder** persistence + **`catalogPersisted`**
- **Equipment tab** horizontal instance chips / zone accent / **Restaurant detail** link
- **Portfolio card** photo vs IoT layout recovery (no `flex-end` on right column; no 300px photo cap)

---

## 🏪 Restaurant venue inventory (Wok To Walk pattern)

**Purpose:** Show **real** restaurant equipment on the dashboard (not only demo profiles), with limited on-screen space: **first N items as chips**, **full list in a dropdown**, each row driving **deep dive** and **alternatives** (Greenways marketplace + external via existing APIs).

### Data policy

| Artifact | In Git? | Notes |
|----------|---------|--------|
| Large `.pptx` source (~200 MB) | **No** | `.gitignore`: `data/restaurant-assets/*.pptx`. Keep on Desktop / drive / LFS if needed. |
| Full extract dump `wok-to-walk-assets.json` | **No** | `.gitignore`: `data/restaurant-assets/wok-to-walk-assets.json`. Regenerate locally when needed. |
| **Slim list** `wok-to-walk-equipment-list.json` | **Yes** | ~32 rows, ~few KB per venue batch. Fields: `id`, `name`, `slug`, `utilities[]`, `equipmentIntelligenceType`. |

Refresh slim list from deck: see `data/restaurant-assets/README.md` (Python one-liner after `extract-pptx-text.py`).

### Static serving

Express serves repo root; JSON URL when running locally:

- `http://localhost:4000/data/restaurant-assets/wok-to-walk-equipment-list.json`

Pages use `fetch()` to that path; under `file://`, code falls back to `http://localhost:4000/...` for the JSON (same rule as other API usage—**prefer HTTP + single origin on Render**).

### UI wiring

**`restaurant-equipment-deep-dive.html`**

- Block: **Wok To Walk site equipment** (or label from JSON `label`).
- **6** visible chips (`WOK_SITE.visibleChips`); remaining items in **More equipment** `<select>`.
- On select: `applyWokAsset(item)` → builds dynamic `EQUIPMENT_PROFILES['wok_' + slug]` via `buildWokProfile()` (synthetic KPIs/charts until real per-asset profiles exist).
- Updates URL: `?site=wok-to-walk&wok=<slug>` for bookmarking and handoff. **`?equipment=`** resolves by equipment **name** after list load when **`wok`** URL param absent.
- Existing sections unchanged: **Sustainable alternatives** (`/api/equipment-intelligence/alternatives`), decision matrix, intake shortlist, compare links to `equipment_intelligence_tool.html`.

**`equipment_intelligence_tool.html`**

- Panel: **Wok To Walk — venue equipment** (hidden until JSON loads).
- Same chip + dropdown pattern; **prefills** search fields, sets deep-dive link query, calls **`runSearch()`** after pick.
- Deep dive link pattern: `./restaurant-equipment-deep-dive.html?site=wok-to-walk&wok=<slug>`.

### Styling convention

- Venue quick-picks use **lightning-blue outline** (`rgba(95,180,255,…)`) to sit beside **utility** buttons (green / amber / cyan) without looking identical.

### Future extension

- Replace `buildWokProfile()` synthetic data with **per-slug curated profiles** in `EQUIPMENT_PROFILES` or a separate JSON as real metering and copy become available.
- Reuse the same pattern for other brands: new slim `data/restaurant-assets/<brand>-equipment-list.json` + parallel fetch key or `?site=` discriminator.

---

## ✅ Core Rules

1. **Use one canonical model** for electricity/gas/water units and rates.
2. **Normalize first, calculate second** (never mix units in UI logic).
3. **Return assumptions + confidence** with recommendation outputs.
4. **Keep UI and API aligned** with `energy-guidance-core-spec-v1.md`.
5. **Prefer service-layer math** over duplicated page-level formulas.
6. **Protect calculator-critical paths**; avoid touching legacy calculator flows unless requested.
7. **Venue inventory:** commit only **slim** JSON lists; never commit large `.pptx` or full auto-extract blobs to default Git remote (GitHub ~100 MB file limit).
8. **Equipment photos:** do not reuse **wok still URL** for **Fridge** rows; use **`EQUIPMENT_PHOTO.fridge`** vs **`wokBurner`** explicitly. Prefer **replace** an existing row when the venue already has a logical slot; use **`hidden: true`** instead of deleting rows the site might enable later.
9. **`file://`:** dashboard features that `fetch` must be validated over **`http://localhost:<port>`** or production origin.

---

## 🧮 Calculation Checklist

Before shipping dashboard logic:

- [ ] Rates present or explicit fallback used
- [ ] Units normalized to canonical form
- [ ] Horizon math (`1m`, `6m`, `1y`, `2y`, `10y`) consistent
- [ ] Savings always relative to current baseline
- [ ] Confidence score and reasons included
- [ ] Grant impact displayed only when data is available
- [ ] Venue equipment lists: slim JSON in repo; chips + dropdown if space is tight; deep-dive URL handoff `?site=wok-to-walk&wok=<slug>` (wok burners: **`wok-burner-1|2|3`**); optional **`?equipment=`** name match
- [ ] If editing `Greenways Interface` equipment: **Fridge** image ≠ **wok** image; **`hidden`** appliances excluded from visible list helpers; **Wix** URLs in **`EQUIPMENT_PHOTO`**
- [ ] Finder runs: **`persistCatalog=1`** only on intentional search (both finders wired); catalog file updated without committing test/discovery junk rows
- [ ] Decision matrix external options: **`grants`** + **`impactFactors`** from catalog, not empty grants array
- [ ] Wok deep dive: API **`externalOptions`** before hardcoded **`buildWokAccessoryDecisionOptions`** fallback

---

## 🛡️ Safety Guardrails

Do not run destructive DB operations for dashboard tasks.

If touching data paths:

1. Confirm protection files exist and show `enabled: true`.
2. Avoid delete/reset operations.
3. Keep changes scoped to dashboard/equipment intelligence modules unless explicitly requested.

---

## 🔄 Working Flow

1. Read **`Skills/energy-dashboard-skill.md`** (this file) for Greenways / assistant touchpoints; read `docs/energy-guidance-core-spec-v1.md` for calculation canon.
2. Implement changes in service/route first.
3. Wire UI to consume standardized response fields.
4. Validate with lints and endpoint smoke checks over **HTTP**, not `file://`, when fetch/API behaviour matters.
5. Record learnings in **this skill’s Session Progress Log** and `docs/dashboard-build-and-learning.md` when behaviour changes materially.

---

## Greenways GWB consumer pages (typography & deals shell)

For **`HTMLS GWM GWB/`** dashboard-adjacent HTML (Deals shell, deals hub, energy/water/sustainability portals, savings, event tickers), align with **`Greenways Interface .html`**: **Space Grotesk** (`--font`), **IBM Plex Sans** (`--font-clean` for longer copy), **JetBrains Mono** (`--mono` for labels/badges/technical lines). Reuse the same Google Fonts link pattern when adding or editing those pages.

---

## 📦 Expected Outputs

When this skill is used, provide:

- concise summary of what changed
- assumptions used by calculations
- confidence level behavior
- what remained untouched (for safety)
- quick verification steps

---

## 🗓️ Session Progress Log

### 2026-05-20 — Sustainable products catalog, finder auto-save, decision matrix cohesion

**Greenways Interface (`Greenways Interface .html`)**

- **KPI row:** unified dark green gradient aligned with energy ticker (`#0e2117` → `#0b1a12`); removed near-black card fills.
- **Portfolio card:** photo **left**, IoT schematic + **centered** utility chips **right**; proportional `fr` columns (~60/40 feel); **no** `justify-content: flex-end` on **`.portfolio-visual-right`**; **no** `minmax(…, 300px)` cap on photo column (recovery notes in this skill + **`AGENTS.md`**).
- **Equipment tab:** zone detail uses **`--equip-zone-accent`**; removed page **`scrollIntoView`** on zone select; **horizontal scroll** for all instance chips; **Building Equipment** command hub + **Restaurant detail** → `restaurant-data.html?return=…&site=…`.

**Non-marketplace sustainable layer**

- **`data/sustainable-products-catalog.json`** — seed + runtime catalogue (**`sust_*`**): gas/water savers, wok retrofits (ring, burner head, regulator, bowl jet), legacy external archetypes.
- **`services/sustainable-products-catalog.js`** — **`persistFinderResults`**, **`upsertProduct`** (merge search keywords, **`finderSessions`**, discovery rows), **`attachGrantsToCatalogProduct`**.
- **`scripts/enrich-sustainable-products-grants.js`** + **`npm run enrich:sustainable-products`**.
- **`docs/SUSTAINABLE-PRODUCTS-DATA-MODEL.md`** — three-layer relationships documented.

**Equipment intelligence API**

- **`equipment-intelligence-service.js`:** external lane from catalog (not hardcoded list); **`reloadExternalCatalog()`**; **`persistFinderCatalogFromQuery`** + **`mapCountryToGrantsRegion()`**; **`buildExternalDecisionOptions()`** (grants, images, **`impactFactors`**); **`runFinderSession()`**.
- **Routes:** **`GET /alternatives?persistCatalog=1`**, **`POST /finder-session`**, **`GET/POST /sustainable-products`**.

**Finders & deep dive**

- **`sustainable_product_deal_finder_portal.html`**, **`water-saving-finder.html`:** every search passes **`persistCatalog=1`** + **`finderSource`** + **`country`**; results show **Catalog · N saved** when **`catalogPersisted.total`** > 0; intake button passes **`catalogId`**.
- **`restaurant-equipment-deep-dive.html`:** wok decision matrix uses API **`externalOptions`** when present; hardcoded wok accessory builder is fallback only.

**Agent docs:** **`AGENTS.md`** — API table + learnings for finder → catalog → matrix flow.

**Verify:** `node` smoke or finder search “wok burner” over **`http://localhost:4000`** → **`catalogPersisted`** updates catalog; decision-matrix returns wok externals with **`impactFactors.gasReductionPct`**.

### 2026-05-20 — Restaurant finance finder, schemes portals, savings grants tab

- **`finance-finder-restaurant.html`:** Restaurant backdrop (Wix AVIF); dark glass header/tabs with icon glow (gold when active); five finance tabs; grants grid with Wix category photos + **hint** + **example** copy on every tile; subject buttons lighter grey on dark card panel.
- **`savings.html`:** **Grants & schemes** tab actions — Restaurant schemes portal, EU schemes, **Financial assistance** → finance finder; classic backdrop button removed.
- **`Full Schemes Portal Restaurant.html`:** Hospitality copy + restaurant backdrop; Business.gov.nl header CTA; **`loadSchemes()`** prefers **`/api/schemes`**.
- **`schemes.json`:** **`nl-business-gov-finder`** + NL Business.gov-linked rows; **`node product-grants-integrator.js`** after batch adds.
- **Pending:** Wix images for top tab bar icons (`.tab-icon-slot`); optional Green certification tile image URL.

### 2026-05-16 — Savings projections (popup, model, tour tab)

- **`HTMLS GWM GWB/js/savings-projection-model.js`:** Shared payback math; product capex tiers to **€25k**; building mode to **€150k**; grants + illustrative tax in net upfront; chart series for savings vs payback target.
- **`equipment-savings-projection.html`:** Popup/embed modes; funding panel (grant slider, tax %); payback story + KPI; **`lockProposedFromUrl`** for deep-dive savings params.
- **`restaurant-equipment-deep-dive.html`:** **Savings projection** on marketplace alternative cards → modal iframe; **`buildAlternativeProjectionUrl`**, **`inferProjectionCapexEur`**, **`parseGrantDetailsForProjection`**.
- **`restaurant-data.html`:** Whole-building projection under site €/mo banner; same modal pattern.
- **`savings.html`:** **Savings projections** rail tab above **Deals** — educational copy + **See example projection** only (no full page, no tablet iframe preview unlike Deals).
- **`data/savings-projection-scenarios.json`:** Illustrative scenarios (`fridge`, etc.) for demos.
- **`company-map.html`:** Removed duplicate header back control; sidebar **Back to dashboard** retained.

### 2026-05-28 — Greenways day/night backdrop toggle

- **`Greenways Interface .html`:** `.greenways-backdrop` + **`gw-backdrop-day`**; top-bar **`#btnGreenwaysBackdropTheme`** beside venue badge; **`greenways_backdrop_theme`** in `localStorage`; **`initGreenwaysBackdropTheme()`**.
- **Day tuning:** base hub-style lift, then **+10%** then **+7%** user adjustments → current day values: opacity **0.63**, brightness **1.26**, overlay **0.28 / 0.35**. Night unchanged.
- **Cross-project:** music stack uses **`live_music_hub_backdrop_theme`** on **`live-music-hub.html`** / **`live-music-helper-hub.html`** — see **`Skills/live-music-finder-skill.md`**.

### 2026-05-15 — Energy Level period controls, utility-detail chips, wok burners, grants on intelligence API

- **`Greenways Interface .html`:** Energy Level **Day / Week / Month** cards are interactive buttons; **`setDashboardPeriodRange`**, **`initGaugeContextPeriod`**, **`syncGaugePeriodButtons`**, **`syncTopToolbarPeriod`**, **`lastRawDashboardPayload`**, **`getPeriodLoadShape`**, **`updateEnergyLevelSubtitle`**; top toolbar period buttons use same path (no duplicate refresh-only behaviour).
- **`utility-detail.html`:** Hero **Live trend / Load distribution / Period comparison** wired to section anchors with **`chip-active`** and **`scroll-margin-top`**.
- **`restaurant-equipment-deep-dive.html` + `data/restaurant-assets/wok-to-walk-equipment-list.json`:** Three separate wok burner inventory slugs; picker active state per burner; hero banner darker overlay.
- **`services/equipment-intelligence-service.js`:** Grants overlay from **`products-with-grants-and-collection.json`** (then fallbacks) keyed by **`product.id`** — aligned with **`AGENTS.md`** single-source grants workflow.
- **`AGENTS.md`:** Grants & schemes maintenance + equipment intelligence note (repo truth for agents).

### 2026-05-11 — GWB typography, deals hub scale, Wok Assist iframe embed

- **Typography:** Consumer / Deals ecosystem HTML under **`HTMLS GWM GWB/`** aligned to main dashboard stack: **Space Grotesk** + **IBM Plex Sans** + **JetBrains Mono** (includes **`Deals.html`**, **`deals-ticker-hub.html`**, **`european_energy_deals_portal.html`**, **`water-saving-finder.html`**, **`sustainable_product_deal_finder_portal.html`**, **`savings.html`**, Event Ticker HTMLs — keep new pages on the same tokens).
- **`deals-ticker-hub.html`:** Wider **`--hub-max`** / padding + larger ticker rows, search, pills, spotlight and grid type so the hub fills the **`Deals.html`** iframe more usefully.
- **`savings.html`:** Copy — “advisors” → “you” in the funding / portals sentence.
- **`Chef 3 W2W .html` + `Greenways Interface .html` + `Wokto Walk Agent .html`:** **Embedded assistant** behaviour — **`embed=1`** on dashboard-driven iframe URLs; early **`GW_EMBEDDED_ASSISTANT`** + **`gw-embedded-assistant`** class hides back navigation that would load **`Greenways Interface .html`** inside the child frame; **`backFromWokAssist()`** guarded when embedded.

### 2026-05-13 — Deals hub (ticker + feed build)

- **`data/deals-feed-seeds.json`:** curated consumer-facing deal rows + `highlights` (energy / water / sustainability).
- **`scripts/build-deals-feed.js` + `npm run build:deals-feed`:** writes **`data/deals-feed.json`** (merges **`data/deals-weekly-input.json`** product deals into sustainability lane).
- **`HTMLS GWM GWB/deals-ticker-hub.html`:** three tickers, filters, spotlight cards, links to **`european_energy_deals_portal.html`**, **`water-saving-finder.html`**, **`sustainable_product_deal_finder_portal.html`**.
- **`HTMLS GWM GWB/water-saving-finder.html`:** added from Downloads copy for stable repo paths.

### 2026-05-11 (session) — System status, KPI / ticker alignment, analytics outlines, Wok → Events ticker

- **`Greenways Interface .html`:** Sidebar **System status** panel (utilities + sensors sections, `updateSystemStatusPanel`); **KPI cards** use same surface tokens as `energy-ticker-green-wire.html`; **`.charts-row-3 > .card`** cyan outline + hover for Usage Breakdown / 7-Day Trend / AI Insights.
- **`Chef 3 W2W .html` + `Events Ticker W2W .html`:** `openEventsTicker()` + `?return=` / `?section=` + back bar on ticker when opened from assistant (iframe-safe same-window navigation).

### 2026-05-11 — Utility KPI deep-links + IBM Plex metric font

- **`Greenways Interface .html`:** Electricity, Gas, Water KPI tiles link to **`utility-detail.html?type=`** via **`a.kpi-card`** (aligned with **`openUtilityDetail()`**). **Cost Today** not linked. **`a.kpi-card`** accessibility styling (underline off, focus ring).
- **`Greenways Interface .html`:** **`--font-clean`** → **IBM Plex Sans** for headline metrics / analytics numerals; **Alert Center** list left on default font stack by design.

### 2026-05-11 — Portfolio reshape, trajectory insights, utility assistant styling, and gas-led wok clarity

Completed in this session:

- **`Greenways Interface .html` (portfolio UX reframe):**
  - Portfolio card repositioned to match new narrative (later sessions put **photo left**, **IoT + chips right** — see **Portfolio card** in Overview):
    - ~~left side: IoT schematic + utility chips + CTA / right: site profile~~ (superseded May 2026)
  - Top portfolio pills now represent **restaurant sites** (from mapped sites/fallback) instead of Restaurant/Office/Home asset modes.
  - Added `initPortfolioVisual()` to boot flow after site selector render so tabs/profile hydrate immediately.
  - Site selector now falls back to portfolio fallback sites when mapped-site API is unavailable.
  - Added **Equipment Intelligence** item in left sidebar and tooltip guidance copy (benchmark vs manufacturer standards).
  - Sidebar ordering updated so **Equipment Intelligence** appears after **Trajectory Page**.
  - Tooltip layering/position behavior tuned (z-index + sidebar stacking + alignment control class).

- **`energy-savings-trajectory.html` (new baseline intelligence content):**
  - Added dedicated section explaining why tracking equipment vs baseline reduces expected costs.
  - Added three tablet-style examples:
    - HVAC (investigate),
    - refrigeration (within spec),
    - wok line (check burners).
  - Reordered page sections to flow:
    1) Current vs Potential Levels
    2) Resource Trajectory
    3) Baseline intelligence section.
  - CTA in this section now directs to **equipment deep dive** for benchmark context.

- **`utility-detail.html` (bottom suggestions rail):**
  - Added full-width **“Savings ideas from what we see”** panel at bottom.
  - Implemented electricity-first rule logic:
    - baseline delta signal,
    - top breakdown contributor,
    - peak timing interpretation,
    - efficiency score vs target,
    - non-marketplace lever (tariff/contract angle).
  - Added gas/water preview cards so all three utility pages carry the same section pattern.
  - Restyled this panel and cards with a **glassmorphic, chat-like assistant** visual treatment (semi-transparent surfaces, blur, soft highlights, bubble cards).

- **`restaurant-equipment-deep-dive.html` (gas-focused wok treatment):**
  - Elevated gas relevance for wok/burner profiles in the main KPI/trend/breakdown area (not only long-form tips).
  - Added gas-led detection and helper utilities:
    - `isGasLedWokStation(...)`,
    - indicative conversion constant and helpers for modelled `m³/day` from line totals.
  - For gas-led wok profiles:
    - first KPI tile shows **daily gas (m³ est.)**,
    - trend chart switches to gas-oriented series styling,
    - utility mix labels clarify gas cooking vs electrical aux,
    - breakdown title/subcopy shifts to gas-burn narrative,
    - auxiliary note calls out electrical aux separately.
  - `buildWokProfile(...)` now can emit gas-led metadata and thermal/gas breakdown structure for site-inventory wok assets.

Carry-forward next:

1. Gas and water utility-detail suggestions: upgrade from preview cards to full rule depth parity with electricity.
2. Deep-dive wok gas path: replace indicative conversion assumptions with direct meter/feed linkage when available.
3. Optional: add dual-trend mini visual for gas-led woks (gas m³ + electrical aux kWh) to reduce ambiguity.

### 2026-05-04 (Latest) — Main dashboard, equipment, assistant

- **`Greenways Interface .html`:** Wix **`EQUIPMENT_PHOTO`** for on-site kit; **reordered** cookline to list restaurant-photo items first; **`hidden: true`** on Combi / Convection / Griddle (not on site); **removed** commercial coffee row; **`visibleAppliancesList()`** + **`resolveApplianceInGroup()`** so hidden rows do not appear in chips, counts, or ROI lists; **fixed Fridge** using dedicated fridge glass URL (was wrongly same as wok still); **three woks** share one image + **`photoTint`**; **detail** image uses **`detailPhotoFrame` + `detailPhotoTint`**.
- **Copy:** toolbar **Live refresh** / **Reset hold** (no “Demo Live” phrasing for external demos).
- **Navigation:** **Green Table** restored in **top + left**; **Wok Assist** embeds `Chef%203%20W2W%20.html` with full-page actions.
- **Backend:** `dashboard-live-service` + `routes/assistant.js` use **Energy Feed** labelling; **`scrubLegacyDataSourceLabels`** removes stray “Mock Live” in text; `createMockPayload` sourceLabel **Energy Feed**.
- **`wokPhotoForItem`:** chiller vs fridge **match order** fixed; venue merge photos align with **`EQUIPMENT_PHOTO`**.
- **`company-map.html`:** fetch errors → **inline** message, not `alert()`.
- **This skill** updated so future sessions inherit the above without re-mining chat.

**Verify:** open dashboard over HTTP → Equipment → Fridge shows fridge media, Woks show tints, hidden cookline items absent from chips; optional `GET /api/assistant/context` returns sanitised `sourceLabel`.

### 2026-05-02

**Venue equipment on dashboard (Wok To Walk)**

- Added tracked **`data/restaurant-assets/wok-to-walk-equipment-list.json`** (~32 assets from real venue deck, slim schema).
- **`restaurant-equipment-deep-dive.html`:** site equipment panel — **6 chips + dropdown**, loads list, `applyWokAsset` / `buildWokProfile` / `loadWokInventory`, URL `?site=wok-to-walk&wok=<slug>`, integrates with existing alternatives + matrix flows.
- **`equipment_intelligence_tool.html`:** matching panel — prefill + auto-search + **Deep dive + alternatives** link.
- **`data/restaurant-assets/README.md`:** documents tracked vs gitignored artifacts and how to refresh slim JSON from PPTX using **`scripts/extract-pptx-text.py`**.
- Policy: large **`.pptx`** and full **`wok-to-walk-assets.json`** remain **gitignored**; only extractor + slim list ship in repo.
- Git commit reference (when pushed): `6c03c40` — “Add Wok To Walk venue equipment list to deep dive and intelligence tool (chips + dropdown)”.

**Verify**

1. `node server-new.js` → open deep dive and intelligence tool over `http://localhost:4000/...`.
2. Confirm JSON GET: `/data/restaurant-assets/wok-to-walk-equipment-list.json`.
3. Pick chip → deep dive updates; alternatives API still responds; intelligence tool runs search.

**Carry-forward**

- Per-slug real deep-dive profiles (replace synthetic `buildWokProfile`).
- Confidence badge on deep-dive cards; bill-rate strip + persistence (earlier roadmap).

**2026-05-02 (addendum) — Main dashboard equipment tab**

- `Greenways Interface .html` loads the same slim venue JSON and **appends** rows into `equipmentGroups` by `equipmentIntelligenceType` → group id (`ovens`, `cold`, `hvac`, `lighting`, `ops`).
- Instance bar: **6** `instance-chip` buttons max; overflow in **`#equipInstanceSelect`**; hint when selection is in overflow.
- **Gas Wok Burner** demo photo corrected (was HVAC); **Ice Machine** demo photo corrected; `wokPhotoForItem()` maps names to existing `Product Comparison` / `product-placement` assets; detail image **`onerror`** falls back to generic fridge webp.
- Venue appliance **Open Deep Dive** → `restaurant-equipment-deep-dive.html?site=wok-to-walk&wok=<slug>`; **View Marketplace Option** → prefilled `equipment_intelligence_tool.html` for Wok rows.

**2026-05-02 (addendum) — Restaurants category in map copy**

- Updated `HTMLS GWM GWB/Sustainable Map Copy .html` with a new filter category: **`restaurants`**.
- Added restaurant cards for Wok To Walk Amsterdam sites:
  - Leidsestraat 96
  - Kolksteeg 8
  - Damstraat 44
  - Warmoesstraat 85
  - Reguliersbreestraat 45
- Added `restaurants` option in the add-company modal sector dropdown.
- Added `restaurants` color mapping in `SECTOR_COLORS` for consistent legend/dot rendering.
- Seeded temporary image paths to local building images; ready to swap to Wix static URLs.

**Wix image swap procedure (for this interface)**

1. Upload each restaurant photo to Wix Media Manager.
2. Copy static URL (format like `https://static.wixstatic.com/media/...`).
3. In `Sustainable Map Copy .html`, replace each restaurant `imageUrl` with the Wix URL.
4. Keep a local fallback image only if absolutely needed during draft work.
5. Verify in browser over `http://localhost:4000/...` and in Wix iframe.

**2026-06-05 — Sustainability Map = mobile / map UX reference (one-way copy)**

The **Case Study Finder / Sustainability Map** is the **source** for advanced map UX. **Live Music Finder** is the **target** — copy **from** sustainability **to** `live-music-finder.html`, never the reverse.

| | Sustainability | Live Music venue map |
|--|----------------|----------------------|
| **Working copy** | `Sustainable Map Copy .html` (local, untracked) | `live-music-finder.html` |
| **Production embed** | `European Company - Case Study Finder (Standalone) - Wix bundle.html` | `live-music-hub-render.html` on Render |
| **Deploy** | Re-upload HTML in Wix | Push to GitHub → Render |

**Do not** change the Wix bundle or Sustainable Map Copy when implementing live-music mobile UX unless the user explicitly requests sustainability map changes.

Reference behaviours to port into venue finder: wide mobile layout + horizontal swipe, centred panels, first-load Help, `scrollMapToward*` on pin select, Near Me / topic chips / insight popup when needed. Full runbook: **`Skills/live-music-finder-skill.md`** § Map UX porting.

---

### 2026-05-01

Completed in this session:

- Added a benchmark performance visual module to `HTMLS GWM GWB/equipment_intelligence_tool.html` in the right-side blank area.
- Implemented an **Energy Level gauge card** (dark glass panel, semi-circle arc, needle, center percent, status badge).
- Wired gauge behavior to comparison results from `runCompare()`:
  - `within_benchmark` -> `Normal`
  - `above_benchmark` -> `High`
  - `below_benchmark` -> `Low`
- Added initialization logic so gauge displays benchmark context before user enters actual meter data.
- Refined gauge styling to match the target reference look (thicker arc, stronger glow, larger value, cleaner panel finish).
- Ran lints on the updated file; no linter errors reported.

Carry-forward items for next session:

- Add confidence-band badge in deep-dive recommendation cards.
- Implement deep-dive bill-rate input strip with local persistence.
- Optional visual polish on gauge (micro-animation + end labels) if requested.

Quick resume path:

1. Open `HTMLS GWM GWB/equipment_intelligence_tool.html`.
2. Search for `gauge-card` and `updateBenchmarkGauge`.
3. Verify compare flow by entering `Actual Daily kWh` and clicking `Compare vs Benchmark`.

Additional updates (same day):

- In `HTMLS GWM GWB/restaurant-equipment-deep-dive.html`, added a new CTA button beside utility CTAs:
  - Label: `Open Equipment Intelligence`
  - Style: lightning-blue outlined variant to differentiate from utility buttons while matching theme.
- Wired the new button to the same prefilled intelligence URL used by compare flow (`name`, `brand`, `model`, `type`, `actualDailyKwh`).
- Confirmed prefill behavior works when served via localhost.
- Documented hosting note: API calls fail under `file://`; run via `http://localhost:4000/...` locally and prefer single-origin Render hosting for stable auth/API behavior.
- Applied small spacing fix in water module:
  - Added `.water-range-tabs { margin-top: 8px }`
  - Applied to Interactive Water Comparison range buttons to remove text/button overlap.

Historical checks (many superseded by 2026-05-02 log):

1. Deep-dive CTA row with lightning-blue **Open Equipment Intelligence** button.
2. Water comparison tab spacing (`.water-range-tabs`).
3. Confidence badge + bill-rate strip remain on roadmap.

### 2026-05-11 (Grants data sync) — schemes review and JSON refresh

- Audited grants data consumers and confirmed dual live paths:
  - API/Mongo path via `/api/schemes` and `schemes-admin.html`
  - Static path via direct `schemes.json` fetches in multiple portal/HTML files
- Added review artifact: `GRANTS_REVIEW_2026-05-11.md` to stage approvals before write-through.
- Updated `schemes.json` with approved changes:
  - Added `eu-life-cet-2026` and `uk-warm-homes-plan`
  - Updated UK, IE, NL, DE, FR, and BE entries with 2026 source-backed details
  - Set lifecycle states where relevant (`gbis` expired, `be-brussels-prime` paused, `moves-iii` expiring-soon)
- Validation:
  - `schemes.json` parses successfully
  - Total entries moved from 62 to 64
  - Existing schema shape preserved for legacy/static consumers

Carry-forward next:

1. Optionally align static `schemes.json` and API/Mongo through a controlled import/export bridge so both paths remain consistent.
2. Add a small changelog/date banner in grants-facing HTMLs to show last refresh timestamp.
3. Run one follow-up review cycle for removals after paused/expired entries remain inactive.

### 2026-05-11 (Greenways Interface equipment UX + scheme link-through)

Completed in this session:

- **`HTMLS GWM GWB/Greenways Interface .html` — Building equipment / detail panel**
  - **Block order (UX):** instance chips (+ overflow + “More in this group”) first, then **efficiency score** strip (`scoreEquipment`), then **context link pills**.
  - **Context pills:** savings trajectory, utility detail (inferred gas/water/electricity), equipment intelligence; optional **gold** pills for **Schemes portal** and **EU schemes** when `equipmentHasGrantContext()` matches (capex, category, deep-dive id, venue list, or name heuristics including glasswasher).
  - **Scheme URLs:** `./Full Schemes Portal html.html?q=…` and `../eu-energy-schemes.html?q=…` (equipment name) so portals open with search prefilled.
  - **KPI row:** labels aligned to power load / daily use / monthly cost with `detail-stat-sub` footnotes (`parseKwhFromTodayLabel`, `parseEuroMonthly`).
  - **12-hour mini chart:** larger axis tick fonts, `maxTicksLimit`, tooltip font sizing (Chart.js 4.x).
- **Cross-portal search prefills:** `eu-energy-schemes.html` and `Full Schemes Portal html.html` gained `applySearchFromQueryString()` (reads `?q=` after init, fills `#search-box`, re-renders, switches to All Schemes tab).

Related grants/HTML consumer updates (same day, documented in `Skills/grants-schemes-finder.md`):

- `HTMLS GWM GWB/Visual Schems Savings Window.html` — dynamic schemes from API then `schemes.json`.
- `HTMLS GWM GWB/Electrical Schemes New.html` — same pipeline; keeps brown/grey styling but data-driven grids + summary table.

Carry-forward:

- Confirm which **production** “grey/black” incentives iframe filename is canonical; if not `Electrical Schemes New.html`, mirror the same `loadSchemesData()` pattern there.
- Optional rename: `Visual Schems Savings Window.html` typo → `Visual Schemes Savings Window.html` when links/embeds are updated.

