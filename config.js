// Configuration file for URL switching between localhost and production
// This file can be easily updated to switch between environments

const CONFIG = {
    // Environment: 'development' or 'production'
    environment: 'development',
    
    // Base URLs for different environments
    urls: {
        development: 'http://localhost:4000',
        production: 'https://energy-calc-backend.onrender.com' // Update this with your production URL
    },
    
    // Get the current base URL based on environment
    getBaseUrl: function() {
        return this.urls[this.environment] || this.urls.development;
    },
    
    // API endpoints
    getApiUrl: function(endpoint) {
        const baseUrl = this.getBaseUrl();
        // Remove leading slash if present to avoid double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        return `${baseUrl}/${cleanEndpoint}`;
    },
    
    // Image URL helper
    getImageUrl: function(imageUrl) {
        if (!imageUrl) {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
        }
        
        // If it's already a full URL (http/https), use it as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        const baseUrl = this.getBaseUrl();
        
        // If it's a relative path, make it absolute
        if (imageUrl.startsWith('/')) {
            return `${baseUrl}${imageUrl}`;
        }
        
        // If it's a local path, make it absolute
        return `${baseUrl}/${imageUrl}`;
    }
};

// Export for Node.js (if used in server-side code)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}




