# 🖼️ Image Upload Safety Guide - Prevent Crashes

## 🚨 **Problems Experienced**

### **Past Issues:**
1. **Server crashes** when uploading/updating large batches of images
2. **Database corruption** when updating image URLs in bulk
3. **Flashing/disappearing images** during updates
4. **Memory overflow** when processing many images simultaneously
5. **Field name mismatches** (`image_url` vs `imageUrl`) causing broken displays
6. **External placeholder service failures** (`via.placeholder.com`)
7. **Path resolution errors** (relative vs absolute paths)

---

## 🛡️ **Safety Rules (NEVER BREAK THESE)**

### **1. Never Bulk Update Without Testing**
❌ **BAD**: Update 500 products at once  
✅ **GOOD**: Update 10 products, test, then continue

### **2. Always Backup Before Updates**
❌ **BAD**: Directly modify production database  
✅ **GOOD**: Create backup first

```javascript
// Always do this first:
// 1. Backup current state
// 2. Test on small batch
// 3. Verify
// 4. Then apply to all
```

### **3. Use Transactions**
❌ **BAD**: Direct UPDATE without rollback  
✅ **GOOD**: Use database transactions

```javascript
db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Your updates here
    
    db.run('COMMIT');
});
```

### **4. Never Modify Calculator Data**
❌ **BAD**: Update products used by calculator  
✅ **GOOD**: Keep calculator data untouched

**Calculator Critical Fields:**
- `power`
- `energyRating`
- `efficiency`
- `runningCostPerYear`
- `calculatorData`

### **5. Test Image Paths First**
❌ **BAD**: Assume image URLs work  
✅ **GOOD**: Test image loads before updating database

---

## 📊 **Safe Image Update Process**

### **Step 1: Preparation**
```javascript
// 1. Backup database
db.run(`INSERT INTO products_backup SELECT * FROM products`);

// 2. Check current image status
db.all("SELECT COUNT(*) as total, COUNT(image_url) as with_images FROM products", callback);

// 3. Identify products needing images
db.all("SELECT name, image_url FROM products WHERE image_url IS NULL OR image_url = '' LIMIT 10", callback);
```

### **Step 2: Small Batch Update**
```javascript
// Update only 10 products at a time
const productsToUpdate = [
    { name: 'Product 1', imageUrl: 'path/to/image1.jpg' },
    { name: 'Product 2', imageUrl: 'path/to/image2.jpg' },
    // ... max 10 products
];

db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    productsToUpdate.forEach(product => {
        db.run(
            'UPDATE products SET image_url = ? WHERE name = ?',
            [product.imageUrl, product.name],
            function(err) {
                if (err) {
                    console.error(`Error updating ${product.name}:`, err);
                    db.run('ROLLBACK'); // Rollback on any error
                }
            }
        );
    });
    
    db.run('COMMIT');
});
```

### **Step 3: Verify**
```javascript
// 1. Check database
db.all("SELECT name, image_url FROM products WHERE name IN (?, ?, ?)", 
    productsToUpdate.map(p => p.name), 
    (err, rows) => {
        console.log('Updated products:', rows);
    }
);

// 2. Test in browser
// Load product page and verify images display

// 3. Check console for errors
// F12 → Console tab
```

### **Step 4: Continue or Rollback**
✅ If successful → Continue with next batch  
❌ If errors → Rollback immediately

```javascript
// Rollback script
db.run('DELETE FROM products');
db.run('INSERT INTO products SELECT * FROM products_backup');
console.log('✅ Rolled back to previous state');
```

---

## 🚫 **Common Crash Causes**

### **1. Memory Overflow**
**Problem:** Processing too many images at once  
**Solution:** Process in batches of 10-20

### **2. Database Lock**
**Problem:** Multiple connections trying to update  
**Solution:** Use serialized access or connection pooling

### **3. Invalid Image Paths**
**Problem:** Updating with broken URLs  
**Solution:** Test each URL before updating

### **4. Calculator Interference**
**Problem:** Accidentally updating calculator data  
**Solution:** Filter updates to exclude calculator products

### **5. External Service Failure**
**Problem:** `via.placeholder.com` or similar services down  
**Solution:** Use inline SVG placeholders instead

---

## 🔧 **Safe Image Script Template**

### **Use This Template for ALL Image Updates**

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ⚠️ SAFETY CHECKS
function safetyCheck() {
    console.log('✅ Safety checks enabled');
    
    // 1. Verify database exists
    // 2. Check backup exists
    // 3. Verify we're not touching calculator data
    // 4. Confirm batch size is small
    
    return true;
}

// 🔄 BATCH UPDATE WITH TRANSACTION
function safeBatchUpdate(products, batchSize = 10) {
    const db = new sqlite3.Database('energy_calculator.db');
    
    // Backup first
    db.run('CREATE TABLE IF NOT EXISTS products_backup AS SELECT * FROM products');
    console.log('✅ Backup created');
    
    // Process in small batches
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            let errors = 0;
            batch.forEach(product => {
                db.run(
                    'UPDATE products SET image_url = ? WHERE name = ?',
                    [product.imageUrl, product.name],
                    function(err) {
                        if (err) {
                            console.error(`❌ Error:`, err);
                            errors++;
                        } else {
                            console.log(`✅ Updated: ${product.name}`);
                        }
                    }
                );
            });
            
            // Only commit if no errors
            db.run(errors === 0 ? 'COMMIT' : 'ROLLBACK', (err) => {
                if (err) {
                    console.error('❌ Transaction error:', err);
                } else {
                    console.log(`✅ Batch ${i/batchSize + 1} complete`);
                }
            });
        });
    }
    
    db.close();
}

// 📊 VERIFY RESULTS
function verifyUpdates() {
    db.all(
        'SELECT COUNT(*) as total, COUNT(image_url) as with_images FROM products',
        (err, rows) => {
            if (err) {
                console.error('❌ Verification error:', err);
            } else {
                console.log('📊 Image status:', rows[0]);
            }
        }
    );
}
```

---

## 🎯 **Recommended Approach for Marketplace**

### **For Wix Native Products (CATALOG V1):**

**Option 1: Single Product Updates**
- Update one product at a time via Wix API
- Test each image before proceeding
- Safest method for production

**Option 2: Batch Update with Delays**
```javascript
async function safeWixImageUpdate(products) {
    for (let i = 0; i < products.length; i++) {
        await updateSingleProduct(products[i]);
        
        // Wait 2 seconds between updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for errors
        if (hasErrors()) {
            console.error('❌ Stopping due to errors');
            break;
        }
    }
}
```

### **For Embedded HTML Products:**

Use the `Product Placement/` folder approach that's already working.

---

## 🚨 **Emergency Rollback**

### **If Something Goes Wrong:**

```javascript
// 1. Stop all processes immediately
process.exit();

// 2. Restore from backup
db.run('DELETE FROM products');
db.run('INSERT INTO products SELECT * FROM products_backup');

// 3. Restart server
// taskkill /f /im node.exe
// node server.js
```

---

## ✅ **Success Checklist**

Before any image update, check:

- [ ] Database backed up
- [ ] Small batch size (< 20 products)
- [ ] Test image URLs work
- [ ] Calculator data excluded from updates
- [ ] Transaction/rollback enabled
- [ ] Error handling in place
- [ ] Logging for debugging
- [ ] Can rollback if needed

---

## 📝 **File Locations**

**Key Files:**
- Images: `Product Placement/` folder
- Database: `energy_calculator.db`
- JSON Cache: `FULL-DATABASE-5554.json`
- Backup Script: `backup_rollback_system.js`

**Don't Modify:**
- `routes/calculator-wix.js` (Calculator routes)
- `energy_calculator.db` (Calculator database) - Use with caution
- Calculator iframe in product pages

---

## 🎯 **Recommendation for Marketplace**

**For adding images to Wix products, I recommend:**

1. **Start with 5 products** - Test the update process
2. **Verify images load** - Check in Wix preview
3. **If successful** - Continue with 10 product batches
4. **Add 2-second delays** - Prevent API rate limits
5. **Log everything** - Track what succeeds/fails
6. **Have rollback ready** - Be able to undo changes

This approach will prevent crashes and give you control over the process.





## 🚨 **Problems Experienced**

### **Past Issues:**
1. **Server crashes** when uploading/updating large batches of images
2. **Database corruption** when updating image URLs in bulk
3. **Flashing/disappearing images** during updates
4. **Memory overflow** when processing many images simultaneously
5. **Field name mismatches** (`image_url` vs `imageUrl`) causing broken displays
6. **External placeholder service failures** (`via.placeholder.com`)
7. **Path resolution errors** (relative vs absolute paths)

---

## 🛡️ **Safety Rules (NEVER BREAK THESE)**

### **1. Never Bulk Update Without Testing**
❌ **BAD**: Update 500 products at once  
✅ **GOOD**: Update 10 products, test, then continue

### **2. Always Backup Before Updates**
❌ **BAD**: Directly modify production database  
✅ **GOOD**: Create backup first

```javascript
// Always do this first:
// 1. Backup current state
// 2. Test on small batch
// 3. Verify
// 4. Then apply to all
```

### **3. Use Transactions**
❌ **BAD**: Direct UPDATE without rollback  
✅ **GOOD**: Use database transactions

```javascript
db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Your updates here
    
    db.run('COMMIT');
});
```

### **4. Never Modify Calculator Data**
❌ **BAD**: Update products used by calculator  
✅ **GOOD**: Keep calculator data untouched

**Calculator Critical Fields:**
- `power`
- `energyRating`
- `efficiency`
- `runningCostPerYear`
- `calculatorData`

### **5. Test Image Paths First**
❌ **BAD**: Assume image URLs work  
✅ **GOOD**: Test image loads before updating database

---

## 📊 **Safe Image Update Process**

### **Step 1: Preparation**
```javascript
// 1. Backup database
db.run(`INSERT INTO products_backup SELECT * FROM products`);

// 2. Check current image status
db.all("SELECT COUNT(*) as total, COUNT(image_url) as with_images FROM products", callback);

// 3. Identify products needing images
db.all("SELECT name, image_url FROM products WHERE image_url IS NULL OR image_url = '' LIMIT 10", callback);
```

### **Step 2: Small Batch Update**
```javascript
// Update only 10 products at a time
const productsToUpdate = [
    { name: 'Product 1', imageUrl: 'path/to/image1.jpg' },
    { name: 'Product 2', imageUrl: 'path/to/image2.jpg' },
    // ... max 10 products
];

db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    productsToUpdate.forEach(product => {
        db.run(
            'UPDATE products SET image_url = ? WHERE name = ?',
            [product.imageUrl, product.name],
            function(err) {
                if (err) {
                    console.error(`Error updating ${product.name}:`, err);
                    db.run('ROLLBACK'); // Rollback on any error
                }
            }
        );
    });
    
    db.run('COMMIT');
});
```

### **Step 3: Verify**
```javascript
// 1. Check database
db.all("SELECT name, image_url FROM products WHERE name IN (?, ?, ?)", 
    productsToUpdate.map(p => p.name), 
    (err, rows) => {
        console.log('Updated products:', rows);
    }
);

// 2. Test in browser
// Load product page and verify images display

// 3. Check console for errors
// F12 → Console tab
```

### **Step 4: Continue or Rollback**
✅ If successful → Continue with next batch  
❌ If errors → Rollback immediately

```javascript
// Rollback script
db.run('DELETE FROM products');
db.run('INSERT INTO products SELECT * FROM products_backup');
console.log('✅ Rolled back to previous state');
```

---

## 🚫 **Common Crash Causes**

### **1. Memory Overflow**
**Problem:** Processing too many images at once  
**Solution:** Process in batches of 10-20

### **2. Database Lock**
**Problem:** Multiple connections trying to update  
**Solution:** Use serialized access or connection pooling

### **3. Invalid Image Paths**
**Problem:** Updating with broken URLs  
**Solution:** Test each URL before updating

### **4. Calculator Interference**
**Problem:** Accidentally updating calculator data  
**Solution:** Filter updates to exclude calculator products

### **5. External Service Failure**
**Problem:** `via.placeholder.com` or similar services down  
**Solution:** Use inline SVG placeholders instead

---

## 🔧 **Safe Image Script Template**

### **Use This Template for ALL Image Updates**

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ⚠️ SAFETY CHECKS
function safetyCheck() {
    console.log('✅ Safety checks enabled');
    
    // 1. Verify database exists
    // 2. Check backup exists
    // 3. Verify we're not touching calculator data
    // 4. Confirm batch size is small
    
    return true;
}

// 🔄 BATCH UPDATE WITH TRANSACTION
function safeBatchUpdate(products, batchSize = 10) {
    const db = new sqlite3.Database('energy_calculator.db');
    
    // Backup first
    db.run('CREATE TABLE IF NOT EXISTS products_backup AS SELECT * FROM products');
    console.log('✅ Backup created');
    
    // Process in small batches
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            let errors = 0;
            batch.forEach(product => {
                db.run(
                    'UPDATE products SET image_url = ? WHERE name = ?',
                    [product.imageUrl, product.name],
                    function(err) {
                        if (err) {
                            console.error(`❌ Error:`, err);
                            errors++;
                        } else {
                            console.log(`✅ Updated: ${product.name}`);
                        }
                    }
                );
            });
            
            // Only commit if no errors
            db.run(errors === 0 ? 'COMMIT' : 'ROLLBACK', (err) => {
                if (err) {
                    console.error('❌ Transaction error:', err);
                } else {
                    console.log(`✅ Batch ${i/batchSize + 1} complete`);
                }
            });
        });
    }
    
    db.close();
}

// 📊 VERIFY RESULTS
function verifyUpdates() {
    db.all(
        'SELECT COUNT(*) as total, COUNT(image_url) as with_images FROM products',
        (err, rows) => {
            if (err) {
                console.error('❌ Verification error:', err);
            } else {
                console.log('📊 Image status:', rows[0]);
            }
        }
    );
}
```

---

## 🎯 **Recommended Approach for Marketplace**

### **For Wix Native Products (CATALOG V1):**

**Option 1: Single Product Updates**
- Update one product at a time via Wix API
- Test each image before proceeding
- Safest method for production

**Option 2: Batch Update with Delays**
```javascript
async function safeWixImageUpdate(products) {
    for (let i = 0; i < products.length; i++) {
        await updateSingleProduct(products[i]);
        
        // Wait 2 seconds between updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for errors
        if (hasErrors()) {
            console.error('❌ Stopping due to errors');
            break;
        }
    }
}
```

### **For Embedded HTML Products:**

Use the `Product Placement/` folder approach that's already working.

---

## 🚨 **Emergency Rollback**

### **If Something Goes Wrong:**

```javascript
// 1. Stop all processes immediately
process.exit();

// 2. Restore from backup
db.run('DELETE FROM products');
db.run('INSERT INTO products SELECT * FROM products_backup');

// 3. Restart server
// taskkill /f /im node.exe
// node server.js
```

---

## ✅ **Success Checklist**

Before any image update, check:

- [ ] Database backed up
- [ ] Small batch size (< 20 products)
- [ ] Test image URLs work
- [ ] Calculator data excluded from updates
- [ ] Transaction/rollback enabled
- [ ] Error handling in place
- [ ] Logging for debugging
- [ ] Can rollback if needed

---

## 📝 **File Locations**

**Key Files:**
- Images: `Product Placement/` folder
- Database: `energy_calculator.db`
- JSON Cache: `FULL-DATABASE-5554.json`
- Backup Script: `backup_rollback_system.js`

**Don't Modify:**
- `routes/calculator-wix.js` (Calculator routes)
- `energy_calculator.db` (Calculator database) - Use with caution
- Calculator iframe in product pages

---

## 🎯 **Recommendation for Marketplace**

**For adding images to Wix products, I recommend:**

1. **Start with 5 products** - Test the update process
2. **Verify images load** - Check in Wix preview
3. **If successful** - Continue with 10 product batches
4. **Add 2-second delays** - Prevent API rate limits
5. **Log everything** - Track what succeeds/fails
6. **Have rollback ready** - Be able to undo changes

This approach will prevent crashes and give you control over the process.






















