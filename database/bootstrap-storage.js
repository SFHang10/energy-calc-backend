/**
 * Resolve members + companies routers: MongoDB when configured and connected,
 * otherwise SQLite / JSON fallbacks (runtime fallback, not only USE_MONGODB=false).
 */

const { connectMongoDB } = require('./mongodb');

function wantsMongoDB() {
  return process.env.USE_MONGODB === 'true' && Boolean(process.env.MONGODB_URI);
}

/**
 * @returns {Promise<{
 *   wantMongo: boolean,
 *   mongoConnected: boolean,
 *   membersRouter: import('express').Router,
 *   companiesRouter: import('express').Router,
 *   membersBackend: string,
 *   companiesBackend: string
 * }>}
 */
async function bootstrapStorageRouters() {
  const wantMongo = wantsMongoDB();

  if (!wantMongo) {
    console.log('📁 Storage: SQLite members + JSON companies (USE_MONGODB not enabled)');
    return {
      wantMongo: false,
      mongoConnected: false,
      membersRouter: require('../routes/members'),
      companiesRouter: require('../routes/companies'),
      membersBackend: 'sqlite',
      companiesBackend: 'json'
    };
  }

  console.log('🔗 Storage: MongoDB preferred — testing connection…');
  const mongoConnected = await connectMongoDB();

  if (mongoConnected) {
    console.log('✅ Storage: MongoDB connected — members + companies use MongoDB routers');
    return {
      wantMongo: true,
      mongoConnected: true,
      membersRouter: require('../routes/members-mongodb'),
      companiesRouter: require('../routes/companies-mongodb'),
      membersBackend: 'mongodb',
      companiesBackend: 'mongodb'
    };
  }

  console.warn('⚠️ Storage: MongoDB unavailable — falling back to SQLite members + JSON companies');
  console.warn('💡 Fix MONGODB_URI (Atlas → Database Access user password) or set USE_MONGODB=false for local SQLite-only mode');
  return {
    wantMongo: true,
    mongoConnected: false,
    membersRouter: require('../routes/members'),
    companiesRouter: require('../routes/companies'),
    membersBackend: 'sqlite-fallback',
    companiesBackend: 'json-fallback'
  };
}

module.exports = {
  wantsMongoDB,
  bootstrapStorageRouters
};
