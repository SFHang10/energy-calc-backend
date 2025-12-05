# Product JSON Structure - Enhanced for Member Deep Dive

## 📋 **Existing Fields (Already Working)**

The current product structure already supports:
- ✅ `grants` - Array of grant objects
- ✅ `collectionAgencies` - Array of collection agency objects

## 🆕 **New Optional Fields (Backward Compatible)**

Add these fields to your product JSON to enable the full deep-dive experience:

### **1. Current Product Field**
Shows what product the member currently has (for replacement scenarios):

```json
{
  "currentProduct": {
    "name": "Old Fridge Model XYZ-2000",
    "brand": "OldBrand",
    "power": 200,
    "age": "5 years",
    "condition": "Working but inefficient",
    "modelNumber": "XYZ-2000",
    "energyRating": "C",
    "runningCostPerYear": 120.50
  }
}
```

### **2. Enhanced Collection Agencies**
More detailed collection agency information:

```json
{
  "collectionAgencies": [
    {
      "name": "Local Recycling Center",
      "service": "Free pickup",
      "description": "We offer free collection of old appliances in working condition",
      "contact": "0800-123-456",
      "email": "recycle@local.gov",
      "website": "https://local-recycling.gov",
      "conditions": "Must be in working condition, must be disconnected and ready for pickup",
      "serviceArea": "Greater London area",
      "responseTime": "Within 5 business days"
    },
    {
      "name": "Energy Upgrade Program",
      "service": "Pay €50 for old product",
      "description": "We pay you €50 when you purchase a new energy-efficient product",
      "contact": "0800-789-012",
      "email": "upgrade@energy.gov",
      "website": "https://energy-upgrade.gov",
      "conditions": "Must purchase new product from approved retailers, old product must be functional",
      "serviceArea": "UK-wide",
      "responseTime": "Payment processed within 14 days of purchase"
    },
    {
      "name": "Manufacturer Take-Back Scheme",
      "service": "Free disposal + €25 voucher",
      "description": "Return your old product and receive a €25 voucher for your next purchase",
      "contact": "0800-555-789",
      "email": "takeback@manufacturer.com",
      "website": "https://manufacturer.com/takeback",
      "conditions": "Must be same brand, must show proof of purchase of new product",
      "serviceArea": "UK-wide",
      "responseTime": "Voucher sent within 7 days"
    }
  ]
}
```

### **3. Enhanced Grants**
More detailed grant information:

```json
{
  "grants": [
    {
      "country": "NL",
      "program": "Energy Efficiency Grant",
      "amount": "€200",
      "eligibility": "Residential properties built before 2000",
      "description": "Government grant to help homeowners upgrade to energy-efficient appliances",
      "link": "https://government.nl/energy-grant",
      "applicationDeadline": "2025-12-31",
      "maxIncome": "€50,000 per year",
      "requiredDocuments": ["Proof of ownership", "Energy certificate", "Purchase receipt"]
    },
    {
      "country": "UK",
      "program": "Energy Saving Trust Voucher",
      "amount": "Up to £150",
      "eligibility": "All UK residents",
      "description": "Voucher scheme for energy-efficient appliances",
      "link": "https://energysavingtrust.org.uk/vouchers",
      "applicationDeadline": "Ongoing",
      "maxIncome": "No income limit",
      "requiredDocuments": ["Proof of purchase"]
    }
  ]
}
```

## 📝 **Complete Example Product JSON**

```json
{
  "id": "product-123",
  "name": "Energy Efficient Fridge A+++",
  "brand": "EcoBrand",
  "category": "Appliances",
  "power": 150,
  "energyRating": "A+++",
  "efficiency": "high",
  "modelNumber": "ECO-FRIDGE-2024",
  "images": ["https://example.com/image1.jpg"],
  "videos": ["https://example.com/video1.mp4"],
  "runningCostPerYear": 45.50,
  
  "currentProduct": {
    "name": "Old Fridge Model XYZ-2000",
    "brand": "OldBrand",
    "power": 200,
    "age": "5 years",
    "condition": "Working but inefficient",
    "modelNumber": "XYZ-2000",
    "energyRating": "C",
    "runningCostPerYear": 120.50
  },
  
  "grants": [
    {
      "country": "NL",
      "program": "Energy Efficiency Grant",
      "amount": "€200",
      "eligibility": "Residential properties",
      "link": "https://government.nl/energy-grant"
    }
  ],
  
  "collectionAgencies": [
    {
      "name": "Local Recycling Center",
      "service": "Free pickup",
      "contact": "0800-123-456",
      "website": "https://local-recycling.gov",
      "conditions": "Must be in working condition"
    },
    {
      "name": "Energy Upgrade Program",
      "service": "Pay €50 for old product",
      "contact": "0800-789-012",
      "website": "https://energy-upgrade.gov",
      "conditions": "Must purchase new product"
    }
  ]
}
```

## ✅ **Compatibility Notes**

- ✅ **All new fields are optional** - Existing products without these fields will still work
- ✅ **Existing API endpoint** (`/api/product-widget/:productId`) already returns grants and collectionAgencies
- ✅ **Member deep-dive page** will show these fields if they exist, or hide sections if they don't
- ✅ **No breaking changes** - All existing functionality preserved

## 🔧 **How to Add to Your Products**

1. **Option 1: Add to FULL-DATABASE-5554.json**
   - Find the product in the JSON file
   - Add `currentProduct` and enhanced `collectionAgencies` fields
   - Save the file

2. **Option 2: Add via API** (if you have an update endpoint)
   - POST/PUT to update product with new fields

3. **Option 3: Add to products-with-grants-and-collection.json**
   - This file already has grants and collectionAgencies
   - Just enhance the collectionAgencies objects with more details
   - Add currentProduct field where applicable








