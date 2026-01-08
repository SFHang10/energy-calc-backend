# 🌍 European Energy Grants & Schemes Finder

**Skill Type:** Research & Data Update Process  
**Frequency:** Weekly  
**Output:** Updated `schemes.json` for energy-calc-backend  
**Target Audiences:** Homes, Businesses, Restaurants/Hotels

---

## 📋 Overview

This skill searches for new and updated energy efficiency grants, schemes, subsidies, and tax benefits across Europe. It compiles findings into a structured format compatible with our existing schemes database and provides a review process before import.

---

## 🎯 Step 1: Execute Search Queries

Run these web searches to discover new grants and schemes. Perform searches for EACH target region.

### 1.1 General European Searches

```
"energy efficiency grants 2025 Europe"
"new renewable energy subsidies Europe 2025"
"EU Green Deal funding programs 2025"
"European energy transition grants businesses"
"energy retrofit grants Europe new"
"sustainable building incentives Europe 2025"
```

### 1.2 UK Specific Searches

```
"UK energy grants 2025 new"
"energy efficiency scheme UK 2025"
"heat pump grants UK government 2025"
"business energy efficiency grants UK"
"restaurant energy grants UK"
"hotel sustainability funding UK"
"renewable energy subsidies UK business"
"Energy Saving Trust new grants"
"BEIS energy efficiency funding"
```

### 1.3 Ireland (SEAI) Searches

```
"SEAI grants 2025 Ireland new"
"Ireland energy efficiency grants businesses"
"SEAI commercial grants"
"Ireland renewable energy funding 2025"
"BER grants Ireland hospitality"
```

### 1.4 Netherlands Searches

```
"RVO subsidie energie 2025"
"Netherlands energy grants businesses"
"ISDE subsidie update 2025"
"duurzame energie subsidie Nederland"
"EIA energy investment Netherlands"
"Netherlands hospitality sustainability grants"
```

### 1.5 Germany Searches

```
"BAFA Förderung 2025"
"KfW energy efficiency loans new"
"Germany energy grants business 2025"
"Bundesförderung effiziente Gebäude"
"heat pump subsidies Germany 2025"
"Germany restaurant energy funding"
```

### 1.6 France Searches

```
"MaPrimeRénov 2025 nouveautés"
"France energy grants businesses"
"CEE certificates France new"
"aides renovation energetique France 2025"
"France hotel energy efficiency funding"
```

### 1.7 Belgium Searches

```
"primes energie Wallonie 2025"
"Flanders energy premium update"
"Brussels RENOLUTION grants new"
"Belgium business energy subsidies"
"Belgium hospitality sustainability grants"
```

### 1.8 Spain Searches

```
"IDAE subvenciones energia 2025"
"PREE program Spain updates"
"MOVES programa Spain"
"Spain energy efficiency grants businesses"
"Plan de Recuperación energia España"
```

### 1.9 Portugal Searches

```
"Fundo Ambiental Portugal 2025"
"PRR energy grants Portugal"
"Portugal sustainable buildings program"
"Portugal business energy subsidies"
```

### 1.10 Sector-Specific Searches

```
"hospitality energy grants Europe 2025"
"restaurant energy efficiency funding Europe"
"hotel green certification incentives"
"commercial kitchen energy grants"
"SME energy efficiency grants Europe"
"retail energy saving schemes Europe"
```

---

## 🔍 Step 2: Verify & Cross-Reference

After finding potential schemes, verify them using these official sources:

### Official Government Portals
- **UK**: gov.uk/energy-efficiency
- **Ireland**: seai.ie/grants
- **Netherlands**: rvo.nl/subsidies-financiering
- **Germany**: bafa.de, kfw.de
- **France**: maprimerenov.gouv.fr, france-renov.gouv.fr
- **Belgium**: energie.wallonie.be, vlaanderen.be, renolution.brussels
- **Spain**: idae.es, planderecuperacion.gob.es
- **Portugal**: fundoambiental.pt, portugal2030.pt
- **EU Wide**: ec.europa.eu/energy

### Fetch Full Details
For each promising scheme:
```
web_fetch: [official scheme webpage URL]
```

Extract:
- Official scheme name
- Funding amounts and rates
- Eligibility requirements
- Application deadlines (if any)
- Target beneficiaries
- Application process URL
- Date scheme was announced/updated

---

## 📊 Step 3: Compile Data

For each new scheme found, compile the data in this EXACT format:

```json
{
  "id": "scheme-id-lowercase-hyphenated",
  "title": "Official Scheme Name",
  "type": "grant|subsidy|tax|certification|compliance",
  "region": "uk|ie|nl|de|fr|be|es|pt|eu",
  "categories": ["grant", "subsidy", "tax", "certification", "compliance", "urgent"],
  "keywords": ["keyword1", "keyword2", "relevant", "search", "terms"],
  "description": "Clear 1-2 sentence description of what the scheme offers and who benefits.",
  "relevance": "High|Medium|Low for [target audience]",
  "requirements": "Key eligibility criteria in brief",
  "maxFunding": "£/€X,XXX or Percentage% or Fully Funded",
  "subsidyRate": "XX-XX%" (if applicable),
  "deadline": "YYYY-MM-DD" (if applicable, or "Ongoing"),
  "endDate": "YYYY-MM-DDTHH:MM:SS.sssZ" (ISO format if applicable),
  "priority": true (only if deadline within 60 days),
  "links": [
    {"text": "🔗 Apply Now", "url": "https://official-application-url.gov", "type": "apply"},
    {"text": "📋 Learn More", "url": "https://information-url.gov", "type": "info"}
  ]
}
```

### Type Definitions
- **grant**: Direct funding that doesn't need to be repaid
- **subsidy**: Partial cost coverage or discount
- **tax**: Tax deduction, credit, or allowance
- **certification**: Voluntary labels and standards
- **compliance**: Mandatory requirements

### Region Codes
| Code | Region |
|------|--------|
| uk | United Kingdom |
| ie | Ireland |
| nl | Netherlands |
| de | Germany |
| fr | France |
| be | Belgium |
| es | Spain |
| pt | Portugal |
| eu | EU-Wide |

---

## 📝 Step 4: Generate Review List

Before importing, generate a REVIEW LIST in this format for user approval:

```markdown
## 🆕 New Schemes Found - [DATE]

### Summary
- **Total New Schemes Found:** X
- **By Region:** UK (X), IE (X), NL (X), DE (X), FR (X), BE (X), ES (X), PT (X), EU (X)
- **By Type:** Grants (X), Subsidies (X), Tax Benefits (X), Certifications (X)
- **Urgent (Deadline <60 days):** X

---

### Detailed Review List

#### 1. [Scheme Title]
- **ID:** proposed-scheme-id
- **Region:** Country Name
- **Type:** Grant/Subsidy/Tax
- **Max Funding:** £/€X,XXX
- **Deadline:** YYYY-MM-DD or Ongoing
- **Target:** Homes / Businesses / Restaurants / Hotels
- **Source:** [Official URL]
- **Status:** ✅ Verified / ⚠️ Needs Verification
- **Notes:** Any special considerations

[APPROVE] [REJECT] [MODIFY]

---

#### 2. [Next Scheme Title]
...
```

---

## ✅ Step 5: Import Process

After user approval of review list:

### 5.1 Read Current schemes.json
```javascript
// Read existing file
const currentSchemes = require('./schemes.json');
```

### 5.2 Merge New Schemes
```javascript
// For each approved new scheme:
// 1. Check if ID already exists (update if so)
// 2. Add new entries
// 3. Sort by region, then type

const updatedSchemes = [
  ...currentSchemes.filter(s => !newSchemes.find(n => n.id === s.id)),
  ...newSchemes
].sort((a, b) => {
  if (a.region !== b.region) return a.region.localeCompare(b.region);
  return a.type.localeCompare(b.type);
});
```

### 5.3 Generate Update Summary
```markdown
## 📊 Import Summary - [DATE]

### Changes Made:
- **Added:** X new schemes
- **Updated:** X existing schemes
- **Removed:** X expired schemes
- **Total Schemes:** X

### New Additions:
1. [Scheme Name] (Region)
2. [Scheme Name] (Region)
...

### Updated:
1. [Scheme Name] - Updated funding amount
2. [Scheme Name] - Extended deadline
...

### Expired/Removed:
1. [Scheme Name] - Deadline passed
...
```

### 5.4 Write Updated JSON
Write the merged JSON to `schemes.json` in the project root.

### 5.5 Commit & Deploy
```bash
cd C:\Users\steph\Documents\energy-cal-backend
git add schemes.json
git commit -m "Update schemes: Added X new, Updated Y - [DATE]"
git push
```

---

## 🔄 Step 6: Status Management

### Automatic Status Rules
- **Active**: No deadline or deadline > 30 days away
- **Expiring Soon**: Deadline within 30 days
- **Expired**: Deadline has passed

### Priority Flag
Set `"priority": true` for schemes with:
- Deadlines within 60 days
- New high-value grants (>€5,000)
- Limited funding pools (first-come-first-served)

---

## 📅 Weekly Execution Checklist

Run every Monday:

- [ ] **Execute all search queries** (Step 1)
- [ ] **Verify findings** on official sources (Step 2)
- [ ] **Compile data** in correct JSON format (Step 3)
- [ ] **Generate review list** for approval (Step 4)
- [ ] **Get user approval** on review list
- [ ] **Import approved schemes** (Step 5)
- [ ] **Update statuses** of existing schemes
- [ ] **Remove expired schemes** (deadline passed >30 days)
- [ ] **Commit and push** changes
- [ ] **Verify deployment** on Render

---

## 🎯 Target Audience Relevance Tags

When assessing relevance, consider these audiences:

### 🏠 Homes
- Heat pumps, solar PV, insulation
- Home energy upgrades
- EV charging for homeowners
- Energy efficiency improvements

### 🏢 Businesses
- Commercial energy audits
- LED lighting upgrades
- HVAC efficiency
- Industrial decarbonization
- Smart building systems

### 🍽️ Restaurants/Hotels
- Commercial kitchen efficiency
- Food service equipment
- Guest room sustainability
- Water heating systems
- Commercial refrigeration
- Hospitality-specific grants

---

## 📎 Reference: Current Scheme Categories

From existing `schemes.json`:
- Solar (PV, thermal, self-consumption)
- Heat Pumps (air source, ground source)
- Insulation (cavity, loft, external wall)
- EVs (vehicles, charging infrastructure)
- Building Renovation (deep retrofit, refurbishment)
- Industrial Efficiency (process heat, energy audits)
- Certifications (EU Ecolabel, GEEA, Energy Star)
- Compliance (EU Energy Label, Ecodesign)

---

## 🆘 Troubleshooting

### Can't find official source
- Try searching `site:[government-domain] [scheme name]`
- Check if scheme has been renamed
- Verify scheme is still active

### Duplicate detection
- Search existing schemes.json for similar keywords
- Check if scheme is regional variant of existing one
- Use unique ID format: `[country]-[scheme-type]-[short-name]`

### Funding amounts unclear
- Note as "Variable" or "Contact for details"
- Include typical range if available
- Link to official funding calculator if exists

---

## 📞 Key Official Sources

| Region | Main Portal | Contact |
|--------|-------------|---------|
| UK | gov.uk/energy-efficiency | Energy Saving Trust |
| IE | seai.ie | SEAI Helpline |
| NL | rvo.nl | RVO Contact |
| DE | bafa.de, kfw.de | BAFA Service |
| FR | france-renov.gouv.fr | France Rénov |
| BE | Regional portals | Regional contacts |
| ES | idae.es | IDAE |
| PT | fundoambiental.pt | Fundo Ambiental |
| EU | ec.europa.eu/energy | EU Info |

---

**Last Updated:** January 2025  
**Maintained By:** Energy Calculator Backend System

