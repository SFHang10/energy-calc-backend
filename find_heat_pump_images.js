const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Finding ETL Images for Heat Pump Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Your heat pump products to search for
const heatPumpProducts = [
    { 
        name: 'Ideal Logic Air 8kW Air to Water Heat Pump', 
        sku: 'ETL-IDEAL-LOGIC-AIR-8KW',
        searchTerms: ['Ideal', 'Logic Air', '8 kW', 'Heat Pump']
    },
    { 
        name: 'Ideal Logic Air 10kW Air to Water Heat Pump', 
        sku: 'ETL-IDEAL-LOGIC-AIR-10KW',
        searchTerms: ['Ideal', 'Logic Air', '10 kW', 'Heat Pump']
    },
    { 
        name: 'Hisa HR290-006-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-006-1PH',
        searchTerms: ['Hisa', 'HR290', '006', 'Heat Pump']
    },
    { 
        name: 'Hisa HR290-008-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-008-1PH',
        searchTerms: ['Hisa', 'HR290', '008', 'Heat Pump']
    },
    { 
        name: 'Hisa HR290-018-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-018-1PH',
        searchTerms: ['Hisa', 'HR290', '018', 'Heat Pump']
    }
];

async function findHeatPumpImages() {
    console.log('🔍 Searching ETL database for heat pump products...\n');
    
    for (const product of heatPumpProducts) {
        console.log(`\n📋 Searching for: ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log('   ' + '='.repeat(80));
        
        try {
            const etlProduct = await searchETLHeatPump(product);
            
            if (etlProduct) {
                console.log(`✅ FOUND in ETL Database:`);
                console.log(`   ETL Name: ${etlProduct.name}`);
                console.log(`   Brand: ${etlProduct.brand}`);
                console.log(`   Power: ${etlProduct.power}`);
                console.log(`   Energy Rating: ${etlProduct.energy_rating}`);
                console.log(`   Model: ${etlProduct.model_number || 'N/A'}`);
                console.log(`   Image: ${etlProduct.image_url ? '✅ Available' : '❌ Not Available'}`);
                
                if (etlProduct.image_url) {
                    console.log(`   🖼️  IMAGE URL: ${etlProduct.image_url}`);
                } else {
                    console.log(`   ❌ No ETL image available for this product`);
                }
            } else {
                console.log(`❌ NOT FOUND in ETL Database`);
                console.log(`   This product may not be in the ETL database or has a different name`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR searching for ${product.name}: ${error.message}`);
        }
    }
    
    console.log('\n🎯 HEAT PUMP IMAGE SUMMARY:');
    console.log('================================================================================');
    console.log('Products with ETL images will show the image URL above.');
    console.log('Products without ETL images will need alternative images or manual upload.');
    console.log('\n💡 To add images to your Wix products:');
    console.log('1. Go to Wix Dashboard → Store → Products');
    console.log('2. Find each product by name or SKU');
    console.log('3. Edit the product → Media section');
    console.log('4. Add image from URL using the ETL image URLs shown above');
    console.log('\n⚠️  Note: ETL images may be protected and not directly importable to Wix.');
    console.log('   If Wix can\'t import them, try downloading and uploading manually.');
    
    db.close();
}

async function searchETLHeatPump(product) {
    return new Promise((resolve, reject) => {
        let query = '';
        let params = [];
        
        if (product.name.includes('Ideal Logic Air')) {
            // Look for Ideal Logic Air with specific power rating
            const powerMatch = product.name.match(/(\d+)kW/);
            const power = powerMatch ? powerMatch[1] : '';
            
            query = `
                SELECT name, brand, power, energy_rating, image_url, model_number
                FROM products
                WHERE source = 'ETL'
                AND brand LIKE '%Ideal%'
                AND name LIKE '%Logic Air%'
                AND name LIKE '%${power} kW%'
                AND image_url IS NOT NULL AND image_url != ''
                LIMIT 1
            `;
        } else if (product.name.includes('Hisa HR290')) {
            // Look for Hisa HR290 with specific model number
            const modelMatch = product.name.match(/HR290-(\d+)-1PH/);
            const modelNumber = modelMatch ? modelMatch[1] : '';
            
            query = `
                SELECT name, brand, power, energy_rating, image_url, model_number
                FROM products
                WHERE source = 'ETL'
                AND brand LIKE '%Hisa%'
                AND name LIKE '%HR290%'
                AND name LIKE '%${modelNumber}%'
                AND image_url IS NOT NULL AND image_url != ''
                LIMIT 1
            `;
        } else {
            // General search for other heat pump products
            const searchTerms = product.searchTerms;
            query = `
                SELECT name, brand, power, energy_rating, image_url, model_number
                FROM products
                WHERE source = 'ETL'
                AND (
                    ${searchTerms.map(term => `name LIKE '%${term}%'`).join(' AND ')}
                )
                AND image_url IS NOT NULL AND image_url != ''
                LIMIT 1
            `;
        }
        
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

findHeatPumpImages();





