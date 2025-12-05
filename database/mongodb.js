/**
 * MongoDB Connection Module
 * Handles MongoDB connection with automatic reconnection and error handling
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.MONGO_URI || 
                   process.env.DATABASE_URL;

let isConnected = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return true;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('💡 MongoDB will not be used. Set MONGODB_URI to enable MongoDB.');
    return false;
  }

  // Mask password in logs
  const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
  console.log(`🔗 Connecting to MongoDB... (${maskedUri})`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    isConnected = true;
    connectionAttempts = 0;
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Set up event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
      
      // Attempt reconnection
      if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
        connectionAttempts++;
        console.log(`🔄 Attempting reconnection (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(() => connectMongoDB(), 5000);
      } else {
        console.error('❌ Max reconnection attempts reached. MongoDB unavailable.');
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
      connectionAttempts = 0;
    });
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    
    if (error.message.includes('authentication')) {
      console.error('💡 Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('💡 Check your MongoDB cluster URL');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Check network access and IP whitelist in MongoDB Atlas');
    }
    
    return false;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectMongoDB() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  }
}

/**
 * Check if MongoDB is connected
 */
function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB connection status
 */
function getConnectionStatus() {
  return {
    connected: isMongoDBConnected(),
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
}

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  isMongoDBConnected,
  getConnectionStatus,
  mongoose
};






