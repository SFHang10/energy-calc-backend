/**
 * Set Admin Role Script
 * Run: node database/set-admin.js [email]
 * 
 * Default: Sets Stephen.Hanglan@gmail.com as superadmin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment');
    console.log('💡 Add MONGODB_URI to your .env file');
    process.exit(1);
}

// Member schema (simplified for this script)
const memberSchema = new mongoose.Schema({
    email: String,
    passwordHash: String,
    name: { first: String, last: String },
    role: { type: String, default: 'member' },
    permissions: [String],
    subscriptionTier: String,
    subscriptionStatus: String
}, { strict: false });

const Member = mongoose.model('Member', memberSchema);

async function setAdmin() {
    const email = process.argv[2] || 'Stephen.Hanglan@gmail.com';
    const newPassword = process.argv[3] || 'Greenways2025!';
    
    console.log('🔌 Connecting to MongoDB...');
    
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected to MongoDB');
        
        // Find the member
        let member = await Member.findOne({ email: email.toLowerCase() });
        
        if (!member) {
            console.log(`⚠️ User ${email} not found. Creating new admin account...`);
            
            const passwordHash = await bcrypt.hash(newPassword, 10);
            
            member = new Member({
                email: email.toLowerCase(),
                passwordHash,
                name: { first: 'Admin', last: 'User' },
                role: 'superadmin',
                permissions: ['manage_schemes', 'manage_members', 'manage_products', 'view_analytics', 'manage_content'],
                subscriptionTier: 'Premium',
                subscriptionStatus: 'active'
            });
            
            await member.save();
            console.log('✅ Admin account created!');
        } else {
            console.log(`✅ Found user: ${member.email}`);
            
            // Update role and permissions
            member.role = 'superadmin';
            member.permissions = ['manage_schemes', 'manage_members', 'manage_products', 'view_analytics', 'manage_content'];
            
            // Reset password
            member.passwordHash = await bcrypt.hash(newPassword, 10);
            
            await member.save();
            console.log('✅ User updated to superadmin!');
            console.log('✅ Password has been reset!');
        }
        
        console.log('\n═══════════════════════════════════════');
        console.log('📋 Account Details:');
        console.log(`   Email: ${member.email}`);
        console.log(`   Password: ${newPassword}`);
        console.log(`   Role: ${member.role}`);
        console.log(`   Permissions: ${member.permissions?.join(', ')}`);
        console.log('═══════════════════════════════════════');
        console.log('\n🔗 Login at: https://energy-calc-backend.onrender.com/schemes-admin.html');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

setAdmin();

