# 🧪 Testing Guide: Product Image Fixes

**Date:** November 2, 2025  
**Purpose:** Test the product image fixes we just implemented

---

## 🚀 Quick Start

### **Step 1: Start Your Backend Server**
Make sure your backend is running on port 4000:
```bash
cd C:\Users\steph\Documents\energy-cal-backend
node server.js
```

You should see:
```
✅ Server running on http://localhost:4000
```

---

## 📊 Test 1: Backend API - Single Product

### **Purpose:** Verify API returns correct `image_url` from database

### **Test Command:**
Open browser or use curl:
```
http://localhost:4000/api/product-widget/sample_4
```

Or use PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/product-widget/sample_4" | ConvertTo-Json -Depth 10
```

### **Expected Result:**
```json
{
  "success": true,
  "product": {
    "id": "sample_4",
    "name": "Philips LED Bulb 9W",
    "image_url": null,  // ✅ Should be present (even if null) - NOT undefined!
    ...
  }
}
```

### **What to Check:**
- ✅ Response has `"image_url"` field (not missing)
- ✅ `"image_url"` is `null` or a string (not `undefined`)
- ✅ If product has image in database, `image_url` should be a URL string

### **Before Fix:**
- ❌ `image_url` would be `undefined` (not present in response)
- ❌ API would return wrong column

### **After Fix:**
- ✅ `image_url` is present (even if `null`)
- ✅ API reads correct `imageUrl` column from database

---

## 📊 Test 2: Backend API - Products List

### **Purpose:** Verify products list returns correct `image_url` for all products

### **Test Command:**
```
http://localhost:4000/api/product-widget/products/all
```

Or PowerShell:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/product-widget/products/all"
$response.products[0..4] | Select-Object id, name, image_url | Format-Table
```

### **Expected Result:**
```json
{
  "success": true,
  "products": [
    {
      "id": "sample_4",
      "name": "Philips LED Bulb 9W",
      "image_url": null,  // ✅ Present (null or string)
      ...
    },
    {
      "id": "...",
      "name": "...",
      "image_url": "Product Placement/Light.jpeg",  // ✅ Present if product has image
      ...
    }
  ],
  "total": 6689
}
```

### **What to Check:**
- ✅ All products have `"image_url"` field
- ✅ Some have `null`, some have string URLs
- ✅ No `undefined` values

---

## 📊 Test 3: Frontend - Product Page WITH Image

### **Purpose:** Verify product page displays image when available

### **Steps:**
1. Open browser
2. Go to: `http://localhost:4000/product-page-v2.html?product=sample_4`
3. Or try a product that has an image in the database

### **Expected Result:**
- ✅ Image displays in the main product area
- ✅ Image shows in media gallery
- ✅ No blank/white space where image should be

### **What to Look For:**
- ✅ Image displays correctly
- ✅ Image is clickable/zoomable if gallery implemented
- ✅ Console shows: `✅ Added main image: [URL]`

### **Console Check:**
Open browser DevTools (F12) → Console tab:
```
🔄 updateMediaGallery called with product: Philips LED Bulb 9W
✅ Added main image: [actual image URL or placeholder]
```

---

## 📊 Test 4: Frontend - Product Page WITHOUT Image

### **Purpose:** Verify product page shows placeholder when image is missing

### **Steps:**
1. Open browser
2. Go to: `http://localhost:4000/product-page-v2.html?product=sample_4`
3. (This product should have `imageUrl: null` in database)

### **Expected Result:**
- ✅ Placeholder image displays (not blank)
- ✅ Placeholder shows product name or "No Image" text
- ✅ Placeholder has green background (`#2d7a5f`)
- ✅ Image area is never empty/white

### **What to Look For:**
- ✅ Placeholder image with product name
- ✅ Green placeholder background
- ✅ No blank/empty space

### **Console Check:**
```
🔄 updateMediaGallery called with product: Philips LED Bulb 9W
✅ Added main image: https://via.placeholder.com/600x400/2d7a5f/ffffff?text=Philips+LED+Bulb+9W
```

---

## 📊 Test 5: Frontend - Relative Path Images

### **Purpose:** Verify relative paths are converted to absolute URLs

### **Test Scenario:**
If a product has `imageUrl: "Product Placement/Light.jpeg"` (relative path):

### **Expected Result:**
- ✅ Image URL converted to: `http://localhost:4000/Product Placement/Light.jpeg`
- ✅ Image displays correctly

### **Console Check:**
Should see `getImageUrl()` helper function converting relative paths.

---

## 📊 Test 6: Compare Before/After

### **Before Fix:**
1. ❌ API returned `image_url: undefined` (or missing field)
2. ❌ Product page showed blank/white area
3. ❌ Images didn't display even if they existed

### **After Fix:**
1. ✅ API returns `image_url: null` or string URL
2. ✅ Product page shows placeholder when image missing
3. ✅ Images display when available

---

## 🔍 Detailed Testing Steps

### **Step-by-Step: Full Test**

#### **1. Start Backend:**
```bash
cd C:\Users\steph\Documents\energy-cal-backend
node server.js
```

#### **2. Test API in Browser:**
Open new tab:
```
http://localhost:4000/api/product-widget/sample_4
```

**Check:**
- JSON response loads
- `image_url` field exists
- Value is `null` or a string (not `undefined`)

#### **3. Test Product Page:**
Open new tab:
```
http://localhost:4000/product-page-v2.html?product=sample_4
```

**Check:**
- Page loads without errors
- Image area shows something (not blank)
- If no image → placeholder displays
- If image exists → actual image displays

#### **4. Check Browser Console:**
Press F12 → Console tab

**Look for:**
- ✅ `✅ Added main image: [URL]`
- ❌ No JavaScript errors
- ✅ `getImageUrl()` function working

#### **5. Test Different Products:**
Try different product IDs:
- Product with image: `?product=[product-with-image]`
- Product without image: `?product=sample_4`
- Product from grants data: `?product=[grants-product-id]`

---

## 📋 Testing Checklist

### **Backend API Tests:**
- [ ] Test `/api/product-widget/sample_4` → Returns `image_url` field
- [ ] Test `/api/product-widget/products/all` → All products have `image_url`
- [ ] Check `image_url` is never `undefined` (always `null` or string)

### **Frontend Tests:**
- [ ] Product page loads without errors
- [ ] Image area always shows something (never blank)
- [ ] Products with images show actual images
- [ ] Products without images show placeholders
- [ ] Placeholder shows product name
- [ ] Console shows success messages

### **Edge Cases:**
- [ ] Test product with `imageUrl: null`
- [ ] Test product with `imageUrl: ""` (empty string)
- [ ] Test product with relative path: `"Product Placement/image.jpg"`
- [ ] Test product with absolute URL: `"https://example.com/image.jpg"`
- [ ] Test grants database products (should already work)

---

## 🐛 Troubleshooting

### **Problem: API still returns `undefined`**
**Solution:**
- Check backend server restarted after changes
- Verify database column name is `imageUrl` (not `image_url`)
- Check console for errors

### **Problem: Product page shows blank**
**Solution:**
- Check browser console for JavaScript errors
- Verify `getImageUrl()` function exists
- Check `updateMediaGallery()` is called

### **Problem: Images don't load**
**Solution:**
- Check image URLs are correct
- Verify relative paths converted to absolute
- Check server is serving static files correctly

### **Problem: Still seeing old behavior**
**Solution:**
- Clear browser cache (Ctrl+F5)
- Hard refresh (Ctrl+Shift+R)
- Restart backend server

---

## 📊 Success Criteria

### **✅ All Tests Pass When:**
1. API returns `image_url` for all products (never `undefined`)
2. Product page always shows something in image area (never blank)
3. Products with images display correctly
4. Products without images show placeholder
5. No JavaScript errors in console
6. All edge cases handled

---

## 🎯 Quick Test Commands

### **PowerShell - Test API:**
```powershell
# Test single product
$product = Invoke-RestMethod -Uri "http://localhost:4000/api/product-widget/sample_4"
Write-Host "Image URL: $($product.product.image_url)"

# Test products list
$products = Invoke-RestMethod -Uri "http://localhost:4000/api/product-widget/products/all"
Write-Host "Total products: $($products.total)"
Write-Host "First product image: $($products.products[0].image_url)"
```

### **Browser - Quick Tests:**
```
# API Test
http://localhost:4000/api/product-widget/sample_4

# Product Page Test
http://localhost:4000/product-page-v2.html?product=sample_4

# Products List Test
http://localhost:4000/api/product-widget/products/all
```

---

*Testing Guide Created: November 2, 2025*  
*Status: Ready for Testing*







