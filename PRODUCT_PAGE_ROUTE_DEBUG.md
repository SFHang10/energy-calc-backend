# Product Page Route Debugging Guide

**Issue:** Getting root route JSON response instead of product page  
**Status:** ⚠️ Route handler exists but not matching

---

## 🔍 Current Situation

When clicking "View Details" on marketplace category page:
- **Expected:** Product page loads
- **Actual:** Getting JSON: `{"status":"API is running"...}`

This means the request is hitting the root route (`/`) instead of `/product-page-v2.html`.

---

## 🧪 Debugging Steps

### Step 1: Check What URL is Being Generated

**In Browser Console (F12):**
1. Go to category page
2. Click "View Details" on any product
3. Look for console log: `🛒 Opening product page: [URL]`
4. **Copy that exact URL**

**Expected URL format:**
- Localhost: `http://localhost:4000/product-page-v2.html?product=PRODUCT_ID`
- Production: `https://energy-calc-backend.onrender.com/product-page-v2.html?product=PRODUCT_ID`

### Step 2: Check Server Console

**When you click "View Details", you should see:**
```
📂 Route handler hit for product-page-v2.html
📂 Request URL: /product-page-v2.html?product=...
📂 Original URL: /product-page-v2.html?product=...
📂 Query params: { product: '...' }
📂 Looking for file at: [path]
📂 __dirname is: [path]
✅ File exists, sending...
```

**If you DON'T see these logs:**
- Route handler is NOT being hit
- Request is going somewhere else
- Check if URL is correct

### Step 3: Test Direct URL

**Try accessing directly in browser:**
```
http://localhost:4000/product-page-v2.html?product=sample_3
```

**Check:**
- Does it load the product page?
- Or does it show the root route JSON?
- What do server logs show?

### Step 4: Check Network Tab

**In Browser DevTools → Network tab:**
1. Click "View Details"
2. Find the request to `product-page-v2.html`
3. Check:
   - **Request URL:** What's the exact URL?
   - **Status Code:** 200, 404, or something else?
   - **Response:** What's the response body?

---

## 🔧 Possible Issues

### Issue 1: URL Generation Wrong
**Symptom:** Generated URL doesn't match route pattern  
**Check:** Browser console log shows wrong URL  
**Fix:** Verify URL generation in `category-product-page.html` line ~1040

### Issue 2: Route Not Matching
**Symptom:** Server logs don't show route being hit  
**Check:** Server console has no logs for product-page-v2.html  
**Fix:** Route pattern might need adjustment

### Issue 3: Static Middleware Intercepting
**Symptom:** Request handled by static middleware instead of route  
**Check:** Server logs show static file serving  
**Fix:** Route is before static middleware, but might need different approach

### Issue 4: Server Not Restarted
**Symptom:** Old code still running  
**Check:** Server console doesn't show new logs  
**Fix:** Restart server completely

### Issue 5: Wrong Base URL
**Symptom:** Request going to wrong server  
**Check:** Network tab shows request to different URL  
**Fix:** Check URL generation logic

---

## 🛠️ Quick Fixes to Try

### Fix 1: Use Absolute Path in sendFile
```javascript
res.sendFile(path.resolve(__dirname, 'product-page-v2.html'));
```

### Fix 2: Add Route Before Root Route
Move product page route to very top (before root route)

### Fix 3: Use Wildcard Route Pattern
```javascript
app.get(/^\/product-page-v2\.html/, (req, res) => {
  // Handle with or without query params
});
```

### Fix 4: Check if File Exists
```javascript
const fs = require('fs');
const filePath = path.join(__dirname, 'product-page-v2.html');
console.log('File exists?', fs.existsSync(filePath));
console.log('Full path:', filePath);
```

---

## 📝 What to Check Next

1. **Browser Console:** What URL is logged when clicking "View Details"?
2. **Server Console:** Do you see the route handler logs?
3. **Network Tab:** What's the actual request URL and response?
4. **Direct URL Test:** Does `http://localhost:4000/product-page-v2.html?product=sample_3` work?

---

**Next Action:** Check browser console and server console logs to see what's actually happening.



