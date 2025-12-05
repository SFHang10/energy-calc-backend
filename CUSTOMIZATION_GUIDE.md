# 🛠️ Category Filtering Customization Guide

## 📍 **Where to Find the Filtering Logic**

The filtering logic is in `category-product-page.html` around **lines 288-345**. Here's how to customize it:

## 🎯 **Current Category Filters**

### **Heat Pumps Filter (Lines 292-302)**
```javascript
'heat-pumps': {
    title: '🔥 Heat Pumps',
    description: 'High-efficiency heat pumps for residential and commercial applications',
    filter: (product) => {
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        return name.includes('heat pump') || name.includes('altherma') || 
               name.includes('vitocal') || name.includes('auriga') || 
               name.includes('quinta ace') || name.includes('compress') ||
               name.includes('logic air') || brand.includes('baxi') ||
               brand.includes('daikin') || brand.includes('viessmann') ||
               brand.includes('bosch') || brand.includes('hisa') ||
               brand.includes('ideal');
    }
}
```

### **HVAC Equipment Filter (Lines 304-318)**
```javascript
'hvac': {
    title: '🏭 HVAC Equipment',
    description: 'Professional HVAC drives, controls, and systems',
    filter: (product) => {
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        return name.includes('hvac') || name.includes('drive') || 
               name.includes('frenic') || name.includes('optidrive') ||
               name.includes('vlt') || name.includes('acs880') ||
               name.includes('chilled beam') || name.includes('perfect irus') ||
               brand.includes('danfoss') || brand.includes('fuji') ||
               brand.includes('invertek') || brand.includes('evapco') ||
               brand.includes('jaeggi') || brand.includes('abb');
    }
}
```

### **Motors Filter (Lines 319-330)**
```javascript
'motors': {
    title: '⚡ Motors',
    description: 'High-efficiency IE4 and IE3 motors for industrial applications',
    filter: (product) => {
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        return name.includes('motor') || name.includes('ie4') || 
               name.includes('ie3') || name.includes('asynchronous') ||
               name.includes('synchronous') || brand.includes('nord') ||
               brand.includes('abb');
    }
}
```

## 🔧 **How to Customize Filters**

### **1. Add New Product Names**
To include more products in a category, add more name checks:

```javascript
// Example: Add more heat pump models
filter: (product) => {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    return name.includes('heat pump') || name.includes('altherma') || 
           name.includes('vitocal') || name.includes('auriga') || 
           name.includes('quinta ace') || name.includes('compress') ||
           name.includes('logic air') || name.includes('new-model') ||  // ← ADD THIS
           name.includes('another-model') ||                              // ← ADD THIS
           brand.includes('baxi') || brand.includes('daikin') ||
           brand.includes('viessmann') || brand.includes('bosch') ||
           brand.includes('hisa') || brand.includes('ideal');
}
```

### **2. Add New Brands**
To include more brands, add brand checks:

```javascript
// Example: Add more motor brands
filter: (product) => {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    return name.includes('motor') || name.includes('ie4') || 
           name.includes('ie3') || name.includes('asynchronous') ||
           name.includes('synchronous') || brand.includes('nord') ||
           brand.includes('abb') || brand.includes('weg') ||        // ← ADD THIS
           brand.includes('siemens') || brand.includes('schneider');  // ← ADD THIS
}
```

### **3. Create New Categories**
To add a completely new category, add it to the `categoryInfo` object:

```javascript
// Example: Add a new "Boilers" category
'boilers': {
    title: '🔥 Boilers',
    description: 'High-efficiency boilers for heating applications',
    filter: (product) => {
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        return name.includes('boiler') || name.includes('vitodens') ||
               name.includes('condensing') || brand.includes('viessmann') ||
               brand.includes('baxi') || brand.includes('worcester');
    }
}
```

### **4. Modify Power Range Filters**
To change power ranges, modify the HTML select options (lines 249-257):

```html
<select id="power-filter">
    <option value="">All Power</option>
    <option value="0-0.5">0-0.5kW</option>    <!-- ← ADD THIS -->
    <option value="0.5-2">0.5-2kW</option>    <!-- ← ADD THIS -->
    <option value="2-5">2-5kW</option>        <!-- ← MODIFY THIS -->
    <option value="5-15">5-15kW</option>       <!-- ← MODIFY THIS -->
    <option value="15+">15kW+</option>        <!-- ← MODIFY THIS -->
</select>
```

### **5. Add Custom Filtering Logic**
For more complex filtering, you can add custom logic:

```javascript
// Example: Filter by power range AND efficiency
filter: (product) => {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    const power = parseFloat(product.power) || 0;
    const efficiency = product.efficiency.toLowerCase();
    
    // Must be a motor AND have high efficiency AND power > 1kW
    return (name.includes('motor') || brand.includes('nord')) &&
           efficiency.includes('high') &&
           power > 1;
}
```

## 🎨 **Customization Examples**

### **Example 1: Create a "Premium Products" Category**
```javascript
'premium': {
    title: '⭐ Premium Products',
    description: 'High-end, premium efficiency products',
    filter: (product) => {
        const power = parseFloat(product.power) || 0;
        const efficiency = product.efficiency.toLowerCase();
        const price = parseFloat(product.price) || 0;
        
        return efficiency.includes('high') && 
               power > 5 && 
               price > 2000;
    }
}
```

### **Example 2: Create a "Small Motors" Category**
```javascript
'small-motors': {
    title: '🔧 Small Motors',
    description: 'Compact motors under 5kW',
    filter: (product) => {
        const name = product.name.toLowerCase();
        const power = parseFloat(product.power) || 0;
        
        return (name.includes('motor') || name.includes('ie4')) &&
               power > 0 && power <= 5;
    }
}
```

### **Example 3: Create a "Commercial Equipment" Category**
```javascript
'commercial': {
    title: '🏢 Commercial Equipment',
    description: 'Heavy-duty commercial and industrial equipment',
    filter: (product) => {
        const power = parseFloat(product.power) || 0;
        const brand = product.brand.toLowerCase();
        
        return power > 10 && (
            brand.includes('abb') || brand.includes('siemens') ||
            brand.includes('danfoss') || brand.includes('weg')
        );
    }
}
```

## 🚀 **How to Apply Changes**

1. **Edit the file**: Open `category-product-page.html`
2. **Find the categoryInfo object**: Around line 288
3. **Modify the filter function**: Update the logic for your category
4. **Save the file**: Changes take effect immediately
5. **Test the URL**: Visit `http://localhost:4000/category-product-page.html?category=your-category`

## 📝 **Adding New Categories to Navigation**

To add new categories to the navigation page (`product-categories.html`), add them around **lines 50-80**:

```html
<div class="category-card" onclick="openCategory('your-new-category')">
    <span class="category-icon">🔧</span>
    <h2 class="category-title">Your New Category</h2>
    <p class="category-description">
        Description of your new category and what products it includes.
    </p>
    <a href="#" class="category-link" onclick="event.stopPropagation(); openCategory('your-new-category')">
        View Products
    </a>
</div>
```

## 🎯 **Pro Tips**

1. **Test with Real Data**: Use the API to see what products you actually have
2. **Use Console Logs**: Add `console.log(product)` in filters to debug
3. **Case Insensitive**: Always use `.toLowerCase()` for string comparisons
4. **Handle Missing Data**: Use `|| 'default'` for missing properties
5. **Power Calculations**: Use `parseFloat(product.power) || 0` for numeric comparisons

## 🔍 **Debugging Filters**

Add this to any filter to see what products match:

```javascript
filter: (product) => {
    const matches = /* your filter logic */;
    if (matches) {
        console.log('✅ Match:', product.name, product.brand);
    }
    return matches;
}
```

This gives you complete control over which products appear in each category!
















