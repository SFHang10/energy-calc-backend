const XLSX = require('xlsx');
const fs = require('fs');

try {
  console.log('📖 Reading Excel file: catalog_products.xlsx');
  
  // Read the Excel file
  const workbook = XLSX.readFile('catalog_products.xlsx');
  
  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];
  console.log('📋 Sheet name:', sheetName);
  
  // Convert sheet to JSON
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('📊 Total products found:', jsonData.length);
  console.log('📋 Columns:', Object.keys(jsonData[0] || {}));
  
  // Show first few products
  console.log('\n🔍 First 3 products:');
  jsonData.slice(0, 3).forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name || 'No name'}`);
    console.log(`   Brand: ${product.brand || 'No brand'}`);
    console.log(`   Price: ${product.price || 'No price'}`);
    console.log(`   SKU: ${product.sku || 'No SKU'}`);
    console.log(`   Description: ${(product.description || '').substring(0, 100)}...`);
  });
  
  // Save as JSON for easier processing
  fs.writeFileSync('wix_products_export.json', JSON.stringify(jsonData, null, 2));
  console.log('\n✅ Saved as wix_products_export.json');
  
} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
}
















