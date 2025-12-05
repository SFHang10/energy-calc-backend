const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking which products are actually being loaded by the frontend...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// The frontend filters products using this logic (from category-product-page.html)
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
    
    console.log(`Found ${rows.length} products that match the frontend filter:`);
    console.log('================================================================================');
    
    rows.forEach((product, index) => {
        const hasRealImage = product.image_url && product.image_url.includes('localhost:4000');
        const hasPlaceholder = product.image_url && product.image_url.includes('placeholder');
        const hasNoImage = !product.image_url || product.image_url === '';
        
        let status = '';
        if (hasRealImage) status = '✅ REAL IMAGE';
        else if (hasPlaceholder) status = '⚠️ PLACEHOLDER';
        else if (hasNoImage) status = '❌ NO IMAGE';
        else status = '❓ OTHER';
        
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Status: ${status}`);
        console.log(`   Image URL: ${product.image_url || 'NULL'}`);
        console.log('');
    });
    
    db.close();
});



















