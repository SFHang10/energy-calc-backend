/**
 * COLLECTION AGENCIES & RECYCLING INCENTIVES SYSTEM
 * Matches products with agencies who pay for or collect old appliances for recycling
 * Supports circular economy by incentivizing proper disposal and recycling
 */

console.log('♻️ COLLECTION AGENCIES & RECYCLING INCENTIVES SYSTEM\n');

// ============================================================================
// COLLECTION AGENCIES DATABASE
// ============================================================================

const COLLECTION_AGENCIES_DATABASE = {
    // ============================================================================
    // UK ENGLAND AGENCIES
    // ============================================================================
    'uk.england': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Currys PC World Trade-In',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 50,
                    currency: 'GBP',
                    description: 'Trade in your old dishwasher for cash when buying new energy-efficient model',
                    requirements: ['Must be working condition', 'Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Nationwide',
                    contactInfo: '0800 123 4567',
                    website: 'https://www.currys.co.uk/trade-in',
                    processingTime: 'Same day collection',
                    additionalBenefits: ['Free delivery of new appliance', 'Professional installation available'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished or recycled components'
                },
                {
                    agencyName: 'AO.com Recycling Service',
                    agencyType: 'Online Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Discount Voucher',
                    incentiveAmount: 75,
                    currency: 'GBP',
                    description: 'Get discount voucher for recycling old dishwasher through AO.com',
                    requirements: ['Must be 3+ years old', 'Must book collection online'],
                    collectionArea: 'England & Wales',
                    contactInfo: '0800 123 7890',
                    website: 'https://www.ao.com/recycling',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused in manufacturing'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'John Lewis Partnership',
                    agencyType: 'Department Store',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 100,
                    currency: 'GBP',
                    description: 'Receive store credit for old refrigerator collection',
                    requirements: ['Must be 4+ years old', 'Must be in working condition'],
                    collectionArea: 'England',
                    contactInfo: '0345 604 9049',
                    website: 'https://www.johnlewis.com/recycling',
                    processingTime: '1-2 days',
                    additionalBenefits: ['Free delivery of replacement', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'Argos Recycling Program',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Points Reward',
                    incentiveAmount: 500,
                    currency: 'Points',
                    description: 'Earn Argos points for recycling old refrigerator',
                    requirements: ['Must be 3+ years old', 'Must have Argos account'],
                    collectionArea: 'Nationwide',
                    contactInfo: '0345 640 2020',
                    website: 'https://www.argos.co.uk/recycling',
                    processingTime: '3-5 days',
                    additionalBenefits: ['Points can be used for future purchases', 'Free collection'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'Medium - Components recycled'
                }
            ],
            'Washing Machine': [
                {
                    agencyName: 'Samsung Trade-In Program',
                    agencyType: 'Manufacturer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 80,
                    currency: 'GBP',
                    description: 'Trade in any brand washing machine for cash payment',
                    requirements: ['Must be 4+ years old', 'Must purchase Samsung appliance'],
                    collectionArea: 'England',
                    contactInfo: '0330 726 7864',
                    website: 'https://www.samsung.com/uk/trade-in',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free installation', 'Extended warranty'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for developing markets'
                },
                {
                    agencyName: 'Local Council Collection',
                    agencyType: 'Government',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'No Cost',
                    incentiveAmount: 0,
                    currency: 'GBP',
                    description: 'Free collection of old washing machines by local council',
                    requirements: ['Must be resident', 'Must book collection'],
                    collectionArea: 'Local Authority Areas',
                    contactInfo: 'Contact local council',
                    website: 'https://www.gov.uk/report-waste',
                    processingTime: '1-2 weeks',
                    additionalBenefits: ['Completely free', 'Environmentally responsible'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Proper recycling process'
                }
            ],
            'Oven': [
                {
                    agencyName: 'B&Q Recycling Service',
                    agencyType: 'DIY Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Discount Voucher',
                    incentiveAmount: 60,
                    currency: 'GBP',
                    description: 'Get discount voucher for recycling old oven',
                    requirements: ['Must be 5+ years old', 'Must purchase new oven'],
                    collectionArea: 'England',
                    contactInfo: '0333 014 3000',
                    website: 'https://www.diy.com/recycling',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free delivery', 'Installation service available'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'Medium - Metal components recycled'
                }
            ],
            'Microwave': [
                {
                    agencyName: 'Tesco Recycling Program',
                    agencyType: 'Supermarket',
                    collectionMethod: 'Drop-off',
                    incentiveType: 'Clubcard Points',
                    incentiveAmount: 200,
                    currency: 'Points',
                    description: 'Earn Clubcard points for recycling old microwave',
                    requirements: ['Must have Clubcard', 'Must be working condition'],
                    collectionArea: 'Nationwide',
                    contactInfo: '0800 505 555',
                    website: 'https://www.tesco.com/recycling',
                    processingTime: 'Immediate',
                    additionalBenefits: ['Points for future shopping', 'Convenient drop-off'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'Medium - Components recycled'
                }
            ]
        },
        'Heating': {
            'Heat Pumps': [
                {
                    agencyName: 'British Gas Recycling Service',
                    agencyType: 'Energy Company',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Energy Bill Credit',
                    incentiveAmount: 150,
                    currency: 'GBP',
                    description: 'Get energy bill credit for recycling old heating equipment',
                    requirements: ['Must be British Gas customer', 'Must be 5+ years old'],
                    collectionArea: 'England',
                    contactInfo: '0333 202 9802',
                    website: 'https://www.britishgas.co.uk/recycling',
                    processingTime: '1 week',
                    additionalBenefits: ['Free collection', 'Energy efficiency advice'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refrigerant properly recovered'
                }
            ],
            'Boilers': [
                {
                    agencyName: 'Worcester Bosch Trade-In',
                    agencyType: 'Manufacturer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 200,
                    currency: 'GBP',
                    description: 'Trade in old boiler for cash payment',
                    requirements: ['Must be 8+ years old', 'Must purchase Worcester Bosch boiler'],
                    collectionArea: 'England',
                    contactInfo: '0330 123 4567',
                    website: 'https://www.worcester-bosch.co.uk/trade-in',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free installation', 'Extended warranty'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Metal components recycled'
                }
            ]
        },
        'Renewable': {
            'Solar Panels': [
                {
                    agencyName: 'Solar Trade Association',
                    agencyType: 'Industry Body',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 300,
                    currency: 'GBP',
                    description: 'Get cash payment for old solar panel collection',
                    requirements: ['Must be 10+ years old', 'Must be in working condition'],
                    collectionArea: 'England',
                    contactInfo: '020 7925 3570',
                    website: 'https://www.solar-trade.org.uk/recycling',
                    processingTime: '1 week',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Silicon and metals recovered'
                }
            ]
        }
    },

    // ============================================================================
    // UK SCOTLAND AGENCIES
    // ============================================================================
    'uk.scotland': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Arnold Clark Recycling',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 45,
                    currency: 'GBP',
                    description: 'Cash payment for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Scotland',
                    contactInfo: '0141 272 2000',
                    website: 'https://www.arnoldclark.com/recycling',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Professional service'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Edinburgh Council Collection',
                    agencyType: 'Local Authority',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'No Cost',
                    incentiveAmount: 0,
                    currency: 'GBP',
                    description: 'Free collection of old refrigerators by council',
                    requirements: ['Must be Edinburgh resident', 'Must book collection'],
                    collectionArea: 'Edinburgh',
                    contactInfo: '0131 200 2000',
                    website: 'https://www.edinburgh.gov.uk/recycling',
                    processingTime: '1-2 weeks',
                    additionalBenefits: ['Completely free', 'Environmentally responsible'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Proper recycling process'
                }
            ]
        }
    },

    // ============================================================================
    // IRELAND AGENCIES
    // ============================================================================
    'eu.ireland': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Harvey Norman Trade-In',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 60,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Ireland',
                    contactInfo: '01 882 2000',
                    website: 'https://www.harveynorman.ie/trade-in',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Power City Recycling',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 80,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Ireland',
                    contactInfo: '01 450 9000',
                    website: 'https://www.powercity.ie/recycling',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ]
        }
    },

    // ============================================================================
    // GERMANY AGENCIES
    // ============================================================================
    'eu.germany': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'MediaMarkt Trade-In',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 70,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Germany',
                    contactInfo: '+49 800 123 4567',
                    website: 'https://www.mediamarkt.de/trade-in',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Saturn Recycling Program',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 90,
                    currency: 'EUR',
                    description: 'Store credit for old refrigerator collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Germany',
                    contactInfo: '+49 800 123 7890',
                    website: 'https://www.saturn.de/recycling',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ]
        }
    },

    // ============================================================================
    // FRANCE AGENCIES
    // ============================================================================
    'eu.france': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Darty Reprise',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 60,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'France',
                    contactInfo: '+33 1 40 19 20 00',
                    website: 'https://www.darty.com/reprise',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'Boulanger Eco-Reprise',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 80,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'France',
                    contactInfo: '+33 1 40 19 20 00',
                    website: 'https://www.boulanger.com/eco-reprise',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'FNAC Reprise',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 100,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'France',
                    contactInfo: '+33 1 40 19 20 00',
                    website: 'https://www.fnac.com/reprise',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ],
            'Washing Machine': [
                {
                    agencyName: 'LDLC Reprise',
                    agencyType: 'Online Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 70,
                    currency: 'EUR',
                    description: 'Store credit for old washing machine collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'France',
                    contactInfo: '+33 4 72 18 18 18',
                    website: 'https://www.ldlc.com/reprise',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ]
        }
    },

    // ============================================================================
    // NETHERLANDS AGENCIES
    // ============================================================================
    'eu.netherlands': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Coolblue Inruil',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 65,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Netherlands',
                    contactInfo: '+31 20 261 00 00',
                    website: 'https://www.coolblue.nl/inruil',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'MediaMarkt Inruil',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 75,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Netherlands',
                    contactInfo: '+31 20 261 00 00',
                    website: 'https://www.mediamarkt.nl/inruil',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Bol.com Inruil',
                    agencyType: 'Online Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 85,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Netherlands',
                    contactInfo: '+31 20 261 00 00',
                    website: 'https://www.bol.com/inruil',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // SPAIN AGENCIES
    // ============================================================================
    'eu.spain': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'El Corte Inglés Recogida',
                    agencyType: 'Department Store',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 55,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Spain',
                    contactInfo: '+34 91 432 00 00',
                    website: 'https://www.elcorteingles.es/recogida',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'MediaMarkt Recogida',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 70,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Spain',
                    contactInfo: '+34 91 432 00 00',
                    website: 'https://www.mediamarkt.es/recogida',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Carrefour Recogida',
                    agencyType: 'Supermarket',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 80,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Spain',
                    contactInfo: '+34 91 432 00 00',
                    website: 'https://www.carrefour.es/recogida',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // ITALY AGENCIES
    // ============================================================================
    'eu.italy': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Euronics Ritiro',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 60,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Italy',
                    contactInfo: '+39 02 123 4567',
                    website: 'https://www.euronics.it/ritiro',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'MediaWorld Ritiro',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 75,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Italy',
                    contactInfo: '+39 02 123 4567',
                    website: 'https://www.mediaworld.it/ritiro',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Unieuro Ritiro',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 90,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Italy',
                    contactInfo: '+39 02 123 4567',
                    website: 'https://www.unieuro.it/ritiro',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // BELGIUM AGENCIES
    // ============================================================================
    'eu.belgium': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Vanden Borre Inruil',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 65,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Belgium',
                    contactInfo: '+32 2 123 4567',
                    website: 'https://www.vandenborre.be/inruil',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'MediaMarkt Inruil',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 70,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Belgium',
                    contactInfo: '+32 2 123 4567',
                    website: 'https://www.mediamarkt.be/inruil',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Krefel Inruil',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 85,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Belgium',
                    contactInfo: '+32 2 123 4567',
                    website: 'https://www.krefel.be/inruil',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // AUSTRIA AGENCIES
    // ============================================================================
    'eu.austria': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'MediaMarkt Inzahlungnahme',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 70,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Austria',
                    contactInfo: '+43 1 123 4567',
                    website: 'https://www.mediamarkt.at/inzahlungnahme',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'Saturn Inzahlungnahme',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 75,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Austria',
                    contactInfo: '+43 1 123 4567',
                    website: 'https://www.saturn.at/inzahlungnahme',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Euronics Inzahlungnahme',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 90,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Austria',
                    contactInfo: '+43 1 123 4567',
                    website: 'https://www.euronics.at/inzahlungnahme',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // SWITZERLAND AGENCIES
    // ============================================================================
    'eu.switzerland': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Interdiscount Rücknahme',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 80,
                    currency: 'CHF',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Switzerland',
                    contactInfo: '+41 44 123 4567',
                    website: 'https://www.interdiscount.ch/ruecknahme',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'MediaMarkt Rücknahme',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 85,
                    currency: 'CHF',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Switzerland',
                    contactInfo: '+41 44 123 4567',
                    website: 'https://www.mediamarkt.ch/ruecknahme',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Fust Rücknahme',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 100,
                    currency: 'CHF',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Switzerland',
                    contactInfo: '+41 44 123 4567',
                    website: 'https://www.fust.ch/ruecknahme',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // POLAND AGENCIES
    // ============================================================================
    'eu.poland': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'MediaMarkt Wymiana',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 50,
                    currency: 'PLN',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Poland',
                    contactInfo: '+48 22 123 4567',
                    website: 'https://www.mediamarkt.pl/wymiana',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'RTV Euro AGD Wymiana',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 60,
                    currency: 'PLN',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Poland',
                    contactInfo: '+48 22 123 4567',
                    website: 'https://www.rtveuroagd.pl/wymiana',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'Saturn Wymiana',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 70,
                    currency: 'PLN',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Poland',
                    contactInfo: '+48 22 123 4567',
                    website: 'https://www.saturn.pl/wymiana',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    },

    // ============================================================================
    // PORTUGAL AGENCIES
    // ============================================================================
    'eu.portugal': {
        'Appliances': {
            'Dishwasher': [
                {
                    agencyName: 'Worten Retoma',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 55,
                    currency: 'EUR',
                    description: 'Cash payment for old dishwasher trade-in',
                    requirements: ['Must be 3+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Portugal',
                    contactInfo: '+351 21 123 4567',
                    website: 'https://www.worten.pt/retoma',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                },
                {
                    agencyName: 'MediaMarkt Retoma',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Store Credit',
                    incentiveAmount: 65,
                    currency: 'EUR',
                    description: 'Store credit for old dishwasher collection',
                    requirements: ['Must be 4+ years old', 'Must be working condition'],
                    collectionArea: 'Portugal',
                    contactInfo: '+351 21 123 4567',
                    website: 'https://www.mediamarkt.pt/retoma',
                    processingTime: '2-3 days',
                    additionalBenefits: ['Free collection', 'Certificate of recycling'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Components reused'
                }
            ],
            'Refrigerator': [
                {
                    agencyName: 'FNAC Retoma',
                    agencyType: 'Retailer',
                    collectionMethod: 'Free Collection',
                    incentiveType: 'Cash Payment',
                    incentiveAmount: 75,
                    currency: 'EUR',
                    description: 'Cash payment for old refrigerator collection',
                    requirements: ['Must be 5+ years old', 'Must purchase new appliance'],
                    collectionArea: 'Portugal',
                    contactInfo: '+351 21 123 4567',
                    website: 'https://www.fnac.pt/retoma',
                    processingTime: 'Same day',
                    additionalBenefits: ['Free delivery', 'Professional installation'],
                    ecoCertification: 'WEEE Compliant',
                    circularEconomyImpact: 'High - Refurbished for resale'
                }
            ]
        }
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get collection agencies for a specific product
 * @param {Object} product - Product object with category and subcategory
 * @param {string} region - Region code (e.g., 'uk.england')
 * @returns {Array} Array of collection agencies for the product
 */
function getCollectionAgencies(product, region = 'uk.england') {
    if (!product || !product.category) {
        return [];
    }

    const regionAgencies = COLLECTION_AGENCIES_DATABASE[region];
    if (!regionAgencies) {
        return [];
    }

    const categoryAgencies = regionAgencies[product.category];
    if (!categoryAgencies) {
        return [];
    }

    return categoryAgencies[product.subcategory] || [];
}

/**
 * Calculate total incentive value for a product
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {number} Total incentive value
 */
function calculateCollectionIncentiveTotal(product, region = 'uk.england') {
    const agencies = getCollectionAgencies(product, region);
    return agencies.reduce((total, agency) => total + agency.incentiveAmount, 0);
}

/**
 * Add collection agencies to a product object
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Product object with collection agencies added
 */
function addCollectionAgenciesToProduct(product, region = 'uk.england') {
    const agencies = getCollectionAgencies(product, region);
    const totalIncentive = calculateCollectionIncentiveTotal(product, region);
    
    return {
        ...product,
        collectionAgencies: agencies,
        collectionIncentiveTotal: totalIncentive,
        collectionCurrency: agencies.length > 0 ? agencies[0].currency : 'GBP',
        collectionRegion: region,
        collectionAgenciesCount: agencies.length
    };
}

/**
 * Get all available regions for collection agencies
 * @returns {Array} Array of region codes
 */
function getAvailableCollectionRegions() {
    return Object.keys(COLLECTION_AGENCIES_DATABASE);
}

/**
 * Get collection agencies statistics
 * @returns {Object} Statistics about the collection agencies system
 */
function getCollectionAgenciesStats() {
    const stats = {
        totalAgencies: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalRegions: 0,
        categories: {},
        regions: {},
        maxIncentive: 0,
        minIncentive: Infinity,
        agencyTypes: {}
    };
    
    Object.entries(COLLECTION_AGENCIES_DATABASE).forEach(([region, categories]) => {
        stats.totalRegions++;
        stats.regions[region] = 0;
        
        Object.entries(categories).forEach(([category, subcategories]) => {
            stats.totalCategories++;
            if (!stats.categories[category]) {
                stats.categories[category] = 0;
            }
            
            Object.entries(subcategories).forEach(([subcategory, agencies]) => {
                stats.totalSubcategories++;
                
                agencies.forEach(agency => {
                    stats.totalAgencies++;
                    stats.categories[category]++;
                    stats.regions[region]++;
                    
                    if (agency.incentiveAmount > stats.maxIncentive) {
                        stats.maxIncentive = agency.incentiveAmount;
                    }
                    if (agency.incentiveAmount < stats.minIncentive) {
                        stats.minIncentive = agency.incentiveAmount;
                    }
                    
                    if (!stats.agencyTypes[agency.agencyType]) {
                        stats.agencyTypes[agency.agencyType] = 0;
                    }
                    stats.agencyTypes[agency.agencyType]++;
                });
            });
        });
    });
    
    return stats;
}

/**
 * Format collection agencies display for HTML
 * @param {Array} agencies - Array of collection agencies
 * @param {string} region - Region code
 * @returns {string} HTML formatted collection agencies display
 */
function formatCollectionAgenciesDisplay(agencies, region) {
    if (!agencies || agencies.length === 0) {
        return `
            <div class="no-agencies-message">
                <p>No collection agencies currently available for this product in ${region}.</p>
                <p>Check back regularly as new collection programs are frequently introduced.</p>
            </div>
        `;
    }
    
    const totalIncentive = agencies.reduce((sum, agency) => sum + agency.incentiveAmount, 0);
    const currency = agencies[0]?.currency || 'GBP';
    
    let html = `
        <div class="collection-summary">
            <div class="collection-total">
                <h4>Collection Incentives Available: ${currency}${totalIncentive.toLocaleString()}</h4>
                <p>Total incentive value for old product collection</p>
            </div>
        </div>
        <div class="agencies-list">
    `;
    
    agencies.forEach(agency => {
        html += `
            <div class="agency-item">
                <div class="agency-header">
                    <h5>${agency.agencyName}</h5>
                    <span class="agency-incentive">${agency.currency}${agency.incentiveAmount.toLocaleString()}</span>
                </div>
                <div class="agency-content">
                    <p class="agency-description">${agency.description}</p>
                    <div class="agency-details">
                        <div class="agency-type">
                            <i class="fas fa-building"></i>
                            <span>${agency.agencyType}</span>
                        </div>
                        <div class="agency-method">
                            <i class="fas fa-truck"></i>
                            <span>${agency.collectionMethod}</span>
                        </div>
                        <div class="agency-area">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${agency.collectionArea}</span>
                        </div>
                        <div class="agency-time">
                            <i class="fas fa-clock"></i>
                            <span>Processing: ${agency.processingTime}</span>
                        </div>
                    </div>
                    <div class="agency-requirements">
                        <h6>Requirements:</h6>
                        <ul>
                            ${agency.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="agency-benefits">
                        <h6>Additional Benefits:</h6>
                        <ul>
                            ${agency.additionalBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="agency-actions">
                        <a href="${agency.website}" target="_blank" class="contact-btn">
                            Contact Agency <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="agency-info">
                            <i class="fas fa-phone"></i>
                            <span>${agency.contactInfo}</span>
                        </div>
                    </div>
                    <div class="eco-impact">
                        <div class="eco-certification">
                            <i class="fas fa-certificate"></i>
                            <span>${agency.ecoCertification}</span>
                        </div>
                        <div class="circular-economy">
                            <i class="fas fa-recycle"></i>
                            <span>${agency.circularEconomyImpact}</span>
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
        COLLECTION_AGENCIES_DATABASE,
        getCollectionAgencies,
        calculateCollectionIncentiveTotal,
        addCollectionAgenciesToProduct,
        getAvailableCollectionRegions,
        getCollectionAgenciesStats,
        formatCollectionAgenciesDisplay
    };
}

// Export for browser/ES6 modules
if (typeof window !== 'undefined') {
    window.COLLECTION_AGENCIES_DATABASE = COLLECTION_AGENCIES_DATABASE;
    window.getCollectionAgencies = getCollectionAgencies;
    window.calculateCollectionIncentiveTotal = calculateCollectionIncentiveTotal;
    window.addCollectionAgenciesToProduct = addCollectionAgenciesToProduct;
    window.getAvailableCollectionRegions = getAvailableCollectionRegions;
    window.getCollectionAgenciesStats = getCollectionAgenciesStats;
    window.formatCollectionAgenciesDisplay = formatCollectionAgenciesDisplay;
}

// ============================================================================
// SYSTEM INFORMATION
// ============================================================================

console.log('♻️ Collection Agencies & Recycling Incentives System Loaded Successfully');
console.log('📊 System Statistics:', getCollectionAgenciesStats());
console.log('🌍 Available Regions:', getAvailableCollectionRegions());
console.log('🔗 Available Functions:', Object.keys({
    getCollectionAgencies,
    calculateCollectionIncentiveTotal,
    addCollectionAgenciesToProduct,
    getAvailableCollectionRegions,
    getCollectionAgenciesStats,
    formatCollectionAgenciesDisplay
}));
