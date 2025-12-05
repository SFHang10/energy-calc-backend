# Testing Member Product Deep-Dive Page

## 🧪 **Test Product**

**Product ID:** `sample_27`  
**Product Name:** Amana Microwave  
**Has Grants:** ✅ Yes  
**Has Collection Agencies:** ✅ Yes

---

## 🚀 **How to Test**

### **Option 1: Direct URL Test**
1. Make sure your backend server is running (`node server-new.js`)
2. Open in browser:
   ```
   file:///C:/Users/steph/Documents/energy-cal-backend/wix-integration/member-product-deep-dive.html?id=sample_27
   ```
3. Or if server is running, use:
   ```
   http://localhost:4000/wix-integration/member-product-deep-dive.html?id=sample_27
   ```

### **Option 2: From Unified Dashboard**
1. Open `unified-membership-dashboard.html`
2. Login (or register if needed)
3. Click "Load Marketplace Products"
4. Find "Amana Microwave" in the list
5. Click "View Details"
6. Deep-dive page should open automatically

### **Option 3: Test with Different Product**
Replace `sample_27` with any product ID from your database:
```
member-product-deep-dive.html?id=YOUR_PRODUCT_ID
```

---

## ✅ **What to Verify**

### **Product Information Section:**
- [ ] Product name displays correctly
- [ ] Product image/video shows (if available)
- [ ] All specifications display (brand, power, energy rating, etc.)

### **Grants Section:**
- [ ] Section appears (if product has grants)
- [ ] Grant cards display with amounts
- [ ] Links work (if provided)

### **Collection Agencies Section:**
- [ ] Section appears (if product has agencies)
- [ ] Agency cards display with services
- [ ] Contact information shows

### **Current Product Comparison:**
- [ ] Section appears (if `currentProduct` in JSON)
- [ ] Old vs New comparison shows
- [ ] Savings calculation displays

### **Authentication:**
- [ ] Page requires login (shows login prompt if not authenticated)
- [ ] Works when logged in

---

## 🔍 **Expected Results**

For product `sample_27` (Amana Microwave):
- ✅ Product information should display
- ✅ Grants section should show (has grants)
- ✅ Collection agencies section should show (has agencies)
- ⚠️ Current product comparison may not show (needs to be added to JSON)

---

## 🐛 **Troubleshooting**

### **If page shows "Loading..." forever:**
- Check backend server is running
- Check API endpoint: `http://localhost:4000/api/product-widget/sample_27`
- Check browser console for errors

### **If "Member Access Required" shows:**
- You need to login first
- Go to `members-section.html` and login
- Then try the deep-dive page again

### **If sections don't show:**
- Check if product has grants/agencies in JSON
- Check browser console for API response
- Verify API returns data correctly

---

## 📝 **Test URL**

**Full Test URL:**
```
file:///C:/Users/steph/Documents/energy-cal-backend/wix-integration/member-product-deep-dive.html?id=sample_27
```

**Or with server:**
```
http://localhost:4000/wix-integration/member-product-deep-dive.html?id=sample_27
```

---

## ✅ **Quick Test Command**

Test the API endpoint first:
```bash
curl http://localhost:4000/api/product-widget/sample_27
```

If this returns product data, the page should work!








