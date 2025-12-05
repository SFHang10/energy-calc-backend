/**
 * Script to test Wix OAuth authentication and video fetching
 * 
 * Usage: node scripts/test-wix-oauth.js
 * 
 * This script will:
 * 1. Use App ID + Secret + Instance ID to create OAuth access token
 * 2. Test fetching videos from Wix Media Manager
 * 3. Verify the integration is working
 */

require('dotenv').config();

const WIX_APP_ID = process.env.WIX_APP_ID;
const WIX_APP_SECRET = process.env.WIX_APP_SECRET;
const WIX_INSTANCE_ID = process.env.WIX_INSTANCE_ID;
const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413';

console.log('🔍 Testing Wix OAuth Integration');
console.log('================================\n');

// Check credentials
if (!WIX_APP_ID || WIX_APP_ID === 'your_app_id_here') {
  console.log('❌ WIX_APP_ID not found in .env');
  process.exit(1);
}

if (!WIX_APP_SECRET || WIX_APP_SECRET === 'your_app_secret_here') {
  console.log('❌ WIX_APP_SECRET not found in .env');
  process.exit(1);
}

if (!WIX_INSTANCE_ID || WIX_INSTANCE_ID === 'your_instance_id_here') {
  console.log('❌ WIX_INSTANCE_ID not found in .env');
  process.exit(1);
}

console.log('✅ Credentials found:');
console.log(`   App ID: ${WIX_APP_ID}`);
console.log(`   App Secret: ${WIX_APP_SECRET.substring(0, 8)}...`);
console.log(`   Instance ID: ${WIX_INSTANCE_ID}`);
console.log(`   Site ID: ${WIX_SITE_ID}\n`);

async function testOAuth() {
  try {
    // Step 1: Get OAuth access token
    console.log('🔐 Step 1: Creating OAuth access token...');
    const tokenResponse = await fetch('https://www.wixapis.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        instance_id: WIX_INSTANCE_ID
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log(`❌ Failed to create access token`);
      console.log(`   Status: ${tokenResponse.status} ${tokenResponse.statusText}`);
      console.log(`   Error: ${errorText}\n`);
      
      if (tokenResponse.status === 401 || tokenResponse.status === 403) {
        console.log('💡 This usually means:');
        console.log('   - App ID, Secret, or Instance ID is incorrect');
        console.log('   - App is not installed on the site');
        console.log('   - App permissions are not set correctly\n');
      }
      
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Access token created successfully!\n');

    // Step 2: Test fetching videos
    console.log('📹 Step 2: Fetching videos from Wix Media Manager...');
    const videoResponse = await fetch('https://www.wixapis.com/site-media/v1/files/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        mediaTypes: ['VIDEO'],
        rootFolder: 'MEDIA_ROOT',
        paging: {
          limit: 10
        }
      })
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.log(`❌ Failed to fetch videos`);
      console.log(`   Status: ${videoResponse.status} ${videoResponse.statusText}`);
      console.log(`   Error: ${errorText}\n`);
      
      if (videoResponse.status === 403) {
        console.log('💡 This usually means:');
        console.log('   - App doesn\'t have "Media Manager: Read" permission');
        console.log('   - Go to Wix Developer Console → Permissions');
        console.log('   - Enable: "Media Manager: Read"\n');
      }
      
      return false;
    }

    const videoData = await videoResponse.json();
    const videos = videoData.files || [];
    
    console.log(`✅ Successfully fetched ${videos.length} video(s)!\n`);
    
    if (videos.length > 0) {
      console.log('📹 Sample videos found:');
      videos.slice(0, 5).forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.displayName || 'Untitled'}`);
        console.log(`      ID: ${video.id}`);
        console.log(`      Type: ${video.mediaType || 'VIDEO'}`);
        if (video.thumbnailUrl) {
          console.log(`      Thumbnail: ${video.thumbnailUrl.substring(0, 50)}...`);
        }
        console.log('');
      });
    } else {
      console.log('ℹ️  No videos found in Media Manager');
      console.log('   This is okay - the integration works, you just need to upload videos\n');
    }

    return true;

  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    console.log('💡 Check your internet connection and try again\n');
    return false;
  }
}

// Run the test
testOAuth().then(success => {
  if (success) {
    console.log('🎉 OAuth integration test successful!');
    console.log('✅ Your Wix video integration is ready to use\n');
    console.log('📝 Next steps:');
    console.log('   1. Start your server: node server-new.js');
    console.log('   2. Log into membership section');
    console.log('   3. Click "Watch Videos" to see videos from Wix\n');
    process.exit(0);
  } else {
    console.log('⚠️  OAuth integration test failed');
    console.log('   Please check the error messages above\n');
    process.exit(1);
  }
});

