#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Energy Calculator Backend Quick Setup');
console.log('=====================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Please create a .env file with your configuration:');
    console.log('   1. Copy config-template.env to .env');
    console.log('   2. Update the values with your actual credentials');
    console.log('   3. Run this script again\n');
    
    console.log('🔧 Required configuration:');
    console.log('   - JWT_SECRET: A secure random string for authentication');
    console.log('   - STRIPE_SECRET_KEY: Your Stripe test/live key');
    console.log('   - WIX_SITE_URL: Your Wix website URL');
    console.log('   - SMTP credentials for email notifications\n');
    
    process.exit(1);
}

console.log('✅ .env file found');
console.log('🔧 Checking dependencies...\n');

// Check package.json dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    console.log('✅ package.json found');
    console.log('📦 Installing dependencies...\n');
    
    const { execSync } = require('child_process');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully\n');
    } catch (error) {
        console.log('❌ Failed to install dependencies');
        console.log('💡 Try running: npm install\n');
        process.exit(1);
    }
}

console.log('🗄️ Setting up database...\n');

// Check if database setup exists
const dbSetupPath = path.join(__dirname, 'database', 'setup.js');
if (fs.existsSync(dbSetupPath)) {
    try {
        execSync('node database/setup.js', { stdio: 'inherit' });
        console.log('✅ Database initialized successfully\n');
    } catch (error) {
        console.log('❌ Database setup failed');
        console.log('💡 Check database/setup.js for errors\n');
    }
}

console.log('🎯 Setup Complete!');
console.log('================\n');
console.log('🚀 To start your energy calculator backend:');
console.log('   npm start          # Production mode');
console.log('   npm run dev        # Development mode with auto-reload\n');
console.log('🌐 Your API will be available at:');
console.log('   http://localhost:4000/api\n');
console.log('📱 Test endpoints:');
console.log('   - GET  /api/members/subscription-tiers');
console.log('   - POST /api/members/register');
console.log('   - POST /api/members/login');
console.log('   - GET  /api/calculate/savings\n');
console.log('🔗 Wix Integration:');
console.log('   1. Start the server');
console.log('   2. Update your Wix site with the integration code');
console.log('   3. Test the membership system\n');
console.log('📚 For detailed setup, see: SETUP_GUIDE.md');
console.log('🔧 For Wix integration, see: wix-integration-guide.md\n');












































