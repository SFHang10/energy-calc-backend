# VERIFY BEFORE UPLOAD - Final 13 Images

**Date Generated:** 2024-12-30
**Purpose:** Verification checklist before running `upload-final-batch.js`

## Pre-Upload Verification Checklist

### Step 1: Verify Files Exist
Check that these 13 files exist in `Product Placement/` folder:
1. ✅ KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg
2. ✅ LG LDE4413ST 30 Double Wall Oven.jpeg
3. ✅ Light.jpeg
4. ✅ Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg
5. ✅ microwavemainhp.jpg
6. ✅ Motor.jpeg
7. ✅ Motor.jpg
8. ✅ Samsung NE58K9430WS 30 Wall Oven.jpg
9. ✅ Savings.jpg
10. ✅ Smart Home. jpeg.jpeg
11. ✅ Smart Warm Home. jpeg.jpeg
12. ✅ Whirlpool WOD51HZES 30 Double Wall Oven.jpg
13. ✅ Appliances.jpg

### Step 2: Verify JSON File
```bash
cd "c:\Users\steph\Documents\energy-cal-backend"
node -e "const d=require('./final-13-urls.json'); console.log('URLs count:', d.urls.length); console.log('All URLs start correctly:', d.urls.every(u=>u.startsWith('https://upload.wixmp.com')));"
```

**Expected Output:**
- URLs count: 13
- All URLs start correctly: true

### Step 3: Verify Upload Script
```bash
node -e "const fs=require('fs'); const content=fs.readFileSync('upload-final-batch.js','utf8'); const matches=content.match(/const uploadUrls = \[/); const urls=content.match(/https:\/\/upload\.wixmp\.com\/upload\/[^"]+/g); console.log('Found uploadUrls array:', !!matches); console.log('URL count in script:', urls ? urls.length : 0);"
```

**Expected Output:**
- Found uploadUrls array: true
- URL count in script: 13

### Step 4: Verify Image Names Match
The `imageNames` array in `upload-final-batch.js` should match the 13 filenames above in the same order.

## Current Status

**File Locations:**
- URLs: `final-13-urls.json`
- Upload Script: `upload-final-batch.js`
- Images: `Product Placement/` folder
- Backup Reference: `BACKUP-ALL-13-URLS-REFERENCE.json`

## If URLs Expire (After 24 Hours)

If uploads fail with expired URL errors, regenerate fresh URLs using:

```javascript
// Use Wix API to generate new upload URL for each image
const filename = "KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg";
// Call: POST https://www.wixapis.com/site-media/v1/files/generate-upload-url
// Body: {"mimeType":"image/jpeg","fileName":filename}
```

## Ready to Upload?

Once all checks pass, run:
```bash
node upload-final-batch.js
```

This will upload all 13 images and return the final Wix Media URLs for database update.










