# Product Qualification Search Portal - Setup Guide

## 🚀 Quick Start (5 Minutes)

### What You've Got
- **product-qualification-search.html** - The main search portal
- **schemes.json** - The database of grants and schemes (with keywords for matching)

### Setup Steps

1. **Upload Both Files**
   - Place both files in the same folder on your website
   - Example: `yourwebsite.com/green-schemes/product-qualification-search.html`

2. **Test It**
   - Open the HTML file in your browser
   - Try searching for "heat pump", "LED lighting", or "solar panel"
   - You should see matching schemes appear

3. **Customize**
   - Edit schemes.json to add/remove/update schemes
   - Add your own product keywords to improve matching

## 🎯 How It Works

### Product Search Feature
Users can search for any product by:
- Product name (e.g., "heat pump")
- Product category (e.g., "solar energy")
- Keywords (e.g., "energy efficient")

### Intelligent Matching
The system automatically matches products to schemes based on:
- **Keywords** - Each scheme has relevant keywords
- **Categories** - Filters by scheme type
- **Relevance** - Shows why the product qualifies

### What Users See
For each qualified scheme:
- ✓ Qualification badge
- Why it qualifies (matched keywords)
- Scheme details (funding, requirements, deadlines)
- Direct links to apply

## ✏️ Customizing Schemes

### Adding a New Scheme

1. Open **schemes.json**
2. Add a new scheme object with this structure:

```json
{
  "id": "unique-scheme-id",
  "title": "Scheme Name",
  "type": "subsidy",
  "categories": ["subsidy"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "description": "What the scheme does",
  "relevance": "High/Medium/Low",
  "requirements": "What users need",
  "deadline": "Month Day, Year",
  "priority": false,
  "links": [
    {"text": "🔗 Apply", "url": "https://example.com", "type": "apply"}
  ]
}
```

3. **Important**: Add comprehensive keywords for good matching
4. Save and upload to your website

### Improving Matching

To make products match better, add more keywords to schemes:

```json
"keywords": [
  "heat pump", 
  "ground source heat pump",
  "geothermal heat pump",
  "air source heat pump",
  "energy efficient heating",
  "sustainable heating"
]
```

The more keywords you add, the more products will match!

## 🎨 Customizing the Look

### Change Colors
Find the gradient in the `<style>` section:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
Change the color codes to match your brand!

### Change Button Styles
Look for `.search-btn` and modify:
```css
background: linear-gradient(45deg, #667eea, #764ba2);
```

## 📊 Scheme Types

The portal supports these scheme types:
- **Subsidy** (blue) - Financial support for purchases
- **Grant** (orange) - Funding for projects
- **Tax** (purple) - Tax deductions or benefits
- **Certification** (grey) - Standards and labels
- **Compliance** (grey) - Legal requirements

## 🔍 Adding Your Own Products

To make suggestions better for your products:

1. In the HTML file, find the `getSampleProducts()` method
2. Add your products with keywords:

```javascript
{ 
  name: "My Product Name", 
  keywords: ["keyword1", "keyword2", "keyword3"] 
}
```

The more keywords you add, the better the matching!

## 🎯 Testing Your Setup

### Good Test Searches
Try these to verify everything works:
- "heat pump" → Should show ISDE, Geothermal grants
- "LED lighting" → Should show EIA tax deduction
- "solar panel" → Should show solar energy subsidies
- "insulation" → Should show ISDE, building grants

### Troubleshooting

**Problem**: No results showing
- **Solution**: Make sure schemes.json has keywords that match your test search

**Problem**: Links not working
- **Solution**: Verify URLs in schemes.json include https://

**Problem**: "Loading..." never changes
- **Solution**: Check that schemes.json is in the same folder with correct name

## 📅 Maintenance Schedule

### Weekly
- Check for new scheme announcements
- Review urgent deadlines (marked "HIGH PRIORITY")

### Monthly
- Update keywords to improve matching
- Add new relevant schemes
- Remove expired schemes

### Key Sites to Monitor
- https://www.rvo.nl/subsidies-financiering
- https://business.gov.nl
- https://www.topsectorenergie.nl

## 💡 Pro Tips

1. **More Keywords = Better Matching**
   - Add as many relevant keywords as possible
   - Think about how users might search

2. **Use Categories Wisely**
   - Categories help with filtering
   - Use "urgent" for time-sensitive schemes

3. **Test Regularly**
   - Search for products yourself
   - Make sure keywords match properly

4. **Keep URLs Updated**
   - Government sites sometimes move pages
   - Test links periodically

## 🎁 Bonus Features

The portal includes:
- ✅ Smart search suggestions
- ✅ Filter by scheme type
- ✅ Highlight urgent deadlines
- ✅ Show exactly why a product qualifies
- ✅ Mobile-responsive design
- ✅ Professional gradient design

## 📞 Need Help?

If you need to:
- Add many schemes at once
- Import from a database
- Customize the design heavily
- Add more complex features

Consider contacting a developer, but most updates just need editing schemes.json!

---

**Last Updated**: September 2025
**Next Review**: October 2025

