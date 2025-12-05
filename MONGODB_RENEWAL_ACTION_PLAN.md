# MongoDB Secret Renewal - Action Plan

**Date:** Current Session  
**Status:** ⚠️ **URGENT - Action Required**  
**Alert:** Organization Service Account Secrets have expired (October 1, 2025)

---

## 📊 **Current Status**

### **Configuration Found:**
- ✅ `.env` file exists (but no MongoDB variables yet)
- ✅ MongoDB packages installed (`mongodb: ^5.9.2`, `mongoose: ^7.8.7`)
- ⚠️ MongoDB connection code not found in current files
- ⚠️ MongoDB likely configured in **Render environment variables** (production)

### **What This Means:**
- MongoDB is set up but connection is configured in deployment environment
- The expired secret is likely in **Render dashboard** environment variables
- Local development may not be using MongoDB yet
- Production services may be failing to connect

---

## 🎯 **Action Plan**

### **Phase 1: Renew Secret in MongoDB Atlas** (5 minutes)

1. **Log into MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/
   - Sign in with Greenways organization account

2. **Navigate to Service Accounts:**
   - Click **"Greenways"** organization (top left)
   - Go to **Settings** → **Service Accounts**
   - Or direct: https://cloud.mongodb.com/v2#/org/serviceAccounts

3. **Find Expired Account:**
   - Look for account with "Expired" status
   - Note the account name

4. **Generate New Secret:**
   - Click on expired account
   - Click **"Rotate Secret"** or **"Generate New Secret"**
   - **COPY SECRET IMMEDIATELY** (won't be shown again!)
   - Save it securely

### **Phase 2: Update Render Environment Variables** (5 minutes)

1. **Access Render Dashboard:**
   - Go to: https://dashboard.render.com/
   - Sign in

2. **Find Your Service:**
   - Look for `energy-calc-backend` service
   - Click on it

3. **Update Environment Variables:**
   - Go to **"Environment"** tab
   - Find MongoDB-related variable:
     - `MONGODB_URI`
     - `MONGO_URI`
     - `DATABASE_URL`
     - `MONGODB_CONNECTION_STRING`
   - Click to edit
   - Update the secret part in connection string:
     ```
     mongodb+srv://username:OLD_SECRET@cluster.mongodb.net/database
     ↓
     mongodb+srv://username:NEW_SECRET@cluster.mongodb.net/database
     ```
   - Click **"Save Changes"**

4. **Restart Service:**
   - Service should auto-restart
   - Or manually trigger: **"Manual Deploy"** → **"Deploy latest commit"**

### **Phase 3: Update Local .env (Optional)** (2 minutes)

If you want to use MongoDB locally:

1. **Edit .env file:**
   ```bash
   # Add MongoDB connection string
   MONGODB_URI=mongodb+srv://username:NEW_SECRET@cluster.mongodb.net/database
   ```

2. **Replace placeholders:**
   - `username` - Your MongoDB username
   - `NEW_SECRET` - The secret you just generated
   - `cluster.mongodb.net` - Your actual cluster URL
   - `database` - Your database name

### **Phase 4: Test Connection** (2 minutes)

1. **Test Script:**
   ```bash
   cd c:\Users\steph\Documents\energy-cal-backend
   node test-mongodb-connection.js
   ```

2. **Check Results:**
   - ✅ Success: "MongoDB connection successful!"
   - ❌ Failure: Check error message and fix

3. **Check Render Logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for MongoDB connection messages
   - Verify no errors

---

## 📋 **Quick Checklist**

### **Before Starting:**
- [ ] Have MongoDB Atlas login credentials ready
- [ ] Have Render dashboard access ready
- [ ] Have a secure place to save the new secret

### **During Renewal:**
- [ ] Logged into MongoDB Atlas
- [ ] Found expired service account
- [ ] Generated new secret
- [ ] **Copied secret immediately** (saved securely)
- [ ] Updated Render environment variables
- [ ] Saved changes in Render
- [ ] Service restarted

### **After Renewal:**
- [ ] Tested connection (local or production)
- [ ] Verified no errors in logs
- [ ] Application working normally
- [ ] Documented where secret is stored

---

## 🔧 **Helper Scripts Created**

### **1. Configuration Checker:**
```bash
node check-mongodb-config.js
```
- Checks for MongoDB configuration
- Shows what's configured and what's missing

### **2. Connection Tester:**
```bash
node test-mongodb-connection.js
```
- Tests MongoDB connection
- Shows detailed error messages if connection fails
- Verifies secret is working

---

## 🚨 **Important Notes**

### **Security:**
- ⚠️ **Never commit secrets to Git**
- ⚠️ **Never share secrets in chat/email**
- ✅ Use environment variables
- ✅ Use password managers for storage

### **Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Components:**
- `username` - Service account username
- `password` - The secret you generated
- `cluster.mongodb.net` - Your MongoDB cluster URL
- `database` - Database name

### **Common Issues:**
1. **Secret not working:** Check for extra spaces, verify username
2. **Connection timeout:** Check IP whitelist in MongoDB Atlas
3. **Authentication failed:** Verify secret was copied correctly
4. **Service not restarting:** Manually trigger deploy in Render

---

## 📞 **Support Resources**

**MongoDB Atlas:**
- Dashboard: https://cloud.mongodb.com/
- Service Accounts: https://cloud.mongodb.com/v2#/org/serviceAccounts
- Documentation: https://docs.atlas.mongodb.com/security/service-accounts/

**Render:**
- Dashboard: https://dashboard.render.com/
- Documentation: https://render.com/docs

**Test Scripts:**
- Config Check: `node check-mongodb-config.js`
- Connection Test: `node test-mongodb-connection.js`

---

## ✅ **Expected Outcome**

After completing these steps:
- ✅ MongoDB secret renewed
- ✅ Render environment variables updated
- ✅ Services reconnected to MongoDB
- ✅ No connection errors
- ✅ Application working normally

---

## 🎯 **Priority**

**URGENT** - Expired secrets mean MongoDB connections are failing. This could affect:
- Production services
- Data synchronization
- Wix integrations
- Any features using MongoDB

**Estimated Time:** 15-20 minutes total

---

**Last Updated:** Current Session  
**Status:** Ready to execute  
**Next Step:** Log into MongoDB Atlas and renew secret







