import json
import os
import shutil
from datetime import datetime

json_path = os.path.join(os.getcwd(), 'FULL-DATABASE-5554.json')
output_file = os.path.join(os.getcwd(), 'carrier-fix-results.txt')

output = []

def log(message):
    output.append(message)
    print(message)

# Clear output file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('')

log('🔄 TARGETED UPDATE: Only Carrier products, preserving all Motor.jpg for other products')
log('=' * 70)
log('')

# Create backup
backup_path = json_path + '.backup_' + datetime.now().strftime('%Y%m%d%H%M%S')
log('📦 Creating backup...')
shutil.copyfile(json_path, backup_path)
log(f'✅ Backup created: {os.path.basename(backup_path)}\n')

# Load JSON
log('📄 Loading JSON file...')
with open(json_path, 'r', encoding='utf-8') as f:
    jsonData = json.load(f)

if 'products' not in jsonData or not isinstance(jsonData['products'], list):
    log(f"❌ ERROR: JSON structure invalid. Expected {{ products: [...] }}")
    exit(1)

log(f'✅ Loaded {len(jsonData["products"])} products\n')

# Wix URLs
all_glass_door_url = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
anti_reflective_url = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'

updated_all_glass = 0
updated_anti_reflective = 0
skipped = 0

log('🔍 Searching for Carrier products ONLY...\n')

# ONLY update Carrier products - very specific matching
for product in jsonData['products']:
    # Exact match for "Carrier Refrigeration all glass door" with Motor.jpg
    if product.get('name') == 'Carrier Refrigeration all glass door' and \
       product.get('imageUrl') == 'Product Placement/Motor.jpg':
        log(f"✅ UPDATING: {product.get('name')} (ID: {product.get('id')})")
        log(f"   Old: {product.get('imageUrl')}")
        log(f"   New: {all_glass_door_url}\n")
        product['imageUrl'] = all_glass_door_url
        updated_all_glass += 1
    # Exact match for "Carrier Refrigeration anti-reflective all glass door" with Motor.jpg
    elif product.get('name') == 'Carrier Refrigeration anti-reflective all glass door' and \
         product.get('imageUrl') == 'Product Placement/Motor.jpg':
        log(f"✅ UPDATING: {product.get('name')} (ID: {product.get('id')})")
        log(f"   Old: {product.get('imageUrl')}")
        log(f"   New: {anti_reflective_url}\n")
        product['imageUrl'] = anti_reflective_url
        updated_anti_reflective += 1
    # Count other Carrier products that don't need updating
    elif (product.get('name') == 'Carrier Refrigeration all glass door' or \
          product.get('name') == 'Carrier Refrigeration anti-reflective all glass door') and \
         product.get('imageUrl') != 'Product Placement/Motor.jpg':
        skipped += 1

total_updated = updated_all_glass + updated_anti_reflective

log('\n📊 RESULTS:')
log(f"   ✅ Updated 'all glass door': {updated_all_glass}")
log(f"   ✅ Updated 'anti-reflective': {updated_anti_reflective}")
log(f"   ⏭️  Skipped (already correct): {skipped}")
log(f"   🔒 All other Motor.jpg products preserved\n")

if total_updated > 0:
    try:
        log('💾 Saving JSON file (preserving ALL other data)...')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(jsonData, f, indent=2, ensure_ascii=False)
        log('✅ File saved successfully!\n')
        
        # Verify
        with open(json_path, 'r', encoding='utf-8') as f:
            verify = json.load(f)
        v1 = next((p for p in verify['products'] if p.get('id') == 'etl_14_65836'), None)
        v2 = next((p for p in verify['products'] if p.get('id') == 'etl_14_65852'), None)
        log('✅ VERIFICATION:')
        log(f"   Product 1 (etl_14_65836): {v1.get('imageUrl') if v1 else 'NOT FOUND'}")
        log(f"   Product 2 (etl_14_65852): {v2.get('imageUrl') if v2 else 'NOT FOUND'}\n")
        
        log('✨ Carrier images fixed! All Motor.jpg for other products preserved.')
        log(f'📝 Full output: {output_file}')
    except Exception as error:
        log(f'❌ Error saving: {error}')
        log(f'⚠️  Backup available: {os.path.basename(backup_path)}')
        exit(1)
else:
    log('⚠️  No Carrier products found with Motor.jpg to update')
    log(f'📝 Full output: {output_file}')

# Write output to file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

