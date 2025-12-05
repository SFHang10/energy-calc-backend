const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🧊 Searching for Refrigeration Equipment...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function searchRefrigerationEquipment() {
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
                name LIKE '%Showcase%' OR
                category LIKE '%Refrigerat%' OR
                category LIKE '%Food%' OR
                subcategory LIKE '%Refrigerat%' OR
                subcategory LIKE '%Food%' OR
                subcategory LIKE '%Display%'
            )
            ORDER BY brand, name
            LIMIT 30
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

async function findRefrigerationProducts() {
    try {
        console.log('🔍 Searching for Refrigeration Equipment with images...\n');
        
        const products = await searchRefrigerationEquipment();
        
        if (products.length === 0) {
            console.log('❌ No Refrigeration Equipment with images found.');
            return;
        }
        
        console.log(`✅ Found ${products.length} Refrigeration Equipment products with images:\n`);
        
        // Group by manufacturer
        const groupedProducts = {};
        products.forEach(product => {
            const manufacturer = product.brand;
            if (!groupedProducts[manufacturer]) {
                groupedProducts[manufacturer] = [];
            }
            groupedProducts[manufacturer].push(product);
        });
        
        console.log('🧊 REFRIGERATION EQUIPMENT:');
        console.log('================================================================================');
        
        Object.entries(groupedProducts).forEach(([manufacturer, manufacturerProducts]) => {
            console.log(`\n🏭 ${manufacturer.toUpperCase()}:`);
            console.log('-'.repeat(60));
            manufacturerProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Model: ${product.model_number || 'N/A'}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Subcategory: ${product.subcategory}`);
                console.log(`   Image URL: ${product.image_url}`);
                console.log('');
            });
        });
        
        // Check for display cabinets specifically
        const displayCabinets = products.filter(p => 
            p.name.toLowerCase().includes('display') || 
            p.name.toLowerCase().includes('cabinet') ||
            p.name.toLowerCase().includes('case') ||
            p.name.toLowerCase().includes('showcase')
        );
        
        if (displayCabinets.length > 0) {
            console.log('\n🛍️ DISPLAY CABINETS FOUND:');
            console.log('================================================================================');
            displayCabinets.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - ${product.brand}`);
                console.log(`   Image: ${product.image_url}`);
            });
        } else {
            console.log('\n❌ No Display Cabinets found with images.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

findRefrigerationProducts();





