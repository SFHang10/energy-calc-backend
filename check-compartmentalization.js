// Check product compartmentalization
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/energy_calculator_central.db');

console.log('📊 PRODUCT COMPARTMENTALIZATION ANALYSIS\n');

// Check categories
db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
    if (err) {
        console.log('Error:', err.message);
        return;
    }
    
    console.log('📂 MAIN CATEGORIES:');
    rows.forEach(row => {
        console.log(`   ${row.category}: ${row.count} products`);
    });
    
    console.log('\n📂 SUBCATEGORIES:');
    
    // Check subcategories
    db.all('SELECT subcategory, COUNT(*) as count FROM products WHERE subcategory IS NOT NULL AND subcategory != "" GROUP BY subcategory ORDER BY count DESC LIMIT 20', (err, subRows) => {
        if (err) {
            console.log('Error:', err.message);
            return;
        }
        
        subRows.forEach(row => {
            console.log(`   ${row.subcategory}: ${row.count} products`);
        });
        
        console.log('\n🏷️ TOP BRANDS BY CATEGORY:');
        
        // Check brands by category
        db.all('SELECT category, brand, COUNT(*) as count FROM products GROUP BY category, brand ORDER BY category, count DESC', (err, brandRows) => {
            if (err) {
                console.log('Error:', err.message);
                return;
            }
            
            let currentCategory = '';
            brandRows.forEach(row => {
                if (row.category !== currentCategory) {
                    console.log(`\n   ${row.category}:`);
                    currentCategory = row.category;
                }
                console.log(`     ${row.brand}: ${row.count} products`);
            });
            
            console.log('\n✅ COMPARTMENTALIZATION SUMMARY:');
            console.log(`   Total Products: ${rows.reduce((sum, row) => sum + row.count, 0)}`);
            console.log(`   Main Categories: ${rows.length}`);
            console.log(`   Subcategories: ${subRows.length}`);
            console.log(`   Brands: ${[...new Set(brandRows.map(r => r.brand))].length}`);
            
            // Check if compartmentalization is sufficient
            const etlProducts = rows.find(r => r.category === 'ETL Technology');
            if (etlProducts && etlProducts.count > 5000) {
                console.log('\n⚠️  POTENTIAL ISSUE:');
                console.log(`   ETL Technology has ${etlProducts.count} products (${Math.round(etlProducts.count/rows.reduce((sum, row) => sum + row.count, 0)*100)}% of total)`);
                console.log('   This might need further subcategorization for better filtering');
            }
            
            db.close();
        });
    });
});






