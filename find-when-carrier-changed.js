/**
 * Find exactly when Carrier products changed from correct images to Motor.jpg
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS = [
    { id: 'etl_14_65836', name: 'Carrier Refrigeration all glass door' },
    { id: 'etl_14_65852', name: 'Carrier Refrigeration anti-reflective all glass door' }
];

const CORRECT_IMAGES = [
    'Carrier Refrigeration all glass door  by Carrier Linde Commercial Refrigeration.jpeg',
    'Carrier Refrigeration all glass door__ by Carrier Linde Commercial Refrigeration.jpeg',
    'Carrier Refrigeration anti-reflective all glass door by Carrier Linde Commercial.jpeg',
    'Cm Fridge.jpeg',
    'Fridge.png',
    'Fridges and Freezers.jpg'
];

console.log('\n🔍 FINDING WHEN CARRIER PRODUCTS CHANGED TO Motor.jpg');
console.log('='.repeat(70));
console.log('');

// Get all backup files sorted by date
const backupFiles = [
    { name: 'FULL-DATABASE-5554.json', label: 'CURRENT' },
    { name: 'FULL-DATABASE-5554_backup_athen_images_1763404173142.json', label: 'Athen Images Backup' },
    { name: 'FULL-DATABASE-5554_backup_athen_images_1763403879045.json', label: 'Athen Images Backup 2' },
    { name: 'FULL-DATABASE-5554_backup_athen_images_1763403857871.json', label: 'Athen Images Backup 3' },
    { name: 'FULL-DATABASE-5554_backup_tempest_power_all_1763402376846.json', label: 'Tempest Power Backup' },
    { name: 'FULL-DATABASE-5554_backup_tempest_power_1763400705918.json', label: 'Tempest Power Backup 2' },
    { name: 'FULL-DATABASE-5554_backup_tempest_images_1763398723017.json', label: 'Tempest Images Backup' },
    { name: 'FULL-DATABASE-5554_backup_cheftop_1763395454719.json', label: 'Cheftop Backup' },
    { name: 'FULL-DATABASE-5554_backup_images_1763394891643.json', label: 'Images Backup' },
    { name: 'FULL-DATABASE-5554_backup_images_1763394812849.json', label: 'Images Backup 2' },
    { name: 'FULL-DATABASE-5554_backup_1763394340839.json', label: 'General Backup' },
    { name: 'FULL-DATABASE-5554-HVAC-BACKUP-1762186189599.json', label: 'HVAC Backup (Oct 15)' },
    { name: 'FULL-DATABASE-5554-BACKUP-1762623168443.json', label: 'Backup 1' },
    { name: 'FULL-DATABASE-5554-BACKUP-1762621708423.json', label: 'Backup 2' },
    { name: 'FULL-DATABASE-5554-BACKUP-1762622157811.json', label: 'Backup 3' },
];

const allResults = [];

console.log('Checking backup files...\n');

backupFiles.forEach(({ name, label }) => {
    const filePath = path.join(__dirname, name);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${name} - File not found`);
        return;
    }
    
    try {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        console.log(`📂 ${label} (${stats.mtime.toISOString().split('T')[0]})`);
        
        PRODUCTS.forEach(product => {
            const found = data.products?.find(p => p.id === product.id || p.name === product.name);
            
            if (found) {
                const isMotor = found.imageUrl && found.imageUrl.includes('Motor');
                const isCorrect = found.imageUrl && CORRECT_IMAGES.some(correct => 
                    found.imageUrl.includes(correct) || found.imageUrl.includes('Cm Fridge') || found.imageUrl.includes('Fridge')
                );
                
                allResults.push({
                    file: name,
                    label: label,
                    date: stats.mtime,
                    productId: product.id,
                    productName: product.name,
                    imageUrl: found.imageUrl || 'NONE',
                    isMotor: isMotor,
                    isCorrect: isCorrect
                });
                
                const status = isMotor ? '❌ Motor.jpg' : (isCorrect ? '✅ Correct' : '⚠️  Other');
                console.log(`   ${product.name.substring(0, 50)}...`);
                console.log(`      Image: ${found.imageUrl || 'NONE'} ${status}`);
            }
        });
        console.log('');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }
});

// Sort by date (newest first)
allResults.sort((a, b) => b.date - a.date);

// Group by product
console.log('\n\n📊 IMAGE HISTORY BY PRODUCT:\n');
console.log('='.repeat(70));

PRODUCTS.forEach(product => {
    const productResults = allResults.filter(r => r.productId === product.id);
    
    if (productResults.length === 0) {
        console.log(`\n❌ ${product.name} - Not found in any backups\n`);
        return;
    }
    
    console.log(`\n📦 ${product.name} (${product.id})`);
    console.log('-'.repeat(70));
    
    productResults.forEach((result, index) => {
        const dateStr = result.date.toISOString().split('T')[0] + ' ' + 
                       result.date.toTimeString().split(' ')[0];
        const isCurrent = index === 0;
        const marker = isCurrent ? '👉 CURRENT' : '   ';
        const status = result.isMotor ? '❌ Motor.jpg' : (result.isCorrect ? '✅ Correct' : '⚠️  Other');
        
        console.log(`\n${marker} ${dateStr}`);
        console.log(`   File: ${result.label}`);
        console.log(`   Image: ${result.imageUrl}`);
        console.log(`   Status: ${status}`);
        
        // Check if changed from previous
        if (index > 0) {
            const previous = productResults[index - 1];
            if (previous.imageUrl !== result.imageUrl) {
                console.log(`   ⚠️  CHANGED from previous!`);
                console.log(`      Previous: ${previous.imageUrl} (${previous.isMotor ? 'Motor' : previous.isCorrect ? 'Correct' : 'Other'})`);
                console.log(`      Current:  ${result.imageUrl} (${result.isMotor ? 'Motor' : result.isCorrect ? 'Correct' : 'Other'})`);
                
                // If changed TO Motor.jpg, this is the change point
                if (result.isMotor && !previous.isMotor) {
                    console.log(`   🚨 THIS IS WHEN IT CHANGED TO Motor.jpg!`);
                }
            }
        }
    });
    
    // Find when it changed to Motor.jpg
    console.log(`\n🔍 When did it change to Motor.jpg?`);
    for (let i = 0; i < productResults.length - 1; i++) {
        const current = productResults[i];
        const previous = productResults[i + 1];
        
        if (current.isMotor && !previous.isMotor) {
            console.log(`\n❌ Changed to Motor.jpg:`);
            console.log(`   Date: ${current.date.toISOString()}`);
            console.log(`   File: ${current.label} (${current.file})`);
            console.log(`   From: ${previous.imageUrl}`);
            console.log(`   To: ${current.imageUrl}`);
            console.log(`\n   Previous version:`);
            console.log(`   Date: ${previous.date.toISOString()}`);
            console.log(`   File: ${previous.label} (${previous.file})`);
            console.log(`   Had: ${previous.imageUrl}`);
            break;
        }
    }
    
    // Find most recent correct image
    const mostRecentCorrect = productResults.find(r => r.isCorrect && !r.isMotor);
    if (mostRecentCorrect) {
        console.log(`\n✅ Most recent correct image:`);
        console.log(`   Date: ${mostRecentCorrect.date.toISOString()}`);
        console.log(`   File: ${mostRecentCorrect.label}`);
        console.log(`   Image: ${mostRecentCorrect.imageUrl}`);
    } else {
        console.log(`\n⚠️  No correct images found in backups`);
        console.log(`   Product may have always had Motor.jpg or wrong image`);
    }
});

console.log('\n');

