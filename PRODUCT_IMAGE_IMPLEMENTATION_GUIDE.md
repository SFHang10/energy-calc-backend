# 🖼️ Product Image Implementation Guide

**Created:** January 2025  
**Purpose:** Reference guide for safely adding product images to embedded HTML pages

---

## 📋 **Summary**

This guide explains how to add product images to your embedded HTML product pages without breaking the calculator iframe.

---

## 🏗️ **Architecture Understanding**

### **Two Separate Systems:**

1. **Embedded HTML Pages** (What we're working with today)
   - Files: `product-page-v2-marketplace-test.html`, `product-categories-TEST.html`
   - Hosted on your backend server (localhost:4000)
   - Embedded into Wix as iframes
   - Images: From local `Product Placement/` folder

2. **Wix Native Products** (Not covered today)
   - Hosted on Wix platform
   - Uses Wix Media Manager
   - Separate from embedded HTML

---

## ✅ **What Works (Categories Page - Success Story)**

The categories page (`product-categories-TEST.html`) successfully displays images using this approach:

```html
<!-- Example from categories page -->
<img src="Product Placement/Heatin0g.jpeg" alt="Heat Pumps" class="category-image">
```

**Key Success Factors:**
- Images stored in `Product Placement/` folder
- Relative paths work when HTML is served from same directory
- Images load because they're in the same file structure

---

## 🎯 **How Product Page Images Work**

### **Image Flow:**

```
Database (imageUrl field) 
    ↓
JavaScript loads product data
    ↓
updateMediaGallery() function
    ↓
Displays images in HTML
```

### **Code Location:**

**Line 1371** in `product-page-v2-marketplace-test.html`:
```javascript
imageUrl: product.image_url || `https://via.placeholder.com/600x400/2d7a5f/ffffff?text=${encodeURIComponent(product.name)}`
```

**Lines 1550-1614**: `updateMediaGallery()` function handles image display

---

## 📁 **Current Image Storage**

### **Image Folder Location:**
```
C:\Users\steph\Documents\energy-cal-backend\Product Placement\
```

### **Available Images:**
- `Appliances.jpg`
- `ecostore HP by Electrolux Professional.jpeg`
- `Electrolux EI30EF55QS 30 Single Wall Oven.jpg`
- `Frigidaire Gallery FGEW3065UF 30 Wall Oven.jpg`
- `GE Profile P2B940YPFS 30 Double Wall Oven.jpeg`
- `Heatin0g.jpeg`
- `HVAC.jpeg`
- `Light.jpeg`
- `Motor.jpg`
- `Savings.jpg`
- `Smart Warm Home. jpeg.jpeg`
- And many more...

---

## 🛡️ **Calculator Protection**

### **Why Images Won't Break Calculator:**

The calculator is a completely separate iframe element at **Lines 906-908**:

```html
<!-- Energy Calculator Widget -->
<div class="calculator-widget">
    <iframe id="calculator-iframe" src="" width="100%" height="800" frameborder="0"></iframe>
</div>
```

**This is isolated from:**
- Product image display (Lines 1550-1614)
- Media gallery (Lines 1548-1714)
- Database queries
- Image loading

**Calculator loads separately** at line 1630+ via `updateCalculatorWidget()`

---

## 🔧 **Implementation Steps**

### **Step 1: Update Database with Image URLs**

Match products to images in `Product Placement/` folder.

**Example Mapping:**
```javascript
{
  product_name: "Electrolux EI30EF55QS 30 Single Wall Oven",
  imageUrl: "Product Placement/Electrolux EI30EF55QS 30 Single Wall Oven.jpg"
}
```

### **Step 2: Verify Image Path Works**

Images must be accessible when the HTML page loads.

**Current Working Path Format:**
- `Product Placement/Imagename.jpg` ✅ (Relative path, same directory)

**Won't Work:**
- `../Product Placement/image.jpg` ❌ 
- `https://external.com/image.jpg` ❌ (unless it's a valid external URL)

### **Step 3: Update Database**

The database stores images in the `image_url` column.

**To Update:**
```sql
UPDATE products 
SET image_url = 'Product Placement/Imagename.jpg'
WHERE name = 'Product Name';
```

### **Step 4: Test**

Load the product page - images should display automatically.

---

## 📊 **Image Loading System**

### **How Images Are Loaded (Line 1371):**

```javascript
imageUrl: product.image_url || `https://via.placeholder.com/600x400/...`
```

**Behavior:**
1. Check if `product.image_url` exists in database
2. If yes → Use that image
3. If no → Show placeholder with product name

### **Additional Images (Lines 1420-1461):**

Loads from `product-media-data.json`:
```javascript
const response = await fetch('product-media-data.json');
```

This allows multiple images per product.

---

## 💡 **Key Principles for Working with Images**

### **DO:**
✅ Keep images in `Product Placement/` folder  
✅ Use relative paths starting with `Product Placement/`  
✅ Update database `image_url` field  
✅ Test that images load in browser  
✅ Ensure calculator iframe remains untouched  

### **DON'T:**
❌ Move or delete the calculator iframe  
❌ Change iframe `src=""` attribute  
❌ Modify calculator loading code (line 1630+)  
❌ Use absolute URLs without testing  
❌ Break the database structure  

---

## 🎯 **Today's Work Plan**

### **Phase 1: Analysis**
1. List all products in database
2. Match products to images in `Product Placement/`
3. Identify missing images

### **Phase 2: Image Update Script**
1. Create script to update database with correct image URLs
2. Map products → images
3. Update database safely

### **Phase 3: Testing**
1. Test product page loads images
2. Verify calculator still works
3. Check different products

### **Phase 4: Deployment**
1. Once tested, apply to production
2. Keep backup of current state

---

## 📝 **Database Query Examples**

### **Check Current Images:**
```sql
SELECT name, image_url FROM products LIMIT 10;
```

### **Find Products Without Images:**
```sql
SELECT name FROM products WHERE image_url IS NULL OR image_url = '';
```

### **Update Image URL:**
```sql
UPDATE products 
SET image_url = 'Product Placement/NewImage.jpg'
WHERE name = 'Product Name';
```

---

## 🚨 **Important Notes**

### **File Naming:**
- Spaces in filenames are OK: `Product Placement/Smart Warm Home. jpeg.jpeg` ✅
- Case sensitivity: `Image.jpg` vs `image.jpg` matters on some systems
- Keep extensions: `.jpg`, `.jpeg`, `.png`

### **Path Format:**
- ✅ `Product Placement/image.jpg`
- ❌ `../Product Placement/image.jpg`
- ❌ `C:\Users\...\image.jpg` (absolute path)

### **Calculator Safety:**
- Calculator iframe is at **Line 906-908**
- Never modify the `calculator-iframe` id
- Calculator loads independently via `updateCalculatorWidget()`
- Images and calculator are completely separate systems

---

## 📞 **Quick Reference**

**Key Files:**
- Product Page: `product-page-v2-marketplace-test.html`
- Categories Page: `product-categories-TEST.html`
- Images Folder: `Product Placement/`
- Image Loading Code: Lines 1371, 1550-1614
- Calculator Iframe: Lines 906-908
- Calculator Loading: Line 1630+

**Success Indicators:**
- ✅ Images display on product page
- ✅ Calculator widget loads and functions
- ✅ No console errors
- ✅ Product details visible

---

*Last Updated: January 2025*  
*Status: Ready for Implementation*





**Created:** January 2025  
**Purpose:** Reference guide for safely adding product images to embedded HTML pages

---

## 📋 **Summary**

This guide explains how to add product images to your embedded HTML product pages without breaking the calculator iframe.

---

## 🏗️ **Architecture Understanding**

### **Two Separate Systems:**

1. **Embedded HTML Pages** (What we're working with today)
   - Files: `product-page-v2-marketplace-test.html`, `product-categories-TEST.html`
   - Hosted on your backend server (localhost:4000)
   - Embedded into Wix as iframes
   - Images: From local `Product Placement/` folder

2. **Wix Native Products** (Not covered today)
   - Hosted on Wix platform
   - Uses Wix Media Manager
   - Separate from embedded HTML

---

## ✅ **What Works (Categories Page - Success Story)**

The categories page (`product-categories-TEST.html`) successfully displays images using this approach:

```html
<!-- Example from categories page -->
<img src="Product Placement/Heatin0g.jpeg" alt="Heat Pumps" class="category-image">
```

**Key Success Factors:**
- Images stored in `Product Placement/` folder
- Relative paths work when HTML is served from same directory
- Images load because they're in the same file structure

---

## 🎯 **How Product Page Images Work**

### **Image Flow:**

```
Database (imageUrl field) 
    ↓
JavaScript loads product data
    ↓
updateMediaGallery() function
    ↓
Displays images in HTML
```

### **Code Location:**

**Line 1371** in `product-page-v2-marketplace-test.html`:
```javascript
imageUrl: product.image_url || `https://via.placeholder.com/600x400/2d7a5f/ffffff?text=${encodeURIComponent(product.name)}`
```

**Lines 1550-1614**: `updateMediaGallery()` function handles image display

---

## 📁 **Current Image Storage**

### **Image Folder Location:**
```
C:\Users\steph\Documents\energy-cal-backend\Product Placement\
```

### **Available Images:**
- `Appliances.jpg`
- `ecostore HP by Electrolux Professional.jpeg`
- `Electrolux EI30EF55QS 30 Single Wall Oven.jpg`
- `Frigidaire Gallery FGEW3065UF 30 Wall Oven.jpg`
- `GE Profile P2B940YPFS 30 Double Wall Oven.jpeg`
- `Heatin0g.jpeg`
- `HVAC.jpeg`
- `Light.jpeg`
- `Motor.jpg`
- `Savings.jpg`
- `Smart Warm Home. jpeg.jpeg`
- And many more...

---

## 🛡️ **Calculator Protection**

### **Why Images Won't Break Calculator:**

The calculator is a completely separate iframe element at **Lines 906-908**:

```html
<!-- Energy Calculator Widget -->
<div class="calculator-widget">
    <iframe id="calculator-iframe" src="" width="100%" height="800" frameborder="0"></iframe>
</div>
```

**This is isolated from:**
- Product image display (Lines 1550-1614)
- Media gallery (Lines 1548-1714)
- Database queries
- Image loading

**Calculator loads separately** at line 1630+ via `updateCalculatorWidget()`

---

## 🔧 **Implementation Steps**

### **Step 1: Update Database with Image URLs**

Match products to images in `Product Placement/` folder.

**Example Mapping:**
```javascript
{
  product_name: "Electrolux EI30EF55QS 30 Single Wall Oven",
  imageUrl: "Product Placement/Electrolux EI30EF55QS 30 Single Wall Oven.jpg"
}
```

### **Step 2: Verify Image Path Works**

Images must be accessible when the HTML page loads.

**Current Working Path Format:**
- `Product Placement/Imagename.jpg` ✅ (Relative path, same directory)

**Won't Work:**
- `../Product Placement/image.jpg` ❌ 
- `https://external.com/image.jpg` ❌ (unless it's a valid external URL)

### **Step 3: Update Database**

The database stores images in the `image_url` column.

**To Update:**
```sql
UPDATE products 
SET image_url = 'Product Placement/Imagename.jpg'
WHERE name = 'Product Name';
```

### **Step 4: Test**

Load the product page - images should display automatically.

---

## 📊 **Image Loading System**

### **How Images Are Loaded (Line 1371):**

```javascript
imageUrl: product.image_url || `https://via.placeholder.com/600x400/...`
```

**Behavior:**
1. Check if `product.image_url` exists in database
2. If yes → Use that image
3. If no → Show placeholder with product name

### **Additional Images (Lines 1420-1461):**

Loads from `product-media-data.json`:
```javascript
const response = await fetch('product-media-data.json');
```

This allows multiple images per product.

---

## 💡 **Key Principles for Working with Images**

### **DO:**
✅ Keep images in `Product Placement/` folder  
✅ Use relative paths starting with `Product Placement/`  
✅ Update database `image_url` field  
✅ Test that images load in browser  
✅ Ensure calculator iframe remains untouched  

### **DON'T:**
❌ Move or delete the calculator iframe  
❌ Change iframe `src=""` attribute  
❌ Modify calculator loading code (line 1630+)  
❌ Use absolute URLs without testing  
❌ Break the database structure  

---

## 🎯 **Today's Work Plan**

### **Phase 1: Analysis**
1. List all products in database
2. Match products to images in `Product Placement/`
3. Identify missing images

### **Phase 2: Image Update Script**
1. Create script to update database with correct image URLs
2. Map products → images
3. Update database safely

### **Phase 3: Testing**
1. Test product page loads images
2. Verify calculator still works
3. Check different products

### **Phase 4: Deployment**
1. Once tested, apply to production
2. Keep backup of current state

---

## 📝 **Database Query Examples**

### **Check Current Images:**
```sql
SELECT name, image_url FROM products LIMIT 10;
```

### **Find Products Without Images:**
```sql
SELECT name FROM products WHERE image_url IS NULL OR image_url = '';
```

### **Update Image URL:**
```sql
UPDATE products 
SET image_url = 'Product Placement/NewImage.jpg'
WHERE name = 'Product Name';
```

---

## 🚨 **Important Notes**

### **File Naming:**
- Spaces in filenames are OK: `Product Placement/Smart Warm Home. jpeg.jpeg` ✅
- Case sensitivity: `Image.jpg` vs `image.jpg` matters on some systems
- Keep extensions: `.jpg`, `.jpeg`, `.png`

### **Path Format:**
- ✅ `Product Placement/image.jpg`
- ❌ `../Product Placement/image.jpg`
- ❌ `C:\Users\...\image.jpg` (absolute path)

### **Calculator Safety:**
- Calculator iframe is at **Line 906-908**
- Never modify the `calculator-iframe` id
- Calculator loads independently via `updateCalculatorWidget()`
- Images and calculator are completely separate systems

---

## 📞 **Quick Reference**

**Key Files:**
- Product Page: `product-page-v2-marketplace-test.html`
- Categories Page: `product-categories-TEST.html`
- Images Folder: `Product Placement/`
- Image Loading Code: Lines 1371, 1550-1614
- Calculator Iframe: Lines 906-908
- Calculator Loading: Line 1630+

**Success Indicators:**
- ✅ Images display on product page
- ✅ Calculator widget loads and functions
- ✅ No console errors
- ✅ Product details visible

---

*Last Updated: January 2025*  
*Status: Ready for Implementation*






















