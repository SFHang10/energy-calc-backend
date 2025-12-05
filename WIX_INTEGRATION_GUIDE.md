# Wix Dynamic Product Page Integration Guide

## 🎯 **What We've Created:**

### **1. Dynamic Product Page Template**
- **File**: `dynamic-product-page.html`
- **Features**: Responsive design, expandable descriptions, tech specs, calculator integration
- **Layout**: Image left, details right, tech info below (exactly as requested)

### **2. Integration Options:**

## 🚀 **Option A: Wix Studio Integration**

### **Step 1: Create Dynamic Page**
1. Go to **Pages** in Wix Studio
2. Click **Add Page** → **Dynamic Page**
3. Choose **Product Page** template
4. Name it "Energy Product Page"

### **Step 2: Add Custom Fields**
Add these fields to your product collection:
- `powerRating` (Text)
- `brand` (Text) 
- `category` (Text)
- `modelNumber` (Text)
- `energyRating` (Text)
- `efficiency` (Text)
- `descriptionShort` (Text)
- `descriptionFull` (Text)
- `additionalInfo` (Text Array)

### **Step 3: Import Products**
Use the CSV export script to import your 5,554 products with custom fields.

### **Step 4: Embed Calculator Widget**
Add an HTML element to the dynamic page with:
```html
<iframe src="http://localhost:4000/product-energy-widget-glassmorphism.html?productId={{wixStores.currentProduct.id}}" 
        width="100%" height="800" frameborder="0">
</iframe>
```

## 🚀 **Option B: Standalone Integration**

### **Step 1: Host the Dynamic Page**
Upload `dynamic-product-page.html` to your server.

### **Step 2: Create Product URLs**
Generate URLs like:
- `yoursite.com/dynamic-product-page.html?product=baxi-auriga-hp-20t`
- `yoursite.com/dynamic-product-page.html?product=ideal-logic-air-4kw`

### **Step 3: Update Product Links**
Change your product page links to point to the dynamic page.

## 🚀 **Option C: Hybrid Approach**

### **Step 1: Use Wix for Product Management**
- Keep using Wix Store for product management
- Add custom fields for technical data

### **Step 2: Custom Product Pages**
- Create custom product pages using the dynamic template
- Link from Wix Store to custom pages
- Embed calculator widget on custom pages

## 📋 **Implementation Checklist:**

- [ ] **Test the dynamic page** with sample products
- [ ] **Add custom fields** to Wix product collection
- [ ] **Export SQLite data** to CSV format
- [ ] **Import products** into Wix with custom fields
- [ ] **Create dynamic page** in Wix Studio
- [ ] **Embed calculator widget** in dynamic page
- [ ] **Test product-specific data** loading
- [ ] **Verify calculator integration** works
- [ ] **Test responsive design** on mobile
- [ ] **Deploy to production**

## 🔧 **Technical Details:**

### **URL Parameters:**
- `?product=product-id` - Load specific product
- `?id=product-id` - Alternative parameter name

### **Product Data Structure:**
```javascript
{
  id: 'product-id',
  name: 'Product Name',
  sku: 'SKU-CODE',
  price: 12500.00,
  category: 'Heat Pumps',
  brand: 'Baxi',
  power: '20kW',
  modelNumber: 'HP-20T',
  energyRating: 'A++',
  efficiency: 'High',
  imageUrl: 'https://...',
  descriptionShort: 'Brief description...',
  descriptionFull: 'Full description...',
  additionalInfo: ['Feature 1', 'Feature 2', ...]
}
```

### **Calculator Integration:**
The calculator widget automatically loads with product-specific data:
- Product name, power, brand, category
- Pre-populated calculations
- Government incentives based on product type

## 🎯 **Next Steps:**

1. **Test the dynamic page** - Open `dynamic-product-page.html` in browser
2. **Choose integration approach** - Wix Studio, Standalone, or Hybrid
3. **Set up custom fields** in Wix product collection
4. **Import product data** with technical specifications
5. **Deploy and test** the complete solution

The dynamic page is ready to use and will work perfectly with your energy calculator widget! 🚀