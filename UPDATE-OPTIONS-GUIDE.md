# Keeping Your Schemes Updated - Complete Guide

## 🎯 The Problem
Your product qualification portal needs to stay current with:
- New grants and subsidies
- Updated deadlines
- Changed requirements
- Expired or closed schemes

## 📋 ALL AVAILABLE OPTIONS

### Option 1: Manual Updates (Recommended for Accuracy)
**Best for:** Small teams, legal accuracy, control

**How it works:**
- You manually check government sites
- Update `schemes.json` when you find changes
- Upload the updated file

**Pros:**
- ✅ 100% accurate
- ✅ No risk of legal issues
- ✅ Full control
- ✅ Simple

**Cons:**
- ❌ Requires time commitment
- ❌ Can miss updates if not checked regularly

**Time needed:** 15-30 minutes per week

---

### Option 2: Automatic Page Checker (Implemented in v2)
**Best for:** Real-time updates without backend

**How it works:**
- The portal checks `schemes.json` for changes
- Shows a "Check for Updates" button
- Auto-checks when you open the page

**Implementation:**
- Already built into `product-qualification-search-v2.html`
- Just add timestamps and version numbers to your JSON

**Pros:**
- ✅ Built-in to portal
- ✅ No backend needed
- ✅ User-triggered updates

**Cons:**
- ❌ Only updates when you upload new JSON
- ❌ Still requires manual curation

---

### Option 3: Backend API with Web Scraping
**Best for:** Fully automated updates, larger organizations

**How it works:**
1. Backend service checks government sites (daily/hourly)
2. Parses pages for new schemes
3. Adds them to database
4. Portal fetches from your API

**Setup:**
```javascript
// Use the scheme-update-checker.js I created
node scheme-update-checker.js

// Or integrate into Express
const { SchemeUpdateChecker } = require('./scheme-update-checker');
const checker = new SchemeUpdateChecker();
checker.startScheduler(); // Runs daily at 9 AM
```

**Pros:**
- ✅ Fully automated
- ✅ Always up-to-date
- ✅ Detects changes automatically

**Cons:**
- ❌ Requires coding/maintenance
- ❌ Sites may block scrapers
- ❌ Legal/compliance risks
- ❌ Parsing can break if sites change

**Time needed:** 4-8 hours initial setup, ongoing maintenance

---

### Option 4: Third-Party APIs & Services
**Best for:** No technical maintenance

**Services:**
1. **Zapier/Make.com** - Monitor gov sites, auto-add to your JSON
2. **Google Alerts** - Get emails when new grants announced
3. **RSS Feeds** - Subscribe to government RSS (if available)
4. **Government APIs** - If governments provide official APIs

**Setup Google Alerts:**
```
Search term: "RVO subsidie" OR "Nederland subsidie"
How often: As-it-happens
How many: Up to 50 results
```

**Setup Zapier:**
1. Trigger: Check website (RVO.nl) daily
2. If new content detected
3. Action: Add to Google Sheets
4. Format as JSON
5. Update your schemes.json

**Pros:**
- ✅ Minimal technical skills
- ✅ Reliable
- ✅ Offloads work

**Cons:**
- ❌ Costs money (Zapier)
- ❌ Still needs review for accuracy
- ❌ May not catch everything

**Time needed:** 1-2 hours setup

---

### Option 5: Hybrid Approach (RECOMMENDED)
**Best for:** Balance of automation and accuracy

**Implementation:**
1. **Automated monitoring** (Google Alerts, RSS)
   - Get notified of new schemes
   - Forward to your email

2. **Weekly review** (15-30 min)
   - Check emails/notifications
   - Review new schemes
   - Update `schemes.json`

3. **Monthly audit** (1 hour)
   - Check for deadline changes
   - Remove expired schemes
   - Verify links still work

4. **Portal auto-check** (built-in)
   - Users can click "Check for Updates"
   - Portal detects JSON changes

**Workflow Example:**
```
Monday Morning:
├── Check Google Alerts (5 min)
├── Review any new scheme emails (10 min)
└── Update schemes.json if needed (10 min)

Monthly (First Monday):
├── Audit all deadlines (20 min)
├── Verify all links work (20 min)
└── Remove expired schemes (10 min)
```

**Time: 25-50 minutes/week**

---

## 🚀 RECOMMENDED SETUP FOR YOU

Based on your needs, I recommend **Hybrid Approach**:

### Step 1: Set Up Google Alerts
1. Go to google.com/alerts
2. Set up alerts for:
   - "RVO subsidie nieuwe"
   - "Nederland subsidie duurzaam"
   - "EU subsidie groen"
3. Choose "As-it-happens"
4. Set emails to filter into a folder

### Step 2: Use the Built-in Update Checker
The `product-qualification-search-v2.html` already has:
- Auto-update on page load
- "Check for Updates" button
- Update notifications
- Timestamp tracking

### Step 3: Weekly Review Process
```markdown
Every Monday:
1. Check email alerts (5 min)
2. Visit key sites:
   - rvo.nl/subsidies-financiering
   - business.gov.nl
   - topsectorenergie.nl
3. Update schemes.json with new schemes
4. Upload to your website
```

### Step 4: Optional Automation
If you want more automation:
1. Install the Node.js checker
2. Run it on a schedule
3. Review results weekly

---

## 📊 COMPARISON TABLE

| Method | Setup Time | Maintenance | Accuracy | Cost | Best For |
|--------|-----------|-------------|----------|------|----------|
| Manual | 0 min | Weekly | ⭐⭐⭐⭐⭐ | Free | Everyone |
| Google Alerts | 10 min | Weekly | ⭐⭐⭐⭐ | Free | Small teams |
| Web Scraping | 8 hours | Monthly | ⭐⭐⭐ | Free | Developers |
| Zapier/Make | 1 hour | Minimal | ⭐⭐⭐⭐ | Paid | No-code |
| Hybrid | 30 min | Weekly | ⭐⭐⭐⭐⭐ | Free | Recommended |

---

## 🛠️ IMPLEMENTATION EXAMPLES

### Example 1: Google Alert Setup
```
Alert Name: Dutch Green Grants
Query: "RVO subsidie" OR "Nederland subsidie duurzaam"
Region: Netherlands
Language: Dutch, English
Frequency: As-it-happens
Deliver to: your@email.com
```

### Example 2: Zapier Workflow
```
Trigger: RSS Feed (RVO.nl feed)
Filter: New items with "subsidie" or "grant"
Action 1: Save to Google Sheets
Action 2: Format as JSON
Action 3: Upload to your server (via FTP)
```

### Example 3: Manual Update Workflow
```
1. Go to rvo.nl/subsidies-financiering
2. Look for "NIEUW" or "ACTUEEL" badges
3. Read scheme details
4. Add to schemes.json:
   {
     "id": "unique-id",
     "title": "Scheme Name",
     "keywords": [...],
     ...
   }
5. Upload schemes.json
```

---

## 🔔 KEY SITES TO MONITOR

### Must Check Weekly:
- https://www.rvo.nl/subsidies-financiering
- https://business.gov.nl
- https://www.topsectorenergie.nl

### Check Monthly:
- https://eu-ecolabel.nl
- https://www.circulairplatform.nl
- https://www.rijkswaterstaat.nl

### Government Newsletters:
- RVO Newsletter (sign up on rvo.nl)
- Business.gov.nl newsletter
- EU Environment News

---

## 💡 PRO TIPS

### Tip 1: Use Version Control
```bash
# Track changes to schemes.json
git add schemes.json
git commit -m "Added new ISDE scheme"
```

### Tip 2: Backup Before Updates
Always backup your current `schemes.json` before making changes!

### Tip 3: Test Before Going Live
1. Make changes in a test environment
2. Verify JSON syntax
3. Test the portal
4. Upload to live site

### Tip 4: Document Your Sources
Add a `source` field to track where each scheme came from:
```json
{
  "id": "isde",
  "source": "https://www.rvo.nl/isde",
  "lastVerified": "2025-09-26",
  ...
}
```

### Tip 5: Set Up Notifications
- Calendar reminder: "Check schemes every Monday"
- Browser bookmark: Save key government URLs
- Task manager: Create recurring "Update grants" task

---

## 🚨 URGENT SCHEME ALERTS

Watch for these immediate action items:
- ✋ Deadlines moved up by 1+ weeks
- 💰 New schemes worth €100k+
- 🏢 Schemes matching your business type
- ⚠️ Compliance requirements changed

---

## 📅 MAINTENANCE SCHEDULE RECOMMENDATION

### Daily (2 minutes):
- Check Google Alert emails
- Quick scan of RVO homepage

### Weekly (15-30 minutes):
- Review all new alert emails
- Check urgent deadline schemes
- Update any time-sensitive info

### Monthly (1 hour):
- Full audit of all schemes
- Verify all links still work
- Remove expired schemes
- Update deadlines
- Check for new scheme types

### Quarterly (2 hours):
- Review scheme categories
- Optimize keywords for better matching
- Analyze which schemes get most interest
- Refine search/matching logic

---

## 🤝 NEED HELP?

If you want:
- **More automation** → Set up Zapier/webhooks
- **More accuracy** → Stick with manual updates
- **More monitoring** → Use Google Alerts + Zapier
- **Zero maintenance** → Hire a VA to do weekly updates
- **Custom solution** → Use the Node.js checker I provided

---

## ✨ QUICK START RECOMMENDATION

**For You Right Now:**

1. ✅ Use `product-qualification-search-v2.html` (has built-in update checking)
2. ✅ Set up 3 Google Alerts (10 minutes)
3. ✅ Commit to checking alerts every Monday morning
4. ✅ Keep it simple - manual updates work best for accuracy

**Next Level (if you want more automation):**

1. Install the Node.js checker I provided
2. Run it as a scheduled task
3. Review output weekly
4. Update schemes.json manually (keep quality high)

---

**Remember:** Accuracy > Automation

For legal/grants information, you always want human review. The automated checking helps you find updates, but you should validate before adding to the portal.

