/**
 * PHASE 1: Product Sync Analysis
 * Matches Wix products to local database products
 * NO CHANGES WILL BE MADE - REPORT ONLY
 */

const fs = require('fs');

console.log('='.repeat(70));
console.log('PHASE 1: DETAILED MATCHING ANALYSIS');
console.log('NO CHANGES WILL BE MADE');
console.log('='.repeat(70));
console.log('');

const localDb = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const localProducts = localDb.products;

console.log('Local database: ' + localProducts.length + ' products');
console.log('');

// Key brands from Wix products
const brands = ['Electrolux', 'Zanussi', 'Baxi', 'Turbo', 'Splash', 'Invoq', 'Eloma', 'Joker', 'Dryflow', 'CHEFTOP'];

console.log('=== PRODUCTS BY BRAND IN LOCAL DATABASE ===');
console.log('');

for (const brand of brands) {
    const matches = localProducts.filter(p => 
        (p.name || '').toLowerCase().includes(brand.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(brand.toLowerCase())
    );
    console.log(`${brand}: ${matches.length} products`);
    if (matches.length > 0 && matches.length <= 10) {
        matches.forEach(m => console.log('  - ' + m.name.substring(0, 70)));
    }
}

console.log('');
console.log('=== LOOKING FOR SPECIFIC WIX PRODUCTS ===');
console.log('');

// Look for specific products manually
const searchTerms = [
    'Skyline',
    'Magistar', 
    'Solarflo',
    'Air Fury',
    'Turboforce',
    'TSL.89',
    'Hand Dryer',
    'Heat Pump',
    'Combi Oven',
    'Combi'
];

for (const term of searchTerms) {
    const matches = localProducts.filter(p => 
        (p.name || '').toLowerCase().includes(term.toLowerCase())
    );
    console.log(`"${term}": ${matches.length} products`);
    if (matches.length > 0 && matches.length <= 5) {
        matches.forEach(m => console.log('  - ' + m.name));
    }
}

console.log('');
console.log('=== PRODUCTS WITH MULTIPLE IMAGES IN LOCAL DB ===');
console.log('');

const withMultipleImages = localProducts.filter(p => 
    p.images && Array.isArray(p.images) && p.images.length > 1
);
console.log(`Products with multiple images: ${withMultipleImages.length}`);

const withVideos = localProducts.filter(p => 
    p.videos && Array.isArray(p.videos) && p.videos.length > 0
);
console.log(`Products with videos: ${withVideos.length}`);

console.log('');
console.log('=== SAMPLE PRODUCTS WITH IMAGES/VIDEOS ===');
console.log('');

let shown = 0;
for (const p of localProducts) {
    const hasMultipleImages = p.images && Array.isArray(p.images) && p.images.length > 1;
    const hasVideos = p.videos && Array.isArray(p.videos) && p.videos.length > 0;
    
    if (hasMultipleImages || hasVideos) {
        console.log(`Name: ${p.name}`);
        console.log(`  Images: ${p.images ? p.images.length : 0}`);
        console.log(`  Videos: ${p.videos ? p.videos.length : 0}`);
        console.log(`  imageUrl: ${p.imageUrl || 'none'}`);
        shown++;
        if (shown >= 5) break;
    }
}

console.log('');
console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

