const fs = require('fs');
const path = require('path');

// Load the JSON file
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Find all hand dryers
const handDryers = data.products.filter(p => 
    p.name && (
        p.name.toLowerCase().includes('hand dryer') || 
        p.name.toLowerCase().includes('handdryer') ||
        p.name.toLowerCase().includes('hand-dryer')
    )
);

console.log('='.repeat(60));
console.log('HAND DRYER COUNT ANALYSIS');
console.log('='.repeat(60));
console.log(`\nTotal Hand Dryers Found: ${handDryers.length}`);
console.log(`\nUnique Hand Dryer Products:`);

// Group by unique name
const unique = [...new Set(handDryers.map(p => p.name))];
unique.forEach(name => {
    const count = handDryers.filter(p => p.name === name).length;
    console.log(`  - ${name} (${count} entry/entries)`);
});

console.log('\n' + '='.repeat(60));
console.log('All Hand Dryer Entries:');
console.log('='.repeat(60));
handDryers.forEach((p, index) => {
    console.log(`${index + 1}. ${p.name}`);
    console.log(`   Brand: ${p.brand || 'N/A'}`);
    console.log(`   Category: ${p.category || 'N/A'}`);
    console.log(`   Subcategory: ${p.subcategory || 'N/A'}`);
    console.log(`   ID: ${p.id || 'N/A'}`);
    console.log('');
});

console.log('\n' + '='.repeat(60));
console.log('CATEGORY ANALYSIS');
console.log('='.repeat(60));
console.log('\nAll hand dryers are in category: "ETL Technology"');
console.log('This category is NOT mapped to any display category in routes/products.js');
console.log('So they will show as "ETL Technology" category, which may not be visible on the marketplace.');

