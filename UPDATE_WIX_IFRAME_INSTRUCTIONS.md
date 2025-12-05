# 🔄 How to Update the Categories Page Iframe in Wix

## ✅ Yes, You Need to Update the Iframe!

The categories page (`product-categories.html`) has been updated with:
- ✅ New design from TEST version
- ✅ Fixed category filtering
- ✅ Each category has its own image
- ✅ Links correctly to `product-page-v2.html`

**But the Wix site won't show changes until you update the iframe URL!**

---

## 📋 Step-by-Step: Update Iframe in Wix

### **Step 1: Open Wix Editor**
1. Log into your Wix account
2. Go to your site editor
3. Find the page where the categories are displayed (likely an iframe element)

### **Step 2: Find the Iframe Element**
1. Click on the area where the categories page is displayed
2. Look for an **HTML iframe element** or **Embedded HTML** element
3. Click on it to select it

### **Step 3: Check Current Iframe URL**
1. Click on the iframe/embed element
2. Look for the **URL** or **src** field in the settings
3. It might look like:
   - `http://localhost:4000/product-categories.html`
   - `http://localhost:4000/product-categories-TEST.html`
   - `https://your-backend-url.com/product-categories.html`
   - `https://your-backend-url.com/product-categories-TEST.html`

### **Step 4: Update to Correct File**
**The correct URL should be:**

**For Local Development:**
```
http://localhost:4000/product-categories.html
```

**For Production/Deployed Backend:**
```
https://your-backend-url.com/product-categories.html
```

**Example Production URLs:**
- `https://energy-calculator.herokuapp.com/product-categories.html`
- `https://api.yoursite.com/product-categories.html`
- `https://backend.greenwaysmarket.com/product-categories.html`

**Important:** Replace `your-backend-url.com` with your actual deployed backend URL!

### **Step 5: Update in Wix**
1. Click on the iframe element
2. Open the settings/configuration panel
3. Find the **URL** or **src** field
4. Update it to: `product-categories.html` (or full URL if needed)
5. Click **Apply** or **Update**

### **Step 6: Publish**
1. Click **Publish** in Wix
2. Visit your live site
3. The updated categories page should now appear!

---

## 🎯 Which File Should the Iframe Point To?

Based on your current files:

| File | Status | Use For |
|------|--------|---------|
| `product-categories.html` | ✅ **Updated Today** | **Use this for Wix iframe** |
| `product-categories-TEST.html` | ✅ Updated Today | Test/local development |
| `product-categories-optimized.html` | ⚠️ Old (Oct 22) | Old version |

**👉 Use `product-categories.html` for the Wix iframe!**

---

## 🔍 How to Find the Iframe Element in Wix

If you can't find it:

1. **Look for HTML/Embed element:**
   - In Wix Editor, look for elements that say "HTML" or "Embed Code"
   - Categories page is embedded, not a regular page element

2. **Check Page Settings:**
   - Right-click on the page area where categories appear
   - Look for "Element Settings" or "Embed Settings"

3. **Check Side Panel:**
   - Click anywhere on the categories area
   - Check the right-side settings panel
   - Look for URL/iframe settings

---

## 📡 Backend URL Configuration

### **If Using Local Development:**
```
http://localhost:4000/product-categories.html
```

**⚠️ Note:** Localhost won't work on the live Wix site! You need a deployed backend.

### **If Using Deployed Backend:**
```
https://your-backend-url.com/product-categories.html
```

**Examples:**
- `https://energy-calculator.herokuapp.com/product-categories.html`
- `https://api.yoursite.com/product-categories.html`
- `https://backend.greenwaysmarket.com/product-categories.html`

---

## ✅ After Updating

Once you update the iframe URL and publish:

1. **Clear Browser Cache:**
   - Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Or use incognito/private mode

2. **Test on Live Site:**
   - Visit your Wix site
   - Navigate to the categories page
   - Verify:
     - ✅ New design appears
     - ✅ Each category has its own image
     - ✅ Clicking categories filters correctly
     - ✅ Products link to `product-page-v2.html`

3. **If Still Not Updated:**
   - Wix might cache the iframe content
   - Wait 5-10 minutes and try again
   - Or clear Wix cache (if available in settings)

---

## 🚨 Common Issues

### **Issue: "Iframe not found"**
- The iframe might be embedded differently
- Check if categories are in a "Custom HTML" element
- Or check page settings for embedded content

### **Issue: "Still shows old version"**
- Clear browser cache (`Ctrl+F5`)
- Wait a few minutes for Wix cache to clear
- Check that you published the changes

### **Issue: "Localhost doesn't work on live site"**
- You **must** deploy your backend to a public URL
- Localhost only works on your local machine
- Deploy backend to Heroku, Vercel, or similar service

---

## 📝 Summary

**What Changed:**
- ✅ `product-categories.html` - Updated with new design
- ✅ Category filtering fixed
- ✅ Each category has unique images
- ✅ Links to V2 product page correctly

**What You Need to Do:**
1. ✅ Find iframe element in Wix
2. ✅ Update URL to `product-categories.html`
3. ✅ Publish changes
4. ✅ Test on live site

---

## 🎉 Done!

Once updated, your live Wix site will show:
- ✅ Beautiful new categories page
- ✅ Proper category filtering
- ✅ Unique images per category
- ✅ Working links to product pages


