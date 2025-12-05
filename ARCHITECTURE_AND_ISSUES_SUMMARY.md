# Architecture & Current Issues Summary

**Date:** November 6, 2025  
**Status:** ✅ Server deployed | ❌ Marketplace products not showing

---

## 🏗️ System Architecture Overview

### **Data Flow:**
```
ETL Database (SQLite) → Backend API (Express) → Frontend Widgets → User Interface
```

### **Key Components:**

1. **Backend Server** (`server-new.js`)
   - Port: 4000
   - Location: Render (`https://energy-calc-backend.onrender.com`)
   - Routes: `/api/products`, `/api/product-widget`, `/api/calculate`, etc.

2. **Database** (`energy_calculator_central.db`)
   - Location: `/opt/render/project/src/database/` (on Render)
   - Type: SQLite
   - Table: `products` (contains product data)

3. **Frontend Pages:**
   - `product-categories.html` - Category browser (✅ Working)
   - `category-product-page.html` - Product listings (❌ Products not showing)
   - `product-page-v2-marketplace-v2-enhanced.html` - Product detail pages

4. **Image Storage:**
   - Folder: `product-placement/` (renamed from "Product Placement")
   - Location: Root of repository
   - Status: ✅ Deployed (40 images)

---

## 🔍 Current Issue: Marketplace Products Not Showing

### **Problem:**
- Categories page (`product-categories.html`) is working ✅
- But no products are displaying on the marketplace site ❌
- This suggests the product data isn't being loaded or displayed

### **Root Cause Analysis:**

#### **1. Database Issue (Most Likely)**
From the logs:
```
❌ Database error: Error: SQLITE_ERROR: no such table: products
```

**What This Means:**
- The database file exists (`energy_calculator_central.db`)
- But the `products` table doesn't exist or is empty
- The database was just created on Render (new deployment)
- No product data has been loaded into it yet

**Evidence:**
- Logs show: `📁 Creating database directory: /opt/render/project/src/database`
- This is a fresh database created during deployment
- The `products` table needs to be initialized with data

#### **2. API Endpoint Issue (Possible)**
The `/api/products` endpoint:
- Location: `routes/products.js`
- Calls: `loadProductsFromETLDatabase()`
- Query: `SELECT ... FROM products WHERE category != 'Comparison Data'`
- If table is empty, returns empty array `[]`

**What Happens:**
1. Frontend calls: `fetch('/api/products')`
2. Backend queries: `SELECT ... FROM products`
3. Database returns: Empty (no table or no data)
4. API returns: `[]` (empty array)
5. Frontend displays: Nothing (no products to show)

#### **3. Frontend Issue (Less Likely)**
The `category-product-page.html`:
- Line 617: `fetch('/api/products', ...)`
- Expects: Array of products with `category`, `name`, `imageUrl`, etc.
- If API returns `[]`, frontend shows nothing

**Note:** Frontend code looks correct, issue is likely data-related

---

## 📊 Architecture Configuration Details

### **Backend API Routes:**

#### **`/api/products`** (Main endpoint)
- **File:** `routes/products.js`
- **Method:** GET
- **Data Source:** SQLite database (`energy_calculator_central.db`)
- **Query:** 
  ```sql
  SELECT id, name, brand, category, subcategory, power, 
         energyRating, imageUrl, ...
  FROM products 
  WHERE category != 'Comparison Data'
  ```
- **Returns:** Array of products with `image_url` field

#### **`/api/product-widget/:productId`**
- **File:** `routes/product-widget.js`
- **Method:** GET
- **Purpose:** Get single product for widget
- **Returns:** Product data with `image_url`

#### **`/api/calculate`**
- **File:** `routes/calculate.js`
- **Method:** POST
- **Purpose:** Energy calculations
- **Uses:** `power`, `energyRating`, `efficiency` (NOT `imageUrl`)

### **Database Structure:**

#### **Expected Schema:**
```sql
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT,
    brand TEXT,
    category TEXT,
    subcategory TEXT,
    power REAL,
    energyRating TEXT,
    efficiency TEXT,
    imageUrl TEXT,
    price REAL,
    runningCostPerYear REAL,
    ...
)
```

#### **Current Status:**
- ✅ Database file exists: `/opt/render/project/src/database/energy_calculator_central.db`
- ❌ Table might not exist: `no such table: products`
- ❌ Data might be empty: No products loaded

### **Frontend Configuration:**

#### **`category-product-page.html`**
- **API Call:** `fetch('/api/products')` (line 617)
- **Expected Response:** Array of products
- **Filtering:** Uses `product.category` or `product.shopCategory`
- **Display:** Shows products in grid layout

#### **`product-categories.html`**
- **Status:** ✅ Working
- **Purpose:** Category browser
- **Links to:** `category-product-page.html?category=...`

---

## 🔧 What Needs to Be Fixed

### **Priority 1: Initialize Database with Product Data**

**Problem:** Database is empty (newly created on Render)

**Solution Options:**

#### **Option A: Load Data from JSON File**
- **File:** `FULL-DATABASE-5554.json` (exists locally, not in Git)
- **Action:** Add initialization script to populate database on first run
- **Location:** Add to `routes/products.js` or create `scripts/init-database.js`

#### **Option B: Sync from ETL API**
- **Action:** Create script to fetch products from ETL API and insert into database
- **Location:** Create `scripts/sync-etl-products.js`

#### **Option C: Add Database File to Git**
- **Action:** Commit the database file with product data
- **Note:** Large file, might not be ideal for Git

**Recommended:** Option A or B - Initialize database on first deployment

### **Priority 2: Verify API Endpoint**

**Test the API:**
```bash
curl https://energy-calc-backend.onrender.com/api/products
```

**Expected Response:**
- If database is empty: `[]` (empty array)
- If database has data: Array of product objects

**What to Check:**
1. Does the endpoint return data?
2. What's the response structure?
3. Are there any errors in the response?

### **Priority 3: Check Frontend Code**

**Verify:**
1. Is `category-product-page.html` calling the correct endpoint?
2. Is it handling empty responses correctly?
3. Are there any JavaScript errors in browser console?

---

## 📝 Investigation Steps for Tomorrow

### **Step 1: Check Database Status**
```sql
-- Connect to database
-- Check if table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='products';

-- Check if table has data
SELECT COUNT(*) FROM products;
```

### **Step 2: Test API Endpoint**
```bash
# Test products endpoint
curl https://energy-calc-backend.onrender.com/api/products

# Check response
# - Is it empty array []?
# - Are there any errors?
# - What's the response structure?
```

### **Step 3: Check Frontend**
1. Open `category-product-page.html` in browser
2. Open browser DevTools (F12)
3. Go to Network tab
4. Check the `/api/products` request:
   - What's the response?
   - Are there any errors?
   - What's the status code?

### **Step 4: Check Logs**
1. Go to Render dashboard
2. Check Logs tab
3. Look for:
   - Database connection messages
   - Query execution messages
   - Error messages about missing tables

---

## 🎯 Key Findings from Architecture Documents

### **From PROJECT_ARCHITECTURE_OVERVIEW.md:**
- **Backend Server:** `server.js` (port 4000) - **Note:** We're using `server-new.js` now
- **Database Loading:** `routes/products.js` line 81 loads `FULL-DATABASE-5554.json`
- **API Endpoints:** All `/api/` routes functional
- **Calculator:** Protected (uses different fields, ignores `imageUrl`)

### **From DEPLOYMENT_ARCHITECTURE_CHECK.md:**
- **Database Location:** Must be where `routes/products.js` expects it
- **File Path:** Same path as current production setup
- **API Endpoints:** Will automatically include `imageUrl` in responses
- **No Code Changes:** Architecture unchanged, only data enhanced

### **From ARCHITECTURE_COMPATIBILITY_CHECK.md:**
- **Calculator:** Uses separate fields, ignores `imageUrl` ✅
- **API:** Already loads database, now returns images ✅
- **Frontend:** Displays images when available ✅
- **Wix:** Enhanced but not changed ✅

### **From CATEGORY_IMAGE_ISSUE_ANALYSIS.md:**
- **Issue:** Frontend calls `/api/products` but expects `shopCategory` field
- **Problem:** `/api/products` returns `category` only, not `shopCategory`
- **Solution:** Frontend should call `/api/shop-products` instead
- **Note:** This is a different issue (category filtering), but related

---

## 🔗 API Endpoints Reference

### **Available Endpoints:**
- `GET /health` - Health check
- `GET /api/products` - All products (returns `category` field)
- `GET /api/shop-products` - Products with `shopCategory` mapping
- `GET /api/product-widget/:productId` - Single product for widget
- `POST /api/calculate` - Energy calculations
- `GET /api/etl/products` - ETL products
- `GET /api/members/*` - Member routes
- `GET /api/subscriptions/*` - Subscription routes

### **Key Difference:**
- `/api/products` - Returns `category` field (from database)
- `/api/shop-products` - Returns `shopCategory` field (mapped from `category`)

**Note:** `category-product-page.html` might need to use `/api/shop-products` instead of `/api/products` for proper category filtering.

---

## 📁 File Locations

### **On Render:**
- **Server:** `/opt/render/project/src/server-new.js`
- **Routes:** `/opt/render/project/src/routes/`
- **Database:** `/opt/render/project/src/database/energy_calculator_central.db`
- **Images:** `/opt/render/project/src/product-placement/`
- **HTML:** `/opt/render/project/src/product-categories.html`

### **In Repository:**
- **Server:** `src/server-new.js` (or root `server-new.js`)
- **Routes:** `routes/` (at root)
- **Database:** `database/energy_calculator_central.db` (local, not in Git)
- **Images:** `product-placement/` (✅ in Git)
- **HTML:** `product-categories.html` (✅ in Git)

---

## 🚨 Critical Issues Summary

| Issue | Status | Priority | Root Cause |
|-------|--------|----------|------------|
| Marketplace products not showing | ❌ Open | HIGH | Database empty (no `products` table or no data) |
| Images showing 404s | ✅ Fixed | - | Images deployed, should work after deployment |
| SQLite database errors | ✅ Fixed | - | Database directory now created automatically |
| Category filtering | ⚠️ Possible | MEDIUM | Frontend might need `/api/shop-products` instead |

---

## 💡 Recommended Solutions

### **Solution 1: Initialize Database on First Run**
Create a database initialization script that:
1. Checks if `products` table exists
2. If not, creates the table
3. Loads data from `FULL-DATABASE-5554.json` (if available)
4. Or syncs from ETL API

**File:** `scripts/init-database.js` or add to `routes/products.js`

### **Solution 2: Add Database Initialization to Routes**
Modify `routes/products.js` to:
1. Check if database is empty
2. If empty, initialize with sample data or load from JSON
3. Log initialization status

### **Solution 3: Create Database Migration Script**
Create a script that:
1. Creates the `products` table with correct schema
2. Loads product data from JSON file
3. Can be run manually or on first deployment

---

## 📊 Next Steps Checklist

### **Tomorrow's Session:**

- [ ] **Step 1:** Check if `products` table exists in database
- [ ] **Step 2:** Check if table has any data
- [ ] **Step 3:** Test `/api/products` endpoint and see what it returns
- [ ] **Step 4:** Check browser console for JavaScript errors
- [ ] **Step 5:** Verify frontend is calling correct endpoint
- [ ] **Step 6:** Create database initialization script if needed
- [ ] **Step 7:** Load product data into database
- [ ] **Step 8:** Test marketplace products display

---

## 🔍 Key Questions to Answer

1. **Does the `products` table exist?**
   - Check database schema
   - Verify table creation

2. **Does the table have data?**
   - Check row count
   - Verify data structure

3. **Is the API returning data?**
   - Test endpoint directly
   - Check response structure

4. **Is the frontend calling the API correctly?**
   - Check network requests
   - Verify endpoint URL

5. **Are there any errors?**
   - Check browser console
   - Check server logs

---

## 📞 Quick Reference

### **Production URLs:**
- **Server:** `https://energy-calc-backend.onrender.com`
- **Categories:** `https://energy-calc-backend.onrender.com/product-categories.html`
- **Products API:** `https://energy-calc-backend.onrender.com/api/products`
- **Health Check:** `https://energy-calc-backend.onrender.com/health`

### **Database:**
- **Path (Render):** `/opt/render/project/src/database/energy_calculator_central.db`
- **Path (Local):** `database/energy_calculator_central.db`
- **Table:** `products`

### **Images:**
- **Base URL:** `https://energy-calc-backend.onrender.com/product-placement/`
- **Example:** `https://energy-calc-backend.onrender.com/product-placement/HeatPump.Jpeg`

---

**Document Created:** November 6, 2025  
**Last Updated:** November 6, 2025  
**Status:** Ready for investigation tomorrow



