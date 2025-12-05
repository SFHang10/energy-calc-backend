# 📋 Iframe Code for Wix - Copy & Paste Ready

## 🎯 Quick Copy-Paste Code

### **For Production (Live Site):**

**⚠️ IMPORTANT:** Replace `your-backend-url.com` with your actual deployed backend URL!

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

---

### **For Local Development (Testing Only):**

```html
<iframe
    src="http://localhost:4000/product-categories.html"
    width="100%"
    height="2500px"
    frameborder="0"
    style="border: none; display: block; position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 1000; margin: 0; padding: 0;"
    allowfullscreen
    loading="lazy"
    scrolling="no">
</iframe>
```

**⚠️ Note:** Localhost only works on your local machine. For the live Wix site, you MUST use the production URL above.

---

## 📝 How to Use in Wix Editor

### **Option 1: Using HTML Embed Element**

1. **Open Wix Editor**
2. **Add HTML Element:**
   - Click **Add** → **Embed** → **HTML Code**
   - Or drag **HTML Code** element onto your page
3. **Paste the Code:**
   - Click on the HTML element
   - Paste the iframe code above (replace `your-backend-url.com`)
   - Click **Apply**
4. **Publish:**
   - Click **Publish** in Wix
   - Visit your live site to verify

### **Option 2: If Iframe Already Exists**

1. **Find the Existing Iframe:**
   - Click on the categories display area
   - Look for an **HTML** or **Embed** element
   - Click on it to select it
2. **Update the URL:**
   - In the settings panel, find the **URL** or **src** field
   - Replace with: `https://your-backend-url.com/product-categories.html`
   - Click **Apply**
3. **Publish:**
   - Click **Publish** in Wix
   - Visit your live site to verify

---

## 🔍 Examples of Backend URLs

Replace `your-backend-url.com` with one of these patterns:

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
https://backend.greenwaysmarket.com/product-categories.html
```

---

## ✅ Complete Example (Ready to Use)

If your backend is at `https://energy-calculator.herokuapp.com`, use:

```html
<iframe
    src="https://energy-calculator.herokuapp.com/product-categories.html"
    width="100%"
    height="2500px"
    frameborder="0"
    style="border: none; display: block; position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 1000; margin: 0; padding: 0;"
    allowfullscreen
    loading="lazy"
    scrolling="no">
</iframe>
```

**Just replace `energy-calculator.herokuapp.com` with your actual backend URL!**

---

## 🎨 Iframe Attributes Explained

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `src` | `https://your-backend-url.com/product-categories.html` | URL to the categories page |
| `width` | `100%` | Full width of container |
| `height` | `2500px` | Height of iframe (adjust if needed) |
| `frameborder` | `0` | Remove border |
| `style` | `border: none; ...` | Full-screen styling |
| `allowfullscreen` | - | Allow fullscreen mode |
| `loading` | `lazy` | Load when needed |
| `scrolling` | `no` | No scrollbar (content scrolls inside) |

---

## ⚠️ Important Notes

1. **Use Production URL:**
   - ✅ `https://your-backend-url.com/product-categories.html`
   - ❌ `http://localhost:4000/product-categories.html` (won't work on live site)

2. **Replace Placeholder:**
   - ✅ Replace `your-backend-url.com` with your actual backend URL
   - ❌ Don't use the placeholder literally

3. **File Name:**
   - ✅ Use `product-categories.html` (the updated file)
   - ❌ Don't use `product-categories-TEST.html` or `product-categories-optimized.html`

4. **After Publishing:**
   - Clear browser cache (`Ctrl+F5` or `Cmd+Shift+R`)
   - Wait 5-10 minutes for Wix cache to clear
   - Test on live site, not just preview

---

## 🚀 After Pasting

Once you've pasted the iframe code and published:

1. **Test on Live Site:**
   - Visit your Wix site
   - Navigate to the categories page
   - Verify the new design appears

2. **Verify Functionality:**
   - ✅ Categories display correctly
   - ✅ Category images show (Heat Pumps, Motor Drives, HVAC Equipment)
   - ✅ Clicking categories filters products correctly
   - ✅ Products link to product pages correctly

3. **If Issues:**
   - Clear browser cache
   - Wait 5-10 minutes for cache to clear
   - Verify backend is accessible at the URL
   - Test the URL directly in browser: `https://your-backend-url.com/product-categories.html`

---

## 📋 Quick Checklist

- [ ] Copy the production iframe code above
- [ ] Replace `your-backend-url.com` with your actual backend URL
- [ ] Paste into Wix HTML/Embed element
- [ ] Click **Apply** and **Publish**
- [ ] Test on live site
- [ ] Clear browser cache if needed

---

**Ready to copy and paste! Just replace `your-backend-url.com` with your actual backend URL! 🎉**






