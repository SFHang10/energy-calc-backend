# Grants refresh playbook (staff)

**Skill type:** Administrator — schemes catalogue + per-product grants overlay  
**Orchestrator:** *“grants refresh”*, *“refresh schemes”*, *“product grants integrator”*, *“marketplace grants check”* → this file  
**Parent:** `Skills/agents-data-refresh-playbook.md`  
**Last updated:** 17 Jun 2026

---

## Which docs are current (use these)

| Priority | Document | Use for |
|----------|----------|---------|
| ⭐ **1** | **`AGENTS.md`** → Grants & schemes section | Canonical repo rules (2026) |
| ⭐ **2** | **`Skills/product-addition-workflow.md`** | Adding marketplace products — **mandatory** integrator step |
| ⭐ **3** | **`Skills/grants-schemes-finder.md`** | Research new schemes → edit `schemes.json` |
| ⭐ **4** | **`SCHEMES_ADMIN_GUIDE.md`** | Wix schemes **portal** via Mongo + `schemes-admin.html` |
| ⭐ **5** | **`GRANTS_REVIEW_2026-05-11.md`** | Last structured scheme review queue (May 2026) |
| ⭐ **6** | This file | End-to-end refresh order + interface map |

### Legacy / do not follow as primary

| Document | Why stale |
|----------|-----------|
| `GRANTS_PORTAL_CURRENT_STATUS.md` (Nov 2025) | Says 16+24 schemes; repo now has **78** in `schemes.json` |
| `HOW-TO-ADD-MORE-GRANTS.md` | Embeds schemes in old HTML — use **`schemes.json`** instead |
| `GRANTS_OVERLAY_SYSTEM_DOCUMENTATION.md` | Client-side overlay pattern; production uses **JSON exports** |
| `grants-to-add.json` | Legacy helper — new rows go in **`schemes.json`** |
| `comprehensive-grants-system.js` | Old portal merge; **Andrieus** + portals use **`schemes.json`** / API |
| `hardcoded-grants-system.js` | Still used **inside** `combined-grants-loader.js` for category mapping only — do not edit schemes there |

---

## Two layers (do not confuse)

### Layer A — Scheme catalogue (policies)

**Source of truth (git):** `schemes.json`  
**Optional live DB:** MongoDB via `schemes-admin.html` → `/api/schemes` (Wix EU schemes portal)

**Consumers:**
- Andrieus (`services/grants-agent-knowledge.js`) — reads `schemes.json`
- Full Schemes Portals — `/api/schemes` then fallback `schemes.json`
- `combined-grants-loader.js` — all schemes for product matching
- Finance finder / EU portals / water finder (subset)

**Refresh:** edit schemes → export/sync Mongo if you use admin → run product integrator (Layer B).

### Layer B — Per-product grants (marketplace)

**Generator:** `node product-grants-integrator.js`  
**Uses:** `combined-grants-loader.js` (`schemes.json` + hardcoded category maps)  
**Output:** `products-with-grants.json` (repo root)

**Consumers:**
- Marketplace product widget (`routes/product-widget.js`) — **but see gap below**
- Equipment deep dive / intelligence (`services/equipment-intelligence-service.js`)
- Andrieus product samples (with merge fallback)
- Hover cache, deep-dive builder (when bundle fresh)

**New product workflow:** `Skills/product-addition-workflow.md` — product must exist in DB/`FULL-DATABASE-5554.json`, then **always** run integrator.

---

## Known sync gap (Jun 2026) ⚠️

Runtime code **prefers** `products-with-grants-and-collection.json` over `products-with-grants.json`.

| File | Last export | Grants system |
|------|-------------|---------------|
| `products-with-grants.json` | **2026-06-02** | Combined (schemes.json + loader) ✅ |
| `products-with-grants-and-collection.json` | **2025-10-14** | Old hardcoded product grants ❌ |

**Impact:** Product widget and deep dive may show **October 2025** grant chips even after integrator runs, because they load the **collection bundle first**.

**Andrieus partial fix:** `loadProductsWithGrants()` merges grants from `products-with-grants.json` when the collection row has empty `grants[]` — marketplace widget **does not** do this merge today.

**Action after integrator (required for marketplace):**
1. Rebuild **`products-with-grants-and-collection.json`** — `npm run build:products-grants-bundle` (`scripts/build-products-grants-bundle.js`).
2. Mirror is written automatically to `energy-calculator/products-with-grants-and-collection.json`.
3. Edwardo **products** / **grants** checks warn when bundle `exportDate` is older than `products-with-grants.json` or still shows legacy hardcoded grants.

---

## Grants interfaces map

| Interface | What it reads | Updates when |
|-----------|---------------|--------------|
| **Andrieus** chat | `schemes.json` + product overlay files | schemes edit + integrator + bundle |
| **Schemes admin** | MongoDB (writes) | You save in admin UI |
| **`/api/schemes`** | Mongo if connected, else `schemes.json` | Admin or git deploy |
| **Restaurant / EU schemes portals** | `/api/schemes` → `schemes.json` | Same as API |
| **Product widget / marketplace** | `products-with-grants-and-collection.json` + `FULL-DATABASE-5554.json` | **Bundle rebuild** (not integrator alone) |
| **Equipment deep dive** | Same overlay preference as widget | Same |
| **`grants-portal-enhanced.html`** | Legacy JS merge | Not on agent path — avoid for agents |
| **Edwardo verify** | `schemes.json` mtime vs export `exportDate` | Read-only |

---

## Standard grants refresh (checklist)

### 1. Reconcile scheme catalogue

- [ ] Review `schemes.json` (78 rows today) against `GRANTS_REVIEW_2026-05-11.md` pending items
- [ ] If using **schemes admin**: export from admin or run `database/import-schemes.js` / sync policy your team uses — **one** catalogue must be master
- [ ] `GET /api/schemes?limit=200` on Render ≈ row count in `schemes.json`

### 2. Regenerate product grants

```bash
node product-grants-integrator.js
```

- Reads SQLite `database/energy_calculator_central.db`
- Writes `products-with-grants.json` with `metadata.exportDate` and combined grants stats
- Updates `database/energy_calculator_with_grants.db` (optional for SQLite API paths)

### 3. Rebuild collection bundle (required for marketplace)

```bash
npm run build:products-grants-bundle
```

Merges fresh grants from step 2 with collection agency fields (preserved from prior bundle / `products-with-collection.json`, or computed via `collection-agencies-system.js`).

### 4. Sustainable catalog (non-ETL `sust_*`)

```bash
npm run enrich:sustainable-products
```

Uses same `combined-grants-loader.js` + `schemes.json`.

### 5. QA

```bash
npm run validate:agent-data
npm run smoke:agent-links
# or at minimum:
npm run smoke:agents-ask
node check-product-grants.js   # compares bundle vs legacy portal (informational)
```

- **`npm run smoke:agent-links`** — HEAD/GET check on scheme primary links + agent reference URLs (80 URLs). Re-run after URL edits; helper map in `scripts/apply-scheme-link-fixes.js`.

- Edwardo → verify **grants** + **products** checks
- Spot-check: `/api/product-widget/etl_XX_XXXXX` grant chips vs Andrieus answer for same category
- Schemes portals: hard refresh, filter NL/UK

### 6. Deploy

- Commit `schemes.json`, `products-with-grants.json`, **`products-with-grants-and-collection.json`** together
- Push → `/health` → smokes on Render

---

## Orchestrator routing

| Staff question | Answer |
|----------------|--------|
| *“How do we refresh grants?”* | This checklist + `npm run refresh:agents-data` |
| *“Which grants doc is current?”* | Table at top of this file |
| *“New marketplace product?”* | `Skills/product-addition-workflow.md` |
| *“Add a scheme?”* | `schemes.json` + `Skills/grants-schemes-finder.md`; portal via `SCHEMES_ADMIN_GUIDE.md` |
| *“Are grants stale?”* | Edwardo verify or `agents-admin.html` data sources |

---

## Phase 2 (done Jun 2026)

1. **`scripts/build-products-grants-bundle.js`** — merge `products-with-grants.json` + collection fields → `products-with-grants-and-collection.json`
2. **`npm run build:products-grants-bundle`** in `data/agents-data-pipeline.json` after integrator
3. **systems-agent-health** — warns when bundle `exportDate` < `products-with-grants.json` or legacy hardcoded grants system string

**Optional belt-and-braces:** product-widget fallback merge like Andrieus if bundle grants empty (not implemented).

---

## After each grants cycle

- Update `GRANTS_REVIEW_*.md` or archive approved changes
- Note in commit: schemes count, export dates, bundle version
- Append **`AGENTS.md`** if behaviour or file preference changes
