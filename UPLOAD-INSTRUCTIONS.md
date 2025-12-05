# How to Upload the Product Qualification Portal to Your Website

## 📤 Quick Upload Steps

### Step 1: Choose Your Files
You need **2 files**:
- ✅ `product-qualification-search-v2.html` (the portal)
- ✅ `schemes.json` (the database)

Both are in: `C:\Users\steph\Documents\energy-cal-backend\`

---

### Step 2: Upload to Your Website

#### **If Using FTP/File Manager:**
1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Open File Manager or connect via FTP
3. Navigate to your website's root or a subfolder
4. Upload both files:
   - `product-qualification-search-v2.html`
   - `schemes.json`
5. Make sure they're in the SAME folder

#### **If Using Wix:**
1. Go to Wix Editor
2. Click "+" to add a page
3. Choose "Blank Page" and name it "Product Grants"
4. Add an HTML iframe element
5. Use the HTML upload option or connect via Velo
6. Upload both files to the Media Manager

#### **If Using WordPress:**
1. Go to WordPress Admin → Media → Add New
2. Upload both files
3. Copy the file URLs
4. Create a new page or post
5. Add a shortcode or custom HTML to load the portal

#### **If Using Custom Server:**
```bash
# Via FTP
sftp user@yoursite.com
cd public_html
put product-qualification-search-v2.html
put schemes.json
exit
```

---

### Step 3: Access Your Portal

After uploading, access it at:
```
https://yourwebsite.com/product-qualification-search-v2.html
```

Or if you uploaded to a subfolder:
```
https://yourwebsite.com/grants/product-qualification-search-v2.html
```

---

## 📁 Recommended Folder Structure

```
your-website/
├── product-qualification-search-v2.html   ← Upload this
├── schemes.json                           ← Upload this
└── ... (other website files)
```

**Important:** Both files MUST be in the same folder!

---

## 🎯 After Upload

### Test It Works:
1. Open your website + `product-qualification-search-v2.html`
2. Try searching for "heat pump"
3. You should see ISDE scheme appear
4. Click "Check for Updates" button to test

### Customize (Optional):
1. Download `schemes.json`
2. Edit it (add/remove schemes)
3. Upload the updated version
4. Portal will detect changes automatically

---

## 🔗 How to Link to It

### Option 1: Direct Link
Add to your website navigation:
```
<a href="/product-qualification-search-v2.html">Find Grants & Schemes</a>
```

### Option 2: Embed (Iframe)
Add to any page:
```html
<iframe 
  src="/product-qualification-search-v2.html" 
  width="100%" 
  height="1200px"
  frameborder="0">
</iframe>
```

### Option 3: Button on Homepage
```html
<div class="cta-section">
  <h2>Find Grants for Your Products</h2>
  <p>Search any green product to see grants, subsidies, and schemes</p>
  <a href="/product-qualification-search-v2.html" class="btn">Search Now</a>
</div>
```

---

## 🎨 Integration Ideas

### Add to Navigation Menu:
```
Home | Products | Grants Search | Contact
                    ↑
              Link to portal here
```

### Add to Product Pages:
```html
<!-- On each product page -->
<div class="grant-checker">
  <p>Is this product eligible for grants?</p>
  <a href="/product-qualification-search-v2.html?search=solar+panel">Check Grants</a>
</div>
```

### Sidebar Widget:
```html
<div class="sidebar-widget">
  <h3>💰 Find Grants</h3>
  <p>Search for grants and schemes</p>
  <a href="/product-qualification-search-v2.html">Search Now</a>
</div>
```

---

## ⚠️ Important Notes

1. **Same Folder Required**
   - HTML and JSON must be in the same folder
   - If JSON is missing, portal uses built-in fallback data

2. **HTTPS Required**
   - Portal uses Fetch API
   - Works on HTTPS or localhost
   - May have issues on plain HTTP

3. **No Database Needed**
   - Everything is static files
   - No backend required
   - Works on any hosting

---

## 🐛 Troubleshooting

### Problem: "Loading..." never stops
**Solution:** Make sure `schemes.json` is uploaded to the same folder

### Problem: Shows "No schemes found"
**Solution:** Check browser console for errors (F12)

### Problem: Links don't work
**Solution:** Verify JSON syntax at jsonlint.com

---

## 📝 Update Process

To add new schemes later:

1. **Download** `schemes.json` from your site
2. **Edit** it (add new scheme objects)
3. **Validate** at jsonlint.com
4. **Upload** updated file
5. **Portal auto-detects** changes!

---

## 🎉 You're Done!

Once uploaded, your portal is live and ready to use!

**Example URLs:**
- Main site: `https://example.com/product-qualification-search-v2.html`
- Subfolder: `https://example.com/tools/product-qualification-search-v2.html`
- Subdomain: `https://grants.example.com/product-qualification-search-v2.html`

---

**Need Help?** Check:
- `README-PRODUCT-QUALIFICATION.md` - Quick reference
- `UPDATE-OPTIONS-GUIDE.md` - How to keep it updated
- `PRODUCT-QUALIFICATION-SETUP.md` - Detailed setup








## 📤 Quick Upload Steps

### Step 1: Choose Your Files
You need **2 files**:
- ✅ `product-qualification-search-v2.html` (the portal)
- ✅ `schemes.json` (the database)

Both are in: `C:\Users\steph\Documents\energy-cal-backend\`

---

### Step 2: Upload to Your Website

#### **If Using FTP/File Manager:**
1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Open File Manager or connect via FTP
3. Navigate to your website's root or a subfolder
4. Upload both files:
   - `product-qualification-search-v2.html`
   - `schemes.json`
5. Make sure they're in the SAME folder

#### **If Using Wix:**
1. Go to Wix Editor
2. Click "+" to add a page
3. Choose "Blank Page" and name it "Product Grants"
4. Add an HTML iframe element
5. Use the HTML upload option or connect via Velo
6. Upload both files to the Media Manager

#### **If Using WordPress:**
1. Go to WordPress Admin → Media → Add New
2. Upload both files
3. Copy the file URLs
4. Create a new page or post
5. Add a shortcode or custom HTML to load the portal

#### **If Using Custom Server:**
```bash
# Via FTP
sftp user@yoursite.com
cd public_html
put product-qualification-search-v2.html
put schemes.json
exit
```

---

### Step 3: Access Your Portal

After uploading, access it at:
```
https://yourwebsite.com/product-qualification-search-v2.html
```

Or if you uploaded to a subfolder:
```
https://yourwebsite.com/grants/product-qualification-search-v2.html
```

---

## 📁 Recommended Folder Structure

```
your-website/
├── product-qualification-search-v2.html   ← Upload this
├── schemes.json                           ← Upload this
└── ... (other website files)
```

**Important:** Both files MUST be in the same folder!

---

## 🎯 After Upload

### Test It Works:
1. Open your website + `product-qualification-search-v2.html`
2. Try searching for "heat pump"
3. You should see ISDE scheme appear
4. Click "Check for Updates" button to test

### Customize (Optional):
1. Download `schemes.json`
2. Edit it (add/remove schemes)
3. Upload the updated version
4. Portal will detect changes automatically

---

## 🔗 How to Link to It

### Option 1: Direct Link
Add to your website navigation:
```
<a href="/product-qualification-search-v2.html">Find Grants & Schemes</a>
```

### Option 2: Embed (Iframe)
Add to any page:
```html
<iframe 
  src="/product-qualification-search-v2.html" 
  width="100%" 
  height="1200px"
  frameborder="0">
</iframe>
```

### Option 3: Button on Homepage
```html
<div class="cta-section">
  <h2>Find Grants for Your Products</h2>
  <p>Search any green product to see grants, subsidies, and schemes</p>
  <a href="/product-qualification-search-v2.html" class="btn">Search Now</a>
</div>
```

---

## 🎨 Integration Ideas

### Add to Navigation Menu:
```
Home | Products | Grants Search | Contact
                    ↑
              Link to portal here
```

### Add to Product Pages:
```html
<!-- On each product page -->
<div class="grant-checker">
  <p>Is this product eligible for grants?</p>
  <a href="/product-qualification-search-v2.html?search=solar+panel">Check Grants</a>
</div>
```

### Sidebar Widget:
```html
<div class="sidebar-widget">
  <h3>💰 Find Grants</h3>
  <p>Search for grants and schemes</p>
  <a href="/product-qualification-search-v2.html">Search Now</a>
</div>
```

---

## ⚠️ Important Notes

1. **Same Folder Required**
   - HTML and JSON must be in the same folder
   - If JSON is missing, portal uses built-in fallback data

2. **HTTPS Required**
   - Portal uses Fetch API
   - Works on HTTPS or localhost
   - May have issues on plain HTTP

3. **No Database Needed**
   - Everything is static files
   - No backend required
   - Works on any hosting

---

## 🐛 Troubleshooting

### Problem: "Loading..." never stops
**Solution:** Make sure `schemes.json` is uploaded to the same folder

### Problem: Shows "No schemes found"
**Solution:** Check browser console for errors (F12)

### Problem: Links don't work
**Solution:** Verify JSON syntax at jsonlint.com

---

## 📝 Update Process

To add new schemes later:

1. **Download** `schemes.json` from your site
2. **Edit** it (add new scheme objects)
3. **Validate** at jsonlint.com
4. **Upload** updated file
5. **Portal auto-detects** changes!

---

## 🎉 You're Done!

Once uploaded, your portal is live and ready to use!

**Example URLs:**
- Main site: `https://example.com/product-qualification-search-v2.html`
- Subfolder: `https://example.com/tools/product-qualification-search-v2.html`
- Subdomain: `https://grants.example.com/product-qualification-search-v2.html`

---

**Need Help?** Check:
- `README-PRODUCT-QUALIFICATION.md` - Quick reference
- `UPDATE-OPTIONS-GUIDE.md` - How to keep it updated
- `PRODUCT-QUALIFICATION-SETUP.md` - Detailed setup

























