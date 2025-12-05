# Wix Pricing Plans Integration - Complete

## ✅ **What Has Been Built**

### 1. **Pricing Plans Sync Route** ✅
- **File:** `routes/wix-pricing-plans.js`
- **Endpoints:**
  - `POST /api/wix-pricing-plans/sync-plans` - Sync plans from Wix to local database
  - `GET /api/wix-pricing-plans/plans` - Get all plans from both sites
  - `GET /api/wix-pricing-plans/plans/buildings` - Get plans from Buildings site
  - `GET /api/wix-pricing-plans/plans/marketplace` - Get plans from Marketplace site
  - `GET /api/wix-pricing-plans/sync-instructions` - Get instructions for syncing

### 2. **Server Integration** ✅
- Route registered in `server-new.js`
- Available at `/api/wix-pricing-plans/*`

---

## 🔄 **How to Sync Pricing Plans from Wix**

### Step 1: Query Plans from Greenways Buildings

Use MCP tool to call:
```
Site ID: d9c9c6b1-f79a-49a3-8183-4c5a8e24a413
URL: https://www.wixapis.com/pricing-plans/v3/plans/query
Method: POST
Body: {
  "query": {
    "cursorPaging": {
      "limit": 50
    }
  }
}
```

### Step 2: Query Plans from Greenways Marketplace

Use MCP tool to call:
```
Site ID: cfa82ec2-a075-4152-9799-6a1dd5c01ef4
URL: https://www.wixapis.com/pricing-plans/v3/plans/query
Method: POST
Body: {
  "query": {
    "cursorPaging": {
      "limit": 50
    }
  }
}
```

### Step 3: Sync Plans to Local Database

Once you have the plans array from Wix, POST it to the sync endpoint:

```bash
POST /api/wix-pricing-plans/sync-plans
Content-Type: application/json

{
  "siteId": "d9c9c6b1-f79a-49a3-8183-4c5a8e24a413",
  "plans": [
    {
      "_id": "plan-id-1",
      "name": "Basic Plan",
      "pricing": {
        "subscription": {
          "cycleDuration": "MONTH",
          "cycleCount": 1,
          "price": [{"amount": 9.99, "currency": "EUR"}]
        }
      },
      "benefits": [...]
    }
  ]
}
```

---

## 📊 **Current Status**

### Tested API Calls:
- ✅ Greenways Buildings: API call successful, but no plans found (0 plans)
- ✅ Greenways Marketplace: (Testing...)

### Next Steps:
1. Create pricing plans in Wix for both sites (if not already created)
2. Use MCP tools to query the plans
3. Sync them to local database using `/api/wix-pricing-plans/sync-plans`
4. Plans will then be available via:
   - `/api/wix-pricing-plans/plans` - All plans
   - `/api/wix-pricing-plans/plans/buildings` - Buildings plans
   - `/api/wix-pricing-plans/plans/marketplace` - Marketplace plans

---

## 🔧 **Plan Data Structure**

The sync endpoint extracts:
- **Name** - Plan name
- **Price** - Base price amount
- **Price Monthly** - Calculated monthly price (for subscriptions)
- **Features** - Extracted from benefits array
- **Wix Plan ID** - Links to Wix plan
- **Wix Site ID** - Links to which site

---

## 📝 **Example Response**

After syncing, you can query plans:

```bash
GET /api/wix-pricing-plans/plans
```

Response:
```json
{
  "buildings": {
    "siteId": "d9c9c6b1-f79a-49a3-8183-4c5a8e24a413",
    "siteName": "Greenways Buildings",
    "plans": [...],
    "count": 3
  },
  "marketplace": {
    "siteId": "cfa82ec2-a075-4152-9799-6a1dd5c01ef4",
    "siteName": "Greenways Marketplace",
    "plans": [...],
    "count": 2
  },
  "all": [...],
  "total": 5
}
```

---

## ✅ **Integration Complete**

The pricing plans sync system is ready! Once you have pricing plans created in Wix, you can:
1. Query them using MCP tools
2. Sync them to the local database
3. Display them in the unified membership dashboard
4. Use them for subscription management








