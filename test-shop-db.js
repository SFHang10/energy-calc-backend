// Test script to check shop database connection and structure
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Testing shop database connection...');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
console.log(`📁 Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

// Test basic connection
db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        return;
    }
    console.log('✅ Database connected successfully');
    
    // Get all table names
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('❌ Error getting tables:', err);
            return;
        }
        
        console.log('📋 Available tables:');
        tables.forEach(table => {
            console.log(`   - ${table.name}`);
        });
        
        // Check if products table exists and get its schema
        db.all("PRAGMA table_info(products)", (err, columns) => {
            if (err) {
                console.error('❌ Error getting products table info:', err);
                return;
            }
            
            if (columns.length === 0) {
                console.log('⚠️ Products table does not exist');
            } else {
                console.log('📊 Products table columns:');
                columns.forEach(col => {
                    console.log(`   - ${col.name} (${col.type})`);
                });
                
                // Test the query we're using in shop-products
                const testQuery = `
                    SELECT 
                        id,
                        name,
                        brand as manufacturer,
                        category,
                        subcategory,
                        power as power_consumption,
                        energy_rating as energy_efficiency_rating,
                        running_cost_per_year as price,
                        image_url,
                        model_number as description,
                        source,
                        efficiency,
                        capacity_kg,
                        water_per_cycle_liters,
                        water_per_year_liters,
                        place_settings
                    FROM products 
                    ORDER BY category, name
                    LIMIT 5
                `;
                
                db.all(testQuery, [], (err, rows) => {
                    if (err) {
                        console.error('❌ Error testing shop query:', err);
                        console.error('Query:', testQuery);
                    } else {
                        console.log(`✅ Shop query successful! Found ${rows.length} products`);
                        if (rows.length > 0) {
                            console.log('📦 Sample product:', rows[0]);
                        }
                    }
                    
                    db.close();
                });
            }
        });
    });
});
