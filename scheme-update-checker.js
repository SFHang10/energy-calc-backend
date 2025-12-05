/**
 * Scheme Update Checker - Backend Service
 * 
 * This service checks government websites for new/updated grants and schemes
 * Can be run as a Node.js script or integrated into your existing backend
 * 
 * Usage:
 * 1. As a standalone script: node scheme-update-checker.js
 * 2. As an API endpoint: Integrate into your Express/Fastify app
 * 3. As a scheduled task: Use cron or task scheduler
 */

const fs = require('fs').promises;
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

class SchemeUpdateChecker {
    constructor() {
        this.schemesFile = './schemes.json';
        this.schemes = [];
        this.newSchemesCount = 0;
        this.updatedSchemesCount = 0;
    }

    /**
     * Load existing schemes from JSON file
     */
    async loadExistingSchemes() {
        try {
            const data = await fs.readFile(this.schemesFile, 'utf8');
            this.schemes = JSON.parse(data);
            console.log(`✓ Loaded ${this.schemes.length} existing schemes`);
        } catch (error) {
            console.error('Error loading schemes:', error.message);
            this.schemes = [];
        }
    }

    /**
     * Check RVO.nl for new subsidies
     */
    async checkRVO() {
        const sources = [
            {
                url: 'https://www.rvo.nl/subsidies-financiering',
                name: 'RVO Main Subsidies',
                schemes: []
            },
            {
                url: 'https://www.rvo.nl/subsidies-financiering/isde',
                name: 'ISDE',
                schemes: []
            },
            {
                url: 'https://www.rvo.nl/subsidies-financiering/spvo',
                name: 'SPVO',
                schemes: []
            }
        ];

        for (const source of sources) {
            try {
                console.log(`Checking ${source.name}...`);
                const response = await axios.get(source.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Compatible; SchemeChecker/1.0)'
                    }
                });
                
                const $ = cheerio.load(response.data);
                // Parse page and extract scheme info
                // This is just a template - adjust selectors based on actual RVO site structure
                
                console.log(`✓ ${source.name} checked`);
            } catch (error) {
                console.error(`Error checking ${source.name}:`, error.message);
            }
        }
    }

    /**
     * Check Business.gov.nl for new regulations
     */
    async checkBusinessGov() {
        try {
            const url = 'https://business.gov.nl';
            console.log('Checking Business.gov.nl...');
            
            // This is a template - implement actual parsing
            // You might use RSS feeds if available
            
            console.log('✓ Business.gov.nl checked');
        } catch (error) {
            console.error('Error checking Business.gov.nl:', error.message);
        }
    }

    /**
     * Check for scheme updates on government sites
     */
    async checkForUpdates() {
        console.log('\n=== Starting Scheme Update Check ===\n');
        console.log(`Time: ${new Date().toISOString()}\n`);

        await this.loadExistingSchemes();
        
        // Check different sources
        await Promise.all([
            this.checkRVO(),
            this.checkBusinessGov(),
            // Add more sources here
        ]);

        console.log(`\n✓ Check completed`);
        console.log(`New schemes found: ${this.newSchemesCount}`);
        console.log(`Updated schemes: ${this.updatedSchemesCount}`);

        if (this.newSchemesCount > 0 || this.updatedSchemesCount > 0) {
            await this.notifyOfUpdates();
        }
    }

    /**
     * Save updated schemes to JSON file
     */
    async saveSchemes() {
        try {
            const jsonData = JSON.stringify(this.schemes, null, 2);
            await fs.writeFile(this.schemesFile, jsonData, 'utf8');
            console.log('✓ Schemes saved to file');
        } catch (error) {
            console.error('Error saving schemes:', error);
        }
    }

    /**
     * Notify when new schemes are found
     */
    async notifyOfUpdates() {
        console.log('\n🔔 NOTIFICATION: New or updated schemes detected!');
        console.log('Update schemes.json and upload to server');
        
        // Optional: Send email, webhook, or push notification
        // await this.sendEmail();
        // await this.sendWebhook();
    }

    /**
     * Parse a scheme from a government website
     * Customize this for each source site
     */
    parseSchemeFromHTML(html, source) {
        // Template for parsing HTML into scheme objects
        const $ = cheerio.load(html);
        
        return {
            id: this.generateSchemeId(),
            title: '',
            type: '',
            categories: [],
            keywords: [],
            description: '',
            deadline: null,
            priority: false,
            new: true,
            links: []
        };
    }

    /**
     * Generate unique ID for new scheme
     */
    generateSchemeId() {
        return 'scheme-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Compare two schemes to detect updates
     */
    detectChanges(oldScheme, newScheme) {
        const changes = [];
        
        if (oldScheme.deadline !== newScheme.deadline) {
            changes.push('deadline');
        }
        if (oldScheme.description !== newScheme.description) {
            changes.push('description');
        }
        
        return changes;
    }

    /**
     * Start scheduled checking (runs daily at 9 AM)
     */
    startScheduler() {
        console.log('Starting scheduled update checker...');
        
        // Run daily at 9 AM
        cron.schedule('0 9 * * *', async () => {
            console.log('Scheduled check running...');
            await this.checkForUpdates();
        });

        // Optional: Run hourly checks for urgent schemes
        cron.schedule('0 * * * *', async () => {
            console.log('Hourly urgent check...');
            // Check only urgent schemes
        });

        console.log('✓ Scheduler started (daily at 9 AM)');
    }
}

// ============================================
// USAGE OPTIONS
// ============================================

// Option 1: Run as standalone script
if (require.main === module) {
    const checker = new SchemeUpdateChecker();
    
    // Run once
    checker.checkForUpdates().then(() => {
        process.exit(0);
    });
    
    // Or start scheduled checks
    // checker.startScheduler();
}

// Option 2: Export as Express endpoint
function setupExpressEndpoint(app) {
    const checker = new SchemeUpdateChecker();
    
    app.post('/api/check-updates', async (req, res) => {
        try {
            await checker.checkForUpdates();
            res.json({ 
                success: true,
                newSchemes: checker.newSchemesCount,
                updatedSchemes: checker.updatedSchemesCount
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

// Option 3: Use as a webhook receiver
function setupWebhook(app) {
    app.post('/webhook/scheme-updates', async (req, res) => {
        // Example: Receive updates from Zapier, Make.com, or custom scraper
        const newScheme = req.body;
        
        // Validate and add to schemes
        // await addScheme(newScheme);
        
        res.json({ success: true });
    });
}

module.exports = { SchemeUpdateChecker, setupExpressEndpoint, setupWebhook };

// ============================================
// MANUAL OPERATION INSTRUCTIONS
// ============================================

/*
INSTALLATION:

npm install axios cheerio node-cron

USAGE:

1. Manual Check (run once):
   node scheme-update-checker.js

2. Scheduled Check (runs daily):
   node scheme-update-checker.js
   // Uncomment: checker.startScheduler()

3. As API Endpoint (Express):
   const { setupExpressEndpoint } = require('./scheme-update-checker');
   setupExpressEndpoint(app);
   // Now POST to /api/check-updates

4. With PM2 (always running):
   npm install -g pm2
   pm2 start scheme-update-checker.js --name scheme-checker
   pm2 save
   
5. With Docker:
   docker build -t scheme-checker .
   docker run -d --restart unless-stopped scheme-checker

NOTES:

- Government sites may have different HTML structures
- You'll need to customize parsing for each site
- Consider rate limiting to be respectful
- Some sites may block automated access
- Consider using official APIs if available

ALTERNATIVES:

1. Use RSS feeds where available
2. Subscribe to government newsletters
3. Use Google Alerts
4. Implement webhook from third-party services
5. Manual updates (most reliable for legal accuracy)
*/

