const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Adding Real Product Images to Professional Foodservice Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Products with their real image URLs (served from localhost:4000)
const productsWithRealImages = [
    { 
        name: 'Electrolux EI30EF55QS 30" Single Wall Oven', 
        brand: 'Electrolux', 
        imageUrl: 'http://localhost:4000/product-images/Electrolux EI30EF55QS 30 Single Wall Oven.jpg' 
    },
    { 
        name: 'Frigidaire Gallery FGEW3065UF 30" Wall Oven', 
        brand: 'Frigidaire', 
        imageUrl: 'http://localhost:4000/product-images/Frigidaire Gallery FGEW3065UF 30 Wall Oven.jpg' 
    },
    { 
        name: 'GE Profile P2B940YPFS 30" Double Wall Oven', 
        brand: 'GE', 
        imageUrl: 'http://localhost:4000/product-images/GE Profile P2B940YPFS 30 Double Wall Oven.jpeg' 
    },
    { 
        name: 'Hisense Dishwasher', 
        brand: 'Hisense', 
        imageUrl: 'http://localhost:4000/product-images/Hisense Dishwasher.jpg' 
    },
    { 
        name: 'KitchenAid KODE500ESS 30" Double Wall Oven', 
        brand: 'KitchenAid', 
        imageUrl: 'http://localhost:4000/product-images/KitchenAid KODE500ESS 30 Double Wall Oven.jpg' 
    },
    { 
        name: 'LG LDE4413ST 30" Double Wall Oven', 
        brand: 'LG', 
        imageUrl: 'http://localhost:4000/product-images/LG LDE4413ST 30 Double Wall Oven.jpeg' 
    },
    { 
        name: 'Maytag MWO5105BZ 30" Single Wall Oven', 
        brand: 'Maytag', 
        imageUrl: 'http://localhost:4000/product-images/Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg' 
    },
    { 
        name: 'Samsung NE58K9430WS 30" Wall Oven', 
        brand: 'Samsung', 
        imageUrl: 'http://localhost:4000/product-images/Samsung NE58K9430WS 30 Wall Oven.jpg' 
    },
    { 
        name: 'Whirlpool WOD51HZES 30" Double Wall Oven', 
        brand: 'Whirlpool', 
        imageUrl: 'http://localhost:4000/product-images/Whirlpool WOD51HZES 30 Double Wall Oven.jpg' 
    }
];

async function updateProductImages() {
    console.log('🔄 Updating product images with real photos...\n');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const product of productsWithRealImages) {
        // Update database with real image URL
        db.run(
            'UPDATE products SET image_url = ? WHERE name = ? AND brand = ?',
            [product.imageUrl, product.name, product.brand],
            function(err) {
                if (err) {
                    console.error(`❌ Error updating ${product.name}:`, err.message);
                    errorCount++;
                } else {
                    console.log(`✅ Updated ${product.name}`);
                    console.log(`   Real Image URL: ${product.imageUrl}`);
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
        console.log(`   Total processed: ${productsWithRealImages.length}`);
        
        if (updatedCount > 0) {
            console.log('\n🎯 Next Steps:');
            console.log('1. Test the category page: http://localhost:4000/category-product-page.html?category=professional-foodservice');
            console.log('2. Verify that flashing has stopped');
            console.log('3. Check that all products now show real product images');
            console.log('4. Confirm images load properly from: http://localhost:4000/product-images/');
        }
        
        db.close();
    }, 1000);
}

// Show what will be updated
console.log('📋 Products that will be updated with real images:');
console.log('================================================================================');

productsWithRealImages.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Brand: ${product.brand}`);
    console.log(`   Image URL: ${product.imageUrl}`);
    console.log('');
});

console.log('🚀 Starting update process...\n');
updateProductImages();



















