const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 ANALYZING BOTH DATABASES FOR INFORMATION PRESERVATION\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CENTRAL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const CALCULATOR_DB_PATH = path.join(__dirname, 'database', 'energy_calculator.db');

// ============================================================================
// ANALYSIS FUNCTION
// ============================================================================

async function analyzeDatabases() {
    try {
        console.log('📋 Connecting to both databases...');
        const centralDb = new sqlite3.Database(CENTRAL_DB_PATH);
        const calculatorDb = new sqlite3.Database(CALCULATOR_DB_PATH);
        
        return new Promise((resolve, reject) => {
            // Get professional foodservice products from Central DB
            centralDb.all(`
                SELECT 
                    id, name, brand, category, subcategory, 
                    power, energyRating, efficiency, runningCostPerYear,
                    modelNumber, imageUrl, sku, price, powerDisplay,
                    descriptionShort, descriptionFull, additionalInfo, 
                    specifications, marketingInfo, calculatorData,
                    productPageUrl, affiliateInfo, createdAt, updatedAt,
                    extractedFrom, extractionDate
                FROM products 
                WHERE category = 'professional-foodservice'
                ORDER BY brand, name
            `, [], (err, centralProducts) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(`✅ Central DB: ${centralProducts.length} professional foodservice products`);
                
                // Get professional foodservice products from Calculator DB
                calculatorDb.all(`
                    SELECT 
                        id, name, brand, category, subcategory, 
                        power, energyRating, efficiency, runningCostPerYear,
                        modelNumber, imageUrl, sku, price, powerDisplay,
                        descriptionShort, descriptionFull, additionalInfo, 
                        specifications, marketingInfo, calculatorData,
                        productPageUrl, affiliateInfo, createdAt, updatedAt,
                        extractedFrom, extractionDate
                    FROM products 
                    WHERE category = 'professional-foodservice'
                    ORDER BY brand, name
                `, [], (err, calculatorProducts) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    console.log(`✅ Calculator DB: ${calculatorProducts.length} professional foodservice products`);
                    
                    // Analyze information preservation
                    console.log('\n📊 INFORMATION ANALYSIS:');
                    
                    // Count products with images in each database
                    const centralWithImages = centralProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
                    const calculatorWithImages = calculatorProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
                    
                    console.log(`   Central DB - Products with images: ${centralWithImages.length}/${centralProducts.length}`);
                    console.log(`   Calculator DB - Products with images: ${calculatorWithImages.length}/${calculatorProducts.length}`);
                    
                    // Count products with descriptions
                    const centralWithDesc = centralProducts.filter(p => p.descriptionShort && p.descriptionShort.trim() !== '');
                    const calculatorWithDesc = calculatorProducts.filter(p => p.descriptionShort && p.descriptionShort.trim() !== '');
                    
                    console.log(`   Central DB - Products with descriptions: ${centralWithDesc.length}/${centralProducts.length}`);
                    console.log(`   Calculator DB - Products with descriptions: ${calculatorWithDesc.length}/${calculatorProducts.length}`);
                    
                    // Count products with specifications
                    const centralWithSpecs = centralProducts.filter(p => p.specifications && p.specifications.trim() !== '');
                    const calculatorWithSpecs = calculatorProducts.filter(p => p.specifications && p.specifications.trim() !== '');
                    
                    console.log(`   Central DB - Products with specifications: ${centralWithSpecs.length}/${centralProducts.length}`);
                    console.log(`   Calculator DB - Products with specifications: ${calculatorWithSpecs.length}/${calculatorProducts.length}`);
                    
                    // Find products that exist in both databases
                    const commonProducts = [];
                    const centralOnly = [];
                    const calculatorOnly = [];
                    
                    centralProducts.forEach(centralProduct => {
                        const calculatorProduct = calculatorProducts.find(calc => 
                            calc.name === centralProduct.name && calc.brand === centralProduct.brand
                        );
                        
                        if (calculatorProduct) {
                            commonProducts.push({
                                central: centralProduct,
                                calculator: calculatorProduct
                            });
                        } else {
                            centralOnly.push(centralProduct);
                        }
                    });
                    
                    calculatorProducts.forEach(calculatorProduct => {
                        const centralProduct = centralProducts.find(central => 
                            central.name === calculatorProduct.name && central.brand === calculatorProduct.brand
                        );
                        
                        if (!centralProduct) {
                            calculatorOnly.push(calculatorProduct);
                        }
                    });
                    
                    console.log('\n📋 PRODUCT COMPARISON:');
                    console.log(`   Products in both databases: ${commonProducts.length}`);
                    console.log(`   Products only in Central DB: ${centralOnly.length}`);
                    console.log(`   Products only in Calculator DB: ${calculatorOnly.length}`);
                    
                    // Analyze information differences for common products
                    console.log('\n🔍 INFORMATION DIFFERENCES FOR COMMON PRODUCTS:');
                    let centralHasMoreInfo = 0;
                    let calculatorHasMoreInfo = 0;
                    let equalInfo = 0;
                    
                    commonProducts.forEach(({ central, calculator }, index) => {
                        if (index < 5) { // Show first 5 examples
                            console.log(`\n${index + 1}. ${central.name} (${central.brand}):`);
                            
                            // Compare image information
                            const centralHasImage = central.imageUrl && central.imageUrl.trim() !== '';
                            const calculatorHasImage = calculator.imageUrl && calculator.imageUrl.trim() !== '';
                            
                            if (centralHasImage && !calculatorHasImage) {
                                console.log(`   📸 Central has image, Calculator missing: ${central.imageUrl}`);
                            } else if (!centralHasImage && calculatorHasImage) {
                                console.log(`   📸 Calculator has image, Central missing: ${calculator.imageUrl}`);
                            } else if (centralHasImage && calculatorHasImage) {
                                console.log(`   📸 Both have images`);
                            } else {
                                console.log(`   📸 Neither has image`);
                            }
                            
                            // Compare description information
                            const centralHasDesc = central.descriptionShort && central.descriptionShort.trim() !== '';
                            const calculatorHasDesc = calculator.descriptionShort && calculator.descriptionShort.trim() !== '';
                            
                            if (centralHasDesc && !calculatorHasDesc) {
                                console.log(`   📝 Central has description, Calculator missing`);
                            } else if (!centralHasDesc && calculatorHasDesc) {
                                console.log(`   📝 Calculator has description, Central missing`);
                            } else if (centralHasDesc && calculatorHasDesc) {
                                console.log(`   📝 Both have descriptions`);
                            } else {
                                console.log(`   📝 Neither has description`);
                            }
                        }
                        
                        // Count overall information
                        const centralInfoCount = [
                            central.imageUrl && central.imageUrl.trim() !== '',
                            central.descriptionShort && central.descriptionShort.trim() !== '',
                            central.descriptionFull && central.descriptionFull.trim() !== '',
                            central.specifications && central.specifications.trim() !== '',
                            central.marketingInfo && central.marketingInfo.trim() !== ''
                        ].filter(Boolean).length;
                        
                        const calculatorInfoCount = [
                            calculator.imageUrl && calculator.imageUrl.trim() !== '',
                            calculator.descriptionShort && calculator.descriptionShort.trim() !== '',
                            calculator.descriptionFull && calculator.descriptionFull.trim() !== '',
                            calculator.specifications && calculator.specifications.trim() !== '',
                            calculator.marketingInfo && calculator.marketingInfo.trim() !== ''
                        ].filter(Boolean).length;
                        
                        if (centralInfoCount > calculatorInfoCount) {
                            centralHasMoreInfo++;
                        } else if (calculatorInfoCount > centralInfoCount) {
                            calculatorHasMoreInfo++;
                        } else {
                            equalInfo++;
                        }
                    });
                    
                    console.log('\n📊 OVERALL INFORMATION COMPARISON:');
                    console.log(`   Central DB has more info: ${centralHasMoreInfo} products`);
                    console.log(`   Calculator DB has more info: ${calculatorHasMoreInfo} products`);
                    console.log(`   Equal information: ${equalInfo} products`);
                    
                    console.log('\n🎯 RECOMMENDATION:');
                    if (centralHasMoreInfo > calculatorHasMoreInfo) {
                        console.log('   ✅ Central DB has more information - should be the source for updates');
                    } else if (calculatorHasMoreInfo > centralHasMoreInfo) {
                        console.log('   ✅ Calculator DB has more information - should be preserved');
                    } else {
                        console.log('   ⚖️ Both databases have similar information levels');
                    }
                    
                    centralDb.close();
                    calculatorDb.close();
                    resolve({
                        centralProducts: centralProducts.length,
                        calculatorProducts: calculatorProducts.length,
                        commonProducts: commonProducts.length,
                        centralOnly: centralOnly.length,
                        calculatorOnly: calculatorOnly.length,
                        centralHasMoreInfo,
                        calculatorHasMoreInfo,
                        equalInfo
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error analyzing databases:', error);
        return { error: error.message };
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Database Analysis...\n');
        
        const result = await analyzeDatabases();
        
        if (result.error) {
            console.log('\n❌ ANALYSIS FAILED!');
            console.log(`   Error: ${result.error}`);
        } else {
            console.log('\n✅ ANALYSIS COMPLETE!');
            console.log(`   Central DB products: ${result.centralProducts}`);
            console.log(`   Calculator DB products: ${result.calculatorProducts}`);
            console.log(`   Common products: ${result.commonProducts}`);
            console.log(`   Central-only products: ${result.centralOnly}`);
            console.log(`   Calculator-only products: ${result.calculatorOnly}`);
        }
        
    } catch (error) {
        console.error('❌ Error during analysis:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    analyzeDatabases
};



















