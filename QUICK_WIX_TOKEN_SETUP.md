# Quick Setup: Wix App Token (5 Minutes)

## 🚀 Fast Track Guide

### Step 1: Get Your Token (2 minutes)

1. **Go to:** https://dev.wix.com/
2. **Sign in** with your Wix account
3. **Click:** "My Apps" → Select your app (or create one)
4. **Go to:** Settings → OAuth → **App Token**
5. **Copy** the token (it looks like: `abc123def456...`)

### Step 2: Add to Your Project (1 minute)

1. **Open** `.env` file in your project root
   - If it doesn't exist, copy `config-template.env` to `.env`

2. **Add these lines:**
   ```env
   WIX_APP_TOKEN=paste_your_token_here
   WIX_SITE_ID=d9c9c6b1-f79a-49a3-8183-4c5a8e24a413
   ```

3. **Replace** `paste_your_token_here` with your actual token

4. **Save** the file

### Step 3: Restart Server (1 minute)

```bash
# Stop your server (Ctrl+C)
# Then restart:
node server-new.js
```

### Step 4: Verify It Works (1 minute)

1. **Check server logs** - you should see:
   - ✅ `Fetched X videos from Wix` (success!)
   - ⚠️ `WIX_APP_TOKEN not configured` (token missing)

2. **Test in browser:**
   - Log into membership section
   - Click "Watch Videos"
   - Videos should load from your Wix site!

## 🎯 That's It!

Your videos will now be fetched from the Greenways Buildings Wix site automatically.

## ❓ Troubleshooting

**"Token not found"**
- Make sure `.env` file exists in project root
- Check token has no extra spaces
- Restart server after adding token

**"Permission denied"**
- In Wix Developer Console → Permissions
- Enable: "Media Manager: Read"

**Need more help?**
- See `GET_WIX_APP_TOKEN.md` for detailed guide
- Check `WIX_VIDEO_SETUP.md` for full documentation

