# Master Image Update Guide - Complete Reference

## ⚠️ CRITICAL: This document contains everything needed to update product images

**Last Updated:** 2025-01-10  
**Purpose:** Prevent loss of knowledge when chats are lost

---

## The Working Process (Proven Method)

### Pattern Used Successfully for Weeks/Months

**Reference Files:**
- `update-athen-images.js` ✅ WORKING
- `update-tempest-images.js` ✅ WORKING  
- `fix-cheftop-images.js` ✅ WORKING

### The Process:

1. **Load JSON file directly** (NOT database first)
   ```javascript
   const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
   database = JSON.parse(databaseContent);
   ```

2. **Update products in memory**
   ```javascript
   database.products.forEach(product => {
       if (product.name === 'Product Name') {
           product.imageUrl = 'new-image-url';
           product.images = JSON.stringify(['new-image-url']);
       }
   });
   ```

3. **Create backup BEFORE saving**
   ```javascript
   const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_${name}_${Date.now()}.json`);
   fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
   ```

4. **Save JSON file**
   ```javascript
   fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
   ```

---

## Current Issues (2025-01-10)

### Products Showing Wrong Images (Motor.jpg instead of correct images):

1. **Carrier Refrigeration all glass door** (ID: etl_14_65836)
   - **Line:** 36355 in FULL-DATABASE-5554.json
   - **Current (WRONG):** `Product Placement/Motor.jpg`
   - **Should be:** `https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg`

2. **Carrier Refrigeration anti-reflective all glass door** (ID: etl_14_65852)
   - **Line:** 36943 in FULL-DATABASE-5554.json
   - **Current (WRONG):** `Product Placement/Motor.jpg`
   - **Should be:** `https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg`

3. **Baxi Solarflo (In-Roof)** (ID: etl_15_46852)
   - **Line:** 34283 in FULL-DATABASE-5554.json
   - **Current (WRONG):** `Product Placement/Motor.jpg`
   - **Should be:** `Product Placement/Baxi-STS-1.jpeg`

---

## Root Cause

**File:** `apply-placeholder-images.js`  
**Lines:** 161-167

```javascript
// Generic fallback
{
    category: 'ETL Technology',
    subcategory: null,
    image: 'Product Placement/Motor.jpg',
    description: 'Generic ETL products'
}
```

**Problem:** This matches ANY product in "ETL Technology" category, incorrectly assigning Motor.jpg to:
- Refrigeration products (should have fridge images)
- Solar/heating products (should have solar system images)

---

## ⚠️ SCRIPT ISSUE: Scripts Not Working in Current Environment

**Problem:** Scripts run (exit code 0) but:
- Console output is suppressed
- File doesn't get updated
- No error messages visible

**Solution:** Use manual edit (see MANUAL_FIX_INSTRUCTIONS.md)

### Scripts Created (But Not Working):
- `fix-carrier-and-baxi-images.js` - Should fix all 3 products
- `fix-carrier-direct-json.js` - Alternative for Carrier only

**Status:** Scripts exist but don't update file in this environment. Use manual edit instead.

---

## Manual Edit Instructions (If Scripts Don't Work)

### File: `FULL-DATABASE-5554.json`

#### Line 36355 - Carrier "all glass door"
**Find:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```
**Replace with:**
```json
      "imageUrl": "https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg",
```

#### Line 36943 - Carrier "anti-reflective"
**Find:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```
**Replace with:**
```json
      "imageUrl": "https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg",
```

#### Line 34283 - Baxi Solarflo
**Find:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```
**Replace with:**
```json
      "imageUrl": "Product Placement/Baxi-STS-1.jpeg",
```

---

## Prevention: Fix apply-placeholder-images.js

### Current Problem (Lines 161-167):
```javascript
// Generic fallback
{
    category: 'ETL Technology',
    subcategory: null,
    image: 'Product Placement/Motor.jpg',
    description: 'Generic ETL products'
}
```

### Solution: Add Specific Rules BEFORE Generic Fallback

Add these rules BEFORE the generic fallback:

```javascript
// Refrigeration products in ETL Technology
{
    category: 'ETL Technology',
    subcategory: 'Carrier Linde Commercial Refrigeration',
    image: 'Product Placement/Cm Fridge.jpeg',
    description: 'Carrier refrigeration products'
},
// Solar/heating products in ETL Technology
{
    category: 'ETL Technology',
    subcategory: 'Baxi Heating-Commercial',
    image: 'Product Placement/Baxi-STS-1.jpeg',
    description: 'Baxi solar/heating products'
},
// THEN the generic fallback (but make it more specific)
{
    category: 'ETL Technology',
    subcategory: null,
    image: 'Product Placement/Motor.jpg',
    description: 'Generic ETL products (motors/drives only)',
    // Only match if name contains motor/drive/fan keywords
    matchCondition: (product) => {
        const name = (product.name || '').toLowerCase();
        return name.includes('motor') || 
               name.includes('drive') || 
               name.includes('fan') ||
               name.includes('inverter');
    }
}
```

---

## Key Files Reference

### Working Scripts (Use as Templates):
- `update-athen-images.js` - Updates ATHEN XL products
- `update-tempest-images.js` - Updates Tempest products
- `fix-cheftop-images.js` - Fixes CHEFTOP products
- `fix-carrier-and-baxi-images.js` - Fixes Carrier and Baxi (NEW)

### Database Files:
- `FULL-DATABASE-5554.json` - Main product database (source of truth)
- `database/energy_calculator_central.db` - SQLite database (secondary)

### Image Files:
- `product-placement/` - Local image files
- Wix CDN URLs - For images uploaded to Wix Media Manager

---

## Important Rules

1. **NEVER overwrite existing data** - only update imageUrl field
2. **Always create backup** before making changes
3. **Update JSON directly** for simple image updates (don't use database sync)
4. **Use database sync** only when syncing from database to JSON
5. **Restart server** after updating to clear cache

---

## Troubleshooting

### If Scripts Don't Update File:
1. Check if server is running (may lock file)
2. Check file permissions
3. Try manual edit
4. Check if file path is correct

### If Images Don't Show After Update:
1. Restart server to clear cache
2. Check image URL is accessible
3. Verify imageUrl field is correct
4. Check browser cache (hard refresh)

---

## History of Issues

### Issue 1: Carrier Products (2025-01-10)
- **Problem:** Showing Motor.jpg instead of fridge images
- **Cause:** apply-placeholder-images.js generic fallback
- **Fix:** Update to Wix URLs provided by user

### Issue 2: Baxi Solarflo (2025-01-10)
- **Problem:** Showing Motor.jpg instead of solar system image
- **Cause:** apply-placeholder-images.js generic fallback
- **Fix:** Update to Product Placement/Baxi-STS-1.jpeg

### Issue 3: Chat Loss (2025-01-10)
- **Problem:** Lost chat history 3 times
- **Impact:** Lost context of previous fixes
- **Solution:** This master document

---

## Next Steps

1. ✅ Fix Carrier and Baxi images (use fix-carrier-and-baxi-images.js)
2. ✅ Update apply-placeholder-images.js to prevent future issues
3. ✅ Test fixes on local server
4. ✅ Commit to GitHub
5. ✅ Deploy to Render

---

**This document should be updated whenever:**
- New image update process is discovered
- New issues are found
- New fixes are implemented
- Process changes

**Keep this document in the project root for easy reference.**

