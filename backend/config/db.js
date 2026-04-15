const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Try connecting to the configured MongoDB URI first
  if (uri && uri !== 'mongodb+srv://parivarmart:parivarmart2026@cluster0.mongodb.net/parivar_mart?retryWrites=true&w=majority') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`⚠️  MongoDB Atlas connection failed: ${error.message}`);
      console.log('💡 Falling back to in-memory MongoDB for development...\n');
    }
  } else {
    console.log('⚠️  No custom MongoDB URI configured. Using in-memory MongoDB for development.');
  }

  // Fallback: Use in-memory MongoDB server for development
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ MongoDB In-Memory Connected (development mode)`);
    console.log(`   ⚠️  Data will NOT persist after server restart`);
    console.log(`   💡 Set MONGO_URI in .env for persistent storage\n`);
    
    // Store reference to stop it on process exit
    process.on('SIGINT', async () => {
      await mongod.stop();
      process.exit(0);
    });
  } catch (memError) {
    console.error('❌ Could not start MongoDB (neither Atlas nor in-memory)');
    console.error('   Error:', memError.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Set MONGO_URI in .env to your MongoDB Atlas connection string');
    console.error('   2. Get a free Atlas cluster: https://cloud.mongodb.com');
    process.exit(1);
  }
};

module.exports = connectDB;
