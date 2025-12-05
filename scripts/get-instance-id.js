/**
 * Script to retrieve the Instance ID for your Wix app
 * 
 * Usage: node scripts/get-instance-id.js
 * 
 * This script will:
 * 1. Use your App ID and App Secret to authenticate
 * 2. Query Wix API to find app installations
 * 3. Display the Instance ID for your site
 */

require('dotenv').config();

const WIX_APP_ID = process.env.WIX_APP_ID || '0933a02d-5312-42a8-9e67-28dfcf2aedde';
const WIX_APP_SECRET = process.env.WIX_APP_SECRET || '028561ce-feaf-4a9a-9e80-e1844b446a84';
const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413'; // Greenways Buildings

console.log('🔍 Finding Wix App Instance ID');
console.log('==============================\n');

// Check if credentials are set
if (!WIX_APP_ID || WIX_APP_ID === 'your_app_id_here') {
  console.log('❌ WIX_APP_ID not found in .env');
  console.log('   Add: WIX_APP_ID=0933a02d-5312-42a8-9e67-28dfcf2aedde\n');
  process.exit(1);
}

if (!WIX_APP_SECRET || WIX_APP_SECRET === 'your_app_secret_here') {
  console.log('❌ WIX_APP_SECRET not found in .env');
  console.log('   Add: WIX_APP_SECRET=028561ce-feaf-4a9a-9e80-e1844b446a84\n');
  process.exit(1);
}

console.log('✅ App ID:', WIX_APP_ID);
console.log('✅ App Secret:', WIX_APP_SECRET.substring(0, 8) + '...');
console.log('✅ Target Site ID:', WIX_SITE_ID);
console.log('');

async function getInstanceId() {
  try {
    console.log('🔐 Step 1: Getting access token...');
    
    // First, we need to get an access token
    // For app management, we might need to use a different endpoint
    // Let's try the app management OAuth endpoint
    
    // Note: This might not work without Instance ID, but let's try
    const tokenResponse = await fetch('https://www.wixapis.com/app-management/v1/oauth/access-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET
        // Note: instance_id is usually required, but let's see if this works
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('⚠️  OAuth token request failed (this is expected)');
      console.log(`   Status: ${tokenResponse.status}`);
      console.log(`   Error: ${errorText}\n`);
      
      // Try alternative approach: Query installed apps on the site
      console.log('🔄 Trying alternative approach: Querying installed apps on site...\n');
      return await queryInstalledApps();
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Got access token\n');

    // Now try to query app instances
    console.log('🔍 Step 2: Querying app instances...');
    
    // Try to get app instance for the site
    const instanceResponse = await fetch(`https://www.wixapis.com/apps/v1/instance?siteId=${WIX_SITE_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (instanceResponse.ok) {
      const instanceData = await instanceResponse.json();
      if (instanceData.instanceId) {
        console.log('✅ Found Instance ID!');
        console.log('========================\n');
        console.log(`Instance ID: ${instanceData.instanceId}\n`);
        console.log('📝 Add this to your .env file:');
        console.log(`WIX_INSTANCE_ID=${instanceData.instanceId}\n`);
        return instanceData.instanceId;
      }
    }

    // If that didn't work, try listing all instances
    console.log('🔄 Trying to list all app instances...\n');
    return await listAllInstances(accessToken);

  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    console.log('💡 Trying alternative method...\n');
    return await queryInstalledApps();
  }
}

async function listAllInstances(accessToken) {
  try {
    // Try to query app instances - this endpoint might not exist, but worth trying
    const response = await fetch('https://www.wixapis.com/apps/v1/instances', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 App instances found:');
      console.log(JSON.stringify(data, null, 2));
      
      // Look for our site
      if (data.instances) {
        const ourInstance = data.instances.find(inst => inst.siteId === WIX_SITE_ID);
        if (ourInstance) {
          console.log('\n✅ Found Instance ID!');
          console.log(`Instance ID: ${ourInstance.instanceId}\n`);
          return ourInstance.instanceId;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Could not list instances:', error.message);
  }
  
  return null;
}

async function queryInstalledApps() {
  console.log('📋 Alternative: Checking installed apps on the site...');
  console.log('   (This requires site-level authentication)\n');
  
  console.log('💡 Manual Steps to Find Instance ID:');
  console.log('=====================================\n');
  console.log('Since the API requires the Instance ID to authenticate,');
  console.log('you\'ll need to find it manually:\n');
  console.log('1. Go to: https://manage.wix.com/apps/0933a02d-5312-42a8-9e67-28dfcf2aedde');
  console.log('2. Click "Manage" in the left sidebar');
  console.log('3. Look for "Installations" or "Installed Sites"');
  console.log('4. Click on your site to see the Instance ID\n');
  console.log('OR:\n');
  console.log('1. In Wix Studio, go to "Manage Apps"');
  console.log('2. Click on "Greenways Market Place"');
  console.log('3. Check the URL or page details for Instance ID\n');
  console.log('OR:\n');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Network tab');
  console.log('3. Navigate to your app in Developer Console');
  console.log('4. Look for API calls containing "instance" or "instanceId"\n');
  
  return null;
}

// Run the script
getInstanceId().then(instanceId => {
  if (instanceId) {
    console.log('🎉 Success! Instance ID found.');
    console.log('\n📝 Next steps:');
    console.log('1. Add WIX_INSTANCE_ID to your .env file');
    console.log('2. Restart your server');
    console.log('3. Run: node scripts/verify-wix-token.js\n');
    process.exit(0);
  } else {
    console.log('⚠️  Could not automatically retrieve Instance ID');
    console.log('   Please follow the manual steps above\n');
    process.exit(1);
  }
});

