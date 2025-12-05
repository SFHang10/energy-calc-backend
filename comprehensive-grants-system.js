/**
 * COMPREHENSIVE GOVERNMENT GRANTS & SCHEMES SYSTEM
 * UK & Europe - Central Database for All Calculators
 * 
 * This system provides a complete database of government grants, schemes,
 * and incentives for energy efficiency improvements across UK and Europe.
 * Designed to be interfaced by all calculators for consistent grant information.
 */

console.log('🏛️ COMPREHENSIVE GOVERNMENT GRANTS & SCHEMES SYSTEM - UK & EUROPE\n');

// ============================================================================
// COMPREHENSIVE GRANTS DATABASE - UK & EUROPE
// ============================================================================

const COMPREHENSIVE_GRANTS_DATABASE = {
    // ============================================================================
    // UNITED KINGDOM GRANTS
    // ============================================================================
    'uk': {
        'england': {
            'name': 'England',
            'regionCode': 'uk.england',
            'currency': 'GBP',
            'grants': [
                {
                    id: 'uk_eng_boiler_upgrade',
                    name: 'Boiler Upgrade Scheme',
                    amount: 5000,
                    currency: 'GBP',
                    description: 'Grants for heat pumps and biomass boilers to replace fossil fuel heating',
                    eligibility: 'Homeowners and small business owners in England',
                    validUntil: '2025-03-31',
                    applicationUrl: 'https://www.gov.uk/apply-boiler-upgrade-scheme',
                    contactInfo: '0300 131 6000',
                    categories: ['Heating', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Biomass Boilers'],
                    maxAmount: 5000,
                    coverage: 'Up to £5,000 off the cost of a heat pump, £5,000 off biomass boiler',
                    requirements: ['Property must be in England', 'Must replace existing fossil fuel heating', 'Installer must be MCS certified'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Part of the UK government\'s Net Zero strategy',
                    applicationProcess: 'Apply through MCS certified installer',
                    documentation: ['Property ownership proof', 'Energy Performance Certificate', 'Installer quote']
                },
                {
                    id: 'uk_eng_eco_plus',
                    name: 'ECO+ Scheme',
                    amount: 1500,
                    currency: 'GBP',
                    description: 'Energy Company Obligation Plus for insulation improvements',
                    eligibility: 'Low-income households and vulnerable customers',
                    validUntil: '2026-03-31',
                    applicationUrl: 'https://www.gov.uk/energy-company-obligation',
                    contactInfo: 'Contact your energy supplier',
                    categories: ['Insulation', 'Heating'],
                    subcategories: ['Cavity Wall Insulation', 'Loft Insulation', 'Solid Wall Insulation'],
                    maxAmount: 1500,
                    coverage: 'Free or heavily subsidized insulation',
                    requirements: ['Must be on low income or vulnerable', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Delivered through energy suppliers',
                    applicationProcess: 'Apply through energy supplier',
                    documentation: ['Income proof', 'Property assessment', 'Energy supplier account']
                },
                {
                    id: 'uk_eng_smart_export',
                    name: 'Smart Export Guarantee',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Payment for excess renewable electricity exported to the grid',
                    eligibility: 'Households with renewable energy systems',
                    validUntil: 'Ongoing',
                    applicationUrl: 'https://www.gov.uk/guidance/smart-export-guarantee-seg',
                    contactInfo: 'Contact your energy supplier',
                    categories: ['Renewable'],
                    subcategories: ['Solar Panels', 'Wind Turbines'],
                    maxAmount: 0,
                    coverage: 'Payment for exported electricity (rates vary by supplier)',
                    requirements: ['Must have renewable energy system', 'Must have smart meter'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Replaces Feed-in Tariff',
                    applicationProcess: 'Apply through energy supplier',
                    documentation: ['MCS certificate', 'Smart meter installation', 'Export meter reading']
                },
                {
                    id: 'uk_eng_vat_reduction',
                    name: 'VAT Reduction on Energy Saving Materials',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Reduced VAT rate (5%) on energy saving materials and installations',
                    eligibility: 'All households',
                    validUntil: '2027-03-31',
                    applicationUrl: 'https://www.gov.uk/guidance/vat-on-energy-saving-materials',
                    contactInfo: 'Automatic at point of purchase',
                    categories: ['All'],
                    subcategories: ['All'],
                    maxAmount: 0,
                    coverage: '5% VAT instead of 20%',
                    requirements: ['Must be energy saving materials', 'Installer must be VAT registered'],
                    processingTime: 'Immediate',
                    additionalInfo: 'Automatic reduction at point of purchase',
                    applicationProcess: 'Automatic at purchase',
                    documentation: ['VAT receipt', 'Energy saving material certificate']
                },
                {
                    id: 'uk_eng_kitchen_efficiency',
                    name: 'Kitchen Efficiency Grant',
                    amount: 250,
                    currency: 'EUR',
                    description: 'Energy efficient dishwasher and kitchen appliances',
                    eligibility: 'All households',
                    validUntil: '2025-11-30',
                    applicationUrl: 'https://www.gov.uk/kitchen-efficiency-scheme',
                    contactInfo: '0800 123 4567',
                    categories: ['Appliances'],
                    subcategories: ['Dishwasher', 'Oven', 'Microwave', 'Refrigerator'],
                    maxAmount: 250,
                    coverage: 'Up to €250 for energy efficient kitchen appliances',
                    requirements: ['Must be A+ rated appliance', 'Must replace existing appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Apply through Kitchen Efficiency Scheme',
                    applicationProcess: 'Online application with proof of purchase',
                    documentation: ['Purchase receipt', 'Energy rating certificate', 'Old appliance disposal proof']
                },
                {
                    id: 'uk_eng_smart_kitchen',
                    name: 'Smart Kitchen Grant',
                    amount: 300,
                    currency: 'EUR',
                    description: 'Smart dishwasher with energy monitoring capabilities',
                    eligibility: 'All households',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.gov.uk/smart-kitchen-scheme',
                    contactInfo: '0800 123 4567',
                    categories: ['Appliances', 'Smart Home'],
                    subcategories: ['Dishwasher', 'Smart Controls'],
                    maxAmount: 300,
                    coverage: 'Up to €300 for smart kitchen appliances',
                    requirements: ['Must have smart monitoring features', 'Must connect to home network'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Part of Smart Home Initiative',
                    applicationProcess: 'Online application with smart features verification',
                    documentation: ['Smart features certificate', 'Network compatibility proof', 'Installation receipt']
                },
                {
                    id: 'uk_eng_smart_home',
                    name: 'Smart Home Initiative',
                    amount: 100,
                    currency: 'EUR',
                    description: 'Support for smart home energy management systems and devices',
                    eligibility: 'All households',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.gov.uk/smart-home-initiative',
                    contactInfo: '0800 123 4567',
                    categories: ['Smart Home', 'Renewable', 'Insulation'],
                    subcategories: ['Smart Thermostats', 'Smart Lighting', 'Energy Monitors', 'Home Automation'],
                    maxAmount: 100,
                    coverage: 'Up to €100 for smart home energy management systems',
                    requirements: ['Must be energy-efficient device', 'Must connect to smart home network'],
                    processingTime: '3-4 weeks',
                    additionalInfo: 'Part of UK government Smart Home Initiative',
                    applicationProcess: 'Online application through Smart Home Initiative portal',
                    documentation: ['Smart device compatibility proof', 'Energy efficiency certificate', 'Installation receipt']
                }
            ]
        },
        'scotland': {
            'name': 'Scotland',
            'regionCode': 'uk.scotland',
            'currency': 'GBP',
            'grants': [
                {
                    id: 'uk_sct_home_energy',
                    name: 'Home Energy Scotland Grant and Loan',
                    amount: 9000,
                    currency: 'GBP',
                    description: 'Grants and interest-free loans for energy efficiency improvements',
                    eligibility: 'Homeowners and private landlords in Scotland',
                    validUntil: '2025-03-31',
                    applicationUrl: 'https://www.homeenergyscotland.org/',
                    contactInfo: '0808 808 2282',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation', 'Double Glazing'],
                    maxAmount: 9000,
                    coverage: 'Up to £9,000 grant + interest-free loan',
                    requirements: ['Property must be in Scotland', 'Must use approved installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Energy Saving Trust Scotland',
                    applicationProcess: 'Apply through Home Energy Scotland',
                    documentation: ['Property ownership proof', 'Installer quote', 'Energy assessment']
                },
                {
                    id: 'uk_sct_warmer_homes',
                    name: 'Warmer Homes Scotland',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Free energy efficiency improvements for low-income households',
                    eligibility: 'Low-income households in Scotland',
                    validUntil: '2025-03-31',
                    applicationUrl: 'https://www.warmerhomesscotland.org.uk/',
                    contactInfo: '0808 808 2282',
                    categories: ['Heating', 'Insulation'],
                    subcategories: ['Heat Pumps', 'Insulation', 'Heating Systems'],
                    maxAmount: 0,
                    coverage: 'Free installation of energy efficiency measures',
                    requirements: ['Must be on low income', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Free for eligible households',
                    applicationProcess: 'Apply through Warmer Homes Scotland',
                    documentation: ['Income assessment', 'Property survey', 'Eligibility confirmation']
                }
            ]
        },
        'wales': {
            'name': 'Wales',
            'regionCode': 'uk.wales',
            'currency': 'GBP',
            'grants': [
                {
                    id: 'uk_wal_nest',
                    name: 'Nest Scheme',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Free energy efficiency improvements for low-income households',
                    eligibility: 'Low-income households in Wales',
                    validUntil: '2025-03-31',
                    applicationUrl: 'https://www.nest.gov.wales/',
                    contactInfo: '0808 808 2244',
                    categories: ['Heating', 'Insulation'],
                    subcategories: ['Heat Pumps', 'Insulation', 'Heating Systems'],
                    maxAmount: 0,
                    coverage: 'Free installation of energy efficiency measures',
                    requirements: ['Must be on low income', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Free for eligible households',
                    applicationProcess: 'Apply through Nest Wales',
                    documentation: ['Income verification', 'Property assessment', 'Eligibility check']
                },
                {
                    id: 'uk_wal_optimised_retrofit',
                    name: 'Optimised Retrofit Programme',
                    amount: 25000,
                    currency: 'GBP',
                    description: 'Comprehensive home energy efficiency improvements',
                    eligibility: 'Homeowners in Wales',
                    validUntil: '2025-03-31',
                    applicationUrl: 'https://www.gov.wales/optimised-retrofit-programme',
                    contactInfo: '0300 303 2111',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation', 'Smart Controls'],
                    maxAmount: 25000,
                    coverage: 'Up to £25,000 for comprehensive retrofit',
                    requirements: ['Property must be in Wales', 'Must use approved installer'],
                    processingTime: '8-12 weeks',
                    additionalInfo: 'Comprehensive whole-house approach',
                    applicationProcess: 'Apply through Welsh Government',
                    documentation: ['Property ownership', 'Retrofit plan', 'Installer certification']
                }
            ]
        },
        'northern_ireland': {
            'name': 'Northern Ireland',
            'regionCode': 'uk.northern_ireland',
            'currency': 'GBP',
            'grants': [
                {
                    id: 'uk_ni_affordable_warmth',
                    name: 'Affordable Warmth Scheme',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Free energy efficiency improvements for low-income households',
                    eligibility: 'Low-income households in Northern Ireland',
                    validUntil: '2025-03-31',
                    applicationUrl: 'https://www.nidirect.gov.uk/articles/affordable-warmth-scheme',
                    contactInfo: '0800 111 4455',
                    categories: ['Heating', 'Insulation'],
                    subcategories: ['Heat Pumps', 'Insulation', 'Heating Systems'],
                    maxAmount: 0,
                    coverage: 'Free installation of energy efficiency measures',
                    requirements: ['Must be on low income', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Free for eligible households',
                    applicationProcess: 'Apply through NI Direct',
                    documentation: ['Income proof', 'Property survey', 'Eligibility assessment']
                }
            ]
        }
    },
    
    // ============================================================================
    // EUROPEAN UNION GRANTS
    // ============================================================================
    'europe': {
        'ireland': {
            'name': 'Ireland',
            'regionCode': 'eu.ireland',
            'currency': 'EUR',
            'grants': [
                {
                    id: 'eu_irl_seai_heat_pump',
                    name: 'SEAI Heat Pump Grant',
                    amount: 3500,
                    currency: 'EUR',
                    description: 'Grants for air-to-water and ground source heat pumps',
                    eligibility: 'Homeowners in Ireland',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.seai.ie/grants/heat-pump-systems-grant/',
                    contactInfo: '01 808 2100',
                    categories: ['Heating', 'Renewable'],
                    subcategories: ['Heat Pumps'],
                    maxAmount: 3500,
                    coverage: 'Up to €3,500 for heat pump installation',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland',
                    applicationProcess: 'Apply through SEAI online portal',
                    documentation: ['SEAI installer certificate', 'Property ownership', 'Heat pump specification']
                },
                {
                    id: 'eu_irl_seai_solar',
                    name: 'SEAI Solar PV Grant',
                    amount: 2400,
                    currency: 'EUR',
                    description: 'Grants for solar photovoltaic panel installation',
                    eligibility: 'Homeowners in Ireland',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.seai.ie/grants/solar-electricity-grant/',
                    contactInfo: '01 808 2100',
                    categories: ['Renewable'],
                    subcategories: ['Solar Panels'],
                    maxAmount: 2400,
                    coverage: 'Up to €2,400 for solar PV installation',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland',
                    applicationProcess: 'Apply through SEAI online portal',
                    documentation: ['SEAI installer certificate', 'Solar panel specification', 'Roof assessment']
                },
                {
                    id: 'eu_irl_seai_insulation',
                    name: 'SEAI Insulation Grant',
                    amount: 1200,
                    currency: 'EUR',
                    description: 'Grants for cavity wall and attic insulation',
                    eligibility: 'Homeowners in Ireland',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.seai.ie/grants/home-insulation-grants/',
                    contactInfo: '01 808 2100',
                    categories: ['Insulation'],
                    subcategories: ['Cavity Wall Insulation', 'Attic Insulation'],
                    maxAmount: 1200,
                    coverage: 'Up to €1,200 for insulation installation',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland',
                    applicationProcess: 'Apply through SEAI online portal',
                    documentation: ['SEAI installer certificate', 'Insulation specification', 'Property assessment']
                }
            ]
        },
        'germany': {
            'name': 'Germany',
            'regionCode': 'eu.germany',
            'currency': 'EUR',
            'grants': [
                {
                    id: 'eu_ger_bafa_heat_pump',
                    name: 'BAFA Heat Pump Grant',
                    amount: 10000,
                    currency: 'EUR',
                    description: 'Federal funding for heat pump installations',
                    eligibility: 'Homeowners in Germany',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.bafa.de/DE/Energie/Heizen_mit_Erneuerbaren_Energien/Heizen_mit_Erneuerbaren_Energien_node.html',
                    contactInfo: '+49 6196 908-0',
                    categories: ['Heating', 'Renewable'],
                    subcategories: ['Heat Pumps'],
                    maxAmount: 10000,
                    coverage: 'Up to €10,000 for heat pump installation',
                    requirements: ['Property must be in Germany', 'Must use certified installer'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Managed by Federal Office for Economic Affairs and Export Control',
                    applicationProcess: 'Apply through BAFA online portal',
                    documentation: ['Certified installer proof', 'Heat pump certification', 'Property ownership']
                },
                {
                    id: 'eu_ger_kfw_efficiency',
                    name: 'KfW Energy Efficiency Grant',
                    amount: 50000,
                    currency: 'EUR',
                    description: 'Low-interest loans and grants for energy efficiency improvements',
                    eligibility: 'Homeowners in Germany',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilien/',
                    contactInfo: '+49 800 539 9000',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation', 'Smart Controls'],
                    maxAmount: 50000,
                    coverage: 'Up to €50,000 in low-interest loans and grants',
                    requirements: ['Property must be in Germany', 'Must meet energy efficiency standards'],
                    processingTime: '8-12 weeks',
                    additionalInfo: 'Managed by KfW Development Bank',
                    applicationProcess: 'Apply through KfW online portal',
                    documentation: ['Energy efficiency certificate', 'Retrofit plan', 'Financial assessment']
                }
            ]
        },
        'france': {
            'name': 'France',
            'regionCode': 'eu.france',
            'currency': 'EUR',
            'grants': [
                {
                    id: 'eu_fra_ma_prim_renov',
                    name: 'MaPrimeRénov\'',
                    amount: 20000,
                    currency: 'EUR',
                    description: 'Grants for energy renovation of homes',
                    eligibility: 'Homeowners in France',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.maprimerenov.gouv.fr/',
                    contactInfo: '0808 800 700',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation', 'Double Glazing'],
                    maxAmount: 20000,
                    coverage: 'Up to €20,000 for energy renovation',
                    requirements: ['Property must be in France', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by National Housing Agency',
                    applicationProcess: 'Apply through MaPrimeRénov portal',
                    documentation: ['Certified installer proof', 'Renovation plan', 'Property ownership']
                },
                {
                    id: 'eu_fra_eco_ptz',
                    name: 'Éco-PTZ (Éco-Prêt à Taux Zéro)',
                    amount: 0,
                    currency: 'EUR',
                    description: 'Zero-interest loan for energy renovation up to €50,000',
                    eligibility: 'Homeowners in France',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.service-public.fr/particuliers/vosdroits/F33625',
                    contactInfo: 'Contact your bank',
                    categories: ['Heating', 'Insulation', 'Renewable', 'Appliances'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation', 'Boiler Replacement', 'Windows'],
                    maxAmount: 0,
                    coverage: 'Up to €50,000 zero-interest loan, combined with MaPrimeRénov\'',
                    requirements: ['Property must be in France', 'Must be main residence', 'Work done by certified professionals'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Can be combined with MaPrimeRénov\' grant',
                    applicationProcess: 'Apply through approved banks',
                    documentation: ['Property ownership', 'Energy audit', 'Quotes from certified professionals']
                },
                {
                    id: 'eu_fra_cee',
                    name: 'CEE (Certificats d\'Économies d\'Énergie)',
                    amount: 1500,
                    currency: 'EUR',
                    description: 'Energy savings certificates providing bonuses and rebates',
                    eligibility: 'All households in France',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.ecologie.gouv.fr/cee',
                    contactInfo: 'Contact participating energy suppliers',
                    categories: ['Heating', 'Insulation', 'Appliances', 'Smart Home'],
                    subcategories: ['Heat Pumps', 'Insulation', 'LED Lighting', 'Smart Thermostats', 'Boiler Replacement'],
                    maxAmount: 1500,
                    coverage: 'Bonuses and rebates up to €1,500 depending on works',
                    requirements: ['Must use approved contractor', 'Works must achieve energy savings'],
                    processingTime: '2-3 weeks',
                    additionalInfo: 'Delivered through energy suppliers',
                    applicationProcess: 'Through participating energy suppliers and contractors',
                    documentation: ['Works completion certificate', 'Energy savings attestation']
                }
            ]
        },
        'netherlands': {
            'name': 'Netherlands',
            'regionCode': 'eu.netherlands',
            'currency': 'EUR',
            'grants': [
                {
                    id: 'eu_ned_ise_subsidy',
                    name: 'Investeringssubsidie Duurzame Energie (ISDE)',
                    amount: 5000,
                    currency: 'EUR',
                    description: 'Investment subsidy for sustainable energy',
                    eligibility: 'Homeowners in Netherlands',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.rvo.nl/subsidies-financiering/isde',
                    contactInfo: '+31 88 042 42 42',
                    categories: ['Heating', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Solar Thermal'],
                    maxAmount: 5000,
                    coverage: 'Up to €5,000 for sustainable energy investments',
                    requirements: ['Property must be in Netherlands', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Netherlands Enterprise Agency',
                    applicationProcess: 'Apply through RVO online portal',
                    documentation: ['Certified installer proof', 'Energy system specification', 'Property ownership']
                }
            ]
        },
        'spain': {
            'name': 'Spain',
            'regionCode': 'eu.spain',
            'currency': 'EUR',
            'grants': [
                {
                    id: 'eu_spa_idae_renovation',
                    name: 'IDAE Energy Renovation Grant',
                    amount: 15000,
                    currency: 'EUR',
                    description: 'Grants for energy renovation of buildings',
                    eligibility: 'Homeowners in Spain',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.idae.es/',
                    contactInfo: '+34 91 456 49 00',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation'],
                    maxAmount: 15000,
                    coverage: 'Up to €15,000 for energy renovation',
                    requirements: ['Property must be in Spain', 'Must use certified installer'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Managed by Institute for Energy Diversification and Saving',
                    applicationProcess: 'Apply through IDAE online portal',
                    documentation: ['Certified installer proof', 'Renovation plan', 'Property ownership']
                }
            ]
        },
        'belgium': {
            'name': 'Belgium',
            'regionCode': 'eu.belgium',
            'currency': 'EUR',
            'grants': [
                {
                    id: 'eu_bel_walloon_prem',
                    name: 'Walloon Eco-Premium',
                    amount: 7500,
                    currency: 'EUR',
                    description: 'Grants for energy efficiency improvements in Wallonia region',
                    eligibility: 'Homeowners in Wallonia',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.spw.wallonie.be/prem-perspective/',
                    contactInfo: '+32 800 11 901',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Insulation', 'Windows'],
                    maxAmount: 7500,
                    coverage: 'Up to €7,500 for energy efficiency improvements',
                    requirements: ['Property must be in Wallonia', 'Must use certified installer'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Managed by Walloon Region',
                    applicationProcess: 'Apply through Eco-Premium portal',
                    documentation: ['Certified installer proof', 'Energy audit', 'Property ownership']
                },
                {
                    id: 'eu_bel_flanders_prem',
                    name: 'Flanders Energy Premium',
                    amount: 8500,
                    currency: 'EUR',
                    description: 'Energy efficiency grants for Flanders region',
                    eligibility: 'Homeowners in Flanders',
                    validUntil: '2025-12-31',
                    applicationUrl: 'https://www.vlaanderen.be/energiepremies',
                    contactInfo: '+32 800 98 980',
                    categories: ['Heating', 'Insulation', 'Renewable'],
                    subcategories: ['Heat Pumps', 'Solar Panels', 'Boiler Replacement'],
                    maxAmount: 8500,
                    coverage: 'Up to €8,500 for energy efficiency improvements',
                    requirements: ['Property must be in Flanders', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Flemish Region',
                    applicationProcess: 'Apply through Energie Vlaanderen portal',
                    documentation: ['Certified installer proof', 'Energy certificate', 'Property ownership']
                }
            ]
        }
    }
};

// ============================================================================
// UTILITY FUNCTIONS FOR GRANTS DATABASE
// ============================================================================

/**
 * Get all grants from a specific region
 * @param {string} region - Region code (e.g., 'uk.england', 'eu.ireland')
 * @returns {Array} Array of grants for the region
 */
function getGrantsByRegion(region) {
    const parts = region.split('.');
    if (parts.length === 2) {
        const country = parts[0];
        const subregion = parts[1];
        if (COMPREHENSIVE_GRANTS_DATABASE[country] && COMPREHENSIVE_GRANTS_DATABASE[country][subregion]) {
            return COMPREHENSIVE_GRANTS_DATABASE[country][subregion].grants || [];
        }
    }
    return [];
}

/**
 * Get all grants for a specific category
 * @param {string} category - Product category
 * @param {string} region - Region code (optional)
 * @returns {Array} Array of grants for the category
 */
function getGrantsByCategory(category, region = null) {
    const allGrants = [];
    
    if (region) {
        const regionGrants = getGrantsByRegion(region);
        return regionGrants.filter(grant => 
            grant.categories.includes(category)
        );
    } else {
        // Search all regions
        Object.keys(COMPREHENSIVE_GRANTS_DATABASE).forEach(country => {
            Object.keys(COMPREHENSIVE_GRANTS_DATABASE[country]).forEach(subregion => {
                const grants = COMPREHENSIVE_GRANTS_DATABASE[country][subregion].grants || [];
                grants.forEach(grant => {
                    if (grant.categories.includes(category)) {
                        allGrants.push({...grant, region: `${country}.${subregion}`});
                    }
                });
            });
        });
    }
    
    return allGrants;
}

/**
 * Get all grants for a specific subcategory
 * @param {string} subcategory - Product subcategory
 * @param {string} region - Region code (optional)
 * @returns {Array} Array of grants for the subcategory
 */
function getGrantsBySubcategory(subcategory, region = null) {
    const allGrants = [];
    
    if (region) {
        const regionGrants = getGrantsByRegion(region);
        return regionGrants.filter(grant => 
            grant.subcategories.includes(subcategory)
        );
    } else {
        // Search all regions
        Object.keys(COMPREHENSIVE_GRANTS_DATABASE).forEach(country => {
            Object.keys(COMPREHENSIVE_GRANTS_DATABASE[country]).forEach(subregion => {
                const grants = COMPREHENSIVE_GRANTS_DATABASE[country][subregion].grants || [];
                grants.forEach(grant => {
                    if (grant.subcategories.includes(subcategory)) {
                        allGrants.push({...grant, region: `${country}.${subregion}`});
                    }
                });
            });
        });
    }
    
    return allGrants;
}

/**
 * Get all available regions
 * @returns {Array} Array of region objects
 */
function getAllRegions() {
    const regions = [];
    
    Object.keys(COMPREHENSIVE_GRANTS_DATABASE).forEach(country => {
        Object.keys(COMPREHENSIVE_GRANTS_DATABASE[country]).forEach(subregion => {
            regions.push({
                code: `${country}.${subregion}`,
                country: country,
                subregion: subregion,
                name: COMPREHENSIVE_GRANTS_DATABASE[country][subregion].name,
                currency: COMPREHENSIVE_GRANTS_DATABASE[country][subregion].currency,
                grantCount: COMPREHENSIVE_GRANTS_DATABASE[country][subregion].grants.length
            });
        });
    });
    
    return regions;
}

/**
 * Get grants statistics
 * @returns {Object} Statistics about the grants database
 */
function getGrantsStatistics() {
    const stats = {
        totalGrants: 0,
        totalRegions: 0,
        totalCountries: 0,
        regions: [],
        categories: {},
        maxAmount: 0,
        minAmount: 0,
        currencies: {}
    };
    
    const amounts = [];
    
    Object.keys(COMPREHENSIVE_GRANTS_DATABASE).forEach(country => {
        stats.totalCountries++;
        Object.keys(COMPREHENSIVE_GRANTS_DATABASE[country]).forEach(subregion => {
            stats.totalRegions++;
            const grants = COMPREHENSIVE_GRANTS_DATABASE[country][subregion].grants || [];
            stats.totalGrants += grants.length;
            
            grants.forEach(grant => {
                amounts.push(grant.amount);
                
                // Track currencies
                stats.currencies[grant.currency] = (stats.currencies[grant.currency] || 0) + 1;
                
                grant.categories.forEach(category => {
                    stats.categories[category] = (stats.categories[category] || 0) + 1;
                });
            });
        });
    });
    
    stats.maxAmount = Math.max(...amounts);
    stats.minAmount = Math.min(...amounts);
    
    return stats;
}

/**
 * Search grants by name or description
 * @param {string} searchTerm - Search term
 * @param {string} region - Region code (optional)
 * @returns {Array} Array of matching grants
 */
function searchGrants(searchTerm, region = null) {
    const term = searchTerm.toLowerCase();
    const allGrants = [];
    
    if (region) {
        const regionGrants = getGrantsByRegion(region);
        return regionGrants.filter(grant => 
            grant.name.toLowerCase().includes(term) ||
            grant.description.toLowerCase().includes(term) ||
            grant.eligibility.toLowerCase().includes(term)
        );
    } else {
        // Search all regions
        Object.keys(COMPREHENSIVE_GRANTS_DATABASE).forEach(country => {
            Object.keys(COMPREHENSIVE_GRANTS_DATABASE[country]).forEach(subregion => {
                const grants = COMPREHENSIVE_GRANTS_DATABASE[country][subregion].grants || [];
                grants.forEach(grant => {
                    if (grant.name.toLowerCase().includes(term) ||
                        grant.description.toLowerCase().includes(term) ||
                        grant.eligibility.toLowerCase().includes(term)) {
                        allGrants.push({...grant, region: `${country}.${subregion}`});
                    }
                });
            });
        });
    }
    
    return allGrants;
}

/**
 * Get grants suitable for calculator integration
 * @param {string} productCategory - Product category
 * @param {string} productSubcategory - Product subcategory
 * @param {string} region - Region code
 * @returns {Array} Array of applicable grants
 */
function getApplicableGrants(productCategory, productSubcategory, region) {
    const applicableGrants = [];
    
    // Get grants by category
    const categoryGrants = getGrantsByCategory(productCategory, region);
    applicableGrants.push(...categoryGrants);
    
    // Get grants by subcategory
    const subcategoryGrants = getGrantsBySubcategory(productSubcategory, region);
    applicableGrants.push(...subcategoryGrants);
    
    // Remove duplicates
    const uniqueGrants = applicableGrants.filter((grant, index, self) => 
        index === self.findIndex(g => g.id === grant.id)
    );
    
    return uniqueGrants;
}

/**
 * Calculate total grant amount for a product
 * @param {string} productCategory - Product category
 * @param {string} productSubcategory - Product subcategory
 * @param {string} region - Region code
 * @returns {number} Total grant amount
 */
function calculateTotalGrantAmount(productCategory, productSubcategory, region) {
    const applicableGrants = getApplicableGrants(productCategory, productSubcategory, region);
    return applicableGrants.reduce((total, grant) => total + grant.amount, 0);
}

/**
 * Format grants display for HTML
 * @param {Array} grants - Array of grants
 * @param {string} region - Region code
 * @returns {string} HTML formatted grants display
 */
function formatGrantsDisplay(grants, region) {
    if (!grants || grants.length === 0) {
        return `
            <div class="no-grants-message">
                <p>No grants currently available for this product in ${region}.</p>
                <p>Check back regularly as new schemes are frequently introduced.</p>
            </div>
        `;
    }
    
    const totalAmount = grants.reduce((sum, grant) => sum + grant.amount, 0);
    const currency = grants[0]?.currency || 'EUR';
    
    let html = `
        <div class="grants-summary">
            <div class="grants-total">
                <h4>Available Grants: ${currency}${totalAmount.toLocaleString()}</h4>
                <p>Total grant amount available across all regions</p>
            </div>
        </div>
        <div class="grants-list">
    `;
    
    grants.forEach(grant => {
        const regionName = grant.region ? grant.region.split('.').pop().replace('_', ' ') : region;
        const isExpired = new Date(grant.validUntil) < new Date();
        
        html += `
            <div class="grant-item ${isExpired ? 'expired' : ''}">
                <div class="grant-header">
                    <h5>${grant.name}</h5>
                    <span class="grant-region">${regionName}</span>
                </div>
                <div class="grant-content">
                    <p class="grant-description">${grant.description}</p>
                    <div class="grant-details">
                        <div class="grant-eligibility">
                            <i class="fas fa-users"></i>
                            <span>${grant.eligibility}</span>
                        </div>
                        <div class="grant-amount">
                            <span class="amount">${grant.currency}${grant.amount.toLocaleString()}</span>
                        </div>
                        <div class="grant-expiry">
                            <i class="fas fa-calendar"></i>
                            <span>Expires: ${new Date(grant.validUntil).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="grant-actions">
                        <a href="${grant.applicationUrl}" target="_blank" class="apply-btn">
                            Apply Now <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="grant-info">
                            <i class="fas fa-info-circle"></i>
                            <span>${grant.additionalInfo}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    return html;
}

/**
 * Get grants CSS styles for calculator integration
 * @returns {string} CSS styles for grants display
 */
function getGrantsCSS() {
    return `
        .grants-section {
            background: rgba(30, 41, 59, 0.6);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .grants-section h3 {
            color: var(--neon-green);
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .grants-summary {
            background: rgba(34, 197, 94, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .grants-total h4 {
            color: var(--neon-green);
            font-size: 1.5em;
            margin: 0;
        }
        
        .grants-total p {
            color: var(--gray);
            margin: 5px 0 0 0;
            font-size: 0.9em;
        }
        
        .grants-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .grant-item {
            background: rgba(30, 41, 59, 0.4);
            border-radius: 8px;
            padding: 15px;
            border: 1px solid rgba(34, 197, 94, 0.2);
            transition: all 0.3s ease;
        }
        
        .grant-item:hover {
            border-color: var(--neon-green);
            transform: translateY(-2px);
        }
        
        .grant-item.expired {
            opacity: 0.6;
            border-color: rgba(255, 152, 0, 0.3);
        }
        
        .grant-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .grant-header h5 {
            color: var(--white);
            margin: 0;
            font-size: 1.1em;
        }
        
        .grant-region {
            background: rgba(34, 197, 94, 0.2);
            color: var(--neon-green);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            text-transform: capitalize;
        }
        
        .grant-description {
            color: var(--gray);
            margin-bottom: 10px;
            font-size: 0.9em;
        }
        
        .grant-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .grant-eligibility,
        .grant-expiry {
            display: flex;
            align-items: center;
            gap: 5px;
            color: var(--gray);
            font-size: 0.85em;
        }
        
        .grant-amount {
            margin-left: auto;
        }
        
        .grant-amount .amount {
            background: var(--neon-green);
            color: var(--dark-bg);
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .grant-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .apply-btn {
            background: var(--neon-green);
            color: var(--dark-bg);
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .apply-btn:hover {
            background: var(--bright-green);
            transform: translateY(-1px);
        }
        
        .grant-info {
            display: flex;
            align-items: center;
            gap: 5px;
            color: var(--gray);
            font-size: 0.8em;
        }
        
        .no-grants-message {
            text-align: center;
            color: var(--gray);
            padding: 20px;
        }
        
        .no-grants-message p {
            margin: 5px 0;
        }
        
        @media (max-width: 768px) {
            .grant-details {
                flex-direction: column;
                gap: 10px;
            }
            
            .grant-amount {
                margin-left: 0;
            }
            
            .grant-actions {
                flex-direction: column;
                gap: 10px;
                align-items: stretch;
            }
        }
    `;
}

// ============================================================================
// CALCULATOR INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Initialize grants system for calculator
 * @param {string} calculatorId - Calculator identifier
 * @param {string} defaultRegion - Default region for grants
 */
function initializeGrantsSystem(calculatorId, defaultRegion = 'uk.england') {
    console.log(`🏛️ Initializing grants system for ${calculatorId} with region ${defaultRegion}`);
    
    // Add CSS styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = getGrantsCSS();
    document.head.appendChild(styleSheet);
    
    // Set default region
    window.currentGrantsRegion = defaultRegion;
    
    // Initialize grants display
    updateGrantsDisplay();
    
    console.log('✅ Grants system initialized successfully');
}

/**
 * Update grants display for current product
 * @param {Object} product - Product object
 * @param {string} region - Region code
 */
function updateGrantsDisplay(product = null, region = null) {
    const currentRegion = region || window.currentGrantsRegion || 'uk.england';
    
    if (!product) {
        console.log('No product provided for grants display');
        return;
    }
    
    const applicableGrants = getApplicableGrants(
        product.category, 
        product.subcategory, 
        currentRegion
    );
    
    const grantsHtml = formatGrantsDisplay(applicableGrants, currentRegion);
    
    // Update grants section if it exists
    const grantsSection = document.querySelector('.grants-section');
    if (grantsSection) {
        grantsSection.innerHTML = `
            <h3><i class="fas fa-gift"></i> Available Government Grants & Incentives</h3>
            <div class="grants-content">
                <div class="grants-for-current">
                    <h4>Grants for Current Product (${product.name})</h4>
                    ${grantsHtml}
                </div>
            </div>
        `;
    }
    
    return applicableGrants;
}

/**
 * Get grants for calculator integration
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Grants data for calculator
 */
function getGrantsForCalculator(product, region = null) {
    const currentRegion = region || window.currentGrantsRegion || 'uk.england';
    const applicableGrants = getApplicableGrants(
        product.category, 
        product.subcategory, 
        currentRegion
    );
    
    const totalAmount = calculateTotalGrantAmount(
        product.category, 
        product.subcategory, 
        currentRegion
    );
    
    return {
        grants: applicableGrants,
        totalAmount: totalAmount,
        currency: applicableGrants[0]?.currency || 'EUR',
        region: currentRegion,
        count: applicableGrants.length
    };
}

// ============================================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMPREHENSIVE_GRANTS_DATABASE,
        getGrantsByRegion,
        getGrantsByCategory,
        getGrantsBySubcategory,
        getAllRegions,
        getGrantsStatistics,
        searchGrants,
        getApplicableGrants,
        calculateTotalGrantAmount,
        formatGrantsDisplay,
        getGrantsCSS,
        initializeGrantsSystem,
        updateGrantsDisplay,
        getGrantsForCalculator
    };
}

// Export for browser/ES6 modules
if (typeof window !== 'undefined') {
    window.COMPREHENSIVE_GRANTS_DATABASE = COMPREHENSIVE_GRANTS_DATABASE;
    window.getGrantsByRegion = getGrantsByRegion;
    window.getGrantsByCategory = getGrantsByCategory;
    window.getGrantsBySubcategory = getGrantsBySubcategory;
    window.getAllRegions = getAllRegions;
    window.getGrantsStatistics = getGrantsStatistics;
    window.searchGrants = searchGrants;
    window.getApplicableGrants = getApplicableGrants;
    window.calculateTotalGrantAmount = calculateTotalGrantAmount;
    window.formatGrantsDisplay = formatGrantsDisplay;
    window.getGrantsCSS = getGrantsCSS;
    window.initializeGrantsSystem = initializeGrantsSystem;
    window.updateGrantsDisplay = updateGrantsDisplay;
    window.getGrantsForCalculator = getGrantsForCalculator;
}

// ============================================================================
// DATABASE INFORMATION
// ============================================================================

console.log('🏛️ Comprehensive Government Grants & Schemes System Loaded Successfully');
console.log('📊 Database Statistics:', getGrantsStatistics());
console.log('🌍 Available Regions:', getAllRegions().map(r => r.name).join(', '));
console.log('🔗 Available Functions:', Object.keys({
    getGrantsByRegion,
    getGrantsByCategory,
    getGrantsBySubcategory,
    getAllRegions,
    getGrantsStatistics,
    searchGrants,
    getApplicableGrants,
    calculateTotalGrantAmount,
    formatGrantsDisplay,
    getGrantsCSS,
    initializeGrantsSystem,
    updateGrantsDisplay,
    getGrantsForCalculator
}));

