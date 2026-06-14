# 🎯 Skill Orchestrator

**Skill Type:** Master Controller & Task Router  
**Purpose:** Route user requests to the correct skill automatically  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 📋 Overview

This is the **Master Skill** that coordinates all other skills. When you ask a question or request a task, this skill identifies the appropriate skill to use and activates it.

**How to Use:** Simply describe what you need and this orchestrator will route to the correct skill.

### Greenways Transition Agents vs Skills (May 2026)

**Agents** = client-facing chat **people** on Wix (seven built). **Skills** = **capabilities** that power agents or staff ops. Skills often **share** across agents (e.g. deals skill → Zara + Zyanne) or feed all agents from Administrator workflows — document every home, not just one.

| Name | Role | Slug |
|------|------|------|
| **Andrieus** | Grants & schemes | `grants-agent` |
| **Vincent** | Finance, prices & payback | `finance-agent` |
| **Artemis** | Equipment & renovation | `equipment-agent` |
| **Zara** | Deals & spotlights | `deals-agent` |
| **Cheryce** | News & media | `media-agent` |
| **Zyanne** | Sustainable products | `sustainable-products-agent` |
| **Edwardo** | Systems health (staff) | `systems-agent` |

**Canonical roster + skill→agent map:** **`greenways-transition-agents.md`**  
**Roadmap (phases, public/member AI, site knowledge):** **`greenways-agents-roadmap.md`**  
**UI/API foundation:** **`greenways-chat-interface-skill.md`**

| Use | Route to |
|-----|----------|
| Agent by **name** (Andrieus, Zara, …) or `/greenways/{slug}` | **`greenways-transition-agents.md`** → **`greenways-chat-interface-skill.md`** |
| Staff ops, content, store, full diagnostics | Skills below (blog writer, content-ops, Market Manager, **Systems MD**, member-manager, …) |
| Product hovers (grants/deals tooltips) | **`hover-data-aggregator.md`** — infrastructure, not an agent |
| “Why this matters for you” hovers | **`personalized-impact-hover.md`** — admin/member; planned hover explainer agent |

Full taxonomy: **`greenways-chat-interface-skill.md`** § **Admin vs consumer skills**.

---

## 🧭 Org Chart Reference (Greenways)

**Purpose:** One‑page org chart for a ~20 person green e‑commerce team.

### Central Leadership
- **Founder / CEO** — Vision, strategy, culture, partnerships

### Functional Teams
- **Marketing & Brand (4–5)**: Marketing Manager (Lead), Performance (SEO/PPC), Social Media, Email/CRM, Brand/Campaign Coordinator
- **Sales & Customer Experience (3–4)**: Sales Manager (Lead), Customer Support (2), B2B/Account Sales (optional)
- **Product & Supplier Management (3–4)**: Product & Supplier Lead, Product Research/Validation, Supplier Relationship Manager, Sustainability & Compliance Reviewer
- **Content & Media (3–4)**: Content & Media Lead, Website/Product Copywriter, Blog/Content Writer, Video/Media Producer
- **Technology & IT (2–3)**: IT Systems Manager, Website Support/Resolution Assistant, Cybersecurity/Data Protection (part‑time)
- **Operations & Finance (2–3)**: Operations Manager, Finance/Bookkeeping, HR/People Ops (part‑time)

### Headcount Summary
- Leadership: 1
- Marketing & Brand: 4–5
- Sales & CX: 3–4
- Product & Supply: 3–4
- Content & Media: 3–4
- Technology & IT: 2–3
- Ops & Finance: 2–3
- **Total:** ~20

### Notes
- Dotted‑line relationships: Marketing ↔ Content, Product ↔ Sustainability
- Some roles fractional or outsourced depending on growth stage
- Structure supports compliance, scalability, and brand trust

---

## 🗂️ Available Skills

| Skill | File | Primary Purpose |
|-------|------|-----------------|
| 🔧 **Systems** | `Systems MD.md` | Health checks, connections, diagnostics |
| 🛒 **Market Manager** | `Greenways Market Manager MD.md` | Wix store, products, images |
| 🖼️ **Media** | `Media Skill MD.md` | Find/manage product images |
| 🌍 **Grants Finder** | `grants-schemes-finder.md` | Find energy grants & schemes |
| 🤖 **Greenways Transition Agents** | `greenways-transition-agents.md` | **Roster** — Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo; agents vs skills map |
| 🗺️ **Agents roadmap** | `greenways-agents-roadmap.md` | Phases, public LLM limits, membership tier, site knowledge cards, scale |
| 🚀 **Agents go-live** | `greenways-agents-go-live.md` | Gradual Wix rollout, per-agent smoke tests, tiers A/B/C |
| 🔧 **Skills backend automation** | `skills-backend-automation.md` | Optional enhancements (research/parse/email); never replace integrators |
| 📎 **SkillBoss (reference)** | `../docs/reference/skillboss-evaluation.md` | Vendor evaluation — not implemented |
| 💬 **Greenways Chat Interface** | `greenways-chat-interface-skill.md` | **Foundation** for agent chat UIs — turn UI, API shape, Wix embeds |
| 🎬 **Video Finder** | `sustainability-video-finder.md` | Find sustainability videos |
| 📰 **News Finder** | `sustainability-news-finder.md` | Sustainability news roundups |
| 🧪 **New in Tech News** | `tech-news-finder.md` | Tech news roundups (green + general) |
| ✍️ **Blog Writer** | `sustainability-blog-writer.md` | Generate blog content & ESG reports |
| ⚡ **Energy Ticker** | `energy-ticker.md` | Live energy price ticker for Europe |
| 📈 **Rate Consultant** | `rate-consultant.md` | Price trend insights for low‑energy products |
| 🌐 **HTML Creator** | `html-content-creator.md` | Create HTML pages with images |
| ✉️ **Secretary** | `secretary-skill.md` | Professional Greenways emails |
| 🤖 **Ralph** | `RALPH-INTEGRATION.md` | Autonomous multi-step feature deployment |
| 🛍️ **Product Workflow** | `product-addition-workflow.md` | Add products with grants/collection enrichment |
| 🔍 **Product Deep Dive** | `product-deep-dive.md` | Build deep-dive product info and pages |
| 👥 **Member Manager** | `member-manager.md` | Member profiles, uploads, and access UX |
| 💷 **Product Deal Finder** | `product-deal-finder.md` | Deals, discounts, and price comparisons |
| 🕒 **Historical Data Finder** | `historical-data-finder.md` | Historical cost comparisons tied to energy prices |
| 🧮 **Calculator Cohesion** | `calculator-cohesion.md` | Align calculators to shared enriched data |
| ⚡ **Energy Dashboard** | `energy-dashboard-skill.md` | Main Greenways UI, utility detail, Wok Assist, equipment / deep dive / intelligence, deals hub, **savings tour**, **finance finder**, **schemes portals**, sustainable catalogue |
| 🎵 **Live Music Finder** | `live-music-finder-skill.md` | Map, ticker, feed, Wix embeds — UI and data locations |
| 🎵 **Live Music Discovery Scout** | `live-music-discovery-scout.md` | **Auto-populate** venues, events, media via candidate queues → `npm run merge:music-discovery` |
| 🎵 **Live Music Media Scout** | `live-music-media-scout.md` | Photos + YouTube only → `music-media-candidates.json` |
| 🧭 **Hover Data Aggregator** | `hover-data-aggregator.md` | Build hover cache with grants + deals |
| 🧩 **Personalized Impact Hover** | `personalized-impact-hover.md` | Explain how info affects the user |
| 🧠 **News → Product Recommender** | `news-product-recommender.md` | Suggest products for news items |
| 📦 **Content Operations** | `content-operations.md` | Draft → review → publish workflow |
| 🏗️ **Renovation Planner** | `sustainable-renovation-planner.md` | Renovation project plans with grants |

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

### 🤖 Greenways Transition Agents (named roster)

**Activate when user says:**
```
"Andrieus" "Vincent" "Artemis" "Zara" "Cheryce" "Zyanne" "Edwardo"
"Greenways agents" "Transition Agents"
"grants agent" "deals agent" "finance agent"
"which agent handles"
"agent roster"
"agents roadmap"
"greenways agents roadmap"
"agent go live"
"launch Andrieus"
"agents rollout"
"agent not working" "could not reach" "agent troubleshoot"
"Edwardo triage" "document this fix"
```

**Routes to:** `greenways-transition-agents.md` (roster + skill homes) · `greenways-agents-roadmap.md` (phases/plan) → `greenways-chat-interface-skill.md` (UI/API) · **`SKILL-ORCHESTRATOR.md` § Greenways Agents operations runbook** (triage + fixes)

**Performs:**
- Seven consumer agents on `/greenways/{slug}` — refer by **character name**, not only slug
- Distinguish **built agents** from **skills** (capabilities that find a home with an agent or Administrator)
- Map skills → Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo
- **Triage user-reported chat/embed issues** via operations runbook; append learnings after every fix

---

### 🔧 Skills backend automation (optional enhancements)

**Activate when user says:**
```
"skills backend"
"skill automation"
"enhance skills backend"
"SkillBoss for skills"
"automate grants research"
```

**Routes to:** `skills-backend-automation.md` · `docs/reference/skillboss-evaluation.md`

**Performs:**
- Reference only — **enhance** existing pipelines, do not replace integrators or knowledge-first agents
- Pilot order: grants research → news → content-ops parse → secretary email
- No implementation unless user explicitly requests a pilot script

---

### 💬 Greenways Chat Interface (agent UI & API)

**Activate when user says:**
```
"chat interface"
"agent chat UI"
"clone agent"
"turn UI" "split tablet"
"Wix agent embed"
"scheme compare chat"
"greenways-chat-interface"
```

**Routes to:** `greenways-chat-interface-skill.md`

**Performs:**
- Shared turn UI (`greenways-agent-turn-ui.js`), layout zones, API response shape
- Clone checklist for new agent HTML + routes
- Wix embed pattern (`WIX-GREENWAYS-AGENTS-EMBED.md`)
- Pair with `grants-schemes-finder.md` for Andrieus catalogue updates, `energy-dashboard-skill.md` for dashboard embeds

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

### 🧮 Calculator Cohesion (Unified Calculator Data)

**Activate when user says:**
```
"calculator data"
"calculator data source"
"align calculators"
"same data for calculators"
"enriched products for calculators"
"grants on calculators"
"calculator safety check"
"avoid breaking calculators"
"calculator cohesion"
```

**Routes to:** `calculator-cohesion.md`

**Performs:**
- Align calculator data sources to enriched products
- Maintain safe fallbacks to legacy endpoints
- Preserve comparative products
- Validate grants/schemes availability

---

### ⚡ Energy Dashboard (Guidance + Savings Strategy)

**Activate when user says:**
```
"energy dashboard"
"dashboard strategy"
"dashboard guidance"
"bill savings dashboard"
"decision matrix"
"equipment alternatives"
"recommendation confidence"
"horizon savings"
"energy guidance core"
"dashboard ingestion"
"kitchen operations adjustments"
"restaurant energy optimization"
"finance finder"
"financial assistance"
"restaurant green finance"
"BNPL restaurant equipment"
"schemes portal restaurant"
"savings.html grants tab"
"grants agent"
"greenways grants agent"
```

**Routes to:** `energy-dashboard-skill.md`

**Performs:**
- Keep dashboard calculation logic consistent across modules
- Align unit normalization and horizon math
- Ensure assumptions + confidence are shown in outputs
- Coordinate alternatives, grants, and savings strategy flow
- Preserve calculator safety boundaries while improving dashboard guidance
- **`finance-finder-restaurant.html`**, **`savings.html`** grants wiring, schemes portal styling (see skill § Restaurant finance finder)

---

### 🎵 Live Music Finder (map + events ticker)

**Activate when user says:**
```
"live music finder"
"open mic map amsterdam"
"live-events-ticker"
"live-events-seeds"
"venueId map link"
"music guide venue"
"music-venues.json"
```

**Routes to:** `live-music-finder-skill.md` (UI/data) · **`live-music-discovery-scout.md`** (auto-populate region) · **`live-music-media-scout.md`** (photos/video only)

**Performs:**
- Map (`live-music-finder.html`), feed build (`npm run build:live-events-feed`), ticker/updates pages
- Link feed rows to map via **`venueId`** and **`?venue=`** deep links
- Wix/Render embed URLs; never **`file://`** for testing
- Candidate queues → **`npm run merge:music-discovery`** (venues + events + media)
- Venue API, inquiries, music guide

---

### 🧭 Hover Data Aggregator (Hover Cache Builder)

**Activate when user says:**
```
"hover data"
"hover tooltip"
"hover grants"
"hover deals"
"product hover info"
"weekly hover update"
"hover cache"
```

**Routes to:** `hover-data-aggregator.md`

**Performs:**
- Generate hover cache from enriched products
- Keep grants in sync with product data
- Merge deals from weekly cache
- Output `data/hover-data.json`

---

### 🧩 Personalized Impact Hover (User Impact Explainer)

**Activate when user says:**
```
"personalized hover"
"why this matters to me"
"impact summary"
"hover explainer"
"membership encouragement hover"
```

**Routes to:** `personalized-impact-hover.md`

**Performs:**
- Generate impact summaries from existing content
- Map summaries to region/category
- Provide membership CTA messaging

---

### 🧠 News → Product Recommender (Automated Example Links)

**Activate when user says:**
```
"auto link products from news"
"news to product matching"
"recommend products from news"
"automate example product links"
"suggest products for policy updates"
```

**Routes to:** `news-product-recommender.md`

**Performs:**
- Match news items to products using knowledge base + enriched data
- Output `data/news-product-recommendations.json`
- Provide specific marketplace links

---

### 🏗️ Sustainable Renovation Planner

**Activate when user says:**
```
"renovation plan"
"retrofit plan"
"project planner"
"project plan"
"grant strategy"
"sustainable renovation"
"energy retrofit"
"upgrade roadmap"
```

**Routes to:** `sustainable-renovation-planner.md`

**Performs:**
- Build renovation project plans with grant strategy
- Recommend low‑energy products (ETL where relevant)
- Use template: `HTMLs/Renovation project plans.html`
- Trigger grants/product workflows when new items are introduced

---

### 📰 Sustainability News Finder

**Activate when user says:**
```
"sustainability news"
"news roundup"
"monthly sustainability report"
"sustainability updates"
"circular economy news"
"EU sustainability news"
"policy update report"
"funding news roundup"
```

**Routes to:** `sustainability-news-finder.md`

**Performs:**
- Research sustainability news from official sources
- Generate HTML monthly/weekly news reports
- Output drafts to content-ops for review
- Use supporting reference docs for sources/outreach (see News Finder skill)

---

### 🧪 New in Tech News Finder

**Activate when user says:**
```
"new in tech"
"tech news"
"technology news"
"tech roundup"
"green tech news"
"clean tech updates"
"innovation news"
"tech policy update"
```

**Routes to:** `tech-news-finder.md`

**Performs:**
- Research green tech + general tech from authoritative sources
- Generate HTML monthly/weekly tech news reports
- Use the same format and recency window as sustainability news
- Output drafts to content-ops for review

---

### 🧩 News HTML Enhancer

**Activate when user says:**
```
"update February edition"
"apply January template"
"news HTML enhancements"
"add help buttons"
"How does this affect you buttons"
"add example products section"
"news template updates"
"newsletter HTML update"
```

**Routes to:** `html-content-creator.md`, `personalized-impact-hover.md`, `news-product-recommender.md`, `content-operations.md`

**Performs:**
- Apply January template patterns to new monthly HTMLs
- Add “How does this affect you” toggles + “Find out more” CTAs
- Add Example Products by Topic section with marketplace links
- Ensure product links are Render-safe and data-driven where possible
- Update sidebar navigation to include new sections

---

### 🗺️ Company Case Study Finder

**Activate when user says:**
```
"company case study finder"
"company map"
"list of companies mentioned in HTMLs"
"add a company to the map"
"case study database"
```

**Routes to:** `html-content-creator.md`, `content-operations.md`

**Performs:**
- Maintain the company list in `data/companies.json`
- Ensure `HTMLS GWM GWB/European Company - Case Study Finder .html` stays in sync
- Use `/api/companies` for persistent additions

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
- Use supporting reference docs for sources/outreach (see Blog Writer skill)

---

### ⚡ Energy Ticker (Live Energy Prices)

**Activate when user says:**
```
"energy ticker"
"energy price ticker"
"live energy prices"
"electricity prices"
"wholesale electricity prices"
"renewable energy ticker"
"renewable share ticker"
```

**Routes to:** `energy-ticker.md`

**Performs:**
- Build a two-line energy ticker (All Energy + Renewables)
- Fetch data via backend proxy (avoid CORS)
- Provide HTML widget for Wix embed

---

### 📈 Rate Consultant (Price Trend Insights)

**Activate when user says:**
```
"price trends"
"energy price insights"
"use energy prices for insights"
"savings potential"
"rate consultant"
"wholesale vs retail"
```

**Routes to:** `rate-consultant.md`

**Performs:**
- Converts wholesale trends into safe insights
- Creates badges and CTA modules
- Adds disclaimers to avoid retail‑bill claims

---

### 🕒 Historical Data Finder (Historical Price/Cost Comparisons)

**Activate when user says:**
```
"historical cost"
"price history"
"cost over time"
"historical data finder"
"appliance cost today"
"how much does this product cost to run"
"baseline vs low energy"
"compare old vs new appliance cost"
```

**Routes to:** `historical-data-finder.md`

**Performs:**
- Build cost comparisons using energy price history
- Provide baseline vs low‑energy savings ranges
- Define data sources and caching strategy

---

### ✉️ Secretary (Greenways Email Writer)

**Activate when user says:**
```
"write an email"
"email template"
"outreach email"
"contact organisation"
"press access email"
"partnership email"
"secretary"
```

**Routes to:** `secretary-skill.md`

**Performs:**
- Draft professional emails on behalf of Greenways
- Uses the Email Templates reference for structure

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
- Use supporting reference docs for technical specs (see Product Deep Dive skill)

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
    ├── Contains "email", "outreach", "secretary", "contact organisation"?
    │   └── → secretary-skill.md
    │
    ├── Contains "renovation", "retrofit", "project plan", "grant strategy"?
    │   └── → sustainable-renovation-planner.md
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
    ├── Contains "news to product", "auto link products", "example product links"?
    │   └── → news-product-recommender.md
    │
    ├── Contains "new in tech", "tech news", "technology news", "tech roundup"?
    │   └── → tech-news-finder.md
    │
    ├── Contains "sustainability news", "news roundup", "policy update report"?
    │   └── → sustainability-news-finder.md
    │
    ├── Contains "blog", "article", "ESG", "write about"?
    │   └── → sustainability-blog-writer.md
    │
    ├── Contains "energy ticker", "energy prices", "electricity prices", "renewable share"?
    │   └── → energy-ticker.md
    │
    ├── Contains "price trends", "energy price insights", "savings potential", "wholesale vs retail"?
    │   └── → rate-consultant.md
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

### Renovation Project Plan
1. **Renovation Planner** → Build plan + grant strategy
2. **Grants Finder** → Update schemes if new grants discovered
3. **Product Workflow** → Add any new products referenced
4. **HTML Creator** → Finalize HTML output

### Email Outreach
1. **Secretary** → Draft outreach email
2. **News Finder / Grants Finder** → Provide context (if needed)

### Managing Member Profiles
1. **Member Manager** → Build profile + upload flow
2. **HTML Creator** → Style profile page
3. **Systems** → Verify API endpoints

### Weekly Content Update
1. **Grants Finder** → Find new schemes
2. **Video Finder** → Find new videos
3. **News Finder** → Create news roundup
4. **Blog Writer** → Create summary content

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
| Plan renovation | "Create a renovation plan with grants for [property]" |
| Draft email | "Write a professional outreach email to [organisation]" |

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
| `sustainability-news-finder.md` | New | January 2026 |
| `news-product-recommender.md` | New | February 2026 |
| `sustainability-blog-writer.md` | ~500 lines | January 2026 |
| `energy-ticker.md` | New | January 2026 |
| `rate-consultant.md` | New | January 2026 |
| `html-content-creator.md` | ~270 lines | January 2026 |
| `product-deep-dive.md` | New | January 2026 |
| `member-manager.md` | New | January 2026 |
| `sustainable-renovation-planner.md` | New | January 2026 |
| `secretary-skill.md` | New | January 2026 |

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

**Last Updated:** 28 May 2026  
**Version:** 2.1

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

## 🛟 Greenways Agents — operations runbook (Edwardo + Orchestrator)

**Purpose:** Single memory for **all seven consumer agents** — fixes, triage, deploy checks, and processes. Use this when users report chat/embed issues **even if they do not say “Orchestrator”**; agents should **append learnings here** + **`AGENTS.md`** + **`greenways-chat-interface-skill.md`** changelog after every agent fix.

**Edwardo** (`systems-agent`, staff-facing) should route user problems through this runbook first, then `/api/systems-agent` health checks.

### Agent index

| Name | Slug | Chat URL | API | HTML |
|------|------|----------|-----|------|
| Andrieus | `grants-agent` | `/greenways/grants-agent` | `/api/grants-agent/*` | `greenways-grants-agent.html` |
| Vincent | `finance-agent` | `/greenways/finance-agent` | `/api/finance-agent/*` | `greenways-finance-agent.html` |
| Artemis | `equipment-agent` | `/greenways/equipment-agent` | `/api/equipment-agent/*` | `greenways-equipment-agent.html` |
| Zara | `deals-agent` | `/greenways/deals-agent` | `/api/deals-agent/*` | `greenways-deals-agent.html` |
| **Cheryce** | `media-agent` | `/greenways/media-agent` | `/api/media-agent/*` | `greenways-media-agent.html` |
| Zyanne | `sustainable-products-agent` | `/greenways/sustainable-products-agent` | `/api/sustainable-products-agent/*` | `greenways-sustainable-products-agent.html` |
| Edwardo | `systems-agent` | `/greenways/systems-agent` | `/api/systems-agent/*` | `greenways-systems-agent.html` |

**Production base:** `https://energy-calc-backend.onrender.com`  
**Wix embed:** `Embed a site` → `/greenways/{slug}` (not uploaded HTML). Guide: `HTMLS GWM GWB/WIX-GREENWAYS-AGENTS-EMBED.md`  
**Smoke prompts per agent:** `Skills/greenways-agents-go-live.md`

### Triage flow (user reports an issue)

1. **Which agent?** Name or page URL.
2. **Symptom class** — use table below.
3. **Verify deploy** — `/health` OK; live HTML contains expected markers (grep deployed page).
4. **Verify API** — `POST /api/{slug}/ask` with JSON body file (PowerShell `curl` often breaks JSON — use `-d @file.json`).
5. **Hard refresh** Wix page (`Ctrl+F5`) — iframe caches old JS.
6. **Fix → document** — orchestrator learnings + `AGENTS.md` + chat-interface changelog + go-live smoke row if new symptom.

### Common symptoms → cause → fix

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| **“Could not reach the media agent”** but network OK | (a) Render cold start, (b) **JS crash after successful API** | (a) 90s timeout + retries in HTML; wake with `GET /api/media-agent/samples`. (b) Check `finishAgentTurn` — **`intentId` must be declared before `sourceLabel()`** (`b8379c4`). |
| Quick links open wrong page / purple module | Sidebar opened GWB pages in module shell | Quick links = `<a target="_top">` + `contentBase()` → `/HTMLS%20GWM%20GWB/...`; only **Sustainability map →** uses module (`c517979`). |
| Map **Ask** works but **Open map** does not | Module shell / iframe loader | `GreenwaysAgentContentModule`, `data-map-open`, `gw-module-embed-ready` fallback. |
| Banner card **missing photo** (e.g. FoodMesh) | `data/companies.json` row missing `imageUrl` | Add Wix URL; see `scripts/apply-companies-inline-images.js` name map; fallback in `media-agent-companies.js` `DEFAULT_COMPANY_CARD_IMAGE`. |
| **“Ask about” vertical letters** on scheme tablets (Vincent, Artemis, …) | Agent inline `.scheme-chip-ask { width:22px }` overrides shared tablet pill button | **`greenways-agent-turn-ui.css`** — `.scheme-tablet .scheme-tablet-ask.scheme-chip-ask { width:auto; … }` must beat inline chip styles (higher specificity). |
| Old answer style (“News matches for…”) | Stale Render deploy or cached iframe | Source pill should show `knowledgeVersion: 2026-05-28-conversational-blocks`; redeploy + hard refresh. |
| Wix videos empty locally | Expected — no Wix env | Render needs `WIX_APP_TOKEN` + `WIX_SITE_ID`; local uses fallback samples. |
| API 404 on Render | Deploy not finished or route missing | Check `server-new.js` mount for `/api/{slug}`; wait 2–3 min after push. |

### Cheryce reference fixes (Jun 2026)

| Commit | What |
|--------|------|
| `a8887f8` | Conversational answers + map module UX |
| `ebc08f7` | 75s→90s timeout, video routing |
| `c517979` | Quick links full pages, `contentBase()`, helper clicks |
| `b8379c4` | `finishAgentTurn` `intentId` order — false “Could not reach” |

### After every agent change — document in

1. **`Skills/SKILL-ORCHESTRATOR.md`** § Recent Learnings (this file)
2. **`AGENTS.md`** learnings log
3. **`Skills/greenways-chat-interface-skill.md`** changelog + gotchas
4. **`Skills/greenways-agents-go-live.md`** smoke row if user-facing
5. Push → Render deploy → verify `/health` + one smoke `POST /ask`

### Trigger phrases (route here automatically)

```
"agent not working" "Cheryce broken" "could not reach"
"quick links wrong" "photo missing" "banner image"
"Wix embed agent" "agent troubleshoot" "Edwardo triage"
"orchestrator" "document this fix"
```

**Routes to:** this section · `greenways-chat-interface-skill.md` · `greenways-agents-go-live.md` · `Systems MD.md` (platform health)

---

## 🧾 Recent Learnings (Append Here)

- **Cheryce banner photos (Jun 2026):** Missing thumbnails = empty `imageUrl` on `data/companies.json` case study (e.g. **FoodMesh** id 134). Wix URLs in `scripts/apply-companies-inline-images.js`; server fallback `DEFAULT_COMPANY_CARD_IMAGE` in `media-agent-companies.js`.
- **Cheryce false “Could not reach” (`b8379c4`):** API succeeded; `finishAgentTurn` referenced `intentId` before `const` — fix order; improve catch to surface `err.message`.
- **Cheryce sidebar + API (`c517979`):** Quick links = full GWB pages via `contentBase()` + `target="_top"`; map-only stays in module. Render cold start: 90s client timeout + retries on `/api/media-agent/ask`. Skill detail: **`greenways-chat-interface-skill.md`** § Conversational pattern + changelog.
- **Greenways Transition Agents (May 2026):** Seven **built** consumer agents — **Andrieus**, **Vincent**, **Artemis**, **Zara**, **Cheryce**, **Zyanne**, **Edwardo**. **Skills** are capabilities with an agent or Administrator home; roster: `greenways-transition-agents.md`. Say agent **names** in requests; say **Orchestrator** for skill routing.
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
│  📰 NEWS           → "news roundup", "sustainability news"    │
│  🧪 NEW IN TECH     → "new in tech", "tech news"              │
│  🧠 NEWS→PRODUCT   → "news to product", "example links"       │
│  ✍️ BLOG           → "write", "blog", "ESG", "article"        │
│  ⚡ ENERGY TICKER  → "energy prices", "energy ticker"         │
│  📈 RATE CONSULT  → "price trends", "savings potential"       │
│  🌐 HTML           → "create page", "HTML", "webpage"         │
│  🏗️ RENOVATION     → "renovation plan", "retrofit"           │
│  ✉️ SECRETARY      → "write email", "outreach", "contact"     │
│  🤖 RALPH          → "PRD", "autonomous", "multi-step"        │
│                                                                │
│  ⚠️ = MANDATORY for new products (ensures grants data)        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
