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
let connectPromise = null;
let listenersAttached = false;
let reconnectTimer = null;

function attachConnectionListenersOnce() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
    isConnected = false;

    // Avoid overlapping reconnection timers
    if (reconnectTimer) return;
    if (connectPromise) return;

    // Don't retry forever
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ Max reconnection attempts reached. MongoDB unavailable.');
      return;
    }

    connectionAttempts++;
    console.log(`🔄 Attempting reconnection (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null;
      await connectMongoDB();
    }, 5000);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
    isConnected = true;
    connectionAttempts = 0;
  });
}

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return true;
  }

  // If another caller is already connecting, await it
  if (connectPromise) {
    return connectPromise;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('💡 MongoDB will not be used. Set MONGODB_URI to enable MongoDB.');
    return false;
  }

  // Mask password in logs
  const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
  console.log(`🔗 Connecting to MongoDB... (${maskedUri})`);

  connectPromise = (async () => {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });

      attachConnectionListenersOnce();
      isConnected = true;
      connectionAttempts = 0;
      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongoose.connection.db?.databaseName || mongoose.connection.name || '(unknown)'}`);
      console.log(`   Host: ${mongoose.connection.host || '(unknown)'}`);
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      isConnected = false;

      if (error.message.includes('authentication') || error.message.includes('bad auth')) {
        console.error('💡 Check your MongoDB username and password');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
        console.error('💡 Check your MongoDB cluster URL');
      } else if (error.message.includes('timeout')) {
        console.error('💡 Check network access and IP whitelist in MongoDB Atlas');
      }

      return false;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
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






