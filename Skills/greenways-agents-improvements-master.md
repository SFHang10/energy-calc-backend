# Greenways Agents — Improvements Master List

**Purpose:** One place to track improvements for Greenways Agents. This combines:
- **Ralph Power Platform PRD** (`tasks/prd-agents-power-platform.json`) — W1–W9 waves + user stories
- **Connective-tissue gaps backlog** (`Skills/greenways-agents-possible-next-steps.md`) — Gap 1–10

**Rule:** Add new work here first. The two source documents can keep detail, but this is the **single working queue**.

---

## What’s already shipped (recent)

- [x] **W7 / Gap 4 — Measurement & live ops (partial):** `/ask` JSONL logging + viewer endpoint (`/api/agents-admin/ask-logs`) — 2026-07-13
- [x] **Gap 2 (partial):** Site energy reading module shipped (UK live; EU benchmark until ENTSO-E key) — 2026-07-13

---

## One combined queue (work order)

### Wave 1 (W1) — Member + site context

- [ ] **W1 / Gap 1:** Pass `tier`, `memberId`, `region`, `siteId` from `wix-integration/unified-membership-dashboard.html` into agent `/ask` requests
- [ ] **W1 / Gap 1:** Resolve member profile fields server-side when `memberId` present (fails open)
- [ ] **W1:** Profile context chip in chat UI when region/sector known

### Wave 3 (W3) — Trust & freshness

- [ ] **W3 / Gap 8:** Show “data as of” on key tablets (deals feed generatedAt, schemes updatedAt)
- [ ] **W3 / Gap 2:** Document what is live vs placeholder in KPI/dashboard copy (avoid implying live feeds)

### Gap 3 — Deliverables aren’t agent-facing yet

- [ ] **Gap 3:** Add `restaurant-energy-snapshot` to `data/greenways-content-modules.json` (Vincent + Edwardo homes)
- [ ] **Gap 3:** Vincent/Edwardo intents: “energy snapshot” / “site brief” → module tablet (with `?site=&region=`)

### Gap 2 — Live data vs illustrative data

- [ ] **Gap 2 / W3:** ENTSO-E token + Render env `ENTSOE_API_KEY` so EU site energy reading becomes live (NL/ES/PT)

### Wave 5 (W5) — Voice & depth parity (copy)

- [ ] **W5:** User-facing module copy audit (no “Wix/iframe/bridge” in customer copy)
- [ ] **W5:** Shared first-person agent intro helper for meta “who are you” questions

### Gap 10 — Cheryce video understanding (pointers)

- [ ] **Gap 10:** Add `data/greenways-video-knowledge.json` (summary + takeaways per video) so Cheryce can explain “what this video is about”
- [ ] **Gap 10:** Optional: `enrich:video-knowledge` pipeline (captions → summarise → human approve)

### Wave 2 (W2) — Upgrade plans

- [ ] **W2:** Turn UI supports `upgrade_plan` block type
- [ ] **W2:** Server composer builds an upgrade plan (pilot vertical: fridge or wok)
- [ ] **W2:** Wire upgrade plan intent on Artemis + Orchestra

### Wave 4 (W4) — Actions from chat

- [x] **W4:** Product shortlist add/remove on cards (sessionStorage pilot on Zyanne + Artemis)
- [x] **W4:** Open marketplace with grants from banner, shortlist row, and finder module embed (`target=_top`, `fromPopup=true`)
- [x] **W4:** Shortlist sidebar — Check grants with Andrieus handoff + Clear shortlist
- [x] **W4:** Copy upgrade plan to clipboard (`upgrade_plan` block in turn UI)

### Wave 6–9 (W6–W9) — later

- [ ] **W6:** Proactive intelligence (nudges / alerts)
- [ ] **W7:** Measurement & live ops (expand beyond logging: quota, rate limit, dashboards)
- [ ] **W8:** Agent voice (speak/listen) (premium STT/TTS optional)
- [ ] **W9:** Agent email (send me this) (SkillBoss optional)

---

## Mapping reference (so nothing gets lost)

- **Gap 1** ↔ **Wave 1** (member context)
- **Gap 2** ↔ **Wave 3** (trust: live vs illustrative) + ops work
- **Gap 3** ↔ deliverables (feeds W2 upgrade plans later)
- **Gap 4** ↔ **Wave 7** (measurement & live ops)
- **Gap 10** ↔ content understanding (supports W5 copy depth)

