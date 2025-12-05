/**
 * Check image history for Carrier Refrigeration anti-reflective all glass door
 */

const fs = require('fs');
const path = require('path');

const PRODUCT_NAME = 'Carrier Refrigeration anti-reflective all glass door';

console.log('\n🔍 CHECKING IMAGE HISTORY FOR CARRIER ANTI-REFLECTIVE PRODUCT');
console.log('='.repeat(70));
console.log(`\nProduct: ${PRODUCT_NAME}\n`);

// Get all backup files
const backupFiles = [
    'FULL-DATABASE-5554.json', // Current
    'FULL-DATABASE-5554_backup_athen_images_1763404173142.json',
    'FULL-DATABASE-5554_backup_athen_images_1763403879045.json',
    'FULL-DATABASE-5554_backup_athen_images_1763403857871.json',
    'FULL-DATABASE-5554_backup_tempest_power_all_1763402376846.json',
    'FULL-DATABASE-5554_backup_tempest_power_1763400705918.json',
    'FULL-DATABASE-5554_backup_tempest_images_1763398723017.json',
    'FULL-DATABASE-5554_backup_cheftop_1763395454719.json',
    'FULL-DATABASE-5554_backup_images_1763394891643.json',
    'FULL-DATABASE-5554_backup_images_1763394812849.json',
    'FULL-DATABASE-5554_backup_1763394340839.json',
    'FULL-DATABASE-5554-HVAC-BACKUP-1762186189599.json',
    'FULL-DATABASE-5554-BACKUP-1762623168443.json',
    'FULL-DATABASE-5554-BACKUP-1762621708423.json',
    'FULL-DATABASE-5554-BACKUP-1762622157811.json',
];

const results = [];

console.log('Checking files...\n');

backupFiles.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${fileName} - File not found`);
        return;
    }
    
    try {
        console.log(`📂 Checking: ${fileName}...`);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Search for product by name (case insensitive)
        const product = data.products?.find(p => 
            p.name && p.name.toLowerCase().includes('anti-reflective') &&
            p.name.toLowerCase().includes('carrier') &&
            p.name.toLowerCase().includes('glass door')
        );
        
        if (product) {
            results.push({
                file: fileName,
                date: stats.mtime,
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl || 'NONE',
                category: product.category || 'NONE',
                subcategory: product.subcategory || 'NONE'
            });
            console.log(`   ✅ Found: ${product.id}`);
            console.log(`      Image: ${product.imageUrl || 'NONE'}`);
        } else {
            console.log(`   ⚠️  Product not found`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
});

// Sort by date (newest first)
results.sort((a, b) => b.date - a.date);

if (results.length === 0) {
    console.log('❌ Product not found in any backup files');
    console.log('   Searching for similar products...\n');
    
    // Try to find similar Carrier products
    try {
        const currentData = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
        const carrierProducts = currentData.products.filter(p => 
            p.brand && p.brand.includes('Carrier') &&
            p.name && p.name.includes('glass door')
        );
        
        if (carrierProducts.length > 0) {
            console.log(`Found ${carrierProducts.length} Carrier glass door products:\n`);
            carrierProducts.slice(0, 10).forEach(p => {
                console.log(`   - ${p.id}: ${p.name}`);
                console.log(`     Image: ${p.imageUrl || 'NONE'}`);
            });
        }
    } catch (e) {
        console.log(`Error searching: ${e.message}`);
    }
} else {
    console.log('\n📊 IMAGE HISTORY:\n');
    console.log('='.repeat(70));
    
    results.forEach((result, index) => {
        const dateStr = result.date.toISOString().split('T')[0] + ' ' + 
                       result.date.toTimeString().split(' ')[0];
        const isCurrent = index === 0;
        const marker = isCurrent ? '👉 CURRENT' : '   ';
        
        console.log(`\n${marker} ${dateStr}`);
        console.log(`   File: ${result.file}`);
        console.log(`   ID: ${result.id}`);
        console.log(`   Name: ${result.name}`);
        console.log(`   Image: ${result.imageUrl}`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Subcategory: ${result.subcategory}`);
        
        if (index > 0 && results[index - 1].imageUrl !== result.imageUrl) {
            console.log(`   ⚠️  IMAGE CHANGED!`);
            console.log(`      Previous: ${results[index - 1].imageUrl}`);
            console.log(`      Current:  ${result.imageUrl}`);
        }
    });
    
    // Find when it changed to Motor.jpg
    console.log('\n\n🔍 WHEN DID IT CHANGE TO Motor.jpg?\n');
    console.log('-'.repeat(70));
    
    let changedToMotor = null;
    for (let i = 0; i < results.length - 1; i++) {
        const current = results[i];
        const previous = results[i + 1];
        
        if (current.imageUrl && current.imageUrl.includes('Motor') && 
            previous.imageUrl && !previous.imageUrl.includes('Motor')) {
            changedToMotor = {
                when: current.date,
                file: current.file,
                from: previous.imageUrl,
                to: current.imageUrl,
                previousFile: previous.file,
                previousDate: previous.date
            };
            break;
        }
    }
    
    if (changedToMotor) {
        console.log(`\n❌ Changed to Motor.jpg:`);
        console.log(`   Date: ${changedToMotor.when.toISOString()}`);
        console.log(`   File: ${changedToMotor.file}`);
        console.log(`   From: ${changedToMotor.from}`);
        console.log(`   To: ${changedToMotor.to}`);
        console.log(`\n   Previous version (${changedToMotor.previousDate.toISOString()}):`);
        console.log(`   File: ${changedToMotor.previousFile}`);
        console.log(`   Had: ${changedToMotor.from}`);
    } else {
        console.log('\n⚠️  Could not determine when it changed to Motor.jpg');
        if (results[0].imageUrl && results[0].imageUrl.includes('Motor')) {
            console.log('   Current version already has Motor.jpg');
        }
    }
    
    // Find what the correct image should be
    console.log('\n\n✅ WHAT WAS THE CORRECT IMAGE BEFORE?\n');
    console.log('-'.repeat(70));
    
    const nonMotorImages = results
        .filter(r => r.imageUrl && !r.imageUrl.includes('Motor') && r.imageUrl !== 'NONE')
        .map(r => r.imageUrl);
    
    if (nonMotorImages.length > 0) {
        const uniqueImages = [...new Set(nonMotorImages)];
        console.log('\n📋 Images that were used before (non-Motor):');
        uniqueImages.forEach(img => {
            const filesWithThis = results.filter(r => r.imageUrl === img);
            console.log(`   ${img}`);
            console.log(`      Used in: ${filesWithThis.length} backup(s)`);
            filesWithThis.forEach(f => {
                console.log(`         - ${f.file} (${f.date.toISOString().split('T')[0]})`);
            });
        });
        
        // Most recent non-Motor image
        const mostRecentNonMotor = results.find(r => 
            r.imageUrl && !r.imageUrl.includes('Motor') && r.imageUrl !== 'NONE'
        );
        if (mostRecentNonMotor) {
            console.log(`\n✅ Most recent correct image: ${mostRecentNonMotor.imageUrl}`);
            console.log(`   From file: ${mostRecentNonMotor.file}`);
            console.log(`   Date: ${mostRecentNonMotor.date.toISOString()}`);
        }
    } else {
        console.log('\n⚠️  No non-Motor images found in backups');
        if (results[0].imageUrl && results[0].imageUrl.includes('Motor')) {
            console.log('   All backups show Motor.jpg');
        }
    }
}

console.log('\n');

