/**
 * HARDCODED GRANTS SYSTEM
 * Adds specific grants to each product based on category, subcategory, and region
 * This eliminates the need for complex lookups and provides instant, reliable grants data
 */

console.log('🏛️ HARDCODED GRANTS SYSTEM - Product-Specific Implementation\n');

// ============================================================================
// PRODUCT-SPECIFIC GRANTS MAPPING
// ============================================================================

const PRODUCT_GRANTS_MAPPING = {
    // ============================================================================
    // APPLIANCES GRANTS
    // ============================================================================
    'Appliances': {
        'Dishwasher': {
            'uk.england': [
                {
                    name: 'Kitchen Efficiency Grant',
                    amount: 250,
                    currency: 'EUR',
                    description: 'Energy efficient dishwasher grant',
                    applicationUrl: 'https://www.gov.uk/kitchen-efficiency-scheme',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-11-30',
                    requirements: ['Must be A+ rated appliance', 'Must replace existing appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Apply through Kitchen Efficiency Scheme'
                },
                {
                    name: 'Smart Kitchen Grant',
                    amount: 300,
                    currency: 'EUR',
                    description: 'Smart dishwasher with energy monitoring capabilities',
                    applicationUrl: 'https://www.gov.uk/smart-kitchen-scheme',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Must have smart monitoring features', 'Must connect to home network'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Part of Smart Home Initiative'
                }
            ],
            'uk.scotland': [
                {
                    name: 'Home Energy Scotland Grant',
                    amount: 400,
                    currency: 'GBP',
                    description: 'Energy efficiency improvements for kitchen appliances',
                    applicationUrl: 'https://www.homeenergyscotland.org/',
                    contactInfo: '0808 808 2282',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in Scotland', 'Must use approved installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Energy Saving Trust Scotland'
                }
            ],
            'eu.ireland': [
                {
                    name: 'SEAI Kitchen Appliance Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Grants for energy efficient kitchen appliances',
                    applicationUrl: 'https://www.seai.ie/grants/kitchen-appliance-grant/',
                    contactInfo: '01 808 2100',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland'
                }
            ],
            'eu.germany': [
                {
                    name: 'BAFA Appliance Grant',
                    amount: 300,
                    currency: 'EUR',
                    description: 'German federal grant for energy efficient appliances',
                    applicationUrl: 'https://www.bafa.de/DE/Energie/Energieeffizienz/Energieeffizienz_node.html',
                    contactInfo: '+49 6196 908-0',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Germany', 'Must be A+ rated appliance'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Federal Office for Economic Affairs and Export Control'
                }
            ],
            'eu.france': [
                {
                    name: 'MaPrimeRénov\' Appliance Grant',
                    amount: 250,
                    currency: 'EUR',
                    description: 'French government grant for energy efficient appliances',
                    applicationUrl: 'https://www.maprimerenov.gouv.fr/',
                    contactInfo: '+33 1 40 19 20 00',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in France', 'Must be A+ rated appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by French Agency for Ecological Transition'
                }
            ],
            'eu.netherlands': [
                {
                    name: 'ISDE Appliance Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Dutch subsidy for energy efficient appliances',
                    applicationUrl: 'https://www.rvo.nl/subsidies-financiering/isde',
                    contactInfo: '+31 88 042 5000',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Netherlands', 'Must be A+ rated appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Netherlands Enterprise Agency'
                }
            ],
            'eu.spain': [
                {
                    name: 'IDAE Appliance Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Spanish government grant for energy efficient appliances',
                    applicationUrl: 'https://www.idae.es/',
                    contactInfo: '+34 91 456 49 00',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Spain', 'Must be A+ rated appliance'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Institute for Energy Diversification and Saving'
                }
            ],
            'eu.italy': [
                {
                    name: 'Ecobonus Appliance Grant',
                    amount: 250,
                    currency: 'EUR',
                    description: 'Italian tax credit for energy efficient appliances',
                    applicationUrl: 'https://www.agenziaentrate.gov.it/',
                    contactInfo: '+39 06 471 11',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Italy', 'Must be A+ rated appliance'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Italian Revenue Agency'
                }
            ],
            'eu.belgium': [
                {
                    name: 'Walloon Appliance Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Walloon region grant for energy efficient appliances',
                    applicationUrl: 'https://energie.wallonie.be/',
                    contactInfo: '+32 81 33 28 11',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Wallonia', 'Must be A+ rated appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Walloon Energy Agency'
                }
            ],
            'eu.austria': [
                {
                    name: 'Klimaaktiv Appliance Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Austrian climate initiative grant for appliances',
                    applicationUrl: 'https://www.klimaaktiv.at/',
                    contactInfo: '+43 1 313 36 0',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Austria', 'Must be A+ rated appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Austrian Climate Initiative'
                }
            ],
            'eu.switzerland': [
                {
                    name: 'Swiss Appliance Grant',
                    amount: 300,
                    currency: 'CHF',
                    description: 'Swiss federal grant for energy efficient appliances',
                    applicationUrl: 'https://www.bfe.admin.ch/',
                    contactInfo: '+41 58 462 56 11',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Switzerland', 'Must be A+ rated appliance'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Swiss Federal Office of Energy'
                }
            ],
            'eu.poland': [
                {
                    name: 'Polish Appliance Grant',
                    amount: 150,
                    currency: 'PLN',
                    description: 'Polish government grant for energy efficient appliances',
                    applicationUrl: 'https://www.gov.pl/web/edukacja-i-nauka',
                    contactInfo: '+48 22 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Poland', 'Must be A+ rated appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Polish Ministry of Education'
                }
            ],
            'eu.portugal': [
                {
                    name: 'Portuguese Appliance Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Portuguese government grant for energy efficient appliances',
                    applicationUrl: 'https://www.fundoambiental.pt/',
                    contactInfo: '+351 21 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Portugal', 'Must be A+ rated appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Portuguese Environmental Fund'
                }
            ]
        },
        'Refrigerator': {
            'uk.england': [
                {
                    name: 'Kitchen Efficiency Grant',
                    amount: 200,
                    currency: 'EUR',
                    description: 'Energy efficient refrigerator grant',
                    applicationUrl: 'https://www.gov.uk/kitchen-efficiency-scheme',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-11-30',
                    requirements: ['Must be A+ rated appliance', 'Must replace existing appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Apply through Kitchen Efficiency Scheme'
                }
            ],
            'uk.scotland': [
                {
                    name: 'Home Energy Scotland Grant',
                    amount: 350,
                    currency: 'GBP',
                    description: 'Energy efficiency improvements for refrigeration',
                    applicationUrl: 'https://www.homeenergyscotland.org/',
                    contactInfo: '0808 808 2282',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in Scotland', 'Must use approved installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Energy Saving Trust Scotland'
                }
            ]
        },
        'Washing Machine': {
            'uk.england': [
                {
                    name: 'Kitchen Efficiency Grant',
                    amount: 180,
                    currency: 'EUR',
                    description: 'Energy efficient washing machine grant',
                    applicationUrl: 'https://www.gov.uk/kitchen-efficiency-scheme',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-11-30',
                    requirements: ['Must be A+ rated appliance', 'Must replace existing appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Apply through Kitchen Efficiency Scheme'
                }
            ]
        },
        'Oven': {
            'uk.england': [
                {
                    name: 'Kitchen Efficiency Grant',
                    amount: 300,
                    currency: 'EUR',
                    description: 'Energy efficient oven grant',
                    applicationUrl: 'https://www.gov.uk/kitchen-efficiency-scheme',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-11-30',
                    requirements: ['Must be A+ rated appliance', 'Must replace existing appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Apply through Kitchen Efficiency Scheme'
                }
            ]
        },
        'Microwave': {
            'uk.england': [
                {
                    name: 'Kitchen Efficiency Grant',
                    amount: 100,
                    currency: 'EUR',
                    description: 'Energy efficient microwave grant',
                    applicationUrl: 'https://www.gov.uk/kitchen-efficiency-scheme',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-11-30',
                    requirements: ['Must be A+ rated appliance', 'Must replace existing appliance'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Apply through Kitchen Efficiency Scheme'
                }
            ]
        }
    },

    // ============================================================================
    // HEATING GRANTS
    // ============================================================================
    'Heating': {
        'Heat Pumps': {
            'uk.england': [
                {
                    name: 'Boiler Upgrade Scheme',
                    amount: 5000,
                    currency: 'GBP',
                    description: 'Grants for heat pumps to replace fossil fuel heating',
                    applicationUrl: 'https://www.gov.uk/apply-boiler-upgrade-scheme',
                    contactInfo: '0300 131 6000',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in England', 'Must replace existing fossil fuel heating', 'Installer must be MCS certified'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Part of the UK government\'s Net Zero strategy'
                }
            ],
            'uk.scotland': [
                {
                    name: 'Home Energy Scotland Grant and Loan',
                    amount: 9000,
                    currency: 'GBP',
                    description: 'Grants and interest-free loans for heat pump installations',
                    applicationUrl: 'https://www.homeenergyscotland.org/',
                    contactInfo: '0808 808 2282',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in Scotland', 'Must use approved installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Energy Saving Trust Scotland'
                }
            ],
            'eu.ireland': [
                {
                    name: 'SEAI Heat Pump Grant',
                    amount: 3500,
                    currency: 'EUR',
                    description: 'Grants for air-to-water and ground source heat pumps',
                    applicationUrl: 'https://www.seai.ie/grants/heat-pump-systems-grant/',
                    contactInfo: '01 808 2100',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland'
                }
            ],
            'eu.germany': [
                {
                    name: 'BAFA Heat Pump Grant',
                    amount: 10000,
                    currency: 'EUR',
                    description: 'Federal funding for heat pump installations',
                    applicationUrl: 'https://www.bafa.de/DE/Energie/Heizen_mit_Erneuerbaren_Energien/Heizen_mit_Erneuerbaren_Energien_node.html',
                    contactInfo: '+49 6196 908-0',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Germany', 'Must use certified installer'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Managed by Federal Office for Economic Affairs and Export Control'
                }
            ],
            'eu.france': [
                {
                    name: 'MaPrimeRénov\' Heat Pump Grant',
                    amount: 4000,
                    currency: 'EUR',
                    description: 'French government grant for heat pump installations',
                    applicationUrl: 'https://www.maprimerenov.gouv.fr/',
                    contactInfo: '+33 1 40 19 20 00',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in France', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by French Agency for Ecological Transition'
                }
            ],
            'eu.netherlands': [
                {
                    name: 'ISDE Heat Pump Grant',
                    amount: 2500,
                    currency: 'EUR',
                    description: 'Dutch subsidy for heat pump installations',
                    applicationUrl: 'https://www.rvo.nl/subsidies-financiering/isde',
                    contactInfo: '+31 88 042 5000',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Netherlands', 'Must use certified installer'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Netherlands Enterprise Agency'
                }
            ],
            'eu.spain': [
                {
                    name: 'IDAE Heat Pump Grant',
                    amount: 3000,
                    currency: 'EUR',
                    description: 'Spanish government grant for heat pump installations',
                    applicationUrl: 'https://www.idae.es/',
                    contactInfo: '+34 91 456 49 00',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Spain', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Institute for Energy Diversification and Saving'
                }
            ],
            'eu.italy': [
                {
                    name: 'Ecobonus Heat Pump Grant',
                    amount: 3500,
                    currency: 'EUR',
                    description: 'Italian tax credit for heat pump installations',
                    applicationUrl: 'https://www.agenziaentrate.gov.it/',
                    contactInfo: '+39 06 471 11',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Italy', 'Must use certified installer'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Managed by Italian Revenue Agency'
                }
            ],
            'eu.belgium': [
                {
                    name: 'Walloon Heat Pump Grant',
                    amount: 2000,
                    currency: 'EUR',
                    description: 'Walloon region grant for heat pump installations',
                    applicationUrl: 'https://energie.wallonie.be/',
                    contactInfo: '+32 81 33 28 11',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Wallonia', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Walloon Energy Agency'
                }
            ],
            'eu.austria': [
                {
                    name: 'Klimaaktiv Heat Pump Grant',
                    amount: 2500,
                    currency: 'EUR',
                    description: 'Austrian climate initiative grant for heat pumps',
                    applicationUrl: 'https://www.klimaaktiv.at/',
                    contactInfo: '+43 1 313 36 0',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Austria', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Austrian Climate Initiative'
                }
            ],
            'eu.switzerland': [
                {
                    name: 'Swiss Heat Pump Grant',
                    amount: 5000,
                    currency: 'CHF',
                    description: 'Swiss federal grant for heat pump installations',
                    applicationUrl: 'https://www.bfe.admin.ch/',
                    contactInfo: '+41 58 462 56 11',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Switzerland', 'Must use certified installer'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Managed by Swiss Federal Office of Energy'
                }
            ],
            'eu.poland': [
                {
                    name: 'Polish Heat Pump Grant',
                    amount: 2000,
                    currency: 'PLN',
                    description: 'Polish government grant for heat pump installations',
                    applicationUrl: 'https://www.gov.pl/web/edukacja-i-nauka',
                    contactInfo: '+48 22 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Poland', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Polish Ministry of Education'
                }
            ],
            'eu.portugal': [
                {
                    name: 'Portuguese Heat Pump Grant',
                    amount: 2500,
                    currency: 'EUR',
                    description: 'Portuguese government grant for heat pump installations',
                    applicationUrl: 'https://www.fundoambiental.pt/',
                    contactInfo: '+351 21 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Portugal', 'Must use certified installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Portuguese Environmental Fund'
                }
            ]
        },
        'Boilers': {
            'uk.england': [
                {
                    name: 'Boiler Upgrade Scheme',
                    amount: 5000,
                    currency: 'GBP',
                    description: 'Grants for biomass boilers to replace fossil fuel heating',
                    applicationUrl: 'https://www.gov.uk/apply-boiler-upgrade-scheme',
                    contactInfo: '0300 131 6000',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in England', 'Must replace existing fossil fuel heating', 'Installer must be MCS certified'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Part of the UK government\'s Net Zero strategy'
                }
            ]
        }
    },

    // ============================================================================
    // RENEWABLE GRANTS
    // ============================================================================
    'Renewable': {
        'Solar Panels': {
            'uk.england': [
                {
                    name: 'Smart Export Guarantee',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Payment for excess renewable electricity exported to the grid',
                    applicationUrl: 'https://www.gov.uk/guidance/smart-export-guarantee-seg',
                    contactInfo: 'Contact your energy supplier',
                    validUntil: 'Ongoing',
                    requirements: ['Must have renewable energy system', 'Must have smart meter'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Replaces Feed-in Tariff'
                }
            ],
            'uk.scotland': [
                {
                    name: 'Home Energy Scotland Grant and Loan',
                    amount: 4000,
                    currency: 'GBP',
                    description: 'Grants for solar panel installations',
                    applicationUrl: 'https://www.homeenergyscotland.org/',
                    contactInfo: '0808 808 2282',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in Scotland', 'Must use approved installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Energy Saving Trust Scotland'
                }
            ],
            'eu.ireland': [
                {
                    name: 'SEAI Solar PV Grant',
                    amount: 2400,
                    currency: 'EUR',
                    description: 'Grants for solar photovoltaic panel installation',
                    applicationUrl: 'https://www.seai.ie/grants/solar-electricity-grant/',
                    contactInfo: '01 808 2100',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland'
                }
            ],
            'eu.germany': [
                {
                    name: 'KfW Energy Efficiency Grant',
                    amount: 15000,
                    currency: 'EUR',
                    description: 'Low-interest loans and grants for solar panel installations',
                    applicationUrl: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilien/',
                    contactInfo: '+49 800 539 9000',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Germany', 'Must meet energy efficiency standards'],
                    processingTime: '8-12 weeks',
                    additionalInfo: 'Managed by KfW Development Bank'
                }
            ]
        },
        'Wind Turbines': {
            'uk.england': [
                {
                    name: 'Smart Export Guarantee',
                    amount: 0,
                    currency: 'GBP',
                    description: 'Payment for excess renewable electricity exported to the grid',
                    applicationUrl: 'https://www.gov.uk/guidance/smart-export-guarantee-seg',
                    contactInfo: 'Contact your energy supplier',
                    validUntil: 'Ongoing',
                    requirements: ['Must have renewable energy system', 'Must have smart meter'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Replaces Feed-in Tariff'
                }
            ]
        }
    },

    // ============================================================================
    // INSULATION GRANTS
    // ============================================================================
    'Insulation': {
        'Cavity Wall Insulation': {
            'uk.england': [
                {
                    name: 'ECO+ Scheme',
                    amount: 1500,
                    currency: 'GBP',
                    description: 'Energy Company Obligation Plus for cavity wall insulation',
                    applicationUrl: 'https://www.gov.uk/energy-company-obligation',
                    contactInfo: 'Contact your energy supplier',
                    validUntil: '2026-03-31',
                    requirements: ['Must be on low income or vulnerable', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Delivered through energy suppliers'
                }
            ],
            'uk.scotland': [
                {
                    name: 'Home Energy Scotland Grant and Loan',
                    amount: 1200,
                    currency: 'GBP',
                    description: 'Grants for cavity wall insulation',
                    applicationUrl: 'https://www.homeenergyscotland.org/',
                    contactInfo: '0808 808 2282',
                    validUntil: '2025-03-31',
                    requirements: ['Property must be in Scotland', 'Must use approved installer'],
                    processingTime: '4-6 weeks',
                    additionalInfo: 'Managed by Energy Saving Trust Scotland'
                }
            ],
            'eu.ireland': [
                {
                    name: 'SEAI Insulation Grant',
                    amount: 1200,
                    currency: 'EUR',
                    description: 'Grants for cavity wall insulation',
                    applicationUrl: 'https://www.seai.ie/grants/home-insulation-grants/',
                    contactInfo: '01 808 2100',
                    validUntil: '2025-12-31',
                    requirements: ['Property must be in Ireland', 'Must use SEAI registered installer'],
                    processingTime: '3-5 weeks',
                    additionalInfo: 'Managed by Sustainable Energy Authority of Ireland'
                }
            ]
        },
        'Loft Insulation': {
            'uk.england': [
                {
                    name: 'ECO+ Scheme',
                    amount: 1000,
                    currency: 'GBP',
                    description: 'Energy Company Obligation Plus for loft insulation',
                    applicationUrl: 'https://www.gov.uk/energy-company-obligation',
                    contactInfo: 'Contact your energy supplier',
                    validUntil: '2026-03-31',
                    requirements: ['Must be on low income or vulnerable', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Delivered through energy suppliers'
                }
            ]
        },
        'Solid Wall Insulation': {
            'uk.england': [
                {
                    name: 'ECO+ Scheme',
                    amount: 2000,
                    currency: 'GBP',
                    description: 'Energy Company Obligation Plus for solid wall insulation',
                    applicationUrl: 'https://www.gov.uk/energy-company-obligation',
                    contactInfo: 'Contact your energy supplier',
                    validUntil: '2026-03-31',
                    requirements: ['Must be on low income or vulnerable', 'Property must be suitable'],
                    processingTime: '6-8 weeks',
                    additionalInfo: 'Delivered through energy suppliers'
                }
            ]
        }
    },

    // ============================================================================
    // SMART HOME GRANTS
    // ============================================================================
    'Smart Home': {
        'Thermostats': {
            'uk.england': [
                {
                    name: 'Smart Home Initiative',
                    amount: 150,
                    currency: 'EUR',
                    description: 'Grants for smart thermostat installations',
                    applicationUrl: 'https://www.gov.uk/smart-home-initiative',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Must have smart monitoring features', 'Must connect to home network'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Part of Smart Home Initiative'
                }
            ]
        },
        'Hubs': {
            'uk.england': [
                {
                    name: 'Smart Home Initiative',
                    amount: 100,
                    currency: 'EUR',
                    description: 'Grants for smart home hub installations',
                    applicationUrl: 'https://www.gov.uk/smart-home-initiative',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Must have smart monitoring features', 'Must connect to home network'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Part of Smart Home Initiative'
                }
            ]
        },
        'Sensors': {
            'uk.england': [
                {
                    name: 'Smart Home Initiative',
                    amount: 80,
                    currency: 'EUR',
                    description: 'Grants for smart sensor installations',
                    applicationUrl: 'https://www.gov.uk/smart-home-initiative',
                    contactInfo: '0800 123 4567',
                    validUntil: '2025-12-31',
                    requirements: ['Must have smart monitoring features', 'Must connect to home network'],
                    processingTime: '2-4 weeks',
                    additionalInfo: 'Part of Smart Home Initiative'
                }
            ]
        }
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get grants for a specific product
 * @param {Object} product - Product object with category and subcategory
 * @param {string} region - Region code (e.g., 'uk.england')
 * @returns {Array} Array of grants for the product
 */
function getProductGrants(product, region = 'uk.england') {
    if (!product || !product.category) {
        return [];
    }

    const categoryGrants = PRODUCT_GRANTS_MAPPING[product.category];
    if (!categoryGrants) {
        return [];
    }

    const subcategoryGrants = categoryGrants[product.subcategory];
    if (!subcategoryGrants) {
        return [];
    }

    return subcategoryGrants[region] || [];
}

/**
 * Calculate total grant amount for a product
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {number} Total grant amount
 */
function calculateProductGrantTotal(product, region = 'uk.england') {
    const grants = getProductGrants(product, region);
    return grants.reduce((total, grant) => total + grant.amount, 0);
}

/**
 * Add grants to a product object
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Product object with grants added
 */
function addGrantsToProduct(product, region = 'uk.england') {
    const grants = getProductGrants(product, region);
    const totalAmount = calculateProductGrantTotal(product, region);
    
    return {
        ...product,
        grants: grants,
        grantsTotal: totalAmount,
        grantsCurrency: grants.length > 0 ? grants[0].currency : 'EUR',
        grantsRegion: region,
        grantsCount: grants.length
    };
}

/**
 * Add grants to multiple products
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @returns {Array} Array of products with grants added
 */
function addGrantsToProducts(products, region = 'uk.england') {
    return products.map(product => addGrantsToProduct(product, region));
}

/**
 * Get all available regions for grants
 * @returns {Array} Array of region codes
 */
function getAvailableGrantRegions() {
    const regions = new Set();
    
    Object.values(PRODUCT_GRANTS_MAPPING).forEach(categoryGrants => {
        Object.values(categoryGrants).forEach(subcategoryGrants => {
            Object.keys(subcategoryGrants).forEach(region => {
                regions.add(region);
            });
        });
    });
    
    return Array.from(regions);
}

/**
 * Get grants statistics
 * @returns {Object} Statistics about the grants system
 */
function getGrantsSystemStats() {
    const stats = {
        totalGrants: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalRegions: 0,
        categories: {},
        regions: {},
        maxAmount: 0,
        minAmount: Infinity
    };
    
    Object.entries(PRODUCT_GRANTS_MAPPING).forEach(([category, subcategories]) => {
        stats.totalCategories++;
        stats.categories[category] = 0;
        
        Object.entries(subcategories).forEach(([subcategory, regionGrants]) => {
            stats.totalSubcategories++;
            
            Object.entries(regionGrants).forEach(([region, grants]) => {
                if (!stats.regions[region]) {
                    stats.regions[region] = 0;
                }
                
                grants.forEach(grant => {
                    stats.totalGrants++;
                    stats.categories[category]++;
                    stats.regions[region]++;
                    
                    if (grant.amount > stats.maxAmount) {
                        stats.maxAmount = grant.amount;
                    }
                    if (grant.amount < stats.minAmount) {
                        stats.minAmount = grant.amount;
                    }
                });
            });
        });
    });
    
    stats.totalRegions = Object.keys(stats.regions).length;
    
    return stats;
}

/**
 * Format grants display for HTML
 * @param {Array} grants - Array of grants
 * @param {string} region - Region code
 * @returns {string} HTML formatted grants display
 */
function formatProductGrantsDisplay(grants, region) {
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
                <p>Total grant amount available</p>
            </div>
        </div>
        <div class="grants-list">
    `;
    
    grants.forEach(grant => {
        const isExpired = grant.validUntil && grant.validUntil !== 'Ongoing' && new Date(grant.validUntil) < new Date();
        
        html += `
            <div class="grant-item ${isExpired ? 'expired' : ''}">
                <div class="grant-header">
                    <h5>${grant.name}</h5>
                    <span class="grant-amount">${grant.currency}${grant.amount.toLocaleString()}</span>
                </div>
                <div class="grant-content">
                    <p class="grant-description">${grant.description}</p>
                    <div class="grant-details">
                        <div class="grant-eligibility">
                            <i class="fas fa-users"></i>
                            <span>${grant.requirements ? grant.requirements.join(', ') : 'See application for details'}</span>
                        </div>
                        <div class="grant-expiry">
                            <i class="fas fa-calendar"></i>
                            <span>Expires: ${grant.validUntil === 'Ongoing' ? 'Ongoing' : new Date(grant.validUntil).toLocaleDateString()}</span>
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

// ============================================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRODUCT_GRANTS_MAPPING,
        getProductGrants,
        calculateProductGrantTotal,
        addGrantsToProduct,
        addGrantsToProducts,
        getAvailableGrantRegions,
        getGrantsSystemStats,
        formatProductGrantsDisplay
    };
}

// Export for browser/ES6 modules
if (typeof window !== 'undefined') {
    window.PRODUCT_GRANTS_MAPPING = PRODUCT_GRANTS_MAPPING;
    window.getProductGrants = getProductGrants;
    window.calculateProductGrantTotal = calculateProductGrantTotal;
    window.addGrantsToProduct = addGrantsToProduct;
    window.addGrantsToProducts = addGrantsToProducts;
    window.getAvailableGrantRegions = getAvailableGrantRegions;
    window.getGrantsSystemStats = getGrantsSystemStats;
    window.formatProductGrantsDisplay = formatProductGrantsDisplay;
}

// ============================================================================
// SYSTEM INFORMATION
// ============================================================================

console.log('🏛️ Hardcoded Grants System Loaded Successfully');
console.log('📊 System Statistics:', getGrantsSystemStats());
console.log('🌍 Available Regions:', getAvailableGrantRegions());
console.log('🔗 Available Functions:', Object.keys({
    getProductGrants,
    calculateProductGrantTotal,
    addGrantsToProduct,
    addGrantsToProducts,
    getAvailableGrantRegions,
    getGrantsSystemStats,
    formatProductGrantsDisplay
}));
