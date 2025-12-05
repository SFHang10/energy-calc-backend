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

console.log('🔍 EXTRACTING & VALIDATING PROFESSIONAL FOODSERVICE PRODUCTS\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ETL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const OUTPUT_PATH = path.join(__dirname, 'professional-foodservice-products-to-add.json');

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function extractAndValidateFoodserviceProducts() {
    console.log('📋 Loading existing JSON products...');
    const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const jsonProducts = jsonData.products.filter(p => p.category === 'professional-foodservice');
    const jsonProductNames = jsonProducts.map(p => p.name.toLowerCase());
    
    console.log(`✅ JSON file has ${jsonProducts.length} professional-foodservice products`);
    
    console.log('📋 Searching ETL database for professional foodservice products...');
    const db = new sqlite3.Database(ETL_DB_PATH);
    
    return new Promise((resolve, reject) => {
        // Search for products that should be in professional foodservice category
        // Based on ETL website showing 71 products in this category
        const foodserviceKeywords = [
            'combination steam oven', 'convection oven', 'undercounter dishwasher', 
            'hood-type dishwasher', 'commercial oven', 'professional oven',
            'electrolux', 'lainox', 'eloma', 'lincat', 'cheftop', 'rational',
            'combi', 'steamer', 'commercial dishwasher', 'professional dishwasher'
        ];
        
        const keywordConditions = foodserviceKeywords.map(keyword => 
            `(name LIKE '%${keyword}%' OR brand LIKE '%${keyword}%')`
        ).join(' OR ');
        
        const query = `
            SELECT 
                id, name, brand, category, subcategory, power, energyRating, 
                price, imageUrl, modelNumber, sku, powerDisplay, 
                descriptionShort, descriptionFull, additionalInfo, specifications,
                marketingInfo, calculatorData, productPageUrl, affiliateInfo,
                createdAt, updatedAt, extractedFrom, extractionDate
            FROM products 
            WHERE (${keywordConditions})
            AND category != 'Comparison Data'
            AND category IS NOT NULL
            ORDER BY brand, name
        `;
        
        db.all(query, [], async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log(`✅ Found ${rows.length} potential professional foodservice products`);
            
            // Filter to actual professional foodservice products
            const actualFoodserviceProducts = rows.filter(product => {
                const name = product.name.toLowerCase();
                const brand = product.brand.toLowerCase();
                
                // Must be professional/commercial equipment
                const professionalKeywords = [
                    'commercial', 'professional', 'restaurant', 'foodservice',
                    'combi', 'steam', 'convection', 'dishwasher', 'oven',
                    'electrolux', 'lainox', 'eloma', 'lincat', 'cheftop',
                    'rational', 'commercial oven', 'professional oven'
                ];
                
                return professionalKeywords.some(keyword => 
                    name.includes(keyword) || brand.includes(keyword)
                );
            });
            
            console.log(`🎯 Identified ${actualFoodserviceProducts.length} actual professional foodservice products`);
            
            // Check which ones are missing from JSON
            const missingProducts = actualFoodserviceProducts.filter(product => 
                !jsonProductNames.includes(product.name.toLowerCase())
            );
            
            console.log(`🔄 Missing from JSON: ${missingProducts.length} products`);
            
            if (missingProducts.length === 0) {
                console.log('✅ All professional foodservice products are already in the JSON file!');
                db.close();
                resolve({ products: [], missingProducts: [] });
                return;
            }
            
            // Validate and prepare missing products
            const validatedProducts = [];
            const validationStats = {
                total: missingProducts.length,
                withGrants: 0,
                withCollections: 0,
                withImages: 0,
                readyToAdd: 0
            };
            
            console.log('\n🔍 Validating missing products...');
            
            for (const product of missingProducts) {
                try {
                    console.log(`\n📦 Processing: ${product.name} (${product.brand})`);
                    
                    // Determine proper subcategory based on ETL categories
                    const subcategory = determineSubcategory(product.name, product.brand);
                    
                    // Create product with proper category
                    const foodserviceProduct = {
                        ...product,
                        category: 'professional-foodservice',
                        subcategory: subcategory
                    };
                    
                    // Add grants validation
                    const productWithGrants = addGrantsToProduct(foodserviceProduct, 'uk.england');
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
                    
                    // Create complete product object for JSON
                    const completeProduct = {
                        // Basic product info
                        id: `etl_foodservice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: product.name,
                        brand: product.brand,
                        category: 'professional-foodservice',
                        subcategory: subcategory,
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
                        
                        // Grants information (hardcoded for calculator integration)
                        grants: productWithGrants.grants,
                        grantsTotal: productWithGrants.grantsTotal,
                        grantsCurrency: productWithGrants.grantsCurrency,
                        grantsRegion: productWithGrants.grantsRegion,
                        grantsCount: productWithGrants.grantsCount,
                        
                        // Collections agencies information (hardcoded for calculator integration)
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
                    validationStats.readyToAdd++;
                    
                    console.log(`  🎯 READY TO ADD TO JSON`);
                    
                } catch (error) {
                    console.error(`❌ Error processing product ${product.name}:`, error.message);
                }
            }
            
            // Save validated products
            if (validatedProducts.length > 0) {
                const outputData = {
                    metadata: {
                        extractionDate: new Date().toISOString(),
                        totalProducts: validatedProducts.length,
                        sourceDatabase: 'ETL Database',
                        targetFile: 'FULL-DATABASE-5554.json',
                        category: 'professional-foodservice',
                        description: 'Products extracted from ETL database and validated for grants/collections'
                    },
                    validationStats,
                    grantsSystem: {
                        stats: getGrantsSystemStats(),
                        availableRegions: getAvailableGrantRegions()
                    },
                    collectionsSystem: {
                        availableRegions: getAvailableCollectionRegions()
                    },
                    products: validatedProducts
                };
                
                fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
                console.log(`\n💾 Saved ${validatedProducts.length} validated products to ${OUTPUT_PATH}`);
            }
            
            // Display final statistics
            console.log('\n📊 EXTRACTION & VALIDATION COMPLETE!');
            console.log(`   Total Products Found: ${actualFoodserviceProducts.length}`);
            console.log(`   Missing from JSON: ${missingProducts.length}`);
            console.log(`   Products with Grants: ${validationStats.withGrants}`);
            console.log(`   Products with Collections: ${validationStats.withCollections}`);
            console.log(`   Products with Images: ${validationStats.withImages}`);
            console.log(`   Ready to Add to JSON: ${validationStats.readyToAdd}`);
            
            db.close();
            resolve({
                total: actualFoodserviceProducts.length,
                missing: missingProducts.length,
                validated: validatedProducts,
                stats: validationStats
            });
        });
    });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineSubcategory(productName, brand) {
    const name = productName.toLowerCase();
    const brandLower = brand.toLowerCase();
    
    // Based on ETL website categories: Combination Steam Ovens, Hood-Type Dishwashers, Undercounter Dishwashers
    if (name.includes('combination') || name.includes('combi') || name.includes('steam')) {
        return 'Combination Steam Ovens';
    } else if (name.includes('hood') && name.includes('dishwasher')) {
        return 'Hood-Type Dishwashers';
    } else if (name.includes('undercounter') && name.includes('dishwasher')) {
        return 'Undercounter Dishwashers';
    } else if (name.includes('convection') && name.includes('oven')) {
        return 'Convection Ovens';
    } else if (name.includes('dishwasher')) {
        return 'Commercial Dishwashers';
    } else if (name.includes('oven')) {
        return 'Commercial Ovens';
    } else if (brandLower.includes('electrolux') && name.includes('ecostore')) {
        return 'Heat Pumps';
    } else {
        return 'Professional Foodservice Equipment';
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Professional Foodservice Product Extraction...\n');
        
        // Check if required files exist
        if (!fs.existsSync(JSON_PATH)) {
            throw new Error(`JSON file not found: ${JSON_PATH}`);
        }
        if (!fs.existsSync(ETL_DB_PATH)) {
            throw new Error(`ETL database not found: ${ETL_DB_PATH}`);
        }
        
        // Run extraction and validation
        const result = await extractAndValidateFoodserviceProducts();
        
        if (result.validated.length > 0) {
            console.log('\n✅ Extraction complete! Next steps:');
            console.log('1. Review the validated products in the output file');
            console.log('2. Add them to FULL-DATABASE-5554.json');
            console.log('3. Update frontend filter to use actual category field');
            console.log('4. Restart the server to clear cache');
            console.log('5. Test the professional-foodservice category page');
        } else {
            console.log('\n✅ No missing products found - all products are already in the JSON file!');
        }
        
    } catch (error) {
        console.error('❌ Error during extraction:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    extractAndValidateFoodserviceProducts,
    determineSubcategory
};



















