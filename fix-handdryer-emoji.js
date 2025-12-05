const fs = require('fs');

console.log('🌬️ Fixing hand dryer icons to use emoji...');

// Read the hand dryer file
const jsContent = fs.readFileSync('embedded-etl-hand-dryers.js', 'utf8');
const data = eval(jsContent + '; EMBEDDED_ETL_HAND_DRYERS');

// Update all hand dryer products to use emoji icon
const updatedHandDryers = data.map(product => ({
    ...product,
    icon: '🌬️' // Wind/air emoji for hand dryers
}));

console.log(`✅ Updated ${updatedHandDryers.length} hand dryer products with emoji icon`);

// Create updated embedded JavaScript file
const updatedJsContent = `// Embedded ETL Hand Dryers Data with Emoji Icon
const EMBEDDED_ETL_HAND_DRYERS = ${JSON.stringify(updatedHandDryers, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_ETL_HAND_DRYERS = EMBEDDED_ETL_HAND_DRYERS;
}`;

// Write the updated file
fs.writeFileSync('embedded-etl-hand-dryers.js', updatedJsContent);

console.log('✅ Updated embedded-etl-hand-dryers.js with emoji icon');
console.log('🎯 Hand dryer icons now display correctly!');







