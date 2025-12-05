# Render GitHub Configuration - Reference Guide

**Date:** November 17, 2025  
**Issue:** GitHub Personal Access Token expiration notification  
**Status:** ✅ Resolved - Render uses OAuth App, not personal access token

---

## 🎯 **Summary**

Render uses **GitHub OAuth App integration**, not a Personal Access Token. The expiring token notification was likely for a different service or a legacy token not used by Render.

**Current Status:** ✅ Render GitHub connection is working correctly via OAuth App.

---

## 📍 **Where to Find Render GitHub Settings**

### **Path 1: Account Settings (Recommended)**
1. Go to: https://dashboard.render.com
2. Click your profile icon (top right)
3. Select **"Account Settings"**
4. Click **"Account Security"** in the right sidebar
5. Scroll to **"Git Deployment Credentials"** section

### **Path 2: Service Settings**
1. Go to your service (e.g., "energy-calc-backend")
2. Click **"Settings"** tab
3. Scroll to **"Build & Deploy"** section
4. Find **"Repository"** and **"Git Credentials"** sections

---

## 🔍 **Current Configuration**

### **GitHub OAuth App Status:**
- **App Name:** Render
- **Installed:** 4 months ago (as of Nov 17, 2025)
- **Developer:** renderinc
- **Status:** ✅ Active and configured
- **Repository Access:** All repositories (or selected repositories)

### **Git Credentials in Render:**
- **Type:** GitHub OAuth App (not Personal Access Token)
- **Username:** SFHang10
- **Email:** steph.hang10@greenways.org.uk
- **Repositories Accessible:**
  - `SFHang10/energy-calc-backend` (last activity: 1d ago)
  - `SFHang10/energy-calc-frontend` (last activity: Jul 5)
  - `SFHang10/greenways-market` (last activity: Apr 21)

---

## 🔧 **How Render GitHub Integration Works**

### **OAuth App vs Personal Access Token:**

**Render Uses: OAuth App** ✅
- Managed through GitHub's OAuth App system
- No manual token management needed
- Auto-refreshes permissions
- More secure (scoped permissions)

**Personal Access Token** ❌ (Not used by Render)
- Manual token management
- Requires periodic renewal
- Less secure (broader permissions)
- The expiring token was likely for another service

---

## 🛠️ **Troubleshooting Guide**

### **Problem: Deployments Not Working**

**Step 1: Check Render Dashboard**
1. Go to your service in Render
2. Check **"Events"** or **"Logs"** tab
3. Look for GitHub connection errors

**Step 2: Verify GitHub Connection**
1. Go to: Account Settings → Account Security → Git Deployment Credentials
2. Verify GitHub credential shows your repositories
3. Check if credential is still connected

**Step 3: Reconnect if Needed**
1. In Git Deployment Credentials:
   - Click three dots (⋮) next to GitHub credential
   - Click **"Disconnect credential"**
   - Click **"Add credential"** → Select **"GitHub"**
   - Re-authenticate via OAuth

**Step 4: Check GitHub App**
1. Go to: https://github.com/settings/installations
2. Find "Render" app
3. Verify it's still installed and active
4. Check repository access permissions

---

### **Problem: "Update Credentials" Button Greyed Out**

**Solution:**
- This happens when using "My Credentials" (account-level)
- Update at Account Settings level, not service level
- Go to: Account Settings → Account Security → Git Deployment Credentials

---

### **Problem: GitHub Token Expiring Notification**

**What to Check:**
1. **Is it for Render?**
   - Check if Render uses OAuth (it does) ✅
   - If OAuth is working, token is likely for another service

2. **Is Render still deploying?**
   - Test by pushing a small change
   - Check if auto-deploy works
   - If yes, token isn't needed for Render

3. **Where else might token be used?**
   - Other CI/CD services
   - Local scripts
   - Other integrations
   - Legacy/unused token

---

## 📋 **Configuration Locations**

### **Render Dashboard:**
- **Account Settings:** https://dashboard.render.com/u/[your-id]/settings
- **Service Settings:** https://dashboard.render.com/[service-name]/settings

### **GitHub Settings:**
- **OAuth Apps:** https://github.com/settings/developers
- **Installed Apps:** https://github.com/settings/installations
- **Personal Access Tokens:** https://github.com/settings/tokens

### **Render GitHub App:**
- **Direct Link:** https://github.com/settings/installations/[app-id]
- Shows: Permissions, repository access, installation date

---

## ✅ **Verification Checklist**

When checking if GitHub integration is working:

- [ ] Render dashboard shows GitHub credential connected
- [ ] GitHub credential shows correct repositories
- [ ] Test deployment works (push to GitHub → auto-deploys)
- [ ] Render logs show no GitHub connection errors
- [ ] GitHub App is installed and active
- [ ] Repository access permissions are correct

---

## 🔄 **How to Update/Reconnect GitHub**

### **Method 1: Reconnect via Render (Recommended)**
1. Account Settings → Account Security → Git Deployment Credentials
2. Click three dots (⋮) next to GitHub
3. Click **"Disconnect credential"**
4. Click **"Add credential"** → **"GitHub"**
5. Authorize via GitHub OAuth flow
6. Verify repositories appear

### **Method 2: Configure via GitHub**
1. Go to: https://github.com/settings/installations
2. Find "Render" app
3. Click **"Configure"**
4. Review/update permissions
5. Save changes

### **Method 3: Reinstall GitHub App**
1. Go to: https://github.com/settings/installations
2. Find "Render" app
3. Click **"Uninstall"**
4. In Render, disconnect credential
5. Reconnect (will trigger new OAuth flow)

---

## 📝 **Key Points to Remember**

1. **Render uses OAuth App, not Personal Access Token**
   - No manual token management needed
   - OAuth handles authentication automatically

2. **Token expiration notifications may not affect Render**
   - If Render uses OAuth, token isn't needed
   - Test deployments to verify

3. **Git Credentials are account-level**
   - Updated in Account Settings, not service settings
   - Applies to all services using "My Credentials"

4. **Repository access is managed in GitHub**
   - Check: https://github.com/settings/installations
   - Render app shows which repositories it can access

5. **Always test after changes**
   - Push a small change to GitHub
   - Verify Render auto-deploys
   - Check logs for any errors

---

## 🆘 **If Nothing Works**

### **Last Resort Steps:**
1. **Check Render Status:** https://status.render.com
2. **Check GitHub Status:** https://www.githubstatus.com
3. **Contact Render Support:**
   - Dashboard → Help → Contact Support
   - Or: https://render.com/support
4. **Check Service Logs:**
   - Service → Logs tab
   - Look for specific error messages

---

## 📚 **Useful Links**

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **GitHub OAuth Apps:** https://github.com/settings/developers
- **GitHub Installed Apps:** https://github.com/settings/installations
- **Render Support:** https://render.com/support

---

## 🎯 **Quick Reference**

**Current Setup:**
- ✅ GitHub OAuth App: Active
- ✅ Render Credential: Connected (SFHang10)
- ✅ Repositories: 3 accessible
- ✅ Auto-deploy: Enabled

**If Deployments Fail:**
1. Check Account Settings → Git Deployment Credentials
2. Verify GitHub App is installed
3. Test with a small commit
4. Check Render logs for errors
5. Reconnect if needed

---

**Last Updated:** November 17, 2025  
**Next Review:** When deployment issues occur or GitHub integration changes





