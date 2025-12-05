const fs = require('fs');
const path = require('path');

// Load the JSON file
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Find all Air Fury products
const airFury = data.products.filter(p => 
    p.name && p.name.toLowerCase().includes('air fury')
);

console.log('='.repeat(60));
console.log('AIR FURY PRODUCT ANALYSIS');
console.log('='.repeat(60));
console.log(`\nTotal Air Fury Products Found: ${airFury.length}`);

// Check for Wix enrichment
const withWix = airFury.filter(p => p.wixId || p.wixProductUrl || p.enrichedFromWix);
console.log(`Products with Wix data: ${withWix.length}`);

console.log('\n' + '='.repeat(60));
console.log('All Air Fury Products:');
console.log('='.repeat(60));

airFury.forEach((p, index) => {
    console.log(`\n${index + 1}. ${p.name}`);
    console.log(`   ID: ${p.id || 'N/A'}`);
    console.log(`   Brand: ${p.brand || 'N/A'}`);
    console.log(`   Category: ${p.category || 'N/A'}`);
    
    // Check for Wix data
    console.log(`   Wix ID: ${p.wixId || 'N/A'}`);
    console.log(`   Wix URL: ${p.wixProductUrl || 'N/A'}`);
    console.log(`   Enriched from Wix: ${p.enrichedFromWix || false}`);
    
    // Check images
    if (p.images) {
        try {
            const images = JSON.parse(p.images);
            console.log(`   Images: ${images.length} (${typeof images === 'string' ? 'string' : 'array'})`);
            if (images.length > 0) {
                console.log(`   Image URLs: ${images.slice(0, 3).join(', ')}${images.length > 3 ? '...' : ''}`);
            }
        } catch (e) {
            console.log(`   Images: ${p.images} (raw string)`);
        }
    } else {
        console.log(`   Images: N/A`);
    }
    
    // Check videos
    if (p.videos) {
        try {
            const videos = JSON.parse(p.videos);
            console.log(`   Videos: ${videos.length} (${typeof videos === 'string' ? 'string' : 'array'})`);
            if (videos.length > 0) {
                console.log(`   Video URLs: ${videos.slice(0, 2).join(', ')}${videos.length > 2 ? '...' : ''}`);
            }
        } catch (e) {
            console.log(`   Videos: ${p.videos} (raw string)`);
        }
    } else {
        console.log(`   Videos: N/A`);
    }
    
    // Check main image
    console.log(`   Main Image: ${p.imageUrl || 'N/A'}`);
});

// Check for unique Air Fury products (by name)
const uniqueNames = [...new Set(airFury.map(p => p.name))];
console.log('\n' + '='.repeat(60));
console.log('Unique Air Fury Product Names:');
console.log('='.repeat(60));
uniqueNames.forEach(name => {
    const count = airFury.filter(p => p.name === name).length;
    console.log(`  - ${name} (${count} entries)`);
});

