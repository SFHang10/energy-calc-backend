const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('📦 Example ETL Product for Wix Sync...\n');

// Get one good example product
db.get(`
    SELECT name, brand, category, subcategory, image_url, power, energy_rating, id
    FROM products
    WHERE source = 'ETL'
    AND name NOT LIKE 'SK %'
    AND name NOT LIKE 'ETL Certified%'
    AND image_url IS NOT NULL
    AND name LIKE '%motor%'
    LIMIT 1
`, (err, row) => {
    if (err) {
        console.error('Error:', err);
    } else if (row) {
        console.log('🎯 EXAMPLE: How this ETL product will appear in your Wix store:');
        console.log('='.repeat(80));
        console.log('');
        console.log('📝 PRODUCT NAME:');
        console.log(`   ${row.name}`);
        console.log('');
        console.log('🏷️  PRODUCT DETAILS:');
        console.log(`   Brand: ${row.brand}`);
        console.log(`   Category: ${row.category}`);
        console.log(`   Subcategory: ${row.subcategory}`);
        console.log(`   Power: ${row.power}W`);
        console.log(`   Energy Rating: ${row.energy_rating}`);
        console.log('');
        console.log('🖼️  PRODUCT IMAGE:');
        console.log(`   ${row.image_url}`);
        console.log('');
        console.log('📄 DESCRIPTION (using your detailed format):');
        console.log('   Professional Energy-Efficient Motor System');
        console.log(`   ${row.brand} - High-performance ${row.name.toLowerCase()} with ${row.power}W power rating`);
        console.log(`   ETL Certified ${row.category} - ${row.subcategory}`);
        console.log(`   Energy Rating: ${row.energy_rating} - Optimized for commercial and industrial applications`);
        console.log('   Features advanced efficiency technology and reliable performance');
        console.log('   Ideal for HVAC systems, industrial equipment, and energy-conscious installations');
        console.log('');
        console.log('💰 PRICING:');
        console.log('   €[Price to be set]');
        console.log('');
        console.log('📦 SKU:');
        console.log(`   ${row.id}`);
        console.log('');
        console.log('='.repeat(80));
        console.log('');
        console.log('✅ This is much better than the old SKU codes!');
        console.log('✅ Has a real product image from ETL');
        console.log('✅ Uses your detailed description format');
        console.log('✅ Easy to identify and find photos for');
        
    } else {
        console.log('❌ No suitable example found');
    }
    
    db.close();
});






