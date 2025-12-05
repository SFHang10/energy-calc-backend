import sqlite3

# Check what fridges look like in the database
conn = sqlite3.connect('database/energy_calculator.db')
conn.row_factory = sqlite3.Row

# Get fridge products from database
query = """
SELECT 
    id,
    name,
    category,
    subcategory,
    brand,
    power,
    energy_rating,
    running_cost_per_year
FROM products 
WHERE subcategory = 'Refrigerator' OR subcategory = 'Freezer'
ORDER BY brand, name
LIMIT 10
"""

cursor = conn.execute(query)
rows = cursor.fetchall()

print('Fridge products in database:')
for row in rows:
    print(f'  {row["name"]} - {row["brand"]} ({row["category"]}/{row["subcategory"]})')

conn.close()










