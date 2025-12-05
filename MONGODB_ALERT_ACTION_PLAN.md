# MongoDB Organization Service Account Secrets - Action Plan

**Alert Date:** October 1, 2025  
**Status:** ⚠️ **EXPIRED SECRETS**  
**Alert Type:** Organization Service Account Secrets have expired

---

## 🔍 **Current Situation**

### **Alert Details:**
- **Organization:** Greenways
- **Issue:** Organization Service Account Secrets have expired
- **Created:** 2025/10/01 11:41 GMT
- **Status:** OPEN

### **Current Project Status:**
- ✅ **MongoDB is installed** (`package.json` shows `mongodb: ^5.9.2` and `mongoose: ^7.8.7`)
- ✅ **This codebase also uses SQLite** (`energy_calculator_central.db`, `members.db`)
- ⚠️ **MongoDB is likely used for:**
  - Wix integration and member data sync
  - Production data storage (Render deployment)
  - External service integrations
  - Future planned features
- ⚠️ **MongoDB connection code not found in current files** - may be in:
  - Environment variables (`.env` file)
  - Deployment platform (Render) environment variables
  - External service configurations

---

## 🎯 **Action Required**

### **Step 1: Identify MongoDB Usage**

**Questions to Answer:**
1. **Is MongoDB actually being used?**
   - Check Wix integration services
   - Check other Greenways projects
   - Review external service dependencies

2. **Where is MongoDB configured?**
   - Check Wix site settings
   - Check external service configurations
   - Review deployment platforms (Render, etc.)

3. **What services depend on MongoDB?**
   - Wix API integrations
   - External data sync services
   - Third-party integrations

### **Step 2: Access MongoDB Atlas**

1. **Log into MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/
   - Sign in with Greenways organization account

2. **Navigate to Organization Settings:**
   - Click on your organization (Greenways)
   - Go to **Settings** → **Service Accounts**

3. **Check Service Account Status:**
   - View all service accounts
   - Identify expired secrets
   - Note which services use each account

### **Step 3: Renew Service Account Secrets**

**Option A: Rotate Existing Secret (Recommended)**
1. Find the expired service account
2. Click **"Rotate Secret"** or **"Generate New Secret"**
3. Copy the new secret immediately (it won't be shown again)
4. Update all services using this secret

**Option B: Create New Service Account**
1. If the old account is no longer needed, create a new one
2. Generate new API keys
3. Update all dependent services
4. Delete the old account (if safe to do so)

---

## 🔧 **How to Update Service Account Secrets**

### **If MongoDB is Used for Wix Integration:**

1. **Check Wix Site Settings:**
   - Log into Wix dashboard
   - Check **Settings** → **Integrations** → **MongoDB**
   - Look for API keys or connection strings

2. **Update Connection Strings:**
   - Replace old secret in connection string
   - Format: `mongodb+srv://<username>:<new-secret>@cluster.mongodb.net/`

3. **Test Connection:**
   - Verify Wix can still connect to MongoDB
   - Check for any error messages

### **If MongoDB is Used for External Services:**

1. **Identify All Services:**
   - Check Render environment variables
   - Check other deployment platforms
   - Review API integrations

2. **Update Environment Variables:**
   ```bash
   # Example: Update in Render dashboard
   MONGODB_URI=mongodb+srv://username:NEW_SECRET@cluster.mongodb.net/database
   ```

3. **Restart Services:**
   - Restart any services using MongoDB
   - Verify connections are working

---

## 📋 **Checklist**

### **Before Renewing:**
- [ ] Identify which services use MongoDB
- [ ] Document all current MongoDB connections
- [ ] Check if MongoDB is actually needed
- [ ] Verify which service account is expired

### **During Renewal:**
- [ ] Log into MongoDB Atlas
- [ ] Navigate to Service Accounts
- [ ] Generate new secret
- [ ] **Copy secret immediately** (save securely)
- [ ] Update all dependent services
- [ ] Test each service connection

### **After Renewal:**
- [ ] Verify all services are working
- [ ] Check for any error logs
- [ ] Update documentation with new secret location
- [ ] Set reminder for next expiration (if applicable)

---

## 🚨 **Important Notes**

### **Security Best Practices:**
1. **Never commit secrets to Git**
   - Use environment variables
   - Use secret management services
   - Keep secrets in `.env` files (not in Git)

2. **Rotate Secrets Regularly:**
   - Set calendar reminders
   - Document expiration dates
   - Have a rotation process

3. **Backup Before Changes:**
   - Document current configuration
   - Test in staging first
   - Have rollback plan

### **If MongoDB is Not Used:**
- If MongoDB is not actually being used:
  1. Verify no services depend on it
  2. Consider deleting the service account
  3. Close the MongoDB Atlas organization (if unused)
  4. This will stop the alerts

---

## 🔍 **How to Verify MongoDB Usage**

### **Check This Codebase:**
```bash
# Search for MongoDB references
grep -r "mongodb" . --exclude-dir=node_modules
grep -r "MongoDB" . --exclude-dir=node_modules
grep -r "mongo" . --exclude-dir=node_modules
```

**Result:** ✅ No MongoDB references found in this codebase

### **Check External Services:**
1. **Render Dashboard:**
   - Check environment variables
   - Look for `MONGODB_URI` or similar

2. **Wix Dashboard:**
   - Check integrations
   - Review API connections

3. **Other Deployment Platforms:**
   - Check all hosting services
   - Review CI/CD configurations

---

## 📞 **MongoDB Atlas Support**

### **If You Need Help:**
- **MongoDB Support:** https://www.mongodb.com/support
- **Atlas Documentation:** https://docs.atlas.mongodb.com/
- **Service Accounts Guide:** https://docs.atlas.mongodb.com/security/service-accounts/

### **Common Issues:**
- **Can't access Atlas:** Check organization permissions
- **Secret not working:** Verify it was copied correctly
- **Connection errors:** Check IP whitelist and network access

---

## ✅ **Next Steps**

1. **IMMEDIATE (URGENT):**
   - [ ] Log into MongoDB Atlas (https://cloud.mongodb.com/)
   - [ ] Navigate to Organization → Settings → Service Accounts
   - [ ] Identify expired service account
   - [ ] Generate new secret (copy immediately!)
   - [ ] Update environment variables:
     - [ ] Check `.env` file (local)
     - [ ] Check Render dashboard environment variables (production)
     - [ ] Check any other deployment platforms
   - [ ] Restart services after update
   - [ ] Test MongoDB connections

2. **Short-term:**
   - [ ] Verify all services are working
   - [ ] Check for connection errors in logs
   - [ ] Document where secret is stored
   - [ ] Update any connection strings in code

3. **Long-term:**
   - [ ] Document MongoDB usage and purpose
   - [ ] Set up secret rotation reminders (before next expiration)
   - [ ] Review if MongoDB is actively used or can be removed

---

## 📝 **Notes**

- **This codebase uses SQLite**, not MongoDB
- **MongoDB alert is likely for:**
  - Separate Wix integration service
  - External data storage
  - Another Greenways project
  - Legacy/unused service

- **If MongoDB is not used:** Consider closing the account to stop alerts

---

**Last Updated:** Current Session  
**Status:** Action Required - Expired Secrets Need Renewal

