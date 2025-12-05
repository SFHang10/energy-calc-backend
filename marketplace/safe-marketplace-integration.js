// SAFE Marketplace Integration - No Calculator Conflicts
// This creates a separate marketplace system that doesn't interfere with existing calculator

class SafeMarketplaceIntegration {
    constructor() {
        this.isInitialized = false;
        this.calculatorProtected = true;
    }

    // Initialize marketplace WITHOUT touching calculator
    initMarketplace() {
        if (this.isInitialized) {
            console.log('⚠️ Marketplace already initialized');
            return;
        }

        console.log('🛡️ Initializing SAFE marketplace integration...');
        
        // Only add marketplace features to product pages
        this.addMarketplaceToProductPages();
        this.setupAffiliateTracking();
        
        this.isInitialized = true;
        console.log('✅ Marketplace initialized safely - Calculator untouched');
    }

    // Add marketplace features ONLY to product pages (not calculator)
    addMarketplaceToProductPages() {
        // Check if we're on a product page (not calculator)
        if (this.isCalculatorPage()) {
            console.log('🛡️ Skipping marketplace on calculator page - Calculator protected');
            return;
        }

        // Only add to product pages
        if (this.isProductPage()) {
            this.addBuyNowButtons();
            this.addAffiliateLinks();
            console.log('✅ Marketplace features added to product page');
        }
    }

    // Check if current page is calculator
    isCalculatorPage() {
        const title = document.title.toLowerCase();
        const url = window.location.href.toLowerCase();
        
        return title.includes('calculator') || 
               url.includes('calculator') ||
               document.querySelector('.calculator-grid') !== null;
    }

    // Check if current page is product page
    isProductPage() {
        return document.querySelector('.product-main') !== null ||
               document.querySelector('.product-page-container') !== null ||
               document.querySelector('#product-details') !== null;
    }

    // Add "Buy Now" buttons to product pages
    addBuyNowButtons() {
        const productCards = document.querySelectorAll('.product-card, .benefit-card');
        
        productCards.forEach(card => {
            // Don't add if button already exists
            if (card.querySelector('.marketplace-buy-btn')) return;
            
            const buyButton = document.createElement('button');
            buyButton.className = 'marketplace-buy-btn';
            buyButton.innerHTML = '🛒 Buy Now';
            buyButton.style.cssText = `
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 15px;
                width: 100%;
                transition: transform 0.3s ease;
            `;
            
            buyButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBuyNowClick(card);
            });
            
            card.appendChild(buyButton);
        });
    }

    // Handle buy now click with affiliate tracking
    handleBuyNowClick(productCard) {
        const productName = productCard.querySelector('h3, h2, .product-name')?.textContent || 'Unknown Product';
        const manufacturer = this.determineManufacturer(productName);
        
        if (!manufacturer) {
            alert('Product manufacturer not found. Please contact support.');
            return;
        }

        // Track the click
        this.trackAffiliateClick(productName, manufacturer);
        
        // Generate affiliate link
        const affiliateLink = this.generateAffiliateLink(productName, manufacturer);
        
        if (affiliateLink) {
            // Open in new tab to keep user on your site
            window.open(affiliateLink, '_blank');
            
            // Show success message
            this.showMarketplaceMessage(`Redirecting to ${manufacturer} for purchase...`, 'success');
        } else {
            this.showMarketplaceMessage('Unable to generate purchase link. Please try again.', 'error');
        }
    }

    // Determine manufacturer from product name
    determineManufacturer(productName) {
        const name = productName.toLowerCase();
        
        if (name.includes('bosch')) return 'bosch';
        if (name.includes('siemens')) return 'siemens';
        if (name.includes('hobart')) return 'hobart';
        if (name.includes('adande')) return 'adande';
        if (name.includes('whirlpool')) return 'whirlpool';
        if (name.includes('lg')) return 'lg';
        if (name.includes('samsung')) return 'samsung';
        
        return null;
    }

    // Generate affiliate link (safe version)
    generateAffiliateLink(productName, manufacturer) {
        const affiliateIds = {
            'bosch': 'ETL_MARKETPLACE_001',
            'siemens': 'ETL_MARKETPLACE_002',
            'hobart': 'ETL_MARKETPLACE_003',
            'adande': 'ETL_MARKETPLACE_004'
        };
        
        const affiliateId = affiliateIds[manufacturer];
        if (!affiliateId) return null;
        
        // Simple affiliate link generation (no complex API calls)
        const baseUrls = {
            'bosch': 'https://www.bosch.com',
            'siemens': 'https://www.siemens.com',
            'hobart': 'https://www.hobart.co.uk',
            'adande': 'https://www.adande.com'
        };
        
        const baseUrl = baseUrls[manufacturer];
        if (!baseUrl) return null;
        
        return `${baseUrl}/products?affiliate=${affiliateId}&source=greenways_market&product=${encodeURIComponent(productName)}`;
    }

    // Track affiliate click (safe version)
    trackAffiliateClick(productName, manufacturer) {
        const clickData = {
            timestamp: new Date().toISOString(),
            product: productName,
            manufacturer: manufacturer,
            page: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Store in localStorage (safe, no database conflicts)
        const clicks = JSON.parse(localStorage.getItem('marketplace_clicks') || '[]');
        clicks.push(clickData);
        localStorage.setItem('marketplace_clicks', JSON.stringify(clicks));
        
        console.log('📊 Affiliate click tracked:', clickData);
    }

    // Setup affiliate tracking (safe version)
    setupAffiliateTracking() {
        // Only add tracking to product pages
        if (!this.isProductPage()) return;
        
        // Add tracking script (safe, no conflicts)
        const trackingScript = document.createElement('script');
        trackingScript.textContent = `
            // Safe marketplace tracking - no calculator interference
            window.marketplaceTracking = {
                track: function(data) {
                    console.log('📊 Marketplace tracking:', data);
                    // Safe tracking implementation
                }
            };
        `;
        document.head.appendChild(trackingScript);
    }

    // Add affiliate links to existing product elements
    addAffiliateLinks() {
        // Find product links and convert to affiliate links
        const productLinks = document.querySelectorAll('a[href*="product"], a[href*="buy"]');
        
        productLinks.forEach(link => {
            const productName = link.textContent || link.getAttribute('title') || '';
            const manufacturer = this.determineManufacturer(productName);
            
            if (manufacturer) {
                const affiliateLink = this.generateAffiliateLink(productName, manufacturer);
                if (affiliateLink) {
                    link.href = affiliateLink;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    console.log(`🔗 Converted to affiliate link: ${productName}`);
                }
            }
        });
    }

    // Show marketplace messages (safe, no calculator interference)
    showMarketplaceMessage(message, type = 'info') {
        // Only show on product pages
        if (!this.isProductPage()) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `marketplace-message marketplace-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#28a745';
        } else if (type === 'error') {
            messageDiv.style.background = '#dc3545';
        } else {
            messageDiv.style.background = '#17a2b8';
        }
        
        document.body.appendChild(messageDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Get marketplace statistics (safe version)
    getMarketplaceStats() {
        const clicks = JSON.parse(localStorage.getItem('marketplace_clicks') || '[]');
        
        return {
            totalClicks: clicks.length,
            manufacturers: [...new Set(clicks.map(c => c.manufacturer))],
            recentClicks: clicks.slice(-10),
            lastUpdated: new Date().toISOString()
        };
    }
}

// Initialize marketplace safely
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded - Checking for safe marketplace integration...');
    
    // Only initialize if not on calculator page
    const marketplace = new SafeMarketplaceIntegration();
    
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        marketplace.initMarketplace();
    }, 100);
});

// Export for use in other scripts
window.SafeMarketplaceIntegration = SafeMarketplaceIntegration;










