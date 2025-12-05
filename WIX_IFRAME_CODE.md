# 📋 Updated Iframe Code for Wix

## ✅ New Categories Page Iframe

### **Option 1: Iframe HTML Code (Recommended)**

Paste this into your Wix Editor HTML/Embed element:

```html
<iframe 
  src="http://localhost:4000/product-categories.html" 
  width="100%" 
  height="1200px"
  frameborder="0"
  scrolling="auto"
  style="border: none;">
</iframe>
```

---

### **Option 2: For Deployed Backend**

If your backend is deployed (e.g., Heroku, Vercel, Railway), use:

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

**Replace `your-backend-url.com` with your actual deployed backend URL**

---

## 📝 How to Update in Wix

### **Method 1: HTML Embed Element**

1. **Open Wix Editor**
   - Log into your Wix account
   - Go to "Edit Site"
   - Navigate to the page with the categories iframe

2. **Find the Iframe Element**
   - Look for "HTML" or "Embed Code" element
   - Click on it to select

3. **Update the Code**
   - Open the HTML/Code editor
   - Find the `<iframe>` tag
   - Update the `src` attribute to: `http://localhost:4000/product-categories.html`
   - Or if deployed: `https://your-backend-url.com/product-categories.html`
   - Click "Update"

4. **Publish**
   - Click "Publish" in Wix
   - Changes will appear on live site

---

### **Method 2: Replace Entire Iframe Element**

If you can't find the existing iframe, you can replace it:

1. **Remove old iframe element**
2. **Add new HTML element**
   - Click "Add" → "HTML" → "Embed Code"
   - Paste the iframe code above
   - Click "Update"
3. **Publish**

---

## 🎯 URL Configuration

### **For Local Development (Testing Only)**

```
http://localhost:4000/product-categories.html
```

⚠️ **Note:** This only works on your local machine. Won't work on live Wix site!

### **For Live Wix Site (Deployed Backend Required)**

You **MUST** deploy your backend to a public URL. Options:

- **Heroku**: `https://your-app.herokuapp.com/product-categories.html`
- **Vercel**: `https://your-app.vercel.app/product-categories.html`
- **Railway**: `https://your-app.railway.app/product-categories.html`
- **Your own domain**: `https://api.yoursite.com/product-categories.html`

---

## ✅ What Changed

The new `product-categories.html` includes:

- ✅ **New design** from TEST version
- ✅ **Fixed category filtering** (each category now works correctly)
- ✅ **Unique images** per category
- ✅ **Correct links** to `product-page-v2.html`

---

## 🔧 Iframe Attributes Explained

```html
<iframe 
  src="..."                    <!-- URL to your categories page -->
  width="100%"                 <!-- Full width of container -->
  height="1200px"              <!-- Height (adjust as needed) -->
  frameborder="0"             <!-- No border -->
  scrolling="auto"            <!-- Enable scrolling if needed -->
  style="border: none;">      <!-- No visual border -->
</iframe>
```

**Adjust height as needed:**
- `1000px` - Smaller, more compact
- `1200px` - Standard (recommended)
- `1500px` - Taller, shows more content
- `100vh` - Full viewport height

---

## 🚨 Important Notes

### **1. Backend Must Be Running**
- If using localhost: Backend must be running on port 4000
- If deployed: Backend must be live and accessible

### **2. CORS Configuration**
- Your `server.js` already has CORS enabled ✅
- No additional configuration needed

### **3. File Location**
- File must be: `product-categories.html` (not TEST or optimized)
- Located in: `energy-cal-backend/` directory
- Served by Express static middleware ✅

---

## ✅ Verification

After updating:

1. **Publish in Wix**
2. **Visit your live site**
3. **Check that:**
   - ✅ New categories page design appears
   - ✅ Each category has its own image
   - ✅ Clicking categories filters correctly
   - ✅ Products link to `product-page-v2.html`

---

## 🎉 Done!

Your categories page is now updated and ready! Just update the iframe URL in Wix and publish.








