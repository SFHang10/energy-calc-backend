const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Remaining Products Without Images\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const withoutImages = data.products.filter(p => !p.imageUrl);
console.log(`📦 Products without images: ${withoutImages.length}\n`);

// Analyze by category
const categories = {};
withoutImages.forEach(product => {
    const cat = product.category || 'Uncategorized';
    const subcat = product.subcategory || 'No Subcategory';
    
    if (!categories[cat]) {
        categories[cat] = {};
    }
    if (!categories[cat][subcat]) {
        categories[cat][subcat] = [];
    }
    
    if (categories[cat][subcat].length < 5) {
        categories[cat][subcat].push(product.name);
    }
});

console.log('📊 Top Categories Still Needing Images:\n');

Object.entries(categories)
    .sort((a, b) => {
        const aTotal = Object.values(a[1]).reduce((sum, arr) => sum + arr.length, 0);
        const bTotal = Object.values(b[1]).reduce((sum, arr) => sum + arr.length, 0);
        return bTotal - aTotal;
    })
    .slice(0, 5)
    .forEach(([cat, subcats], index) => {
        const total = Object.values(subcats).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`${index + 1}. ${cat}: ${total} products`);
        
        Object.entries(subcats)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3)
            .forEach(([subcat, examples]) => {
                console.log(`   └─ ${subcat}: ${examples.length} examples`);
                if (examples.length > 0) {
                    console.log(`      Example: ${examples[0].substring(0, 60)}`);
                }
            });
        console.log('');
    });

// Recommendation
console.log('\n💡 RECOMMENDATION:');
console.log('Apply generic image to remaining products.\n');
console.log('You can use:');
console.log('  - Motor.jpg for remaining motor/drive products');
console.log('  - HVAC1.jpeg for remaining HVAC products');
console.log('  - A generic product image for everything else\n');



const path = require('path');

console.log('\n🔍 Checking Remaining Products Without Images\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const withoutImages = data.products.filter(p => !p.imageUrl);
console.log(`📦 Products without images: ${withoutImages.length}\n`);

// Analyze by category
const categories = {};
withoutImages.forEach(product => {
    const cat = product.category || 'Uncategorized';
    const subcat = product.subcategory || 'No Subcategory';
    
    if (!categories[cat]) {
        categories[cat] = {};
    }
    if (!categories[cat][subcat]) {
        categories[cat][subcat] = [];
    }
    
    if (categories[cat][subcat].length < 5) {
        categories[cat][subcat].push(product.name);
    }
});

console.log('📊 Top Categories Still Needing Images:\n');

Object.entries(categories)
    .sort((a, b) => {
        const aTotal = Object.values(a[1]).reduce((sum, arr) => sum + arr.length, 0);
        const bTotal = Object.values(b[1]).reduce((sum, arr) => sum + arr.length, 0);
        return bTotal - aTotal;
    })
    .slice(0, 5)
    .forEach(([cat, subcats], index) => {
        const total = Object.values(subcats).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`${index + 1}. ${cat}: ${total} products`);
        
        Object.entries(subcats)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3)
            .forEach(([subcat, examples]) => {
                console.log(`   └─ ${subcat}: ${examples.length} examples`);
                if (examples.length > 0) {
                    console.log(`      Example: ${examples[0].substring(0, 60)}`);
                }
            });
        console.log('');
    });

// Recommendation
console.log('\n💡 RECOMMENDATION:');
console.log('Apply generic image to remaining products.\n');
console.log('You can use:');
console.log('  - Motor.jpg for remaining motor/drive products');
console.log('  - HVAC1.jpeg for remaining HVAC products');
console.log('  - A generic product image for everything else\n');





















