# 📈 Rate Consultant (Energy Price Insights)

**Skill Type:** Insights + UX Guidance  
**Purpose:** Turn wholesale energy price trends into customer-friendly insights without claiming retail bill accuracy  
**Output:** Insight copy, badges, widgets, and safe messaging for Greenways pages

---

## 📋 Overview

This skill transforms **wholesale price trends** (e.g., ENTSO‑E) into **safe, useful messaging** that supports Greenways low‑energy product sales, grants, and retrofit services.

Focus on **trend‑based insights** (not actual customer bills), and always include a short disclaimer.

---

## ✅ What This Skill Produces

- **Trend badges** (e.g., “Prices trending up this week”)
- **Savings‑potential indicators** (High / Medium / Low)
- **Educational captions** explaining wholesale vs retail
- **CTA modules** linking to grants or product upgrades
- **Monthly insight copy** (30‑day avg vs prior period)

---

## 🎯 When to Use

Use this skill when the user asks:
- “Can we use energy prices for insights?”
- “How can we show value based on price trends?”
- “Add a price trend module under the ticker”
- “Create an energy savings insight”

---

## 🧠 Messaging Rules (IMPORTANT)

- **Never claim exact retail bill impacts**
- Use **trend language** only: “above/below average”, “rising”, “falling”
- Provide **example tariffs** only if clearly labeled as illustrative
- Add a **one‑line disclaimer** on any insight module

Example disclaimer:
> *Wholesale market trends do not equal retail tariffs; actual bills vary by supplier and contract.*

---

## 🧩 Example UI Modules

### 1) Trend Badge
- “Market prices ↑ vs 30‑day average”
- “Lower than last month”

### 2) Savings Potential
- “Savings potential: **High** (prices elevated this week)”
- “Savings potential: **Medium** (prices stable)”

### 3) Education Caption
- “Wholesale prices influence retail tariffs with delay.”

### 4) CTA Module
- “High prices = higher payoff for efficiency upgrades → Explore Greenways”

---

## 🔌 Data Inputs (Optional)

From `/api/energy-ticker`:
- Latest price by region
- 7/30‑day average (if available)
- Change percentage

If averages are not provided, compute locally using the last 7–30 samples.

---

## 📦 Recommended Output Location

- HTML modules: `content-ops/drafts/rate-consultant/`
- Reusable snippets: `wix-integration/`

---

## ✅ Success Criteria

- Adds value without misleading claims
- Clear “trend” framing
- Strong CTA tie‑in to low‑energy products or grants
- Mobile‑friendly blocks

---

**Last Updated:** January 2026  
**Maintained By:** Greenways Content + Systems
