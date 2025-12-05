/**
 * Script to check image status for all products
 * Analyzes ETL products (marketplace) and comparative products (calculator)
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Load database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products\n`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

const products = database.products || [];
const etlProducts = products.filter(p => p.id && p.id.startsWith('etl_'));
const comparativeProducts = products.filter(p => p.id && !p.id.startsWith('etl_'));

console.log('📊 IMAGE STATUS ANALYSIS\n');
console.log('='.repeat(60));
console.log(`Total products: ${products.length}`);
console.log(`ETL products (marketplace): ${etlProducts.length}`);
console.log(`Comparative products (calculator): ${comparativeProducts.length}`);
console.log('='.repeat(60));

// Analyze ETL products
console.log('\n--- ETL PRODUCTS (Marketplace) ---');
let etlNoImage = 0;
let etlPlaceholder = 0;
let etlHasImage = 0;
const etlNoImageList = [];
const etlPlaceholderList = [];

etlProducts.forEach(p => {
    const imageUrl = p.imageUrl || '';
    const images = p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [];
    
    // Check for real images
    const hasRealImageUrl = imageUrl && 
        !imageUrl.includes('placeholder') && 
        !imageUrl.includes('via.placeholder') &&
        imageUrl.trim() !== '';
    
    const hasRealImageInArray = images.some(img => 
        img && 
        !img.includes('placeholder') && 
        !img.includes('via.placeholder') &&
        img.trim() !== ''
    );
    
    if (!hasRealImageUrl && !hasRealImageInArray && images.length === 0) {
        etlNoImage++;
        if (etlNoImageList.length < 10) {
            etlNoImageList.push({ id: p.id, name: p.name, category: p.category });
        }
    } else if (imageUrl.includes('placeholder') || 
               imageUrl.includes('via.placeholder') ||
               images.some(img => img && (img.includes('placeholder') || img.includes('via.placeholder')))) {
        etlPlaceholder++;
        if (etlPlaceholderList.length < 10) {
            etlPlaceholderList.push({ id: p.id, name: p.name, imageUrl: imageUrl });
        }
    } else {
        etlHasImage++;
    }
});

console.log(`✅ Has real images: ${etlHasImage} (${((etlHasImage / etlProducts.length) * 100).toFixed(1)}%)`);
console.log(`⚠️  Has placeholder images: ${etlPlaceholder} (${((etlPlaceholder / etlProducts.length) * 100).toFixed(1)}%)`);
console.log(`❌ No images: ${etlNoImage} (${((etlNoImage / etlProducts.length) * 100).toFixed(1)}%)`);

if (etlNoImageList.length > 0) {
    console.log('\n📋 Sample ETL products WITHOUT images:');
    etlNoImageList.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.id} - ${p.name.substring(0, 60)}`);
        console.log(`      Category: ${p.category}`);
    });
}

if (etlPlaceholderList.length > 0) {
    console.log('\n📋 Sample ETL products WITH placeholder images:');
    etlPlaceholderList.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.id} - ${p.name.substring(0, 60)}`);
        console.log(`      Image: ${p.imageUrl}`);
    });
}

// Analyze comparative products
console.log('\n--- COMPARATIVE PRODUCTS (Calculator) ---');
let compNoImage = 0;
let compPlaceholder = 0;
let compHasImage = 0;

comparativeProducts.forEach(p => {
    const imageUrl = p.imageUrl || '';
    const images = p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [];
    
    const hasRealImageUrl = imageUrl && 
        !imageUrl.includes('placeholder') && 
        !imageUrl.includes('via.placeholder') &&
        imageUrl.trim() !== '';
    
    const hasRealImageInArray = images.some(img => 
        img && 
        !img.includes('placeholder') && 
        !img.includes('via.placeholder') &&
        img.trim() !== ''
    );
    
    if (!hasRealImageUrl && !hasRealImageInArray && images.length === 0) {
        compNoImage++;
    } else if (imageUrl.includes('placeholder') || 
               imageUrl.includes('via.placeholder') ||
               images.some(img => img && (img.includes('placeholder') || img.includes('via.placeholder')))) {
        compPlaceholder++;
    } else {
        compHasImage++;
    }
});

console.log(`✅ Has real images: ${compHasImage} (${comparativeProducts.length > 0 ? ((compHasImage / comparativeProducts.length) * 100).toFixed(1) : 0}%)`);
console.log(`⚠️  Has placeholder images: ${compPlaceholder} (${comparativeProducts.length > 0 ? ((compPlaceholder / comparativeProducts.length) * 100).toFixed(1) : 0}%)`);
console.log(`❌ No images: ${compNoImage} (${comparativeProducts.length > 0 ? ((compNoImage / comparativeProducts.length) * 100).toFixed(1) : 0}%)`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📈 SUMMARY');
console.log('='.repeat(60));
console.log(`\nMarketplace (ETL Products):`);
console.log(`  Total: ${etlProducts.length}`);
console.log(`  With real images: ${etlHasImage} (${((etlHasImage / etlProducts.length) * 100).toFixed(1)}%)`);
console.log(`  With placeholders: ${etlPlaceholder} (${((etlPlaceholder / etlProducts.length) * 100).toFixed(1)}%)`);
console.log(`  Without images: ${etlNoImage} (${((etlNoImage / etlProducts.length) * 100).toFixed(1)}%)`);

console.log(`\nCalculator (Comparative Products):`);
console.log(`  Total: ${comparativeProducts.length}`);
console.log(`  With real images: ${compHasImage} (${comparativeProducts.length > 0 ? ((compHasImage / comparativeProducts.length) * 100).toFixed(1) : 0}%)`);
console.log(`  With placeholders: ${compPlaceholder} (${comparativeProducts.length > 0 ? ((compPlaceholder / comparativeProducts.length) * 100).toFixed(1) : 0}%)`);
console.log(`  Without images: ${compNoImage} (${comparativeProducts.length > 0 ? ((compNoImage / comparativeProducts.length) * 100).toFixed(1) : 0}%)`);

if (etlNoImage === 0 && etlPlaceholder === 0) {
    console.log('\n✅ EXCELLENT! All ETL products (marketplace) have real images!');
} else if (etlNoImage === 0) {
    console.log('\n⚠️  Some ETL products still have placeholder images that need to be replaced.');
} else {
    console.log('\n❌ Some ETL products are missing images and need attention.');
}






