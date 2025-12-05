const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking ALL professional foodservice products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

db.all(`
    SELECT name, brand, image_url
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
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log(`Found ${rows.length} total professional foodservice products:`);
    console.log('================================================================================');
    
    const withImages = rows.filter(p => p.image_url && p.image_url !== '' && !p.image_url.includes('placeholder')).length;
    const withPlaceholders = rows.filter(p => p.image_url && p.image_url.includes('placeholder')).length;
    const withoutImages = rows.filter(p => !p.image_url || p.image_url === '').length;
    
    console.log(`📊 Image Status:`);
    console.log(`   Products with real images: ${withImages}`);
    console.log(`   Products with placeholder images: ${withPlaceholders}`);
    console.log(`   Products without images: ${withoutImages}`);
    console.log(`   Total products: ${rows.length}`);
    
    console.log('\n🔍 Products still showing placeholder images:');
    rows.forEach((product, index) => {
        if (product.image_url && product.image_url.includes('placeholder')) {
            console.log(`${index + 1}. ${product.name} - ${product.image_url}`);
        }
    });
    
    console.log('\n🔍 Products without any images:');
    rows.forEach((product, index) => {
        if (!product.image_url || product.image_url === '') {
            console.log(`${index + 1}. ${product.name} - NO IMAGE`);
        }
    });
    
    db.close();
});



















