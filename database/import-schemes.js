/**
 * Import Schemes to MongoDB
 * Run this script to import schemes from schemes.json or embedded data
 * 
 * Usage: node database/import-schemes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Scheme = require('../models/Scheme');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment');
    process.exit(1);
}

// All schemes data (from your eu-energy-schemes.html)
const schemesData = [
    // EU-Wide Schemes
    {
        title: "EU Taxonomy Regulation",
        description: "Classification system for sustainable economic activities across the EU",
        type: "Certification",
        region: "EU-Wide",
        maxFunding: "N/A",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://ec.europa.eu/sustainable-finance-taxonomy/" },
        keywords: ["taxonomy", "sustainable", "classification", "regulation"],
        relevance: "All businesses, compliance required"
    },
    {
        title: "EU Green Deal Industrial Plan",
        description: "Support framework for clean tech manufacturing and deployment",
        type: "Grant",
        region: "EU-Wide",
        maxFunding: "€270 billion",
        deadline: "2030",
        priority: "high",
        status: "active",
        links: { apply: "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_510" },
        keywords: ["green deal", "industrial", "clean tech", "manufacturing"],
        relevance: "Clean tech manufacturers"
    },
    {
        title: "Horizon Europe - Energy Cluster",
        description: "Research and innovation funding for clean energy transitions",
        type: "Grant",
        region: "EU-Wide",
        maxFunding: "€15 billion",
        deadline: "Rolling calls",
        priority: "high",
        status: "active",
        links: { apply: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/" },
        keywords: ["horizon", "research", "innovation", "energy"],
        relevance: "Research institutions, innovative SMEs"
    },
    {
        title: "Innovation Fund",
        description: "Large-scale demonstration of innovative low-carbon technologies",
        type: "Grant",
        region: "EU-Wide",
        maxFunding: "€40 billion",
        deadline: "Annual calls",
        priority: "high",
        status: "active",
        links: { apply: "https://ec.europa.eu/clima/eu-action/funding-climate-action/innovation-fund_en" },
        keywords: ["innovation", "demonstration", "low-carbon", "technology"],
        relevance: "Large-scale project developers"
    },
    {
        title: "LIFE Programme",
        description: "EU's funding instrument for environment and climate action",
        type: "Grant",
        region: "EU-Wide",
        maxFunding: "€5.4 billion",
        deadline: "Annual calls",
        priority: "medium",
        status: "active",
        links: { apply: "https://cinea.ec.europa.eu/programmes/life_en" },
        keywords: ["LIFE", "environment", "climate", "nature"],
        relevance: "Environmental projects, climate adaptation"
    },
    
    // Netherlands Schemes
    {
        title: "ISDE - Investeringssubsidie Duurzame Energie",
        description: "Subsidy for heat pumps, solar boilers, insulation, and small wind turbines for homeowners and SMEs",
        type: "Subsidy",
        region: "Netherlands",
        maxFunding: "€2,500-€7,000",
        deadline: "2025-12-31",
        priority: "high",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/isde" },
        keywords: ["heat pump", "solar", "insulation", "residential", "SME"],
        relevance: "Homeowners and SMEs installing renewable heating"
    },
    {
        title: "SDE++ - Stimulering Duurzame Energieproductie",
        description: "Operating subsidy for large-scale renewable energy and CO2 reduction projects",
        type: "Subsidy",
        region: "Netherlands",
        maxFunding: "Variable per technology",
        deadline: "Annual rounds",
        priority: "high",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/sde" },
        keywords: ["renewable", "large-scale", "CO2", "production"],
        relevance: "Large energy producers and industrial companies"
    },
    {
        title: "EIA - Energie Investeringsaftrek",
        description: "Tax deduction for investments in energy-saving equipment and sustainable energy",
        type: "Tax Credit",
        region: "Netherlands",
        maxFunding: "45.5% tax deduction",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/eia" },
        keywords: ["tax", "investment", "energy saving", "business"],
        relevance: "Businesses investing in energy efficiency"
    },
    {
        title: "MIA/Vamil",
        description: "Environmental tax benefits for sustainable business investments",
        type: "Tax Credit",
        region: "Netherlands",
        maxFunding: "Up to 45% deduction",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/mia-vamil" },
        keywords: ["environmental", "tax", "sustainable", "investment"],
        relevance: "Businesses making environmental investments"
    },
    {
        title: "Salderingsregeling",
        description: "Net metering scheme for solar panel owners",
        type: "Feed-in Tariff",
        region: "Netherlands",
        maxFunding: "Net billing value",
        deadline: "Until 2027 (phasing out)",
        priority: "high",
        status: "expiring-soon",
        links: { apply: "https://www.rijksoverheid.nl/onderwerpen/duurzame-energie/zonne-energie" },
        keywords: ["solar", "net metering", "residential", "electricity"],
        relevance: "Solar panel owners"
    },
    {
        title: "Warmtefonds",
        description: "Low-interest loans for making homes more sustainable",
        type: "Loan",
        region: "Netherlands",
        maxFunding: "€65,000",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.warmtefonds.nl/" },
        keywords: ["loan", "home", "sustainable", "insulation", "heating"],
        relevance: "Homeowners improving energy efficiency"
    },
    {
        title: "SVVE - Subsidie Verduurzaming Verenigingen van Eigenaren",
        description: "Subsidy for housing associations to make apartment buildings more sustainable",
        type: "Subsidy",
        region: "Netherlands",
        maxFunding: "50% of costs",
        deadline: "2025",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/svve" },
        keywords: ["housing association", "apartment", "sustainable", "VvE"],
        relevance: "Housing associations (VvE)"
    },
    {
        title: "WBSO",
        description: "R&D tax credit for development of sustainable technologies",
        type: "Tax Credit",
        region: "Netherlands",
        maxFunding: "32-40% wage costs",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/wbso" },
        keywords: ["R&D", "research", "development", "innovation", "tax"],
        relevance: "Companies developing innovative sustainable tech"
    },
    {
        title: "SEEH - Subsidie Energiebesparing Eigen Huis",
        description: "Subsidy for insulation measures in owner-occupied homes",
        type: "Subsidy",
        region: "Netherlands",
        maxFunding: "€4,050",
        deadline: "2025",
        priority: "high",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/seeh" },
        keywords: ["insulation", "home", "energy saving", "residential"],
        relevance: "Homeowners adding insulation"
    },
    {
        title: "SCE - Subsidieregeling Coöperatieve Energieopwekking",
        description: "Support for cooperative renewable energy projects",
        type: "Subsidy",
        region: "Netherlands",
        maxFunding: "15-year support",
        deadline: "Annual rounds",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.rvo.nl/subsidies-financiering/sce" },
        keywords: ["cooperative", "community", "renewable", "energy"],
        relevance: "Energy cooperatives and community projects"
    },
    {
        title: "EPC Label Requirement",
        description: "Mandatory energy performance certificate for building transactions",
        type: "Certification",
        region: "Netherlands",
        maxFunding: "N/A",
        deadline: "Mandatory",
        priority: "high",
        status: "active",
        links: { apply: "https://www.ep-online.nl/" },
        keywords: ["EPC", "energy label", "building", "certification"],
        relevance: "Property owners selling or renting"
    },

    // Germany Schemes
    {
        title: "BEG - Bundesförderung für effiziente Gebäude",
        description: "Federal funding for efficient buildings - comprehensive support for energy-efficient construction and renovation",
        type: "Grant",
        region: "Germany",
        maxFunding: "Up to €150,000",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/effiziente_gebaeude_node.html" },
        keywords: ["building", "renovation", "efficient", "residential", "commercial"],
        relevance: "Property owners, developers"
    },
    {
        title: "KfW Energy Efficiency Programme",
        description: "Low-interest loans and grants for energy efficiency measures in businesses",
        type: "Loan",
        region: "Germany",
        maxFunding: "Up to €25 million",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.kfw.de/inlandsfoerderung/Unternehmen/Energie-Umwelt/" },
        keywords: ["KfW", "loan", "business", "efficiency", "industry"],
        relevance: "Businesses of all sizes"
    },
    {
        title: "EEG Feed-in Tariff",
        description: "Guaranteed payment for renewable electricity fed into the grid",
        type: "Feed-in Tariff",
        region: "Germany",
        maxFunding: "Market-based rates",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.bundesnetzagentur.de/EN/Areas/Energy/Companies/RenewableEnergy/start.html" },
        keywords: ["solar", "wind", "feed-in", "renewable", "electricity"],
        relevance: "Renewable energy producers"
    },
    {
        title: "Umweltbonus - E-Vehicle Subsidy",
        description: "Purchase subsidy for electric and plug-in hybrid vehicles",
        type: "Subsidy",
        region: "Germany",
        maxFunding: "€4,500",
        deadline: "2024 (reduced)",
        priority: "medium",
        status: "expiring-soon",
        links: { apply: "https://www.bafa.de/DE/Energie/Energieeffizienz/Elektromobilitaet/elektromobilitaet_node.html" },
        keywords: ["EV", "electric", "vehicle", "car", "mobility"],
        relevance: "Vehicle buyers, fleet operators"
    },
    {
        title: "BAFA Heat Pump Subsidy",
        description: "Direct subsidy for heat pump installation in existing buildings",
        type: "Subsidy",
        region: "Germany",
        maxFunding: "Up to 40%",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/effiziente_gebaeude_node.html" },
        keywords: ["heat pump", "heating", "residential", "BAFA"],
        relevance: "Homeowners replacing heating systems"
    },

    // Spain Schemes
    {
        title: "Plan MOVES III",
        description: "Aid program for efficient and sustainable mobility",
        type: "Subsidy",
        region: "Spain",
        maxFunding: "€7,000 for EVs",
        deadline: "2024",
        priority: "high",
        status: "active",
        links: { apply: "https://www.idae.es/ayudas-y-financiacion/para-movilidad-y-vehiculos/programa-moves-iii" },
        keywords: ["EV", "electric", "mobility", "vehicle", "charging"],
        relevance: "Vehicle buyers, businesses"
    },
    {
        title: "PREE 5000 - Building Rehabilitation",
        description: "Aid program for energy rehabilitation of buildings in municipalities under 5,000 inhabitants",
        type: "Grant",
        region: "Spain",
        maxFunding: "Up to 80%",
        deadline: "2024",
        priority: "high",
        status: "active",
        links: { apply: "https://www.idae.es/ayudas-y-financiacion/para-la-rehabilitacion-de-edificios/programa-pree-5000" },
        keywords: ["rehabilitation", "building", "rural", "energy"],
        relevance: "Small municipality residents"
    },
    {
        title: "Residential Self-Consumption Program",
        description: "Subsidies for self-consumption installations and storage in residential sector",
        type: "Subsidy",
        region: "Spain",
        maxFunding: "€600-€1,300 per kWp",
        deadline: "2024",
        priority: "high",
        status: "active",
        links: { apply: "https://www.idae.es/ayudas-y-financiacion/para-energias-renovables/programa-de-incentivos-al-autoconsumo" },
        keywords: ["solar", "self-consumption", "battery", "residential"],
        relevance: "Homeowners installing solar"
    },
    {
        title: "ICO Green Loans",
        description: "Preferential financing for sustainable investments",
        type: "Loan",
        region: "Spain",
        maxFunding: "€12.5 million",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.ico.es/ico/ico-verde" },
        keywords: ["loan", "green", "sustainable", "financing"],
        relevance: "Businesses and self-employed"
    },
    {
        title: "RD 244/2019 Self-Consumption Framework",
        description: "Regulatory framework enabling collective and individual self-consumption",
        type: "Certification",
        region: "Spain",
        maxFunding: "N/A",
        deadline: "Active regulation",
        priority: "high",
        status: "active",
        links: { info: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2019-5089" },
        keywords: ["self-consumption", "regulation", "collective", "solar"],
        relevance: "All self-consumption participants"
    },

    // Portugal Schemes
    {
        title: "Fundo Ambiental - Environmental Fund",
        description: "Various environmental support programs including energy efficiency",
        type: "Grant",
        region: "Portugal",
        maxFunding: "Variable",
        deadline: "Annual programs",
        priority: "high",
        status: "active",
        links: { apply: "https://www.fundoambiental.pt/" },
        keywords: ["environmental", "efficiency", "fund", "support"],
        relevance: "Various beneficiaries"
    },
    {
        title: "PRR - Energy Efficiency in Buildings",
        description: "Recovery and Resilience Plan funding for building energy efficiency",
        type: "Grant",
        region: "Portugal",
        maxFunding: "Up to 85%",
        deadline: "2026",
        priority: "high",
        status: "active",
        links: { apply: "https://recuperarportugal.gov.pt/" },
        keywords: ["PRR", "building", "efficiency", "renovation"],
        relevance: "Property owners, municipalities"
    },
    {
        title: "Vale Eficiência",
        description: "Energy efficiency voucher for low-income households",
        type: "Subsidy",
        region: "Portugal",
        maxFunding: "€1,300 + €700",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.fundoambiental.pt/apoios/vale-eficiencia.aspx" },
        keywords: ["voucher", "efficiency", "low-income", "household"],
        relevance: "Low-income households"
    },
    {
        title: "Incentivo pela Recuperação",
        description: "Tax incentive for urban rehabilitation",
        type: "Tax Credit",
        region: "Portugal",
        maxFunding: "Reduced VAT + IRS deduction",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { info: "https://www.portaldahabitacao.pt/" },
        keywords: ["tax", "urban", "rehabilitation", "renovation"],
        relevance: "Urban property owners"
    },
    {
        title: "PPEC - Plan for Energy Efficiency",
        description: "Electricity consumption efficiency promotion plan",
        type: "Grant",
        region: "Portugal",
        maxFunding: "Variable",
        deadline: "Biannual",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.erse.pt/atividade/eficiencia-energetica-ppec/" },
        keywords: ["electricity", "efficiency", "consumption", "promotion"],
        relevance: "Energy consumers, distributors"
    },

    // UK Schemes
    {
        title: "Boiler Upgrade Scheme",
        description: "Grants for heat pump and biomass boiler installations",
        type: "Grant",
        region: "United Kingdom",
        maxFunding: "£7,500",
        deadline: "2028",
        priority: "high",
        status: "active",
        links: { apply: "https://www.gov.uk/apply-boiler-upgrade-scheme" },
        keywords: ["heat pump", "boiler", "grant", "heating"],
        relevance: "Homeowners in England & Wales"
    },
    {
        title: "Smart Export Guarantee (SEG)",
        description: "Payment for excess renewable electricity exported to the grid",
        type: "Feed-in Tariff",
        region: "United Kingdom",
        maxFunding: "Market rates",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.ofgem.gov.uk/environmental-and-social-schemes/smart-export-guarantee-seg" },
        keywords: ["solar", "export", "electricity", "renewable"],
        relevance: "Small-scale renewable generators"
    },
    {
        title: "ECO4 - Energy Company Obligation",
        description: "Support for energy efficiency improvements in low-income households",
        type: "Grant",
        region: "United Kingdom",
        maxFunding: "Free measures",
        deadline: "2026",
        priority: "high",
        status: "active",
        links: { apply: "https://www.gov.uk/energy-company-obligation" },
        keywords: ["insulation", "heating", "low-income", "ECO"],
        relevance: "Low-income households"
    },
    {
        title: "Great British Insulation Scheme",
        description: "Free or subsidized cavity wall and loft insulation",
        type: "Subsidy",
        region: "United Kingdom",
        maxFunding: "Free installation",
        deadline: "2026",
        priority: "high",
        status: "active",
        links: { apply: "https://www.gov.uk/apply-great-british-insulation-scheme" },
        keywords: ["insulation", "cavity", "loft", "home"],
        relevance: "UK homeowners"
    },
    {
        title: "Home Upgrade Grant (HUG2)",
        description: "Energy efficiency and heating improvements for off-gas-grid homes",
        type: "Grant",
        region: "United Kingdom",
        maxFunding: "£25,000",
        deadline: "2025",
        priority: "high",
        status: "active",
        links: { apply: "https://www.gov.uk/government/collections/home-upgrade-grant" },
        keywords: ["off-grid", "heating", "efficiency", "rural"],
        relevance: "Off-gas-grid homeowners"
    },
    {
        title: "Welsh Nest Scheme",
        description: "Free energy efficiency improvements for Welsh households - Wales",
        type: "Grant",
        region: "United Kingdom",
        maxFunding: "Free measures",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://nest.gov.wales/" },
        keywords: ["Wales", "efficiency", "free", "heating"],
        relevance: "Welsh residents"
    },
    {
        title: "Scottish Warmer Homes",
        description: "Free energy efficiency measures for Scottish homes - Scotland",
        type: "Grant",
        region: "United Kingdom",
        maxFunding: "Free measures",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.homeenergyscotland.org/warmer-homes-scotland/" },
        keywords: ["Scotland", "efficiency", "free", "insulation"],
        relevance: "Scottish residents"
    },

    // Ireland Schemes
    {
        title: "SEAI Better Energy Homes",
        description: "Grants for home insulation, heating, and solar systems",
        type: "Grant",
        region: "Ireland",
        maxFunding: "€3,000-€8,000",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.seai.ie/grants/home-energy-grants/better-energy-homes/" },
        keywords: ["SEAI", "insulation", "solar", "heating"],
        relevance: "Irish homeowners"
    },
    {
        title: "SEAI Solar PV Scheme",
        description: "Grant for installation of solar PV and battery storage",
        type: "Grant",
        region: "Ireland",
        maxFunding: "€2,100",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.seai.ie/grants/home-energy-grants/solar-electricity-grant/" },
        keywords: ["solar", "PV", "battery", "grant"],
        relevance: "Irish homeowners"
    },
    {
        title: "SEAI Heat Pump Systems",
        description: "Grant for air to water and ground source heat pumps",
        type: "Grant",
        region: "Ireland",
        maxFunding: "€6,500",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.seai.ie/grants/home-energy-grants/heat-pump-systems/" },
        keywords: ["heat pump", "heating", "air source", "ground source"],
        relevance: "Irish homeowners"
    },
    {
        title: "National Home Retrofit Scheme",
        description: "Fully funded deep retrofit for eligible households",
        type: "Grant",
        region: "Ireland",
        maxFunding: "80-100% funded",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.seai.ie/grants/national-home-energy-upgrade-scheme/" },
        keywords: ["retrofit", "deep renovation", "BER", "whole house"],
        relevance: "Irish homeowners (BER D or lower)"
    },
    {
        title: "Community Energy Grant",
        description: "Support for community energy efficiency and renewable projects",
        type: "Grant",
        region: "Ireland",
        maxFunding: "Variable",
        deadline: "Annual rounds",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.seai.ie/grants/community-grants/" },
        keywords: ["community", "renewable", "group", "collective"],
        relevance: "Community groups, housing associations"
    },
    {
        title: "EXEED Certified Grant",
        description: "Support for EXEED energy management certification",
        type: "Grant",
        region: "Ireland",
        maxFunding: "€2,000",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.seai.ie/business-and-public-sector/large-business-and-industry/exeed-certified/" },
        keywords: ["EXEED", "certification", "business", "management"],
        relevance: "Large businesses"
    },

    // France Schemes
    {
        title: "MaPrimeRénov'",
        description: "Main renovation grant for energy efficiency improvements",
        type: "Grant",
        region: "France",
        maxFunding: "€20,000+",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.maprimerenov.gouv.fr/" },
        keywords: ["renovation", "insulation", "heating", "residential"],
        relevance: "French property owners"
    },
    {
        title: "Éco-prêt à taux zéro (Éco-PTZ)",
        description: "Zero-interest loan for energy renovation works",
        type: "Loan",
        region: "France",
        maxFunding: "€50,000",
        deadline: "2027",
        priority: "high",
        status: "active",
        links: { apply: "https://www.service-public.fr/particuliers/vosdroits/F19905" },
        keywords: ["loan", "zero interest", "renovation", "home"],
        relevance: "French homeowners and landlords"
    },
    {
        title: "CEE - Energy Savings Certificates",
        description: "Obligation scheme providing bonuses for energy efficiency works",
        type: "Rebate",
        region: "France",
        maxFunding: "Variable",
        deadline: "2028",
        priority: "high",
        status: "active",
        links: { info: "https://www.ecologie.gouv.fr/dispositif-des-certificats-deconomies-denergie" },
        keywords: ["CEE", "energy savings", "certificate", "bonus"],
        relevance: "All energy consumers"
    },
    {
        title: "Bonus écologique véhicules",
        description: "Ecological bonus for electric vehicle purchases",
        type: "Subsidy",
        region: "France",
        maxFunding: "€7,000",
        deadline: "2024 (reduced rates)",
        priority: "high",
        status: "active",
        links: { apply: "https://www.primealaconversion.gouv.fr/" },
        keywords: ["EV", "electric", "vehicle", "bonus"],
        relevance: "Vehicle buyers"
    },
    {
        title: "TVA réduite travaux rénovation",
        description: "Reduced VAT rate (5.5%) for energy renovation works",
        type: "Tax Credit",
        region: "France",
        maxFunding: "14.5% savings",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { info: "https://www.service-public.fr/particuliers/vosdroits/F10795" },
        keywords: ["VAT", "renovation", "tax", "construction"],
        relevance: "Property owners doing renovations"
    },

    // Belgium Schemes
    {
        title: "Primes Énergie Wallonie",
        description: "Energy grants for insulation, heating, and renewables in Wallonia",
        type: "Grant",
        region: "Belgium",
        maxFunding: "€10,000+",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://energie.wallonie.be/fr/primes-energie.html" },
        keywords: ["Wallonia", "insulation", "heating", "solar"],
        relevance: "Wallonia residents"
    },
    {
        title: "Primes Renolution Bruxelles",
        description: "Renovation premiums for Brussels Capital Region",
        type: "Grant",
        region: "Belgium",
        maxFunding: "Variable",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://renolution.brussels/" },
        keywords: ["Brussels", "renovation", "insulation", "heating"],
        relevance: "Brussels residents"
    },
    {
        title: "Mijn VerbouwPremie (Flanders)",
        description: "Renovation grant for energy efficiency in Flanders",
        type: "Grant",
        region: "Belgium",
        maxFunding: "€15,000+",
        deadline: "Ongoing",
        priority: "high",
        status: "active",
        links: { apply: "https://www.vlaanderen.be/mijn-verbouwpremie" },
        keywords: ["Flanders", "renovation", "insulation", "efficiency"],
        relevance: "Flanders residents"
    },
    {
        title: "Prêt vert (Green Loan)",
        description: "Low-interest loans for green investments",
        type: "Loan",
        region: "Belgium",
        maxFunding: "€75,000",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { apply: "https://www.wallonie.be/fr/actualites/pret-vert" },
        keywords: ["loan", "green", "investment", "renovation"],
        relevance: "Belgian residents"
    },
    {
        title: "Federal Tax Deductions",
        description: "Tax deductions for energy-saving investments",
        type: "Tax Credit",
        region: "Belgium",
        maxFunding: "30% deduction",
        deadline: "Ongoing",
        priority: "medium",
        status: "active",
        links: { info: "https://finances.belgium.be/fr/particuliers/habitation/avantages_fiscaux" },
        keywords: ["tax", "deduction", "energy", "federal"],
        relevance: "Belgian taxpayers"
    }
];

async function importSchemes() {
    console.log('🔌 Connecting to MongoDB...');
    
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });
        console.log('✅ Connected to MongoDB');
        
        // Count existing schemes
        const existingCount = await Scheme.countDocuments();
        console.log(`📊 Existing schemes in database: ${existingCount}`);
        
        if (existingCount > 0) {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const answer = await new Promise(resolve => {
                rl.question('⚠️ Database has existing schemes. Options:\n  1. Skip existing (add new only)\n  2. Update all (overwrite)\n  3. Clear and reimport\n  4. Cancel\nChoice (1-4): ', resolve);
            });
            rl.close();
            
            switch (answer) {
                case '2':
                    console.log('📝 Will update existing schemes...');
                    break;
                case '3':
                    console.log('🗑️ Clearing existing schemes...');
                    await Scheme.deleteMany({});
                    break;
                case '4':
                    console.log('❌ Cancelled');
                    process.exit(0);
                default:
                    console.log('📝 Skipping existing, adding new only...');
            }
        }
        
        console.log(`\n📥 Importing ${schemesData.length} schemes...`);
        
        let created = 0;
        let updated = 0;
        let skipped = 0;
        
        for (const data of schemesData) {
            try {
                const existing = await Scheme.findOne({
                    title: data.title,
                    region: data.region
                });
                
                if (existing) {
                    // Update
                    await Scheme.findByIdAndUpdate(existing._id, data);
                    updated++;
                    process.stdout.write('U');
                } else {
                    // Create
                    const scheme = new Scheme(data);
                    await scheme.save();
                    created++;
                    process.stdout.write('+');
                }
            } catch (err) {
                skipped++;
                process.stdout.write('x');
                console.error(`\n  Error with "${data.title}": ${err.message}`);
            }
        }
        
        console.log('\n');
        console.log('═══════════════════════════════════════');
        console.log('📊 Import Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   📝 Updated: ${updated}`);
        console.log(`   ❌ Skipped: ${skipped}`);
        console.log(`   📁 Total in DB: ${await Scheme.countDocuments()}`);
        console.log('═══════════════════════════════════════');
        
        // Update statuses based on deadlines
        console.log('\n🔄 Updating statuses based on deadlines...');
        await Scheme.updateStatuses();
        console.log('✅ Statuses updated');
        
    } catch (error) {
        console.error('❌ Import failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run import
importSchemes();

