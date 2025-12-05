# Category Image Duplication Issue - Analysis

## Problem Statement
Motor images are appearing on the Heat Pumps category page. Images are being shared incorrectly between categories.

## Root Cause Identified

### Issue 1: API Endpoint Mismatch
- **Frontend calls**: `/api/products` (line 453 in `category-product-page.html`)
- **Frontend expects**: `product.shopCategory === 'Heat Pumps'` (line 324)
- **Backend `/api/products` returns**: Only `category` field, NOT `shopCategory`
- **Result**: All products fail the filter, fallback logic shows wrong products

### Issue 2: Missing shopCategory Field
- **`routes/products.js`**: Returns products with `category` only
- **`routes/shop-products.js`**: Returns products with `shopCategory` mapping (lines 69-137)
- **Frontend**: Should call `/api/shop-products` but calls `/api/products`

### Issue 3: Category Filter Logic Failure
When `product.shopCategory` is undefined:
- Filter: `product.shopCategory === 'Heat Pumps'` → Always `false`
- All products filtered out
- Likely fallback shows all products or default image

## Wix Store Analysis (via MCP)

### Heat Pump Products in Wix:
- **Collection ID**: `3f286d91-fd9e-ffa9-5ea6-0eb27ca45b27`
- **Examples**:
  - "Ideal Logic Air 4kW Air to Water Heat Pump"
  - "Hisa HR290-006-1PH Air to Water Heat Pump"
  - "Baxi Quinta Ace 90kW Heat Pump"
  - "Baxi Auriga HP 40T Heat Pump"
- **Each has unique image**: ✅ Each product has its own distinct image in Wix

### Motor Products in Wix:
- **Collection ID**: `00000000-000000-000000-000000000001` (default collection)
- **Examples**:
  - "ABB 3BP4 Process Performance Super Premium Efficiency Motor"
  - "Asynchronous IE4 motor (400V) - 2.2kW"
  - "Asynchronous IE4 motor (400V) - 3kW"
- **Each has unique image**: ✅ Each product has its own distinct image in Wix

### Key Finding:
✅ **Wix Store is CORRECT** - Each product has its own unique image  
❌ **Frontend filtering is BROKEN** - Missing `shopCategory` field causes filter failure

## Solution

### Option A: Fix Frontend to Use Correct Endpoint (Recommended)
**Change**: `category-product-page.html` line 453  
**From**: `fetch('/api/products', ...)`  
**To**: `fetch('/api/shop-products', ...)`

This endpoint includes the `shopCategory` mapping logic (lines 69-137 in `routes/shop-products.js`).

### Option B: Fix Frontend Filters to Use Database Categories
**Change**: `category-product-page.html` filters to use `product.category` instead of `product.shopCategory`  
**From**: `return product.shopCategory === 'Heat Pumps';`  
**To**: `return product.category === 'ETL Technology' && (product.subcategory.includes('Heat Pump') || product.name.toLowerCase().includes('heat pump'));`

### Option C: Add shopCategory to `/api/products` Endpoint
**Change**: `routes/products.js` to include `shopCategory` mapping logic from `shop-products.js`

## Recommended Fix

**Best approach**: Use Option A - Change frontend to call `/api/shop-products`

This is because:
1. ✅ `/api/shop-products` already has the correct `shopCategory` mapping
2. ✅ Mapping logic already handles ETL Technology → Heat Pumps conversion
3. ✅ Handles Motor Drives categorization correctly
4. ✅ Minimal code changes required
5. ✅ Already tested and working

## Implementation Steps

1. **Update frontend endpoint**:
   ```javascript
   // In category-product-page.html line ~453
   const response = await fetch('/api/shop-products', {
       // ... existing options
   });
   ```

2. **Verify backend route is registered**:
   - Check `app.js` includes `routes/shop-products.js`
   - Verify route path is `/api/shop-products`

3. **Test category filtering**:
   - Test Heat Pumps category: `?category=heat-pumps`
   - Test Motors category: `?category=motors`
   - Verify only correct products appear

## Expected Result After Fix

- ✅ Heat Pumps category shows only Heat Pump products with Heat Pump images
- ✅ Motors category shows only Motor products with Motor images  
- ✅ No image duplication between categories
- ✅ Each category displays correct product images from database/Wix

## Verification Checklist

After implementing fix:
- [ ] Heat Pumps page shows only Heat Pump products
- [ ] Motor images NOT appearing on Heat Pumps page
- [ ] Motor page shows only Motor products
- [ ] Each product displays correct image
- [ ] Category filter logic working correctly
- [ ] No console errors about missing `shopCategory`








