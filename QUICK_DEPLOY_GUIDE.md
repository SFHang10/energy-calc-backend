# 🚀 Quick Deploy Guide - Greenways Market

**Wix Site:** Greenways Market (`cfa82ec2-a075-4152-9799-6a1dd5c01ef4`)  
**Status:** Ready to Deploy  
**Files:** Database + Images verified ✅

---

## 📦 What to Deploy

1. **`FULL-DATABASE-5554.json`** (14.24 MB)
   - Location: Where your `routes/products.js` loads it
   - Used by: All product API endpoints

2. **`Product Placement/` folder** (33 images, 2.54 MB)
   - Location: Web-accessible folder (HTTP accessible)
   - Used by: Product pages displaying images

---

## 🎯 Step 1: Find Your Production Backend

Your Wix site likely embeds the calculator/widget from your backend API. To find where it runs:

### **Method 1: Check Your Wix Site**
1. Open your live Wix site: `greenways-market.wixsite.com` (or your domain)
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Visit a page with the calculator
5. Look for API calls - note the domain/URL
6. **That's your production backend location!**

### **Method 2: Check Deployment Config**
Look for files like:
- `.gitignore` (might show deployment service)
- `package.json` (deploy scripts)
- `Procfile` (Heroku)
- `railway.json` (Railway)
- `.env` or `config` files

### **Method 3: Where Do You Normally Upload Files?**
- FTP/SFTP client?
- Git repository?
- Web dashboard?
- Cloud storage?

---

## 🛠️ Step 2: Deploy Based on Your Setup

### **If Backend is on Same Server/Computer:**
✅ **Files are already there!**
- Just verify `FULL-DATABASE-5554.json` is in correct location
- Verify `Product Placement/` folder is web-accessible
- Test and you're done!

### **If Using Heroku:**
```bash
# Option 1: Via Git
git add FULL-DATABASE-5554.json
git add "Product Placement/"
git commit -m "Add product images database"
git push heroku main

# Option 2: Via Dashboard
# - Go to Heroku Dashboard
# - Select your app
# - Use File Manager or Config Vars to upload
```

**Note:** For images on Heroku, consider:
- Using Heroku's ephemeral filesystem (requires re-upload on restart)
- Using external storage (AWS S3, Cloudinary) - better for production

### **If Using Railway:**
```bash
railway link
railway up
# Files will be uploaded via Git push
# Or use Railway Dashboard → File Upload
```

### **If Using Your Own Server (SSH/SFTP):**
```bash
# Via SCP (Mac/Linux)
scp FULL-DATABASE-5554.json user@your-server:/path/to/backend/
scp -r "Product Placement" user@your-server:/path/to/backend/

# Via WinSCP (Windows)
# 1. Connect to server
# 2. Navigate to backend directory
# 3. Drag & drop both files
```

### **If Using FTP:**
1. Open FTP client (FileZilla, WinSCP, etc.)
2. Connect to your server
3. Navigate to backend root directory
4. Upload:
   - `FULL-DATABASE-5554.json`
   - `Product Placement/` folder (entire folder)

### **If Using Wix File Manager:**
1. Go to Wix Dashboard
2. Media Manager or File Manager
3. Upload `FULL-DATABASE-5554.json`
4. Upload images from `Product Placement/`
5. Update image URLs in database if needed

**Note:** Wix File Manager gives you URLs like `https://static.wixstatic.com/media/...`
- You may need to update `imageUrl` paths in database after upload
- Or use Wix Media API to get proper URLs

---

## ✅ Step 3: Verify Deployment

### **Test Checklist:**
1. **Test Database:**
   ```bash
   # Visit your API endpoint:
   https://your-backend-url.com/api/products?limit=1
   # Should return product with imageUrl field
   ```

2. **Test Images:**
   ```bash
   # Check if image is accessible:
   https://your-backend-url.com/Product%20Placement/Motor.jpg
   # Should display image (adjust path as needed)
   ```

3. **Test Product Page:**
   - Visit your Wix site
   - Open a product page
   - Image should display
   - Calculator should work

4. **Check Console:**
   - Open DevTools (F12)
   - Look for errors
   - Should see normal API calls

---

## 🔧 Common Issues & Fixes

### **Images Not Loading:**
- **Issue:** Image paths wrong
- **Fix:** Check `imageUrl` paths match production folder structure
- **Fix:** Ensure `Product Placement/` folder is web-accessible

### **404 Errors:**
- **Issue:** Database file in wrong location
- **Fix:** Verify `routes/products.js` can find `FULL-DATABASE-5554.json`
- **Fix:** Check file permissions

### **Calculator Not Working:**
- **Issue:** Unlikely - calculator uses different fields
- **Fix:** Verify database JSON is valid: `node verify-before-deploy.js`
- **Fix:** Check API endpoints respond correctly

---

## 📋 Deployment Checklist

### **Before:**
- [x] Run `node verify-before-deploy.js` ✅
- [x] Files verified ✅
- [ ] **Identify production backend location**

### **During:**
- [ ] Backup current production database
- [ ] Upload `FULL-DATABASE-5554.json`
- [ ] Upload `Product Placement/` folder
- [ ] Verify file locations

### **After:**
- [ ] Test API endpoint returns imageUrl
- [ ] Test product page displays image
- [ ] Test calculator widget
- [ ] Check console for errors
- [ ] Monitor for 30 minutes

---

## 💬 Tell Me:

To proceed with exact commands, please tell me:

1. **Where does your backend run?**
   - Heroku, Railway, your server, same as dev, etc.

2. **How do you normally upload files?**
   - Git, FTP, SSH, dashboard, etc.

3. **What's your production API URL?**
   - Found via DevTools Network tab

**Once I know this, I'll provide exact deployment commands!** 🚀

---

**Current Status:**
- ✅ Files ready: Database (14.24 MB) + Images (2.54 MB)
- ✅ Wix site identified: Greenways Market
- ⏳ **Waiting: Production backend location**



**Wix Site:** Greenways Market (`cfa82ec2-a075-4152-9799-6a1dd5c01ef4`)  
**Status:** Ready to Deploy  
**Files:** Database + Images verified ✅

---

## 📦 What to Deploy

1. **`FULL-DATABASE-5554.json`** (14.24 MB)
   - Location: Where your `routes/products.js` loads it
   - Used by: All product API endpoints

2. **`Product Placement/` folder** (33 images, 2.54 MB)
   - Location: Web-accessible folder (HTTP accessible)
   - Used by: Product pages displaying images

---

## 🎯 Step 1: Find Your Production Backend

Your Wix site likely embeds the calculator/widget from your backend API. To find where it runs:

### **Method 1: Check Your Wix Site**
1. Open your live Wix site: `greenways-market.wixsite.com` (or your domain)
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Visit a page with the calculator
5. Look for API calls - note the domain/URL
6. **That's your production backend location!**

### **Method 2: Check Deployment Config**
Look for files like:
- `.gitignore` (might show deployment service)
- `package.json` (deploy scripts)
- `Procfile` (Heroku)
- `railway.json` (Railway)
- `.env` or `config` files

### **Method 3: Where Do You Normally Upload Files?**
- FTP/SFTP client?
- Git repository?
- Web dashboard?
- Cloud storage?

---

## 🛠️ Step 2: Deploy Based on Your Setup

### **If Backend is on Same Server/Computer:**
✅ **Files are already there!**
- Just verify `FULL-DATABASE-5554.json` is in correct location
- Verify `Product Placement/` folder is web-accessible
- Test and you're done!

### **If Using Heroku:**
```bash
# Option 1: Via Git
git add FULL-DATABASE-5554.json
git add "Product Placement/"
git commit -m "Add product images database"
git push heroku main

# Option 2: Via Dashboard
# - Go to Heroku Dashboard
# - Select your app
# - Use File Manager or Config Vars to upload
```

**Note:** For images on Heroku, consider:
- Using Heroku's ephemeral filesystem (requires re-upload on restart)
- Using external storage (AWS S3, Cloudinary) - better for production

### **If Using Railway:**
```bash
railway link
railway up
# Files will be uploaded via Git push
# Or use Railway Dashboard → File Upload
```

### **If Using Your Own Server (SSH/SFTP):**
```bash
# Via SCP (Mac/Linux)
scp FULL-DATABASE-5554.json user@your-server:/path/to/backend/
scp -r "Product Placement" user@your-server:/path/to/backend/

# Via WinSCP (Windows)
# 1. Connect to server
# 2. Navigate to backend directory
# 3. Drag & drop both files
```

### **If Using FTP:**
1. Open FTP client (FileZilla, WinSCP, etc.)
2. Connect to your server
3. Navigate to backend root directory
4. Upload:
   - `FULL-DATABASE-5554.json`
   - `Product Placement/` folder (entire folder)

### **If Using Wix File Manager:**
1. Go to Wix Dashboard
2. Media Manager or File Manager
3. Upload `FULL-DATABASE-5554.json`
4. Upload images from `Product Placement/`
5. Update image URLs in database if needed

**Note:** Wix File Manager gives you URLs like `https://static.wixstatic.com/media/...`
- You may need to update `imageUrl` paths in database after upload
- Or use Wix Media API to get proper URLs

---

## ✅ Step 3: Verify Deployment

### **Test Checklist:**
1. **Test Database:**
   ```bash
   # Visit your API endpoint:
   https://your-backend-url.com/api/products?limit=1
   # Should return product with imageUrl field
   ```

2. **Test Images:**
   ```bash
   # Check if image is accessible:
   https://your-backend-url.com/Product%20Placement/Motor.jpg
   # Should display image (adjust path as needed)
   ```

3. **Test Product Page:**
   - Visit your Wix site
   - Open a product page
   - Image should display
   - Calculator should work

4. **Check Console:**
   - Open DevTools (F12)
   - Look for errors
   - Should see normal API calls

---

## 🔧 Common Issues & Fixes

### **Images Not Loading:**
- **Issue:** Image paths wrong
- **Fix:** Check `imageUrl` paths match production folder structure
- **Fix:** Ensure `Product Placement/` folder is web-accessible

### **404 Errors:**
- **Issue:** Database file in wrong location
- **Fix:** Verify `routes/products.js` can find `FULL-DATABASE-5554.json`
- **Fix:** Check file permissions

### **Calculator Not Working:**
- **Issue:** Unlikely - calculator uses different fields
- **Fix:** Verify database JSON is valid: `node verify-before-deploy.js`
- **Fix:** Check API endpoints respond correctly

---

## 📋 Deployment Checklist

### **Before:**
- [x] Run `node verify-before-deploy.js` ✅
- [x] Files verified ✅
- [ ] **Identify production backend location**

### **During:**
- [ ] Backup current production database
- [ ] Upload `FULL-DATABASE-5554.json`
- [ ] Upload `Product Placement/` folder
- [ ] Verify file locations

### **After:**
- [ ] Test API endpoint returns imageUrl
- [ ] Test product page displays image
- [ ] Test calculator widget
- [ ] Check console for errors
- [ ] Monitor for 30 minutes

---

## 💬 Tell Me:

To proceed with exact commands, please tell me:

1. **Where does your backend run?**
   - Heroku, Railway, your server, same as dev, etc.

2. **How do you normally upload files?**
   - Git, FTP, SSH, dashboard, etc.

3. **What's your production API URL?**
   - Found via DevTools Network tab

**Once I know this, I'll provide exact deployment commands!** 🚀

---

**Current Status:**
- ✅ Files ready: Database (14.24 MB) + Images (2.54 MB)
- ✅ Wix site identified: Greenways Market
- ⏳ **Waiting: Production backend location**




















