# 🛍️ Product Addition Workflow Skill

**Skill Type:** Product Data Pipeline & Enrichment  
**Purpose:** Ensure ALL products are enriched with grants, schemes, and collection data before being added to the marketplace  
**Last Updated:** January 2026

---

## 📋 Overview

This skill defines the **MANDATORY** workflow for adding any new product to the Greenways Market Place system. Every product MUST go through:

1. **Grants/Schemes Search** - Find applicable government grants and incentives
2. **Collection Agencies** - Add recycling/trade-in options for old products
3. **Full Data Enrichment** - Ensure all product fields are populated
4. **Database Storage** - Store complete product data with grants

**Decision Made:** Hardcoded grants data is preferred over API calls to ensure instant loading and offline availability.

---

## 🗂️ Key Files & Data Sources

### Primary Data Files

| File | Purpose | Location |
|------|---------|----------|
| `products-with-grants.json` | Products with grants data | `energy-calculator/` |
| `products-with-grants-and-collection.json` | Products with grants + collection | `energy-calculator/` |
| `FULL-DATABASE-5554.json` | Base product database | Project root |
| `schemes.json` | Grants & schemes definitions | Project root |

### Database Files

| Database | Purpose | Location |
|----------|---------|----------|
| `energy_calculator_central.db` | Main product database | `database/` |
| `energy_calculator_with_grants.db` | Products with grants columns | `database/` |
| `energy_calculator_with_collection.db` | Products with collection data | `database/` |

### Processing Scripts

| Script | Purpose |
|--------|---------|
| `product-grants-integrator.js` | Main grants enrichment script |
| `hardcoded-grants-system.js` | Grants mapping by category/subcategory |
| `grants-interface-system.js` | Calculator integration interface |
| `load-hardcoded-data.js` | Loads enriched data into calculators |

---

## 🔄 MANDATORY Product Addition Workflow

### Step 1: Validate Product Data

Before adding any product, ensure these **required fields** are present:

```javascript
// Required Fields
{
  id: "unique_product_id",        // Format: "etl_XX_XXXXX" or "sample_XX"
  name: "Product Name",
  brand: "Brand Name",
  category: "Category",           // Must match grants category
  subcategory: "Subcategory",     // Must match grants subcategory
  price: 0,                       // Numeric price
  power: 0,                       // Power consumption
  energyRating: "A+",             // A++, A+, A, B, C, etc.
  efficiency: "High"              // High, Medium, Low
}
```

### Step 2: Match Grants by Category

Use the grants mapping to find applicable grants:

```javascript
// Grants Mapping Structure (from hardcoded-grants-system.js)
const PRODUCT_GRANTS_MAPPING = {
    "Appliances": {
        "Dishwasher": { grants: [...], defaultGrant: 250 },
        "Washing Machine": { grants: [...], defaultGrant: 200 },
        "Refrigerator": { grants: [...], defaultGrant: 300 },
        "Microwave": { grants: [...], defaultGrant: 100 },
        "Oven": { grants: [...], defaultGrant: 500 }
    },
    "Heating": {
        "Heat Pumps": { grants: [...], defaultGrant: 5000 },
        "Boilers": { grants: [...], defaultGrant: 500 },
        "Electric Heaters": { grants: [...], defaultGrant: 200 }
    },
    "Renewable": {
        "Solar Panels": { grants: [...], defaultGrant: 2500 },
        "Wind Turbines": { grants: [...], defaultGrant: 5000 },
        "Battery Storage": { grants: [...], defaultGrant: 1500 }
    },
    "Insulation": {
        "Cavity Wall": { grants: [...], defaultGrant: 1000 },
        "Loft": { grants: [...], defaultGrant: 800 },
        "Floor": { grants: [...], defaultGrant: 600 }
    },
    "Smart Home": {
        "Thermostats": { grants: [...], defaultGrant: 150 },
        "Energy Monitors": { grants: [...], defaultGrant: 100 }
    }
};
```

### Step 3: Add Collection Agencies

For applicable product categories, add collection/recycling options:

```javascript
// Collection Agency Structure
{
  agencyName: "Tesco Recycling Program",
  agencyType: "Supermarket",
  collectionMethod: "Drop-off",
  incentiveType: "Clubcard Points",
  incentiveAmount: 200,
  currency: "Points",
  description: "Earn Clubcard points for recycling old appliances",
  requirements: ["Must have Clubcard", "Must be working condition"],
  collectionArea: "Nationwide",
  contactInfo: "0800 505 555",
  website: "https://www.tesco.com/recycling",
  processingTime: "Immediate",
  additionalBenefits: ["Points for future shopping", "Convenient drop-off"],
  ecoCertification: "WEEE Compliant",
  circularEconomyImpact: "Medium - Components recycled"
}
```

### Step 4: Enrich Product Data

Use the `addGrantsToProduct` function:

```javascript
const { addGrantsToProduct } = require('./hardcoded-grants-system.js');

// Enrich a single product
const enrichedProduct = addGrantsToProduct(product, 'uk.england');

// Result structure:
{
  ...originalProductData,
  grants: [...],                  // Array of applicable grants
  grantsTotal: 550,               // Sum of all grant amounts
  grantsCurrency: "EUR",          // Primary currency
  grantsRegion: "uk.england",     // Target region
  grantsCount: 2,                 // Number of grants
  collectionAgencies: [...],      // Array of collection options
  collectionIncentiveTotal: 200,  // Sum of collection incentives
  collectionCurrency: "Points",
  collectionAgenciesCount: 1
}
```

### Step 5: Store in Database

Update the database with enriched product:

```javascript
// SQL for updating product with grants
UPDATE products 
SET 
    grants = ?,              -- JSON array of grants
    grants_total = ?,        -- Total grant amount
    grants_currency = ?,     -- Currency
    grants_region = ?,       -- Region code
    grants_count = ?         -- Number of grants
WHERE id = ?
```

### Step 6: Export to JSON Files

After database update, regenerate JSON files:

```bash
# Run the export script
node product-grants-integrator.js
```

This creates/updates:
- `products-with-grants.json`
- `products-with-grants-and-collection.json`
- `database/energy_calculator_with_grants.db`

---

## 🏛️ Available Grant Regions

| Code | Region | Grants Count |
|------|--------|--------------|
| `uk.england` | England | 16 grants |
| `uk.scotland` | Scotland | 5 grants |
| `eu.ireland` | Ireland | 4 grants |
| `eu.germany` | Germany | 2 grants |

---

## 📊 Product Data JSON Structure

### Full Enriched Product Example

```json
{
  "id": "etl_8_52763",
  "name": "CHEETAH Building Controls",
  "brand": "CHEETAH",
  "category": "Heating",
  "subcategory": "Building Controls",
  "price": 2500,
  "power": 50,
  "energyRating": "A+",
  "efficiency": "High",
  "runningCostPerYear": 21.9,
  "imageUrl": "/product-media/images/cheetah-controls.jpg",
  "descriptionShort": "Advanced HVAC building controls system",
  "descriptionFull": "CHEETAH Building Controls for efficient HVAC management...",
  "specifications": {
    "Power Rating": "50W",
    "Energy Rating": "A+",
    "Connectivity": "WiFi/Ethernet"
  },
  "marketingInfo": {
    "Product Benefits": "Up to 30% energy savings",
    "ROI Information": "Typical payback 2-3 years"
  },
  "productPageUrl": "product-page-v2-marketplace.html?product=etl_8_52763&fromPopup=true",
  
  // GRANTS DATA (MANDATORY)
  "grants": [
    {
      "name": "Smart Building Grant",
      "amount": 1000,
      "currency": "EUR",
      "description": "Grant for smart building controls",
      "applicationUrl": "https://www.gov.uk/smart-building-scheme",
      "contactInfo": "0800 123 4567",
      "validUntil": "2026-12-31",
      "requirements": ["Must be A+ rated", "Professional installation"],
      "processingTime": "4-6 weeks"
    }
  ],
  "grantsTotal": 1000,
  "grantsCurrency": "EUR",
  "grantsRegion": "uk.england",
  "grantsCount": 1,
  
  // COLLECTION DATA (MANDATORY)
  "collectionAgencies": [
    {
      "agencyName": "WEEE Recycling Services",
      "agencyType": "Specialist",
      "collectionMethod": "Collection",
      "incentiveType": "Cash",
      "incentiveAmount": 50,
      "currency": "GBP",
      "description": "Free collection of old HVAC controls"
    }
  ],
  "collectionIncentiveTotal": 50,
  "collectionCurrency": "GBP",
  "collectionAgenciesCount": 1
}
```

---

## 🚀 Quick Start: Adding a New Product

### Option 1: Run Full Integration Script

```bash
cd C:\Users\steph\Documents\energy-cal-backend
node product-grants-integrator.js
```

### Option 2: Add Single Product Manually

```javascript
const { addGrantsToProduct } = require('./hardcoded-grants-system.js');
const sqlite3 = require('sqlite3').verbose();

// 1. Create product object
const newProduct = {
  id: 'new_product_001',
  name: 'New Energy Product',
  brand: 'Brand',
  category: 'Heating',        // Must match grants category
  subcategory: 'Heat Pumps',  // Must match grants subcategory
  price: 3000,
  power: 2000,
  energyRating: 'A++',
  efficiency: 'High'
};

// 2. Enrich with grants
const enrichedProduct = addGrantsToProduct(newProduct, 'uk.england');
console.log(`✅ Found ${enrichedProduct.grantsCount} grants`);
console.log(`💰 Total grants available: €${enrichedProduct.grantsTotal}`);

// 3. Store in database
// ... (use updateProductWithGrants function)
```

### Option 3: Batch Import

```bash
# For importing multiple products
node fetch_all_etl_products_unlimited.js
node product-grants-integrator.js
```

---

## ✅ Product Addition Checklist

Before marking a product as "added", verify:

- [ ] **Basic Info** - ID, name, brand, price filled
- [ ] **Category Match** - Category matches grants mapping
- [ ] **Subcategory Match** - Subcategory matches grants mapping
- [ ] **Grants Added** - `grants` array populated
- [ ] **Grants Total** - `grantsTotal` calculated
- [ ] **Region Set** - `grantsRegion` set (default: uk.england)
- [ ] **Collection Added** - `collectionAgencies` array populated (if applicable)
- [ ] **Database Updated** - Product saved to `energy_calculator_with_grants.db`
- [ ] **JSON Exported** - `products-with-grants.json` regenerated
- [ ] **Deployed** - Changes pushed to Git and deployed to Render

---

## 🎯 Category to Grants Mapping

### Appliances

| Subcategory | Default Grant | Grant Types |
|-------------|---------------|-------------|
| Dishwasher | €250 | Kitchen Efficiency, Smart Kitchen |
| Washing Machine | €200 | Energy Saving, Water Efficient |
| Refrigerator | €300 | Kitchen Efficiency |
| Microwave | €100 | Kitchen Efficiency |
| Oven | €500 | Kitchen Efficiency, Smart Kitchen |

### Heating

| Subcategory | Default Grant | Grant Types |
|-------------|---------------|-------------|
| Heat Pumps | €5,000 | Boiler Upgrade, RHI, ASHP Grant |
| Boilers | €500 | Boiler Upgrade |
| Electric Heaters | €200 | Energy Efficiency |
| Building Controls | €1,000 | Smart Building |

### Renewable

| Subcategory | Default Grant | Grant Types |
|-------------|---------------|-------------|
| Solar Panels | €2,500 | SEG, Solar Together |
| Wind Turbines | €5,000 | Renewable Energy |
| Battery Storage | €1,500 | Smart Energy |

### Insulation

| Subcategory | Default Grant | Grant Types |
|-------------|---------------|-------------|
| Cavity Wall | €1,000 | Home Upgrade, ECO4 |
| Loft | €800 | Home Upgrade, ECO4 |
| Floor | €600 | Home Upgrade |

### Smart Home

| Subcategory | Default Grant | Grant Types |
|-------------|---------------|-------------|
| Thermostats | €150 | Smart Home |
| Energy Monitors | €100 | Smart Home |

---

## 🔧 Troubleshooting

### Product Has No Grants

**Cause:** Category/Subcategory doesn't match grants mapping

**Solution:**
1. Check category spelling matches exactly
2. Check subcategory spelling matches exactly
3. Add new grant mapping if category is valid

### Grants Not Showing in Calculator

**Cause:** JSON files not regenerated or old data cached

**Solution:**
1. Run `node product-grants-integrator.js`
2. Verify JSON file updated
3. Hard refresh browser (Ctrl+F5)

### Collection Agencies Not Added

**Cause:** Category doesn't have collection mapping

**Solution:**
1. Add collection agency mapping for category
2. Rerun integration script

---

## 📞 API Endpoints for Products with Grants

| Endpoint | Purpose |
|----------|---------|
| `/api/products` | Get all products (basic) |
| `/api/shop-products` | Products with shop categories |
| `/api/product-widget/:id` | Single product with full data |
| `/api/schemes` | Get all grants & schemes |

---

## 📚 Related Documentation

- `HOW-TO-ADD-MORE-GRANTS.md` - Adding new grants
- `GRANTS_OVERLAY_SYSTEM_DOCUMENTATION.md` - Overlay system details
- `GRANTS_PORTAL_UPDATE_GUIDE.md` - Updating grants portal
- `grants-schemes-finder.md` - Finding new grants (weekly skill)

---

## 🔄 Workflow Integration

This skill works with other skills:

1. **Market Manager** - After adding product, may need image assignment
2. **Media Skill** - Find product images before adding
3. **Grants Finder** - Weekly updates to grants data
4. **Systems** - Verify deployment after adding products

---

## 📅 Maintenance Tasks

### Weekly
- Run `grants-schemes-finder.md` to check for new grants
- Update `schemes.json` with any new grants found
- Re-run `product-grants-integrator.js` if grants updated

### Monthly
- Review collection agencies for accuracy
- Check grant expiration dates
- Update region-specific grant data

### Quarterly
- Full audit of grants mapping
- Update grant amounts if changed
- Add new categories if needed

---

**Remember:** NO PRODUCT should be added to the marketplace without grants enrichment. This ensures customers always see available funding options!

---

*Last Updated: January 2026*  
*Maintained By: Energy Calculator Backend System*
