import json

# Read existing commercial products
with open('commercial-products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# European Commercial Refrigerators (25 products)
european_fridges = [
    {"id": "EUR001", "name": "Single Door Upright 600L", "power": 0.78, "type": "fridge", "brand": "Gram", "year": 1996, "efficiency": "Very Low", "category": "commercial", "curated": True},
    {"id": "EUR002", "name": "Double Door Reach-In 1400L", "power": 1.15, "type": "fridge", "brand": "Iarp", "year": 1999, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR003", "name": "Gastronorm Cabinet GN 2/1", "power": 0.92, "type": "fridge", "brand": "Electrolux", "year": 2001, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR004", "name": "Pizza Counter Refrigerated", "power": 0.82, "type": "fridge", "brand": "Tecnodom", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR005", "name": "Saladette 3-Door", "power": 0.88, "type": "fridge", "brand": "Inomak", "year": 2004, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR006", "name": "Under Counter 230L", "power": 0.58, "type": "fridge", "brand": "Polar", "year": 2005, "efficiency": "Standard", "category": "commercial", "curated": True},
    {"id": "EUR007", "name": "Bottle Cooler Double Door", "power": 0.95, "type": "fridge", "brand": "Gamko", "year": 2000, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR008", "name": "Meat Aging Cabinet", "power": 1.42, "type": "fridge", "brand": "DRY AGER", "year": 2002, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR009", "name": "Cold Room 2x3m", "power": 2.6, "type": "fridge", "brand": "Mercatus", "year": 1994, "efficiency": "Very Low", "category": "commercial", "curated": True},
    {"id": "EUR010", "name": "Display Fridge 3-Shelf", "power": 1.05, "type": "fridge", "brand": "Scaiola", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR011", "name": "Patisserie Counter 4-Door", "power": 1.38, "type": "fridge", "brand": "Infrico", "year": 2001, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR012", "name": "Fish Display Cabinet", "power": 1.28, "type": "fridge", "brand": "Oscartielle", "year": 2000, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR013", "name": "Wine Cooler Dual Zone", "power": 0.45, "type": "fridge", "brand": "Liebherr", "year": 2006, "efficiency": "Standard", "category": "commercial", "curated": True},
    {"id": "EUR014", "name": "Old Cold Room 3x4m", "power": 3.8, "type": "fridge", "brand": "Generic", "year": 1990, "efficiency": "Very Low", "category": "commercial", "curated": True},
    {"id": "EUR015", "name": "Gastronorm Trolley Fridge", "power": 0.68, "type": "fridge", "brand": "Foster", "year": 2004, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUR016", "name": "Back Bar Cooler 3-Door", "power": 0.85, "type": "fridge", "brand": "Gamko", "year": 2002, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUR017", "name": "Prep Counter 2-Door GN", "power": 0.74, "type": "fridge", "brand": "Polar", "year": 2005, "efficiency": "Standard", "category": "commercial", "curated": False},
    {"id": "EUR018", "name": "Display Cabinet Ventilated", "power": 1.18, "type": "fridge", "brand": "ISA", "year": 1998, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUR019", "name": "Cold Room 4x5m", "power": 4.2, "type": "fridge", "brand": "Mercatus", "year": 1993, "efficiency": "Very Low", "category": "commercial", "curated": False},
    {"id": "EUR020", "name": "Snack Counter Refrigerated", "power": 0.72, "type": "fridge", "brand": "Tecnodom", "year": 2004, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUR021", "name": "Cheese Storage Cabinet", "power": 0.96, "type": "fridge", "brand": "Liebherr", "year": 2001, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUR022", "name": "Drink Display Cooler", "power": 1.22, "type": "fridge", "brand": "Framec", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUR023", "name": "Under Counter Drawer 4GN", "power": 0.64, "type": "fridge", "brand": "Electrolux", "year": 2006, "efficiency": "Standard", "category": "commercial", "curated": False},
    {"id": "EUR024", "name": "Vintage Cold Room 3x3m", "power": 3.5, "type": "fridge", "brand": "Generic", "year": 1988, "efficiency": "Very Low", "category": "commercial", "curated": False},
    {"id": "EUR025", "name": "Bakery Display Counter", "power": 1.12, "type": "fridge", "brand": "Tecfrigo", "year": 2002, "efficiency": "Low", "category": "commercial", "curated": False}
]

# European Commercial Freezers (25 products)
european_freezers = [
    {"id": "EUF001", "name": "Single Door Upright 600L", "power": 0.92, "type": "freezer", "brand": "Gram", "year": 1996, "efficiency": "Very Low", "category": "commercial", "curated": True},
    {"id": "EUF002", "name": "Double Door Reach-In 1400L", "power": 1.38, "type": "freezer", "brand": "Iarp", "year": 1999, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF003", "name": "Gastronorm Cabinet GN 2/1", "power": 1.12, "type": "freezer", "brand": "Electrolux", "year": 2001, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF004", "name": "Chest Freezer 500L", "power": 0.78, "type": "freezer", "brand": "Tefcold", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF005", "name": "Blast Chiller/Freezer", "power": 3.2, "type": "freezer", "brand": "Irinox", "year": 2004, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF006", "name": "Under Counter 230L", "power": 0.68, "type": "freezer", "brand": "Polar", "year": 2005, "efficiency": "Standard", "category": "commercial", "curated": True},
    {"id": "EUF007", "name": "Ice Cream Display -18°C", "power": 1.45, "type": "freezer", "brand": "ISA", "year": 2000, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF008", "name": "Cold Room Freezer 2x3m", "power": 3.8, "type": "freezer", "brand": "Mercatus", "year": 1994, "efficiency": "Very Low", "category": "commercial", "curated": True},
    {"id": "EUF009", "name": "Gelato Display Cabinet", "power": 1.52, "type": "freezer", "brand": "Framec", "year": 2002, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF010", "name": "Three Door Upright", "power": 1.72, "type": "freezer", "brand": "Foster", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF011", "name": "Drawer Freezer 4GN", "power": 0.82, "type": "freezer", "brand": "Electrolux", "year": 2006, "efficiency": "Standard", "category": "commercial", "curated": True},
    {"id": "EUF012", "name": "Old Freezer Room 3x4m", "power": 5.2, "type": "freezer", "brand": "Generic", "year": 1990, "efficiency": "Very Low", "category": "commercial", "curated": True},
    {"id": "EUF013", "name": "Upright Cabinet 700L", "power": 1.08, "type": "freezer", "brand": "Gram", "year": 2004, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF014", "name": "Chest Freezer 380L", "power": 0.72, "type": "freezer", "brand": "Tefcold", "year": 2005, "efficiency": "Standard", "category": "commercial", "curated": True},
    {"id": "EUF015", "name": "Shock Freezer Cabinet", "power": 2.8, "type": "freezer", "brand": "Irinox", "year": 2001, "efficiency": "Low", "category": "commercial", "curated": True},
    {"id": "EUF016", "name": "Display Freezer Island", "power": 1.85, "type": "freezer", "brand": "AHT", "year": 1998, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUF017", "name": "Freezer Room 4x5m", "power": 5.8, "type": "freezer", "brand": "Mercatus", "year": 1993, "efficiency": "Very Low", "category": "commercial", "curated": False},
    {"id": "EUF018", "name": "Under Counter 2-Door", "power": 0.88, "type": "freezer", "brand": "Polar", "year": 2004, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUF019", "name": "Ice Cream Scooping Cabinet", "power": 1.15, "type": "freezer", "brand": "Oscartielle", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUF020", "name": "Four Door Upright", "power": 2.15, "type": "freezer", "brand": "Iarp", "year": 2002, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUF021", "name": "Blast Freezer 10-Tray", "power": 4.2, "type": "freezer", "brand": "Irinox", "year": 2000, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUF022", "name": "Chest Freezer 600L", "power": 0.95, "type": "freezer", "brand": "Liebherr", "year": 2006, "efficiency": "Standard", "category": "commercial", "curated": False},
    {"id": "EUF023", "name": "Vintage Freezer Room 3x3m", "power": 4.8, "type": "freezer", "brand": "Generic", "year": 1988, "efficiency": "Very Low", "category": "commercial", "curated": False},
    {"id": "EUF024", "name": "Gelato Display 12-Pan", "power": 1.62, "type": "freezer", "brand": "Tecfrigo", "year": 2003, "efficiency": "Low", "category": "commercial", "curated": False},
    {"id": "EUF025", "name": "Gastronorm Trolley Freezer", "power": 0.86, "type": "freezer", "brand": "Foster", "year": 2005, "efficiency": "Standard", "category": "commercial", "curated": False}
]

# Add European products to existing data
data['products'].extend(european_fridges)
data['products'].extend(european_freezers)

# Update curated products count
data['curatedProducts'] = data['curatedProducts'] + 25  # 15 curated fridges + 15 curated freezers

# Write updated data back to file
with open('commercial-products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('✅ Added 50 European commercial products')
print('📊 Total products:', len(data['products']))
print('🎯 Curated products:', data['curatedProducts'])

# Show breakdown
type_counts = {}
for product in data['products']:
    ptype = product['type']
    type_counts[ptype] = type_counts.get(ptype, 0) + 1

print('📊 Product type breakdown:')
for ptype, count in type_counts.items():
    print(f'   {ptype}: {count}')









