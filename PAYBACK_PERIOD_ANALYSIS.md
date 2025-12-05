# Payback Period Calculation Analysis

**Date:** January 2025  
**Issue:** Payback period showing incorrect values (36-48 years)  
**Status:** 📋 Analysis Only - No Changes Made Yet

---

## 🔍 Problem Identified

### **Current Behavior:**
- Financial Incentives modal shows: **"Payback Period: 36-48 years"**
- This seems incorrect for most energy-efficient products

### **Expected Behavior:**
- Payback period should typically be **2-10 years** for energy-efficient products
- Should account for product price and available grants

---

## 📊 Current Calculation (Line 2991)

### **Location:**
`product-page-v2-marketplace-test.html` - Line 2991

### **Current Code:**
```javascript
paybackPeriod: runningCostPerYear > 0 
    ? `${Math.round(1500 / annualSavings)}-${Math.round(2000 / annualSavings)} years` 
    : 'N/A',
```

### **Issues Found:**

#### **Issue 1: Hardcoded Product Price** ❌
- **Problem:** Uses hardcoded `1500` and `2000` instead of actual product price
- **Impact:** Doesn't reflect actual product cost
- **Evidence:** Product price is stored in `currentProduct.price` (line 1563: `price: 1500`)

#### **Issue 2: No Grants Consideration** ❌
- **Problem:** Doesn't subtract grants from product price
- **Impact:** Payback period is longer than it should be
- **Evidence:** Grants data is available in `product.grantsTotal` (line 3040)

#### **Issue 3: Arbitrary Price Range** ❌
- **Problem:** Uses range `1500-2000` which seems arbitrary
- **Impact:** Creates confusing range that doesn't reflect actual cost
- **Question:** Why 1500-2000? Should be single value based on actual price

#### **Issue 4: Wrong Formula** ❌
- **Problem:** Formula should be: `(Product Price - Grants) / Annual Savings`
- **Current:** `1500-2000 / Annual Savings` (hardcoded, no grants)
- **Impact:** Incorrect calculation

---

## 🧮 Calculation Breakdown

### **Example from Image:**
- **Annual Savings:** €41.39
- **Product Price:** €1,500 (from line 1563)
- **Grants:** Unknown (should be checked)

### **Current Calculation:**
```
Payback (min) = 1500 / 41.39 = 36.2 years
Payback (max) = 2000 / 41.39 = 48.3 years
Result: "36-48 years" ✅ Matches what user sees
```

### **Correct Calculation Should Be:**
```
Net Cost = Product Price - Total Grants
Payback Period = Net Cost / Annual Savings

Example (no grants):
Net Cost = €1,500 - €0 = €1,500
Payback = €1,500 / €41.39 = 36.2 years

Example (with €500 grants):
Net Cost = €1,500 - €500 = €1,000
Payback = €1,000 / €41.39 = 24.2 years
```

---

## 🔍 Root Cause Analysis

### **Why 36-48 Years is Wrong:**

1. **For €1,500 product with €41.39 annual savings:**
   - **Without grants:** 36.2 years (this is correct IF no grants)
   - **With grants:** Should be less (e.g., 24 years with €500 grant)

2. **The Issue:**
   - Code doesn't use actual product price (uses hardcoded 1500-2000)
   - Code doesn't subtract grants (should reduce net cost)
   - Code creates arbitrary range (1500-2000) instead of single value

3. **Why It Might Seem Wrong:**
   - If grants are available, payback should be shorter
   - If product price is different, calculation is wrong
   - The range (36-48) suggests uncertainty, but should be single value

---

## 📋 Data Available for Calculation

### **From `showFinancialIncentives()` function:**

1. **Product Price:**
   - `currentProduct.price` (line 1563: `price: 1500`)
   - Available in function scope

2. **Grants:**
   - `product.grantsTotal` (line 3040)
   - `product.grants` array (line 2971)
   - Available in function scope

3. **Annual Savings:**
   - `annualSavings = runningCostPerYear * 0.3` (line 2979)
   - Calculated as 30% of running cost

4. **Running Cost:**
   - `runningCostPerYear = product.runningCostPerYear || 0` (line 2973)

---

## ✅ Correct Calculation Formula

### **Proper Payback Period Calculation:**

```javascript
// Get product price (from currentProduct, not hardcoded)
const productPrice = currentProduct.price || 1500;

// Get total grants (from API product data)
const totalGrants = product.grantsTotal || 0;

// Calculate net cost (price minus grants)
const netCost = productPrice - totalGrants;

// Calculate payback period
const paybackPeriod = annualSavings > 0 
    ? netCost / annualSavings 
    : null;

// Format result
const paybackDisplay = paybackPeriod 
    ? `${paybackPeriod.toFixed(1)} years` 
    : 'N/A';
```

### **Why This is Better:**
- ✅ Uses actual product price (not hardcoded)
- ✅ Accounts for grants (reduces net cost)
- ✅ Single value (not confusing range)
- ✅ Accurate calculation

---

## 🎯 Expected Results After Fix

### **Example Scenarios:**

#### **Scenario 1: No Grants**
- Product Price: €1,500
- Annual Savings: €41.39
- Grants: €0
- **Payback:** 36.2 years ✅ (correct, but long)

#### **Scenario 2: With Grants**
- Product Price: €1,500
- Annual Savings: €41.39
- Grants: €500
- **Payback:** 24.2 years ✅ (more realistic)

#### **Scenario 3: Higher Savings**
- Product Price: €1,500
- Annual Savings: €150 (better efficiency)
- Grants: €500
- **Payback:** 6.7 years ✅ (realistic for energy products)

---

## ⚠️ Potential Issues to Consider

### **1. Annual Savings Calculation**
- Current: `runningCostPerYear * 0.3` (30% savings)
- **Question:** Is 30% savings assumption correct?
- **Impact:** If savings are wrong, payback will be wrong

### **2. Product Price Source**
- Current: Hardcoded `1500` in transform function
- **Question:** Should price come from database/API?
- **Impact:** If price is wrong, payback will be wrong

### **3. Grants Availability**
- Current: Grants loaded from API
- **Question:** Are grants always available?
- **Impact:** If grants missing, payback longer than it should be

### **4. Lifetime Assumption**
- Current: `lifetimeSavings = annualSavings * 10` (10 years)
- **Question:** Is 10-year lifetime correct?
- **Impact:** Affects lifetime savings, not payback

---

## 🔧 Recommended Fix

### **Step 1: Use Actual Product Price**
```javascript
// Instead of hardcoded 1500-2000
const productPrice = currentProduct.price || 1500;
```

### **Step 2: Account for Grants**
```javascript
// Subtract grants from price
const netCost = productPrice - (product.grantsTotal || 0);
```

### **Step 3: Calculate Single Payback Value**
```javascript
// Single value, not range
const paybackPeriod = annualSavings > 0 
    ? (netCost / annualSavings).toFixed(1) 
    : 'N/A';
```

### **Step 4: Format Display**
```javascript
// Clear, single value
paybackPeriod: paybackPeriod !== 'N/A' 
    ? `${paybackPeriod} years` 
    : 'N/A'
```

---

## 📊 Impact Analysis

### **What Will Change:**
- ✅ Payback period will use actual product price
- ✅ Payback period will account for grants
- ✅ Payback period will be single value (not range)
- ✅ More accurate calculations

### **What Won't Change:**
- ✅ Annual savings calculation (still 30% of running cost)
- ✅ Daily/monthly/lifetime savings (unchanged)
- ✅ Grants display (unchanged)
- ✅ Other financial incentives (unchanged)

### **Risk Assessment:**
- 🟢 **Low Risk** - Only changes payback calculation
- 🟢 **No Breaking Changes** - Other features unaffected
- 🟢 **Easy to Test** - Can verify with known values

---

## 🧪 Testing Plan

### **Test Cases:**

1. **Product with no grants:**
   - Price: €1,500
   - Annual Savings: €41.39
   - Expected: ~36 years

2. **Product with grants:**
   - Price: €1,500
   - Grants: €500
   - Annual Savings: €41.39
   - Expected: ~24 years

3. **Product with high savings:**
   - Price: €1,500
   - Annual Savings: €150
   - Expected: ~10 years

4. **Product with zero savings:**
   - Annual Savings: €0
   - Expected: 'N/A'

---

## 📝 Summary

### **Problem:**
Payback period calculation uses hardcoded values (1500-2000) and doesn't account for grants, resulting in incorrect/inflated payback periods.

### **Root Cause:**
Line 2991 uses `1500-2000 / annualSavings` instead of `(productPrice - grants) / annualSavings`.

### **Solution:**
1. Use `currentProduct.price` instead of hardcoded 1500-2000
2. Subtract `product.grantsTotal` from product price
3. Calculate single payback value (not range)
4. Format as "X.X years" instead of "X-Y years"

### **Impact:**
- ✅ More accurate payback periods
- ✅ Accounts for grants
- ✅ Single clear value
- ✅ Low risk change

---

**Status:** Ready for implementation when approved  
**Risk Level:** 🟢 Low  
**Breaking Changes:** None


