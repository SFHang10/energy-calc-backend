# Greenways Agents — gradual go-live plan

**Purpose:** Ship agents to Wix **one at a time** over the next few days without blocking on membership, evidence cards, or SkillBoss.  
**Orchestrator:** *“agent go live”*, *“launch Andrieus”*, *“agents rollout”*  
**Related:** `greenways-agents-roadmap.md` · `WIX-GREENWAYS-AGENTS-EMBED.md` · `greenways-transition-agents.md`  
**Last updated:** 28 May 2026

---

## Strategy

1. **Go live when the shell + knowledge path works** — not when every agent is “perfect”.
2. **One Wix page = one iframe** — publish agent-by-agent; hub links to live pages only.
3. **Depth is incremental** — `blocks[]`, LLM polish, evidence cards can follow **after** embed.
4. **Do not launch Edwardo on public marketing** unless you want ops/health visible to everyone — staff or members first.

**Block launch?** No — if checklist passes.  
**Defer to week 2?** LLM quotas, save-to-member, site knowledge cards, SkillBoss.

---

## Readiness snapshot (codebase audit)

| Agent | Slug | Intents | Knowledge depth | `blocks[]` tablets | LLM in route | **Go-live tier** |
|-------|------|---------|---------------|-------------------|--------------|------------------|
| **Andrieus** | `grants-agent` | 10 | Schemes + compare + products | stat + link + scheme tablets | ✅ fallback | **A — launch first** |
| **Vincent** | `finance-agent` | 12 | Finance + energy prices + schemes touch | link tablets | ✅ fallback | **A** |
| **Cheryce** | `media-agent` | 15 | News KB + videos + map case studies | partial (news/map) | ✅ fallback | **A** |
| **Artemis** | `equipment-agent` | 12 | Equipment + renovation + portals | link tablets | ✅ fallback | **A** |
| **Zara** | `deals-agent` | 14 | `deals-feed.json` lanes | prose bullets (no blocks yet) | ✅ fallback | **B — verify feed** |
| **Zyanne** | `sustainable-products-agent` | 14 | Catalog lanes + local search | prose lists | ✅ fallback | **B** |
| **Edwardo** | `systems-agent` | 9 | Health checks + verify API | status samples | ✅ fallback | **C — staff only** |

**Tier A:** Embed on public Wix this week.  
**Tier B:** Live after quick smoke test of data (`deals-feed`, `sustainable-products-catalog.json`).  
**Tier C:** Membership / admin page, or hidden URL for you.

---

## Shared go-live gate (every agent)

Run once per agent before **Publish** on Wix.

### Render / backend

- [ ] `GET https://energy-calc-backend.onrender.com/health` → 200
- [ ] `GET …/greenways/{slug}` loads HTML (no 404)
- [ ] Browser devtools → **Network:** `greenways-agent-turn-ui.css` + `.js` → **200** (absolute `/HTMLS%20GWM%20GWB/js/…` paths)
- [ ] `POST …/api/{slug}/ask` with body `{"question":"…"}` → 200, `ok: true`, `answer` non-empty
- [ ] `GET …/api/{slug}/samples` → showcase cards (if banner used)

### Wix page

- [ ] **Embed a site** only — not uploaded HTML
- [ ] URL: `https://energy-calc-backend.onrender.com/greenways/{slug}` (add `?embed=1` if tuning; full page OK at 900–1100px height)
- [ ] Character hero **above** iframe (Wix static image)
- [ ] Hard refresh after Render deploy (~2–3 min)

### Chat smoke (3 prompts)

Use welcome chips + one freeform question from the agent table below.

- [ ] Reply appears; no frozen “thinking” forever
- [ ] **↺ New chat** resets thread
- [ ] F12 console: no `SyntaxError`, no 404 on turn-ui
- [ ] At least one answer shows split layout or tablets (where applicable)

### Optional same day (not blocking)

- [x] LLM fallback wired — `services/greenways-agent-llm-fallback.js` (all seven agents)
- [ ] Render env `ASSISTANT_*` or per-agent `{PREFIX}_AGENT_*` for enhanced replies on intent miss
- [ ] Cross-link line on Wix to related agent page

---

## Suggested rollout schedule (next few days)

Adjust pace to your time — **one agent per day** is ideal for test + copy tweaks.

| Day | Agent | Action | Wix |
|-----|-------|--------|-----|
| **1** | **Andrieus** | Full gate + scheme compare test | First public agent page + hub link |
| **2** | **Vincent** | Finance intents + energy price question | Second page |
| **3** | **Artemis** | Renovation + kitchen chip | Third page |
| **4** | **Zara** | Confirm `deals-feed.json` on Render; tariff + spotlight chips | Fourth page |
| **5** | **Zyanne** | Water / elec / gas lane chips | Fifth page |
| **6** | **Cheryce** | Policy + map + video question | Sixth page |
| **7** | **Edwardo** | Staff-only embed or skip public | Admin / members later |

**Hub:** “Meet the agents” group image with links only to **published** pages — add links as each day ships.

**Parallel (any day):** Smoke remaining agents on Render without Wix — catches regressions early.

---

## Per-agent: smoke questions + live checklist

### Andrieus — `grants-agent`

| Smoke prompt | Expect |
|--------------|--------|
| Netherlands subsidies for a restaurant | NL schemes + tablets |
| Which schemes have deadlines? | Deadline answer |
| How do product grants work on Greenways? | Product grants intent |
| Select 2 schemes → Compare | Compare dock + `/compare` |

**Before live:** Only agent with compare — test dock expand/collapse.

**After live (incremental):** More `blocks[]`; evidence cards for scheme examples.

---

### Vincent — `finance-agent`

| Smoke prompt | Expect |
|--------------|--------|
| What are current energy prices? | Ticker / price intent |
| BNPL for kitchen equipment | BNPL answer + finance finder links |
| How do savings projections work? | Payback / projection links |
| Green loans Netherlands | NL loan programmes |

**Incremental:** LLM fallback on route; cite `savings-projection-scenarios.json` (Phase 2).

---

### Artemis — `equipment-agent`

| Smoke prompt | Expect |
|--------------|--------|
| Kitchen equipment upgrades restaurant | Equipment categories |
| Plan a sustainable renovation | Renovation merge |
| Insulation upgrades | Insulation intent |
| Equipment deep dive | Deep dive link |

**Incremental:** Product samples in banner; cross-link Andrieus for grants.

---

### Zara — `deals-agent`

| Smoke prompt | Expect |
|--------------|--------|
| What product deals are live? | Product spotlights from feed |
| Compare energy tariffs | Tariff / EU portal links |
| NL hospitality energy rates | NL lane |
| Where is Deals.html? | Full page intent |

**Before live:** `curl …/data/deals-feed.json` or ask Edwardo-style — feed non-empty on Render.

**Incremental:** `blocks[]` link tablets for tariff rows; cross-link Zyanne.

---

### Zyanne — `sustainable-products-agent`

| Smoke prompt | Expect |
|--------------|--------|
| Water-saving commercial dishwashers | Water lane |
| Efficient refrigeration ETL | Electricity lane |
| Gas-saving fryer or wok | Gas lane |
| On Greenways vs market alternative | Sources intent |

**Incremental:** Richer search via equipment-intelligence (members later); hand off to Zara for spotlights.

---

### Cheryce — `media-agent`

| Smoke prompt | Expect |
|--------------|--------|
| EU policy news for restaurants | News category |
| Explain the sustainability map… | `intentId: sustainability_map_explained`, blocks + banner samples |
| Sustainability map explained (welcome tag) | Same — no “Could not reach” after cold start |
| Videos in Greenways library | Video samples |
| Where are sustainability news pages? | Edition links |

**Sidebar quick links (post `c517979`):** each opens full Render page in top window — e.g. Sustainability news → `/HTMLS%20GWM%20GWB/January%20Sustainable%20News%20Original%20.html`. **Sustainability map →** opens map module only.

**Deploy verify:** live HTML contains `contentBase`, `initSidebarGwbLinks`, `AGENT_FETCH_TIMEOUT_MS = 90000`.

**Before live:** `/api/media-agent/videos` if banner uses videos (Wix env on Render).

**Incremental:** Tie monthly editions to evidence cards.

---

### Edwardo — `systems-agent` (staff)

| Smoke prompt | Expect |
|--------------|--------|
| Full system health overview | checkReport |
| Are grants in sync? | Grants check line |
| Verify selected button | POST `/sync` read-only message |

**Public Wix:** Skip or password/members area — answers are ops-focused.

---

## What to build gradually (after each goes live)

Priority **per agent** — pick 1–2 items when you revisit, not all at once.

| Enhancement | Agents | Effort |
|-------------|--------|--------|
| ~~LLM fallback on `/ask`~~ | All seven | Done — `greenways-agent-llm-fallback.js` |
| Tune LLM prompts per agent | With each go-live day | Ongoing |
| `blocks[]` link/stat tablets | Zara, Zyanne, Cheryce | Medium |
| Welcome copy + cross-links on Wix | All | Content only |
| Site knowledge card (1 example each) | Vincent first | Phase 2 roadmap |
| LLM quota + membership CTA | All | Phase 1 roadmap |
| Save scheme / product | Andrieus, Zyanne | Phase 3 |

**Do not block go-live** on this table.

---

## Render URLs (copy for Wix)

```text
https://energy-calc-backend.onrender.com/greenways/grants-agent
https://energy-calc-backend.onrender.com/greenways/finance-agent
https://energy-calc-backend.onrender.com/greenways/equipment-agent
https://energy-calc-backend.onrender.com/greenways/deals-agent
https://energy-calc-backend.onrender.com/greenways/sustainable-products-agent
https://energy-calc-backend.onrender.com/greenways/media-agent
https://energy-calc-backend.onrender.com/greenways/systems-agent
```

Starter link with question: append `?q=Your+question+here`

---

## Local test (before push)

```text
http://localhost:4000/greenways/grants-agent
http://localhost:4000/greenways/finance-agent
…
```

Push to `main` → wait for Render → run shared gate on production URL.

---

## Changelog

| Date | Note |
|------|------|
| 2026-05-28 | Shared LLM fallback on all seven agents (`greenways-agent-llm-fallback.js`) |
| 2026-05-28 | Initial gradual go-live plan (7-day rollout, tiers A/B/C) |
