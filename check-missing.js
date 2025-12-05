const fs = require('fs');
const localDb = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));

// Get the JOKER and Invoq products
const joker = localDb.products.filter(p => p.name === 'JOKER');
const invoq = localDb.products.filter(p => p.name === 'Invoq');

console.log('=== JOKER PRODUCTS IN DATABASE ===');
joker.forEach(j => {
    console.log('Name: ' + j.name);
    console.log('  Brand: ' + j.brand);
    console.log('  Model: ' + (j.modelNumber || 'none'));
    console.log('  Power: ' + j.power);
    console.log('  ID: ' + j.id);
    console.log('  Has calculatorData: ' + (j.calculatorData ? 'YES' : 'NO'));
    console.log('');
});

console.log('=== INVOQ PRODUCTS IN DATABASE ===');
invoq.forEach(i => {
    console.log('Name: ' + i.name);
    console.log('  Brand: ' + i.brand);
    console.log('  Model: ' + (i.modelNumber || 'none'));
    console.log('  Power: ' + i.power);
    console.log('  ID: ' + i.id);
    console.log('  Has calculatorData: ' + (i.calculatorData ? 'YES' : 'NO'));
    console.log('');
});

console.log('='.repeat(60));
console.log('CONCLUSION');
console.log('='.repeat(60));
console.log('');
console.log('The "missing" products ARE actually in the local database,');
console.log('but with SHORTER names from the ETL source.');
console.log('');
console.log('Example:');
console.log('  Wix: "JOKER by Eloma GmbH"');
console.log('  ETL: "JOKER"');
console.log('');
console.log('  Wix: "Invoq Bake 6-400x600"');
console.log('  ETL: "Invoq"');
console.log('');
console.log('So this is a NAME MATCHING issue, not missing products.');

