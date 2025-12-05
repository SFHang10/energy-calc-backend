# 🎯 Visual Integration Guide

## 📋 **Step-by-Step Visual Guide**

### **Step 1: Wix Studio Setup**
```
Wix Studio → Pages → Add Page → Dynamic Page
    ↓
Choose "Product Page" template
    ↓
Name: "Energy Product Page"
    ↓
URL: /product/[product-id]
    ↓
Click "Create"
```

### **Step 2: Custom Fields Setup**
```
Content Manager → Products → Settings → Custom Fields
    ↓
Add Field → powerRating (Text)
    ↓
Add Field → brand (Text)
    ↓
Add Field → category (Text)
    ↓
Add Field → modelNumber (Text)
    ↓
Add Field → energyRating (Text)
    ↓
Add Field → efficiency (Text)
    ↓
Add Field → descriptionShort (Text)
    ↓
Add Field → descriptionFull (Text)
    ↓
Add Field → additionalInfo (Text Array)
    ↓
Save All Fields
```

### **Step 3: Import Products**
```
Content Manager → Products → Import → CSV File
    ↓
Upload: wix-products.csv
    ↓
Map Fields:
    id → Product ID
    name → Product Name
    sku → SKU
    price → Price
    category → Category
    brand → Brand
    powerRating → Custom Field: powerRating
    modelNumber → Custom Field: modelNumber
    energyRating → Custom Field: energyRating
    efficiency → Custom Field: efficiency
    descriptionShort → Custom Field: descriptionShort
    descriptionFull → Custom Field: descriptionFull
    additionalInfo → Custom Field: additionalInfo
    imageUrl → Product Image
    ↓
Click "Import"
    ↓
Wait for 100 products to import
```

### **Step 4: Dynamic Page Setup**
```
Go to Dynamic Page → Add Element → HTML
    ↓
Paste Integration Code:
    <iframe src="http://localhost:4000/dynamic-product-page.html?product={{wixStores.currentProduct.id}}" 
            width="100%" height="1200" frameborder="0">
    </iframe>
    ↓
Click "Apply"
    ↓
Page Settings → SEO → Dynamic Title: {{wixStores.currentProduct.name}} - Energy Calculator
    ↓
Dynamic Description: {{wixStores.currentProduct.customFields.descriptionShort}}
    ↓
Save
```

### **Step 5: Test & Publish**
```
Click "Publish" in Wix Studio
    ↓
Visit your site
    ↓
Go to a product page (e.g., /product/sample_1)
    ↓
Verify:
    ✅ Product name displays
    ✅ Price shows correctly
    ✅ Image loads
    ✅ "Read more" works
    ✅ Calculator widget appears
    ✅ Tech specs show
    ✅ Mobile responsive
```

## 🔧 **Troubleshooting Visual Guide**

### **If Calculator Doesn't Load:**
```
Check Server Status:
    ↓
Open Terminal → cd C:\Users\steph\Documents\energy-cal-backend
    ↓
Run: node server-new.js
    ↓
Verify: Server running on port 4000
    ↓
Test: http://localhost:4000/dynamic-product-page.html?product=sample_1
```

### **If Product Data Missing:**
```
Check Custom Fields:
    ↓
Content Manager → Products → Select Product
    ↓
Verify: Custom fields are populated
    ↓
If empty: Re-import CSV with correct mapping
    ↓
Check: Field names match exactly
```

### **If Images Don't Show:**
```
Check Image URLs:
    ↓
Content Manager → Products → Select Product
    ↓
Verify: Image URL is valid
    ↓
Test: Direct image URL in browser
    ↓
If broken: Update image URL in product
```

## 📊 **Success Indicators**

### **✅ Everything Working:**
- Product page loads with correct data
- Calculator widget appears and functions
- Images display properly
- "Read more" functionality works
- Tech specifications show
- Mobile responsive design
- Government incentives load
- Energy calculations work

### **❌ Common Issues:**
- "Product not found" → Check product ID
- Calculator not loading → Check server status
- Images missing → Check image URLs
- Custom fields empty → Re-import CSV
- Page not responsive → Check CSS

## 🚀 **Final Checklist**

### **Before Going Live:**
- [ ] Server running on port 4000
- [ ] 100 products imported successfully
- [ ] Custom fields populated
- [ ] Dynamic page created
- [ ] HTML integration added
- [ ] Calculator widget working
- [ ] Mobile responsive design
- [ ] SEO settings configured
- [ ] Test with multiple products
- [ ] Verify all features work

### **Production Deployment:**
- [ ] Update server URL to production
- [ ] Ensure SSL certificate
- [ ] Test on live site
- [ ] Monitor performance
- [ ] Set up analytics

---

## 🎯 **You're All Set!**

Follow this visual guide step by step, and you'll have your dynamic product page integrated with Wix in no time! 

**Total time: ~40 minutes**

Let me know if you need help with any specific step! 🚀✨

