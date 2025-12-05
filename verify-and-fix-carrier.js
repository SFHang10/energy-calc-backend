const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔍 VERIFYING AND FIXING CARRIER PRODUCTS');
console.log('='.repeat(70));
console.log('');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

// Step 1: Check what's in database
db.all(`SELECT id, name, imageUrl FROM products WHERE name LIKE '%Carrier%'`, (err, dbProducts) => {
    if (err) {
        console.error('❌ Query error:', err.message);
        db.close();
        return;
    }

    console.log(`📊 Found ${dbProducts.length} Carrier products in database:\n`);
    dbProducts.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
        console.log(`    Current imageUrl: ${p.imageUrl || 'null'}\n`);
    });

    // Step 2: Update database if needed
    const allGlassUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
    const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

    console.log('📝 Updating database...\n');

    // Update "all glass door"
    db.run(
        `UPDATE products SET imageUrl = ? WHERE name = 'Carrier Refrigeration all glass door'`,
        [allGlassUrl],
        function(err) {
            if (err) {
                console.error('❌ Update error:', err.message);
            } else {
                console.log(`✅ Updated "all glass door": ${this.changes} row(s)`);
            }

            // Update "anti-reflective"
            db.run(
                `UPDATE products SET imageUrl = ? WHERE name = 'Carrier Refrigeration anti-reflective all glass door'`,
                [antiReflectiveUrl],
                function(err2) {
                    if (err2) {
                        console.error('❌ Update error:', err2.message);
                    } else {
                        console.log(`✅ Updated "anti-reflective": ${this.changes} row(s)\n`);
                    }

                    // Step 3: Sync to JSON
                    syncToJson();
                }
            );
        }
    );
});

function syncToJson() {
    console.log('📊 Syncing to JSON...\n');

    // Load JSON
    let jsonData;
    try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        jsonData = JSON.parse(jsonContent);
        console.log(`✅ Loaded JSON: ${jsonData.products.length} products`);
    } catch (error) {
        console.error('❌ JSON load error:', error.message);
        db.close();
        return;
    }

    // Get updated products from database
    db.all(`SELECT id, name, imageUrl FROM products WHERE name LIKE '%Carrier%'`, (err, dbProducts) => {
        if (err) {
            console.error('❌ Query error:', err.message);
            db.close();
            return;
        }

        let updated = 0;
        dbProducts.forEach(dbProduct => {
            const jsonProduct = jsonData.products.find(p => p.id === dbProduct.id);
            if (jsonProduct) {
                if (jsonProduct.imageUrl !== dbProduct.imageUrl) {
                    console.log(`✅ Updating JSON: ${jsonProduct.name}`);
                    console.log(`   Old: ${jsonProduct.imageUrl}`);
                    console.log(`   New: ${dbProduct.imageUrl}\n`);
                    jsonProduct.imageUrl = dbProduct.imageUrl;
                    updated++;
                }
            }
        });

        // Save JSON
        if (updated > 0) {
            try {
                fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
                console.log(`\n✅ SUCCESS: Updated ${updated} products in JSON file`);
                console.log('📄 File saved successfully');
            } catch (error) {
                console.error('❌ Save error:', error.message);
            }
        } else {
            console.log('\n⚠️  No products needed updating in JSON');
        }

        db.close();
    });
}

