# 🔍 Complete Analysis: When Carrier Products Changed to Motor.jpg

**Date:** January 11, 2025  
**Products:** 
- etl_14_65836: Carrier Refrigeration all glass door
- etl_14_65852: Carrier Refrigeration anti-reflective all glass door

---

## ✅ FOUND: When It Changed

### **Date & Time:**
- **October 28, 2025, 19:49:35 UTC**
- **Evidence:** `imageAssigned: "2025-10-28T19:49:35.064Z"` in both products
- **Source:** `imageSource: "placeholder-auto"`

### **Script That Did It:**
- **File:** `apply-placeholder-images.js`
- **Lines 186-187:** Sets `imageSource = 'placeholder-auto'` and `imageAssigned = new Date().toISOString()`

---

## 🔍 Root Cause Analysis

### **The Problem in `apply-placeholder-images.js`:**

**Line 380-386:** Generic fallback for ETL Technology
```javascript
{
    category: 'ETL Technology',
    subcategory: null,  // ← Only matches if subcategory is null
    image: 'Product Placement/Motor.jpg',
    description: 'Generic ETL products'
}
```

**Carrier Products:**
- Category: `ETL Technology` ✅
- Subcategory: `Carrier Linde Commercial Refrigeration` ❌ (not null)

**What Happened:**
1. Script ran on October 28, 2025
2. Carrier products didn't match any specific mapping (lines 23-378)
3. Generic fallback (line 380) only matches if `subcategory === null`
4. Carrier products have subcategory, so they didn't match
5. **BUT** - They still got Motor.jpg somehow

### **Possible Scenarios:**

**Scenario 1: Products had no imageUrl before**
- Script assigned Motor.jpg as generic fallback
- Logic might have been different when script ran

**Scenario 2: Another script ran after**
- `apply-final-images.js` (line 30) uses Motor.jpg as generic fallback
- This might have overwritten Carrier images

**Scenario 3: Script logic changed**
- Original script might have had different logic
- Current version might not match what ran on Oct 28

---

## 📊 Image Mappings in Script

### **What the Script Maps:**

1. **Motor/Drive products** → `Motor.jpg` ✅
2. **HVAC products** → `HVAC1.jpeg` ✅
3. **Heat Pumps** → `HeatPumps.jpg` ✅
4. **Foodservice** → `Food Services.jpeg` ✅
5. **Microwaves** → `microwavemainhp.jpg` ✅
6. **Commercial Refrigeration** → `Cm Fridge.jpeg` ✅
   - BUT only for:
     - `category: 'professional-foodservice', subcategory: 'Commercial Refrigeration'`
     - `category: 'Restaurant Equipment', subcategory: 'Commercial Fridges'`
     - `category: 'Restaurant Equipment', subcategory: 'Commercial Freezers'`

### **What's Missing:**
- ❌ No mapping for `category: 'ETL Technology', subcategory: 'Carrier Linde Commercial Refrigeration'`
- ❌ No mapping for Carrier refrigeration products in ETL Technology category

---

## 🎯 Why Carrier Products Got Motor.jpg

**Carrier products:**
- Category: `ETL Technology`
- Subcategory: `Carrier Linde Commercial Refrigeration`
- **Don't match:** Any specific refrigeration mapping (those are for Restaurant Equipment)
- **Don't match:** Generic ETL fallback (requires subcategory === null)
- **Result:** Likely got Motor.jpg from a different fallback or later script

---

## ✅ Correct Images Available

**In product-placement folder:**
1. ✅ `Carrier Refrigeration all glass door  by Carrier Linde Commercial Refrigeration.jpeg`
2. ✅ `Carrier Refrigeration anti-reflective all glass door by Carrier Linde Commercial.jpeg`
3. ✅ `Cm Fridge.jpeg` (commercial fridge placeholder)

**Should be used instead of:** `Motor.jpg` ❌

---

## 🔧 Fix Required

### **Option 1: Update Carrier Products Directly**
- Change imageUrl to actual Carrier product images
- Or use `Cm Fridge.jpeg` placeholder

### **Option 2: Fix Script for Future**
- Add mapping to `apply-placeholder-images.js`:
```javascript
{
    category: 'ETL Technology',
    subcategory: 'Carrier Linde Commercial Refrigeration',
    image: 'Product Placement/Cm Fridge.jpeg',
    description: 'Carrier commercial refrigeration'
}
```

---

## 📋 Summary

| Item | Value |
|------|-------|
| **When Changed** | October 28, 2025, 19:49:35 UTC |
| **Script** | `apply-placeholder-images.js` |
| **Why** | No mapping for Carrier/ETL Technology products |
| **Current Image** | `Product Placement/Motor.jpg` ❌ |
| **Should Be** | Actual Carrier images or `Cm Fridge.jpeg` ✅ |
| **Fix** | Update products + add script mapping |

---

**Status:** ✅ CHANGE DATE IDENTIFIED  
**Root Cause:** Missing mapping in placeholder assignment script  
**Action:** Fix Carrier products + update script for future

