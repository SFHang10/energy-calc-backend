# Energy Calculator Comparison

**Date:** November 17, 2025  
**Purpose:** Compare `energy-calculator-enhanced.html` vs `energy-calculator-enhanced-2.html`

---

## 📊 **Quick Summary**

| Feature | Old Version | New Version (-2) |
|---------|------------|------------------|
| **Theme** | Light blue theme | Dark theme with neon green accents |
| **API Integration** | ✅ Same | ✅ Same |
| **ETL Products** | ✅ Loads from `/api/etl/products` | ✅ Loads from `/api/etl/products` |
| **Backend Products** | ✅ Loads from `/api/products` | ✅ Loads from `/api/products` |
| **Grants Database** | ❌ Not included | ✅ Comprehensive grants database |
| **Visual Style** | Standard light theme | Enhanced dark theme with background images |
| **Production Ready** | ❌ Hardcoded localhost | ❌ Hardcoded localhost (needs fix) |

---

## 🔍 **Detailed Comparison**

### **1. Visual Design**

#### **Old Version (`energy-calculator-enhanced.html`):**
- **Theme:** Light blue theme
- **Background:** Light blue (`--light-blue: #E3F2FD`)
- **Style:** Standard, clean design
- **Colors:** Blue-based color scheme

#### **New Version (`energy-calculator-enhanced-2.html`):**
- **Theme:** Dark theme with neon green accents
- **Background:** Dark gradient with background image support
- **Style:** Enhanced dark theme matching Energy Audit Widget
- **Colors:** Dark blue/grey with neon green highlights
- **Background Images:** Dynamic backgrounds based on category
- **Font:** Inter font family
- **Icons:** Font Awesome 6.0.0

**Winner:** New version has more modern, visually appealing design

---

### **2. API Integration**

#### **Both Versions Use:**
- ✅ `/api/products?limit=1000` - Backend products
- ✅ `/api/etl/products?size=X` - ETL products
- ✅ Same loading logic and error handling
- ✅ Same product transformation

#### **API Loading Functions:**
Both have identical functions:
- `loadBackendProducts()` - Loads from `/api/products`
- `loadRealProducts()` - Loads from `/api/etl/products`
- `testETLConnection()` - Tests ETL API connection
- `loadEnhancedSampleData()` - Fallback sample data

**Status:** ✅ **Both work the same way with ETL API**

---

### **3. Product Loading Strategy**

#### **Both Versions:**
1. Try to load from local database (FULL-DATABASE-5554.json)
2. Load from backend API (`/api/products`)
3. Load from ETL API (`/api/etl/products`)
4. Load Energy Star products
5. Fallback to enhanced sample data

**Loading Order:**
```javascript
function initializeCalculator() {
    loadEnhancedSampleData();    // Sample data
    loadBackendProducts();        // Backend API
    loadRealProducts();          // ETL API
    loadEnergyStarProducts();    // Energy Star
    setupEventListeners();
}
```

**Status:** ✅ **Identical product loading logic**

---

### **4. Grants Database**

#### **Old Version:**
- ❌ No grants database
- No grant information displayed

#### **New Version:**
- ✅ **Comprehensive grants database** (lines 1252-1640)
- Includes grants for:
  - England (Lighting, Appliances, Heating, Restaurant Equipment)
  - Europe (multiple countries)
- Grant details include:
  - Name, amount, description
  - Eligibility requirements
  - Valid until dates
  - Application URLs
  - Contact information

**Winner:** New version has grants functionality

---

### **5. Backend URL Configuration**

#### **Both Versions:**
```javascript
const BACKEND_URL = 'http://localhost:4000';
```

**Issue:** ❌ Both are hardcoded to localhost  
**Needs Fix:** Should auto-detect production like membership pages

---

### **6. Code Structure**

#### **File Sizes:**
- Old: ~1,573 lines
- New: ~2,919 lines (+1,346 lines)

#### **Additional Features in New Version:**
- Grants database (~400 lines)
- Enhanced styling (~500 lines)
- Background image system
- More detailed UI components

---

### **7. Functionality Comparison**

| Function | Old Version | New Version |
|----------|------------|-------------|
| Product Loading | ✅ | ✅ |
| ETL API Integration | ✅ | ✅ |
| Backend API Integration | ✅ | ✅ |
| Category Selection | ✅ | ✅ |
| Product Comparison | ✅ | ✅ |
| Energy Calculations | ✅ | ✅ |
| Grants Information | ❌ | ✅ |
| Dark Theme | ❌ | ✅ |
| Background Images | ❌ | ✅ |
| Enhanced UI | ❌ | ✅ |

---

## ✅ **What Works in Both**

1. ✅ **ETL API Integration** - Both load from `/api/etl/products`
2. ✅ **Backend API Integration** - Both load from `/api/products`
3. ✅ **Product Loading** - Same logic and fallbacks
4. ✅ **Error Handling** - Same error handling approach
5. ✅ **Product Transformation** - Same data transformation

---

## ⚠️ **Issues to Fix**

### **1. Backend URL (Both Versions)**
**Problem:** Hardcoded to `http://localhost:4000`

**Fix Needed:**
```javascript
// Change from:
const BACKEND_URL = 'http://localhost:4000';

// To:
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : window.location.origin;
```

### **2. Background Image Paths (New Version Only)**
**Problem:** Hardcoded Windows paths in CSS:
```css
background-image: url('C:\\Users\\steph\\Documents\\energy-cal-backend\\PLANET__233_18_20_32_500_visible_5214.jpg');
```

**Fix Needed:** Use relative paths or server URLs

---

## 🎯 **Recommendation**

### **Use New Version (`energy-calculator-enhanced-2.html`):**
✅ **Pros:**
- Modern dark theme
- Grants database included
- Enhanced UI/UX
- More features
- Better visual design

⚠️ **Cons:**
- Needs backend URL fix
- Needs background image path fix
- Larger file size

### **Before Using in Production:**
1. ✅ Fix backend URL auto-detection
2. ✅ Fix background image paths
3. ✅ Test ETL API connection
4. ✅ Test product loading
5. ✅ Verify all calculations work

---

## 🧪 **Testing Checklist**

Before switching to new version:

- [ ] Test product loading from ETL API
- [ ] Test product loading from backend API
- [ ] Verify all products display correctly
- [ ] Test category filtering
- [ ] Test product comparison
- [ ] Test energy calculations
- [ ] Test grants display (if applicable)
- [ ] Fix backend URL for production
- [ ] Fix background image paths
- [ ] Test in production environment

---

## 📝 **Next Steps**

1. **Fix Backend URL** in `energy-calculator-enhanced-2.html`
2. **Fix Background Image Paths** in `energy-calculator-enhanced-2.html`
3. **Test ETL API Connection** - Verify products load correctly
4. **Test All Functionality** - Ensure everything works
5. **Update Membership Page Link** - Point to new calculator
6. **Deploy and Test in Production**

---

## 🔗 **Current Links**

**Old Calculator:**
- Local: `file:///C:/Users/steph/Documents/energy-cal-backend/Energy Cal 2/energy-calculator-enhanced.html`
- Server: `http://localhost:4000/Energy Cal 2/energy-calculator-enhanced.html`
- Production: `https://energy-calc-backend.onrender.com/Energy Cal 2/energy-calculator-enhanced.html`

**New Calculator:**
- Local: `file:///C:/Users/steph/Documents/energy-cal-backend/Energy Cal 2/energy-calculator-enhanced-2.html`
- Server: `http://localhost:4000/Energy Cal 2/energy-calculator-enhanced-2.html`
- Production: `https://energy-calc-backend.onrender.com/Energy Cal 2/energy-calculator-enhanced-2.html`

---

**Last Updated:** November 17, 2025  
**Status:** Ready for testing and fixes





