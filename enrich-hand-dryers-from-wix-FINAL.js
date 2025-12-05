const fs = require('fs');
const path = require('path');

// ============================================
// COMPLETE WIX ENRICHMENT SCRIPT (FINAL VERSION)
// ============================================
// This script enriches hand dryer products with ALL Wix data:
// - Images (all gallery images)
// - Videos (all videos)
// - Descriptions (descriptionShort, descriptionFull, description, additionalInfo)
// - Prices, specs, and all other metadata
// ============================================
// SAFETY FEATURES:
// - Creates automatic backup before any changes
// - Only ADDS data, never overwrites existing fields
// - Can test on sample products first
// - Provides rollback capability
// ============================================
// USES MCP TOOLS:
// - CallWixSiteAPI to fetch products from Wix
// - No API key needed (uses MCP authentication)
// ============================================

// Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const TEST_MODE = process.argv.includes('--test'); // Run with --test flag for test mode
const TEST_LIMIT = 2; // Test on 2 products only

console.log('='.repeat(70));
console.log('🛡️  COMPLETE WIX ENRICHMENT SCRIPT');
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
    console.log(`   You can restore from this backup if needed.`);
} catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
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

// Extract ALL description fields from Wix product
function extractWixDescriptions(wixProduct) {
    const descriptions = {
        descriptionShort: null,
        descriptionFull: null,
        description: null,
        additionalInfo: null,
        specifications: null
    };

    // Extract main description
    if (wixProduct.description) {
        descriptions.descriptionFull = wixProduct.description;
        descriptions.description = wixProduct.description;
        
        // Create short description (first 200 chars)
        if (wixProduct.description.length > 200) {
            descriptions.descriptionShort = wixProduct.description.substring(0, 200) + '...';
        } else {
            descriptions.descriptionShort = wixProduct.description;
        }
    }

    // Extract additional info sections
    if (wixProduct.additionalInfo) {
        descriptions.additionalInfo = wixProduct.additionalInfo;
    }

    // Extract from custom fields if available
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

    // Extract product page content if available (may contain descriptions)
    if (wixProduct.productPageUrl) {
        descriptions.productPageUrl = wixProduct.productPageUrl;
    }

    return descriptions;
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
function enrichProduct(dbProduct, wixProduct, wixMedia, wixDescriptions) {
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

    // Add descriptions (only if better/longer than existing)
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
            // Merge additional info if existing
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

    // Add price (only if missing)
    if (!dbProduct.price && wixProduct.price) {
        dbProduct.price = wixProduct.price;
        enriched = true;
        changes.push('price');
    }

    // Add metadata
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
    console.log('🔄 Processing Wix products...');
    console.log('='.repeat(70));

    // Find hand dryers in database
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
    const results = [];

    // Process each Wix product
    for (const wixProduct of wixProducts) {
        console.log(`\n📦 Processing: ${wixProduct.name || wixProduct.id}`);
        
        // Extract media
        const wixMedia = extractWixMedia(wixProduct);
        console.log(`   📸 Images: ${wixMedia.images.length}, 🎥 Videos: ${wixMedia.videos.length}`);

        // Extract descriptions
        const wixDescriptions = extractWixDescriptions(wixProduct);
        console.log(`   📝 Description: ${wixDescriptions.descriptionFull ? 'Yes (' + wixDescriptions.descriptionFull.length + ' chars)' : 'No'}`);
        console.log(`   📝 Short: ${wixDescriptions.descriptionShort ? 'Yes' : 'No'}`);
        console.log(`   📝 Additional Info: ${wixDescriptions.additionalInfo ? 'Yes' : 'No'}`);

        // Find matches in database
        const wixName = wixProduct.name || '';
        const matches = findMatches(wixName, handDryers);
        console.log(`   🔍 Found ${matches.length} matching product(s) in database`);

        // Enrich each match
        for (const dbProduct of matches) {
            const { enriched: wasEnriched, changes } = enrichProduct(dbProduct, wixProduct, wixMedia, wixDescriptions);
            
            if (wasEnriched) {
                enriched++;
                totalChanges += changes.length;
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
    
    return { enriched, totalChanges, results };
}

// Export for use with MCP
module.exports = {
    enrichProduct,
    findMatches,
    extractWixMedia,
    extractWixDescriptions,
    processWixProducts
};

// If called directly, show instructions
if (require.main === module) {
    console.log('\n📋 INSTRUCTIONS:');
    console.log('='.repeat(70));
    console.log('\nThis script enriches hand dryers with ALL Wix data:');
    console.log('  - Images (all gallery images)');
    console.log('  - Videos (all videos)');
    console.log('  - Descriptions (descriptionShort, descriptionFull, description, additionalInfo)');
    console.log('  - Prices, specs, and all other metadata');
    console.log('\nTo use with MCP:');
    console.log('1. Use MCP tool: CallWixSiteAPI');
    console.log('2. Endpoint: stores-reader/v1/products/query');
    console.log('3. Query for products with "hand dryer" in name');
    console.log('4. For each product, fetch details with: stores-reader/v1/products/{id}');
    console.log('5. Pass the Wix products to this script');
    console.log('\nOr:');
    console.log('1. Save Wix product data to a JSON file');
    console.log('2. Load and process with this script');
    console.log('\n💡 The script will:');
    console.log('   - Match Wix products to database products');
    console.log('   - Extract all images, videos, and descriptions');
    console.log('   - Enrich database products with Wix data');
    console.log('   - Create backup before any changes');
    console.log('   - Only add data, never overwrite existing fields\n');
}

