const fs = require('fs');

console.log('🔧 Fixing hand dryer icon to use proper emoji...');

// Read the hand dryer file
const jsContent = fs.readFileSync('embedded-etl-hand-dryers.js', 'utf8');
const data = eval(jsContent + '; EMBEDDED_ETL_HAND_DRYERS');

// Update all hand dryer products to use a better hand dryer emoji
const updatedHandDryers = data.map(product => ({
    ...product,
    icon: '🤚' // Hand emoji - better representation for hand dryers
}));

console.log(`✅ Updated ${updatedHandDryers.length} hand dryer products with hand emoji`);

// Create updated embedded JavaScript file
const updatedJsContent = `// Embedded ETL Hand Dryers Data with Hand Emoji
const EMBEDDED_ETL_HAND_DRYERS = ${JSON.stringify(updatedHandDryers, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_ETL_HAND_DRYERS = EMBEDDED_ETL_HAND_DRYERS;
}`;

// Write the updated file
fs.writeFileSync('embedded-etl-hand-dryers.js', updatedJsContent);

console.log('✅ Updated embedded-etl-hand-dryers.js with hand emoji');
console.log('🎯 Hand dryer icons now show proper hand emoji!');







