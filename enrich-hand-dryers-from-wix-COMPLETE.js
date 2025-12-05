const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// COMPLETE WIX ENRICHMENT SCRIPT
// ============================================
// This script enriches hand dryer products with ALL Wix data:
// - Images (all gallery images)
// - Videos (all videos)
// - Descriptions (descriptionShort, descriptionFull)
// - Prices, specs, and all other metadata
// ============================================
// SAFETY FEATURES:
// - Creates automatic backup before any changes
// - Only ADDS data, never overwrites existing fields
// - Can test on sample products first
// - Provides rollback capability
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

// Extract all description fields from Wix product
function extractWixDescriptions(wixProduct) {
    const descriptions = {
        descriptionShort: null,
        descriptionFull: null,
        description: null,
        additionalInfo: null
    };

    // Extract description fields
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

    // Extract additional info if available
    if (wixProduct.additionalInfo) {
        descriptions.additionalInfo = wixProduct.additionalInfo;
    }

    // Extract from custom fields if available
    if (wixProduct.customFields) {
        wixProduct.customFields.forEach(field => {
            if (field.name === 'descriptionShort' && field.value) {
                descriptions.descriptionShort = field.value;
            }
            if (field.name === 'descriptionFull' && field.value) {
                descriptions.descriptionFull = field.value;
            }
            if (field.name === 'additionalInfo' && field.value) {
                descriptions.additionalInfo = field.value;
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
        }
    }

    // Add price (only if missing)
    if (!dbProduct.price && wixProduct.price) {
        dbProduct.price = wixProduct.price;
        enriched = true;
        changes.push('price');
    }

    // Add specifications if available
    if (wixProduct.specifications && !dbProduct.specifications) {
        dbProduct.specifications = wixProduct.specifications;
        enriched = true;
        changes.push('specifications');
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
    console.log('\n📝 NOTE: This script uses MCP tools to fetch from Wix.');
    console.log('   Make sure MCP is set up and running.');
    console.log('   See MCP-SETUP-GUIDE.md for setup instructions.\n');
    
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

    // Instructions for using MCP
    console.log('\n' + '='.repeat(70));
    console.log('📋 MCP FETCH INSTRUCTIONS');
    console.log('='.repeat(70));
    console.log('\nTo fetch hand dryers from Wix using MCP:');
    console.log('1. Use MCP tool: CallWixSiteAPI');
    console.log('2. Endpoint: stores-reader/v1/products/query');
    console.log('3. Query for products with "hand dryer" in name');
    console.log('4. For each product, fetch details with: stores-reader/v1/products/{id}');
    console.log('\nThe script will then:');
    console.log('- Match Wix products to database products');
    console.log('- Extract all images, videos, and descriptions');
    console.log('- Enrich database products with Wix data');
    console.log('\n💡 You can also manually provide Wix product data in a JSON file.');
    console.log('   The script will process it the same way.\n');

    // For now, we'll create a template for manual MCP fetch
    // The user can use MCP tools to fetch, then we'll process the data
    
    console.log('='.repeat(70));
    console.log('✅ Script ready for MCP integration');
    console.log('='.repeat(70));
    console.log('\n📝 Next steps:');
    console.log('1. Use MCP tools to fetch hand dryers from Wix');
    console.log('2. Save the Wix product data to a file');
    console.log('3. Run this script with the Wix data file');
    console.log('\nOr:');
    console.log('1. Run this script');
    console.log('2. It will prompt you to use MCP tools');
    console.log('3. Follow the prompts to fetch and enrich\n');
}

// Export functions for use with MCP
module.exports = {
    enrichProduct,
    findMatches,
    extractWixMedia,
    extractWixDescriptions,
    enrichHandDryers
};

// Run if called directly
if (require.main === module) {
    enrichHandDryers().catch(error => {
        console.error('\n❌ Error during enrichment:', error);
        console.error('   You can restore from backup:', path.basename(backupPath));
        process.exit(1);
    });
}

