const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Check products with missing or broken images
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking professional-foodservice products for image issues...\n');

db.all(`
    SELECT id, name, brand, imageUrl, category
    FROM products 
    WHERE category = 'professional-foodservice'
    ORDER BY name
`, (err, products) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }

    console.log(`📊 Found ${products.length} professional-foodservice products\n`);

    let missingImages = 0;
    let placeholderImages = 0;
    let localImages = 0;
    let externalImages = 0;

    products.forEach(product => {
        const imageUrl = product.imageUrl;
        
        if (!imageUrl || imageUrl === '' || imageUrl === null) {
            console.log(`❌ Missing image: ${product.name} (${product.brand})`);
            missingImages++;
        } else if (imageUrl.includes('via.placeholder.com')) {
            console.log(`🖼️ Placeholder: ${product.name} (${product.brand})`);
            placeholderImages++;
        } else if (imageUrl.includes('localhost:4000') || imageUrl.startsWith('/') || imageUrl.startsWith('product-media')) {
            console.log(`✅ Local image: ${product.name} (${product.brand}) - ${imageUrl}`);
            localImages++;
        } else {
            console.log(`🌐 External image: ${product.name} (${product.brand}) - ${imageUrl}`);
            externalImages++;
        }
    });

    console.log('\n📈 Summary:');
    console.log(`- Missing images: ${missingImages}`);
    console.log(`- Placeholder images: ${placeholderImages}`);
    console.log(`- Local images: ${localImages}`);
    console.log(`- External images: ${externalImages}`);
    console.log(`- Total products: ${products.length}`);

    db.close();
});



















