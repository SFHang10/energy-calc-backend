const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Matching Uploaded Images to Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// These are the images I can see in your Wix Media Manager
const uploadedImages = [
    // Heat Pumps
    { name: 'Baxi Auriga HP Heat Pump.jpg', etlUrl: 'e2IcVB_tdtoDugBj' },
    { name: 'Baxi Auriga HP 8kW.jpg', etlUrl: 'e2Id0X_tdtoDugBj' },
    
    // Daikin VAM-J Series
    { name: 'Daikin VAM-J VAM500J.jpg', etlUrl: 'e2IcVB_tdtoDugBj' },
    { name: 'Daikin VAM-J VAM350J.jpg', etlUrl: 'e2Id0X_tdtoDugBj' },
    { name: 'Daikin VAM-J VAM1500J.jpg', etlUrl: 'e2Id01_tdtoDugBj' },
    { name: 'Daikin VAM-J VAM1000J.jpg', etlUrl: 'e2IcZ9_tdtoDugBj' },
    { name: 'Daikin VAM-J VAM650J.jpg', etlUrl: 'e2IcYh_tdtoDugBj' },
    { name: 'Daikin VAM-J VAM2000J.jpg', etlUrl: 'e2IcXk_tdtoDugBj' },
    { name: 'Daikin VAM-J VAM800J.jpg', etlUrl: 'e2IcWt_tdtoDugBj' },
    
    // Refrigeration Equipment
    { name: 'Secotec Refrigeration Dryer 5.88kW.jpg', etlUrl: 'e5I24C_tdttUVNBS' },
    { name: 'VLT REFRIGERATION DRIVE 250kW.jpg', etlUrl: 'e5xTYC_tdsvqYnBW' },
    { name: 'VLT REFRIGERATION DRIVE 315kW.jpg', etlUrl: 'eGwkXG_tdsvqYnBW' },
    
    // Motor Images
    { name: 'f58Rnt_otuGSJH45.png', etlUrl: 'f58Rnt_otuGSJH45' },
    { name: 'f58Ryd_otuGSJH45.png', etlUrl: 'f58Ryd_otuGSJH45' },
    { name: 'f58RAz_otuGSJH45.png', etlUrl: 'f58RAz_otuGSJH45' },
    { name: 'f58RCD_otuGSJH45.png', etlUrl: 'f58RCD_otuGSJH45' }
];

async function findMatchingProducts() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, category, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
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

async function matchImagesToProducts() {
    try {
        console.log('🔍 Finding ETL products that match your uploaded images...\n');
        
        const products = await findMatchingProducts();
        
        if (products.length === 0) {
            console.log('❌ No ETL products with images found in database.');
            return;
        }
        
        console.log(`✅ Found ${products.length} ETL products with images in database\n`);
        
        // Create a map of ETL URLs to products
        const etlUrlMap = new Map();
        products.forEach(product => {
            if (product.image_url) {
                // Extract the ETL URL identifier
                const etlId = product.image_url.split('/').pop();
                etlUrlMap.set(etlId, product);
            }
        });
        
        console.log('🎯 MATCHING UPLOADED IMAGES TO PRODUCTS:');
        console.log('================================================================================');
        
        let matchedCount = 0;
        let unmatchedCount = 0;
        
        uploadedImages.forEach((image, index) => {
            const product = etlUrlMap.get(image.etlUrl);
            
            if (product) {
                console.log(`✅ ${index + 1}. ${image.name}`);
                console.log(`   → Matches: ${product.name}`);
                console.log(`   → Brand: ${product.brand}`);
                console.log(`   → Power: ${product.power}`);
                console.log(`   → Energy Rating: ${product.energy_rating}`);
                console.log(`   → ETL URL: ${product.image_url}`);
                console.log('');
                matchedCount++;
            } else {
                console.log(`❌ ${index + 1}. ${image.name}`);
                console.log(`   → No matching product found for ETL URL: ${image.etlUrl}`);
                console.log('');
                unmatchedCount++;
            }
        });
        
        console.log('📊 SUMMARY:');
        console.log('================================================================================');
        console.log(`✅ Matched images: ${matchedCount}`);
        console.log(`❌ Unmatched images: ${unmatchedCount}`);
        console.log(`📋 Total uploaded images: ${uploadedImages.length}`);
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('================================================================================');
        console.log('1. For matched products: You can use these images in your Wix products');
        console.log('2. For unmatched images: These might be for products not in our database yet');
        console.log('3. Check your Wix store to see which products need images');
        console.log('4. Use the matched products above to add images to your products');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

matchImagesToProducts();





