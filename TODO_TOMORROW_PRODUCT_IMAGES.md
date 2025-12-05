# 📋 TODO Tomorrow: Fix Product Page Images

## 🎯 Goal
Fix product images on **both** the main product page AND the test version.

---

## ✅ Files to Update

### **1. API Route (Backend)**
- **File:** `routes/product-widget.js`
- **Line:** 123
- **Fix:** Change `row.image_url` → `row.imageUrl`
- **Reason:** Database column is `imageUrl` (camelCase), not `image_url` (snake_case)

### **2. Main Product Page**
- **File:** `product-page-v2.html`
- **Fixes needed:**
  - Line 936: Handle both `product.image_url` AND `product.imageUrl`
  - Line 1170: Always add placeholder if no image (don't leave blank)
  - Add `getImageUrl()` helper function (like categories page has)

### **3. Test Product Pages (2 files found)**
- **File 1:** `product-page-v2-test.html`
- **File 2:** `product-page-v2-marketplace-test.html`
- **Fixes needed:** Same as main product page above
  - Apply fixes to both test files
  - Verify each loads product images correctly

---

## 🔍 First Steps Tomorrow

1. **Verify test files:**
   - ✅ Found: `product-page-v2-test.html`
   - ✅ Found: `product-page-v2-marketplace-test.html`
   - Check which one(s) are actively used

2. **Check test file structure:**
   - Find where each loads product data
   - Find where each displays images
   - Verify they have same issues as main file

3. **Apply fixes to all:**
   - Main product page (`product-page-v2.html`)
   - Test page 1 (`product-page-v2-test.html`)
   - Test page 2 (`product-page-v2-marketplace-test.html`)

---

## 📊 Problem Summary (For Reference)

**Root Cause:**
- Database column: `imageUrl` (camelCase) ✅
- API reads: `row.image_url` ❌ (wrong column)
- Frontend expects: `product.image_url` but API doesn't return it

**Result:**
- Categories page: ✅ Works (handles both formats)
- Product page: ❌ Broken (no image_url in API response)
- Test product page: ❌ Likely same issue

---

## 📝 Notes

- Detailed fix summary available in: `PRODUCT_IMAGE_FIX_SUMMARY.md`
- Database check completed: `check-db-columns.js` (shows `imageUrl` column exists)
- Current state: Main product page shows blank images
- Test file needs verification tomorrow

---

*Created: 2025-11-01*
*Status: Waiting for tomorrow - need to identify test file first*

