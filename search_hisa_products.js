const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Searching for Hisa Products in ETL Database...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function searchHisaProducts() {
    console.log('🔍 Searching for all Hisa products...\n');
    
    try {
        // Search for all Hisa products
        const hisaProducts = await searchByBrand('Hisa');
        
        if (hisaProducts.length > 0) {
            console.log(`✅ Found ${hisaProducts.length} Hisa products in ETL database:\n`);
            
            hisaProducts.forEach((product, index) => {
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
        
        // Search for HR290 specifically
        console.log('\n🔍 Searching for HR290 products specifically...\n');
        const hr290Products = await searchForHR290();
        
        if (hr290Products.length > 0) {
            console.log(`✅ Found ${hr290Products.length} HR290 products:\n`);
            
            hr290Products.forEach((product, index) => {
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
            console.log('❌ No HR290 products found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

async function searchByBrand(brandName) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND brand LIKE '%${brandName}%'
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

async function searchForHR290() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND name LIKE '%HR290%'
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

searchHisaProducts();





