const fs = require('fs');

console.log('🔄 Updating hand dryer icon to custom image...');

// Read the hand dryer file
const jsContent = fs.readFileSync('embedded-etl-hand-dryers.js', 'utf8');
const data = eval(jsContent + '; EMBEDDED_ETL_HAND_DRYERS');

// Update all hand dryer products to use the custom image
const updatedHandDryers = data.map(product => ({
    ...product,
    icon: '<img src="images/icons/hand-dryer-icon.png" alt="Hand Dryer" style="width: 24px; height: 24px;">'
}));

console.log(`✅ Updated ${updatedHandDryers.length} hand dryer products with custom icon`);

// Create updated embedded JavaScript file
const updatedJsContent = `// Embedded ETL Hand Dryers Data with Custom Icon
const EMBEDDED_ETL_HAND_DRYERS = ${JSON.stringify(updatedHandDryers, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_ETL_HAND_DRYERS = EMBEDDED_ETL_HAND_DRYERS;
}`;

// Write the updated file
fs.writeFileSync('embedded-etl-hand-dryers.js', updatedJsContent);

console.log('✅ Updated embedded-etl-hand-dryers.js with custom hand dryer icon');
console.log('🎯 Custom icon integration complete!');







