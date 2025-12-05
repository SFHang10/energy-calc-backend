const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Finding Images for Hisa HR290 Heat Pump Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Your Hisa HR290 products to search for
const hisaProducts = [
    { 
        name: 'Hisa HR290-006-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-006-1PH',
        modelNumber: '006'
    },
    { 
        name: 'Hisa HR290-008-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-008-1PH',
        modelNumber: '008'
    },
    { 
        name: 'Hisa HR290-018-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-018-1PH',
        modelNumber: '018'
    },
    { 
        name: 'Hisa HR290-012-1PH Air to Water Heat Pump', 
        sku: 'ETL-HISA-HR290-012-1PH',
        modelNumber: '012'
    }
];

async function findHisaHR290Images() {
    console.log('🔍 Searching for Hisa HR290 products in ETL database...\n');
    
    // First, let's see all Hisa products we have
    console.log('📋 All Hisa products in ETL database:');
    console.log('================================================================================');
    const allHisaProducts = await getAllHisaProducts();
    
    if (allHisaProducts.length > 0) {
        allHisaProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Power: ${product.power}`);
            console.log(`   Energy Rating: ${product.energy_rating}`);
            console.log(`   Model: ${product.model_number || 'N/A'}`);
            console.log(`   Image: ${product.image_url ? '✅ Available' : '❌ Not Available'}`);
            if (product.image_url) {
                console.log(`   Image URL: ${product.image_url}`);
            }
            console.log('');
        });
    } else {
        console.log('❌ No Hisa products found in ETL database');
    }
    
    console.log('\n🔍 Searching for specific HR290 models...\n');
    
    for (const product of hisaProducts) {
        console.log(`📋 Searching for: ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Model Number: ${product.modelNumber}`);
        console.log('   ' + '='.repeat(80));
        
        try {
            // Try different search approaches
            const exactMatch = await searchExactHisaMatch(product);
            const partialMatch = await searchPartialHisaMatch(product);
            
            if (exactMatch) {
                console.log(`✅ EXACT MATCH FOUND:`);
                console.log(`   ETL Name: ${exactMatch.name}`);
                console.log(`   Brand: ${exactMatch.brand}`);
                console.log(`   Power: ${exactMatch.power}`);
                console.log(`   Energy Rating: ${exactMatch.energy_rating}`);
                console.log(`   Model: ${exactMatch.model_number || 'N/A'}`);
                console.log(`   Image: ${exactMatch.image_url ? '✅ Available' : '❌ Not Available'}`);
                if (exactMatch.image_url) {
                    console.log(`   🖼️  IMAGE URL: ${exactMatch.image_url}`);
                }
            } else if (partialMatch) {
                console.log(`⚠️  PARTIAL MATCH FOUND:`);
                console.log(`   ETL Name: ${partialMatch.name}`);
                console.log(`   Brand: ${partialMatch.brand}`);
                console.log(`   Power: ${partialMatch.power}`);
                console.log(`   Energy Rating: ${partialMatch.energy_rating}`);
                console.log(`   Model: ${partialMatch.model_number || 'N/A'}`);
                console.log(`   Image: ${partialMatch.image_url ? '✅ Available' : '❌ Not Available'}`);
                if (partialMatch.image_url) {
                    console.log(`   🖼️  IMAGE URL: ${partialMatch.image_url}`);
                }
                console.log(`   Note: This might be a related product but not exact match`);
            } else {
                console.log(`❌ NOT FOUND in ETL Database`);
                console.log(`   This specific model may not be in the ETL database`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR searching for ${product.name}: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎯 HISA HR290 IMAGE SUMMARY:');
    console.log('================================================================================');
    console.log('If no exact matches found, you can use the generic Hisa images from above.');
    console.log('Or search for alternative images on manufacturer websites or Google Images.');
    
    db.close();
}

async function getAllHisaProducts() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND brand LIKE '%Hisa%'
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

async function searchExactHisaMatch(product) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND brand LIKE '%Hisa%'
            AND (
                name LIKE '%HR290%' OR
                name LIKE '%${product.modelNumber}%'
            )
            AND image_url IS NOT NULL AND image_url != ''
            LIMIT 1
        `;
        
        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function searchPartialHisaMatch(product) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND brand LIKE '%Hisa%'
            AND image_url IS NOT NULL AND image_url != ''
            LIMIT 1
        `;
        
        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

findHisaHR290Images();





