# How to Add the Product Qualification Search to Your Wix Site

## 📋 Step-by-Step Wix Instructions

### Step 1: Get the HTML Code

1. Open the file: `product-qualification-search-WIX-STANDALONE.html`
2. Press `Ctrl+A` (select all)
3. Press `Ctrl+C` (copy everything)

---

### Step 2: Add to Your Wix Site

**Option A: As a New Page (Recommended)**

1. **Go to Wix Editor**
   - Log into your Wix account
   - Click "Edit Site"

2. **Add a New Page**
   - Click the "+" icon to add a new page
   - Name it "Product Grants" or "Find Grants"
   - Set as blank page

3. **Add HTML Element**
   - Click "Add" → "HTML" → "Embed Code"
   - In the HTML code box that appears, paste your copied code
   - Click "Update"

4. **Publish & Test**
   - Click "Publish"
   - Visit your new page: `https://yoursite.wixsite.com/.../product-grants`

---

**Option B: Embed in Existing Page**

1. **Open the page** where you want the search to appear

2. **Add HTML Section**
   - Click "Add" → "HTML" → "Embed Code"
   - Paste your code into the embed box
   - Adjust the height to fit (about 1500px is good)

3. **Save and Publish**

---

### Step 3: Add Navigation Link

To help people find it:

1. **Go to Site Menu**
   - Click "Site Menu" in the editor

2. **Add Menu Item**
   - Click "+ Add Page to Menu"
   - Select your new "Product Grants" page
   - Or create custom link to page

---

## 🎨 Customization Tips

### Adjust Size in Wix:
- Click the HTML box
- Drag corners to resize
- Or set exact dimensions in settings

### Match Your Brand Colors:
You can edit colors in the HTML. Find these lines and change the color codes:

```css
/* Current gradient - change these colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Your brand colors - example: */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Adjust Width:
Find this line in the CSS:
```css
.container {
    max-width: 1400px;  /* Change this to match your site */
    margin: 0 auto;
}
```

---

## ✅ What You Get

Once added, visitors can:
- ✅ Search any product (e.g., "heat pump")
- ✅ See which grants/schemes it qualifies for
- ✅ View funding amounts and deadlines
- ✅ Click direct links to apply
- ✅ Filter by scheme type
- ✅ Mobile-responsive design

---

## 📱 Mobile Compatibility

The portal automatically adjusts for mobile devices - no extra work needed!

---

## 🔄 Updating Schemes Later

To add new schemes:

1. **Download the HTML file** from Wix (or your computer)
2. **Find the `ALL_SCHEMES` array** (search for it)
3. **Add new scheme objects** to the array
4. **Update the HTML element** in Wix editor
5. **Publish**

**Example of adding a scheme:**
```javascript
{
  "id": "new-scheme",
  "title": "New Grant Name",
  "type": "subsidy",
  "categories": ["subsidy"],
  "keywords": ["keyword1", "keyword2"],
  "description": "Description here",
  "relevance": "High",
  "requirements": "Requirements here",
  "deadline": null,
  "priority": false,
  "links": [
    {"text": "Apply", "url": "https://example.com", "type": "apply"}
  ]
},
```

---

## 🐛 Troubleshooting

### Problem: Looks broken in Wix preview
**Solution:** Wix sometimes doesn't show iframes in preview mode. Publish and test on the live site.

### Problem: Not enough space
**Solution:** Adjust the HTML element height in Wix editor settings.

### Problem: Won't paste into Wix
**Solution:** Make sure you're pasting into "Embed Code" option, not "Embed Site".

### Problem: Colors don't match site
**Solution:** Edit the gradient colors in the CSS section (lines 15-17).

---

## 💡 Pro Tips

1. **Test First:** Publish to a draft and check on a real device
2. **Link from Homepage:** Add a button pointing to your grants page
3. **SEO:** Add a page description in Wix SEO settings
4. **Analytics:** Track how many people use the search with Wix Analytics

---

## 🎉 You're Live!

Once published, your Product Qualification Search is live on your Wix site!

**URL will be:**
`https://yoursite.com/product-grants`

Or custom:
`https://yoursite.com/find-grants-for-products`








## 📋 Step-by-Step Wix Instructions

### Step 1: Get the HTML Code

1. Open the file: `product-qualification-search-WIX-STANDALONE.html`
2. Press `Ctrl+A` (select all)
3. Press `Ctrl+C` (copy everything)

---

### Step 2: Add to Your Wix Site

**Option A: As a New Page (Recommended)**

1. **Go to Wix Editor**
   - Log into your Wix account
   - Click "Edit Site"

2. **Add a New Page**
   - Click the "+" icon to add a new page
   - Name it "Product Grants" or "Find Grants"
   - Set as blank page

3. **Add HTML Element**
   - Click "Add" → "HTML" → "Embed Code"
   - In the HTML code box that appears, paste your copied code
   - Click "Update"

4. **Publish & Test**
   - Click "Publish"
   - Visit your new page: `https://yoursite.wixsite.com/.../product-grants`

---

**Option B: Embed in Existing Page**

1. **Open the page** where you want the search to appear

2. **Add HTML Section**
   - Click "Add" → "HTML" → "Embed Code"
   - Paste your code into the embed box
   - Adjust the height to fit (about 1500px is good)

3. **Save and Publish**

---

### Step 3: Add Navigation Link

To help people find it:

1. **Go to Site Menu**
   - Click "Site Menu" in the editor

2. **Add Menu Item**
   - Click "+ Add Page to Menu"
   - Select your new "Product Grants" page
   - Or create custom link to page

---

## 🎨 Customization Tips

### Adjust Size in Wix:
- Click the HTML box
- Drag corners to resize
- Or set exact dimensions in settings

### Match Your Brand Colors:
You can edit colors in the HTML. Find these lines and change the color codes:

```css
/* Current gradient - change these colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Your brand colors - example: */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Adjust Width:
Find this line in the CSS:
```css
.container {
    max-width: 1400px;  /* Change this to match your site */
    margin: 0 auto;
}
```

---

## ✅ What You Get

Once added, visitors can:
- ✅ Search any product (e.g., "heat pump")
- ✅ See which grants/schemes it qualifies for
- ✅ View funding amounts and deadlines
- ✅ Click direct links to apply
- ✅ Filter by scheme type
- ✅ Mobile-responsive design

---

## 📱 Mobile Compatibility

The portal automatically adjusts for mobile devices - no extra work needed!

---

## 🔄 Updating Schemes Later

To add new schemes:

1. **Download the HTML file** from Wix (or your computer)
2. **Find the `ALL_SCHEMES` array** (search for it)
3. **Add new scheme objects** to the array
4. **Update the HTML element** in Wix editor
5. **Publish**

**Example of adding a scheme:**
```javascript
{
  "id": "new-scheme",
  "title": "New Grant Name",
  "type": "subsidy",
  "categories": ["subsidy"],
  "keywords": ["keyword1", "keyword2"],
  "description": "Description here",
  "relevance": "High",
  "requirements": "Requirements here",
  "deadline": null,
  "priority": false,
  "links": [
    {"text": "Apply", "url": "https://example.com", "type": "apply"}
  ]
},
```

---

## 🐛 Troubleshooting

### Problem: Looks broken in Wix preview
**Solution:** Wix sometimes doesn't show iframes in preview mode. Publish and test on the live site.

### Problem: Not enough space
**Solution:** Adjust the HTML element height in Wix editor settings.

### Problem: Won't paste into Wix
**Solution:** Make sure you're pasting into "Embed Code" option, not "Embed Site".

### Problem: Colors don't match site
**Solution:** Edit the gradient colors in the CSS section (lines 15-17).

---

## 💡 Pro Tips

1. **Test First:** Publish to a draft and check on a real device
2. **Link from Homepage:** Add a button pointing to your grants page
3. **SEO:** Add a page description in Wix SEO settings
4. **Analytics:** Track how many people use the search with Wix Analytics

---

## 🎉 You're Live!

Once published, your Product Qualification Search is live on your Wix site!

**URL will be:**
`https://yoursite.com/product-grants`

Or custom:
`https://yoursite.com/find-grants-for-products`

























