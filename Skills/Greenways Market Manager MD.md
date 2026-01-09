# 🛒 Greenways Market Manager

**Skill Type:** E-Commerce Store Management & Troubleshooting  
**Frequency:** On Demand / When Managing Products  
**Output:** Product updates, image fixes, troubleshooting solutions  
**Purpose:** Manage the Greenways Market Wix Store effectively

---

## 📋 Overview

This skill provides comprehensive management for the **Greenways Market Place** Wix e-commerce store, including:
- Understanding the store architecture
- Managing products and images
- Troubleshooting common issues
- Integrating with the Energy Calculator backend

---

## 🏗️ Store Architecture

### Key Locations

| Component | Location | Purpose |
|-----------|----------|---------|
| **Greenways Market Site** | `C:\Users\steph\Documents\greenways-market` | Wix site source |
| **Energy Cal Backend** | `C:\Users\steph\Documents\energy-cal-backend` | API & Database |
| **Product Images** | `energy-cal-backend\product-placement\` | Image storage |
| **Product Database** | `energy-cal-backend\FULL-DATABASE-5554.json` | Main product data |

### Wix Site Structure

```
greenways-market/
├── greenways-market-place/          # Main Wix app
│   ├── src/
│   │   └── dashboard/
│   │       └── pages/
│   ├── wix.config.json              # Site configuration
│   └── schemes.json                 # Grants/schemes data
├── src/
│   ├── backend/                     # Wix backend code
│   └── pages/                       # Wix pages
├── etl_products.csv                 # ETL product exports
├── etl_products_by_subtech.xlsx     # Categorized products
└── wix.config.json                  # Root config
```

### Backend Integration

```
energy-cal-backend/
├── server-new.js                    # Main Express server
├── routes/
│   ├── products.js                  # Product API
│   ├── shop-products.js             # Shop-formatted products
│   └── etl.js                       # ETL API integration
├── FULL-DATABASE-5554.json          # Product database
├── product-placement/               # Product images
├── product-page-v2-marketplace.html # Working product page
└── category-product-page.html       # Category listings
```

---

## 🔗 Key URLs & Endpoints

### Live URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Backend Server** | `https://energy-calc-backend.onrender.com` | API host |
| **Health Check** | `.../health` | Server status |
| **Products API** | `.../api/products` | All products |
| **Shop Products** | `.../api/shop-products` | Category-mapped products |
| **Categories** | `.../product-categories.html` | Category browser |
| **Product Page** | `.../product-page-v2-marketplace.html` | Product display |

### Working Product Page

**Local:** `file:///C:/Users/steph/Documents/energy-cal-backend/product-page-v2-marketplace.html`

**Deployed:** `https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html`

---

## 📦 Product Management

### Product Data Structure

```json
{
  "id": "unique-product-id",
  "name": "Product Name",
  "brand": "Manufacturer Name",
  "category": "ETL Technology",
  "subcategory": "Heat Pumps",
  "shopCategory": "Heat Pumps",
  "power": "5000",
  "energyRating": "A+++",
  "imageUrl": "product-placement/HeatPump.jpeg",
  "wixId": "d9083600-de75-e127...",
  "wixImageUrl": "https://static.wixstatic.com/media/...",
  "price": 2999.00,
  "description": "Product description"
}
```

### Image URL Priority

1. **First**: Check `imageUrl` (local image)
2. **Second**: Check `wixImageUrl` (Wix CDN)
3. **Fallback**: Placeholder image

### Adding/Updating Products

#### Step 1: Update Database
Edit `FULL-DATABASE-5554.json`:
```javascript
// Add new product to products array
{
  "products": [
    // ... existing products
    {
      "id": "new-product-id",
      "name": "New Product",
      // ... other fields
    }
  ]
}
```

#### Step 2: Add Product Image
1. Save image to `product-placement/` folder
2. Update `imageUrl` field to match filename
3. OR upload to Wix Media Manager and use Wix URL

#### Step 3: Deploy
```bash
git add FULL-DATABASE-5554.json
git add product-placement/new-image.jpg
git commit -m "Add new product: Product Name"
git push
# Render auto-deploys
```

---

## 🖼️ Image Management

### Image Locations

| Type | Location | URL Format |
|------|----------|------------|
| **Local Images** | `product-placement/` | `/product-placement/image.jpg` |
| **Wix Images** | Wix Media Manager | `https://static.wixstatic.com/media/...` |
| **ETL Images** | Government CDN | `https://img.etl.energysecurity.gov.uk/...` |

### Category Placeholder Images

| Category | Image File |
|----------|------------|
| Heat Pumps | `HeatPump.Jpeg` |
| Motors | `Motor.jpeg` |
| HVAC | `HVAC.jpeg` |
| Refrigeration | `Cm Fridge.jpeg` |
| Lighting | `Light.jpeg` |
| Hand Dryers | `Handrier.png` |
| Ovens | `Oven.jpeg` |
| Dishwashers | `Disherwasher.JPG` |

### Wix Image URL Format

```
https://static.wixstatic.com/media/[account-id]_[hash]~mv2.[extension]

Example:
https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg
```

### Fixing Missing Images

```javascript
// 1. Find products without images
const missingImages = products.filter(p => !p.imageUrl);

// 2. Assign category placeholder
missingImages.forEach(p => {
  p.imageUrl = getCategoryPlaceholder(p.category);
});

// 3. Or use Wix URL if available
if (product.wixId) {
  product.imageUrl = product.wixImageUrl;
}
```

---

## 🔧 Common Issues & Solutions

### Issue: Wrong Images on Category Pages

**Symptom:** Motor images appearing on Heat Pumps page

**Root Cause:** Frontend calls `/api/products` but expects `shopCategory` field

**Solution:** Change frontend to use `/api/shop-products`:
```javascript
// In category-product-page.html line ~453
const response = await fetch('/api/shop-products', {
    // ... existing options
});
```

**Reference:** `CATEGORY_IMAGE_ISSUE_ANALYSIS.md`

---

### Issue: Carrier Products Showing Motor Images

**Symptom:** Carrier refrigeration products show motor images

**Root Cause:** Batch image assignment assigned wrong placeholder

**Solution:**
```javascript
// Find Carrier products with Motor images
products.filter(p => 
  p.brand.includes('Carrier') && 
  p.imageUrl.includes('Motor')
);

// Replace with correct Wix URL
const wixUrl = 'https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg';
```

**Reference:** `CARRIER_FIX_COMPLETE_SUMMARY.md`

---

### Issue: Anti-Reflective Coated Products Wrong Images

**Symptom:** Anti-reflective products showing wrong images

**Reference:** `ANTI_REFLECTIVE_IMAGE_HISTORY.md`, `ANTI_REFLECTIVE_COMPLETE_HISTORY.md`

---

### Issue: ATHEN XL Products Wrong Images

**Reference:** `ATHEN_XL_IMAGE_FIX_SUMMARY.md`

---

### Issue: Products Not Showing on Category Page

**Symptom:** Empty category page, no products display

**Possible Causes:**
1. Database table missing/empty
2. API endpoint not returning data
3. Frontend filter not matching

**Debug Steps:**
```bash
# 1. Check API returns data
curl https://energy-calc-backend.onrender.com/api/products

# 2. Check shop-products endpoint
curl https://energy-calc-backend.onrender.com/api/shop-products

# 3. Check browser console for errors
```

**Reference:** `ARCHITECTURE_AND_ISSUES_SUMMARY.md`

---

### Issue: V2 Product Page Not Loading

**Symptom:** Product page shows blank or errors

**Check:**
1. Is product ID in URL correct?
2. Does API return product data?
3. Is calculator iframe loading?

**Reference:** `V2_PRODUCT_PAGE_WIX_INTEGRATION.md`, `V2_PAGE_AND_WIX_EXPLANATION.md`

---

## 📄 Key Product Pages

### Product Page V2 (Main)

**File:** `product-page-v2-marketplace.html`

**Features:**
- Product display with image
- Energy calculator iframe
- Marketplace integration
- Financing options
- Related products

**Key Lines:**
- **Image loading:** Line ~936
- **Calculator iframe:** Line ~907
- **Product fetch:** `/api/products/${productId}`

### Category Product Page

**File:** `category-product-page.html`

**Features:**
- Category grid display
- Product filtering
- Image gallery

**Key Lines:**
- **API fetch:** Line ~453
- **Category filter:** Line ~324

### Product Qualification Search

**Files:**
- `product-qualification-search.html`
- `product-qualification-search-GLASSMORPHISM.html`
- `product-qualification-search-v2.html`
- `product-qualification-search-WIX-STANDALONE.html`

---

## 🔄 Sync & Deployment

### Manual Sync Process

```bash
# 1. Update product database
# Edit FULL-DATABASE-5554.json

# 2. Add new images
# Copy to product-placement/

# 3. Commit changes
git add FULL-DATABASE-5554.json
git add product-placement/
git commit -m "Update products: [description]"

# 4. Push to GitHub
git push

# 5. Verify Render deployment
# Check https://energy-calc-backend.onrender.com/health
```

### ETL API Sync

```bash
# Fetch latest ETL products
node add_etl_products.js

# Add images to ETL products
node add_images_to_etl_products.js
```

---

## 📊 MCP Tools for Wix

When MCP is connected, use these tools:

| Tool | Purpose |
|------|---------|
| `ListWixSites` | Get site IDs |
| `CallWixSiteAPI` | Query/update products |
| `SearchWixRESTDocumentation` | Find API docs |

### Query Wix Products

```javascript
// Via MCP
CallWixSiteAPI({
  siteId: "cfa82ec2-a075-4152-9799-6a1dd5c01ef4",
  url: "https://www.wixapis.com/stores/v1/products/query",
  method: "POST",
  body: JSON.stringify({
    query: { filter: { "name": { "$contains": "Heat Pump" } } }
  })
});
```

---

## 📝 Lessons Learned Log

### Last Updated: January 2026

---

### Issue: Batch Image Assignment Overwrote Correct Images

**Date:** 2025  
**Problem:** Running batch image scripts overwrote products that already had correct images.

**Root Cause:** Script didn't check if `imageUrl` already existed before assigning placeholder.

**Solution:**
```javascript
// Always check before overwriting
if (!product.imageUrl || product.imageUrl.includes('placeholder')) {
  product.imageUrl = newImage;
}
```

**Prevention:** 
- Always backup before running batch scripts
- Add existence checks to all image scripts
- Use `--dry-run` flag first

---

### Issue: Category Filter Uses Wrong Field

**Date:** 2025  
**Problem:** Products not filtering correctly by category.

**Root Cause:** 
- Backend returns `category` field
- Frontend expects `shopCategory` field
- Fields don't match

**Solution:** Use `/api/shop-products` endpoint which includes category mapping.

**Prevention:** Always verify frontend and backend field names match.

---

### Issue: Wix Images vs Local Images Confusion

**Date:** 2025  
**Problem:** Some images work locally but not on Wix, or vice versa.

**Root Cause:** Local paths don't work in Wix iframes.

**Solution:** Use full Wix static URLs for all embedded content:
```javascript
// Bad (local)
imageUrl: "product-placement/image.jpg"

// Good (Wix CDN)
imageUrl: "https://static.wixstatic.com/media/c123de_xxx~mv2.jpeg"
```

**Prevention:** Always use absolute URLs for embedded content.

---

### Issue: Large JSON File Causing Memory Errors

**Date:** 2025  
**Problem:** Scripts crash when processing `FULL-DATABASE-5554.json` (230K+ lines).

**Root Cause:** Node.js default memory insufficient for large JSON.

**Solution:**
```bash
# Increase memory allocation
node --max-old-space-size=8192 script.js
```

**Prevention:** Use streaming JSON parsers for very large files.

---

### Issue: Product Images Not Showing After Deployment

**Date:** 2025  
**Problem:** Images show locally but 404 on Render.

**Root Cause:** Images not committed to Git or wrong path.

**Solution:**
1. Verify images are in `product-placement/` folder
2. Check file is tracked by Git: `git status`
3. Verify path in database matches actual filename (case-sensitive!)

**Prevention:** Always commit images with products.

---

### Issue: Calculator Iframe Breaking After Update

**Date:** 2025  
**Problem:** Product page calculator stopped working after code change.

**Root Cause:** Changed calculator integration code.

**Solution:** V2 product page calculator is self-contained. Don't modify:
- Line ~907: Iframe embedding
- Calculator endpoint: Separate from product API

**Prevention:** V2 calculator is protected - image/product changes don't affect it.

**Reference:** `CALCULATOR_SAFETY_ANALYSIS.md`, `CALCULATOR_SAFETY_GUARANTEE.md`

---

## 🔄 Add New Lessons Learned

When encountering new issues, add entries following this format:

```markdown
### Issue: [Brief Title]

**Date:** [Date discovered]  
**Problem:** [What went wrong]

**Root Cause:** [Why it happened]

**Solution:**
[Steps to fix]

**Prevention:** [How to avoid in future]
```

---

## 📎 Reference Documentation

### Architecture Docs

| Document | Purpose |
|----------|---------|
| `PROJECT_ARCHITECTURE_OVERVIEW.md` | Full system architecture |
| `ARCHITECTURE_AND_ISSUES_SUMMARY.md` | Current issues & status |
| `ARCHITECTURE_COMPATIBILITY_CHECK.md` | Compatibility analysis |
| `DEPLOYMENT_ARCHITECTURE_CHECK.md` | Deployment verification |
| `SCALABILITY_AND_ARCHITECTURE_ANALYSIS.md` | Scalability notes |

### Product Page Docs

| Document | Purpose |
|----------|---------|
| `V2_PRODUCT_PAGE_WIX_INTEGRATION.md` | V2 page + Wix integration |
| `V2_PAGE_AND_WIX_EXPLANATION.md` | How V2 works with Wix |
| `V2_PAGE_STATUS.md` | Current V2 page status |

### Image Fix Docs

| Document | Purpose |
|----------|---------|
| `CARRIER_FIX_COMPLETE_SUMMARY.md` | Carrier image fixes |
| `ANTI_REFLECTIVE_IMAGE_HISTORY.md` | Anti-reflective fixes |
| `ATHEN_XL_IMAGE_FIX_SUMMARY.md` | ATHEN XL fixes |
| `CATEGORY_IMAGE_ISSUE_ANALYSIS.md` | Category filter issues |
| `PRODUCT_IMAGE_FIX_SUMMARY.md` | General image fixes |

### Other Docs

| Document | Purpose |
|----------|---------|
| `wix_product_images_guide.html` | Wix image upload guide |
| `complete_wix_images_guide.html` | Complete image reference |
| `CUSTOMIZATION_GUIDE.md` | Store customization |

---

## 🚀 Quick Commands

### Check Product Count
```bash
node -e "const db = require('./database/sqlite.js'); db.all('SELECT COUNT(*) as count FROM products', (e,r) => console.log('Products:', r[0].count));"
```

### Verify API Working
```bash
curl https://energy-calc-backend.onrender.com/api/products | jq '. | length'
```

### Find Products Without Images
```bash
node -e "const data = require('./FULL-DATABASE-5554.json'); console.log('Missing images:', data.products.filter(p => !p.imageUrl).length);"
```

### Backup Database
```bash
cp FULL-DATABASE-5554.json FULL-DATABASE-5554.json.backup
```

---

## 📅 Maintenance Checklist

### Before Making Product Changes
- [ ] Backup `FULL-DATABASE-5554.json`
- [ ] Note current product count
- [ ] Verify API is working

### After Making Product Changes
- [ ] Verify product count unchanged (unless intended)
- [ ] Check images display correctly
- [ ] Test category pages
- [ ] Test product page
- [ ] Commit and push to GitHub
- [ ] Verify Render deployment

### Weekly Checks
- [ ] Verify product count stable
- [ ] Check for 404 images
- [ ] Review any new issues
- [ ] Update lessons learned if needed

---

**Last Updated:** January 2026  
**Maintained By:** Energy Calculator Backend System

---

*Use "manage greenways market" or "fix product images" to activate this skill*
