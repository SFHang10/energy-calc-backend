/**
 * Wix Membership Service
 * Unified membership service for Greenways Buildings and Greenways Marketplace
 * Handles member sync, pricing plans, and cross-site access
 */

const { CallWixSiteAPI } = require('../mcp-wix-integration'); // We'll use MCP tools

// Wix Site IDs
const WIX_SITES = {
  BUILDINGS: 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413', // Greenways Buildings
  MARKETPLACE: 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4' // Greenways Market
};

const SITE_NAMES = {
  [WIX_SITES.BUILDINGS]: 'Greenways Buildings',
  [WIX_SITES.MARKETPLACE]: 'Greenways Marketplace'
};

class WixMembershipService {
  constructor() {
    this.sites = WIX_SITES;
    this.siteNames = SITE_NAMES;
  }

  /**
   * Get member from Wix by email
   */
  async getWixMemberByEmail(siteId, email) {
    try {
      // Use Wix REST API to query members
      const response = await CallWixSiteAPI({
        siteId,
        url: 'https://www.wixapis.com/members/v1/members/query',
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter: {
              email: email
            }
          }
        })
      });

      if (response.members && response.members.length > 0) {
        return response.members[0];
      }
      return null;
    } catch (error) {
      console.error(`❌ Error fetching Wix member from site ${siteId}:`, error.message);
      return null;
    }
  }

  /**
   * Get member's pricing plans from Wix
   */
  async getMemberPricingPlans(siteId, memberId) {
    try {
      const response = await CallWixSiteAPI({
        siteId,
        url: `https://www.wixapis.com/pricing-plans/v1/orders?memberId=${memberId}`,
        method: 'GET'
      });

      return response.orders || [];
    } catch (error) {
      console.error(`❌ Error fetching pricing plans for member ${memberId}:`, error.message);
      return [];
    }
  }

  /**
   * Get all public pricing plans from a Wix site
   */
  async getPublicPricingPlans(siteId) {
    try {
      const response = await CallWixSiteAPI({
        siteId,
        url: 'https://www.wixapis.com/pricing-plans/v1/plans/query-public',
        method: 'POST',
        body: JSON.stringify({
          query: {
            filter: {
              public: true,
              archived: false
            }
          }
        })
      });

      return response.plans || [];
    } catch (error) {
      console.error(`❌ Error fetching public pricing plans from site ${siteId}:`, error.message);
      return [];
    }
  }

  /**
   * Sync local member with Wix member
   * Checks both sites and links the member
   */
  async syncMemberWithWix(localMember) {
    const results = {
      buildings: null,
      marketplace: null,
      synced: false
    };

    // Check Greenways Buildings
    const buildingsMember = await this.getWixMemberByEmail(
      WIX_SITES.BUILDINGS,
      localMember.email
    );

    if (buildingsMember) {
      results.buildings = {
        memberId: buildingsMember.id,
        siteId: WIX_SITES.BUILDINGS,
        siteName: SITE_NAMES[WIX_SITES.BUILDINGS]
      };
    }

    // Check Greenways Marketplace
    const marketplaceMember = await this.getWixMemberByEmail(
      WIX_SITES.MARKETPLACE,
      localMember.email
    );

    if (marketplaceMember) {
      results.marketplace = {
        memberId: marketplaceMember.id,
        siteId: WIX_SITES.MARKETPLACE,
        siteName: SITE_NAMES[WIX_SITES.MARKETPLACE]
      };
    }

    // If member exists on at least one site, get their pricing plans
    if (results.buildings || results.marketplace) {
      const siteId = results.buildings ? WIX_SITES.BUILDINGS : WIX_SITES.MARKETPLACE;
      const memberId = results.buildings?.memberId || results.marketplace?.memberId;
      
      const plans = await this.getMemberPricingPlans(siteId, memberId);
      if (plans.length > 0) {
        const activePlan = plans.find(p => p.status === 'ACTIVE') || plans[0];
        results.activePlan = {
          planId: activePlan.planId,
          orderId: activePlan.id,
          status: activePlan.status,
          siteId: siteId
        };
      }
      
      results.synced = true;
    }

    return results;
  }

  /**
   * Get unified membership status for a member
   * Returns access status for both sites
   */
  async getUnifiedMembershipStatus(localMember) {
    const status = {
      buildings: {
        hasAccess: false,
        memberId: null,
        plans: [],
        activePlan: null
      },
      marketplace: {
        hasAccess: false,
        memberId: null,
        plans: [],
        activePlan: null
      },
      unifiedTier: localMember.subscription_tier || 'Free',
      unifiedStatus: localMember.subscription_status || 'active'
    };

    // Check Buildings site
    if (localMember.wix_site_id === WIX_SITES.BUILDINGS || !localMember.wix_site_id) {
      const buildingsMember = await this.getWixMemberByEmail(
        WIX_SITES.BUILDINGS,
        localMember.email
      );
      
      if (buildingsMember) {
        status.buildings.hasAccess = true;
        status.buildings.memberId = buildingsMember.id;
        const plans = await this.getMemberPricingPlans(WIX_SITES.BUILDINGS, buildingsMember.id);
        status.buildings.plans = plans;
        status.buildings.activePlan = plans.find(p => p.status === 'ACTIVE') || null;
      }
    }

    // Check Marketplace site
    if (localMember.wix_site_id === WIX_SITES.MARKETPLACE || !localMember.wix_site_id) {
      const marketplaceMember = await this.getWixMemberByEmail(
        WIX_SITES.MARKETPLACE,
        localMember.email
      );
      
      if (marketplaceMember) {
        status.marketplace.hasAccess = true;
        status.marketplace.memberId = marketplaceMember.id;
        const plans = await this.getMemberPricingPlans(WIX_SITES.MARKETPLACE, marketplaceMember.id);
        status.marketplace.plans = plans;
        status.marketplace.activePlan = plans.find(p => p.status === 'ACTIVE') || null;
      }
    }

    // Determine unified tier based on highest tier across both sites
    const allPlans = [
      ...status.buildings.plans,
      ...status.marketplace.plans
    ].filter(p => p.status === 'ACTIVE');

    if (allPlans.length > 0) {
      // Get plan details to determine tier
      // This would need to be enhanced to fetch plan details
      status.unifiedTier = 'Premium'; // Placeholder - would need to fetch plan details
    }

    return status;
  }

  /**
   * Get all available pricing plans from both sites
   */
  async getAllPricingPlans() {
    const [buildingsPlans, marketplacePlans] = await Promise.all([
      this.getPublicPricingPlans(WIX_SITES.BUILDINGS),
      this.getPublicPricingPlans(WIX_SITES.MARKETPLACE)
    ]);

    return {
      buildings: {
        siteId: WIX_SITES.BUILDINGS,
        siteName: SITE_NAMES[WIX_SITES.BUILDINGS],
        plans: buildingsPlans
      },
      marketplace: {
        siteId: WIX_SITES.MARKETPLACE,
        siteName: SITE_NAMES[WIX_SITES.MARKETPLACE],
        plans: marketplacePlans
      },
      all: [...buildingsPlans, ...marketplacePlans]
    };
  }
}

module.exports = new WixMembershipService();








