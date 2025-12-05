const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🚀 Starting Carrier image update...');
console.log('Reading JSON file...');
let content = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');

let updatedAllGlass = 0;
let updatedAntiReflective = 0;

// Strategy: Find products by name, then replace their imageUrl if it's Motor.jpg
// Split by product boundaries and process each

// For "Carrier Refrigeration all glass door"
const allGlassDoorUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
content = content.replace(
    /"name": "Carrier Refrigeration all glass door"([\s\S]{0,500}?)"imageUrl": "Product Placement\/Motor\.jpg"/g,
    (match) => {
        updatedAllGlass++;
        return match.replace('"Product Placement/Motor.jpg"', `"${allGlassDoorUrl}"`);
    }
);

// For "Carrier Refrigeration anti-reflective all glass door"
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';
content = content.replace(
    /"name": "Carrier Refrigeration anti-reflective all glass door"([\s\S]{0,500}?)"imageUrl": "Product Placement\/Motor\.jpg"/g,
    (match) => {
        updatedAntiReflective++;
        return match.replace('"Product Placement/Motor.jpg"', `"${antiReflectiveUrl}"`);
    }
);

const totalUpdated = updatedAllGlass + updatedAntiReflective;

if (totalUpdated > 0) {
    console.log(`✅ Updated ${updatedAllGlass} "all glass door" products`);
    console.log(`✅ Updated ${updatedAntiReflective} "anti-reflective" products`);
    console.log(`✅ Total: ${totalUpdated} Carrier products updated`);
    
    // Create backup
    const backupPath = FULL_DATABASE_PATH + '.backup_' + Date.now();
    fs.writeFileSync(backupPath, fs.readFileSync(FULL_DATABASE_PATH, 'utf8'));
    console.log(`📦 Backup created: ${path.basename(backupPath)}`);
    
    // Write updated content
    fs.writeFileSync(FULL_DATABASE_PATH, content);
    console.log('✅ File updated successfully!');
} else {
    console.log('⚠️  No products found to update');
    console.log('Checking if products exist...');
    const allGlassCount = (content.match(/"name": "Carrier Refrigeration all glass door"/g) || []).length;
    const antiReflectiveCount = (content.match(/"name": "Carrier Refrigeration anti-reflective all glass door"/g) || []).length;
    console.log(`Found ${allGlassCount} "all glass door" products`);
    console.log(`Found ${antiReflectiveCount} "anti-reflective" products`);
}

