# 🎯 Wix Media Integration Implementation Plan

**Date:** November 2, 2025  
**Site:** Greenways Market (`cfa82ec2-a075-4152-9799-6a1dd5c01ef4`)  
**Status:** ✅ **READY FOR IMPLEMENTATION**

---

## 📊 Current State (From Wix MCP)

### **Wix Store Data:**
- **Total Products:** 151 products in Wix store
- **Media Structure:** All products have `media.mainMedia.image.url` and `media.items[]`
- **Videos:** Structure supports videos (mediaType: "video"), currently showing images
- **Wix URLs:** Format `https://static.wixstatic.com/media/...`

### **FULL-DATABASE Status:**
- Products already have `wixId` field populated
- Some products have Wix image URLs in `images` field (JSON string)
- Example: `"wixId": "d26183b8-ad6f-8c33-86c5-f654229f603b"`

---

## 🎯 Implementation Strategy

### **Approach: Live Wix API (Recommended)**

**Why:**
- ✅ Get fresh media (including videos you manually uploaded)
- ✅ Always up-to-date
- ✅ Can detect videos vs images by `mediaType`
- ✅ Falls back gracefully if API fails

**How:**
1. Check if product has `wixId` in FULL-DATABASE
2. If `wixId` exists, call Wix API: `GET /stores-reader/v1/products/{wixId}`
3. Extract media from `media.mainMedia` and `media.items[]`
4. Separate images from videos by `mediaType`
5. Add to product response as `images[]` and `videos[]` arrays

---

## 🔧 Implementation Details

### **Location:** `routes/product-widget.js`

**Code Pattern:**
```javascript
// After finding product in FULL-DATABASE:
if (fullDbProduct.wixId) {
    try {
        // Fetch Wix media via API
        const wixMediaResponse = await fetch(
            `https://www.wixapis.com/stores-reader/v1/products/${fullDbProduct.wixId}`,
            {
                headers: {
                    'Authorization': process.env.WIX_API_KEY, // Or use MCP
                    'wix-site-id': 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4'
                }
            }
        );
        
        if (wixMediaResponse.ok) {
            const wixProduct = await wixMediaResponse.json();
            
            // Extract images and videos
            const wixImages = [];
            const wixVideos = [];
            
            // Main media
            if (wixProduct.product.media.mainMedia) {
                const mainMedia = wixProduct.product.media.mainMedia;
                if (mainMedia.mediaType === 'image' && mainMedia.image?.url) {
                    wixImages.push(mainMedia.image.url);
                } else if (mainMedia.mediaType === 'video' && mainMedia.video?.files?.[0]?.url) {
                    wixVideos.push(mainMedia.video.files[0].url);
                }
            }
            
            // Additional media items
            if (wixProduct.product.media.items) {
                wixProduct.product.media.items.forEach(item => {
                    if (item.mediaType === 'image' && item.image?.url) {
                        wixImages.push(item.image.url);
                    } else if (item.mediaType === 'video' && item.video?.files?.[0]?.url) {
                        wixVideos.push(item.video.files[0].url);
                    }
                });
            }
            
            // Merge with existing data
            product.images = [...(product.images || []), ...wixImages];
            product.videos = [...(product.videos || []), ...wixVideos];
        }
    } catch (error) {
        // Fallback: Parse existing images field
        console.log('⚠️ Wix API call failed, using existing data:', error.message);
    }
}
```

---

## 🔒 Safety Guarantees

### **Calculator Protection:**
- ✅ Calculator uses separate iframe
- ✅ Calculator only uses: `power`, `brand`, `category`, `imageUrl` (single)
- ✅ Calculator ignores `images[]` and `videos[]` arrays
- ✅ **ZERO risk** to calculator functionality

### **Backward Compatibility:**
- ✅ All media fields are optional
- ✅ If Wix API fails, use existing data
- ✅ If no `wixId`, skip Wix media entirely
- ✅ Existing products continue working

---

## 📋 Implementation Steps

### **Step 1: Update Product Widget API**
- [ ] Add Wix media fetching to `routes/product-widget.js`
- [ ] Extract images and videos from Wix API response
- [ ] Merge with existing product data
- [ ] Add fallback for API failures

### **Step 2: Test Locally**
- [ ] Test with product that has `wixId`
- [ ] Test with product without `wixId`
- [ ] Test with product that has videos
- [ ] Verify calculator still works

### **Step 3: Update Iframe Instructions**
- [ ] Create updated iframe code for `product-categories.html`
- [ ] Document URL for Wix Editor

### **Step 4: Verify Integration**
- [ ] Verify Wix media displays on product pages
- [ ] Verify videos play correctly
- [ ] Verify calculator functionality

---

## 🚨 Error Handling

### **If Wix API Fails:**
1. Log error (don't crash)
2. Fall back to parsing existing `images` field in FULL-DATABASE
3. Continue with existing product data
4. Product page still works (just without fresh Wix media)

### **If No wixId:**
1. Skip Wix API call entirely
2. Use existing product data
3. No impact on functionality

---

## 📊 Expected Results

### **After Implementation:**
- Products with `wixId` will fetch fresh media from Wix
- Videos manually uploaded to Wix will appear on product pages
- Images manually uploaded to Wix will appear on product pages
- Calculator remains unaffected
- All existing functionality preserved

---

**Status:** ✅ **READY FOR IMPLEMENTATION**  
**Risk Level:** ✅ **VERY LOW** (with proper error handling)  
**Breaking Changes:** ✅ **ZERO**

---

*Ready to implement after approval*







