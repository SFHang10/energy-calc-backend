# MongoDB Usage Analysis - Why It's Not Currently Used

**Date:** Current Session  
**Status:** ✅ Analysis Complete

---

## 🔍 **Summary**

**MongoDB is installed but NOT actively used in this codebase.** The project uses **SQLite** for all database operations.

---

## 📦 **What's Installed**

### **MongoDB Packages in `package.json`:**
- ✅ `mongodb: ^5.9.2` - MongoDB native driver
- ✅ `mongoose: ^7.8.7` - MongoDB ODM (Object Document Mapper)

### **MongoDB-Related Files:**
- ✅ `check-mongodb-config.js` - Configuration checker script
- ✅ `test-mongodb-connection.js` - Connection test script
- ✅ `MONGODB_ALERT_ACTION_PLAN.md` - Documentation about expired secrets
- ✅ `MONGODB_SECRET_RENEWAL_GUIDE.md` - Renewal instructions

---

## ❌ **What's NOT Being Used**

### **No MongoDB Connection Code:**
- ❌ No `mongoose.connect()` in `server-new.js`
- ❌ No `MongoClient.connect()` anywhere
- ❌ No MongoDB imports in any route files
- ❌ No MongoDB models or schemas defined

### **No MongoDB Environment Variables:**
- ❌ `config-template.env` has no MongoDB variables
- ❌ No `MONGODB_URI` or `MONGO_URI` in template
- ⚠️ May exist in production `.env` (Render) but not used in code

---

## ✅ **What IS Being Used Instead**

### **SQLite Database:**
- ✅ **Primary Database:** `energy_calculator_central.db`
  - Location: `database/energy_calculator_central.db`
  - Used by: `/api/products`, `/api/product-widget`, `/api/etl`
  - Contains: Product catalog, ETL data

- ✅ **Members Database:** `members.db`
  - Location: `database/members.db`
  - Used by: `/api/members`, `/api/subscriptions`
  - Contains: User accounts, subscriptions, pricing plans

### **Database Packages:**
- ✅ `better-sqlite3: ^12.4.1` - Modern SQLite driver
- ✅ `sqlite3: ^5.1.7` - Traditional SQLite driver (legacy)

---

## 🤔 **Why Was MongoDB Set Up?**

### **Possible Reasons:**

1. **Future Planning:**
   - MongoDB was likely planned for future scalability
   - SQLite is simpler for MVP/prototype
   - MongoDB would handle larger datasets better

2. **Wix Integration:**
   - May have been intended for syncing Wix data
   - Could store member data from Wix sites
   - Might sync product data between systems

3. **External Service:**
   - MongoDB Atlas account exists (hence the expired secret alert)
   - May be used by a different Greenways project
   - Could be for a separate service/integration

4. **Legacy/Unused:**
   - Set up initially but never implemented
   - Replaced with SQLite for simplicity
   - Packages left in `package.json` but code removed

---

## 🔍 **Evidence from Codebase**

### **All Routes Use SQLite:**

#### **`routes/products.js`:**
```javascript
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '..', 'database', 'energy_calculator_central.db');
db = new sqlite3.Database(dbPath);
```

#### **`routes/members.js`:**
```javascript
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../database/members.db');
const db = new sqlite3.Database(dbPath);
```

#### **`routes/calculate.js`:**
- Uses SQLite for product lookups
- No MongoDB references

#### **`routes/wix-integration.js`:**
- Uses JSON file (`wix_products_export.json`)
- No database connection at all

#### **`services/wix-membership-service.js`:**
- Uses Wix API directly via MCP tools
- No MongoDB storage

---

## 📋 **Current Database Architecture**

```
┌─────────────────────────────────────────┐
│         Express Server                  │
│         (server-new.js)                 │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌─────────▼────────┐
│  SQLite DB 1   │    │   SQLite DB 2    │
│  Products      │    │   Members         │
│                │    │                   │
│ energy_calc_   │    │ members.db        │
│ central.db     │    │                   │
└────────────────┘    └───────────────────┘
        │                       │
        │                       │
┌───────▼───────────────────────▼────────┐
│         API Routes                     │
│  /api/products                        │
│  /api/members                         │
│  /api/subscriptions                   │
└────────────────────────────────────────┘
```

**MongoDB is NOT in this architecture.**

---

## 🚨 **About the MongoDB Alert**

### **The Alert You Received:**
- **Type:** Organization Service Account Secrets expired
- **Organization:** Greenways
- **Date:** October 1, 2025

### **Why You Got It:**
1. **MongoDB Atlas Account Exists:**
   - You have a MongoDB Atlas organization account
   - Service account was created (possibly for future use)
   - Secret expired (normal security practice)

2. **Not Related to This Codebase:**
   - This codebase doesn't use MongoDB
   - Alert is about Atlas account, not code usage
   - May be for a different project/service

### **What to Do:**
1. **If MongoDB is NOT needed:**
   - Close/delete the MongoDB Atlas organization
   - This will stop the alerts
   - No code changes needed

2. **If MongoDB IS needed (elsewhere):**
   - Renew the secret in MongoDB Atlas
   - Update wherever it's used (different project/service)
   - This codebase doesn't need changes

---

## 💡 **Recommendations**

### **Option 1: Remove MongoDB (If Not Needed)**
```bash
# Remove MongoDB packages
npm uninstall mongodb mongoose

# Delete MongoDB-related files
rm check-mongodb-config.js
rm test-mongodb-connection.js
rm MONGODB_*.md

# Close MongoDB Atlas account (if not used elsewhere)
```

### **Option 2: Keep MongoDB (For Future Use)**
- Keep packages installed
- Keep test scripts for when you implement it
- Document why it's there
- Set up connection code when needed

### **Option 3: Implement MongoDB (If Needed Now)**
If you want to use MongoDB:
1. Set up connection in `server-new.js`
2. Create MongoDB models/schemas
3. Migrate data from SQLite (if needed)
4. Update routes to use MongoDB
5. Update environment variables

---

## ✅ **Conclusion**

**MongoDB is installed but not used.** The project successfully runs on SQLite for:
- ✅ Product catalog
- ✅ Member management
- ✅ Subscriptions
- ✅ Energy calculations

**The MongoDB alert is about an Atlas account, not this codebase.** You can safely:
- Ignore it if MongoDB isn't used elsewhere
- Renew the secret if it's used in another project
- Remove MongoDB packages if you're sure you won't need it

---

## 📝 **Files to Review**

If you want to verify this analysis:
1. `server-new.js` - No MongoDB imports
2. `routes/*.js` - All use SQLite
3. `package.json` - MongoDB packages exist but unused
4. `.env` (if exists) - Check for MongoDB variables (likely not used)

---

**Last Updated:** Current Session  
**Status:** MongoDB not used - SQLite is the active database






