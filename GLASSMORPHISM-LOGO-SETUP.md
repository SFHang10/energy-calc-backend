# Glassmorphism Design with Greenways Logo - Setup Guide

## 🎨 What You Have Now

A **beautiful glassmorphism design** inspired by modern UI with:
- ✅ Translucent frosted glass effects
- ✅ Beautiful mountain/nature background
- ✅ Your grey/green/brown color scheme
- ✅ Greenways logo placeholder
- ✅ No-scroll setting for Wix
- ✅ All 15 schemes embedded

## 📁 Your File

**Location:**
```
C:\Users\steph\Documents\energy-cal-backend\product-qualification-search-GLASSMORPHISM.html
```

---

## 🏷️ How to Add Your Greenways Logo

### **Option 1: Upload to Wix and Use Wix URL (Easiest)**

1. **Upload Logo to Wix:**
   - Log into Wix Editor
   - Media → Upload
   - Upload your logo file: `greenwayslogo.jpeg.png`

2. **Get the Logo URL:**
   - Right-click on uploaded image in Wix
   - Copy image address (will be like: `https://static.wixstatic.com/media/...`)

3. **Update the HTML:**
   - Open `product-qualification-search-GLASSMORPHISM.html`
   - Find this line (around line 591):
   ```html
   <img src="https://example.com/greenways-logo.png" alt="Greenways Logo"
   ```
   
4. **Replace with your logo URL:**
   ```html
   <img src="YOUR_WIX_LOGO_URL_HERE" alt="Greenways Logo"
   ```

5. **Save and use in Wix!**

---

### **Option 2: Use Your Local Path (After Uploading)**

After uploading both files to Wix:

```html
<img src="greenwayslogo.jpeg.png" alt="Greenways Logo"
```

Make sure logo is in same folder as HTML in Wix.

---

### **Option 3: Use Base64 Embedded Logo (Most Reliable)**

Convert your logo to base64 and embed it:

1. Go to: https://www.base64-image.de/
2. Upload your logo
3. Copy the base64 string
4. Replace the img tag with:
```html
<img src="data:image/jpeg;base64,YOUR_BASE64_STRING_HERE" alt="Greenways Logo"
```

---

## 🎨 Glassmorphism Features

### **What Makes It Special:**

1. **Blurred Background**
   - Beautiful mountain landscape visible through glass
   - Dark overlay with grey/green gradient

2. **Frosted Glass Elements**
   - All cards use `backdrop-filter: blur(30px)`
   - Translucent white backgrounds
   - Everything has that "frosted glass" look

3. **Depth & Shadows**
   - Multiple shadow layers for depth
   - Inset highlights for glass effect
   - Hover states lift elements

4. **Your Logo in Glass Box**
   - Logo appears in a frosted glass container
   - Beautiful drop shadow
   - Falls back to "Greenways" text if image doesn't load

---

## ✅ What's Included

- ✅ **Glassmorphism Design** - Frosted glass aesthetic
- ✅ **Greenways Logo Area** - Ready for your logo
- ✅ **Beautiful Nature Background** - Mountain landscape
- ✅ **Grey/Green/Brown Colors** - Your custom palette
- ✅ **No-Scroll Setting** - For Wix integration
- ✅ **All 15 Schemes** - Embedded data
- ✅ **Mobile Responsive** - Works perfectly on phones

---

## 🚀 Using in Wix

### **Step 1: Add Your Logo URL**

Open the file and update line ~591 with your logo URL.

### **Step 2: Copy & Paste**

1. Open `product-qualification-search-GLASSMORPHISM.html`
2. Copy all (Ctrl+A, Ctrl+C)
3. In Wix: Add → HTML → "Embed Code"
4. Paste the code
5. Click "Update"

### **Step 3: Set Height**

In Wix HTML element settings:
- Choose "Fit to content" OR
- Set manual height: ~2500px

### **Step 4: Publish!**

---

## 🎨 Customization

### **Change Background Image**

Find this line (around line 22):
```css
background: url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e...')
```

Replace with:
```css
background: url('YOUR_IMAGE_URL');
```

Or remove `url(...)` and use solid color:
```css
background: linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #065F46 100%);
```

### **Adjust Logo Size**

Find `.logo-img` and change:
```css
.logo-img {
    max-width: 280px;  /* Change this */
    height: auto;
}
```

### **Hide Logo Section**

If you don't want logo, find and delete lines 588-596:
```html
<div class="logo-section">
    ...
</div>
```

---

## 📊 Comparison with Other Versions

| Feature | Glassmorphism | Standard Wix | Original v2 |
|---------|--------------|--------------|-------------|
| Design | Frosted Glass | Solid | Gradient |
| Background | Image + Overlay | Gradient | Gradient |
| Logo Support | ✅ Yes | ❌ No | ❌ No |
| Look | Modern/Nature | Professional | Professional |
| Best For | Showcase | Business | Business |

---

## 🎯 Which File to Use?

### **Use Glassmorphism If:**
- ✅ You want modern, beautiful design
- ✅ You want to showcase your brand
- ✅ You have a logo ready
- ✅ You want that "premium" look

### **Use Standard Wix If:**
- ✅ You prefer simpler design
- ✅ No logo needed
- ✅ Just want functionality

---

## 📝 Logo Checklist

- [ ] Upload logo to Wix Media Manager
- [ ] Copy logo URL from Wix
- [ ] Paste URL into HTML file (line ~591)
- [ ] Test on Wix
- [ ] Adjust size if needed
- [ ] Publish!

---

## 💡 Pro Tips

1. **Logo Size:** Best at 200-300px width
2. **Format:** Use PNG with transparent background for best glass effect
3. **Placement:** Logo appears at very top in a frosted glass box
4. **Fallback:** If logo doesn't load, shows "Greenways" text automatically

---

## 🎉 You're Ready!

Your glassmorphism portal is ready with:
- Modern frosted glass design
- Your logo area (just add URL!)
- Beautiful nature background
- Grey/green/brown color scheme
- No-scroll for Wix

**Just add your logo URL and paste into Wix!** 🚀








## 🎨 What You Have Now

A **beautiful glassmorphism design** inspired by modern UI with:
- ✅ Translucent frosted glass effects
- ✅ Beautiful mountain/nature background
- ✅ Your grey/green/brown color scheme
- ✅ Greenways logo placeholder
- ✅ No-scroll setting for Wix
- ✅ All 15 schemes embedded

## 📁 Your File

**Location:**
```
C:\Users\steph\Documents\energy-cal-backend\product-qualification-search-GLASSMORPHISM.html
```

---

## 🏷️ How to Add Your Greenways Logo

### **Option 1: Upload to Wix and Use Wix URL (Easiest)**

1. **Upload Logo to Wix:**
   - Log into Wix Editor
   - Media → Upload
   - Upload your logo file: `greenwayslogo.jpeg.png`

2. **Get the Logo URL:**
   - Right-click on uploaded image in Wix
   - Copy image address (will be like: `https://static.wixstatic.com/media/...`)

3. **Update the HTML:**
   - Open `product-qualification-search-GLASSMORPHISM.html`
   - Find this line (around line 591):
   ```html
   <img src="https://example.com/greenways-logo.png" alt="Greenways Logo"
   ```
   
4. **Replace with your logo URL:**
   ```html
   <img src="YOUR_WIX_LOGO_URL_HERE" alt="Greenways Logo"
   ```

5. **Save and use in Wix!**

---

### **Option 2: Use Your Local Path (After Uploading)**

After uploading both files to Wix:

```html
<img src="greenwayslogo.jpeg.png" alt="Greenways Logo"
```

Make sure logo is in same folder as HTML in Wix.

---

### **Option 3: Use Base64 Embedded Logo (Most Reliable)**

Convert your logo to base64 and embed it:

1. Go to: https://www.base64-image.de/
2. Upload your logo
3. Copy the base64 string
4. Replace the img tag with:
```html
<img src="data:image/jpeg;base64,YOUR_BASE64_STRING_HERE" alt="Greenways Logo"
```

---

## 🎨 Glassmorphism Features

### **What Makes It Special:**

1. **Blurred Background**
   - Beautiful mountain landscape visible through glass
   - Dark overlay with grey/green gradient

2. **Frosted Glass Elements**
   - All cards use `backdrop-filter: blur(30px)`
   - Translucent white backgrounds
   - Everything has that "frosted glass" look

3. **Depth & Shadows**
   - Multiple shadow layers for depth
   - Inset highlights for glass effect
   - Hover states lift elements

4. **Your Logo in Glass Box**
   - Logo appears in a frosted glass container
   - Beautiful drop shadow
   - Falls back to "Greenways" text if image doesn't load

---

## ✅ What's Included

- ✅ **Glassmorphism Design** - Frosted glass aesthetic
- ✅ **Greenways Logo Area** - Ready for your logo
- ✅ **Beautiful Nature Background** - Mountain landscape
- ✅ **Grey/Green/Brown Colors** - Your custom palette
- ✅ **No-Scroll Setting** - For Wix integration
- ✅ **All 15 Schemes** - Embedded data
- ✅ **Mobile Responsive** - Works perfectly on phones

---

## 🚀 Using in Wix

### **Step 1: Add Your Logo URL**

Open the file and update line ~591 with your logo URL.

### **Step 2: Copy & Paste**

1. Open `product-qualification-search-GLASSMORPHISM.html`
2. Copy all (Ctrl+A, Ctrl+C)
3. In Wix: Add → HTML → "Embed Code"
4. Paste the code
5. Click "Update"

### **Step 3: Set Height**

In Wix HTML element settings:
- Choose "Fit to content" OR
- Set manual height: ~2500px

### **Step 4: Publish!**

---

## 🎨 Customization

### **Change Background Image**

Find this line (around line 22):
```css
background: url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e...')
```

Replace with:
```css
background: url('YOUR_IMAGE_URL');
```

Or remove `url(...)` and use solid color:
```css
background: linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #065F46 100%);
```

### **Adjust Logo Size**

Find `.logo-img` and change:
```css
.logo-img {
    max-width: 280px;  /* Change this */
    height: auto;
}
```

### **Hide Logo Section**

If you don't want logo, find and delete lines 588-596:
```html
<div class="logo-section">
    ...
</div>
```

---

## 📊 Comparison with Other Versions

| Feature | Glassmorphism | Standard Wix | Original v2 |
|---------|--------------|--------------|-------------|
| Design | Frosted Glass | Solid | Gradient |
| Background | Image + Overlay | Gradient | Gradient |
| Logo Support | ✅ Yes | ❌ No | ❌ No |
| Look | Modern/Nature | Professional | Professional |
| Best For | Showcase | Business | Business |

---

## 🎯 Which File to Use?

### **Use Glassmorphism If:**
- ✅ You want modern, beautiful design
- ✅ You want to showcase your brand
- ✅ You have a logo ready
- ✅ You want that "premium" look

### **Use Standard Wix If:**
- ✅ You prefer simpler design
- ✅ No logo needed
- ✅ Just want functionality

---

## 📝 Logo Checklist

- [ ] Upload logo to Wix Media Manager
- [ ] Copy logo URL from Wix
- [ ] Paste URL into HTML file (line ~591)
- [ ] Test on Wix
- [ ] Adjust size if needed
- [ ] Publish!

---

## 💡 Pro Tips

1. **Logo Size:** Best at 200-300px width
2. **Format:** Use PNG with transparent background for best glass effect
3. **Placement:** Logo appears at very top in a frosted glass box
4. **Fallback:** If logo doesn't load, shows "Greenways" text automatically

---

## 🎉 You're Ready!

Your glassmorphism portal is ready with:
- Modern frosted glass design
- Your logo area (just add URL!)
- Beautiful nature background
- Grey/green/brown color scheme
- No-scroll for Wix

**Just add your logo URL and paste into Wix!** 🚀

























