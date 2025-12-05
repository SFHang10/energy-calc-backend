const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔄 Syncing image URLs from database to JSON file...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

// Load the JSON file
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const products = data.products || [];

console.log(`📋 JSON file has ${products.length} products`);

// Get all products with images from database
db.all(`
    SELECT name, brand, imageUrl
    FROM products
    WHERE imageUrl IS NOT NULL AND imageUrl != ''
`, (err, dbProducts) => {
    if (err) {
        console.error('Error getting database products:', err);
        return;
    }
    
    console.log(`📋 Database has ${dbProducts.length} products with images`);
    
    let updatedCount = 0;
    
    // Update JSON products with database image URLs
    products.forEach(jsonProduct => {
        const dbProduct = dbProducts.find(db => 
            db.name === jsonProduct.name && 
            db.brand === jsonProduct.brand
        );
        
        if (dbProduct && dbProduct.imageUrl) {
            jsonProduct.imageUrl = dbProduct.imageUrl;
            updatedCount++;
            console.log(`✅ Updated ${jsonProduct.name} (${jsonProduct.brand})`);
        }
    });
    
    console.log(`\n📊 Updated ${updatedCount} products with image URLs`);
    
    // Save the updated JSON file
    const updatedData = {
        ...data,
        products: products,
        metadata: {
            ...data.metadata,
            lastImageUpdate: new Date().toISOString(),
            updatedProducts: updatedCount
        }
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2));
    console.log(`\n💾 Saved updated JSON file: ${jsonPath}`);
    
    // Verify the update
    const foodserviceProducts = products.filter(p => 
        (p.name && (
            p.name.toLowerCase().includes('oven') || 
            p.name.toLowerCase().includes('steam') || 
            p.name.toLowerCase().includes('dishwasher') || 
            p.name.toLowerCase().includes('combination') || 
            p.name.toLowerCase().includes('convection') || 
            p.name.toLowerCase().includes('undercounter') || 
            p.name.toLowerCase().includes('hood-type') || 
            p.name.toLowerCase().includes('foodservice')
        )) ||
        (p.brand && (
            p.brand.toLowerCase().includes('electrolux') || 
            p.brand.toLowerCase().includes('lainox') || 
            p.brand.toLowerCase().includes('eloma') || 
            p.brand.toLowerCase().includes('lincat')
        ))
    );
    
    const withImages = foodserviceProducts.filter(p => p.image_url && p.image_url !== '').length;
    const withoutImages = foodserviceProducts.length - withImages;
    
    console.log(`\n🎯 Professional Foodservice Products Status:`);
    console.log(`   Products with images: ${withImages}`);
    console.log(`   Products without images: ${withoutImages}`);
    console.log(`   Total products: ${foodserviceProducts.length}`);
    
    if (withImages > 0) {
        console.log(`\n✅ SUCCESS! Images are now available in the JSON file.`);
        console.log(`   The category page should now show real product images.`);
        console.log(`   Test: http://localhost:4000/category-product-page.html?category=professional-foodservice`);
    }
    
    db.close();
});
