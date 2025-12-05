const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Investigating Duplicate Images Issue...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

async function investigateDuplicateImages() {
    console.log('🔍 Searching for Invertek and Fuji products separately...\n');
    
    // Search for Invertek products
    console.log('📋 INVERTEK PRODUCTS:');
    console.log('================================================================================');
    const invertekProducts = await searchByBrand('Invertek');
    
    if (invertekProducts.length > 0) {
        invertekProducts.forEach((product, index) => {
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
    } else {
        console.log('❌ No Invertek products found');
    }
    
    // Search for Fuji products
    console.log('📋 FUJI ELECTRIC PRODUCTS:');
    console.log('================================================================================');
    const fujiProducts = await searchByBrand('Fuji');
    
    if (fujiProducts.length > 0) {
        fujiProducts.forEach((product, index) => {
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
    } else {
        console.log('❌ No Fuji products found');
    }
    
    // Search for products with the specific image URL
    console.log('🔍 PRODUCTS WITH THE SAME IMAGE URL:');
    console.log('================================================================================');
    const duplicateImageUrl = 'https://img.etl.energysecurity.gov.uk/200x/e5TLOG_tdue7OrWZ';
    const productsWithSameImage = await searchByImageUrl(duplicateImageUrl);
    
    if (productsWithSameImage.length > 0) {
        console.log(`Found ${productsWithSameImage.length} products using the same image:`);
        productsWithSameImage.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Power: ${product.power}`);
            console.log(`   Energy Rating: ${product.energy_rating}`);
            console.log(`   Image URL: ${product.image_url}`);
            console.log('');
        });
    } else {
        console.log('❌ No products found with that image URL');
    }
    
    // Search for Optidrive E3 specifically
    console.log('🔍 SEARCHING FOR OPTIDRIVE E3 SPECIFICALLY:');
    console.log('================================================================================');
    const optidriveProducts = await searchForOptidriveE3();
    
    if (optidriveProducts.length > 0) {
        console.log(`Found ${optidriveProducts.length} Optidrive E3 products:`);
        optidriveProducts.forEach((product, index) => {
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
    } else {
        console.log('❌ No Optidrive E3 products found');
    }
    
    // Search for Frenic specifically
    console.log('🔍 SEARCHING FOR FRENIC SPECIFICALLY:');
    console.log('================================================================================');
    const frenicProducts = await searchForFrenic();
    
    if (frenicProducts.length > 0) {
        console.log(`Found ${frenicProducts.length} Frenic products:`);
        frenicProducts.forEach((product, index) => {
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
    } else {
        console.log('❌ No Frenic products found');
    }
    
    db.close();
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

async function searchByImageUrl(imageUrl) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND image_url = ?
            ORDER BY name
        `;
        
        db.all(query, [imageUrl], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function searchForOptidriveE3() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND (
                name LIKE '%Optidrive E3%' OR
                name LIKE '%Optidrive%' AND name LIKE '%E3%'
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

async function searchForFrenic() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND name LIKE '%Frenic%'
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

investigateDuplicateImages();





