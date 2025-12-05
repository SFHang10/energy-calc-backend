const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking Ideal Logic Air Product Images...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function checkIdealLogicAirImages() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND brand = 'Ideal Boilers Ltd'
            AND name LIKE '%Logic Air%'
            ORDER BY name
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

async function analyzeImages() {
    try {
        console.log('🔍 Checking all Ideal Logic Air products and their images...\n');
        
        const products = await checkIdealLogicAirImages();
        
        if (products.length === 0) {
            console.log('❌ No Ideal Logic Air products found in ETL database.');
            return;
        }
        
        console.log(`✅ Found ${products.length} Ideal Logic Air products:\n`);
        
        // Group by image URL to see which products share images
        const imageGroups = {};
        
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Power: ${product.power}`);
            console.log(`   Energy Rating: ${product.energy_rating}`);
            console.log(`   Model: ${product.model_number || 'N/A'}`);
            console.log(`   Image: ${product.image_url ? '✅ Available' : '❌ Not Available'}`);
            if (product.image_url) {
                console.log(`   Image URL: ${product.image_url}`);
                
                // Group by image URL
                if (!imageGroups[product.image_url]) {
                    imageGroups[product.image_url] = [];
                }
                imageGroups[product.image_url].push(product.name);
            }
            console.log('');
        });
        
        console.log('🖼️ IMAGE ANALYSIS:');
        console.log('================================================================================');
        
        if (Object.keys(imageGroups).length > 0) {
            Object.entries(imageGroups).forEach(([imageUrl, productNames], index) => {
                console.log(`Image ${index + 1}: ${imageUrl}`);
                console.log(`Used by ${productNames.length} products:`);
                productNames.forEach(name => console.log(`   - ${name}`));
                console.log('');
            });
        } else {
            console.log('❌ No products with images found.');
        }
        
        // Check specifically for 4kW and 5kW
        const fourKw = products.find(p => p.name.includes('4 kW'));
        const fiveKw = products.find(p => p.name.includes('5 kW'));
        
        if (fourKw && fiveKw) {
            console.log('🎯 4kW vs 5kW COMPARISON:');
            console.log('================================================================================');
            console.log(`4kW Image: ${fourKw.image_url || 'Not Available'}`);
            console.log(`5kW Image: ${fiveKw.image_url || 'Not Available'}`);
            
            if (fourKw.image_url && fiveKw.image_url) {
                if (fourKw.image_url === fiveKw.image_url) {
                    console.log('✅ SAME IMAGE: Both 4kW and 5kW use the identical image URL');
                } else {
                    console.log('❌ DIFFERENT IMAGES: 4kW and 5kW have different image URLs');
                }
            } else {
                console.log('❌ One or both products missing images');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

analyzeImages();





