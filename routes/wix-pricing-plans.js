/**
 * Wix Pricing Plans Integration Route
 * Syncs pricing plans from both Greenways Buildings and Greenways Marketplace
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🚀 Wix Pricing Plans router loading...');

// Database connection
const dbPath = path.join(__dirname, '../database/members.db');
const db = new sqlite3.Database(dbPath);

// Wix Site IDs
const WIX_SITES = {
  BUILDINGS: 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413', // Greenways Buildings
  MARKETPLACE: 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4' // Greenways Market
};

/**
 * Sync pricing plans from Wix to local database
 * This endpoint should be called with MCP tools to fetch plans from Wix
 */
router.post('/sync-plans', async (req, res) => {
  try {
    const { siteId, plans } = req.body;

    if (!siteId || !plans || !Array.isArray(plans)) {
      return res.status(400).json({ 
        error: 'siteId and plans array are required',
        note: 'Use MCP tools to fetch plans from Wix, then POST to this endpoint'
      });
    }

    if (siteId !== WIX_SITES.BUILDINGS && siteId !== WIX_SITES.MARKETPLACE) {
      return res.status(400).json({ error: 'Invalid siteId' });
    }

    const siteName = siteId === WIX_SITES.BUILDINGS ? 'Greenways Buildings' : 'Greenways Marketplace';
    let synced = 0;
    let errors = [];

    // Sync each plan
    for (const plan of plans) {
      try {
        // Extract pricing information
        let price = 0;
        let priceMonthly = 0;
        let pricingModel = 'unknown';

        if (plan.pricing) {
          if (plan.pricing.subscription) {
            pricingModel = 'subscription';
            const cycleDuration = plan.pricing.subscription.cycleDuration;
            const cycleCount = plan.pricing.subscription.cycleCount;
            
            if (plan.pricing.subscription.price && plan.pricing.subscription.price.length > 0) {
              price = plan.pricing.subscription.price[0].amount || 0;
              
              // Calculate monthly price
              if (cycleDuration === 'MONTH' && cycleCount === 1) {
                priceMonthly = price;
              } else if (cycleDuration === 'YEAR' && cycleCount === 1) {
                priceMonthly = price / 12;
              } else if (cycleDuration === 'WEEK' && cycleCount === 1) {
                priceMonthly = price * 4.33; // Approximate
              }
            }
          } else if (plan.pricing.singlePaymentForDuration) {
            pricingModel = 'single_payment_duration';
            if (plan.pricing.singlePaymentForDuration.price && plan.pricing.singlePaymentForDuration.price.length > 0) {
              price = plan.pricing.singlePaymentForDuration.price[0].amount || 0;
            }
          } else if (plan.pricing.singlePaymentUnlimited) {
            pricingModel = 'single_payment_unlimited';
            if (plan.pricing.singlePaymentUnlimited.price && plan.pricing.singlePaymentUnlimited.price.length > 0) {
              price = plan.pricing.singlePaymentUnlimited.price[0].amount || 0;
            }
          }
        }

        // Extract features/benefits
        const features = [];
        if (plan.benefits && Array.isArray(plan.benefits)) {
          plan.benefits.forEach(benefit => {
            if (benefit.title) features.push(benefit.title);
          });
        }

        // Insert or update plan in database
        db.run(`
          INSERT OR REPLACE INTO subscription_tiers 
          (name, price, price_monthly, features, wix_plan_id, wix_site_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          plan.name || 'Unnamed Plan',
          price,
          priceMonthly,
          features.join(', '),
          plan._id || plan.id,
          siteId
        ], function(err) {
          if (err) {
            console.error(`❌ Error syncing plan ${plan._id}:`, err.message);
            errors.push({ planId: plan._id, error: err.message });
          } else {
            synced++;
          }
        });
      } catch (error) {
        console.error(`❌ Error processing plan:`, error);
        errors.push({ planId: plan._id || 'unknown', error: error.message });
      }
    }

    // Wait a bit for async operations
    setTimeout(() => {
      res.json({
        success: true,
        message: `Synced ${synced} plans from ${siteName}`,
        synced,
        total: plans.length,
        errors: errors.length > 0 ? errors : undefined,
        siteId,
        siteName
      });
    }, 500);
  } catch (error) {
    console.error('❌ Error in sync-plans:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get pricing plans from a specific site
 */
router.get('/plans/:site', (req, res) => {
  const { site } = req.params;
  let siteId = null;
  let siteName = null;

  if (site === 'buildings') {
    siteId = WIX_SITES.BUILDINGS;
    siteName = 'Greenways Buildings';
  } else if (site === 'marketplace') {
    siteId = WIX_SITES.MARKETPLACE;
    siteName = 'Greenways Marketplace';
  } else {
    return res.status(400).json({ error: 'Invalid site. Use "buildings" or "marketplace"' });
  }

  db.all(
    'SELECT * FROM subscription_tiers WHERE wix_site_id = ? ORDER BY price_monthly ASC',
    [siteId],
    (err, plans) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      res.json({
        site: siteName,
        siteId,
        plans,
        count: plans.length
      });
    }
  );
});

/**
 * Get all pricing plans from both sites
 */
router.get('/plans', (req, res) => {
  db.all(
    'SELECT * FROM subscription_tiers ORDER BY wix_site_id, price_monthly ASC',
    [],
    (err, plans) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      // Group by site
      const buildings = plans.filter(p => p.wix_site_id === WIX_SITES.BUILDINGS);
      const marketplace = plans.filter(p => p.wix_site_id === WIX_SITES.MARKETPLACE);

      res.json({
        buildings: {
          siteId: WIX_SITES.BUILDINGS,
          siteName: 'Greenways Buildings',
          plans: buildings,
          count: buildings.length
        },
        marketplace: {
          siteId: WIX_SITES.MARKETPLACE,
          siteName: 'Greenways Marketplace',
          plans: marketplace,
          count: marketplace.length
        },
        all: plans,
        total: plans.length
      });
    }
  );
});

/**
 * Get instructions for syncing plans using MCP tools
 */
router.get('/sync-instructions', (req, res) => {
  res.json({
    instructions: 'How to sync pricing plans from Wix:',
    steps: [
      '1. Use MCP tool: CallWixSiteAPI to query pricing plans from each site',
      '2. For Greenways Buildings:',
      `   - siteId: ${WIX_SITES.BUILDINGS}`,
      '   - url: https://www.wixapis.com/pricing-plans/v1/plans/query-public',
      '   - method: POST',
      '   - body: {"query": {"paging": {"limit": 50}}}',
      '3. For Greenways Marketplace:',
      `   - siteId: ${WIX_SITES.MARKETPLACE}`,
      '   - url: https://www.wixapis.com/pricing-plans/v1/plans/query-public',
      '   - method: POST',
      '   - body: {"query": {"paging": {"limit": 50}}}',
      '4. POST the plans array to /api/wix-pricing-plans/sync-plans',
      '   - Body: { "siteId": "<site-id>", "plans": [<plans-array>] }'
    ],
    endpoints: {
      sync: 'POST /api/wix-pricing-plans/sync-plans',
      getBuildings: 'GET /api/wix-pricing-plans/plans/buildings',
      getMarketplace: 'GET /api/wix-pricing-plans/plans/marketplace',
      getAll: 'GET /api/wix-pricing-plans/plans'
    }
  });
});

module.exports = router;








