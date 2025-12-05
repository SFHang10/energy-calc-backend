const fs = require('fs');

// Wix product data (extracted from API responses)
const wixProducts = {
    // Zanussi Magistar variants -> etl_22_86278
    "etl_22_86278": {
        name: "Zanussi Magistar 10 GN1/1 Electric 2-glass",
        images: [
            "https://static.wixstatic.com/media/c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_7d478d4797ea492f92a6b12d36c207b3~mv2.jpg/v1/fit/w_606,h_651,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_acc8ec3030744c34a676039cc631719d~mv2.jpg/v1/fit/w_332,h_327,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_dbc2dfa9de814d8d8c3e5f6ae7997f3c~mv2.jpg/v1/fit/w_606,h_651,q_90/file.jpg"
        ],
        videos: [
            "https://video.wixstatic.com/video/c123de_cad29e69eaa948e19f64ebb6ad29245a/720p/mp4/file.mp4"
        ]
    },
    // Air Fury variants -> etl_9_75495 (already synced, add more)
    "etl_9_75495": {
        name: "Air Fury High Speed Hand Dryer",
        images: [
            "https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_8c0152248bfa4f5fbac5708def91b834~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_f00613f2029847a0b776280372cdbd93~mv2.jpg/v1/fit/w_720,h_720,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_b693194df473495aa61fdd2755ccb91b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_159ae7bd06e6421f8e20c2aad357374b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_6b3f56126cba4934a682df5164ffc452~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_52ea58026cfa4a779d8d3d8e190e23e4~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_f4f4c31e7a2245afaee11fcaf8b82f47~mv2.png/v1/fit/w_720,h_720,q_90/file.png"
        ],
        videos: [
            "https://video.wixstatic.com/video/c123de_1a15a4e8081e40188e5c7b33fcbb6b0f/720p/mp4/file.mp4",
            "https://video.wixstatic.com/video/c123de_8a573a464b004e3cba90fdde70dbdf42/720p/mp4/file.mp4"
        ]
    },
    // Turboforce variant -> etl_9_69850 (already synced, add more)
    "etl_9_69850": {
        name: "Turbo Force Branded Polished Fast Dry",
        images: [
            "https://static.wixstatic.com/media/c123de_d2072a771e894cf0b8c6f7895ba0afed~mv2.jpg/v1/fit/w_535,h_720,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_3e750c2eda834069932587cf9295a343~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_fb1484fcc4ca49eb80e7623d2053a0eb~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_e2bcc586164642c695538ea0c75d713e~mv2.jpg/v1/fit/w_160,h_160,q_90/file.jpg"
        ],
        videos: []
    },
    // Invoq variants -> etl_22_86201
    "etl_22_86201": {
        name: "Invoq",
        images: [
            "https://static.wixstatic.com/media/c123de_3a4ca73d372b46c0aa8bc973e4046854~mv2.webp/v1/fit/w_510,h_287,q_90/file.webp",
            "https://static.wixstatic.com/media/c123de_40cf05d39b4542e4a5c6024b9f0292a5~mv2.png/v1/fit/w_700,h_394,q_90/file.png",
            "https://static.wixstatic.com/media/c123de_6265bd680f934de99a52f56f3c198894~mv2.webp/v1/fit/w_510,h_287,q_90/file.webp",
            "https://static.wixstatic.com/media/c123de_0b94aeb851334938ae58a12dbac5f119~mv2.jpg/v1/fit/w_380,h_486,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_4f99e9d3e1904deb9d26e6c7e5760890~mv2.jpg/v1/fit/w_318,h_400,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_c26957863d354cf1896569fad7344a39~mv2.jpg/v1/fit/w_510,h_287,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_36f162f666134261b42a25489005c698~mv2.png/v1/fit/w_720,h_405,q_90/file.png",
            "https://static.wixstatic.com/media/c123de_bb5ceb823e704485a8c7c7521b97a89f~mv2.jpg/v1/fit/w_400,h_400,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_f819c5a5178c4ee7b007bfe6047954b5~mv2.png/v1/fit/w_220,h_300,q_90/file.png",
            "https://static.wixstatic.com/media/c123de_710e1def4078427090827f6242e22518~mv2.jpg/v1/fit/w_543,h_1024,q_90/file.jpg",
            "https://static.wixstatic.com/media/c123de_60ec3b3b81664a8f8211dc5b1eae9a4a~mv2.png/v1/fit/w_720,h_405,q_90/file.png",
            "https://static.wixstatic.com/media/c123de_2b344da2dfae4366b4510b5493857732~mv2.jpg/v1/fit/w_3000,h_1688,q_90/file.jpg"
        ],
        videos: [
            "https://video.wixstatic.com/video/c123de_e5f4636d85094e509449928a5d217c68/720p/mp4/file.mp4",
            "https://video.wixstatic.com/video/c123de_d22fd5a5ed2a41108ed66f8d5547be5b/720p/mp4/file.mp4"
        ]
    }
};

// Load database
console.log('Loading database...');
const db = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));

console.log('='.repeat(60));
console.log('PHASE 2B SYNC - MEDIUM CONFIDENCE PRODUCTS');
console.log('='.repeat(60));

let totalImagesAdded = 0;
let totalVideosAdded = 0;
let productsUpdated = 0;

Object.entries(wixProducts).forEach(([etlId, wixData]) => {
    const product = db.products.find(p => p.id === etlId);
    if (!product) {
        console.log(`\n❌ Product not found: ${etlId}`);
        return;
    }
    
    console.log(`\n📦 Updating: ${product.name} (${etlId})`);
    
    // Initialize arrays if needed
    if (!product.images || !Array.isArray(product.images)) {
        product.images = [];
    }
    if (!product.videos || !Array.isArray(product.videos)) {
        product.videos = [];
    }
    
    // Clean existing arrays (remove single-char corrupted entries)
    product.images = product.images.filter(img => 
        img && typeof img === 'string' && img.length > 10
    );
    product.videos = product.videos.filter(vid => 
        vid && typeof vid === 'string' && vid.length > 10
    );
    
    const existingImgCount = product.images.length;
    const existingVidCount = product.videos.length;
    
    // Add new images (avoid duplicates)
    let imagesAdded = 0;
    wixData.images.forEach(img => {
        if (!product.images.includes(img)) {
            product.images.push(img);
            imagesAdded++;
        }
    });
    
    // Add new videos (avoid duplicates)
    let videosAdded = 0;
    wixData.videos.forEach(vid => {
        if (!product.videos.includes(vid)) {
            product.videos.push(vid);
            videosAdded++;
        }
    });
    
    // Mark as synced
    product.wixSynced = true;
    
    console.log(`   Existing: ${existingImgCount} images, ${existingVidCount} videos`);
    console.log(`   Added: ${imagesAdded} images, ${videosAdded} videos`);
    console.log(`   Total: ${product.images.length} images, ${product.videos.length} videos`);
    
    totalImagesAdded += imagesAdded;
    totalVideosAdded += videosAdded;
    productsUpdated++;
});

// Save database
console.log('\nSaving database...');
fs.writeFileSync('FULL-DATABASE-5554.json', JSON.stringify(db, null, 2));

console.log('\n' + '='.repeat(60));
console.log('PHASE 2B SYNC COMPLETE');
console.log('='.repeat(60));
console.log(`Products updated: ${productsUpdated}`);
console.log(`Images added: ${totalImagesAdded}`);
console.log(`Videos added: ${totalVideosAdded}`);

// Verification
console.log('\n📋 All synced products:');
const allSynced = db.products.filter(p => p.wixSynced === true);
allSynced.forEach(p => {
    console.log(`   - ${p.name}: ${p.images?.length || 0} images, ${p.videos?.length || 0} videos`);
});
console.log(`\nTotal products with wixSynced=true: ${allSynced.length}`);

