# Schemes Management System - Admin Guide

**Created:** January 7, 2026  
**Last Updated:** January 7, 2026

---

## 📋 Overview

This system allows you to manage energy efficiency schemes (grants, subsidies, certifications) through a web-based admin dashboard. Changes made in the admin panel automatically appear on the Wix portal.

---

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| **Admin Dashboard** | https://energy-calc-backend.onrender.com/schemes-admin.html |
| **Public Portal** | Embedded in Wix via `eu-energy-schemes.html` |
| **API Endpoint** | https://energy-calc-backend.onrender.com/api/schemes |

---

## 🚀 Getting Started

### First-Time Setup

1. **Set yourself as admin** (one-time):
   ```bash
   node database/set-admin.js
   ```
   
2. **Import existing schemes to MongoDB** (one-time):
   ```bash
   node database/import-schemes.js
   ```

3. **Login to admin dashboard**:
   - Go to: https://energy-calc-backend.onrender.com/schemes-admin.html
   - Login with your member account credentials
   - Email: Stephen.Hanglan@gmail.com

---

## 📅 Monthly Update Process

### End of Month Checklist

1. **Login to Admin Dashboard**
   - https://energy-calc-backend.onrender.com/schemes-admin.html

2. **Click "Update Statuses" button**
   - This automatically marks expired schemes as "expired"
   - Marks schemes expiring within 30 days as "expiring-soon"

3. **Review Expiring Schemes**
   - Filter by Status: "Expiring Soon"
   - For each scheme:
     - Check if deadline has been extended (update deadline)
     - Check if scheme has ended (mark as expired)
     - Check if scheme is being renewed (update details)

4. **Add New Schemes**
   - Click "+ Add Scheme" button
   - Fill in required fields (Title, Description, Type, Region)
   - Add links to official application pages
   - Add keywords for search functionality

5. **Review & Clean Up**
   - Remove outdated schemes
   - Update funding amounts if changed
   - Check all links still work

---

## 📝 How to Add a New Scheme

1. Click **"+ Add Scheme"** button in admin dashboard

2. Fill in the form:

   | Field | Required | Example |
   |-------|----------|---------|
   | Title | ✅ | "ISDE Solar Panel Subsidy" |
   | Description | ✅ | "Subsidy for installing solar panels..." |
   | Type | ✅ | Grant / Subsidy / Loan / Tax Credit / Certification |
   | Region | ✅ | Netherlands / Germany / UK / etc. |
   | Max Funding | Optional | "€5,000" or "Up to 30%" |
   | Deadline | Optional | "2025-12-31" or "Ongoing" |
   | Priority | Optional | High / Medium / Low |
   | Apply Link | Optional | https://www.rvo.nl/... |
   | Keywords | Optional | "solar, residential, heating" |

3. Click **"Save Scheme"**

4. The scheme appears immediately in the portal

---

## 🔍 Admin Dashboard Features

### Filtering
- **By Status**: Active, Expiring Soon, Expired, Paused
- **By Region**: Netherlands, Germany, UK, Ireland, etc.
- **By Type**: Grant, Subsidy, Loan, Tax Credit, Certification

### Actions
- **Edit**: Click pencil icon to modify scheme
- **Delete**: Click trash icon to remove scheme
- **Export**: Download all schemes as JSON backup

### Automatic Features
- **Status Updates**: "Update Statuses" button marks expired schemes
- **Expiring Warnings**: Dashboard shows count of schemes expiring soon
- **Urgent Alerts**: Shows schemes expiring within 7 days

---

## 🛠 Technical Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Wix Widget     │────▶│    API Server    │────▶│    MongoDB      │
│  (portal)       │     │  /api/schemes    │     │   (schemes)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               ▲
                               │
                        ┌──────┴──────┐
                        │ Admin Page  │
                        │ (you)       │
                        └─────────────┘
```

### Data Flow
1. You make changes in admin dashboard
2. Changes saved to MongoDB via API
3. Portal fetches from API on page load
4. Users see updated schemes

### Fallback System
If API is unavailable, the portal falls back to:
1. Local `schemes.json` file
2. Embedded data (62 schemes)

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `models/Scheme.js` | MongoDB schema definition |
| `routes/schemes.js` | API endpoints |
| `schemes-admin.html` | Admin dashboard |
| `eu-energy-schemes.html` | Public portal (for Wix) |
| `database/import-schemes.js` | Import script |
| `schemes.json` | Backup/fallback data |

---

## 🔐 Security

### Admin Access
- Only users with `role: 'admin'` or `role: 'superadmin'` can access admin endpoints
- JWT token required for all admin operations
- Session expires after 30 days

### Setting New Admins
```bash
# Run locally with MongoDB connection
node database/set-admin.js newuser@email.com
```

---

## 🆘 Troubleshooting

### "Admin access required" error
- Your account doesn't have admin role
- Run: `node database/set-admin.js your@email.com`

### Schemes not showing on portal
1. Check API is running: https://energy-calc-backend.onrender.com/health
2. Check schemes exist: https://energy-calc-backend.onrender.com/api/schemes
3. Clear browser cache on Wix site

### Can't login to admin dashboard
- Reset password via: `node database/reset-password.js`
- Or use the membership portal password reset

### Changes not appearing
- Render server may need to restart
- Check browser console for errors
- Wait 2-3 minutes for Render deploy

---

## 📞 Support

For technical issues with the system:
- Check Render dashboard for server status
- Review server logs in Render
- Contact system administrator

---

## 📊 Scheme Types Reference

| Type | Description | Example |
|------|-------------|---------|
| **Grant** | Direct funding, no repayment | Horizon Europe grants |
| **Subsidy** | Partial cost coverage | ISDE heat pump subsidy |
| **Loan** | Low/zero interest borrowing | KfW Energy Efficiency loans |
| **Tax Credit** | Tax deduction/reduction | EIA investment deduction |
| **Certification** | Required compliance/label | EPC Energy Label |
| **Rebate** | Post-purchase refund | Utility rebates |
| **Feed-in Tariff** | Payment for energy export | Smart Export Guarantee |

---

## 🌍 Supported Regions

- 🇪🇺 EU-Wide
- 🇳🇱 Netherlands
- 🇩🇪 Germany
- 🇪🇸 Spain
- 🇵🇹 Portugal
- 🇫🇷 France
- 🇧🇪 Belgium
- 🇬🇧 United Kingdom
- 🇮🇪 Ireland

---

*This document is stored in the project folder for reference.*

