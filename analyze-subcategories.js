const fs = require('fs');
const path = require('path');

console.log('\n🔍 Detailed Subcategory Analysis for Placeholder Images\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log(`📦 Total Products: ${data.products.length}\n`);

// Analyze by subcategory
const subcategories = {};

data.products.forEach(product => {
    const subcat = product.subcategory || 'No Subcategory';
    
    if (!subcategories[subcat]) {
        subcategories[subcat] = {
            count: 0,
            examples: []
        };
    }
    
    subcategories[subcat].count++;
    
    // Keep up to 3 examples
    if (subcategories[subcat].examples.length < 3) {
        subcategories[subcat].examples.push(product.name);
    }
});

// Sort by count
const sorted = Object.entries(subcategories)
    .sort((a, b) => b[1].count - a[1].count);

console.log('📊 TOP 20 SUBCATEGORIES (by product count):\n');
console.log('Rank  │ Subcategory                           │ Count     │ Example');
console.log('─'.repeat(95));

sorted.slice(0, 20).forEach(([subcat, info], index) => {
    const rank = String(index + 1).padStart(2);
    const count = info.count.toString().padStart(5);
    const example = info.examples[0] || 'N/A';
    const displayCat = subcat.length > 39 ? subcat.substring(0, 36) + '...' : subcat;
    console.log(`${rank}    │ ${displayCat.padEnd(38)} │ ${count} │ ${example.substring(0, 40)}`);
});

console.log('\n');
console.log('🎯 RECOMMENDED PLACEHOLDERS (Based on Actual Products):\n');

// Map subcategories to placeholder types
const placeholderMap = {
    // Motors and Drives
    'NORD Gear Ltd': 'motor-drive-placeholder.jpg',
    'ABB Ltd': 'motor-drive-placeholder.jpg',
    'WEG Electric Motors (UK) Ltd': 'motor-drive-placeholder.jpg',
    'Invertek Drives Ltd': 'motor-drive-placeholder.jpg',
    'Danfoss Drives': 'motor-drive-placeholder.jpg',
    'Siemens Industrial': 'motor-drive-placeholder.jpg',
    
    // HVAC and Cooling
    'Evapco Europe NV': 'hvac-cooling-placeholder.jpg',
    'Daikin Commercial': 'hvac-cooling-placeholder.jpg',
    'Carrier Commercial': 'hvac-cooling-placeholder.jpg',
    'Trane Equipment': 'hvac-cooling-placeholder.jpg',
    
    // Professional Foodservice
    'Professional Foodservice Equipment': 'foodservice-placeholder.jpg',
    'Combination Steam Ovens': 'combio-oven-placeholder.jpg',
    'Commercial Ovens': 'commercial-oven-placeholder.jpg',
    'Commercial Dishwashers': 'commercial-dishwasher-placeholder.jpg',
    'Commercial Refrigeration': 'commercial-refrigeration-placeholder.jpg',
    
    // Appliances
    'Microwave': 'microwave-placeholder.jpg',
    'Washing Machine': 'washing-machine-placeholder.jpg',
    'Refrigerator': 'refrigerator-placeholder.jpg',
    'Oven': 'oven-placeholder.jpg',
    
    // Heat Pumps
    'Heat Pumps': 'heat-pump-placeholder.jpg',
    'Air Source Heat Pumps': 'heat-pump-placeholder.jpg',
    
    // Lighting
    'LED Bulbs': 'lighting-placeholder.jpg',
    
    // Smart Home
    'Smart Thermostats': 'smart-home-placeholder.jpg',
    'Smart Hubs': 'smart-home-placeholder.jpg',
    'Smart Sensors': 'smart-home-placeholder.jpg',
    
    // Office Equipment
    'Laptops': 'office-equipment-placeholder.jpg',
    'Computers': 'office-equipment-placeholder.jpg',
    'Printers': 'office-equipment-placeholder.jpg'
};

console.log('Category Type                      │ Suggested Placeholder Name              │ Count  │ Top Products');
console.log('─'.repeat(100));

const grouped = {};
sorted.forEach(([subcat, info]) => {
    let placeholder = 'generic-placeholder.jpg';
    
    // Try to find matching placeholder
    for (const [key, value] of Object.entries(placeholderMap)) {
        if (subcat.toLowerCase().includes(key.toLowerCase())) {
            placeholder = value;
            break;
        }
    }
    
    const categoryType = subcat.split(' ')[0]; // Get first word
    
    if (!grouped[placeholder]) {
        grouped[placeholder] = {
            total: 0,
            examples: new Set()
        };
    }
    
    grouped[placeholder].total += info.count;
    info.examples.forEach(ex => grouped[placeholder].examples.add(ex));
});

Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([placeholder, info]) => {
        const examples = Array.from(info.examples).slice(0, 2).join(', ');
        const padding = 35;
        const placeholderDisplay = placeholder.length > padding ? placeholder.substring(0, padding-3) + '...' : placeholder;
        console.log(`${placeholderDisplay.padEnd(35)} │ ${info.total.toString().padStart(5)} │ ${examples.substring(0, 55)}`);
    });

console.log('\n');
console.log('📋 FINAL RECOMMENDATION:\n');

console.log('You need these 12 placeholder images:\n');

const topPlaceholders = Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 12);

topPlaceholders.forEach(([placeholder, info], index) => {
    const name = placeholder.replace('.jpg', '');
    const count = info.total;
    const pct = ((count / data.products.length) * 100).toFixed(1);
    console.log(`${(index + 1).toString().padStart(2)}. ${placeholder.padEnd(40)} (${count} products, ${pct}% coverage)`);
});

console.log('\n✅ Once you have these images, I can apply them to all products!');



const path = require('path');

console.log('\n🔍 Detailed Subcategory Analysis for Placeholder Images\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log(`📦 Total Products: ${data.products.length}\n`);

// Analyze by subcategory
const subcategories = {};

data.products.forEach(product => {
    const subcat = product.subcategory || 'No Subcategory';
    
    if (!subcategories[subcat]) {
        subcategories[subcat] = {
            count: 0,
            examples: []
        };
    }
    
    subcategories[subcat].count++;
    
    // Keep up to 3 examples
    if (subcategories[subcat].examples.length < 3) {
        subcategories[subcat].examples.push(product.name);
    }
});

// Sort by count
const sorted = Object.entries(subcategories)
    .sort((a, b) => b[1].count - a[1].count);

console.log('📊 TOP 20 SUBCATEGORIES (by product count):\n');
console.log('Rank  │ Subcategory                           │ Count     │ Example');
console.log('─'.repeat(95));

sorted.slice(0, 20).forEach(([subcat, info], index) => {
    const rank = String(index + 1).padStart(2);
    const count = info.count.toString().padStart(5);
    const example = info.examples[0] || 'N/A';
    const displayCat = subcat.length > 39 ? subcat.substring(0, 36) + '...' : subcat;
    console.log(`${rank}    │ ${displayCat.padEnd(38)} │ ${count} │ ${example.substring(0, 40)}`);
});

console.log('\n');
console.log('🎯 RECOMMENDED PLACEHOLDERS (Based on Actual Products):\n');

// Map subcategories to placeholder types
const placeholderMap = {
    // Motors and Drives
    'NORD Gear Ltd': 'motor-drive-placeholder.jpg',
    'ABB Ltd': 'motor-drive-placeholder.jpg',
    'WEG Electric Motors (UK) Ltd': 'motor-drive-placeholder.jpg',
    'Invertek Drives Ltd': 'motor-drive-placeholder.jpg',
    'Danfoss Drives': 'motor-drive-placeholder.jpg',
    'Siemens Industrial': 'motor-drive-placeholder.jpg',
    
    // HVAC and Cooling
    'Evapco Europe NV': 'hvac-cooling-placeholder.jpg',
    'Daikin Commercial': 'hvac-cooling-placeholder.jpg',
    'Carrier Commercial': 'hvac-cooling-placeholder.jpg',
    'Trane Equipment': 'hvac-cooling-placeholder.jpg',
    
    // Professional Foodservice
    'Professional Foodservice Equipment': 'foodservice-placeholder.jpg',
    'Combination Steam Ovens': 'combio-oven-placeholder.jpg',
    'Commercial Ovens': 'commercial-oven-placeholder.jpg',
    'Commercial Dishwashers': 'commercial-dishwasher-placeholder.jpg',
    'Commercial Refrigeration': 'commercial-refrigeration-placeholder.jpg',
    
    // Appliances
    'Microwave': 'microwave-placeholder.jpg',
    'Washing Machine': 'washing-machine-placeholder.jpg',
    'Refrigerator': 'refrigerator-placeholder.jpg',
    'Oven': 'oven-placeholder.jpg',
    
    // Heat Pumps
    'Heat Pumps': 'heat-pump-placeholder.jpg',
    'Air Source Heat Pumps': 'heat-pump-placeholder.jpg',
    
    // Lighting
    'LED Bulbs': 'lighting-placeholder.jpg',
    
    // Smart Home
    'Smart Thermostats': 'smart-home-placeholder.jpg',
    'Smart Hubs': 'smart-home-placeholder.jpg',
    'Smart Sensors': 'smart-home-placeholder.jpg',
    
    // Office Equipment
    'Laptops': 'office-equipment-placeholder.jpg',
    'Computers': 'office-equipment-placeholder.jpg',
    'Printers': 'office-equipment-placeholder.jpg'
};

console.log('Category Type                      │ Suggested Placeholder Name              │ Count  │ Top Products');
console.log('─'.repeat(100));

const grouped = {};
sorted.forEach(([subcat, info]) => {
    let placeholder = 'generic-placeholder.jpg';
    
    // Try to find matching placeholder
    for (const [key, value] of Object.entries(placeholderMap)) {
        if (subcat.toLowerCase().includes(key.toLowerCase())) {
            placeholder = value;
            break;
        }
    }
    
    const categoryType = subcat.split(' ')[0]; // Get first word
    
    if (!grouped[placeholder]) {
        grouped[placeholder] = {
            total: 0,
            examples: new Set()
        };
    }
    
    grouped[placeholder].total += info.count;
    info.examples.forEach(ex => grouped[placeholder].examples.add(ex));
});

Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([placeholder, info]) => {
        const examples = Array.from(info.examples).slice(0, 2).join(', ');
        const padding = 35;
        const placeholderDisplay = placeholder.length > padding ? placeholder.substring(0, padding-3) + '...' : placeholder;
        console.log(`${placeholderDisplay.padEnd(35)} │ ${info.total.toString().padStart(5)} │ ${examples.substring(0, 55)}`);
    });

console.log('\n');
console.log('📋 FINAL RECOMMENDATION:\n');

console.log('You need these 12 placeholder images:\n');

const topPlaceholders = Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 12);

topPlaceholders.forEach(([placeholder, info], index) => {
    const name = placeholder.replace('.jpg', '');
    const count = info.total;
    const pct = ((count / data.products.length) * 100).toFixed(1);
    console.log(`${(index + 1).toString().padStart(2)}. ${placeholder.padEnd(40)} (${count} products, ${pct}% coverage)`);
});

console.log('\n✅ Once you have these images, I can apply them to all products!');





















