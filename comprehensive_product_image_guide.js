const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('📋 Comprehensive Product Image Guide...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function getProductsByCategory() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, category, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            ORDER BY category, brand, name
            LIMIT 100
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

async function createComprehensiveGuide() {
    try {
        console.log('🔍 Creating comprehensive product image guide...\n');
        
        const products = await getProductsByCategory();
        
        if (products.length === 0) {
            console.log('❌ No ETL products with images found in database.');
            return;
        }
        
        console.log(`✅ Found ${products.length} ETL products with images\n`);
        
        // Group by category
        const groupedProducts = {};
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!groupedProducts[category]) {
                groupedProducts[category] = [];
            }
            groupedProducts[category].push(product);
        });
        
        console.log('📋 ETL PRODUCTS WITH IMAGES BY CATEGORY:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([category, categoryProducts]) => {
            console.log(`\n🏷️ ${category.toUpperCase()}:`);
            console.log('-'.repeat(80));
            categoryProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Image URL: ${product.image_url}`);
                console.log('');
            });
        });
        
        console.log('\n🎯 MANUAL MATCHING INSTRUCTIONS:');
        console.log('================================================================================');
        console.log('1. Go to your Wix dashboard → Store → Products');
        console.log('2. Look at the product names in your store');
        console.log('3. Find matching products from the list above');
        console.log('4. Use the corresponding image URLs to add images');
        console.log('5. If you can\'t find a match, the product might not be in our database');
        
        console.log('\n💡 COMMON MATCHING PATTERNS:');
        console.log('================================================================================');
        console.log('• "Baxi Auriga HP" → Look for "VAM-J" or similar heat pump products');
        console.log('• "Daikin VAM-J" → Look for "VAM-J" products');
        console.log('• "VLT Refrigeration Drive" → Look for "VLT REFRIGERATION DRIVE"');
        console.log('• "Secotec Dryer" → Look for "Secotec Refrigeration Dryer"');
        console.log('• Motor products → Look for "Asynchronous IE4 motor"');
        
        console.log('\n🔍 SEARCH TIPS:');
        console.log('================================================================================');
        console.log('• Search by brand name (e.g., "Baxi", "Daikin", "Danfoss")');
        console.log('• Search by product type (e.g., "Heat Pump", "Motor", "Drive")');
        console.log('• Search by power rating (e.g., "8kW", "250kW")');
        console.log('• Use partial names (e.g., "Auriga", "VAM", "VLT")');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

createComprehensiveGuide();





