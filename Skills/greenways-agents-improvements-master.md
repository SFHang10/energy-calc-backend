# Greenways Agents — Improvements Master List

**Purpose:** One place to track improvements for Greenways Agents. This combines:
- **Ralph Power Platform PRD** (`tasks/prd-agents-power-platform.json`) — W1–W9 waves + user stories
- **Talking phase PRD** (`tasks/prd-agents-talking-phase.json`) — branded TTS, spoken scripts, Wix mic ⭐
- **Connective-tissue gaps backlog** (`Skills/greenways-agents-possible-next-steps.md`) — Gap 1–10

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

---

## One combined queue (work order)

### Next up (Aug 2026)

- [ ] **Data refresh:** schemes.json review + product-grants integrator/bundle; deals weekly input + `build:deals-feed`; smokes + agents-admin freshness — playbooks `Skills/grants-refresh-playbook.md` · `Skills/agents-data-refresh-playbook.md`
- [x] **Grants/schemes refresh (Aug 2026):** france-renov + maprimenov link/copy; integrator + products-grants-bundle + enrich sust catalog — 2026-08-26
- [ ] **Deals refresh:** `data/deals-weekly-input.json` + `npm run build:deals-feed`
- [ ] **Talking phase (bring them to life):** PRD `tasks/prd-agents-talking-phase.json` — AV-001…AV-007 (branded TTS all seven → spokenSummary style → talk UX → Wix mic → optional STT). Extends Wave 8; say *“Start Ralph loop for agents talking phase”* when ready.
- [ ] **Professional project packs (consumer deliverable):** When user opens **Project** / plan — concise but thorough professional document (not a novel). Prefer **internal Greenways template** fed by agent-structured JSON (upgrade plan / renovation / finance case) → print-ready HTML/PDF + email (W9). Do **not** depend on Notion/Asana/Monday for the customer-facing pack; optional later export *into* those tools for ops teams. Build on `upgrade_plan` + Upgrade Plan Studio + renovation planner — deepen sections (scope, steps, grants, payback, risks, next actions) and one shared “project pack” shell.

### Customer Hub (member home) — new track

- [x] **CH-001 shell:** `greenways-customer-hub.html` + `/greenways/customer-hub` — scrollable Saved / Suggested / Deals / News / Site glance — 2026-07-17
- [x] **PRD:** `tasks/prd-customer-hub.json` (CH1–CH4 waves)
- [ ] **CH-002–004:** Tighten agent badges, shortlist empty states, profile filter polish
- [ ] **CH-003 deep:** Wire `/api/members/saved-items` when auth present
- [ ] **CH-006:** Richer site glance (optional snapshot module) with trust labels
- [ ] **Wix:** Embed / membership dashboard entry link to Customer Hub
- [x] **Your Hub website demo:** `/greenways/customer-hub-demo` — same layout, anonymised **Wok Restaurant** (no Wok to Walk tenant pack), portal menus hidden — 2026-08-26
- [ ] **Buildings dashboard website demo:** same pattern later — anonymised sample site, no live client meters/branding, `?embed=1` / `-demo` for Wix

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
- [x] **Agent desks (partial):** Vincent finance desk/wire + Artemis `equipment-desk` — see shipped entries above — 2026-08-24
- [ ] **Agent desks (rollout — remaining):** Clone desk pattern for Andrieus, Zara, Cheryce, Zyanne, Edwardo — then thin sidebar tabs into each desk

---

## Mapping reference (so nothing gets lost)

- **Gap 1** ↔ **Wave 1** (member context) — shipped
- **Gap 2** ↔ **Wave 3** (trust: live vs illustrative) + ops work
- **Gap 3** ↔ deliverables — shipped
- **Gap 4** ↔ **Wave 7** (measurement & live ops) — partial
- **Gap 10** ↔ content understanding — shipped (pointers); enrich pipeline backlog
