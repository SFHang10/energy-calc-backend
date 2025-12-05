# Working Image Update Process - FINAL DOCUMENTATION

## ✅ This is the PROVEN process that has worked for weeks/months

## The Pattern (from update-athen-images.js, update-tempest-images.js, fix-cheftop-images.js)

### Key Files That Work:
- `update-athen-images.js` ✅
- `update-tempest-images.js` ✅
- `fix-cheftop-images.js` ✅
- `fix-carrier-direct-json.js` (new, follows same pattern)

### The Process:

1. **Load JSON file directly** (NOT database first)
   ```javascript
   const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
   database = JSON.parse(databaseContent);
   ```

2. **Update products in memory**
   ```javascript
   database.products.forEach(product => {
       // Match product by name
       // Update product.imageUrl
       // Update product.images array
   });
   ```

3. **Create backup BEFORE saving**
   ```javascript
   const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_${name}_${Date.now()}.json`);
   fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
   ```

4. **Save JSON file**
   ```javascript
   fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
   ```

## Important Notes:

- **DO NOT use database sync** for direct image updates
- **Update JSON directly** - this is what worked before
- **Always create backup** before saving
- **Restart server** after updating to clear cache

## For Carrier Products:

Use `fix-carrier-direct-json.js` which follows this exact pattern.

## Why This Works:

- Direct JSON update is faster
- No database sync needed for simple image updates
- Pattern has been proven to work consistently
- Creates backups automatically

## When to Use Database Sync:

Only use `safe_sync_images_to_json.js` when:
- You've updated images in the database first
- You need to sync multiple products from database to JSON
- You're doing bulk updates from database

## For Simple Image Updates:

**Always use direct JSON update** (the pattern above) - this is what worked yesterday and for weeks/months.

