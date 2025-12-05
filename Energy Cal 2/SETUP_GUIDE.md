# 🌱 Green Energy Members Section Setup Guide

## Overview
This guide will help you set up a complete members section for your Wix website that integrates with your existing MPC server backend. The system includes user registration, login, subscription management, and personalized content delivery.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd energy-cal-backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in your `energy-cal-backend` directory with the following:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_PATH=./database/members.db

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Wix Site Configuration
WIX_SITE_URL=https://your-wix-site.com

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Initialize Database
```bash
node database/setup.js
```

### 4. Start Server
```bash
npm start
```

## 🔧 Configuration Details

### Stripe Setup (for payments)
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints for subscription management
4. Update your `.env` file with the keys

### Database Setup
The system uses SQLite for simplicity. The database will be automatically created with:
- Member accounts and profiles
- Subscription tiers and pricing
- Content management system
- Payment history tracking
- Interest-based recommendations

## 📱 Wix Integration

### 1. Create a New Page
In your Wix site, create a new page called "Members" or "Community"

### 2. Add HTML Element
- Add an HTML element to your page
- Copy the entire content from `wix-integration/members-section.html`
- Paste it into the HTML element

### 3. Update API URL
In the HTML file, change this line:
```javascript
const API_BASE_URL = 'http://localhost:4000/api';
```
To your actual server URL:
```javascript
const API_BASE_URL = 'https://your-domain.com/api';
```

### 4. Test the Integration
- Visit your members page
- Try registering a new account
- Test the login functionality
- Explore the subscription tiers

## 🎯 Features Included

### ✅ User Management
- User registration with interest selection
- Secure login with JWT tokens
- Profile management
- Password reset functionality

### ✅ Subscription System
- 4 subscription tiers (Free, Green Member, Eco Professional, Sustainability Partner)
- Stripe payment integration
- Automatic subscription management
- Payment history tracking

### ✅ Content Management
- Tier-based content access
- Interest-based recommendations
- Dynamic content loading
- Category filtering

### ✅ Interest-Based Features
- 15+ sustainability interest categories
- Personalized content recommendations
- Member interest tracking
- Community building tools

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention
- CORS configuration
- Input validation and sanitization

## 📊 Database Schema

### Members Table
- User profiles and authentication
- Subscription information
- Interest preferences
- Account status

### Content Table
- Articles, guides, and tools
- Tier-based access control
- Category and tag organization
- Publication status

### Subscription Tiers
- Pricing information
- Feature lists
- Access limitations
- Billing cycles

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Update environment variables
2. Set up SSL certificates
3. Configure reverse proxy (nginx/Apache)
4. Set up process manager (PM2)
5. Configure database backups

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🧪 Testing

### API Endpoints
Test your endpoints using tools like Postman or curl:

```bash
# Health check
curl http://localhost:4000/health

# Register a new member
curl -X POST http://localhost:4000/api/members/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Get subscription tiers
curl http://localhost:4000/api/members/subscription-tiers
```

## 📱 Mobile Responsiveness

The Wix integration is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔄 Updates and Maintenance

### Regular Tasks
- Monitor server logs
- Backup database regularly
- Update dependencies
- Review payment processing
- Monitor user engagement

### Content Updates
- Add new articles and guides
- Update product recommendations
- Refresh sustainability tips
- Add new interest categories

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check file permissions
   - Verify database path
   - Ensure SQLite is installed

2. **Payment Processing Issues**
   - Verify Stripe API keys
   - Check webhook configuration
   - Review payment logs

3. **Wix Integration Problems**
   - Verify API URL is correct
   - Check CORS settings
   - Ensure server is accessible

### Support
For technical support, check:
- Server logs in `energy-cal-backend/logs/`
- Browser console for JavaScript errors
- Network tab for API call failures

## 🎉 Next Steps

Once your members section is running:

1. **Customize Content**: Add your own sustainability articles and guides
2. **Brand Integration**: Update colors and styling to match your site
3. **Email Marketing**: Set up automated welcome emails and newsletters
4. **Analytics**: Track member engagement and content performance
5. **Community Features**: Add forums, comments, and member interactions

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Test API endpoints individually
5. Ensure your server is accessible from the internet

---

**Happy Building! 🌱♻️**

Your green energy community is ready to grow and make a positive impact on sustainability!
