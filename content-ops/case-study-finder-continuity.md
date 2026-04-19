# Case Study Finder Continuity Log

Purpose: preserve working context between sessions so image replacement work does not rely on chat history.

## Active File

- Target HTML: `HTMLS GWM GWB/European Company - Case Study Finder (Standalone) - Wix bundle.html`
- Current source of truth: user-maintained newer copy (not the older git version).

## Last Known Incident

- A prior automated replacement attempt resulted in the target file becoming zero bytes.
- The attempted task was image URL replacement for specific organizations in inline datasets (`COMPANIES_INLINE` / `ORGS_DIRECTORY_INLINE`).
- Recovery guidance: always keep a timestamped backup before each edit pass.

## Safe Update Method (Use Every Time)

1. Confirm exact target file path before editing.
2. Create a timestamped backup copy of the target file.
3. Locate organization entries by exact name match.
4. Replace only the `imageUrl` value for that organization.
5. Do not run broad whole-file regex rewrites without a scoped preview.
6. Validate after each batch:
   - file is non-empty
   - each requested org exists
   - each requested org now has the expected Wix image URL
7. Record completed replacements in this log.

## Working Rules for This Task

- Apply minimal, surgical edits only.
- Keep all URLs in Wix static format (`https://static.wixstatic.com/media/...`).
- Do not touch unrelated HTML/CSS/JS structure.
- Stop and ask if an org name is ambiguous (for example, variants like "Carbon Tracker" vs "Carbon Tracker Initiative").

## Session Log

### 2026-04-15

- Context reconstructed from transcript history:
  - prior objective was replacing missing org images in Case Study Finder bundle HTML.
  - target names included Carbon Tracker, GEF, TCFD, Hivos, Biomimicry Institute, Skoll Foundation, and AKDN variants.
- User confirmed they will restore from their newer local backup copy before continuing edits.
- Next step when resuming: run the safe update method above and log each completed name + URL.

## Replacement Tracker Template

Copy this block for each new edit batch:

```
Date:
File:
Backup created:
Requested orgs:
- Name -> URL
- Name -> URL

Applied:
- Name -> updated / not found / needs clarification
- Name -> updated / not found / needs clarification

Validation:
- File non-empty: yes/no
- URL checks passed: yes/no
- Notes:
```

