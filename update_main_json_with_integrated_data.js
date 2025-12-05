const fs = require('fs');
const path = require('path');

console.log('🔄 UPDATING JSON FILE WITH INTEGRATED GRANTS AND COLLECTIONS DATA\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const INTEGRATED_JSON_PATH = path.join(__dirname, 'products-with-collection.json');
const MAIN_JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const BACKUP_PATH = path.join(__dirname, 'FULL-DATABASE-5554-backup-before-integration.json');

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function updateMainJSONWithIntegratedData() {
    try {
        console.log('📋 Loading integrated data...');
        const integratedData = JSON.parse(fs.readFileSync(INTEGRATED_JSON_PATH, 'utf8'));
        console.log(`✅ Loaded ${integratedData.products.length} products with grants and collections`);
        
        console.log('📋 Loading current main JSON...');
        const mainData = JSON.parse(fs.readFileSync(MAIN_JSON_PATH, 'utf8'));
        console.log(`✅ Current main JSON has ${mainData.products.length} products`);
        
        // Create backup
        console.log('💾 Creating backup of main JSON...');
        fs.writeFileSync(BACKUP_PATH, JSON.stringify(mainData, null, 2));
        console.log(`✅ Backup created: ${BACKUP_PATH}`);
        
        // Update main JSON with integrated data
        console.log('🔄 Updating main JSON with integrated data...');
        
        // Update metadata
        const updatedData = {
            ...mainData,
            metadata: {
                ...mainData.metadata,
                lastUpdated: new Date().toISOString(),
                totalProducts: integratedData.products.length,
                integrationStatus: 'grants_and_collections_integrated',
                integrationDate: new Date().toISOString(),
                grantsSystem: 'Hardcoded Product-Specific Grants',
                collectionsSystem: 'Collection Agencies & Recycling Incentives',
                version: '2.0.0'
            },
            grantsStats: integratedData.grantsStats,
            collectionsStats: integratedData.collectionsStats,
            availableRegions: integratedData.availableRegions,
            products: integratedData.products
        };
        
        // Save updated JSON
        console.log('💾 Saving updated main JSON...');
        fs.writeFileSync(MAIN_JSON_PATH, JSON.stringify(updatedData, null, 2));
        
        // Display results
        console.log('\n✅ SUCCESS! Main JSON updated with integrated data');
        console.log(`   Total products: ${updatedData.products.length}`);
        
        // Show category breakdown
        const categoryBreakdown = {};
        updatedData.products.forEach(product => {
            const category = product.category || 'Unknown';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
        });
        
        console.log('\n📊 Category breakdown:');
        Object.entries(categoryBreakdown).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} products`);
        });
        
        // Show professional-foodservice products specifically
        const foodserviceProducts = updatedData.products.filter(p => p.category === 'professional-foodservice');
        console.log(`\n🍽️ Professional Foodservice products: ${foodserviceProducts.length}`);
        
        // Show image status
        const productsWithImages = foodserviceProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
        console.log(`   Products with images: ${productsWithImages.length}`);
        console.log(`   Products without images: ${foodserviceProducts.length - productsWithImages.length}`);
        
        // Show grants status
        const productsWithGrants = foodserviceProducts.filter(p => p.grantsCount > 0);
        console.log(`   Products with grants: ${productsWithGrants.length}`);
        
        // Show collections status
        const productsWithCollections = foodserviceProducts.filter(p => p.collectionAgenciesCount > 0);
        console.log(`   Products with collections: ${productsWithCollections.length}`);
        
        // Show integration stats
        console.log('\n📊 Integration statistics:');
        console.log(`   Total products with grants: ${updatedData.products.filter(p => p.grantsCount > 0).length}`);
        console.log(`   Total products with collections: ${updatedData.products.filter(p => p.collectionAgenciesCount > 0).length}`);
        console.log(`   Total grant amount available: €${updatedData.products.reduce((sum, p) => sum + (p.grantsTotal || 0), 0).toLocaleString()}`);
        console.log(`   Total collection incentive available: €${updatedData.products.reduce((sum, p) => sum + (p.collectionIncentiveTotal || 0), 0).toLocaleString()}`);
        
        console.log('\n📝 Next steps:');
        console.log('1. Restart the server to clear cache');
        console.log('2. Test the professional-foodservice category page');
        console.log('3. Verify the flashing issue is resolved');
        console.log('4. Check that images are loading correctly');
        console.log('5. Verify grants and collections data is working');
        
        return {
            success: true,
            totalProducts: updatedData.products.length,
            foodserviceProducts: foodserviceProducts.length,
            productsWithImages: productsWithImages.length,
            productsWithGrants: productsWithGrants.length,
            productsWithCollections: productsWithCollections.length
        };
        
    } catch (error) {
        console.error('❌ Error updating main JSON:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting JSON Update Process...\n');
        
        // Check if required files exist
        if (!fs.existsSync(INTEGRATED_JSON_PATH)) {
            throw new Error(`Integrated JSON file not found: ${INTEGRATED_JSON_PATH}`);
        }
        if (!fs.existsSync(MAIN_JSON_PATH)) {
            throw new Error(`Main JSON file not found: ${MAIN_JSON_PATH}`);
        }
        
        // Run the update
        const result = await updateMainJSONWithIntegratedData();
        
        if (result.success) {
            console.log('\n🎉 JSON UPDATE COMPLETE!');
            console.log(`   Total products: ${result.totalProducts}`);
            console.log(`   Professional foodservice: ${result.foodserviceProducts}`);
            console.log(`   Products with images: ${result.productsWithImages}`);
            console.log(`   Products with grants: ${result.productsWithGrants}`);
            console.log(`   Products with collections: ${result.productsWithCollections}`);
        } else {
            console.log('\n❌ JSON UPDATE FAILED!');
            console.log(`   Error: ${result.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error during JSON update:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    updateMainJSONWithIntegratedData
};



















