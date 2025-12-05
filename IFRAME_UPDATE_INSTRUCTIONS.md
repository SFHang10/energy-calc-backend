# 🔄 Iframe Update Instructions - Complete Guide

**Date:** November 2, 2025  
**Status:** ✅ **READY TO UPDATE**

---

## 📋 **Current Situation**

### **Current Iframe (in Wix Editor):**
```html
<iframe
    src="http://localhost:4000/product-categories-optimized.html"
    width="100%"
    height="2500px"
    frameborder="0"
    style="border: none; display: block; position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 1000; margin: 0; padding: 0;"
    allowfullscreen
    loading="lazy"
    scrolling="no">
</iframe>
```

### **Issues:**
1. ❌ Points to `product-categories-optimized.html` (old version)
2. ❌ Points to `localhost:4000` (won't work on live site)
3. ❌ File name is wrong (should be `product-categories.html`)

---

## ✅ **What Needs to Change**

### **1. Update File Name**
- **Old:** `product-categories-optimized.html`
- **New:** `product-categories.html`

### **2. Update URL to Production**
- **Old:** `http://localhost:4000/...`
- **New:** `https://your-backend-url.com/...`

### **3. Keep Styling**
- Keep all the existing styling (position: fixed, z-index, etc.)
- Keep height, width, and other attributes

---

## 🎯 **New Iframe Code (Production)**

### **For Production Site:**
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

**Replace `your-backend-url.com` with your actual deployed backend URL.**

---

## 📝 **Step-by-Step Instructions**

### **Step 1: Find Your Backend URL**

**What is your backend deployment URL?**

- Is your backend deployed on Heroku, Vercel, Netlify, or another service?
- Do you have a URL like:
  - `https://energy-calculator.herokuapp.com`
  - `https://api.greenwaysmarket.com`
  - `https://backend.yoursite.com`

**If you don't have a deployed backend yet:**
- You'll need to deploy your backend first
- Or use a service like ngrok to expose localhost temporarily

---

### **Step 2: Test the URL**

Before updating the iframe, test that your backend URL works:

1. Open in browser: `https://your-backend-url.com/product-categories.html`
2. You should see the new categories page with images
3. If it doesn't load, your backend isn't deployed or accessible

---

### **Step 3: Update the Iframe in Wix Editor**

1. **Log into Wix:**
   - Go to https://www.wix.com/
   - Log into your account
   - Open your site: **Greenways Market**

2. **Open the Page Editor:**
   - Navigate to the page where categories are displayed
   - This is likely the "Products" or "Shop" page

3. **Find the Iframe Element:**
   - Click on the area where the categories page is displayed
   - Look for an **HTML iframe element** or **Embedded HTML** element
   - It might be labeled as "HTML Code" or "Embed Code"

4. **Click on the Iframe Element:**
   - Click on it to select it
   - The settings panel should open on the right side

5. **Find the URL Field:**
   - Look for a field labeled **URL**, **src**, or **Source**
   - It might be in the settings panel or in the HTML code

6. **Update the URL:**
   - **Current URL:** `http://localhost:4000/product-categories-optimized.html`
   - **New URL:** `https://your-backend-url.com/product-categories.html`
   - Replace `your-backend-url.com` with your actual backend URL

7. **Save and Publish:**
   - Click **Save** or **Apply**
   - Click **Publish** in Wix Editor
   - Visit your live site: https://www.greenwaysmarket.com/

---

## 🔍 **How to Find the Iframe in Wix Editor**

### **Method 1: Look for HTML/Embed Element**

1. In Wix Editor, look for elements that say:
   - "HTML Code"
   - "Embed Code"
   - "Custom HTML"
   - "Iframe"

2. These are usually in the **Add** menu or **Elements** panel

### **Method 2: Check Page Settings**

1. Right-click on the page background
2. Look for "Page Settings" or "Page Code"
3. Check if the iframe is embedded in page settings

### **Method 3: Use Browser DevTools**

1. Open your live site: https://www.greenwaysmarket.com/
2. Right-click on the categories area
3. Click "Inspect" or "Inspect Element"
4. Look for `<iframe>` tags in the HTML
5. Check the `src` attribute - this is the URL you need to update

---

## ✅ **What's Included in the Updated File**

The new `product-categories.html` includes:

- ✅ New design from TEST version
- ✅ Fixed category filtering
- ✅ Each category has its own image
- ✅ Links correctly to `category-product-page.html`
- ✅ Links correctly to `product-page-v2.html`
- ✅ Improved visual layout

---

## 🔗 **Related URLs**

### **Categories Page:**
- **URL:** `https://your-backend-url.com/product-categories.html`
- **Purpose:** Main categories page (shown in iframe)

### **Category Product Page:**
- **URL:** `https://your-backend-url.com/category-product-page.html?category=Motor%20Drives`
- **Purpose:** Shows products filtered by category
- **Example:** Motor Drives category

### **Product Page:**
- **URL:** `https://your-backend-url.com/product-page-v2.html?product=etl_11_47941`
- **Purpose:** Individual product detail page
- **Example:** Product ID `etl_11_47941`

---

## ⚠️ **Important Notes**

### **1. Backend Must Be Deployed**
- ❌ **Localhost won't work** on your live Wix site
- ✅ **You need a deployed backend** accessible on the internet
- ✅ **Backend must be running** and accessible at the URL

### **2. Test the URL First**
Before updating the iframe, test that your backend URL works:
- Open in browser: `https://your-backend-url.com/product-categories.html`
- You should see the new categories page with images
- If it doesn't load, your backend isn't deployed or accessible

### **3. Clear Cache After Updating**
- After updating the iframe, clear your browser cache
- Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or use incognito/private mode to test

### **4. Wix May Cache Content**
- Wix sometimes caches iframe content
- Wait 5-10 minutes after publishing
- Or clear Wix cache if available in settings

---

## 🚨 **Troubleshooting**

### **Issue: "Iframe not found"**
- **Solution:** The iframe might be embedded differently
- Check if categories are in a "Custom HTML" element
- Or check page settings for embedded content

### **Issue: "Still shows old version"**
- **Solution:** Clear browser cache (`Ctrl+F5`)
- Wait 5-10 minutes for Wix cache to clear
- Check that you published the changes

### **Issue: "Backend URL doesn't work"**
- **Solution:** Your backend might not be deployed
- Check that your backend server is running
- Verify the URL is accessible in a browser
- Check for CORS or security issues

---

## 📊 **Summary**

**What to update:**
1. ✅ File name: `product-categories-optimized.html` → `product-categories.html`
2. ✅ URL: `http://localhost:4000/...` → `https://your-backend-url.com/...`
3. ✅ Keep all styling attributes

**What stays the same:**
- ✅ All styling (position: fixed, z-index, etc.)
- ✅ Height, width, and other attributes
- ✅ All other iframe attributes

**The iframe MUST point to your deployed backend URL, not localhost!**

---

**Need help finding your backend URL?** Check your deployment service (Heroku, Vercel, etc.) or ask if you need help deploying your backend.







