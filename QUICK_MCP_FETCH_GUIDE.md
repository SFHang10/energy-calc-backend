# 🚀 Quick Guide: Fetch Hand Dryers from Wix Using MCP

## Step 1: Use MCP Tools in Cursor

1. **Start a new Cursor conversation** (MCP tools work best in new conversations)

2. **Use MCP tool: `CallWixSiteAPI`** to fetch products:

   **Query all products:**
   ```
   Tool: CallWixSiteAPI
   Endpoint: stores-reader/v1/products/query
   Method: POST
   Body:
   {
     "query": {
       "paging": { "limit": 100, "offset": 0 }
     },
     "includeVariants": false,
     "includeHiddenProducts": false
   }
   Headers:
   {
     "wix-site-id": "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"
   }
   ```

3. **Filter for hand dryers** in the response (look for products with "hand dryer" in the name)

4. **For each hand dryer, fetch full details:**
   ```
   Tool: CallWixSiteAPI
   Endpoint: stores-reader/v1/products/{productId}
   Method: GET
   Headers:
   {
     "wix-site-id": "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"
   }
   ```

5. **Save the Wix product data** to `wix-hand-dryers.json`:
   ```json
   {
     "products": [
       { /* Wix product 1 with full details */ },
       { /* Wix product 2 with full details */ },
       ...
     ]
   }
   ```
   
   Or just an array:
   ```json
   [
     { /* Wix product 1 with full details */ },
     { /* Wix product 2 with full details */ },
     ...
   ]
   ```

## Step 2: Run the Enrichment Script

Once you have `wix-hand-dryers.json`:

```bash
cd "c:\Users\steph\Documents\energy-cal-backend"
node enrich-hand-dryers-WITH-MCP-DATA.js --test
```

This will:
- ✅ Load Wix data from `wix-hand-dryers.json`
- ✅ Match Wix products to database products
- ✅ Extract all images, videos, and descriptions
- ✅ Enrich database products with Wix data
- ✅ Create backup before any changes
- ✅ Only add data, never overwrite existing fields

## What Gets Enriched

- **Images**: All gallery images from Wix
- **Videos**: All videos from Wix
- **Descriptions**: descriptionShort, descriptionFull, description, additionalInfo
- **Other**: wixId, wixProductUrl, price, specifications

## Safety Features

✅ **Automatic backup** created: `FULL-DATABASE-5554-BACKUP-{timestamp}.json`  
✅ **Non-destructive** - only ADDS data, never overwrites  
✅ **Test mode** - test on sample products first with `--test` flag  
✅ **Rollback capability** - restore from backup if needed  

---

**Next**: Use MCP tools to fetch hand dryers, save to `wix-hand-dryers.json`, then run the script! 🚀

