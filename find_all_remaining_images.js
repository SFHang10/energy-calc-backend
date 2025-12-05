const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Finding ETL Images for All Remaining Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// All your remaining products to search for
const remainingProducts = [
    { name: 'Breezair TBSI580 Evaporative Cooler', sku: 'TBSI580-DUP2', searchTerms: ['Breezair', 'TBSI580'] },
    { name: 'Breezair TBSI580 Evaporative Cooler', sku: 'TBSI580-DUP', searchTerms: ['Breezair', 'TBSI580'] },
    { name: 'Breezair TBSI580 Evaporative Cooler', sku: 'TBSI580', searchTerms: ['Breezair', 'TBSI580'] },
    { name: 'Breezair EXS220 Evaporative Cooler', sku: 'EXS220', searchTerms: ['Breezair', 'EXS220'] },
    { name: 'FREECOOL-AD Evaporative Cooler', sku: 'FCA.ID.SPL.DN20F2A2.03.BRT', searchTerms: ['FREECOOL', 'AD'] },
    { name: 'CHEETAH DCKV Energy Control', sku: 'C3', searchTerms: ['CHEETAH', 'DCKV'] },
    { name: 'Prefect IRUS Control System', sku: 'PRE2000 System 1', searchTerms: ['Prefect', 'IRUS', 'PRE2000'] },
    { name: 'Energy Manager 2.0 Control System', sku: 'Energy Mgr.2.0', searchTerms: ['Energy Manager', '2.0'] },
    { name: 'HeatingSave T3520 Control System', sku: 'T3520', searchTerms: ['HeatingSave', 'T3520'] },
    { name: 'Breezair TBS580 Evaporative Cooler', sku: 'TBS580', searchTerms: ['Breezair', 'TBS580'] },
    { name: 'HeatingSave T3516 Control System', sku: 'T3516', searchTerms: ['HeatingSave', 'T3516'] },
    { name: 'Merlin HVAC Control System', sku: '3000S', searchTerms: ['Merlin', '3000S'] }
];

async function findAllRemainingImages() {
    console.log('🔍 Searching ETL database for all remaining products...\n');
    
    const foundProducts = [];
    const notFoundProducts = [];
    
    for (const product of remainingProducts) {
        console.log(`\n📋 Searching for: ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log('   ' + '='.repeat(80));
        
        try {
            const etlProduct = await searchETLProduct(product);
            
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
                    foundProducts.push({
                        wixProduct: product,
                        etlProduct: etlProduct
                    });
                } else {
                    console.log(`   ❌ No ETL image available for this product`);
                    notFoundProducts.push(product);
                }
            } else {
                console.log(`❌ NOT FOUND in ETL Database`);
                notFoundProducts.push(product);
            }
            
        } catch (error) {
            console.log(`❌ ERROR searching for ${product.name}: ${error.message}`);
            notFoundProducts.push(product);
        }
    }
    
    console.log('\n🎯 COMPLETE IMAGE SUMMARY:');
    console.log('================================================================================');
    
    if (foundProducts.length > 0) {
        console.log(`✅ FOUND ${foundProducts.length} products with ETL images:\n`);
        foundProducts.forEach((item, index) => {
            console.log(`${index + 1}. ${item.wixProduct.name}`);
            console.log(`   SKU: ${item.wixProduct.sku}`);
            console.log(`   ETL Name: ${item.etlProduct.name}`);
            console.log(`   Brand: ${item.etlProduct.brand}`);
            console.log(`   Image URL: ${item.etlProduct.image_url}`);
            console.log('');
        });
    }
    
    if (notFoundProducts.length > 0) {
        console.log(`❌ NOT FOUND ${notFoundProducts.length} products in ETL database:\n`);
        notFoundProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (SKU: ${product.sku})`);
        });
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('================================================================================');
    console.log('1. For products with ETL images: Try importing the URLs directly into Wix');
    console.log('2. For products without ETL images: Search Google Images or manufacturer websites');
    console.log('3. Consider using generic category images for products without specific images');
    console.log('4. If Wix can\'t import ETL URLs, download images and upload manually');
    
    db.close();
}

async function searchETLProduct(product) {
    return new Promise((resolve, reject) => {
        const searchTerms = product.searchTerms;
        const query = `
            SELECT name, brand, power, energy_rating, image_url, model_number
            FROM products
            WHERE source = 'ETL'
            AND (
                ${searchTerms.map(term => `name LIKE '%${term}%'`).join(' OR ')}
                OR brand LIKE '%${searchTerms[0]}%'
            )
            AND image_url IS NOT NULL AND image_url != ''
            LIMIT 1
        `;
        
        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

findAllRemainingImages();





