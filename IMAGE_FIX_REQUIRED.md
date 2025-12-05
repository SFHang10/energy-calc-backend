# Image Fix Required - Products Incorrectly Showing Motor.jpg

## Problem Summary

Several products that were previously fixed are now showing `Product Placement/Motor.jpg` instead of their correct images. This happened when `apply-placeholder-images.js` was run, which incorrectly assigned Motor.jpg as a generic fallback.

## Products That Need Fixing

### 1. Carrier Refrigeration Products
- **Product:** "Carrier Refrigeration all glass door" (ID: etl_14_65836)
- **Current (WRONG):** `Product Placement/Motor.jpg`
- **Should be:** `https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg`

- **Product:** "Carrier Refrigeration anti-reflective all glass door" (ID: etl_14_65852)
- **Current (WRONG):** `Product Placement/Motor.jpg`
- **Should be:** `https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg`

### 2. Baxi Solarflo
- **Product:** "Baxi Solarflo (In-Roof)" (ID: etl_15_46852)
- **Current (WRONG):** `Product Placement/Motor.jpg`
- **Should be:** `Product Placement/Baxi-STS-1.jpeg` (solar water heater system image)

## Why This Happened

The `apply-placeholder-images.js` script has a generic fallback that assigns `Motor.jpg` to "ETL Technology" products when no specific match is found. This incorrectly affected:
- Carrier Refrigeration products (which are ETL Technology but should have fridge images)
- Baxi Solarflo (which is ETL Technology but should have solar system image)

## Files to Edit

**File:** `FULL-DATABASE-5554.json`

### Line 36355 - Carrier "all glass door"
**Find:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```
**Replace with:**
```json
      "imageUrl": "https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg",
```

### Line 36943 - Carrier "anti-reflective"
**Find:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```
**Replace with:**
```json
      "imageUrl": "https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg",
```

### Line 34283 - Baxi Solarflo
**Find:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```
**Replace with:**
```json
      "imageUrl": "Product Placement/Baxi-STS-1.jpeg",
```

## Script Created

`fix-carrier-and-baxi-images.js` - Uses the proven working pattern from `update-athen-images.js` and `update-tempest-images.js`

**To run:**
```bash
node fix-carrier-and-baxi-images.js
```

**Note:** If the script doesn't update the file (due to file locks or execution environment), use manual edit instructions above.

## Prevention

The `apply-placeholder-images.js` script should be updated to:
1. NOT use Motor.jpg as a generic fallback for ETL Technology
2. Have specific rules for refrigeration products
3. Have specific rules for solar/heating products
4. Only assign Motor.jpg to actual motor/drive products

## When Cursor Asked About Saving

When you closed Cursor yesterday and it asked about saving the database, this was likely because:
- The file was open and had unsaved changes
- Or there was a conflict between what was in memory vs. what was on disk
- The `apply-placeholder-images.js` script may have been run, overwriting previous fixes

