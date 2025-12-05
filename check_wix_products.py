import json

# Check Wix products
try:
    with open('wix_products_export.json', 'r', encoding='utf-8-sig') as f:
        wix_data = json.load(f)
    
    print(f"Wix products: {len(wix_data)}")
    
    # Look for fridges in Wix data
    fridges = []
    for product in wix_data:
        name = product.get('name', '').lower()
        if 'fridge' in name or 'refrigerator' in name or 'cooler' in name:
            fridges.append(product)
    
    print(f"Wix fridges: {len(fridges)}")
    
    if fridges:
        print("\nSample Wix fridges:")
        for i, fridge in enumerate(fridges[:10], 1):
            print(f"  {i}. {fridge.get('name', 'Unknown')}")
    
    # Check if Wix has more products than ETL
    print(f"\nComparison:")
    print(f"  ETL products: 3,842")
    print(f"  Wix products: {len(wix_data)}")
    
    if len(wix_data) > 3842:
        print(f"  ⚠️  Wix has {len(wix_data) - 3842} MORE products than ETL!")
    else:
        print(f"  ✅ ETL has more products than Wix")
        
except Exception as e:
    print(f"Error reading Wix products: {e}")









