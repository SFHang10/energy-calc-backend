/**
 * Clear Cursor's cache to force it to reload chat data
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_DIR = path.join(APPDATA, 'Cursor');

console.log('🧹 Clearing Cursor Cache\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  Make sure Cursor is CLOSED!\n');

const cacheDirs = [
  path.join(CURSOR_DIR, 'Cache'),
  path.join(CURSOR_DIR, 'Code Cache'),
  path.join(CURSOR_DIR, 'GPUCache'),
  path.join(CURSOR_DIR, 'DawnGraphiteCache'),
  path.join(CURSOR_DIR, 'DawnWebGPUCache'),
  path.join(CURSOR_DIR, 'Service Worker'),
];

let cleared = 0;

for (const cacheDir of cacheDirs) {
  if (fs.existsSync(cacheDir)) {
    try {
      console.log(`📂 Clearing: ${path.basename(cacheDir)}...`);
      
      // Delete all files in cache directory
      const files = fs.readdirSync(cacheDir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(cacheDir, file.name);
        try {
          if (file.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          // Skip files we can't delete
        }
      }
      
      console.log(`   ✅ Cleared\n`);
      cleared++;
    } catch (e) {
      console.log(`   ⚠️  Could not clear: ${e.message}\n`);
    }
  }
}

console.log('='.repeat(60));
console.log(`\n✅ Cleared ${cleared} cache directories!`);
console.log('💡 Restart Cursor now - it will rebuild the cache and should show your chats\n');












