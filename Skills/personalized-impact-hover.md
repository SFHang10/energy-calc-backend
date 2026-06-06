# Personalized Impact Hover Skill

## Purpose
Create a hover experience that explains **how news, grants, and product info
affects the user personally**. This is designed to motivate membership by
showing what a user can do with tailored insights (preferences + appliance data).

## Core Idea
Use content you already produce (blogs, grants, product info) and translate it
into **personal impact summaries**, such as:
- "What this news means for your energy costs"
- "How this grant could apply to your equipment"
- "Why this change matters for your business"

## Inputs
- Blog/news content summaries
- Product or category context
- Grants/schemes relevant to the product
- Membership preferences (region, sector, appliance types)
- Optional appliance data (future)

## Output (Hover Summary)
A short, personalized "why it matters" block:
```
Title: Why this matters for you
3 bullet points:
- Cost impact (e.g., higher energy prices = more savings with efficient gear)
- Eligibility impact (relevant grants)
- Action impact (what to do next)
CTA: Join to save + track offers
```

## Impact Mapping (Required)
To keep policy impacts accurate and consistent, maintain a small mapping list
that connects each policy/topic to a concrete user impact and example action.

**Format (add to this file or a companion JSON):**
```
- Topic: [Policy/Regulation]
  Who it affects: [SMEs, facilities, homeowners, etc.]
  Impact: [cost, compliance, access to funding, procurement]
  Example action: [upgrade / grant / product]
  Example link: [Marketplace or guide link]
  More link: [Policy page or explainer]
```

**JSON Location:**
```
data/personalized-impact-map.json
```

**Example:**
```
- Topic: Circular Economy Act (2026)
  Who it affects: Procurement & facilities teams
  Impact: More consistent circular product requirements across EU markets
  Example action: Specify ETL‑listed retrofit products
  Example link: https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html?product=etl_21_29475&fromPopup=true
  More link: https://environment.ec.europa.eu/strategy/circular-economy_en
```

## Safety Rules
- No live API calls on hover
- Use cached or pre-generated summaries
- Keep language clear and non-technical
- Highlight positive outcomes and practical next steps

## Suggested Workflow
1. Generate weekly summaries per category/region from blog/news content
2. Map summaries to product categories or grant categories
3. Store in a lightweight cache:
   - `data/personalized-impact-cache.json`
4. Hover reads from cache only

## Example Cache Entry
```
{
  "category": "HVAC",
  "region": "uk.england",
  "summary": [
    "Energy costs are rising in your region; efficient HVAC pays back faster.",
    "You may qualify for a boiler upgrade grant this quarter.",
    "Simple upgrade can cut running costs by 20-30%."
  ],
  "cta": "Join to track savings and offers"
}
```

## Trigger Phrases
Use this skill when the user asks for:
- "hover that explains how it affects me"
- "personalized hover"
- "why this matters to me"
- "impact summary on hover"
- "membership encouragement hover"

## Success Criteria
- Hover provides clear, personalized value in 3 bullets
- Keeps users on product pages longer
- Encourages membership signup
