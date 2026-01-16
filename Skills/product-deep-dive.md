# 🔍 Product Deep Dive Skill

**Skill Type:** Product Intelligence & Deep Dive Builder  
**Purpose:** Build a consistent, rich Deep Dive page for every product  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 🎯 Goal

Create a **single, reusable Deep Dive page framework** that displays the most complete, useful information for each product:

- ✅ Energy usage and running cost  
- ✅ Grants/schemes (already hardcoded into product data)  
- ✅ Eco/CO2 impact details  
- ✅ Reviews and ratings (curated)  
- ✅ Additional product information (research notes, certifications, tips)  
- ✅ Deals or promotions (if available)

---

## ✅ Best Practice (MANDATORY)

**Prebuild the Deep Dive data first, then render the HTML.**  
This avoids slow or unreliable live web calls and ensures consistent layout.

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `products-with-grants-and-collection.json` | Base product data (preferred if exists) |
| `products-with-grants.json` | Base fallback if no collection data |
| `deep-dive-content.json` | Manual/curated deep dive details per product |
| `product-deep-dive-builder.js` | Builds merged deep dive output |
| `products-deep-dive.json` | Final output used by the HTML |
| `energy-calculator/products-deep-dive.json` | Copy for calculators/frontends |
| `HTMLs/Product Deep Dive.html` | Presentation template |
| `wix-integration/member-product-deep-dive.html` | Member-only version (optional) |

---

## 🧩 Deep Dive Data Schema

Add a `deepDive` object per product in `deep-dive-content.json`:

```json
{
  "updatedAt": "2026-01-15",
  "products": {
    "etl_9_75494": {
      "overview": "Short summary of why this product stands out.",
      "highlights": [
        "High-efficiency operation",
        "Low annual running cost"
      ],
      "energyUsage": {
        "annualKwh": 1200,
        "runningCostPerYear": 180,
        "usageNotes": "Based on standard usage patterns"
      },
      "ecoImpact": {
        "co2SavingsKgPerYear": 350,
        "sustainabilityNotes": "Lower emissions vs legacy models"
      },
      "reviews": [
        {
          "source": "TrustedReviews",
          "rating": 4.6,
          "summary": "Quiet and very efficient",
          "url": "https://example.com/review"
        }
      ],
      "additionalInfo": {
        "certifications": ["CE", "ETL"],
        "usageTips": ["Keep filters clean", "Check seals monthly"],
        "dealNotes": "Seasonal discount available"
      },
      "sources": [
        {
          "label": "Manufacturer Datasheet",
          "url": "https://example.com/specs"
        }
      ]
    }
  }
}
```

---

## 🔄 Workflow (MANDATORY)

1. **Update deep dive content**  
   Add or update product entries in `deep-dive-content.json`.

2. **Run the builder**  
   ```bash
   node product-deep-dive-builder.js
   ```

3. **Verify output**  
   - Check `products-deep-dive.json`
   - Check `energy-calculator/products-deep-dive.json`

4. **Render in HTML**  
   Use `HTMLs/Product Deep Dive.html` or member-only page to display.

---

## 🔧 Trigger Phrases

Activate this skill when the user says:

```
"product deep dive"
"deep dive page"
"product details page"
"rich product info"
"enhanced product profile"
"show all grants and reviews"
"deep dive content"
```

---

## ✅ Success Criteria

- Deep dive data exists for target product
- Output JSON generated successfully
- HTML page shows all available sections
- Missing sections gracefully hide

---

## 🧠 Notes

- Grants are pulled from existing hardcoded product data  
- Reviews and eco data should be curated and stored in JSON  
- Live web calls are **not recommended** for production display  
- This process works for **member-only or public** pages

