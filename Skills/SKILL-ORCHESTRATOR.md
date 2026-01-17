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
| 🤖 **Ralph** | `RALPH-INTEGRATION.md` | Autonomous multi-step feature deployment |
| 🛍️ **Product Workflow** | `product-addition-workflow.md` | Add products with grants/collection enrichment |
| 🔍 **Product Deep Dive** | `product-deep-dive.md` | Build deep-dive product info and pages |
| 👥 **Member Manager** | `member-manager.md` | Member profiles, uploads, and access UX |
| 💷 **Product Deal Finder** | `product-deal-finder.md` | Deals, discounts, and price comparisons |
| 📦 **Content Operations** | `content-operations.md` | Draft → review → publish workflow |

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
"washed out"
"make prominent"
```

**Routes to:** `Media Skill MD.md`

**Performs:**
- Search for product images
- Download and save to Product Images Folder
- Upload to Wix Media Manager
- Fix image quality issues
- Apply CSS fixes for blurry images
- **Apply raised card shadows**
- **Add section border colors (green/blue)**
- **Create glossy header finishes**
- **Make background images more vibrant**

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

### 📦 Content Operations (Draft → Review → Publish)

**Activate when user says:**
```
"content workflow"
"publish content"
"content pipeline"
"draft review publish"
"content operations"
"prepare content"
"content staging"
```

**Routes to:** `content-operations.md`

**Performs:**
- Draft → review → ready workflow
- Folder and manifest management
- Content catalog status tracking

---

### 🤖 Ralph Integration (Autonomous Feature Deployment)

**Activate when user says:**
```
"use Ralph for this"
"create a PRD for"
"start Ralph loop"
"autonomous deployment"
"run Ralph"
"multi-step feature"
"complex implementation"
"full feature build"
"PRD for [feature]"
"Ralph status"
"continue Ralph loop"
"next story"
```

**Routes to:** `RALPH-INTEGRATION.md`

**Performs:**
- Create PRD (Product Requirements Document)
- Execute autonomous iteration loops
- Implement user stories one by one
- Track progress in progress.txt
- Update AGENTS.md with learnings
- Complete when all stories pass

**Use For:**
- Complex features (5+ steps)
- Multi-file changes
- New page builds
- Major integrations
- Systematic refactoring

---

### 🔍 Product Deep Dive (Enhanced Product Intelligence)

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

**Routes to:** `product-deep-dive.md`

**Performs:**
- Define and maintain deep-dive data schema
- Merge curated deep-dive data with product data
- Generate `products-deep-dive.json` outputs
- Ensure consistent deep-dive layout across products

---

### 💷 Product Deal Finder (Deals & Pricing)

**Activate when user says:**
```
"find deals"
"product deals"
"best price"
"compare prices"
"discount code"
"promo code"
"special offer"
"sale price"
```

**Routes to:** `product-deal-finder.md`

**Performs:**
- Multi-source price checks
- Deal/code validation
- Clear formatted deal report

---

### 👥 Member Manager (Profiles & Uploads)

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

**Routes to:** `member-manager.md`

**Performs:**
- Build or update member profile pages
- Add upload flow for avatar/cover photos
- Maintain profile data fields and UX

---

### 🛍️ Product Addition Workflow (Grants Enrichment)

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
"grants mapping"
```

**Routes to:** `product-addition-workflow.md`

**Performs:**
- Validate product data structure
- Match product to grants by category/subcategory
- Add collection agencies for recycling/trade-in
- Store enriched product in database
- Export to `products-with-grants.json`
- Export to `products-with-grants-and-collection.json`

**Use For:**
- Adding any new product to marketplace
- Batch product imports
- Ensuring grants data is present
- Updating collection agencies
- Regenerating product JSON files

---

## 🔄 Routing Logic

When receiving a request, follow this decision tree:

```
User Request
    │
    ├── Contains "Ralph", "PRD", "autonomous", "multi-step", "complex feature"?
    │   └── → RALPH-INTEGRATION.md (for large features)
    │
    ├── Contains "deep dive", "product details", "rich product info"?
    │   └── → product-deep-dive.md
    │
    ├── Contains "member profile", "profile page", "uploads", "members manager"?
    │   └── → member-manager.md
    │
    ├── Contains "add product", "product grants", "grants to product", "enrichment"?
    │   └── → product-addition-workflow.md (MANDATORY for new products)
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
    ├── Contains "content workflow", "publish content", "content pipeline"?
    │   └── → content-operations.md
    │
    └── Contains "HTML", "webpage", "page", "create page"?
        └── → html-content-creator.md
```

**⚠️ IMPORTANT:** When "add product" is mentioned, ALWAYS route to `product-addition-workflow.md` FIRST to ensure grants enrichment, then to Market Manager for store placement.

---

## 📊 Skill Combinations

Some tasks require multiple skills. Common combinations:

### Adding New Product (MANDATORY WORKFLOW)
1. **Media Skill** → Find/download product image
2. **Product Workflow** → Enrich with grants & collection data ⚠️ MANDATORY
3. **Market Manager** → Add to store/database
4. **Systems** → Verify deployment

### Adding New Product with Image
1. **Media Skill** → Find/download product image
2. **Product Workflow** → Add grants/collection enrichment ⚠️
3. **Market Manager** → Add product to database
4. **Systems** → Verify deployment

### Creating Product Page with Content
1. **HTML Creator** → Build the page
2. **Media Skill** → Get images
3. **Market Manager** → Link to products

### Building Product Deep Dives
1. **Product Deep Dive** → Build deep-dive JSON
2. **HTML Creator** → Present in page template
3. **Systems** → Verify API/data is served

### Managing Member Profiles
1. **Member Manager** → Build profile + upload flow
2. **HTML Creator** → Style profile page
3. **Systems** → Verify API endpoints

### Weekly Content Update
1. **Grants Finder** → Find new schemes
2. **Video Finder** → Find new videos
3. **Blog Writer** → Create summary content

### Content Publish Flow
1. **Blog Writer / Video Finder / HTML Creator** → Produce content
2. **Content Operations** → Draft → review → ready
3. **Systems** → Verify deployment

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
| `product-deep-dive.md` | New | January 2026 |
| `member-manager.md` | New | January 2026 |

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
**Version:** 2.0

---

*This is the master skill. All task routing flows through here.*

---

## 🧠 CONTINUOUS LEARNING PROTOCOL (MANDATORY)

### Overview

This is an **AUTOMATIC** and **MANDATORY** process. After completing ANY task, the orchestrator MUST document new learnings, processes, and solutions to ensure the skill system is always growing and improving.

### 📚 When to Document (ALWAYS check these triggers)

**Document IMMEDIATELY when:**

| Trigger | Action | Target Skill |
|---------|--------|--------------|
| ✅ Solved a problem with a new approach | Document the solution | Relevant skill's Lessons Learned |
| ✅ Discovered a workaround | Document the workaround | Relevant skill's Lessons Learned |
| ✅ Found a new CSS pattern | Add to styling patterns | Media Skill MD |
| ✅ Fixed an API issue | Document the fix | Systems MD |
| ✅ Created new HTML feature | Document the process | html-content-creator + Media Skill MD |
| ✅ Found better workflow | Update the workflow | SKILL-ORCHESTRATOR |
| ✅ User taught new process | Document immediately | Relevant skill |
| ✅ Error resolved | Add to troubleshooting | Relevant skill |
| ✅ New file/folder discovered | Add to file references | Relevant skill |
| ✅ New trigger phrase used | Add to trigger phrases | SKILL-ORCHESTRATOR |

### 📝 Documentation Format

When adding new learnings, use this standard format:

```markdown
### Issue: [Brief Descriptive Title]

**Date:** [Current Date]  
**Problem:** [What was the challenge or task]

**Root Cause:** [Why it happened or what was needed]

**Solution:**
[Step-by-step solution or code/process that worked]

**Prevention/Future Use:** [How to apply this in future]
```

### 🎯 Auto-Document Checklist (Run After EVERY Task)

After completing any task, mentally check:

- [ ] Did I learn something new? → Document it
- [ ] Did I solve a problem differently than before? → Document it
- [ ] Did I discover a new file or resource? → Add to file references
- [ ] Did I use a new CSS pattern? → Add to Media Skill MD
- [ ] Did I fix an integration issue? → Add to Systems MD
- [ ] Did the user teach me something? → Document immediately
- [ ] Did I find a better way to do something? → Update the workflow
- [ ] Would this help future similar tasks? → Document it

### 🗂️ Where to Document (Routing Guide)

| Learning Type | Document In |
|---------------|-------------|
| CSS/Styling patterns | `Media Skill MD.md` → "HTML Development Best Practices" |
| Image handling fixes | `Media Skill MD.md` → "Lessons Learned" |
| Wix iframe fixes | `Media Skill MD.md` → "Prevent Independent Scrolling" |
| MCP/Connection issues | `Systems MD.md` → "Lessons Learned Log" |
| API/Backend fixes | `Systems MD.md` → "Lessons Learned Log" |
| Product/Store issues | `Greenways Market Manager MD.md` → "Lessons Learned Log" |
| New trigger phrases | `SKILL-ORCHESTRATOR.md` → "Trigger Phrases" |
| Workflow improvements | `SKILL-ORCHESTRATOR.md` → "Routing Logic" |
| HTML creation process | `html-content-creator.md` |
| Grant search methods | `grants-schemes-finder.md` |
| Video curation tips | `sustainability-video-finder.md` |
| Blog writing templates | `sustainability-blog-writer.md` |
| Multi-skill workflows | `Structure.md` → "Skill Combinations" |

### 🔄 Self-Improvement Loop

```
┌─────────────────────────────────────────────────────────────┐
│                  CONTINUOUS LEARNING CYCLE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. RECEIVE TASK                                           │
│         ↓                                                   │
│   2. EXECUTE using current skills                           │
│         ↓                                                   │
│   3. COMPLETE task successfully                             │
│         ↓                                                   │
│   4. REFLECT: What did I learn? What was new?              │
│         ↓                                                   │
│   5. DOCUMENT in relevant skill file                        │
│         ↓                                                   │
│   6. COMMIT changes to repository                           │
│         ↓                                                   │
│   7. READY for next task (now smarter!)                    │
│         ↓                                                   │
│   [Return to Step 1]                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Knowledge Categories to Capture

**Technical Knowledge:**
- CSS patterns and fixes
- JavaScript solutions
- API endpoints and parameters
- Database queries
- File paths and structures

**Process Knowledge:**
- Step-by-step workflows
- Best practices discovered
- Time-saving shortcuts
- Common pitfalls to avoid

**Integration Knowledge:**
- Wix embedding techniques
- Render deployment notes
- MCP connection procedures
- Cross-system data flow

**User Preferences:**
- Styling preferences (emoji choices, colors)
- Workflow preferences
- Communication style
- Priority items

### 🚨 IMPORTANT: Never Skip Documentation

**This is not optional.** Every task is an opportunity to:
1. **Improve** the skill system
2. **Prevent** repeating mistakes
3. **Build** institutional knowledge
4. **Accelerate** future similar tasks

### 📅 Documentation Triggers by Task Type

| Task Type | What to Document |
|-----------|------------------|
| **HTML Creation** | New CSS patterns, image handling, Wix embed fixes |
| **Product Updates** | API endpoints used, image URL formats, database changes |
| **System Checks** | Connection methods, troubleshooting steps, health check results |
| **Styling Changes** | CSS code blocks, color values, responsive patterns |
| **Bug Fixes** | Root cause, solution steps, prevention methods |
| **New Features** | Implementation approach, files changed, testing done |
| **User Requests** | New trigger phrases, preference notes, workflow updates |

### ✅ Documentation Commit Message Format

When committing documentation updates:

```bash
git commit -m "📚 Update [Skill Name]: Add [brief description of learning]"

# Examples:
git commit -m "📚 Update Media Skill MD: Add glossy header CSS pattern"
git commit -m "📚 Update Systems MD: Add ETL API timeout fix"
git commit -m "📚 Update SKILL-ORCHESTRATOR: Add new trigger phrases for styling"
```

---

## 🧾 Recent Learnings (Append Here)

- **Membership videos (MongoDB)**: Ensure Wix video integration exists in `routes/members-mongodb.js`, not just SQLite.
- **Preferences compatibility**: API should return `{ id, name }` interests for UI mapping.
- **Render secrets**: Wix video feed requires `WIX_APP_TOKEN` (or `WIX_APP_ID`/`WIX_APP_SECRET`/`WIX_INSTANCE_ID`) and `WIX_SITE_ID`.
- **Saved content hub**: Persist saved items with `/api/members/saved-items` and use local storage only as cache.
- **Profile hub UX**: Use a quick saved-products grid + suggested blogs to make profile feel like a home feed.
- **Content catalog**: Use `content-catalog.json` + `/api/members/recommendations` for interest-based feeds.
- **Catalog admin**: Manage entries in `content-catalog-admin.html` and sync Wix content via `/api/members/content-catalog/sync`.
- **Catalog ordering**: Drag-drop ordering in admin UI saves via `/api/members/content-catalog/reorder`.

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
│  🛍️ PRODUCT        → "add product", "grants enrichment"  ⚠️   │
│  🔍 DEEP DIVE       → "deep dive", "product details"          │
│  📦 CONTENT        → "content workflow", "publish content"    │
│  👥 MEMBERS         → "profile", "member manager"             │
│  🎬 VIDEOS         → "videos", "YouTube", "sustainability"    │
│  ✍️ BLOG           → "write", "blog", "ESG", "article"        │
│  🌐 HTML           → "create page", "HTML", "webpage"         │
│  🤖 RALPH          → "PRD", "autonomous", "multi-step"        │
│                                                                │
│  ⚠️ = MANDATORY for new products (ensures grants data)        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
