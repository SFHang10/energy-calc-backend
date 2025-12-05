const fs = require('fs');

console.log('Starting check...');

try {
    console.log('Loading JSON file...');
    const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
    console.log(`Loaded ${data.products.length} products`);
    
    const carriers = data.products.filter(p => 
        p.brand && p.brand.toLowerCase().includes('carrier')
    );
    
    console.log(`Found ${carriers.length} Carrier products`);
    
    const withMotor = carriers.filter(p => 
        p.imageUrl && (
            p.imageUrl.includes('Motor.jpg') || 
            p.imageUrl.includes('Motor.jpeg')
        )
    );
    
    const results = [
        '='.repeat(70),
        'CARRIER PRODUCTS CHECK - WHAT CHANGED YESTERDAY',
        '='.repeat(70),
        '',
        `Total Carrier products: ${carriers.length}`,
        `With Motor.jpg (WRONG): ${withMotor.length}`,
        `With other images: ${carriers.length - withMotor.length}`,
        '',
    ];
    
    if (withMotor.length > 0) {
        results.push('❌ CARRIER PRODUCTS WITH MOTOR.JPG (NEED FIXING):');
        results.push('-'.repeat(70));
        withMotor.forEach((p, i) => {
            results.push(`${i + 1}. ${p.name}`);
            results.push(`   ID: ${p.id}`);
            results.push(`   Category: ${p.category || 'NONE'}`);
            results.push(`   Subcategory: ${p.subcategory || 'NONE'}`);
            results.push(`   Current Image: ${p.imageUrl}`);
            results.push(`   imageAssigned: ${p.imageAssigned || 'NONE'}`);
            results.push('');
        });
    }
    
    results.push('='.repeat(70));
    results.push('');
    results.push('💡 ANALYSIS:');
    results.push(`   - ${withMotor.length} Carrier products have Motor.jpg`);
    results.push('   - This is incorrect - Carrier products should have fridge images');
    results.push('   - Possible cause: apply-placeholder-images.js generic fallback');
    results.push('   - Or: safe_sync_images_to_json.js synced wrong images from database');
    results.push('');
    results.push('🔧 SOLUTION:');
    results.push('   Run: node fix-carrier-images.js');
    results.push('');
    
    const output = results.join('\n');
    fs.writeFileSync('carrier-check-results.txt', output);
    
    console.log(output);
    console.log('\n✅ Results saved to: carrier-check-results.txt');
    
} catch (error) {
    console.error('Error:', error.message);
    fs.writeFileSync('carrier-check-results.txt', `Error: ${error.message}\n${error.stack}`);
}

