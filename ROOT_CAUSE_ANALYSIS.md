# Root Cause Analysis - Motor.jpg Incorrectly Assigned

## The Problem

Products that were previously fixed are now showing `Product Placement/Motor.jpg` instead of their correct images:
- Carrier Refrigeration products (should show fridge images)
- Baxi Solarflo (should show solar system image)

## Root Cause

**File:** `apply-placeholder-images.js`  
**Lines:** 161-167

```javascript
// Generic fallback
{
    category: 'ETL Technology',
    subcategory: null,
    image: 'Product Placement/Motor.jpg',
    description: 'Generic ETL products'
}
```

**The Issue:**
This generic fallback matches ANY product in the "ETL Technology" category, regardless of subcategory. Since Carrier and Baxi products are in "ETL Technology" category, they get assigned Motor.jpg when this script runs.

## Why This Is Wrong

1. **Carrier Refrigeration** products are ETL Technology but are REFRIGERATION, not motors
2. **Baxi Solarflo** is ETL Technology but is a SOLAR SYSTEM, not a motor
3. **Motor.jpg should ONLY** be assigned to actual motor/drive/fan products

## The Fix Needed

The `apply-placeholder-images.js` script should:
1. **Remove or fix the generic ETL Technology fallback** - it's too broad
2. **Add specific rules** for refrigeration products in ETL Technology
3. **Add specific rules** for solar/heating products in ETL Technology
4. **Only use Motor.jpg** for actual motor/drive products

## Products Affected

1. **Carrier Refrigeration all glass door** (ID: etl_14_65836)
   - Line 36355 in FULL-DATABASE-5554.json
   - Should be: Wix URL for Carrier all glass door

2. **Carrier Refrigeration anti-reflective all glass door** (ID: etl_14_65852)
   - Line 36943 in FULL-DATABASE-5554.json
   - Should be: Wix URL for Carrier anti-reflective

3. **Baxi Solarflo (In-Roof)** (ID: etl_15_46852)
   - Line 34283 in FULL-DATABASE-5554.json
   - Should be: `Product Placement/Baxi-STS-1.jpeg`

## When This Happened

Based on the user's report:
- Images were working correctly yesterday early evening
- When closing Cursor, it asked about saving the database
- When reopening, images were wrong
- This suggests `apply-placeholder-images.js` was run, overwriting previous fixes

## Prevention

1. **Fix `apply-placeholder-images.js`** to not use Motor.jpg as generic fallback
2. **Add specific category rules** before the generic fallback
3. **Test the script** on a small subset before running on full database
4. **Create backups** before running any image assignment scripts

