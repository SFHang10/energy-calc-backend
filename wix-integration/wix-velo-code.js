
// Wix Velo Code for Dynamic Product Page
// Add this to your Wix site's backend

import wixStores from 'wix-stores';

// Get product with custom fields
export async function getProductWithCustomFields(productId) {
    try {
        const product = await wixStores.getProduct(productId);
        
        // Add custom fields
        const customFields = {
            powerRating: product.customFields?.powerRating || 'Unknown',
            brand: product.customFields?.brand || 'Unknown',
            category: product.customFields?.category || 'Energy Products',
            modelNumber: product.customFields?.modelNumber || product.id,
            energyRating: product.customFields?.energyRating || 'A',
            efficiency: product.customFields?.efficiency || 'High',
            descriptionShort: product.customFields?.descriptionShort || product.description,
            descriptionFull: product.customFields?.descriptionFull || product.description,
            additionalInfo: product.customFields?.additionalInfo || []
        };

        return {
            ...product,
            ...customFields
        };
    } catch (error) {
        console.error('Error getting product:', error);
        throw error;
    }
}

// Update product custom fields
export async function updateProductCustomFields(productId, customFields) {
    try {
        await wixStores.updateProduct(productId, {
            customFields: customFields
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Bulk update products with custom fields
export async function bulkUpdateProducts(products) {
    const results = [];
    
    for (const product of products) {
        try {
            await updateProductCustomFields(product.id, {
                powerRating: product.powerRating,
                brand: product.brand,
                category: product.category,
                modelNumber: product.modelNumber,
                energyRating: product.energyRating,
                efficiency: product.efficiency,
                descriptionShort: product.descriptionShort,
                descriptionFull: product.descriptionFull,
                additionalInfo: product.additionalInfo
            });
            results.push({ id: product.id, status: 'success' });
        } catch (error) {
            results.push({ id: product.id, status: 'error', error: error.message });
        }
    }
    
    return results;
}
