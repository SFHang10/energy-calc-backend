// Analyze ETL Products for Affiliate Opportunities
// Extracts all manufacturers/brands and matches against existing affiliate programs

const fs = require('fs');
const path = require('path');

// Load ETL database
const databasePath = path.join(__dirname, '..', 'FULL-DATABASE-5554.json');
const affiliateConfigPath = path.join(__dirname, 'affiliate-config.json');

console.log('📊 Analyzing ETL Products for Affiliate Opportunities...\n');

// Load database
const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
const products = database.products || database;

// Load affiliate config
const affiliateConfig = JSON.parse(fs.readFileSync(affiliateConfigPath, 'utf8'));
const existingAffiliates = Object.keys(affiliateConfig.affiliate_programs || {});

console.log(`✅ Loaded ${products.length} products from database`);
console.log(`✅ Found ${existingAffiliates.length} existing affiliate programs\n`);

// Extract all unique brands/manufacturers
const brandMap = new Map();
const manufacturerMap = new Map();

products.forEach(product => {
    const brand = product.brand || product.manufacturer || 'Unknown';
    const normalizedBrand = brand.toLowerCase().trim();
    
    if (!brandMap.has(normalizedBrand)) {
        brandMap.set(normalizedBrand, {
            originalName: brand,
            productCount: 0,
            categories: new Set(),
            subcategories: new Set(),
            products: []
        });
    }
    
    const brandInfo = brandMap.get(normalizedBrand);
    brandInfo.productCount++;
    if (product.category) brandInfo.categories.add(product.category);
    if (product.subcategory) brandInfo.subcategories.add(product.subcategory);
    
    // Store sample products (first 5)
    if (brandInfo.products.length < 5) {
        brandInfo.products.push({
            id: product.id,
            name: product.name,
            category: product.category,
            subcategory: product.subcategory
        });
    }
});

// Match against existing affiliate programs
const matchedBrands = [];
const potentialBrands = [];
const unmatchedBrands = [];

brandMap.forEach((info, normalizedBrand) => {
    // Check if matches existing affiliate program
    const isMatched = existingAffiliates.some(affiliate => {
        const affiliateName = affiliate.toLowerCase();
        return normalizedBrand.includes(affiliateName) || affiliateName.includes(normalizedBrand);
    });
    
    const brandData = {
        brand: info.originalName,
        normalizedBrand: normalizedBrand,
        productCount: info.productCount,
        categories: Array.from(info.categories),
        subcategories: Array.from(info.subcategories),
        sampleProducts: info.products,
        hasAffiliateProgram: isMatched
    };
    
    if (isMatched) {
        matchedBrands.push(brandData);
    } else if (info.productCount >= 5) { // Potential if 5+ products
        potentialBrands.push(brandData);
    } else {
        unmatchedBrands.push(brandData);
    }
});

// Sort by product count (descending)
matchedBrands.sort((a, b) => b.productCount - a.productCount);
potentialBrands.sort((a, b) => b.productCount - a.productCount);
unmatchedBrands.sort((a, b) => b.productCount - a.productCount);

// Generate report
const report = {
    summary: {
        totalProducts: products.length,
        totalUniqueBrands: brandMap.size,
        existingAffiliatePrograms: existingAffiliates.length,
        brandsWithAffiliatePrograms: matchedBrands.length,
        potentialAffiliateBrands: potentialBrands.length,
        otherBrands: unmatchedBrands.length
    },
    existingAffiliatePrograms: existingAffiliates.map(affiliate => {
        const config = affiliateConfig.affiliate_programs[affiliate];
        const matchingBrands = matchedBrands.filter(b => 
            b.normalizedBrand.includes(affiliate.toLowerCase()) || 
            affiliate.toLowerCase().includes(b.normalizedBrand)
        );
        
        return {
            affiliateProgram: affiliate,
            name: config.name,
            website: config.website,
            commissionRate: config.commission_rate,
            status: config.status,
            contact: config.contact,
            matchingBrands: matchingBrands.map(b => ({
                brand: b.brand,
                productCount: b.productCount,
                categories: b.categories
            }))
        };
    }),
    potentialAffiliateBrands: potentialBrands.map(brand => ({
        brand: brand.brand,
        productCount: brand.productCount,
        categories: brand.categories,
        subcategories: brand.subcategories,
        sampleProducts: brand.sampleProducts,
        recommendation: brand.productCount >= 20 ? 'High Priority' : 
                        brand.productCount >= 10 ? 'Medium Priority' : 'Low Priority'
    })),
    allBrands: Array.from(brandMap.entries())
        .map(([normalized, info]) => ({
            brand: info.originalName,
            productCount: info.productCount,
            categories: Array.from(info.categories),
            hasAffiliateProgram: matchedBrands.some(m => m.brand === info.originalName)
        }))
        .sort((a, b) => b.productCount - a.productCount)
};

// Save report
const reportPath = path.join(__dirname, 'affiliate-opportunities-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Generate readable report
const readableReport = `
# ETL Products - Affiliate Opportunities Analysis

## 📊 Summary

- **Total Products**: ${report.summary.totalProducts}
- **Unique Brands/Manufacturers**: ${report.summary.totalUniqueBrands}
- **Existing Affiliate Programs**: ${report.summary.existingAffiliatePrograms}
- **Brands with Affiliate Programs**: ${report.summary.brandsWithAffiliatePrograms}
- **Potential Affiliate Brands** (5+ products): ${report.summary.potentialAffiliateBrands}
- **Other Brands**: ${report.summary.otherBrands}

---

## ✅ Existing Affiliate Programs

${report.existingAffiliatePrograms.map(aff => `
### ${aff.name} (${aff.affiliateProgram})
- **Website**: ${aff.website}
- **Commission Rate**: ${(aff.commissionRate * 100).toFixed(1)}%
- **Status**: ${aff.status}
- **Contact**: ${aff.contact}
- **Matching Brands in Database**: ${aff.matchingBrands.length}
  ${aff.matchingBrands.map(b => `  - ${b.brand} (${b.productCount} products, Categories: ${b.categories.join(', ')})`).join('\n  ')}
`).join('\n')}

---

## 🎯 Potential Affiliate Opportunities (5+ Products)

### High Priority (20+ Products)
${potentialBrands.filter(b => b.productCount >= 20).map(b => `
- **${b.brand}** (${b.productCount} products)
  - Categories: ${b.categories.join(', ')}
  - Subcategories: ${b.subcategories.slice(0, 3).join(', ')}${b.subcategories.length > 3 ? '...' : ''}
  - Sample Products:
    ${b.sampleProducts.map(p => `    - ${p.name} (${p.category})`).join('\n    ')}
`).join('\n')}

### Medium Priority (10-19 Products)
${potentialBrands.filter(b => b.productCount >= 10 && b.productCount < 20).map(b => `
- **${b.brand}** (${b.productCount} products)
  - Categories: ${b.categories.join(', ')}
  - Sample Products:
    ${b.sampleProducts.map(p => `    - ${p.name}`).join(', ')}
`).join('\n')}

### Low Priority (5-9 Products)
${potentialBrands.filter(b => b.productCount >= 5 && b.productCount < 10).map(b => `
- **${b.brand}** (${b.productCount} products)
  - Categories: ${b.categories.join(', ')}
`).join('\n')}

---

## 📋 All Brands (Sorted by Product Count)

${Array.from(brandMap.entries())
    .sort((a, b) => b[1].productCount - a[1].productCount)
    .slice(0, 50)
    .map(([normalized, info], index) => 
        `${index + 1}. **${info.originalName}** - ${info.productCount} products (${Array.from(info.categories).join(', ')})`
    ).join('\n')}

---

## 📝 Next Steps

1. **Review High Priority Brands** (20+ products) - These offer the best ROI for affiliate partnerships
2. **Contact Medium Priority Brands** (10-19 products) - Good opportunities if they have affiliate programs
3. **Use Affiliate Partnership Template** - Customize and send to manufacturers
4. **Update affiliate-config.json** - Add new affiliate programs as they're established
5. **Track Outreach** - Use the outreach log in the partnership template

---

*Report Generated: ${new Date().toISOString()}*
*Total Brands Analyzed: ${brandMap.size}*
`;

// Save readable report
const readableReportPath = path.join(__dirname, 'affiliate-opportunities-report.md');
fs.writeFileSync(readableReportPath, readableReport);

// Generate CSV for easy import
const csvRows = [
    ['Brand', 'Product Count', 'Categories', 'Has Affiliate Program', 'Priority', 'Sample Products'].join(',')
];

Array.from(brandMap.entries())
    .sort((a, b) => b[1].productCount - a[1].productCount)
    .forEach(([normalized, info]) => {
        const hasAffiliate = matchedBrands.some(m => m.brand === info.originalName);
        const priority = info.productCount >= 20 ? 'High' : 
                        info.productCount >= 10 ? 'Medium' : 
                        info.productCount >= 5 ? 'Low' : 'Very Low';
        const sampleProducts = info.products.map(p => p.name).join('; ');
        
        csvRows.push([
            `"${info.originalName}"`,
            info.productCount,
            `"${Array.from(info.categories).join('; ')}"`,
            hasAffiliate ? 'Yes' : 'No',
            priority,
            `"${sampleProducts}"`
        ].join(','));
    });

const csvPath = path.join(__dirname, 'affiliate-opportunities-report.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'));

// Console output
console.log('\n📊 ANALYSIS COMPLETE\n');
console.log('='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Total Products: ${report.summary.totalProducts}`);
console.log(`Unique Brands: ${report.summary.totalUniqueBrands}`);
console.log(`Existing Affiliate Programs: ${report.summary.existingAffiliatePrograms}`);
console.log(`Brands with Affiliate Programs: ${report.summary.brandsWithAffiliatePrograms}`);
console.log(`Potential Affiliate Brands (5+ products): ${report.summary.potentialAffiliateBrands}`);
console.log('\n');

console.log('='.repeat(60));
console.log('TOP 20 BRANDS BY PRODUCT COUNT');
console.log('='.repeat(60));
Array.from(brandMap.entries())
    .sort((a, b) => b[1].productCount - a[1].productCount)
    .slice(0, 20)
    .forEach(([normalized, info], index) => {
        const hasAffiliate = matchedBrands.some(m => m.brand === info.originalName);
        console.log(`${(index + 1).toString().padStart(2)}. ${info.originalName.padEnd(40)} ${info.productCount.toString().padStart(4)} products ${hasAffiliate ? '✅ HAS AFFILIATE' : ''}`);
    });

console.log('\n');
console.log('='.repeat(60));
console.log('HIGH PRIORITY AFFILIATE OPPORTUNITIES (20+ products)');
console.log('='.repeat(60));
potentialBrands
    .filter(b => b.productCount >= 20)
    .forEach((brand, index) => {
        console.log(`${index + 1}. ${brand.brand} - ${brand.productCount} products`);
        console.log(`   Categories: ${brand.categories.join(', ')}`);
    });

console.log('\n');
console.log('✅ Reports Generated:');
console.log(`   - JSON: ${reportPath}`);
console.log(`   - Markdown: ${readableReportPath}`);
console.log(`   - CSV: ${csvPath}`);
console.log('\n');










