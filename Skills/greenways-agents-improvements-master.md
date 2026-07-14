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
- [x] **W5 — Copy audit + intros:** no Wix/bridge in customer copy; `agentIntroParagraph()` (Andrieus + Zyanne) — 2026-07-13
- [x] **W4 — Actions from chat:** shortlist, marketplace open, grants handoff, copy plan — 2026-07-14
- [x] **W7 / Gap 4 — Measurement (partial):** `/ask` JSONL logging + admin viewer — 2026-07-13
- [x] **W6 — Proactive nudges (partial):** sidebar “This week”, Andrieus deadline chip, Zara welcome spotlight — 2026-07-14
- [x] **Gap 2 (partial):** Site energy reading module (UK live; EU benchmark until ENTSO-E key) — 2026-07-13

---

## One combined queue (work order)

### Gap 2 — Live data vs illustrative data

- [ ] **Gap 2 / W3:** ENTSO-E token + Render env `ENTSOE_API_KEY` so EU site energy reading becomes live (NL/ES/PT)
- [ ] **W3 / Gap 2:** Document what is live vs placeholder in KPI/dashboard copy (avoid implying live feeds)

### Wave 5 (W5) — Voice & depth parity (copy)

- [x] **W5:** Shared `agentIntroParagraph()` — **prepend only**; keeps workflow, tools, and module blocks after the intro
- [x] **W5:** `roleSummaryFirstPerson` in all seven briefing JSONs (derived from existing `roleSummary` / overview copy)
- [ ] **W5:** Wire intro helper on overview / who-are-you intents for Vincent, Artemis, Zara, Cheryce, Edwardo (Andrieus + Zyanne done)
- [ ] **W5 / US-016:** Expand LLM polish pilot to Artemis key intents

### Gap 10 — Cheryce video understanding (pointers)

- [ ] **Gap 10 (optional):** `enrich:video-knowledge` pipeline (captions → summarise → human approve)

### Wave 6 (W6) — Proactive intelligence (remaining)

- [ ] **W6:** Refresh highlights on profile region change (re-pick deal/deadline)
- [ ] **W6:** Schedule `npm run build:agent-highlights` weekly on Render/cron

### Wave 7–9 (W7–W9) — later

- [ ] **W7:** Top misses panel on agents-admin (aggregate ask logs)
- [ ] **W7:** Restaurant asset benchmark line when `siteId` known (US-022)
- [ ] **W8:** Agent voice (speak/listen) — enable all seven + premium TTS optional
- [ ] **W9:** Agent email (send me this) (SkillBoss optional)

---

## Mapping reference (so nothing gets lost)

- **Gap 1** ↔ **Wave 1** (member context) — shipped
- **Gap 2** ↔ **Wave 3** (trust: live vs illustrative) + ops work
- **Gap 3** ↔ deliverables — shipped
- **Gap 4** ↔ **Wave 7** (measurement & live ops) — partial
- **Gap 10** ↔ content understanding — shipped (pointers); enrich pipeline backlog
