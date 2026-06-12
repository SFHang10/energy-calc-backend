# Greenways Transition Agents — Roster & Skills Map

**Skill type:** Canonical registry (agents ≠ skills)  
**Orchestrator:** Route agent **names** and “Greenways agents” questions here first, then to **`greenways-chat-interface-skill.md`** for UI/API detail.  
**Last updated:** 28 May 2026

---

## Purpose

**Greenways Transition Agents** are the **client-facing** specialists on the public Wix site. Users meet them by **name**; each agent is a character + chat embed backed by Render (`/greenways/{slug}`).

**Skills** (in `Skills/`) are **capabilities** — workflows, data pipelines, HTML tools, and admin ops. Skills are **not** chat personas. Over time, every skill should declare where it **lives** — one or more homes is normal.

| Home type | Who uses it | Examples |
|-----------|-------------|----------|
| **Consumer agent(s)** | Public site visitors via chat or linked HTML | Andrieus reads `schemes.json`; Zara + Zyanne both use deal/product data |
| **Administrator** | Staff / ops (future admin agents or dashboards) | Market Manager, content-ops, full Systems MD diagnostics |
| **Infrastructure** | Pre-built data or shared UI (no single persona) | Hover cache, shared turn UI, enriched product JSON |

**Rule of thumb:** If you are talking to **Andrieus** or **Zara**, you mean an **agent**. If you are running `npm run`, editing `schemes.json`, or fixing Wix store images, you mean a **skill**.

### Shared skills (expected — not one agent each)

Many skills are **shared**. That does not break the model — document **all** homes, not just one.

| Pattern | Meaning | Example |
|---------|---------|---------|
| **Multi-agent consumer** | Same skill, different **angles** per agent | `product-deal-finder` → **Zara** (spotlights) + **Zyanne** (search/compare) |
| **Primary + cross-link** | One agent **owns** the topic; others hand off | `grants-schemes-finder` → **Andrieus** primary; **Artemis** / **Vincent** link to schemes in renovation/payback answers |
| **Admin builds → many agents read** | Staff skill feeds several consumer surfaces | `product-addition-workflow` → Administrator only; output used by **Artemis**, **Zara**, **Zyanne**, **Andrieus** |
| **Platform / UI skill** | Shared by all agents | `greenways-chat-interface-skill.md`, `greenways-agent-turn-ui.js`, `greenways-agent-shared.js` |
| **Infrastructure** | UI or cache, no chat persona | `hover-data-aggregator`, `calculator-cohesion` |

When mapping a skill, use:

- **Consumer homes:** comma-separated agent names (can be **all seven** for platform skills)
- **Admin home:** optional — often the only place the skill is *edited*
- **Primary consumer:** optional — who users should **ask first** when the skill spans multiple agents

**Example — `product-deal-finder`:** Admin builds `deals-feed.json` · **Primary consumer:** Zara (weekly spotlights) · **Also:** Zyanne (catalog search) · **Cross-link:** Vincent (payback context), Artemis (equipment alternatives).

---

## The seven agents (built — May 2026)

These are the **Greenways Transition Agents**. Refer to them by **name** in chat, PRDs, and Wix copy.

| Name | Role | Slug | HTML | Theme |
|------|------|------|------|-------|
| **Andrieus** | Grants & schemes | `grants-agent` | `greenways-grants-agent.html` | Blue `#007bff` |
| **Vincent** | Finance, BNPL, loans, energy prices & payback | `finance-agent` | `greenways-finance-agent.html` | Gold `#c9a961` |
| **Artemis** | Equipment upgrades + premises renovation | `equipment-agent` | `greenways-equipment-agent.html` | Green `#28a745` |
| **Zara** | Deals, tariffs & product spotlights | `deals-agent` | `greenways-deals-agent.html` | Orange `#ff8c1a` |
| **Cheryce** | News, video & policy media | `media-agent` | `greenways-media-agent.html` | Purple accent |
| **Zyanne** | Sustainable products (water / elec / gas lanes) | `sustainable-products-agent` | `greenways-sustainable-products-agent.html` | Teal / lane colours |
| **Edwardo** | Systems & equipment — monitoring, sensors, dashboards (+ ops health verify) | `systems-agent` | `greenways-systems-agent.html` | Neutral / amber |

**Production URL pattern:**

```text
https://energy-calc-backend.onrender.com/greenways/{slug}
```

**Wix embed:** `HTMLS GWM GWB/WIX-GREENWAYS-AGENTS-EMBED.md` · UI foundation: **`greenways-chat-interface-skill.md`**

### Character portraits (Wix Media)

All seven use `AGENT_PROFILE` + `TurnUi.avatarMarkup()` — portraits hosted on Wix static CDN:

| Agent | Wix media id |
|-------|----------------|
| Andrieus | `c123de_46943b6b1f8d41a59960fd8fdde4097b~mv2.png` |
| Vincent | `c123de_63359ab891354966aa9ff792fe998677~mv2.png` |
| Artemis | `c123de_126830b1fc224df880dfa37ec830620e~mv2.png` |
| Zara | `c123de_c7cdbed4a4ee407289677a4f0079c1e5~mv2.png` |
| Cheryce | `c123de_333c90ab8930465a98b503e1d24316b4~mv2.png` |
| Zyanne | `c123de_dc5b2e3e4aef4cc4b75c7b44888281bd~mv2.png` |
| Edwardo | `c123de_eeb61cbf84bd402eb642e28b2b457c76~mv2.png` |

Hero art on Wix pages sits **above** the iframe; avatars in chat come from `AGENT_PROFILE.imageUrl` inside each HTML file.

---

## Built vs in progress

### ✅ Built (shipped)

| Layer | Status |
|-------|--------|
| **Seven agent HTML shells** | Shared split/tablet turn UI, ↺ New chat, showcase banners, session memory |
| **Shared turn UI** | `HTMLS GWM GWB/js/greenways-agent-turn-ui.js` + `.css` |
| **API routes** | `POST /api/{agent}-agent/ask`, `GET /samples` (and grants `compare`) |
| **Knowledge services** | `services/{agent}-agent-knowledge.js` (+ shared `greenways-agent-shared.js`) |
| **Character names + portraits** | All seven `AGENT_PROFILE` blocks |
| **Render short URLs** | `/greenways/{slug}` in `server-new.js` |
| **Wix embed docs** | `WIX-GREENWAYS-AGENTS-EMBED.md` |

**Deploy note (May 2026):** Turn-ui assets must use **absolute** paths on `/greenways/*` embeds (not relative `js/...` before `<base>`) — see § **Wix embed gotchas** in `greenways-chat-interface-skill.md`.

### 🔜 In progress / backlog

| Item | Target | Notes |
|------|--------|-------|
| **Greenways Guide** (hub conductor) | 8th route, not a named specialist | Backend WIP; HTML + `server-new.js` mount pending |
| **Richer copy + `blocks[]`** | Zara, Cheryce, Zyanne especially | UI shell done; knowledge can deepen incrementally |
| **Dashboard agent tabs** | `Greenways Interface .html` | Lazy-load one iframe per tab — not seven at once |
| **Expand/compact embed prototypes** | Per-agent optional | Saved for Zara only; not production — see WIX embed doc § Prototypes |
| **Administrator agents** | Future | Staff-facing roles beyond Edwardo’s lightweight verify |
| **Skill → agent wiring** | Ongoing | See table below — many skills already mapped, more to attach |

### Parallel product (not one of the seven)

| Name | Product | Skill |
|------|---------|-------|
| Music Guide | Live music discovery chat | `live-music-finder-skill.md` |

---

## Skills → agent homes (current map)

Skills **power** agents; they are not interchangeable with agent names. **Shared** skills list every consumer home; **Primary** = ask this agent first.

| Skill | Consumer homes | Primary | Admin home | Notes |
|-------|----------------|---------|------------|-------|
| `greenways-chat-interface-skill.md` | **All seven** | — | — | Shared UI/API pattern |
| `grants-schemes-finder.md` | **Andrieus** (+ cross-link Artemis, Vincent) | Andrieus | Staff edits `schemes.json` | Schemes portals |
| `energy-dashboard-skill.md` | **Vincent**, Artemis, dashboard | Vincent (finance §) | — | Finance finder, savings tour, buildings UI |
| `energy-ticker.md`, `rate-consultant.md` | **Vincent**, Zara | Vincent | — | Prices → upgrade story |
| `product-deep-dive.md` | **Artemis**, Zyanne | Artemis | Staff builds JSON | Marketplace + alternatives |
| `sustainable-renovation-planner.md` | **Artemis** | Artemis | Staff plans | Renovation HTML |
| `product-deal-finder.md` | **Zara**, **Zyanne** | Zara (spotlights) / Zyanne (search) | Deals feed build | Same skill, two jobs |
| `calculator-cohesion.md` | Vincent, Artemis, Zyanne | — | — | Shared enriched product data |
| `sustainability-news-finder.md`, `tech-news-finder.md` | **Cheryce** | Cheryce | content-ops | Monthly news HTML |
| `sustainability-video-finder.md` | **Cheryce** | Cheryce | — | Wix video library |
| `news-product-recommender.md` | **Cheryce**, Artemis, Zyanne | Cheryce | — | Example product links |
| `Systems MD.md` | **Edwardo** (subset) | Edwardo | Full diagnostics | Chat = read-only verify |
| `hover-data-aggregator.md` | Infrastructure (all product UIs) | — | Staff rebuild cache | Not an agent |
| `personalized-impact-hover.md` | Planned explainer agent | — | Member/profile | KPI “why this matters” |
| `Greenways Market Manager MD.md` | Artemis, Zara, Zyanne (flags) | — | **Administrator** | Store ops only |
| `product-addition-workflow.md` | **All product-aware agents** | — | **Administrator** | Mandatory enrichment pipeline |
| `content-operations.md` | Cheryce (+ site HTML) | — | **Administrator** | Publish pipeline |

**When adding a new skill:** add a row with **all** consumer homes (or **Infrastructure**), optional **Primary**, and **Admin** if staff-only. Shared is the default — exclusive one-to-one mapping is the exception.

---

## Merged domains (not separate agents)

These were folded into the seven on purpose — do not spin up extra chat personas:

| Was considered | Now lives with |
|----------------|----------------|
| Energy prices only | **Vincent** |
| Savings / ROI only | **Vincent** |
| Renovation only | **Artemis** |
| Water / elec / gas product lanes | **Zyanne** (one agent, three lanes) |
| News only vs video only | **Cheryce** |

---

## Orchestrator routing

**Say the agent name** → this file + `greenways-chat-interface-skill.md`:

```
Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo
Greenways agents, Transition Agents, grants agent, deals agent
```

**Say a capability / workflow** → the specific skill (e.g. “update schemes.json” → `grants-schemes-finder.md`, not Andrieus’s HTML).

**Say “orchestrator” or “skill orchestrator”** → `SKILL-ORCHESTRATOR.md` for full task routing.

---

## Related files

| Topic | Path |
|-------|------|
| **Roadmap** (phases, tiers, site knowledge, scale) | `Skills/greenways-agents-roadmap.md` ⭐ |
| **Go-live rollout** (one agent per day, checklists) | `Skills/greenways-agents-go-live.md` ⭐ |
| UI + API clone checklist | `Skills/greenways-chat-interface-skill.md` |
| Wix embed quick ref | `HTMLS GWM GWB/WIX-GREENWAYS-AGENTS-EMBED.md` |
| Guide conductor WIP | `data/guide-agent-roster.json`, `routes/guide-agent.js` |
| Scaffold script | `node scripts/scaffold-greenways-agents.js` |
| Project conventions | `AGENTS.md` § Greenways Transition Agents |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-28 | **Roster skill created** — seven named Transition Agents, agents vs skills taxonomy, skill→home map, built vs backlog. |
| 2026-05-28 | Characters + shared turn UI shipped; Wix asset-path fix documented. |
