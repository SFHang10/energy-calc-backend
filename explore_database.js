const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Exploring Energy Calculator Database...\n');

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error getting tables:', err.message);
        return;
    }
    
    console.log('📊 Tables found:');
    tables.forEach(table => {
        console.log(`   - ${table.name}`);
    });
    
    console.log('\n🔍 Exploring products table structure...');
    
    // Get products table structure
    db.all("PRAGMA table_info(products)", (err, columns) => {
        if (err) {
            console.error('❌ Error getting products structure:', err.message);
            return;
        }
        
        console.log('\n📋 Products table columns:');
        columns.forEach(col => {
            console.log(`   ${col.name} (${col.type})`);
        });
        
        // Get sample products
        console.log('\n🔍 Sample products (first 5):');
        db.all("SELECT * FROM products LIMIT 5", (err, products) => {
            if (err) {
                console.error('❌ Error getting sample products:', err.message);
                return;
            }
            
            products.forEach(product => {
                console.log(`   ID: ${product.id} | Name: ${product.name} | Type: ${product.type}`);
            });
            
            // Get total count
            db.get("SELECT COUNT(*) as total FROM products", (err, count) => {
                if (err) {
                    console.error('❌ Error getting count:', err.message);
                    return;
                }
                
                console.log(`\n📊 Total products in database: ${count.total}`);
                
                // Get product types breakdown
                console.log('\n📈 Product types breakdown:');
                db.all("SELECT type, COUNT(*) as count FROM products GROUP BY type ORDER BY count DESC", (err, types) => {
                    if (err) {
                        console.error('❌ Error getting types:', err.message);
                        return;
                    }
                    
                    types.forEach(type => {
                        console.log(`   ${type.type}: ${type.count} products`);
                    });
                    
                    db.close();
                    console.log('\n✅ Database exploration complete!');
                });
            });
        });
    });
});








