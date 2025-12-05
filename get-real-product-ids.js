const fs = require('fs');
const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));

const withImages = data.products.filter(p => p.imageUrl);

console.log('\n✅ Real Products with Images:\n');
console.log(`Total: ${withImages.length} products have images from your database\n`);

console.log('Sample Product IDs you can test:\n');
withImages.slice(0, 10).forEach((p, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ID: ${p.id}`);
    console.log(`   Name: ${p.name.substring(0, 60)}`);
    console.log(`   Image: ${p.imageUrl}`);
    console.log('');
});

console.log('\nTo test with a real product, use:');
console.log('product-page-v2-marketplace-test.html?productId=one_of_the_ids_above\n');



const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));

const withImages = data.products.filter(p => p.imageUrl);

console.log('\n✅ Real Products with Images:\n');
console.log(`Total: ${withImages.length} products have images from your database\n`);

console.log('Sample Product IDs you can test:\n');
withImages.slice(0, 10).forEach((p, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ID: ${p.id}`);
    console.log(`   Name: ${p.name.substring(0, 60)}`);
    console.log(`   Image: ${p.imageUrl}`);
    console.log('');
});

console.log('\nTo test with a real product, use:');
console.log('product-page-v2-marketplace-test.html?productId=one_of_the_ids_above\n');





















