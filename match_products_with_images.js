const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Matching Products with Available Images...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function getProductsWithImages() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, category, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            ORDER BY category, brand, name
            LIMIT 50
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

async function createProductImageMatch() {
    try {
        console.log('🔍 Finding products with images in our database...\n');
        
        const products = await getProductsWithImages();
        
        if (products.length === 0) {
            console.log('❌ No products with images found in database.');
            return;
        }
        
        console.log(`✅ Found ${products.length} products with images:\n`);
        
        // Group by category
        const groupedProducts = {};
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!groupedProducts[category]) {
                groupedProducts[category] = [];
            }
            groupedProducts[category].push(product);
        });
        
        console.log('📋 PRODUCTS WITH IMAGES BY CATEGORY:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([category, categoryProducts]) => {
            console.log(`\n🏷️ ${category.toUpperCase()}:`);
            console.log('-'.repeat(60));
            categoryProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Image: ${product.image_url}`);
                console.log('');
            });
        });
        
        console.log('🎯 TO MATCH WITH YOUR WIX PRODUCTS:');
        console.log('================================================================================');
        console.log('1. Look for products in your Wix store that match these names');
        console.log('2. Use the corresponding image URLs to add images');
        console.log('3. If you can\'t find a match, the product might not be in your store yet');
        console.log('\n💡 TIP: Search for products by brand name or partial product name in Wix');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

createProductImageMatch();





