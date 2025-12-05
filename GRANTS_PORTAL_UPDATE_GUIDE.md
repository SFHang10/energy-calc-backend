# Grants Portal Update Guide

## Overview
This document explains how to manually update the Grants & Incentives Portal, and explores options for automating updates.

## Manual Update Process

### Current Architecture

**Files Involved:**
1. `grants-portal-enhanced.html` - Main portal interface (UI)
2. `comprehensive-grants-system.js` - Database of all grants and schemes

### Adding a New Grant Manually

#### Step 1: Add Grant to Database

Open `comprehensive-grants-system.js` and locate the appropriate region section:

```javascript
'england': {
    'name': 'England',
    'regionCode': 'uk.england',
    'currency': 'GBP',
    'grants': [
        // Add your new grant here
        {
            id: 'unique_grant_id',
            name: 'Grant Name',
            amount: 10000,
            currency: 'GBP',
            description: 'Detailed description of the grant',
            eligibility: 'Who can apply',
            validUntil: '2025-12-31', // or 'Ongoing'
            applicationUrl: 'https://www.gov.uk/...',
            contactInfo: '0800 123 4567', // Phone number or text
            categories: ['Heating', 'Renewable'], // Can have multiple
            subcategories: ['Heat Pumps', 'Solar'],
            maxAmount: 10000,
            coverage: 'What the grant covers',
            requirements: ['Requirement 1', 'Requirement 2'], // Array
            processingTime: '4-6 weeks',
            additionalInfo: 'Extra information',
            applicationProcess: 'How to apply',
            documentation: ['Document 1', 'Document 2']
        }
    ]
}
```

#### Step 2: Grant Data Structure

**Required Fields:**
- `id` - Unique identifier (use format: `region_grant_type`)
- `name` - Grant/scheme name
- `amount` - Numeric value (0 for variable/free grants)
- `currency` - 'GBP' or 'EUR'
- `description` - Detailed description
- `eligibility` - Who can apply
- `validUntil` - Date string or 'Ongoing'
- `applicationUrl` - Full URL to application page
- `contactInfo` - Phone number (digits) or text contact info
- `categories` - Array of categories like ['Heating', 'Renewable', 'Appliances', 'Insulation', 'Smart Home']

**Optional Fields:**
- `subcategories` - Array for more specific grouping
- `maxAmount` - Maximum grant amount
- `coverage` - What the grant covers
- `requirements` - Array of requirements
- `processingTime` - How long it takes
- `additionalInfo` - Extra details
- `applicationProcess` - Step-by-step process
- `documentation` - List of required documents

#### Step 3: Test the Grant

After adding a grant, refresh the portal and verify:
- Grant appears in correct region
- Categories work properly
- Search finds the grant
- Contact/Apply buttons work
- Amount displays correctly

---

## Automatic Update Options

### Option 1: API Integration (Recommended)

**What it is:** Connect to government grant databases via official APIs.

**Pros:**
- Always up-to-date
- No manual maintenance
- Official data source
- Structured and reliable

**Cons:**
- Requires API access
- Rate limits may apply
- Some governments don't provide APIs
- More complex setup

**Implementation:**

Create an update script that fetches from APIs:

```javascript
// update-grants-from-api.js
async function fetchUKGrants() {
    const response = await fetch('https://api.gov.uk/grants');
    return await response.json();
}

async function fetchEUGrants() {
    const response = await fetch('https://api.europa.eu/grants');
    return await response.json();
}

// Process and merge data
async function updateGrants() {
    const ukGrants = await fetchUKGrants();
    const euGrants = await fetchEUGrants();
    
    // Merge data
    const combinedGrants = mergeGrantData(ukGrants, euGrants);
    
    // Update comprehensive-grants-system.js
    await updateGrantsFile(combinedGrants);
}

// Schedule updates
setInterval(updateGrants, 7 * 24 * 60 * 60 * 1000); // Weekly
```

**Setup Steps:**
1. Identify government APIs with grants data
2. Create authentication (API keys if needed)
3. Build data transformation layer
4. Schedule automatic fetches (weekly/monthly)
5. Add error handling and fallbacks

---

### Option 2: Web Scraping (Moderate)

**What it is:** Automatically extract grant information from government websites.

**Pros:**
- Can access data not available via API
- Works with existing websites
- Can monitor multiple sources

**Cons:**
- Can break if websites change structure
- Legal/ethical considerations
- May violate terms of service
- Requires maintenance

**Implementation:**

```javascript
// scraper.js
const puppeteer = require('puppeteer');

async function scrapeGrants() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to grants page
    await page.goto('https://www.gov.uk/grants');
    
    // Extract grant data
    const grants = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.grant-item'));
        return items.map(item => ({
            name: item.querySelector('.title').textContent,
            description: item.querySelector('.description').textContent,
            amount: extractAmount(item.querySelector('.amount').textContent),
            // ... extract other fields
        }));
    });
    
    await browser.close();
    return grants;
}

// Use a cron job or scheduled task
// Update: Every Monday at 2 AM
```

**Considerations:**
- Always check robots.txt
- Use reasonable delays between requests
- Have fallback mechanisms
- Monitor for website changes

---

### Option 3: Manual Upload via Admin Panel (Easier)

**What it is:** Build a simple admin interface to update grants without touching code.

**Pros:**
- No coding required for updates
- User-friendly interface
- Immediate updates
- Easy to maintain

**Cons:**
- Still requires manual data entry
- Need to build the admin panel
- Requires authentication system

**Implementation:**

Create a simple admin form:

```html
<!-- admin-grants-panel.html -->
<form id="grant-form">
    <input name="name" placeholder="Grant Name" required>
    <input name="amount" type="number" placeholder="Amount">
    <select name="region" required>
        <option value="uk.england">England</option>
        <option value="uk.scotland">Scotland</option>
        <!-- ... other regions -->
    </select>
    <input name="applicationUrl" placeholder="Application URL">
    <!-- ... other fields -->
    <button type="submit">Add Grant</button>
</form>

<script>
document.getElementById('grant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Add to database (via backend API)
    await fetch('/api/grants', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
    });
    
    // Refresh portal
    window.location.reload();
});
</script>
```

**Backend Required:**
```javascript
// Express.js example
app.post('/api/grants', authenticateAdmin, async (req, res) => {
    const grant = req.body;
    
    // Add to database
    await addGrantToDatabase(grant);
    
    // Or update the JS file directly
    await updateGrantsFile(grant);
    
    res.json({ success: true });
});
```

---

### Option 4: CSV/JSON Upload (Semi-Automatic)

**What it is:** Allow uploading grant data via CSV/JSON files.

**Pros:**
- Easy to export from spreadsheets
- Bulk updates possible
- No coding knowledge needed
- Maintains data structure

**Cons:**
- Still requires manual data preparation
- Needs validation
- Upload errors possible

**Implementation:**

```javascript
// upload-grants.js
function handleCSVUpload(file) {
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            const grants = results.data;
            
            // Validate and transform
            const validatedGrants = grants
                .filter(g => g.name) // Remove empty rows
                .map(transformCSVRow);
            
            // Add to database
            addMultipleGrants(validatedGrants);
        }
    });
}

function transformCSVRow(row) {
    return {
        name: row['Grant Name'],
        amount: parseFloat(row['Amount']),
        currency: row['Currency'] || 'GBP',
        region: row['Region'],
        // ... map all fields
    };
}
```

**CSV Format Example:**
```csv
Grant Name,Amount,Currency,Region,Eligibility,Valid Until,Application URL
Smart Export Guarantee,0,GBP,UK,Houdeholds with renewable systems,Ongoing,https://www.gov.uk/seg
Home Upgrade Grant,5000,GBP,England,Low-income households,2025-12-31,https://www.gov.uk/home-upgrade
```

---

## Recommended Approach

### Hybrid Solution (Best Practice)

Combine multiple methods for reliability:

1. **Primary:** Manual updates via admin panel or CSV upload
2. **Secondary:** Monthly automated checks via API/Web scraping
3. **Fallback:** Manual intervention when needed

**Implementation Plan:**

```javascript
// automated-grants-system.js
class GrantsAutomation {
    constructor() {
        this.sources = [
            { type: 'api', url: 'https://api.gov.uk/grants', priority: 1 },
            { type: 'scrape', url: 'https://www.seai.ie/grants', priority: 2 },
            { type: 'manual', updates: [], priority: 3 }
        ];
    }
    
    async updateAllSources() {
        for (const source of this.sources) {
            try {
                const grants = await this.fetchFromSource(source);
                await this.mergeAndUpdate(grants);
            } catch (error) {
                console.error(`Failed to update from ${source.type}:`, error);
                // Fallback to next source
            }
        }
    }
    
    async fetchFromSource(source) {
        switch(source.type) {
            case 'api':
                return await fetch(source.url).then(r => r.json());
            case 'scrape':
                return await this.scrapeWebsite(source.url);
            case 'manual':
                return source.updates;
        }
    }
    
    async scheduleUpdates() {
        // Update weekly
        setInterval(() => this.updateAllSources(), 7 * 24 * 60 * 60 * 1000);
        
        // Update daily for high-priority sources
        setInterval(() => this.updateFromAPI(), 24 * 60 * 60 * 1000);
    }
}
```

---

## Future-Proofing Ideas

### 1. Database Backend
Replace `comprehensive-grants-system.js` with a proper database:
- PostgreSQL/MySQL for structured data
- MongoDB for flexible schema
- Firebase for real-time updates

### 2. Content Management System
Integrate with headless CMS:
- Strapi - Open source CMS
- Contentful - Cloud CMS
- Sanity - Developer-friendly CMS

### 3. Real-time Updates
Use WebSockets for live updates:
- Show when grants are updated
- Notify about new grants
- Alert about expiring deadlines

### 4. Version Control
Track changes to grants:
- Git for code changes
- Database versioning for data
- Audit logs for updates

---

## Quick Reference

### Manual Update Checklist
- [ ] Open `comprehensive-grants-system.js`
- [ ] Locate correct region section
- [ ] Add new grant object
- [ ] Include all required fields
- [ ] Use correct category types
- [ ] Set validUntil date or 'Ongoing'
- [ ] Add proper applicationUrl
- [ ] Include contactInfo
- [ ] Test in portal
- [ ] Verify search finds it
- [ ] Check links work

### Grant Categories Available
- `['Heating']` - Heating systems
- `['Renewable']` - Renewable energy
- `['Appliances']` - Energy-efficient appliances
- `['Insulation']` - Insulation improvements
- `['Smart Home']` - Smart home technology
- Can combine multiple: `['Heating', 'Renewable']`

### Common Issues
1. **Grants not showing:** Check regionCode matches region filter
2. **Links not working:** Verify applicationUrl is full URL
3. **Amount shows 0:** Use descriptive messages for variable grants
4. **Search not finding grant:** Check name, description include keywords

---

## Need Help?

For adding new grants or setting up automatic updates, refer to this guide or contact the development team.





## Overview
This document explains how to manually update the Grants & Incentives Portal, and explores options for automating updates.

## Manual Update Process

### Current Architecture

**Files Involved:**
1. `grants-portal-enhanced.html` - Main portal interface (UI)
2. `comprehensive-grants-system.js` - Database of all grants and schemes

### Adding a New Grant Manually

#### Step 1: Add Grant to Database

Open `comprehensive-grants-system.js` and locate the appropriate region section:

```javascript
'england': {
    'name': 'England',
    'regionCode': 'uk.england',
    'currency': 'GBP',
    'grants': [
        // Add your new grant here
        {
            id: 'unique_grant_id',
            name: 'Grant Name',
            amount: 10000,
            currency: 'GBP',
            description: 'Detailed description of the grant',
            eligibility: 'Who can apply',
            validUntil: '2025-12-31', // or 'Ongoing'
            applicationUrl: 'https://www.gov.uk/...',
            contactInfo: '0800 123 4567', // Phone number or text
            categories: ['Heating', 'Renewable'], // Can have multiple
            subcategories: ['Heat Pumps', 'Solar'],
            maxAmount: 10000,
            coverage: 'What the grant covers',
            requirements: ['Requirement 1', 'Requirement 2'], // Array
            processingTime: '4-6 weeks',
            additionalInfo: 'Extra information',
            applicationProcess: 'How to apply',
            documentation: ['Document 1', 'Document 2']
        }
    ]
}
```

#### Step 2: Grant Data Structure

**Required Fields:**
- `id` - Unique identifier (use format: `region_grant_type`)
- `name` - Grant/scheme name
- `amount` - Numeric value (0 for variable/free grants)
- `currency` - 'GBP' or 'EUR'
- `description` - Detailed description
- `eligibility` - Who can apply
- `validUntil` - Date string or 'Ongoing'
- `applicationUrl` - Full URL to application page
- `contactInfo` - Phone number (digits) or text contact info
- `categories` - Array of categories like ['Heating', 'Renewable', 'Appliances', 'Insulation', 'Smart Home']

**Optional Fields:**
- `subcategories` - Array for more specific grouping
- `maxAmount` - Maximum grant amount
- `coverage` - What the grant covers
- `requirements` - Array of requirements
- `processingTime` - How long it takes
- `additionalInfo` - Extra details
- `applicationProcess` - Step-by-step process
- `documentation` - List of required documents

#### Step 3: Test the Grant

After adding a grant, refresh the portal and verify:
- Grant appears in correct region
- Categories work properly
- Search finds the grant
- Contact/Apply buttons work
- Amount displays correctly

---

## Automatic Update Options

### Option 1: API Integration (Recommended)

**What it is:** Connect to government grant databases via official APIs.

**Pros:**
- Always up-to-date
- No manual maintenance
- Official data source
- Structured and reliable

**Cons:**
- Requires API access
- Rate limits may apply
- Some governments don't provide APIs
- More complex setup

**Implementation:**

Create an update script that fetches from APIs:

```javascript
// update-grants-from-api.js
async function fetchUKGrants() {
    const response = await fetch('https://api.gov.uk/grants');
    return await response.json();
}

async function fetchEUGrants() {
    const response = await fetch('https://api.europa.eu/grants');
    return await response.json();
}

// Process and merge data
async function updateGrants() {
    const ukGrants = await fetchUKGrants();
    const euGrants = await fetchEUGrants();
    
    // Merge data
    const combinedGrants = mergeGrantData(ukGrants, euGrants);
    
    // Update comprehensive-grants-system.js
    await updateGrantsFile(combinedGrants);
}

// Schedule updates
setInterval(updateGrants, 7 * 24 * 60 * 60 * 1000); // Weekly
```

**Setup Steps:**
1. Identify government APIs with grants data
2. Create authentication (API keys if needed)
3. Build data transformation layer
4. Schedule automatic fetches (weekly/monthly)
5. Add error handling and fallbacks

---

### Option 2: Web Scraping (Moderate)

**What it is:** Automatically extract grant information from government websites.

**Pros:**
- Can access data not available via API
- Works with existing websites
- Can monitor multiple sources

**Cons:**
- Can break if websites change structure
- Legal/ethical considerations
- May violate terms of service
- Requires maintenance

**Implementation:**

```javascript
// scraper.js
const puppeteer = require('puppeteer');

async function scrapeGrants() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to grants page
    await page.goto('https://www.gov.uk/grants');
    
    // Extract grant data
    const grants = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.grant-item'));
        return items.map(item => ({
            name: item.querySelector('.title').textContent,
            description: item.querySelector('.description').textContent,
            amount: extractAmount(item.querySelector('.amount').textContent),
            // ... extract other fields
        }));
    });
    
    await browser.close();
    return grants;
}

// Use a cron job or scheduled task
// Update: Every Monday at 2 AM
```

**Considerations:**
- Always check robots.txt
- Use reasonable delays between requests
- Have fallback mechanisms
- Monitor for website changes

---

### Option 3: Manual Upload via Admin Panel (Easier)

**What it is:** Build a simple admin interface to update grants without touching code.

**Pros:**
- No coding required for updates
- User-friendly interface
- Immediate updates
- Easy to maintain

**Cons:**
- Still requires manual data entry
- Need to build the admin panel
- Requires authentication system

**Implementation:**

Create a simple admin form:

```html
<!-- admin-grants-panel.html -->
<form id="grant-form">
    <input name="name" placeholder="Grant Name" required>
    <input name="amount" type="number" placeholder="Amount">
    <select name="region" required>
        <option value="uk.england">England</option>
        <option value="uk.scotland">Scotland</option>
        <!-- ... other regions -->
    </select>
    <input name="applicationUrl" placeholder="Application URL">
    <!-- ... other fields -->
    <button type="submit">Add Grant</button>
</form>

<script>
document.getElementById('grant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Add to database (via backend API)
    await fetch('/api/grants', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
    });
    
    // Refresh portal
    window.location.reload();
});
</script>
```

**Backend Required:**
```javascript
// Express.js example
app.post('/api/grants', authenticateAdmin, async (req, res) => {
    const grant = req.body;
    
    // Add to database
    await addGrantToDatabase(grant);
    
    // Or update the JS file directly
    await updateGrantsFile(grant);
    
    res.json({ success: true });
});
```

---

### Option 4: CSV/JSON Upload (Semi-Automatic)

**What it is:** Allow uploading grant data via CSV/JSON files.

**Pros:**
- Easy to export from spreadsheets
- Bulk updates possible
- No coding knowledge needed
- Maintains data structure

**Cons:**
- Still requires manual data preparation
- Needs validation
- Upload errors possible

**Implementation:**

```javascript
// upload-grants.js
function handleCSVUpload(file) {
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            const grants = results.data;
            
            // Validate and transform
            const validatedGrants = grants
                .filter(g => g.name) // Remove empty rows
                .map(transformCSVRow);
            
            // Add to database
            addMultipleGrants(validatedGrants);
        }
    });
}

function transformCSVRow(row) {
    return {
        name: row['Grant Name'],
        amount: parseFloat(row['Amount']),
        currency: row['Currency'] || 'GBP',
        region: row['Region'],
        // ... map all fields
    };
}
```

**CSV Format Example:**
```csv
Grant Name,Amount,Currency,Region,Eligibility,Valid Until,Application URL
Smart Export Guarantee,0,GBP,UK,Houdeholds with renewable systems,Ongoing,https://www.gov.uk/seg
Home Upgrade Grant,5000,GBP,England,Low-income households,2025-12-31,https://www.gov.uk/home-upgrade
```

---

## Recommended Approach

### Hybrid Solution (Best Practice)

Combine multiple methods for reliability:

1. **Primary:** Manual updates via admin panel or CSV upload
2. **Secondary:** Monthly automated checks via API/Web scraping
3. **Fallback:** Manual intervention when needed

**Implementation Plan:**

```javascript
// automated-grants-system.js
class GrantsAutomation {
    constructor() {
        this.sources = [
            { type: 'api', url: 'https://api.gov.uk/grants', priority: 1 },
            { type: 'scrape', url: 'https://www.seai.ie/grants', priority: 2 },
            { type: 'manual', updates: [], priority: 3 }
        ];
    }
    
    async updateAllSources() {
        for (const source of this.sources) {
            try {
                const grants = await this.fetchFromSource(source);
                await this.mergeAndUpdate(grants);
            } catch (error) {
                console.error(`Failed to update from ${source.type}:`, error);
                // Fallback to next source
            }
        }
    }
    
    async fetchFromSource(source) {
        switch(source.type) {
            case 'api':
                return await fetch(source.url).then(r => r.json());
            case 'scrape':
                return await this.scrapeWebsite(source.url);
            case 'manual':
                return source.updates;
        }
    }
    
    async scheduleUpdates() {
        // Update weekly
        setInterval(() => this.updateAllSources(), 7 * 24 * 60 * 60 * 1000);
        
        // Update daily for high-priority sources
        setInterval(() => this.updateFromAPI(), 24 * 60 * 60 * 1000);
    }
}
```

---

## Future-Proofing Ideas

### 1. Database Backend
Replace `comprehensive-grants-system.js` with a proper database:
- PostgreSQL/MySQL for structured data
- MongoDB for flexible schema
- Firebase for real-time updates

### 2. Content Management System
Integrate with headless CMS:
- Strapi - Open source CMS
- Contentful - Cloud CMS
- Sanity - Developer-friendly CMS

### 3. Real-time Updates
Use WebSockets for live updates:
- Show when grants are updated
- Notify about new grants
- Alert about expiring deadlines

### 4. Version Control
Track changes to grants:
- Git for code changes
- Database versioning for data
- Audit logs for updates

---

## Quick Reference

### Manual Update Checklist
- [ ] Open `comprehensive-grants-system.js`
- [ ] Locate correct region section
- [ ] Add new grant object
- [ ] Include all required fields
- [ ] Use correct category types
- [ ] Set validUntil date or 'Ongoing'
- [ ] Add proper applicationUrl
- [ ] Include contactInfo
- [ ] Test in portal
- [ ] Verify search finds it
- [ ] Check links work

### Grant Categories Available
- `['Heating']` - Heating systems
- `['Renewable']` - Renewable energy
- `['Appliances']` - Energy-efficient appliances
- `['Insulation']` - Insulation improvements
- `['Smart Home']` - Smart home technology
- Can combine multiple: `['Heating', 'Renewable']`

### Common Issues
1. **Grants not showing:** Check regionCode matches region filter
2. **Links not working:** Verify applicationUrl is full URL
3. **Amount shows 0:** Use descriptive messages for variable grants
4. **Search not finding grant:** Check name, description include keywords

---

## Need Help?

For adding new grants or setting up automatic updates, refer to this guide or contact the development team.






















