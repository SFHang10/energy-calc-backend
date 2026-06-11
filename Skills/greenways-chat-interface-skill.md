# Greenways Chat Interface — Foundation Skill

**Skill type:** UI + API pattern (clone for new agents)  
**Pilot implementation:** **Grants Agent** (May 2026)  
**Sibling reference:** **Music Guide** (`live-music-guide.html` / compact panel in `live-music-finder.html`)  
**Status:** Use this as the **canonical foundation** when building the next Greenways chat interfaces (equipment, finance, sustainability, etc.)

---

## Purpose

One repeatable stack for Wix-embeddable agent chats:

1. **Knowledge first** — intents + local JSON catalogue (fast, no API keys).
2. **Optional LLM** — per-agent, env-gated polish on top of retrieved facts (see § **LLM per agent**).
3. **Rich HTML shell** — product/showcase banner, scrollable chat, interactive chips, session memory, offline fallbacks.

Do **not** reinvent layout per agent — fork `greenways-grants-agent.html` and swap data layer + theme accent.

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
| UI | `HTMLS GWM GWB/greenways-guide-agent.html` | ❌ not created (use `scripts/scaffold-guide-agent-html.js` or manual fork of grants/finance HTML) |
| Short URL | `/greenways/guide-agent` | ❌ register in `server-new.js` with `/api/guide-agent` |

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
| **Upgrade case (prices → kit)** | `price_upgrade_case` | `equipment-savings-projection.html`, Equipment Agent |
| **Retail tariff compare** | `compare_tariffs` | `european_energy_deals_portal.html`, Deals Agent |

Knowledge: `services/finance-agent-knowledge.js` + `services/finance-agent-energy.js`.

### Equipment Agent — kit + premises renovation (May 2026)

Renovation is **not** a separate agent. Equipment Agent covers **changing how your site runs** — new efficient kit **and** building upgrades (insulation, retrofit, phased project plans).

| Topic | Intents | Consumer HTML |
|-------|---------|---------------|
| **Premises renovation** | `renovation`, `renovation_plan` | `Sustainable Renovations New .html`, `HTMLs/Renovation project plans.html` |
| **Insulation & fabric** | `insulation` | `Importance of Insulation.html` |
| **Building grants** | `renovation_grants` | Grants Agent cross-link; schemes from `schemes.json` |

Knowledge: `services/equipment-agent-knowledge.js` · intents: `data/equipment-agent-intents.json`.

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

---

## Interactive features (Grants Agent pilot — replicate on clones)

| # | Feature | Implementation notes |
|---|---------|----------------------|
| 1 | Follow-up chips | `followUpChips(intentId, profile, question)` under each agent bubble |
| 2 | Showcase → chat | **Ask about grants** on product cards (`data-prompt`) |
| 3 | Scheme chips | Tap = select for compare · **?** = ask agent · **↗** = official link |
| 4 | Profile nudge | `change` on profile selects → `#profile-nudge` + tailored prompt |
| 5 | New chat | `#new-chat-btn` (`.header-ghost-btn`) → `clearChat()` — resets `sessionTurns`, `msgId`, welcome card, `quick-reply-bar`, `SESSION_KEY`; see `greenways-grants-agent.html` ~L1453 |
| 6 | Message motion | `.msg-row` slide-in; `.is-thinking` avatar pulse |
| 7 | Quick-reply bar | `#quick-reply-bar` after first answer |
| 8 | Typed reveal | `revealTypedAnswer()` word-by-word before chips |
| 9 | Session memory | `sessionStorage` key `gw-grants-agent-session-v1` (rename per agent) |
| 10 | Compare | Select 2 scheme chips → `POST /api/grants-agent/compare` (offline table fallback) |

---

## API response shape (standardise)

```json
{
  "ok": true,
  "answer": "markdown string",
  "suggestions": [{ "id", "title", "region", "type", "url", "description", "deadline" }],
  "productSamples": [{ "id", "name", "imageUrl", "marketplaceHref", "grantsCount", "topGrants" }],
  "source": "knowledge | heuristic | llm | offline | orchestrator",
  "intentId": "nl_schemes | equipment | compare | …",
  "agentHandoffs": [{ "id", "name", "href", "prompt" }],
  "routedTo": ["finance"],
  "primaryAgent": "finance"
}
```

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

**Shared module:** `services/greenways-agent-llm.js` — used by Grants, Music Guide, dashboard assistant.

| Agent | Env vars (example) | Fallback | Notes |
|-------|-------------------|----------|--------|
| **Grants** | `GRANTS_AGENT_PROVIDER`, `GRANTS_AGENT_API_KEY`, `GRANTS_AGENT_MODEL` | `ASSISTANT_*` | `routes/grants-agent.js`; system prompt restricts to `suggestions` JSON |
| **Music Guide** | `MUSIC_GUIDE_PROVIDER`, `MUSIC_GUIDE_API_KEY`, `MUSIC_GUIDE_MODEL` | `ASSISTANT_*` | `routes/music-guide.js` |
| **Dashboard assistant** | `ASSISTANT_PROVIDER`, `ASSISTANT_API_KEY`, `ASSISTANT_MODEL` | — | `routes/assistant.js` |
| **Finance, Equipment, Deals, …** | `{AGENT}_AGENT_*` (recommended) | `ASSISTANT_*` | Knowledge-only today — copy Grants pattern when enabling |

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

## Cloning checklist (next agent)

1. Copy `greenways-grants-agent.html` → `greenways-{name}-agent.html`.
2. Copy `data/grants-agent-intents.json` → new intents; point `answerType` handlers at your catalogue.
3. Copy `services/grants-agent-knowledge.js` → new service reading **one canonical JSON** (do not duplicate scheme rows in HTML).
4. Copy `routes/grants-agent.js` → mount at `/api/{name}-agent`.
5. Register in `server-new.js` + optional `/greenways/{name}-agent` short route.
6. Update showcase JSON + `STATIC_*` fallback in HTML if the banner shows entities (products, venues, schemes).
7. Rename `SESSION_KEY` and status copy.
8. Add row to **`AGENTS.md`** + this skill’s agent table.
9. Link from parent hub (e.g. Greenways dashboard tab, savings tour, finance finder).

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

| Agent | Character role (suggested Wix copy) | Chat URL |
|-------|--------------------------------------|----------|
| **Grants** | Schemes & funding | `/greenways/grants-agent` |
| **Finance** | Loans, BNPL, energy prices & payback | `/greenways/finance-agent` |
| **Equipment** | Kit upgrades & premises renovation | `/greenways/equipment-agent` |
| **Sustainable Products** | Search efficient products (water / elec / gas) | `/greenways/sustainable-products-agent` |
| **Deals** | Supply deals + product spotlights | `/greenways/deals-agent` |
| **Media** | News, video & policy | `/greenways/media-agent` |
| **Systems** | Health checks (staff-oriented) | `/greenways/systems-agent` |
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
| Finance | Deals, Equipment | Tariffs + kit; payback story |
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
http://localhost:4000/greenways/guide-agent   ← WIP (404 until server-new.js + HTML)
http://localhost:4000/greenways/finance-agent?embed=1&q=What+are+current+energy+prices+in+the+Netherlands%3F
```

---

## Changelog

| Date | Change |
|------|--------|
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
