# 🏗️ Complete Project Architecture Overview

## 📋 **Project Summary**
This is a comprehensive energy efficiency platform with multiple interconnected calculators, marketplace integration, and ETL product database. The system serves both B2B and B2C markets with energy calculations, product recommendations, and government incentive tracking.

---

## 🎯 **Core Systems Overview**

### **1. Main Energy Calculator System** ⚡
**Location**: `energy-cal-backend/`
**Purpose**: Primary energy calculation engine with product integration

#### **Key Files**:
- `product-page-v2.html` - Main product page with embedded calculator
- `product-page-v2-marketplace-test.html` - Marketplace-enabled product page
- `product-energy-widget-glassmorphism.html` - Green glassmorphism calculator widget
- `product-categories-optimized.html` - Category browser
- `category-product-page.html` - Individual category product listings
- `server.js` - Main backend server (port 4000)

#### **Features**:
- ✅ Real-time energy cost calculations
- ✅ Product comparison functionality
- ✅ Government incentives lookup (NL, DE, ES, PT)
- ✅ ETL product database integration
- ✅ Grants and collection agencies system
- ✅ Green glassmorphism UI design

---

### **2. Marketplace Integration System** 🛒
**Location**: `energy-cal-backend/marketplace/`
**Purpose**: E-commerce functionality with affiliate programs

#### **Key Files**:
- `affiliate-config.json` - Affiliate program configurations
- `affiliate-manager.js` - Affiliate link generation and tracking
- `product-sync.js` - ETL product synchronization
- `safe-marketplace-integration.js` - Non-interfering marketplace features

#### **Features**:
- ✅ Cart modal system
- ✅ Installation services (+€150)
- ✅ Extended warranty (+€99)
- ✅ Financing options (24/36/48 months)
- ✅ Related products recommendations
- ✅ Live chat integration
- ✅ Affiliate tracking (Bosch, Siemens, Hobart, Adande)

---

### **3. Energy Audit Widget** 🏠
**Location**: `energy-cal-backend/energy-audit-widget.html`
**Purpose**: Space-based energy audit tool

#### **Status**: ✅ Working Prototype
#### **Features**:
- ✅ Side-by-side comparison (Current vs Efficient)
- ✅ Drag & drop product placement
- ✅ Real-time energy calculations
- ✅ Kitchen, office, restaurant layouts
- ✅ Visual space planning

#### **TODO Items**:
- 🔄 Expand product database with ETL products
- 🔄 Membership integration for saving configurations
- 🔄 Enhanced calculations (ROI, payback periods)
- 🔄 Export functionality (PDF reports)

---

### **4. Enhanced Product Calculator** 📊
**Location**: `energy-cal-backend/Energy Cal 2/energy-calculator-enhanced - Copy.html`
**Purpose**: Advanced product comparison with dark theme

#### **Features**:
- ✅ Category-specific backgrounds
- ✅ Dynamic product loading
- ✅ Advanced comparison metrics
- ✅ Dark theme with neon accents
- ✅ Responsive design

---

### **5. Wix Marketplace Integration** 🌐
**Location**: `greenways-market/`
**Purpose**: Wix platform integration

#### **Key Files**:
- `jsconfig.json` - TypeScript configuration
- `wix.config.json` - Wix site configuration
- `getCatalogVersion.js` - Catalog management

#### **Features**:
- ✅ Wix platform compatibility
- ✅ Site ID: `cfa82ec2-a075-4152-9799-6a1dd5c01ef4`
- ✅ UI Version: 281

---

## 🔗 **System Integration Points**

### **Database Connections**:
```
SQLite Database (energy_calculator.db)
├── ETL Products Table
├── Grants & Incentives Table
├── Collection Agencies Table
└── User Data Table
```

### **API Endpoints**:
```
Backend Server (localhost:4000)
├── /api/products - Product data
├── /api/product-widget - Widget data
├── /api/calculate - Energy calculations
├── /api/categories - Category listings
├── /api/etl - ETL product data
└── /api/marketplace - Marketplace functions
```

### **Frontend Integration**:
```
Wix Website (greenways-market)
├── Product Pages (iframes)
├── Calculator Widgets (embedded)
├── Category Browsers (embedded)
└── Marketplace Features (embedded)
```

---

## 🎨 **UI/UX Design Systems**

### **1. Glassmorphism Theme** (Primary)
- **File**: `product-energy-widget-glassmorphism.html`
- **Colors**: Green gradient backgrounds, glassmorphism cards
- **Style**: Modern, translucent, green accent
- **Usage**: Main calculator widget

### **2. Dark Theme** (Enhanced)
- **File**: `energy-calculator-enhanced - Copy.html`
- **Colors**: Dark blue backgrounds, neon green accents
- **Style**: Professional, high-contrast
- **Usage**: Advanced product comparisons

### **3. Clean Theme** (Audit)
- **File**: `energy-audit-widget.html`
- **Colors**: Light backgrounds, clean layouts
- **Style**: Functional, space-focused
- **Usage**: Energy audit tool

---

## 📊 **Data Flow Architecture**

### **Product Data Flow**:
```
ETL Database → Backend API → Frontend Widgets → User Interface
```

### **Calculation Flow**:
```
User Input → Calculator Engine → Database Lookup → Results Display
```

### **Marketplace Flow**:
```
Product Selection → Affiliate Link Generation → External Purchase → Commission Tracking
```

---

## 🚨 **Critical Dependencies**

### **Must Not Break**:
1. **Calculator Widget Loading** - Iframe URLs must remain correct
2. **Product Page Routing** - Category links must work
3. **Database Connections** - API endpoints must remain functional
4. **Wix Integration** - Site configuration must be preserved

### **Safe to Modify**:
1. **Styling and CSS** - Visual improvements
2. **Additional Features** - New functionality
3. **Content Updates** - Text and descriptions
4. **Performance Optimizations** - Code improvements

---

## 🔧 **Development Guidelines**

### **Before Making Changes**:
1. **Backup Current State** - Save working files
2. **Test in Isolation** - Use separate test files
3. **Check Dependencies** - Verify API connections
4. **Document Changes** - Update this overview

### **Safe Change Process**:
1. **Create Test Version** - Copy working file
2. **Make Incremental Changes** - Small, testable updates
3. **Test Each Change** - Verify functionality
4. **Update Documentation** - Record modifications
5. **Deploy Gradually** - Roll out in phases

---

## 📁 **File Organization**

### **Core System Files**:
```
energy-cal-backend/
├── server.js                    # Main backend server
├── product-page-v2.html         # Main product page
├── product-energy-widget-glassmorphism.html  # Calculator widget
├── product-categories-optimized.html         # Category browser
├── category-product-page.html               # Category listings
└── routes/                      # API endpoints
    ├── products.js
    ├── product-widget.js
    └── calculate.js
```

### **Marketplace Files**:
```
energy-cal-backend/marketplace/
├── affiliate-config.json        # Affiliate programs
├── affiliate-manager.js         # Link generation
├── product-sync.js             # Product synchronization
└── safe-marketplace-integration.js  # Safe integration
```

### **Specialized Tools**:
```
energy-cal-backend/
├── energy-audit-widget.html     # Audit tool
├── Energy Cal 2/               # Enhanced calculator
└── marketplace-integration-*.md # Documentation
```

### **Wix Integration**:
```
greenways-market/
├── jsconfig.json               # TypeScript config
├── wix.config.json            # Site config
└── getCatalogVersion.js       # Catalog management
```

---

## 🎯 **Next Steps Recommendations**

### **Immediate Priorities**:
1. **Document Current State** - Complete this overview
2. **Test All Systems** - Verify everything works
3. **Create Backup Strategy** - Prevent data loss
4. **Plan Safe Changes** - Identify improvement areas

### **Development Roadmap**:
1. **Phase 1**: Stabilize existing functionality
2. **Phase 2**: Enhance user experience
3. **Phase 3**: Add new features
4. **Phase 4**: Optimize performance

---

## 📞 **Support & Maintenance**

### **Key Contacts**:
- **Technical Issues**: Check server logs and API responses
- **Data Issues**: Verify database connections
- **UI Issues**: Test in multiple browsers
- **Integration Issues**: Check Wix configuration

### **Monitoring Points**:
- **Server Status**: `http://localhost:4000/health`
- **API Endpoints**: Test all `/api/` routes
- **Database**: Verify SQLite file integrity
- **Frontend**: Check iframe loading and routing

---

*Last Updated: January 2025*
*Status: ✅ Complete System Overview*
*Next Review: Before making any changes*


