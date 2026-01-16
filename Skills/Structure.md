# 📁 Skills Structure & Reference Guide

**Purpose:** Complete overview of all skills, their triggers, and usage  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`  
**Last Updated:** January 2026

---

## 🗂️ Complete Skills Library

```
Skills/
├── SKILL-ORCHESTRATOR.md          ← Master Controller
├── Structure.md                   ← This File (Reference)
├── Systems MD.md                  ← Health & Connections
├── Greenways Market Manager MD.md ← Wix Store Management
├── Media Skill MD.md              ← Product Images
├── grants-schemes-finder.md       ← Energy Grants
├── product-addition-workflow.md   ← ⚠️ Product Grants Enrichment (MANDATORY)
├── product-deep-dive.md           ← Product Deep Dive (Enhanced product info)
├── member-manager.md              ← Member profiles & uploads
├── product-deal-finder.md         ← Deals, pricing, offers
├── RALPH-INTEGRATION.md           ← Autonomous Feature Deployment
├── sustainability-video-finder.md ← Video Curation
├── sustainability-blog-writer.md  ← Blog & ESG Content
└── html-content-creator.md        ← HTML Pages
```

---

## 📊 Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                    SKILL QUICK REFERENCE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🔧 SYSTEMS        → "check systems", "MCP", "start server"   │
│  🛒 MARKET         → "product", "store", "category", "images" │
│  🖼️ MEDIA          → "find image", "blurry", "raised card",   │
│                      "glossy finish", "vibrant headers"       │
│  🌍 GRANTS         → "grants", "schemes", "funding"           │
│  🛍️ PRODUCT        → "add product", "grants enrichment"  ⚠️   │
│  🔍 DEEP DIVE       → "deep dive", "product details"          │
│  💷 DEALS           → "deals", "discount", "best price"       │
│  🎬 VIDEOS         → "videos", "YouTube", "sustainability"    │
│  ✍️ BLOG           → "write", "blog", "ESG", "article"        │
│  🌐 HTML           → "create page", "HTML", "webpage"         │
│  🤖 RALPH          → "PRD", "autonomous", "multi-step"        │
│                                                                │
│  ⚠️ = MANDATORY for new products (ensures grants data)        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Skills Overview

| Skill | File | Primary Purpose |
|-------|------|-----------------|
| 🎯 **Orchestrator** | `SKILL-ORCHESTRATOR.md` | Routes tasks to correct skill |
| 🔧 **Systems** | `Systems MD.md` | Health checks, connections, diagnostics |
| 🛒 **Market Manager** | `Greenways Market Manager MD.md` | Wix store, products, images |
| 🖼️ **Media** | `Media Skill MD.md` | Find/manage product images |
| 🌍 **Grants Finder** | `grants-schemes-finder.md` | Find energy grants & schemes |
| 🛍️ **Product Workflow** | `product-addition-workflow.md` | ⚠️ Add products with grants/collection |
| 🔍 **Product Deep Dive** | `product-deep-dive.md` | Build deep-dive product info and pages |
| 👥 **Member Manager** | `member-manager.md` | Member profiles, uploads, and access UX |
| 💷 **Product Deal Finder** | `product-deal-finder.md` | Find deals, offers, and price comparisons |
| 🎬 **Video Finder** | `sustainability-video-finder.md` | Find sustainability videos |
| ✍️ **Blog Writer** | `sustainability-blog-writer.md` | Generate blog content & ESG reports |
| 🌐 **HTML Creator** | `html-content-creator.md` | Create HTML pages with images |
| 🤖 **Ralph** | `RALPH-INTEGRATION.md` | Autonomous multi-step feature deployment |

---

## 📋 Complete Trigger Phrases

### 🔧 Systems MD (Health & Connections)

**Activate when user says:**
```
"check systems"
"run health check"
"is MCP working"
"test ETL API"
"check connections"
"system status"
"verify backend"
"is the server running"
"check Render deployment"
"MCP not working"
"API not responding"
"diagnose issue"
"troubleshoot connection"
"start the server"
"start server"
"run the server"
"launch server"
"start local server"
"start backend"
```

**What it does:**
- MCP connection check
- ETL API verification
- Backend health status
- Product count verification
- Missing products report
- **Start local server** (via start-server.bat)

---

### 🛒 Greenways Market Manager (Store Management)

**Activate when user says:**
```
"manage greenways market"
"fix product images"
"product not showing"
"wrong image on product"
"category page issue"
"update product"
"add new product"
"marketplace problem"
"V2 product page"
"calculator not working"
"sync products"
"Wix store issue"
"category filter broken"
"products showing wrong images"
"Carrier images wrong"
"deploy product changes"
```

**What it does:**
- Product CRUD operations
- Image assignment & fixes
- Category page troubleshooting
- V2 product page management
- Deployment to Render

---

### 🖼️ Media Skill (Product Images & UI Styling)

**Activate when user says:**
```
"find product image"
"product has no image"
"search for image"
"upload image to Wix"
"image is blurry"
"fix image quality"
"where to save images"
"image not showing"
"get image for [product]"
"need product photo"
"find manufacturer image"
"make card raised"
"add shadow to card"
"make header vibrant"
"add glossy finish"
"green border"
"blue border"
"section styling"
"product page styling"
"category page styling"
```

**What it does:**
- Search for product images
- Download and save to Product Images Folder
- Upload to Wix Media Manager
- Fix image quality issues
- Apply CSS fixes for blurry images
- **NEW:** Apply raised card shadows
- **NEW:** Add section border colors (green/blue)
- **NEW:** Create glossy header finishes
- **NEW:** Make background images more vibrant

---

### 🌍 Grants & Schemes Finder

**Activate when user says:**
```
"find new grants"
"search for schemes"
"energy efficiency grants"
"update schemes.json"
"new subsidies"
"EU funding programs"
"UK energy grants"
"SEAI grants Ireland"
"tax benefits energy"
"government incentives"
"weekly grants search"
"import new schemes"
```

**What it does:**
- Search European energy grants
- Verify on official sources
- Compile data in JSON format
- Generate review list
- Import to schemes.json

---

### 🎬 Sustainability Video Finder

**Activate when user says:**
```
"find sustainability videos"
"search YouTube videos"
"videos about energy"
"green building videos"
"restaurant energy videos"
"smart home videos"
"weekly video search"
"videos for website"
"embed videos"
"ETL product videos"
"sustainability content"
```

**What it does:**
- Search YouTube by category
- Apply quality filters
- Generate curated list
- Provide embed codes
- Weekly video report

---

### ✍️ Sustainability Blog Writer

**Activate when user says:**
```
"write blog post"
"create article"
"ESG report"
"sustainability blog"
"carbon reporting"
"green finance article"
"CSRD reporting"
"sustainable finance"
"blog about energy"
"write about [topic]"
"generate content"
"ESG comparison"
"financial sustainability"
```

**What it does:**
- Generate blog posts
- Create ESG reports with charts
- Sustainability topic articles
- Financial reporting templates
- Content with graphs & tables

---

### 🌐 HTML Content Creator

**Activate when user says:**
```
"create HTML page"
"build webpage"
"HTML with images"
"tabbed HTML"
"embed in Wix"
"create page for [topic]"
"professional HTML"
"HTML from document"
"convert to HTML"
"page with Wix images"
```

**What it does:**
- Create professional HTML pages
- Integrate Wix static images
- Build tabbed interfaces
- Apply modern styling
- Prepare for Wix embedding

---

### 🔍 Product Deep Dive

**Activate when user says:**
```
"product deep dive"
"deep dive page"
"product details page"
"rich product info"
"enhanced product profile"
"show all grants and reviews"
"deep dive content"
```

**What it does:**
- Build deep-dive data schema
- Merge curated data with products
- Generate `products-deep-dive.json`
- Standardize deep-dive layout

---

### 👥 Member Manager

**Activate when user says:**
```
"member manager"
"profile page"
"member profile"
"user uploads"
"profile image"
"cover photo"
"member dashboard"
```

**What it does:**
- Create and update member profile pages
- Handle avatar + cover image uploads
- Maintain profile schema and UX

---

### 🛍️ Product Addition Workflow (⚠️ MANDATORY for New Products)

**Activate when user says:**
```
"add new product"
"add product with grants"
"enrich product data"
"product grants workflow"
"add grants to product"
"update product grants"
"run grants integrator"
"product needs grants"
"ensure grants added"
"collection agencies"
"product collection data"
"regenerate products json"
"products-with-grants"
"hardcoded grants"
```

**What it does:**
- Validate product data structure
- Match product to grants by category/subcategory
- Add collection agencies for recycling/trade-in
- Store enriched product in database
- Export to `products-with-grants.json`
- Export to `products-with-grants-and-collection.json`

**⚠️ IMPORTANT:** This skill MUST be used before Market Manager when adding any new product!

---

## 🔄 Routing Logic

When receiving a request, the orchestrator follows this decision tree:

```
User Request
    │
    ├── Contains "add product", "product grants", "grants to product"?
    │   └── → product-addition-workflow.md ⚠️ (MANDATORY first)
    │
    ├── Contains "system", "health", "MCP", "ETL", "connection"?
    │   └── → Systems MD
    │
    ├── Contains "product", "market", "store", "category", "Wix store"?
    │   └── → Greenways Market Manager MD
    │
    ├── Contains "image", "photo", "picture", "blurry"?
    │   └── → Media Skill MD
    │
    ├── Contains "grant", "scheme", "subsidy", "funding", "incentive"?
    │   └── → grants-schemes-finder.md
    │
    ├── Contains "video", "YouTube", "embed video"?
    │   └── → sustainability-video-finder.md
    │
    ├── Contains "blog", "article", "ESG", "write about"?
    │   └── → sustainability-blog-writer.md
    │
    └── Contains "HTML", "webpage", "page", "create page"?
        └── → html-content-creator.md
```

**⚠️ IMPORTANT:** When "add product" is mentioned, ALWAYS route to `product-addition-workflow.md` FIRST!

---

## 📊 Skill Combinations

Some tasks require multiple skills. Common combinations:

| Task | Skills Used |
|------|-------------|
| **Add Product with Image** | Media → ⚠️ Product Workflow → Market Manager → Systems |
| **Add New Product** | Media → ⚠️ Product Workflow → Market Manager → Systems |
| **Create Product Page** | HTML Creator → Media → Market Manager |
| **Build Product Deep Dives** | Product Deep Dive → HTML Creator → Systems |
| **Member Profile Build** | Member Manager → HTML Creator → Systems |
| **Weekly Content Update** | Grants Finder → Video Finder → Blog Writer |
| **Full System Check** | Systems → Market Manager → Media |
| **Regenerate Product Data** | ⚠️ Product Workflow → Systems |

⚠️ = Product Workflow is **MANDATORY** to ensure grants/collection data is added

---

## 🚀 Quick Start Commands

| Need | Say This |
|------|----------|
| Full system health | "Run a complete system health check" |
| Fix product issues | "Help me fix product images on the store" |
| Find new grants | "Search for new EU energy grants this week" |
| Create blog content | "Write an ESG report on renewable energy" |
| Find videos | "Find sustainability videos for the website" |
| Create HTML page | "Create a tabbed HTML page for [topic]" |
| Find product image | "Find an image for [product name]" |

---

## 📝 Example Conversations

### Example 1: System Issue
**User:** "The MCP isn't working and I can't connect to Wix"  
**Routes to:** 🔧 Systems MD  
**Action:** Run MCP check, provide fix steps

---

### Example 2: Product Image Problem
**User:** "Heat pumps are showing motor images"  
**Routes to:** 🛒 Greenways Market Manager MD  
**Action:** Apply fix for shopCategory filter

---

### Example 3: Content Creation
**User:** "I need a blog post about sustainable finance with ESG data"  
**Routes to:** ✍️ sustainability-blog-writer.md  
**Action:** Generate ESG report template with charts

---

### Example 4: New Grant Research
**User:** "Find any new energy grants in the UK for 2026"  
**Routes to:** 🌍 grants-schemes-finder.md  
**Action:** Execute UK-specific search queries

---

### Example 5: Multi-Skill Task
**User:** "Add a new product to the store with image and create a page for it"  
**Routes to:**
1. 🖼️ Media Skill → Find image
2. 🛒 Market Manager → Add product
3. 🌐 HTML Creator → Create page

---

## 📁 File Details

| File | Lines | Purpose |
|------|-------|---------|
| `SKILL-ORCHESTRATOR.md` | ~700 | Master controller |
| `Structure.md` | This file | Quick reference |
| `Systems MD.md` | ~620 | Health checks, MCP, ETL |
| `Greenways Market Manager MD.md` | ~620 | Wix store management |
| `Media Skill MD.md` | ~490 | Product images |
| `grants-schemes-finder.md` | ~420 | Grant research |
| `product-addition-workflow.md` | ~500 | ⚠️ Product grants enrichment |
| `product-deep-dive.md` | New | Product deep-dive workflow |
| `member-manager.md` | New | Member profiles and uploads |
| `sustainability-video-finder.md` | ~420 | Video curation |
| `sustainability-blog-writer.md` | ~500 | Blog & ESG content |
| `html-content-creator.md` | ~270 | HTML page creation |
| `RALPH-INTEGRATION.md` | ~350 | Autonomous deployment |

---

## 🔗 Related Folders

| Folder | Purpose |
|--------|---------|
| `Skills/Product Finder/` | Product search skills |
| `Skills/Product Images Folder/` | Downloaded product images |

---

## 📋 Maintenance

### Adding New Skills

1. Create skill file in Skills folder
2. Add to SKILL-ORCHESTRATOR.md
3. Update this Structure.md file
4. Add trigger phrases

### Updating Trigger Phrases

1. Note phrase and target skill
2. Add to SKILL-ORCHESTRATOR.md
3. Update this Structure.md file

---

## 🧠 Continuous Learning Protocol

### Automatic Documentation (MANDATORY)

After **EVERY** task completion, the system automatically:

1. **Identifies** new learnings, processes, or solutions discovered
2. **Documents** them in the appropriate skill file
3. **Commits** changes to the repository

### What Gets Documented

| Learning Type | Target Skill File |
|---------------|-------------------|
| CSS/Styling patterns | `Media Skill MD.md` |
| Wix iframe fixes | `Media Skill MD.md` |
| MCP/Connection fixes | `Systems MD.md` |
| API/Backend solutions | `Systems MD.md` |
| Product/Store fixes | `Greenways Market Manager MD.md` |
| New trigger phrases | `SKILL-ORCHESTRATOR.md` |
| Workflow improvements | `SKILL-ORCHESTRATOR.md` |

### Documentation Format

```markdown
### Issue: [Brief Title]

**Date:** [Date]  
**Problem:** [What happened]

**Root Cause:** [Why]

**Solution:** [How it was fixed]

**Prevention:** [How to avoid in future]
```

### Why This Matters

- ✅ **Never repeat mistakes** - Solutions are permanently recorded
- ✅ **Faster future tasks** - Patterns are instantly available
- ✅ **Institutional knowledge** - System gets smarter over time
- ✅ **Professional service** - Consistent, efficient deployment

### Self-Improvement Cycle

```
RECEIVE → EXECUTE → COMPLETE → REFLECT → DOCUMENT → COMMIT → READY
    ↑                                                           │
    └───────────────────────────────────────────────────────────┘
```

---

**Last Updated:** January 2026  
**Total Skills:** 12  
**Master Controller:** SKILL-ORCHESTRATOR.md  
**Learning Protocol:** v2.0 (Auto-documentation enabled)
**Product Workflow:** ⚠️ MANDATORY for all new products

---

*Simply describe what you need and the orchestrator will route to the correct skill automatically.*

*All learnings are automatically documented for continuous improvement.*
