#!/usr/bin/env python3
"""
ETL Database Export Script
Exports all ETL products to static JSON for Energy Audit Widget
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any

class ETLExporter:
    def __init__(self, db_path: str = "etl_database.db"):
        self.db_path = db_path
        self.output_file = "etl-products-static.json"
        
    def connect_to_etl_db(self) -> sqlite3.Connection:
        """Connect to your ETL database"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable column access by name
            print(f"✅ Connected to ETL database: {self.db_path}")
            return conn
        except sqlite3.Error as e:
            print(f"❌ Database connection failed: {e}")
            raise
    
    def get_all_products(self, conn: sqlite3.Connection) -> List[Dict[str, Any]]:
        """Extract all products from ETL database"""
        try:
            # Adjust this query based on your actual ETL database schema
            query = """
            SELECT 
                id,
                name,
                category,
                brand,
                power_consumption as power,
                energy_rating as energyRating,
                efficiency,
                annual_running_cost as runningCostPerYear,
                product_type as type,
                model_number as modelNumber,
                dimensions,
                warranty,
                capacity,
                water_per_cycle as waterPerCycle,
                lumens,
                rpm
            FROM products 
            WHERE status = 'active'
            ORDER BY category, brand, name
            """
            
            cursor = conn.execute(query)
            products = []
            
            for row in cursor.fetchall():
                product = dict(row)
                
                # Map product types to icons
                icon_map = {
                    'dishwasher': '📻',
                    'oven': '🔥',
                    'refrigerator': '🧊',
                    'fridge': '🧊',
                    'freezer': '❄️',
                    'lighting': '💡',
                    'lights': '💡',
                    'motor': '⚙️',
                    'motors': '⚙️'
                }
                
                product['icon'] = icon_map.get(product.get('type', '').lower(), '📦')
                
                # Ensure required fields have defaults
                product.setdefault('efficiency', 'High')
                product.setdefault('warranty', '2 years')
                
                products.append(product)
            
            print(f"✅ Extracted {len(products)} products from ETL database")
            return products
            
        except sqlite3.Error as e:
            print(f"❌ Query failed: {e}")
            raise
    
    def get_category_counts(self, products: List[Dict[str, Any]]) -> Dict[str, int]:
        """Count products by category"""
        counts = {}
        for product in products:
            product_type = product.get('type', 'unknown')
            counts[product_type] = counts.get(product_type, 0) + 1
        return counts
    
    def get_brands(self, products: List[Dict[str, Any]]) -> List[str]:
        """Extract unique brands"""
        brands = set()
        for product in products:
            brand = product.get('brand', '').strip()
            if brand:
                brands.add(brand)
        return sorted(list(brands))
    
    def create_static_file(self, products: List[Dict[str, Any]]) -> None:
        """Create the static JSON file"""
        try:
            category_counts = self.get_category_counts(products)
            brands = self.get_brands(products)
            
            static_data = {
                "lastUpdated": datetime.now().isoformat() + "Z",
                "totalProducts": len(products),
                "products": products,
                "categories": category_counts,
                "brands": brands,
                "exportInfo": {
                    "source": "ETL Database",
                    "exportedBy": "ETL Exporter Script",
                    "databasePath": self.db_path,
                    "exportTime": datetime.now().isoformat()
                }
            }
            
            # Write to file
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(static_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Static file created: {self.output_file}")
            print(f"📊 Total products: {len(products)}")
            print(f"🏷️ Categories: {len(category_counts)}")
            print(f"🏢 Brands: {len(brands)}")
            
            # Show category breakdown
            print("\n📋 Category Breakdown:")
            for category, count in sorted(category_counts.items()):
                print(f"  {category}: {count} products")
                
        except Exception as e:
            print(f"❌ Failed to create static file: {e}")
            raise
    
    def export_all_products(self) -> None:
        """Main export function"""
        print("🚀 Starting ETL Database Export...")
        
        try:
            # Connect to database
            conn = self.connect_to_etl_db()
            
            # Extract all products
            products = self.get_all_products(conn)
            
            if not products:
                print("⚠️ No products found in ETL database")
                return
            
            # Create static file
            self.create_static_file(products)
            
            print("✅ Export completed successfully!")
            
        except Exception as e:
            print(f"❌ Export failed: {e}")
            raise
        finally:
            if 'conn' in locals():
                conn.close()

def main():
    """Main function"""
    print("🏭 ETL Database Export Tool")
    print("=" * 50)
    
    # You can customize the database path here
    db_path = input("Enter ETL database path (or press Enter for 'etl_database.db'): ").strip()
    if not db_path:
        db_path = "etl_database.db"
    
    exporter = ETLExporter(db_path)
    exporter.export_all_products()

if __name__ == "__main__":
    main()










