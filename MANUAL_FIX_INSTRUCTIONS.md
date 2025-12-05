# Manual Fix Instructions - Scripts Not Working

## ⚠️ IMPORTANT: Scripts are not updating the file in this environment

Since scripts run but don't update the file, use these manual edit instructions.

---

## File to Edit

**`FULL-DATABASE-5554.json`**

**Location:** `C:\Users\steph\Documents\energy-cal-backend\FULL-DATABASE-5554.json`

---

## Fix 1: Carrier Refrigeration all glass door

**Line:** ~36355

**Find this exact text:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```

**Replace with:**
```json
      "imageUrl": "https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg",
```

**Context (to find the right line):**
- Look for: `"name": "Carrier Refrigeration all glass door"`
- A few lines below that, find `"imageUrl": "Product Placement/Motor.jpg"`
- Replace just the imageUrl value

---

## Fix 2: Carrier Refrigeration anti-reflective all glass door

**Line:** ~36943

**Find this exact text:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```

**Replace with:**
```json
      "imageUrl": "https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg",
```

**Context (to find the right line):**
- Look for: `"name": "Carrier Refrigeration anti-reflective all glass door"`
- A few lines below that, find `"imageUrl": "Product Placement/Motor.jpg"`
- Replace just the imageUrl value

---

## Fix 3: Baxi Solarflo (In-Roof)

**Line:** ~34283

**Find this exact text:**
```json
      "imageUrl": "Product Placement/Motor.jpg",
```

**Replace with:**
```json
      "imageUrl": "Product Placement/Baxi-STS-1.jpeg",
```

**Context (to find the right line):**
- Look for: `"name": "Baxi Solarflo (In-Roof)"`
- A few lines below that, find `"imageUrl": "Product Placement/Motor.jpg"`
- Replace just the imageUrl value

---

## How to Edit

### Option 1: Using VS Code / Cursor
1. Open `FULL-DATABASE-5554.json` in your editor
2. Press `Ctrl+F` to search
3. Search for: `"Carrier Refrigeration all glass door"`
4. Find the `imageUrl` line below it
5. Replace `"Product Placement/Motor.jpg"` with the correct URL
6. Repeat for the other 2 products
7. Save the file

### Option 2: Using Find & Replace
1. Open `FULL-DATABASE-5554.json`
2. Use Find & Replace (`Ctrl+H`)
3. **Be careful** - only replace the specific instances:
   - Find: `"imageUrl": "Product Placement/Motor.jpg",`
   - Replace: Check each match to ensure it's the right product
   - Only replace the 3 specific products listed above

### Option 3: Using Notepad++ or Similar
1. Open `FULL-DATABASE-5554.json`
2. Use Find (`Ctrl+F`)
3. Search for each product name
4. Find and replace the imageUrl line
5. Save

---

## Verification

After making changes, verify:

1. **Search for Carrier "all glass door":**
   - Should show: `c123de_e8e3856e5d4f4043bcae90d8198038ed`

2. **Search for Carrier "anti-reflective":**
   - Should show: `c123de_f0dbfab76a1e4c23b178c27f90624ea3`

3. **Search for Baxi Solarflo:**
   - Should show: `Baxi-STS-1.jpeg`

4. **Search for remaining Motor.jpg:**
   - Should NOT find any in these 3 products
   - (Other products may still have Motor.jpg if they're actual motors)

---

## After Fixing

1. **Save the file**
2. **Restart your server** (if running) to clear cache
3. **Check the website** to verify images are correct
4. **Commit to GitHub** when ready

---

## Why Scripts Don't Work

The scripts run (exit code 0) but:
- Console output is suppressed
- File doesn't get updated
- No error messages visible

**Possible causes:**
- File may be locked by another process
- Permission issues
- Execution environment issue
- Output redirection problem

**Solution:** Manual edit is the most reliable method in this case.

---

## Backup Recommendation

**Before editing, create a backup:**

```bash
copy FULL-DATABASE-5554.json FULL-DATABASE-5554.json.backup_manual_fix
```

Or in PowerShell:
```powershell
Copy-Item FULL-DATABASE-5554.json FULL-DATABASE-5554.json.backup_manual_fix
```

---

## Summary

**3 products need fixing:**
1. Carrier all glass door → Wix URL
2. Carrier anti-reflective → Wix URL  
3. Baxi Solarflo → `Product Placement/Baxi-STS-1.jpeg`

**Method:** Manual edit (scripts not working in this environment)

**Time:** ~5 minutes

**Risk:** Low (only changing imageUrl field, creating backup first)

