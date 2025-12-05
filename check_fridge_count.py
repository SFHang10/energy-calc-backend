import json

# Load the ETL static data
with open('etl-products-static.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Count fridges
fridges = [p for p in data['products'] if p['type'] == 'fridge']
print(f"ETL Fridges: {len(fridges)}")

print("\nSample ETL fridges:")
for i, fridge in enumerate(fridges[:10], 1):
    print(f"  {i}. {fridge['name']} ({fridge['brand']})")

# Check if there are other files with more products
print(f"\nTotal products in ETL data: {data['totalProducts']}")

# Check other JSON files that might have more products
import os
json_files = [f for f in os.listdir('.') if f.endswith('.json') and 'product' in f.lower()]
print(f"\nOther product JSON files found:")
for file in json_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            other_data = json.load(f)
            if isinstance(other_data, list):
                print(f"  {file}: {len(other_data)} items")
            elif isinstance(other_data, dict) and 'products' in other_data:
                print(f"  {file}: {len(other_data['products'])} products")
            else:
                print(f"  {file}: {len(other_data)} items (structure unknown)")
    except Exception as e:
        print(f"  {file}: Error reading - {e}")









