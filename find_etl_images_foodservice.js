const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Searching for ETL Images for Professional Foodservice Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Products that need images
const productsNeedingImages = [
    'Electrolux EI30EF55QS 30" Single Wall Oven',
    'Frigidaire Gallery FGEW3065UF 30" Wall Oven',
    'GE Profile P2B940YPFS 30" Double Wall Oven',
    'Hisense Dishwasher',
    'KitchenAid KODE500ESS 30" Double Wall Oven',
    'LG LDE4413ST 30" Double Wall Oven',
    'Maytag MWO5105BZ 30" Single Wall Oven',
    'Samsung NE58K9430WS 30" Wall Oven',
    'Whirlpool WOD51HZES 30" Double Wall Oven'
];

// Search for ETL images that might match these products
db.all(`
    SELECT name, brand, image_url, source, category
    FROM products
    WHERE source = 'ETL' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    AND (
        name LIKE '%oven%' OR 
        name LIKE '%dishwasher%' OR 
        name LIKE '%steam%' OR 
        name LIKE '%combination%' OR 
        name LIKE '%convection%' OR 
        name LIKE '%undercounter%' OR 
        name LIKE '%hood-type%' OR 
        name LIKE '%foodservice%' OR
        brand LIKE '%electrolux%' OR 
        brand LIKE '%frigidaire%' OR 
        brand LIKE '%ge%' OR 
        brand LIKE '%hisense%' OR 
        brand LIKE '%kitchenaid%' OR 
        brand LIKE '%lg%' OR 
        brand LIKE '%maytag%' OR 
        brand LIKE '%samsung%' OR 
        brand LIKE '%whirlpool%'
    )
    ORDER BY brand, name
`, (err, rows) => {
    if (err) {
        console.error('Error searching for ETL images:', err);
        return;
    }
    
    console.log(`Found ${rows.length} ETL products with images that might match:`);
    console.log('================================================================================');
    
    if (rows.length === 0) {
        console.log('❌ No ETL images found for professional foodservice products');
        console.log('\n💡 Recommendation: Use placeholder images to stop flashing immediately');
        console.log('   Then search manufacturer websites for real product images');
    } else {
        rows.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Image URL: ${product.image_url}`);
            console.log('');
        });
        
        console.log('💡 These ETL images might be suitable for the missing products');
        console.log('   You can manually match them or use them as reference');
    }
    
    // Also check for any products with similar names
    console.log('\n🔍 Checking for products with similar names...');
    
    const similarProducts = [];
    productsNeedingImages.forEach(targetProduct => {
        const brand = targetProduct.split(' ')[0]; // Extract brand from product name
        
        db.all(`
            SELECT name, brand, image_url, source
            FROM products
            WHERE brand LIKE ? 
            AND image_url IS NOT NULL 
            AND image_url != ''
            AND (
                name LIKE '%oven%' OR 
                name LIKE '%dishwasher%' OR 
                name LIKE '%steam%' OR 
                name LIKE '%combination%' OR 
                name LIKE '%convection%'
            )
            LIMIT 3
        `, [`%${brand}%`], (err, brandRows) => {
            if (err) {
                console.error(`Error searching for ${brand} products:`, err);
                return;
            }
            
            if (brandRows.length > 0) {
                console.log(`\n🏭 ${brand} products with images:`);
                brandRows.forEach((product, index) => {
                    console.log(`   ${index + 1}. ${product.name}`);
                    console.log(`      Image URL: ${product.image_url}`);
                });
            }
        });
    });
    
    setTimeout(() => {
        console.log('\n📋 Summary:');
        console.log('1. Check the ETL images above for potential matches');
        console.log('2. Use placeholder images for immediate flashing fix');
        console.log('3. Search manufacturer websites for real product images');
        console.log('4. Update database with chosen image URLs');
        
        db.close();
    }, 2000);
});



















