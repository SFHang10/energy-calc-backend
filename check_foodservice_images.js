const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking Professional Foodservice Products for Image Issues...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

db.all(`
    SELECT name, brand, image_url, category, power, energy_rating
    FROM products
    WHERE (
        name LIKE '%oven%' OR 
        name LIKE '%steam%' OR 
        name LIKE '%dishwasher%' OR 
        name LIKE '%combination%' OR 
        name LIKE '%convection%' OR 
        name LIKE '%undercounter%' OR 
        name LIKE '%hood-type%' OR 
        name LIKE '%foodservice%' OR
        brand LIKE '%electrolux%' OR 
        brand LIKE '%lainox%' OR 
        brand LIKE '%eloma%' OR 
        brand LIKE '%lincat%'
    )
    ORDER BY brand, name
    LIMIT 20
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log(`Found ${rows.length} professional foodservice products:`);
    console.log('================================================================================');
    
    rows.forEach((product, index) => {
        const hasImage = product.image_url && product.image_url !== '';
        const imageStatus = hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE';
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Image Status: ${imageStatus}`);
        if (hasImage) {
            console.log(`   Image URL: ${product.image_url}`);
        }
        console.log('');
    });
    
    const withImages = rows.filter(p => p.image_url && p.image_url !== '').length;
    const withoutImages = rows.length - withImages;
    
    console.log(`📊 Summary:`);
    console.log(`   Products with images: ${withImages}`);
    console.log(`   Products without images: ${withoutImages}`);
    console.log(`   Flashing issue: ${withoutImages > 0 ? 'YES - Missing images cause flashing' : 'NO - All products have images'}`);
    
    db.close();
});