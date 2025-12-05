# 🚀 Energy Calculator Deployment Guide

## Quick Setup

1. **Copy config template:**
   ```bash
   cp config-template.env .env
   ```

2. **Edit .env with your values:**
   - JWT_SECRET (random string)
   - STRIPE_SECRET_KEY (from Stripe dashboard)
   - WIX_SITE_URL (your Wix site)

3. **Install & start:**
   ```bash
   npm install
   node quick-setup.js
   npm start
   ```

## Wix Integration

1. Add HTML element to your Wix page
2. Copy code from `wix-integration/members-section.html`
3. Update API URL to your server domain
4. Test registration and login

## Features Available

- User registration/login
- Subscription management
- Energy savings calculator
- Member-only content
- Stripe payments

Your API will be at: `https://your-domain.com/api`









