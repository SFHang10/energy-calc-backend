import json

# Your product data
products_data = """
F001 | Classic Refrigerator | 0.65 | fridge | Whirlpool | 1995 | Very Low
F002 | Standard Fridge | 0.58 | fridge | Frigidaire | 1998 | Very Low
F003 | Budget Refrigerator | 0.72 | fridge | Generic | 2000 | Low
F004 | Family Fridge | 0.61 | fridge | GE | 1992 | Very Low
F005 | Compact Refrigerator | 0.45 | fridge | Samsung | 2003 | Low
F006 | Side-by-Side Fridge | 0.85 | fridge | LG | 2001 | Very Low
F007 | Top Freezer Model | 0.55 | fridge | Kenmore | 1997 | Low
F008 | Bottom Freezer Fridge | 0.68 | fridge | Bosch | 2004 | Low
F009 | French Door Refrigerator | 0.78 | fridge | Maytag | 2005 | Low
F010 | Mini Fridge | 0.35 | fridge | Haier | 2006 | Standard
F011 | Commercial Style Fridge | 0.92 | fridge | Sub-Zero | 1999 | Very Low
F012 | Apartment Refrigerator | 0.52 | fridge | Amana | 2002 | Low
F013 | Garage Fridge | 0.69 | fridge | Frigidaire | 1994 | Very Low
F014 | Vintage Refrigerator | 0.88 | fridge | Generic | 1988 | Very Low
F015 | Economy Fridge | 0.63 | fridge | Whirlpool | 2001 | Low
F016 | Standard Top Mount | 0.57 | fridge | GE | 2003 | Low
F017 | Large Capacity Fridge | 0.74 | fridge | Samsung | 1999 | Very Low
F018 | Dorm Room Refrigerator | 0.28 | fridge | Magic Chef | 2005 | Standard
F019 | Double Door Fridge | 0.66 | fridge | LG | 2000 | Low
F020 | Basic Refrigerator | 0.59 | fridge | Kenmore | 1996 | Very Low
F021 | Old Style Fridge | 0.81 | fridge | Generic | 1991 | Very Low
F022 | Counter Depth Refrigerator | 0.71 | fridge | Bosch | 2004 | Low
F023 | Ice Maker Fridge | 0.76 | fridge | Whirlpool | 2002 | Low
F024 | Standard Refrigerator | 0.64 | fridge | Maytag | 1998 | Low
F025 | Beverage Fridge | 0.42 | fridge | Danby | 2006 | Standard
F026 | Side Mount Freezer | 0.67 | fridge | GE | 2001 | Low
F027 | Classic White Fridge | 0.62 | fridge | Frigidaire | 1997 | Very Low
F028 | Energy Guzzler Model | 0.94 | fridge | Generic | 1989 | Very Low
F029 | Basic Black Fridge | 0.58 | fridge | Samsung | 2004 | Low
F030 | Water Dispenser Fridge | 0.73 | fridge | LG | 2003 | Low
F031 | Retro Refrigerator | 0.79 | fridge | Smeg | 2005 | Low
F032 | Studio Fridge | 0.48 | fridge | Haier | 2006 | Standard
F033 | Two Door Standard | 0.61 | fridge | Kenmore | 1999 | Low
F034 | Large Family Fridge | 0.82 | fridge | Whirlpool | 1995 | Very Low
F035 | Basement Refrigerator | 0.70 | fridge | Generic | 2000 | Low
F036 | Standard White Model | 0.56 | fridge | GE | 2002 | Low
F037 | Through-Door Ice Fridge | 0.77 | fridge | Maytag | 2001 | Low
F038 | Compact Studio Fridge | 0.38 | fridge | Magic Chef | 2005 | Standard
F039 | Old Technology Fridge | 0.86 | fridge | Generic | 1993 | Very Low
F040 | Basic Economy Model | 0.60 | fridge | Frigidaire | 2003 | Low
F041 | Premium Old Fridge | 0.75 | fridge | Sub-Zero | 2000 | Low
F042 | Standard Capacity | 0.65 | fridge | Samsung | 1998 | Very Low
F043 | Bar Refrigerator | 0.32 | fridge | Danby | 2006 | Standard
F044 | Classic Side-by-Side | 0.84 | fridge | LG | 1999 | Very Low
F045 | Top Mount Classic | 0.54 | fridge | Kenmore | 2004 | Low
F046 | Heavy Duty Fridge | 0.89 | fridge | Commercial | 1996 | Very Low
F047 | Standard Home Model | 0.63 | fridge | Whirlpool | 2002 | Low
F048 | Small Apartment Fridge | 0.47 | fridge | Amana | 2005 | Standard
F049 | Inefficient Old Model | 0.91 | fridge | Generic | 1990 | Very Low
F050 | Middle Range Fridge | 0.68 | fridge | GE | 2001 | Low
F051 | Budget White Fridge | 0.59 | fridge | Frigidaire | 2004 | Low
F052 | Large Side-by-Side | 0.87 | fridge | Samsung | 2000 | Very Low
F053 | Office Refrigerator | 0.41 | fridge | Haier | 2006 | Standard
F054 | Classic Bottom Freezer | 0.66 | fridge | Bosch | 2003 | Low
F055 | Old Reliable Model | 0.72 | fridge | Maytag | 1997 | Very Low
F056 | Basic Two Door | 0.57 | fridge | Kenmore | 2002 | Low
F057 | High Consumption Fridge | 0.93 | fridge | Generic | 1992 | Very Low
F058 | Standard Refrigerator | 0.62 | fridge | Whirlpool | 2004 | Low
F059 | Compact Efficiency | 0.36 | fridge | Magic Chef | 2006 | Standard
F060 | French Door Old Style | 0.80 | fridge | LG | 2002 | Low
F061 | Garage Ready Fridge | 0.71 | fridge | Frigidaire | 1999 | Very Low
F062 | Standard Family Size | 0.64 | fridge | GE | 2003 | Low
F063 | Old Counter Depth | 0.69 | fridge | Samsung | 2001 | Low
F064 | Mini Bar Fridge | 0.30 | fridge | Danby | 2005 | Standard
F065 | Classic Top Mount | 0.58 | fridge | Kenmore | 2000 | Low
F066 | High Power Fridge | 0.85 | fridge | Generic | 1994 | Very Low
F067 | Standard Black Model | 0.61 | fridge | Maytag | 2004 | Low
F068 | Small Capacity Fridge | 0.44 | fridge | Haier | 2006 | Standard
F069 | Old Side-by-Side | 0.83 | fridge | Whirlpool | 1998 | Very Low
F070 | Basic Refrigerator | 0.65 | fridge | Frigidaire | 2002 | Low
F071 | Premium Inefficient | 0.78 | fridge | Sub-Zero | 2001 | Low
F072 | Standard White Fridge | 0.60 | fridge | GE | 2004 | Low
F073 | Vintage Model | 0.90 | fridge | Generic | 1989 | Very Low
F074 | Modern Old Fridge | 0.67 | fridge | Samsung | 2003 | Low
F075 | Compact Office Fridge | 0.39 | fridge | Magic Chef | 2006 | Standard
F076 | Large Capacity Old | 0.76 | fridge | LG | 2000 | Low
F077 | Classic Economy | 0.56 | fridge | Kenmore | 2003 | Low
F078 | Power Hungry Fridge | 0.88 | fridge | Generic | 1991 | Very Low
F079 | Standard Apartment | 0.53 | fridge | Amana | 2005 | Standard
F080 | Double Door Classic | 0.70 | fridge | Whirlpool | 1999 | Very Low
F081 | Basic Home Fridge | 0.63 | fridge | Frigidaire | 2004 | Low
F082 | Old Technology Model | 0.82 | fridge | Generic | 1995 | Very Low
F083 | Beverage Center | 0.34 | fridge | Danby | 2006 | Standard
F084 | Side-by-Side Classic | 0.86 | fridge | Samsung | 2001 | Low
F085 | Top Freezer Standard | 0.59 | fridge | GE | 2003 | Low
F086 | Inefficient Vintage | 0.92 | fridge | Generic | 1988 | Very Low
F087 | Mid-Range Model | 0.66 | fridge | Maytag | 2002 | Low
F088 | Small Fridge | 0.43 | fridge | Haier | 2006 | Standard
F089 | Classic Large Fridge | 0.75 | fridge | Whirlpool | 2000 | Low
F090 | Standard Efficiency | 0.62 | fridge | Kenmore | 2004 | Low
F091 | Old Garage Model | 0.73 | fridge | Frigidaire | 1996 | Very Low
F092 | Basic Two Door | 0.58 | fridge | GE | 2002 | Low
F093 | High Use Fridge | 0.84 | fridge | Generic | 1993 | Very Low
F094 | Counter Style Fridge | 0.68 | fridge | Bosch | 2004 | Low
F095 | Mini Refrigerator | 0.37 | fridge | Magic Chef | 2006 | Standard
F096 | French Door Classic | 0.79 | fridge | LG | 2003 | Low
F097 | Standard Home Fridge | 0.64 | fridge | Samsung | 2001 | Low
F098 | Old Reliable | 0.71 | fridge | Whirlpool | 1998 | Very Low
F099 | Economy Model | 0.55 | fridge | Frigidaire | 2005 | Low
F100 | Vintage High Power | 0.95 | fridge | Generic | 1987 | Very Low
"""

# Parse the data and create JSON
products = []
lines = products_data.strip().split('\n')

for line in lines:
    if line.strip():
        parts = [p.strip() for p in line.split('|')]
        if len(parts) >= 7:
            product = {
                "id": parts[0],
                "name": parts[1],
                "power": float(parts[2]),
                "type": parts[3],
                "brand": parts[4],
                "year": parts[5],
                "efficiency": parts[6],
                "icon": "🧊",
                "category": "current",
                "notes": f"Old {parts[3]} model from {parts[5]}"
            }
            products.append(product)

# Create the JSON structure
json_data = {
    "lastUpdated": "2025-01-10T17:30:00.000Z",
    "totalProducts": len(products),
    "description": "Old/inefficient products for comparison against modern ETL-certified alternatives",
    "products": products
}

# Write to file
with open('current-products.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)

print(f"✅ Created current-products.json with {len(products)} products")
print(f"📊 Product breakdown:")
type_counts = {}
for p in products:
    type_counts[p['type']] = type_counts.get(p['type'], 0) + 1
for ptype, count in type_counts.items():
    print(f"  {ptype}: {count}")









