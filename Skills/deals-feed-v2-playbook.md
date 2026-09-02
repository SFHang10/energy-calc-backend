# Deals feed v2 — balanced thin slice playbook

**Owner agent:** Zara (`deals-agent`)  
**Strategy:** Option **C** — thin slice across **energy**, **water**, and **sustainability** lanes, then deepen each lane over time.  
**Registry:** `data/deals-source-registry.json`  
**Candidate queue:** `data/deals-candidates.json`  
**Built feed:** `data/deals-feed.json` ← `npm run build:deals-feed`

**Related:** `Skills/product-deal-finder.md` · `Skills/Product_Deal_Finder_Guide.md` · `Skills/agents-data-refresh-playbook.md` · Vincent finance external news pattern (`data/finance-external-sources.json`)

---

## What “deal” means (four types, three lanes)

| Lane | Deal types | Not grants |
|------|------------|------------|
| **energy** | Tariffs, green supply, SME/hospitality packages, renewal windows | Andrieus owns schemes — Zara may **stack** link only |
| **water** | Aerators, warewash, submetering, leak products | Same |
| **sustainability** | ETL marketplace + `sust_*` catalog + retailer promos | Product search → Zyanne; grants overlay → Andrieus |

---

## Current v1 (baseline)

- `deals-feed-seeds.json` — ~11 curated **tool pointers** (mostly internal HTML)
- `deals-weekly-input.json` — manual product stub
- `build-deals-feed.js` — merge only; no discovery pipeline
- Wire snapshot counts rows from `deals-feed.json` — trust labels already on wire/chat

---

## Phased rollout

### Phase 0 — Registry + schema ✅ (2026-09-01)

- [x] `data/deals-source-registry.json` — sources per lane, trust tiers, planned auto-fetch
- [x] `data/deals-candidates.json` — queue template + one example row per lane
- [x] This playbook

### Phase 1 — Thin slice seeds ✅ (2026-09-01)

| Field | Required |
|-------|----------|
| `id` | stable slug |
| `category` | `energy` \| `water` \| `sustainability` |
| `title`, `line` | consumer copy |
| `region` | NL \| UK \| EU |
| `href` | external URL or Greenways path |
| `trust` | `live` \| `curated` \| `illustrative` |
| `sourceName` | human-readable |
| `addedAt` | ISO date |
| `isNew` | boolean |
| `expiresAt` | optional ISO date |
| `productId` | optional — sustainability lane |
| `stackHints` | optional — `grants-agent`, `finance-agent`, `equipment-agent` |

- [x] 9 seed rows (3 per lane) in `deals-feed-seeds.json` v2
- [x] `npm run build:deals-feed`

### Phase 1b — Tester UX ✅ (2026-09-01)

- [x] Trust badges + `sourceName` on deals hub cards (`deals-ticker-hub.html`)
- [x] Wire desk spotlights from newest feed row per lane (`deals-wire-snapshot.js`)
- [x] Zara welcome spotlight → **Open this deal** (`greenways-deals-agent.html`)
- [x] Stack hint chips (hub cards + Zara handoffs from `stackHints`)
- [x] `npm run smoke:deals-feed` + agents-data-pipeline validator

### Phase 2 — Candidate pipeline (next)

Mirror music / finance:

1. Scout or staff add rows → `deals-candidates.json` (`approved: false`)
2. Review (future `deals-headlines-admin.html` or JSON edit)
3. `npm run merge:deals-candidates` → appends to seeds or weekly input
4. `npm run build:deals-feed`

Optional: `data/deals-external-sources.json` for RSS/Atom (reuse finance-external-news patterns where overlap exists).

### Phase 3 — Internal synthesis lane

Auto-rows **without** scraping retailers:

- **Energy:** wholesale move from finance wire ticker → “renewal timing” spotlight
- **Water:** new `sust_*` catalog matches from water finder `persistCatalog`
- **Sustainability:** ETL products with grants count + showcase rotation from `deals-agent-showcase.json`

Label `trust: live` only when tied to repo data; else `curated`.

### Phase 4 — Consumer tool polish

- [x] Stack chips: grants / payback / equipment on hub + Zara handoffs
- [ ] Deals hub: search by `productId` and `trust`
- [ ] Zara wire pills: headline from newest row per lane (partial — wire spotlights done)

### Phase 5 — Ops (Edwardo-aligned, later)

- [x] Render in-process weekly cron: `services/wire-refresh-cron.js` → `npm run refresh:agents-weekly` (deals feed + agent highlights) — 2026-09-02
- `agents-data-pipeline.json` stale badges (already registered)
- Edwardo status: deals feed age + candidate queue depth

---

## Weekly staff workflow (target)

1. Pick **one lane** per week to deepen (rotate energy → water → sustainability).
2. Add 2–5 candidates from registry sources (`deals-source-registry.json`).
3. Approve → merge → build.
4. Smoke: `/api/deals-wire/snapshot`, `/greenways/deals-hub`, Zara “check deals feed”.
5. Log in `agents-admin` freshness panel.

---

## Lane rotation (slow build)

| Week focus | Hunt in | Example outcome |
|------------|---------|-----------------|
| Energy | NL vergelijk + UK Uswitch + DESNZ cross-tag | 2 tariff compare rows + 1 policy timing row |
| Water | HORECA promo + water finder catalog | 2 product rows + 1 grant stack hint |
| Sustainability | ETL showcase + Currys/Coolblue spot check | 2 `etl_*` rows + 1 `sust_*` row |

---

## Orchestrator triggers

- *“deals feed v2”* · *“Zara sources”* · *“merge deals candidates”* → this file + registry.

---

## Do not (consumer chat)

- Expose build commands, candidate queues, or scraping in Zara answers
- Duplicate full schemes catalogue — hand off to Andrieus
- Present illustrative tool links as live prices

See `Skills/product-deal-finder.md` § consumer vs admin.
