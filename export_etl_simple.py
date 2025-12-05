#!/usr/bin/env python3
"""
Simple ETL Export Script
Customize this for your specific ETL database schema
"""

import sqlite3
import json
from datetime import datetime

def export_etl_products():
    """Export all products from your ETL database"""
    
    # CUSTOMIZE THIS: Update with your actual database path and schema
    DB_PATH = "your_etl_database.db"  # Change this to your actual database path
    
    # CUSTOMIZE THIS: Update the query based on your actual table structure
    QUERY = """
    SELECT 
        id,
        product_name as name,
        category,
        manufacturer as brand,
        power_consumption_kw as power,
        energy_efficiency_rating as energyRating,
        annual_cost_eur as runningCostPerYear,
        product_type as type
    FROM products 
    WHERE active = 1
    ORDER BY category, manufacturer, product_name
    """
    
    try:
        # Connect to your ETL database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        print(f"✅ Connected to ETL database")
        
        # Execute query
        cursor = conn.execute(QUERY)
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        products = []
        for row in rows:
            product = dict(row)
            
            # Add icon based on product type
            icon_map = {
                'dishwasher': '📻',
                'oven': '🔥', 
                'refrigerator': '🧊',
                'fridge': '🧊',
                'freezer': '❄️',
                'lighting': '💡',
                'lights': '💡',
                'motor': '⚙️'
            }
            
            product_type = product.get('type', '').lower()
            product['icon'] = icon_map.get(product_type, '📦')
            
            # Add default values
            product.setdefault('efficiency', 'High')
            product.setdefault('warranty', '2 years')
            
            products.append(product)
        
        print(f"✅ Found {len(products)} products")
        
        # Create static data structure
        static_data = {
            "lastUpdated": datetime.now().isoformat() + "Z",
            "totalProducts": len(products),
            "products": products,
            "exportInfo": {
                "source": "ETL Database Export",
                "exportedAt": datetime.now().isoformat(),
                "totalProducts": len(products)
            }
        }
        
        # Write to file
        with open('etl-products-static.json', 'w', encoding='utf-8') as f:
            json.dump(static_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Exported {len(products)} products to etl-products-static.json")
        
        # Show category breakdown
        categories = {}
        for product in products:
            cat = product.get('type', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1
        
        print("\n📋 Products by category:")
        for cat, count in sorted(categories.items()):
            print(f"  {cat}: {count}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Export failed: {e}")

if __name__ == "__main__":
    print("🏭 ETL Products Export")
    print("=" * 30)
    print("⚠️  IMPORTANT: Update DB_PATH and QUERY in this script first!")
    print("=" * 30)
    
    # Uncomment the line below after customizing the script
    # export_etl_products()
    
    print("📝 To use this script:")
    print("1. Update DB_PATH with your actual database path")
    print("2. Update QUERY with your actual table schema")
    print("3. Uncomment the export_etl_products() call")
    print("4. Run: python export_etl_products.py")










