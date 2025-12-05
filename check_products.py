import sqlite3

# Check the products table structure and data
try:
    conn = sqlite3.connect('database/energy_calculator.db')
    cursor = conn.cursor()
    
    # Get table structure
    cursor.execute("PRAGMA table_info(products);")
    columns = cursor.fetchall()
    print('Products table structure:')
    for col in columns:
        print(f'  {col[1]} ({col[2]})')
    
    print('\n' + '='*50 + '\n')
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM products;")
    count = cursor.fetchone()[0]
    print(f'Total products: {count}')
    
    print('\n' + '='*50 + '\n')
    
    # Get sample data
    cursor.execute("SELECT * FROM products LIMIT 5;")
    sample = cursor.fetchall()
    print('Sample products:')
    for row in sample:
        print(f'  {row}')
    
    print('\n' + '='*50 + '\n')
    
    # Get unique categories/types
    cursor.execute("SELECT DISTINCT category FROM products LIMIT 10;")
    categories = cursor.fetchall()
    print('Categories:')
    for cat in categories:
        print(f'  {cat[0]}')
    
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')










