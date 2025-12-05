/**
 * PHASE 1: Full Product Sync Analysis
 * Matches ALL Wix products to local database products
 * NO CHANGES WILL BE MADE - REPORT ONLY
 */

const fs = require('fs');

console.log('='.repeat(70));
console.log('PHASE 1: FULL SYNC ANALYSIS REPORT');
console.log('NO CHANGES WILL BE MADE');
console.log('='.repeat(70));
console.log('');

// Load local database
const localDb = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const localProducts = localDb.products;

// Wix products (extracted from API calls)
const wixProducts = [
  { name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT", images: 2, videos: 0 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101BA21", images: 2, videos: 0 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101T2A1", images: 2, videos: 0 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101B2A2", images: 2, videos: 0 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101T2A0", images: 2, videos: 0 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA2", images: 2, videos: 0 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA20", images: 2, videos: 0 },
  { name: "Air Fury High Speed Dryer (C)", images: 5, videos: 1 },
  { name: "Air Fury High Speed Dryer (W)", images: 3, videos: 1 },
  { name: "Air Fury High Speed Dryer (CS)", images: 3, videos: 1 },
  { name: "The Splash Lab Air Fury High Speed Hand Dryer TSL.89", images: 4, videos: 1 },
  { name: "Turbo Force Branded Polished Fast Dry", images: 4, videos: 0 },
  { name: "Turbo Force Branded White Fast Dry", images: 4, videos: 0 },
  { name: "Turboforce® Hand Dryer", images: 4, videos: 0 },
  { name: "Magistar 218733 Combi TS - Electric Combi Oven 10 GN 2/1", images: 3, videos: 0 },
  { name: "Zanussi Magistar Combi TS Natural Gas Combi Oven 10GN1/1 Model ZCOE101B2AL", images: 3, videos: 1 },
  { name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101T2A2", images: 2, videos: 0 },
  { name: "JOKER by Eloma GmbH", images: 6, videos: 2 },
  { name: "Invoq Combi 10-1/1 GN", images: 2, videos: 0 },
  { name: "Invoq Combi 6-1/1GN", images: 2, videos: 0 },
  { name: "Invoq Bake 6-400×600 EN PassThrough", images: 3, videos: 1 },
  { name: "LQB9 - Invoq Bake 9-400×600", images: 4, videos: 0 },
  { name: "Invoq Bake 6-400×600", images: 3, videos: 1 },
  { name: "Baxi Auriga HP 26T", images: 2, videos: 1 }
];

// Function to find best match in local database
function findBestMatch(wixName, localProducts) {
    const wixLower = wixName.toLowerCase();
    
    // Try exact match first
    for (const local of localProducts) {
        const localName = (local.name || '').toLowerCase();
        if (localName === wixLower) {
            return { match: local, type: 'exact', score: 100 };
        }
    }
    
    // Try partial matches
    let bestMatch = null;
    let bestScore = 0;
    
    // Extract key terms
    const wixTerms = wixLower.split(/[\s\-\(\)]+/).filter(t => t.length > 2);
    
    for (const local of localProducts) {
        const localName = (local.name || '').toLowerCase();
        const localTerms = localName.split(/[\s\-\(\)]+/).filter(t => t.length > 2);
        
        // Count matching terms
        let matchingTerms = 0;
        for (const term of wixTerms) {
            if (localName.includes(term)) matchingTerms++;
        }
        
        // Calculate score
        const score = Math.round((matchingTerms / wixTerms.length) * 100);
        
        if (score > bestScore && score >= 40) { // At least 40% match
            bestScore = score;
            bestMatch = local;
        }
    }
    
    if (bestMatch) {
        return { match: bestMatch, type: 'partial', score: bestScore };
    }
    
    return null;
}

console.log('=== MATCHING RESULTS ===');
console.log('');

const results = {
    exact: [],
    partial: [],
    noMatch: []
};

for (const wix of wixProducts) {
    const result = findBestMatch(wix.name, localProducts);
    
    if (result) {
        if (result.type === 'exact') {
            results.exact.push({
                wix: wix,
                local: result.match,
                score: result.score
            });
        } else {
            results.partial.push({
                wix: wix,
                local: result.match,
                score: result.score
            });
        }
    } else {
        results.noMatch.push(wix);
    }
}

// Print exact matches
console.log('✓ EXACT MATCHES: ' + results.exact.length);
console.log('-'.repeat(50));
for (const r of results.exact) {
    console.log('  Wix: ' + r.wix.name.substring(0, 50));
    console.log('  Local: ' + r.local.name);
    console.log('  Would add: ' + r.wix.images + ' images, ' + r.wix.videos + ' videos');
    console.log('');
}

console.log('');
console.log('~ PARTIAL MATCHES: ' + results.partial.length);
console.log('-'.repeat(50));
for (const r of results.partial) {
    console.log('  Wix: ' + r.wix.name.substring(0, 55));
    console.log('  Local: ' + r.local.name.substring(0, 55));
    console.log('  Match Score: ' + r.score + '%');
    console.log('  Would add: ' + r.wix.images + ' images, ' + r.wix.videos + ' videos');
    console.log('');
}

console.log('');
console.log('✗ NO MATCH FOUND: ' + results.noMatch.length);
console.log('-'.repeat(50));
for (const wix of results.noMatch) {
    console.log('  ' + wix.name);
}

console.log('');
console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log('');
console.log('Total Wix Products Analyzed: ' + wixProducts.length);
console.log('Exact Matches: ' + results.exact.length);
console.log('Partial Matches: ' + results.partial.length);
console.log('No Match: ' + results.noMatch.length);
console.log('');
console.log('Match Rate: ' + Math.round(((results.exact.length + results.partial.length) / wixProducts.length) * 100) + '%');
console.log('');

// Calculate total media that would be added
let totalImages = 0;
let totalVideos = 0;
for (const r of [...results.exact, ...results.partial]) {
    totalImages += r.wix.images;
    totalVideos += r.wix.videos;
}

console.log('=== IF SYNC IS APPROVED ===');
console.log('');
console.log('Products to update: ' + (results.exact.length + results.partial.length));
console.log('Total images to add: ' + totalImages);
console.log('Total videos to add: ' + totalVideos);
console.log('');
console.log('NOTE: This would ADD image/video URLs from Wix to the existing');
console.log('      products in the local database. It will NOT delete any');
console.log('      existing images or change other product data.');

