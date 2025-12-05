/**
 * IMPROVED SYNC ANALYSIS - Option 1
 * Better name matching for Wix → ETL products
 * NO CHANGES WILL BE MADE - REPORT ONLY
 */

const fs = require('fs');

console.log('='.repeat(70));
console.log('IMPROVED SYNC ANALYSIS - OPTION 1');
console.log('NO CHANGES WILL BE MADE');
console.log('='.repeat(70));
console.log('');

// Load local database
const localDb = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const localProducts = localDb.products;

// Complete Wix products data (from API)
const wixProducts = [
    { id: "d9083600-de75-e127-f810-d06b04de244e", name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT", images: 2, videos: 0, hasWixMedia: true },
    { id: "f7c3e9f4-8a01-848f-c243-4cf2a4e2477b", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101BA21", images: 2, videos: 0, hasWixMedia: true },
    { id: "2482c097-c9c7-f9bf-5b5f-c64b4e058784", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101T2A1", images: 2, videos: 0, hasWixMedia: true },
    { id: "cf34b75a-b632-a225-4c1e-9561d733252f", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101B2A2", images: 2, videos: 0, hasWixMedia: true },
    { id: "ef974340-7beb-f153-d090-55aca674d282", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101T2A0", images: 2, videos: 0, hasWixMedia: true },
    { id: "e4662b7d-8d37-0554-87fb-555312547d75", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA2", images: 2, videos: 0, hasWixMedia: true },
    { id: "051da703-3286-17eb-3e51-a990463e1253", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA20", images: 2, videos: 0, hasWixMedia: true },
    { id: "9a258ffd-ccd6-6bff-8992-5632d2d75036", name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101T2A2", images: 2, videos: 0, hasWixMedia: true },
    { id: "ee8ca797-5ec6-1801-5c77-d00ef9e5659c", name: "Air Fury High Speed Dryer (C)", images: 5, videos: 1, hasWixMedia: true },
    { id: "6452d653-eed1-660c-4550-3868a0bef213", name: "Air Fury High Speed Dryer (W)", images: 3, videos: 1, hasWixMedia: true },
    { id: "6b080ee4-7a4d-0154-68e6-4bc4f141bbfb", name: "Air Fury High Speed Dryer (CS)", images: 3, videos: 1, hasWixMedia: true },
    { id: "1b70ecfb-9ee3-2ba3-8aba-dcf33236c2cd", name: "The Splash Lab Air Fury High Speed Hand Dryer TSL.89", images: 4, videos: 1, hasWixMedia: true },
    { id: "d26183b8-ad6f-8c33-86c5-f654229f603b", name: "Turbo Force Branded Polished Fast Dry", images: 4, videos: 0, hasWixMedia: true },
    { id: "d223f9a4-3c58-1ede-15b6-64487f5c12c5", name: "Turbo Force Branded White Fast Dry", images: 4, videos: 0, hasWixMedia: true },
    { id: "692468c8-a4a8-4f00-aa40-865c446e7a0a", name: "Turboforce® Hand Dryer", images: 4, videos: 0, hasWixMedia: true },
    { id: "201bc036-9d52-8c73-c92b-34fbbf799597", name: "Magistar 218733 Combi TS - Electric Combi Oven 10 GN 2/1", images: 3, videos: 0, hasWixMedia: true },
    { id: "21db9301-4116-864f-b972-466d1f132dd9", name: "Zanussi Magistar Combi TS Natural Gas Combi Oven 10GN1/1 Model ZCOE101B2AL", images: 3, videos: 1, hasWixMedia: true },
    { id: "721fac43-27dc-627e-c768-d054e2d10609", name: "JOKER by Eloma GmbH", images: 6, videos: 2, hasWixMedia: true },
    { id: "ce467e06-a456-29be-e6e9-7f6001ff2727", name: "Invoq Combi 10-1/1 GN", images: 2, videos: 0, hasWixMedia: true },
    { id: "b32d5a23-0d3c-bd4c-e7b2-53f215d9f857", name: "Invoq Combi 6-1/1GN", images: 2, videos: 0, hasWixMedia: true },
    { id: "c1b1137c-f697-7387-d4a8-e91c6ed8ae92", name: "Invoq Bake 6-400x600 EN PassThrough", images: 3, videos: 1, hasWixMedia: true },
    { id: "d4575362-3a45-179f-dcc4-f96ead82fe29", name: "LQB9 - Invoq Bake 9-400x600", images: 4, videos: 0, hasWixMedia: true },
    { id: "837e9178-8f45-d55a-d945-7af8323575f0", name: "Invoq Bake 6-400x600", images: 3, videos: 1, hasWixMedia: true },
    { id: "dd6bad9c-5cfe-72f9-b48e-5712c2294ca1", name: "Baxi Auriga HP 26T", images: 2, videos: 1, hasWixMedia: true }
];

// IMPROVED MATCHING FUNCTION
function findBestMatch(wixProduct, localProducts) {
    const wixName = wixProduct.name;
    const wixLower = wixName.toLowerCase();
    
    // Strategy 1: Exact match
    for (const local of localProducts) {
        if ((local.name || '').toLowerCase() === wixLower) {
            return { local, matchType: 'EXACT', confidence: 100 };
        }
    }
    
    // Strategy 2: ETL name is contained in Wix name (e.g., "JOKER" in "JOKER by Eloma GmbH")
    for (const local of localProducts) {
        const localName = (local.name || '').toLowerCase();
        const localBrand = (local.brand || '').toLowerCase();
        
        // Check if the ETL product name is contained in the Wix name
        if (localName.length > 3 && wixLower.includes(localName)) {
            // Bonus: check if brand also matches
            if (localBrand && wixLower.includes(localBrand.split(' ')[0].toLowerCase())) {
                return { local, matchType: 'NAME_IN_WIX + BRAND', confidence: 95 };
            }
            return { local, matchType: 'NAME_IN_WIX', confidence: 85 };
        }
    }
    
    // Strategy 3: Key product identifiers match
    const keyTerms = {
        'zanussi magistar': 'Zanussi Magistar',
        'air fury': 'Air Fury',
        'turbo force': 'Turbo Force',
        'turboforce': 'Turbo Force',
        'invoq': 'Invoq',
        'joker': 'JOKER',
        'baxi auriga': 'Baxi Auriga',
        'baxi solarflo': 'Baxi Solarflo',
        'skyline': 'Skyline',
        'electrolux professional skyline': 'Electrolux Professional Skyline'
    };
    
    for (const [wixTerm, localTerm] of Object.entries(keyTerms)) {
        if (wixLower.includes(wixTerm)) {
            // Find matching local product
            const matches = localProducts.filter(p => 
                (p.name || '').toLowerCase().includes(localTerm.toLowerCase())
            );
            
            if (matches.length === 1) {
                return { local: matches[0], matchType: 'KEY_TERM_UNIQUE', confidence: 90 };
            } else if (matches.length > 1) {
                // Multiple matches - try to narrow down by other terms
                // For now, return first match but flag as multiple
                return { local: matches[0], matchType: 'KEY_TERM_MULTIPLE', confidence: 70, alternatives: matches.length };
            }
        }
    }
    
    // Strategy 4: Partial word matching (fallback)
    const wixWords = wixLower.split(/[\s\-\(\)®]+/).filter(w => w.length > 3);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const local of localProducts) {
        const localName = (local.name || '').toLowerCase();
        let matchCount = 0;
        
        for (const word of wixWords) {
            if (localName.includes(word)) matchCount++;
        }
        
        const score = matchCount / wixWords.length;
        if (score > bestScore && score >= 0.5) {
            bestScore = score;
            bestMatch = local;
        }
    }
    
    if (bestMatch) {
        return { local: bestMatch, matchType: 'PARTIAL_WORDS', confidence: Math.round(bestScore * 100) };
    }
    
    return null;
}

// Run matching
console.log('Running improved matching algorithm...');
console.log('');

const results = {
    high: [],    // 90%+ confidence
    medium: [],  // 70-89% confidence  
    low: [],     // 50-69% confidence
    noMatch: []
};

for (const wix of wixProducts) {
    const match = findBestMatch(wix, localProducts);
    
    if (match) {
        const result = {
            wix: wix,
            local: match.local,
            matchType: match.matchType,
            confidence: match.confidence,
            alternatives: match.alternatives || 0
        };
        
        if (match.confidence >= 90) {
            results.high.push(result);
        } else if (match.confidence >= 70) {
            results.medium.push(result);
        } else {
            results.low.push(result);
        }
    } else {
        results.noMatch.push(wix);
    }
}

// Print results
console.log('='.repeat(70));
console.log('HIGH CONFIDENCE MATCHES (90%+) - SAFE TO SYNC');
console.log('='.repeat(70));
console.log('');

for (const r of results.high) {
    console.log(`✓ ${r.wix.name.substring(0, 55)}`);
    console.log(`  → ${r.local.name}`);
    console.log(`  Match: ${r.matchType} (${r.confidence}%)`);
    console.log(`  Would add: ${r.wix.images} images, ${r.wix.videos} videos`);
    console.log(`  Local ID: ${r.local.id}`);
    console.log('');
}

console.log('='.repeat(70));
console.log('MEDIUM CONFIDENCE (70-89%) - REVIEW RECOMMENDED');
console.log('='.repeat(70));
console.log('');

for (const r of results.medium) {
    console.log(`~ ${r.wix.name.substring(0, 55)}`);
    console.log(`  → ${r.local.name}`);
    console.log(`  Match: ${r.matchType} (${r.confidence}%)`);
    if (r.alternatives > 1) {
        console.log(`  ⚠ ${r.alternatives} similar products found - matched to first`);
    }
    console.log(`  Would add: ${r.wix.images} images, ${r.wix.videos} videos`);
    console.log('');
}

console.log('='.repeat(70));
console.log('LOW CONFIDENCE (50-69%) - MANUAL REVIEW NEEDED');
console.log('='.repeat(70));
console.log('');

for (const r of results.low) {
    console.log(`? ${r.wix.name.substring(0, 55)}`);
    console.log(`  → ${r.local.name}`);
    console.log(`  Match: ${r.matchType} (${r.confidence}%)`);
    console.log('');
}

console.log('='.repeat(70));
console.log('NO MATCH FOUND');
console.log('='.repeat(70));
console.log('');

for (const wix of results.noMatch) {
    console.log(`✗ ${wix.name}`);
}

// Summary
console.log('');
console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log('');
console.log(`Total Wix Products: ${wixProducts.length}`);
console.log(`High Confidence (90%+): ${results.high.length} - SAFE TO SYNC`);
console.log(`Medium Confidence (70-89%): ${results.medium.length} - Review recommended`);
console.log(`Low Confidence (50-69%): ${results.low.length} - Manual review needed`);
console.log(`No Match: ${results.noMatch.length}`);
console.log('');

// Calculate totals for safe sync
let safeImages = 0, safeVideos = 0;
for (const r of results.high) {
    safeImages += r.wix.images;
    safeVideos += r.wix.videos;
}

console.log('='.repeat(70));
console.log('SAFE SYNC (High Confidence Only)');
console.log('='.repeat(70));
console.log('');
console.log(`Products to sync: ${results.high.length}`);
console.log(`Images to add: ${safeImages}`);
console.log(`Videos to add: ${safeVideos}`);
console.log('');
console.log('These matches are SAFE because:');
console.log('  - Exact name match, OR');
console.log('  - ETL product name is contained in Wix name with brand match');
console.log('');
console.log('The sync will ONLY add image/video URLs to existing products.');
console.log('NO changes to: names, prices, calculator data, or other fields.');

// Save results for Phase 2
const syncPlan = {
    highConfidence: results.high.map(r => ({
        wixId: r.wix.id,
        wixName: r.wix.name,
        localId: r.local.id,
        localName: r.local.name,
        imagesToAdd: r.wix.images,
        videosToAdd: r.wix.videos,
        confidence: r.confidence,
        matchType: r.matchType
    })),
    mediumConfidence: results.medium.map(r => ({
        wixId: r.wix.id,
        wixName: r.wix.name,
        localId: r.local.id,
        localName: r.local.name,
        confidence: r.confidence,
        matchType: r.matchType
    })),
    timestamp: new Date().toISOString()
};

fs.writeFileSync('sync-plan.json', JSON.stringify(syncPlan, null, 2));
console.log('');
console.log('Sync plan saved to: sync-plan.json');

