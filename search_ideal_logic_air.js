const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Searching for Ideal Logic Air 4kW Air to Water Heat Pump...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function searchIdealLogicAir() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, category, model_number
            FROM products
            WHERE source = 'ETL'
            AND (
                name LIKE '%Ideal%' OR
                name LIKE '%Logic Air%' OR
                name LIKE '%4kW%' OR
                brand LIKE '%Ideal%'
            )
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

async function findIdealLogicAir() {
    try {
        console.log('🔍 Searching ETL database for Ideal Logic Air products...\n');
        
        const products = await searchIdealLogicAir();
        
        if (products.length === 0) {
            console.log('❌ No Ideal Logic Air products found in ETL database.');
            return;
        }
        
        console.log(`✅ Found ${products.length} Ideal Logic Air related products:\n`);
        
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Power: ${product.power}`);
            console.log(`   Energy Rating: ${product.energy_rating}`);
            console.log(`   Model: ${product.model_number || 'N/A'}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Image: ${product.image_url ? '✅ Available' : '❌ Not Available'}`);
            if (product.image_url) {
                console.log(`   Image URL: ${product.image_url}`);
            }
            console.log('');
        });
        
        // Look specifically for 4kW products
        const fourKwProducts = products.filter(p => 
            p.power && (p.power.toString().includes('4') || p.power.toString().includes('4.0'))
        );
        
        if (fourKwProducts.length > 0) {
            console.log('🎯 4kW SPECIFIC PRODUCTS:');
            console.log('================================================================================');
            fourKwProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Image: ${product.image_url ? '✅ Available' : '❌ Not Available'}`);
                if (product.image_url) {
                    console.log(`   Image URL: ${product.image_url}`);
                }
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

findIdealLogicAir();





