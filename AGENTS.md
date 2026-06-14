# AGENTS.md - Project-Wide Learnings & Conventions

**Purpose:** Central knowledge base for AI agents working on this project  
**Updated By:** Ralph iterations and Continuous Learning Protocol  
**Last Updated:** 28 May 2026

---

## 🏗️ Project Overview

**Project:** Energy Calculator Backend & Greenways Market Integration  
**Stack:** Node.js, Express, SQLite/MongoDB, Wix, HTML/CSS/JS  
**Deployment:** Render (https://energy-calc-backend.onrender.com)

### Greenways Transition Agents (built — May 2026)

**Seven client-facing chat specialists** on Wix — refer by **character name**, not only slug. **Skills** (`Skills/`) are capabilities that power them; route via **`Skills/SKILL-ORCHESTRATOR.md`**.

| Name | Role | Slug |
|------|------|------|
| **Andrieus** | Grants & schemes | `grants-agent` |
| **Vincent** | Finance, prices & payback | `finance-agent` |
| **Artemis** | Equipment & renovation | `equipment-agent` |
| **Zara** | Deals & spotlights | `deals-agent` |
| **Cheryce** | News & media | `media-agent` |
| **Zyanne** | Sustainable products | `sustainable-products-agent` |
| **Edwardo** | Systems & equipment — monitoring, sensors, dashboards | `systems-agent` |

**Roster + skills map:** `Skills/greenways-transition-agents.md` · **Roadmap:** `Skills/greenways-agents-roadmap.md` · **Go-live:** `Skills/greenways-agents-go-live.md` · **UI/API:** `Skills/greenways-chat-interface-skill.md` · **Wix:** `HTMLS GWM GWB/WIX-GREENWAYS-AGENTS-EMBED.md`

---

## 📂 Key File Locations

| Type | Location |
|------|----------|
| **Server** | `server-new.js` |
| **Routes** | `routes/` |
| **Database** | `database/energy_calculator_central.db` |
| **Product Data** | `FULL-DATABASE-5554.json` |
| **Products with Grants** | `products-with-grants.json` (integrator output, repo root) and `energy-calculator/products-with-grants.json` (mirror if used) |
| **Products with Collection** | `products-with-grants-and-collection.json` (preferred for widget / API merge) and `energy-calculator/` copy if present |
| **Products Deep Dive** | `energy-calculator/products-deep-dive.json` |
| **Non-marketplace sustainable catalog** | `data/sustainable-products-catalog.json` ⭐ (`sust_*` ids; grants: `npm run enrich:sustainable-products`) |
| **Marketplace intake queue** | `data/marketplace-intake-suggestions.json` (“Suggest for Greenways” workflow) |
| **Venue equipment (per site)** | `data/restaurant-assets/*.json` (e.g. `wok-to-walk-equipment-list.json`) |
| **Deep Dive Content** | `deep-dive-content.json` |
| **Member Profile Page** | `wix-integration/member-profile.html` |
| **Member Uploads** | `uploads/members/` |
| **Grants System (Combined)** | `combined-grants-loader.js` ⭐ (62+ grants) |
| **Grants System (Hardcoded)** | `hardcoded-grants-system.js` (46 grants) |
| **Grants & schemes (edit this)** | `schemes.json` ⭐ canonical scheme rows; **`combined-grants-loader.js`** + **`product-grants-integrator.js`** turn them into per-product grants |
| **Product Images** | `product-placement/` |
| **HTML Pages** | `HTMLs/` |
| **Live Music Finder (Wix embed)** | `HTMLS GWM GWB/live-music-hub-render.html` — **Render Version**; see `HTMLS GWM GWB/WIX-LIVE-MUSIC-EMBED.md` |
| **Greenways dashboard (buildings)** | `HTMLS GWM GWB/Greenways Interface .html` |
| **Utility detail (Elec / Gas / Water)** | `HTMLS GWM GWB/utility-detail.html` (`?type=electricity|gas|water`) |
| **Energy prices ticker (embed)** | `content-ops/drafts/energy-ticker/energy-ticker-green-wire.html` |
| **Wok Assist (embedded)** | `HTMLS GWM GWB/Chef 3 W2W .html` |
| **Amsterdam events ticker** | `HTMLS GWM GWB/Events Ticker W2W .html` |
| **Deals (full page shell)** | `HTMLS GWM GWB/Deals.html` |
| **Deals hub (ticker + search)** | `HTMLS GWM GWB/deals-ticker-hub.html` |
| **Deals feed (generated)** | `data/deals-feed.json` ← `npm run build:deals-feed` (`data/deals-feed-seeds.json` + `data/deals-weekly-input.json`) |
| **Water Saving Finder** | `HTMLS GWM GWB/water-saving-finder.html` |
| **Savings tour page** | `HTMLS GWM GWB/savings.html` — Grants tab: Restaurant portal, EU schemes, **Financial assistance** |
| **Restaurant finance finder** | `HTMLS GWM GWB/finance-finder-restaurant.html` (draft: `Fianance Finder/Finance Finder .html`) |
| **Grants Agent (chat)** | `HTMLS GWM GWB/greenways-grants-agent.html` — `/greenways/grants-agent`, `/api/grants-agent/*` ⭐ clone pattern: `Skills/greenways-chat-interface-skill.md` |
| **Finance Agent (chat)** | `HTMLS GWM GWB/greenways-finance-agent.html` — gold theme — funding **+ energy prices** (ticker, upgrade case, tariff compare) — `/greenways/finance-agent`, `/api/finance-agent/*` |
| **Equipment Agent (chat)** | `HTMLS GWM GWB/greenways-equipment-agent.html` — green theme — equipment upgrades **+ premises renovation** (insulation, retrofit, project plans) — `/greenways/equipment-agent`, `/api/equipment-agent/*` |
| **Deals Agent (chat)** | `HTMLS GWM GWB/greenways-deals-agent.html` — cyan/orange theme — `/greenways/deals-agent`, `/api/deals-agent/*` — full shell: `Deals.html`, tariffs: `european_energy_deals_portal.html` |
| **Media Agent (chat)** | `HTMLS GWM GWB/greenways-media-agent.html` — purple theme — `/greenways/media-agent`, `/api/media-agent/*` — news: `services/media-news-loader.js` (KB + monthly editions); **sustainability map:** `services/media-agent-companies.js` + `data/companies.json` → `European Company - Case Study Finder (Standalone) - Wix bundle.html`; videos: Wix Media API |
| **Sustainable Products Agent (chat)** | `HTMLS GWM GWB/greenways-sustainable-products-agent.html` — cyan/teal theme — `/greenways/sustainable-products-agent`, `/api/sustainable-products-agent/*` — water/electricity/gas lanes; lightweight catalog + showcase (full search on finder pages) |
| **Systems Agent (chat)** | `HTMLS GWM GWB/greenways-systems-agent.html` — slate/amber — `/greenways/systems-agent`, `/api/systems-agent/*` — **consumer:** monitoring, sensors, product reviews (home/restaurant); **ops:** read-only health verify + **Verify selected** |
| **Greenways Guide (chat, WIP)** | Hub conductor — backend only: `data/guide-agent-intents.json`, `data/guide-agent-roster.json`, `services/guide-agent-knowledge.js`, `routes/guide-agent.js` — **not live** until `greenways-guide-agent.html` + `server-new.js` mount (`/greenways/guide-agent`, `/api/guide-agent/*`) |
| **Wix agents embed (hub + per-page)** | `Skills/greenways-chat-interface-skill.md` § Wix site pattern · quick ref `HTMLS GWM GWB/WIX-GREENWAYS-AGENTS-EMBED.md` — hub may embed Guide conductor; each character page = one `/greenways/{agent}` iframe |
| **Grants Agent intents** | `data/grants-agent-intents.json` |
| **Grants Agent showcase products** | `data/grants-agent-showcase-products.json` |
| **Schemes portal (restaurant)** | `HTMLS GWM GWB/Full Schemes Portal Restaurant.html` |
| **Schemes portal (EU)** | `HTMLS GWM GWB/Full Schemes Portal html.html` |
| **Savings projection UI** | `HTMLS GWM GWB/equipment-savings-projection.html` |
| **Savings projection math** | `HTMLS GWM GWB/js/savings-projection-model.js` |
| **Projection demo scenarios** | `data/savings-projection-scenarios.json` |
| **Greenways Transition Agents (roster)** | `Skills/greenways-transition-agents.md` ⭐ names, built vs backlog, skill→agent homes |
| **Skills** | `Skills/` · orchestrator: `Skills/SKILL-ORCHESTRATOR.md` |
| **Skills backend automation (reference)** | `Skills/skills-backend-automation.md` · SkillBoss: `docs/reference/skillboss-evaluation.md` |
| **Live music discovery (auto-fill)** | `Skills/live-music-discovery-scout.md` — venue + event + media candidate queues → `npm run merge:music-discovery` |
| **PRD Tasks** | `tasks/` |

---

## 🎯 Coding Conventions

### Word choice — equipment (not kit)

Use **equipment** in agent copy, skills, and Greenways UI prose. Do **not** use **kit** as shorthand for appliances or upgrades.

**Exception:** keep **kit** only in official **product names** from suppliers (e.g. “Extended kit 8.5kW”, “tap aerator kit”).

---

### JavaScript/Node.js

```javascript
// Use async/await, not callbacks
const data = await fetchData();

// Use const by default, let when needed
const products = [];
let counter = 0;

// Error handling with try/catch
try {
  const result = await api.call();
} catch (error) {
  console.error('API error:', error);
}
```

### CSS Patterns

```css
/* Use variables for colors */
:root {
  --primary-green: #28a745;
  --primary-blue: #007bff;
  --dark-bg: #1a2332;
}

/* Raised card effect */
.card {
  box-shadow: 0 12px 40px rgba(0,0,0,0.25), 
              0 6px 16px rgba(0,0,0,0.15), 
              0 2px 6px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* Sharp images */
img {
  object-fit: contain;
  image-rendering: crisp-edges;
}
```

### HTML Structure

```html
<!-- Always include Wix no-scroll meta -->
<meta name="wix-html-scroll" content="no-scroll">

<!-- Use Wix static URLs for images -->
<img src="https://static.wixstatic.com/media/...">

<!-- Use Euro emoji, not dollar -->
💶💷 (not 💰💵)
```

---

## ⚠️ Critical Gotchas

### 1. Wix Image URLs
- **NEVER** use local paths in Wix embeds
- **ALWAYS** upload to Wix Media Manager first
- Use format: `https://static.wixstatic.com/media/[id]~mv2.[ext]`

### 2. Wix Iframe Scrolling
- Add `<meta name="wix-html-scroll" content="no-scroll">`
- Set iframe height to match content (not larger)
- Use `overflow-x: hidden` on all containers

### 3. Product IDs
- ETL products use format: `etl_[category]_[number]` (e.g., `etl_21_29475`)
- Always verify product exists before linking
- Test URL: `/product-page-v2-marketplace.html?product=[ID]&fromPopup=true`

### 4. Database
- Primary: SQLite (`database/energy_calculator_central.db`)
- Check `USE_MONGODB` env var on Render if using MongoDB
- Products table must exist before API calls

### 5. Deployment
- Push to GitHub → Render auto-deploys
- Wait 2-3 minutes for deployment
- Always verify at health endpoint: `/health`

---

## 🔧 Common Fixes

### Blurry Images
```css
img {
  object-fit: contain;
  image-rendering: crisp-edges;
  image-rendering: -webkit-optimize-contrast;
}
```

### Iframe Content Cut Off
```css
html, body {
  height: auto;
  overflow-x: hidden;
}
```

### Product Link Not Working
1. Verify product ID exists in API
2. Check format: `?product=etl_XX_XXXXX&fromPopup=true`
3. Wait for Render deployment if just pushed

### MCP Not Working
1. Run `setup-mcp.bat`
2. Restart Cursor completely
3. Start new conversation

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server status |
| `/api/products` | GET | All products |
| `/api/shop-products` | GET | Products with shop categories |
| `/api/product-widget/:id` | GET | Single product |
| `/api/schemes` | GET | Grants & schemes |
| `/api/grants-agent/ask` | POST | Grants Agent — knowledge / heuristic / optional LLM |
| `/api/grants-agent/samples` | GET | Grant-eligible product showcase cards |
| `/api/grants-agent/compare` | POST | Side-by-side scheme comparison (2 scheme ids) |
| `/api/finance-agent/ask` | POST | Finance Agent — BNPL, loans, equipment finance & energy price context |
| `/api/finance-agent/samples` | GET | Finance & product showcase cards |
| `/api/equipment-agent/ask` | POST | Equipment Agent — marketplace, deep dive & renovation |
| `/api/equipment-agent/samples` | GET | Equipment showcase cards |
| `/api/deals-agent/ask` | POST | Deals Agent — energy tariffs/packages, water, sustainability feed |
| `/api/deals-agent/samples` | GET | Deal showcase cards with images |
| `/api/media-agent/ask` | POST | Media Agent — news, Wix videos, photos |
| `/api/media-agent/samples` | GET | News/video/photo showcase cards |
| `/api/media-agent/videos` | GET | Public Wix video list (no member auth) |
| `/api/media-agent/news` | GET | Full news catalogue (`?q=`, `?category=`, `?edition=`) |
| `/api/sustainable-products-agent/ask` | POST | Sustainable Products Agent — water / electricity / gas finder |
| `/api/sustainable-products-agent/samples` | GET | Product showcase cards (`?lane=water|electricity|gas`) |
| `/api/systems-agent/status` | GET | Full read-only health report |
| `/api/systems-agent/sync` | POST | Verify selected checks `{ checks: ["grants","products",…] }` — no scripts run |
| `/api/systems-agent/ask` | POST | Systems Agent chat |
| `/api/equipment-intelligence/alternatives` | GET | Marketplace + external (`sust_*`) sustainable alternatives; `?persistCatalog=1` auto-saves matches to catalog |
| `/api/equipment-intelligence/finder-session` | POST | Same as alternatives + persist (Sustainable Product Finder runs) |
| `/api/equipment-intelligence/sustainable-products` | GET/POST | List or upsert non-marketplace catalog rows |

---

## 🎨 Design System

### Colors
- **Primary Green:** `#28a745`
- **Primary Blue:** `#007bff`
- **Dark Background:** `#1a2332`
- **Gold Accent:** `#c9a961`

### Fonts
- Primary: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Headings: `'Poppins', sans-serif`

### Shadows
- Light: `0 4px 20px rgba(0,0,0,0.1)`
- Raised: `0 12px 40px rgba(0,0,0,0.25), 0 6px 16px rgba(0,0,0,0.15)`
- Glossy: Add `backdrop-filter: blur(1px)`

---

## 📝 Patterns Discovered

### Vibrant Header Images
```css
.header::before {
  background: linear-gradient(to bottom,
    rgba(0,0,0,0.15) 0%,
    rgba(0,0,0,0.45) 100%
  );
}
.header {
  filter: saturate(1.15) contrast(1.05);
}
```

### Section Border Colors
- Technical Info: `border: 3px solid #28a745` (green)
- Product Benefits: `border: 3px solid #007bff` (blue)

### Tab Glow Effect
```css
.tab-btn {
  animation: tabPulse 3s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
}
```

---

## 🔄 Workflows

### Adding New Product (⚠️ MANDATORY WORKFLOW)

**IMPORTANT:** All products MUST go through grants enrichment!

1. **Validate product data** - Ensure category/subcategory match grants mapping
2. **Run grants enrichment** - `node product-grants-integrator.js`
   - Matches product to grants by category/subcategory (from `schemes.json` via `combined-grants-loader.js`)
   - Adds collection agencies for recycling/trade-in
   - Exports to repo-root `products-with-grants.json`; refresh `products-with-grants-and-collection.json` when you rely on that bundle
3. **Add image** to `product-placement/`
4. **Commit and push** to GitHub
5. **Verify on Render** - Check `/api/product-widget/:id` shows grants data

**Never Skip:** Grants enrichment ensures customers see available funding!

### Grants & schemes — single source of truth (ongoing updates)

1. **Edit schemes only in `schemes.json`** — add, update, or retire schemes (regions, keywords, deadlines, links). This is the catalogue you maintain as policies change.
2. **Regenerate product-side data** — `node product-grants-integrator.js` refreshes **`products-with-grants.json`** (repo root). If you use the collection bundle, merge or regenerate **`products-with-grants-and-collection.json`** so it stays in step (widget and API code prefer that file when present).
3. **Runtime behaviour** — `/api/product-widget/...` and **`services/equipment-intelligence-service.js`** (restaurant equipment deep dive / `/api/equipment-intelligence/*`) attach grants from that enriched export **by `product.id`**, with **`FULL-DATABASE-5554.json`** as product spec baseline. Keep the export fresh after `schemes.json` changes so marketplace, widget, and deep dive stay aligned.
4. **`grants-to-add.json`** — legacy / helper format; new work should land in **`schemes.json`** so **`combined-grants-loader.js`** sees it. Use `HOW-TO-ADD-MORE-GRANTS.md` and related docs for narrative workflow.

### Creating HTML Page
1. Upload images to Wix Media Manager
2. Get static URLs
3. Create HTML with Wix no-scroll meta
4. Test locally
5. Commit and push
6. Embed in Wix iframe

### Running Ralph
1. Create PRD in `tasks/`
2. Say "Start Ralph loop for [feature]"
3. Execute stories iteratively
4. Update progress.txt
5. Complete when all pass

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `WIX-SCROLL-FIX.md` | Iframe scrolling solutions |
| `MCP-SETUP-GUIDE.md` | Wix MCP setup |
| `PROJECT_ARCHITECTURE_OVERVIEW.md` | System architecture |
| `Skills/SKILL-ORCHESTRATOR.md` | Task routing |
| `Skills/RALPH-INTEGRATION.md` | Autonomous feature deployment |
| `Skills/product-addition-workflow.md` | ⚠️ Product grants enrichment (MANDATORY) |
| `GRANTS_OVERLAY_SYSTEM_DOCUMENTATION.md` | Grants system details |
| `HOW-TO-ADD-MORE-GRANTS.md` | Adding new grants |

---

## 🧠 Learnings Log

### January 2026

- **Wix no-scroll fix**: Meta tag + CSS + proper iframe height
- **Product links**: Must use actual ETL IDs from database
- **Glossy headers**: Radial gradient + backdrop-filter
- **Raised cards**: 3-layer box-shadow + transform
- **Section grouping**: Color-coded borders (green/blue)
- **⚠️ Product Grants Workflow**: ALL new products MUST go through grants enrichment
  - Run `product-grants-integrator.js` before adding to marketplace
  - Hardcoded grants preferred over API calls (instant loading, offline support)
  - Products-with-grants.json contains full enriched product data
  - Collection agencies added for recycling/trade-in options

- **🔍 Product Deep Dive Workflow**:
  - Deep dive data is prebuilt and merged into products
  - Use `deep-dive-content.json` for curated information
  - Run `product-deep-dive-builder.js` to generate `products-deep-dive.json`

- **👥 Member Profile Workflow**:
  - Profile data stored in members DB (display name, bio, photos)
  - Uploads stored under `uploads/members/`
  - Profile page uses `/api/members/profile` and `/api/members/profile/upload`

- **🏛️ Grants System Upgrade (Jan 14, 2026)**:
  - **IMPORTANT**: System now uses 62+ grants (previously only 46)
  - Source of truth: `schemes.json` (62 grants)
  - Combined loader: `combined-grants-loader.js` (merges schemes.json + hardcoded)
  - Old system: `hardcoded-grants-system.js` (46 grants - still works but fewer grants)
  - Regions covered: UK, Ireland, Netherlands, Germany, France, Belgium, Spain, Portugal + EU-wide
  - Grant types: subsidies, grants, certifications, tax incentives
  - **Always use `combined-grants-loader.js`** for full grant coverage

- **🔎 Sustainable Product Finder → catalog (May 2026)**:
  - **`sustainable_product_deal_finder_portal.html`** and **`water-saving-finder.html`** call **`/api/equipment-intelligence/alternatives?persistCatalog=1`** so each search upserts matches into **`data/sustainable-products-catalog.json`** (merged search keywords + optional discovery row for unmatched queries).
  - **`GET /api/equipment-intelligence/decision-matrix`** external lane uses the same catalog with **`impactFactors`** (wok gas/water %) and scheme-backed **`grants`** on `externalOptions`; deep dive wok profiles prefer API rows over hardcoded fallback when matches exist.

- **📌 Grants ↔ deep dive / intelligence (May 2026)**:
  - **`services/equipment-intelligence-service.js`** loads the same **`products-with-grants*.json`** overlay (prefer root **`products-with-grants-and-collection.json`**, then `energy-calculator/` mirrors, then grants-only JSON) so alternative rows and decision-matrix grant chips match the scheme-backed enrichment from `product-grants-integrator.js`, not only `FULL-DATABASE-5554.json` grant fields.

- **👥 Membership Video Integration (Jan 2026)**:
  - MongoDB router needed Wix video integration parity with SQLite router
  - Wix videos require Render env vars: `WIX_APP_TOKEN` (or `WIX_APP_ID`/`WIX_APP_SECRET`/`WIX_INSTANCE_ID`) + `WIX_SITE_ID`
  - Preferences API should return interest objects `{ id, name }` for UI compatibility

- **🖥️ Greenways overview UI (May 2026)** — `HTMLS GWM GWB/Greenways Interface .html`:
  - **System status** (left sidebar): `updateSystemStatusPanel()` from `applyDashboardData` and on feed error from `dashboardRuntime.refreshNow`; pill states Live / Hold / Feed issue / Syncing; **Energy & utilities** + **Sensors & equipment** sections (sensor lines are placeholder copy until real connectivity payloads exist).
  - **KPI cards** (`.kpi-card`): same card chrome as the top **energy ticker** embed (`energy-ticker-green-wire.html`): gradient `#0e2117` → `#0b1a12`, border `rgba(75, 140, 104, 0.22)`, shadow aligned with ticker container.
  - **Utility KPI links**: the first three KPI tiles (Electricity, Gas, Water) are `<a class="kpi-card" href="utility-detail.html?type=…">` — same `type` values as `openUtilityDetail()` and sidebar nav. **Cost Today** stays a non-link `<div>`. Use `a.kpi-card` CSS (no underline, inherit colour, focus ring).
  - **Metric typography**: CSS variable `--font-clean` loads **IBM Plex Sans** (Google Fonts) for large headline metrics, analytics values, target chips, and data-quality numerals; **Space Grotesk** remains the main UI font; **Alert Center** list (`.demo-list`) is intentionally not switched to `--font-clean` so it stays the lighter sans stack.
  - **Analytics row** (Usage Breakdown · 7-Day Trend · AI Insights): `.charts-row-3 > .card` uses a **cyan** outline (`rgba(34, 212, 255, …)`) so those three cards read distinct from default `.card` borders and from KPI / system-status styling.
  - **Energy ticker** iframe: `../content-ops/drafts/energy-ticker/energy-ticker-green-wire.html` (see `initEnergyTickerToggle`).
  - **Portfolio card:** photo + site copy **left**; IoT schematic + centered utility chips + **Open Site Detail** **right** (`portfolio-visual-split`, `portfolio-chip-row`). Recovery note: avoid `flex-end` on `portfolio-visual-right` and a 300px max on the photo column — see **`Skills/energy-dashboard-skill.md`** § 2026-05-16 recovery.
  - **Day / night backdrop (May 2026):** `.greenways-backdrop` + top-bar ☀/🌙 toggle (`#btnGreenwaysBackdropTheme`) beside **Greenways Buildings**; `localStorage` **`greenways_backdrop_theme`** (`day`|`night`, default night). Day: opacity **0.63**, brightness **1.26**, lighter green overlay — tuned +10% then +7% after initial hub-style lift. Night = prior look. **Not** shared with music hub key **`live_music_hub_backdrop_theme`**. Detail: **`Skills/energy-dashboard-skill.md`** § Day / night page backdrop.

- **🎪 Wok Assist → Events ticker (May 2026)**:
  - **`Chef 3 W2W .html`:** `openEventsTicker('events'|'catering')` navigates to `./Events%20Ticker%20W2W%20.html?return=Chef+3+W2W+.html&section=…` (quick buttons, Events/Catering domain tabs, matching welcome tags). Works inside the dashboard iframe (same iframe) or full page.
  - **`Events Ticker W2W .html`:** fixed **Back to Wok Assist** bar when `?return=` is present; optional `section=` scrolls to `#ticker-row-events` / `#ticker-row-catering`.

- **🇳🇱 Business.gov.nl hub (May 2026)**:
  - **`schemes.json`:** `nl-business-gov-finder` (priority resource) links the 3-subject finder: environmental impact + products/innovation + international business (~80 schemes). Plus NL rows for MIA/Vamil, Horizon Europe, WBSO, BMKB-Groen, DEI+, SPRILA, Flex-e, WIS, MIT, DGGF, DTIF, VEKI, Innovation box — each with `business.gov.nl/subsidies-and-schemes/...` detail URLs.
  - **Schemes portals:** `Full Schemes Portal Restaurant.html` and `Full Schemes Portal html.html` — header CTA to the same finder URL; `loadSchemes()` tries `/api/schemes`, then `../schemes.json`.
  - **Finance finder:** `finance-finder-restaurant.html` — five tabs (grants, BNPL, equipment, loans, Europe); grants tiles with Wix photos + hint + example; dark glass UI. **`savings.html`** Grants tab → **Financial assistance**. Full agent detail: **`Skills/energy-dashboard-skill.md`** § Restaurant finance finder & schemes portals.

- **🏷️ Deals hub (May 2026)**:
  - **`HTMLS GWM GWB/deals-ticker-hub.html`:** three marquee lanes (energy / water / sustainability) + manual search + category pills + spotlight cards; loads **`/data/deals-feed.json`** (or `../data/deals-feed.json`).
  - **`npm run build:deals-feed`:** runs `scripts/build-deals-feed.js` — merges **`data/deals-feed-seeds.json`** with product rows from **`data/deals-weekly-input.json`** and writes **`data/deals-feed.json`** (set `meta.generatedAt`). Schedule daily on host if desired.
  - **`HTMLS GWM GWB/water-saving-finder.html`:** full-page Water Saving Finder (synced from project workflow; was `water-saving-finder_1.html` in Downloads).

- **🤖 Greenways Transition Agents — named roster (May 2026)**:
  - **Built:** Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo — shared turn UI, portraits (`AGENT_PROFILE`), `/greenways/{slug}`, Wix embeds.
  - **Agents ≠ skills:** Skills are capabilities; declare **consumer home(s)** (often shared across agents), optional **Primary** (who to ask first), and **Administrator** where staff-only — see **`Skills/greenways-transition-agents.md`** § Shared skills.
  - **Wix gotchas:** absolute paths for `greenways-agent-turn-ui.css/js` on `/greenways/*`; broken inline JS silences entire agent page.
  - **Backlog:** Guide hub conductor; deeper `blocks[]` copy for Zara/Cheryce/Zyanne; dashboard lazy-load tabs.

- **💬 Greenways Chat Interface — foundation (May 2026)** — full spec **`Skills/greenways-chat-interface-skill.md`** (pilot: **Andrieus**):
  - **UI:** `greenways-grants-agent.html` — blue theme; **split turn layout** (friendly intro left, scheme/link/stat tablets + *Things to be aware of* right) via shared `HTMLS GWM GWB/js/greenways-agent-turn-ui.js` + `.css` — **same module wired on all seven chat agents** (Grants, Finance, Equipment, Deals, Media, Sustainable Products; Systems uses assets where applicable).
  - **API:** `routes/grants-agent.js` — `POST /ask`, `GET /samples`, `POST /compare`; knowledge in `services/grants-agent-knowledge.js` from **`schemes.json`** + product grants overlay.
  - **Clone:** fork HTML + intents + knowledge + routes — do not one-off new layouts. Sibling: Music Guide (`live-music-guide.html`).
  - **Deploy:** push to Render for live `/api/grants-agent/*`; HTML includes static product fallback until API is live.
  - **Compare dock:** collapsed by default; expands when schemes selected.
  - **Right panel sidebar (Jun 2026):** default agents — **Ask about** first, **Quick links** second (`greenways-agent-sidebar.css`). **Exception:** **Edwardo** (`systems-agent`) keeps ops-first layout (verify → links → ask). Detail: **`Skills/greenways-chat-interface-skill.md`** § Right panel sidebar order.
  - **Vincent Product Calculator (Jun 2026):** Display as **Product Calculator** (Greenways compare tool; ETL-listed products are one input lane — not an ETL-owned calculator). Module id `etl-calculator` unchanged for links.

- **🏷️ Deals Agent — energy tariffs + products (May 2026):**
  - **Intents:** `tariff_compare`, `nl_restaurant_energy`, `uk_green_tariff`, `green_tariff`, `deals_page` in `data/deals-agent-intents.json`.
  - **Knowledge:** `services/deals-agent-knowledge.js` — energy rows link to **`european_energy_deals_portal.html`**; full shell **`Deals.html`**.
  - **Banner:** default showcase = three **energy-lane** feed rows (EU compare, NL hospitality, UK green) — not product ETL cards.
  - **UI:** `greenways-deals-agent.html` — sidebar **Full Deals page** first; welcome tags for compare / NL / UK green.

- **💶 Savings projections (May 2026)** — full detail in **`Skills/energy-dashboard-skill.md`** § Savings projections:
  - **`js/savings-projection-model.js`** + **`equipment-savings-projection.html`:** payback chart (do nothing vs upgrade, grants, illustrative tax, capex to €25k product / €150k building).
  - **`restaurant-equipment-deep-dive.html`:** **Savings projection** on marketplace alternative cards → modal iframe (`?popup=1&embed=1`).
  - **`restaurant-data.html`:** whole-building projection under site banner; same modal.
  - **`savings.html`:** **Savings projections** Explore tab above **Deals** — explains feature; **See example projection** opens popup only (no full-page / no tablet preview).
  - Demos: **`data/savings-projection-scenarios.json`** (`?scenario=fridge`).

- **🎼 Greenways Guide Agent — hub conductor (May 2026, WIP)** — **`Skills/greenways-chat-interface-skill.md`** § Guide Agent:
  - **Role:** Wix agents **hub** orchestrator — routes questions to Grants / Finance / Equipment / Products / Deals / Media; returns answer + **`agentHandoffs`** chips to `/greenways/{agent}?q=…`.
  - **Done:** `data/guide-agent-intents.json`, `data/guide-agent-roster.json`, `services/guide-agent-knowledge.js`, `routes/guide-agent.js`.
  - **Pending:** `HTMLS GWM GWB/greenways-guide-agent.html`, register in **`server-new.js`**, add to **`systems-agent-health.js`** agent list. Scaffold helper: **`scripts/scaffold-guide-agent-html.js`** (manual HTML fork also fine).
  - **Not mounted** on Render until server registration — safe to leave for a later session.

- **🎙️ Agent persona + voice (May 2026)** — `services/greenways-agent-persona.js` + `data/grants-agent-voice.json` (Andrieus pilot: openers, rotated tips, profile line, Cheryce handoff lines). **`spokenSummary`** on grants `/ask` for TTS. Shared **`greenways-agent-voice.js`** on all seven HTML shells; enable per agent in **`data/greenways-agent-voice-config.json`**. Sync: **`node scripts/sync-greenways-agent-voice.js`**.

- **👥 Agent team strip + handoffs (May 2026)** — `data/greenways-agent-roster.json` + **`greenways-agent-team.js`** on all seven shells: faces beside New chat, **`gw-team-handoff-v1`** brief on handoff chips, shared profile **`gw-team-profile-v1`**. Sync: **`node scripts/sync-greenways-agent-team.js`**.

- **🤖 LLM per agent (May 2026)** — optional polish layer; shared **`services/greenways-agent-llm.js`** (Cortecs / OpenRouter / OpenAI / Anthropic):
  - **Cortecs (primary):** `ASSISTANT_PROVIDER=cortecs`, JWT from **`HTMLS GWM GWB/Contl2 .txt`**, `ASSISTANT_MODEL=…` — API **`https://api.cortecs.ai/v1/chat/completions`** ([docs](https://docs.cortecs.ai/api-overview/chat-completions.md)).
  - **Render env template:** **`.env.example`**; never commit keys from `HTMLS GWM GWB/*.txt`.
  - **Grants / Music Guide / dashboard assistant** wired; per-agent override `GRANTS_AGENT_*`, `MUSIC_GUIDE_*` → fallback `ASSISTANT_*`.
  - **Agent Zero** = separate future business stack, not this path.

- **🚀 Launch mode — agents (Jun 2026):** Wix launch prioritises experience over LLM caps. Policy in **`Skills/greenways-agents-roadmap.md`** § Launch mode. **Track A:** `finishKnowledgeAskResponse()` on all seven `/ask` routes; **`npm run smoke:agents-ask`**. LLM polish via `GREENWAYS_AGENT_POLISH_AGENTS` (default `finance` only). **Track B (Vincent):** `buildAgentHandoff` + `FINANCE_HANDOFF_RULES`; conversational `blocks[]` on `energy_prices`, `bnpl`, `green_loans`, `price_upgrade_case`, `etl_products`. **Vincent module tablets (Phase 1):** embeddable site pages open in **`GreenwaysAgentContentModule`** (`theme: finance`); copy from **`data/greenways-content-modules.json`** — **`description`** (what it is) + **`usageHint`** (how to use) in modal header and chat tablets. **Andrieus module tablets (Jun 2026):** same shell with `theme: grants`; registry ids **`schemes-portal-restaurant`**, **`schemes-portal-eu`**; portal intents return `type: "module"` blocks; sidebar quick links use `moduleOpen`.
- **📋 Agent sidebar UI (Jun 2026):** Shared **`HTMLS GWM GWB/js/greenways-agent-sidebar.css`** + **`.js`** on all seven shells — compact **Quick links** block (gold border) + **Ask about** block (slate border); link config in **`data/greenways-agent-sidebar-config.json`**; sync via **`npm run sync:agent-sidebar`**.
- **🔗 Agent product banner links (Jun 2026):** Banner cards on `/greenways/*` agents used bare `product-page-v2-marketplace.html?product=…` — browser resolved to **`/greenways/product-page-v2-marketplace.html`** (404). Product data was fine (`etl_14_59333` Ecostore). **Fix:** root-relative **`/product-page-v2-marketplace.html`** in **`marketplaceHref()`** (`greenways-agent-shared.js`) + **`TurnUi.normalizeMarketplaceHref()`** in **`greenways-agent-turn-ui.js`** on all agent `renderProductCards`.
- **🗺️ Media Agent + sustainability map (May 2026)**:
  - **`services/media-agent-companies.js`** ranks **`data/companies.json`** (500+ orgs) for profile/sector — energy savings examples, payback stats, techniques to benchmark.
  - Intents: `sustainability_map`, `energy_examples`; **monthly news** uses story link tablets (not long bullet lists).
  - **Conversational answers (Jun 2026):** all agents — **`Skills/greenways-chat-interface-skill.md`** § Conversational answer pattern (Zara-style). Cheryce map: summary left, example cards + **Open map** module right — `buildSustainabilityMapExplainedAnswer` in `media-agent-companies.js`.
  - **Cheryce banner photos (Jun 2026):** Case study cards read `imageUrl` from **`data/companies.json`** via `media-agent-companies.js`. Empty field = blank thumbnail (e.g. FoodMesh). Fix: add Wix URL (`scripts/apply-companies-inline-images.js` name map); server uses `DEFAULT_COMPANY_CARD_IMAGE` when missing.
  - **Cheryce sidebar + Wix (Jun 2026, `c517979`):** Quick links use `contentBase()` + `target="_top"` to full `/HTMLS%20GWM%20GWB/` pages; only map link opens module. Client: 90s timeout + retry on Render cold start for `/api/media-agent/ask`.
  - **Cheryce false connection error (`b8379c4`):** `finishAgentTurn` used `intentId` before declaration — API OK but UI showed “Could not reach the media agent.”
  - Map page: **`European Company - Case Study Finder (Standalone) - Wix bundle.html`**; showcase IDs in **`data/media-agent-showcase.json`**.

- **🔀 Agent merges (May 2026)** — fewer consumer chats, clearer journeys:
  - **Renovation** → **Equipment Agent** (`renovation`, `insulation`, `renovation_grants` intents).
  - **Energy prices / ROI** → **Finance Agent** (`energy_prices`, `price_upgrade_case`, `compare_tariffs`).
  - **News** → **Media Agent** (not a separate chat).
  - **Deals** vs **Sustainable Products** stay **two agents** — Deals = spotlights/supply; Products = catalog search (`product_deals` / `product_deal_spotlights` cross-links).

- **👥 Admin vs consumer skills (May 2026)** — **`Skills/greenways-chat-interface-skill.md`** § **Admin vs consumer skills**:
  - **Consumer agents:** seven Greenways chats + Music Guide + Guide conductor (WIP) — public JSON/HTML only.
  - **Admin / ops:** blog writer, content-ops, member-manager, Market Manager, full Systems MD, product-addition workflow.
  - **Hover cache:** `hover-data-aggregator.md` → `build-hover-data-cache.js` → `data/hover-data.json` (grants/deals tooltips, no live API on hover).
  - **Personalized impact:** admin/member “why it matters” — generic copy when no profile data; planned **hover / site explainer** agent (staff).
  - **Backlog:** `historical-data-finder.md` → **Finance Agent**; **new ETL** consumer flags after enrichment pipeline; template-based HTML from member data via chat (future).

---

*This file is automatically updated by Ralph iterations and the Continuous Learning Protocol.*
