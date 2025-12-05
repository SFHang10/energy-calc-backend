# URGENT TOMORROW - Energy Calculator System Issues

## 🚨 CRITICAL PROBLEMS TO FIX

### 1. **Enhanced Calculator Filtering Broken**
- **Issue**: Shows only 13 products for "Restaurant Equipment" instead of ~120
- **Issue**: Shows 0 products for "Heating" (missing boilers, heat pumps)
- **Root Cause**: Category name mismatch between frontend and backend

### 2. **Missing Heating Products**
- **Issue**: No boilers, heat pumps, or heating equipment visible
- **Evidence**: ETL website shows 12 heat pump products available
- **Root Cause**: Products lost during database sync or rollback

## 📊 CURRENT SYSTEM STATE

### API Data (5556 total products):
- ETL Technology: 5375 products
- professional-foodservice: 107 products  
- Restaurant Equipment: 13 products
- Appliances: 39 products
- Office Equipment: 12 products
- Smart Home: 9 products
- Lighting: 1 products
- **Heating: 0 products** ❌

### Enhanced Calculator Categories:
- Looking for: "Restaurant Equipment", "Heating", "Appliances", etc.
- Finding: Only partial matches due to category mismatches

## 🔧 CHANGES THAT CAUSED THE ISSUES

### 1. **Category Name Changes**
- Changed "Restaurant Equipment" → "professional-foodservice" in JSON
- Enhanced calculator still expects "Restaurant Equipment"
- **Fix**: Either update calculator OR change data back

### 2. **Database Synchronization**
- Ran `safe_sync_professional_foodservice.js`
- Mapped column names between schemas
- **Issue**: May have caused data loss or misalignment

### 3. **API Structure Changes**
- API now returns `imageUrl` (camelCase) instead of `image_url` (snake_case)
- Enhanced calculator expects snake_case field names
- **Issue**: Field name mismatch breaks filtering

### 4. **Incomplete Rollback**
- Backup was created AFTER changes were made
- Restored partial state, not original working state
- **Issue**: Missing heating products that were there before

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1: Fix Category Filtering
1. **Check if heating products are in "ETL Technology" category**
2. **Fix category mapping** - either:
   - Update enhanced calculator to look for "professional-foodservice"
   - OR change data back to "Restaurant Equipment"

### Priority 2: Restore Missing Heating Products
1. **Find where heating products went** (check ETL Technology category)
2. **Add back missing boilers/heat pumps** from ETL website
3. **Ensure proper categorization** as "Heating"

### Priority 3: Fix Field Name Mismatches
1. **Update enhanced calculator** to handle both `imageUrl` and `image_url`
2. **Ensure API consistency** with frontend expectations

## 📁 KEY FILES TO CHECK

- `Energy Cal 2/energy-calculator-enhanced-2.html` - Enhanced calculator
- `FULL-DATABASE-5554.json` - Main product data
- `routes/products.js` - API route
- `database/backups/` - Older backup files
- ETL website: https://etl.energysecurity.gov.uk/product-search/search?keywords=Heat%20pumps

## 🔍 DEBUGGING STEPS

1. **Check ETL Technology category** for heating products
2. **Search for "Baxi", "Hisa", "Logic Air"** products in database
3. **Verify field names** in API responses
4. **Test category filtering** in enhanced calculator
5. **Compare with ETL website** product list

## ⚠️ WARNING

- **DO NOT make more changes** without understanding the full impact
- **Test each fix** before moving to the next
- **Create backups** before any modifications
- **The system was working before** - need to restore that state

## 🎯 SUCCESS CRITERIA

- Enhanced calculator shows correct product counts for all categories
- Heating products (boilers, heat pumps) are visible and categorized correctly
- All categories filter properly without showing 0 or incorrect counts
- System matches the working state from before today's changes

---
**Created**: $(Get-Date)
**Status**: URGENT - System partially broken
**Next**: Fix category filtering and restore missing heating products



















