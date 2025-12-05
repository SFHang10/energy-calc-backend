# Where to Find Your Wix App Token

## Quick Visual Guide

Unfortunately, MCP tools cannot retrieve your App Token directly (it's a security feature). But here's exactly where to find it:

## Step-by-Step with Screenshots Guide

### Step 1: Go to Wix Developers
- **URL:** https://dev.wix.com/
- **Sign in** with your Wix account

### Step 2: Access Your App
- Click **"My Apps"** in the top navigation bar
- You'll see a list of your apps
- **Click on your app** (or create one if you don't have one)

### Step 3: Navigate to OAuth Settings
- In your app dashboard, look for **"Settings"** in the left sidebar
- Click **"Settings"** → **"OAuth"** (or **"Authentication"**)
- You should see sections like:
  - **OAuth Settings**
  - **App Token** ← **This is what you need!**
  - **OAuth Token** (different - not what you need)

### Step 4: Get Your App Token
- Look for **"App Token"** section
- You'll see either:
  - A **"Generate"** button (if no token exists)
  - A **"Copy"** button or token displayed (if token exists)
- **Click "Copy"** or select and copy the token
- ⚠️ **Important:** Copy it immediately - you may not see it again!

### Step 5: Token Format
Your token should look like one of these:
- `abc123def456ghi789...` (long string)
- `Bearer abc123def456...` (with Bearer prefix)

**Note:** If your token doesn't have "Bearer " at the start, you may need to add it in your code, but usually Wix provides it with "Bearer " already included.

## What If I Don't See "App Token"?

### Option A: You Need to Create an App
1. In Wix Developers, click **"Create App"**
2. Choose **"Headless"** or **"Custom App"**
3. Fill in app name and description
4. Click **"Create"**
5. Then follow Steps 3-4 above

### Option B: You're Looking at the Wrong Section
- Make sure you're in **"Settings"** → **"OAuth"**
- Not in **"OAuth Token"** (that's different)
- Look specifically for **"App Token"** or **"Server Token"**

## Verify Your Token Works

Once you've added the token to your `.env` file, run:

```bash
node scripts/verify-wix-token.js
```

This will:
- ✅ Check if token is configured
- ✅ Test the token with Wix API
- ✅ Show you how many videos are available
- ✅ Give you specific error messages if something's wrong

## Common Issues

### "Token not found"
- Make sure `.env` file exists in project root
- Check token has no extra spaces or quotes
- Format: `WIX_APP_TOKEN=your_token_here` (no spaces around `=`)

### "401 Unauthorized"
- Token might be invalid or expired
- Regenerate token in Wix Developer Console
- Check if token needs "Bearer " prefix

### "403 Forbidden"
- App doesn't have required permissions
- Go to **Permissions** tab in Wix Developer Console
- Enable: **"Media Manager: Read"** (`SCOPE.DC-MEDIA.READ-MEDIAMANAGER`)

## Still Need Help?

1. **Check the verification script output:**
   ```bash
   node scripts/verify-wix-token.js
   ```

2. **See detailed guide:**
   - `GET_WIX_APP_TOKEN.md` - Full step-by-step guide
   - `QUICK_WIX_TOKEN_SETUP.md` - 5-minute quick start

3. **Test your token manually:**
   ```bash
   curl -X POST https://www.wixapis.com/site-media/v1/files/search \
     -H "Authorization: YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"mediaTypes":["VIDEO"]}'
   ```

## Security Reminder

⚠️ **Never:**
- Commit your `.env` file to Git
- Share your token publicly
- Include token in screenshots or documentation

✅ **Always:**
- Keep your token secret
- Regenerate if compromised
- Use environment variables


