# 🖼️ Product Image Finder & Manager

**Skill Type:** Media Research & Asset Management  
**Frequency:** As Needed (when adding products)  
**Output:** Product images saved to `Skills/Product Images Folder/`  
**Purpose:** Find and manage high-quality images for products without existing photos

---

## 📋 Overview

This skill helps find quality product images for items being added to the Wix store that don't have existing photos. It searches manufacturer websites, official sources, and image databases to find appropriate images, then manages the upload process to Wix.

---

## 🎯 When to Use This Skill

Use this skill when:
- ✅ Adding a new product to the Wix store with no image
- ✅ Existing product image is low quality or blurry
- ✅ Product listing was imported without media
- ✅ Need multiple angle/view images for a product
- ✅ Updating old product images to better quality

---

## 📂 Storage Location

All found images should be saved to:
```
C:\Users\steph\Documents\energy-cal-backend\Skills\Product Images Folder\
```

### Naming Convention
```
[product-name]-[view].jpg

Examples:
- baxi-auriga-hp-20t-front.jpg
- philips-led-bulb-e27-main.jpg
- samsung-heat-pump-side.png
```

---

## 🔍 Step 1: Search for Product Images

### 1.1 Primary Sources (Check First)

#### Manufacturer Websites
```
[Product Name] [Manufacturer] official
[Product Model] site:[manufacturer-website.com]
[Product Name] product image official
```

#### ETL Image Database
```
https://img.etl.energysecurity.gov.uk/200x/[product-id]
```
- ETL products often have official images in the government database
- Reference: `wix_product_images_guide.html` for existing ETL image URLs

#### Official Distributor Sites
```
[Product Name] distributor UK
[Product Model] wholesale supplier image
```

### 1.2 Secondary Sources

#### Stock Image Search
```
site:unsplash.com [product type] energy efficient
site:pexels.com [product category] commercial
site:pixabay.com [equipment type] industrial
```

#### Google Images (Use Filters)
```
[Product Name] -stock -watermark
[Product Model] high resolution
[Product Type] product photo transparent background
```

**Important Filters:**
- Size: Large
- Usage rights: Creative Commons or labeled for reuse
- Type: Photo (not clip art)

### 1.3 Category-Specific Searches

#### Heat Pumps
```
[Brand] heat pump product image
air source heat pump [model] front view
ground source heat pump unit photo
```

#### LED Lighting
```
[Brand] LED bulb [wattage] product photo
LED panel light [dimensions] image
commercial LED lighting fixture [model]
```

#### HVAC Equipment
```
[Brand] air conditioning unit product image
ventilation system [model] photo
commercial HVAC [brand] [model]
```

#### Boilers & Heating
```
[Brand] condensing boiler image
commercial boiler [kW] product photo
economiser heat recovery [brand]
```

#### Refrigeration
```
commercial refrigerator [brand] image
display cabinet [model] product photo
refrigeration unit [brand] front view
```

#### Solar Equipment
```
solar panel [brand] [model] product image
solar PV system installation photo
inverter [brand] [model] image
```

---

## ✅ Step 2: Quality Assessment

### Image Quality Checklist

Before downloading, verify the image meets these criteria:

#### Resolution Requirements ✅
| Use Case | Minimum Size | Recommended |
|----------|--------------|-------------|
| Wix Product Thumbnail | 300x300 px | 500x500 px |
| Product Main Image | 800x800 px | 1200x1200 px |
| Hero/Banner Image | 1200x600 px | 1920x800 px |
| HTML Page Display | 400x400 px | 800x600 px |

#### Quality Indicators ✅
- [ ] **Sharp & Clear**: No blur, pixelation, or compression artifacts
- [ ] **Good Lighting**: Product clearly visible, not too dark/bright
- [ ] **Clean Background**: Preferably white/transparent or professional
- [ ] **True Colors**: Accurate product color representation
- [ ] **No Watermarks**: Free from stock photo watermarks
- [ ] **Correct Aspect**: Not stretched or distorted

#### ❌ Avoid These
- Low resolution images (<500px)
- Images with visible watermarks
- Cropped or partial product views
- Screenshots from websites
- Images with text overlays
- Heavily edited or filtered photos

---

## 📥 Step 3: Download & Save

### 3.1 Download Process

1. **Right-click** the image
2. Select **"Save image as..."**
3. Navigate to `Skills/Product Images Folder/`
4. Rename using the naming convention
5. Save as `.jpg` (photos) or `.png` (diagrams/transparent)

### 3.2 Image Processing (If Needed)

If the image needs adjustment:

```
Common adjustments:
- Crop to remove excess background
- Resize to optimal dimensions
- Convert format if needed
- Compress if file size >2MB
```

**Free Online Tools:**
- **Remove Background**: remove.bg
- **Resize/Compress**: squoosh.app, tinypng.com
- **Edit/Crop**: photopea.com (free Photoshop alternative)

### 3.3 Create Image Log

Track downloaded images in a log:

```markdown
## Product Image Log - [DATE]

| Product Name | Image File | Source | Resolution | Status |
|--------------|------------|--------|------------|--------|
| Baxi Auriga HP 20T | baxi-auriga-hp-20t-main.jpg | ETL Database | 800x600 | ✅ Ready |
| Philips LED Master | philips-led-master.png | Manufacturer | 1000x1000 | ✅ Ready |
| Generic Heat Pump | generic-heat-pump.jpg | Unsplash | 1200x800 | ⚠️ Generic |
```

---

## 🌐 Step 4: Upload to Wix

### Critical Wix Image Process

⚠️ **IMPORTANT**: Local images cannot display on Wix. They must be uploaded to Wix Media Manager first.

### 4.1 Upload to Wix Media Manager

1. Go to **Wix Dashboard** → **Media Manager**
2. Click **Upload Media**
3. Select images from `Skills/Product Images Folder/`
4. Wait for upload to complete
5. **Copy the Wix Static URL** for each image

### 4.2 Get Wix Static URLs

After upload, each image gets a unique URL format:
```
https://static.wixstatic.com/media/[account-id]_[file-hash]~mv2.[extension]

Example:
https://static.wixstatic.com/media/c123de_75b38bf573be48fd9ce5a3432acaec88~mv2.png
```

### 4.3 Document Uploaded URLs

Create a URL mapping for reference:

```markdown
## Wix Image URLs - [DATE]

| Product/Image | Local File | Wix Static URL |
|---------------|------------|----------------|
| Baxi HP 20T | baxi-auriga-hp-20t-main.jpg | https://static.wixstatic.com/media/c123de_... |
| Philips LED | philips-led-master.png | https://static.wixstatic.com/media/c123de_... |
```

### 4.4 Apply to Products

**For Wix Store Products:**
1. Go to **Store** → **Products**
2. Find the product
3. Click **Edit**
4. Add the uploaded image from Media Manager
5. Save

**For HTML Pages:**
Use the Wix static URL in image tags:
```html
<img src="https://static.wixstatic.com/media/c123de_xxxxx~mv2.png" alt="Product Name">
```

---

## 📚 Lessons Learned (From Experience)

### ⚠️ Common Issues & Solutions

#### 1. Blurry Images in HTML

**Problem:** Images appear blurry when displayed on the website.

**Causes:**
- Using `object-fit: cover` (stretches images)
- Fixed height constraints forcing scaling
- Low resolution source images
- Browser scaling up small images

**Solutions:**
```css
/* GOOD - Preserves image quality */
img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
    image-rendering: crisp-edges;
    image-rendering: -webkit-optimize-contrast;
}

/* AVOID - Causes blur */
img {
    width: 100%;
    height: 250px;  /* Fixed height forces scaling */
    object-fit: cover;  /* Stretches/crops image */
}
```

**Key CSS Properties for Sharp Images:**
```css
image-rendering: -webkit-optimize-contrast;
image-rendering: crisp-edges;
object-fit: contain;  /* Never stretches */
object-fit: scale-down;  /* Never scales up */
```

#### 2. Images Not Displaying on Wix

**Problem:** Images work locally but not on Wix site.

**Cause:** Using local file paths instead of Wix URLs.

**Solution:** Always upload to Wix Media Manager first, then use the `static.wixstatic.com` URL.

❌ **Wrong:**
```html
<img src="./images/product.jpg">
<img src="C:\Users\...\product.jpg">
```

✅ **Correct:**
```html
<img src="https://static.wixstatic.com/media/c123de_xxxxx~mv2.jpg">
```

#### 3. Iframe Content Cut Off

**Problem:** HTML embedded in Wix iframe gets truncated.

**Solutions:**
- Set large iframe height (4000px+)
- Add `scrolling="yes"` to iframe
- Remove `position: sticky` from elements
- Add this CSS to HTML:
```css
html, body {
    overflow-y: auto !important;
    height: auto;
}
```

#### 4. Wrong Image Dimensions

**Problem:** Images don't fit the layout properly.

**Solution:** Use `max-width` and `max-height` instead of fixed dimensions:
```css
.product-image {
    max-width: 100%;
    max-height: 400px;
    width: auto;
    height: auto;
}
```

#### 5. Product Links Not Working (Modal vs Direct Link)

**Problem:** Product modal/search didn't link to actual products.

**Cause:** Using search parameters instead of direct product IDs.

**Solution:** Use direct product URLs with specific product IDs:

❌ **Wrong (Search/Modal approach):**
```javascript
// Opens generic search - doesn't show specific product
const searchUrl = `${BASE}?search=${productName}`;
```

✅ **Correct (Direct Product Link):**
```javascript
// Opens specific product page directly
const productUrl = `${BASE}?product=etl_8_83032&fromPopup=true`;
window.open(productUrl, '_blank');
```

**Key Lesson:** Always use the actual product ID (e.g., `etl_8_83032`) from the ETL database, not product names or search terms.

---

## 🔄 Step 5: Fallback Options

When you can't find the exact product image:

### 5.1 Use Generic Category Images

Search for generic but appropriate images:
```
heat pump unit white background
LED bulb product photo stock
commercial air conditioning unit
boiler heating system product
```

**Good sources for generic:**
- Unsplash (free, high quality)
- Pexels (free commercial use)
- Pixabay (free, various quality)

### 5.2 Create Placeholder

If no suitable image exists, create a placeholder:
```
[PRODUCT NAME]
[CATEGORY]
Image Coming Soon
```

### 5.3 Request from Manufacturer

Contact manufacturer directly:
```
Subject: Product Image Request - [Product Model]

We would like to feature [Product Name] on our sustainable products platform.
Could you provide a high-resolution product image for use on our website?

Thank you.
```

---

## 📅 Workflow Checklist

When adding products without images:

- [ ] **Search** manufacturer website first
- [ ] **Check** ETL database for certified products
- [ ] **Search** Google Images with quality filters
- [ ] **Verify** image meets quality requirements
- [ ] **Download** to `Skills/Product Images Folder/`
- [ ] **Rename** using naming convention
- [ ] **Upload** to Wix Media Manager
- [ ] **Copy** Wix static URL
- [ ] **Apply** to product or HTML
- [ ] **Test** display on live site
- [ ] **Log** image source and URL

---

## 📎 Reference Files

| File | Location | Purpose |
|------|----------|---------|
| ETL Image Guide | `complete_wix_images_guide.html` | ETL product image URLs |
| Product Image Guide | `wix_product_images_guide.html` | Wix upload instructions |
| Image Storage | `Skills/Product Images Folder/` | Downloaded images |
| HTML Creator Skill | `Skills/html-content-creator.md` | HTML with images |

---

## 🆘 Troubleshooting

### "Image looks different on Wix than locally"
- Check Wix may be compressing/resizing
- Upload higher resolution original
- Use PNG for graphics, JPG for photos

### "Can't find official product image"
- Try searching the product code/SKU
- Look on distributor websites
- Check industry trade publications
- Use generic category image as fallback

### "Image has watermark"
- Never use watermarked images commercially
- Search for the original source
- Use legitimate free stock alternatives
- Contact image owner for licensing

### "File too large to upload"
- Compress at squoosh.app or tinypng.com
- Aim for <2MB per image
- Reduce dimensions if very large
- Convert PNG to JPG if no transparency needed

---

## 💡 Pro Tips

### Finding Better Images
- Add "press kit" or "media assets" to searches
- Check manufacturer's "About" or "Resources" pages
- Look for product launch announcements
- Search LinkedIn/press releases for product photos

### Batch Processing
- Download all needed images first
- Process (crop/resize) in batch
- Upload to Wix in one session
- Document all URLs at once

### Maintaining Quality
- Keep original high-res copies locally
- Note the source URL for each image
- Check images after Wix processing
- Update images when better ones become available

---

## 🎨 Emoji Standardization for HTMLs & Blogs

### Standard Emojis to Use

Use these consistent emojis across all HTML pages and blog content:

| Context | Emoji | Avoid |
|---------|-------|-------|
| Money/Cost | 💶 (Euro) primary, 💷 (Pound) if space allows | 💰 💵 (Dollar-based) |
| Savings | 💶💷 or 📈 | 💰 💵 |
| Environment | 🌱 🌍 ♻️ | |
| Energy | ⚡ ☀️ 🔋 | |
| Certified/Verified | ✓ ✅ | |
| Data/Stats | 📊 📈 | |
| Buildings | 🏢 🏠 🏭 | |
| Shopping | 🛒 🛍️ | |
| Warning | ⚠️ ❌ | |
| Success | ✅ ✓ | |

### Emoji Method for HTML
Always use Unicode emojis directly in HTML (not image-based icons):
```html
<!-- GOOD - Unicode emoji -->
<span class="icon">💷</span>

<!-- AVOID - Image-based icons that may not load -->
<img src="money-icon.png">
```

---

## 🖥️ HTML Development Best Practices

### Tab Navigation with Glow Effect
Make tabs noticeable with pulse animation:
```css
.tab-btn {
    animation: tabPulse 3s ease-in-out infinite;
}

@keyframes tabPulse {
    0%, 100% { box-shadow: 0 0 5px rgba(201, 169, 97, 0.2); }
    50% { box-shadow: 0 0 15px rgba(201, 169, 97, 0.4); }
}
```

### Marketplace Product Links

**URL Format for Direct Product Links:**
```
https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html?product=[PRODUCT_ID]&fromPopup=true
```

**Example:**
```
https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html?product=etl_8_83032&fromPopup=true
```

**Implementation in HTML:**

1. **Define Product ID Mapping in JavaScript:**
```javascript
const PRODUCT_LINKS = {
    'economiser': {
        id: 'etl_8_83032',  // Actual ETL product ID
        name: 'Condensing Economiser'
    },
    'led': {
        id: 'etl_lighting_12345',
        name: 'LED Retrofit Kit'
    }
};
```

2. **Add Function to Open Product Page:**
```javascript
function openProductPage(productKey) {
    const product = PRODUCT_LINKS[productKey];
    const productUrl = `${MARKETPLACE_BASE_URL}?product=${product.id}&fromPopup=true`;
    window.open(productUrl, '_blank');
}
```

3. **Add Button in HTML:**
```html
<button class="product-search-btn" onclick="openProductPage('economiser')">
    <span class="icon">🛒</span> View Product on Marketplace
</button>
```

**Finding Product IDs:**
- Check the ETL API response for `product_id` fields
- Format is typically: `etl_[category]_[number]`
- Test URL in browser before adding to HTML

### Fix Bottom Space in Wix Iframe
Prevent extra space at the end of HTML:
```css
html, body {
    margin: 0;
    padding: 0;
    margin-bottom: 0 !important;
}

.main-container, .cta-section {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
}
```

---

**Last Updated:** January 2026  
**Maintained By:** Energy Calculator Backend System  

---

## 📝 Change Log

| Date | Change | Reason |
|------|--------|--------|
| Jan 2026 | Added emoji standardization | Use 💶 (Euro) + 💷 (Pound) - avoid 💰💵 (Dollar) |
| Jan 2026 | Added tab glow effect | Make tabs more visible to users |
| Jan 2026 | Changed to direct product links | Modal didn't work - use ?product=ID instead |
| Jan 2026 | Added Wix bottom space fix | Remove extra space in iframe |
| Jan 2026 | Added blur fix CSS | Images were appearing blurry in HTML |
| Jan 2026 | Added Wix iframe fixes | Content was being cut off |
| Jan 2026 | Created skill | Standardize product image workflow |
