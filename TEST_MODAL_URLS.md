# Test URLs for Product Modal

## Category Product Page (with modal)
Test these URLs to see the new modal in action:

### Hand Dryers Category
```
https://energy-calc-backend.onrender.com/category-product-page.html?category=Hand%20Dryers
```

### Heat Pumps Category
```
https://energy-calc-backend.onrender.com/category-product-page.html?category=Heat%20Pumps
```

### Motor Drives Category
```
https://energy-calc-backend.onrender.com/category-product-page.html?category=Motor%20Drives
```

### All Products
```
https://energy-calc-backend.onrender.com/category-product-page.html?category=all
```

---

## How to Test

1. Click any of the links above
2. Wait for products to load (may take 10-20 seconds if Render is cold)
3. Click on any product card or "View Details" button
4. Product should open in a **modal overlay** (not navigate away)
5. Close with:
   - Blue X button (top right)
   - Press ESC key
   - Click outside the modal (dark area)

---

## If you see "Failed to fetch"

This usually means:
- Render server is waking up (wait 30 seconds, then retry)
- Deployment is still in progress

Try the health check first:
```
https://energy-calc-backend.onrender.com/health
```

If health check works, the products should load.

---

Created: December 18, 2025






