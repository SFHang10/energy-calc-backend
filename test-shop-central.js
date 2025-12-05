// Test the updated shop database connection
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Testing updated shop database connection...');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
console.log(`📁 Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

// Test the updated query
const query = `
    SELECT 
        id,
        name,
        brand as manufacturer,
        category,
        subcategory,
        power as power_consumption,
        energyRating as energy_efficiency_rating,
        price,
        imageUrl as image_url,
        modelNumber as description,
        sku,
        efficiency,
        runningCostPerYear,
        descriptionShort,
        descriptionFull,
        specifications,
        marketingInfo,
        productPageUrl,
        affiliateInfo
    FROM products 
    WHERE category != 'Comparison Data'
    AND category IS NOT NULL
    ORDER BY category, name
`;

db.all(query, [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    console.log(`✅ Query successful! Found ${rows.length} products`);
    
    // Group by category
    const categories = {};
    rows.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });
    
    console.log('\n📊 Products by category:');
    Object.keys(categories).sort().forEach(category => {
        console.log(`   - ${category}: ${categories[category].length} products`);
        
        // Show sample products for key categories
        if (category.includes('HVAC') || category.includes('Heat Pump') || category.includes('Motor') || category.includes('ETL')) {
            console.log(`     Sample: ${categories[category].slice(0, 3).map(p => p.name).join(', ')}`);
        }
    });
    
    // Check for HVAC/Heat Pump products specifically
    const hvacProducts = rows.filter(p => 
        p.category.toLowerCase().includes('hvac') || 
        p.category.toLowerCase().includes('heat pump') ||
        p.category.toLowerCase().includes('air conditioning')
    );
    
    console.log(`\n🌡️ HVAC/Heat Pump products: ${hvacProducts.length}`);
    if (hvacProducts.length > 0) {
        console.log(`   Sample: ${hvacProducts.slice(0, 5).map(p => p.name).join(', ')}`);
    }
    
    // Check for Motor products
    const motorProducts = rows.filter(p => 
        p.category.toLowerCase().includes('motor') ||
        p.subcategory.toLowerCase().includes('motor')
    );
    
    console.log(`\n⚙️ Motor products: ${motorProducts.length}`);
    if (motorProducts.length > 0) {
        console.log(`   Sample: ${motorProducts.slice(0, 5).map(p => p.name).join(', ')}`);
    }
    
    db.close();
});
