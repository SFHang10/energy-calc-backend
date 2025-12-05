const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🖼️ Manual Image Addition Guide for Wix Products\n');
console.log('================================================================================');

// Get all ETL products that we've likely added to Wix (heat pumps, HVAC, etc.)
db.all(`
    SELECT name, brand, image_url, category, subcategory
    FROM products
    WHERE source = 'ETL' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    AND (
        name LIKE '%Heat Pump%' OR 
        name LIKE '%HVAC%' OR 
        name LIKE '%Baxi%' OR 
        name LIKE '%Daikin%' OR 
        name LIKE '%Viessmann%' OR 
        name LIKE '%Bosch%' OR 
        name LIKE '%Hisa%' OR 
        name LIKE '%Ideal%' OR
        name LIKE '%ABB%' OR
        name LIKE '%Danfoss%' OR
        name LIKE '%Fuji%' OR
        name LIKE '%Invertek%' OR
        name LIKE '%Evapco%' OR
        name LIKE '%Jaeggi%'
    )
    ORDER BY category, brand, name
`, (err, rows) => {
    if (err) {
        console.error('Error querying ETL products:', err);
        return;
    }

    if (rows.length === 0) {
        console.log('❌ No ETL products with images found');
        db.close();
        return;
    }

    console.log(`✅ Found ${rows.length} ETL products with images ready for manual upload:\n`);

    // Group by category
    const groupedProducts = {};
    rows.forEach(row => {
        if (!groupedProducts[row.category]) {
            groupedProducts[row.category] = [];
        }
        groupedProducts[row.category].push(row);
    });

    Object.keys(groupedProducts).forEach(category => {
        console.log(`📋 ${category.toUpperCase()}:`);
        console.log('='.repeat(80));
        
        groupedProducts[category].forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Subcategory: ${product.subcategory}`);
            console.log(`   Image URL: ${product.image_url}`);
            console.log('');
        });
        console.log('');
    });

    console.log('🎯 MANUAL UPLOAD INSTRUCTIONS:');
    console.log('================================================================================');
    console.log('1. Go to your Wix dashboard → Store → Products');
    console.log('2. Find each product by name (search function works well)');
    console.log('3. Click on the product to edit');
    console.log('4. Go to the "Media" or "Images" section');
    console.log('5. Click "Add Image" → "Add from URL"');
    console.log('6. Paste the corresponding image URL from the list above');
    console.log('7. Save the product');
    console.log('');
    console.log('💡 TIP: You can copy the image URLs directly from this list!');
    console.log('💡 TIP: Start with the most important products (Baxi, Daikin, etc.)');
    console.log('💡 TIP: The ETL images are optimized for web display (200px width)');

    db.close();
});






