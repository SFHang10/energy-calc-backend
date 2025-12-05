import sqlite3

# Check what's actually in the database
conn = sqlite3.connect('database/energy_calculator.db')
conn.row_factory = sqlite3.Row

# Get all unique subcategories to see what we're missing
query = """
SELECT DISTINCT subcategory, COUNT(*) as count
FROM products 
GROUP BY subcategory
ORDER BY count DESC
"""

cursor = conn.execute(query)
rows = cursor.fetchall()

print('All subcategories in database:')
for row in rows:
    print(f'  {row["subcategory"]}: {row["count"]} products')

print('\n' + '='*50 + '\n')

# Check for fridge-related products
fridge_query = """
SELECT DISTINCT subcategory, COUNT(*) as count
FROM products 
WHERE subcategory LIKE '%refrigerator%' 
   OR subcategory LIKE '%fridge%'
   OR subcategory LIKE '%freezer%'
   OR subcategory LIKE '%cooling%'
   OR subcategory LIKE '%refrigeration%'
GROUP BY subcategory
ORDER BY count DESC
"""

cursor = conn.execute(fridge_query)
rows = cursor.fetchall()

print('Fridge-related subcategories:')
for row in rows:
    print(f'  {row["subcategory"]}: {row["count"]} products')

conn.close()










