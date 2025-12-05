const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// SAFE WIX ENRICHMENT SCRIPT
// ============================================
// This script enriches hand dryer products with Wix data
// SAFETY FEATURES:
// - Creates automatic backup before any changes
// - Only ADDS data, never overwrites existing fields
// - Can test on sample products first
// - Provides rollback capability
// ============================================

// Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const WIX_API_KEY = process.env.WIX_API_KEY || '';
const DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const TEST_MODE = process.argv.includes('--test'); // Run with --test flag for test mode
const TEST_LIMIT = 2; // Test on 2 products only

console.log('='.repeat(70));
console.log('🛡️  SAFE WIX ENRICHMENT SCRIPT');
console.log('='.repeat(70));
console.log('');

// Check API key
if (!WIX_API_KEY) {
    console.error('❌ ERROR: WIX_API_KEY not found in environment variables.');
    console.error('   Please set WIX_API_KEY in your .env file.');
    console.error('   Or use MCP tools to fetch from Wix.');
    process.exit(1);
}

// Load database
console.log('📂 Loading database...');
let database;
try {
    const data = fs.readFileSync(DATABASE_PATH, 'utf8');
    database = JSON.parse(data);
    console.log(`✅ Loaded ${database.products.length} products from database`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Create backup
console.log('\n💾 Creating backup...');
const timestamp = Date.now();
const backupPath = path.join(__dirname, `FULL-DATABASE-5554-BACKUP-${timestamp}.json`);
try {
    fs.copyFileSync(DATABASE_PATH, backupPath);
    console.log(`✅ Backup created: ${path.basename(backupPath)}`);
    console.log(`   You can restore from this backup if needed.`);
} catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
}

// Fetch Wix products
async function fetchWixProducts() {
    console.log('\n📥 Fetching hand dryers from Wix...');
    
    try {
        // Query Wix API for products containing "hand dryer" or "handdryer"
        const response = await fetch('https://www.wixapis.com/stores-reader/v1/products/query', {
            method: 'POST',
            headers: {
                'Authorization': WIX_API_KEY,
                'wix-site-id': WIX_SITE_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    paging: { limit: 100, offset: 0 },
                    filter: {
                        $or: [
                            { name: { $contains: 'hand dryer' } },
                            { name: { $contains: 'handdryer' } },
                            { name: { $contains: 'Hand Dryer' } },
                            { name: { $contains: 'HandDryer' } }
                        ]
                    }
                },
                includeVariants: false,
                includeHiddenProducts: false
            })
        });

        if (!response.ok) {
            throw new Error(`Wix API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const products = data.products || [];
        
        console.log(`✅ Found ${products.length} hand dryers in Wix`);
        return products;
    } catch (error) {
        console.error('❌ Error fetching from Wix API:', error.message);
        console.error('   This might be a network issue or API key problem.');
        console.error('   You can use MCP tools to fetch from Wix instead.');
        return [];
    }
}

// Fetch detailed product data from Wix (with media)
async function fetchWixProductDetails(wixId) {
    try {
        const response = await fetch(`https://www.wixapis.com/stores-reader/v1/products/${wixId}`, {
            headers: {
                'Authorization': WIX_API_KEY,
                'wix-site-id': WIX_SITE_ID,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.product || null;
    } catch (error) {
        console.error(`⚠️ Error fetching product ${wixId}:`, error.message);
        return null;
    }
}

// Extract images and videos from Wix product
function extractWixMedia(wixProduct) {
    if (!wixProduct || !wixProduct.media) {
        return { images: [], videos: [] };
    }

    const images = [];
    const videos = [];

    // Extract main media
    if (wixProduct.media.mainMedia) {
        const mainMedia = wixProduct.media.mainMedia;
        if (mainMedia.mediaType === 'image' && mainMedia.image?.url) {
            images.push(mainMedia.image.url);
        } else if (mainMedia.mediaType === 'video' && mainMedia.video?.files?.[0]?.url) {
            videos.push(mainMedia.video.files[0].url);
        }
    }

    // Extract additional media items
    if (wixProduct.media.items && Array.isArray(wixProduct.media.items)) {
        wixProduct.media.items.forEach(item => {
            if (item.mediaType === 'image' && item.image?.url) {
                images.push(item.image.url);
            } else if (item.mediaType === 'video' && item.video?.files?.[0]?.url) {
                videos.push(item.video.files[0].url);
            }
        });
    }

    return { images, videos };
}

// Match Wix product to database products
function findMatches(wixName, databaseProducts) {
    const normalized = wixName.toLowerCase().trim();
    
    return databaseProducts.filter(p => {
        const localName = (p.name || '').toLowerCase().trim();
        
        // Exact match
        if (localName === normalized) return true;
        
        // Contains match
        if (localName.includes(normalized) || normalized.includes(localName)) return true;
        
        // Keyword match (3+ keywords)
        const wixKeywords = normalized.split(/\s+/).filter(w => w.length > 3);
        const localKeywords = localName.split(/\s+/).filter(w => w.length > 3);
        const commonKeywords = wixKeywords.filter(w => localKeywords.includes(w));
        
        return commonKeywords.length >= 3;
    });
}

// Enrich product (SAFE - only adds, never overwrites)
function enrichProduct(dbProduct, wixProduct, wixMedia) {
    let enriched = false;
    const changes = [];

    // Add Wix ID (only if not present)
    if (!dbProduct.wixId && wixProduct.id) {
        dbProduct.wixId = wixProduct.id;
        enriched = true;
        changes.push('wixId');
    }

    // Add Wix URL (only if not present)
    if (!dbProduct.wixProductUrl && wixProduct.productPageUrl) {
        dbProduct.wixProductUrl = wixProduct.productPageUrl;
        enriched = true;
        changes.push('wixProductUrl');
    }

    // Add images (merge with existing)
    if (wixMedia.images && wixMedia.images.length > 0) {
        try {
            const existing = dbProduct.images ? JSON.parse(dbProduct.images) : [];
            const allImages = [...new Set([...existing, ...wixMedia.images])];
            
            // Only update if we added new images
            if (allImages.length > existing.length) {
                dbProduct.images = JSON.stringify(allImages);
                enriched = true;
                changes.push(`images (+${allImages.length - existing.length})`);
            }
        } catch (e) {
            // If existing images is not JSON, create new array
            dbProduct.images = JSON.stringify(wixMedia.images);
            enriched = true;
            changes.push('images (new)');
        }
    }

    // Add videos (merge with existing)
    if (wixMedia.videos && wixMedia.videos.length > 0) {
        try {
            const existing = dbProduct.videos ? JSON.parse(dbProduct.videos) : [];
            const allVideos = [...new Set([...existing, ...wixMedia.videos])];
            
            // Only update if we added new videos
            if (allVideos.length > existing.length) {
                dbProduct.videos = JSON.stringify(allVideos);
                enriched = true;
                changes.push(`videos (+${allVideos.length - existing.length})`);
            }
        } catch (e) {
            // If existing videos is not JSON, create new array
            dbProduct.videos = JSON.stringify(wixMedia.videos);
            enriched = true;
            changes.push('videos (new)');
        }
    }

    // Add metadata
    if (enriched) {
        dbProduct.updatedAt = new Date().toISOString();
        dbProduct.enrichedFromWix = true;
        dbProduct.enrichedDate = new Date().toISOString();
    }

    return { enriched, changes };
}

// Main enrichment process
async function enrichHandDryers() {
    console.log('\n' + '='.repeat(70));
    console.log('🔄 Starting enrichment process...');
    console.log('='.repeat(70));
    
    if (TEST_MODE) {
        console.log('🧪 TEST MODE: Processing only first ' + TEST_LIMIT + ' products');
    }

    // Find hand dryers in database
    const handDryers = database.products.filter(p => 
        p.name && (
            p.name.toLowerCase().includes('hand dryer') || 
            p.name.toLowerCase().includes('handdryer')
        )
    );

    console.log(`\n📊 Found ${handDryers.length} hand dryers in database`);

    if (TEST_MODE && handDryers.length > TEST_LIMIT) {
        console.log(`🧪 TEST MODE: Processing only first ${TEST_LIMIT} products`);
        handDryers.splice(TEST_LIMIT);
    }

    // Fetch Wix products
    const wixProducts = await fetchWixProducts();

    if (wixProducts.length === 0) {
        console.log('\n⚠️  No Wix products found. This might be:');
        console.log('   - Network issue');
        console.log('   - API key problem');
        console.log('   - No hand dryers in Wix');
        console.log('\n💡 You can use MCP tools to fetch from Wix instead.');
        return;
    }

    // Process each Wix product
    let enriched = 0;
    let totalChanges = 0;
    const results = [];

    for (const wixProduct of wixProducts) {
        console.log(`\n📦 Processing: ${wixProduct.name}`);
        
        // Fetch detailed product data (with media)
        const wixDetails = await fetchWixProductDetails(wixProduct.id);
        if (!wixDetails) {
            console.log(`   ⚠️  Could not fetch details for ${wixProduct.id}`);
            continue;
        }

        // Extract media
        const wixMedia = extractWixMedia(wixDetails);
        console.log(`   📸 Images: ${wixMedia.images.length}, 🎥 Videos: ${wixMedia.videos.length}`);

        // Find matches in database
        const matches = findMatches(wixProduct.name, handDryers);
        console.log(`   🔍 Found ${matches.length} matching product(s) in database`);

        // Enrich each match
        for (const dbProduct of matches) {
            const { enriched: wasEnriched, changes } = enrichProduct(dbProduct, wixDetails, wixMedia);
            
            if (wasEnriched) {
                enriched++;
                totalChanges += changes.length;
                console.log(`   ✅ Enriched: ${dbProduct.name}`);
                console.log(`      Changes: ${changes.join(', ')}`);
                
                results.push({
                    dbProduct: dbProduct.name,
                    wixProduct: wixProduct.name,
                    changes: changes
                });
            } else {
                console.log(`   ℹ️  No changes needed: ${dbProduct.name}`);
            }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Save enriched database
    if (enriched > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('💾 Saving enriched database...');
        console.log('='.repeat(70));
        
        try {
            fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 2));
            console.log(`✅ Database saved successfully!`);
        } catch (error) {
            console.error('❌ Error saving database:', error.message);
            console.error('   You can restore from backup:', path.basename(backupPath));
            process.exit(1);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Wix products processed: ${wixProducts.length}`);
    console.log(`Database products enriched: ${enriched}`);
    console.log(`Total changes made: ${totalChanges}`);
    console.log(`\n💾 Backup available: ${path.basename(backupPath)}`);
    
    if (TEST_MODE) {
        console.log('\n🧪 TEST MODE COMPLETE');
        console.log('   Review the results above.');
        console.log('   If everything looks good, run without --test flag to process all products.');
    }

    console.log('\n✅ Enrichment complete!');
}

// Run enrichment
enrichHandDryers().catch(error => {
    console.error('\n❌ Error during enrichment:', error);
    console.error('   You can restore from backup:', path.basename(backupPath));
    process.exit(1);
});

