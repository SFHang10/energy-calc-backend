const fs = require('fs');

// Load sync plan and database
const syncPlan = JSON.parse(fs.readFileSync('sync-plan.json', 'utf8'));
const db = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));

console.log('='.repeat(60));
console.log('PHASE 2B SYNC - MEDIUM CONFIDENCE PRODUCTS');
console.log('='.repeat(60));

// Get medium confidence matches
const mediumMatches = syncPlan.mediumConfidence || [];
console.log(`\nFound ${mediumMatches.length} medium confidence matches\n`);

// Group by local ETL product ID to consolidate all variant images
const etlGroups = {};
mediumMatches.forEach(match => {
    const etlId = match.localId;
    if (!etlGroups[etlId]) {
        etlGroups[etlId] = {
            etlId: etlId,
            etlName: match.localName,
            wixProducts: [],
            wixIds: []
        };
    }
    etlGroups[etlId].wixProducts.push(match.wixName);
    etlGroups[etlId].wixIds.push(match.wixId);
});

console.log('ETL Products to update:');
Object.values(etlGroups).forEach(group => {
    console.log(`\n📦 ${group.etlName} (${group.etlId})`);
    console.log(`   Wix variants to merge: ${group.wixProducts.length}`);
    group.wixProducts.forEach(wp => console.log(`   - ${wp.substring(0, 50)}...`));
});

console.log('\n' + '='.repeat(60));
console.log('NOTE: To complete sync, we need to fetch Wix media URLs');
console.log('The sync-plan.json only has counts, not actual URLs');
console.log('='.repeat(60));

// Output the groups for manual or API-based sync
fs.writeFileSync('phase2b-groups.json', JSON.stringify(etlGroups, null, 2));
console.log('\nGroups saved to: phase2b-groups.json');
console.log('\nUse CallWixSiteAPI to fetch media for these Wix IDs');
