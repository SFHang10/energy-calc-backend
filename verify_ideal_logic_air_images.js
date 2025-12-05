const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Verifying Ideal Logic Air Image URLs...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function verifyIdealLogicAirImages() {
    console.log('🔍 Checking all Ideal Logic Air products and their unique images...\n');
    
    try {
        // Get all Ideal Logic Air products
        const idealProducts = await getAllIdealLogicAirProducts();
        
        if (idealProducts.length === 0) {
            console.log('❌ No Ideal Logic Air products found in ETL database.');
            return;
        }
        
        console.log(`✅ Found ${idealProducts.length} Ideal Logic Air products:\n`);
        
        // Group by image URL to see which products share images
        const imageGroups = {};
        
        idealProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Power: ${product.power}`);
            console.log(`   Energy Rating: ${product.energy_rating}`);
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
        
        // Check specifically for the 8kW image
        const eightKwImageUrl = 'https://img.etl.energysecurity.gov.uk/200x/e5LLnp_tdtVE0Mvl';
        console.log('🎯 CHECKING 8kW SPECIFIC IMAGE:');
        console.log('================================================================================');
        console.log(`Image URL: ${eightKwImageUrl}`);
        
        const productsWithThisImage = imageGroups[eightKwImageUrl] || [];
        if (productsWithThisImage.length > 0) {
            console.log(`✅ This image is used by ${productsWithThisImage.length} product(s):`);
            productsWithThisImage.forEach(name => console.log(`   - ${name}`));
            
            if (productsWithThisImage.length === 1 && productsWithThisImage[0].includes('8 kW')) {
                console.log('✅ CONFIRMED: This image is unique to the 8kW model');
            } else {
                console.log('⚠️  WARNING: This image is shared with other products or not specifically for 8kW');
            }
        } else {
            console.log('❌ No products found using this specific image URL');
        }
        
        // Show all unique images for Ideal Logic Air
        console.log('\n📊 SUMMARY OF UNIQUE IMAGES:');
        console.log('================================================================================');
        const uniqueImages = Object.keys(imageGroups);
        console.log(`Total unique images: ${uniqueImages.length}`);
        uniqueImages.forEach((url, index) => {
            const products = imageGroups[url];
            console.log(`${index + 1}. ${url}`);
            console.log(`   Used by: ${products.join(', ')}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

async function getAllIdealLogicAirProducts() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND brand LIKE '%Ideal%'
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

verifyIdealLogicAirImages();





