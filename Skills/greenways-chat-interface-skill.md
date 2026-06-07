# Greenways Chat Interface — Foundation Skill

**Skill type:** UI + API pattern (clone for new agents)  
**Pilot implementation:** **Grants Agent** (May 2026)  
**Sibling reference:** **Music Guide** (`live-music-guide.html` / compact panel in `live-music-finder.html`)  
**Status:** Use this as the **canonical foundation** when building the next Greenways chat interfaces (equipment, finance, sustainability, etc.)

---

## Purpose

One repeatable stack for Wix-embeddable agent chats:

1. **Knowledge first** — intents + local JSON catalogue (fast, no API keys).
2. **Optional LLM** — only when knowledge/heuristic miss (env-gated).
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

### Music Guide (earlier sibling)

| Layer | Path |
|-------|------|
| Intents | `data/music-guide-intents.json` |
| Knowledge | `services/music-guide-knowledge.js` ← `data/music-venues.json` |
| API | `routes/music-guide.js` |
| Full UI | `HTMLS GWM GWB/live-music-guide.html` |
| Compact embed | `live-music-finder.html` guide panel |

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
| 5 | New chat | `#new-chat-btn` clears thread + `sessionStorage` |
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
  "source": "knowledge | heuristic | llm | offline",
  "intentId": "nl_schemes | equipment | compare | …"
}
```

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

## Related skills & data

| Topic | Skill / file |
|-------|----------------|
| Scheme catalogue maintenance | `Skills/grants-schemes-finder.md` → `schemes.json` |
| Finance finder (non-chat) | `Skills/energy-dashboard-skill.md` § Restaurant finance finder |
| Product grants enrichment | `Skills/product-addition-workflow.md` |
| Music guide chat pattern | `Skills/live-music-finder-skill.md` § Music guide |
| Dashboard embed targets | `Skills/energy-dashboard-skill.md` |

---

## Local URLs

```text
http://localhost:4000/greenways/grants-agent
http://localhost:4000/HTMLS%20GWM%20GWB/greenways-grants-agent.html
http://localhost:4000/HTMLS%20GWM%20GWB/greenways-grants-agent.html?embed=1
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-28 | Pilot shipped: Grants Agent UI (blue), product banner, 10 interactive features, compare API, chat-panel height fix, collapsible compare dock. Documented as foundation for future Greenways chat interfaces. |
