const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking Motor Product Images...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function checkMotorImages() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND name LIKE '%Asynchronous IE4 motor%'
            AND image_url IS NOT NULL AND image_url != ''
            ORDER BY power
            LIMIT 10
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

async function analyzeMotorImages() {
    try {
        console.log('🔍 Checking Asynchronous IE4 Motor Images...\n');
        
        const motors = await checkMotorImages();
        
        if (motors.length === 0) {
            console.log('❌ No motor products found.');
            return;
        }
        
        console.log(`✅ Found ${motors.length} Asynchronous IE4 Motor products:\n`);
        
        // Group by image URL to see if there are duplicates
        const imageGroups = {};
        motors.forEach(motor => {
            if (!imageGroups[motor.image_url]) {
                imageGroups[motor.image_url] = [];
            }
            imageGroups[motor.image_url].push(motor);
        });
        
        console.log('📸 Image Analysis:');
        console.log('================================================================================');
        console.log(`Found ${Object.keys(imageGroups).length} unique images for ${motors.length} products\n`);
        
        Object.entries(imageGroups).forEach(([imageUrl, products], index) => {
            console.log(`Image ${index + 1}: ${imageUrl}`);
            console.log(`Used by ${products.length} products:`);
            products.forEach(product => {
                console.log(`  - ${product.name} (Power: ${product.power}, Rating: ${product.energy_rating})`);
            });
            console.log('');
        });
        
        // Check if the specific URLs you mentioned are in our database
        const specificUrls = [
            'https://img.etl.energysecurity.gov.uk/200x/f58RAz_otuGSJH45',
            'https://img.etl.energysecurity.gov.uk/200x/f58Rzl_otuGSJH45',
            'https://img.etl.energysecurity.gov.uk/200x/f58Ryd_otuGSJH45'
        ];
        
        console.log('🎯 Checking Your Specific URLs:');
        console.log('================================================================================');
        specificUrls.forEach(url => {
            const found = motors.find(m => m.image_url === url);
            if (found) {
                console.log(`✅ Found: ${url}`);
                console.log(`   Product: ${found.name}`);
                console.log(`   Power: ${found.power}, Rating: ${found.energy_rating}`);
            } else {
                console.log(`❌ Not found: ${url}`);
            }
            console.log('');
        });
        
        console.log('💡 Analysis:');
        console.log('- If you see the same image for different products, the ETL database may have duplicate images');
        console.log('- If images look identical, they might be the same product photo used for different power ratings');
        console.log('- This is common for product lines where only specifications differ');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

analyzeMotorImages();





