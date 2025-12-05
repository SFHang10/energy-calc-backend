# Product Shop Link Examples

## How "View in Shop" Works

When a user clicks "🛒 View in Shop" from the energy audit widget, the system looks for a shop URL in this order:

1. **`product.productPageUrl`** (first priority)
2. **`product.affiliateInfo.affiliateLink`** (fallback)

---

## Product Page URL Format

The product page (`product-page-v2.html`) uses URL parameters to identify products:

### Format:
```
product-page-v2.html?product=PRODUCT_ID
```
or
```
product-page-v2.html?id=PRODUCT_ID
```

---

## Example Links

### Example 1: Local/Development
```
http://localhost:4000/product-page-v2.html?product=sample_3
```

### Example 2: Production (Render.com)
```
https://energy-calc-backend.onrender.com/product-page-v2.html?product=sample_3
```

### Example 3: With Product ID from Embedded Data
Based on the embedded products, here are some example product IDs:

**Bosch Dishwasher:**
```
https://energy-calc-backend.onrender.com/product-page-v2.html?product=sample_3
```

**Hisense Dishwasher:**
```
https://energy-calc-backend.onrender.com/product-page-v2.html?product=sample_50
```

**Amana Microwave:**
```
https://energy-calc-backend.onrender.com/product-page-v2.html?product=sample_27
```

---

## How It Works in Code

### From Energy Audit Widget:
```javascript
// In viewProductInShop() function:
if (product.productPageUrl) {
    shopUrl = product.productPageUrl;  // e.g., "product-page-v2.html?product=sample_3"
} else if (product.affiliateInfo) {
    shopUrl = affiliateInfo.affiliateLink;  // e.g., external affiliate URL
}

// Then navigates to:
window.location.href = shopUrl;  // Opens on same page
```

### Product Page Loads Product:
```javascript
// In product-page-v2.html:
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('product') || urlParams.get('id');
// Then fetches: /api/product-widget/${productId}
```

---

## Live Example URLs

### Test These Links:

1. **Bosch Dishwasher (Sample Product):**
   ```
   https://energy-calc-backend.onrender.com/product-page-v2.html?product=sample_3
   ```

2. **Any Product ID:**
   ```
   https://energy-calc-backend.onrender.com/product-page-v2.html?product=YOUR_PRODUCT_ID
   ```

---

## What Happens When User Clicks "View in Shop"

1. **User clicks "🛒 View in Shop"** in audit widget
2. **System checks** for `productPageUrl` or `affiliateLink`
3. **If found:** Navigates to that URL on same page
4. **Product page loads:** Fetches product data from `/api/product-widget/${productId}`
5. **User sees:** Full product page with back button to return to audit widget

---

## Notes

- **Relative URLs** (like `product-page-v2.html?product=sample_3`) work on same domain
- **Full URLs** (like `https://energy-calc-backend.onrender.com/product-page-v2.html?product=sample_3`) work from anywhere
- **External affiliate links** (if present) would be full `http://` URLs
- **Back button** appears on product page to return to audit widget

---

**Last Updated:** 2025-01-10



