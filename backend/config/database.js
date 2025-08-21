const mongoose = require('mongoose');

let isConnected = false;

const initializeDatabase = async () => {
  try {
    // Build MongoDB connection string
    const mongoUri = process.env.MONGODB_URI ||
      `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || 'dost_logbook'}`;

    // Connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Add authentication if provided
    if (process.env.DB_USER && process.env.DB_PASSWORD) {
      options.auth = {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      };
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);

    isConnected = true;
    console.log(`✅ MongoDB connection established successfully`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'dost_logbook'}`);

    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

const testConnection = async () => {
  try {
    if (!isConnected) {
      throw new Error('Database not initialized');
    }

    // Test the connection by getting database stats
    const admin = mongoose.connection.db.admin();
    await admin.ping();

    console.log('🔄 Database connection tested successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

const closeConnection = async () => {
  try {
    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('🔌 MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
  isConnected = false;
});

// Handle application termination
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

module.exports = {
  mongoose,
  initializeDatabase,
  testConnection,
  closeConnection
};
