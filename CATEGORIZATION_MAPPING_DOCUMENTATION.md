# Product Categorization Mapping Documentation

**Date:** Current Session  
**Status:** ✅ Unified Categorization System Implemented  
**Purpose:** Ensure marketplace and audit widget use the same categorization for consistent customer experience

---

## 🎯 **Overview**

This document explains how products are categorized to ensure consistency between:
- **Audit Widget** (`energy-audit-widget-v3-embedded-test.html`)
- **Marketplace** (`product-categories.html`)

Both systems now use the same categorization logic from `utils/categorization.js`.

---

## 📊 **Category Mapping**

### **Audit Widget Product Types → Marketplace Categories**

| Audit Widget Type | Audit Widget Name | Marketplace Category | Icon |
|-------------------|-------------------|---------------------|------|
| `oven` | Ovens | Ovens | 🔥 |
| `fridge` | Refrigerators | Fridges and Freezers | 🧊 |
| `freezer` | Freezers | Fridges and Freezers | ❄️ |
| `lights` | Lighting | Lighting | 💡 |
| `motor` | Motors | Motor Drives | ⚙️ |
| `dishwasher` | Dishwashers | *(Not in marketplace yet)* | 📻 |
| `hvac` | HVAC Equipment | HVAC Equipment / Heat Pumps | 🌡️ |
| `handdryer` | Hand Dryers | Hand Dryers | 🤚 |

### **Marketplace Categories (Current)**

1. **Heat Pumps** → Maps to `hvac` type
2. **Motor Drives** → Maps to `motor` type
3. **HVAC Equipment** → Maps to `hvac` type
4. **Heating Equipment** → Maps to `hvac` type
5. **Lighting** → Maps to `lights` type
6. **Ovens** → Maps to `oven` type
7. **Hand Dryers** → Maps to `handdryer` type
8. **Fridges and Freezers** → Maps to `fridge` or `freezer` type

---

## 🔍 **Categorization Logic**

### **How Products Are Categorized**

The `categorizeProduct()` function in `utils/categorization.js` analyzes:
1. **Category** (from ETL database)
2. **Subcategory** (from ETL database)
3. **Product Name** (for additional matching)

### **ETL Technology Products**

Products with category `"ETL Technology"` are mapped based on subcategory:

| Subcategory Contains | Marketplace Category | Product Type |
|---------------------|---------------------|--------------|
| `Heat Pump`, `Baxi Heating-Commercial` | Heat Pumps | `hvac` |
| `HVAC`, `Reznor`, `Air Conditioning` | HVAC Equipment | `hvac` |
| `Motor`, `Drive`, `Inverter`, `Control` | Motor Drives | `motor` |
| `Heating`, `Boiler`, `Water Heater` | Heating Equipment | `hvac` |
| `Lighting`, `LED`, `Lamp` | Lighting | `lights` |

### **Other Categories**

Products with other categories are mapped directly:

| Category Contains | Marketplace Category | Product Type |
|------------------|---------------------|--------------|
| `oven`, `combi` | Ovens | `oven` |
| `refrigerator`, `fridge` | Fridges and Freezers | `fridge` |
| `freezer` | Fridges and Freezers | `freezer` |
| `hand dryer`, `handdryer` | Hand Dryers | `handdryer` |
| `lighting`, `light`, `led` | Lighting | `lights` |
| `motor`, `drive`, `inverter` | Motor Drives | `motor` |
| `hvac`, `air conditioning` | HVAC Equipment | `hvac` |
| `heat pump` | Heat Pumps | `hvac` |
| `heating`, `boiler` | Heating Equipment | `hvac` |

---

## 📝 **Product Object Structure**

After categorization, each product includes:

```javascript
{
  // Original fields
  id: "...",
  name: "...",
  category: "...",        // Original ETL category
  subcategory: "...",     // Original ETL subcategory
  
  // Unified categorization fields
  displayCategory: "...",      // Marketplace category name
  displaySubcategory: "...",   // Marketplace subcategory
  productType: "...",          // Audit widget type (oven, fridge, etc.)
  
  // Shop-specific fields (same as displayCategory)
  shopCategory: "...",
  shopSubcategory: "...",
  
  // Helper flags
  isHVAC: boolean,
  isMotor: boolean,
  isHeating: boolean
}
```

---

## 🔧 **Implementation Details**

### **File: `utils/categorization.js`**

**Functions:**
- `getProductType(category, subcategory, name)` - Returns audit widget type
- `categorizeProduct(category, subcategory, name)` - Returns full categorization
- `getProductTypeName(productType)` - Returns display name
- `getProductTypeIcon(productType)` - Returns icon emoji

### **File: `routes/products.js`**

**Changes:**
- Imports `categorizeProduct` from `utils/categorization.js`
- Replaces inline categorization logic with unified function
- All products now include `productType` field for audit widget compatibility

---

## ✅ **Benefits**

1. **Consistency:** Same products appear in same categories across both systems
2. **Maintainability:** Single source of truth for categorization logic
3. **Customer Experience:** Users see familiar categories in both tools
4. **Extensibility:** Easy to add new categories or update mapping rules

---

## 🧪 **Testing**

### **Test Cases:**

1. **ETL Technology → Heat Pump**
   - Input: `category: "ETL Technology"`, `subcategory: "Baxi Heating-Commercial"`
   - Expected: `displayCategory: "Heat Pumps"`, `productType: "hvac"`

2. **ETL Technology → Motor Drive**
   - Input: `category: "ETL Technology"`, `subcategory: "Motor Drive"`
   - Expected: `displayCategory: "Motor Drives"`, `productType: "motor"`

3. **Refrigerator → Fridges and Freezers**
   - Input: `category: "Refrigeration"`, `name: "Commercial Fridge"`
   - Expected: `displayCategory: "Fridges and Freezers"`, `productType: "fridge"`

4. **Hand Dryer**
   - Input: `category: "Hand Dryers"`, `name: "ETL Hand Dryer"`
   - Expected: `displayCategory: "Hand Dryers"`, `productType: "handdryer"`

---

## 📋 **Category Alignment Checklist**

- [x] Audit widget product types defined
- [x] Marketplace categories defined
- [x] Mapping function created
- [x] Products route updated
- [x] Documentation created
- [ ] Test with real product data
- [ ] Verify marketplace displays correctly
- [ ] Verify audit widget displays correctly

---

## 🔄 **Future Updates**

When adding new categories:
1. Update `utils/categorization.js` with new mapping logic
2. Update `product-categories.html` with new category card
3. Update this documentation
4. Test with sample products

---

**Last Updated:** Current Session  
**Status:** ✅ Implementation Complete  
**Next Step:** Test with real product data






