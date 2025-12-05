# Image Update Working Process - Documented for Future Use

## ⚠️ CRITICAL: This is the WORKING process that has been used successfully for weeks/months

## The Two-Step Process

### Step 1: Update Database First
Always update the SQLite database (`database/energy_calculator_central.db`) FIRST, then sync to JSON.

**Why?** The database is smaller and easier to update. The JSON file is the source of truth for the API, but we update it via database sync.

### Step 2: Sync Database to JSON
Use the pattern from `safe_sync_images_to_json.js` to sync changes from database to `FULL-DATABASE-5554.json`.

## The Working Pattern (from safe_sync_images_to_json.js)

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

// 1. Load JSON file
let jsonData;
try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
} catch (error) {
    console.error('❌ Error loading JSON file:', error);
    process.exit(1);
}

// 2. Connect to database
const db = new sqlite3.Database(dbPath);

// 3. Get products from database
db.all(`
    SELECT id, name, imageUrl
    FROM products 
    WHERE [your conditions here]
`, (err, dbProducts) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }

    // 4. Update JSON products with database images
    dbProducts.forEach(dbProduct => {
        const jsonProduct = jsonData.products.find(p => p.id === dbProduct.id);
        
        if (jsonProduct) {
            // Only update if different
            if (dbProduct.imageUrl && dbProduct.imageUrl !== jsonProduct.imageUrl) {
                // ONLY update imageUrl field - preserve everything else
                jsonProduct.imageUrl = dbProduct.imageUrl;
            }
        }
    });

    // 5. Save JSON file
    try {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log('✅ JSON file saved successfully');
    } catch (error) {
        console.error('❌ Error saving JSON file:', error);
    }

    db.close();
});
```

## Key Rules

1. **NEVER overwrite existing data** - only update the `imageUrl` field
2. **Always update database first**, then sync to JSON
3. **Use Wix URLs** for images (not local paths)
4. **Restart server** after updating to clear cache

## Example: Updating Specific Products

### For Carrier Products (Current Task)

1. **Update database:**
```javascript
db.run(
    `UPDATE products SET imageUrl = ? WHERE name = 'Carrier Refrigeration all glass door' AND imageUrl = 'Product Placement/Motor.jpg'`,
    ['https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg']
);
```

2. **Sync to JSON** using the pattern above

## Files to Use

- **Working pattern:** `safe_sync_images_to_json.js`
- **Current fix script:** `fix-carrier-using-working-pattern.js`
- **Database:** `database/energy_calculator_central.db`
- **JSON file:** `FULL-DATABASE-5554.json`

## Troubleshooting

If scripts run but don't update:
1. Check if database has the products
2. Verify product IDs match between database and JSON
3. Check file permissions
4. Ensure server is stopped (file might be locked)

## Why This Works

- Database updates are fast and reliable
- JSON sync preserves all other data
- Pattern has been proven to work for weeks/months
- Safe - only updates `imageUrl` field

