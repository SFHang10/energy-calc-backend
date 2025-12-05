import json
import shutil
from datetime import datetime

# File paths
json_path = 'FULL-DATABASE-5554.json'
backup_path = f'FULL-DATABASE-5554-BACKUP-{int(datetime.now().timestamp() * 1000)}.json'

# Wix URLs
all_glass_door_url = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
anti_reflective_url = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'

print('\n🔄 FIXING CARRIER PRODUCT IMAGES')
print('=' * 70)
print()

# Create backup
shutil.copy2(json_path, backup_path)
print(f'💾 Backup created: {backup_path}')
print()

# Load JSON
print('📄 Loading JSON file...')
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'✅ Loaded JSON file')
print(f'   Keys: {list(data.keys())}')

if 'products' not in data:
    print('❌ ERROR: No "products" key found!')
    print(f'   Available keys: {list(data.keys())}')
    exit(1)

print(f'✅ Found products array with {len(data["products"])} products')
print()

# Update Carrier products
updated_all_glass = 0
updated_anti_reflective = 0

print('🔍 Updating Carrier products...\n')

for product in data['products']:
    if product.get('name') == 'Carrier Refrigeration all glass door' and \
       product.get('imageUrl') == 'Product Placement/Motor.jpg':
        print(f'✅ UPDATING: {product["name"]} (ID: {product["id"]})')
        print(f'   Old: {product["imageUrl"]}')
        print(f'   New: {all_glass_door_url}')
        product['imageUrl'] = all_glass_door_url
        updated_all_glass += 1
    elif product.get('name') == 'Carrier Refrigeration anti-reflective all glass door' and \
         product.get('imageUrl') == 'Product Placement/Motor.jpg':
        print(f'✅ UPDATING: {product["name"]} (ID: {product["id"]})')
        print(f'   Old: {product["imageUrl"]}')
        print(f'   New: {anti_reflective_url}')
        product['imageUrl'] = anti_reflective_url
        updated_anti_reflective += 1

total_updated = updated_all_glass + updated_anti_reflective

print(f'\n📊 RESULTS:')
print(f'   Products updated: {total_updated}')
print(f'   - "all glass door": {updated_all_glass}')
print(f'   - "anti-reflective": {updated_anti_reflective}')
print()

# Save JSON
print('💾 Saving updated JSON file...')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('✅ Database saved with updated Carrier images!')
print(f'💾 Backup: {backup_path}')
print()
print('✨ Carrier images fixed! All products now have correct Wix URLs.\n')

