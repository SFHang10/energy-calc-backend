# Greenways Agents — Improvements Master List

**Purpose:** One place to track improvements for Greenways Agents. This combines:
- **Ralph Power Platform PRD** (`tasks/prd-agents-power-platform.json`) — W1–W9 waves + user stories
- **Talking phase PRD** (`tasks/prd-agents-talking-phase.json`) — branded TTS, spoken scripts, Wix mic ⭐
- **Connective-tissue gaps backlog** (`Skills/greenways-agents-possible-next-steps.md`) — Gap 1–12

**Rule:** Add new work here first. The two source documents can keep detail, but this is the **single working queue**.

- [x] **Agent Market demos:** agents prime Finance Finder / projection / Market — 2026-07-30
- [x] **Shortlist Compare board:** agent-first HTML `greenways-shortlist-compare.html` + module `shortlist-compare` — 2026-07-31
- [x] **Upgrade Plan Studio:** agent-first HTML `greenways-upgrade-plan-studio.html` + module `upgrade-plan-studio` + `/api/upgrade-plan` — 2026-07-31
- [x] **Restaurant Energy Sketch:** agent-first HTML `greenways-restaurant-energy-sketch.html` + module `restaurant-energy-sketch` + `/api/restaurant-energy-sketch` — 2026-08-01
- [x] **Site Brief:** agent-first HTML `greenways-site-brief.html` + module `restaurant-energy-snapshot` (href updated) + existing `/api/restaurant-snapshot/pilot` — 2026-08-01
- [x] **Scheme Fit:** agent-first HTML `greenways-scheme-fit.html` + module `scheme-fit` + `/api/scheme-fit` — 2026-08-01
- [x] **Water Line Sketch:** agent-first HTML `greenways-water-line-sketch.html` + module `water-line-sketch` + `/api/water-line-sketch` — 2026-08-01
- [x] **Service-hour cost board:** agent-first HTML `greenways-service-hour-cost-board.html` + module `service-hour-cost-board` + `/api/service-hour-cost-board` — 2026-08-01
- [x] **Build gate:** `Skills/greenways-agents-build-gate.md` + `npm run smoke:agent-modules` / `smoke:agents-gate` — 2026-07-31
- [x] **Sustainability map explainer:** `greenways-sustainability-map-explainer.html` + module `sustainability-map-explainer` + `/greenways/sustainability-map-intro` — Cheryce map intent + content module wiring — 2026-08-20
- [x] **Artemis Equipment desk:** `greenways-equipment-desk.html` + module `equipment-desk` + `/greenways/equipment-desk` — 5 rails (deep dive, payback, ETL, renovation, upgrade plan); sidebar first link on Artemis — 2026-08-24
- [x] **Edwardo systems innovation:** `systems_innovation` intent + New in Tech edition reading + site evidence card + welcome tag — 2026-08-24
- [x] **Wire + desk hub (six specialists):** `data/greenways-wire-config.json` + `greenways-wire-hub.js` — thin wire shells for grants, finance, equipment, deals, media, products — 2026-08-31
- [x] **Wire snapshot trust + chat grounding:** live vs illustrative badges on wire mains; `/api/*-wire/snapshot` trust lines; region-aware wire blocks in knowledge services (all six) — 2026-08-31
- [x] **Agent desk rails (Vincent template):** shared `greenways-desk-rail.css` on grants, deals, media, products desks — 2026-08-31
- [x] **Cheryce wire vs desk split:** wire = energy ticker + deals hub + counts; desk = news editions, video, map, references, monitoring (no duplicate map on wire) — 2026-08-31
- [x] **Live wire ticker:** `greenways-agent-wire-ticker.js` on agent story intros + all six chat shells (`data/greenways-agent-wire-ticker.json`) — 2026-08-31
- [x] **Spotlight collapse UX:** Show/Hide spotlight from page load; wire ticker + showcase in `agent-spotlight-zone`; `sessionStorage` per agent; accent pulse on toggle — 2026-09-01

---

## What’s already shipped (recent)

- [x] **W1 / Gap 1 — Member context:** dashboard → `localStorage` + server enrichment + profile chip — 2026-07-13
- [x] **W2 — Upgrade plans:** `upgrade_plan` block + composer + Artemis/Orchestra intents — 2026-07-13
- [x] **W3 / Gap 8 — Trust & freshness:** “Data as of” on modules + site evidence — 2026-07-13
- [x] **Gap 3 — Restaurant energy snapshot:** content module + Vincent/Edwardo intents — 2026-07-13
- [x] **Gap 10 — Video pointers:** `greenways-video-knowledge.json` + Cheryce `video_explained` — 2026-07-13
- [x] **W5 — Copy audit + intros:** no Wix/bridge in customer copy; `agentIntroParagraph()` on all seven specialists — 2026-07-14
- [x] **W4 — Actions from chat:** shortlist, marketplace open, grants handoff, copy plan — 2026-07-14
- [x] **W7 / Gap 4 — Measurement (partial):** `/ask` JSONL logging + admin viewer — 2026-07-13
- [x] **W7 / US-021:** Top misses panel on `agents-admin.html` (`GET /api/agents-admin/ask-misses`) — 2026-07-14
- [x] **W6 — Proactive nudges (partial):** sidebar “This week”, Andrieus deadline chip, Zara welcome spotlight — 2026-07-14
- [x] **Gap 2 (partial):** Site energy reading module (UK live; EU benchmark until ENTSO-E key) — 2026-07-13
- [x] **Wire + desk pattern (Aug 2026):** six wire hubs, desk rails, snapshot trust, story/chat wire tickers, spotlight toggle — see bullets above — 2026-08-31

---

## One combined queue (work order)

### Suggested focus (Sep 2026)

1. **Desk parity polish** — **complete for consumer desks** (Andrieus, Zara, Zyanne tablet pattern — 2026-09-02). **Cheryce skipped** (media launcher works). **Edwardo deferred** — ops/systems page already dense; plan a distinct dashboard (config + verify) after wider platform work lands
2. **Deals feed automation** — `build:deals-feed` on schedule (keeps Zara wire honest) — **Render weekly cron** `wire-refresh-cron.js` → `refresh:agents-weekly` — 2026-09-02
3. **Talking phase** — branded TTS + Wix mic (`prd-agents-talking-phase.json`)
4. **Member context on wire/desk** — profile/site from Customer Hub → snapshot pills — **v1 slice:** membership dashboard → `greenways_member_context_v1` → agents + wire + desk pills — 2026-09-02

### Next up (Aug–Sep 2026)

- [x] **Data refresh:** deals smoke + full `smoke:agents-ask` green; Andrieus portals tablets; Artemis deep-dive intent scoring; Zara site cards retargeted to current deals-feed ids — 2026-09-04 · weekly deals input still empty when you have new rows
- [x] **Grants/schemes refresh (Aug 2026):** france-renov + maprimenov link/copy; integrator + products-grants-bundle + enrich sust catalog — 2026-08-26
- [x] **Deals refresh:** Feed smoke passed (9 rows, 3/lane, generated 2026-09-02); `deals-weekly-input.json` still empty — add weekly rows when you have new deals, then `npm run build:deals-feed` — 2026-09-04
- [x] **Data refresh (validate):** Fixed Andrieus portals module tablets (`schemes-portal-restaurant` in primary block); deals + grants smoke path green after fix — 2026-09-04 · still run full `npm run validate:agent-data` after push if needed
- [ ] **Talking phase (bring them to life):** PRD `tasks/prd-agents-talking-phase.json` — AV-001…AV-007 (branded TTS all seven → spokenSummary style → talk UX → Wix mic → optional STT). Extends Wave 8; say *“Start Ralph loop for agents talking phase”* when ready.
- [ ] **Professional project packs (consumer deliverable):** When user opens **Project** / plan — concise but thorough professional document (not a novel). Prefer **internal Greenways template** fed by agent-structured JSON (upgrade plan / renovation / finance case) → print-ready HTML/PDF + email (W9). Do **not** depend on Notion/Asana/Monday for the customer-facing pack; optional later export *into* those tools for ops teams. Build on `upgrade_plan` + Upgrade Plan Studio + renovation planner — deepen sections (scope, steps, grants, payback, risks, next actions) and one shared “project pack” shell.

### Customer Hub (member home) — new track

- [x] **CH-001 shell:** `greenways-customer-hub.html` + `/greenways/customer-hub` — scrollable Saved / Suggested / Deals / News / Site glance — 2026-07-17
- [x] **PRD:** `tasks/prd-customer-hub.json` (CH1–CH4 waves)
- [x] **CH-002:** Agent portrait badges on suggestion cards (Artemis/Zyanne) + deals (Zara) — `cardHtml` `agent-badge` — 2026-09-03
- [x] **CH-005:** Cheryce news rail — `/api/media-agent/news`, portrait, `?q=` follow-up links — 2026-09-03
- [x] **CH-003:** Saved lane merges session shortlist + `GET /api/members/saved-items` when `energy_calc_membership_token` present (+ local `gw_saved_products` fallback)
- [x] **CH-004:** Profile-aware header — region/sector chip + filters, deals lane region filter hint, Orchestra + Membership links (demo stays anonymised) — 2026-09-03
- [x] **CH-006:** Richer site glance with trust labels (`Demo model` / `Catalogue`) + Site Brief quick link; still not a live meter dashboard — 2026-09-03
- [x] **Wix:** Membership dashboard + Orchestra “Your Hub” links; embed routes `/greenways/customer-hub-embed` + `?embed=1` / demo; WIX embed doc lists live + demo URLs — 2026-09-04 (confirm iframe on live Wix page if not already published)
- [x] **Your Hub website demo:** `/greenways/customer-hub-demo` — same layout, anonymised **Wok Restaurant** (no Wok to Walk tenant pack), portal menus hidden — 2026-08-26
- [x] **Restaurant story + Assist demos:** `/greenways/tenants/wok-restaurant-demo` + `/greenways/restaurant-assist-demo` (thin chat preview → Transition Agents) — 2026-08-26
- [x] **Calendar demo (level A):** read-only month view on Your Hub demo — scheme deadlines + `data/greenways-calendar-demo.json` ops/plan seeds · `/greenways/calendar-demo` — 2026-08-26
- [x] **Calendar full (level B/C):** personal add via `localStorage` (`gw_personal_calendar_events`) + Add reminder form; agent scheme-tablet **Add to calendar** chips; routes `/greenways/calendar` (+ demo/embed aliases); hub shows calendar for all members — 2026-09-04 · member API + Google/Outlook sync still later
- [x] **Buildings dashboard website demo:** `/greenways/buildings-dashboard-demo` (+ `-embed`) — anonymised **Wok Restaurant** sample sites, Restaurant Assist demo iframe, membership hidden; live route unchanged — 2026-09-04

### Gap 2 — Live data vs illustrative data

- [ ] **Gap 2 / W3 (ops — when ready):** ENTSO-E token + Render `ENTSOE_API_KEY` — code + module already live; EU uses zone benchmark until key set
- [x] **W3 / Gap 2:** Dashboard trust labels — demo model vs live feed in system status + KPI badges — 2026-07-15

### Wave 5 (W5) — Voice & depth parity (copy)

- [x] **W5:** Shared `agentIntroParagraph()` — **prepend only**; keeps workflow, tools, and module blocks after the intro
- [x] **W5:** `roleSummaryFirstPerson` in all seven briefing JSONs (derived from existing `roleSummary` / overview copy)
- [x] **W5:** Wire intro helper on overview / who-are-you intents for Vincent, Artemis, Zara, Cheryce, Edwardo (prepend only; smokes in `smoke-greenways-agents-ask.js`) — 2026-07-14
- [x] **W5 / US-016:** Expand LLM polish pilot to Artemis (`deep_dive`, `why_equipment`, `insulation`) — 2026-07-14

### Gap 10 — Cheryce video understanding (pointers)

- [x] **Gap 10:** `enrich:video-knowledge` pipeline — captions when available, else metadata drafts → human approve → merge — 2026-07-15
- [x] **Gap 10:** Pilot merge of 6 restaurant/home clips into `greenways-video-knowledge.json` (8 pointers live) — 2026-07-15
- [ ] **Gap 10 (optional):** Admin UI review in `media-videos-admin.html`; re-run with LLM when `ASSISTANT_*` key set for richer captions

### Wave 6 (W6) — Proactive intelligence (remaining)

- [x] **W6:** Refresh highlights on profile region change (re-pick deal/deadline) — 2026-07-14
- [x] **W6:** Weekly highlights refresh — `npm run refresh:agents-weekly` + playbook scheduling notes — 2026-07-15

### Wave 7–9 (W7–W9) — later

- [x] **W7:** Top misses panel on agents-admin (aggregate ask logs) — 2026-07-14
- [x] **W7:** Restaurant asset benchmark line when `siteId` known (US-022) — `baseline_equipment` + `data/restaurant-assets/` — 2026-07-14
- [x] **W8 / US-023:** Browser voice on all seven agents (`voiceEnabled` in voice config) — 2026-07-15
- [x] **W8 / US-024:** `spokenSummary` on all `/ask` knowledge responses + smoke — 2026-07-15
- [x] **W8 / US-025:** Server TTS route pilot (`POST /api/agent-voice/tts`) — falls back to browser without key — 2026-07-15
- [x] **W8 / US-026 (partial):** Andrieus + Zyanne `voiceId` in voice config; Andrieus `useServerTts: true` — 2026-07-15
- [x] **W8 / US-027:** Member auto-speak pilot — 🔁 Listen mode (`tier=member` + local opt-in); ⏹ stop while speaking — 2026-07-15
- [ ] **W9 (deferred):** Agent email — mailbox registry + “Email me this” when ready
- [ ] **Multi-channel outreach (W10 sketch):** Same `/ask` brain → channel adapters — **not** a separate bot per app. Order: (1) **Email** = W9, (2) **Microsoft Teams** (Graph bot / Adaptive Cards for hospitality teams), (3) optional **WhatsApp Business** if members opt in, (4) **LinkedIn** = light touch only (share links / InMail via human or approved CRM — LinkedIn Messaging API is not a good general chatbot channel). Requires member identity + opt-in prefs in Customer Hub. Do **not** start until talking phase + W9 email shape are clear.
- [x] **W8 foundation:** browser voice + spokenSummary + TTS route + Andrieus premium pilot + listen mode — see power platform PRD
- [ ] **Talking phase (AV-001–007):** branded TTS for remaining agents; spoken script quality; talk UX; Wix mic path; optional STT — `tasks/prd-agents-talking-phase.json`
- [x] **Agent desks (partial):** Vincent finance desk/wire + Artemis `equipment-desk` + **equipment wire** (scan + desk hub, `/api/equipment-wire/snapshot`) — 2026-08-27
- [x] **Vincent daily external news v1:** EU/EIB RSS, RVO/DBT staff queue, UK DESNZ, headline admin, Render cron — 2026-08-27
- [ ] **Gap 12 — Vincent finance feeds (later):** Ofgem, HMRC Atom, UKRI; IE/DE/FR gov Atom — `Skills/greenways-agents-possible-next-steps.md` § Gap 12
- [x] **Agent desk rails (grants, deals, media, products):** Vincent-template Explore sidebar on four desks — 2026-08-31
- [x] **Andrieus grants desk (Vincent tablet pattern):** shared `greenways-desk-tablet.css/js` + guided 4-step panels — 2026-09-02
- [x] **Zara deals desk (Vincent tablet pattern):** cyan/orange theme + hub → energy → water → full Deals journey — 2026-09-02
- [x] **Zyanne products desk (Vincent tablet pattern):** blue/teal theme + water → finder → sketch → Droppie → Agent Market — 2026-09-02
- [x] **Cheryce media desk (tablet rollout):** skipped by design — media desk opens modules well; wire/desk split already clear — 2026-09-02
- [ ] **Edwardo systems desk (deferred):** not Vincent tablet — target a systems/configuration dashboard (verify, monitoring, sensors) once member context + wire/desk snapshots and related platform pieces are in place — 2026-09-02
- [ ] **Agent desks (rollout — remaining):** guided paths on wire hubs; member context on wire/desk snapshots
- [ ] **Wire/desk enhancements:** Map “new company” live marquees on Cheryce wire KPI row (counts only — map stays on desk)

---

## Mapping reference (so nothing gets lost)

- **Gap 1** ↔ **Wave 1** (member context) — shipped
- **Gap 2** ↔ **Wave 3** (trust: live vs illustrative) + ops work
- **Gap 3** ↔ deliverables — shipped
- **Gap 4** ↔ **Wave 7** (measurement & live ops) — partial
- **Gap 10** ↔ content understanding — shipped (pointers); enrich pipeline backlog
