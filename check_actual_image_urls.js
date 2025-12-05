const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking what image_url values are actually in the database...\n');

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
    
    console.log(`Found ${rows.length} products:`);
    console.log('================================================================================');
    
    rows.forEach((product, index) => {
        const hasImage = product.image_url && product.image_url !== '';
        const status = hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE';
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Status: ${status}`);
        console.log(`   Image URL: ${product.image_url || 'NULL/EMPTY'}`);
        console.log('');
    });
    
    db.close();
});



















