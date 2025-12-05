/**
 * Simple test to verify OAuth authentication works
 * Tests with a basic API call first
 */

require('dotenv').config();

const WIX_APP_ID = process.env.WIX_APP_ID;
const WIX_APP_SECRET = process.env.WIX_APP_SECRET;
const WIX_INSTANCE_ID = process.env.WIX_INSTANCE_ID;

console.log('🔍 Simple Wix OAuth Test');
console.log('========================\n');

async function testSimple() {
  try {
    // Step 1: Get OAuth token
    console.log('🔐 Getting OAuth token...');
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
      console.log(`❌ Token failed: ${tokenResponse.status}`);
      console.log(errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Token created!\n');

    // Step 2: Test with Get App Instance (should work with basic permissions)
    console.log('🧪 Testing with Get App Instance API...');
    const instanceResponse = await fetch('https://www.wixapis.com/apps/v1/instance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (instanceResponse.ok) {
      const instanceData = await instanceResponse.json();
      console.log('✅ Get App Instance works!');
      console.log(`   Site: ${instanceData.site?.siteDisplayName || 'N/A'}`);
      console.log(`   Permissions: ${JSON.stringify(instanceData.instance?.permissions || [])}\n`);
    } else {
      const errorText = await instanceResponse.text();
      console.log(`❌ Get App Instance failed: ${instanceResponse.status}`);
      console.log(errorText.substring(0, 200));
    }

    // Step 3: Try Media Manager with different endpoint
    console.log('\n📹 Testing Media Manager API...');
    const mediaResponse = await fetch('https://www.wixapis.com/site-media/v1/files/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        rootFolder: 'MEDIA_ROOT',
        paging: {
          limit: 1
        }
      })
    });

    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      console.log('✅ Media Manager API works!');
      console.log(`   Found ${mediaData.files?.length || 0} files\n`);
    } else {
      const errorText = await mediaResponse.text();
      console.log(`❌ Media Manager failed: ${mediaResponse.status}`);
      if (errorText.includes('403') || errorText.includes('Forbidden')) {
        console.log('\n💡 403 Forbidden - Permission issue');
        console.log('   The permission might need time to propagate');
        console.log('   Or the permission scope name might be different\n');
      } else {
        console.log(errorText.substring(0, 200));
      }
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testSimple();

