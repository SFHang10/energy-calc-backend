#!/usr/bin/env python3
"""Simple script to update Carrier product images in FULL-DATABASE-5554.json
Uses direct string replacement - no JSON parsing needed for large files"""

import os
import shutil
from datetime import datetime

json_path = 'FULL-DATABASE-5554.json'
backup_path = f'{json_path}.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'

# Wix URLs provided by user
all_glass_url = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
anti_reflective_url = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'

print('🔄 Updating Carrier product images...')
print(f'📄 File: {json_path}')

# Create backup
print(f'📦 Creating backup: {backup_path}')
shutil.copyfile(json_path, backup_path)
print('✅ Backup created\n')

# Read file
print('📖 Reading file...')
with open(json_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Count occurrences before
count_before_all = content.count('"name": "Carrier Refrigeration all glass door"')
count_before_anti = content.count('"name": "Carrier Refrigeration anti-reflective all glass door"')
motor_before_all = content.count('"name": "Carrier Refrigeration all glass door",\n      "brand": "Carrier Linde Commercial Refrigeration",\n      "category": "ETL Technology",\n      "subcategory": "Carrier Linde Commercial Refrigeration",\n      "power": "Unknown",\n      "energyRating": "Unknown",\n      "efficiency": "High",\n      "runningCostPerYear": 0,\n      "modelNumber": null,\n      "imageUrl": "Product Placement/Motor.jpg"')
motor_before_anti = content.count('"name": "Carrier Refrigeration anti-reflective all glass door",\n      "brand": "Carrier Linde Commercial Refrigeration",\n      "category": "ETL Technology",\n      "subcategory": "Carrier Linde Commercial Refrigeration",\n      "power": "Unknown",\n      "energyRating": "Unknown",\n      "efficiency": "High",\n      "runningCostPerYear": 0,\n      "modelNumber": null,\n      "imageUrl": "Product Placement/Motor.jpg"')

print(f'Found {count_before_all} "all glass door" products')
print(f'Found {count_before_anti} "anti-reflective" products')
print(f'Found {motor_before_all} "all glass door" with Motor.jpg')
print(f'Found {motor_before_anti} "anti-reflective" with Motor.jpg\n')

# Replace for "all glass door"
old_all = '"name": "Carrier Refrigeration all glass door",\n      "brand": "Carrier Linde Commercial Refrigeration",\n      "category": "ETL Technology",\n      "subcategory": "Carrier Linde Commercial Refrigeration",\n      "power": "Unknown",\n      "energyRating": "Unknown",\n      "efficiency": "High",\n      "runningCostPerYear": 0,\n      "modelNumber": null,\n      "imageUrl": "Product Placement/Motor.jpg"'
new_all = f'"name": "Carrier Refrigeration all glass door",\n      "brand": "Carrier Linde Commercial Refrigeration",\n      "category": "ETL Technology",\n      "subcategory": "Carrier Linde Commercial Refrigeration",\n      "power": "Unknown",\n      "energyRating": "Unknown",\n      "efficiency": "High",\n      "runningCostPerYear": 0,\n      "modelNumber": null,\n      "imageUrl": "{all_glass_url}"'

# Replace for "anti-reflective"
old_anti = '"name": "Carrier Refrigeration anti-reflective all glass door",\n      "brand": "Carrier Linde Commercial Refrigeration",\n      "category": "ETL Technology",\n      "subcategory": "Carrier Linde Commercial Refrigeration",\n      "power": "Unknown",\n      "energyRating": "Unknown",\n      "efficiency": "High",\n      "runningCostPerYear": 0,\n      "modelNumber": null,\n      "imageUrl": "Product Placement/Motor.jpg"'
new_anti = f'"name": "Carrier Refrigeration anti-reflective all glass door",\n      "brand": "Carrier Linde Commercial Refrigeration",\n      "category": "ETL Technology",\n      "subcategory": "Carrier Linde Commercial Refrigeration",\n      "power": "Unknown",\n      "energyRating": "Unknown",\n      "efficiency": "High",\n      "runningCostPerYear": 0,\n      "modelNumber": null,\n      "imageUrl": "{anti_reflective_url}"'

# Perform replacements
updated_all = content.replace(old_all, new_all)
updated_both = updated_all.replace(old_anti, new_anti)

count_all = updated_both.count(old_all)
count_anti = updated_both.count(old_anti)

if count_all == 0 and count_anti == 0:
    print('✅ All Carrier products updated!')
    print(f'   - "all glass door": {motor_before_all} → 0 (updated)')
    print(f'   - "anti-reflective": {motor_before_anti} → 0 (updated)\n')
    
    # Write updated file
    print('💾 Writing updated file...')
    with open(json_path, 'w', encoding='utf-8') as f:
        f.write(updated_both)
    print('✅ File updated successfully!')
    print(f'📦 Backup saved at: {backup_path}')
else:
    print(f'⚠️  Some replacements may have failed')
    print(f'   Remaining "all glass door" with Motor.jpg: {count_all}')
    print(f'   Remaining "anti-reflective" with Motor.jpg: {count_anti}')
    print(f'📦 Backup available at: {backup_path}')

