const fs = require('fs');
const path = 'c:\\Users\\steph\\.cursor\\projects\\c-Users-steph-AppData-Roaming-Cursor-Workspaces-1762640608809-workspace-json\\agent-tools\\510fded7-882e-42a9-b63f-1af660751f7c.txt';

try {
  let content = fs.readFileSync(path, 'utf8');
  // Remove prefix if present
  if (content.startsWith('Wix Site API call successful: ')) {
    content = content.replace('Wix Site API call successful: ', '');
  }
  const data = JSON.parse(content);
  console.log('Total products:', data.products?.length || 0);
  
  if(data.products && data.products.length > 0) {
    console.log('\nFirst 10 products:');
    data.products.slice(0, 10).forEach((p, i) => {
      console.log(`${i+1}. ${p.name}`);
      console.log(`   Price: ${p.price?.formatted?.price || 'N/A'}`);
      console.log(`   SKU: ${p.sku || 'N/A'}`);
      console.log(`   Type: ${p.productType || 'N/A'}`);
      console.log('');
    });
  }
} catch (error) {
  console.error('Error:', error.message);
}

