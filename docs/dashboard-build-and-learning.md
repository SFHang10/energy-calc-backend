# Dashboard Build & Learning Guide

Use this document as the operational guide for the Greenways dashboard ecosystem when chat history is unavailable.

## Scope

This guide covers:

- `HTMLS GWM GWB/Greenways Interface .html` (main buildings dashboard)
- `HTMLS GWM GWB/utility-detail.html` (dedicated Electricity/Gas/Water views)
- `HTMLS GWM GWB/restaurant-equipment-deep-dive.html` (independent equipment deep dive module)
- `HTMLS GWM GWB/equipment_intelligence_tool.html` (equipment benchmark + compare module)
- `wix-integration/unified-membership-dashboard.html` (member surface + saved comparisons)
- `wix-integration/member-product-deep-dive.html` (legacy member deep-dive with context banner)

## High-Level Architecture

### Frontend modules

1. Main dashboard (`Greenways Interface`) provides:
   - top-level energy KPIs
   - utility chips and navigation
   - route into site detail and equipment audit
   - **Energy Level** card: **Day / Week / Month** context buttons drive the same **`currentPeriodRange`** as the top toolbar; gauges recompute from cached live payload (**`lastRawDashboardPayload`**) with period scaling (**`scalePayloadForRange`** + **`getPeriodLoadShape`**) so needles move between horizons until real multi-day aggregates ship

2. Utility detail page provides dedicated utility intelligence per stream:
   - electricity-only/gas-only/water-only view
   - trend + breakdown + levers + period comparison
   - **hero chips** (Live trend / Load distribution / Period comparison) scroll to anchored sections (`#sectionUtilityTrend`, etc.) with active chip state

3. Equipment deep dive page provides:
   - profile cards (fridge/freezer/dishwasher/custom) and **Wok To Walk venue inventory** (chips + dropdown; **one picker card per wok burner** via slugs `wok-burner-1` … `wok-burner-3`)
   - per-equipment performance section
   - comparison handoff to equipment intelligence

4. Equipment intelligence module provides:
   - equipment lookup by name/brand/model/type
   - benchmark comparison (`actualDailyKwh` vs expected range)
   - recommendation links to deep dive module
   - save comparison support

### Backend modules

1. `GET /api/dashboard/live` in `routes/dashboard-live.js`
   - provider-driven live data adapter contract

2. `GET /api/equipment-intelligence/search` in `routes/equipment-intelligence.js`
   - normalized benchmark lookup

3. `GET /api/equipment-intelligence/compare` in `routes/equipment-intelligence.js`
   - actual-vs-benchmark analysis

4. `GET /api/equipment-intelligence/alternatives` (and related routes in `routes/equipment-intelligence.js`)
   - marketplace alternative rows; **`services/equipment-intelligence-service.js`** merges per-product **`grants`** from **`products-with-grants-and-collection.json`** (fallback chain) by **`product.id`**, aligned with **`/api/product-widget`** — refresh via **`node product-grants-integrator.js`** after **`schemes.json`** edits (see **`AGENTS.md`**)

5. Saved items endpoint
   - `/api/members/saved-items/products`
   - used to persist comparison links and other product saves

## Data and state conventions

- Hero photo persistence key:
  - `greenwaysDashboardHeroPhoto`
- Custom equipment deep-dive persistence key:
  - `restaurantEquipmentDeepDiveCustomProfile`
- Saved local fallback key:
  - `gw_saved_products`
- Utility button color convention (must remain consistent):
  - Electricity = green
  - Gas = amber/orange
  - Water = blue

## Current known flow

1. User enters or selects equipment in `equipment_intelligence_tool.html`.
2. Module runs search + compare.
3. User opens suggested deep dive link.
4. Link lands on `restaurant-equipment-deep-dive.html` with context parameters:
   - `source=equipment-intelligence`
   - `productId`
   - `actualDailyKwh`
   - `benchmarkMin`
   - `benchmarkMax`
   - `status`
   - `excessAnnualKwh`
5. Deep dive shows context banner and allows further utility drilldown.

## Always-Learning Loop (Operational)

After each dashboard-related task, append an entry in the learning log section below.

### Required loop

1. Record change made.
2. Record issue found (if any).
3. Record root cause.
4. Record fix applied.
5. Record prevention rule for next time.
6. Record verification step and outcome.

## Preserved working snapshot (on disk)

Use when chat/session history is lost or you need to roll back UI work without git.

| What | Path |
|------|------|
| **Live file (edit here)** | `HTMLS GWM GWB/Greenways Interface .html` |
| **Working aliases** | `Greenways Interface - Working.html`, `Greenways Interface  - Copy.html` |
| **Dated bundle** | `HTMLS GWM GWB/snapshots/working-YYYY-MM-DD/` |
| **Latest pointer** | `HTMLS GWM GWB/snapshots/LATEST-WORKING.txt` |
| **Refresh** | `npm run save:dashboard-snapshot` |

Each snapshot folder includes `MANIFEST.json` (file list + sha256). Bundle also copies `restaurant-data.html`, `restaurant-equipment-deep-dive.html`, `company-map.html`, `Chef 3 W2W .html`, `utility-detail.html`, `deals-ticker-hub.html`.

**Serve over HTTP** (`http://localhost:4000/...`) — not `file://` — so fetches and deep dive return links behave correctly.

---

## Error & Learning Log

Add newest entries at the top.

### 2026-05-17 - Equipment detail ops zone (interactive)

- **Change:** Restored **`.ops-live-zone`** under equipment comparison: card-style Priority Queue / Anomalies / Tasks, meter bars on Data Quality, animated Audit hub; rows are clickable (`focusEquipmentInDetail`, Ctrl+click → deep dive).
- **Issue:** Skills documented ops panels but live HTML was plain `mini-row` list without click handlers; patch scripts had not been applied after UTF-8 recovery.
- **Fix:** CSS + HTML block + JS (`patch_ops_html_block.py`, `_ops_js_interactive.js`); document in **`energy-dashboard-skill.md`** Equipment tab section.
- **Verification:** Equipment tab → click “Wok Burner 1” in Priority Queue → detail panel updates; Ctrl+click → deep dive with return; electricity freshness ticks.

### 2026-05-17 - On-disk working snapshot + equipment / deep dive restoration

- **Change:** Saved preserved working copies and dated snapshot bundle; restored equipment zone cards (restaurant-data style), Site Detail company map open by default, unified `buildRestaurantEquipmentDeepDiveHref()` across dashboard + restaurant-data.
- **Issue:** Session loss risk; deep dive buttons intercepted or pointed at legacy Product Deep Dive; old Copy.html lagged main dashboard.
- **Root cause:** No single refreshable snapshot workflow; `preventDefault` on zone cards; inconsistent URL builders.
- **Fix:** `npm run save:dashboard-snapshot`; aliases `Greenways Interface - Working.html` / `- Copy.html`; snapshot under `HTMLS GWM GWB/snapshots/`; deep dive href helper + natural `<a>` navigation on zone cards.
- **Prevention rule:** After a milestone (equipment tab, Site Detail, deep dive pass), run `npm run save:dashboard-snapshot`; keep editing only `Greenways Interface .html` unless intentionally restoring from `snapshots/working-*`.
- **Verification:** `LATEST-WORKING.txt` points at today’s folder; Working.html byte size matches main; equipment zone click opens `restaurant-equipment-deep-dive.html`; Site Detail shows embedded map on load.

### 2026-05-15 - Energy Level period UX, utility-detail section chips, wok inventory slugs, grants on equipment intelligence

- **Change:** Wired **Energy Level** Day/Week/Month cards and top **Today/Week/Month/Year** toolbar to one **`currentPeriodRange`** path; cached **`lastRawDashboardPayload`** so period switches re-apply **`applyDashboardData`** without a new feed fetch; **`scalePayloadForRange`** + **`getPeriodLoadShape`** so gauge % vs baseline cap changes between horizons (illustrative until real aggregates). **`utility-detail.html`** hero chips scroll to trend / breakdown / comparison sections. **`wok-to-walk-equipment-list.json`**: three burner rows (**`wok-burner-1`…`3`**); deep dive picker one active card per burner; legacy **`?wok=wok-stove-burner`** → burner 1; **`?equipment=`** name match after JSON load; hero banner darker overlay. **`equipment-intelligence-service.js`**: merge **`products-with-grants*.json`** grants by **`product.id`**. **`AGENTS.md`** updated for grants maintenance workflow.
- **Issue:** Gauge context row and utility hero labels looked interactive but did nothing; all three wok picker tiles shared **`data-equip="wok"`**; multiplying totals and baseline by the same period factor left needles unchanged; marketplace alternatives could show different grants than the widget if only **`FULL-DATABASE`** was used.
- **Root cause:** Decorative markup; single static wok profile key reused; **`scalePayloadForRange`** symmetry; intelligence service did not load enriched grants export.
- **Fix:** Buttons + **`setDashboardPeriodRange`** / sync helpers; distinct inventory slugs + **`buildWokProfile`** kWh tweak per slug; asymmetric scale + shape factors for multi-day view; overlay map in service; docs in **`AGENTS.md`** and **`Skills/energy-dashboard-skill.md`**.
- **Prevention rule:** Any “period” or “view mode” control should share one state object with the charts it claims to drive; one physical asset → one stable **`slug`** in venue JSON; after **`schemes.json`** edits run **`product-grants-integrator.js`** before expecting grant chips in deep dive / intelligence APIs to match portals.
- **Verification:** Over HTTP: toggle Energy Level Day vs Week vs Month → needles and readouts shift; toolbar selection stays in sync; utility-detail chips jump to correct blocks; deep dive selects Wok Burner 1 vs 2 vs 3 independently; **`GET /api/equipment-intelligence/alternatives`** returns grant arrays consistent with enriched catalog when overlay file is present.

### 2026-04-30 - Site Detail hero placement and Open Site Detail reliability

- **Change:** Site Detail card uses industrial wireframe SVG as hero; Open Site Detail wired for reliable navigation.
- **Issue:** Hero felt awkward oversized at top; tab switch sometimes missed if only inline `onclick` binding failed.
- **Root cause:** Default top hero layout and single binding path for tab control.
- **Fix:** Placed hero at bottom of Site Detail card with constrained max height and `object-fit: contain`; added `id="openSiteDetailBtn"` and a `DOMContentLoaded` listener fallback alongside `openSiteDetail()`.
- **Prevention rule:** Tab-opening controls that users rely on should have explicit element `id` + deferred JS binding as backup to inline handlers.
- **Verification:** Open Site Detail from main view → Site Detail tab active; hero visible and not dominating the card.

### 2026-04-29 - Deep dive and utility module rollout

- **Change:** Created standalone utility pages and independent equipment deep dive module.
- **Issue:** Hero image reset after navigating back from utility pages.
- **Root cause:** Uploaded hero image was not persisted across page loads.
- **Fix:** Persisted hero image in local storage (`greenwaysDashboardHeroPhoto`) and auto-restored on load.
- **Prevention rule:** Any user-uploaded display asset in dashboard modules must include save+restore logic.
- **Verification:** Upload image -> navigate to utility page -> return -> image remains.

### 2026-04-29 - Comparison handoff inconsistency

- **Change:** Built comparison links from equipment intelligence to deep dive.
- **Issue:** Some links still pointed to legacy member deep-dive path.
- **Root cause:** Old URL generator remained in `equipment_intelligence_tool.html`.
- **Fix:** Repointed link generators to `restaurant-equipment-deep-dive.html` with context params.
- **Prevention rule:** When introducing new module entrypoint, run global link audit for old path references.
- **Verification:** Open recommendation deep dive link -> lands in standalone deep dive page with context banner.

## Quick validation checklist (run after edits)

- Main dashboard loads and utility chips navigate correctly.
- **Energy Level:** Day / Week / Month buttons and top period toolbar stay in sync; gauge needles and **`… / … kWh|m³`** readouts change when switching period (with live or mock payload loaded once).
- Electricity/Gas/Water utility pages show consistent button colors; **hero chips** scroll to trend, breakdown, and comparison sections.
- Equipment deep dive equipment-switching updates KPIs/charts/compare link; **Wok Burner 1/2/3** select independently; **`?equipment=`** resolves when used.
- Custom profile can be saved and restored after refresh.
- Compare handoff banner appears when opened via equipment intelligence.
- Saved comparison appears in membership dashboard block.

