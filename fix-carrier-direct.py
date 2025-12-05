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

log('🔄 SAFE UPDATE: Updating Carrier product images only (Python script)...')
log('⚠️  RULE: ONLY update imageUrl field - ALL other data preserved')
log('✅ ENHANCEMENT ONLY - Nothing deleted\n')

# Load JSON file
jsonData = None
try:
    log('📄 Loading JSON file...')
    with open(json_path, 'r', encoding='utf-8') as f:
        jsonData = json.load(f)
    
    # Verify structure
    if 'products' not in jsonData or not isinstance(jsonData['products'], list):
        log(f"❌ ERROR: JSON structure invalid. Expected {{ products: [...] }}")
        log(f"   Found keys: {', '.join(jsonData.keys())}")
        exit(1)
    
    log(f"✅ Loaded JSON file with {len(jsonData['products'])} products")
    log(f"   Structure verified: products array exists\n")
except Exception as error:
    log(f"❌ Error loading JSON file: {error}")
    exit(1)

# Image URLs to use (from user-provided Wix URLs)
all_glass_door_url = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
anti_reflective_url = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'

updated_all_glass = 0
updated_anti_reflective = 0
skipped = 0

log('🔍 Searching for Carrier products with Motor.jpg...\n')

# Update Carrier products - ONLY the imageUrl field
for product in jsonData['products']:
    # Only update if it's a Carrier product with Motor.jpg
    if product.get('name') == 'Carrier Refrigeration all glass door' and \
       product.get('imageUrl') == 'Product Placement/Motor.jpg':
        log(f"✅ UPDATING: {product.get('name')} (ID: {product.get('id')})")
        log(f"   Old imageUrl: {product.get('imageUrl')}")
        log(f"   New imageUrl: {all_glass_door_url}")
        # ONLY update imageUrl - preserve everything else
        product['imageUrl'] = all_glass_door_url
        updated_all_glass += 1
    elif product.get('name') == 'Carrier Refrigeration anti-reflective all glass door' and \
         product.get('imageUrl') == 'Product Placement/Motor.jpg':
        log(f"✅ UPDATING: {product.get('name')} (ID: {product.get('id')})")
        log(f"   Old imageUrl: {product.get('imageUrl')}")
        log(f"   New imageUrl: {anti_reflective_url}")
        # ONLY update imageUrl - preserve everything else
        product['imageUrl'] = anti_reflective_url
        updated_anti_reflective += 1
    elif (product.get('name') == 'Carrier Refrigeration all glass door' or \
          product.get('name') == 'Carrier Refrigeration anti-reflective all glass door') and \
         product.get('imageUrl') != 'Product Placement/Motor.jpg':
        skipped += 1

total_updated = updated_all_glass + updated_anti_reflective

if total_updated > 0:
    # Create backup BEFORE making changes
    backup_path = json_path + '.backup_' + datetime.now().strftime('%Y%m%d%H%M%S')
    log(f"\n📦 Creating backup...")
    shutil.copyfile(json_path, backup_path)
    log(f"✅ Backup created: {os.path.basename(backup_path)}\n")
    
    # Save updated JSON file - preserving ALL data, only imageUrl changed
    try:
        log('💾 Writing updated JSON file (preserving all data)...')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(jsonData, f, indent=2, ensure_ascii=False)
        log(f"\n📊 SAFE UPDATE complete:")
        log(f"- ✅ Updated 'all glass door': {updated_all_glass} products")
        log(f"- ✅ Updated 'anti-reflective': {updated_anti_reflective} products")
        log(f"- ⏭️  Skipped (already correct): {skipped} products")
        log(f"- 📄 JSON file saved successfully")
        log(f"- 🔒 ALL other data preserved (no deletions)")
        log(f"\n📝 Full output saved to: {output_file}")
    except Exception as error:
        log(f"❌ Error saving JSON file: {error}")
        log(f"⚠️  Backup available at: {os.path.basename(backup_path)}")
else:
    log('\n⚠️  No Carrier products found with Motor.jpg to update')
    all_glass_count = sum(1 for p in jsonData['products'] if p.get('name') == 'Carrier Refrigeration all glass door')
    anti_reflective_count = sum(1 for p in jsonData['products'] if p.get('name') == 'Carrier Refrigeration anti-reflective all glass door')
    log(f"   Found {all_glass_count} 'all glass door' products")
    log(f"   Found {anti_reflective_count} 'anti-reflective' products")
    log(f"\n📝 Full output saved to: {output_file}")

# Write all output to file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

