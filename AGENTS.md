# AGENTS.md - Project-Wide Learnings & Conventions

**Purpose:** Central knowledge base for AI agents working on this project  
**Updated By:** Ralph iterations and Continuous Learning Protocol  
**Last Updated:** January 2026

---

## 🏗️ Project Overview

**Project:** Energy Calculator Backend & Greenways Market Integration  
**Stack:** Node.js, Express, SQLite/MongoDB, Wix, HTML/CSS/JS  
**Deployment:** Render (https://energy-calc-backend.onrender.com)

---

## 📂 Key File Locations

| Type | Location |
|------|----------|
| **Server** | `server-new.js` |
| **Routes** | `routes/` |
| **Database** | `database/energy_calculator_central.db` |
| **Product Data** | `FULL-DATABASE-5554.json` |
| **Products with Grants** | `energy-calculator/products-with-grants.json` |
| **Products with Collection** | `energy-calculator/products-with-grants-and-collection.json` |
| **Grants System** | `hardcoded-grants-system.js` |
| **Product Images** | `product-placement/` |
| **HTML Pages** | `HTMLs/` |
| **Skills** | `Skills/` |
| **PRD Tasks** | `tasks/` |

---

## 🎯 Coding Conventions

### JavaScript/Node.js

```javascript
// Use async/await, not callbacks
const data = await fetchData();

// Use const by default, let when needed
const products = [];
let counter = 0;

// Error handling with try/catch
try {
  const result = await api.call();
} catch (error) {
  console.error('API error:', error);
}
```

### CSS Patterns

```css
/* Use variables for colors */
:root {
  --primary-green: #28a745;
  --primary-blue: #007bff;
  --dark-bg: #1a2332;
}

/* Raised card effect */
.card {
  box-shadow: 0 12px 40px rgba(0,0,0,0.25), 
              0 6px 16px rgba(0,0,0,0.15), 
              0 2px 6px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* Sharp images */
img {
  object-fit: contain;
  image-rendering: crisp-edges;
}
```

### HTML Structure

```html
<!-- Always include Wix no-scroll meta -->
<meta name="wix-html-scroll" content="no-scroll">

<!-- Use Wix static URLs for images -->
<img src="https://static.wixstatic.com/media/...">

<!-- Use Euro emoji, not dollar -->
💶💷 (not 💰💵)
```

---

## ⚠️ Critical Gotchas

### 1. Wix Image URLs
- **NEVER** use local paths in Wix embeds
- **ALWAYS** upload to Wix Media Manager first
- Use format: `https://static.wixstatic.com/media/[id]~mv2.[ext]`

### 2. Wix Iframe Scrolling
- Add `<meta name="wix-html-scroll" content="no-scroll">`
- Set iframe height to match content (not larger)
- Use `overflow-x: hidden` on all containers

### 3. Product IDs
- ETL products use format: `etl_[category]_[number]` (e.g., `etl_21_29475`)
- Always verify product exists before linking
- Test URL: `/product-page-v2-marketplace.html?product=[ID]&fromPopup=true`

### 4. Database
- Primary: SQLite (`database/energy_calculator_central.db`)
- Check `USE_MONGODB` env var on Render if using MongoDB
- Products table must exist before API calls

### 5. Deployment
- Push to GitHub → Render auto-deploys
- Wait 2-3 minutes for deployment
- Always verify at health endpoint: `/health`

---

## 🔧 Common Fixes

### Blurry Images
```css
img {
  object-fit: contain;
  image-rendering: crisp-edges;
  image-rendering: -webkit-optimize-contrast;
}
```

### Iframe Content Cut Off
```css
html, body {
  height: auto;
  overflow-x: hidden;
}
```

### Product Link Not Working
1. Verify product ID exists in API
2. Check format: `?product=etl_XX_XXXXX&fromPopup=true`
3. Wait for Render deployment if just pushed

### MCP Not Working
1. Run `setup-mcp.bat`
2. Restart Cursor completely
3. Start new conversation

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server status |
| `/api/products` | GET | All products |
| `/api/shop-products` | GET | Products with shop categories |
| `/api/product-widget/:id` | GET | Single product |
| `/api/schemes` | GET | Grants & schemes |

---

## 🎨 Design System

### Colors
- **Primary Green:** `#28a745`
- **Primary Blue:** `#007bff`
- **Dark Background:** `#1a2332`
- **Gold Accent:** `#c9a961`

### Fonts
- Primary: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Headings: `'Poppins', sans-serif`

### Shadows
- Light: `0 4px 20px rgba(0,0,0,0.1)`
- Raised: `0 12px 40px rgba(0,0,0,0.25), 0 6px 16px rgba(0,0,0,0.15)`
- Glossy: Add `backdrop-filter: blur(1px)`

---

## 📝 Patterns Discovered

### Vibrant Header Images
```css
.header::before {
  background: linear-gradient(to bottom,
    rgba(0,0,0,0.15) 0%,
    rgba(0,0,0,0.45) 100%
  );
}
.header {
  filter: saturate(1.15) contrast(1.05);
}
```

### Section Border Colors
- Technical Info: `border: 3px solid #28a745` (green)
- Product Benefits: `border: 3px solid #007bff` (blue)

### Tab Glow Effect
```css
.tab-btn {
  animation: tabPulse 3s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
}
```

---

## 🔄 Workflows

### Adding New Product (⚠️ MANDATORY WORKFLOW)

**IMPORTANT:** All products MUST go through grants enrichment!

1. **Validate product data** - Ensure category/subcategory match grants mapping
2. **Run grants enrichment** - `node product-grants-integrator.js`
   - Matches product to grants by category/subcategory
   - Adds collection agencies for recycling/trade-in
   - Exports to `products-with-grants.json`
3. **Add image** to `product-placement/`
4. **Commit and push** to GitHub
5. **Verify on Render** - Check `/api/product-widget/:id` shows grants data

**Never Skip:** Grants enrichment ensures customers see available funding!

### Creating HTML Page
1. Upload images to Wix Media Manager
2. Get static URLs
3. Create HTML with Wix no-scroll meta
4. Test locally
5. Commit and push
6. Embed in Wix iframe

### Running Ralph
1. Create PRD in `tasks/`
2. Say "Start Ralph loop for [feature]"
3. Execute stories iteratively
4. Update progress.txt
5. Complete when all pass

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `WIX-SCROLL-FIX.md` | Iframe scrolling solutions |
| `MCP-SETUP-GUIDE.md` | Wix MCP setup |
| `PROJECT_ARCHITECTURE_OVERVIEW.md` | System architecture |
| `Skills/SKILL-ORCHESTRATOR.md` | Task routing |
| `Skills/RALPH-INTEGRATION.md` | Autonomous feature deployment |
| `Skills/product-addition-workflow.md` | ⚠️ Product grants enrichment (MANDATORY) |
| `GRANTS_OVERLAY_SYSTEM_DOCUMENTATION.md` | Grants system details |
| `HOW-TO-ADD-MORE-GRANTS.md` | Adding new grants |

---

## 🧠 Learnings Log

### January 2026

- **Wix no-scroll fix**: Meta tag + CSS + proper iframe height
- **Product links**: Must use actual ETL IDs from database
- **Glossy headers**: Radial gradient + backdrop-filter
- **Raised cards**: 3-layer box-shadow + transform
- **Section grouping**: Color-coded borders (green/blue)
- **⚠️ Product Grants Workflow**: ALL new products MUST go through grants enrichment
  - Run `product-grants-integrator.js` before adding to marketplace
  - Hardcoded grants preferred over API calls (instant loading, offline support)
  - Products-with-grants.json contains full enriched product data
  - Collection agencies added for recycling/trade-in options

---

*This file is automatically updated by Ralph iterations and the Continuous Learning Protocol.*
