#!/usr/bin/env python3
"""Update Carrier product images using regex pattern matching"""

import re
import shutil
from datetime import datetime

json_path = 'FULL-DATABASE-5554.json'
backup_path = f'{json_path}.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'

# Wix URLs
all_glass_url = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
anti_reflective_url = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'

print('🔄 Updating Carrier product images...')
print(f'📄 File: {json_path}\n')

# Backup
print(f'📦 Creating backup: {backup_path}')
shutil.copyfile(json_path, backup_path)
print('✅ Backup created\n')

# Read file
print('📖 Reading file...')
with open(json_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Count before
count_before = content.count('"imageUrl": "Product Placement/Motor.jpg"')
print(f'Found {count_before} products with Motor.jpg\n')

# Pattern 1: "all glass door" with Motor.jpg
pattern1 = r'("name": "Carrier Refrigeration all glass door"[^}]*?"imageUrl": ")(Product Placement/Motor\.jpg)(")'
replacement1 = rf'\1{all_glass_url}\3'

# Pattern 2: "anti-reflective" with Motor.jpg  
pattern2 = r'("name": "Carrier Refrigeration anti-reflective all glass door"[^}]*?"imageUrl": ")(Product Placement/Motor\.jpg)(")'
replacement2 = rf'\1{anti_reflective_url}\3'

# Apply replacements
updated = re.sub(pattern1, replacement1, content, flags=re.DOTALL)
updated = re.sub(pattern2, replacement2, updated, flags=re.DOTALL)

# Count after
count_after_all = updated.count('"name": "Carrier Refrigeration all glass door"')
count_after_anti = updated.count('"name": "Carrier Refrigeration anti-reflective all glass door"')
motor_after = updated.count('"imageUrl": "Product Placement/Motor.jpg"')
wix_all = updated.count(all_glass_url)
wix_anti = updated.count(anti_reflective_url)

print(f'✅ Results:')
print(f'   - "all glass door" products: {count_after_all}')
print(f'   - "anti-reflective" products: {count_after_anti}')
print(f'   - Products with Wix URL (all glass): {wix_all}')
print(f'   - Products with Wix URL (anti-reflective): {wix_anti}')
print(f'   - Remaining Motor.jpg: {motor_after}\n')

if wix_all > 0 or wix_anti > 0:
    print('💾 Writing updated file...')
    with open(json_path, 'w', encoding='utf-8') as f:
        f.write(updated)
    print('✅ File updated successfully!')
    print(f'📦 Backup: {backup_path}')
else:
    print('⚠️  No updates made - check patterns')
    print(f'📦 Backup available: {backup_path}')

