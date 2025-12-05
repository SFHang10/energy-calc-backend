const fs = require('fs');
const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const withImg = data.products.filter(p => p.imageUrl);
console.log(`Total: ${data.products.length}`);
console.log(`With Images: ${withImg.length}`);
console.log(`Without Images: ${data.products.length - withImg.length}`);



const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const withImg = data.products.filter(p => p.imageUrl);
console.log(`Total: ${data.products.length}`);
console.log(`With Images: ${withImg.length}`);
console.log(`Without Images: ${data.products.length - withImg.length}`);























