/**
 * Fix scheme statuses
 * Sets all schemes to 'active' status
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ Set MONGODB_URI in .env (Atlas → Database Access → user password in connection string)');
  process.exit(1);
}

async function fixStatuses() {
    console.log('🔌 Connecting to MongoDB...');
    
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });
        console.log('✅ Connected to MongoDB');
        
        // First, let's see current status distribution
        const statusCounts = await Scheme.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('\n📊 Current status distribution:');
        statusCounts.forEach(s => console.log(`   ${s._id}: ${s.count}`));
        
        // Set all to active (except those that should be expiring-soon)
        console.log('\n🔄 Setting all schemes to active...');
        
        const result = await Scheme.updateMany(
            {},  // All schemes
            { $set: { status: 'active' } }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} schemes to 'active' status`);
        
        // Set specific ones to expiring-soon
        const expiringSoonResult = await Scheme.updateMany(
            { 
                title: { 
                    $in: [
                        'Salderingsregeling',  // Until 2027 (phasing out)
                        'Umweltbonus - E-Vehicle Subsidy'  // 2024 (reduced)
                    ] 
                } 
            },
            { $set: { status: 'expiring-soon' } }
        );
        console.log(`✅ Set ${expiringSoonResult.modifiedCount} schemes to 'expiring-soon'`);
        
        // Verify final counts
        const finalCounts = await Scheme.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('\n📊 Final status distribution:');
        finalCounts.forEach(s => console.log(`   ${s._id}: ${s.count}`));
        
        const total = await Scheme.countDocuments();
        console.log(`\n📁 Total schemes: ${total}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Done!');
        process.exit(0);
    }
}

fixStatuses();

