const fs = require('fs');
const path = require('path');

console.log('\n🚀 PROGRESSIVE WIX ENRICHMENT');
console.log('='.repeat(70));
console.log('Merge products in batches - completely safe! 🔒\n');

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
console.log(`✅ Loaded database: ${database.products.length} products\n`);

// Create backup on first run
const backupPath = path.join(__dirname, `FULL-DATABASE-5554-BACKUP-${Date.now()}.json`);
if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`💾 Backup created: ${path.basename(backupPath)}\n`);
}

// Batch 1: Electrolux Skyline Ovens
const batch1_ovens = [
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT", id: "d9083600-de75-e127-f810-d06b04de244e", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101t2at", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2A0", id: "db8cd91b-7dfc-7d01-2f7e-bc4abeacced3", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101t2a0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2E0", id: "a8e79e20-9810-0482-693d-2a7c11bd6c44", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2e0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101B2AL", id: "0f685034-c44a-8143-798f-04615f0f01a9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101b2al", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101B2A0", id: "799d8364-4d1c-5d84-97e9-207c593d3b85", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101b2a0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AB", id: "4ab1106d-d123-d7db-fcd0-22932c1990c7", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2ab", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101TB2A2", id: "f7611fd0-faf6-1ea9-8e3e-c2b135ec20d2", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101tb2a2", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AL", id: "3ed29dba-18ec-8718-93ae-04a04b38f094", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2al", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT", id: "1db5cc4a-57b1-5e55-c409-4fd3f7ee4dc9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2at", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101TB2AT", id: "a73092d9-3e56-629e-df43-1006784377d8", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101tb2at", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2C0", id: "2f4861c8-885d-3f5f-a718-b4b1db1c9c3f", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2c0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2A1", id: "5acc3868-f088-57aa-676f-31f58bd39639", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2a1", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101TB2E0", id: "bc62ff93-83b8-2469-d208-77c9325bebc2", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101tb2e0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3A0", id: "2c5c3ff2-1967-2ccc-5ba3-90fb80f4e734", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3a0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3A1", id: "20a8d177-745e-2918-282e-9a3adc1633a9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3a1", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3AL", id: "ff5909d9-9dc0-4456-5f10-9fe4584d8488", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3al", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3A2", id: "15c1a77c-7671-fcde-d520-3cd811067d6b", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3a2", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3C0", id: "c1be0f94-27cf-2d38-034e-a4f39dc4e0c9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3c0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3AT", id: "2cb0d83f-a992-afc6-b356-b8608196e213", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3at", price: 14419}
];

// Batch 2: Zanussi Magistar Ovens
const batch2_zanussi = [
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101BA21", id: "f7c3e9f4-8a01-848f-c243-4cf2a4e2477b", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zc0e101ba21", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101T2A1", id: "2482c097-c9c7-f9bf-5b5f-c64b4e058784", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zc0e101t2a1", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101B2A2", id: "cf34b75a-b632-a225-4c1e-9561d733252f", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101t2al", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101T2A0", id: "ef974340-7beb-f153-d090-55aca674d282", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101t2a0", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA2", id: "e4662b7d-8d37-0554-87fb-555312547d75", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/copy-of-zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101ba20", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA20", id: "051da703-3286-17eb-3e51-a990463e1253", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101t2", price: 7500}
];

// Batch 3: Hand Dryers
const batch3_dryers = [
    {name: "Air Fury High Speed Dryer (C)", id: "ee8ca797-5ec6-1801-5c77-d00ef9e5659c", image: "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg", url: "/product-page/copy-of-air-fury-high-speed-dryer-c-1", price: 543},
    {name: "Air Fury High Speed Dryer (W)", id: "6452d653-eed1-660c-4550-3868a0bef213", image: "https://static.wixstatic.com/media/c123de_159ae7bd06e6421f8e20c2aad357374b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/copy-of-air-fury-high-speed-dryer-c", price: 670},
    {name: "The Splash Lab Air Fury High Speed Hand Dryer TSL.89", id: "1b70ecfb-9ee3-2ba3-8aba-dcf33236c2cd", image: "https://static.wixstatic.com/media/c123de_b693194df473495aa61fdd2755ccb91b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/the-splash-lab-air-fury-high-speed-hand-dryer-tsl-89", price: 600.95},
    {name: "Turbo Force Branded Polished Fast Dry", id: "d26183b8-ad6f-8c33-86c5-f654229f603b", image: "https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg", url: "/product-page/turbo-force-branded-polished-fast-dry", price: 380},
    {name: "Turboforce® Hand Dryer", id: "692468c8-a4a8-4f00-aa40-865c446e7a0a", image: "https://static.wixstatic.com/media/c123de_d2072a771e894cf0b8c6f7895ba0afed~mv2.jpg/v1/fit/w_535,h_720,q_90/file.jpg", url: "/product-page/turboforce-hand-dryer", price: 477.95},
    {name: "Turbo Force Branded White Fast Dry", id: "d223f9a4-3c58-1ede-15b6-64487f5c12c5", image: "https://static.wixstatic.com/media/c123de_c92b715874a1405ba95e8b5bddccc923~mv2.jpg/v1/fit/w_543,h_720,q_90/file.jpg", url: "/product-page/turbo-force-branded-white-fast-dry", price: 477.95},
    {name: "Air Fury High Speed Dryer (CS)", id: "6b080ee4-7a4d-0154-68e6-4bc4f141bbfb", image: "https://static.wixstatic.com/media/c123de_52ea58026cfa4a779d8d3d8e190e23e4~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg", url: "/product-page/air-fury-high-speed-dryer", price: 670}
];

// Batch 4: Premium Combi Ovens
const batch4_premium = [
    {name: "Magistar 218733 Combi TS - Electric Combi Oven 10 GN 2/1", id: "201bc036-9d52-8c73-c92b-34fbbf799597", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/magistar-218733-combi-ts-electric-combi-oven-10-gn-2-1", price: 7500}
];

// All batches
const allBatches = [
    {name: "Batch 1: Electrolux Skyline Ovens", products: batch1_ovens},
    {name: "Batch 2: Zanussi Magistar", products: batch2_zanussi},
    {name: "Batch 3: Hand Dryers", products: batch3_dryers},
    {name: "Batch 4: Premium Equipment", products: batch4_premium}
];

// Enrichment function
function enrichProduct(local, wix) {
    let changed = false;
    if (!local.wixId) {
        local.wixId = wix.id;
        if (!local.imageUrl) local.imageUrl = wix.image;
        if (!local.wixProductUrl) local.wixProductUrl = wix.url;
        if (!local.price) local.price = wix.price;
        local.enrichedFromWix = true;
        local.enrichedDate = new Date().toISOString();
        changed = true;
    }
    return changed;
}

// Process
let totalEnriched = 0;

allBatches.forEach(batch => {
    console.log(`\n📦 Processing ${batch.name}...`);
    let batchCount = 0;
    
    batch.products.forEach(wix => {
        const matches = database.products.filter(p => {
            const local = p.name.toLowerCase().trim();
            const wixName = wix.name.toLowerCase().trim();
            return local === wixName || local.includes(wixName) || wixName.includes(local);
        });
        
        matches.forEach(local => {
            if (enrichProduct(local, wix)) {
                batchCount++;
                totalEnriched++;
            }
        });
    });
    
    console.log(`   ✅ Enriched ${batchCount} products`);
});

console.log(`\n📊 TOTAL: ${totalEnriched} products enriched across all batches`);

// Save
fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
console.log(`\n✅ Database saved with enrichments!`);
console.log(`💾 Original backed up safely\n`);



const path = require('path');

console.log('\n🚀 PROGRESSIVE WIX ENRICHMENT');
console.log('='.repeat(70));
console.log('Merge products in batches - completely safe! 🔒\n');

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
console.log(`✅ Loaded database: ${database.products.length} products\n`);

// Create backup on first run
const backupPath = path.join(__dirname, `FULL-DATABASE-5554-BACKUP-${Date.now()}.json`);
if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`💾 Backup created: ${path.basename(backupPath)}\n`);
}

// Batch 1: Electrolux Skyline Ovens
const batch1_ovens = [
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT", id: "d9083600-de75-e127-f810-d06b04de244e", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101t2at", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2A0", id: "db8cd91b-7dfc-7d01-2f7e-bc4abeacced3", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101t2a0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2E0", id: "a8e79e20-9810-0482-693d-2a7c11bd6c44", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2e0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101B2AL", id: "0f685034-c44a-8143-798f-04615f0f01a9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101b2al", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101B2A0", id: "799d8364-4d1c-5d84-97e9-207c593d3b85", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101b2a0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AB", id: "4ab1106d-d123-d7db-fcd0-22932c1990c7", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2ab", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101TB2A2", id: "f7611fd0-faf6-1ea9-8e3e-c2b135ec20d2", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101tb2a2", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AL", id: "3ed29dba-18ec-8718-93ae-04a04b38f094", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2al", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT", id: "1db5cc4a-57b1-5e55-c409-4fd3f7ee4dc9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2at", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101TB2AT", id: "a73092d9-3e56-629e-df43-1006784377d8", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101tb2at", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2C0", id: "2f4861c8-885d-3f5f-a718-b4b1db1c9c3f", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2c0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2A1", id: "5acc3868-f088-57aa-676f-31f58bd39639", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t2a1", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101TB2E0", id: "bc62ff93-83b8-2469-d208-77c9325bebc2", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101tb2e0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3A0", id: "2c5c3ff2-1967-2ccc-5ba3-90fb80f4e734", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3a0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3A1", id: "20a8d177-745e-2918-282e-9a3adc1633a9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3a1", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3AL", id: "ff5909d9-9dc0-4456-5f10-9fe4584d8488", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3al", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3A2", id: "15c1a77c-7671-fcde-d520-3cd811067d6b", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3a2", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3C0", id: "c1be0f94-27cf-2d38-034e-a4f39dc4e0c9", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3c0", price: 14419},
    {name: "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T3AT", id: "2cb0d83f-a992-afc6-b356-b8608196e213", image: "https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/electrolux-professional-skyline-10-gn1-1-electric-3-glass-model-ecoe101t3at", price: 14419}
];

// Batch 2: Zanussi Magistar Ovens
const batch2_zanussi = [
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101BA21", id: "f7c3e9f4-8a01-848f-c243-4cf2a4e2477b", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zc0e101ba21", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101T2A1", id: "2482c097-c9c7-f9bf-5b5f-c64b4e058784", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zc0e101t2a1", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZC0E101B2A2", id: "cf34b75a-b632-a225-4c1e-9561d733252f", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101t2al", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101T2A0", id: "ef974340-7beb-f153-d090-55aca674d282", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101t2a0", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA2", id: "e4662b7d-8d37-0554-87fb-555312547d75", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/copy-of-zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101ba20", price: 7500},
    {name: "Zanussi Magistar 10 GN1/1 Electric 2-glass Model ZCOE101BA20", id: "051da703-3286-17eb-3e51-a990463e1253", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/zanussi-magistar-10-gn1-1-electric-2-glass-model-zcoe101t2", price: 7500}
];

// Batch 3: Hand Dryers
const batch3_dryers = [
    {name: "Air Fury High Speed Dryer (C)", id: "ee8ca797-5ec6-1801-5c77-d00ef9e5659c", image: "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg", url: "/product-page/copy-of-air-fury-high-speed-dryer-c-1", price: 543},
    {name: "Air Fury High Speed Dryer (W)", id: "6452d653-eed1-660c-4550-3868a0bef213", image: "https://static.wixstatic.com/media/c123de_159ae7bd06e6421f8e20c2aad357374b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/copy-of-air-fury-high-speed-dryer-c", price: 670},
    {name: "The Splash Lab Air Fury High Speed Hand Dryer TSL.89", id: "1b70ecfb-9ee3-2ba3-8aba-dcf33236c2cd", image: "https://static.wixstatic.com/media/c123de_b693194df473495aa61fdd2755ccb91b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg", url: "/product-page/the-splash-lab-air-fury-high-speed-hand-dryer-tsl-89", price: 600.95},
    {name: "Turbo Force Branded Polished Fast Dry", id: "d26183b8-ad6f-8c33-86c5-f654229f603b", image: "https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg", url: "/product-page/turbo-force-branded-polished-fast-dry", price: 380},
    {name: "Turboforce® Hand Dryer", id: "692468c8-a4a8-4f00-aa40-865c446e7a0a", image: "https://static.wixstatic.com/media/c123de_d2072a771e894cf0b8c6f7895ba0afed~mv2.jpg/v1/fit/w_535,h_720,q_90/file.jpg", url: "/product-page/turboforce-hand-dryer", price: 477.95},
    {name: "Turbo Force Branded White Fast Dry", id: "d223f9a4-3c58-1ede-15b6-64487f5c12c5", image: "https://static.wixstatic.com/media/c123de_c92b715874a1405ba95e8b5bddccc923~mv2.jpg/v1/fit/w_543,h_720,q_90/file.jpg", url: "/product-page/turbo-force-branded-white-fast-dry", price: 477.95},
    {name: "Air Fury High Speed Dryer (CS)", id: "6b080ee4-7a4d-0154-68e6-4bc4f141bbfb", image: "https://static.wixstatic.com/media/c123de_52ea58026cfa4a779d8d3d8e190e23e4~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg", url: "/product-page/air-fury-high-speed-dryer", price: 670}
];

// Batch 4: Premium Combi Ovens
const batch4_premium = [
    {name: "Magistar 218733 Combi TS - Electric Combi Oven 10 GN 2/1", id: "201bc036-9d52-8c73-c92b-34fbbf799597", image: "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg", url: "/product-page/magistar-218733-combi-ts-electric-combi-oven-10-gn-2-1", price: 7500}
];

// All batches
const allBatches = [
    {name: "Batch 1: Electrolux Skyline Ovens", products: batch1_ovens},
    {name: "Batch 2: Zanussi Magistar", products: batch2_zanussi},
    {name: "Batch 3: Hand Dryers", products: batch3_dryers},
    {name: "Batch 4: Premium Equipment", products: batch4_premium}
];

// Enrichment function
function enrichProduct(local, wix) {
    let changed = false;
    if (!local.wixId) {
        local.wixId = wix.id;
        if (!local.imageUrl) local.imageUrl = wix.image;
        if (!local.wixProductUrl) local.wixProductUrl = wix.url;
        if (!local.price) local.price = wix.price;
        local.enrichedFromWix = true;
        local.enrichedDate = new Date().toISOString();
        changed = true;
    }
    return changed;
}

// Process
let totalEnriched = 0;

allBatches.forEach(batch => {
    console.log(`\n📦 Processing ${batch.name}...`);
    let batchCount = 0;
    
    batch.products.forEach(wix => {
        const matches = database.products.filter(p => {
            const local = p.name.toLowerCase().trim();
            const wixName = wix.name.toLowerCase().trim();
            return local === wixName || local.includes(wixName) || wixName.includes(local);
        });
        
        matches.forEach(local => {
            if (enrichProduct(local, wix)) {
                batchCount++;
                totalEnriched++;
            }
        });
    });
    
    console.log(`   ✅ Enriched ${batchCount} products`);
});

console.log(`\n📊 TOTAL: ${totalEnriched} products enriched across all batches`);

// Save
fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
console.log(`\n✅ Database saved with enrichments!`);
console.log(`💾 Original backed up safely\n`);





















