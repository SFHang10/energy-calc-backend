# Greenways Agents — Possible Next Steps

**Working queue (single source now):** `Skills/greenways-agents-improvements-master.md` ⭐  

**Purpose:** Working backlog of connective-tissue gaps (not new personas). Pick items one at a time; check off as shipped.  
**Context:** Team knowledge architecture is sound for v1 — seven specialists, intents, catalogues, module tablets, handoffs, site knowledge cards, data-refresh playbook.  
**Related:** `greenways-agents-roadmap.md` · `greenways-transition-agents.md` · `agents-data-refresh-playbook.md` · `WIX-GREENWAYS-AGENTS-EMBED.md`  
**Created:** 10 Jul 2026

---

## What’s working well (baseline)

- [x] Clear roster — domains merged sensibly (water/elec/gas → Zyanne, fabric → Artemis, etc.)
- [x] Grounded answers — schemes, products, deals feed, news, projections, ~40 evidence cards
- [x] Cross-agent routing — Orchestra hub, handoffs, module registry, admin map
- [x] Ops hygiene — `data/agents-data-pipeline.json`, Edwardo verify, content-module sync
- [x] Restaurant Energy Snapshot v1 mockup — `restaurant-energy-snapshot.html` + `/api/restaurant-snapshot/pilot` (commit `5ce0a5d`)
- [x] **Site energy reading** — UK live postcode grid carbon + EU NL/ES/PT (zone benchmark until ENTSO-E key) — `site-energy-reading.html` · `/api/site-energy-reading` · module id `site-energy-reading` (commits `1ad6573`, `3681ccd`)

---

## Gap 1 — Member context isn’t wired yet

**Problem:** Agents accept `profile.region` in chat, but membership doesn’t feed them — no saved site, equipment list, or building from `wix-integration/unified-membership-dashboard.html`. Public visitors get the same answers as a logged-in operator with a known cookline.

**Roadmap phase:** 3 (Membership tier)

| Step | Status | Notes |
|------|--------|-------|
| Pass `tier`, `memberId`, `region`, `siteId` from member dashboard iframe → `/ask` | ☐ | Same agent HTML; query or `postMessage` profile |
| Verify Wix member via existing `/api/members` patterns | ☐ | Decision TBD: token header vs member id lookup |
| Pre-fill profile block in chat (region, sector, site name) | ☐ | `gw-team-profile-v1` already exists for handoffs |
| Higher LLM quota for members vs public | ☐ | Needs quota service first |

**Key files:** `unified-membership-dashboard.html` · `routes/members.js` · `services/greenways-agent-llm-fallback.js` · `Skills/greenways-agents-roadmap.md` § Phase 3

---

## Gap 2 — Live data vs illustrative data

**Problem:** Edwardo and the buildings dashboard are largely demo / modelled (tariffs, sensors, KPIs). Agents cite SiteEnergyModel and scenarios well, but not the member’s actual meters.

| Step | Status | Notes |
|------|--------|-------|
| Register ENTSO-E API + set `ENTSOE_API_KEY` on Render for **site energy reading** (NL / ES / PT) | ☐ | [transparency.entsoe.eu](https://transparency.entsoe.eu/) → email transparency@entsoe.eu (“Restful API access”) → My Account → token → Render **Environment**. Verify: `/api/site-energy-reading/health` → `euLiveReady: true`; lookup `?country=nl&postcode=1012AB` → `live: true`, `source: ENTSO-E`. Optional: `ELECTRICITY_MAPS_API_KEY` for EU 24h forecast. |
| Document which KPIs are live vs placeholder in agent copy | ☐ | Avoid implying live feeds when demo |
| Wire `company-map-buildings.json` site id into member profile → agent context | ☐ | Natural link to snapshot service |
| When `/api/dashboard/live` (or site feed) returns real data, surface in Edwardo intents | ☐ | `energy-dashboard-skill.md` |
| Close loop: meter anomaly → agent suggestion (e.g. overnight HVAC) | ☐ | Later; needs sensor payloads |

**Key files:** `data/company-map-buildings.json` · `services/restaurant-snapshot-service.js` · `HTMLS GWM GWB/Greenways Interface .html` · `services/systems-agent-knowledge.js`

---

## Gap 3 — Deliverables aren’t agent-facing yet

**Problem:** Restaurant Energy Snapshot v1 exists but no agent opens it, hands off to it, or saves it to a member profile.

| Step | Status | Notes |
|------|--------|-------|
| Add content-module row `restaurant-energy-snapshot` in `greenways-content-modules.json` | ☐ | Vincent + Edwardo homes |
| Intent on Vincent / Edwardo: “energy snapshot” / “site brief” → `module` block | ☐ | `?site=&region=` from profile |
| Evidence card citing snapshot as worked example | ☐ | `data/greenways-site-knowledge/cards.json` |
| Membership: “Save brief” (later) | ☐ | Needs DB + member tier |

**Key files:** `HTMLS GWM GWB/restaurant-energy-snapshot.html` · `routes/restaurant-snapshot.js` · `data/greenways-content-modules.json`

---

## Gap 4 — Observability and guardrails

**Problem:** No structured `/ask` logging, quota middleware, or abuse rate limits. Hard to tune LLM cost or spot knowledge misses.

| Step | Status | Notes |
|------|--------|-------|
| Log `agent`, `source` (knowledge \| llm \| heuristic), `intentId` on every `/ask` | ☐ | High priority per roadmap |
| Create `services/greenways-agent-quota.js` (suggested name) | ☐ | Defer enforcement until post-launch if needed |
| Public cap + graceful fallback (knowledge + membership CTA) | ☐ | e.g. 5–10 LLM turns/day after review period |
| Soft rate limit on `/ask` (IP window) | ☐ | Pattern: `routes/music-venue-inquiries.js` |
| Weekly cost review checklist | ☐ | % knowledge vs LLM per agent |

**Key files:** `routes/*-agent.js` · `services/greenways-agent-llm-fallback.js` · `Skills/greenways-agents-roadmap.md` § Metrics

---

## Gap 5 — LLM polish is uneven

**Problem:** `finishKnowledgeAskResponse` is on all seven routes, but LLM polish defaults to **finance only** (`GREENWAYS_AGENT_POLISH_AGENTS=finance`).

| Step | Status | Notes |
|------|--------|-------|
| Enable polish for Tier A launch agents (Andrieus, Artemis, Cheryce) on Render | ☐ | One env var change + smoke |
| Expand polish agents incrementally after smokes pass | ☐ | Track B pattern already done for modules |
| Keep `blocks[]` and URLs out of LLM rewrite (grounded payload only) | ☐ | Accuracy gate — already documented |

**Key files:** `services/greenways-agent-llm-fallback.js` · `Skills/greenways-agents-go-live.md`

---

## Gap 6 — Regional depth is uneven

**Problem:** Evidence cards and portal copy are NL/UK-heavy. DE, FR, ES, IE schemes exist in `schemes.json` but fewer worked examples and portal modules.

| Step | Status | Notes |
|------|--------|-------|
| DE regional pack — 3–5 evidence cards + portal intent keywords | ☐ | Copy NL `business.gov` pattern |
| FR regional pack — same | ☐ | |
| ES / IE — lighter pass (top schemes only) | ☐ | |
| `npm run build:agent-highlights` includes non-NL samples | ☐ | Public credibility |

**Key files:** `data/greenways-site-knowledge/cards.json` · `schemes.json` · `data/greenways-content-modules.json`

---

## Gap 7 — Topics with data but thin agent narrative

| Topic | Data exists | Agent angle | Status |
|-------|-------------|-------------|--------|
| Recycling / trade-in | Collection agencies on products | End-of-life story in Artemis / Zyanne chat | ☐ |
| Carbon / CBAM / reporting | News + some Cheryce cards | Importer workflow (Cheryce → Vincent) | ☐ |
| Portfolio / multi-site | Buildings JSON, dashboard | Agents default single-site; add portfolio intents | ☐ |
| Compliance deadlines | Scheme dates in catalogue | Calendar / “verify before date” UX in Andrieus | ☐ |

---

## Gap 8 — Automation vs manual refresh

**Problem:** Data refresh playbook is documented; scheduled rebuilds on Render aren’t automatic. Stale feeds are the main silent failure mode.

| Step | Status | Notes |
|------|--------|-------|
| Render weekly wire refresh (`wire-refresh-cron.js` → deals feed + agent highlights) | ☑ | Auto on `RENDER` — Monday 05:00 UTC default (2026-09-02) |
| Render in-process cron for `npm run build:finance-daily` | ☑ | Auto on `RENDER` env — `services/finance-daily-cron.js` (2026-08-27) |
| Weekly `npm run build:agent-highlights` | ☑ | Bundled in `refresh:agents-weekly` + wire cron |
| After `schemes.json` edit — documented chain: integrator → bundle | ☐ | `agents-data-refresh-playbook.md` |
| Edwardo verify alerts staff only today — optional public “feed as of” pill | ☐ | Low priority |

**Key files:** `data/agents-data-pipeline.json` · `Skills/agents-data-refresh-playbook.md` · `package.json` scripts

---

## Gap 9 — Guide / Orchestra is shallow

**Problem:** Orchestra routes and API exist; conductor does routing + short answers, not a guided multi-agent workflow.

| Step | Status | Notes |
|------|--------|-------|
| Richer guide intents for “I don’t know where to start” journeys | ☐ | `data/guide-agent-intents.json` |
| Optional: 2-step workflow (e.g. grants → finance) in one hub reply | ☐ | Without merging agents |
| Link Orchestra to membership dashboard entry | ☐ | When Gap 1 ships |

**Key files:** `greenways-orchestra-hub.html` · `routes/guide-agent.js` · `services/guide-agent-knowledge.js`

---

## Gap 10 — Cheryce doesn’t know what videos are about

**Problem:** HTML modules have `usageHint` + `knowledgeBullets` in `greenways-content-modules.json`. Videos only have a one-line `description` in `wix-youtube-channels.json` / `wix-video-catalog.json` (truncated to ~90 chars in chat). Cheryce surfaces and routes videos but does **not** watch or transcribe them — she cannot explain content unless metadata is rich.

| Step | Status | Notes |
|------|--------|-------|
| Add `data/greenways-video-knowledge.json` — per-video `summary`, `takeaways[]`, optional `agentNotes.cheryce`, `relatedModuleIds[]` | ☑ | Lightweight pointers only at runtime (no full transcript in `/ask`) |
| Script `npm run enrich:video-knowledge` — `videoId` → YouTube captions → LLM summarise → draft rows | ☑ | Human approve before merge; store raw transcript in `content-ops/drafts/video-knowledge/` when captions available |
| Wire `media-agent-knowledge.js` to prefer video-knowledge over card blurb when user asks “what is this video about?” | ☑ | `buildVideoExplainedAnswer` + `findVideoPointer` |
| Extend `media-videos-admin.html` — review / edit summaries for catalog rows | ☐ | Same approval pattern as live-music media candidates |
| Pilot **10–20** high-traffic Greenways YouTube clips + key product MP4 demos | ☑ partial | 8 live pointers (2 curated + 6 metadata pilot); remaining drafts pending |

**Key files:** `data/wix-youtube-channels.json` · `data/wix-video-catalog.json` · `services/media-agent-knowledge.js` · `Skills/sustainability-video-finder.md` · `HTMLS GWM GWB/media-videos-admin.html`

---

## What you probably don’t need (yet)

- More chat personas — water-only, renovation-only, etc. are correctly folded into the seven
- HTML crawl / PDF ingest — site knowledge cards are the right pattern
- Replacing knowledge with more LLM — data-first model is the strength

---

## Suggested work order

Work through in this order unless a launch deadline forces a swap:

1. **Gap 4** — Usage logging (cheap, informs everything else)
2. **Gap 3** — Wire snapshot into Vincent / Edwardo module tablets
3. **Gap 1** — Member profile → `/ask` from unified dashboard
4. **Gap 5** — Expand LLM polish to Tier A agents
5. **Gap 8** — Scheduled feed rebuilds on Render
6. **Gap 6** — One regional pack (pick DE or FR first)
7. **Gap 2** — Live meter path (when hardware/API ready)
8. **Gap 7** — Pick one thin narrative (recycling or CBAM)
9. **Gap 10** — Cheryce video knowledge pointers (transcript enrich + approve pilot set)
10. **Gap 9** — Orchestra depth (when membership embed exists)
11. **Gap 11** — Edwardo systems tech round-up (after next newsletter is live; page not required yet)
12. **Gap 12** — Vincent finance external news — deeper UK & regional feeds (Ofgem, HMRC, etc.)

---

## Gap 11 — Edwardo systems tech round-up (planned)

**Problem:** Vincent has a framed finance news page from the monthly pipeline. Edwardo should have the same for **New in Tech** — not a second newsroom, but **how new tech could help sustainability** (monitoring, sensors, dashboards, data quality).

**Do not build the page yet.** Path is recorded so the newsletter run can grow a feed later.

| Step | Status | Notes |
|------|--------|-------|
| Briefing + module `systems-tech-news` (interim href = tech edition) | ☑ | 2026-08-17 |
| Cheryce handoff reason includes tech → Edwardo | ☑ | `media-agent-briefing.json` |
| `data/systems-tech-news-feed.json` builder | ☐ | Mirror `scripts/build-finance-news-feed.js` from New in Tech + Looking Ahead |
| HTML page `/greenways/systems-tech-news` (Music News / finance-news shell) | ☐ | Systems theme; question on every card: how does this help sustainability? |
| Wire into `npm run run:newsletter -- --publish` | ☐ | After feed + page exist |
| Edwardo chat intent `tech_for_sustainability` | ☐ | Open module + systems lens copy |

**Key files:** `Skills/newsletter-run-playbook.md` § Edwardo tech round-up · `data/systems-agent-briefing.json` `plannedSurfaces` · `data/greenways-content-modules.json` `systems-tech-news`

---

## Gap 12 — Vincent finance external news — deeper UK & regional feeds (planned)

**Problem:** ETL catalogue is UK-heavy; Vincent’s daily layer now has **DESNZ** (auto) + **DBT** (staff queue) + GOV.UK business finance card. Still missing regulator and tax signals hospitality operators care about (tariff cap, VAT relief, green incentives).

**Shipped baseline (2026-08-27):** EU/EIB RSS · RVO NL queue · DESNZ Atom · DBT queue · business.gov.nl + GOV.UK static finders · `finance-headlines-admin` · Render daily cron.

| Step | Status | Notes |
|------|--------|-------|
| **Ofgem** — price cap / market news | ☐ | `/rss` returned 405 in probe; try gov.uk search Atom, press office, or licensed data path |
| **HMRC** — tax / VAT / capital allowances on energy equipment | ☐ | `gov.uk/.../hm-revenue-customs.atom` works — add with keyword filter; staff queue vs auto-publish TBD |
| **UKRI / Innovate UK** — innovation grants for hospitality tech | ☐ | gov.uk Atom by organisation |
| **Carbon Trust / MCS** — certification & SME programmes | ☐ | Lower priority; static cards if no stable feed |
| **IE / DE / FR** gov press Atom (mirror UK pattern) | ☐ | After UK lane stable — reuse `type: atom` in `finance-external-sources.json` |
| Re-tune UK hospitality keywords (pub, hotel, catering, BUS, ECO) | ☐ | `financeKeywords` + `financeAngleFor` after new sources land |

**Key files:** `data/finance-external-sources.json` · `services/finance-external-news.js` · `data/finance-headline-candidates.json` · `HTMLS GWM GWB/finance-headlines-admin.html` · `Skills/newsletter-run-playbook.md`

---

## Progress log

| Date | Item | Notes |
|------|------|-------|
| 2026-07-10 | Doc created | Captured gap analysis from agent team review |
| 2026-07-10 | **Sustainability glossary v1** | `data/greenways-sustainability-glossary.json` + `services/greenways-sustainability-glossary.js` — all seven agents |
| 2026-07-13 | **Site energy reading module** | UK + EU NL/ES/PT postcode grid carbon; Edwardo / Vincent / Zara wiring; commits `1ad6573`, `3681ccd` |
| 2026-07-13 | **TODO — ENTSO-E live EU grid** | Gap 2: register token + `ENTSOE_API_KEY` on Render (EU still on zone benchmark until done) |
| 2026-07-15 | **Gap 10 enrich pipeline** | `npm run enrich:video-knowledge` → drafts in `content-ops/drafts/video-knowledge/`; `--merge` for approved; 8 live Cheryce pointers |
| 2026-08-17 | **Gap 11 path recorded** | Edwardo systems-tech-news planned (Vincent finance-news pattern); interim = New in Tech edition |
| 2026-08-27 | **Vincent daily external news v1** | EU/EIB + RVO queue + DESNZ/DBT UK + staff admin + Render cron — commits `0e33bd9`, `b2d0510` |
| 2026-08-27 | **Gap 12 recorded** | Backlog: Ofgem, HMRC, UKRI, IE/DE/FR Atom feeds — after UK baseline stable |

---

## Orchestrator triggers

Say: *“agents next steps”* · *“greenways gaps”* · *“work through agent backlog”* → this file.
