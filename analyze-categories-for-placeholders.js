const fs = require('fs');
const path = require('path');

console.log('\n🔍 Analyzing Categories for Placeholder Images\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log(`📦 Total Products: ${data.products.length}\n`);

// Analyze categories
const categories = {};
const subcategories = {};

data.products.forEach(product => {
    const cat = product.category || 'Uncategorized';
    const subcat = product.subcategory || 'None';
    
    // Count by category
    if (!categories[cat]) {
        categories[cat] = 0;
    }
    categories[cat]++;
    
    // Count by subcategory
    if (!subcategories[subcat]) {
        subcategories[subcat] = [];
    }
    subcategories[subcat].push(cat);
});

// Sort by count
const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1]);

console.log('📊 MAIN CATEGORIES (by product count):\n');

sortedCategories.slice(0, 20).forEach(([cat, count], index) => {
    const bar = '█'.repeat(Math.floor(count / 50));
    console.log(`${String(index + 1).padStart(2)}. ${cat.padEnd(35)} ${count.toString().padStart(5)} ${bar}`);
});

console.log('\n');
console.log('🔍 DETAILED BREAKDOWN:\n');

// Show top categories with subcategories
sortedCategories.slice(0, 10).forEach(([cat, count]) => {
    console.log(`\n📁 ${cat} (${count} products)`);
    
    // Get subcategories for this category
    const subcats = {};
    data.products
        .filter(p => p.category === cat)
        .forEach(p => {
            const sub = p.subcategory || 'None';
            subcats[sub] = (subcats[sub] || 0) + 1;
        });
    
    Object.entries(subcats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([sub, count]) => {
            console.log(`   └─ ${sub.padEnd(30)} ${count} products`);
        });
});

// Identify placeholder needs
console.log('\n');
console.log('🎯 RECOMMENDED PLACEHOLDER IMAGES:\n');

const recommendedCategories = {
    'Refrigeration': 'refrigeration-placeholder.jpg',
    'HVAC': 'hvac-placeholder.jpg',
    'Commercial Ovens': 'oven-placeholder.jpg',
    'Heating Systems': 'heating-placeholder.jpg',
    'Hand Dryers': 'hand-dryer-placeholder.jpg',
    'Appliance': 'appliance-placeholder.jpg',
    'Food Service': 'foodservice-placeholder.jpg',
    'Motor & Controls': 'motor-placeholder.jpg',
    'Lighting': 'lighting-placeholder.jpg',
    'Insulation': 'insulation-placeholder.jpg'
};

let placeholderCount = 0;
console.log('Category                    │ Placeholder Name                  │ Estimated Coverage');
console.log('─'.repeat(85));

sortedCategories.slice(0, 15).forEach(([cat, count]) => {
    let placeholderName;
    
    // Match to recommended placeholders
    if (cat.toLowerCase().includes('refrigerat') || cat.toLowerCase().includes('freezer')) {
        placeholderName = 'refrigeration-placeholder.jpg';
    } else if (cat.toLowerCase().includes('hvac') || cat.toLowerCase().includes('air')) {
        placeholderName = 'hvac-placeholder.jpg';
    } else if (cat.toLowerCase().includes('oven') || cat.toLowerCase().includes('comb')) {
        placeholderName = 'oven-placeholder.jpg';
    } else if (cat.toLowerCase().includes('heat')) {
        placeholderName = 'heating-placeholder.jpg';
    } else if (cat.toLowerCase().includes('hand dryer') || cat.toLowerCase().includes('dryer')) {
        placeholderName = 'hand-dryer-placeholder.jpg';
    } else if (cat.toLowerCase().includes('appliance')) {
        placeholderName = 'appliance-placeholder.jpg';
    } else if (cat.toLowerCase().includes('food') || cat.toLowerCase().includes('commercial')) {
        placeholderName = 'foodservice-placeholder.jpg';
    } else if (cat.toLowerCase().includes('motor') || cat.toLowerCase().includes('control')) {
        placeholderName = 'motor-placeholder.jpg';
    } else if (cat.toLowerCase().includes('light')) {
        placeholderName = 'lighting-placeholder.jpg';
    } else if (cat.toLowerCase().includes('insulat')) {
        placeholderName = 'insulation-placeholder.jpg';
    } else {
        placeholderName = 'generic-placeholder.jpg';
    }
    
    const coverage = Math.round((count / data.products.length) * 100) + '%';
    console.log(`${cat.padEnd(27)} │ ${placeholderName.padEnd(33)} │ ${coverage}`);
});

console.log('\n');
console.log('📋 SUMMARY:');
console.log(`   Total Products: ${data.products.length}`);
console.log(`   Unique Categories: ${Object.keys(categories).length}`);
console.log(`   Recommended Placeholders: 8-10 images\n`);



const path = require('path');

console.log('\n🔍 Analyzing Categories for Placeholder Images\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log(`📦 Total Products: ${data.products.length}\n`);

// Analyze categories
const categories = {};
const subcategories = {};

data.products.forEach(product => {
    const cat = product.category || 'Uncategorized';
    const subcat = product.subcategory || 'None';
    
    // Count by category
    if (!categories[cat]) {
        categories[cat] = 0;
    }
    categories[cat]++;
    
    // Count by subcategory
    if (!subcategories[subcat]) {
        subcategories[subcat] = [];
    }
    subcategories[subcat].push(cat);
});

// Sort by count
const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1]);

console.log('📊 MAIN CATEGORIES (by product count):\n');

sortedCategories.slice(0, 20).forEach(([cat, count], index) => {
    const bar = '█'.repeat(Math.floor(count / 50));
    console.log(`${String(index + 1).padStart(2)}. ${cat.padEnd(35)} ${count.toString().padStart(5)} ${bar}`);
});

console.log('\n');
console.log('🔍 DETAILED BREAKDOWN:\n');

// Show top categories with subcategories
sortedCategories.slice(0, 10).forEach(([cat, count]) => {
    console.log(`\n📁 ${cat} (${count} products)`);
    
    // Get subcategories for this category
    const subcats = {};
    data.products
        .filter(p => p.category === cat)
        .forEach(p => {
            const sub = p.subcategory || 'None';
            subcats[sub] = (subcats[sub] || 0) + 1;
        });
    
    Object.entries(subcats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([sub, count]) => {
            console.log(`   └─ ${sub.padEnd(30)} ${count} products`);
        });
});

// Identify placeholder needs
console.log('\n');
console.log('🎯 RECOMMENDED PLACEHOLDER IMAGES:\n');

const recommendedCategories = {
    'Refrigeration': 'refrigeration-placeholder.jpg',
    'HVAC': 'hvac-placeholder.jpg',
    'Commercial Ovens': 'oven-placeholder.jpg',
    'Heating Systems': 'heating-placeholder.jpg',
    'Hand Dryers': 'hand-dryer-placeholder.jpg',
    'Appliance': 'appliance-placeholder.jpg',
    'Food Service': 'foodservice-placeholder.jpg',
    'Motor & Controls': 'motor-placeholder.jpg',
    'Lighting': 'lighting-placeholder.jpg',
    'Insulation': 'insulation-placeholder.jpg'
};

let placeholderCount = 0;
console.log('Category                    │ Placeholder Name                  │ Estimated Coverage');
console.log('─'.repeat(85));

sortedCategories.slice(0, 15).forEach(([cat, count]) => {
    let placeholderName;
    
    // Match to recommended placeholders
    if (cat.toLowerCase().includes('refrigerat') || cat.toLowerCase().includes('freezer')) {
        placeholderName = 'refrigeration-placeholder.jpg';
    } else if (cat.toLowerCase().includes('hvac') || cat.toLowerCase().includes('air')) {
        placeholderName = 'hvac-placeholder.jpg';
    } else if (cat.toLowerCase().includes('oven') || cat.toLowerCase().includes('comb')) {
        placeholderName = 'oven-placeholder.jpg';
    } else if (cat.toLowerCase().includes('heat')) {
        placeholderName = 'heating-placeholder.jpg';
    } else if (cat.toLowerCase().includes('hand dryer') || cat.toLowerCase().includes('dryer')) {
        placeholderName = 'hand-dryer-placeholder.jpg';
    } else if (cat.toLowerCase().includes('appliance')) {
        placeholderName = 'appliance-placeholder.jpg';
    } else if (cat.toLowerCase().includes('food') || cat.toLowerCase().includes('commercial')) {
        placeholderName = 'foodservice-placeholder.jpg';
    } else if (cat.toLowerCase().includes('motor') || cat.toLowerCase().includes('control')) {
        placeholderName = 'motor-placeholder.jpg';
    } else if (cat.toLowerCase().includes('light')) {
        placeholderName = 'lighting-placeholder.jpg';
    } else if (cat.toLowerCase().includes('insulat')) {
        placeholderName = 'insulation-placeholder.jpg';
    } else {
        placeholderName = 'generic-placeholder.jpg';
    }
    
    const coverage = Math.round((count / data.products.length) * 100) + '%';
    console.log(`${cat.padEnd(27)} │ ${placeholderName.padEnd(33)} │ ${coverage}`);
});

console.log('\n');
console.log('📋 SUMMARY:');
console.log(`   Total Products: ${data.products.length}`);
console.log(`   Unique Categories: ${Object.keys(categories).length}`);
console.log(`   Recommended Placeholders: 8-10 images\n`);





















