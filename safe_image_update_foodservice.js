const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Safe Image Update for Professional Foodservice Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Products that need images (from our analysis)
const productsNeedingImages = [
    { name: 'Electrolux EI30EF55QS 30" Single Wall Oven', brand: 'Electrolux' },
    { name: 'Frigidaire Gallery FGEW3065UF 30" Wall Oven', brand: 'Frigidaire' },
    { name: 'GE Profile P2B940YPFS 30" Double Wall Oven', brand: 'GE' },
    { name: 'Hisense Dishwasher', brand: 'Hisense' },
    { name: 'KitchenAid KODE500ESS 30" Double Wall Oven', brand: 'KitchenAid' },
    { name: 'LG LDE4413ST 30" Double Wall Oven', brand: 'LG' },
    { name: 'Maytag MWO5105BZ 30" Single Wall Oven', brand: 'Maytag' },
    { name: 'Samsung NE58K9430WS 30" Wall Oven', brand: 'Samsung' },
    { name: 'Whirlpool WOD51HZES 30" Double Wall Oven', brand: 'Whirlpool' }
];

// Placeholder images (clean, white theme compatible)
const placeholderImages = {
    'Electrolux': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Electrolux+Oven',
    'Frigidaire': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Frigidaire+Oven',
    'GE': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=GE+Oven',
    'Hisense': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Hisense+Dishwasher',
    'KitchenAid': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=KitchenAid+Oven',
    'LG': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=LG+Oven',
    'Maytag': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Maytag+Oven',
    'Samsung': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Samsung+Oven',
    'Whirlpool': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Whirlpool+Oven'
};

async function updateProductImages() {
    console.log('🔄 Updating product images...\n');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const product of productsNeedingImages) {
        const placeholderUrl = placeholderImages[product.brand];
        
        if (!placeholderUrl) {
            console.log(`❌ No placeholder image found for brand: ${product.brand}`);
            errorCount++;
            continue;
        }
        
        // Update database with placeholder image
        db.run(
            'UPDATE products SET image_url = ? WHERE name = ? AND brand = ?',
            [placeholderUrl, product.name, product.brand],
            function(err) {
                if (err) {
                    console.error(`❌ Error updating ${product.name}:`, err.message);
                    errorCount++;
                } else {
                    console.log(`✅ Updated ${product.name} with placeholder image`);
                    console.log(`   Image URL: ${placeholderUrl}`);
                    updatedCount++;
                }
            }
        );
    }
    
    // Wait a moment for all updates to complete
    setTimeout(() => {
        console.log('\n📊 Update Summary:');
        console.log(`   Products updated: ${updatedCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`   Total processed: ${productsNeedingImages.length}`);
        
        if (updatedCount > 0) {
            console.log('\n🎯 Next Steps:');
            console.log('1. Test the category page: http://localhost:4000/category-product-page.html?category=professional-foodservice');
            console.log('2. Verify that flashing has stopped');
            console.log('3. Check that all products now show images');
        }
        
        db.close();
    }, 1000);
}

// Check current status first
console.log('🔍 Current Status Check:');
db.all(`
    SELECT name, brand, image_url
    FROM products
    WHERE name IN (${productsNeedingImages.map(() => '?').join(',')})
    ORDER BY brand, name
`, productsNeedingImages.map(p => p.name), (err, rows) => {
    if (err) {
        console.error('Error checking current status:', err);
        return;
    }
    
    console.log(`Found ${rows.length} products in database:`);
    rows.forEach((product, index) => {
        const hasImage = product.image_url && product.image_url !== '';
        const status = hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE';
        console.log(`${index + 1}. ${product.name} - ${status}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('Starting image update process...\n');
    
    updateProductImages();
});
