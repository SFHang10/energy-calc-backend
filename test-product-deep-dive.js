/**
 * Test Product Deep-Dive API
 * Tests the API endpoint with a real product
 */

const http = require('http');

const productId = 'sample_27'; // Amana Microwave - has grants and collection agencies
const apiUrl = `http://localhost:4000/api/product-widget/${productId}`;

console.log('🧪 Testing Product Deep-Dive API...\n');
console.log(`Product ID: ${productId}`);
console.log(`API URL: ${apiUrl}\n`);

const url = new URL(apiUrl);

const options = {
  hostname: url.hostname,
  port: url.port || 4000,
  path: url.pathname,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.success && result.product) {
        const product = result.product;
        
        console.log('✅ API Response Successful!\n');
        console.log('📦 Product Information:');
        console.log(`   Name: ${product.name}`);
        console.log(`   Brand: ${product.brand || 'N/A'}`);
        console.log(`   Category: ${product.category || 'N/A'}`);
        console.log(`   Power: ${product.power || 'N/A'}W`);
        console.log(`   Energy Rating: ${product.energyRating || 'N/A'}`);
        console.log(`   Running Cost/Year: €${product.runningCostPerYear?.toFixed(2) || 'N/A'}\n`);
        
        console.log('💰 Grants:');
        if (product.grants && product.grants.length > 0) {
          product.grants.forEach((grant, i) => {
            console.log(`   ${i + 1}. ${grant.program || grant.name || 'Grant'}`);
            if (grant.amount) console.log(`      Amount: ${grant.amount}`);
            if (grant.country) console.log(`      Country: ${grant.country}`);
          });
        } else {
          console.log('   No grants found');
        }
        
        console.log('\n♻️ Collection Agencies:');
        if (product.collectionAgencies && product.collectionAgencies.length > 0) {
          product.collectionAgencies.forEach((agency, i) => {
            console.log(`   ${i + 1}. ${agency.name || 'Agency'}`);
            if (agency.service) console.log(`      Service: ${agency.service}`);
            if (agency.contact) console.log(`      Contact: ${agency.contact}`);
          });
        } else {
          console.log('   No collection agencies found');
        }
        
        console.log('\n🔄 Current Product:');
        if (product.currentProduct) {
          console.log(`   Name: ${product.currentProduct.name || 'N/A'}`);
          console.log(`   Brand: ${product.currentProduct.brand || 'N/A'}`);
        } else {
          console.log('   No current product data (optional field)');
        }
        
        console.log('\n✅ Test Complete!');
        console.log('\n📝 To test the page:');
        console.log(`   1. Open: member-product-deep-dive.html?id=${productId}`);
        console.log('   2. Make sure you are logged in as a member');
        console.log('   3. The page should display all the information above');
        
      } else {
        console.log('❌ API returned error:');
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('\n⚠️ Make sure your backend server is running:');
  console.log('   node server-new.js');
});

req.end();








