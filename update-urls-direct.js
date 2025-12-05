/**
 * Extract URLs from API responses and update upload-final-batch.js directly
 */

const fs = require('fs');
const path = require('path');

// All 13 fresh upload URLs from Wix API (generated 2024-12-30)
// Order matches imageNames array in upload-final-batch.js:
// 1. KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg
// 2. LG LDE4413ST 30 Double Wall Oven.jpeg
// 3. Light.jpeg
// 4. Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg
// 5. microwavemainhp.jpg
// 6. Motor.jpeg
// 7. Motor.jpg
// 8. Samsung NE58K9430WS 30 Wall Oven.jpg
// 9. Savings.jpg
// 10. Smart Home. jpeg.jpeg
// 11. Smart Warm Home. jpeg.jpeg
// 12. Whirlpool WOD51HZES 30 Double Wall Oven.jpg
// 13. Appliances.jpg

const urls = require('./final-13-urls.json').urls;

console.log('URLs array has', urls.length, 'items');
console.log('Updating upload-final-batch.js...');

const filePath = path.join(__dirname, 'upload-final-batch.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the array bounds
const arrayStart = content.indexOf('const uploadUrls = [');
if (arrayStart === -1) {
    console.error('Could not find uploadUrls array');
    process.exit(1);
}

let bracketCount = 0;
let inArray = false;
let endIndex = arrayStart;

for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '[' && !inArray) {
        inArray = true;
        bracketCount = 1;
    } else if (content[i] === '[') {
        bracketCount++;
    } else if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && inArray) {
            endIndex = i + 1;
            break;
        }
    }
}

// Build new array - each URL on its own line
const newArray = 'const uploadUrls = [\n' +
    urls.map(url => `    "${url.replace(/"/g, '\\"')}"`).join(',\n') +
    '\n];';

const beforeArray = content.substring(0, arrayStart);
const afterArray = content.substring(endIndex);

const newContent = beforeArray + newArray + afterArray;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Updated upload-final-batch.js with', urls.length, 'URLs');

