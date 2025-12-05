const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Finding CORRECT ETL Images for Your Wix Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Your Wix products with more specific search criteria
const wixProducts = [
    { 
        name: 'Jaeggi Hybrid Evaporative Condenser', 
        sku: 'ETL-JAEGGI-HYBRID-EVAPORATIVE-2625',
        searchTerms: ['Jaeggi', 'Hybrid', 'Evaporative', 'Condenser']
    },
    { 
        name: 'Evapco Forced Draft Axial Condenser', 
        sku: 'ETL-EVAPCO-FORCED-DRAFT-AXIAL-2407',
        searchTerms: ['Evapco', 'Axial', 'Condenser']
    },
    { 
        name: 'Invertek Optidrive E3 HVAC Drive', 
        sku: 'ETL-INVERTEK-OPTIDRIVE-E3-0.37KW',
        searchTerms: ['Invertek', 'Optidrive', 'E3', '0.37']
    },
    { 
        name: 'Fuji Electric Frenic HVAC Drive', 
        sku: 'ETL-FUJI-FRENIC-HVAC-75KW',
        searchTerms: ['Fuji', 'Frenic', 'HVAC', '75']
    },
    { 
        name: 'Danfoss AK-CC55 Compact HVAC Control', 
        sku: 'ETL-DANFOSS-AK-CC55-COMPACT',
        searchTerms: ['Danfoss', 'AK-CC55', 'Compact']
    },
    { 
        name: 'ABB 3BP4 Process Performance Super Premium Efficiency Motor', 
        sku: 'ETL-ABB-3BP4-75KW',
        searchTerms: ['ABB', '3BP4', 'Motor']
    },
    { 
        name: 'Bosch GC7000F 200 Heat Pump', 
        sku: 'ETL-BOSCH-GC7000F-200',
        searchTerms: ['Bosch', 'GC7000F', 'Heat Pump']
    },
    { 
        name: 'Viessmann Vitodens 200-W 49kW Heat Pump', 
        sku: 'ETL-VIESSMANN-VITODENS-200W-49KW',
        searchTerms: ['Viessmann', 'Vitodens', '200-W', '49kW']
    },
    { 
        name: 'Daikin VAM-J Heat Pump', 
        sku: 'ETL-DAIKIN-VAM-J',
        searchTerms: ['Daikin', 'VAM-J']
    }
];

async function findCorrectProductImages() {
    console.log('🔍 Searching for CORRECT ETL images for your specific products...\n');
    
    for (const wixProduct of wixProducts) {
        console.log(`\n📋 Searching for: ${wixProduct.name}`);
        console.log(`   SKU: ${wixProduct.sku}`);
        console.log('   ' + '='.repeat(80));
        
        try {
            const etlProduct = await searchETLProductCorrectly(wixProduct);
            
            if (etlProduct) {
                console.log(`✅ FOUND CORRECT ETL Product:`);
                console.log(`   ETL Name: ${etlProduct.name}`);
                console.log(`   Brand: ${etlProduct.brand}`);
                console.log(`   Power: ${etlProduct.power}`);
                console.log(`   Energy Rating: ${etlProduct.energy_rating}`);
                console.log(`   Model: ${etlProduct.model_number || 'N/A'}`);
                console.log(`   Image: ${etlProduct.image_url ? '✅ Available' : '❌ Not Available'}`);
                
                if (etlProduct.image_url) {
                    console.log(`   🖼️  CORRECT IMAGE URL: ${etlProduct.image_url}`);
                } else {
                    console.log(`   ❌ No ETL image available for this product`);
                }
            } else {
                console.log(`❌ NOT FOUND in ETL Database`);
                console.log(`   This product may not be in the ETL database or has a different name`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR searching for ${wixProduct.name}: ${error.message}`);
        }
    }
    
    console.log('\n🎯 CORRECTED IMAGE SUMMARY:');
    console.log('================================================================================');
    console.log('Use the CORRECT image URLs shown above for each product.');
    console.log('The previous search incorrectly matched some products.');
    
    db.close();
}

async function searchETLProductCorrectly(wixProduct) {
    return new Promise((resolve, reject) => {
        // More specific search based on the product type and power rating
        let query = '';
        let params = [];
        
        if (wixProduct.name.includes('Invertek Optidrive E3')) {
            // Look for Optidrive E3 with 0.37kW specifically
            query = `
                SELECT name, brand, power, energy_rating, image_url, model_number
                FROM products
                WHERE source = 'ETL'
                AND brand LIKE '%Invertek%'
                AND name LIKE '%Optidrive E3%'
                AND power = '0.37'
                AND image_url IS NOT NULL AND image_url != ''
                LIMIT 1
            `;
        } else if (wixProduct.name.includes('Fuji Electric Frenic')) {
            // Look for Frenic HVAC with 75kW specifically
            query = `
                SELECT name, brand, power, energy_rating, image_url, model_number
                FROM products
                WHERE source = 'ETL'
                AND brand LIKE '%Fuji%'
                AND name LIKE '%Frenic HVAC%'
                AND power = '75'
                AND image_url IS NOT NULL AND image_url != ''
                LIMIT 1
            `;
        } else if (wixProduct.name.includes('ABB 3BP4')) {
            // Look for ABB 3BP4 motor specifically
            query = `
                SELECT name, brand, power, energy_rating, image_url, model_number
                FROM products
                WHERE source = 'ETL'
                AND brand LIKE '%ABB%'
                AND name LIKE '%3BP4%'
                AND image_url IS NOT NULL AND image_url != ''
                LIMIT 1
            `;
        } else {
            // General search for other products
            const searchTerms = wixProduct.searchTerms;
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

findCorrectProductImages();





