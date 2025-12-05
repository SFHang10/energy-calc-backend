const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking Products We Added to Wix...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// These are the products we know we added to Wix
const wixProductsAdded = [
    // Heat Pumps
    'Baxi Auriga HP 6kW Heat Pump',
    'Baxi Auriga HP 8kW Heat Pump', 
    'Baxi Auriga HP 12kW Heat Pump',
    'Baxi Auriga HP 16kW Heat Pump',
    'Baxi Quinta Ace 6kW Heat Pump',
    'Baxi Quinta Ace 8kW Heat Pump',
    'Baxi Quinta Ace 12kW Heat Pump',
    'Baxi Quinta Ace 16kW Heat Pump',
    'Baxi Quinta Ace 20kW Heat Pump',
    'Daikin Altherma 3 6kW Heat Pump',
    'Daikin Altherma 3 8kW Heat Pump',
    'Daikin Altherma 3 12kW Heat Pump',
    'Viessmann Vitocal 6kW Heat Pump',
    'Viessmann Vitocal 8kW Heat Pump',
    'Viessmann Vitocal 12kW Heat Pump',
    'Viessmann Vitocal 16kW Heat Pump',
    'Bosch Compress 6kW Heat Pump',
    'Bosch Compress 8kW Heat Pump',
    'Hisa Logic Air 6kW Heat Pump',
    'Hisa Logic Air 8kW Heat Pump',
    'Hisa Logic Air 12kW Heat Pump',
    'Hisa Logic Air 16kW Heat Pump',
    'Ideal Boilers Logic Air 6kW Heat Pump',
    'Ideal Boilers Logic Air 8kW Heat Pump',
    'Ideal Boilers Logic Air 12kW Heat Pump',
    'Ideal Boilers Logic Air 16kW Heat Pump',
    
    // HVAC Equipment
    'ABB ACS880-01 Drive',
    'Danfoss VLT HVAC Drive',
    'Fuji Electric Frenic HVAC',
    'Invertek Optidrive E3',
    'Evapco Chilled Beam',
    'Jaeggi Perfect Irus Control',
    
    // Refrigeration Equipment
    'Danfoss VLT Refrigeration Drive',
    'Secotec Refrigeration Dryer',
    'HPC Hybrid Dry Cooler',
    
    // Heat Recovery Ventilation
    'Daikin VAM-J VAM500J Heat Recovery Ventilation Unit',
    'Daikin VAM-J VAM350J Heat Recovery Ventilation Unit',
    'Daikin VAM-J VAM1500J Heat Recovery Ventilation Unit',
    'Daikin VAM-J VAM1000J Heat Recovery Ventilation Unit',
    'Daikin VAM-J VAM650J Heat Recovery Ventilation Unit',
    'Daikin VAM-J VAM2000J Heat Recovery Ventilation Unit',
    'Daikin VAM-J VAM800J Heat Recovery Ventilation Unit'
];

async function findImagesForWixProducts() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, category, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            AND (
                name LIKE '%Baxi%' OR name LIKE '%Auriga%' OR name LIKE '%Quinta Ace%' OR
                name LIKE '%Daikin%' OR name LIKE '%Altherma%' OR name LIKE '%VAM%' OR
                name LIKE '%Viessmann%' OR name LIKE '%Vitocal%' OR
                name LIKE '%Bosch%' OR name LIKE '%Compress%' OR
                name LIKE '%Hisa%' OR name LIKE '%Logic Air%' OR
                name LIKE '%Ideal Boilers%' OR
                name LIKE '%VLT%' OR name LIKE '%Danfoss%' OR name LIKE '%Fuji Electric%' OR
                name LIKE '%Invertek%' OR name LIKE '%Evapco%' OR name LIKE '%Jaeggi%' OR
                name LIKE '%Secotec%' OR name LIKE '%HPC%' OR name LIKE '%Hybrid%'
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

async function matchWixProductsWithImages() {
    try {
        console.log('🔍 Finding images for products we added to Wix...\n');
        
        const products = await findImagesForWixProducts();
        
        if (products.length === 0) {
            console.log('❌ No matching products found in database.');
            return;
        }
        
        console.log(`✅ Found ${products.length} products that match what we added to Wix:\n`);
        
        // Group by brand
        const groupedProducts = {};
        products.forEach(product => {
            const brand = product.brand || 'Unknown Brand';
            if (!groupedProducts[brand]) {
                groupedProducts[brand] = [];
            }
            groupedProducts[brand].push(product);
        });
        
        console.log('📋 PRODUCTS WE ADDED TO WIX WITH IMAGES:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([brand, brandProducts]) => {
            console.log(`\n🏭 ${brand.toUpperCase()}:`);
            console.log('-'.repeat(60));
            brandProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Image: ${product.image_url}`);
                console.log('');
            });
        });
        
        console.log('🎯 MATCHING INSTRUCTIONS:');
        console.log('================================================================================');
        console.log('1. Look for these exact product names in your Wix store');
        console.log('2. Use the corresponding image URLs to add images');
        console.log('3. If you can\'t find a product, it might not have been added yet');
        console.log('\n💡 TIP: Search for products by brand name in Wix (e.g., "Baxi", "Daikin", "Viessmann")');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

matchWixProductsWithImages();





