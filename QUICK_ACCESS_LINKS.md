# 🔗 Quick Access Links

## Local Testing

### API Endpoints (Running on http://localhost:4000)

#### Get All Products (Including Enriched Wix Products):
```
http://localhost:4000/api/products
```

#### Get Products by Category:
```
http://localhost:4000/api/products/category/Hand%20Dryers
http://localhost:4000/api/products/category/Combi%20Ovens
```

#### Test Enriched Products:
```
http://localhost:4000/api/product-widget/[product-id]
```

#### View All Categories:
```javascript
// In browser console
fetch('http://localhost:4000/api/products')
  .then(r => r.json())
  .then(data => {
    console.log('Enriched products:', 
      data.filter(p => p.wixId).map(p => p.name)
    );
  });
```

---

## HTML Pages to View

### Product Page with Calculator (V2):
```
file:///C:/Users/steph/Documents/energy-cal-backend/product-page-v2-marketplace-test.html
```

### Product Categories:
```
file:///C:/Users/steph/Documents/energy-cal-backend/product-categories-optimized.html
```

### Grants Portal:
```
file:///C:/Users/steph/Documents/energy-cal-backend/grants-portal-enhanced.html
```

---

## Enriched Products (Available Now)

These 3 products now have Wix enrichment:
1. **Air Fury High Speed Dryer (C)** - ✅ Wix ID, Images, Links
2. **Air Fury High Speed Dryer (W)** - ✅ Wix ID, Images, Links  
3. **The Splash Lab Air Fury High Speed Hand Dryer TSL.89** - ✅ Wix ID, Images, Links

---

## Direct Local Server Links

If your server is running, test these:

### Check Server Health:
```
http://localhost:4000/health
```

### View Enriched Data:
```
http://localhost:4000/api/products?wixEnriched=true
```

### View Product by ID:
```
http://localhost:4000/api/product-widget/[any-product-id]
```

---

## Quick Test Command

Open PowerShell and run:

```powershell
# Check if server is running
Invoke-WebRequest http://localhost:4000/health

# View enriched products
Invoke-WebRequest http://localhost:4000/api/products | ConvertFrom-Json | Where-Object {$_.wixId} | Select-Object name, wixId, wixProductUrl
```

---

## Next Steps

1. ✅ Open the V2 product page HTML file
2. ✅ Check console for enriched products
3. ✅ View products in categories page
4. ✅ Test Wix links when available

**All enriched products are safe and working!** 🔒




## Local Testing

### API Endpoints (Running on http://localhost:4000)

#### Get All Products (Including Enriched Wix Products):
```
http://localhost:4000/api/products
```

#### Get Products by Category:
```
http://localhost:4000/api/products/category/Hand%20Dryers
http://localhost:4000/api/products/category/Combi%20Ovens
```

#### Test Enriched Products:
```
http://localhost:4000/api/product-widget/[product-id]
```

#### View All Categories:
```javascript
// In browser console
fetch('http://localhost:4000/api/products')
  .then(r => r.json())
  .then(data => {
    console.log('Enriched products:', 
      data.filter(p => p.wixId).map(p => p.name)
    );
  });
```

---

## HTML Pages to View

### Product Page with Calculator (V2):
```
file:///C:/Users/steph/Documents/energy-cal-backend/product-page-v2-marketplace-test.html
```

### Product Categories:
```
file:///C:/Users/steph/Documents/energy-cal-backend/product-categories-optimized.html
```

### Grants Portal:
```
file:///C:/Users/steph/Documents/energy-cal-backend/grants-portal-enhanced.html
```

---

## Enriched Products (Available Now)

These 3 products now have Wix enrichment:
1. **Air Fury High Speed Dryer (C)** - ✅ Wix ID, Images, Links
2. **Air Fury High Speed Dryer (W)** - ✅ Wix ID, Images, Links  
3. **The Splash Lab Air Fury High Speed Hand Dryer TSL.89** - ✅ Wix ID, Images, Links

---

## Direct Local Server Links

If your server is running, test these:

### Check Server Health:
```
http://localhost:4000/health
```

### View Enriched Data:
```
http://localhost:4000/api/products?wixEnriched=true
```

### View Product by ID:
```
http://localhost:4000/api/product-widget/[any-product-id]
```

---

## Quick Test Command

Open PowerShell and run:

```powershell
# Check if server is running
Invoke-WebRequest http://localhost:4000/health

# View enriched products
Invoke-WebRequest http://localhost:4000/api/products | ConvertFrom-Json | Where-Object {$_.wixId} | Select-Object name, wixId, wixProductUrl
```

---

## Next Steps

1. ✅ Open the V2 product page HTML file
2. ✅ Check console for enriched products
3. ✅ View products in categories page
4. ✅ Test Wix links when available

**All enriched products are safe and working!** 🔒





















