/**
 * Script to verify your Wix App Token is working correctly
 * 
 * Usage: node scripts/verify-wix-token.js
 * 
 * This script will:
 * 1. Check if WIX_APP_TOKEN is set in .env
 * 2. Test the token by making a simple API call
 * 3. Try to fetch videos from your Greenways Buildings site
 */

require('dotenv').config();

const WIX_APP_TOKEN = process.env.WIX_APP_TOKEN;
const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413';

console.log('🔍 Wix Token Verification');
console.log('========================\n');

// Step 1: Check if token exists
if (!WIX_APP_TOKEN || WIX_APP_TOKEN === 'your_wix_app_token_here') {
  console.log('❌ WIX_APP_TOKEN not found or not configured');
  console.log('\n📝 To fix this:');
  console.log('1. Go to https://dev.wix.com/');
  console.log('2. Sign in → My Apps → Select your app');
  console.log('3. Go to Settings → OAuth → App Token');
  console.log('4. Copy the token');
  console.log('5. Add to .env file: WIX_APP_TOKEN=your_token_here\n');
  process.exit(1);
}

console.log('✅ WIX_APP_TOKEN found in .env');
console.log(`✅ WIX_SITE_ID: ${WIX_SITE_ID}\n`);

// Step 2: Test the token
console.log('🧪 Testing token with Wix API...\n');

async function testToken() {
  try {
    // Test 1: Try to search for videos
    console.log('Test 1: Searching for videos...');
    const response = await fetch('https://www.wixapis.com/site-media/v1/files/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': WIX_APP_TOKEN
      },
      body: JSON.stringify({
        mediaTypes: ['VIDEO'],
        rootFolder: 'MEDIA_ROOT',
        paging: {
          limit: 10
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      console.log(`Error details: ${errorText}\n`);
      
      if (response.status === 401) {
        console.log('💡 This usually means:');
        console.log('   - Token is invalid or expired');
        console.log('   - Token format is incorrect');
        console.log('   - Token needs "Bearer " prefix (check if it already has it)\n');
      } else if (response.status === 403) {
        console.log('💡 This usually means:');
        console.log('   - App doesn\'t have Media Manager read permissions');
        console.log('   - Go to Wix Developer Console → Permissions');
        console.log('   - Enable: "Media Manager: Read"\n');
      }
      
      return false;
    }

    const data = await response.json();
    const videos = data.files || [];
    
    console.log(`✅ Token is valid!`);
    console.log(`✅ Found ${videos.length} video(s) in your Media Manager\n`);
    
    if (videos.length > 0) {
      console.log('📹 Sample videos found:');
      videos.slice(0, 3).forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.displayName || 'Untitled'}`);
        console.log(`      ID: ${video.id}`);
        console.log(`      Type: ${video.mediaType}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No videos found in Media Manager');
      console.log('   This is okay - the token works, you just need to upload videos\n');
    }

    return true;

  } catch (error) {
    console.log(`❌ Network error: ${error.message}\n`);
    console.log('💡 Check your internet connection and try again\n');
    return false;
  }
}

// Run the test
testToken().then(success => {
  if (success) {
    console.log('🎉 Token verification successful!');
    console.log('✅ Your Wix integration is ready to use\n');
    process.exit(0);
  } else {
    console.log('⚠️  Token verification failed');
    console.log('📖 See GET_WIX_APP_TOKEN.md for detailed setup instructions\n');
    process.exit(1);
  }
});


