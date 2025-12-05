import json

# Load the ETL static data
with open('etl-products-static.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total products: {data['totalProducts']}")
print(f"Last updated: {data['lastUpdated']}")
print(f"Sample product keys: {list(data['products'][0].keys())}")
print(f"\nFirst product:")
for key, value in data['products'][0].items():
    print(f"  {key}: {value}")

# Check product types
type_counts = {}
for product in data['products']:
    product_type = product.get('type', 'unknown')
    type_counts[product_type] = type_counts.get(product_type, 0) + 1

print(f"\nProduct type breakdown:")
for ptype, count in sorted(type_counts.items()):
    print(f"  {ptype}: {count}")

# Check for missing required fields
required_fields = ['id', 'name', 'power', 'type', 'icon']
missing_fields = {}
for field in required_fields:
    missing_count = sum(1 for p in data['products'] if not p.get(field))
    if missing_count > 0:
        missing_fields[field] = missing_count

if missing_fields:
    print(f"\nMissing required fields:")
    for field, count in missing_fields.items():
        print(f"  {field}: {count} products missing")
else:
    print(f"\n✅ All products have required fields")









