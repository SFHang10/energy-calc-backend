## 🧠 Greenways Skills Base – Export (Overview & Reference)

**Purpose:** Single exportable overview of all skills, their purpose, trigger phrases, and routing.  
**Source:** Consolidated from `Structure.md`, `SKILL-ORCHESTRATOR.md`, and individual skill docs.  
**Location:** `Skills/Skills-Export.md`

---

## 1. Skills Library (High‑Level Index)

| Area | Skill | File | Primary Purpose |
|------|-------|------|-----------------|
| Systems | **Systems** | `Systems MD.md` | Health checks, MCP, ETL, deployment diagnostics |
| Marketplace | **Greenways Market Manager** | `Greenways Market Manager MD.md` | Wix store, products, categories, images |
| Media & UI | **Media Skill** | `Media Skill MD.md` | Product images, CSS patterns, raised cards, glossy headers |
| Grants | **Grants & Schemes Finder** | `grants-schemes-finder.md` | Find and curate energy grants & schemes (EU + UK + others) |
| Products | **Product Addition Workflow** | `product-addition-workflow.md` | ⚠️ Mandatory product grants & collection enrichment |
| Products | **Product Deep Dive** | `product-deep-dive.md` | Deep-dive product content & JSON generation |
| Members | **Member Manager** | `member-manager.md` | Member profiles, uploads, profile UX |
| Pricing | **Product Deal Finder** | `product-deal-finder.md` | Deals, discounts, best‑price comparisons |
| Data | **Historical Data Finder** | `historical-data-finder.md` | Historical energy price/cost comparisons |
| Calculators | **Calculator Cohesion** | `calculator-cohesion.md` | Align all calculators to shared enriched data |
| Hover UX | **Hover Data Aggregator** | `hover-data-aggregator.md` | Hover cache for grants + deals |
| Hover UX | **Personalized Impact Hover** | `personalized-impact-hover.md` | “Why this matters” explainer content |
| Content | **Content Operations** | `content-operations.md` | Draft → review → publish workflow |
| News | **Sustainability News Finder** | `sustainability-news-finder.md` | Sustainability news roundups & HTML reports |
| News | **New in Tech News Finder** | `tech-news-finder.md` | Green + general tech news reports |
| News → Products | **News → Product Recommender** | `news-product-recommender.md` | Map news topics to example marketplace products |
| Video | **Sustainability Video Finder** | `sustainability-video-finder.md` | Curated video lists and embeds |
| Content | **Sustainability Blog Writer** | `sustainability-blog-writer.md` | Blog posts, ESG reports, finance articles |
| Energy Data | **Energy Ticker** | `energy-ticker.md` | Live European energy price ticker widget |
| Energy Data | **Rate Consultant** | `rate-consultant.md` | Safe price‑trend & savings insights |
| Projects | **Sustainable Renovation Planner** | `sustainable-renovation-planner.md` | Renovation/retrofit project plans with grants |
| Communication | **Secretary Skill** | `secretary-skill.md` | Professional emails (outreach, partnerships, press) |
| HTML | **HTML Content Creator** | `html-content-creator.md` | HTML pages for Wix with images & tabs |
| Autonomy | **Ralph Integration** | `RALPH-INTEGRATION.md` | Autonomous multi‑step feature execution (PRD‑based) |
| Orchestration | **Skill Orchestrator** | `SKILL-ORCHESTRATOR.md` | Master router and continuous‑learning controller |

⚠️ **Mandatory:** `product-addition-workflow.md` must be used for all new products before store placement.

---

## 2. Global Trigger Cheat‑Sheet

Use these phrases in natural language; the orchestrator will route to the right skill.

- **Systems & Health**
  - Triggers: `"check systems"`, `"run health check"`, `"MCP not working"`, `"check Render deployment"`, `"start server"`, `"start backend"`
  - Routes to: `Systems MD.md`

- **Marketplace & Products**
  - Triggers: `"manage greenways market"`, `"product not showing"`, `"wrong image on product"`, `"Wix store issue"`, `"deploy product changes"`
  - Routes to: `Greenways Market Manager MD.md`

- **Images & Styling**
  - Triggers: `"find product image"`, `"product has no image"`, `"image is blurry"`, `"make card raised"`, `"add glossy finish"`, `"vibrant header"`
  - Routes to: `Media Skill MD.md`

- **Grants & Schemes**
  - Triggers: `"find new grants"`, `"energy efficiency grants"`, `"update schemes.json"`, `"government incentives"`
  - Routes to: `grants-schemes-finder.md`

- **Add / Enrich Products (MANDATORY)**
  - Triggers: `"add new product"`, `"product grants workflow"`, `"add grants to product"`, `"products-with-grants"`, `"collection agencies"`
  - Routes to: `product-addition-workflow.md`

- **Deep Dive Content**
  - Triggers: `"product deep dive"`, `"deep dive page"`, `"rich product info"`, `"show all grants and reviews"`
  - Routes to: `product-deep-dive.md`

- **Members & Profiles**
  - Triggers: `"member manager"`, `"profile page"`, `"user uploads"`, `"profile image"`, `"member dashboard"`
  - Routes to: `member-manager.md`

- **Deals & Pricing**
  - Triggers: `"find deals"`, `"product deals"`, `"best price"`, `"discount code"`, `"special offer"`
  - Routes to: `product-deal-finder.md`

- **Historical Data & Calculators**
  - Triggers: `"historical cost"`, `"price history"`, `"compare old vs new appliance cost"`
  - Routes to: `historical-data-finder.md`
  - Triggers: `"calculator data"`, `"align calculators"`, `"calculator cohesion"`, `"grants on calculators"`
  - Routes to: `calculator-cohesion.md`

- **Hover UX**
  - Triggers: `"hover data"`, `"hover tooltip"`, `"hover grants"`, `"hover deals"`, `"hover cache"`
  - Routes to: `hover-data-aggregator.md`
  - Triggers: `"personalized hover"`, `"why this matters to me"`, `"impact summary"`
  - Routes to: `personalized-impact-hover.md`

- **News, Tech & Video**
  - Triggers: `"sustainability news"`, `"news roundup"`, `"policy update report"`
  - Routes to: `sustainability-news-finder.md`
  - Triggers: `"new in tech"`, `"tech news"`, `"technology news"`
  - Routes to: `tech-news-finder.md`
  - Triggers: `"find sustainability videos"`, `"embed videos"`, `"ETL product videos"`
  - Routes to: `sustainability-video-finder.md`
  - Triggers: `"auto link products from news"`, `"news to product matching"`, `"example product links"`
  - Routes to: `news-product-recommender.md`

- **Content & HTML**
  - Triggers: `"content workflow"`, `"publish content"`, `"content pipeline"`
  - Routes to: `content-operations.md`
  - Triggers: `"create HTML page"`, `"build webpage"`, `"tabbed HTML"`, `"embed in Wix"`
  - Routes to: `html-content-creator.md`

- **Writing & Communication**
  - Triggers: `"write blog post"`, `"ESG report"`, `"sustainability blog"`, `"write about [topic]"`
  - Routes to: `sustainability-blog-writer.md`
  - Triggers: `"write an email"`, `"email template"`, `"outreach email"`, `"secretary"`
  - Routes to: `secretary-skill.md`

- **Energy Data & Insights**
  - Triggers: `"energy ticker"`, `"energy price ticker"`, `"live energy prices"`, `"renewable share ticker"`
  - Routes to: `energy-ticker.md`
  - Triggers: `"price trends"`, `"energy price insights"`, `"savings potential"`, `"wholesale vs retail"`
  - Routes to: `rate-consultant.md`

- **Projects & Autonomous Features**
  - Triggers: `"renovation plan"`, `"retrofit plan"`, `"project plan"`, `"grant strategy"`
  - Routes to: `sustainable-renovation-planner.md`
  - Triggers: `"use Ralph for this"`, `"create a PRD for"`, `"autonomous deployment"`, `"run Ralph loop"`, `"complex implementation"`
  - Routes to: `RALPH-INTEGRATION.md`

---

## 3. Routing Logic (Condensed)

High‑level decision tree used by the orchestrator:

```text
User Request
  ├─ Mentions "add product" / "product grants" → Product Addition Workflow (MANDATORY)
  ├─ Mentions "Ralph" / "PRD" / "autonomous"   → Ralph Integration
  ├─ Mentions "system" / "MCP" / "health"      → Systems
  ├─ Mentions "store" / "market" / "category"  → Market Manager
  ├─ Mentions "image" / "blurry" / "photo"     → Media Skill
  ├─ Mentions "grant" / "scheme" / "funding"   → Grants Finder
  ├─ Mentions "deep dive" / "product details"  → Product Deep Dive
  ├─ Mentions "profile" / "member"             → Member Manager
  ├─ Mentions "HTML" / "webpage" / "page"      → HTML Creator
  ├─ Mentions "news" / "roundup" / "policy"    → Sustainability or Tech News Finder
  ├─ Mentions "blog" / "article" / "ESG"       → Blog Writer
  ├─ Mentions "energy ticker" / "live prices"  → Energy Ticker
  ├─ Mentions "price trends" / "savings"       → Rate Consultant
  └─ No clear match                             → Orchestrator asks clarifying questions
```

---

## 4. Typical Multi‑Skill Flows

- **Add New Product (with image)**
  - Media Skill → Product Addition Workflow ⚠️ → Market Manager → Systems

- **Create Product Page**
  - HTML Content Creator → Media Skill → Market Manager

- **Build Product Deep Dives**
  - Product Deep Dive → HTML Content Creator → Systems

- **Weekly Content Update**
  - Grants Finder → Video Finder → Sustainability News Finder → Blog Writer → Content Operations

- **Renovation Project Plan**
  - Renovation Planner → Grants Finder → Product Addition Workflow (if new products) → HTML Content Creator

---

## 5. Continuous Learning Protocol (Summary)

- **After every task**, new learnings are documented in the relevant skill file and/or `AGENTS.md`.
- Standard documentation format captures: **Issue**, **Date**, **Problem**, **Root Cause**, **Solution**, **Prevention/Future Use**.
- New trigger phrases and workflow improvements are added to `SKILL-ORCHESTRATOR.md` and `Structure.md`.

This file is intentionally compact so it can be exported (Markdown → Word/PDF) and used as a **single reference** to the entire skills base. For full details, open the individual skill files listed above.

