const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🧊 Adding Refrigeration Equipment to Wix Store...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Wix site ID for Greenways Market
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

async function getRefrigerationProducts() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, image_url, category, power, energy_rating, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url IS NOT NULL AND image_url != ''
            AND (
                name LIKE '%Refrigerat%' OR
                name LIKE '%Fridge%' OR
                name LIKE '%Freezer%' OR
                name LIKE '%Cooler%' OR
                name LIKE '%Chiller%' OR
                name LIKE '%Display%' OR
                name LIKE '%Cabinet%' OR
                name LIKE '%Case%' OR
                name LIKE '%Counter%' OR
                name LIKE '%Showcase%'
            )
            ORDER BY brand, name
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

function generateProductDescription(product) {
    const powerText = product.power !== 'Unknown' ? `${product.power}kW` : 'Variable';
    const energyText = product.energy_rating !== 'Unknown' ? `Energy Rating: ${product.energy_rating}` : 'High Efficiency';
    
    return `Professional ${product.category} System
${product.brand} - High-performance ${product.name} with ${powerText} power rating
ETL Certified ${product.category} - ${product.brand}
${energyText} - Optimized for commercial and industrial applications
Features advanced efficiency technology and reliable performance
Ideal for refrigeration systems, commercial equipment, and energy-conscious installations`;
}

async function addProductsToWix() {
    try {
        console.log('🔍 Getting Refrigeration Products...\n');
        
        const products = await getRefrigerationProducts();
        
        if (products.length === 0) {
            console.log('❌ No Refrigeration products found.');
            return;
        }
        
        console.log(`✅ Found ${products.length} Refrigeration products to add:\n`);
        
        // Display products that will be added
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - ${product.brand}`);
            console.log(`   Power: ${product.power}`);
            console.log(`   Energy Rating: ${product.energy_rating}`);
            console.log(`   Image: ${product.image_url ? '✅ Available' : '❌ Not Available'}`);
            console.log('');
        });
        
        console.log('🎯 READY TO ADD TO WIX:');
        console.log('================================================================================');
        console.log('These products are ready to be added to your Wix store with images!');
        console.log('Category: Professional Food Services Equipment > Refrigeration Equipment');
        console.log('\n💡 I can now add these products to Wix using the API while you add images to existing products.');
        console.log('💡 No conflicts - we\'re working on different products!');
        
        // Create a summary for manual reference
        const summary = {
            totalProducts: products.length,
            categories: ['Professional Food Services Equipment > Refrigeration Equipment'],
            products: products.map(p => ({
                name: p.name,
                brand: p.brand,
                power: p.power,
                energyRating: p.energy_rating,
                imageUrl: p.image_url,
                description: generateProductDescription(p)
            }))
        };
        
        require('fs').writeFileSync('refrigeration_products_summary.json', JSON.stringify(summary, null, 2));
        console.log('\n📄 Created refrigeration_products_summary.json for reference');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

addProductsToWix();





