# MongoDB Secret Renewal - Step-by-Step Guide

**Status:** ⚠️ **URGENT - Secrets Expired**  
**Date:** October 1, 2025

---

## 🎯 **Quick Start - 5 Steps**

1. **Log into MongoDB Atlas** → https://cloud.mongodb.com/
2. **Go to Service Accounts** → Organization → Settings → Service Accounts
3. **Generate New Secret** → Click "Rotate Secret" on expired account
4. **Copy Secret** → Save it immediately (won't be shown again!)
5. **Update Environment Variables** → In `.env` file and Render dashboard

---

## 📋 **Detailed Steps**

### **Step 1: Access MongoDB Atlas**

1. Open your browser
2. Go to: **https://cloud.mongodb.com/**
3. Sign in with your **Greenways** organization account
4. You should see the MongoDB Atlas dashboard

**If you can't access:**
- Check you're using the correct account
- Try password reset if needed
- Contact MongoDB support if organization access is an issue

---

### **Step 2: Navigate to Service Accounts**

1. In MongoDB Atlas, click on **"Greenways"** organization (top left)
2. Click **"Settings"** (gear icon or from dropdown)
3. Click **"Service Accounts"** in the left sidebar
4. You should see a list of service accounts

**Direct Link (if logged in):**
- https://cloud.mongodb.com/v2#/org/serviceAccounts

---

### **Step 3: Find Expired Account**

1. Look through the service accounts list
2. Find the one with **"Expired"** status or red warning
3. Note the account name (e.g., "Greenways Service Account")
4. Click on it to view details

**What to look for:**
- Account name
- Description (what it's used for)
- Expiration date
- API keys/secrets section

---

### **Step 4: Generate New Secret**

**Option A: Rotate Existing Secret (Recommended)**

1. Click on the expired service account
2. Find the **"API Keys"** or **"Secrets"** section
3. Click **"Rotate Secret"** or **"Generate New Secret"** button
4. **IMPORTANT:** Copy the new secret immediately!
   - It will look like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - You won't be able to see it again after closing
   - Save it in a secure place (password manager, secure note)

**Option B: Create New Service Account**

1. Click **"Create Service Account"** button
2. Give it a name (e.g., "Greenways Service Account 2025")
3. Set permissions (usually "Organization Owner" or "Project Owner")
4. Generate API key
5. Copy the secret immediately
6. Update all services to use new account
7. Delete old account (after verifying everything works)

---

### **Step 5: Update Environment Variables**

#### **A. Local Development (.env file)**

1. **Check if .env file exists:**
   ```bash
   # In project root: c:\Users\steph\Documents\energy-cal-backend
   # Look for .env file
   ```

2. **If .env exists, edit it:**
   - Open `.env` file
   - Find line with `MONGODB_URI` or `MONGO_URI` or `DATABASE_URL`
   - Update the password/secret part:
     ```
     # Old format:
     MONGODB_URI=mongodb+srv://username:OLD_SECRET@cluster.mongodb.net/database
     
     # New format:
     MONGODB_URI=mongodb+srv://username:NEW_SECRET@cluster.mongodb.net/database
     ```
   - Save the file

3. **If .env doesn't exist, create it:**
   - Copy `config-template.env` to `.env`
   - Add MongoDB connection string:
     ```
     MONGODB_URI=mongodb+srv://username:NEW_SECRET@cluster.mongodb.net/database
     ```
   - Replace:
     - `username` with your MongoDB username
     - `NEW_SECRET` with the secret you just copied
     - `cluster.mongodb.net` with your actual cluster URL
     - `database` with your database name

#### **B. Production (Render Dashboard)**

1. **Go to Render Dashboard:**
   - URL: https://dashboard.render.com/
   - Sign in with your account

2. **Find Your Service:**
   - Look for `energy-calc-backend` or similar
   - Click on it

3. **Go to Environment Tab:**
   - Click **"Environment"** in the left sidebar
   - Look for MongoDB-related variables:
     - `MONGODB_URI`
     - `MONGO_URI`
     - `DATABASE_URL`
     - `MONGODB_CONNECTION_STRING`

4. **Update the Variable:**
   - Click on the variable name
   - Edit the value
   - Update the secret part (password) in the connection string
   - Click **"Save Changes"**

5. **Restart Service:**
   - Go to **"Events"** or **"Logs"** tab
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Or the service may auto-restart

---

### **Step 6: Test Connection**

#### **Option A: Use Test Script**

1. **Run the test script:**
   ```bash
   cd c:\Users\steph\Documents\energy-cal-backend
   node test-mongodb-connection.js
   ```

2. **Check the output:**
   - ✅ If successful: "MongoDB connection successful!"
   - ❌ If failed: Check error message and fix

#### **Option B: Manual Test**

1. **Check server logs:**
   - Start your server: `node server-new.js`
   - Look for MongoDB connection messages
   - Check for any errors

2. **Check Render logs:**
   - Go to Render dashboard
   - Click on your service
   - Go to **"Logs"** tab
   - Look for MongoDB connection errors

---

## 🔧 **Troubleshooting**

### **Problem: Can't Access MongoDB Atlas**

**Solutions:**
- Verify you're using the correct account
- Check organization permissions
- Try different browser or incognito mode
- Contact MongoDB support

### **Problem: Can't Find Service Accounts**

**Solutions:**
- Make sure you're in the **Organization** view (not Project view)
- Check you have organization admin permissions
- Look in **Settings** → **Service Accounts**

### **Problem: Secret Not Working After Update**

**Solutions:**
- Verify secret was copied correctly (no extra spaces)
- Check username matches service account name
- Verify connection string format is correct
- Check IP whitelist allows your connections
- Verify network access settings in MongoDB Atlas

### **Problem: Connection Timeout**

**Solutions:**
- Check MongoDB cluster status (should be running)
- Verify IP whitelist includes your IP or 0.0.0.0/0 (all IPs)
- Check network access settings
- Verify connection string format

### **Problem: Authentication Failed**

**Solutions:**
- Double-check username and secret are correct
- Verify no extra spaces in connection string
- Check service account has correct permissions
- Verify database name is correct

---

## ✅ **Verification Checklist**

After renewal, verify:

- [ ] New secret generated in MongoDB Atlas
- [ ] Secret copied and saved securely
- [ ] `.env` file updated (if exists locally)
- [ ] Render environment variables updated
- [ ] Services restarted
- [ ] Connection test successful
- [ ] No errors in server logs
- [ ] No errors in Render logs
- [ ] Application working normally

---

## 📞 **Need Help?**

**MongoDB Support:**
- Documentation: https://docs.atlas.mongodb.com/security/service-accounts/
- Support: https://www.mongodb.com/support
- Community: https://www.mongodb.com/community/forums

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://greenways-service:abc123-def456-ghi789@cluster0.xxxxx.mongodb.net/energy_calc?retryWrites=true&w=majority
```

---

## 🎯 **Quick Reference**

**MongoDB Atlas:** https://cloud.mongodb.com/  
**Service Accounts:** Organization → Settings → Service Accounts  
**Render Dashboard:** https://dashboard.render.com/  
**Test Script:** `node test-mongodb-connection.js`  
**Config Check:** `node check-mongodb-config.js`

---

**Last Updated:** Current Session  
**Status:** Ready to execute







