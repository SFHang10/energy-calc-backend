const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        return;
    }
    console.log('✅ Connected to database:', dbPath);
});

// Check sample_4 specifically
console.log('\n🔍 Checking sample_4 product:');
db.get(
    "SELECT id, name, brand, category, image_url FROM products WHERE id = 'sample_4' LIMIT 1",
    (err, row) => {
        if (err) {
            console.error('❌ Error:', err);
        } else if (row) {
            console.log('  ID:', row.id);
            console.log('  Name:', row.name);
            console.log('  Brand:', row.brand || 'N/A');
            console.log('  Category:', row.category || 'N/A');
            console.log('  image_url:', row.image_url || 'NULL/EMPTY');
            console.log('  image_url type:', typeof row.image_url);
            console.log('  image_url length:', row.image_url ? row.image_url.length : 0);
            if (row.image_url) {
                console.log('  image_url starts with:', row.image_url.substring(0, 50) + '...');
            }
        } else {
            console.log('  ❌ Product sample_4 not found');
        }
    }
);

// Check a few more products to see pattern
console.log('\n🔍 Checking first 10 products with image_url:');
db.all(
    "SELECT id, name, brand, category, image_url FROM products WHERE image_url IS NOT NULL AND image_url != '' LIMIT 10",
    (err, rows) => {
        if (err) {
            console.error('❌ Error:', err);
        } else {
            console.log(`✅ Found ${rows.length} products with image_url:`);
            rows.forEach((row, index) => {
                console.log(`\n  ${index + 1}. ${row.name} (${row.id})`);
                console.log(`     Brand: ${row.brand || 'N/A'}`);
                console.log(`     Category: ${row.category || 'N/A'}`);
                console.log(`     image_url: ${row.image_url.substring(0, 80)}${row.image_url.length > 80 ? '...' : ''}`);
            });
        }
        
        // Now check products WITHOUT image_url
        console.log('\n🔍 Checking first 10 products WITHOUT image_url:');
        db.all(
            "SELECT id, name, brand, category FROM products WHERE image_url IS NULL OR image_url = '' LIMIT 10",
            (err, noImageRows) => {
                if (err) {
                    console.error('❌ Error:', err);
                } else {
                    console.log(`⚠️  Found ${noImageRows.length} products WITHOUT image_url:`);
                    noImageRows.forEach((row, index) => {
                        console.log(`  ${index + 1}. ${row.name} (${row.id}) - ${row.category || 'N/A'}`);
                    });
                }
                
                // Check what API actually returns
                console.log('\n🔍 Testing API response for sample_4:');
                console.log('  (This would check /api/product-widget/sample_4)');
                console.log('  Need to verify if API returns image_url correctly');
                
                db.close();
            }
        );
    }
);








