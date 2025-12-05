# Product Page Enhancements - Planning Document

**Date Created:** 2025-01-23  
**Status:** Planning Phase - No Changes Made Yet  
**Purpose:** Document recommendations and implementation options for product page enhancements

---

## Overview

This document outlines recommendations and implementation options for enhancing the product page with the following features:
1. Professional Installation
2. Warranty Information
3. Finance Options
4. "Customers Also Bought" / Related Products
5. "Ask Question" / "Deep Dive" / AI Q&A

---

## 1. Professional Installation

### Current State
- "Buy This Product" button shows energy savings from ETL
- No installation information currently displayed

### Implementation Options

#### Option A: Manual Input (Static Information) - **RECOMMENDED FOR START**
**Description:**
- Add installation information fields to product database
- Display static information (e.g., "Professional installation recommended", "Requires certified installer")
- Simple text-based display

**Pros:**
- Quick to implement
- No external dependencies
- Easy to maintain
- Works immediately

**Cons:**
- Less dynamic
- Requires manual updates per product
- Not location-specific

**Implementation:**
- Add fields to product database:
  - `installationRequired` (boolean)
  - `installationType` (string: "Professional", "DIY", "Both")
  - `installationNotes` (text)
  - `certificationRequired` (text, optional)

**Display Location:**
- In "Buy This Product" modal/section
- After energy savings information
- Format: "🔧 Installation: Professional installation recommended"

---

#### Option B: Installer Search/Directory Integration - **FUTURE ENHANCEMENT**
**Description:**
- Integrate with installer directory API (e.g., Trustpilot, local business directories)
- Allow users to search for certified installers by location
- Filter by product category/type

**Pros:**
- More useful for customers
- Dynamic and location-specific
- Better user experience

**Cons:**
- Requires API integration
- Ongoing maintenance
- Potential API costs
- More complex implementation

**Potential Integrations:**
- Trustpilot Business Directory API
- Google Business Profile API
- Local business directory APIs
- Custom installer database

**Recommendation:** Start with Option A, add Option B later if needed

---

## 2. Warranty Information

### Current State
- No warranty information currently displayed

### Best Approach

**Step 1: Add Warranty Fields to Product Database**
Add the following fields to your product database:
- `warrantyPeriod` (string: e.g., "2 years", "5 years", "10 years")
- `warrantyType` (string: e.g., "Manufacturer", "Extended", "Parts & Labor", "Parts Only")
- `warrantyNotes` (text, optional: additional details)
- `warrantyProvider` (string, optional: manufacturer name or warranty provider)

**Step 2: Data Sources**
- ETL product data (if available)
- Manufacturer websites
- Product specification sheets
- Manual research and entry

**Step 3: Display Location**
- In "Buy This Product" modal/section
- After installation information
- Format: "🛡️ Warranty: 2 years (Manufacturer warranty)"

**Implementation Priority:** **HIGH** - This is static data that adds value immediately

**Recommendation:** Add warranty fields to database now. It's straightforward and enhances product pages immediately.

---

## 3. Finance Options

### Current State
- No finance options currently displayed

### Implementation Options

#### Option A: Link to External Finance Provider - **SIMPLE START**
**Description:**
- Partner with a finance company (e.g., Klarna, Affirm, or local provider)
- Add a link/button that redirects to their application page
- Display basic info (e.g., "Finance options available", "Apply now")

**Pros:**
- No payment processing needed
- Quick to implement
- No financial liability

**Cons:**
- Redirects users away from your site
- Less control over user experience
- May reduce conversion rates

**Implementation:**
- Add `financeAvailable` (boolean) field
- Add `financeProvider` (string) field
- Add `financeLink` (URL) field
- Display button: "💳 Finance Options Available"

---

#### Option B: Embed Finance Calculator Widget - **BETTER UX**
**Description:**
- Use finance widget API from provider
- Show monthly payment estimates directly on product page
- Calculate based on product price

**Pros:**
- Better user experience
- Keeps users on your site
- More engaging

**Cons:**
- Requires API integration
- May have setup requirements
- Potential API costs

**Potential Providers:**
- Klarna Widget
- Affirm Widget
- Local finance providers with widget APIs

**Implementation:**
- Integrate finance widget API
- Pass product price to widget
- Display monthly payment estimates

---

#### Option C: Manual Finance Information - **QUICKEST**
**Description:**
- Display static information (e.g., "Finance options available", "Contact for details")
- Link to contact form or dedicated finance page

**Pros:**
- Simplest implementation
- No integration needed
- Full control

**Cons:**
- Less engaging
- Requires manual follow-up

**Recommendation:** Start with Option C, then move to Option B if you want to offer finance directly

---

## 4. "Customers Also Bought" / Related Products

### Current State
- No related products currently displayed
- Wix Reviews element exists on page

### Implementation Options

#### Option A: Category-Based Recommendations - **RECOMMENDED FOR START**
**Description:**
- Show other products from the same category
- Show products with similar power ratings
- Show products from the same brand
- Algorithm: Mix of category, power range, and brand

**Pros:**
- Easy to implement with current data
- Works immediately
- No purchase history needed
- Scalable

**Cons:**
- Not personalized
- May not reflect actual customer behavior

**Implementation:**
- Query products by:
  - Same `category`
  - Similar `power` rating (±20%)
  - Same `brand`
- Limit to 4-6 products
- Exclude current product
- Randomize selection if many matches

**Display Format:**
- Grid of product cards
- Product image, name, power, price
- Link to product page

---

#### Option B: Purchase History-Based (Future) - **LONG-TERM**
**Description:**
- Track actual purchases
- Use collaborative filtering
- Show products frequently bought together

**Pros:**
- More relevant recommendations
- Based on real customer behavior
- Improves over time

**Cons:**
- Requires purchase tracking system
- Needs significant data volume to be effective
- More complex implementation

**When to Implement:**
- After you have purchase tracking
- When you have sufficient purchase data (100+ purchases)
- When you want personalized recommendations

---

#### Option C: Manual Curation - **STRATEGIC**
**Description:**
- Manually link related products in database
- Add `relatedProducts` field with array of product IDs
- Curate based on business logic

**Pros:**
- Full control over recommendations
- Can be strategic (e.g., upsell, cross-sell)
- High quality matches

**Cons:**
- Manual work per product
- Doesn't scale well
- Time-consuming

**Recommendation:** Use for key/high-value products

---

### Wix Reviews Integration

**Current State:**
- Wix Reviews element already exists on page

**Recommendation:**
- **Keep Wix Reviews** - It provides social proof
- **Add "Customers Also Bought"** - It serves a different purpose (recommendations vs. reviews)
- Use both together for better user experience

**Display Strategy:**
- Wix Reviews: Show social proof and ratings
- "Customers Also Bought": Show product recommendations
- Place them in different sections or tabs

---

### Final Recommendation for "Customers Also Bought"

**Phase 1 (Now):**
- Implement Option A (Category-based recommendations)
- Keep Wix Reviews as-is
- Display 4-6 related products in a grid

**Phase 2 (When you have data):**
- Add Option C (Manual curation) for key products
- Track which recommendations get clicks

**Phase 3 (Long-term):**
- Implement Option B (Purchase history-based) when you have sufficient purchase data

---

## 5. "Ask Question" / "Deep Dive" / AI Q&A

### Current State
- "Ask question about this product" feature exists
- Considering "Deep Dive" page for products

### Implementation Options

#### Option A: Product-Specific AI Module - **ADVANCED**
**Description:**
- Build Q&A system using product data
- Use AI API (OpenAI, Claude, etc.) with product context
- Feed product specs, features, energy ratings as context
- Answer questions dynamically

**Pros:**
- Dynamic and flexible
- Can answer various questions
- Good user experience
- Scalable

**Cons:**
- Requires AI API integration
- API costs (per query)
- Needs moderation/safety measures
- More complex implementation

**Implementation Requirements:**
- AI API key (OpenAI, Anthropic, etc.)
- Product context preparation
- Prompt engineering
- Response moderation
- Error handling

**Cost Considerations:**
- API costs per query (typically $0.01-$0.10 per query)
- May need rate limiting
- Consider caching common questions

---

#### Option B: Pre-Generated FAQ - **RECOMMENDED FOR START**
**Description:**
- Create FAQs per product or category
- Store in database
- Display on "Deep Dive" page
- Searchable/expandable format

**Pros:**
- Simple to implement
- No API costs
- Controlled content
- Fast response times
- Can be SEO-friendly

**Cons:**
- Limited to pre-written questions
- Requires manual creation
- May not cover all questions

**Implementation:**
- Add `faqs` field to product database (array of objects)
- Structure: `{ question: string, answer: string }`
- Display in expandable accordion format
- Add search functionality

**FAQ Sources:**
- Common customer questions
- Product specifications
- Installation guides
- Energy efficiency questions
- Warranty questions

---

#### Option C: Hybrid Approach - **BEST OF BOTH WORLDS**
**Description:**
- Pre-written FAQs for common questions
- AI fallback for specific/uncommon questions
- "Didn't find your answer? Ask AI" button

**Pros:**
- Combines benefits of both approaches
- Cost-effective (most questions answered by FAQ)
- Covers edge cases with AI
- Good user experience

**Cons:**
- More complex implementation
- Requires both systems
- Need to determine when to use AI

**Implementation Flow:**
1. User searches FAQ
2. If match found → show FAQ answer
3. If no match → "Ask AI" option appears
4. AI answers with product context
5. Optionally save new Q&A to FAQ database

---

### "Deep Dive" Page Structure

**Recommended Structure:**
1. **Product Overview**
   - Main product image
   - Key specifications
   - Energy ratings

2. **Detailed Specifications**
   - Full technical details
   - Power consumption
   - Dimensions
   - Installation requirements

3. **Energy Efficiency Analysis**
   - Running costs
   - Comparison with alternatives
   - ROI calculations

4. **Installation Guide**
   - Step-by-step instructions
   - Professional installation info
   - DIY tips (if applicable)

5. **FAQ Section**
   - Common questions
   - Expandable answers
   - Search functionality

6. **Ask AI Section**
   - Chat interface
   - Product-specific context
   - "Didn't find your answer? Ask AI" button

---

### Final Recommendation for AI Q&A

**Phase 1 (Now):**
- Implement Option B (Pre-generated FAQ)
- Create "Deep Dive" page with FAQ section
- Start with 5-10 common questions per product/category

**Phase 2 (Medium-term):**
- Add Option C (Hybrid approach)
- Implement AI fallback for unanswered questions
- Track which questions need AI answers

**Phase 3 (Long-term):**
- Full Option A (AI-first) if FAQ doesn't cover needs
- Or keep hybrid if it works well

---

## Implementation Priority Summary

### Quick Wins (Add to Database Now)
1. ✅ **Warranty Information** - Add fields, populate data
2. ✅ **Installation Requirements** - Add fields, populate data
3. ✅ **Related Products** - Implement category-based algorithm
4. ✅ **FAQ System** - Add FAQ field, create initial FAQs

### Medium-Term (Requires Integration)
1. 🔄 **Finance Options Widget** - Integrate finance calculator API
2. 🔄 **Installer Directory Search** - Integrate directory API
3. 🔄 **AI Q&A System** - Integrate AI API for dynamic answers

### Long-Term (When You Have Data)
1. 📊 **Purchase-Based Recommendations** - Implement when you have purchase tracking
2. 📊 **Personalized Product Suggestions** - Based on user behavior

---

## Database Schema Additions

### Recommended New Fields for Products

```javascript
{
  // Warranty Information
  warrantyPeriod: "2 years",           // String
  warrantyType: "Manufacturer",        // String
  warrantyNotes: "Covers parts and labor", // String (optional)
  warrantyProvider: "Manufacturer Name", // String (optional)
  
  // Installation Information
  installationRequired: true,          // Boolean
  installationType: "Professional",    // String: "Professional", "DIY", "Both"
  installationNotes: "Requires certified installer", // String (optional)
  certificationRequired: "Gas Safe",   // String (optional)
  
  // Finance Options
  financeAvailable: true,              // Boolean
  financeProvider: "Klarna",          // String (optional)
  financeLink: "https://...",         // URL (optional)
  
  // Related Products
  relatedProducts: ["product-id-1", "product-id-2"], // Array of product IDs (optional)
  
  // FAQ
  faqs: [                              // Array of objects (optional)
    {
      question: "What is the power consumption?",
      answer: "This product consumes 2.1kW..."
    },
    {
      question: "Does it require professional installation?",
      answer: "Yes, professional installation is recommended..."
    }
  ]
}
```

---

## Next Steps for Tomorrow

1. **Review this document** and decide on implementation approach for each feature
2. **Prioritize features** based on business needs and user value
3. **Create database migration** to add new fields
4. **Populate initial data** for warranty and installation info
5. **Implement display logic** in product page
6. **Test and iterate** based on user feedback

---

## Questions to Consider

1. **Professional Installation:**
   - Do you have installer partnerships?
   - Do you want to build an installer directory?
   - Or just display installation requirements?

2. **Warranty:**
   - Do you have warranty data sources?
   - Should this be per-product or per-category?
   - How detailed should warranty info be?

3. **Finance:**
   - Do you have finance provider partnerships?
   - What finance options do you want to offer?
   - Should this be available for all products or select products?

4. **Related Products:**
   - How many related products to show?
   - Should this be category-based, manual, or both?
   - Do you want to track recommendation clicks?

5. **AI Q&A:**
   - Do you want to start with FAQ or go straight to AI?
   - What's your budget for AI API costs?
   - How do you want to handle moderation?

---

## Notes

- All recommendations are based on current system architecture
- No code changes have been made yet
- This document is for planning purposes only
- Implementation details will be finalized tomorrow based on decisions made

---

**Document Status:** Ready for Review  
**Next Review:** Tomorrow (2025-01-24)




