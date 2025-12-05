const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🖼️ Adding Images to ETL Products in Wix...\n');

// Get ETL products that have images and were recently added
db.all(`
    SELECT name, brand, image_url, model_number
    FROM products
    WHERE source = 'ETL' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    AND (name LIKE '%Heat Pump%' OR name LIKE '%HVAC%' OR name LIKE '%Baxi%' OR name LIKE '%Daikin%' OR name LIKE '%Viessmann%' OR name LIKE '%Bosch%' OR name LIKE '%Hisa%' OR name LIKE '%Ideal%')
    LIMIT 10
`, (err, rows) => {
    if (err) {
        console.error('Error querying ETL products with images:', err);
        return;
    }

    if (rows.length === 0) {
        console.log('❌ No ETL products with images found');
        db.close();
        return;
    }

    console.log(`✅ Found ${rows.length} ETL products with images:`);
    console.log('================================================================================');
    
    rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name}`);
        console.log(`   Brand: ${row.brand}`);
        console.log(`   Model: ${row.model_number}`);
        console.log(`   Image URL: ${row.image_url}`);
        console.log('--------------------------------------------------------------------------------');
    });

    console.log('\n📋 To add these images to Wix products:');
    console.log('1. Use the Wix API: POST /stores/v1/products/{productId}/media');
    console.log('2. Include the image URL in the request body:');
    console.log('   {');
    console.log('     "media": [');
    console.log('       {');
    console.log('         "url": "https://img.etl.energysecurity.gov.uk/200x/..."');
    console.log('       }');
    console.log('     ]');
    console.log('   }');
    console.log('\n🎯 Next step: Match these products with their Wix product IDs and add images');

    db.close();
});






