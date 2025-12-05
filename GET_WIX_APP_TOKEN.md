# How to Get Your Wix App Token

## Step-by-Step Guide

### Step 1: Go to Wix Developers

1. Open your browser and go to: **https://dev.wix.com/**
2. Sign in with your Wix account (the one that owns your Greenways Buildings site)

### Step 2: Access Your App

**Option A: If you already have a Wix App**
1. Click on **"My Apps"** in the top navigation
2. Find and click on your app (or the app you want to use)
3. If you don't have an app yet, see **Option B** below

**Option B: Create a New App (if needed)**
1. Click **"Create App"** or **"New App"**
2. Choose **"Headless"** or **"Custom App"**
3. Fill in:
   - **App Name:** "Greenways Video Integration" (or any name)
   - **App Description:** "Video integration for Greenways membership"
4. Click **"Create"**

### Step 3: Get Your App Token

1. In your app dashboard, go to **"Settings"** (or **"OAuth"**)
2. Look for **"App Token"** or **"Access Token"**
3. You may see:
   - **App Token** (for server-to-server calls) ← **This is what you need!**
   - **OAuth Token** (for user authentication)
4. Click **"Generate"** or **"Copy"** next to the App Token
5. **Important:** Copy the token immediately - you may not be able to see it again!

### Step 4: Configure Your Environment

1. In your project root (`energy-cal-backend`), create or edit `.env` file
2. Add your token:

```env
# Wix API Configuration
WIX_APP_TOKEN=your_app_token_here
WIX_SITE_ID=d9c9c6b1-f79a-49a3-8183-4c5a8e24a413
```

3. **Replace** `your_app_token_here` with the actual token you copied
4. Save the file

### Step 5: Set Permissions

Your app needs permission to read media files. In the Wix Developer Console:

1. Go to **"Permissions"** or **"Scopes"**
2. Make sure these permissions are enabled:
   - ✅ **Media Manager: Read** (`SCOPE.DC-MEDIA.READ-MEDIAMANAGER`)
   - ✅ **Site Media: Read** (if available)

### Step 6: Test It

1. Restart your server:
   ```bash
   node server-new.js
   ```

2. Check the logs - you should see:
   - `✅ Fetched X videos from Wix` (if successful)
   - `⚠️ WIX_APP_TOKEN not configured` (if token is missing)

3. Try accessing videos in your membership section

## Troubleshooting

### "Token not found" or "Invalid token"
- ✅ Make sure the token is in your `.env` file
- ✅ Check for extra spaces or quotes around the token
- ✅ Restart your server after adding the token

### "Permission denied" or "403 Forbidden"
- ✅ Check that your app has Media Manager read permissions
- ✅ Make sure the app is installed on your Greenways Buildings site
- ✅ Verify the site ID matches: `d9c9c6b1-f79a-49a3-8183-4c5a8e24a413`

### "No videos found"
- ✅ Check that you have videos uploaded to your Wix Media Manager
- ✅ Videos must be in the Media Manager (not just embedded from YouTube)
- ✅ Check server logs for specific error messages

## Alternative: Using MCP (For Testing Only)

If you're having trouble with the App Token, you can use MCP tools for testing:

1. Start your MCP server (your `.bat` file)
2. Use MCP tools to fetch videos
3. **Note:** This is for development/testing only, not for production

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to Git
- Keep your App Token secret
- Don't share it publicly
- If compromised, regenerate it immediately in Wix Developer Console

## Need Help?

If you encounter issues:
1. Check the server logs for error messages
2. Verify your token format (should be a long string)
3. Test the API directly using curl (see WIX_VIDEO_SETUP.md)

## Quick Reference

- **Wix Developers:** https://dev.wix.com/
- **Your Site ID:** `d9c9c6b1-f79a-49a3-8183-4c5a8e24a413` (Greenways Buildings)
- **API Endpoint:** `https://www.wixapis.com/site-media/v1/files/search`
- **Required Permission:** Media Manager Read

