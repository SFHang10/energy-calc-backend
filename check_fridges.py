import json

# Check fridges in static file
with open('etl-products-static.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fridges = [p for p in data['products'] if p.get('type') == 'fridge']
print(f'Fridges in static file: {len(fridges)}')
print('\nFirst 10 fridges:')
for i, p in enumerate(fridges[:10]):
    print(f'  {i+1}. {p.get("name", "Unknown")} - {p.get("brand", "Unknown")}')

print(f'\nTotal products in file: {len(data["products"])}')
print(f'Product types: {list(data["productTypes"].keys())}')
print(f'Fridge count by type: {data["productTypes"].get("fridge", 0)}')










