# Install "Greenways Market Place" App on "Greenways Buildings" Site

## 🎯 Goal
Install your app to get the **Instance ID** needed for video integration.

## 📋 What You Have
- **App ID:** `0933a02d-5312-42a8-9e67-28dfcf2aedde`
- **App Secret:** `028561ce-feaf-4a9a-9e80-e1844b446a84`
- **App Name:** "Greenways Market Place"
- **Target Site:** "Greenways Buildings" (ID: `d9c9c6b1-f79a-49a3-8183-4c5a8e24a413`)

## 🚀 Step-by-Step Installation

### Step 1: Open Your App in Developer Console

1. Go to: **https://dev.wix.com/apps**
2. Find **"Greenways Market Place"** in your apps list
3. **Click on it** to open the app dashboard

**Direct Link (if you know the app ID):**
```
https://manage.wix.com/apps/0933a02d-5312-42a8-9e67-28dfcf2aedde
```

### Step 2: Navigate to Installation/Testing Section

Once in your app dashboard, look for one of these options:

**Option A: "Test App" or "Test" Tab**
- Look for a **"Test"** button or tab
- This allows you to test your app on a site

**Option B: "Distribute" or "Publish" Section**
- Look for **"Distribute"** in the left sidebar
- Or **"Publish to App Market"** button
- This may have installation options

**Option C: "Manage" → "Installations"**
- Click **"Manage"** in the left sidebar
- Look for **"Installations"** or **"Installed Sites"**
- If you see "Greenways Buildings" already listed, the app is installed! ✅
- Click on it to see the **Instance ID**

### Step 3: Install on "Greenways Buildings" Site

1. In the Test/Distribute section, you should see:
   - A dropdown or list of your sites
   - Or a button to "Install on Site"
   - Or "Test on Site"

2. **Select "Greenways Buildings"** from the list
   - Site ID: `d9c9c6b1-f79a-49a3-8183-4c5a8e24a413`

3. **Click "Install"** or **"Test"** button

4. Wait for installation to complete (usually a few seconds)

### Step 4: Get the Instance ID

After installation, you'll see the **Instance ID** in one of these places:

**Location 1: Installation Confirmation**
- A success message showing the Instance ID
- Copy it immediately!

**Location 2: Manage → Installations**
- Go to **"Manage"** → **"Installations"**
- Click on **"Greenways Buildings"**
- The Instance ID should be displayed there

**Location 3: App Instance Details**
- Look for a section showing "App Instance" or "Instance Details"
- The Instance ID will be listed there

## 📝 What Instance ID Looks Like

Similar format to your App ID:
```
abc123-def456-ghi789-jkl012-mno345
```

## ✅ After You Get Instance ID

1. **Copy the Instance ID**
2. **Add it to your `.env` file:**
   ```env
   WIX_APP_ID=0933a02d-5312-42a8-9e67-28dfcf2aedde
   WIX_APP_SECRET=028561ce-feaf-4a9a-9e80-e1844b446a84
   WIX_INSTANCE_ID=your_instance_id_here
   WIX_SITE_ID=d9c9c6b1-f79a-49a3-8183-4c5a8e24a413
   ```

3. **Test the integration:**
   ```bash
   node server-new.js
   node scripts/verify-wix-token.js
   ```

## 🆘 Troubleshooting

### Can't Find "Test" or "Install" Button?
- Make sure you're in the **app dashboard** (not the docs)
- Check if your app status is "Draft" - you may need to publish it first
- Look for **"Develop"** section - installation might be there

### App Already Installed?
- Go to **"Manage"** → **"Installations"**
- If "Greenways Buildings" is listed, click on it
- The Instance ID should be visible there

### Don't See "Manage" Section?
- Your app might be in a different state
- Try looking for **"Settings"** → **"OAuth"** → might have instance info
- Or check **"Overview"** tab for installation status

### Still Stuck?
- Take a screenshot of what you see in the app dashboard
- Share it and I can guide you to the exact location

## 🎯 Quick Checklist

- [ ] Opened app dashboard at `manage.wix.com/apps/0933a02d-5312-42a8-9e67-28dfcf2aedde`
- [ ] Found "Test", "Distribute", or "Manage" section
- [ ] Selected "Greenways Buildings" site
- [ ] Clicked "Install" or "Test"
- [ ] Copied the Instance ID
- [ ] Added to `.env` file
- [ ] Tested with verification script

## 💡 Alternative: Check if Already Installed

Before installing, check if it's already installed:

1. Go to **"Manage"** → **"Installations"**
2. Look for "Greenways Buildings" in the list
3. If it's there, click on it to get the Instance ID

This saves time if the app was already installed previously!

