# 💷 Product Deal Finder Skill

**Skill Type:** Deals, Pricing & Promotions  
**Purpose:** Find the best deals, offers, and price comparisons for a product  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 🎯 Goal

Provide customers with accurate, up-to-date deal options for a specific product across UK/EU retailers and comparison sites.

---

## ✅ Core Features

1) **Deal discovery** across UK/EU retailers  
2) **Price comparison** and lowest-price identification  
3) **Voucher / promo code** checks  
4) **Clear output** with links, conditions, and expiry dates  

---

## 🔄 Workflow (MANDATORY)

1. **Confirm product specifics** (model/variant/specs)  
2. **Search multiple sources** (retailers + comparison + deal sites)  
3. **Verify pricing** (VAT/shipping/availability)  
4. **Report results** in structured format  
5. **Include disclaimers** (price changes / availability)  

---

## ✅ Output Format (Standard)

```
## [Product Name] - Current Deals (as of [Date])

### 🏆 Best Overall Deal
**[Retailer Name]** - £XXX.XX / €XXX.XX
- Key benefit
- Conditions
- Link
- Valid until

### 💰 Price Comparison
| Retailer | Price | Shipping | Offer | Link |

### 🎫 Active Discount Codes
- Code / Conditions / Valid until

### 📊 Notes
- Price range
- Availability
- Verification timestamp
```

---

## 🧭 Reference Guide

Use the full guide for search strategy, retailer lists, and templates:  
`Skills/Product_Deal_Finder_Guide.md`

---

## ✅ Trigger Phrases

Activate this skill when the user says:
```
"find deals"
"product deals"
"best price"
"discount code"
"compare prices"
"special offer"
"promo code"
"sale price"
```

---

## ✅ Success Criteria

- At least 3 credible sources checked  
- Clear summary with links  
- Price + shipping + conditions noted  
- “As of” timestamp included  
