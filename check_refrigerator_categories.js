const axios = require('axios');

const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

async function findRefrigeratorCategories() {
    try {
        console.log('🔍 Looking for refrigerator/cooling categories in ETL API...');
        
        const techResponse = await axios.get(`${ETL_BASE_URL}/technologies`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const technologies = techResponse.data.technologies;
        
        // Look for refrigerator/cooling related technologies
        const refrigeratorKeywords = [
            'refrigerator', 'fridge', 'freezer', 'cooling', 'refrigeration',
            'cold', 'chiller', 'ice', 'storage', 'preservation'
        ];
        
        const refrigeratorTechs = technologies.filter(tech => {
            const name = tech.name.toLowerCase();
            const synonyms = tech.nameSynonyms?.join(' ').toLowerCase() || '';
            const combined = `${name} ${synonyms}`;
            
            return refrigeratorKeywords.some(keyword => 
                combined.includes(keyword.toLowerCase())
            );
        });
        
        console.log(`\n🧊 Found ${refrigeratorTechs.length} refrigerator/cooling technologies:`);
        refrigeratorTechs.forEach(tech => {
            console.log(`   ID ${tech.id}: ${tech.name}`);
            if (tech.nameSynonyms && tech.nameSynonyms.length > 0) {
                console.log(`     Synonyms: ${tech.nameSynonyms.join(', ')}`);
            }
        });
        
        // Test each refrigerator technology for products
        for (const tech of refrigeratorTechs) {
            try {
                console.log(`\n🔍 Testing Technology ${tech.id}: ${tech.name}`);
                
                const response = await axios.get(`${ETL_BASE_URL}/products`, {
                    headers: {
                        'x-api-key': ETL_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        size: 3,
                        listingStatus: 'current',
                        technologyId: tech.id
                    }
                });
                
                console.log(`   Found ${response.data.products.length} products`);
                if (response.data.products.length > 0) {
                    const product = response.data.products[0];
                    console.log(`   Sample: ${product.name}`);
                    console.log(`   Manufacturer: ${product.manufacturer?.name || 'Unknown'}`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ ETL API Error:', error.response?.data || error.message);
    }
}

findRefrigeratorCategories();
















