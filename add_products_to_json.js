const fs = require('fs');
const path = require('path');

console.log('📝 ADDING PROFESSIONAL FOODSERVICE PRODUCTS TO JSON FILE\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const VALIDATED_PRODUCTS_PATH = path.join(__dirname, 'professional-foodservice-products-to-add.json');
const BACKUP_PATH = path.join(__dirname, 'FULL-DATABASE-5554-backup.json');

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function addProductsToJSON() {
    try {
        console.log('📋 Loading existing JSON file...');
        const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        console.log(`✅ Loaded ${jsonData.products.length} existing products`);
        
        console.log('📋 Loading validated products...');
        const validatedData = JSON.parse(fs.readFileSync(VALIDATED_PRODUCTS_PATH, 'utf8'));
        const newProducts = validatedData.products;
        console.log(`✅ Loaded ${newProducts.length} validated products to add`);
        
        // Create backup
        console.log('💾 Creating backup of original JSON file...');
        fs.writeFileSync(BACKUP_PATH, JSON.stringify(jsonData, null, 2));
        console.log(`✅ Backup created: ${BACKUP_PATH}`);
        
        // Check for duplicates
        const existingProductNames = jsonData.products.map(p => p.name.toLowerCase());
        const duplicateProducts = newProducts.filter(p => 
            existingProductNames.includes(p.name.toLowerCase())
        );
        
        if (duplicateProducts.length > 0) {
            console.log(`⚠️  Found ${duplicateProducts.length} duplicate products (will skip):`);
            duplicateProducts.forEach(product => {
                console.log(`   - ${product.name} (${product.brand})`);
            });
        }
        
        // Filter out duplicates
        const uniqueNewProducts = newProducts.filter(p => 
            !existingProductNames.includes(p.name.toLowerCase())
        );
        
        console.log(`🔄 Adding ${uniqueNewProducts.length} unique products to JSON...`);
        
        // Add new products to the JSON
        jsonData.products.push(...uniqueNewProducts);
        
        // Update metadata
        jsonData.metadata = {
            ...jsonData.metadata,
            lastUpdated: new Date().toISOString(),
            totalProducts: jsonData.products.length,
            addedProducts: uniqueNewProducts.length,
            addedCategory: 'professional-foodservice'
        };
        
        // Save updated JSON
        console.log('💾 Saving updated JSON file...');
        fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2));
        
        // Display results
        console.log('\n✅ SUCCESS! Products added to JSON file');
        console.log(`   Original products: ${jsonData.products.length - uniqueNewProducts.length}`);
        console.log(`   New products added: ${uniqueNewProducts.length}`);
        console.log(`   Total products now: ${jsonData.products.length}`);
        
        // Show category breakdown
        const categoryBreakdown = {};
        jsonData.products.forEach(product => {
            const category = product.category || 'Unknown';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
        });
        
        console.log('\n📊 Category breakdown:');
        Object.entries(categoryBreakdown).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} products`);
        });
        
        // Show professional-foodservice products specifically
        const foodserviceProducts = jsonData.products.filter(p => p.category === 'professional-foodservice');
        console.log(`\n🍽️ Professional Foodservice products: ${foodserviceProducts.length}`);
        
        // Show image status
        const productsWithImages = foodserviceProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
        console.log(`   Products with images: ${productsWithImages.length}`);
        console.log(`   Products without images: ${foodserviceProducts.length - productsWithImages.length}`);
        
        console.log('\n📝 Next steps:');
        console.log('1. Update frontend filter to use actual category field');
        console.log('2. Restart the server to clear cache');
        console.log('3. Test the professional-foodservice category page');
        console.log('4. Verify images are loading correctly');
        
        return {
            success: true,
            originalCount: jsonData.products.length - uniqueNewProducts.length,
            addedCount: uniqueNewProducts.length,
            totalCount: jsonData.products.length,
            foodserviceCount: foodserviceProducts.length,
            productsWithImages: productsWithImages.length
        };
        
    } catch (error) {
        console.error('❌ Error adding products to JSON:', error);
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
        if (!fs.existsSync(JSON_PATH)) {
            throw new Error(`JSON file not found: ${JSON_PATH}`);
        }
        if (!fs.existsSync(VALIDATED_PRODUCTS_PATH)) {
            throw new Error(`Validated products file not found: ${VALIDATED_PRODUCTS_PATH}`);
        }
        
        // Run the update
        const result = await addProductsToJSON();
        
        if (result.success) {
            console.log('\n🎉 JSON UPDATE COMPLETE!');
            console.log(`   Added ${result.addedCount} professional foodservice products`);
            console.log(`   Total products: ${result.totalCount}`);
            console.log(`   Professional foodservice: ${result.foodserviceCount}`);
            console.log(`   Products with images: ${result.productsWithImages}`);
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
    addProductsToJSON
};



















