# Agents data refresh playbook

**Skill type:** Staff operations (Administrator)  
**Consumer home:** **Edwardo** (`systems-agent`) — verify only; **Greenways Guide** (`guide-agent`) — routes staff here  
**Orchestrator:** *“agents data refresh”*, *“update agent databases”*, *“refresh schemes and feeds”*, *“data cleaning agents”* → this file  
**Related:** `data/greenways-agent-admin-registry.json` · `data/agents-data-pipeline.json` · `agents-admin.html` · `agents-admin-map.html` · `skills-backend-automation.md` · `product-addition-workflow.md`  
**Last updated:** 17 Jun 2026

---

## Purpose

Keep **all seven Transition Agents** reading the same fresh, clean catalogue data. Agents **never write** at runtime — staff and scripts publish JSON/HTML, then deploy to Render.

```text
Staff / scripts / review  →  Tier 1 canonical JSON  →  Tier 2 generators  →  git push  →  Render  →  agents read
```

**Edwardo** reports freshness (`/api/systems-agent/status`). He does **not** run integrators. Use this playbook to decide **what to rebuild**, then run commands locally or from CI.

---

## Where to look first

| Tool | URL (Render) | Use |
|------|----------------|-----|
| **Agents admin** | `/agents-admin.html` | Per-agent data sources — ok / warn / stale |
| **Agents network map** | `/agents-admin-map.html` | Handoffs, shared files, portal modules |
| **Edwardo verify** | `/greenways/systems-agent` → Ops verify | Read-only checks (`grants`, `products`, `catalog`, `deals`, `news`) |
| **Pipeline manifest** | `data/agents-data-pipeline.json` | Machine-readable tier order + commands |
| **Registry** | `data/greenways-agent-admin-registry.json` | Agent ↔ file ↔ npm task map |

**Orchestrator (Guide hub):** ask *“how do we refresh agent data?”* or *“what is stale?”* — routes to Edwardo + this playbook.

---

## Data tiers

### Tier 1 — Canonical (edit here)

| File | Owns | Agents affected |
|------|------|-----------------|
| `schemes.json` | Grants & schemes | Andrieus, all product grants |
| `FULL-DATABASE-5554.json` | Marketplace product specs | Artemis, widget API, deep dive |
| `data/sustainable-products-catalog.json` | `sust_*` finder catalogue | Zyanne, equipment intelligence |
| `data/deals-feed-seeds.json` + `data/deals-weekly-input.json` | Deals inputs | Zara |
| `content-ops/` news editions | Cheryce monthly/daily | Cheryce |
| `data/greenways-content-modules.json` | Portal module tablets | All agents (module opens) |
| `data/companies.json` | Sustainability map cards | Cheryce |

### Tier 2 — Generated (rebuild after Tier 1)

| Command | Output | When |
|---------|--------|------|
| `node product-grants-integrator.js` | `products-with-grants.json` | After **any** `schemes.json` change |
| Merge / regen | `products-with-grants-and-collection.json` | When widget/deep dive uses collection bundle |
| `npm run build:deals-feed` | `data/deals-feed.json` | Weekly or after deals seeds/input |
| `npm run build:agent-highlights` | `data/greenways-agent-highlights.json` | Weekly — powers sidebar **This week** nudge on all seven agents |
| `npm run build:media-daily-brief` | `data/media-daily-brief.json` | After new news edition |
| `npm run enrich:sustainable-products` | Grant overlay on `sust_*` catalog | After catalog or schemes change |
| `npm run sync:content-module-knowledge:apply` | Agent knowledge module blocks | After portal copy in content-modules |
| `npm run sync:agent-sidebar` | Sidebar quick links JSON → HTML shells | After sidebar config change |

### Tier 3 — Agent config

`data/*-agent-{briefing,intents,references,showcase}.json` — edit per character; run smokes after material changes.

### Tier 4 — SQLite

`database/energy_calculator_central.db` — product/widget API store. **Not** the primary agent knowledge path today. Keep exports in sync; do not make agents depend on DB-only fields without a documented export job.

---

## Standard refresh order

Run only the steps that match files you changed. Full order (see `npm run refresh:agents-data -- --dry-run`):

1. **Validate Tier 1** — JSON parses; no broken internal ids (manual or future `validate:agent-data`)
2. **Schemes → products** — `node product-grants-integrator.js` if `schemes.json` touched
3. **Sustainable catalog** — `npm run enrich:sustainable-products` if `sustainable-products-catalog.json` or schemes touched
4. **Deals** — `npm run build:deals-feed` if seeds/weekly input touched
5. **News** — `npm run build:media-daily-brief` if content-ops edition added
6. **Portal modules** — `npm run sync:content-module-knowledge -- --dry-run` then `--apply` if modules changed
7. **Sidebars / voice / team** — `npm run sync:agent-sidebar`, `node scripts/sync-greenways-agent-voice.js`, `node scripts/sync-greenways-agent-team.js` when roster or links change
8. **QA** — `npm run smoke:agents-ask` · `npm run smoke:agent-links`
9. **Edwardo verify** — open `/greenways/systems-agent` or `GET /api/systems-agent/status`
10. **Deploy** — git commit → push → `/health` → spot-check one agent `/ask`

---

## Update cleaning (hygiene)

Cleaning = **validators + review queues**, not agents auto-editing production JSON.

| Check | What | Action |
|-------|------|--------|
| **Link smoke** | `npm run smoke:agent-links` | Fix hrefs in agent references / content-modules |
| **Canonical HTML paths** | `HTMLs/` vs `HTMLS GWM GWB/` | One live path per page (e.g. monitoring guide = `HTMLs/Importance of energy Monitoring.html` on Wix) |
| **Product id integrity** | Showcase/deep-dive ids | Must exist in `FULL-DATABASE-5554.json` or `sust_*` catalog |
| **Grants parity** | After integrator | Spot-check `/api/product-widget/:id` for grant chips |
| **ETL copy policy** | ETL-facing HTML | Official category names; official logo for titles; no unsourced £/% |
| **Scheme URLs** | `schemes.json` links | Future: review queue before bulk URL changes |
| **Module drift** | `sync:content-module-knowledge` dry-run | Align chat tablets with `greenways-content-modules.json` |

Drafts and research stay in **content-ops** or review JSON — never unreviewed LLM output into Tier 1.

---

## Per-agent quick reference

| Agent | Refresh when | Key commands |
|-------|----------------|--------------|
| **Andrieus** | Schemes added/retired | **`Skills/grants-refresh-playbook.md`** · integrator + bundle rebuild |
| **Vincent** | Finance tools/refs, energy pages | edit `data/finance-agent-*.json` |
| **Artemis** | Products, renovation, deep dive | integrator + `FULL-DATABASE-5554.json` |
| **Zara** | Deals spotlights | `build:deals-feed` |
| **Cheryce** | News editions, companies map | `build:media-daily-brief` |
| **Zyanne** | Sustainable catalog | `enrich:sustainable-products` |
| **Edwardo** | After any Tier 2 run | verify checks on systems-agent |

---

## Cadence (suggested)

| Frequency | Task |
|-----------|------|
| **Weekly** | `npm run refresh:agents-weekly` (or `build:deals-feed` + `build:agent-highlights`), check admin stale badges |
| **After scheme edits** | `product-grants-integrator.js` |
| **After news edition** | `build:media-daily-brief` |
| **Monthly** | `enrich:sustainable-products`, ETL image sync (`sync:etl-images:apply`) |
| **Every deploy** | `smoke:agents-ask` (CI when wired) |

---

## Phase 2 (backlog — admin cockpit)

Registry `globalTasks` are listed in admin UI but **not** one-click run yet. Target:

- Staff-only `POST /api/agents-admin/run-task` with dry-run log
- `data/pipeline-runs.json` — last success per command
- CI: `validate:agent-data` blocks merge on smoke failure

Until then: run commands locally from this playbook.

### Render / scheduled weekly (W6)

Run **`npm run refresh:agents-weekly`** every Monday (or after major catalogue edits). It rebuilds:

- `data/deals-feed.json` — Zara welcome spotlight + deals lanes
- `data/greenways-agent-highlights.json` — sidebar **This week** on all seven agents

**Options:**

1. **Local / staff** — `npm run refresh:agents-weekly` → commit both JSON files → push (Render serves static `data/`).
2. **GitHub Actions** (optional) — weekly workflow on `main` that runs the script and opens a PR when outputs change.
3. **Render Cron Job** (optional) — separate cron service in the same repo: `npm run refresh:agents-weekly` then commit is not automatic on Render; prefer (1) or (2) unless you add a staff-only rebuild endpoint.

---

## Orchestrator routing

| You say | Route |
|---------|--------|
| *“refresh agent data”*, *“update databases for agents”* | This playbook + Edwardo verify |
| *“stale deals feed”* | `build:deals-feed` step + Zara + Edwardo `deals` check |
| *“schemes changed”* | integrator step + Andrieus |
| *“agent not working”* | `SKILL-ORCHESTRATOR.md` § operations runbook (triage) |

**Guide hub** intent: `route_data_refresh` in `data/guide-agent-intents.json`.

---

## After each refresh cycle — document

1. Note which tiers changed in commit message  
2. If new symptom or rule: append **`AGENTS.md`** learnings log  
3. If new npm step: update **`data/agents-data-pipeline.json`** and this file  
4. If consumer-facing behaviour changed: **`greenways-agents-go-live.md`** smoke row
