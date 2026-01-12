# 🤖 Ralph Quick Guide

**What:** Autonomous AI agent for deploying complex features  
**When:** Use for features requiring 5+ steps or multi-file changes  
**Based On:** [Ralph by snarktank](https://github.com/snarktank/ralph)

---

## ⚡ Quick Start

### 1. Create a PRD
```
Say: "Create a PRD for [describe your feature]"
```
This creates a task list in `tasks/prd-[feature].json`

### 2. Start Ralph
```
Say: "Start Ralph loop for [feature-name]"
```
Ralph will execute stories one by one automatically.

### 3. Continue
```
Say: "Continue Ralph loop" or "Next story"
```
Ralph picks the next uncompleted story and implements it.

### 4. Check Status
```
Say: "Ralph status"
```
See which stories are done and which remain.

---

## 🎯 When to Use Ralph

| ✅ Use Ralph For | ❌ Use Regular Skills For |
|------------------|---------------------------|
| Build new page (5+ sections) | Quick styling change |
| Multi-file feature | Single bug fix |
| Major integration | One API endpoint |
| Complex workflow | Simple HTML update |
| Systematic refactoring | Image replacement |

---

## 📝 Trigger Phrases

| Say This | Ralph Does |
|----------|------------|
| "Create a PRD for..." | Generate task list |
| "Start Ralph loop for..." | Begin autonomous execution |
| "Continue Ralph loop" | Next story |
| "Next story" | Next story |
| "Ralph status" | Show progress |
| "Use Ralph for this" | Activate Ralph mode |

---

## 🔄 How Ralph Works

```
1. CREATE PRD
   └── User stories with acceptance criteria
         ↓
2. PICK STORY
   └── Highest priority where passes: false
         ↓
3. IMPLEMENT
   └── Complete the story
         ↓
4. COMMIT
   └── git commit -m "[US-XXX] Story title"
         ↓
5. UPDATE
   └── Mark passes: true, update progress.txt
         ↓
6. REPEAT
   └── Until all stories pass
         ↓
7. COMPLETE
   └── Deploy and verify
```

---

## 📂 Ralph Files

| File | Purpose |
|------|---------|
| `tasks/prd-[feature].json` | Your feature's task list |
| `tasks/progress.txt` | Learnings across iterations |
| `AGENTS.md` | Project-wide knowledge base |
| `Skills/RALPH-INTEGRATION.md` | Full documentation |

---

## 📋 PRD Format (Example)

```json
{
  "featureName": "Energy Dashboard",
  "branchName": "feature/energy-dashboard",
  "userStories": [
    {
      "id": "US-001",
      "title": "Create HTML structure",
      "acceptanceCriteria": ["File created", "Responsive layout"],
      "priority": 1,
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Add metrics cards",
      "acceptanceCriteria": ["4 cards", "Animated counters"],
      "priority": 2,
      "dependencies": ["US-001"],
      "passes": false
    }
  ]
}
```

---

## ✅ Story Size Guide

**Good (fits one iteration):**
- Add one page section
- Create one component
- Update one API endpoint
- Add one feature to existing page

**Too Big (split these):**
- "Build entire page" → Split by section
- "Add authentication" → Split by function
- "Refactor everything" → Split by file/area

---

## 🚀 Example Session

```
User: "Create a PRD for a new product comparison page"

[Ralph creates tasks/prd-product-comparison.json with 6 stories]

User: "Start Ralph loop for product-comparison"

[Ralph implements US-001, commits, marks complete]

Ralph: "✅ US-001 complete. Ready for US-002. Say 'continue' or 'next story'"

User: "Continue"

[Ralph implements US-002, commits, marks complete]

... continues until all stories pass ...

Ralph: "🎉 All stories complete! Feature deployed."
```

---

## 📚 Full Documentation

For complete details, see:
- `Skills/RALPH-INTEGRATION.md` - Full process documentation
- `AGENTS.md` - Project learnings and conventions

---

*Say "Start Ralph loop for [feature]" to begin autonomous deployment.*
