import sqlite3

# Check energy_calculator.db
try:
    conn = sqlite3.connect('energy_calculator.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print('Tables in energy_calculator.db:')
    for table in tables:
        print(f'  {table[0]}')
    conn.close()
except Exception as e:
    print(f'Error with energy_calculator.db: {e}')

print('\n' + '='*50 + '\n')

# Check database/energy_calculator.db
try:
    conn = sqlite3.connect('database/energy_calculator.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print('Tables in database/energy_calculator.db:')
    for table in tables:
        print(f'  {table[0]}')
    conn.close()
except Exception as e:
    print(f'Error with database/energy_calculator.db: {e}')










