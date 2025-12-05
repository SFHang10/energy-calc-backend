# How to Add More Grants & Schemes

## ✅ How the Search Works

### **Real-Time Search (Yes, searches every time!)**

When someone enters a product name and clicks search:

1. **User types product**: e.g., "Solar Panel"
2. **User clicks "Search"**
3. **JavaScript instantly searches** through ALL schemes using keyword matching
4. **Results show immediately** - matching grants/schemes

### **Example Search Flow:**

```
User enters: "solar panel"
              ↓
    Searches through ALL 15+ schemes
              ↓
Finds matches in keywords like:
- "solar panel"
- "photovoltaic"  
- "solar energy"
- "PV system"
              ↓
Shows matching grants/schemes
```

---

## 📊 Keyword Matching System

### **How It Works:**

Each scheme has a `keywords` array:

```json
{
  "id": "sol-energy",
  "title": "Solar Energy Subsidy",
  "keywords": [
    "solar panel",
    "photovoltaic", 
    "solar energy",
    "PV system",
    "solar power",
    "renewable"
  ]
}
```

**Search Logic:** If a user searches "solar panel", it matches if:
- User's search INCLUDES any keyword: "solar panel" → ✅ matches
- Keyword INCLUDES user's search: "panel" → ✅ matches "solar panel"

---

## ➕ How to Add Your Extended Grants JSON

### **Option 1: Merge Into Existing File (Recommended)**

1. **Open your extended grants JSON file**
2. **Copy all grant objects** from it
3. **Open**: `product-qualification-search-GLASSMORPHISM.html`
4. **Find**: The `getDefaultSchemes()` function (around line 600)
5. **Add** your grants to the existing array

### **Option 2: Format Requirements**

Your grants MUST have this structure:

```json
{
  "id": "unique-id-here",
  "title": "Grant Name",
  "type": "grant",                    // or "subsidy", "certification", "tax"
  "categories": ["grant"],
  "keywords": [
    "keyword1",
    "keyword2", 
    "keyword3"
  ],
  "description": "What this grant covers...",
  "relevance": "High/Medium/Low",
  "requirements": "Any requirements",
  "deadline": "Date or null",
  "priority": true/false,             // Highlight if true
  "links": [
    {
      "text": "Apply Now",
      "url": "https://...",
      "type": "apply"
    }
  ]
}
```

### **Example - Adding a New Grant:**

Find this section in the HTML:

```javascript
function getDefaultSchemes() {
    return [
        {
            "id": "isde",
            "title": "ISDE - Heat Pump Grant",
            "type": "grant",
            "keywords": ["heat pump", "air pump", ...],
            // ... rest of scheme
        },
        // ADD YOUR NEW GRANTS HERE
        {
            "id": "your-new-grant",
            "title": "Your Grant Name",
            "type": "grant",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "description": "Description of grant",
            "relevance": "High",
            "requirements": null,
            "deadline": null,
            "priority": false,
            "links": [
                {"text": "Apply", "url": "https://...", "type": "apply"}
            ]
        }
    ];
}
```

---

## 🎯 Quick Example - Adding a Grant

### **Your Extended JSON File Has:**

```json
{
  "grants": [
    {
      "name": "Energy Efficiency Fund",
      "keywords": ["heating", "insulation", "boiler"]
    }
  ]
}
```

### **Convert to Portal Format:**

```json
{
  "id": "energy-efficiency-fund",
  "title": "Energy Efficiency Fund",
  "type": "grant",
  "categories": ["grant"],
  "keywords": ["heating", "insulation", "boiler", "energy efficient"],
  "description": "Funding for energy efficiency improvements",
  "relevance": "High",
  "requirements": "EU-based projects",
  "deadline": "Ongoing",
  "priority": true,
  "links": [
    {"text": "Apply Now", "url": "https://grant-url.com", "type": "apply"}
  ]
}
```

### **Then Insert Into HTML:**

Add it to the array in `getDefaultSchemes()` function!

---

## 🔍 Keyword Best Practices

### **Tips for Effective Matching:**

1. **Be Specific:** 
   - ✅ "heat pump" 
   - ❌ "pump"

2. **Include Variations:**
   ```json
   "keywords": [
     "heat pump",
     "air source heat pump",
     "ground source heat pump",
     "ASHP",
     "GSHP"
   ]
   ```

3. **Add Categories:**
   ```json
   "keywords": [
     "LED",
     "LED lighting",
     "LED bulb",
     "LED lamp",
     "energy efficient lighting"
   ]
   ```

4. **Think Like Users:**
   - What will users type?
   - What product categories?
   - What synonyms exist?

---

## 🚀 Search Performance

### **Current Setup:**

- **Client-side search** = Instant results
- **No server needed** = Works offline
- **All data embedded** = Fast loading
- **Real-time filtering** = Smooth experience

### **How Many Grants Can It Handle?**

- ✅ **100 grants** = Still fast
- ✅ **500 grants** = Still fast  
- ✅ **1000+ grants** = May slow down slightly

**For 1000+ grants, consider:**
- Adding filtering by region/country
- Adding search result limits
- Updating to server-side search

---

## 📝 Adding Grant Step-by-Step

### **Step 1: Open the File**

```
C:\Users\steph\Documents\energy-cal-backend\product-qualification-search-GLASSMORPHISM.html
```

### **Step 2: Find the Function**

Search for: `getDefaultSchemes()`

### **Step 3: Add Your Grant**

Find the last grant in the array, add a comma, and insert your new grant:

```javascript
{
  "id": "last-grant",
  // ... existing grant
},
{  // ← Add your new grant here!
  "id": "your-grant-id",
  // ... your grant data
}
```

### **Step 4: Test**

1. Open the HTML file in a browser
2. Search for a keyword from your new grant
3. See if it appears!

---

## 💡 Example: Adding the Energy Efficiency Fund

### **Before:**
```javascript
{
  "id": "geothermal",
  "title": "Geothermal Heating Grant",
  // ... rest
}
]
```

### **After:**
```javascript
{
  "id": "geothermal",
  "title": "Geothermal Heating Grant",
  // ... rest
},
{
  "id": "energy-efficiency-fund",
  "title": "Energy Efficiency Fund",
  "type": "grant",
  "categories": ["grant"],
  "keywords": ["heating", "insulation", "boiler", "energy efficient", "home improvement"],
  "description": "Funding support for home energy efficiency improvements including heating systems, insulation, and boiler upgrades.",
  "relevance": "High - Covers multiple energy efficiency products",
  "requirements": "EU-based households",
  "deadline": "Ongoing",
  "priority": true,
  "links": [
    {"text": "Apply Now", "url": "https://energy-fund.eu", "type": "apply"}
  ]
}
]
```

---

## ✅ Summary

**Yes, you can add more grants!**

1. ✅ **Opens in browser** - searches EVERY time someone types a product
2. ✅ **Keyword matching** - matches user's search against grant keywords
3. ✅ **Easy to add** - just add JSON objects to the array
4. ✅ **Instant results** - no server needed
5. ✅ **Your extended JSON** - can be converted and added

**Just make sure your grants have:**
- ✅ `keywords` array with relevant words
- ✅ Proper structure (id, title, type, etc.)
- ✅ Valid JSON syntax (commas, quotes)

---

## 🎯 Questions?

**Q: Can I have 50+ grants?**
A: Yes! The system handles it easily.

**Q: How many keywords per grant?**
A: 5-10 keywords works best for matching.

**Q: Can I search by country?**
A: Currently no, but you can add country tags to keywords!

**Q: Does it need a server?**
A: No! Everything runs in the browser (client-side).

**Q: How fast is the search?**
A: Instant! Even with 1000+ grants.

Ready to add your extended grants? Just follow the format above! 🚀








## ✅ How the Search Works

### **Real-Time Search (Yes, searches every time!)**

When someone enters a product name and clicks search:

1. **User types product**: e.g., "Solar Panel"
2. **User clicks "Search"**
3. **JavaScript instantly searches** through ALL schemes using keyword matching
4. **Results show immediately** - matching grants/schemes

### **Example Search Flow:**

```
User enters: "solar panel"
              ↓
    Searches through ALL 15+ schemes
              ↓
Finds matches in keywords like:
- "solar panel"
- "photovoltaic"  
- "solar energy"
- "PV system"
              ↓
Shows matching grants/schemes
```

---

## 📊 Keyword Matching System

### **How It Works:**

Each scheme has a `keywords` array:

```json
{
  "id": "sol-energy",
  "title": "Solar Energy Subsidy",
  "keywords": [
    "solar panel",
    "photovoltaic", 
    "solar energy",
    "PV system",
    "solar power",
    "renewable"
  ]
}
```

**Search Logic:** If a user searches "solar panel", it matches if:
- User's search INCLUDES any keyword: "solar panel" → ✅ matches
- Keyword INCLUDES user's search: "panel" → ✅ matches "solar panel"

---

## ➕ How to Add Your Extended Grants JSON

### **Option 1: Merge Into Existing File (Recommended)**

1. **Open your extended grants JSON file**
2. **Copy all grant objects** from it
3. **Open**: `product-qualification-search-GLASSMORPHISM.html`
4. **Find**: The `getDefaultSchemes()` function (around line 600)
5. **Add** your grants to the existing array

### **Option 2: Format Requirements**

Your grants MUST have this structure:

```json
{
  "id": "unique-id-here",
  "title": "Grant Name",
  "type": "grant",                    // or "subsidy", "certification", "tax"
  "categories": ["grant"],
  "keywords": [
    "keyword1",
    "keyword2", 
    "keyword3"
  ],
  "description": "What this grant covers...",
  "relevance": "High/Medium/Low",
  "requirements": "Any requirements",
  "deadline": "Date or null",
  "priority": true/false,             // Highlight if true
  "links": [
    {
      "text": "Apply Now",
      "url": "https://...",
      "type": "apply"
    }
  ]
}
```

### **Example - Adding a New Grant:**

Find this section in the HTML:

```javascript
function getDefaultSchemes() {
    return [
        {
            "id": "isde",
            "title": "ISDE - Heat Pump Grant",
            "type": "grant",
            "keywords": ["heat pump", "air pump", ...],
            // ... rest of scheme
        },
        // ADD YOUR NEW GRANTS HERE
        {
            "id": "your-new-grant",
            "title": "Your Grant Name",
            "type": "grant",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "description": "Description of grant",
            "relevance": "High",
            "requirements": null,
            "deadline": null,
            "priority": false,
            "links": [
                {"text": "Apply", "url": "https://...", "type": "apply"}
            ]
        }
    ];
}
```

---

## 🎯 Quick Example - Adding a Grant

### **Your Extended JSON File Has:**

```json
{
  "grants": [
    {
      "name": "Energy Efficiency Fund",
      "keywords": ["heating", "insulation", "boiler"]
    }
  ]
}
```

### **Convert to Portal Format:**

```json
{
  "id": "energy-efficiency-fund",
  "title": "Energy Efficiency Fund",
  "type": "grant",
  "categories": ["grant"],
  "keywords": ["heating", "insulation", "boiler", "energy efficient"],
  "description": "Funding for energy efficiency improvements",
  "relevance": "High",
  "requirements": "EU-based projects",
  "deadline": "Ongoing",
  "priority": true,
  "links": [
    {"text": "Apply Now", "url": "https://grant-url.com", "type": "apply"}
  ]
}
```

### **Then Insert Into HTML:**

Add it to the array in `getDefaultSchemes()` function!

---

## 🔍 Keyword Best Practices

### **Tips for Effective Matching:**

1. **Be Specific:** 
   - ✅ "heat pump" 
   - ❌ "pump"

2. **Include Variations:**
   ```json
   "keywords": [
     "heat pump",
     "air source heat pump",
     "ground source heat pump",
     "ASHP",
     "GSHP"
   ]
   ```

3. **Add Categories:**
   ```json
   "keywords": [
     "LED",
     "LED lighting",
     "LED bulb",
     "LED lamp",
     "energy efficient lighting"
   ]
   ```

4. **Think Like Users:**
   - What will users type?
   - What product categories?
   - What synonyms exist?

---

## 🚀 Search Performance

### **Current Setup:**

- **Client-side search** = Instant results
- **No server needed** = Works offline
- **All data embedded** = Fast loading
- **Real-time filtering** = Smooth experience

### **How Many Grants Can It Handle?**

- ✅ **100 grants** = Still fast
- ✅ **500 grants** = Still fast  
- ✅ **1000+ grants** = May slow down slightly

**For 1000+ grants, consider:**
- Adding filtering by region/country
- Adding search result limits
- Updating to server-side search

---

## 📝 Adding Grant Step-by-Step

### **Step 1: Open the File**

```
C:\Users\steph\Documents\energy-cal-backend\product-qualification-search-GLASSMORPHISM.html
```

### **Step 2: Find the Function**

Search for: `getDefaultSchemes()`

### **Step 3: Add Your Grant**

Find the last grant in the array, add a comma, and insert your new grant:

```javascript
{
  "id": "last-grant",
  // ... existing grant
},
{  // ← Add your new grant here!
  "id": "your-grant-id",
  // ... your grant data
}
```

### **Step 4: Test**

1. Open the HTML file in a browser
2. Search for a keyword from your new grant
3. See if it appears!

---

## 💡 Example: Adding the Energy Efficiency Fund

### **Before:**
```javascript
{
  "id": "geothermal",
  "title": "Geothermal Heating Grant",
  // ... rest
}
]
```

### **After:**
```javascript
{
  "id": "geothermal",
  "title": "Geothermal Heating Grant",
  // ... rest
},
{
  "id": "energy-efficiency-fund",
  "title": "Energy Efficiency Fund",
  "type": "grant",
  "categories": ["grant"],
  "keywords": ["heating", "insulation", "boiler", "energy efficient", "home improvement"],
  "description": "Funding support for home energy efficiency improvements including heating systems, insulation, and boiler upgrades.",
  "relevance": "High - Covers multiple energy efficiency products",
  "requirements": "EU-based households",
  "deadline": "Ongoing",
  "priority": true,
  "links": [
    {"text": "Apply Now", "url": "https://energy-fund.eu", "type": "apply"}
  ]
}
]
```

---

## ✅ Summary

**Yes, you can add more grants!**

1. ✅ **Opens in browser** - searches EVERY time someone types a product
2. ✅ **Keyword matching** - matches user's search against grant keywords
3. ✅ **Easy to add** - just add JSON objects to the array
4. ✅ **Instant results** - no server needed
5. ✅ **Your extended JSON** - can be converted and added

**Just make sure your grants have:**
- ✅ `keywords` array with relevant words
- ✅ Proper structure (id, title, type, etc.)
- ✅ Valid JSON syntax (commas, quotes)

---

## 🎯 Questions?

**Q: Can I have 50+ grants?**
A: Yes! The system handles it easily.

**Q: How many keywords per grant?**
A: 5-10 keywords works best for matching.

**Q: Can I search by country?**
A: Currently no, but you can add country tags to keywords!

**Q: Does it need a server?**
A: No! Everything runs in the browser (client-side).

**Q: How fast is the search?**
A: Instant! Even with 1000+ grants.

Ready to add your extended grants? Just follow the format above! 🚀

























