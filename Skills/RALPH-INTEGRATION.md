# 🤖 Ralph Integration - Autonomous Feature Deployment

**Skill Type:** Autonomous Agent Loop for Large Feature Implementation  
**Based On:** [Ralph by snarktank](https://github.com/snarktank/ralph)  
**Purpose:** Execute multi-step features autonomously until all requirements are complete  
**When to Use:** Complex features requiring 5+ distinct implementation steps

---

## 📋 Overview

Ralph is an autonomous AI agent pattern that runs repeatedly until all PRD (Product Requirements Document) items are complete. Each iteration works on one task, commits changes, and updates progress until everything is done.

### How It Fits Our Project

```
┌─────────────────────────────────────────────────────────────────┐
│                 GREENWAYS SKILL ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SKILL-ORCHESTRATOR (Master Router)                            │
│         │                                                        │
│         ├── Individual Skills (Daily tasks)                     │
│         │   ├── Systems MD                                       │
│         │   ├── Media Skill MD                                   │
│         │   ├── Market Manager MD                                │
│         │   └── etc...                                          │
│         │                                                        │
│         └── RALPH INTEGRATION (Large features)                  │
│             ├── PRD Creation                                     │
│             ├── Autonomous Loop                                  │
│             ├── Progress Tracking                                │
│             └── Completion Verification                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 When to Use Ralph vs Regular Skills

| Scenario | Use |
|----------|-----|
| Quick styling change | Regular Skills |
| Single bug fix | Regular Skills |
| Add one feature | Regular Skills |
| **Build new page section** | **Ralph** |
| **Implement complex feature (5+ steps)** | **Ralph** |
| **Major refactoring** | **Ralph** |
| **Multi-file changes with dependencies** | **Ralph** |
| **New integration or system** | **Ralph** |

### Trigger Phrases for Ralph

```
"use Ralph for this"
"create a PRD for"
"autonomous deployment"
"run Ralph loop"
"multi-step feature"
"complex implementation"
"full feature build"
```

---

## 📝 Step 1: Create a PRD (Product Requirements Document)

### PRD Template

Create `tasks/prd-[feature-name].json`:

```json
{
  "featureName": "Feature Name Here",
  "branchName": "feature/feature-name",
  "description": "Brief description of what this feature does",
  "targetSkills": ["Media Skill MD", "Systems MD"],
  "userStories": [
    {
      "id": "US-001",
      "title": "First User Story",
      "description": "As a [user], I want [goal] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "Verify in browser/test"
      ],
      "priority": 1,
      "estimatedEffort": "small",
      "dependencies": [],
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Second User Story",
      "description": "As a [user], I want [goal] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2"
      ],
      "priority": 2,
      "estimatedEffort": "medium",
      "dependencies": ["US-001"],
      "passes": false
    }
  ],
  "qualityChecks": {
    "test": "npm test",
    "lint": "npm run lint",
    "typecheck": "npx tsc --noEmit",
    "manual": ["Check in browser", "Verify on Render"]
  },
  "completionCriteria": "All user stories pass, deployed to Render, verified working"
}
```

### Story Size Guidelines

**Right-sized stories (one context window):**
- Add a new API endpoint
- Create a single HTML component
- Update CSS for one section
- Add a database field
- Fix a specific bug
- Add one Wix integration

**Too big (split these):**
- "Build entire new page" → Split into header, content sections, footer, styling
- "Add authentication" → Split into login, register, session, middleware
- "Refactor the API" → Split by endpoint group

---

## 🔄 Step 2: The Ralph Loop

### Autonomous Execution Process

```
┌─────────────────────────────────────────────────────────────────┐
│                     RALPH EXECUTION LOOP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. CREATE BRANCH                                              │
│      git checkout -b feature/[branchName]                       │
│         ↓                                                        │
│   2. READ PRD                                                    │
│      Load prd-[feature].json                                    │
│         ↓                                                        │
│   3. PICK NEXT STORY                                            │
│      Find highest priority where passes: false                  │
│         ↓                                                        │
│   4. IMPLEMENT STORY                                            │
│      Execute the single user story                              │
│         ↓                                                        │
│   5. QUALITY CHECK                                              │
│      Run tests, lints, manual checks                            │
│         ↓                                                        │
│   6. COMMIT                                                      │
│      git commit -m "[US-XXX] Story title"                       │
│         ↓                                                        │
│   7. UPDATE PRD                                                  │
│      Set passes: true for completed story                       │
│         ↓                                                        │
│   8. UPDATE PROGRESS                                            │
│      Append learnings to progress.txt                           │
│         ↓                                                        │
│   9. CHECK COMPLETION                                           │
│      All stories pass? → DONE                                   │
│      More stories? → Return to Step 3                           │
│         ↓                                                        │
│   10. MERGE & DEPLOY                                            │
│       git push, merge to main, deploy to Render                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Manual Ralph Execution (Cursor)

Since we're using Cursor (not Amp CLI), execute Ralph manually:

```markdown
## Starting Ralph Loop

1. Create the PRD file in tasks/
2. Say: "Start Ralph loop for [feature-name]"
3. I will:
   - Read the PRD
   - Pick the first uncompleted story
   - Implement it
   - Commit with story ID
   - Update PRD to passes: true
   - Update progress.txt
   - Ask to continue to next story

## Continuing Ralph Loop

Say: "Continue Ralph loop" or "Next story"
I will pick the next uncompleted story and repeat.

## Checking Ralph Progress

Say: "Ralph status" or "Check PRD progress"
I will show which stories are done and which remain.
```

---

## 📂 File Structure for Ralph

```
energy-cal-backend/
├── tasks/                          # PRD files
│   ├── prd-[feature-1].json
│   ├── prd-[feature-2].json
│   └── progress.txt                # Learnings across iterations
├── Skills/
│   ├── RALPH-INTEGRATION.md        # This file
│   └── [other skills]
└── AGENTS.md                       # Project-wide learnings (Ralph updates this)
```

---

## 📊 Progress Tracking

### progress.txt Format

```markdown
# Ralph Progress Log

## [DATE] - Feature: [Feature Name]

### Iteration 1 - US-001
- Completed: [Story title]
- Files changed: file1.js, file2.html
- Learnings: [What was discovered]
- Time: ~X minutes

### Iteration 2 - US-002
- Completed: [Story title]
- Files changed: file3.css
- Learnings: [What was discovered]
- Blockers encountered: [If any]

## Summary
- Total iterations: X
- Stories completed: X/X
- Key learnings: [Summary of insights]
```

### AGENTS.md Updates

After each iteration, update `AGENTS.md` with:
- Patterns discovered
- Gotchas found
- Conventions to follow
- Useful context for future

---

## 🚀 Example: Using Ralph for a Complex Feature

### Scenario: Build New "Energy Dashboard" Page

**Step 1: Create PRD**

```json
{
  "featureName": "Energy Dashboard Page",
  "branchName": "feature/energy-dashboard",
  "description": "Create a new dashboard page showing energy metrics and savings",
  "targetSkills": ["html-content-creator", "Media Skill MD"],
  "userStories": [
    {
      "id": "US-001",
      "title": "Create dashboard HTML structure",
      "description": "As a user, I want a basic dashboard layout",
      "acceptanceCriteria": [
        "HTML file created in HTMLs/",
        "Basic responsive structure",
        "Header with title"
      ],
      "priority": 1,
      "estimatedEffort": "small",
      "dependencies": [],
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Add metrics cards section",
      "description": "As a user, I want to see key metrics in cards",
      "acceptanceCriteria": [
        "4 metric cards with icons",
        "Animated counters",
        "Responsive grid"
      ],
      "priority": 2,
      "estimatedEffort": "medium",
      "dependencies": ["US-001"],
      "passes": false
    },
    {
      "id": "US-003",
      "title": "Add chart visualization",
      "description": "As a user, I want to see energy data in charts",
      "acceptanceCriteria": [
        "Bar or line chart",
        "Responsive sizing",
        "Clear labels"
      ],
      "priority": 3,
      "estimatedEffort": "medium",
      "dependencies": ["US-001"],
      "passes": false
    },
    {
      "id": "US-004",
      "title": "Apply professional styling",
      "description": "As a user, I want the dashboard to look professional",
      "acceptanceCriteria": [
        "Dark theme matching site",
        "Wix no-scroll fix applied",
        "Euro/Pound emoji standards"
      ],
      "priority": 4,
      "estimatedEffort": "small",
      "dependencies": ["US-001", "US-002", "US-003"],
      "passes": false
    },
    {
      "id": "US-005",
      "title": "Upload images and deploy",
      "description": "As a user, I want the dashboard live on Render",
      "acceptanceCriteria": [
        "All images uploaded to Wix",
        "Static URLs applied",
        "Deployed to Render",
        "Verified working"
      ],
      "priority": 5,
      "estimatedEffort": "small",
      "dependencies": ["US-004"],
      "passes": false
    }
  ],
  "qualityChecks": {
    "manual": ["Check in browser", "Test on mobile", "Verify on Render"]
  },
  "completionCriteria": "Dashboard live on Render with all features working"
}
```

**Step 2: Start Ralph**

User says: "Start Ralph loop for energy-dashboard"

**Step 3: Execute Iterations**

I will:
1. Implement US-001, commit, mark passes: true
2. Implement US-002, commit, mark passes: true
3. Continue until all pass
4. Deploy and verify

---

## 🔗 Integration with Existing Skills

Ralph uses existing skills during execution:

| Story Type | Skills Used |
|------------|-------------|
| HTML creation | `html-content-creator.md` |
| Image handling | `Media Skill MD.md` |
| API changes | `Systems MD.md` |
| Product updates | `Greenways Market Manager MD.md` |
| Styling | `Media Skill MD.md` (CSS patterns) |

### Continuous Learning Protocol Integration

Ralph iterations **automatically** feed into our Continuous Learning Protocol:
- Each iteration's learnings go to `progress.txt`
- Major discoveries update relevant skill files
- AGENTS.md gets project-wide insights

---

## 📋 Ralph Commands Reference

| Command | Action |
|---------|--------|
| "Create PRD for [feature]" | Generate a new PRD file |
| "Start Ralph loop for [feature]" | Begin autonomous execution |
| "Continue Ralph loop" | Pick next story and execute |
| "Ralph status" | Show completion status |
| "Pause Ralph" | Stop after current story |
| "Ralph learnings" | Show progress.txt summary |
| "Complete Ralph" | Final merge and deploy |

---

## ⚠️ Important Guidelines

### Keep Stories Small

Each story must be completable in one context. If a story seems too big:
- Split it into smaller stories
- Add dependencies between them
- Re-prioritize

### Commit After Each Story

Every completed story gets its own commit:
```bash
git commit -m "[US-001] Create dashboard HTML structure"
git commit -m "[US-002] Add metrics cards section"
```

### Update Progress After Each Iteration

Always append to `progress.txt` what was:
- Completed
- Learned
- Discovered
- Blocked (if anything)

### Verify Before Marking Complete

A story only gets `passes: true` when:
- All acceptance criteria met
- Quality checks pass
- Manually verified (if UI)

---

## 🛠️ Setup Checklist

To use Ralph in this project:

- [x] Create `tasks/` folder for PRDs
- [x] Create `RALPH-INTEGRATION.md` (this file)
- [x] Create `AGENTS.md` for project-wide learnings
- [ ] Create first PRD when needed
- [ ] Run first Ralph loop

---

## 📚 References

- [Ralph GitHub Repository](https://github.com/snarktank/ralph)
- [Geoffrey Huntley's Ralph Pattern](https://ghuntley.com/ralph/)
- [Ryan Carson's Thread](https://x.com/ryancarson/status/2008548371712135632)

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Status:** Ready for use

---

*Use "Start Ralph loop for [feature]" to begin autonomous feature deployment.*
