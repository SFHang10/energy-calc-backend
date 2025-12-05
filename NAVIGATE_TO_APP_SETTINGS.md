# How to Navigate to Your App Settings in Wix Developer Console

## You're Currently On:
- **Documentation page** (`dev.wix.com/docs/...`)
- This shows HOW to use the API, not WHERE to find your credentials

## What You Need To Do:

### Step 1: Go to Wix Developer Console (Not Documentation)

1. **Close or navigate away from the docs page**
2. **Go to:** https://dev.wix.com/ (main page)
3. **Look for:** "My Apps" button/link in the top navigation
   - It's usually in the top right or main navigation bar
   - NOT in the left sidebar (that's for docs)

### Step 2: Access Your App

**Option A: If You Have an App**
1. Click **"My Apps"** 
2. You'll see a list of your apps
3. **Click on your app name** to open it

**Option B: If You Don't See "My Apps" or No Apps Listed**
1. You may need to **create an app first**
2. Look for **"Create App"** or **"New App"** button
3. Choose **"Headless"** or **"Custom App"**
4. Fill in app name (e.g., "Greenways Video Integration")
5. Click **"Create"**

### Step 3: Find Settings/OAuth

Once you're IN your app dashboard (not the docs):

1. **Look for a left sidebar** with menu items like:
   - Dashboard
   - **Settings** ← Click this!
   - Permissions
   - OAuth
   - etc.

2. **OR** look for tabs at the top:
   - Overview
   - **Settings** ← Click this!
   - Permissions
   - etc.

3. **Click "Settings"**

### Step 4: Find OAuth Section

In Settings, you should see:

- **OAuth** section (click to expand)
- Or **"Authentication"** section
- Look for:
  - **App ID** (you'll need this)
  - **App Secret** (you'll need this)
  - **App Token** (if available - this is what we want!)

## Important: Two Different Approaches

Based on the documentation you're viewing, Wix uses **App ID + App Secret** to **CREATE** access tokens, not retrieve a pre-existing "App Token".

### For Your Video Integration, You Have Two Options:

#### Option 1: Use App ID + App Secret (Recommended)
- Get **App ID** and **App Secret** from Settings → OAuth
- Your backend will use these to create access tokens automatically
- More secure and follows Wix best practices

#### Option 2: Use Pre-generated App Token (If Available)
- Some Wix setups have a pre-generated "App Token"
- Look for it in Settings → OAuth
- If you see it, you can use it directly

## Quick Navigation Checklist

- [ ] Left the documentation page
- [ ] Went to https://dev.wix.com/ (main console)
- [ ] Clicked "My Apps" (top navigation)
- [ ] Selected your app
- [ ] Clicked "Settings" (left sidebar or top tabs)
- [ ] Found "OAuth" section
- [ ] Located App ID and App Secret

## Still Can't Find It?

### Check These Common Issues:

1. **"My Apps" not visible?**
   - Make sure you're logged in
   - Try: https://dev.wix.com/apps (direct link)

2. **No apps listed?**
   - You need to create an app first
   - Click "Create App" button

3. **Settings not visible?**
   - Make sure you're the app owner/admin
   - Some roles don't have access to settings

4. **OAuth section missing?**
   - Your app might be using a different auth method
   - Check if you see "Authentication" instead

## Alternative: Direct Links

Try these direct links (replace with your actual app ID if you know it):

- **My Apps:** https://dev.wix.com/apps
- **Create App:** https://dev.wix.com/apps/create

## What You're Looking For

In Settings → OAuth, you should see something like:

```
App ID: abc123-def456-ghi789
App Secret: xyz789-abc123-def456
```

**Copy both of these** - you'll need them for the video integration!


