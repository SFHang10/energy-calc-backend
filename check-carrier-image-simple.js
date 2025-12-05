/**
 * Simple script to check Carrier product image in backup files
 */

const fs = require('fs');
const path = require('path');

const PRODUCT_ID = 'etl_14_65836';

console.log('Starting check...\n');

// Check current file first
const currentFile = 'FULL-DATABASE-5554.json';
if (fs.existsSync(currentFile)) {
    try {
        console.log(`Checking: ${currentFile}`);
        const content = fs.readFileSync(currentFile, 'utf8');
        const data = JSON.parse(content);
        const product = data.products.find(p => p.id === PRODUCT_ID);
        
        if (product) {
            const stats = fs.statSync(currentFile);
            console.log(`✅ FOUND in ${currentFile}`);
            console.log(`   Date: ${stats.mtime.toISOString()}`);
            console.log(`   Image: ${product.imageUrl || 'NONE'}`);
            console.log(`   Category: ${product.category || 'NONE'}`);
        } else {
            console.log(`❌ Product not found in ${currentFile}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
} else {
    console.log(`❌ File not found: ${currentFile}`);
}

// Check a few backup files
const backups = [
    'FULL-DATABASE-5554-HVAC-BACKUP-1762186189599.json',
    'FULL-DATABASE-5554_backup_athen_images_1763404173142.json',
    'FULL-DATABASE-5554_backup_tempest_images_1763398723017.json'
];

console.log('\n--- Checking Backup Files ---\n');

backups.forEach(fileName => {
    if (fs.existsSync(fileName)) {
        try {
            console.log(`Checking: ${fileName}`);
            const stats = fs.statSync(fileName);
            const content = fs.readFileSync(fileName, 'utf8');
            const data = JSON.parse(content);
            const product = data.products.find(p => p.id === PRODUCT_ID);
            
            if (product) {
                console.log(`✅ FOUND`);
                console.log(`   Date: ${stats.mtime.toISOString()}`);
                console.log(`   Image: ${product.imageUrl || 'NONE'}`);
            } else {
                console.log(`❌ Product not found`);
            }
            console.log('');
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
    } else {
        console.log(`⚠️  File not found: ${fileName}\n`);
    }
});

console.log('Done!');

