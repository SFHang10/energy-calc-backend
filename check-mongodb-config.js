/**
 * MongoDB Configuration Checker
 * Helps identify where MongoDB is configured and what needs to be updated
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking MongoDB Configuration...\n');

// Check for .env file
const envPath = path.join(__dirname, '.env');
const envTemplatePath = path.join(__dirname, 'config-template.env');

console.log('📁 Checking for environment files:');
if (fs.existsSync(envPath)) {
    console.log('   ✅ .env file found');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const mongoVars = envContent.split('\n').filter(line => 
        line.toLowerCase().includes('mongo') || 
        line.toLowerCase().includes('database_url')
    );
    if (mongoVars.length > 0) {
        console.log('   ⚠️  MongoDB-related variables found (showing keys only for security):');
        mongoVars.forEach(line => {
            const key = line.split('=')[0].trim();
            console.log(`      - ${key}`);
        });
    } else {
        console.log('   ℹ️  No MongoDB variables found in .env');
    }
} else {
    console.log('   ❌ .env file not found');
    console.log('   💡 You may need to create one from config-template.env');
}

if (fs.existsSync(envTemplatePath)) {
    console.log('   ✅ config-template.env found');
}

// Check package.json for MongoDB dependencies
console.log('\n📦 Checking package.json:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.mongodb) {
        console.log(`   ✅ mongodb: ${deps.mongodb}`);
    }
    if (deps.mongoose) {
        console.log(`   ✅ mongoose: ${deps.mongoose}`);
    }
}

// Check for MongoDB connection code
console.log('\n🔍 Searching for MongoDB connection code:');
const filesToCheck = [
    'server-new.js',
    'app.js',
    'routes/members.js',
    'services/wix-membership-service.js'
];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.toLowerCase().includes('mongodb') || 
            content.toLowerCase().includes('mongoose') ||
            content.toLowerCase().includes('mongoclient')) {
            console.log(`   ⚠️  Potential MongoDB usage in: ${file}`);
        }
    }
});

// Check for environment variable usage
console.log('\n🔍 Checking for environment variable usage:');
const envVarPatterns = [
    /process\.env\.MONGODB/i,
    /process\.env\.MONGO/i,
    /process\.env\.DATABASE_URL/i
];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        envVarPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                const matches = content.match(new RegExp(pattern.source + '[^\\s;\\n]*', 'gi'));
                if (matches) {
                    console.log(`   ⚠️  Found in ${file}:`);
                    matches.forEach(match => {
                        console.log(`      - ${match.trim()}`);
                    });
                }
            }
        });
    }
});

console.log('\n📋 Summary:');
console.log('   1. MongoDB packages are installed (mongodb, mongoose)');
console.log('   2. Check your .env file for MONGODB_URI or similar');
console.log('   3. Check Render dashboard for environment variables');
console.log('   4. MongoDB connection code may be in deployment environment only');
console.log('\n✅ Next Steps:');
console.log('   1. Log into MongoDB Atlas: https://cloud.mongodb.com/');
console.log('   2. Go to Organization → Settings → Service Accounts');
console.log('   3. Find expired account and generate new secret');
console.log('   4. Update environment variables in:');
console.log('      - .env file (local)');
console.log('      - Render dashboard (production)');
console.log('   5. Restart services after update');







