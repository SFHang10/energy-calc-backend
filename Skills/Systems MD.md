# 🔧 Systems Health & Connection Manager

**Skill Type:** System Diagnostics & Monitoring  
**Frequency:** On Demand / Before Major Tasks  
**Output:** System health report with connection status  
**Purpose:** Verify all systems are operational and identify issues

---

## 📋 Overview

This skill provides comprehensive system health checks for the Greenways ecosystem:
- **Greenways Market Place** (Wix e-commerce)
- **Greenways Buildings** (greenwaysbuildings.com)
- **Energy Calculator Backend** (Render deployment)
- **ETL API** (Government product database)
- **Wix MCP** (Model Context Protocol for Cursor)

---

## 🚀 Server Startup

### Start Local Server

**Batch File Location:**
```
C:\Users\steph\Documents\energy-cal-backend\start-server.bat
```

**What it does:**
1. Changes to the energy-cal-backend directory
2. Runs `node server-new.js`
3. Starts the Express server on port 4000

### Trigger Phrases for Starting Server:
```
"start the server"
"start server"
"run the server"
"launch server"
"start local server"
"start backend"
"run backend server"
"node server"
```

### How to Start:

**Option 1: Run Batch File**
```bash
cd C:\Users\steph\Documents\energy-cal-backend
start-server.bat
```

**Option 2: Direct Command**
```bash
cd C:\Users\steph\Documents\energy-cal-backend
node server-new.js
```

**Option 3: PowerShell**
```powershell
cd C:\Users\steph\Documents\energy-cal-backend
node server-new.js
```

### After Starting Server:
- Server runs on `http://localhost:4000`
- Health check: `http://localhost:4000/health`
- Products API: `http://localhost:4000/api/products`

### Server Files:
| File | Purpose |
|------|---------|
| `start-server.bat` | Batch file to start server |
| `server-new.js` | Main Express server |
| `server.js` | Legacy server (backup) |

---

## 🏗️ System Architecture Reference

### **Core Components**

```
┌─────────────────────────────────────────────────────────────────┐
│                    GREENWAYS ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │  GREENWAYS       │      │  GREENWAYS       │                │
│  │  MARKET PLACE    │      │  BUILDINGS.COM   │                │
│  │  (Wix Store)     │      │  (Wix Site)      │                │
│  └────────┬─────────┘      └────────┬─────────┘                │
│           │                         │                           │
│           └──────────┬──────────────┘                           │
│                      ▼                                          │
│  ┌─────────────────────────────────────────┐                   │
│  │      ENERGY-CALC-BACKEND (Render)       │                   │
│  │      https://energy-calc-backend.       │                   │
│  │      onrender.com                        │                   │
│  │  ┌─────────────┐ ┌─────────────┐        │                   │
│  │  │ Express API │ │ SQLite DB   │        │                   │
│  │  │ (Port 4000) │ │ MongoDB     │        │                   │
│  │  └─────────────┘ └─────────────┘        │                   │
│  └────────────────────┬────────────────────┘                   │
│                       │                                         │
│           ┌───────────┴───────────┐                            │
│           ▼                       ▼                             │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  ETL API        │    │  Wix MCP        │                    │
│  │  (UK Gov)       │    │  (Cursor)       │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Endpoints**

| System | Endpoint | Purpose |
|--------|----------|---------|
| Backend Health | `https://energy-calc-backend.onrender.com/health` | Server status |
| Products API | `https://energy-calc-backend.onrender.com/api/products` | Product data |
| ETL Products | `https://energy-calc-backend.onrender.com/api/etl/products` | ETL products |
| Members API | `https://energy-calc-backend.onrender.com/api/members` | Membership |
| Schemes API | `https://energy-calc-backend.onrender.com/api/schemes` | Grants/Schemes |

---

## ✅ Step 1: MCP Connection Check

### 1.1 Quick Check - Is MCP Available?

In Cursor, these tools should be visible when MCP is connected:
- `mcp_wix-mcp-remote_WixREADME`
- `mcp_wix-mcp-remote_CallWixSiteAPI`
- `mcp_wix-mcp-remote_ListWixSites`
- `mcp_wix-mcp-remote_SearchWixRESTDocumentation`
- `mcp_wix-mcp-remote_SearchWixSDKDocumentation`

**If these are NOT visible → MCP is NOT connected**

### 1.2 Start MCP Connection

#### Option A: Run Batch File (Fastest)
```bash
cd C:\Users\steph\Documents\energy-cal-backend
setup-mcp.bat
```

#### Option B: Manual Command
```bash
npx -y @wix/mcp-remote https://mcp.wix.com/sse
```

#### Option C: PowerShell Script
```powershell
.\setup-mcp.ps1
```

### 1.3 After Starting MCP

1. **Wait 5 seconds** for connection
2. **Restart Cursor** completely (File → Exit)
3. **Start NEW conversation** (required)
4. **Verify tools are visible**

### 1.4 MCP Configuration File

Location: `~/.cursor/mcp.json`

Expected content:
```json
{
  "mcpServers": {
    "wix-mcp-remote": {
      "command": "npx",
      "args": [
        "-y",
        "@wix/mcp-remote",
        "https://mcp.wix.com/sse"
      ]
    }
  }
}
```

### 1.5 MCP Test Script

Run to test connection:
```bash
node test_wix_mcp_connection.js
```

Expected output:
```
✅ Wix MCP endpoint is accessible
✅ Local Wix integration is working
✅ Product API is working
   Total products available: XXX
```

---

## ✅ Step 2: ETL API Check

### 2.1 ETL API Configuration

```javascript
// ETL API Details
const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';
```

### 2.2 Run ETL Test Script

```bash
node test_etl_api_structure.js
```

Expected output:
```
✅ Found XX technologies
✅ Sample Product Structure displayed
✅ Image fields identified
```

### 2.3 Manual ETL API Test

```bash
# Test technologies endpoint
curl -H "x-api-key: de6a4b7c-771e-4f22-9721-11f39763d794" \
     "https://api.etl.energysecurity.gov.uk/api/v1/technologies"

# Test products endpoint
curl -H "x-api-key: de6a4b7c-771e-4f22-9721-11f39763d794" \
     "https://api.etl.energysecurity.gov.uk/api/v1/products?size=5"
```

### 2.4 ETL Status Indicators

| Status | Meaning |
|--------|---------|
| ✅ 200 OK | API working correctly |
| ❌ 401 Unauthorized | API key invalid or expired |
| ❌ 403 Forbidden | IP blocked or rate limited |
| ❌ 500 Server Error | ETL server issue |
| ❌ Timeout | Network or server overloaded |

---

## ✅ Step 3: Backend Server Check

### 3.1 Health Check

```bash
curl https://energy-calc-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-09T...",
  "uptime": "..."
}
```

### 3.2 Products API Check

```bash
curl https://energy-calc-backend.onrender.com/api/products
```

Expected: Array of products with `id`, `name`, `category`, `imageUrl`, etc.

### 3.3 Local Server Test

```bash
# Start local server
node server-new.js

# Test locally
curl http://localhost:4000/health
curl http://localhost:4000/api/products
```

### 3.4 Database Check

```bash
# Run database check script
node check-database-content.js
```

Check for:
- ✅ Products table exists
- ✅ Product count matches expected (~5554)
- ✅ Images populated

---

## ✅ Step 4: Product Count Verification

### 4.1 Expected Product Counts

| Source | Expected Count | How to Verify |
|--------|----------------|---------------|
| **ETL Database** | ~5554+ | `check_total_products.js` |
| **Wix Store** | Varies | MCP `ListWixProducts` |
| **Backend API** | Matches ETL | `/api/products` response |

### 4.2 Check Product Count Script

```javascript
// Quick check - run in project directory
node -e "
const db = require('./database/sqlite.js');
db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
  console.log('Total products:', rows[0].count);
});
"
```

### 4.3 Compare Wix vs Backend

Using MCP tools (when connected):
```
1. Use ListWixSites to get site ID
2. Use CallWixSiteAPI to query products
3. Compare count with backend /api/products
```

---

## ✅ Step 5: Missing Products Report

### 5.1 Identify Missing Products

Products might be missing from:
1. **Wix Store** - Not synced from backend
2. **Backend DB** - Not imported from ETL
3. **ETL API** - Product delisted

### 5.2 Generate Missing Products Report

```javascript
// Compare backend vs Wix products
// Run when MCP is connected

// 1. Get backend products
const backendProducts = await fetch('/api/products').then(r => r.json());

// 2. Get Wix products via MCP
// Use CallWixSiteAPI to query Wix store

// 3. Compare and identify missing
const missing = backendProducts.filter(p => 
  !wixProducts.find(w => w.name === p.name)
);

console.log('Missing from Wix:', missing.length);
```

### 5.3 Common Missing Product Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Product not in Wix | Never synced | Run product sync |
| Product not in backend | Not imported | Run ETL import |
| Product outdated | Schema changed | Update product data |
| Image missing | URL broken | Run image check |

---

## 📊 System Health Report Template

### Generate Full Report

When asked to "check systems" or "run health check", produce this report:

```markdown
# 🔧 System Health Report
**Date:** [Current Date]
**Time:** [Current Time]

## Connection Status

| System | Status | Details |
|--------|--------|---------|
| MCP (Wix) | ✅/❌ | [Connected/Not connected] |
| ETL API | ✅/❌ | [Response time/Error] |
| Backend Server | ✅/❌ | [Health status] |
| MongoDB | ✅/❌ | [Connection status] |
| SQLite | ✅/❌ | [Database status] |

## Product Counts

| Location | Count | Expected | Status |
|----------|-------|----------|--------|
| Backend DB | XXX | ~5554 | ✅/❌ |
| Wix Store | XXX | Varies | ✅/❌ |
| ETL API | XXX | ~5554 | ✅/❌ |

## Missing Products

- **Not in Wix:** X products
- **Not in Backend:** X products  
- **Without Images:** X products

## Issues Found

1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Fix:** [Solution]

2. [Issue description]
   - **Severity:** High/Medium/Low
   - **Fix:** [Solution]

## Recommendations

1. [Action item]
2. [Action item]

---
*Report generated by Systems MD skill*
```

---

## 🛠️ Quick Fix Commands

### MCP Not Working
```bash
# Restart MCP
setup-mcp.bat

# Then restart Cursor and start new conversation
```

### ETL API Failing
```bash
# Test API key
curl -H "x-api-key: de6a4b7c-771e-4f22-9721-11f39763d794" \
     "https://api.etl.energysecurity.gov.uk/api/v1/technologies"

# If 401, API key may need renewal
```

### Backend Server Down
```bash
# Check Render dashboard for deployment status
# Or restart manually from Render dashboard

# For local testing:
node server-new.js
```

### Database Empty
```bash
# Run database initialization
node database/import-schemes.js
node database/import-products.js
```

---

## 📁 Reference Files

### Architecture Documents
| File | Purpose |
|------|---------|
| `PROJECT_ARCHITECTURE_OVERVIEW.md` | Full system architecture |
| `ARCHITECTURE_AND_ISSUES_SUMMARY.md` | Current issues & status |
| `ARCHITECTURE_COMPATIBILITY_CHECK.md` | Compatibility analysis |
| `DEPLOYMENT_ARCHITECTURE_CHECK.md` | Deployment verification |
| `wix-integration/SCALABILITY_AND_ARCHITECTURE_ANALYSIS.md` | Scalability notes |

### MCP Setup Files
| File | Purpose |
|------|---------|
| `MCP-SETUP-GUIDE.md` | MCP setup instructions |
| `MCP_QUICK_FIX.md` | Quick MCP troubleshooting |
| `setup-mcp.bat` | Windows MCP starter |
| `test_wix_mcp_connection.js` | MCP connection test |

### ETL Files
| File | Purpose |
|------|---------|
| `test_etl_api_structure.js` | ETL API test script |
| `routes/etl.js` | ETL API routes |

### Database Files
| File | Purpose |
|------|---------|
| `database/energy_calculator_central.db` | Main SQLite database |
| `database/mongodb.js` | MongoDB connection |
| `check-database-content.js` | Database checker |

---

## 📝 Lessons Learned Log

### Last Updated: January 2026

---

### Issue: MCP Tools Not Available After Restart

**Date:** January 2026  
**Problem:** After restarting Cursor, MCP tools don't appear in conversation.

**Root Cause:** MCP connection doesn't persist across Cursor restarts.

**Solution:**
1. Run `setup-mcp.bat` before starting Cursor
2. OR keep MCP running in background terminal
3. Always start NEW conversation after MCP connects

**Prevention:** Add MCP check to daily workflow startup

---

### Issue: Blurry Images in HTML Embeds

**Date:** January 2026  
**Problem:** Product images appear blurry when embedded in Wix iframes.

**Root Cause:** CSS using `object-fit: cover` and fixed heights.

**Solution:**
```css
img {
    object-fit: contain;  /* NOT cover */
    image-rendering: crisp-edges;
    max-width: 100%;
    height: auto;  /* NOT fixed */
}
```

**Prevention:** Use Media Skill MD guidelines for image CSS

---

### Issue: Iframe Content Cut Off in Wix

**Date:** January 2026  
**Problem:** HTML content in Wix iframe gets truncated.

**Root Cause:** Sticky positioning and insufficient height.

**Solution:**
1. Set iframe height to 4000px+
2. Remove `position: sticky` from elements
3. Add `scrolling="yes"` to iframe
4. Add CSS: `overflow-y: auto !important`

**Prevention:** Always test iframe height before deployment

---

### Issue: Products Table Missing on Render

**Date:** November 2025  
**Problem:** API returns empty array, no products showing.

**Root Cause:** Fresh database on Render, table not initialized.

**Solution:**
1. Check if table exists: `SELECT name FROM sqlite_master WHERE type='table'`
2. Run database initialization script
3. Import products from JSON or ETL API

**Prevention:** Add database initialization to server startup

---

### Issue: MongoDB vs SQLite Confusion

**Date:** January 2026  
**Problem:** Server using wrong database (SQLite instead of MongoDB).

**Root Cause:** `USE_MONGODB` environment variable not set on Render.

**Solution:**
1. Add `USE_MONGODB=true` to Render environment
2. Verify `MONGODB_URI` is correct
3. Check database connection logs on startup

**Prevention:** Document required environment variables

---

### Issue: Schemes Marked as Expired Incorrectly

**Date:** January 2026  
**Problem:** All schemes showing as "expired" after status update.

**Root Cause:** `updateStatuses()` comparing string `deadline` to Date.

**Solution:**
1. Only compare `endDate` field (proper Date type)
2. Disable auto-update temporarily
3. Use manual updates via JSON

**Prevention:** Validate data types before date comparisons

---

## 🔄 Add New Lessons Learned

When encountering new issues, add entries following this format:

```markdown
### Issue: [Brief Title]

**Date:** [Date discovered]  
**Problem:** [What went wrong]

**Root Cause:** [Why it happened]

**Solution:**
[Steps to fix]

**Prevention:** [How to avoid in future]
```

---

## 📅 Regular Maintenance Checklist

### Daily (Before Starting Work)
- [ ] Run `setup-mcp.bat` if using Wix tools
- [ ] Start new Cursor conversation
- [ ] Verify MCP tools visible

### Weekly
- [ ] Run full system health check
- [ ] Check product counts match
- [ ] Verify ETL API responding
- [ ] Review Render deployment logs

### Monthly
- [ ] Compare Wix products vs backend
- [ ] Update missing products
- [ ] Check for new ETL products
- [ ] Review and update lessons learned

---

## 🆘 Emergency Procedures

### Website Down
1. Check Render dashboard for server status
2. Check recent deployments for failures
3. Rollback to previous working deployment
4. Check database connectivity

### API Not Responding
1. Test health endpoint first
2. Check server logs for errors
3. Verify database connectivity
4. Check for rate limiting

### MCP Completely Broken
1. Delete `~/.cursor/mcp.json`
2. Re-run setup-mcp.bat
3. Restart Cursor completely
4. Start fresh conversation

---

**Last Updated:** January 2026  
**Maintained By:** Energy Calculator Backend System

---

*Run "check systems" or "system health report" to execute this skill*
