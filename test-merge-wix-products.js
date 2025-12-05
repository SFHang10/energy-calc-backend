const fs = require('fs');
const path = require('path');

console.log('📦 Test Merge: Wix Products → Local Database\n');

// Read the local database
console.log('📖 Reading local database...');
const localDbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

console.log(`✅ Loaded ${localData.products.length} products from local database\n`);

// Sample Wix products (first 10 from our fetch)
const testWixProducts = [
  {
    id: "d9083600-de75-e127-f810-d06b04de244e",
    name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT",
    description: "<p>Capacity: 10 GN 1/1 trays.</p><p>Digital interface with LED backlight buttons with guided selection.</p>",
    price: 14419,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_7d8b7b77430a42efbb4630365e2b449c~mv2.jpeg/v1/fit/w_567,h_720,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [{"text": "Government Certified (ETL)"}],
    productPageUrl: {path: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101t2at"}
  },
  {
    id: "f7c3e9f4-8a01-848f-c243-4cf2a4e2477b",
    name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101BA21",
    description: "<p>The <strong>Zanussi Magistar Combi DS 10 1/1GN Electric</strong> is a high-resolution combi steamer with digital control panel.</p>",
    price: 7500,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_7d478d4797ea492f92a6b12d36c207b3~mv2.jpg/v1/fit/w_606,h_651,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [{"text": "Government Certified (ETL)"}],
    productPageUrl: {path: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zc0e101ba21"}
  },
  {
    id: "ee8ca797-5ec6-1801-5c77-d00ef9e5659c",
    name: "Air Fury High Speed Dryer (C)",
    description: "<p>High speed drying with a high end finish</p><p>The stylish TSL.89 high speed hand dryer can be specified in three different finishes...</p>",
    price: 543,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_8c0152248bfa4f5fbac5708def91b834~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [{"text": "New Arrival"}],
    productPageUrl: {path: "/product-page/copy-of-air-fury-high-speed-dryer-c-1"}
  },
  {
    id: "d26183b8-ad6f-8c33-86c5-f654229f603b",
    name: "Turbo Force Branded Polished Fast Dry",
    description: "<p>One of the UK's most popular dryers, it's in the top 3 for the fastest drying units available...</p>",
    price: 380,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_2edbf8451e334177936216834adf4461~mv2.jpg/v1/fit/w_160,h_196,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [],
    productPageUrl: {path: "/product-page/turbo-force-branded-polished-fast-dry"}
  }
];

console.log(`\n🔍 Testing merge with ${testWixProducts.length} Wix products...\n`);

const matches = [];
const noMatches = [];

testWixProducts.forEach(wixProduct => {
  const normalizedWixName = wixProduct.name.toLowerCase().trim();
  
  // Search for matches in local database
  const match = localData.products.find(localProduct => {
    const normalizedLocalName = localProduct.name.toLowerCase().trim();
    
    // Exact match
    if (normalizedLocalName === normalizedWixName) {
      return true;
    }
    
    // Check if one contains the other (partial match)
    if (normalizedLocalName.includes(normalizedWixName) || 
        normalizedWixName.includes(normalizedLocalName)) {
      return true;
    }
    
    // Check keywords (if both contain key terms like "Electrolux", "Zanussi", etc.)
    const wixKeywords = normalizedWixName.split(/\s+/).filter(w => w.length > 3);
    const localKeywords = normalizedLocalName.split(/\s+/).filter(w => w.length > 3);
    const commonKeywords = wixKeywords.filter(w => localKeywords.includes(w));
    
    // If 3+ keywords match, likely the same product
    if (commonKeywords.length >= 3) {
      return true;
    }
    
    return false;
  });
  
  if (match) {
    matches.push({
      wix: wixProduct,
      local: match,
      enrichment: calculateEnrichment(match, wixProduct)
    });
  } else {
    noMatches.push(wixProduct);
  }
});

console.log('\n📊 MATCH RESULTS:\n');
console.log(`✅ Matched: ${matches.length}`);
console.log(`❌ No match found: ${noMatches.length}\n`);

// Display matches
if (matches.length > 0) {
  console.log('\n📋 FOUND MATCHES:\n');
  matches.forEach((match, idx) => {
    console.log(`${idx + 1}. ${match.wix.name}`);
    console.log(`   Local: ${match.local.name}`);
    console.log(`   Enrichment: ${match.enrichment.fieldsAdded} field(s) added, ${match.enrichment.fieldsUpdated} field(s) updated`);
    console.log(`   Fields: ${match.enrichment.addedFields.join(', ')}`);
    console.log('');
  });
}

// Display non-matches
if (noMatches.length > 0) {
  console.log('\n⚠️  NO MATCHES FOUND:\n');
  noMatches.forEach((product, idx) => {
    console.log(`${idx + 1}. ${product.name}`);
  });
  console.log('');
}

// Generate enrichment report
console.log('\n📝 ENRICHMENT SUMMARY:\n');
let totalFieldsAdded = 0;
let totalFieldsUpdated = 0;

matches.forEach(match => {
  totalFieldsAdded += match.enrichment.fieldsAdded;
  totalFieldsUpdated += match.enrichment.fieldsUpdated;
});

console.log(`Total products: ${matches.length}`);
console.log(`Total fields added: ${totalFieldsAdded}`);
console.log(`Total fields updated: ${totalFieldsUpdated}`);
console.log(`Average enrichment per product: ${(totalFieldsAdded + totalFieldsUpdated) / matches.length}`);

console.log('\n✨ Test complete!\n');

function calculateEnrichment(local, wix) {
  const addedFields = [];
  let fieldsAdded = 0;
  let fieldsUpdated = 0;
  
  // Check if we can add image
  if (!local.imageUrl && wix.media && wix.media.mainMedia && wix.media.mainMedia.image) {
    addedFields.push('imageUrl');
    fieldsAdded++;
  } else if (local.imageUrl && wix.media && wix.media.mainMedia && wix.media.mainMedia.image) {
    addedFields.push('imageUrl (already exists)');
    fieldsUpdated++;
  }
  
  // Check if we can add additional images
  if (wix.media && wix.media.items && wix.media.items.length > 0) {
    addedFields.push('additional images');
    fieldsAdded++;
  }
  
  // Check if we can add description
  if ((!local.descriptionFull || local.descriptionFull.length < 100) && wix.description) {
    addedFields.push('descriptionFull');
    fieldsAdded++;
  } else if (local.descriptionFull && wix.description) {
    addedFields.push('descriptionFull (enhanced)');
    fieldsUpdated++;
  }
  
  // Check if we can add ribbons
  if (wix.ribbons && wix.ribbons.length > 0) {
    addedFields.push('ribbons');
    fieldsAdded++;
  }
  
  // Always can add Wix metadata
  addedFields.push('wixId');
  addedFields.push('wixProductUrl');
  fieldsAdded += 2;
  
  return {
    fieldsAdded,
    fieldsUpdated,
    addedFields
  };
}


const path = require('path');

console.log('📦 Test Merge: Wix Products → Local Database\n');

// Read the local database
console.log('📖 Reading local database...');
const localDbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

console.log(`✅ Loaded ${localData.products.length} products from local database\n`);

// Sample Wix products (first 10 from our fetch)
const testWixProducts = [
  {
    id: "d9083600-de75-e127-f810-d06b04de244e",
    name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT",
    description: "<p>Capacity: 10 GN 1/1 trays.</p><p>Digital interface with LED backlight buttons with guided selection.</p>",
    price: 14419,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_7d8b7b77430a42efbb4630365e2b449c~mv2.jpeg/v1/fit/w_567,h_720,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [{"text": "Government Certified (ETL)"}],
    productPageUrl: {path: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101t2at"}
  },
  {
    id: "f7c3e9f4-8a01-848f-c243-4cf2a4e2477b",
    name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101BA21",
    description: "<p>The <strong>Zanussi Magistar Combi DS 10 1/1GN Electric</strong> is a high-resolution combi steamer with digital control panel.</p>",
    price: 7500,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_7d478d4797ea492f92a6b12d36c207b3~mv2.jpg/v1/fit/w_606,h_651,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [{"text": "Government Certified (ETL)"}],
    productPageUrl: {path: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zc0e101ba21"}
  },
  {
    id: "ee8ca797-5ec6-1801-5c77-d00ef9e5659c",
    name: "Air Fury High Speed Dryer (C)",
    description: "<p>High speed drying with a high end finish</p><p>The stylish TSL.89 high speed hand dryer can be specified in three different finishes...</p>",
    price: 543,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_8c0152248bfa4f5fbac5708def91b834~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [{"text": "New Arrival"}],
    productPageUrl: {path: "/product-page/copy-of-air-fury-high-speed-dryer-c-1"}
  },
  {
    id: "d26183b8-ad6f-8c33-86c5-f654229f603b",
    name: "Turbo Force Branded Polished Fast Dry",
    description: "<p>One of the UK's most popular dryers, it's in the top 3 for the fastest drying units available...</p>",
    price: 380,
    currency: "EUR",
    media: {
      mainMedia: {
        image: {
          url: "https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg"
        }
      },
      items: [
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg"
          }
        },
        {
          mediaType: "image",
          image: {
            url: "https://static.wixstatic.com/media/c123de_2edbf8451e334177936216834adf4461~mv2.jpg/v1/fit/w_160,h_196,q_90/file.jpg"
          }
        }
      ]
    },
    ribbons: [],
    productPageUrl: {path: "/product-page/turbo-force-branded-polished-fast-dry"}
  }
];

console.log(`\n🔍 Testing merge with ${testWixProducts.length} Wix products...\n`);

const matches = [];
const noMatches = [];

testWixProducts.forEach(wixProduct => {
  const normalizedWixName = wixProduct.name.toLowerCase().trim();
  
  // Search for matches in local database
  const match = localData.products.find(localProduct => {
    const normalizedLocalName = localProduct.name.toLowerCase().trim();
    
    // Exact match
    if (normalizedLocalName === normalizedWixName) {
      return true;
    }
    
    // Check if one contains the other (partial match)
    if (normalizedLocalName.includes(normalizedWixName) || 
        normalizedWixName.includes(normalizedLocalName)) {
      return true;
    }
    
    // Check keywords (if both contain key terms like "Electrolux", "Zanussi", etc.)
    const wixKeywords = normalizedWixName.split(/\s+/).filter(w => w.length > 3);
    const localKeywords = normalizedLocalName.split(/\s+/).filter(w => w.length > 3);
    const commonKeywords = wixKeywords.filter(w => localKeywords.includes(w));
    
    // If 3+ keywords match, likely the same product
    if (commonKeywords.length >= 3) {
      return true;
    }
    
    return false;
  });
  
  if (match) {
    matches.push({
      wix: wixProduct,
      local: match,
      enrichment: calculateEnrichment(match, wixProduct)
    });
  } else {
    noMatches.push(wixProduct);
  }
});

console.log('\n📊 MATCH RESULTS:\n');
console.log(`✅ Matched: ${matches.length}`);
console.log(`❌ No match found: ${noMatches.length}\n`);

// Display matches
if (matches.length > 0) {
  console.log('\n📋 FOUND MATCHES:\n');
  matches.forEach((match, idx) => {
    console.log(`${idx + 1}. ${match.wix.name}`);
    console.log(`   Local: ${match.local.name}`);
    console.log(`   Enrichment: ${match.enrichment.fieldsAdded} field(s) added, ${match.enrichment.fieldsUpdated} field(s) updated`);
    console.log(`   Fields: ${match.enrichment.addedFields.join(', ')}`);
    console.log('');
  });
}

// Display non-matches
if (noMatches.length > 0) {
  console.log('\n⚠️  NO MATCHES FOUND:\n');
  noMatches.forEach((product, idx) => {
    console.log(`${idx + 1}. ${product.name}`);
  });
  console.log('');
}

// Generate enrichment report
console.log('\n📝 ENRICHMENT SUMMARY:\n');
let totalFieldsAdded = 0;
let totalFieldsUpdated = 0;

matches.forEach(match => {
  totalFieldsAdded += match.enrichment.fieldsAdded;
  totalFieldsUpdated += match.enrichment.fieldsUpdated;
});

console.log(`Total products: ${matches.length}`);
console.log(`Total fields added: ${totalFieldsAdded}`);
console.log(`Total fields updated: ${totalFieldsUpdated}`);
console.log(`Average enrichment per product: ${(totalFieldsAdded + totalFieldsUpdated) / matches.length}`);

console.log('\n✨ Test complete!\n');

function calculateEnrichment(local, wix) {
  const addedFields = [];
  let fieldsAdded = 0;
  let fieldsUpdated = 0;
  
  // Check if we can add image
  if (!local.imageUrl && wix.media && wix.media.mainMedia && wix.media.mainMedia.image) {
    addedFields.push('imageUrl');
    fieldsAdded++;
  } else if (local.imageUrl && wix.media && wix.media.mainMedia && wix.media.mainMedia.image) {
    addedFields.push('imageUrl (already exists)');
    fieldsUpdated++;
  }
  
  // Check if we can add additional images
  if (wix.media && wix.media.items && wix.media.items.length > 0) {
    addedFields.push('additional images');
    fieldsAdded++;
  }
  
  // Check if we can add description
  if ((!local.descriptionFull || local.descriptionFull.length < 100) && wix.description) {
    addedFields.push('descriptionFull');
    fieldsAdded++;
  } else if (local.descriptionFull && wix.description) {
    addedFields.push('descriptionFull (enhanced)');
    fieldsUpdated++;
  }
  
  // Check if we can add ribbons
  if (wix.ribbons && wix.ribbons.length > 0) {
    addedFields.push('ribbons');
    fieldsAdded++;
  }
  
  // Always can add Wix metadata
  addedFields.push('wixId');
  addedFields.push('wixProductUrl');
  fieldsAdded += 2;
  
  return {
    fieldsAdded,
    fieldsUpdated,
    addedFields
  };
}




















