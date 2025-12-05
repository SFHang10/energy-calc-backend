const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Finding ETL Images for Your Wix Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Your Wix products to search for
const wixProducts = [
    { name: 'Jaeggi Hybrid Evaporative Condenser', sku: 'ETL-JAEGGI-HYBRID-EVAPORATIVE-2625' },
    { name: 'Evapco Forced Draft Axial Condenser', sku: 'ETL-EVAPCO-FORCED-DRAFT-AXIAL-2407' },
    { name: 'Invertek Optidrive E3 HVAC Drive', sku: 'ETL-INVERTEK-OPTIDRIVE-E3-0.37KW' },
    { name: 'Fuji Electric Frenic HVAC Drive', sku: 'ETL-FUJI-FRENIC-HVAC-75KW' },
    { name: 'Danfoss AK-CC55 Compact HVAC Control', sku: 'ETL-DANFOSS-AK-CC55-COMPACT' },
    { name: 'ABB 3BP4 Process Performance Super Premium Efficiency Motor', sku: 'ETL-ABB-3BP4-75KW' },
    { name: 'Bosch GC7000F 200 Heat Pump', sku: 'ETL-BOSCH-GC7000F-200' },
    { name: 'Viessmann Vitodens 200-W 49kW Heat Pump', sku: 'ETL-VIESSMANN-VITODENS-200W-49KW' },
    { name: 'Daikin VAM-J Heat Pump', sku: 'ETL-DAIKIN-VAM-J' }
];

async function findProductImages() {
    console.log('🔍 Searching ETL database for your Wix products...\n');
    
    for (const wixProduct of wixProducts) {
        console.log(`\n📋 Searching for: ${wixProduct.name}`);
        console.log(`   SKU: ${wixProduct.sku}`);
        console.log('   ' + '='.repeat(80));
        
        try {
            const etlProduct = await searchETLProduct(wixProduct);
            
            if (etlProduct) {
                console.log(`✅ FOUND in ETL Database:`);
                console.log(`   ETL Name: ${etlProduct.name}`);
                console.log(`   Brand: ${etlProduct.brand}`);
                console.log(`   Power: ${etlProduct.power}`);
                console.log(`   Energy Rating: ${etlProduct.energy_rating}`);
                console.log(`   Model: ${etlProduct.model_number || 'N/A'}`);
                console.log(`   Image: ${etlProduct.image_url ? '✅ Available' : '❌ Not Available'}`);
                
                if (etlProduct.image_url) {
                    console.log(`   🖼️  IMAGE URL: ${etlProduct.image_url}`);
                } else {
                    console.log(`   ❌ No ETL image available for this product`);
                }
            } else {
                console.log(`❌ NOT FOUND in ETL Database`);
                console.log(`   This product may not be in the ETL database or has a different name`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR searching for ${wixProduct.name}: ${error.message}`);
        }
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('================================================================================');
    console.log('Products with ETL images will show the image URL above.');
    console.log('Products without ETL images will need alternative images or manual upload.');
    console.log('\n💡 To add images to your Wix products:');
    console.log('1. Go to Wix Dashboard → Store → Products');
    console.log('2. Find each product by name or SKU');
    console.log('3. Edit the product → Media section');
    console.log('4. Add image from URL using the ETL image URLs shown above');
    
    db.close();
}

async function searchETLProduct(wixProduct) {
    return new Promise((resolve, reject) => {
        // Extract key terms from the product name for searching
        const searchTerms = extractSearchTerms(wixProduct.name);
        
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number, category
            FROM products
            WHERE source = 'ETL'
            AND (
                ${searchTerms.map(term => `name LIKE '%${term}%'`).join(' OR ')}
                OR brand LIKE '%${searchTerms[0]}%'
            )
            AND image_url IS NOT NULL AND image_url != ''
            LIMIT 5
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else if (rows.length > 0) {
                // Find the best match
                const bestMatch = findBestMatch(rows, wixProduct.name);
                resolve(bestMatch);
            } else {
                resolve(null);
            }
        });
    });
}

function extractSearchTerms(productName) {
    // Extract key manufacturer and product terms
    const terms = [];
    
    // Manufacturer terms
    if (productName.includes('Jaeggi')) terms.push('Jaeggi');
    if (productName.includes('Evapco')) terms.push('Evapco');
    if (productName.includes('Invertek')) terms.push('Invertek');
    if (productName.includes('Fuji')) terms.push('Fuji');
    if (productName.includes('Danfoss')) terms.push('Danfoss');
    if (productName.includes('ABB')) terms.push('ABB');
    if (productName.includes('Bosch')) terms.push('Bosch');
    if (productName.includes('Viessmann')) terms.push('Viessmann');
    if (productName.includes('Daikin')) terms.push('Daikin');
    
    // Product type terms
    if (productName.includes('Evaporative Condenser')) terms.push('Evaporative', 'Condenser');
    if (productName.includes('Axial Condenser')) terms.push('Axial', 'Condenser');
    if (productName.includes('HVAC Drive')) terms.push('HVAC', 'Drive');
    if (productName.includes('HVAC Control')) terms.push('HVAC', 'Control');
    if (productName.includes('Motor')) terms.push('Motor');
    if (productName.includes('Heat Pump')) terms.push('Heat Pump');
    
    // Specific model terms
    if (productName.includes('Optidrive E3')) terms.push('Optidrive', 'E3');
    if (productName.includes('Frenic')) terms.push('Frenic');
    if (productName.includes('AK-CC55')) terms.push('AK-CC55');
    if (productName.includes('3BP4')) terms.push('3BP4');
    if (productName.includes('GC7000F')) terms.push('GC7000F');
    if (productName.includes('Vitodens')) terms.push('Vitodens');
    if (productName.includes('VAM-J')) terms.push('VAM-J');
    
    return terms.filter(term => term.length > 2); // Remove very short terms
}

function findBestMatch(rows, targetName) {
    // Simple scoring system to find the best match
    let bestMatch = rows[0];
    let bestScore = 0;
    
    rows.forEach(row => {
        let score = 0;
        const rowName = row.name.toLowerCase();
        const target = targetName.toLowerCase();
        
        // Check for manufacturer match
        if (target.includes('jaeggi') && rowName.includes('jaeggi')) score += 10;
        if (target.includes('evapco') && rowName.includes('evapco')) score += 10;
        if (target.includes('invertek') && rowName.includes('invertek')) score += 10;
        if (target.includes('fuji') && rowName.includes('fuji')) score += 10;
        if (target.includes('danfoss') && rowName.includes('danfoss')) score += 10;
        if (target.includes('abb') && rowName.includes('abb')) score += 10;
        if (target.includes('bosch') && rowName.includes('bosch')) score += 10;
        if (target.includes('viessmann') && rowName.includes('viessmann')) score += 10;
        if (target.includes('daikin') && rowName.includes('daikin')) score += 10;
        
        // Check for product type match
        if (target.includes('condenser') && rowName.includes('condenser')) score += 5;
        if (target.includes('drive') && rowName.includes('drive')) score += 5;
        if (target.includes('control') && rowName.includes('control')) score += 5;
        if (target.includes('motor') && rowName.includes('motor')) score += 5;
        if (target.includes('heat pump') && rowName.includes('heat pump')) score += 5;
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = row;
        }
    });
    
    return bestMatch;
}

findProductImages();





