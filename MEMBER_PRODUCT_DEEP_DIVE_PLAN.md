# Member Product Deep-Dive Feature - Implementation Plan

## ✅ **Compatibility Guarantee**

This feature will:
- ✅ **NOT modify** existing product pages
- ✅ **NOT change** existing API endpoints
- ✅ **ADD new** optional fields to product JSON (backward compatible)
- ✅ **CREATE new** member-only page (separate file)
- ✅ **USE existing** product data structure

---

## 🎯 **Feature Requirements**

### **What Members Will See:**
1. **Product Selection** - From marketplace, click product to "deep dive"
2. **Detailed Product Page** showing:
   - All product information (name, brand, specs, images, videos)
   - Grants information (government incentives)
   - Current product they may have (replacement scenario)
   - Collection agencies (who will pay for/pick up old product)
   - Visual representation with nice UI

### **Data Structure (New Optional Fields):**
```json
{
  "id": "product-123",
  "name": "Energy Efficient Fridge",
  // ... existing fields ...
  
  // NEW FIELDS (optional - won't break existing code):
  "currentProduct": {
    "name": "Old Fridge Model XYZ",
    "brand": "OldBrand",
    "power": 200,
    "age": "5 years",
    "condition": "Working but inefficient"
  },
  "collectionAgencies": [
    {
      "name": "Local Recycling Center",
      "service": "Free pickup",
      "contact": "0800-123-456",
      "website": "https://...",
      "conditions": "Must be working condition"
    },
    {
      "name": "Energy Upgrade Program",
      "service": "Pay €50 for old product",
      "contact": "0800-789-012",
      "website": "https://...",
      "conditions": "Must purchase new product"
    }
  ],
  "grants": [
    {
      "country": "NL",
      "program": "Energy Efficiency Grant",
      "amount": "€200",
      "eligibility": "Residential properties",
      "link": "https://..."
    }
  ]
}
```

---

## 📁 **Files to Create/Modify**

### **New Files (Safe - Won't Break Anything):**
1. `wix-integration/member-product-deep-dive.html` - New member product page
2. `routes/member-products.js` - New API endpoint (optional, can use existing)

### **Existing Files (No Changes Needed):**
- ✅ `routes/product-widget.js` - Already handles grants & collectionAgencies
- ✅ `product-page-v2-marketplace-test.html` - Existing page (unchanged)
- ✅ `FULL-DATABASE-5554.json` - Can add new fields (backward compatible)

---

## 🔧 **Implementation Strategy**

### **Phase 1: Create Member Product Page** ✅
- New HTML file for members only
- Uses existing `/api/product-widget/:productId` endpoint
- Displays all product info + grants + collection agencies
- Shows current product comparison

### **Phase 2: Enhance Product Data (Optional)**
- Add `currentProduct` and enhanced `collectionAgencies` to JSON
- These are optional fields - existing code ignores them
- Backward compatible

### **Phase 3: Integration**
- Link from marketplace to member deep-dive page
- Add "Deep Dive" button for members
- Auto-select product from URL parameter

---

## 🛡️ **Safety Measures**

1. **Separate File** - New page, doesn't touch existing ones
2. **Optional Fields** - New JSON fields are optional
3. **Existing API** - Uses current `/api/product-widget/:productId`
4. **Member-Only** - Requires authentication (uses existing member system)
5. **No Breaking Changes** - All existing functionality preserved

---

## 📋 **Next Steps**

1. Create `member-product-deep-dive.html` page
2. Test with existing product data
3. Add sample data for `currentProduct` and `collectionAgencies`
4. Integrate with membership system
5. Test compatibility with existing pages








