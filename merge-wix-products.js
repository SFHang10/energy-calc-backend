const fs = require('fs');
const path = require('path');

// Read the local database
console.log('📖 Reading local database...');
const localDbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

console.log(`✅ Loaded ${localData.products.length} products from local database`);

// Read Wix products from the previous API call results
// We have 151 products fetched in batches
const wixProducts = [
  // First 100 products (from first fetch)
  // These would be from your first API call
  // ... 
];

console.log('🔄 Starting merge process...');

let matchedCount = 0;
let enrichedCount = 0;

// For each Wix product, try to match with local products
for (const wixProduct of wixProducts) {
  // Try to find matching product by name (case-insensitive, flexible matching)
  const normalizedWixName = wixProduct.name.toLowerCase().trim();
  
  const match = localData.products.find(localProduct => {
    const normalizedLocalName = localProduct.name.toLowerCase().trim();
    
    // Exact match
    if (normalizedLocalName === normalizedWixName) {
      return true;
    }
    
    // Partial match (if one name contains the other)
    if (normalizedLocalName.includes(normalizedWixName) || 
        normalizedWixName.includes(normalizedLocalName)) {
      return true;
    }
    
    // Model/SKU match
    if (wixProduct.sku && localProduct.sku && 
        wixProduct.sku.toLowerCase() === localProduct.sku.toLowerCase()) {
      return true;
    }
    
    return false;
  });
  
  if (match) {
    matchedCount++;
    
    // Enrich the local product with Wix data (without overwriting)
    const enriched = enrichProduct(match, wixProduct);
    if (enriched) enrichedCount++;
  }
}

console.log(`\n✅ Merge complete:`);
console.log(`   - Total Wix products: ${wixProducts.length}`);
console.log(`   - Matched products: ${matchedCount}`);
console.log(`   - Enriched products: ${enrichedCount}`);

// Save the enriched database
const outputPath = path.join(__dirname, 'FULL-DATABASE-5554-ENRICHED.json');
fs.writeFileSync(outputPath, JSON.stringify(localData, null, 2), 'utf8');
console.log(`\n💾 Saved enriched database to: ${outputPath}`);

function enrichProduct(local, wix) {
  let wasEnriched = false;
  
  // Add image if local doesn't have one
  if (!local.imageUrl && wix.media && wix.media.mainMedia && wix.media.mainMedia.image) {
    local.imageUrl = wix.media.mainMedia.image.url;
    wasEnriched = true;
  }
  
  // Add additional images
  if (wix.media && wix.media.items && Array.isArray(wix.media.items)) {
    const additionalImages = wix.media.items
      .filter(item => item.mediaType === 'image')
      .map(item => item.image.url);
    
    if (additionalImages.length > 0) {
      try {
        const existingImages = local.images ? JSON.parse(local.images) : [];
        const allImages = [...new Set([...existingImages, ...additionalImages])];
        local.images = JSON.stringify(allImages);
        wasEnriched = true;
      } catch (e) {
        console.warn(`⚠️  Could not parse images for ${local.name}:`, e.message);
      }
    }
  }
  
  // Add detailed description if local has a short one
  if ((!local.descriptionFull || local.descriptionFull.length < 100) && wix.description) {
    // Clean HTML from Wix description
    const cleanDescription = wix.description
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
    
    if (cleanDescription.length > (local.descriptionFull || '').length) {
      local.descriptionFull = cleanDescription;
      wasEnriched = true;
    }
  }
  
  // Add additional info sections
  if (wix.additionalInfoSections && wix.additionalInfoSections.length > 0) {
    try {
      const existingInfo = local.additionalInfo ? JSON.parse(local.additionalInfo) : [];
      const wixInfo = wix.additionalInfoSections.map(section => ({
        title: section.title,
        description: section.description
      }));
      const allInfo = [...existingInfo, ...wixInfo];
      local.additionalInfo = JSON.stringify(allInfo);
      wasEnriched = true;
    } catch (e) {
      console.warn(`⚠️  Could not parse additional info for ${local.name}:`, e.message);
    }
  }
  
  // Add Wix product URL
  if (!local.wixProductUrl && wix.productPageUrl) {
    local.wixProductUrl = wix.productPageUrl.path;
    wasEnriched = true;
  }
  
  // Add Wix product ID for future reference
  if (!local.wixId) {
    local.wixId = wix.id;
    wasEnriched = true;
  }
  
  // Add ribbons/badges
  if (wix.ribbons && wix.ribbons.length > 0) {
    local.ribbons = wix.ribbons.map(r => r.text).join(', ');
    wasEnriched = true;
  }
  
  // Update metadata
  local.updatedAt = new Date().toISOString();
  local.enrichedFromWix = true;
  local.enrichedDate = new Date().toISOString();
  
  return wasEnriched;
}


const path = require('path');

// Read the local database
console.log('📖 Reading local database...');
const localDbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

console.log(`✅ Loaded ${localData.products.length} products from local database`);

// Read Wix products from the previous API call results
// We have 151 products fetched in batches
const wixProducts = [
  // First 100 products (from first fetch)
  // These would be from your first API call
  // ... 
];

console.log('🔄 Starting merge process...');

let matchedCount = 0;
let enrichedCount = 0;

// For each Wix product, try to match with local products
for (const wixProduct of wixProducts) {
  // Try to find matching product by name (case-insensitive, flexible matching)
  const normalizedWixName = wixProduct.name.toLowerCase().trim();
  
  const match = localData.products.find(localProduct => {
    const normalizedLocalName = localProduct.name.toLowerCase().trim();
    
    // Exact match
    if (normalizedLocalName === normalizedWixName) {
      return true;
    }
    
    // Partial match (if one name contains the other)
    if (normalizedLocalName.includes(normalizedWixName) || 
        normalizedWixName.includes(normalizedLocalName)) {
      return true;
    }
    
    // Model/SKU match
    if (wixProduct.sku && localProduct.sku && 
        wixProduct.sku.toLowerCase() === localProduct.sku.toLowerCase()) {
      return true;
    }
    
    return false;
  });
  
  if (match) {
    matchedCount++;
    
    // Enrich the local product with Wix data (without overwriting)
    const enriched = enrichProduct(match, wixProduct);
    if (enriched) enrichedCount++;
  }
}

console.log(`\n✅ Merge complete:`);
console.log(`   - Total Wix products: ${wixProducts.length}`);
console.log(`   - Matched products: ${matchedCount}`);
console.log(`   - Enriched products: ${enrichedCount}`);

// Save the enriched database
const outputPath = path.join(__dirname, 'FULL-DATABASE-5554-ENRICHED.json');
fs.writeFileSync(outputPath, JSON.stringify(localData, null, 2), 'utf8');
console.log(`\n💾 Saved enriched database to: ${outputPath}`);

function enrichProduct(local, wix) {
  let wasEnriched = false;
  
  // Add image if local doesn't have one
  if (!local.imageUrl && wix.media && wix.media.mainMedia && wix.media.mainMedia.image) {
    local.imageUrl = wix.media.mainMedia.image.url;
    wasEnriched = true;
  }
  
  // Add additional images
  if (wix.media && wix.media.items && Array.isArray(wix.media.items)) {
    const additionalImages = wix.media.items
      .filter(item => item.mediaType === 'image')
      .map(item => item.image.url);
    
    if (additionalImages.length > 0) {
      try {
        const existingImages = local.images ? JSON.parse(local.images) : [];
        const allImages = [...new Set([...existingImages, ...additionalImages])];
        local.images = JSON.stringify(allImages);
        wasEnriched = true;
      } catch (e) {
        console.warn(`⚠️  Could not parse images for ${local.name}:`, e.message);
      }
    }
  }
  
  // Add detailed description if local has a short one
  if ((!local.descriptionFull || local.descriptionFull.length < 100) && wix.description) {
    // Clean HTML from Wix description
    const cleanDescription = wix.description
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
    
    if (cleanDescription.length > (local.descriptionFull || '').length) {
      local.descriptionFull = cleanDescription;
      wasEnriched = true;
    }
  }
  
  // Add additional info sections
  if (wix.additionalInfoSections && wix.additionalInfoSections.length > 0) {
    try {
      const existingInfo = local.additionalInfo ? JSON.parse(local.additionalInfo) : [];
      const wixInfo = wix.additionalInfoSections.map(section => ({
        title: section.title,
        description: section.description
      }));
      const allInfo = [...existingInfo, ...wixInfo];
      local.additionalInfo = JSON.stringify(allInfo);
      wasEnriched = true;
    } catch (e) {
      console.warn(`⚠️  Could not parse additional info for ${local.name}:`, e.message);
    }
  }
  
  // Add Wix product URL
  if (!local.wixProductUrl && wix.productPageUrl) {
    local.wixProductUrl = wix.productPageUrl.path;
    wasEnriched = true;
  }
  
  // Add Wix product ID for future reference
  if (!local.wixId) {
    local.wixId = wix.id;
    wasEnriched = true;
  }
  
  // Add ribbons/badges
  if (wix.ribbons && wix.ribbons.length > 0) {
    local.ribbons = wix.ribbons.map(r => r.text).join(', ');
    wasEnriched = true;
  }
  
  // Update metadata
  local.updatedAt = new Date().toISOString();
  local.enrichedFromWix = true;
  local.enrichedDate = new Date().toISOString();
  
  return wasEnriched;
}




















