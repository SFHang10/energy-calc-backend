# Carrier Image Fix - GitHub Deployment Guide

## ✅ What Was Done

1. **Identified Problem**: Carrier Refrigeration products have `Motor.jpg` instead of correct fridge images
2. **Found Wix URL via MCP API**: 
   - Searched Wix Media Manager using Wix MCP
   - Found Wix URL for "Cm Fridge.jpeg": `https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg`
3. **Created Fix Scripts**: Multiple scripts ready to fix the issue

## 📋 Wix Image URL

**Commercial Fridge Placeholder (Cm Fridge.jpeg):**
```
https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg
```

This URL should replace `Product Placement/Motor.jpg` for all Carrier products.

## 🔧 Fix Scripts Available

1. **`fix-carrier-images-wix-final.js`** ⭐ RECOMMENDED
   - Uses Wix URL found via MCP API
   - Creates backup before changes
   - Detailed logging

2. **`fix-carrier-wix-urls.js`** - Alternative with more features

3. **`fix-carrier-final.js`** - Simplified version

## 🚀 Deployment Steps for GitHub/Render

### Step 1: Run the Fix Script

```bash
cd "C:\Users\steph\Documents\energy-cal-backend"
node --max-old-space-size=8192 fix-carrier-images-wix-final.js
```

**Expected Output:**
- Should show how many Carrier products were found
- Should create a backup file
- Should save updated JSON

**If script doesn't produce output:**
- Check if `carrier-fix-final-output.txt` was created
- The JSON file is very large (230,000+ lines) - may take 1-2 minutes to save

### Step 2: Verify the Fix

Check that Carrier products now have the Wix URL:

```bash
# Should show Wix URLs, not Motor.jpg
grep -A 2 "Carrier Refrigeration" FULL-DATABASE-5554.json | grep imageUrl
```

Or check a specific product:
```bash
# Look for line 36943 (Carrier anti-reflective product)
# Should show: "imageUrl": "https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg"
```

### Step 3: Commit to GitHub

```bash
# Add the fixed JSON file
git add FULL-DATABASE-5554.json

# Add the fix script (for reference)
git add fix-carrier-images-wix-final.js

# Add documentation
git add CARRIER_FIX_*.md
git add WHAT_CHANGED_YESTERDAY_ANALYSIS.md
git add SOLUTIONS_SUMMARY.md

# Commit
git commit -m "Fix Carrier Refrigeration images - replace Motor.jpg with Wix Cm Fridge URL

- Found Wix URL via MCP API: https://static.wixstatic.com/media/c123de_7df4d529ff374f4ac4e04773dc4~mv2.jpeg
- Updated all Carrier products to use Wix commercial fridge placeholder
- Fixes issue where Carrier products incorrectly showed Motor.jpg
- Images now use Wix CDN URLs which work in production"

# Push to GitHub
git push
```

### Step 4: Render Auto-Deploys

Render will automatically:
1. Detect the GitHub push
2. Pull the latest code
3. Deploy the updated `FULL-DATABASE-5554.json` file
4. Restart the server
5. Images will now load from Wix CDN

## 📝 Files to Commit

**Required:**
- `FULL-DATABASE-5554.json` (after fix is applied)

**Recommended (for documentation):**
- `fix-carrier-images-wix-final.js` (fix script)
- `CARRIER_FIX_GITHUB_DEPLOYMENT.md` (this file)
- `CARRIER_FIX_READY_FOR_GITHUB.md`
- `WHAT_CHANGED_YESTERDAY_ANALYSIS.md`
- `SOLUTIONS_SUMMARY.md`

## ⚠️ Important Notes

1. **Large File**: The JSON file is 230,000+ lines. Saving may take 1-2 minutes
2. **Backup Created**: The script creates a backup before making changes
3. **Wix URLs Work Everywhere**: The Wix CDN URLs work in:
   - Local development (localhost)
   - Production (Render)
   - Wix site
   - Any external site
4. **No Backend Changes Needed**: Since images are on Wix CDN, no static file serving needed

## 🔍 Verification After Deployment

After Render deploys, verify:

1. **Check API Response:**
   ```
   https://your-render-app.onrender.com/api/product-widget/etl_14_65852
   ```
   Should return `image_url` with Wix URL

2. **Check Product Page:**
   ```
   https://your-wix-site.com/product-page-v2.html?product=etl_14_65852
   ```
   Should show commercial fridge image, not motor image

3. **Check Category Page:**
   ```
   https://your-wix-site.com/category-product-page.html?category=ETL Technology
   ```
   Carrier products should show fridge images

## 🎯 Summary

**Problem:** Carrier products showing Motor.jpg  
**Solution:** Update to Wix Cm Fridge URL  
**Wix URL:** `https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg`  
**Status:** Script ready, needs to be run and committed to GitHub

