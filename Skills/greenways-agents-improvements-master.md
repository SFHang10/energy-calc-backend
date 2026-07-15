# Greenways Agents — Improvements Master List

**Purpose:** One place to track improvements for Greenways Agents. This combines:
- **Ralph Power Platform PRD** (`tasks/prd-agents-power-platform.json`) — W1–W9 waves + user stories
- **Connective-tissue gaps backlog** (`Skills/greenways-agents-possible-next-steps.md`) — Gap 1–10

**Rule:** Add new work here first. The two source documents can keep detail, but this is the **single working queue**.

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

---

## Mapping reference (so nothing gets lost)

- **Gap 1** ↔ **Wave 1** (member context) — shipped
- **Gap 2** ↔ **Wave 3** (trust: live vs illustrative) + ops work
- **Gap 3** ↔ deliverables — shipped
- **Gap 4** ↔ **Wave 7** (measurement & live ops) — partial
- **Gap 10** ↔ content understanding — shipped (pointers); enrich pipeline backlog
