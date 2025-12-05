# Carrier Image Fix Summary

## Problem
Carrier Refrigeration products are showing `Motor.jpg` instead of correct commercial refrigeration images.

## Solution
Update Carrier products to use Wix image URL for commercial fridge placeholder.

## Wix Image URL Found
Using Wix MCP API, found the Wix URL for "Cm Fridge.jpeg":
```
https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg
```

## Files Created
1. `fix-carrier-wix-urls.js` - Main fix script with Wix URLs
2. `fix-carrier-final.js` - Simplified fix script
3. `fix-carrier-images.js` - Original fix script (uses local paths)
4. `fix-carrier-simple.js` - Test script

## What Needs to Happen

### Option 1: Run the fix script manually
```bash
node --max-old-space-size=8192 fix-carrier-wix-urls.js
```

### Option 2: Direct JSON update
The script needs to:
1. Find all Carrier products with `Motor.jpg` in `imageUrl`
2. Replace with: `https://static.wixstatic.com/media/c123de_7df4d529ff374f4ac4e04773dc4~mv2.jpeg`
3. Update `imageSource` to `'wix-url-fixed'`
4. Add `imageFixedDate` timestamp

## Products to Fix
All products where:
- `brand` contains "Carrier" (case-insensitive)
- `imageUrl` contains "Motor.jpg" or "Product Placement/Motor"

## After Fix
1. Verify the fix worked
2. Commit changes to GitHub
3. Push to GitHub
4. Render will automatically deploy

## Next Steps
1. ✅ Wix URL found via MCP API
2. ⏳ Run fix script to update JSON
3. ⏳ Verify fix
4. ⏳ Commit to GitHub
5. ⏳ Push to GitHub
6. ⏳ Render auto-deploys

