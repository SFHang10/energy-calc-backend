const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking actual image_url values in database...\n');

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
    LIMIT 5
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('Sample image URLs from database:');
    rows.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Image URL: ${product.image_url}`);
        console.log('');
    });
    
    db.close();
});



















