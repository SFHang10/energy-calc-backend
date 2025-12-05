# 🛡️ Enrich Hand Dryers with Wix Data (Using MCP)

## Overview
This guide shows how to enrich hand dryer products in your database with ALL data from Wix:
- **Images** (all gallery images)
- **Videos** (all videos)
- **Descriptions** (descriptionShort, descriptionFull, description, additionalInfo)
- **Prices, specs, and all other metadata**

## Safety Features
✅ **Automatic backup** before any changes  
✅ **Non-destructive** - only ADDS data, never overwrites  
✅ **Test mode** - test on sample products first  
✅ **Rollback capability** - restore from backup if needed  

## Prerequisites
1. MCP tools set up and running (see `MCP-SETUP-GUIDE.md`)
2. Database file: `FULL-DATABASE-5554.json`
3. Node.js installed

## Step 1: Fetch Hand Dryers from Wix Using MCP

### Option A: Use MCP Tools in Cursor

1. **Start MCP server** (if not already running):
   ```bash
   npx -y @wix/mcp-remote https://mcp.wix.com/sse
   ```

2. **In Cursor, use MCP tool: `CallWixSiteAPI`**

   **Query all products:**
   ```
   Endpoint: stores-reader/v1/products/query
   Method: POST
   Body: {
     "query": {
       "paging": { "limit": 100, "offset": 0 }
     },
     "includeVariants": false,
     "includeHiddenProducts": false
   }
   Headers: {
     "wix-site-id": "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"
   }
   ```

3. **Filter for hand dryers** (or fetch all and filter in script)

4. **For each hand dryer product, fetch full details:**
   ```
   Endpoint: stores-reader/v1/products/{productId}
   Method: GET
   Headers: {
     "wix-site-id": "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"
   }
   ```

5. **Save the Wix product data to a JSON file** (e.g., `wix-hand-dryers.json`)

### Option B: Use the Enrichment Script with MCP Integration

The script `enrich-hand-dryers-from-wix-FINAL.js` can be modified to use MCP tools directly.

## Step 2: Process Wix Data and Enrich Database

### Test Mode (Recommended First)
```bash
cd "c:\Users\steph\Documents\energy-cal-backend"
node enrich-hand-dryers-from-wix-FINAL.js --test
```

This will:
- Process only the first 2 products
- Show what changes would be made
- **NOT save** the database (test mode)

### Full Enrichment
```bash
cd "c:\Users\steph\Documents\energy-cal-backend"
node enrich-hand-dryers-from-wix-FINAL.js
```

This will:
- Process all hand dryers
- Enrich with all Wix data
- Save the enriched database

## Step 3: Review Results

The script will show:
- ✅ Products enriched
- 📸 Images added
- 🎥 Videos added
- 📝 Descriptions enhanced
- 💾 Backup location

## Step 4: Deploy Updated Database

After enrichment:
1. Review the changes in `FULL-DATABASE-5554.json`
2. Commit and push to GitHub
3. Deploy to Render (if needed)

## What Gets Enriched

### Images
- All gallery images from Wix
- Merged with existing images (no duplicates)
- Stored as JSON array in `images` field

### Videos
- All videos from Wix
- Merged with existing videos (no duplicates)
- Stored as JSON array in `videos` field

### Descriptions
- `descriptionFull` - Full product description (if longer than existing)
- `descriptionShort` - Short description (if longer than existing)
- `description` - Main description (if longer than existing)
- `additionalInfo` - Additional information (merged if existing)

### Other Data
- `wixId` - Wix product ID (if not present)
- `wixProductUrl` - Link to Wix product page (if not present)
- `price` - Product price (if not present)
- `specifications` - Product specifications (if available)

## Safety Guarantees

1. **Automatic Backup**: Creates `FULL-DATABASE-5554-BACKUP-{timestamp}.json` before any changes
2. **Non-Destructive**: Only ADDS data, never overwrites existing fields
3. **Test Mode**: Test on sample products first
4. **Rollback**: Restore from backup if needed

## Troubleshooting

### MCP Tools Not Available
- Check `MCP-SETUP-GUIDE.md`
- Restart Cursor
- Start new conversation
- Ensure MCP server is running

### No Wix Products Found
- Check Wix site ID: `cfa82ec2-a075-4152-9799-6a1dd5c01ef4`
- Verify MCP authentication
- Check product names match "hand dryer"

### Enrichment Not Working
- Check database file exists: `FULL-DATABASE-5554.json`
- Verify Wix product data format
- Review script output for errors

## Files Created

- `enrich-hand-dryers-from-wix-FINAL.js` - Main enrichment script
- `FULL-DATABASE-5554-BACKUP-{timestamp}.json` - Automatic backup
- `wix-hand-dryers.json` - Wix product data (if saved manually)

## Next Steps

After enrichment:
1. ✅ Review enriched products
2. ✅ Test on marketplace site
3. ✅ Verify images and videos display correctly
4. ✅ Check descriptions are complete
5. ✅ Deploy to production

---

**Remember**: Always test in test mode first! 🧪

