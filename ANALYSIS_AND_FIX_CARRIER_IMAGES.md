# 🔍 Analysis & Fix: Carrier Refrigeration Images

**Date:** January 11, 2025  
**Issue:** Carrier "all glass door" products showing Motor.jpg instead of fridge images

---

## 📊 Analysis Results

### **Current State:**
- **Carrier products with Motor.jpg:** Multiple (all "all glass door" products)
- **Current image:** `Product Placement/Motor.jpg` ❌
- **Should be:** `Product Placement/Cm Fridge.jpeg` ✅

### **Root Cause:**
1. **Generic fallback assigned:** `assign-placeholders-to-remaining.js` uses Motor.jpg as generic fallback (line 79)
2. **Category mismatch:** Carrier products are "ETL Technology" category, not "Restaurant Equipment"
3. **Wrong placeholder:** Should use commercial refrigeration image, not motor image

### **Correct Image Path:**
From `assign-placeholders-to-remaining.js` (line 67):
```javascript
{
    category: 'Restaurant Equipment',
    subcategory: 'Commercial Fridges',
    image: 'Product Placement/Cm Fridge.jpeg',  // ✅ CORRECT
}
```

**Note:** Frontend normalizes "Product Placement" to "product-placement" (category-product-page.html line 981)

---

## 🔧 Fix Strategy

### **Fix Script Created:**
- `fix-carrier-refrigeration-images.js`
- Changes all Carrier products with Motor.jpg to `Product Placement/Cm Fridge.jpeg`
- Creates backup before fixing
- Updates both `imageUrl` and `images` array

### **Products to Fix:**
- All products where:
  - `brand` includes "Carrier"
  - `imageUrl` includes "Motor.jpg" or "Motor.jpeg"

---

## ✅ Fix Implementation

**Script will:**
1. ✅ Load FULL-DATABASE-5554.json
2. ✅ Find all Carrier products with Motor.jpg
3. ✅ Change imageUrl to `Product Placement/Cm Fridge.jpeg`
4. ✅ Update images array (remove Motor, add Cm Fridge)
5. ✅ Create backup before changes
6. ✅ Save updated JSON
7. ✅ Verify fix

---

## 🎯 Expected Result

**Before:**
```json
{
  "id": "etl_14_65836",
  "name": "Carrier Refrigeration all glass door",
  "imageUrl": "Product Placement/Motor.jpg"  // ❌
}
```

**After:**
```json
{
  "id": "etl_14_65836",
  "name": "Carrier Refrigeration all glass door",
  "imageUrl": "Product Placement/Cm Fridge.jpeg"  // ✅
}
```

---

## 📋 Next Steps

1. ✅ Analysis complete
2. ⏳ Run fix script: `node fix-carrier-refrigeration-images.js`
3. ⏳ Verify fix worked
4. ⏳ Test on website

---

**Status:** Ready to fix  
**Risk:** Low (creates backup, only fixes Carrier products)

