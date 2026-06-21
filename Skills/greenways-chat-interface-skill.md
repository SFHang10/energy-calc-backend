# Greenways Chat Interface — Foundation Skill

**Skill type:** UI + API pattern (clone for new agents)  
**Agent roster (names):** **`greenways-transition-agents.md`** — Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo  
**Shared turn UI:** All seven chat agents (May 2026) — `HTMLS GWM GWB/js/greenways-agent-turn-ui.js` + `.css`  
**Chat shell (May 2026):** `HTMLS GWM GWB/js/greenways-agent-chat-shell.css` — Edwardo-neutral chat base for all agents; subtle `--accent` wash on panel, bubbles, and compose; accent border around `.chat-panel` glows when `:has(.is-thinking)`. Load **after** each agent inline `<style>`.
**Sibling reference:** **Music Guide** (`live-music-guide.html` / compact panel in `live-music-finder.html`)  
**Status:** Foundation for **built** Transition Agent shells; deepen knowledge per agent incrementally.

---

## Named agents (refer by character)

| Name | Slug | HTML |
|------|------|------|
| **Andrieus** | `grants-agent` | `greenways-grants-agent.html` |
| **Vincent** | `finance-agent` | `greenways-finance-agent.html` |
| **Artemis** | `equipment-agent` | `greenways-equipment-agent.html` |
| **Zara** | `deals-agent` | `greenways-deals-agent.html` |
| **Cheryce** | `media-agent` | `greenways-media-agent.html` |
| **Zyanne** | `sustainable-products-agent` | `greenways-sustainable-products-agent.html` |
| **Edwardo** | `systems-agent` | `greenways-systems-agent.html` |

**Agents ≠ skills:** Skills in `Skills/` are capabilities; agents are who users meet on Wix. Full map: **`greenways-transition-agents.md`**.

---

## Purpose

One repeatable stack for Wix-embeddable agent chats:

1. **Knowledge first** — intents + local JSON catalogue (fast, no API keys).
2. **Optional LLM** — per-agent, env-gated polish on top of retrieved facts (see § **LLM per agent**).
3. **Rich HTML shell** — product/showcase banner, scrollable chat, interactive chips, session memory, offline fallbacks.

Do **not** reinvent layout per agent — fork `greenways-grants-agent.html` and swap data layer + theme accent.

**Word choice:** use **equipment** (not **kit**) in agent copy and UI prose. Keep **kit** only in official supplier product names — see `AGENTS.md` § Word choice.

---

## Architecture (copy per agent)

```
data/{agent}-intents.json          ← question patterns → answerType
data/{agent}-showcase-*.json       ← optional curated cards (products, venues, deals)
services/{agent}-knowledge.js      ← answers from canonical JSON (schemes, venues, products…)
routes/{agent}.js                  ← GET /samples, POST /ask, POST /compare (if needed)
HTMLS GWM GWB/greenways-{agent}.html
server-new.js                      ← app.use('/api/{agent}', router) + short URL /greenways/{agent}
```

### Grants Agent (pilot) — file map

| Layer | Path |
|-------|------|
| Intents | `data/grants-agent-intents.json` |
| Showcase products | `data/grants-agent-showcase-products.json` |
| Knowledge | `services/grants-agent-knowledge.js` ← `schemes.json`, `products-with-grants*.json` |
| API | `routes/grants-agent.js` |
| UI | `HTMLS GWM GWB/greenways-grants-agent.html` |
| Short URL | `/greenways/grants-agent` |
| API base | `/api/grants-agent/ask`, `/samples`, `/compare` |
| Theme | Blue — `--accent: #007bff` |

### Finance / Equipment / Deals agents (May 2026)

Same layout as Grants Agent; **↺ New chat** on all four. Scaffold: `node scripts/scaffold-greenways-agents.js`.

| Agent | UI | Theme accent | Showcase source |
|-------|-----|--------------|-----------------|
| **Finance** | `greenways-finance-agent.html` | Gold `#c9a961` | Finance finder Wix photos + ETL products (`data/finance-agent-showcase.json`) |
| **Equipment** | `greenways-equipment-agent.html` | Green `#28a745` | ETL products + **renovation / insulation** guides (`data/equipment-agent-showcase.json`) |
| **Deals** | `greenways-deals-agent.html` | Orange `#ff8c1a` / cyan bubbles `#4da6ff` | **Energy-lane** tariff rows from `deals-feed.json` + Wix photos; links to `Deals.html` + `european_energy_deals_portal.html` |

Shared helpers: `services/greenways-agent-shared.js`.

### Full Energy Portal agent roster (consumer-facing)

| # | Agent | Status | Primary skills | Consumer HTML / data |
|---|--------|--------|----------------|----------------------|
| 1 | **Grants** | ✅ Built | `grants-schemes-finder`, chat skill | `greenways-grants-agent.html`, `schemes.json` |
| 2 | **Finance + energy prices** | ✅ Built | `energy-dashboard-skill` § finance + **§ savings projections**, `energy-ticker`, `calculator-cohesion` | `finance-finder-restaurant.html`, `energy-ticker-green-wire.html`, `utility-detail.html`, `equipment-savings-projection.html` |
| 3 | **Equipment / Upgrade + Renovation** | ✅ Built | `product-deep-dive`, `sustainable-renovation-planner`, dashboard skill | `restaurant-equipment-deep-dive.html`, `Sustainable Renovations New .html`, `Importance of Insulation.html`, `/api/equipment-intelligence/*` |
| 4 | **Sustainable Products** | ✅ Built | `product-deal-finder` § products | `greenways-sustainable-products-agent.html`, `/api/sustainable-products-agent/*` — **one agent, three utility lanes** (see below) |
| 5 | **Deals** | ✅ Built | `product-deal-finder` § energy & hub | `Deals.html`, `deals-ticker-hub.html`, `european_energy_deals_portal.html`, `deals-feed.json` |
| 6 | ~~Savings / ROI~~ | **→ Finance Agent** | Merged into #2 — payback/ROI is money + funding, same consumer journey as BNPL/grants/loans |
| 7 | ~~Renovation~~ | **→ Equipment Agent (#3)** | `sustainable-renovation-planner` | Premises upgrades merged into Equipment — not a separate chat agent |
| 8 | ~~Energy Prices~~ | **→ Finance Agent (#2)** | `energy-ticker`, `rate-consultant` | Wholesale ticker + tariff compare — merged into Finance, not a separate chat agent |
| 9 | **News & Policy** | ✅ **→ Media Agent (#12)** | `sustainability-news-finder`, `tech-news-finder` | Merged into Media — not a separate chat agent |
| 10 | **Site / Building** | 🔜 Planned | `energy-dashboard-skill` (Wok Assist, KPIs) | `Greenways Interface .html`, `Chef 3 W2W .html` |
| 11 | **Music Guide** | ✅ Built (parallel) | `live-music-finder-skill` | `live-music-guide.html`, `music-venues.json` |
| 12 | **Media / Video** | ✅ Built | `sustainability-video-finder`, `sustainability-news-finder`, `news-product-recommender` | News KB + Wix videos + **sustainability map** (`data/companies.json` → case study finder HTML); monthly roundups cross-link map picks |
| 13 | **Systems / Health** | ✅ Built | `Systems MD.md` (lightweight subset) | `greenways-systems-agent.html`, `/api/systems-agent/*` — read-only verify + **Verify selected** sync button |
| 14 | **Greenways Guide** (hub conductor) | 🔜 **Backend only** | This skill § **Guide Agent** | Orchestrator routes to specialists — **not live** until HTML + `server-new.js` mount |

**Admin vs consumer:** Agents answer from published HTML + JSON catalogues only. Skills may document ops workflows; agent knowledge services must not expose build/merge/deploy steps to end users.

**Systems Agent note:** Consumer/staff **Verify selected** re-checks file freshness only — does **not** run `product-grants-integrator.js` or `npm run build:*`. Full Wix MCP / ETL / Render diagnostics stay in `Skills/Systems MD.md`.

**Next build candidates:** finish **Greenways Guide** (HTML + server mount) → dashboard embed tabs (lazy-load agent iframes) → extend Deals/Media cross-links.

### Greenways Guide Agent — hub conductor (May 2026, **WIP**)

**Role:** Public Wix **agents hub** embed — routes plain-language questions to 1–2 specialists, returns a short answer plus **handoff chips** linking to `/greenways/{agent}?q=…`. Specialist pages keep one full chat each.

**Status (28 May 2026):**

| Layer | Path | Status |
|-------|------|--------|
| Intents | `data/guide-agent-intents.json` | ✅ |
| Roster | `data/guide-agent-roster.json` | ✅ specialist cards + staff Systems row |
| Knowledge | `services/guide-agent-knowledge.js` | ✅ token scoring → lazy `require` of one specialist `answerFromKnowledge()` |
| API | `routes/guide-agent.js` | ✅ `POST /ask`, `GET /samples` — **not mounted** in `server-new.js` yet |
| UI | `HTMLS GWM GWB/greenways-orchestra-hub.html` | ✅ agent grid + ask + glow routing |
| Wix frame | `HTMLS GWM GWB/greenways-orchestra-hub-wix-frame.html` | ✅ mosaic left + hub iframe (Zara-frame pattern) |
| Short URL | `/greenways/orchestra-hub` · `/greenways/guide-agent` | ✅ registered in `server-new.js` with `/api/guide-agent` |

**Orchestrator API fields** (extend standard response):

```json
{
  "agentHandoffs": [{ "id", "name", "href", "prompt" }],
  "routedTo": ["finance", "grants"],
  "primaryAgent": "finance",
  "source": "orchestrator"
}
```

**Routing:** consumer specialists — grants, finance, equipment, products, deals, media. **Systems** — handoff-only (no full health check on every hub query).

**Wix placement:** optional **one** iframe on the agents **hub** page (`/greenways/guide-agent?embed=1`); character pages unchanged (one specialist embed each).

**Finish checklist:** (1) create HTML with specialist roster banner + `agentHandoffChips` in chat, (2) mount route in `server-new.js`, (3) add row to `systems-agent-health.js` agent list, (4) smoke-test compound question (“grants and finance for kitchen upgrade”).

**Avoid in dev:** running inline `node -e` tests that load `EquipmentIntelligenceService` or full product DB — sync parse of `FULL-DATABASE-5554.json` can freeze Cursor.

### Finance Agent — funding + energy prices (May 2026)

Energy prices are **not** a separate agent. Finance Agent uses wholesale snapshot (`data/energy-ticker-demo.json`, same family as `/api/energy-ticker`) to explain **why efficient equipment + grants/loans** beats waiting when unit costs move.

| Topic | Intents | Consumer HTML |
|-------|---------|---------------|
| **Wholesale / ticker** | `energy_prices` | `content-ops/drafts/energy-ticker/energy-ticker-green-wire.html` |
| **Upgrade case (prices → equipment)** | `price_upgrade_case` | `equipment-savings-projection.html`, Equipment Agent |
| **Retail tariff compare** | `compare_tariffs` | `european_energy_deals_portal.html`, Deals Agent |

Knowledge: `services/finance-agent-knowledge.js` + `services/finance-agent-energy.js`.

### Equipment Agent — equipment + premises renovation (May 2026)

Renovation is **not** a separate agent. Equipment Agent covers **changing how your site runs** — new efficient equipment **and** building upgrades (insulation, retrofit, phased project plans).

| Topic | Intents | Consumer HTML |
|-------|---------|---------------|
| **Premises renovation** | `renovation`, `renovation_plan` | `Sustainable Renovations New .html`, `HTMLs/Renovation project plans.html` |
| **Retrofit ROI & building benefits** | `retrofit_benefits` | `HTMLs/Retrofit-Tabbed.html` — module id `retrofit-roi-guide` |
| **Restaurant design & sustainability** | `restaurant_design` | `HTMLs/Restauarant Design .html` — module id `restaurant-design-sustainability` |
| **Insulation & fabric** | `insulation` | `Importance of Insulation.html` |
| **Building grants** | `renovation_grants` | Grants Agent cross-link; schemes from `schemes.json` |

Knowledge: `services/equipment-agent-knowledge.js` · intents: `data/equipment-agent-intents.json` · curated stats: `data/equipment-agent-renovation-guide.json`.

### Sustainable Products Agent — one chat, three utility lanes

Do **not** split Water / Electricity / Gas into three agents (too many tabs). Mirror **Deals Agent** lane pattern:

| Lane | Consumer focus | HTML / data |
|------|----------------|-------------|
| **💧 Water savings** | Taps, dishwashers, aerators, submetering | `water-saving-finder.html`, water rows in `deals-feed.json`, catalog `utilityProfile.dailyWaterLitres` |
| **⚡ Electricity savings** | Efficient appliances, lighting, refrigeration, ETL | `sustainable_product_deal_finder_portal.html`, marketplace + `sustainable-products-catalog.json` (kWh) |
| **🔥 Gas savings** | Cooking, heating, wok/combi upgrades | Same catalog + deep dive wok profiles; `utilityProfile.dailyGasKwh`, gas-heavy equipment types |

**UI:** profile filter or welcome chips per lane; banner showcase picks from lane; answers link to the right full-page finder (same as Deals → `Deals.html` pattern).

**Two product columns in every answer** (match dashboard finders):

| Badge | Source | API field |
|-------|--------|-----------|
| On Greenways | Marketplace `etl_*` | `source: greenways_marketplace` |
| Market alternative | External `sust_*` | external lane from catalog |

Knowledge service: wrap **`GET /api/equipment-intelligence/alternatives`** (same as finders); optional **`persistCatalog=1`** only on intentional staff search — not on every consumer chat turn.

### Product deals — visible on both agents (May 2026)

Same `product-deal-finder` skill, **two consumer jobs** — surface both so users know where to ask:

| User goal | Agent | Prompt example |
|-----------|--------|----------------|
| **Spotlights & weekly offers** (deals-feed rows, `productId`) | **Deals Agent** | “What product deals are live?” |
| **Search & compare** efficient catalog (`etl_*` / `sust_*`) | **Sustainable Products Agent** | “Find a water-saving dishwasher” |

Each agent’s welcome card, sidebar, and static tips cross-link the other. Intents: `product_deals` (Deals) · `product_deal_spotlights` (Sustainable Products → hand off).

**Admin (staff):** **Suggest for Greenways** → `POST /api/equipment-intelligence/marketplace-intake-suggestions` — water devices, gas savers, etc. not yet on marketplace. Consumer chat explains products + links; intake button stays staff-only or on finder HTML until auth. See `product-deal-finder.md` § admin intake.

### Finance Agent — absorb Savings / ROI

Consumer questions like “payback”, “ROI”, “will this save money”, “grants + loan stack” belong on **Finance**, not a standalone agent:

- Intents: open savings projection, example payback, grants reduce capex, link to `equipment-savings-projection.html`
- Sidebar: finance finder + **See example projection** (`savings.html` / deep dive modal pattern)
- Keeps **Equipment** = *what to buy*; **Finance** = *what it costs and when it pays back*

### Music Guide (earlier sibling)

| Layer | Path |
|-------|------|
| Intents | `data/music-guide-intents.json` |
| Knowledge | `services/music-guide-knowledge.js` ← `data/music-venues.json` |
| API | `routes/music-guide.js` |
| Full UI | `HTMLS GWM GWB/live-music-guide.html` |
| Compact embed | `live-music-finder.html` guide panel |

**↺ New chat:** On **all seven** Greenways consumer agents (`#new-chat-btn` → `clearChat()`). **Not yet** on Music Guide — port when building dashboard embeds.

---

## UI layout zones (preserve order)

Top → bottom inside `.guide-main`:

| Zone | Class / id | Role |
|------|------------|------|
| Header | `.guide-top` | Brand, **↺ New chat**, profile filters (region / sector / focus) |
| Showcase banner | `#product-showcase-banner` | Optional entice row (grant-eligible products, deals, venues) — **persistent** |
| Chat panel | `.chat-panel` > `#chat-thread` | Scrollable messages; `min-height` so welcome card is not clipped |
| Profile nudge | `#profile-nudge` | Shown when filters change; one-click tailored question |
| Compare dock | `#compare-dock` | **Collapsed by default** (`is-collapsed`); expands when 2 schemes selected |
| Quick replies | `#quick-reply-bar` | Sticky pills above input after first answer |
| Compose | `.chat-compose` | Textarea + send |

**Sidebar (desktop):** helper cards + quick portal links + status bar.

**Wix embed:** `?embed=1` → `html.embed-wix` + `<meta name="wix-html-scroll" content="no-scroll">` + `<base href>` when served under `/HTMLS` or `/greenways/`.

### Wix embed gotchas (May 2026)

| Issue | Fix |
|-------|-----|
| Turn-ui **404** on `/greenways/*` | Load shared CSS/JS with **absolute** paths: `/HTMLS%20GWM%20GWB/js/greenways-agent-turn-ui.css` and `.js` — relative `js/...` resolves to `/greenways/js/...` before `<base>` is injected |
| Agent **silent** (no replies) | Check F12 — broken inline JS (e.g. bad `grantLabel` ternary) stops the whole script; match Grants/Finance pattern |
| Grants **no UI** after turn | `finishAgentTurn` must pass **`footHtml`** into `TurnUi.buildParts` |
| Tall empty welcome area | Welcome card `justify-content: flex-start` (not centred in oversized iframe) |

Character portraits: `AGENT_PROFILE.imageUrl` (Wix static) + `TurnUi.avatarMarkup()` in every agent HTML.

---

## Shared turn UI (all chat agents — May 2026)

**Module:** `HTMLS GWM GWB/js/greenways-agent-turn-ui.js` + `greenways-agent-turn-ui.css` — exposed as `window.GreenwaysAgentTurnUi`.

**Wired on:** Grants, Finance, Equipment, Deals, Media, Sustainable Products, Systems (CSS/JS linked; Systems has a simpler chat shell).

**Sync helpers:** `node scripts/sync-greenways-agent-turn-ui.js` (inject assets + `finishAgentTurn` hook) · `node scripts/fix-greenways-agent-finish-turn.js` (repair after bulk sync).

### Split turn layout

| Column | Content |
|--------|---------|
| **Left** | Friendly intro only (`answer` markdown — no duplicate bullet lists when `suggestions[]` or `blocks[]` present) |
| **Right** | *Things to be aware of* (tip from `_italic footer_` in answer) + frosted **tablets** for schemes/links/stats |
| **Foot** | Follow-up pills + source badge |

Stacks to one column below **560px** (`.turn-split` → `.turn-split--stack`).

### Right panel sidebar order (Jun 2026)

**Default chat agents** (Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne) — `aside.guide-sidebar` block order:

1. **Ask about** — `.sidebar-block--helpers` + `#helper-list` (conversation starters first)
2. **Quick links** — `.sidebar-section--links` + `#gw-agent-quick-links` (portals / agent handoffs)
3. **Status bar** — `#status-bar`

**Rationale:** users land on chat prompts before scrolling to open-tab portals. Vincent validated this framing (Jun 2026).

**Exception — Edwardo (`greenways-systems-agent.html`):** keep **Ops · verify selected** → **Quick links** → **Ask about**. System-ops layout; his compact sidebar and sync checklist stay as-is — **do not** apply ask-first reorder when cloning or syncing shells.

**CSS:** `greenways-agent-sidebar.css` — `.sidebar-block--helpers:first-child { margin-top: 10px; }` (only when Ask is first; Edwardo’s first child is the ops block).

**When forking a new agent:** copy Vincent/Andrieus sidebar HTML order; wire `GreenwaysAgentSidebar.init()` unchanged.

**Product Calculator naming (Vincent, Jun 2026):** Module id stays `etl-calculator` (internal path map only). **Display title:** **Product Calculator** — Greenways-owned compare tool for product energy use (includes ETL-listed products today; not an ETL-branded calculator). Registry: `data/greenways-content-modules.json` + `data/finance-agent-tools.json` (`energy-calculator` tool row).

### Block types (`blocks[]` from API)

Knowledge services return structured right-column content; HTML builds tablets via `TurnUi.buildParts()` + `TurnUi.layoutHtml()`.

| `type` | Renders as |
|--------|------------|
| `stat` | Compact stat chips (overview counts, lane summaries) |
| `link` | Frosted link tablets — green **Ask about this**, gold **Official site ↗** |

**Grants / Finance / Equipment** knowledge services emit `blocks[]` today. Deals, Media, Sustainable Products use the same UI shell; copy/blocks refresh can follow incrementally.

### Tablet styling (Grants pilot — inherited by all)

- Dark frosted cards (not pill chips)
- Purple neon follow-up pills for high-intent shortcuts (Grants: MIA/Vamil, NL equipment, marketplace grants, EU programmes)
- Compare dock scheme selection uses shared `.scheme-tablet` chrome

---

## Shared persona + voice (May 2026)

**Persona helpers:** `services/greenways-agent-persona.js` — `pickOpener`, `pickTip`, `profileLine`, `spokenSummary`, `applyPersona()`.

**Per-agent voice copy:** `data/{agent}-voice.json` (start with `data/grants-agent-voice.json` for Andrieus). Knowledge services call `applyPersona()` before returning `/ask` JSON.

**API field:** `spokenSummary` — short line for TTS (1–2 sentences); full `answer` stays on screen with tablets.

**Voice UI:** `HTMLS GWM GWB/js/greenways-agent-voice.js` + `.css` — mic (STT) + 🔊 read-aloud (Web Speech API). Config: `data/greenways-agent-voice-config.json` (`voiceEnabled` per slug; Group A on, B/C off by default).

**Sync:** `node scripts/sync-greenways-agent-voice.js` — inject assets, compose buttons, `finishAgentTurn` hook on all seven HTML shells.

**Later:** ElevenLabs / OpenAI TTS behind same module; evidence cards (`data/greenways-site-knowledge/`) Phase 2.

---

## Shared team strip + handoffs (May 2026)

**Roster:** `data/greenways-agent-roster.json` — portraits + `/greenways/{slug}` paths (seven agents; Edwardo = **Systems & equipment** — monitoring, sensors, dashboards).

**Module:** `HTMLS GWM GWB/js/greenways-agent-team.js` + `.css` — team faces beside **New chat**, handoff brief, shared profile.

| Feature | Storage | Behaviour |
|---------|---------|-----------|
| Team strip | — | Tap another face → open that agent page; current agent highlighted |
| Handoff brief | `sessionStorage` `gw-team-handoff-v1` | Written when user clicks **agent handoff chip**; landing agent shows green banner + auto-asks |
| Referral welcome | `profile.handoff` on first `/ask` | Receiving agent opens in character (e.g. Zyanne → Artemis equipment shortlist); one-shot via `takeHandoffForAsk` |
| Shared profile | `sessionStorage` `gw-team-profile-v1` | Region / sector / focus sync across agents |

**No back button needed** — team strip is the switcher; each agent keeps its own chat in `gw-{agent}-agent-session-v1`.

**Sync:** `node scripts/sync-greenways-agent-team.js` · repair: `node scripts/fix-greenways-agent-team.js`

**Event:** `gw-team-ready` — `{ handoffBrief, suggestedPrompt }` for boot question after handoff.

**Referral welcome (May 2026):** `greenways-agent-team.js` enriches handoff with `topicSummary`, `fromIntentId`; first `/ask` uses `GreenwaysAgentTeam.profileForAsk(getProfile, slug)` → `profile.handoff`. Pairs live today: **Zyanne → Artemis** (`equipment-agent-knowledge.js`) and **Cheryce → Andrieus** (`grants-agent-knowledge.js`) via `services/greenways-agent-handoff.js`. Extend `isReferralWelcomePair` for more agents.

---

## Interactive features (replicate on clones)

| # | Feature | Implementation notes |
|---|---------|----------------------|
| 1 | Follow-up chips | `followUpChips(intentId, profile, question)` under each agent bubble |
| 2 | Showcase → chat | **Ask about grants** on product cards (`data-prompt`) |
| 3 | Scheme / link tablets | Tap = select for compare (Grants) · **Ask about this** = ask agent · **Official site ↗** = external link |
| 4 | Profile nudge | `change` on profile selects → `#profile-nudge` + tailored prompt |
| 5 | New chat | `#new-chat-btn` (`.header-ghost-btn`) → `clearChat()` — resets `sessionTurns`, `msgId`, welcome card, `quick-reply-bar`, `SESSION_KEY`; see `greenways-grants-agent.html` ~L1453 |
| 6 | Message motion | `.msg-row` slide-in; `.is-thinking` avatar pulse |
| 7 | Quick-reply bar | `#quick-reply-bar` after first answer |
| 8 | Typed reveal | `TurnUi.revealTyped()` word-by-word before chips (via `finishAgentTurn`) |
| 9 | Session memory | `sessionStorage` key `gw-{agent}-agent-session-v1` (rename per agent) |
| 10 | Compare | Select 2 scheme tablets → `POST /api/grants-agent/compare` (offline table fallback) |
| 11 | Split turn | `finishAgentTurn({ answer, suggestions, blocks, … })` → shared layout module |

---

## API response shape (standardise)

```json
{
  "ok": true,
  "answer": "markdown string — intro + optional _italic footer_ tip when suggestions/blocks present",
  "suggestions": [{ "id", "title", "region", "type", "url", "description", "deadline" }],
  "blocks": [{ "type": "stat | link", "items": [{ "label", "value", "href", "prompt", … }] }],
  "productSamples": [{ "id", "name", "imageUrl", "marketplaceHref", "grantsCount", "topGrants" }],
  "source": "knowledge | heuristic | llm | offline | orchestrator",
  "intentId": "nl_schemes | equipment | compare | …",
  "agentHandoffs": [{ "id", "name", "href", "prompt" }],
  "routedTo": ["finance"],
  "primaryAgent": "finance"
}
```

**`blocks[]`:** optional structured right column — all agent routes pass through when knowledge service sets them. **`suggestions[]`:** scheme/product rows rendered as frosted tablets on the right (Grants compare flow unchanged).

**Guide Agent only:** `agentHandoffs`, `routedTo`, `primaryAgent`, `source: "orchestrator"`.

**Knowledge path:** `answerFromKnowledge()` must set `intentId` + `productSamples` when applicable.

**Product grants overlay:** merge grants from `products-with-grants.json` when collection bundle rows have empty `grants[]` (see `pickProductSamples()` in knowledge service).

---

## Theming

| Agent | Accent | Fonts (pilot) |
|-------|--------|----------------|
| Grants Agent | Blue `#2563eb` / `#60a5fa` | DM Sans + Playfair Display |
| Music Guide | Warm / venue palette | (see live-music-guide.html) |

Clone: change `:root` CSS variables only — keep class names and JS hooks identical.

---

## Offline / pre-deploy behaviour

Render may lag local HTML. Grants Agent includes:

- `STATIC_PRODUCT_SAMPLES` in HTML for banner + product-grants answers.
- `apiBase()` → `https://energy-calc-backend.onrender.com` when not localhost.
- Fetch timeouts (15s samples / 25s ask) + AbortController.
- Compare + ask fallbacks with readable copy when API 404/500.

**After pushing backend:** verify `/api/grants-agent/ask`, `/samples`, `/compare` on Render `/health` deploy.

---

## LLM per agent (optional, same provider)

**Pattern:** one API key / provider; **different model or system prompt per agent**. Knowledge + JSON retrieval always runs first; LLM only polishes or narrates grounded facts.

**Shared modules:** `services/greenways-agent-llm.js` (API call) + `services/greenways-agent-llm-fallback.js` (all seven Transition Agents on intent miss). Also: Music Guide, dashboard assistant.

| Agent | Env vars (example) | Fallback | Notes |
|-------|-------------------|----------|--------|
| **Grants** | `GRANTS_AGENT_PROVIDER`, `GRANTS_AGENT_API_KEY`, `GRANTS_AGENT_MODEL` | `ASSISTANT_*` | `routes/grants-agent.js`; system prompt restricts to `suggestions` JSON |
| **Music Guide** | `MUSIC_GUIDE_PROVIDER`, `MUSIC_GUIDE_API_KEY`, `MUSIC_GUIDE_MODEL` | `ASSISTANT_*` | `routes/music-guide.js` |
| **Dashboard assistant** | `ASSISTANT_PROVIDER`, `ASSISTANT_API_KEY`, `ASSISTANT_MODEL` | — | `routes/assistant.js` |
| **Finance, Equipment, Deals, Media, Products, Systems** | `{AGENT}_AGENT_*` (e.g. `FINANCE_AGENT_`, `DEALS_AGENT_`) | `ASSISTANT_*` | Shared fallback: `services/greenways-agent-llm-fallback.js` |

**Providers:** `cortecs` (JWT from **`HTMLS GWM GWB/Contl2 .txt`** → [Cortecs API](https://docs.cortecs.ai/api-overview/chat-completions.md), base `https://api.cortecs.ai/v1`), `openrouter`, `openai`, `anthropic`.

**Render setup (Cortecs + credited account):**

```bash
ASSISTANT_PROVIDER=cortecs
ASSISTANT_API_KEY=<JWT from Contl2 .txt>
ASSISTANT_MODEL=anthropic/claude-3.5-sonnet
```

List models: `GET https://api.cortecs.ai/v1/models` with same Bearer JWT. OpenRouter `sk-or-v1-…` keys remain a fallback (see `.env.example`). Agent Zero = separate future stack.

**Recommended split:**

- **Guide** (when live): small/fast model — routing only.
- **Grants / Finance**: stronger model — eligibility nuance.
- **Deals / Media**: medium — summarise feeds and news.
- **Systems**: none or minimal — structured health payloads.

**Rule:** never let the LLM invent schemes, products, or URLs — pass retrieved rows in the user payload (Grants Agent already sends `{ question, profile, suggestions }`).

---

## Conversational answer pattern (Zara-style) — all agents

**Reference:** [Zara (Deals Agent)](https://energy-calc-backend.onrender.com/greenways/deals-agent) — short left summary + **module tablets** (`type: "module"` blocks) on the right. **Target for all agents (Track B):** portal/finder pages open in-panel via `GreenwaysAgentContentModule`; chat keeps the split layout (left prose + right tablets + gold **Things to be aware of** panel).

| Rule | Left column (chat prose) | Right column / banner |
|------|--------------------------|------------------------|
| **Summarise, don't dump** | 2–4 friendly paragraphs — what it is, why it matters, how it could affect bills or planning | Concrete examples, portals, editions |
| **No long lists** | Avoid markdown bullet catalogues of articles, schemes, deals, or case studies | Move rows to `blocks[]` (`type: "module"` preferred; `type: "link"` when external/agent-only) or `productSamples` banner cards |
| **No raw HTML paths** | Never `→ ./some-page.html` in prose | Use `toLinkItem` → `linkOrModuleBlocks()` or `toModuleItem` + registry copy (`description` + `usageHint`) |
| **Explain & invite** | Offer follow-ups: _"Should I explain CBAM?"_ / _"Want examples for your sector?"_ | Module shell for maps, finders, tickers (`attachModules`) |
| **Helper tone** | Friendly curator — not a search engine | User opens **Open illustration** / map module when ready; **New tab ↗** stays available |
| **Awareness panel** | Trailing `_tips_` and profile meaning lines render in the right column — **not** raw `**markdown**` | `greenways-agent-turn-ui.js` formats tips (bold, dedupe); gold label + cream body text |

**Implementation:**

- Shared rules: `services/greenways-agent-shared.js` → `CONVERSATIONAL_ANSWER_RULES`, `conversationalSystemLines()`.
- LLM polish: `services/greenways-agent-llm-fallback.js` — all seven agents inherit the same left-column rules.
- Turn UI: when `blocks[]` exist, `greenways-agent-turn-ui.js` shows **intro only** on the left (`introFromAnswer` strips bullets after first list).
- **Cheryce pilot (Jun 2026):** `buildSustainabilityMapAnswer` / `buildMonthlyNewsAnswer` in `media-agent-companies.js` + `media-agent-knowledge.js` — map summary + example link tablets; news roundup caps at 4 story cards on the right.
- **Cheryce sidebar + Wix (Jun 2026, commit `c517979`):** Quick links must be `<a target="_top">` with **`contentBase()`** → `https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/...` — **not** relative `./` from `/greenways/media-agent` (wrong path) and **not** the purple module shell for news/finder pages. Only **Sustainability map →** uses `data-map-open` (module). **`initSidebarGwbLinks()`** sets hrefs on load. API from Wix: **`apiBase()`** + **`AGENT_FETCH_TIMEOUT_MS = 90000`** with retry on abort/network; status *first question may take up to a minute on Render*.

When adding a new intent handler, return `{ answer, blocks?, productSamples?, suggestions? }` — not a long `answer` string alone.

---

## Cloning checklist (next agent)

1. Copy `greenways-grants-agent.html` → `greenways-{name}-agent.html`.
2. Ensure `<link>` + `<script>` for `js/greenways-agent-turn-ui.css` / `.js` (or run `node scripts/sync-greenways-agent-turn-ui.js`).
3. Copy `data/grants-agent-intents.json` → new intents; point `answerType` handlers at your catalogue.
4. Copy `services/grants-agent-knowledge.js` → new service reading **one canonical JSON** (do not duplicate scheme rows in HTML). Use `withTip()` + `blocks[]` for intro-only answers when tablets carry detail.
5. Copy `routes/grants-agent.js` → mount at `/api/{name}-agent`; forward `blocks` on `/ask` and `/compare`.
6. Register in `server-new.js` + optional `/greenways/{name}-agent` short route.
7. Update showcase JSON + `STATIC_*` fallback in HTML if the banner shows entities (products, venues, schemes).
8. Rename `SESSION_KEY` and status copy.
9. Add row to **`AGENTS.md`** + this skill’s agent table.
10. Link from parent hub (e.g. Greenways dashboard tab, savings tour, finance finder).

**Avoid:** seven full iframes open at once on one page — use tabs / lazy-load one active agent.

---

## Wix site pattern — agent roster + one chat per page (recommended)

**Use on the public Greenways / Wix site** when each agent has a **character** (face of the agent). Same model as Live Music: Wix shell + Render iframe URL — see `HTMLS GWM GWB/WIX-LIVE-MUSIC-EMBED.md`.

### Site map

```text
Wix: “Meet the agents” hub
  └─ Group character art (all agents together) — links to specialist pages
  └─ Optional (WIP): ONE Embed a site → /greenways/guide-agent (conductor)
       └─ Click one character → dedicated Wix page for that agent
            └─ Hero (character + one-line role)
            └─ ONE Embed a site → /greenways/{agent}
            └─ Optional: 2–3 text links to related agents / full HTML portals
```

| Page type | Embed chat? | Notes |
|-----------|-------------|--------|
| **Agents hub** | **Optional one** — Guide conductor (`/greenways/guide-agent`) when shipped | Roster image + links; avoid seven iframes |
| **Per-agent page** | **Yes — exactly one** | Full chat for that role |
| **Buildings dashboard** (`Greenways Interface .html`) | Optional **one tab**, lazy-load | Staff view — not the public Wix pattern |

**Do not** put seven full agent iframes on one Wix page — performance, scroll, and focus all suffer.

### Production embed URLs (Embed a site)

Base: `https://energy-calc-backend.onrender.com`

| Name | Character role (Wix copy) | Chat URL |
|------|---------------------------|----------|
| **Andrieus** | Schemes & funding | `/greenways/grants-agent` |
| **Vincent** | Loans, BNPL, energy prices & payback | `/greenways/finance-agent` |
| **Artemis** | Equipment upgrades & premises renovation | `/greenways/equipment-agent` |
| **Zyanne** | Efficient products (water / elec / gas) | `/greenways/sustainable-products-agent` |
| **Zara** | Supply deals + product spotlights | `/greenways/deals-agent` |
| **Cheryce** | News, video & policy | `/greenways/media-agent` |
| **Edwardo** | Monitoring, sensors & systems visibility | `/greenways/systems-agent` |
| **Guide** (WIP) | Hub conductor — routes to specialists | `/greenways/guide-agent` — **not live** until HTML + server mount |

Append **`?embed=1`** on first test if sidebar/layout needs Wix containment (adds `html.embed-wix`).

**Boot a first question from Wix** (link or iframe src):

```text
https://energy-calc-backend.onrender.com/greenways/finance-agent?q=What+BNPL+options+exist+for+kitchen+equipment%3F
```

Supported query params on all Greenways agents: **`?q=`** or **`?prompt=`** (URL-encoded). Chat auto-sends after load (~400ms).

### Wix embed checklist (per agent page)

1. **Delete** uploaded HTML / Media HTML blocks for chat — use **Embed a site** (iframe URL) only, same as membership + energy ticker.
2. **URL:** `https://energy-calc-backend.onrender.com/greenways/{agent}` (add `?embed=1` while tuning height).
3. **Width:** 100% of content column (typical Wix max ~980–1200px).
4. **Height:** start **900px**; increase to **1100–1300px** if welcome card + showcase banner clip on desktop. Mobile: test on phone — agents use internal scroll in `.chat-panel`, not the Wix page (`wix-html-scroll` is already in each HTML file).
5. **Character hero** sits **above** the embed on Wix (Wix image from Media Manager — not inside the iframe).
6. **Images in marketing copy:** Wix static URLs only (`https://static.wixstatic.com/media/...`) — never repo-local paths on Wix.
7. **Publish** Wix after URL change; **Render** redeploys separately when you push agent HTML/JS (wait ~2–3 min, check `/health`).
8. **Verify:** send one message; confirm banner cards load (`/api/{agent}/samples`); tap a welcome chip.
9. **New chat:** each agent has **↺ New chat** in the header — no Wix action needed.

### Optional: pre-filled question from hub

On the hub, link a character to an agent page **with** a starter prompt:

```text
/grants-agent?q=What+Netherlands+grants+fit+a+restaurant%3F
/deals-agent?q=What+product+deals+and+weekly+spotlights+are+in+the+feed%3F
/sustainable-products-agent?q=Find+water-saving+commercial+dishwashers
```

Or use Wix buttons that only open the agent page; welcome tags inside the chat offer the same starters.

### Cross-links (suggested “Also see” on Wix agent pages)

| On this agent page… | Link to… | Why |
|---------------------|----------|-----|
| **Guide** (hub) | All specialists | Conductor → deep chat on agent page |
| Grants | Finance, Equipment | Fund the upgrade after finding schemes |
| Finance | Deals, Equipment | Tariffs + equipment; payback story |
| Equipment | Grants, Finance, Sustainable Products | Funding + catalog search |
| Sustainable Products | **Deals** | Product **spotlights** (weekly feed) |
| Deals | Sustainable Products, Finance | **Search** catalog vs supply/spotlights |
| Media | Grants, Equipment | Policy/news → action |
| Systems | (staff only) | Ops freshness — optional on public site |

Use normal Wix **text links** or buttons to other Wix agent pages — not extra iframes.

### Related agents outside the seven

| Product | URL | Notes |
|---------|-----|--------|
| **Live Music Guide** | `/live-music/render` | Parallel product — `WIX-LIVE-MUSIC-EMBED.md` |

### Dashboard embed (different from Wix public site)

If agents are added to `Greenways Interface .html`:

- One tab per agent **or** one “Assistants” tab with a `<select>` + single iframe.
- **Lazy-load:** set `iframe.src` only when the tab opens.
- Never mount seven iframes with `src` set at page load.

### Next agents (Greenways dashboard + live music — Jun 2026 backlog)

When adding chats to **Greenways Interface .html** tabs or refreshing **Music Guide**:

1. Copy **↺ New chat** button into `.guide-top` (or compact panel header) from Grants Agent.
2. Copy `clearChat()` + `bindWelcomeTags()` + per-agent `SESSION_KEY` rename.
3. Wire `document.getElementById("new-chat-btn").addEventListener("click", clearChat)`.
4. Music Guide compact panel (`live-music-finder.html` `#guide-panel`) — add button beside **Open full view** / **✕**.

**Reference:** Grants Agent header button label **↺ New chat** · title `Start a new conversation`.

---

## Staff admin — network map & portal toolkit (Jun 2026)

**Purpose:** Wire portal HTML pages to the right agents without editing seven chat shells by hand.

| Surface | URL | API |
|---------|-----|-----|
| Table overview | `/agents-admin.html` | `GET /api/agents-admin/overview` |
| **Network map** | `/agents-admin-map.html` | `GET /api/agents-admin/graph` |
| **Add portal tool** | Sidebar form on map | `POST /api/agents-admin/content-modules` |

**Map layers:** outer ring = seven agents + Orchestra · middle ring = **`greenways-content-modules.json`** (portal tools) · inner = shared JSON data files · edges = handoffs + **19 live referral welcomes**.

**Interaction:** **Click** a portrait to **pin** (green glow) — detail panel stays while you scroll the sidebar or use **Add to toolkit**. Toggle **Portal tools** / **Shared tool links** in the toolbar.

**After adding a module:** agents load it via `/data/greenways-content-modules.json` on next chat open. For a **sidebar quick link**, also update `data/greenways-agent-sidebar-config.json` and run **`npm run sync:agent-sidebar`**.

**Not covered yet:** paste external URL live-scrape, PDF upload, or site knowledge cards — see **`greenways-agents-roadmap.md`** Phase 2.

---

## Admin vs consumer skills (taxonomy)

**Greenways chat agents** (this skill) are **consumer-facing**: Wix embeds, public `/greenways/{agent}`, answers from published HTML + JSON only — no build scripts, MCP steps, or store admin in chat replies.

**Staff / admin skills** power ops, content, and diagnostics. They may surface **small consumer slices** (e.g. “new ETL product”) after the enrichment pipeline — never the full admin workflow in public chat.

| Layer | Type | Examples | Consumer chat? |
|-------|------|----------|----------------|
| **Greenways agents** | Consumer | Grants, Finance, Equipment, Products, Deals, Media, Guide (WIP) | ✅ Yes |
| **Systems Agent** | Hybrid | `Systems MD.md` — full ops in skill; chat = read-only verify | ⚠️ Staff-oriented |
| **Music Guide** | Consumer (parallel product) | `live-music-finder-skill.md` | ✅ Yes |
| **Hover cache** | Infrastructure | `hover-data-aggregator.md` → `data/hover-data.json` | No — pre-built tooltips |
| **Personalized impact** | Admin / member | `personalized-impact-hover.md` | No — “why this matters for **you**”; generic copy when no profile data |
| **Hover / site explainer agent** | Admin (planned) | Explains KPIs, tiles, grant chips on site | 🔜 Staff / member; not a 8th public specialist |
| **Content & ops** | Admin | `content-operations.md`, `sustainability-blog-writer.md`, `html-content-creator.md` | No |
| **Members & store** | Admin | `member-manager.md`, `Greenways Market Manager MD.md` | No — optional consumer **flags** only (see below) |
| **Product pipeline** | Admin | `product-addition-workflow.md`, `product-deep-dive.md`, `grants-schemes-finder.md` | Output feeds agents |

**Rule:** If a skill mentions `npm run`, Wix MCP, merge scripts, or member DB writes → **admin**. Consumer agents **read** the resulting JSON/HTML.

### Hover Data Aggregator (infrastructure, not an agent)

Pre-builds **`data/hover-data.json`** so product hovers show **grants + deals previews** without live API calls.

```
products-with-grants-and-collection.json  ─┐
data/deals-cache.json (optional)          ─┼→  node build-hover-data-cache.js
```

Per `etl_*` row: marketplace URL, 1–2 grant previews (from enrichment only), 0–2 deal previews. Rebuild after grants integrator or deals refresh. See `Skills/hover-data-aggregator.md`.

**Pairing:** Aggregator = *what* (grants/deals/links). **Personalized impact** = *why it matters* (cost, eligibility, next step) — see `Skills/personalized-impact-hover.md`, cache `data/personalized-impact-cache.json`, mapping `data/personalized-impact-map.json`.

### Planned: Hover / site explainer agent (admin)

Future chat for staff and (optionally) logged-in members:

- Explain dashboard KPIs, utility tiles, scheme chips, deep-dive sections
- Grounded in cached explainers + profile/appliance data when available; **generic region/sector copy** when not
- Same stack as other agents but `?staff=1` or membership gate — **not** on the public seven-agent roster

### Backlog: merge into existing agents / consumer slices

| Item | Target | Notes |
|------|--------|--------|
| **Historical cost comparisons** | **Finance Agent** | `historical-data-finder.md` — “if you upgraded N months ago at then-current tariffs…” using `data/energy-price-history.json` + ETL kWh; **illustrative** without meter data; stronger with member usage later. Intents e.g. `historical_savings`, `upgrade_timing`. |
| **New ETL on marketplace** | **Equipment** and/or **Deals** / Products banner | After admin pipeline: ETL → grants integrator → photo → deep dive. Consumer flag only — not full Market Manager in chat. |
| **HTML from member data** | Future agent or Finance/Equipment handoff | Not free-form HTML editor — chat → **JSON page spec** → locked template (`html-content-creator.md` patterns). Preview + embed snippet for Wix. |

---

## Related skills & data

| Topic | Skill / file |
|-------|----------------|
| Scheme catalogue maintenance | `Skills/grants-schemes-finder.md` → `schemes.json` |
| Finance finder (non-chat) | `Skills/energy-dashboard-skill.md` § Restaurant finance finder |
| Product grants enrichment | `Skills/product-addition-workflow.md` |
| Music guide chat pattern | `Skills/live-music-finder-skill.md` § Music guide |
| Dashboard embed targets | `Skills/energy-dashboard-skill.md` |
| Wix agents hub + per-page embed | This skill § **Wix site pattern**; live music parallel: `HTMLS GWM GWB/WIX-LIVE-MUSIC-EMBED.md` |
| Wix scroll / iframe gotchas | `WIX-SCROLL-FIX.md` |
| Hover grants/deals cache | `Skills/hover-data-aggregator.md` → `build-hover-data-cache.js` |
| Personalized “why it matters” | `Skills/personalized-impact-hover.md` (admin/member) |
| Historical cost vs prices | `Skills/historical-data-finder.md` → **Finance Agent** backlog |
| Store admin vs consumer discovery | `Skills/Greenways Market Manager MD.md` |
| Admin vs consumer taxonomy | This skill § **Admin vs consumer skills** |
| Staff network map + add toolkit | This skill § **Staff admin — network map & portal toolkit**; `agents-admin-map.html` |
| Portal story / highlights | `/greenways/agents-story` · `/greenways/agents-highlights` · `npm run build:agent-highlights` |

---

## Local URLs

```text
http://localhost:4000/greenways/grants-agent
http://localhost:4000/greenways/finance-agent
http://localhost:4000/greenways/equipment-agent
http://localhost:4000/greenways/sustainable-products-agent
http://localhost:4000/greenways/deals-agent
http://localhost:4000/greenways/media-agent
http://localhost:4000/greenways/systems-agent
http://localhost:4000/greenways/agents-story
http://localhost:4000/greenways/agents-highlights
http://localhost:4000/agents-admin-map.html
http://localhost:4000/agents-admin.html
http://localhost:4000/greenways/finance-agent?embed=1&q=What+are+current+energy+prices+in+the+Netherlands%3F
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | **Staff admin map — portal toolkit** — `agents-admin-map.html` middle ring = content modules; `POST /api/agents-admin/content-modules`; click-to-pin; § **Staff admin — network map & portal toolkit**. Portal URLs in Local URLs. |
| 2026-06-14 | **Right panel sidebar order** — default agents: **Ask about** above **Quick links** (Vincent framing); shared note in `greenways-agent-sidebar.css`. **Exception:** Edwardo (`systems-agent`) — Ops verify → Quick links → Ask about (unchanged). |
| 2026-06-14 | **Scheme tablet Ask button** — fix vertical “Ask about” text on Vincent/Artemis/etc.: higher-specificity pill styles in `greenways-agent-turn-ui.css` beat per-agent inline `.scheme-chip-ask` 22px circle. |
| 2026-06-14 | **Cheryce banner images** — missing photos = no `imageUrl` in `data/companies.json`; FoodMesh fixed; `DEFAULT_COMPANY_CARD_IMAGE` fallback in `media-agent-companies.js`. |
| 2026-06-13 | **Cheryce `finishAgentTurn` crash (`b8379c4`)** — `intentId` before `sourceLabel`; false “Could not reach” after successful API. |
| 2026-06-13 | **Cheryce quick links + Render reliability** — sidebar opens full GWB pages (`contentBase`, `target="_top`); map explain/helper Ask: 90s timeout + retries; commit `c517979`. |
| 2026-05-28 | **Named Transition Agents** — roster skill `greenways-transition-agents.md`; character portraits all seven; absolute turn-ui paths; Wix silent-JS fixes; `footHtml` on Grants turns. |
| 2026-05-28 | **Admin vs consumer taxonomy** — hover cache, personalized impact, planned hover explainer agent, historical → Finance, Market Manager consumer flags, template-based HTML from chat. |
| 2026-05-28 | **Greenways Guide (WIP)** — orchestrator backend: `guide-agent-intents.json`, `guide-agent-roster.json`, `guide-agent-knowledge.js`, `routes/guide-agent.js`; HTML + `server-new.js` mount pending. |
| 2026-05-28 | **LLM per agent** — documented env pattern (`GRANTS_AGENT_*`, `ASSISTANT_*` fallback); recommend different models per role from one provider. |
| 2026-05-28 | **Wix embed guide** — agent roster hub + one chat per page; production URLs, `?q=` boot, height checklist, cross-links. |
| 2026-05-28 | **Product deals visibility** — Deals (spotlights) + Sustainable Products (search) cross-link in UI and intents. |
| 2026-05-28 | **Media Agent** — news KB, Wix videos (`wix-media-service.js`), photo showcase; public `/api/media-agent/videos`; purple theme. |
| 2026-05-28 | **Media Agent + sustainability map** — `media-agent-companies.js`, `companies.json` case studies; intents `sustainability_map`, `energy_examples`; monthly news cross-links map picks. |
| 2026-05-28 | **Finance + Equipment + Deals agents** shipped — distinct accent themes, photo showcase from DB/feed/finance finder; scaffold script; shared `greenways-agent-shared.js`. |
| 2026-05-28 | **Equipment + renovation merge** — renovation/insulation intents on Equipment Agent; not a separate chat agent. |
| 2026-05-28 | **Finance + energy prices merge** — ticker, upgrade case, tariff compare intents on Finance Agent. |
| 2026-05-28 | **↺ New chat** on all seven Greenways consumer agents; Music Guide + dashboard clones still TODO. |
| 2026-05-28 | Pilot shipped: Grants Agent UI (blue), product banner, 10 interactive features, compare API, chat-panel height fix, collapsible compare dock. Documented as foundation for future Greenways chat interfaces. |
