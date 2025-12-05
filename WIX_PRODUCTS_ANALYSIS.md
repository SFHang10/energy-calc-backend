# Wix Products Analysis & Merge Plan

## Summary
Successfully fetched **151 products** from the Wix marketplace. Most are professional restaurant equipment (Electrolux, Zanussi combi ovens, hand dryers, etc.) which appear to be duplicates or additional information sources for the 5,556 products in the local database.

## Products Found

### Categories:
1. **Combi Ovens** (Electrolux Professional Skyline series) - ~50 variants
2. **Combi Ovens** (Zanussi Magistar series) - ~15 variants
3. **Hand Dryers** (Air Fury, Turbo Force) - 6 models
4. **Baking Ovens** (Invoq by Lincat) - 5 models
5. **Heat Pumps** (Baxi Auriga) - 1 model
6. **Generic products** (Smart Thermostat, Air Purifier, etc.) - 8 items
7. **ETL Professional Equipment** - 66 items

### Key Observations:
- All products have **high-quality images** hosted on Wix CDN
- All products have detailed descriptions with HTML formatting
- All products have **ETL certification** badges/ribbons
- Prices are in EUR
- Many products have multiple images and videos
- All products are "in stock" and "visible"

## Sample Product Structure (Wix API):

```json
{
  "id": "d9083600-de75-e127-f810-d06b04de244e",
  "name": "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT",
  "price": 14419 (EUR),
  "description": "<p>HTML content...</p>",
  "media": {
    "mainMedia": {
      "image": {
        "url": "https://static.wixstatic.com/media/..."
      }
    },
    "items": [
      {
        "image": {
          "url": "https://static.wixstatic.com/media/..."
        }
      }
    ]
  },
  "ribbons": [{"text": "Government Certified (ETL)"}],
  "additionalInfoSections": [...],
  "productPageUrl": {
    "path": "/product-page/..."
  }
}
```

## Merging Strategy

Since these are likely duplicates from your 5,556 product database, here's the merge strategy:

### 1. Matching Logic
- Match by name (case-insensitive, fuzzy matching)
- Match by SKU (if available)
- Match by model number (if available)
- Priority: Exact match > Contains match > SKU match

### 2. Enrichment Rules (Add Only, Don't Overwrite)
- **Images**: Add Wix image URLs if local product has `imageUrl: null`
- **Additional Images**: Append to existing images array
- **Descriptions**: Add rich HTML descriptions if local has placeholder text
- **Videos**: Add video URLs from Wix
- **Ribbons/Badges**: Add ETL certification info
- **Wix Metadata**: Store Wix product ID and URL for future sync
- **Additional Info Sections**: Merge specifications and details

### 3. Fields to Enhance
✅ **imageUrl** - Main product image
✅ **images** - Additional images array
✅ **videos** - Video URLs
✅ **descriptionFull** - Detailed description
✅ **additionalInfo** - Extra specifications
✅ **ribbons** - ETL certification badges
✅ **wixId** - Reference to Wix product
✅ **wixProductUrl** - Link to Wix product page
✅ **enrichedFromWix** - Flag indicating enrichment
✅ **enrichedDate** - Timestamp of enrichment

## Next Steps

### Option 1: Manual Review (Recommended for First 20 Products)
1. Run a test merge on the first 20 Wix products
2. Review the matches to ensure accuracy
3. Adjust matching logic if needed
4. Run full merge

### Option 2: Automated Full Merge
1. I can create a complete merge script
2. It will process all 151 products
3. Generate an enriched database file
4. Create a backup of original before merging

## Files to Create

1. ✅ **WIX_PRODUCTS_ANALYSIS.md** (this file)
2. ⏳ **merge-wix-products.js** - Complete merge script
3. ⏳ **WIX_PRODUCTS_DATA.json** - Extracted Wix products data
4. ⏳ **FULL-DATABASE-5554-ENRICHED.json** - Merged result

## Recommendations

Since you mentioned "do you want to try again?", I suggest:

1. **Test Run First**: Merge just 5-10 products to verify the logic
2. **Review Matches**: Check that products are matched correctly
3. **Adjust if Needed**: Fine-tune the matching algorithm
4. **Full Merge**: Process all 151 products

Would you like me to:
- [ ] Create a test merge script (first 10 products)?
- [ ] Create the full merge script (all 151 products)?
- [ ] Create the Wix products JSON file first for review?



## Summary
Successfully fetched **151 products** from the Wix marketplace. Most are professional restaurant equipment (Electrolux, Zanussi combi ovens, hand dryers, etc.) which appear to be duplicates or additional information sources for the 5,556 products in the local database.

## Products Found

### Categories:
1. **Combi Ovens** (Electrolux Professional Skyline series) - ~50 variants
2. **Combi Ovens** (Zanussi Magistar series) - ~15 variants
3. **Hand Dryers** (Air Fury, Turbo Force) - 6 models
4. **Baking Ovens** (Invoq by Lincat) - 5 models
5. **Heat Pumps** (Baxi Auriga) - 1 model
6. **Generic products** (Smart Thermostat, Air Purifier, etc.) - 8 items
7. **ETL Professional Equipment** - 66 items

### Key Observations:
- All products have **high-quality images** hosted on Wix CDN
- All products have detailed descriptions with HTML formatting
- All products have **ETL certification** badges/ribbons
- Prices are in EUR
- Many products have multiple images and videos
- All products are "in stock" and "visible"

## Sample Product Structure (Wix API):

```json
{
  "id": "d9083600-de75-e127-f810-d06b04de244e",
  "name": "Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101T2AT",
  "price": 14419 (EUR),
  "description": "<p>HTML content...</p>",
  "media": {
    "mainMedia": {
      "image": {
        "url": "https://static.wixstatic.com/media/..."
      }
    },
    "items": [
      {
        "image": {
          "url": "https://static.wixstatic.com/media/..."
        }
      }
    ]
  },
  "ribbons": [{"text": "Government Certified (ETL)"}],
  "additionalInfoSections": [...],
  "productPageUrl": {
    "path": "/product-page/..."
  }
}
```

## Merging Strategy

Since these are likely duplicates from your 5,556 product database, here's the merge strategy:

### 1. Matching Logic
- Match by name (case-insensitive, fuzzy matching)
- Match by SKU (if available)
- Match by model number (if available)
- Priority: Exact match > Contains match > SKU match

### 2. Enrichment Rules (Add Only, Don't Overwrite)
- **Images**: Add Wix image URLs if local product has `imageUrl: null`
- **Additional Images**: Append to existing images array
- **Descriptions**: Add rich HTML descriptions if local has placeholder text
- **Videos**: Add video URLs from Wix
- **Ribbons/Badges**: Add ETL certification info
- **Wix Metadata**: Store Wix product ID and URL for future sync
- **Additional Info Sections**: Merge specifications and details

### 3. Fields to Enhance
✅ **imageUrl** - Main product image
✅ **images** - Additional images array
✅ **videos** - Video URLs
✅ **descriptionFull** - Detailed description
✅ **additionalInfo** - Extra specifications
✅ **ribbons** - ETL certification badges
✅ **wixId** - Reference to Wix product
✅ **wixProductUrl** - Link to Wix product page
✅ **enrichedFromWix** - Flag indicating enrichment
✅ **enrichedDate** - Timestamp of enrichment

## Next Steps

### Option 1: Manual Review (Recommended for First 20 Products)
1. Run a test merge on the first 20 Wix products
2. Review the matches to ensure accuracy
3. Adjust matching logic if needed
4. Run full merge

### Option 2: Automated Full Merge
1. I can create a complete merge script
2. It will process all 151 products
3. Generate an enriched database file
4. Create a backup of original before merging

## Files to Create

1. ✅ **WIX_PRODUCTS_ANALYSIS.md** (this file)
2. ⏳ **merge-wix-products.js** - Complete merge script
3. ⏳ **WIX_PRODUCTS_DATA.json** - Extracted Wix products data
4. ⏳ **FULL-DATABASE-5554-ENRICHED.json** - Merged result

## Recommendations

Since you mentioned "do you want to try again?", I suggest:

1. **Test Run First**: Merge just 5-10 products to verify the logic
2. **Review Matches**: Check that products are matched correctly
3. **Adjust if Needed**: Fine-tune the matching algorithm
4. **Full Merge**: Process all 151 products

Would you like me to:
- [ ] Create a test merge script (first 10 products)?
- [ ] Create the full merge script (all 151 products)?
- [ ] Create the Wix products JSON file first for review?




















