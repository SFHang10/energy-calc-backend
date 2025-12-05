const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const OUTPUT_PATH = path.join(__dirname, 'carrier-check-results.txt');

console.log('Loading JSON...');
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

const carriers = data.products.filter(p => 
    p.brand && p.brand.includes('Carrier')
);

const withMotor = carriers.filter(p => 
    p.imageUrl && (
        p.imageUrl.includes('Motor.jpg') || 
        p.imageUrl.includes('Motor.jpeg')
    )
);

const withCorrect = carriers.filter(p => 
    p.imageUrl && (
        p.imageUrl.includes('Fridge') || 
        p.imageUrl.includes('Carrier') ||
        p.imageUrl.includes('Cm Fridge')
    )
);

let results = [];
results.push('='.repeat(70));
results.push('CARRIER PRODUCTS IMAGE CHECK');
results.push('='.repeat(70));
results.push('');
results.push(`Total Carrier products: ${carriers.length}`);
results.push(`With Motor.jpg: ${withMotor.length}`);
results.push(`With correct images: ${withCorrect.length}`);
results.push(`No image or other: ${carriers.length - withMotor.length - withCorrect.length}`);
results.push('');

if (withMotor.length > 0) {
    results.push('❌ Carrier products with Motor.jpg:');
    results.push('-'.repeat(70));
    withMotor.slice(0, 10).forEach((p, i) => {
        results.push(`${i + 1}. ${p.name}`);
        results.push(`   ID: ${p.id}`);
        results.push(`   Category: ${p.category || 'NONE'}`);
        results.push(`   Subcategory: ${p.subcategory || 'NONE'}`);
        results.push(`   Image: ${p.imageUrl}`);
        results.push('');
    });
    if (withMotor.length > 10) {
        results.push(`... and ${withMotor.length - 10} more`);
    }
}

if (withCorrect.length > 0) {
    results.push('');
    results.push('✅ Carrier products with correct images:');
    results.push('-'.repeat(70));
    withCorrect.slice(0, 5).forEach((p, i) => {
        results.push(`${i + 1}. ${p.name}: ${p.imageUrl}`);
    });
}

results.push('');
results.push('='.repeat(70));

const output = results.join('\n');
fs.writeFileSync(OUTPUT_PATH, output);
console.log(output);
console.log(`\n💾 Results saved to: carrier-check-results.txt`);

