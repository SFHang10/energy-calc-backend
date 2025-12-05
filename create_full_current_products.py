#!/usr/bin/env python3
"""
Create a full current-products.json file with 500 old/inefficient products
"""

import json
from datetime import datetime

def create_current_products():
    products = []
    
    # Fridges (100 products)
    for i in range(1, 101):
        power = 0.28 + (i * 0.006)  # Range from 0.28 to 0.95 kW
        year = 1987 + (i % 20)  # Years from 1987 to 2006
        efficiency = "Very Low" if year < 1995 else "Low"
        is_curated = i <= 7  # First 7 are curated
        
        products.append({
            "id": f"F{i:03d}",
            "name": f"Classic Refrigerator {i}",
            "power": round(power, 2),
            "type": "fridge",
            "brand": ["Whirlpool", "Frigidaire", "GE", "Samsung", "LG", "Kenmore", "Maytag", "Amana", "Haier", "Danby"][i % 10],
            "year": str(year),
            "efficiency": efficiency,
            "icon": "🧊",
            "category": "current",
            "isCurated": is_curated,
            "displayName": f"Old Fridge Comparison Model {i}" if is_curated else f"Classic Refrigerator {i}",
            "notes": "Pre-energy rating era" if year < 1995 else "Early energy rating era"
        })
    
    # Ovens (100 products)
    for i in range(1, 101):
        power = 0.6 + (i * 0.045)  # Range from 0.6 to 5.2 kW
        year = 1987 + (i % 20)  # Years from 1987 to 2006
        efficiency = "Very Low" if year < 1995 else "Low"
        is_curated = i <= 7  # First 7 are curated
        
        products.append({
            "id": f"O{i:03d}",
            "name": f"Classic Oven {i}",
            "power": round(power, 1),
            "type": "oven",
            "brand": ["Whirlpool", "GE", "Frigidaire", "Maytag", "Samsung", "Bosch", "Kenmore", "LG", "Thermador", "Viking"][i % 10],
            "year": str(year),
            "efficiency": efficiency,
            "icon": "🔥",
            "category": "current",
            "isCurated": is_curated,
            "displayName": f"Old Oven Comparison Model {i}" if is_curated else f"Classic Oven {i}",
            "notes": "Pre-energy rating era" if year < 1995 else "Early energy rating era"
        })
    
    # Dishwashers (100 products)
    for i in range(1, 101):
        power = 1.2 + (i * 0.014)  # Range from 1.2 to 2.6 kW
        year = 1987 + (i % 20)  # Years from 1987 to 2006
        efficiency = "Very Low" if year < 1995 else "Low"
        is_curated = i <= 7  # First 7 are curated
        
        products.append({
            "id": f"D{i:03d}",
            "name": f"Classic Dishwasher {i}",
            "power": round(power, 1),
            "type": "dishwasher",
            "brand": ["Whirlpool", "GE", "Frigidaire", "Maytag", "Samsung", "Bosch", "Kenmore", "LG", "KitchenAid", "Hobart"][i % 10],
            "year": str(year),
            "efficiency": efficiency,
            "icon": "📻",
            "category": "current",
            "isCurated": is_curated,
            "displayName": f"Old Dishwasher Comparison Model {i}" if is_curated else f"Classic Dishwasher {i}",
            "notes": "Pre-energy rating era" if year < 1995 else "Early energy rating era"
        })
    
    # Freezers (100 products)
    for i in range(1, 101):
        power = 0.32 + (i * 0.0059)  # Range from 0.32 to 0.91 kW
        year = 1987 + (i % 20)  # Years from 1987 to 2006
        efficiency = "Very Low" if year < 1995 else "Low"
        is_curated = i <= 7  # First 7 are curated
        
        products.append({
            "id": f"FZ{i:03d}",
            "name": f"Classic Freezer {i}",
            "power": round(power, 2),
            "type": "freezer",
            "brand": ["Whirlpool", "Frigidaire", "GE", "Kenmore", "Samsung", "Maytag", "LG", "True", "Haier", "Amana"][i % 10],
            "year": str(year),
            "efficiency": efficiency,
            "icon": "❄️",
            "category": "current",
            "isCurated": is_curated,
            "displayName": f"Old Freezer Comparison Model {i}" if is_curated else f"Classic Freezer {i}",
            "notes": "Pre-energy rating era" if year < 1995 else "Early energy rating era"
        })
    
    # Lighting (50 products)
    for i in range(1, 51):
        power = 0.01 + (i * 0.0058)  # Range from 0.01 to 0.30 kW
        year = 1995 + (i % 12)  # Years from 1995 to 2006
        efficiency = "Very Low" if i <= 25 else "Low"
        is_curated = i <= 7  # First 7 are curated
        
        products.append({
            "id": f"L{i:03d}",
            "name": f"Classic Light {i}",
            "power": round(power, 3),
            "type": "lights",
            "brand": ["GE", "Philips", "Sylvania", "Osram", "Generic"][i % 5],
            "year": str(year),
            "efficiency": efficiency,
            "icon": "💡",
            "category": "current",
            "isCurated": is_curated,
            "displayName": f"Old Light Comparison Model {i}" if is_curated else f"Classic Light {i}",
            "notes": "Incandescent/Halogen era"
        })
    
    # Electrical Equipment (50 products)
    for i in range(1, 51):
        power = 0.05 + (i * 0.008)  # Range from 0.05 to 0.45 kW
        year = 1998 + (i % 9)  # Years from 1998 to 2006
        efficiency = "Very Low" if i <= 25 else "Low"
        is_curated = i <= 7  # First 7 are curated
        
        products.append({
            "id": f"E{i:03d}",
            "name": f"Classic Equipment {i}",
            "power": round(power, 3),
            "type": "motor",
            "brand": ["Sony", "Panasonic", "Samsung", "Dell", "Toshiba", "HP", "LG", "ViewSonic", "Compaq", "IBM"][i % 10],
            "year": str(year),
            "efficiency": efficiency,
            "icon": "⚙️",
            "category": "current",
            "isCurated": is_curated,
            "displayName": f"Old Equipment Comparison Model {i}" if is_curated else f"Classic Equipment {i}",
            "notes": "CRT/Plasma era"
        })
    
    return products

def main():
    print("🔄 Creating full current-products.json with 500 products...")
    
    products = create_current_products()
    
    # Count curated products
    curated_count = sum(1 for p in products if p['isCurated'])
    
    # Create the full data structure
    data = {
        "lastUpdated": datetime.now().isoformat() + "Z",
        "totalProducts": len(products),
        "description": "Old/inefficient products for comparison against modern ETL-certified alternatives",
        "curatedProducts": curated_count,
        "products": products
    }
    
    # Write to file
    with open('current-products.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created current-products.json with {len(products)} products")
    print(f"🎯 {curated_count} curated products for default display")
    
    # Show breakdown
    type_counts = {}
    for product in products:
        ptype = product['type']
        type_counts[ptype] = type_counts.get(ptype, 0) + 1
    
    print("📊 Product type breakdown:")
    for ptype, count in type_counts.items():
        print(f"   {ptype}: {count}")

if __name__ == "__main__":
    main()
