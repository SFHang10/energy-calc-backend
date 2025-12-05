const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🌬️ Adding Heat Recovery Ventilation Units to Wix...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function findHeatRecoveryVentilation() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, image_url, category, power, energy_rating, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            AND (
                name LIKE '%VAM%' OR
                name LIKE '%Heat Recovery%' OR
                name LIKE '%Ventilation%' OR
                name LIKE '%Daikin%' OR
                brand LIKE '%Daikin%'
            )
            ORDER BY name
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

async function findHeatRecoveryProducts() {
    try {
        console.log('🔍 Finding Heat Recovery Ventilation Units with images...\n');
        
        const products = await findHeatRecoveryVentilation();
        
        if (products.length === 0) {
            console.log('❌ No Heat Recovery Ventilation products found.');
            return;
        }
        
        console.log(`✅ Found ${products.length} Heat Recovery Ventilation products:\n`);
        
        // Group by manufacturer
        const groupedProducts = {};
        products.forEach(product => {
            const manufacturer = product.brand;
            if (!groupedProducts[manufacturer]) {
                groupedProducts[manufacturer] = [];
            }
            groupedProducts[manufacturer].push(product);
        });
        
        console.log('🌬️ HEAT RECOVERY VENTILATION UNITS:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([manufacturer, manufacturerProducts]) => {
            console.log(`\n🏭 ${manufacturer.toUpperCase()}:`);
            console.log('-'.repeat(60));
            manufacturerProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Image URL: ${product.image_url}`);
                console.log('');
            });
        });
        
        console.log('🎯 READY FOR WIX ADDITION:');
        console.log('================================================================================');
        console.log('These products are ready to be added to your Wix store with images!');
        console.log('Category: HVAC Equipment > Heat Recovery Ventilation');
        console.log('\n💡 I can now add these products to Wix using the correct 2-step process:');
        console.log('   1. Import image to Wix Media Manager');
        console.log('   2. Add media ID to product');
        
        return products;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return [];
    } finally {
        db.close();
    }
}

findHeatRecoveryProducts();





