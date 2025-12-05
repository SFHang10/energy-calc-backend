# 🧪 Local Test Checklist

## ✅ Test Everything Locally Before Deploying

### **Step 1: Start Your Local Server**

1. Make sure your server is running:
   ```bash
   node server-new.js
   ```

2. Should see:
   ```
   🚀 Energy Calculator API (NEW) running on port 4000
   ```

---

### **Step 2: Test product-categories.html Locally**

**Test URL:**
```
http://localhost:4000/product-categories.html
```

**Expected Result:**
- ✅ Page loads (not "Cannot GET")
- ✅ Shows categories page with images
- ✅ Categories display correctly
- ✅ No console errors

**If It Works:**
- ✅ File is being served correctly
- ✅ Ready to deploy to Render

**If It Doesn't Work:**
- ❌ Check server logs for errors
- ❌ Verify file path is correct
- ❌ Check explicit route is working

---

### **Step 3: Test API Endpoints (Called by the Page)**

**Test URLs:**
```
http://localhost:4000/api/products/category/Heat%20Pumps
http://localhost:4000/api/products/category/Motor%20Drives
http://localhost:4000/api/products/category/HVAC%20Equipment
http://localhost:4000/api/products
http://localhost:4000/api/products/count
```

**Expected Result:**
- ✅ All endpoints return JSON data
- ✅ No errors
- ✅ Products are returned correctly

---

### **Step 4: Test Category Links**

**On the categories page:**
1. Click "Heat Pumps" category
2. Should open: `http://localhost:4000/category-product-page.html?category=Heat%20Pumps`
3. Verify products display correctly

**Test:**
- ✅ Heat Pumps category works
- ✅ Motor Drives category works
- ✅ HVAC Equipment category works
- ✅ All Products link works

---

### **Step 5: Test Product Page Links**

**From category page:**
1. Click on any product
2. Should open: `http://localhost:4000/product-page-v2.html?product=PRODUCT_ID`
3. Verify product page loads
4. Verify calculator works (not showing 0W)

**Test:**
- ✅ Product page loads
- ✅ Product image displays
- ✅ Calculator shows correct power value
- ✅ No errors in console

---

### **Step 6: Check Console for Errors**

**In Browser DevTools (F12):**
1. Open Console tab
2. Load: `http://localhost:4000/product-categories.html`
3. Check for errors:
   - ❌ No "Cannot GET" errors
   - ❌ No "404" errors
   - ❌ No API errors
   - ✅ Should see: `🚀 Optimized Product Categories initialized`

---

## ✅ Local Test Summary

**If Everything Works Locally:**
- ✅ File is being served correctly
- ✅ API endpoints are working
- ✅ Category filtering works
- ✅ Product pages work
- ✅ Calculator works

**Then:**
- ✅ Safe to deploy to Render
- ✅ Should work the same on Render

---

## 🚀 After Local Testing Passes

**Once local testing is successful:**
1. Deploy to Render (file already committed and pushed)
2. Wait for Render deployment
3. Test on Render: `https://energy-calc-backend.onrender.com/product-categories.html`
4. Update Wix iframe with Render URL

---

**Let's test locally first! What do you see when you visit `http://localhost:4000/product-categories.html`?**






