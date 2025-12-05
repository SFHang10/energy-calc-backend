const axios = require('axios');

const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

async function findRelevantCategories() {
    try {
        console.log('🔍 Finding relevant ETL categories for energy calculator...');
        
        // Get all technologies
        const techResponse = await axios.get(`${ETL_BASE_URL}/technologies`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const technologies = techResponse.data.technologies || techResponse.data;
        console.log(`📊 Found ${technologies.length} total technologies`);
        console.log('📊 Technologies structure:', Object.keys(techResponse.data));
        
        // Look for technologies that match our desired categories
        const desiredKeywords = [
            'hand dryer', 'hand-dryer', 'handdryer',
            'heat pump', 'heat-pump', 'heatpump',
            'heating', 'ventilation', 'hvac',
            'lighting', 'light', 'lamp', 'bulb',
            'food', 'kitchen', 'catering', 'commercial',
            'refrigerator', 'fridge', 'freezer', 'cooling',
            'shower', 'bathroom', 'wastewater', 'water'
        ];
        
        const relevantTechnologies = technologies.filter(tech => {
            const name = tech.name.toLowerCase();
            const synonyms = tech.nameSynonyms?.join(' ').toLowerCase() || '';
            const combined = `${name} ${synonyms}`;
            
            return desiredKeywords.some(keyword => 
                combined.includes(keyword.toLowerCase())
            );
        });
        
        console.log(`\n🎯 Found ${relevantTechnologies.length} relevant technologies:`);
        relevantTechnologies.forEach(tech => {
            console.log(`   ID ${tech.id}: ${tech.name}`);
            if (tech.nameSynonyms && tech.nameSynonyms.length > 0) {
                console.log(`     Synonyms: ${tech.nameSynonyms.join(', ')}`);
            }
        });
        
        // Test each relevant technology for products
        for (const tech of relevantTechnologies) {
            try {
                console.log(`\n🔍 Testing Technology ${tech.id}: ${tech.name}`);
                
                const response = await axios.get(`${ETL_BASE_URL}/products`, {
                    headers: {
                        'x-api-key': ETL_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        size: 5,
                        listingStatus: 'current',
                        technologyId: tech.id
                    }
                });
                
                console.log(`   Found ${response.data.products.length} products`);
                if (response.data.products.length > 0) {
                    const product = response.data.products[0];
                    console.log(`   Sample: ${product.name}`);
                    console.log(`   Manufacturer: ${product.manufacturer?.name || 'Unknown'}`);
                    
                    // Look for power/energy features
                    if (product.features) {
                        const energyFeatures = product.features.filter(f => 
                            f.name && (
                                f.name.toLowerCase().includes('power') ||
                                f.name.toLowerCase().includes('watt') ||
                                f.name.toLowerCase().includes('kw') ||
                                f.name.toLowerCase().includes('consumption') ||
                                f.name.toLowerCase().includes('efficiency') ||
                                f.name.toLowerCase().includes('energy')
                            )
                        );
                        if (energyFeatures.length > 0) {
                            console.log(`   Energy features: ${energyFeatures.map(f => `${f.name}: ${f.value || f.numericValue}`).join(', ')}`);
                        }
                    }
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ ETL API Error:', error.response?.data || error.message);
    }
}

findRelevantCategories();
