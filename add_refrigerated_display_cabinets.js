const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🧊 Adding Refrigerated Display Cabinets to Wix...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function findRefrigeratedDisplayCabinets() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, image_url, category, power, energy_rating, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            AND (
                name LIKE '%Display Cabinet%' OR
                name LIKE '%Refrigerated Display%' OR
                name LIKE '%Display Case%' OR
                name LIKE '%Refrigerated Case%' OR
                name LIKE '%Cold Display%' OR
                name LIKE '%Chilled Display%' OR
                name LIKE '%Refrigerated Counter%' OR
                name LIKE '%Display Refrigerator%' OR
                name LIKE '%Refrigerated Showcase%' OR
                name LIKE '%Cold Cabinet%' OR
                name LIKE '%Chilled Cabinet%' OR
                category LIKE '%Refrigerated Display%' OR
                subcategory LIKE '%Display%'
            )
            ORDER BY brand, name
            LIMIT 20
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

async function addRefrigeratedDisplayCabinets() {
    try {
        console.log('🔍 Finding Refrigerated Display Cabinets with images...\n');
        
        const products = await findRefrigeratedDisplayCabinets();
        
        if (products.length === 0) {
            console.log('❌ No Refrigerated Display Cabinets with images found.');
            return;
        }
        
        console.log(`✅ Found ${products.length} Refrigerated Display Cabinets with images:\n`);
        
        // Group by manufacturer
        const groupedProducts = {};
        products.forEach(product => {
            const manufacturer = product.brand;
            if (!groupedProducts[manufacturer]) {
                groupedProducts[manufacturer] = [];
            }
            groupedProducts[manufacturer].push(product);
        });
        
        console.log('🧊 REFRIGERATED DISPLAY CABINETS:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([manufacturer, manufacturerProducts]) => {
            console.log(`\n🏭 ${manufacturer.toUpperCase()}:`);
            console.log('-'.repeat(60));
            manufacturerProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Image URL: ${product.image_url}`);
                console.log('');
            });
        });
        
        console.log('\n🎯 READY FOR WIX ADDITION:');
        console.log('================================================================================');
        console.log('These products are ready to be added to your Wix store with images!');
        console.log('Category: Professional Food Services Equipment > Refrigerated Display Cabinets');
        console.log('\n💡 Next: I can add these products to Wix using the API while you add images to existing products.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

addRefrigeratedDisplayCabinets();





