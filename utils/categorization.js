/**
 * Unified Product Categorization System
 * Matches audit widget categorization for consistent customer experience
 * 
 * This module provides categorization that works for both:
 * - Audit Widget (productTypes: oven, fridge, freezer, lights, motor, dishwasher, hvac, handdryer)
 * - Marketplace (categories: Heat Pumps, Motor Drives, HVAC Equipment, Heating Equipment, Lighting, Ovens, Hand Dryers, Fridges and Freezers)
 */

/**
 * Map ETL category/subcategory to audit widget product type
 * @param {string} category - Product category from ETL database
 * @param {string} subcategory - Product subcategory from ETL database
 * @param {string} name - Product name (for additional matching)
 * @returns {string} - Product type matching audit widget (oven, fridge, freezer, lights, motor, dishwasher, hvac, handdryer)
 */
function getProductType(category, subcategory = '', name = '') {
    const cat = (category || '').toLowerCase();
    const subcat = (subcategory || '').toLowerCase();
    const productName = (name || '').toLowerCase();

    // Ovens
    if (cat.includes('oven') || 
        subcat.includes('oven') || 
        productName.includes('oven') ||
        cat.includes('combi') ||
        subcat.includes('combi')) {
        return 'oven';
    }

    // Freezers (check first to avoid conflicts)
    if (cat.includes('freezer') || 
        subcat.includes('freezer') || 
        productName.includes('freezer')) {
        return 'freezer';
    }

    // Refrigerators (check after freezers to avoid conflicts)
    if (cat.includes('refrigerator') || 
        cat.includes('fridge') || 
        cat.includes('refrigeration') ||
        subcat.includes('refrigerator') || 
        subcat.includes('fridge') ||
        subcat.includes('refrigeration') ||
        subcat.includes('cooling') ||
        productName.includes('refrigerator') ||
        productName.includes('fridge') ||
        productName.includes('refrigeration') ||
        productName.includes('cooling cabinet') ||
        productName.includes('display cabinet')) {
        return 'fridge';
    }

    // Hand Dryers
    if (cat.includes('hand dryer') || 
        cat.includes('handdryer') ||
        subcat.includes('hand dryer') || 
        subcat.includes('handdryer') ||
        productName.includes('hand dryer') ||
        productName.includes('handdryer')) {
        return 'handdryer';
    }

    // Lighting
    if (cat.includes('lighting') || 
        cat.includes('light') || 
        subcat.includes('lighting') || 
        subcat.includes('led') ||
        subcat.includes('lamp') ||
        productName.includes('light') ||
        productName.includes('led') ||
        productName.includes('lamp')) {
        return 'lights';
    }

    // Motor Drives
    if (cat.includes('motor') || 
        cat.includes('drive') || 
        subcat.includes('motor') || 
        subcat.includes('drive') ||
        subcat.includes('inverter') ||
        subcat.includes('control') ||
        subcat.includes('variable speed') ||
        productName.includes('motor') ||
        productName.includes('drive') ||
        productName.includes('inverter')) {
        return 'motor';
    }

    // HVAC Equipment
    if (cat.includes('hvac') || 
        subcat.includes('hvac') || 
        subcat.includes('air conditioning') ||
        subcat.includes('reznor') ||
        productName.includes('hvac') ||
        productName.includes('air conditioning')) {
        return 'hvac';
    }

    // Heat Pumps (can be part of HVAC or separate)
    if (cat.includes('heat pump') || 
        subcat.includes('heat pump') || 
        subcat.includes('baxi heating') ||
        productName.includes('heat pump')) {
        return 'hvac'; // Heat pumps are HVAC in audit widget
    }

    // Heating Equipment (boilers, water heaters)
    if (cat.includes('heating') || 
        subcat.includes('heating') || 
        subcat.includes('boiler') ||
        subcat.includes('water heater') ||
        productName.includes('boiler') ||
        productName.includes('water heater')) {
        // If it's a heat pump, it's HVAC, otherwise it's heating
        if (subcat.includes('heat pump') || productName.includes('heat pump')) {
            return 'hvac';
        }
        return 'hvac'; // Heating equipment maps to HVAC in audit widget
    }

    // Dishwashers
    if (cat.includes('dishwasher') || 
        subcat.includes('dishwasher') || 
        productName.includes('dishwasher')) {
        return 'dishwasher';
    }

    // Default: return null or 'other' if no match
    return null;
}

/**
 * Map ETL category/subcategory to marketplace display category
 * @param {string} category - Product category from ETL database
 * @param {string} subcategory - Product subcategory from ETL database
 * @param {string} name - Product name (for additional matching)
 * @returns {object} - { displayCategory, displaySubcategory, productType }
 */
function categorizeProduct(category, subcategory = '', name = '') {
    const cat = (category || '').toLowerCase();
    const subcat = (subcategory || '').toLowerCase();
    const productName = (name || '').toLowerCase();

    let displayCategory = category; // Default to original category
    let displaySubcategory = subcategory;
    let productType = getProductType(category, subcategory, name);

    // Enhanced categorization for ETL Technology products (same as current logic)
    if (category === 'ETL Technology' || cat.includes('etl technology')) {
        // Heat Pumps
        if (subcat.includes('baxi heating-commercial') || 
            subcat.includes('heat pump') || 
            subcat.includes('heat pump') ||
            productName.includes('heat pump')) {
            displayCategory = 'Heat Pumps';
            displaySubcategory = 'Air to Water Heat Pumps';
            productType = 'hvac';
        }
        // HVAC Equipment
        else if (subcat.includes('hvac') || 
                 subcat.includes('reznor') ||
                 subcat.includes('air conditioning')) {
            displayCategory = 'HVAC Equipment';
            displaySubcategory = subcat.includes('hvac') ? 'HVAC Drives' : 'Heating Systems';
            productType = 'hvac';
        }
        // Motor Drives and Controls
        else if (subcat.includes('motor') || 
                 subcat.includes('drive') ||
                 subcat.includes('inverter') ||
                 subcat.includes('control')) {
            displayCategory = 'Motor Drives';
            displaySubcategory = 'Variable Speed Drives';
            productType = 'motor';
        }
        // Heating Equipment
        else if (subcat.includes('heating') || 
                 subcat.includes('boiler') ||
                 subcat.includes('water heater')) {
            displayCategory = 'Heating Equipment';
            displaySubcategory = subcat;
            productType = 'hvac';
        }
        // Lighting
        else if (subcat.includes('lighting') || 
                 subcat.includes('led') ||
                 subcat.includes('lamp')) {
            displayCategory = 'Lighting';
            displaySubcategory = subcat;
            productType = 'lights';
        }
        // Keep as ETL Technology for other products
        else {
            displayCategory = 'ETL Technology';
            displaySubcategory = subcategory;
        }
    }
    // Handle other categories
    else {
        // Ovens
        if (cat.includes('oven') || subcat.includes('oven') || productName.includes('oven')) {
            displayCategory = 'Ovens';
            productType = 'oven';
        }
        // Fridges and Freezers (check freezers first)
        else if (cat.includes('freezer') || subcat.includes('freezer') || productName.includes('freezer')) {
            displayCategory = 'Fridges and Freezers';
            productType = 'freezer';
        }
        // Refrigerators/Fridges
        else if (cat.includes('refrigerator') || cat.includes('fridge') || 
                 cat.includes('refrigeration') ||
                 subcat.includes('refrigerator') || subcat.includes('fridge') ||
                 subcat.includes('refrigeration') || subcat.includes('cooling') ||
                 productName.includes('refrigerator') || productName.includes('fridge') ||
                 productName.includes('refrigeration') || productName.includes('cooling cabinet') ||
                 productName.includes('display cabinet')) {
            displayCategory = 'Fridges and Freezers';
            productType = 'fridge';
        }
        // Hand Dryers
        else if (cat.includes('hand dryer') || cat.includes('handdryer') ||
                 subcat.includes('hand dryer') || subcat.includes('handdryer') ||
                 productName.includes('hand dryer') || productName.includes('handdryer')) {
            displayCategory = 'Hand Dryers';
            productType = 'handdryer';
        }
        // Lighting
        else if (cat.includes('lighting') || cat.includes('light') ||
                 subcat.includes('lighting') || subcat.includes('led') ||
                 productName.includes('light') || productName.includes('led')) {
            displayCategory = 'Lighting';
            productType = 'lights';
        }
        // Motor Drives
        else if (cat.includes('motor') || cat.includes('drive') ||
                 subcat.includes('motor') || subcat.includes('drive') ||
                 subcat.includes('inverter')) {
            displayCategory = 'Motor Drives';
            productType = 'motor';
        }
        // HVAC Equipment
        else if (cat.includes('hvac') || subcat.includes('hvac') ||
                 subcat.includes('air conditioning')) {
            displayCategory = 'HVAC Equipment';
            productType = 'hvac';
        }
        // Heat Pumps
        else if (cat.includes('heat pump') || subcat.includes('heat pump') ||
                 productName.includes('heat pump')) {
            displayCategory = 'Heat Pumps';
            productType = 'hvac';
        }
        // Heating Equipment
        else if (cat.includes('heating') || subcat.includes('heating') ||
                 subcat.includes('boiler')) {
            displayCategory = 'Heating Equipment';
            productType = 'hvac';
        }
    }

    return {
        displayCategory,
        displaySubcategory,
        productType,
        shopCategory: displayCategory,
        shopSubcategory: displaySubcategory,
        // Helper flags
        isHVAC: displayCategory === 'HVAC Equipment' || displayCategory === 'Heat Pumps',
        isMotor: displayCategory === 'Motor Drives',
        isHeating: displayCategory === 'Heat Pumps' || displayCategory === 'Heating Equipment'
    };
}

/**
 * Get audit widget product type name from type key
 * @param {string} productType - Product type key (oven, fridge, etc.)
 * @returns {string} - Display name for audit widget
 */
function getProductTypeName(productType) {
    const typeMap = {
        'oven': 'Ovens',
        'fridge': 'Refrigerators',
        'freezer': 'Freezers',
        'lights': 'Lighting',
        'motor': 'Motors',
        'dishwasher': 'Dishwashers',
        'hvac': 'HVAC Equipment',
        'handdryer': 'Hand Dryers'
    };
    return typeMap[productType] || productType;
}

/**
 * Get audit widget product type icon from type key
 * @param {string} productType - Product type key (oven, fridge, etc.)
 * @returns {string} - Icon emoji for audit widget
 */
function getProductTypeIcon(productType) {
    const iconMap = {
        'oven': '🔥',
        'fridge': '🧊',
        'freezer': '❄️',
        'lights': '💡',
        'motor': '⚙️',
        'dishwasher': '📻',
        'hvac': '🌡️',
        'handdryer': '🤚'
    };
    return iconMap[productType] || '📦';
}

module.exports = {
    getProductType,
    categorizeProduct,
    getProductTypeName,
    getProductTypeIcon
};

