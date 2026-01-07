// PRODUCT DATABASE BACKUP - SAFE TO MODIFY
// This file contains all our product data and can be safely edited
// without affecting the main calculator functionality

const PRODUCT_DATABASE_BACKUP = {
    // Sample Products - Core Database
    sampleProducts: [
        // Original Sample Products
        { id: 'sample_1', name: 'Samsung 4-Door French Door Refrigerator', power: 180, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Samsung', runningCostPerYear: 78.84, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_2', name: 'LG Front Load Washer', power: 500, category: 'Appliances', subcategory: 'Washing Machine', brand: 'LG', runningCostPerYear: 219.00, energyRating: 'A++', efficiency: 'High', source: 'Sample' },
        { id: 'sample_3', name: 'Bosch Dishwasher', power: 155, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Bosch', runningCostPerYear: 67.89, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_4', name: 'Philips LED Bulb 9W', power: 9, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Philips', runningCostPerYear: 3.94, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_5', name: 'Nest Learning Thermostat', power: 3, category: 'Smart Home', subcategory: 'Thermostats', brand: 'Nest', runningCostPerYear: 1.31, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_6', name: 'Dyson V15 Detect', power: 240, category: 'Appliances', subcategory: 'Other', brand: 'Dyson', runningCostPerYear: 105.12, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_7', name: 'Instant Pot Duo', power: 1000, category: 'Appliances', subcategory: 'Other', brand: 'Instant Pot', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_8', name: 'Ring Video Doorbell', power: 2, category: 'Smart Home', subcategory: 'Sensors', brand: 'Ring', runningCostPerYear: 0.88, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_9', name: 'Echo Dot 4th Gen', power: 3, category: 'Smart Home', subcategory: 'Hubs', brand: 'Amazon', runningCostPerYear: 1.31, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_10', name: 'Apple HomePod Mini', power: 2, category: 'Smart Home', subcategory: 'Hubs', brand: 'Apple', runningCostPerYear: 0.88, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_11', name: 'Google Nest Hub', power: 2, category: 'Smart Home', subcategory: 'Hubs', brand: 'Google', runningCostPerYear: 0.88, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_12', name: 'Samsung SmartThings Hub', power: 2, category: 'Smart Home', subcategory: 'Hubs', brand: 'Samsung', runningCostPerYear: 0.88, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_13', name: 'Philips Hue Bridge', power: 1, category: 'Smart Home', subcategory: 'Hubs', brand: 'Philips', runningCostPerYear: 0.44, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_14', name: 'Wemo Smart Plug', power: 1, category: 'Smart Home', subcategory: 'Sensors', brand: 'Belkin', runningCostPerYear: 0.44, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_15', name: 'TP-Link Kasa Smart Plug', power: 1, category: 'Smart Home', subcategory: 'Sensors', brand: 'TP-Link', runningCostPerYear: 0.44, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'sample_16', name: 'Samsung 55" QLED TV', power: 120, category: 'Appliances', subcategory: 'Other', brand: 'Samsung', runningCostPerYear: 52.56, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_17', name: 'LG 65" OLED TV', power: 150, category: 'Appliances', subcategory: 'Other', brand: 'LG', runningCostPerYear: 65.70, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_18', name: 'Sony 75" 4K TV', power: 180, category: 'Appliances', subcategory: 'Other', brand: 'Sony', runningCostPerYear: 78.84, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_19', name: 'Panasonic Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Panasonic', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_20', name: 'Sharp Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Sharp', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_21', name: 'Toshiba Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Toshiba', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_22', name: 'GE Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'GE', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_23', name: 'Whirlpool Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Whirlpool', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_24', name: 'KitchenAid Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'KitchenAid', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_25', name: 'Maytag Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Maytag', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_26', name: 'Frigidaire Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Frigidaire', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_27', name: 'Amana Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Amana', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_28', name: 'Haier Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Haier', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_29', name: 'Hisense Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Hisense', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_30', name: 'TCL Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'TCL', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_31', name: 'Vizio Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Vizio', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_32', name: 'Insignia Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Insignia', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_33', name: 'Onn Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Onn', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_34', name: 'RCA Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'RCA', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_35', name: 'JVC Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'JVC', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_36', name: 'Pioneer Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Pioneer', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_37', name: 'Yamaha Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Yamaha', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_38', name: 'Denon Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Denon', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_39', name: 'Marantz Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Marantz', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_40', name: 'Harman Kardon Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Harman Kardon', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_41', name: 'Bose Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'Bose', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_42', name: 'Klipsch Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Klipsch', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_43', name: 'Definitive Technology Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Definitive Technology', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_44', name: 'MartinLogan Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'MartinLogan', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_45', name: 'Paradigm Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'Paradigm', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_46', name: 'Monitor Audio Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Monitor Audio', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_47', name: 'B&W Microwave', power: 1100, category: 'Appliances', subcategory: 'Microwave', brand: 'B&W', runningCostPerYear: 481.80, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_48', name: 'KEF Microwave', power: 1000, category: 'Appliances', subcategory: 'Microwave', brand: 'KEF', runningCostPerYear: 438.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_49', name: 'Dynaudio Microwave', power: 1200, category: 'Appliances', subcategory: 'Microwave', brand: 'Dynaudio', runningCostPerYear: 525.60, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'sample_50', name: 'Hisense Dishwasher', power: 155, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Hisense', runningCostPerYear: 67.89, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },

        // NEW: Ovens - 10 products
        { id: 'oven_1', name: 'Bosch HBL8453UC 30" Single Wall Oven', power: 2400, category: 'Appliances', subcategory: 'Oven', brand: 'Bosch', runningCostPerYear: 105.12, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'oven_2', name: 'GE Profile P2B940YPFS 30" Double Wall Oven', power: 2600, category: 'Appliances', subcategory: 'Oven', brand: 'GE', runningCostPerYear: 113.88, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'oven_3', name: 'KitchenAid KODE500ESS 30" Double Wall Oven', power: 2500, category: 'Appliances', subcategory: 'Oven', brand: 'KitchenAid', runningCostPerYear: 109.50, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'oven_4', name: 'Whirlpool WOD51HZES 30" Double Wall Oven', power: 2700, category: 'Appliances', subcategory: 'Oven', brand: 'Whirlpool', runningCostPerYear: 118.26, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'oven_5', name: 'Maytag MWO5105BZ 30" Single Wall Oven', power: 2300, category: 'Appliances', subcategory: 'Oven', brand: 'Maytag', runningCostPerYear: 100.74, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'oven_6', name: 'Frigidaire Gallery FGEW3065UF 30" Wall Oven', power: 2800, category: 'Appliances', subcategory: 'Oven', brand: 'Frigidaire', runningCostPerYear: 122.64, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'oven_7', name: 'Samsung NE58K9430WS 30" Wall Oven', power: 2450, category: 'Appliances', subcategory: 'Oven', brand: 'Samsung', runningCostPerYear: 107.31, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'oven_8', name: 'LG LDE4413ST 30" Double Wall Oven', power: 2550, category: 'Appliances', subcategory: 'Oven', brand: 'LG', runningCostPerYear: 111.69, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'oven_9', name: 'Panasonic NN-SN966S Countertop Microwave', power: 1250, category: 'Appliances', subcategory: 'Oven', brand: 'Panasonic', runningCostPerYear: 54.75, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'oven_10', name: 'Electrolux EI30EF55QS 30" Single Wall Oven', power: 2750, category: 'Appliances', subcategory: 'Oven', brand: 'Electrolux', runningCostPerYear: 120.45, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },

        // NEW: Restaurant Equipment - 10 products
        { id: 'rest_oven_1', name: 'Vulcan VC4GD 4-Burner Gas Range', power: 15000, category: 'Restaurant Equipment', subcategory: 'Commercial Ovens', brand: 'Vulcan', runningCostPerYear: 657.00, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'rest_oven_2', name: 'Wolf CR3040 30" Gas Range', power: 12000, category: 'Restaurant Equipment', subcategory: 'Commercial Ovens', brand: 'Wolf', runningCostPerYear: 525.60, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'rest_oven_3', name: 'Garland GR6 6-Burner Gas Range', power: 18000, category: 'Restaurant Equipment', subcategory: 'Commercial Ovens', brand: 'Garland', runningCostPerYear: 788.40, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'rest_fridge_1', name: 'True T-49 4-Door Commercial Refrigerator', power: 800, category: 'Restaurant Equipment', subcategory: 'Commercial Fridges', brand: 'True', runningCostPerYear: 35.04, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'rest_fridge_2', name: 'Beverage Air BM-23 Commercial Refrigerator', power: 750, category: 'Restaurant Equipment', subcategory: 'Commercial Fridges', brand: 'Beverage Air', runningCostPerYear: 32.85, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'rest_fridge_3', name: 'Hoshizaki KM-500MAJ Commercial Refrigerator', power: 850, category: 'Restaurant Equipment', subcategory: 'Commercial Fridges', brand: 'Hoshizaki', runningCostPerYear: 37.23, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'rest_freezer_1', name: 'Traulsen G-2 Commercial Freezer', power: 900, category: 'Restaurant Equipment', subcategory: 'Commercial Freezers', brand: 'Traulsen', runningCostPerYear: 39.42, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'rest_freezer_2', name: 'Arctic Air Commercial Freezer', power: 950, category: 'Restaurant Equipment', subcategory: 'Commercial Freezers', brand: 'Arctic Air', runningCostPerYear: 41.61, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'rest_prep_1', name: 'Hobart A200 Commercial Mixer', power: 200, category: 'Restaurant Equipment', subcategory: 'Food Prep', brand: 'Hobart', runningCostPerYear: 8.76, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'rest_prep_2', name: 'KitchenAid 5KSM150PSER Stand Mixer', power: 300, category: 'Restaurant Equipment', subcategory: 'Food Prep', brand: 'KitchenAid', runningCostPerYear: 13.14, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'rest_prep_3', name: 'Cuisinart SM-50 Stand Mixer', power: 250, category: 'Restaurant Equipment', subcategory: 'Food Prep', brand: 'Cuisinart', runningCostPerYear: 10.95, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'rest_prep_4', name: 'Hamilton Beach Commercial Blender', power: 400, category: 'Restaurant Equipment', subcategory: 'Food Prep', brand: 'Hamilton Beach', runningCostPerYear: 17.52, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'rest_prep_5', name: 'Berkel Commercial Meat Slicer', power: 350, category: 'Restaurant Equipment', subcategory: 'Food Prep', brand: 'Berkel', runningCostPerYear: 15.33, energyRating: 'A+', efficiency: 'High', source: 'Sample' },

        // NEW: Office Equipment - 10 products
        { id: 'office_comp_1', name: 'Dell OptiPlex 7090 Desktop', power: 180, category: 'Office Equipment', subcategory: 'Computers', brand: 'Dell', runningCostPerYear: 78.84, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_comp_2', name: 'HP EliteDesk 800 G6 Desktop', power: 200, category: 'Office Equipment', subcategory: 'Computers', brand: 'HP', runningCostPerYear: 87.60, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_comp_3', name: 'Lenovo ThinkCentre M90t Desktop', power: 190, category: 'Office Equipment', subcategory: 'Computers', brand: 'Lenovo', runningCostPerYear: 83.22, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_laptop_1', name: 'MacBook Pro 14" M1 Pro', power: 70, category: 'Office Equipment', subcategory: 'Laptops', brand: 'Apple', runningCostPerYear: 30.66, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_laptop_2', name: 'Dell XPS 13 9310 Laptop', power: 60, category: 'Office Equipment', subcategory: 'Laptops', brand: 'Dell', runningCostPerYear: 26.28, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_laptop_3', name: 'HP Spectre x360 13" Laptop', power: 65, category: 'Office Equipment', subcategory: 'Laptops', brand: 'HP', runningCostPerYear: 28.47, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_printer_1', name: 'HP LaserJet Pro M404n Printer', power: 350, category: 'Office Equipment', subcategory: 'Printers', brand: 'HP', runningCostPerYear: 15.33, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_printer_2', name: 'Canon imageRUNNER ADVANCE C3530 Printer', power: 450, category: 'Office Equipment', subcategory: 'Printers', brand: 'Canon', runningCostPerYear: 19.71, energyRating: 'A', efficiency: 'Medium', source: 'Sample' },
        { id: 'office_monitor_1', name: 'Dell UltraSharp U2720Q 27" Monitor', power: 25, category: 'Office Equipment', subcategory: 'Monitors', brand: 'Dell', runningCostPerYear: 10.95, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_monitor_2', name: 'LG 27UL850-W 27" Monitor', power: 30, category: 'Office Equipment', subcategory: 'Monitors', brand: 'LG', runningCostPerYear: 13.14, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_network_1', name: 'Cisco Catalyst 2960 Switch', power: 15, category: 'Office Equipment', subcategory: 'Networking', brand: 'Cisco', runningCostPerYear: 6.57, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
        { id: 'office_network_2', name: 'Netgear GS108 Switch', power: 8, category: 'Office Equipment', subcategory: 'Networking', brand: 'Netgear', runningCostPerYear: 3.50, energyRating: 'A+', efficiency: 'High', source: 'Sample' }
    ],

    // Categories and Subcategories Configuration
    categories: ['all', 'Appliances', 'Lighting', 'Heating', 'Renewable', 'Smart Home', 'Restaurant Equipment', 'Office Equipment'],
    
    categoryDescriptions: {
        'all': 'Show all products',
        'Appliances': 'Fridges, washing machines, ovens, etc.',
        'Lighting': 'LED bulbs, fixtures',
        'Heating': 'Boilers, heat pumps',
        'Renewable': 'Solar panels, wind',
        'Smart Home': 'Thermostats, sensors',
        'Restaurant Equipment': 'Commercial ovens, fridges, food prep',
        'Office Equipment': 'Computers, printers, monitors'
    },

    // Subcategory mappings
    subcategoryMappings: {
        'Appliances': ['all', 'Refrigerator', 'Washing Machine', 'Dishwasher', 'Oven', 'Microwave', 'Other'],
        'Lighting': ['all', 'LED Bulbs', 'Fixtures', 'Smart Lighting'],
        'Heating': ['all', 'Boilers', 'Heat Pumps', 'Thermostats'],
        'Renewable': ['all', 'Solar Panels', 'Wind Turbines', 'Batteries'],
        'Smart Home': ['all', 'Thermostats', 'Hubs', 'Sensors'],
        'Restaurant Equipment': ['all', 'Commercial Ovens', 'Commercial Fridges', 'Commercial Freezers', 'Food Prep'],
        'Office Equipment': ['all', 'Computers', 'Laptops', 'Printers', 'Monitors', 'Networking']
    },

    // Helper functions
    getAllProducts: function() {
        return this.sampleProducts;
    },

    getProductsByCategory: function(category) {
        if (category === 'all') return this.sampleProducts;
        return this.sampleProducts.filter(product => product.category === category);
    },

    getProductsBySubcategory: function(category, subcategory) {
        if (subcategory === 'all') return this.getProductsByCategory(category);
        return this.sampleProducts.filter(product => 
            product.category === category && product.subcategory === subcategory
        );
    },

    getProductCount: function() {
        return this.sampleProducts.length;
    },

    // Export function for easy integration
    exportToCalculator: function() {
        return {
            products: this.sampleProducts,
            categories: this.categories,
            categoryDescriptions: this.categoryDescriptions,
            subcategoryMappings: this.subcategoryMappings,
            totalCount: this.sampleProducts.length
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRODUCT_DATABASE_BACKUP;
} else {
    // Browser environment
    window.PRODUCT_DATABASE_BACKUP = PRODUCT_DATABASE_BACKUP;
}


