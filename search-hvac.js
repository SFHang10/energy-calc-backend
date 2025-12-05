// Check for HVAC/Heat Pump products in different ways
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Searching for HVAC/Heat Pump products...');

// Search in name, category, subcategory
const searchQuery = `
    SELECT id, name, category, subcategory, brand
    FROM products 
    WHERE (
        name LIKE '%heat pump%' OR 
        name LIKE '%HVAC%' OR 
        name LIKE '%air conditioning%' OR
        name LIKE '%heating%' OR
        name LIKE '%cooling%' OR
        category LIKE '%heat pump%' OR 
        category LIKE '%HVAC%' OR 
        category LIKE '%air conditioning%' OR
        subcategory LIKE '%heat pump%' OR 
        subcategory LIKE '%HVAC%' OR 
        subcategory LIKE '%air conditioning%'
    )
    AND category != 'Comparison Data'
    ORDER BY category, name
    LIMIT 20
`;

db.all(searchQuery, [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    console.log(`🔍 Found ${rows.length} HVAC/Heat Pump related products:`);
    rows.forEach(product => {
        console.log(`   - ${product.name} (${product.category}/${product.subcategory}) - ${product.brand}`);
    });
    
    // Also check all subcategories to see what's available
    console.log('\n📋 All subcategories:');
    db.all("SELECT DISTINCT subcategory FROM products WHERE subcategory IS NOT NULL ORDER BY subcategory", (err, subcats) => {
        subcats.forEach(subcat => {
            console.log(`   - ${subcat.subcategory}`);
        });
        
        db.close();
    });
});
