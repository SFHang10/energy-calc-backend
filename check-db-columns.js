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

// Check table structure
console.log('\n🔍 Checking products table structure:');
db.all(
    "PRAGMA table_info(products)",
    (err, columns) => {
        if (err) {
            console.error('❌ Error:', err);
            db.close();
            return;
        }
        
        console.log(`\n✅ Found ${columns.length} columns in products table:\n`);
        columns.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
        });
        
        // Check for image-related columns
        console.log('\n🔍 Looking for image-related columns:');
        const imageColumns = columns.filter(col => 
            col.name.toLowerCase().includes('image') || 
            col.name.toLowerCase().includes('img') ||
            col.name.toLowerCase().includes('url')
        );
        
        if (imageColumns.length > 0) {
            console.log(`✅ Found ${imageColumns.length} image-related column(s):`);
            imageColumns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
            });
        } else {
            console.log('⚠️  No image-related columns found!');
        }
        
        // Now check sample_4 with correct columns
        console.log('\n🔍 Checking sample_4 product:');
        db.get(
            `SELECT * FROM products WHERE id = 'sample_4' LIMIT 1`,
            (err, row) => {
                if (err) {
                    console.error('❌ Error:', err);
                } else if (row) {
                    console.log('\n✅ Product found:');
                    console.log('  ID:', row.id);
                    console.log('  Name:', row.name);
                    console.log('\n📋 All columns for sample_4:');
                    Object.keys(row).forEach(key => {
                        const value = row[key];
                        if (key.toLowerCase().includes('image') || key.toLowerCase().includes('url')) {
                            console.log(`  ⭐ ${key}: ${value || 'NULL/EMPTY'}`);
                        } else {
                            console.log(`  ${key}: ${value || 'NULL/EMPTY'}`);
                        }
                    });
                } else {
                    console.log('❌ Product sample_4 not found');
                }
                
                db.close();
            }
        );
    }
);








