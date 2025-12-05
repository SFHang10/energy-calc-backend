# 🎁 Grants Data Overlay System Documentation

## 📋 **Overview**
The Grants Data Overlay System is a **safe, non-destructive** method for adding grants and collection agency data to products without modifying existing databases or files. This approach ensures data integrity while providing enhanced functionality.

## 🎯 **Core Concept**
Instead of modifying existing data sources, we create a **JavaScript overlay system** that enhances products with grants data on-the-fly, keeping all original files unchanged.

## 🔧 **How It Works**

### 1. **Separate Data Loading**
- Loads `products-with-grants.json` separately
- Loads `products-with-collection.json` separately  
- Keeps `FULL-DATABASE-5554.json` and databases unchanged

### 2. **Create Lookup Caches**
```javascript
grantsDataCache = Map {
  "sample_27" => { grants: [...], grantsTotal: 100, ... },
  "oven_1" => { grants: [...], grantsTotal: 500, ... }
}
```

### 3. **Enhance Products On-Demand**
- When a product is selected/displayed
- Check if it has grants data in the cache
- If yes: merge grants data into a copy of the product
- If no: use original product unchanged

### 4. **Safe Enhancement**
```javascript
function enhanceProductWithGrantsData(product) {
    const enhancedProduct = { ...product }; // Create copy
    
    // Add grants if available
    const grantsData = grantsDataCache.get(product.id);
    if (grantsData) {
        enhancedProduct.grants = grantsData.grants;
        enhancedProduct.grantsTotal = grantsData.grantsTotal;
    }
    
    return enhancedProduct; // Return enhanced copy
}
```

## ✅ **Why It's Safe**

- **No file modifications**: Original files stay untouched
- **No database changes**: Databases remain unchanged
- **Test file only**: Only affects `energy-audit-widget-v3-embedded-test.html`
- **Reversible**: Can be removed easily
- **Non-destructive**: Original data always preserved

## 🚀 **Implementation Steps**

### Step 1: Add Grants Overlay System
Add these functions to the calculator file:

```javascript
// Grants data cache - stores grants data by product ID
let grantsDataCache = new Map();
let collectionDataCache = new Map();

// Load grants data separately (safe overlay approach)
async function loadGrantsData() {
    try {
        console.log('🔄 Loading grants data overlay...');
        const response = await fetch('http://localhost:4000/products-with-grants.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const grantsProducts = data.products || [];
        
        // Create grants lookup cache
        grantsProducts.forEach(product => {
            if (product.grants && product.grants.length > 0) {
                grantsDataCache.set(product.id, {
                    grants: product.grants,
                    grantsTotal: product.grantsTotal || 0,
                    grantsCurrency: product.grantsCurrency || 'EUR',
                    grantsRegion: product.grantsRegion || 'uk.england'
                });
            }
        });
        
        console.log(`✅ Loaded grants data for ${grantsDataCache.size} products`);
        
    } catch (error) {
        console.error('❌ Error loading grants data:', error);
    }
}

// Load collection data separately (safe overlay approach)
async function loadCollectionData() {
    try {
        console.log('🔄 Loading collection data overlay...');
        const response = await fetch('http://localhost:4000/products-with-collection.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const collectionProducts = data.products || [];
        
        // Create collection lookup cache
        collectionProducts.forEach(product => {
            if (product.collectionAgencies && product.collectionAgencies.length > 0) {
                collectionDataCache.set(product.id, {
                    collectionAgencies: product.collectionAgencies,
                    collectionIncentiveTotal: product.collectionIncentiveTotal || 0,
                    collectionCurrency: product.collectionCurrency || 'Points',
                    collectionRegion: product.collectionRegion || 'uk.england'
                });
            }
        });
        
        console.log(`✅ Loaded collection data for ${collectionDataCache.size} products`);
        
    } catch (error) {
        console.error('❌ Error loading collection data:', error);
    }
}

// Enhance product with grants and collection data (safe overlay)
function enhanceProductWithGrantsData(product) {
    const enhancedProduct = { ...product }; // Create copy to avoid modifying original
    
    // Add grants data if available
    const grantsData = grantsDataCache.get(product.id);
    if (grantsData) {
        enhancedProduct.grants = grantsData.grants;
        enhancedProduct.grantsTotal = grantsData.grantsTotal;
        enhancedProduct.grantsCurrency = grantsData.grantsCurrency;
        enhancedProduct.grantsRegion = grantsData.grantsRegion;
        console.log(`🎁 Enhanced ${product.name} with grants: €${grantsData.grantsTotal}`);
    }
    
    // Add collection data if available
    const collectionData = collectionDataCache.get(product.id);
    if (collectionData) {
        enhancedProduct.collectionAgencies = collectionData.collectionAgencies;
        enhancedProduct.collectionIncentiveTotal = collectionData.collectionIncentiveTotal;
        enhancedProduct.collectionCurrency = collectionData.collectionCurrency;
        enhancedProduct.collectionRegion = collectionData.collectionRegion;
        console.log(`♻️ Enhanced ${product.name} with collection: ${collectionData.collectionIncentiveTotal} ${collectionData.collectionCurrency}`);
    }
    
    return enhancedProduct;
}

// Initialize grants overlay system
async function initializeGrantsOverlay() {
    console.log('🚀 Initializing grants data overlay system...');
    await Promise.all([
        loadGrantsData(),
        loadCollectionData()
    ]);
    console.log('✅ Grants overlay system ready!');
}
```

### Step 2: Initialize on Page Load
Add to the `DOMContentLoaded` event handler:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    // Initialize grants overlay system
    initializeGrantsOverlay();
});
```

### Step 3: Enhance Product Selection
Modify the product selection function to use enhanced products:

```javascript
function selectETLProduct(productId, targetSpace) {
    // ... existing product lookup code ...
    
    // Enhance with grants data overlay
    product = enhanceProductWithGrantsData(product);
    console.log('🎁 Product enhanced with grants overlay');
    
    // ... rest of function ...
}
```

## 📊 **Data Sources**

### Grants Data File: `products-with-grants.json`
```json
{
  "products": [
    {
      "id": "sample_27",
      "name": "Amana Microwave",
      "grants": [
        {
          "name": "Kitchen Efficiency Grant",
          "amount": 100,
          "currency": "EUR",
          "description": "Energy efficient microwave grant",
          "applicationUrl": "https://www.gov.uk/kitchen-efficiency-scheme"
        }
      ],
      "grantsTotal": 100,
      "grantsCurrency": "EUR",
      "grantsRegion": "uk.england"
    }
  ]
}
```

### Collection Data File: `products-with-collection.json`
```json
{
  "products": [
    {
      "id": "sample_27",
      "name": "Amana Microwave",
      "collectionAgencies": [
        {
          "name": "Currys PC World",
          "incentive": 200,
          "currency": "Points",
          "type": "Retailer"
        }
      ],
      "collectionIncentiveTotal": 200,
      "collectionCurrency": "Points",
      "collectionRegion": "uk.england"
    }
  ]
}
```

## 🔄 **Updating Grants Data**

### To Add New Grants:
1. **Update `products-with-grants.json`** with new grants data
2. **No code changes needed** - overlay system automatically picks up new data
3. **Test in calculator** - grants will appear automatically

### To Modify Existing Grants:
1. **Edit `products-with-grants.json`** with updated grants
2. **Refresh the calculator** - new grants data loads automatically
3. **No file modifications** - original data remains unchanged

### To Add New Products with Grants:
1. **Add product to `products-with-grants.json`** with grants data
2. **Ensure product ID matches** the main product database
3. **Grants overlay** will automatically enhance the product

## 🧪 **Testing**

### Debug Messages
The system provides detailed console logging:
- `🔄 Loading grants data overlay...`
- `✅ Loaded grants data for X products`
- `🎁 Enhanced [Product Name] with grants: €X`
- `♻️ Enhanced [Product Name] with collection: X Points`

### Verification Steps
1. **Open browser console** to see debug messages
2. **Select a product** with grants (e.g., Amana Microwave)
3. **Check console** for enhancement messages
4. **Verify grants display** in calculator results

## 🎯 **Benefits**

- **Safe**: No risk of data corruption
- **Reversible**: Can be removed without impact
- **Scalable**: Easy to add more grants data
- **Maintainable**: Clear separation of concerns
- **Testable**: Easy to verify functionality

## 📝 **Best Practices**

1. **Always test in test files first** before applying to production
2. **Keep grants data files separate** from main product data
3. **Use consistent product IDs** across all data sources
4. **Monitor console logs** for debugging and verification
5. **Backup grants data files** before making changes

## 🚨 **Important Notes**

- **This system only affects the test file** (`energy-audit-widget-v3-embedded-test.html`)
- **Original data files remain completely unchanged**
- **Grants data is loaded from separate JSON files**
- **No database modifications are made**
- **System is completely reversible**

---

*Last Updated: January 2025*  
*Status: ✅ Implemented and Working*  
*Next Review: When updating grants data*


















