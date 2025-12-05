# 🔄 Updated Iframe Code for Wix

## ✅ What You Need to Change

**Current (OLD):**
- ❌ `product-categories-optimized.html` (old version)

**New (CORRECT):**
- ✅ `product-categories.html` (updated version)

---

## 📋 Updated Iframe Code

### **Replace This:**
```html
<iframe
    src="YOUR-BACKEND-URL/product-categories-optimized.html"
    ...
</iframe>
```

### **With This:**
```html
<iframe
    src="YOUR-BACKEND-URL/product-categories.html"
    ...
</iframe>
```

---

## 🎯 Complete Updated Iframe Code

**Replace `YOUR-BACKEND-URL` with your actual backend URL:**

```html
<iframe
    src="https://YOUR-BACKEND-URL/product-categories.html"
    width="100%"
    height="2500px"
    frameborder="0"
    style="border: none; display: block; position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 1000; margin: 0; padding: 0;"
    allowfullscreen
    loading="lazy"
    scrolling="no">
</iframe>
```

---

## 🔍 How to Find YOUR-BACKEND-URL

### **Method 1: Check Network Tab**
1. Open your Wix site
2. Press **F12** (DevTools)
3. Click **Network** tab
4. Look for the request to `product-categories-optimized.html`
5. **The domain in that URL is your backend URL!**

Example:
- If you see: `https://energy-calc-backend.herokuapp.com/product-categories-optimized.html`
- Your backend URL is: `https://energy-calc-backend.herokuapp.com`

### **Method 2: Check Wix Editor**
1. Open Wix Editor
2. Find the iframe element
3. Check the `src` attribute
4. Copy the domain (everything before `/product-categories-optimized.html`)

---

## ✅ What Changed

| Old | New |
|-----|-----|
| `product-categories-optimized.html` | `product-categories.html` |

**That's it!** Just change the filename from `product-categories-optimized.html` to `product-categories.html`.

---

## 🎉 After Updating

Once you update the iframe:
- ✅ New design will appear
- ✅ Category filtering will work correctly
- ✅ HVAC products will show in correct category
- ✅ Product links will work correctly

---

**Need help finding your backend URL? Check the Network tab in DevTools!** 🚀






