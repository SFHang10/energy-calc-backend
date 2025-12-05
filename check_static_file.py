import json

# Check the static file
with open('etl-products-static.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total products: {data['totalProducts']}")
print(f"Categories: {list(data['categories'].keys())}")
print(f"Product types: {list(data['productTypes'].keys())}")

# Check a specific product type
motor_products = [p for p in data['products'] if p.get('type') == 'motor']
print(f"\nMotor products: {len(motor_products)}")

fridge_products = [p for p in data['products'] if p.get('type') == 'fridge']
print(f"Fridge products: {len(fridge_products)}")

# Show first few motor products
print(f"\nFirst 3 motor products:")
for i, product in enumerate(motor_products[:3]):
    print(f"  {i+1}. {product.get('name', 'Unknown')} - {product.get('brand', 'Unknown')}")










