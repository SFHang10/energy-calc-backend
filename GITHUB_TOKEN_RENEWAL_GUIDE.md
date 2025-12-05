# GitHub Token Renewal Guide - Render Deployment

**Date:** November 17, 2025  
**Issue:** GitHub Personal Access Token "Energy Calc Backend Deploy" expires in ~21 hours  
**Status:** Action Required

---

## 🚨 **What This Means**

Your Render deployment uses a GitHub Personal Access Token to:
- Connect to your GitHub repository
- Pull code for automatic deployments
- Deploy updates when you push to GitHub

**If the token expires:**
- ❌ Render won't be able to connect to GitHub
- ❌ Automatic deployments will stop working
- ❌ Manual deployments may fail
- ⚠️ Your site will continue running, but new deployments won't work

---

## ✅ **Solution: Regenerate Token & Update Render**

### **Step 1: Generate New GitHub Token**

1. **Click the link from GitHub email:**
   ```
   https://github.com/settings/tokens/2670664733/regenerate
   ```
   Or go to: `https://github.com/settings/tokens`

2. **Or create a new token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `Energy Calc Backend Deploy` (or similar)
   - Expiration: Choose appropriate duration (90 days, 1 year, or no expiration)
   - **Scopes needed:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (if you use GitHub Actions)

3. **Generate and copy the token:**
   - ⚠️ **IMPORTANT:** Copy the token immediately - you won't see it again!
   - Save it somewhere secure temporarily

---

### **Step 2: Update Token in Render**

1. **Log into Render Dashboard:**
   - Go to: https://dashboard.render.com
   - Sign in to your account

2. **Navigate to your service:**
   - Find "energy-calc-backend" (or your service name)
   - Click on it to open settings

3. **Update the GitHub connection:**
   - Go to **Settings** tab
   - Scroll to **"Build & Deploy"** section
   - Look for **"GitHub"** or **"Repository"** settings
   - Click **"Connect GitHub"** or **"Update Connection"**

4. **Enter new token:**
   - When prompted, paste your new GitHub token
   - Save/Update the connection

5. **Alternative method (if above doesn't work):**
   - Go to Render Account Settings
   - Navigate to **"Connected Accounts"** or **"GitHub"**
   - Disconnect the old connection
   - Reconnect with the new token

---

### **Step 3: Verify It Works**

1. **Test the connection:**
   - In Render dashboard, try to trigger a manual deploy
   - Or push a small change to GitHub and see if auto-deploy works

2. **Check deployment logs:**
   - Go to **"Events"** or **"Logs"** tab in Render
   - Look for successful GitHub connection messages
   - Verify no authentication errors

---

## 📋 **Quick Checklist**

- [ ] Generate new GitHub token (or regenerate existing)
- [ ] Copy token immediately (save securely)
- [ ] Log into Render dashboard
- [ ] Navigate to service settings
- [ ] Update GitHub connection with new token
- [ ] Test deployment (manual or auto)
- [ ] Verify no errors in logs
- [ ] Delete old token from GitHub (optional, for security)

---

## 🔒 **Security Best Practices**

### **Token Settings:**
- ✅ Use minimum required scopes (`repo` is usually enough)
- ✅ Set appropriate expiration (90 days or 1 year recommended)
- ✅ Use descriptive name: "Energy Calc Backend Deploy"
- ✅ Don't share token publicly
- ✅ Delete old tokens after updating Render

### **Token Storage:**
- ❌ Don't commit tokens to Git
- ❌ Don't store in code files
- ✅ Store in Render's secure settings only
- ✅ Use environment variables if needed

---

## 🆘 **Troubleshooting**

### **Problem: Can't find where to update token in Render**

**Solution:**
1. Go to Render Dashboard → Your Service → Settings
2. Look for "Build & Deploy" section
3. If you see "Disconnect" next to GitHub, click it and reconnect
4. Or go to Account Settings → Connected Accounts

### **Problem: Token regenerated but Render still using old one**

**Solution:**
1. Disconnect GitHub connection in Render
2. Wait 30 seconds
3. Reconnect with new token
4. This forces Render to refresh the connection

### **Problem: Deployments failing after token update**

**Solution:**
1. Check Render logs for specific error
2. Verify token has `repo` scope
3. Verify repository is accessible with token
4. Try disconnecting and reconnecting

### **Problem: Can't access Render dashboard**

**Solution:**
- Use the email link from Render (if you have one)
- Or go to: https://dashboard.render.com
- Use "Forgot Password" if needed

---

## 📝 **Token Details**

**Current Token:**
- Name: "Energy Calc Backend Deploy"
- Token ID: 2670664733
- Expires: ~21 hours from notification (Nov 17, 2025 ~11:02 PM)
- Scope: `repo`

**Required Scopes for Render:**
- ✅ `repo` - Full control of private repositories
- ✅ `workflow` - Update GitHub Action workflows (if used)

---

## 🔄 **Preventing Future Expiration**

### **Option 1: Set Longer Expiration**
- When creating token, choose:
  - 90 days (recommended)
  - 1 year
  - No expiration (less secure, but no renewals needed)

### **Option 2: Set Calendar Reminder**
- Set reminder 1 week before expiration
- Gives you time to renew before it expires

### **Option 3: Use GitHub App (Advanced)**
- Render supports GitHub Apps
- More secure than personal access tokens
- Better permission management

---

## ✅ **After Renewal**

Once you've updated the token:

1. **Verify deployment works:**
   - Make a small change (add a comment to a file)
   - Push to GitHub
   - Check if Render auto-deploys

2. **Monitor for 24 hours:**
   - Check Render logs
   - Verify no authentication errors
   - Confirm deployments are working

3. **Delete old token (optional):**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Delete the expired/old token
   - This improves security

---

## 📞 **Support Resources**

**GitHub Support:**
- Token issues: https://github.com/settings/tokens
- Help: https://github.com/contact

**Render Support:**
- Dashboard: https://dashboard.render.com
- Documentation: https://render.com/docs
- Support: https://render.com/support

---

## 🎯 **Summary**

**Action Required:**
1. ✅ Regenerate GitHub token (use link from email or create new)
2. ✅ Update token in Render dashboard
3. ✅ Test deployment
4. ✅ Verify it works

**Time Required:** ~5-10 minutes  
**Impact if Not Done:** Deployments will stop working after token expires  
**Current Status:** Token expires in ~21 hours - **Action needed soon!**

---

**Last Updated:** November 17, 2025  
**Next Review:** After token renewal





