import sqlite3
import json
from datetime import datetime

def export_all_etl_products():
    """Export all 5554+ products from ETL database to static JSON"""
    
    try:
        # Connect to ETL database
        conn = sqlite3.connect('database/energy_calculator.db')
        conn.row_factory = sqlite3.Row
        print("✅ Connected to ETL database")
        
        # Get all products
        query = """
        SELECT 
            id,
            name,
            power,
            category,
            subcategory,
            brand,
            running_cost_per_year as runningCostPerYear,
            energy_rating as energyRating,
            efficiency,
            source,
            model_number as modelNumber,
            water_per_cycle_liters as waterPerCycle,
            water_per_year_liters as waterPerYear,
            capacity_kg as capacity,
            place_settings as placeSettings,
            image_url as imageUrl
        FROM products 
        ORDER BY category, subcategory, brand, name
        """
        
        cursor = conn.execute(query)
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        products = []
        for row in rows:
            product = dict(row)
            
            # Map categories to product types and icons - COMPREHENSIVE MAPPING
            category_map = {
                'Appliances': {
                    'Refrigerator': {'type': 'fridge', 'icon': '🧊'},
                    'Dishwasher': {'type': 'dishwasher', 'icon': '📻'},
                    'Washing Machine': {'type': 'motor', 'icon': '⚙️'},
                    'Oven': {'type': 'oven', 'icon': '🔥'},
                    'Freezer': {'type': 'freezer', 'icon': '❄️'},
                    'Microwave': {'type': 'oven', 'icon': '🔥'}
                },
                'Lighting': {
                    'LED Bulbs': {'type': 'lights', 'icon': '💡'},
                    'LED Panels': {'type': 'lights', 'icon': '💡'},
                    'LED Strips': {'type': 'lights', 'icon': '💡'}
                },
                'ETL Technology': {
                    'Refrigerator': {'type': 'fridge', 'icon': '🧊'},
                    'Dishwasher': {'type': 'dishwasher', 'icon': '📻'},
                    'Oven': {'type': 'oven', 'icon': '🔥'},
                    'Motor': {'type': 'motor', 'icon': '⚙️'},
                    'Lighting': {'type': 'lights', 'icon': '💡'},
                    # Refrigeration companies
                    'True Refrigeration UK Limited': {'type': 'fridge', 'icon': '🧊'},
                    'AHT Cooling Systems GmbH': {'type': 'fridge', 'icon': '🧊'},
                    'Carrier Linde Commercial Refrigeration': {'type': 'fridge', 'icon': '🧊'},
                    'Husky Refrigerators (UK) Ltd.': {'type': 'fridge', 'icon': '🧊'},
                    'Adande Refrigeration': {'type': 'fridge', 'icon': '🧊'},
                    'MITA Cooling Technologies S.r.l.': {'type': 'fridge', 'icon': '🧊'},
                    'Williams Refrigeration': {'type': 'fridge', 'icon': '🧊'},
                    'BITZER Kühlmaschinenbau GmbH': {'type': 'fridge', 'icon': '🧊'},
                    'J&E Hall International Ltd.': {'type': 'fridge', 'icon': '🧊'},
                    'LIEBHERR': {'type': 'fridge', 'icon': '🧊'},
                    'Staycold Export Ltd': {'type': 'fridge', 'icon': '🧊'},
                    'Kooltech Ltd': {'type': 'fridge', 'icon': '🧊'},
                    'CoolSky Ltd': {'type': 'fridge', 'icon': '🧊'},
                    'Thermofrost Cryo PLC': {'type': 'freezer', 'icon': '❄️'},
                    # Commercial equipment
                    'Commercial Fridges': {'type': 'fridge', 'icon': '🧊'},
                    'Commercial Freezers': {'type': 'freezer', 'icon': '❄️'},
                    'Commercial Ovens': {'type': 'oven', 'icon': '🔥'},
                    'Food Prep': {'type': 'motor', 'icon': '⚙️'},
                    # Oven companies
                    'RATIONAL UK LIMITED': {'type': 'oven', 'icon': '🔥'},
                    'MKN Maschinenfabrik Kurt Neubauer GmbH&Co.KG': {'type': 'oven', 'icon': '🔥'},
                    'UNOX UK LIMITED': {'type': 'oven', 'icon': '🔥'},
                    'Eloma GmbH': {'type': 'oven', 'icon': '🔥'},
                    'Pastorfrigor SpA': {'type': 'oven', 'icon': '🔥'},
                    'LINCAT LIMITED': {'type': 'oven', 'icon': '🔥'},
                    # Dishwasher companies
                    'Electrolux Professional': {'type': 'dishwasher', 'icon': '📻'},
                    'Hobart': {'type': 'dishwasher', 'icon': '📻'},
                    'ATAG Commercial Ltd': {'type': 'dishwasher', 'icon': '📻'},
                    # Motor companies
                    'NORD Gear Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'ABB Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'WEG Electric Motors (UK) Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'Invertek Drives Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'Danfoss Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'Schneider Electric Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'Emerson Industrial Automation - Control techniques - Leroy Somer': {'type': 'motor', 'icon': '⚙️'},
                    'Eaton Electrical Limited': {'type': 'motor', 'icon': '⚙️'},
                    'Vacon Drives UK Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'Fuji Electric Europe GmbH': {'type': 'motor', 'icon': '⚙️'},
                    'Nidec Drives': {'type': 'motor', 'icon': '⚙️'},
                    'Mitsubishi Electric UK - Automation Systems Division': {'type': 'motor', 'icon': '⚙️'},
                    'Ziehl Abegg UK Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'FUTURE MOTORS LIMITED': {'type': 'motor', 'icon': '⚙️'},
                    'Grundfos Pumps Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'HPC Compressed Air Systems': {'type': 'motor', 'icon': '⚙️'},
                    'Ingersoll Rand International Ltd': {'type': 'motor', 'icon': '⚙️'},
                    'Power Tecnique Ltd': {'type': 'motor', 'icon': '⚙️'},
                    # Lighting companies
                    'SCHOTT UK LIMITED': {'type': 'lights', 'icon': '💡'},
                    'Enlighted Inc': {'type': 'lights', 'icon': '💡'},
                    'LOXONE UK LIMITED': {'type': 'lights', 'icon': '💡'},
                    'The Splash Lab': {'type': 'lights', 'icon': '💡'},
                    'Showmaster Limited': {'type': 'lights', 'icon': '💡'},
                    'Triton Showers (A division of Norcros Group Ltd)': {'type': 'lights', 'icon': '💡'},
                    'KELDA SHOWERS LIMITED': {'type': 'lights', 'icon': '💡'},
                    'Vent-Axia': {'type': 'lights', 'icon': '💡'},
                    'ebm-papst UK Ltd': {'type': 'lights', 'icon': '💡'},
                    'WIRTH RESEARCH LIMITED': {'type': 'lights', 'icon': '💡'}
                },
                'Restaurant Equipment': {
                    'Combi Oven': {'type': 'oven', 'icon': '🔥'},
                    'Refrigerator': {'type': 'fridge', 'icon': '🧊'},
                    'Dishwasher': {'type': 'dishwasher', 'icon': '📻'},
                    'Freezer': {'type': 'freezer', 'icon': '❄️'},
                    'Commercial Fridges': {'type': 'fridge', 'icon': '🧊'},
                    'Commercial Freezers': {'type': 'freezer', 'icon': '❄️'},
                    'Commercial Ovens': {'type': 'oven', 'icon': '🔥'},
                    'Food Prep': {'type': 'motor', 'icon': '⚙️'}
                }
            }
            
            # Determine product type and icon
            category = product.get('category', '')
            subcategory = product.get('subcategory', '')
            
            if category in category_map and subcategory in category_map[category]:
                type_info = category_map[category][subcategory]
                product['type'] = type_info['type']
                product['icon'] = type_info['icon']
            else:
                # Use intelligent fallback mapping based on subcategory keywords
                subcategory_lower = subcategory.lower()
                
                if any(keyword in subcategory_lower for keyword in ['refrigerat', 'fridge', 'cooling', 'freezer', 'cold']):
                    product['type'] = 'fridge'
                    product['icon'] = '🧊'
                elif any(keyword in subcategory_lower for keyword in ['oven', 'cooking', 'rational', 'mkn', 'unox', 'eloma']):
                    product['type'] = 'oven'
                    product['icon'] = '🔥'
                elif any(keyword in subcategory_lower for keyword in ['dishwasher', 'wash', 'hobart', 'electrolux', 'atag']):
                    product['type'] = 'dishwasher'
                    product['icon'] = '📻'
                elif any(keyword in subcategory_lower for keyword in ['motor', 'drive', 'pump', 'gear', 'abb', 'weg', 'danfoss', 'schneider', 'emerson', 'eaton', 'vacon', 'fuji', 'nidec', 'mitsubishi', 'ziehl', 'grundfos', 'hpc', 'ingersoll', 'power']):
                    product['type'] = 'motor'
                    product['icon'] = '⚙️'
                elif any(keyword in subcategory_lower for keyword in ['light', 'led', 'schott', 'enlighted', 'loxone', 'splash', 'showmaster', 'triton', 'kelda', 'vent', 'ebm', 'wirth']):
                    product['type'] = 'lights'
                    product['icon'] = '💡'
                else:
                    # Skip products that don't match any category
                    print(f"⚠️ Skipping product: {product.get('name', 'Unknown')} - Category: {category}/{subcategory}")
                    continue
            
            # Add default values
            product.setdefault('efficiency', 'High')
            product.setdefault('warranty', '2 years')
            
            products.append(product)
        
        print(f"✅ Found {len(products)} products")
        
        # Count by category and type
        categories = {}
        types = {}
        brands = set()
        
        for product in products:
            cat = product.get('category', 'unknown')
            prod_type = product.get('type', 'unknown')
            brand = product.get('brand', '').strip()
            
            categories[cat] = categories.get(cat, 0) + 1
            types[prod_type] = types.get(prod_type, 0) + 1
            if brand:
                brands.add(brand)
        
        # Create static data structure
        static_data = {
            "lastUpdated": datetime.now().isoformat() + "Z",
            "totalProducts": len(products),
            "products": products,
            "categories": categories,
            "productTypes": types,
            "brands": sorted(list(brands)),
            "exportInfo": {
                "source": "ETL Database (energy_calculator.db)",
                "exportedAt": datetime.now().isoformat(),
                "totalProducts": len(products),
                "databasePath": "database/energy_calculator.db"
            }
        }
        
        # Write to file
        with open('etl-products-static.json', 'w', encoding='utf-8') as f:
            json.dump(static_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Exported {len(products)} products to etl-products-static.json")
        
        # Show breakdown
        print(f"\n📊 Category Breakdown:")
        for cat, count in sorted(categories.items()):
            print(f"  {cat}: {count} products")
        
        print(f"\n🔧 Product Type Breakdown:")
        for prod_type, count in sorted(types.items()):
            print(f"  {prod_type}: {count} products")
        
        print(f"\n🏢 Brands: {len(brands)}")
        print(f"Top brands: {', '.join(sorted(list(brands))[:10])}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Export failed: {e}")

if __name__ == "__main__":
    print("🏭 ETL Products Export (5554+ products)")
    print("=" * 50)
    export_all_etl_products()
