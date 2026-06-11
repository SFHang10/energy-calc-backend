# 💷 Product Deal Finder Skill

**Skill Type:** Deals, Pricing & Promotions  
**Purpose:** Find the best deals, offers, and price comparisons for a product  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 🎯 Goal

Provide customers with accurate, up-to-date deal options for a specific product across UK/EU retailers and comparison sites.

---

## ✅ Core Features

1) **Deal discovery** across UK/EU retailers  
2) **Price comparison** and lowest-price identification  
3) **Voucher / promo code** checks  
4) **Clear output** with links, conditions, and expiry dates  

---

## 🔄 Workflow (MANDATORY)

1. **Confirm product specifics** (model/variant/specs)  
2. **Search multiple sources** (retailers + comparison + deal sites)  
3. **Verify pricing** (VAT/shipping/availability)  
4. **Report results** in structured format  
5. **Include disclaimers** (price changes / availability)  

---

## ✅ Output Format (Standard)

```
## [Product Name] - Current Deals (as of [Date])

### 🏆 Best Overall Deal
**[Retailer Name]** - £XXX.XX / €XXX.XX
- Key benefit
- Conditions
- Link
- Valid until

### 💰 Price Comparison
| Retailer | Price | Shipping | Offer | Link |

### 🎫 Active Discount Codes
- Code / Conditions / Valid until

### 📊 Notes
- Price range
- Availability
- Verification timestamp
```

---

## ✅ Success Criteria

- At least 3 credible sources checked  
- Clear summary with links  
- Price + shipping + conditions noted  
- “As of” timestamp included  

---

## 💬 Consumer chat (Energy Portal) — what belongs in agents

**Principle:** Chat agents surface **consumer-facing** pages and catalogues already on the site. **Exclude** admin workflows (`npm run build:deals-feed`, integrator scripts, MCP setup, merge queues) from answers — those stay in `AGENTS.md` for developers.

### Split across two agents (recommended)

| Agent | Skill | Consumer surfaces | Canonical data |
|-------|--------|-------------------|----------------|
| **Deals Agent** ✅ | This skill § **energy & hub** | `Deals.html`, `deals-ticker-hub.html`, `european_energy_deals_portal.html` | `data/deals-feed.json` (energy / water / sustainability **lanes**) |
| **Sustainable Products Agent** ✅ | This skill § **product offers** | **One agent · three lanes:** Water / Electricity / Gas savings (chips + banner, not 3 agents) | `greenways-sustainable-products-agent.html`, `water-saving-finder.html`, `sustainable_product_deal_finder_portal.html`, `sustainable-products-catalog.json`, ETL products |

**Deals Agent today** covers tariffs/packages + ticker lanes **and product deal spotlights** (weekly feed rows with `productId`). **Sustainable Products Agent** is the right home for “find me an efficient fridge”, category search, and catalog rows with photos.

**Consumer visibility:** both chat UIs highlight product deals — Deals owns **spotlights**; Sustainable Products owns **search**, with cross-links in welcome cards and sidebars.

### Consumer answer checklist (both agents)

Include in chat responses:

- **What** the deal/product is (plain language)  
- **Why it saves** money/energy/water (one line)  
- **Region** (NL, UK, EU) when relevant  
- **Link** to the full HTML tool (open in same site / Wix embed)  
- **Photo** in banner when `imageUrl` or product image exists  
- **Disclaimer** — prices/tariffs/offers change; verify on linked page  

Do **not** include in consumer chat:

- Build commands, seed file paths for editors, Render deploy steps  
- Internal candidate queues, Ralph tasks, integrator CLI  

### Showcase banner (consumer)

- **Deals:** energy-lane feed rows + Wix category photos (`data/deals-agent-showcase.json`)  
- **Sustainable Products:** ETL + `sust_*` catalog rows with `imageUrl` (mirror Equipment Agent pattern)  

Clone pattern: `Skills/greenways-chat-interface-skill.md`.

### Two product sources (same as dashboard finders)

Every consumer search — finder HTML **or** future chat agent — merges **both** lanes from `/api/equipment-intelligence/alternatives`:

| Source | ID prefix | What it is | Consumer label |
|--------|-----------|------------|----------------|
| **Greenways Marketplace** | `etl_*` | Listed products with grants overlay, images, widget | “On Greenways” |
| **Broader market** | `sust_*` | Gas/water/retrofit catalog (`sustainable-products-catalog.json`) | “Market alternative” |

**Dashboard parity:** `sustainable_product_deal_finder_portal.html`, `water-saving-finder.html`, `restaurant-equipment-deep-dive.html`, and `equipment_intelligence_tool.html` all use the same API — the **Sustainable Products Agent** must mirror this split (banner cards tagged by `source`, not marketplace-only).

**Utility lanes** (one agent, three focuses — not three agents):

- **Water** — high `dailyWaterLitres`, water finder, aerators, dishwashers  
- **Electricity** — kWh, ETL refrigeration, lighting, combi  
- **Gas** — `dailyGasKwh`, wok accessories, cooking/heating retrofits  

Filter showcase + intents by lane; catalog rows already carry `utilityProfile`.

### Admin: “Suggest for Greenways” (staff — not consumer chat copy)

When a **`sust_*`** (or external) product is a good marketplace candidate (e.g. water-saving device not yet listed):

1. Staff uses **Suggest for Greenways** on finder / deep dive cards (already wired).  
2. **POST** `/api/equipment-intelligence/marketplace-intake-suggestions` → `data/marketplace-intake-suggestions.json`.  
3. Review queue → product workflow → new `etl_*` → set `promotedToProductId` on catalog row.

**Sustainable Products Agent (admin mode / future):** optional staff-only chip or sidebar — “Add to Greenways intake” on external cards — **same API**, same payload as finders. **Do not** show intake actions in default consumer embed; keep admin on dashboard finders or `?staff=1` until auth exists.

**Finder auto-grow:** `persistCatalog=1` on search saves matches + discovery rows to catalog — admin reviews before listing (see `energy-dashboard-skill.md` § Sustainable products catalog).

---

## 🧭 Reference Guide

Use the full guide for search strategy, retailer lists, and templates:  
`Skills/Product_Deal_Finder_Guide.md`

---

## ✅ Trigger Phrases

Activate this skill when the user says:
```
"find deals"
"product deals"
"best price"
"discount code"
"compare prices"
"special offer"
"promo code"
"sale price"
```

---

## ✅ Success Criteria

- At least 3 credible sources checked  
- Clear summary with links  
- Price + shipping + conditions noted  
- “As of” timestamp included  
