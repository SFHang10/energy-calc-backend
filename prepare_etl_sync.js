const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Starting Real ETL Product Sync to Wix...\n');

// Get real ETL products with images for sync
db.all(`
    SELECT * FROM products 
    WHERE source = 'ETL' 
    AND name NOT LIKE 'SK %' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    ORDER BY category, name
    LIMIT 5
`, (err, rows) => {
    if (err) {
        console.error('Error querying ETL products:', err);
        return;
    }

    console.log(`✅ Found ${rows.length} real ETL products ready for sync`);
    console.log('='.repeat(80));
    
    rows.forEach((product, index) => {
        // Create detailed description in your preferred format
        const description = `Professional Energy-Efficient ${product.category} System\n` +
                          `${product.subcategory} - High-performance ${product.name.toLowerCase()} with ${product.brand}kW power rating\n` +
                          `ETL Certified ${product.category} - ${product.subcategory}\n` +
                          `Energy Rating: ${product.energy_rating} - Optimized for commercial and industrial applications\n` +
                          `Features advanced efficiency technology and reliable performance\n` +
                          `Ideal for HVAC systems, industrial equipment, and energy-conscious installations`;

        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.subcategory}`);
        console.log(`   Power: ${product.brand}kW`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Energy Rating: ${product.energy_rating}`);
        console.log(`   Image: ${product.image_url}`);
        console.log(`   Description Preview: ${description.substring(0, 100)}...`);
        console.log('-'.repeat(80));
    });

    console.log('\n🎯 These products are ready for Wix sync!');
    console.log('✅ Real product names (not SKU codes)');
    console.log('✅ Detailed descriptions in your preferred format');
    console.log('✅ Real ETL product images');
    console.log('✅ ETL certification and technical specifications');
    
    db.close();
});






