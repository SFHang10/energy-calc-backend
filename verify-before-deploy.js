const fs = require('fs');
const path = require('path');

console.log('\n🔍 PRE-DEPLOYMENT VERIFICATION');
console.log('='.repeat(70));
console.log('');

const errors = [];
const warnings = [];
const success = [];

// 1. Check database exists and is valid
console.log('📊 Checking Database...');
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
if (!fs.existsSync(dbPath)) {
    errors.push('❌ Database file not found: FULL-DATABASE-5554.json');
} else {
    try {
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(dbContent);
        
        if (!db.products || !Array.isArray(db.products)) {
            errors.push('❌ Database is missing products array');
        } else {
            const totalProducts = db.products.length;
            const productsWithImages = db.products.filter(p => p.imageUrl && p.imageUrl.trim() !== '').length;
            const imageCoverage = ((productsWithImages / totalProducts) * 100).toFixed(1);
            
            success.push(`✅ Database valid: ${totalProducts} products`);
            success.push(`✅ Images: ${productsWithImages}/${totalProducts} (${imageCoverage}%)`);
            
            if (productsWithImages < totalProducts) {
                warnings.push(`⚠️  ${totalProducts - productsWithImages} products still missing images`);
            }
            
            // Check file size
            const stats = fs.statSync(dbPath);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            success.push(`✅ Database size: ${sizeMB} MB`);
        }
    } catch (error) {
        errors.push(`❌ Database JSON is invalid: ${error.message}`);
    }
}

console.log('');

// 2. Check Product Placement folder
console.log('🖼️  Checking Images Folder...');
const imagesPath = path.join(__dirname, 'Product Placement');
if (!fs.existsSync(imagesPath)) {
    errors.push('❌ Product Placement folder not found');
} else {
    const imageFiles = fs.readdirSync(imagesPath)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    
    if (imageFiles.length === 0) {
        errors.push('❌ No image files found in Product Placement folder');
    } else {
        success.push(`✅ Found ${imageFiles.length} images in Product Placement/`);
        
        // Check total size
        let totalSize = 0;
        let largestFile = { name: '', size: 0 };
        
        imageFiles.forEach(file => {
            const filePath = path.join(imagesPath, file);
            const stats = fs.statSync(filePath);
            const size = stats.size;
            totalSize += size;
            
            if (size > largestFile.size) {
                largestFile = { name: file, size: size };
            }
        });
        
        const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
        const largestMB = (largestFile.size / 1024 / 1024).toFixed(2);
        
        success.push(`✅ Total images size: ${totalSizeMB} MB`);
        success.push(`✅ Largest image: ${largestFile.name} (${largestMB} MB)`);
        
        if (largestFile.size > 1024 * 1024) {
            warnings.push(`⚠️  Largest image is ${largestMB} MB (consider optimizing if > 1MB)`);
        }
    }
}

console.log('');

// 3. Check backups exist
console.log('💾 Checking Backups...');
const backupFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('FULL-DATABASE-5554-BACKUP-') && f.endsWith('.json'));

if (backupFiles.length === 0) {
    warnings.push('⚠️  No backup files found (recommended before deployment)');
} else {
    success.push(`✅ Found ${backupFiles.length} backup files`);
}

console.log('');

// 4. Check rollback script
console.log('🔄 Checking Rollback Script...');
const rollbackPath = path.join(__dirname, 'SAFE_ROLLBACK_SCRIPT.js');
if (!fs.existsSync(rollbackPath)) {
    warnings.push('⚠️  Rollback script not found');
} else {
    success.push('✅ Rollback script available');
}

console.log('');

// 5. Summary
console.log('📋 VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log('');

if (success.length > 0) {
    console.log('✅ SUCCESS:');
    success.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(msg => console.log(`   ${msg}`));
    console.log('');
    console.log('🚫 DEPLOYMENT BLOCKED - Please fix errors above');
    process.exit(1);
}

console.log('🎉 ALL CHECKS PASSED!');
console.log('');
console.log('✅ Ready for deployment!');
console.log('');
console.log('📦 Files to deploy:');
console.log('   1. FULL-DATABASE-5554.json');
console.log('   2. Product Placement/ folder (all images)');
console.log('');
console.log('🚀 Next step: Upload files to production server');
console.log('');


const path = require('path');

console.log('\n🔍 PRE-DEPLOYMENT VERIFICATION');
console.log('='.repeat(70));
console.log('');

const errors = [];
const warnings = [];
const success = [];

// 1. Check database exists and is valid
console.log('📊 Checking Database...');
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
if (!fs.existsSync(dbPath)) {
    errors.push('❌ Database file not found: FULL-DATABASE-5554.json');
} else {
    try {
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(dbContent);
        
        if (!db.products || !Array.isArray(db.products)) {
            errors.push('❌ Database is missing products array');
        } else {
            const totalProducts = db.products.length;
            const productsWithImages = db.products.filter(p => p.imageUrl && p.imageUrl.trim() !== '').length;
            const imageCoverage = ((productsWithImages / totalProducts) * 100).toFixed(1);
            
            success.push(`✅ Database valid: ${totalProducts} products`);
            success.push(`✅ Images: ${productsWithImages}/${totalProducts} (${imageCoverage}%)`);
            
            if (productsWithImages < totalProducts) {
                warnings.push(`⚠️  ${totalProducts - productsWithImages} products still missing images`);
            }
            
            // Check file size
            const stats = fs.statSync(dbPath);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            success.push(`✅ Database size: ${sizeMB} MB`);
        }
    } catch (error) {
        errors.push(`❌ Database JSON is invalid: ${error.message}`);
    }
}

console.log('');

// 2. Check Product Placement folder
console.log('🖼️  Checking Images Folder...');
const imagesPath = path.join(__dirname, 'Product Placement');
if (!fs.existsSync(imagesPath)) {
    errors.push('❌ Product Placement folder not found');
} else {
    const imageFiles = fs.readdirSync(imagesPath)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    
    if (imageFiles.length === 0) {
        errors.push('❌ No image files found in Product Placement folder');
    } else {
        success.push(`✅ Found ${imageFiles.length} images in Product Placement/`);
        
        // Check total size
        let totalSize = 0;
        let largestFile = { name: '', size: 0 };
        
        imageFiles.forEach(file => {
            const filePath = path.join(imagesPath, file);
            const stats = fs.statSync(filePath);
            const size = stats.size;
            totalSize += size;
            
            if (size > largestFile.size) {
                largestFile = { name: file, size: size };
            }
        });
        
        const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
        const largestMB = (largestFile.size / 1024 / 1024).toFixed(2);
        
        success.push(`✅ Total images size: ${totalSizeMB} MB`);
        success.push(`✅ Largest image: ${largestFile.name} (${largestMB} MB)`);
        
        if (largestFile.size > 1024 * 1024) {
            warnings.push(`⚠️  Largest image is ${largestMB} MB (consider optimizing if > 1MB)`);
        }
    }
}

console.log('');

// 3. Check backups exist
console.log('💾 Checking Backups...');
const backupFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('FULL-DATABASE-5554-BACKUP-') && f.endsWith('.json'));

if (backupFiles.length === 0) {
    warnings.push('⚠️  No backup files found (recommended before deployment)');
} else {
    success.push(`✅ Found ${backupFiles.length} backup files`);
}

console.log('');

// 4. Check rollback script
console.log('🔄 Checking Rollback Script...');
const rollbackPath = path.join(__dirname, 'SAFE_ROLLBACK_SCRIPT.js');
if (!fs.existsSync(rollbackPath)) {
    warnings.push('⚠️  Rollback script not found');
} else {
    success.push('✅ Rollback script available');
}

console.log('');

// 5. Summary
console.log('📋 VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log('');

if (success.length > 0) {
    console.log('✅ SUCCESS:');
    success.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(msg => console.log(`   ${msg}`));
    console.log('');
    console.log('🚫 DEPLOYMENT BLOCKED - Please fix errors above');
    process.exit(1);
}

console.log('🎉 ALL CHECKS PASSED!');
console.log('');
console.log('✅ Ready for deployment!');
console.log('');
console.log('📦 Files to deploy:');
console.log('   1. FULL-DATABASE-5554.json');
console.log('   2. Product Placement/ folder (all images)');
console.log('');
console.log('🚀 Next step: Upload files to production server');
console.log('');




















