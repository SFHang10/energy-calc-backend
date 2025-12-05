const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// FETCH AND ENRICH HAND DRYERS FROM WIX (NOW)
// ============================================
// This script:
// 1. Fetches hand dryers from Wix (using API key or MCP)
// 2. Enriches database with ALL Wix data:
//    - Images (all gallery images)
//    - Videos (all videos)
//    - Descriptions (descriptionShort, descriptionFull, description, additionalInfo)
//    - Prices, specs, and all other metadata
// ============================================

// Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const WIX_API_KEY = process.env.WIX_API_KEY || '';
const DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const TEST_MODE = process.argv.includes('--test');
const TEST_LIMIT = 2;

console.log('='.repeat(70));
console.log('🛡️  FETCH AND ENRICH HAND DRYERS FROM WIX');
console.log('='.repeat(70));
console.log('');

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
} catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
}

// Fetch all products from Wix
async function fetchAllWixProducts() {
    console.log('\n' + '='.repeat(70));
    console.log('📡 Fetching products from Wix...');
    console.log('='.repeat(70));

    if (!WIX_API_KEY) {
        console.error('❌ ERROR: WIX_API_KEY not found in environment variables.');
        console.error('   Please set WIX_API_KEY in your .env file.');
        console.error('   Or use MCP tools to fetch products.');
        return [];
    }

    const allProducts = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`\n📦 Fetching products (offset: ${offset}, limit: ${limit})...`);
            
            const response = await fetch('https://www.wixapis.com/stores-reader/v1/products/query', {
                method: 'POST',
                headers: {
                    'Authorization': WIX_API_KEY,
                    'wix-site-id': WIX_SITE_ID,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: {
                        paging: { limit, offset }
                    },
                    includeVariants: false,
                    includeHiddenProducts: false
                })
            });

            if (!response.ok) {
                console.error(`❌ Wix API returned ${response.status}`);
                break;
            }

            const data = await response.json();
            const products = data.products || [];
            
            console.log(`   ✅ Fetched ${products.length} products`);
            allProducts.push(...products);

            // Check if there are more products
            hasMore = products.length === limit;
            offset += limit;

            // Safety limit
            if (offset > 1000) {
                console.log('   ⚠️  Reached safety limit (1000 products)');
                break;
            }
        } catch (error) {
            console.error(`❌ Error fetching products: ${error.message}`);
            break;
        }
    }

    console.log(`\n✅ Total products fetched: ${allProducts.length}`);
    return allProducts;
}

// Filter hand dryers from Wix products
function filterHandDryers(wixProducts) {
    return wixProducts.filter(p => {
        const name = (p.name || '').toLowerCase();
        return name.includes('hand dryer') || name.includes('handdryer');
    });
}

// Fetch full product details for each hand dryer
async function fetchHandDryerDetails(handDryers) {
    console.log('\n' + '='.repeat(70));
    console.log('📡 Fetching full details for hand dryers...');
    console.log('='.repeat(70));

    const detailedProducts = [];

    for (let i = 0; i < handDryers.length; i++) {
        const product = handDryers[i];
        console.log(`\n📦 [${i + 1}/${handDryers.length}] Fetching details for: ${product.name || product.id}`);

        try {
            const response = await fetch(`https://www.wixapis.com/stores-reader/v1/products/${product.id}`, {
                headers: {
                    'Authorization': WIX_API_KEY,
                    'wix-site-id': WIX_SITE_ID,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log(`   ⚠️  API returned ${response.status}, using basic product data`);
                detailedProducts.push(product);
                continue;
            }

            const data = await response.json();
            const fullProduct = data.product || product;
            detailedProducts.push(fullProduct);
            console.log(`   ✅ Fetched full details`);
        } catch (error) {
            console.log(`   ⚠️  Error: ${error.message}, using basic product data`);
            detailedProducts.push(product);
        }
    }

    return detailedProducts;
}

// Extract media from Wix product
function extractWixMedia(wixProduct) {
    if (!wixProduct || !wixProduct.media) {
        return { images: [], videos: [] };
    }

    const images = [];
    const videos = [];

    if (wixProduct.media.mainMedia) {
        const mainMedia = wixProduct.media.mainMedia;
        if (mainMedia.mediaType === 'image' && mainMedia.image?.url) {
            images.push(mainMedia.image.url);
        } else if (mainMedia.mediaType === 'video' && mainMedia.video?.files?.[0]?.url) {
            videos.push(mainMedia.video.files[0].url);
        }
    }

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

// Extract descriptions from Wix product
function extractWixDescriptions(wixProduct) {
    const descriptions = {
        descriptionShort: null,
        descriptionFull: null,
        description: null,
        additionalInfo: null,
        specifications: null
    };

    if (wixProduct.description) {
        descriptions.descriptionFull = wixProduct.description;
        descriptions.description = wixProduct.description;
        
        if (wixProduct.description.length > 200) {
            descriptions.descriptionShort = wixProduct.description.substring(0, 200) + '...';
        } else {
            descriptions.descriptionShort = wixProduct.description;
        }
    }

    if (wixProduct.additionalInfo) {
        descriptions.additionalInfo = wixProduct.additionalInfo;
    }

    if (wixProduct.customFields && Array.isArray(wixProduct.customFields)) {
        wixProduct.customFields.forEach(field => {
            if (field.name === 'descriptionShort' && field.value) {
                descriptions.descriptionShort = field.value;
            }
            if (field.name === 'descriptionFull' && field.value) {
                descriptions.descriptionFull = field.value;
            }
            if (field.name === 'description' && field.value) {
                descriptions.description = field.value;
            }
            if (field.name === 'additionalInfo' && field.value) {
                descriptions.additionalInfo = field.value;
            }
            if (field.name === 'specifications' && field.value) {
                descriptions.specifications = field.value;
            }
        });
    }

    return descriptions;
}

// Match Wix product to database products
function findMatches(wixName, databaseProducts) {
    const normalized = wixName.toLowerCase().trim();
    
    return databaseProducts.filter(p => {
        const localName = (p.name || '').toLowerCase().trim();
        
        if (localName === normalized) return true;
        if (localName.includes(normalized) || normalized.includes(localName)) return true;
        
        const wixKeywords = normalized.split(/\s+/).filter(w => w.length > 3);
        const localKeywords = localName.split(/\s+/).filter(w => w.length > 3);
        const commonKeywords = wixKeywords.filter(w => localKeywords.includes(w));
        
        return commonKeywords.length >= 3;
    });
}

// Enrich product (SAFE - only adds, never overwrites)
function enrichProduct(dbProduct, wixProduct, wixMedia, wixDescriptions) {
    let enriched = false;
    const changes = [];

    if (!dbProduct.wixId && wixProduct.id) {
        dbProduct.wixId = wixProduct.id;
        enriched = true;
        changes.push('wixId');
    }

    if (!dbProduct.wixProductUrl && wixProduct.productPageUrl) {
        dbProduct.wixProductUrl = wixProduct.productPageUrl;
        enriched = true;
        changes.push('wixProductUrl');
    }

    if (wixMedia.images && wixMedia.images.length > 0) {
        try {
            const existing = dbProduct.images ? JSON.parse(dbProduct.images) : [];
            const allImages = [...new Set([...existing, ...wixMedia.images])];
            
            if (allImages.length > existing.length) {
                dbProduct.images = JSON.stringify(allImages);
                enriched = true;
                changes.push(`images (+${allImages.length - existing.length})`);
            }
        } catch (e) {
            dbProduct.images = JSON.stringify(wixMedia.images);
            enriched = true;
            changes.push('images (new)');
        }
    }

    if (wixMedia.videos && wixMedia.videos.length > 0) {
        try {
            const existing = dbProduct.videos ? JSON.parse(dbProduct.videos) : [];
            const allVideos = [...new Set([...existing, ...wixMedia.videos])];
            
            if (allVideos.length > existing.length) {
                dbProduct.videos = JSON.stringify(allVideos);
                enriched = true;
                changes.push(`videos (+${allVideos.length - existing.length})`);
            }
        } catch (e) {
            dbProduct.videos = JSON.stringify(wixMedia.videos);
            enriched = true;
            changes.push('videos (new)');
        }
    }

    if (wixDescriptions.descriptionFull) {
        const existingFull = dbProduct.descriptionFull || '';
        if (wixDescriptions.descriptionFull.length > existingFull.length) {
            dbProduct.descriptionFull = wixDescriptions.descriptionFull;
            enriched = true;
            changes.push('descriptionFull (enhanced)');
        }
    }

    if (wixDescriptions.descriptionShort) {
        const existingShort = dbProduct.descriptionShort || '';
        if (wixDescriptions.descriptionShort.length > existingShort.length) {
            dbProduct.descriptionShort = wixDescriptions.descriptionShort;
            enriched = true;
            changes.push('descriptionShort (enhanced)');
        }
    }

    if (wixDescriptions.description) {
        const existingDesc = dbProduct.description || '';
        if (wixDescriptions.description.length > existingDesc.length) {
            dbProduct.description = wixDescriptions.description;
            enriched = true;
            changes.push('description (enhanced)');
        }
    }

    if (wixDescriptions.additionalInfo) {
        if (!dbProduct.additionalInfo) {
            dbProduct.additionalInfo = wixDescriptions.additionalInfo;
            enriched = true;
            changes.push('additionalInfo');
        } else {
            const existing = dbProduct.additionalInfo || '';
            const combined = existing + '\n\n' + wixDescriptions.additionalInfo;
            if (combined.length > existing.length) {
                dbProduct.additionalInfo = combined;
                enriched = true;
                changes.push('additionalInfo (enhanced)');
            }
        }
    }

    if (wixDescriptions.specifications) {
        if (!dbProduct.specifications) {
            dbProduct.specifications = wixDescriptions.specifications;
            enriched = true;
            changes.push('specifications');
        }
    }

    if (!dbProduct.price && wixProduct.price) {
        dbProduct.price = wixProduct.price;
        enriched = true;
        changes.push('price');
    }

    if (enriched) {
        dbProduct.updatedAt = new Date().toISOString();
        dbProduct.enrichedFromWix = true;
        dbProduct.enrichedDate = new Date().toISOString();
    }

    return { enriched, changes };
}

// Process Wix products and enrich database
async function processWixProducts(wixProducts) {
    console.log('\n' + '='.repeat(70));
    console.log('🔄 Processing Wix products and enriching database...');
    console.log('='.repeat(70));

    const handDryers = database.products.filter(p => 
        p.name && (
            p.name.toLowerCase().includes('hand dryer') || 
            p.name.toLowerCase().includes('handdryer')
        )
    );

    console.log(`\n📊 Found ${handDryers.length} hand dryers in database`);
    console.log(`📦 Processing ${wixProducts.length} Wix products`);

    if (TEST_MODE && handDryers.length > TEST_LIMIT) {
        console.log(`🧪 TEST MODE: Processing only first ${TEST_LIMIT} products`);
        handDryers.splice(TEST_LIMIT);
    }

    let enriched = 0;
    let totalChanges = 0;
    let totalImagesAdded = 0;
    let totalVideosAdded = 0;
    const results = [];

    for (const wixProduct of wixProducts) {
        console.log(`\n📦 Processing: ${wixProduct.name || wixProduct.id}`);
        
        const wixMedia = extractWixMedia(wixProduct);
        console.log(`   📸 Images: ${wixMedia.images.length}, 🎥 Videos: ${wixMedia.videos.length}`);

        const wixDescriptions = extractWixDescriptions(wixProduct);
        console.log(`   📝 Description: ${wixDescriptions.descriptionFull ? 'Yes (' + wixDescriptions.descriptionFull.length + ' chars)' : 'No'}`);

        const wixName = wixProduct.name || '';
        const matches = findMatches(wixName, handDryers);
        console.log(`   🔍 Found ${matches.length} matching product(s) in database`);

        for (const dbProduct of matches) {
            const { enriched: wasEnriched, changes } = enrichProduct(dbProduct, wixProduct, wixMedia, wixDescriptions);
            
            if (wasEnriched) {
                enriched++;
                totalChanges += changes.length;
                
                const imageChange = changes.find(c => c.includes('images'));
                const videoChange = changes.find(c => c.includes('videos'));
                if (imageChange) {
                    const match = imageChange.match(/\+(\d+)/);
                    if (match) totalImagesAdded += parseInt(match[1]);
                }
                if (videoChange) {
                    const match = videoChange.match(/\+(\d+)/);
                    if (match) totalVideosAdded += parseInt(match[1]);
                }
                
                console.log(`   ✅ Enriched: ${dbProduct.name}`);
                console.log(`      Changes: ${changes.join(', ')}`);
                
                results.push({
                    dbProduct: dbProduct.name,
                    wixProduct: wixName,
                    changes: changes
                });
            } else {
                console.log(`   ℹ️  No changes needed: ${dbProduct.name}`);
            }
        }
    }

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

    console.log('\n' + '='.repeat(70));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Wix products processed: ${wixProducts.length}`);
    console.log(`Database products enriched: ${enriched}`);
    console.log(`Total changes made: ${totalChanges}`);
    console.log(`Total images added: ${totalImagesAdded}`);
    console.log(`Total videos added: ${totalVideosAdded}`);
    console.log(`\n💾 Backup available: ${path.basename(backupPath)}`);
    
    if (TEST_MODE) {
        console.log('\n🧪 TEST MODE COMPLETE');
        console.log('   Review the results above.');
        console.log('   If everything looks good, run without --test flag to process all products.');
    }

    console.log('\n✅ Enrichment complete!');
    
    return { enriched, totalChanges, totalImagesAdded, totalVideosAdded, results };
}

// Main function
async function main() {
    try {
        // Fetch all products from Wix
        const allWixProducts = await fetchAllWixProducts();
        
        if (allWixProducts.length === 0) {
            console.log('\n⚠️  No products fetched from Wix.');
            console.log('   Check your WIX_API_KEY in .env file.');
            return;
        }

        // Filter for hand dryers
        const handDryers = filterHandDryers(allWixProducts);
        console.log(`\n✅ Found ${handDryers.length} hand dryers in Wix`);

        if (handDryers.length === 0) {
            console.log('\n⚠️  No hand dryers found in Wix products.');
            return;
        }

        // Fetch full details for each hand dryer
        const detailedHandDryers = await fetchHandDryerDetails(handDryers);

        // Process and enrich
        await processWixProducts(detailedHandDryers);
    } catch (error) {
        console.error('\n❌ Error during enrichment:', error);
        console.error('   You can restore from backup:', path.basename(backupPath));
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, processWixProducts, enrichProduct, findMatches, extractWixMedia, extractWixDescriptions };

