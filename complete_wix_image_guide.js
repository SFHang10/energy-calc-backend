const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Complete Wix Image Guide for Added Products\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Products we added to Wix yesterday (based on our sync history)
const addedProducts = [
    // Heat Pumps - Baxi Series
    'Baxi Auriga HP 20T',
    'Baxi Auriga HP 26T', 
    'Baxi Auriga HP 33T',
    'Baxi Auriga HP 40T',
    'Baxi Quinta Ace 115kW',
    
    // Heat Pumps - Daikin Series
    'Daikin Altherma 3 H HT 9kW',
    'Daikin Altherma 3 H HT 12kW',
    'Daikin Altherma 3 H HT 16kW',
    
    // Heat Pumps - Viessmann Series
    'Viessmann Vitocal 200-A 6kW',
    'Viessmann Vitocal 200-A 8kW',
    'Viessmann Vitocal 200-A 10kW',
    'Viessmann Vitocal 200-A 12kW',
    
    // Heat Pumps - Bosch Series
    'Bosch Compress 6000 AW 6kW',
    'Bosch Compress 6000 AW 8kW',
    
    // Heat Pumps - Hisa Series
    'Hisa Logic Air 6kW',
    'Hisa Logic Air 8kW',
    'Hisa Logic Air 10kW',
    'Hisa Logic Air 12kW',
    
    // Heat Pumps - Ideal Boilers Series
    'Ideal Boilers Logic Air 6kW',
    'Ideal Boilers Logic Air 8kW',
    
    // HVAC Equipment
    'ABB ACS880-01 Drive',
    'Danfoss VLT HVAC Drive',
    'Fuji Electric Frenic HVAC',
    'Invertek Optidrive E3',
    'Evapco Chilled Beam',
    'Jaeggi Perfect Irus Control System'
];

async function getProductsWithImages() {
    return new Promise((resolve, reject) => {
        const placeholders = addedProducts.map(() => '?').join(',');
        const query = `
            SELECT name, brand, image_url, category, power, energy_rating
            FROM products
            WHERE name IN (${placeholders})
            AND image_url IS NOT NULL AND image_url != ''
            ORDER BY 
                CASE 
                    WHEN name LIKE 'Baxi%' THEN 1
                    WHEN name LIKE 'Daikin%' THEN 2
                    WHEN name LIKE 'Viessmann%' THEN 3
                    WHEN name LIKE 'Bosch%' THEN 4
                    WHEN name LIKE 'Hisa%' THEN 5
                    WHEN name LIKE 'Ideal%' THEN 6
                    WHEN name LIKE 'ABB%' THEN 7
                    WHEN name LIKE 'Danfoss%' THEN 8
                    WHEN name LIKE 'Fuji%' THEN 9
                    WHEN name LIKE 'Invertek%' THEN 10
                    WHEN name LIKE 'Evapco%' THEN 11
                    WHEN name LIKE 'Jaeggi%' THEN 12
                    ELSE 13
                END,
                name
        `;
        
        db.all(query, addedProducts, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function createImageGuide() {
    try {
        console.log('🔍 Finding products with images...\n');
        
        const productsWithImages = await getProductsWithImages();
        
        if (productsWithImages.length === 0) {
            console.log('❌ No products with images found in database.');
            return;
        }
        
        console.log(`✅ Found ${productsWithImages.length} products with images:\n`);
        
        // Group by manufacturer
        const groupedProducts = {};
        productsWithImages.forEach(product => {
            const manufacturer = product.brand;
            if (!groupedProducts[manufacturer]) {
                groupedProducts[manufacturer] = [];
            }
            groupedProducts[manufacturer].push(product);
        });
        
        console.log('🔥 HEAT PUMPS WITH IMAGES:');
        console.log('================================================================================');
        
        const heatPumpManufacturers = ['Baxi Heating-Commercial', 'Daikin', 'Viessmann', 'Bosch', 'Hisa Engineering Ltd', 'Ideal Boilers'];
        heatPumpManufacturers.forEach(manufacturer => {
            if (groupedProducts[manufacturer]) {
                console.log(`\n🏭 ${manufacturer.toUpperCase()}:`);
                console.log('-'.repeat(60));
                groupedProducts[manufacturer].forEach((product, index) => {
                    console.log(`${index + 1}. ${product.name}`);
                    console.log(`   Power: ${product.power}`);
                    console.log(`   Energy Rating: ${product.energy_rating}`);
                    console.log(`   Image URL: ${product.image_url}`);
                    console.log('');
                });
            }
        });
        
        console.log('\n🏭 HVAC EQUIPMENT WITH IMAGES:');
        console.log('================================================================================');
        
        const hvacManufacturers = ['ABB Ltd', 'Danfoss Ltd', 'Fuji Electric Europe GmbH', 'Invertek Drives Ltd', 'Evapco Europe NV', 'Jaeggi Hybridtechnology Ltd'];
        hvacManufacturers.forEach(manufacturer => {
            if (groupedProducts[manufacturer]) {
                console.log(`\n🏭 ${manufacturer.toUpperCase()}:`);
                console.log('-'.repeat(60));
                groupedProducts[manufacturer].forEach((product, index) => {
                    console.log(`${index + 1}. ${product.name}`);
                    console.log(`   Power: ${product.power}`);
                    console.log(`   Energy Rating: ${product.energy_rating}`);
                    console.log(`   Image URL: ${product.image_url}`);
                    console.log('');
                });
            }
        });
        
        console.log('\n🎯 MANUAL IMAGE UPLOAD INSTRUCTIONS:');
        console.log('================================================================================');
        console.log('1. Go to your Wix dashboard → Store → Products');
        console.log('2. Search for each product by name (use the exact names above)');
        console.log('3. Click on the product to edit');
        console.log('4. Go to the "Media" or "Images" section');
        console.log('5. Click "Add Image" → "Add from URL"');
        console.log('6. Paste the corresponding image URL from the list above');
        console.log('7. Save the product');
        console.log('\n💡 TIP: Copy the image URLs directly from this list!');
        console.log('💡 TIP: The ETL images are optimized for web display (200px width)');
        console.log('💡 TIP: Start with the most important products (Baxi, Daikin, etc.)');
        
        // Create a simple HTML file with all the image URLs for easy copying
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>ETL Product Images for Wix Store</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .product { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #fafafa; }
        .product h3 { color: #2c5aa0; margin-top: 0; }
        .product-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .image-url { background: #f0f0f0; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; border: 1px solid #ccc; }
        .copy-btn { background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer; margin-left: 10px; font-size: 12px; }
        .copy-btn:hover { background: #45a049; }
        .manufacturer { background: #e8f4fd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2c5aa0; }
        .manufacturer h2 { margin-top: 0; color: #2c5aa0; }
        .instructions { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .instructions h3 { margin-top: 0; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖼️ ETL Product Images for Wix Store</h1>
        <p>Click the copy buttons to copy image URLs for easy pasting into Wix.</p>
        
        <div class="instructions">
            <h3>📋 Upload Instructions:</h3>
            <ol>
                <li>Go to your Wix dashboard → Store → Products</li>
                <li>Search for each product by name (use the exact names below)</li>
                <li>Click on the product to edit</li>
                <li>Go to the "Media" or "Images" section</li>
                <li>Click "Add Image" → "Add from URL"</li>
                <li>Paste the corresponding image URL from the list below</li>
                <li>Save the product</li>
            </ol>
        </div>
        
        <h2>🔥 Heat Pumps (${productsWithImages.filter(p => p.category.includes('Heat Pump') || p.name.includes('Auriga') || p.name.includes('Altherma') || p.name.includes('Vitocal') || p.name.includes('Compress') || p.name.includes('Logic Air')).length} products)</h2>
        
        ${Object.entries(groupedProducts).map(([manufacturer, products]) => {
            const heatPumpManufacturers = ['Baxi Heating-Commercial', 'Daikin', 'Viessmann', 'Bosch', 'Hisa Engineering Ltd', 'Ideal Boilers'];
            if (heatPumpManufacturers.includes(manufacturer)) {
                return `
                    <div class="manufacturer">
                        <h2>🏭 ${manufacturer}</h2>
                        ${products.map((product, index) => `
                            <div class="product">
                                <h3>${index + 1}. ${product.name}</h3>
                                <div class="product-info">
                                    <div><strong>Power:</strong> ${product.power}</div>
                                    <div><strong>Energy Rating:</strong> ${product.energy_rating}</div>
                                </div>
                                <div class="image-url">
                                    ${product.image_url}
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${product.image_url}')">Copy URL</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            return '';
        }).join('')}
        
        <h2>🏭 HVAC Equipment (${productsWithImages.filter(p => p.category.includes('HVAC') || p.name.includes('Drive') || p.name.includes('Frenic') || p.name.includes('Optidrive') || p.name.includes('Chilled Beam') || p.name.includes('Perfect Irus')).length} products)</h2>
        
        ${Object.entries(groupedProducts).map(([manufacturer, products]) => {
            const hvacManufacturers = ['ABB Ltd', 'Danfoss Ltd', 'Fuji Electric Europe GmbH', 'Invertek Drives Ltd', 'Evapco Europe NV', 'Jaeggi Hybridtechnology Ltd'];
            if (hvacManufacturers.includes(manufacturer)) {
                return `
                    <div class="manufacturer">
                        <h2>🏭 ${manufacturer}</h2>
                        ${products.map((product, index) => `
                            <div class="product">
                                <h3>${index + 1}. ${product.name}</h3>
                                <div class="product-info">
                                    <div><strong>Power:</strong> ${product.power}</div>
                                    <div><strong>Energy Rating:</strong> ${product.energy_rating}</div>
                                </div>
                                <div class="image-url">
                                    ${product.image_url}
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${product.image_url}')">Copy URL</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            return '';
        }).join('')}
    </div>
</body>
</html>`;
        
        require('fs').writeFileSync('wix_product_images_guide.html', htmlContent);
        console.log('\n📄 Created wix_product_images_guide.html file for easy image URL copying!');
        console.log('📄 Open this file in your browser to easily copy image URLs.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

createImageGuide();





