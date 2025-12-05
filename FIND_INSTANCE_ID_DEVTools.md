# Find Instance ID Using Browser DevTools

## 🎯 Quick Method: Use Browser Developer Tools

Since the Instance ID isn't visible in the UI, we can find it in the browser's network requests.

## Step-by-Step Instructions

### Step 1: Open Developer Console
1. Go to: `https://manage.wix.com/apps/0933a02d-5312-42a8-9e67-28dfcf2aedde/home`
2. Make sure you're logged in

### Step 2: Open Browser DevTools
1. Press **F12** (or right-click → "Inspect")
2. Click the **"Network"** tab
3. Make sure it's recording (red circle should be visible)

### Step 3: Trigger a Request
1. Click **"Test App"** → **"Test on dev site"** (or any action in the Developer Console)
2. Or navigate to different sections (Manage, Distribute, etc.)

### Step 4: Find the Instance ID
1. In the Network tab, look for requests to:
   - `wixapis.com/apps/v1/instance`
   - `wixapis.com/app-management`
   - Any request containing "instance" in the name

2. Click on one of these requests

3. Look at:
   - **Response** tab → Look for `"instanceId"` in the JSON
   - **Headers** tab → Check the URL or request body
   - **Payload** tab → Check if instanceId is in the request

### Step 5: Copy the Instance ID
- The Instance ID will look like: `abc123-def456-ghi789-jkl012-mno345`
- Copy it and add to your `.env` file

## Alternative: Check the URL

Sometimes the Instance ID appears in the URL when you're viewing installation details:
- Look for URLs like: `.../instance/[INSTANCE_ID]` or `...?instanceId=[INSTANCE_ID]`

## Alternative: Check Console Tab

1. In DevTools, go to the **"Console"** tab
2. Type: `window.location.href` and press Enter
3. Check if the Instance ID is in the URL

## What the Instance ID Looks Like

Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## After You Find It

1. Add to `.env`:
   ```env
   WIX_INSTANCE_ID=your_instance_id_here
   ```

2. Test it:
   ```bash
   node scripts/verify-wix-token.js
   ```

## Still Can't Find It?

If you can't find it in DevTools, try:
1. Install the app again using "Test App" → "Test on dev site"
2. Watch the Network tab during installation
3. The Instance ID should appear in the installation confirmation response

