/**
 * Find all products with wrong images (Motor.jpg when they shouldn't have it)
 * Based on categorization issues
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('\n🔍 FINDING ALL PRODUCTS WITH WRONG IMAGES');
console.log('='.repeat(70));
console.log('');

// Load database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded ${database.products?.length || 0} products\n`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Products that should NOT have Motor.jpg
const wrongMotorProducts = [];

database.products.forEach(product => {
    if (!product.imageUrl || !product.imageUrl.includes('Motor')) {
        return; // Skip if no Motor.jpg
    }
    
    const category = (product.category || '').toLowerCase();
    const subcategory = (product.subcategory || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    
    // Check if this product should NOT have Motor.jpg
    const isRefrigeration = 
        name.includes('refrigerat') ||
        name.includes('fridge') ||
        name.includes('freezer') ||
        subcategory.includes('refrigerat') ||
        subcategory.includes('fridge') ||
        brand.includes('carrier');
    
    const isHVAC = 
        name.includes('hvac') ||
        name.includes('cooling') ||
        name.includes('air conditioning') ||
        subcategory.includes('hvac') ||
        brand.includes('daikin') ||
        brand.includes('reznor');
    
    const isHeatPump = 
        name.includes('heat pump') ||
        subcategory.includes('heat pump');
    
    const isFoodService = 
        category.includes('restaurant') ||
        category.includes('foodservice') ||
        subcategory.includes('foodservice') ||
        name.includes('oven') ||
        name.includes('dishwasher') ||
        name.includes('microwave');
    
    const isAppliance = 
        category.includes('appliance') ||
        name.includes('washer') ||
        name.includes('dryer');
    
    // If it's NOT a motor/drive product, it shouldn't have Motor.jpg
    const isMotor = 
        category.includes('motor') ||
        subcategory.includes('motor') ||
        subcategory.includes('drive') ||
        name.includes('drive') ||
        name.includes('inverter') ||
        name.includes('vsd') ||
        brand.includes('nord') ||
        brand.includes('abb') ||
        brand.includes('weg') ||
        brand.includes('invertek') ||
        brand.includes('danfoss') ||
        brand.includes('schneider') ||
        brand.includes('emerson') ||
        brand.includes('eaton') ||
        brand.includes('vacon') ||
        brand.includes('fuji');
    
    if (!isMotor && (isRefrigeration || isHVAC || isHeatPump || isFoodService || isAppliance)) {
        wrongMotorProducts.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            subcategory: product.subcategory,
            imageUrl: product.imageUrl,
            reason: isRefrigeration ? 'Refrigeration' : 
                   isHVAC ? 'HVAC' : 
                   isHeatPump ? 'Heat Pump' : 
                   isFoodService ? 'Food Service' : 
                   'Appliance'
        });
    }
});

console.log(`📊 Found ${wrongMotorProducts.length} products with Motor.jpg that shouldn't have it\n`);

if (wrongMotorProducts.length === 0) {
    console.log('✅ No products found with wrong images!\n');
    process.exit(0);
}

// Group by reason
const byReason = {};
wrongMotorProducts.forEach(p => {
    if (!byReason[p.reason]) {
        byReason[p.reason] = [];
    }
    byReason[p.reason].push(p);
});

console.log('📋 Products with wrong images by category:\n');
Object.entries(byReason)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([reason, products]) => {
        console.log(`\n${reason}: ${products.length} products`);
        products.slice(0, 10).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.id}: ${p.name.substring(0, 60)}`);
            console.log(`      Brand: ${p.brand || 'NONE'}`);
            console.log(`      Category: ${p.category || 'NONE'}`);
            console.log(`      Subcategory: ${p.subcategory || 'NONE'}`);
        });
        if (products.length > 10) {
            console.log(`   ... and ${products.length - 10} more`);
        }
    });

// Summary
console.log('\n\n📊 SUMMARY:\n');
console.log('-'.repeat(70));
Object.entries(byReason)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([reason, products]) => {
        console.log(`   ${reason}: ${products.length} products`);
    });

console.log(`\n   Total: ${wrongMotorProducts.length} products need fixing\n`);

// Save to file
const outputPath = path.join(__dirname, 'wrong-images-report.json');
fs.writeFileSync(outputPath, JSON.stringify({
    total: wrongMotorProducts.length,
    byReason: byReason,
    products: wrongMotorProducts
}, null, 2));

console.log(`💾 Detailed report saved to: wrong-images-report.json\n`);

