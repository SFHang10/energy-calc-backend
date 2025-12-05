# Using "Distribute App" to Install on Your Site

## ✅ Yes, You Can Press "Distribute App"

**Important:** You don't need to publish to the App Market! You can create an install link just for your own site.

## 🎯 Step-by-Step Process

### Step 1: Click "Distribute App"

1. In your app dashboard, click **"Distribute"** in the left sidebar
2. Or click **"Distribute App"** button if you see it

### Step 2: Create Install Link (Not App Market Listing)

You should see options like:

**Option A: "Share Install Link"**
- This creates a private link to install your app
- Perfect for installing on your own sites
- Does NOT publish to App Market

**Option B: "Install on Site"**
- Direct option to install on a specific site
- Select "Greenways Buildings" from the list

**Option C: "Publish to App Market"**
- ⚠️ **Skip this** - you don't need to publish publicly
- Only use if you want to make it available to others

### Step 3: Install on "Greenways Buildings"

1. If you see a site selector, choose **"Greenways Buildings"**
   - Site ID: `d9c9c6b1-f79a-49a3-8183-4c5a8e24a413`

2. Click **"Install"** or follow the install link

3. Wait for installation to complete

### Step 4: Get Instance ID

After installation, the Instance ID will appear in one of these places:

**Location 1: Installation Confirmation**
- Success message showing the Instance ID
- Copy it immediately!

**Location 2: Manage → Installations**
- Go to **"Manage"** → **"Installations"** in left sidebar
- Click on **"Greenways Buildings"**
- Instance ID will be displayed there

## 📝 What You're Looking For

The Instance ID looks like:
```
abc123-def456-ghi789-jkl012-mno345
```

## ⚠️ Important Notes

1. **You can keep your app private** - distributing doesn't mean publishing publicly
2. **Install link is private** - only you can use it
3. **No App Market listing required** - skip that step if you see it
4. **You can uninstall later** - if needed, you can remove it from the site

## ✅ After Installation

Once you have the Instance ID:

1. **Add to `.env` file:**
   ```env
   WIX_APP_ID=0933a02d-5312-42a8-9e67-28dfcf2aedde
   WIX_APP_SECRET=028561ce-feaf-4a9a-9e80-e1844b446a84
   WIX_INSTANCE_ID=your_instance_id_here
   WIX_SITE_ID=d9c9c6b1-f79a-49a3-8183-4c5a8e24a413
   ```

2. **Test it:**
   ```bash
   node server-new.js
   node scripts/verify-wix-token.js
   ```

## 🆘 If You Get Stuck

- **Can't find install option?** Look for "Share Install Link" or "Install on Site"
- **See "Publish to App Market"?** Skip it - you don't need that
- **Installation fails?** Make sure you have permission on the "Greenways Buildings" site

## 💡 Quick Summary

✅ **DO:** Click "Distribute" → Create install link → Install on your site  
❌ **DON'T:** Publish to App Market (unless you want to make it public)

