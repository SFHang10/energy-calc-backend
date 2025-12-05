const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔍 Identifying missing professional-foodservice products...');

// Load JSON products
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const jsonProducts = jsonData.products.filter(p => p.category === 'professional-foodservice');
const jsonProductNames = jsonProducts.map(p => p.name.toLowerCase());

console.log(`📋 JSON file has ${jsonProducts.length} professional-foodservice products`);

// Connect to ETL database
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

db.all(`
    SELECT name, brand, imageUrl, category, power, energyRating, price
    FROM products 
    WHERE category = 'professional-foodservice'
    ORDER BY brand, name
`, (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
    } else {
        console.log(`📋 ETL database has ${rows.length} professional-foodservice products`);
        
        // Find missing products
        const missingProducts = rows.filter(etlProduct => 
            !jsonProductNames.includes(etlProduct.name.toLowerCase())
        );
        
        console.log(`\n🔄 Missing products (${missingProducts.length}):`);
        missingProducts.forEach((product, index) => {
            const hasImage = product.imageUrl ? '✅ HAS IMAGE' : '❌ NO IMAGE';
            console.log(`${index + 1}. ${product.name} (${product.brand}) - ${hasImage}`);
            if (product.imageUrl) {
                console.log(`   Image URL: ${product.imageUrl}`);
            }
        });
        
        // Group by brand for easier processing
        const brandsNeedingWork = {};
        missingProducts.forEach(product => {
            if (!brandsNeedingWork[product.brand]) {
                brandsNeedingWork[product.brand] = [];
            }
            brandsNeedingWork[product.brand].push(product);
        });
        
        console.log(`\n🏷️ Products grouped by brand:`);
        Object.entries(brandsNeedingWork).forEach(([brand, products]) => {
            console.log(`\n${brand} (${products.length} products):`);
            products.forEach(product => {
                const hasImage = product.imageUrl ? '✅' : '❌';
                console.log(`  ${hasImage} ${product.name}`);
            });
        });
        
        console.log(`\n📝 Next steps:`);
        console.log(`1. Validate these products for grants eligibility`);
        console.log(`2. Check collections agencies compatibility`);
        console.log(`3. Add to JSON file with hardcoded data`);
        console.log(`4. Add images (ETL URLs or manual uploads)`);
    }
    
    db.close();
});



















