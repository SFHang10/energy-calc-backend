# ⚡ Energy Dashboard Skill

**Skill Type:** Dashboard Strategy + Calculation Cohesion  
**Purpose:** Keep dashboard guidance consistent for energy costs, savings, alternatives, and grants  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 📋 Overview

Use this skill when working on:

- `HTMLS GWM GWB/Greenways Interface .html` (equipment grid merges **`wok-to-walk-equipment-list.json`** into category groups; chips + “More in this group” dropdown when a group exceeds **6** items; venue rows use `restaurant-equipment-deep-dive` + `equipment_intelligence_tool` links)
- `HTMLS GWM GWB/utility-detail.html`
- `HTMLS GWM GWB/restaurant-equipment-deep-dive.html`
- `HTMLS GWM GWB/equipment_intelligence_tool.html`
- `wix-integration/unified-membership-dashboard.html`
- `routes/equipment-intelligence.js`
- `services/equipment-intelligence-service.js`
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
- Updates URL: `?site=wok-to-walk&wok=<slug>` for bookmarking and handoff.
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

---

## 🧮 Calculation Checklist

Before shipping dashboard logic:

- [ ] Rates present or explicit fallback used
- [ ] Units normalized to canonical form
- [ ] Horizon math (`1m`, `6m`, `1y`, `2y`, `10y`) consistent
- [ ] Savings always relative to current baseline
- [ ] Confidence score and reasons included
- [ ] Grant impact displayed only when data is available
- [ ] Venue equipment lists: slim JSON in repo; chips + dropdown if space is tight; deep-dive URL handoff `?site=wok-to-walk&wok=<slug>`

---

## 🛡️ Safety Guardrails

Do not run destructive DB operations for dashboard tasks.

If touching data paths:

1. Confirm protection files exist and show `enabled: true`.
2. Avoid delete/reset operations.
3. Keep changes scoped to dashboard/equipment intelligence modules unless explicitly requested.

---

## 🔄 Working Flow

1. Read `docs/energy-guidance-core-spec-v1.md`.
2. Implement changes in service/route first.
3. Wire UI to consume standardized response fields.
4. Validate with lints and endpoint smoke checks.
5. Record learnings in continuity docs when material changes are made.

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

### 2026-05-02 (Latest)

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

