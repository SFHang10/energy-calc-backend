# Quick Test Guide - Member Product Deep-Dive

## 🚀 **Quick Start**

### **Step 1: Start Backend Server**
```bash
cd "c:\Users\steph\Documents\energy-cal-backend"
node server-new.js
```

Server should start on `http://localhost:4000`

### **Step 2: Test the API**
```bash
node test-product-deep-dive.js
```

This will test if the API returns product data correctly.

### **Step 3: Open the Page**

**Option A: Direct File (Requires Login)**
```
file:///C:/Users/steph/Documents/energy-cal-backend/wix-integration/member-product-deep-dive.html?id=sample_27
```

**Option B: Via Server (If serving HTML)**
```
http://localhost:4000/wix-integration/member-product-deep-dive.html?id=sample_27
```

**Option C: From Dashboard**
1. Open `unified-membership-dashboard.html`
2. Login
3. Click "Load Marketplace Products"
4. Click any product

---

## 🧪 **Test Products**

### **Product 1: Amana Microwave** (Has Grants & Agencies)
- **ID:** `sample_27`
- **URL:** `member-product-deep-dive.html?id=sample_27`
- **Features:** ✅ Grants, ✅ Collection Agencies

### **Product 2: Gas Heater** (Example)
- **ID:** `etl_13_75468`
- **URL:** `member-product-deep-dive.html?id=etl_13_75468`

---

## ✅ **What You Should See**

### **If Everything Works:**
1. ✅ Product name: "Amana Microwave"
2. ✅ Product specifications (brand, power, energy rating)
3. ✅ Grants section with grant cards
4. ✅ Collection agencies section with agency cards
5. ✅ Beautiful visual layout

### **If Server Not Running:**
- ❌ Page shows "Error Loading Product"
- **Fix:** Start server with `node server-new.js`

### **If Not Logged In:**
- ❌ Page shows "Member Access Required"
- **Fix:** Login first at `members-section.html`

---

## 🔍 **Troubleshooting**

### **Problem: "Error Loading Product"**
**Solution:**
1. Check server is running: `node server-new.js`
2. Test API: `node test-product-deep-dive.js`
3. Check browser console for errors

### **Problem: "Member Access Required"**
**Solution:**
1. Go to `members-section.html`
2. Register or login
3. Then try deep-dive page again

### **Problem: Sections Not Showing**
**Solution:**
- Grants/agencies sections only show if product has that data
- Check API response to see what data is available
- Add `currentProduct` to JSON to see comparison section

---

## 📝 **Test Checklist**

- [ ] Backend server running
- [ ] API test script passes
- [ ] Can open deep-dive page
- [ ] Product information displays
- [ ] Grants section shows (if product has grants)
- [ ] Collection agencies show (if product has agencies)
- [ ] Page looks good visually
- [ ] Links work correctly

---

## 🎯 **Quick Test Command**

```bash
# Test API
node test-product-deep-dive.js

# If successful, open page:
# file:///C:/Users/steph/Documents/energy-cal-backend/wix-integration/member-product-deep-dive.html?id=sample_27
```

---

## 💡 **Pro Tip**

The page has test buttons built-in! If you're not logged in, you'll see test product links. If no product is selected, you'll see a test button for "Amana Microwave".








