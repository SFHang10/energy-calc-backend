# 🎯 Skill Orchestrator

**Skill Type:** Master Controller & Task Router  
**Purpose:** Route user requests to the correct skill automatically  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 📋 Overview

This is the **Master Skill** that coordinates all other skills. When you ask a question or request a task, this skill identifies the appropriate skill to use and activates it.

**How to Use:** Simply describe what you need and this orchestrator will route to the correct skill.

---

## 🗂️ Available Skills

| Skill | File | Primary Purpose |
|-------|------|-----------------|
| 🔧 **Systems** | `Systems MD.md` | Health checks, connections, diagnostics |
| 🛒 **Market Manager** | `Greenways Market Manager MD.md` | Wix store, products, images |
| 🖼️ **Media** | `Media Skill MD.md` | Find/manage product images |
| 🌍 **Grants Finder** | `grants-schemes-finder.md` | Find energy grants & schemes |
| 🎬 **Video Finder** | `sustainability-video-finder.md` | Find sustainability videos |
| ✍️ **Blog Writer** | `sustainability-blog-writer.md` | Generate blog content & ESG reports |
| 🌐 **HTML Creator** | `html-content-creator.md` | Create HTML pages with images |

---

## 🎯 Trigger Phrases & Routing

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
"run backend server"
"node server"
```

**Routes to:** `Systems MD.md`

**Performs:**
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

**Routes to:** `Greenways Market Manager MD.md`

**Performs:**
- Product CRUD operations
- Image assignment & fixes
- Category page troubleshooting
- V2 product page management
- Deployment to Render

---

### 🖼️ Media Skill (Product Images)

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
```

**Routes to:** `Media Skill MD.md`

**Performs:**
- Search for product images
- Download and save to Product Images Folder
- Upload to Wix Media Manager
- Fix image quality issues
- Apply CSS fixes for blurry images

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

**Routes to:** `grants-schemes-finder.md`

**Performs:**
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

**Routes to:** `sustainability-video-finder.md`

**Performs:**
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

**Routes to:** `sustainability-blog-writer.md`

**Performs:**
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

**Routes to:** `html-content-creator.md`

**Performs:**
- Create professional HTML pages
- Integrate Wix static images
- Build tabbed interfaces
- Apply modern styling
- Prepare for Wix embedding

---

## 🔄 Routing Logic

When receiving a request, follow this decision tree:

```
User Request
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

---

## 📊 Skill Combinations

Some tasks require multiple skills. Common combinations:

### Adding New Product with Image
1. **Media Skill** → Find/download product image
2. **Market Manager** → Add product to database
3. **Systems** → Verify deployment

### Creating Product Page with Content
1. **HTML Creator** → Build the page
2. **Media Skill** → Get images
3. **Market Manager** → Link to products

### Weekly Content Update
1. **Grants Finder** → Find new schemes
2. **Video Finder** → Find new videos
3. **Blog Writer** → Create summary content

### Full System Check
1. **Systems** → Check all connections
2. **Market Manager** → Verify product counts
3. **Media Skill** → Check for missing images

---

## 🚀 Quick Start Commands

Copy and use these to activate specific skills:

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

**Orchestrator routes to:** 🔧 Systems MD

**Action:** Run MCP check, provide fix steps from MCP-SETUP-GUIDE.md

---

### Example 2: Product Image Problem
**User:** "Heat pumps are showing motor images"

**Orchestrator routes to:** 🛒 Greenways Market Manager MD

**Action:** Reference CATEGORY_IMAGE_ISSUE_ANALYSIS.md, apply fix for shopCategory

---

### Example 3: Content Creation
**User:** "I need a blog post about sustainable finance with ESG data"

**Orchestrator routes to:** ✍️ sustainability-blog-writer.md

**Action:** Generate ESG report template with charts and metrics

---

### Example 4: New Grant Research
**User:** "Find any new energy grants in the UK for 2026"

**Orchestrator routes to:** 🌍 grants-schemes-finder.md

**Action:** Execute UK-specific search queries, compile findings

---

### Example 5: Multi-Skill Task
**User:** "Add a new product to the store with image and create a page for it"

**Orchestrator routes to:** 
1. 🖼️ Media Skill → Find image
2. 🛒 Market Manager → Add product
3. 🌐 HTML Creator → Create page

---

## 🔗 Skill File Locations

All skills are located in:
```
C:\Users\steph\Documents\energy-cal-backend\Skills\
```

| File | Size | Last Updated |
|------|------|--------------|
| `SKILL-ORCHESTRATOR.md` | This file | January 2026 |
| `Systems MD.md` | ~600 lines | January 2026 |
| `Greenways Market Manager MD.md` | ~620 lines | January 2026 |
| `Media Skill MD.md` | ~490 lines | January 2026 |
| `grants-schemes-finder.md` | ~420 lines | January 2025 |
| `sustainability-video-finder.md` | ~420 lines | January 2025 |
| `sustainability-blog-writer.md` | ~500 lines | January 2026 |
| `html-content-creator.md` | ~270 lines | January 2026 |

---

## 📋 Maintenance

### Adding New Skills

When creating a new skill:

1. **Create the skill file** in Skills folder
2. **Add to this orchestrator:**
   - Add to "Available Skills" table
   - Add trigger phrases section
   - Add to routing logic
   - Update file locations table

### Updating Trigger Phrases

When users use new phrases to activate skills:
1. Note the phrase and which skill it should activate
2. Add to the trigger phrases section
3. Update the routing logic if needed

---

## 🎯 Default Behavior

If no clear skill match is found:

1. **Ask clarifying question** about what the user needs
2. **List available skills** with brief descriptions
3. **Suggest most likely skill** based on keywords

---

**Last Updated:** January 2026  
**Version:** 1.0

---

*This is the master skill. All task routing flows through here.*

---

## 📌 Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                    SKILL QUICK REFERENCE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🔧 SYSTEMS        → "check systems", "MCP", "health check"   │
│  🛒 MARKET         → "product", "store", "category", "images" │
│  🖼️ MEDIA          → "find image", "blurry", "photo"          │
│  🌍 GRANTS         → "grants", "schemes", "funding"           │
│  🎬 VIDEOS         → "videos", "YouTube", "sustainability"    │
│  ✍️ BLOG           → "write", "blog", "ESG", "article"        │
│  🌐 HTML           → "create page", "HTML", "webpage"         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
