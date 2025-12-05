const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Adding Images to Yesterday\'s Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function getProductsNeedingImages() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, image_url, category, power, energy_rating, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            AND (
                name LIKE '%Baxi%' OR name LIKE '%Auriga%' OR name LIKE '%Quinta Ace%' OR
                name LIKE '%Daikin%' OR name LIKE '%Altherma%' OR
                name LIKE '%Viessmann%' OR name LIKE '%Vitocal%' OR
                name LIKE '%Bosch%' OR name LIKE '%Compress%' OR
                name LIKE '%Hisa%' OR name LIKE '%Logic Air%' OR
                name LIKE '%Ideal Boilers%' OR
                name LIKE '%VLT%' OR name LIKE '%Danfoss%' OR name LIKE '%Fuji Electric%' OR
                name LIKE '%Invertek%' OR name LIKE '%Evapco%' OR name LIKE '%Jaeggi%' OR
                name LIKE '%Secotec%' OR name LIKE '%HPC%' OR name LIKE '%Hybrid%' OR
                name LIKE '%Asynchronous%' OR name LIKE '%PMSM%'
            )
            ORDER BY category, brand, name
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function listProductsNeedingImages() {
    try {
        console.log('🔍 Finding products from yesterday that need images...\n');
        
        const products = await getProductsNeedingImages();
        
        if (products.length === 0) {
            console.log('❌ No products found that need images.');
            return;
        }
        
        console.log(`✅ Found ${products.length} products that need images:\n`);
        
        // Group by category
        const groupedProducts = {};
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!groupedProducts[category]) {
                groupedProducts[category] = [];
            }
            groupedProducts[category].push(product);
        });
        
        console.log('📋 PRODUCTS NEEDING IMAGES BY CATEGORY:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([category, categoryProducts]) => {
            console.log(`\n🏷️ ${category.toUpperCase()}:`);
            console.log('-'.repeat(60));
            categoryProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Image URL: ${product.image_url}`);
                console.log('');
            });
        });
        
        console.log('🎯 READY FOR BATCH IMAGE ADDITION:');
        console.log('================================================================================');
        console.log('These products are ready for the 2-step image addition process:');
        console.log('1. Import image to Wix Media Manager');
        console.log('2. Add media ID to product');
        
        return products;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return [];
    } finally {
        db.close();
    }
}

listProductsNeedingImages();





