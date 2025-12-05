# 🚀 Wix Dynamic Product Page Setup Guide

## 📋 **Step-by-Step Implementation**

### **Phase 1: Prepare Your Wix Site**

#### **1.1 Create Dynamic Page**
1. **Go to Wix Studio** → **Pages**
2. **Click "Add Page"** → **Dynamic Page**
3. **Choose "Product Page"** template
4. **Name it**: "Energy Product Page"
5. **Set URL**: `/product/[product-id]`

#### **1.2 Add Custom Fields to Product Collection**
Go to **Content Manager** → **Products** → **Settings** → **Custom Fields**

Add these fields:
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

### **Phase 2: Import Product Data**

#### **2.1 Import CSV File**
1. **Go to Content Manager** → **Products**
2. **Click "Import"** → **CSV File**
3. **Upload**: `wix-products.csv` (from wix-integration folder)
4. **Map fields**:
   - `id` → Product ID
   - `name` → Product Name
   - `sku` → SKU
   - `price` → Price
   - `category` → Category
   - `brand` → Brand
   - `powerRating` → Custom Field: powerRating
   - `modelNumber` → Custom Field: modelNumber
   - `energyRating` → Custom Field: energyRating
   - `efficiency` → Custom Field: efficiency
   - `descriptionShort` → Custom Field: descriptionShort
   - `descriptionFull` → Custom Field: descriptionFull
   - `additionalInfo` → Custom Field: additionalInfo
   - `imageUrl` → Product Image

#### **2.2 Verify Import**
- Check that products have custom fields populated
- Verify images are loading correctly
- Test a few product pages

### **Phase 3: Set Up Dynamic Page**

#### **3.1 Add HTML Element**
1. **Go to your Dynamic Page** in Wix Studio
2. **Add Element** → **HTML**
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

#### **3.2 Update Dynamic Page Settings**
1. **Go to Page Settings** → **SEO**
2. **Set Dynamic Title**: `{{wixStores.currentProduct.name}} - Energy Calculator`
3. **Set Dynamic Description**: `{{wixStores.currentProduct.customFields.descriptionShort}}`

### **Phase 4: Test Integration**

#### **4.1 Test Product Pages**
1. **Publish your site**
2. **Visit a product page**: `/product/sample_1`
3. **Verify**:
   - Product data loads correctly
   - Calculator widget appears
   - Images display properly
   - "Read more" functionality works

#### **4.2 Test Calculator Widget**
1. **Check energy calculations** work
2. **Verify product-specific data** populates
3. **Test government incentives** section
4. **Confirm comparison features** work

### **Phase 5: Production Deployment**

#### **5.1 Update Server URL**
Replace `http://localhost:4000` with your production server URL:
```html
src="https://yourdomain.com/dynamic-product-page.html?product={{wixStores.currentProduct.id}}"
```

#### **5.2 SSL Certificate**
Ensure your server has SSL certificate for HTTPS.

#### **5.3 Performance Optimization**
- Enable gzip compression
- Add caching headers
- Optimize images

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Issue 1: Product Data Not Loading**
- **Check**: Custom fields are properly mapped
- **Verify**: Product has all required fields
- **Test**: Console logs for errors

#### **Issue 2: Calculator Widget Not Appearing**
- **Check**: Server is running on port 4000
- **Verify**: CORS headers are set
- **Test**: Direct iframe URL

#### **Issue 3: Images Not Displaying**
- **Check**: Image URLs are valid
- **Verify**: Images are publicly accessible
- **Test**: Direct image URL

### **Debug Steps:**
1. **Open browser console** (F12)
2. **Check for errors** in console
3. **Verify network requests** are successful
4. **Test iframe URL** directly

## 📊 **Success Metrics**

### **What to Verify:**
- ✅ **Product pages load** with correct data
- ✅ **Calculator widget** appears and functions
- ✅ **Images display** correctly
- ✅ **"Read more"** functionality works
- ✅ **Tech specifications** show properly
- ✅ **Mobile responsive** design works
- ✅ **Government incentives** load based on product

## 🎯 **Next Steps After Setup**

1. **Import all 5,554 products** (not just 100)
2. **Add more custom fields** as needed
3. **Customize styling** to match your brand
4. **Add analytics tracking**
5. **Set up monitoring** for performance

## 📞 **Support**

If you encounter any issues:
1. **Check the console** for error messages
2. **Verify server** is running
3. **Test with sample products** first
4. **Contact support** with specific error details

---

**Ready to proceed? Let's start with Phase 1!** 🚀

