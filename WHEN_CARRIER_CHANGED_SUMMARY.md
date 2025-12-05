# 🔍 When Carrier Products Changed to Motor.jpg - Summary

**Date:** January 11, 2025

---

## 📊 Findings from Backup Files

### **All Checked Backups Show Motor.jpg:**

| File | Date | Product 1 (etl_14_65836) | Product 2 (etl_14_65852) |
|------|------|-------------------------|-------------------------|
| FULL-DATABASE-5554.json | Current | `Product Placement/Motor.jpg` | `Product Placement/Motor.jpg` |
| FULL-DATABASE-5554_backup_athen_images_1763404173142.json | Recent | `Product Placement/Motor.jpg` | `Product Placement/Motor.jpg` |
| FULL-DATABASE-5554-HVAC-BACKUP-1762186189599.json | 2025-10-15 | `Product Placement/Motor.jpg` | `Product Placement/Motor.jpg` |

---

## 🔍 Key Discovery: imageAssigned Field

**Found in both products:**
- `"imageSource": "placeholder-auto"`
- `"imageAssigned": "2025-10-28T19:49:35.064Z"`

**This suggests:**
- Images were automatically assigned on **October 28, 2025**
- This is likely when Motor.jpg was assigned as a placeholder
- The assignment was automatic (not manual)

---

## 🎯 Conclusion

### **When It Changed:**
- **Date:** October 28, 2025 (based on imageAssigned field)
- **Time:** 19:49:35 UTC
- **Method:** Automatic placeholder assignment
- **Result:** Both Carrier products got Motor.jpg instead of correct fridge images

### **Why It Happened:**
- Products are in "ETL Technology" category
- Not in "Restaurant Equipment" category
- Generic fallback in `assign-placeholders-to-remaining.js` uses Motor.jpg
- Carrier products didn't match any specific category mapping
- Got assigned the generic Motor.jpg fallback

---

## ✅ What Should Have Happened

### **Option 1: Use Actual Product Images**
- `product-placement/Carrier Refrigeration all glass door  by Carrier Linde Commercial Refrigeration.jpeg`
- `product-placement/Carrier Refrigeration anti-reflective all glass door by Carrier Linde Commercial.jpeg`

### **Option 2: Use Fridge Placeholder**
- `Product Placement/Cm Fridge.jpeg`
- `Product Placement/Fridge.png`
- `Product Placement/Fridges and Freezers.jpg`

### **What Actually Happened:**
- ❌ Got `Product Placement/Motor.jpg` (generic fallback)

---

## 🔧 Root Cause

**The `assign-placeholders-to-remaining.js` script:**
- Line 79: Generic fallback uses Motor.jpg
- Carrier products are "ETL Technology" category
- No mapping exists for "ETL Technology" + "Carrier Linde Commercial Refrigeration"
- Products fell through to generic fallback → Motor.jpg

---

## 📋 Next Steps

1. ✅ **Found when it changed:** October 28, 2025
2. ✅ **Found why:** Generic fallback assignment
3. ⏳ **Fix needed:** Update Carrier products to use correct images
4. ⏳ **Prevent future:** Add Carrier/ETL Technology mapping to assign-placeholders script

---

**Status:** ✅ CHANGE DATE IDENTIFIED  
**Change Date:** October 28, 2025, 19:49:35 UTC  
**Cause:** Automatic placeholder assignment with generic fallback

