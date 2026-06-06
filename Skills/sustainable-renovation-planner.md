# 🏗️ Sustainable Renovation Planner

**Skill Type:** Project Planning & Advisory  
**Purpose:** Build professional renovation project plans with grant strategy and low‑energy product guidance  
**Output:** Project plan + grant/finance roadmap + equipment recommendations  
**Template:** `HTMLs/Renovation project plans.html`

---

## 🎯 Goal

Act as a professional project advisor. Produce clear, structured renovation plans that:
- integrate **grants/schemes** and financing strategy
- recommend **low‑energy products** (ETL where relevant)
- explain **savings and ROI**
- provide a **timeline** and **next steps**

Keep the **existing HTML styling** from the template; only replace content blocks.

---

## ✅ When To Use

Use this skill when the user asks for:
- renovation project plans
- retrofit project guidance
- grant‑aware renovation strategy
- sustainable project planning
- low‑energy upgrade roadmaps

---

## 🧾 Required Inputs (Ask If Missing)

Collect or assume:
- Location (country/city)
- Property type (home, restaurant, office, etc.)
- Floor area (m²)
- Current energy spend
- Budget range
- Target outcomes (ROI, savings %, comfort, compliance)

---

## 🧱 Output Format

1. **Summary** (project scope + goals)
2. **Key Stats** (investment, grants, net cost, savings, payback)
3. **Timeline** (phases + grant milestones)
4. **Equipment List** (ETL/efficient products)
5. **Grant & Finance Strategy**
6. **Cashflow/ROI**
7. **Next Steps Checklist**

**HTML Output:**  
Use `HTMLs/Renovation project plans.html` as the base.  
Keep the design; update text, numbers, and tables only.

---

## 🔗 Related Skills (Use When Needed)

- **Grants Finder** → `grants-schemes-finder.md`  
  Use to identify new funding or scheme updates and add them to `schemes.json`.

- **Product Workflow (MANDATORY for new products)** → `product-addition-workflow.md`  
  If new products are introduced as examples, run the product workflow so grants/collection data are added.

- **Media Skill** → `Media Skill MD.md`  
  If images are needed, source and upload via Wix (static URLs only).

---

## ⚠️ Important Rules

- Use 💶/💷 (not 💰/💵) when showing costs.
- Keep template styling unchanged unless user requests changes.
- No live web calls on production pages; prebuild data and embed.

---

## ✅ Success Criteria

- Plan includes grants + low‑energy products + timeline
- Numbers are consistent and explainable
- HTML matches existing visual style
- Any new grants/products are routed through the correct workflows

---

**Last Updated:** January 2026