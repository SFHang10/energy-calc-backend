# 🚀 Step-by-Step Wix Integration Guide

## 📋 **Phase 1: Prepare Your Wix Site (10 minutes)**

### **Step 1.1: Create Dynamic Page**
1. **Go to Wix Studio** → **Pages** (left sidebar)
2. **Click "Add Page"** → **Dynamic Page**
3. **Choose "Product Page"** template
4. **Name it**: "Energy Product Page"
5. **Set URL**: `/product/[product-id]`
6. **Click "Create"**

### **Step 1.2: Add Custom Fields**
1. **Go to Content Manager** → **Products** → **Settings** → **Custom Fields**
2. **Click "Add Field"** for each of these:

```
Field Name          | Type        | Required
--------------------|-------------|----------
powerRating         | Text        | No
brand               | Text        | No  
category            | Text        | No
modelNumber         | Text        | No
energyRating        | Text        | No
efficiency          | Text        | No
descriptionShort    | Text        | No
descriptionFull     | Text        | No
additionalInfo      | Text Array  | No
```

3. **Click "Save"** after adding each field

## 📊 **Phase 2: Import Product Data (15 minutes)**

### **Step 2.1: Download CSV File**
1. **Go to**: `C:\Users\steph\Documents\energy-cal-backend\wix-integration\`
2. **Open**: `wix-products.csv`
3. **Save it** to your desktop for easy access

### **Step 2.2: Import into Wix**
1. **Go to Content Manager** → **Products**
2. **Click "Import"** → **CSV File**
3. **Upload**: `wix-products.csv`
4. **Map fields** like this:

```
CSV Column          → Wix Field
--------------------|------------------
id                 → Product ID
name               → Product Name
sku                → SKU
price              → Price
category           → Category
brand              → Brand
powerRating        → Custom Field: powerRating
modelNumber        → Custom Field: modelNumber
energyRating       → Custom Field: energyRating
efficiency         → Custom Field: efficiency
descriptionShort   → Custom Field: descriptionShort
descriptionFull    → Custom Field: descriptionFull
additionalInfo     → Custom Field: additionalInfo
imageUrl           → Product Image
```

5. **Click "Import"**
6. **Wait for import** to complete (should show 100 products)

## 🌐 **Phase 3: Set Up Dynamic Page (10 minutes)**

### **Step 3.1: Add HTML Element**
1. **Go to your Dynamic Page** in Wix Studio
2. **Click "Add Element"** → **HTML**
3. **Paste this code**:

```html
<div id="dynamic-product-container">
    <iframe 
        id="product-page-iframe"
        src="http://localhost:4000/dynamic-product-page.html?product={{wixStores.currentProduct.id}}"
        width="100%" 
        height="1200" 
        frameborder="0"
        style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    </iframe>
</div>

<script>
// Auto-resize iframe based on content
window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
        document.getElementById('product-page-iframe').style.height = event.data.height + 'px';
    }
});

// Pass product data to iframe
window.addEventListener('load', function() {
    const iframe = document.getElementById('product-page-iframe');
    const productData = {
        id: '{{wixStores.currentProduct.id}}',
        name: '{{wixStores.currentProduct.name}}',
        sku: '{{wixStores.currentProduct.sku}}',
        price: {{wixStores.currentProduct.price}},
        category: '{{wixStores.currentProduct.customFields.category}}',
        brand: '{{wixStores.currentProduct.customFields.brand}}',
        powerRating: '{{wixStores.currentProduct.customFields.powerRating}}',
        modelNumber: '{{wixStores.currentProduct.customFields.modelNumber}}',
        energyRating: '{{wixStores.currentProduct.customFields.energyRating}}',
        efficiency: '{{wixStores.currentProduct.customFields.efficiency}}',
        descriptionShort: '{{wixStores.currentProduct.customFields.descriptionShort}}',
        descriptionFull: '{{wixStores.currentProduct.customFields.descriptionFull}}',
        additionalInfo: '{{wixStores.currentProduct.customFields.additionalInfo}}',
        imageUrl: '{{wixStores.currentProduct.mainMedia.image.url}}'
    };
    
    iframe.contentWindow.postMessage({
        type: 'productData',
        data: productData
    }, '*');
});
</script>
```

4. **Click "Apply"**

### **Step 3.2: Set Page SEO**
1. **Click on Page Settings** (gear icon)
2. **Go to SEO tab**
3. **Set Dynamic Title**: `{{wixStores.currentProduct.name}} - Energy Calculator`
4. **Set Dynamic Description**: `{{wixStores.currentProduct.customFields.descriptionShort}}`
5. **Click "Save"**

## 🧪 **Phase 4: Test Everything (5 minutes)**

### **Step 4.1: Publish and Test**
1. **Click "Publish"** in Wix Studio
2. **Visit your site** and go to a product page
3. **Check these things**:
   - ✅ Product name displays correctly
   - ✅ Price shows properly
   - ✅ Image loads
   - ✅ "Read more" button works
   - ✅ Calculator widget appears
   - ✅ Tech specifications show

### **Step 4.2: Test Calculator**
1. **Scroll down** to the calculator section
2. **Verify**:
   - ✅ Product data is pre-filled
   - ✅ Energy calculations work
   - ✅ Government incentives load
   - ✅ Comparison features work

## 🔧 **Phase 5: Troubleshooting**

### **Common Issues & Solutions:**

#### **Issue 1: "Product not found"**
- **Check**: Product ID exists in your collection
- **Verify**: Custom fields are populated
- **Test**: Try a different product

#### **Issue 2: Calculator not loading**
- **Check**: Server is running (`node server-new.js`)
- **Verify**: URL is correct
- **Test**: Direct iframe URL

#### **Issue 3: Images not showing**
- **Check**: Image URLs are valid
- **Verify**: Images are publicly accessible
- **Test**: Direct image URL

#### **Issue 4: Custom fields empty**
- **Check**: Field mapping during import
- **Verify**: Fields exist in collection
- **Re-import**: CSV with correct mapping

### **Debug Steps:**
1. **Open browser console** (F12)
2. **Check for errors** in console
3. **Verify network requests** are successful
4. **Test iframe URL** directly

## 🚀 **Phase 6: Go Live!**

### **Step 6.1: Update Server URL**
Replace `http://localhost:4000` with your production server URL:

```html
src="https://yourdomain.com/dynamic-product-page.html?product={{wixStores.currentProduct.id}}"
```

### **Step 6.2: Final Checklist**
- ✅ **Products imported** successfully
- ✅ **Custom fields** populated
- ✅ **Dynamic page** created
- ✅ **HTML integration** added
- ✅ **Calculator widget** working
- ✅ **Mobile responsive** design
- ✅ **SEO settings** configured

## 📞 **Need Help?**

### **Quick Support:**
1. **Check console** for error messages
2. **Verify server** is running
3. **Test with sample products** first
4. **Contact me** with specific error details

### **Test URLs:**
- **Sample Product 1**: `/product/sample_1`
- **Sample Product 2**: `/product/sample_2`
- **Sample Product 3**: `/product/sample_3`

---

## 🎯 **You're Ready!**

Follow these steps and you'll have a beautiful, functional dynamic product page with integrated energy calculator! 

**Total time needed: ~40 minutes**

Let me know if you need help with any specific step! 🚀✨

