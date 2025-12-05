/**
 * Check what might have changed yesterday that broke images
 * Looks at database vs JSON to see if sync happened
 */

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const OUTPUT_FILE = path.join(__dirname, 'yesterday-check-results.txt');

let output = [];

function log(message) {
    console.log(message);
    output.push(message);
}

log('\n🔍 CHECKING WHAT CHANGED YESTERDAY');
log('='.repeat(70));
log('');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
    log('⚠️  Database not found, checking JSON only...\n');
    checkJSONOnly();
} else {
    compareDatabaseAndJSON();
}

function checkJSONOnly() {
    try {
        const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        const carrierProducts = jsonData.products.filter(p => 
            p.brand && p.brand.includes('Carrier')
        );
        
        const withMotor = carrierProducts.filter(p => 
            p.imageUrl && p.imageUrl.includes('Motor')
        );
        
        log(`📊 Carrier products in JSON: ${carrierProducts.length}`);
        log(`   With Motor.jpg: ${withMotor.length}`);
        log(`   With correct images: ${carrierProducts.length - withMotor.length}`);
        
        if (withMotor.length > 0) {
            log('\n❌ Found Carrier products with Motor.jpg:');
            withMotor.slice(0, 5).forEach(p => {
                log(`   - ${p.name}: ${p.imageUrl}`);
            });
        }
        
        // Save results
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        log(`\n💾 Results saved to: ${path.basename(OUTPUT_FILE)}`);
    } catch (error) {
        log(`❌ Error: ${error.message}`);
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
    }
}

function compareDatabaseAndJSON() {
    const db = new sqlite3.Database(DB_PATH);
    
    // Load JSON
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        log(`✅ Loaded JSON: ${jsonData.products.length} products`);
    } catch (error) {
        log(`❌ Error loading JSON: ${error.message}`);
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        db.close();
        return;
    }
    
    // Get Carrier products from database
    db.all(`
        SELECT id, name, brand, imageUrl, category, subcategory
        FROM products
        WHERE brand LIKE '%Carrier%'
    `, (err, dbProducts) => {
        if (err) {
            log(`❌ Database error: ${err.message}`);
            fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
            db.close();
            return;
        }
        
        log(`✅ Found ${dbProducts.length} Carrier products in database\n`);
        
        // Compare with JSON
        const jsonCarrier = jsonData.products.filter(p => 
            p.brand && p.brand.includes('Carrier')
        );
        
        log(`📊 Comparison:`);
        log(`   Database: ${dbProducts.length} Carrier products`);
        log(`   JSON: ${jsonCarrier.length} Carrier products\n`);
        
        // Check for differences
        const differences = [];
        
        dbProducts.forEach(dbProduct => {
            const jsonProduct = jsonData.products.find(p => p.id === dbProduct.id);
            
            if (jsonProduct) {
                const dbImage = dbProduct.imageUrl || '';
                const jsonImage = jsonProduct.imageUrl || '';
                
                if (dbImage !== jsonImage) {
                    differences.push({
                        id: dbProduct.id,
                        name: dbProduct.name,
                        dbImage: dbImage,
                        jsonImage: jsonImage,
                        dbHasMotor: dbImage.includes('Motor'),
                        jsonHasMotor: jsonImage.includes('Motor')
                    });
                }
            }
        });
        
        if (differences.length > 0) {
            log(`⚠️  Found ${differences.length} Carrier products with different images:\n`);
            differences.slice(0, 10).forEach(diff => {
                log(`   ${diff.name}:`);
                log(`      Database: ${diff.dbImage || 'NO IMAGE'}`);
                log(`      JSON:     ${diff.jsonImage || 'NO IMAGE'}`);
                if (diff.dbHasMotor && !diff.jsonHasMotor) {
                    log(`      ⚠️  Database has Motor.jpg but JSON has correct image!`);
                } else if (!diff.dbHasMotor && diff.jsonHasMotor) {
                    log(`      ⚠️  JSON has Motor.jpg but database has correct image!`);
                }
                log('');
            });
            
            if (differences.length > 10) {
                log(`   ... and ${differences.length - 10} more differences\n`);
            }
            
            log('\n💡 POSSIBLE CAUSE:');
            log('   If database has Motor.jpg but JSON had correct images,');
            log('   then safe_sync_images_to_json.js might have been run,');
            log('   which synced wrong images from database to JSON.\n');
        } else {
            log('✅ Database and JSON have matching images for Carrier products\n');
        }
        
        // Check JSON for Motor.jpg
        const jsonWithMotor = jsonCarrier.filter(p => 
            p.imageUrl && p.imageUrl.includes('Motor')
        );
        
        if (jsonWithMotor.length > 0) {
            log(`❌ JSON has ${jsonWithMotor.length} Carrier products with Motor.jpg\n`);
        } else {
            log('✅ JSON has no Carrier products with Motor.jpg\n');
        }
        
        // Save results
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        log(`💾 Results saved to: ${path.basename(OUTPUT_FILE)}`);
        
        db.close();
    });
}

