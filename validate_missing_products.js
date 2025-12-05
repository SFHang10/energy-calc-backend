const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Import the grants and collections systems
const {
    getProductGrants,
    calculateProductGrantTotal,
    addGrantsToProduct,
    getAvailableGrantRegions,
    getGrantsSystemStats
} = require('./hardcoded-grants-system.js');

const {
    getCollectionAgencies,
    calculateCollectionIncentiveTotal,
    addCollectionAgenciesToProduct,
    getAvailableCollectionRegions
} = require('./collection-agencies-system.js');

console.log('🔍 VALIDATING MISSING PRODUCTS FOR GRANTS & COLLECTIONS\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const ETL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const OUTPUT_PATH = path.join(__dirname, 'validated-products-to-add.json');

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

async function validateMissingProducts() {
    console.log('📋 Loading existing JSON products...');
    const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const jsonProducts = jsonData.products.filter(p => p.category === 'professional-foodservice');
    const jsonProductNames = jsonProducts.map(p => p.name.toLowerCase());
    
    console.log(`✅ JSON file has ${jsonProducts.length} professional-foodservice products`);
    
    console.log('📋 Loading ETL database products...');
    const db = new sqlite3.Database(ETL_DB_PATH);
    
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT name, brand, imageUrl, category, power, energyRating, price,
                   modelNumber, sku, powerDisplay, descriptionShort, descriptionFull,
                   additionalInfo, specifications, marketingInfo, calculatorData,
                   productPageUrl, affiliateInfo, createdAt, updatedAt,
                   extractedFrom, extractionDate
            FROM products 
            WHERE category = 'professional-foodservice'
            ORDER BY brand, name
        `, async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log(`✅ ETL database has ${rows.length} professional-foodservice products`);
            
            // Find missing products
            const missingProducts = rows.filter(etlProduct => 
                !jsonProductNames.includes(etlProduct.name.toLowerCase())
            );
            
            console.log(`🔄 Found ${missingProducts.length} missing products to validate`);
            
            if (missingProducts.length === 0) {
                console.log('✅ No missing products found!');
                db.close();
                resolve([]);
                return;
            }
            
            // Validate each missing product
            const validatedProducts = [];
            const validationStats = {
                total: missingProducts.length,
                withGrants: 0,
                withCollections: 0,
                withImages: 0,
                readyToAdd: 0,
                needsManualReview: 0
            };
            
            console.log('\n🔍 Validating products for grants and collections...');
            
            for (const product of missingProducts) {
                try {
                    console.log(`\n📦 Validating: ${product.name} (${product.brand})`);
                    
                    // Add grants validation
                    const productWithGrants = addGrantsToProduct(product, 'uk.england');
                    const hasGrants = productWithGrants.grantsCount > 0;
                    
                    if (hasGrants) {
                        validationStats.withGrants++;
                        console.log(`  ✅ Grants: €${productWithGrants.grantsTotal.toLocaleString()} (${productWithGrants.grantsCount} grants)`);
                    } else {
                        console.log(`  ❌ No grants available`);
                    }
                    
                    // Add collections agencies validation
                    const productWithCollections = addCollectionAgenciesToProduct(productWithGrants, 'uk.england');
                    const hasCollections = productWithCollections.collectionAgenciesCount > 0;
                    
                    if (hasCollections) {
                        validationStats.withCollections++;
                        console.log(`  ✅ Collections: ${productWithCollections.collectionAgenciesCount} agencies, ${productWithCollections.collectionCurrency}${productWithCollections.collectionIncentiveTotal.toLocaleString()} total`);
                    } else {
                        console.log(`  ❌ No collection agencies available`);
                    }
                    
                    // Check image status
                    const hasImage = product.imageUrl && product.imageUrl.trim() !== '';
                    if (hasImage) {
                        validationStats.withImages++;
                        console.log(`  ✅ Image: ${product.imageUrl}`);
                    } else {
                        console.log(`  ❌ No image available`);
                    }
                    
                    // Determine if product is ready to add
                    const isReadyToAdd = hasGrants || hasCollections; // At least one validation passes
                    
                    if (isReadyToAdd) {
                        validationStats.readyToAdd++;
                        console.log(`  🎯 READY TO ADD TO JSON`);
                        
                        // Create complete product object for JSON
                        const completeProduct = {
                            ...productWithCollections,
                            // Ensure all required fields are present
                            id: `etl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: product.name,
                            brand: product.brand,
                            category: 'professional-foodservice',
                            subcategory: determineSubcategory(product.name, product.brand),
                            power: product.power || 0,
                            energyRating: product.energyRating || 'Unknown',
                            efficiency: product.efficiency || 'Standard',
                            runningCostPerYear: product.runningCostPerYear || 0,
                            modelNumber: product.modelNumber || '',
                            imageUrl: product.imageUrl || '',
                            sku: product.sku || '',
                            price: product.price || 0,
                            powerDisplay: product.powerDisplay || '',
                            images: product.images || [],
                            videos: product.videos || [],
                            descriptionShort: product.descriptionShort || '',
                            descriptionFull: product.descriptionFull || '',
                            additionalInfo: product.additionalInfo || {},
                            specifications: product.specifications || {},
                            marketingInfo: product.marketingInfo || {},
                            calculatorData: product.calculatorData || {},
                            productPageUrl: product.productPageUrl || '',
                            affiliateInfo: product.affiliateInfo || {},
                            createdAt: product.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            extractedFrom: product.extractedFrom || 'ETL Database',
                            extractionDate: product.extractionDate || new Date().toISOString(),
                            
                            // Grants information (hardcoded)
                            grants: productWithGrants.grants,
                            grantsTotal: productWithGrants.grantsTotal,
                            grantsCurrency: productWithGrants.grantsCurrency,
                            grantsRegion: productWithGrants.grantsRegion,
                            grantsCount: productWithGrants.grantsCount,
                            
                            // Collections agencies information (hardcoded)
                            collectionAgencies: productWithCollections.collectionAgencies,
                            collectionIncentiveTotal: productWithCollections.collectionIncentiveTotal,
                            collectionCurrency: productWithCollections.collectionCurrency,
                            collectionRegion: productWithCollections.collectionRegion,
                            collectionAgenciesCount: productWithCollections.collectionAgenciesCount,
                            
                            // Validation status
                            validationStatus: 'validated',
                            validationDate: new Date().toISOString(),
                            validationNotes: `Grants: ${hasGrants ? 'Yes' : 'No'}, Collections: ${hasCollections ? 'Yes' : 'No'}, Image: ${hasImage ? 'Yes' : 'No'}`
                        };
                        
                        validatedProducts.push(completeProduct);
                        
                    } else {
                        validationStats.needsManualReview++;
                        console.log(`  ⚠️  NEEDS MANUAL REVIEW - No grants or collections available`);
                    }
                    
                } catch (error) {
                    console.error(`❌ Error validating product ${product.name}:`, error.message);
                    validationStats.needsManualReview++;
                }
            }
            
            // Save validated products
            if (validatedProducts.length > 0) {
                const outputData = {
                    metadata: {
                        validationDate: new Date().toISOString(),
                        totalProducts: validatedProducts.length,
                        sourceDatabase: 'ETL Database',
                        targetFile: 'FULL-DATABASE-5554.json',
                        category: 'professional-foodservice'
                    },
                    validationStats,
                    products: validatedProducts
                };
                
                fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
                console.log(`\n💾 Saved ${validatedProducts.length} validated products to ${OUTPUT_PATH}`);
            }
            
            // Display final statistics
            console.log('\n📊 VALIDATION COMPLETE!');
            console.log(`   Total Products Validated: ${validationStats.total}`);
            console.log(`   Products with Grants: ${validationStats.withGrants}`);
            console.log(`   Products with Collections: ${validationStats.withCollections}`);
            console.log(`   Products with Images: ${validationStats.withImages}`);
            console.log(`   Ready to Add to JSON: ${validationStats.readyToAdd}`);
            console.log(`   Need Manual Review: ${validationStats.needsManualReview}`);
            
            db.close();
            resolve(validatedProducts);
        });
    });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineSubcategory(productName, brand) {
    const name = productName.toLowerCase();
    const brandLower = brand.toLowerCase();
    
    // Professional foodservice subcategories
    if (name.includes('oven') || name.includes('steam') || name.includes('combination')) {
        return 'Ovens';
    } else if (name.includes('dishwasher') || name.includes('washer')) {
        return 'Dishwashers';
    } else if (name.includes('refrigerator') || name.includes('fridge') || name.includes('freezer')) {
        return 'Refrigeration';
    } else if (name.includes('hood') || name.includes('ventilation')) {
        return 'Ventilation';
    } else if (name.includes('counter') || name.includes('undercounter')) {
        return 'Counter Equipment';
    } else if (name.includes('electrolux') && name.includes('ecostore')) {
        return 'Heat Pumps';
    } else {
        return 'General Equipment';
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Product Validation Process...\n');
        
        // Check if required files exist
        if (!fs.existsSync(JSON_PATH)) {
            throw new Error(`JSON file not found: ${JSON_PATH}`);
        }
        if (!fs.existsSync(ETL_DB_PATH)) {
            throw new Error(`ETL database not found: ${ETL_DB_PATH}`);
        }
        
        // Run validation
        const validatedProducts = await validateMissingProducts();
        
        if (validatedProducts.length > 0) {
            console.log('\n✅ Validation complete! Next steps:');
            console.log('1. Review the validated products in the output file');
            console.log('2. Add them to FULL-DATABASE-5554.json');
            console.log('3. Restart the server to clear cache');
            console.log('4. Test the professional-foodservice category page');
        } else {
            console.log('\n✅ No missing products found - all products are already in the JSON file!');
        }
        
    } catch (error) {
        console.error('❌ Error during validation:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    validateMissingProducts,
    determineSubcategory
};



















