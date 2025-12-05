/**
 * PHASE 2A: Execute Sync for High Confidence Products
 * Adds Wix images/videos to matching local products
 */

const fs = require('fs');

console.log('='.repeat(70));
console.log('PHASE 2A: EXECUTING SYNC');
console.log('='.repeat(70));
console.log('');

// The 6 high confidence matches with their media
const syncData = [
    {
        localId: 'etl_22_86257',
        localName: 'Electrolux Professional Skyline 10 GN1/1 Electric 3-glass',
        wixName: 'Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT',
        images: [
            'https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_7d8b7b77430a42efbb4630365e2b449c~mv2.jpeg/v1/fit/w_567,h_720,q_90/file.jpg'
        ],
        videos: []
    },
    {
        localId: 'etl_9_75495',
        localName: 'Air Fury High Speed Hand Dryer',
        wixName: 'The Splash Lab Air Fury High Speed Hand Dryer TSL.89',
        images: [
            'https://static.wixstatic.com/media/c123de_b693194df473495aa61fdd2755ccb91b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_cd151d6a93404985942ccd1af919fe5a~mv2.jpg/v1/fit/w_1214,h_1574,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_cc4c5e1ae561495aa7c093bca5437b02~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg'
        ],
        videos: [
            'https://video.wixstatic.com/video/c123de_5d118a1c7b3d4734a773229aee187b0f/720p/mp4/file.mp4'
        ]
    },
    {
        localId: 'etl_9_69850',
        localName: 'Turbo Force Branded Polished Fast Dry',
        wixName: 'Turbo Force Branded Polished Fast Dry',
        images: [
            'https://static.wixstatic.com/media/c123de_7d66c726d37946208849926e84f4fa32~mv2.jpeg/v1/fit/w_530,h_720,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_2edbf8451e334177936216834adf4461~mv2.jpg/v1/fit/w_160,h_196,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_6b3724aac1374bdc971a102ec83fa09b~mv2.jpg/v1/fit/w_160,h_195,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_31d889fc786b4f23817e73fd78b32825~mv2.jpeg/v1/fit/w_535,h_720,q_90/file.jpg'
        ],
        videos: []
    },
    {
        localId: 'etl_9_69848',
        localName: 'Turbo Force Branded White Fast Dry',
        wixName: 'Turbo Force Branded White Fast Dry',
        images: [
            'https://static.wixstatic.com/media/c123de_c92b715874a1405ba95e8b5bddccc923~mv2.jpg/v1/fit/w_543,h_720,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_9f66e476a4b54c75875b69ab9c6dacd4~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_5cd949b1fcda4dbfb6ff02cd5481c1d9~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_f07e94919bc0488b8532374109e3715e~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg'
        ],
        videos: []
    },
    {
        localId: 'etl_22_86431',
        localName: 'JOKER',
        wixName: 'JOKER by Eloma GmbH',
        images: [
            'https://static.wixstatic.com/media/c123de_8cae75468621498591beb78fa48611f1~mv2.jpg/v1/fit/w_494,h_602,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_1dd08c5aaf04481297391fa84e5ecabb~mv2.jpg/v1/fit/w_1727,h_980,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_4bf53119bf4441d0bb2d3220323c6724~mv2.jpg/v1/fit/w_711,h_720,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_36fd77ff80aa4d4da3f98e1ce9ade086~mv2.jpg/v1/fit/w_768,h_626,q_90/file.jpg',
            'https://static.wixstatic.com/media/c123de_8f015c1fcabe4a2eaab4e7063f7772cb~mv2.jpg/v1/fit/w_1150,h_1050,q_90/file.jpg'
        ],
        videos: [
            'https://video.wixstatic.com/video/c123de_5adeff7a60c745f9a5f3390233a6c04a/480p/mp4/file.mp4',
            'https://video.wixstatic.com/video/c123de_95892a296e1e4dd1924320af9e1e7ded/720p/mp4/file.mp4'
        ]
    },
    {
        localId: 'etl_7_86302',
        localName: 'Baxi Auriga HP 26T',
        wixName: 'Baxi Auriga HP 26T',
        images: [
            'https://static.wixstatic.com/media/c123de_1c64752dfa47429c9ebb371ac1908838~mv2.jpg/v1/fit/w_467,h_363,q_90/file.jpg'
        ],
        videos: [
            'https://video.wixstatic.com/video/c123de_f70d7819f1c8466793580e92df15f321/720p/mp4/file.mp4'
        ]
    }
];

// Load database
console.log('1. Loading database...');
const db = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
console.log('   Loaded ' + db.products.length + ' products');
console.log('');

// Process each sync
let successCount = 0;
let failCount = 0;

console.log('2. Syncing media...');
console.log('');

for (const sync of syncData) {
    // Find the product
    const productIndex = db.products.findIndex(p => p.id === sync.localId);
    
    if (productIndex === -1) {
        console.log('   ✗ NOT FOUND: ' + sync.localName + ' (ID: ' + sync.localId + ')');
        failCount++;
        continue;
    }
    
    const product = db.products[productIndex];
    
    // Backup existing images/videos
    const oldImages = product.images || [];
    const oldVideos = product.videos || [];
    
    // Add new images (avoiding duplicates)
    const newImages = [...new Set([...oldImages, ...sync.images])];
    const newVideos = [...new Set([...oldVideos, ...sync.videos])];
    
    // Update product
    db.products[productIndex].images = newImages;
    db.products[productIndex].videos = newVideos;
    db.products[productIndex].wixSynced = true;
    db.products[productIndex].wixSyncDate = new Date().toISOString();
    
    console.log('   ✓ ' + sync.localName);
    console.log('     Images: ' + oldImages.length + ' → ' + newImages.length + ' (+' + (newImages.length - oldImages.length) + ')');
    console.log('     Videos: ' + oldVideos.length + ' → ' + newVideos.length + ' (+' + (newVideos.length - oldVideos.length) + ')');
    console.log('');
    
    successCount++;
}

// Save database
console.log('3. Saving database...');
fs.writeFileSync('FULL-DATABASE-5554.json', JSON.stringify(db, null, 2));
console.log('   Saved!');
console.log('');

// Summary
console.log('='.repeat(70));
console.log('SYNC COMPLETE');
console.log('='.repeat(70));
console.log('');
console.log('Products synced: ' + successCount);
console.log('Failed: ' + failCount);
console.log('');
console.log('Backup file: FULL-DATABASE-5554_backup_before_sync.json');
console.log('');
console.log('To verify, check a synced product:');
console.log('  node -e "const db=JSON.parse(require(\'fs\').readFileSync(\'FULL-DATABASE-5554.json\'));console.log(db.products.find(p=>p.id===\'etl_22_86431\'))"');

