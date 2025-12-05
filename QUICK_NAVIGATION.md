# Quick Navigation: Find Your Wix App Credentials

## 🎯 You're Currently On:
- Documentation page showing HOW to use the API

## ✅ What You Need To Do:

### Step 1: Leave the Documentation
- **Close the docs tab** or go to a new tab
- **Go to:** https://dev.wix.com/ (main page, NOT /docs/)

### Step 2: Click "My Apps"
- Look at the **top navigation bar** (not left sidebar)
- Click **"My Apps"** button/link
- **Direct link:** https://dev.wix.com/apps

### Step 3: Select Your App
- You'll see a list of your apps
- **Click on your app name**
- If you don't have an app, click **"Create App"**

### Step 4: Go to Settings
- In your app dashboard, look for **"Settings"** in the left sidebar
- **Click "Settings"**

### Step 5: Find OAuth Section
- In Settings, find **"OAuth"** section
- Click to expand it
- You'll see:
  - **App ID** ← Copy this!
  - **App Secret** ← Copy this!
  - **Instance ID** (may be in a different section)

## 📋 What You Need to Copy:

From Settings → OAuth, copy these values:

1. **App ID** (looks like: `abc123-def456-ghi789`)
2. **App Secret** (looks like: `xyz789-abc123-def456`)
3. **Instance ID** (you may need to check "App Instances" section)

## 🔧 Add to Your .env File:

```env
# Method 1: If you have a direct App Token (less common)
WIX_APP_TOKEN=your_token_here

# Method 2: OAuth (App ID + Secret) - More common
WIX_APP_ID=your_app_id_here
WIX_APP_SECRET=your_app_secret_here
WIX_INSTANCE_ID=your_instance_id_here
```

## 💡 Which Method to Use?

- **Method 1 (App Token):** If you see a pre-generated "App Token" in Settings → OAuth
- **Method 2 (OAuth):** If you see App ID and App Secret (this is more common)

**The code now supports BOTH methods!** Just add whichever credentials you find.

## 🆘 Still Can't Find It?

### Try These Direct Links:
- **My Apps:** https://dev.wix.com/apps
- **Create App:** https://dev.wix.com/apps/create

### Common Issues:
- **"My Apps" not visible?** → Make sure you're logged in
- **No apps listed?** → Click "Create App" first
- **Settings not visible?** → You may need app owner permissions

## ✅ Once You Have the Credentials:

1. Add them to your `.env` file
2. Restart server: `node server-new.js`
3. Test: `node scripts/verify-wix-token.js`

The system will automatically use whichever method you configure!


