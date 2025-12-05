const express = require('express');
const router = express.Router();
const axios = require('axios');

// ETL API Configuration
const ETL_API_KEY = process.env.ETL_API_KEY || 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

// Helper function to calculate running cost
function calculateRunningCost(powerUsage) {
    const averageHoursPerDay = 8;
    const electricityRate = 0.15; // €0.15 per kWh
    const daysPerYear = 365;
    
    return (powerUsage / 1000) * averageHoursPerDay * electricityRate * daysPerYear;
}

// Helper function to extract power from product features
function extractPowerFromFeatures(features) {
    if (!features || !Array.isArray(features)) return 0;
    
    // Look for power-related features
    const powerFeature = features.find(f => 
        f.name && (
            f.name.toLowerCase().includes('power') ||
            f.name.toLowerCase().includes('consumption') ||
            f.name.toLowerCase().includes('watt') ||
            f.name.toLowerCase().includes('kw')
        )
    );
    
    if (powerFeature && powerFeature.numericValue) {
        return powerFeature.numericValue;
    }
    
    if (powerFeature && powerFeature.value) {
        const numValue = parseFloat(powerFeature.value);
        return isNaN(numValue) ? 0 : numValue;
    }
    
    return 0;
}

// Helper function to extract energy rating from features
function extractEnergyRatingFromFeatures(features) {
    if (!features || !Array.isArray(features)) return 'Unknown';
    
    const ratingFeature = features.find(f => 
        f.name && (
            f.name.toLowerCase().includes('rating') ||
            f.name.toLowerCase().includes('efficiency') ||
            f.name.toLowerCase().includes('energy')
        )
    );
    
    return ratingFeature ? ratingFeature.value : 'Unknown';
}

// Get all products from ETL API
router.get('/products', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        if (!ETL_API_KEY) {
            return res.status(500).json({ 
                error: 'ETL API key not configured',
                message: 'Please add ETL_API_KEY to your .env file'
            });
        }

        // Make request to ETL API
        const response = await axios.get(`${ETL_BASE_URL}/products`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            },
            params: {
                size: limit,
                listingStatus: 'current'
            }
        });

        // Transform ETL data to our format
        const products = response.data.products.map(product => ({
            id: product.id,
            name: product.name || product.description || 'Unknown Product',
            category: product.technologyId ? `Technology ${product.technologyId}` : 'Unknown',
            power: extractPowerFromFeatures(product.features) || 0,
            energyUsageKwhPerYear: 0,
            energyRating: extractEnergyRatingFromFeatures(product.features) || 'Unknown',
            inShop: true,
            runningCostPerYear: calculateRunningCost(extractPowerFromFeatures(product.features) || 0),
            description: product.description || '',
            manufacturer: product.manufacturer ? product.manufacturer.name : 'Unknown',
            model: product.modelNumber || product.id,
            sku: product.id
        }));

        res.json({
            products,
            total: response.data.total || products.length
        });

    } catch (error) {
        console.error('ETL API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            res.status(401).json({ 
                error: 'Invalid ETL API key',
                message: 'Please check your ETL_API_KEY in the .env file'
            });
        } else {
            res.status(500).json({ 
                error: 'ETL API request failed',
                message: error.message
            });
        }
    }
});

// Get products by category from ETL API
router.get('/products/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        if (!ETL_API_KEY) {
            return res.status(500).json({ 
                error: 'ETL API key not configured',
                message: 'Please add ETL_API_KEY to your .env file'
            });
        }

        // Make request to ETL API
        const response = await axios.get(`${ETL_BASE_URL}/products`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            },
            params: {
                size: limit,
                listingStatus: 'current'
            }
        });

        // Transform ETL data to our format
        const products = response.data.products.map(product => ({
            id: product.id,
            name: product.name || product.description || 'Unknown Product',
            category: product.technologyId ? `Technology ${product.technologyId}` : 'Unknown',
            power: extractPowerFromFeatures(product.features) || 0,
            energyUsageKwhPerYear: 0,
            energyRating: extractEnergyRatingFromFeatures(product.features) || 'Unknown',
            inShop: true,
            runningCostPerYear: calculateRunningCost(extractPowerFromFeatures(product.features) || 0),
            description: product.description || '',
            manufacturer: product.manufacturer ? product.manufacturer.name : 'Unknown',
            model: product.modelNumber || product.id,
            sku: product.id
        }));

        res.json({
            products,
            total: response.data.total || products.length,
            category: category
        });

    } catch (error) {
        console.error('ETL API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            res.status(401).json({ 
                error: 'Invalid ETL API key',
                message: 'Please check your ETL_API_KEY in the .env file'
            });
        } else if (error.response?.status === 404) {
            res.status(404).json({ 
                error: 'Category not found',
                message: `No products found for category: ${req.params.category}`
            });
        } else {
            res.status(500).json({ 
                error: 'ETL API request failed',
                message: error.message
            });
        }
    }
});

// Test ETL API connection
router.get('/test', async (req, res) => {
    try {
        if (!ETL_API_KEY) {
            return res.json({
                status: 'error',
                message: 'ETL API key not configured',
                configured: false
            });
        }

        // Test with a simple API call
        const response = await axios.get(`${ETL_BASE_URL}/products?size=1`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            status: 'success',
            message: 'ETL API connection successful',
            configured: true,
            apiStatus: response.data
        });

    } catch (error) {
        res.json({
            status: 'error',
            message: 'ETL API connection failed',
            configured: true,
            error: error.response?.data || error.message
        });
    }
});

module.exports = router; 