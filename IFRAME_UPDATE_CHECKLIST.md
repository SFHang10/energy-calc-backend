# 🔄 Iframe Update Checklist - Wix Editor

## ✅ What Needs Updating

### **1. Categories Page Iframe** (Main Priority)
**This is the main iframe that displays the product categories.**

**Current (Old):**
- ❌ `product-categories-optimized.html` (old version)
- ❌ `product-categories-TEST.html` (test version)
- ❌ `http://localhost:4000/product-categories.html` (won't work on live site)

**New (Correct):**
- ✅ `https://your-backend-url.com/product-categories.html` (production)
- ✅ Replace `your-backend-url.com` with your actual deployed backend URL

---

## 📋 Step-by-Step: Update in Wix Editor

### **Step 1: Find the Iframe**
1. Open Wix Editor
2. Go to the page where product categories are displayed
3. Click on the categories area
4. Look for an **HTML iframe element** or **Embed Code** element
5. Click on it to select it

### **Step 2: Check Current URL**
In the settings panel, you'll see a URL field. It might show:
- `http://localhost:4000/product-categories-optimized.html`
- `http://localhost:4000/product-categories.html`
- `https://your-backend-url.com/product-categories-TEST.html`

### **Step 3: Update to Production URL**
**Replace the URL with:**
```
https://your-backend-url.com/product-categories.html
```

**Example Production URLs:**
- `https://energy-calculator.herokuapp.com/product-categories.html`
- `https://api.yoursite.com/product-categories.html`
- `https://backend.greenwaysmarket.com/product-categories.html`

**Important:** 
- ✅ Use `product-categories.html` (not `-TEST.html` or `-optimized.html`)
- ✅ Use `https://` (not `http://`)
- ✅ Use your deployed backend URL (not `localhost`)

### **Step 4: Save & Publish**
1. Click **Apply** or **Update** in Wix Editor
2. Click **Publish** to make changes live
3. Wait 5-10 minutes for cache to clear

---

## 🔍 How to Find Your Backend URL

### **If Using Heroku:**
```
https://your-app-name.herokuapp.com/product-categories.html
```

### **If Using Vercel:**
```
https://your-app-name.vercel.app/product-categories.html
```

### **If Using Custom Domain:**
```
https://api.yoursite.com/product-categories.html
```

---

## ✅ Verification Checklist

After updating, verify:

1. **Categories Page Loads:**
   - ✅ Visit your live Wix site
   - ✅ Navigate to categories page
   - ✅ New design appears (not old version)

2. **Category Images Display:**
   - ✅ Heat Pumps shows `HeatPump.Jpeg`
   - ✅ Motor Drives shows `Motor.jpg`
   - ✅ HVAC Equipment shows `HVAC.jpeg`

3. **Category Filtering Works:**
   - ✅ Click "Heat Pumps" → Shows only heat pump products
   - ✅ Click "HVAC Equipment" → Shows only HVAC products (not motor drives)
   - ✅ Click "Motor Drives" → Shows only motor drive products (not HVAC)

4. **Product Links Work:**
   - ✅ Click any product
   - ✅ Opens `product-page-v2.html` with correct product
   - ✅ Calculator shows correct power value (not 0W)

---

## 🚨 Common Issues

### **Issue: "Still shows old version"**
**Solution:**
- Clear browser cache (`Ctrl+F5` or `Cmd+Shift+R`)
- Wait 5-10 minutes for Wix cache to clear
- Try incognito/private mode
- Verify you published the changes

### **Issue: "Localhost doesn't work"**
**Solution:**
- You **must** deploy your backend to a public URL
- Localhost only works on your local machine
- Deploy to Heroku, Vercel, or similar service

### **Issue: "Can't find iframe element"**
**Solution:**
- Look for "HTML" or "Embed Code" elements
- Check page settings for embedded content
- Right-click on categories area → "Element Settings"

---

## 📝 Quick Reference

### **Iframe Code for Wix:**
```html
<iframe
    src="https://your-backend-url.com/product-categories.html"
    width="100%"
    height="2500px"
    frameborder="0"
    style="border: none; display: block; position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 1000; margin: 0; padding: 0;"
    allowfullscreen
    loading="lazy"
    scrolling="no">
</iframe>
```

**Replace `your-backend-url.com` with your actual deployed backend URL!**

---

## 🎯 Files Updated Today

- ✅ `product-categories.html` - Updated with new design
- ✅ `product-page-v2.html` - Updated with marketplace design
- ✅ `category-product-page.html` - Fixed HVAC filtering
- ✅ `routes/product-widget.js` - Fixed power calculation (uses energyRating fallback)

---

## ✅ After Updating Iframe

Once you update the iframe URL in Wix:

1. **Test Categories Page:**
   ```
   https://your-backend-url.com/product-categories.html
   ```

2. **Test Product Page:**
   ```
   https://your-backend-url.com/product-page-v2.html?product=etl_7_86302
   ```
   - Should show correct power (170 kW, not 0W)
   - Calculator should work correctly

3. **Test API Directly:**
   ```
   https://your-backend-url.com/api/product-widget/etl_7_86302
   ```
   - Should return `power: 170` (from energyRating)
   - Should not return `power: 0`

---

## 🎉 Done!

Once the iframe is updated and published:
- ✅ Categories page shows new design
- ✅ Category filtering works correctly
- ✅ Product pages show correct power values
- ✅ Calculator works correctly

**Remember:** The iframe must point to your **deployed backend URL**, not localhost!






