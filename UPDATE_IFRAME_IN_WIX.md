# 🔄 How to Update the Iframe in Wix Editor

**Date:** November 2, 2025  
**Status:** ✅ **READY TO UPDATE**

---

## ⚠️ Yes, the Iframe Needs to be Updated!

The `product-categories.html` file has been updated on your backend, but **Wix is still showing the old version** because the iframe URL in Wix Editor hasn't been changed yet.

---

## 🎯 What You Need to Do

### **Step 1: Find Your Backend URL**

Your backend server needs to be accessible on the internet. The iframe in Wix needs to point to your **deployed backend URL**, not localhost.

**What is your backend deployment URL?**
- Is your backend deployed on Heroku, Vercel, Netlify, or another service?
- Do you have a production URL like `https://energy-calculator.herokuapp.com` or similar?

**If you don't have a deployed backend yet:**
- You'll need to deploy your backend first
- Or use a service like ngrok to expose localhost temporarily

---

### **Step 2: Update the Iframe in Wix Editor**

1. **Log into Wix:**
   - Go to https://www.wix.com/
   - Log into your account
   - Open your site: **Greenways Market**

2. **Open the Page Editor:**
   - Navigate to the page where the categories are displayed
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
   - **Current URL might be:** 
     - `http://localhost:4000/product-categories.html` (won't work on live site)
     - `product-categories-TEST.html` (old test version)
   
   - **New URL should be:**
     ```
     https://your-backend-url.com/product-categories.html
     ```
   
   - **Replace `your-backend-url.com` with your actual backend URL**
   
   - **Examples:**
     - `https://energy-calculator.herokuapp.com/product-categories.html`
     - `https://api.greenwaysmarket.com/product-categories.html`
     - `https://backend.yoursite.com/product-categories.html`

7. **Save and Publish:**
   - Click **Save** or **Apply**
   - Click **Publish** in Wix Editor
   - Visit your live site: https://www.greenwaysmarket.com/

---

## 🔍 How to Find the Iframe in Wix Editor

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

## 📋 Iframe Code Reference

### **Current (Old) Code:**
```html
<iframe
  src="http://localhost:4000/product-categories.html"
  width="100%"
  height="1200px"
  frameborder="0">
</iframe>
```

### **New (Updated) Code:**
```html
<iframe
  src="https://your-backend-url.com/product-categories.html"
  width="100%"
  height="1200px"
  frameborder="0"
  scrolling="auto"
  style="border: none;">
</iframe>
```

---

## ⚠️ Important Notes

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

## 🚀 What to Update

### **Iframe URL Should Point To:**
```
https://your-backend-url.com/product-categories.html
```

### **What's Included in the Updated File:**
- ✅ New design from TEST version
- ✅ Fixed category filtering
- ✅ Each category has its own image
- ✅ Links correctly to `product-page-v2.html`
- ✅ Improved visual layout

---

## ✅ After Updating

Once you update the iframe URL and publish:

1. **Visit your live site:** https://www.greenwaysmarket.com/
2. **Navigate to the categories page**
3. **Verify:**
   - ✅ New design appears (modern cards with images)
   - ✅ Each category has its own image (Heat Pumps, Motor Drives, HVAC Equipment)
   - ✅ Clicking categories filters correctly
   - ✅ Products link to `product-page-v2.html`

---

## 🔧 Troubleshooting

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

## 📝 Summary

**What to do:**
1. ✅ Find your deployed backend URL
2. ✅ Open Wix Editor
3. ✅ Find the iframe element
4. ✅ Update URL to: `https://your-backend-url.com/product-categories.html`
5. ✅ Save and Publish
6. ✅ Test on live site

**The iframe MUST point to your deployed backend URL, not localhost!**

---

**Need help finding your backend URL?** Check your deployment service (Heroku, Vercel, etc.) or ask if you need help deploying your backend.







