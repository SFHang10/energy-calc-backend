const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Manual Image URL Update for Professional Foodservice Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Products that need real images (replace placeholder URLs with real ones)
const productsNeedingRealImages = [
    { name: 'Electrolux EI30EF55QS 30" Single Wall Oven', brand: 'Electrolux', imageUrl: '' },
    { name: 'Frigidaire Gallery FGEW3065UF 30" Wall Oven', brand: 'Frigidaire', imageUrl: '' },
    { name: 'GE Profile P2B940YPFS 30" Double Wall Oven', brand: 'GE', imageUrl: '' },
    { name: 'Hisense Dishwasher', brand: 'Hisense', imageUrl: '' },
    { name: 'KitchenAid KODE500ESS 30" Double Wall Oven', brand: 'KitchenAid', imageUrl: '' },
    { name: 'LG LDE4413ST 30" Double Wall Oven', brand: 'LG', imageUrl: '' },
    { name: 'Maytag MWO5105BZ 30" Single Wall Oven', brand: 'Maytag', imageUrl: '' },
    { name: 'Samsung NE58K9430WS 30" Wall Oven', brand: 'Samsung', imageUrl: '' },
    { name: 'Whirlpool WOD51HZES 30" Double Wall Oven', brand: 'Whirlpool', imageUrl: '' }
];

// Function to update a single product image
function updateProductImage(productName, brand, imageUrl) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE products SET image_url = ? WHERE name = ? AND brand = ?',
            [imageUrl, productName, brand],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
}

// Function to update multiple products
async function updateMultipleProducts(products) {
    console.log('🔄 Updating product images with real URLs...\n');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
        if (!product.imageUrl || product.imageUrl === '') {
            console.log(`⏭️ Skipping ${product.name} - no image URL provided`);
            continue;
        }
        
        try {
            const changes = await updateProductImage(product.name, product.brand, product.imageUrl);
            if (changes > 0) {
                console.log(`✅ Updated ${product.name}`);
                console.log(`   New Image URL: ${product.imageUrl}`);
                updatedCount++;
            } else {
                console.log(`⚠️ No changes made for ${product.name} - product not found`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${product.name}:`, error.message);
            errorCount++;
        }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`   Products updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total processed: ${products.length}`);
    
    if (updatedCount > 0) {
        console.log('\n🎯 Next Steps:');
        console.log('1. Test the category page: http://localhost:4000/category-product-page.html?category=professional-foodservice');
        console.log('2. Verify that real product images are now showing');
        console.log('3. Check that flashing has completely stopped');
    }
}

// Show current status
console.log('📋 Products ready for real image updates:');
console.log('================================================================================');

productsNeedingRealImages.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Brand: ${product.brand}`);
    console.log(`   Current Image URL: ${product.imageUrl || 'PLACEHOLDER'}`);
    console.log('');
});

console.log('💡 To use this script:');
console.log('1. Find real product images from manufacturer websites');
console.log('2. Update the imageUrl field for each product above');
console.log('3. Run: node update_real_images_foodservice.js');
console.log('');
console.log('🔍 Good sources for product images:');
console.log('   - Manufacturer websites (Electrolux, Frigidaire, GE, etc.)');
console.log('   - Product catalogs');
console.log('   - ETL database (if available)');
console.log('   - Stock photo sites (for generic appliance images)');

// If you want to update specific products, uncomment and modify this section:
/*
// Example: Update specific products with real image URLs
const productsToUpdate = [
    { name: 'Electrolux EI30EF55QS 30" Single Wall Oven', brand: 'Electrolux', imageUrl: 'https://example.com/electrolux-oven.jpg' },
    { name: 'Samsung NE58K9430WS 30" Wall Oven', brand: 'Samsung', imageUrl: 'https://example.com/samsung-oven.jpg' }
];

updateMultipleProducts(productsToUpdate).then(() => {
    db.close();
}).catch((error) => {
    console.error('Error:', error);
    db.close();
});
*/

db.close();



















