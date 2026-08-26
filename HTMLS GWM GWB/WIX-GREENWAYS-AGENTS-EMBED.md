# Wix embed — Greenways chat agents (one agent per page)

**Full detail:** `Skills/greenways-chat-interface-skill.md` § **Wix site pattern**

**Pattern:** Agents **hub** (character group image, links to specialists) → **Orchestra** conductor iframe → each **agent Wix page** (character hero + **one** Render iframe).

---

## Hub conductor (Orchestra)

**Opening page** — one Wix embed routes visitors to specialists (no seven chat iframes on one page):

```
https://energy-calc-backend.onrender.com/greenways/orchestra-hub-wix-frame
```

Character mosaic + inner hub (`orchestra-hub?embed=1`). Full hub without frame:

```
https://energy-calc-backend.onrender.com/greenways/orchestra-hub
```

Alias: `/greenways/guide-agent` → same hub HTML. API: `POST /api/guide-agent/ask` → `primaryAgent`, `routedTo`, short answer; tap glowing portrait → specialist with `?q=`.

**Referral welcomes:** team-strip handoffs pass `profile.handoff` on first `/ask` — **19 live pairs** (e.g. Zyanne→Artemis, Cheryce→Andrieus) via `services/greenways-agent-handoff.js`. Staff map: `/agents-admin-map.html` (portal tools + data wiring).

**Portal entry pages (Wix marketing):**

```
https://energy-calc-backend.onrender.com/greenways/customer-hub-demo
https://energy-calc-backend.onrender.com/greenways/customer-hub
https://energy-calc-backend.onrender.com/greenways/agents/grants-agent/story
https://energy-calc-backend.onrender.com/greenways/agents-story
https://energy-calc-backend.onrender.com/greenways/agents-highlights
```

**Your Hub demo** (`/greenways/customer-hub-demo`) = website sample with anonymised **Wok Restaurant** branding and portal menus hidden. **Your Hub** (`/customer-hub`) = member home (saved / suggestions / deals / news) — may show linked tenant packs when signed in. **Agent story** = per-specialist selling page (`/greenways/agents/{slug}/story`, JSON in `data/greenways-agent-stories/`) — intro, video slot, 3-step journeys, live tool demos. Story = why the agents exist · Highlights = weekly grounded picks per specialist (`npm run build:agent-highlights`). Shared portal nav links Hub ↔ story ↔ highlights ↔ Orchestra ↔ agent map.

### Website embeds vs demo (full menu) — Aug 2026

Use **`-embed` URLs** (or `?embed=1`) on the **new Wix website** so portal family menus stay hidden. Keep **full menu** URLs for demos / internal portal tours.

| Wix page purpose | Embed URL (website iframe) | Full menu (demos / dedicated portal page) |
|------------------|----------------------------|-------------------------------------------|
| Why this portal | `/greenways/agents-story-embed` | `/greenways/agents-story` |
| Portal highlights | `/greenways/agents-highlights-embed` | `/greenways/agents-highlights` |
| Cheryce video desk | `/greenways/media-video-desk-embed` | `/greenways/media-video-desk` |
| Vincent finance desk | `/greenways/finance-desk-embed` | `/greenways/finance-desk` |
| Orchestra / operate portal | `/greenways/orchestra-hub-embed` (or `?embed=1` / wix-frame) | `/greenways/orchestra-hub` |
| Your Hub (live / member) | `/greenways/customer-hub?embed=1` | `/greenways/customer-hub` |
| Your Hub (**website demo** — no client brand) | `/greenways/customer-hub-demo` | same (menus already hidden) |
| Restaurant story (**website demo**) | `/greenways/tenants/wok-restaurant-demo` | live: `/greenways/tenants/wok-to-walk` |
| Restaurant Assist chat (**website demo**) | `/greenways/restaurant-assist-demo` | live: `/greenways/wok-assist` |
| Agent story (per character) | `/greenways/agents/{slug}/story-embed` | `/greenways/agents/{slug}/story` |
| Agent chat | `/greenways/{slug}?embed=1` | `/greenways/{slug}` |

**Base:** `https://energy-calc-backend.onrender.com`

#### Why the portal — website iframe (no menus)

```
https://energy-calc-backend.onrender.com/greenways/agents-story-embed
```

#### Cheryce · Video desk (website showcase, no menus)

Cinema briefing for Greenways library videos — featured clip + library grid. Opens the same professional player used in Cheryce chat.

```
https://energy-calc-backend.onrender.com/greenways/media-video-desk-embed
```

Full page (same UI): `/greenways/media-video-desk`

#### Vincent · Finance desk (website showcase, no menus)

Blue finance tour — animated gauges, tablet previews, energy cost guide as first tab.

```
https://energy-calc-backend.onrender.com/greenways/finance-desk-embed
```

Full page (same UI): `/greenways/finance-desk` · Cost guide tab: `?tab=cost-guide`

Tool short routes (used inside the desk): `/greenways/energy-cost-guide` · `/greenways/energy-ticker` · `/greenways/finance-finder` · `/greenways/service-hour-cost-board`

#### Orchestra — website iframe (no menus)

```
https://energy-calc-backend.onrender.com/greenways/orchestra-hub-embed
```

Also works: `/greenways/orchestra-hub?embed=1`

#### One page to operate the portal (menus OK — dedicated Wix page)

```
https://energy-calc-backend.onrender.com/greenways/orchestra-hub
```

or framed (character mosaic + inner hub):

```
https://energy-calc-backend.onrender.com/greenways/orchestra-hub-wix-frame
```

#### Individual agent story pages (separate Wix pages)

| Agent | Story (embed) | Story (full menu) | Chat embed |
|-------|---------------|-------------------|------------|
| Andrieus | `/greenways/agents/grants-agent/story-embed` | `…/grants-agent/story` | `/greenways/grants-agent?embed=1` |
| Vincent | `/greenways/agents/finance-agent/story-embed` | `…/finance-agent/story` | `/greenways/finance-agent?embed=1` |
| Artemis | `/greenways/agents/equipment-agent/story-embed` | `…/equipment-agent/story` | `/greenways/equipment-agent?embed=1` |
| Zyanne | `/greenways/agents/sustainable-products-agent/story-embed` | `…/sustainable-products-agent/story` | `/greenways/sustainable-products-agent?embed=1` |
| Zara | `/greenways/agents/deals-agent/story-embed` | `…/deals-agent/story` | `/greenways/deals-agent?embed=1` |
| Cheryce | `/greenways/agents/media-agent/story-embed` | `…/media-agent/story` | `/greenways/media-agent?embed=1` |
| Edwardo | `/greenways/agents/systems-agent/story-embed` | `…/systems-agent/story` | `/greenways/systems-agent?embed=1` |

#### Investor / knowledge snapshots (site embeds only — not agent chat modules)

These pages stay available for investor or marketing embeds. Agents use the **facts** (monitoring importance, NL smart-meter policy, metering subsidies) in answers; they do **not** open these docs as chat tablets.

```
https://energy-calc-backend.onrender.com/greenways/interactive-restaurants
https://energy-calc-backend.onrender.com/greenways/city-energy-monitoring
```

---

## Embed a site (preferred)

1. Wix **Add** (+) → **Embed** → **Embed a site**
2. Paste URL (replace `{agent}`):

```
https://energy-calc-backend.onrender.com/greenways/{agent}?embed=1
```

3. Width **100%** · height start **900px** (bump to **1100–1300px** if clipped)
4. **Publish**

### Agent URLs

| Name | Role | `{agent}` slug |
|------|------|----------------|
| **Andrieus** | Grants & schemes | `grants-agent` |
| **Vincent** | Finance & payback | `finance-agent` |
| **Artemis** | Equipment & renovation | `equipment-agent` |
| **Zyanne** | Sustainable products | `sustainable-products-agent` |
| **Zara** | Deals & spotlights | `deals-agent` |
| **Cheryce** | News & media | `media-agent` |
| **Edwardo** | Systems health | `systems-agent` |
| **Orchestra** | Hub conductor | `orchestra-hub-embed` (no menus) · `orchestra-hub` (full) · `orchestra-hub-wix-frame` |

Full roster + skills map: `Skills/greenways-transition-agents.md`

---

## Starter question from hub (optional)

Add to iframe URL or Wix link:

```
?q=Your+question+here
```

Example:

```
https://energy-calc-backend.onrender.com/greenways/deals-agent?q=What+product+deals+are+live%3F
```

(`?prompt=` works the same.)

---

## Do not

- Seven chat iframes on one Wix page (one specialist embed per agent page; use **one** Orchestra hub embed for routing)
- Upload agent HTML to Wix Media — breaks API paths
- Local image paths in Wix marketing — use `static.wixstatic.com` only

---

## Voice (mic + listen) in Wix iframes

All seven agents expose **🎤 Speak** and **🔊 Listen** on the compose row when `voiceEnabled` is true in `data/greenways-agent-voice-config.json`.

**Wix iframe limits:**

- **Listen (🔊)** — usually works inside an embed; uses browser `speechSynthesis` and the agent’s `spokenSummary` from `/ask`.
- **Mic (🎤)** — may be blocked when the chat runs in a cross-origin iframe. Browsers often deny `SpeechRecognition` unless the user grants microphone permission to the **Render** origin (`energy-calc-backend.onrender.com`), not only the Wix parent page.
- **Workaround for demos:** open the agent **full page** (no `?embed=1`) in a new tab so mic permission targets Render directly:

```
https://energy-calc-backend.onrender.com/greenways/grants-agent
https://energy-calc-backend.onrender.com/greenways/sustainable-products-agent
```

- **Sync after config changes:** `node scripts/sync-greenways-agent-voice.js` (wires assets + buttons on all seven HTML shells).
- **Premium TTS (optional):** set `SKILLBOSS_API_KEY` or `ELEVENLABS_API_KEY` on Render — Andrieus tries `POST /api/agent-voice/tts` first (`useServerTts: true` in voice config), others use browser voice until enabled.
- **Member auto-listen (🔁):** shown only when `profile.tier=member` (from `greenways_member_context_v1`). Opt-in persists in `localStorage` (`gw-voice-listen-mode-v1`). Each reply then reads `spokenSummary` aloud; tap **⏹** on the Listen button to stop. Public embeds stay unchanged until a member opts in.

---

## After backend changes

Push GitHub → wait for Render deploy → test `/health` → hard-refresh Wix page (iframe cache).

**Full-page iframe (recommended):** use the agent URL **without** `?embed=1` and set Wix height **900–1100px** — sidebar + compose stay visible. Example:

```
https://energy-calc-backend.onrender.com/greenways/deals-agent
```

---

## Prototypes — character + compact embed (saved for later)

Not used in production now (full iframe is simpler), but kept in the repo for per-agent experiments.

| File | Local open | Render (when deployed) |
|------|------------|------------------------|
| `greenways-deals-agent-embed-test.html` | Simulated Wix page: Zara art beside a **480px** iframe + parent expand script | `/greenways/deals-agent-embed-test` |
| `greenways-deals-agent-wix-frame.html` | **One embed**: character column + inner chat iframe | `/greenways/deals-agent-wix-frame` |
| `js/greenways-agent-embed-expand.js` | **⛶ Full chat** in agent header (`?embed=1`) | same path under `/HTMLS GWM GWB/js/` |
| `js/wix-greenways-embed-parent.js` | Wix page listener — resizes outer iframe | same path under `/HTMLS GWM GWB/js/` |
| `wix-zara-expand-snippet.html` | Copy-paste HTML embed for Wix parent script | — |

**Clone pattern for another agent:** copy the wix-frame + embed-test pair, swap portrait URL, inner iframe slug, and `agent: "deals"` in `postMessage` payloads.
