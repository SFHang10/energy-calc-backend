# 🛡️ Fetch Hand Dryers from Wix Using MCP

## Quick Start Guide

Since MCP setup is complete (despite some OAuth warnings), here's how to fetch hand dryers from Wix and enrich your database:

## Step 1: Use MCP Tools in Cursor

1. **Start a new Cursor conversation** (MCP tools work best in new conversations)

2. **Use MCP tool: `CallWixSiteAPI`** to fetch products:

   **Query all products:**
   ```
   Tool: CallWixSiteAPI
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

4. **For each hand dryer, fetch full details:**
   ```
   Tool: CallWixSiteAPI
   Endpoint: stores-reader/v1/products/{productId}
   Method: GET
   Headers: {
     "wix-site-id": "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"
   }
   ```

5. **Save the Wix product data** to a JSON file (e.g., `wix-hand-dryers.json`)

## Step 2: Process with Enrichment Script

Once you have the Wix product data:

### Option A: Save to JSON file and process

1. Save Wix products to `wix-hand-dryers.json`:
   ```json
   {
     "products": [
       { /* Wix product 1 */ },
       { /* Wix product 2 */ },
       ...
     ]
   }
   ```

2. Run the enrichment script:
   ```bash
   cd "c:\Users\steph\Documents\energy-cal-backend"
   node enrich-hand-dryers-MCP-COMPLETE.js
   ```

### Option B: Use the script directly with MCP data

Modify `enrich-hand-dryers-MCP-COMPLETE.js` to accept Wix products as input, or use the `processWixProducts()` function directly.

## Step 3: Review Results

The script will:
- ✅ Match Wix products to database products
- ✅ Extract all images, videos, and descriptions
- ✅ Enrich database products with Wix data
- ✅ Create backup before any changes
- ✅ Only add data, never overwrite existing fields

## Alternative: Use Wix API Directly

If MCP tools aren't working, you can use the Wix API directly:

1. **Set WIX_API_KEY in .env file:**
   ```
   WIX_API_KEY=your_api_key_here
   ```

2. **Run the script:**
   ```bash
   node fetch-and-enrich-hand-dryers-NOW.js --test
   ```

## What Gets Enriched

- **Images**: All gallery images from Wix
- **Videos**: All videos from Wix
- **Descriptions**: descriptionShort, descriptionFull, description, additionalInfo
- **Other**: wixId, wixProductUrl, price, specifications

## Safety Features

✅ **Automatic backup** before any changes  
✅ **Non-destructive** - only ADDS data, never overwrites  
✅ **Test mode** - test on sample products first  
✅ **Rollback capability** - restore from backup if needed  

## Troubleshooting

### MCP Tools Not Available
- Restart Cursor completely
- Start a new conversation
- Check if MCP server is running in background
- Run setup script again

### OAuth Errors (from MCP setup)
- These are warnings, not fatal errors
- MCP tools should still work
- If authentication fails, you may need to visit the authorization URL

### No Products Found
- Check Wix site ID: `cfa82ec2-a075-4152-9799-6a1dd5c01ef4`
- Verify product names contain "hand dryer"
- Check if products exist in your Wix store

---

**Next Steps**: Use MCP tools to fetch hand dryers, then run the enrichment script! 🚀

