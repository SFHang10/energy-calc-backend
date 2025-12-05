# DATA RECOVERY INSTRUCTIONS

## 🚨 EMERGENCY RECOVERY

If products are accidentally deleted, follow these steps:

### Step 1: Check Backups
- Look in: `database/backups/`
- Find the most recent `products_backup_*.db` file
- Check the `metadata_*.json` file for product count

### Step 2: Restore Database
```bash
# Stop the server first
# Copy backup to main database
cp database/backups/products_backup_[TIMESTAMP].db database/energy_calculator.db
# Restart the server
```

### Step 3: Verify Recovery
```bash
node verify_all_products.js
```

### Step 4: Re-fetch from ETL API (if needed)
```bash
node fetch_all_etl_products_unlimited.js
```

## 📊 Current Status
- Total Products: 985
- Last Backup: Not created yet
- Protection Status: ACTIVE

## 🛡️ Prevention
- Never run DELETE commands on products table
- Always backup before major changes
- Monitor product count regularly
- Use the protection system

## 📞 Support
If you need help, check the backup files and recovery instructions.
