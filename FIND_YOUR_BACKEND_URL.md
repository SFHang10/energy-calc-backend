# 🔍 How to Find Your Production Backend URL

## ✅ What We Know

You have:
- **Wix Site:** `greenways-market`
- **Wix Site ID:** `cfa82ec2-a075-4152-9799-6a1dd5c01ef4`
- **Backend:** Definitely deployed (you confirmed)

---

## 🎯 Quick Method: Check Your Wix Site

### **Step 1: Open Your Wix Site**
1. Visit your Wix site: `https://greenways-market.wixsite.com` (or your custom domain)
2. Navigate to a product page or the categories page

### **Step 2: Check Network Tab**
1. Open browser DevTools: Press **F12**
2. Click **Network** tab
3. Refresh the page (F5)
4. Look for API calls or fetch requests

### **Step 3: Find the Backend URL**
Look for requests to:
- `/api/products`
- `/api/product-widget/`
- `/product-categories.html`
- `/category-product-page.html`

**The domain in these requests is your production backend URL!**

Example:
- If you see: `https://energy-calc-backend.herokuapp.com/api/products`
- Your backend URL is: `https://energy-calc-backend.herokuapp.com`

---

## 🔍 Alternative Methods

### **Method 1: Check Your Wix Editor**
1. Open Wix Editor
2. Find the iframe element (the categories page)
3. Check the iframe `src` attribute
4. That's your backend URL (minus the file path)

### **Method 2: Check Your Browser**
1. **Check Bookmarks:**
   - Look for any backend/admin URLs
   - Check for Heroku, Railway, Vercel, Render URLs

2. **Check Browser History:**
   - Search for "heroku", "railway", "vercel", "render"
   - Look for backend URLs you've visited

3. **Check Saved Passwords:**
   - Your browser might have saved login URLs for deployment platforms

### **Method 3: Check Deployment Platforms**

#### **Railway:**
1. Go to: https://railway.app
2. Log in
3. Check your projects
4. Look for the URL in the project settings

#### **Heroku:**
1. Go to: https://heroku.com
2. Log in
3. Check your apps
4. Look for the URL in the app settings

#### **Vercel:**
1. Go to: https://vercel.com
2. Log in
3. Check your projects
4. Look for the URL in the project settings

#### **Render:**
1. Go to: https://render.com
2. Log in
3. Check your services
4. Look for the URL in the service settings

---

## 📋 Once You Find the URL

Once you have your production backend URL, update the iframe in Wix:

```html
<iframe
    src="https://YOUR-PRODUCTION-URL/product-categories.html"
    width="100%"
    height="2500px"
    frameborder="0"
    style="border: none; display: block; position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 1000; margin: 0; padding: 0;"
    allowfullscreen
    loading="lazy"
    scrolling="no">
</iframe>
```

**Replace `YOUR-PRODUCTION-URL` with your actual backend URL.**

---

## 🎯 Quick Test

If you think you know the URL, test it:

1. **Test the categories page:**
   ```
   https://YOUR-URL/product-categories.html
   ```

2. **Test the API:**
   ```
   https://YOUR-URL/api/products
   ```

3. **Test a product:**
   ```
   https://YOUR-URL/product-page-v2.html?product=etl_7_86302
   ```

If these work, you've found your production URL!

---

## 💡 Common Patterns

Your backend URL might look like:
- `https://energy-calc-backend.herokuapp.com`
- `https://energy-calc-backend.railway.app`
- `https://energy-calc-backend.vercel.app`
- `https://energy-calc-backend.onrender.com`
- `https://api.greenwaysmarket.com`
- `https://backend.greenwaysmarket.com`

---

**Try the Network tab method first - it's the fastest way to find it!** 🚀






