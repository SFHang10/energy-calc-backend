const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking ALL professional-foodservice products with images...');

db.all(`
    SELECT name, brand, imageUrl 
    FROM products 
    WHERE category = 'professional-foodservice'
    ORDER BY brand, name
`, (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
    } else {
        const withImages = rows.filter(r => r.imageUrl && r.imageUrl !== '');
        const withoutImages = rows.filter(r => !r.imageUrl || r.imageUrl === '');
        
        console.log(`\n📊 Professional Foodservice Products Status:`);
        console.log(`   Total products: ${rows.length}`);
        console.log(`   Products with images: ${withImages.length}`);
        console.log(`   Products without images: ${withoutImages.length}`);
        
        console.log(`\n✅ Products WITH images:`);
        withImages.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.name} (${row.brand})`);
        });
        
        if (withoutImages.length > 0) {
            console.log(`\n❌ Products WITHOUT images:`);
            withoutImages.forEach((row, index) => {
                console.log(`   ${index + 1}. ${row.name} (${row.brand})`);
            });
        }
        
        console.log(`\n🌐 Test the preview page:`);
        console.log(`   http://localhost:4000/category-product-page.html?category=professional-foodservice`);
    }
    db.close();
});



















