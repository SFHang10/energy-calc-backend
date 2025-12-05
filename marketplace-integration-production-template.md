# 🛒 Marketplace Integration - Production Template

**Created:** January 2025  
**Purpose:** Guide for integrating uploaded Wix Media images with Greenways Market Place shop products

---

## 📋 **Current Status**

✅ **13 Images Successfully Uploaded to Wix Media**
- All images are now in your Wix Media Manager
- Each image has a Wix CDN URL (stored in `all-successful-uploads.json`)
- Images are **NOT yet visible** in your shop products

---

## 🎯 **What You Need to Do Next**

The images have been uploaded to Wix Media, but they need to be **linked to specific products** in your Greenways Market Place shop.

### **Option 1: Use Wix API (Recommended - Automated)**

Update products programmatically using the Wix Store API.

**Steps:**
1. Get product IDs from your Wix Store
2. Match uploaded images to products (by name/filename)
3. Update each product with its corresponding Wix Media URL

**Example Mapping:**
```javascript
{
  productName: "KitchenAid KODE500ESS 30 Double Wall Oven",
  wixMediaUrl: "https://static.wixstatic.com/media/c123de_6855615717064943aaef206130d59847~mv2.jpg"
}
```

### **Option 2: Manual Upload (Via Wix Dashboard)**

Add images manually to each product in your Wix Store dashboard.

**Steps:**
1. Go to Wix Dashboard → Store → Products
2. Search for each product by name
3. Click on the product to edit
4. Go to "Media" or "Images" section
5. Click "Add Image" → "Add from URL"
6. Paste the Wix Media URL from `all-successful-uploads.json`
7. Save the product

---

## 📊 **Uploaded Images Reference**

### **Image-to-Product Mapping:**

| Filename | Wix Media URL | Product Match |
|----------|---------------|--------------|
| `KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg` | `https://static.wixstatic.com/media/c123de_6855615717064943aaef206130d59847~mv2.jpg` | KitchenAid KODE500ESS 30 Double Wall Oven |
| `LG LDE4413ST 30 Double Wall Oven.jpeg` | `https://static.wixstatic.com/media/c123de_a8c09ce042724fa09cb8facb2016022c~mv2.jpeg` | LG LDE4413ST 30 Double Wall Oven |
| `Light.jpeg` | `https://static.wixstatic.com/media/c123de_c8a72355c3ba4fe498073de8092487fe~mv2.jpeg` | Lighting products / General lighting category |
| `Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg` | `https://static.wixstatic.com/media/c123de_b73332b0477646aab9ef63ddc3b35202~mv2.jpg` | Maytag MWO5105BZ 30 Single Wall Oven |
| `microwavemainhp.jpg` | `https://static.wixstatic.com/media/c123de_e8ffcb4ff77e47af9fd13a84e379d066~mv2.jpg` | Microwave products / Main category |
| `Motor.jpeg` | `https://static.wixstatic.com/media/c123de_f0501fa67cef468381068ee14f06b609~mv2.jpeg` | Motor products / General motor category |
| `Motor.jpg` | `https://static.wixstatic.com/media/c123de_2ecd3b335f4a45178e7c2e94ed458aef~mv2.jpg` | Motor products (alternative) |
| `Samsung NE58K9430WS 30 Wall Oven.jpg` | `https://static.wixstatic.com/media/c123de_420c34d6eae04d8a94d8d46c43305f14~mv2.jpeg` | Samsung NE58K9430WS 30 Wall Oven |
| `Savings.jpg` | `https://static.wixstatic.com/media/c123de_269f101eca32435f9f8e529669a8cf88~mv2.jpg` | General savings/energy efficiency category |
| `Smart Home. jpeg.jpeg` | `https://static.wixstatic.com/media/c123de_40a6bb2ddd3141cc8bab8ae27dfd7926~mv2.jpeg` | Smart Home products category |
| `Smart Warm Home. jpeg.jpeg` | `https://static.wixstatic.com/media/c123de_1a1284cf4c5d4ab7b70c5ffbadca6b3f~mv2.jpeg` | Smart Home/Warm Home products |
| `Whirlpool WOD51HZES 30 Double Wall Oven.jpg` | `https://static.wixstatic.com/media/c123de_efc137e3e2d4472fae3875a3b3def34c~mv2.jpg` | Whirlpool WOD51HZES 30 Double Wall Oven |
| `Appliances.jpg` | `https://static.wixstatic.com/media/c123de_280d3b7634824177bb0de364e4a348c2~mv2.jpg` | General Appliances category |

---

## 🔧 **Integration Methods**

### **Method 1: Wix Store API (Update Product Images)**

Use the Wix Stores API to update products with media:

```javascript
// Update product with media
PUT https://www.wixapis.com/stores/v1/products/{productId}

{
  "product": {
    "productType": {
      "productIdAndVariantIds": {
        "productId": "{productId}",
        "variantIds": []
      }
    },
    "media": {
      "mainMedia": {
        "media": {
          "url": "https://static.wixstatic.com/media/c123de_6855615717064943aaef206130d59847~mv2.jpg"
        }
      }
    }
  }
}
```

### **Method 2: Database Update + API Sync**

1. Update your local database with Wix Media URLs
2. Use Wix API to sync database images to Wix Store products

**Update Database:**
```sql
UPDATE products 
SET imageUrl = 'https://static.wixstatic.com/media/c123de_6855615717064943aaef206130d59847~mv2.jpg'
WHERE name = 'KitchenAid KODE500ESS 30 Double Wall Oven';
```

---

## ✅ **Success Indicators**

After integration, you should see:

- ✅ Images visible in Wix Store product pages
- ✅ Images displayed in product listings
- ✅ Images showing in search results
- ✅ Images visible in embedded product widgets
- ✅ All 13 uploaded images linked to correct products

---

## 📝 **Quick Checklist**

- [ ] Map each uploaded image to its corresponding product
- [ ] Decide: API update or Manual upload?
- [ ] If API: Create script to update products via Wix Store API
- [ ] If Manual: Use `all-successful-uploads.json` to copy URLs
- [ ] Test first product to verify images display correctly
- [ ] Complete all 13 product image updates
- [ ] Verify images appear in Greenways Market Place shop
- [ ] Check product pages, listings, and search results

---

## 🔗 **Related Files**

- `all-successful-uploads.json` - Complete list of uploaded images with Wix URLs
- `PRODUCT_IMAGE_IMPLEMENTATION_GUIDE.md` - Guide for local HTML page images
- `upload-final-batch-v2.js` - Script that uploaded these images

---

## 💡 **Next Steps**

1. **Review the uploaded images** in `all-successful-uploads.json`
2. **Identify which products** need these images in your Wix Store
3. **Choose integration method** (API or Manual)
4. **Create mapping** between images and products
5. **Execute updates** to link images to products
6. **Verify** images appear in Greenways Market Place shop

---

*Last Updated: January 2025*  
*Status: Images Uploaded - Awaiting Product Integration*
