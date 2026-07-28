const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.warn('MONGO_URI is not set — skipping MongoDB connection. Set it in .env to enable persistence.');
    return null;
  }

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error(`MongoDB connection error: ${err.message}`));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  try {
    await mongoose.connect(uri);
    return mongoose.connection;
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    throw err;
  }
}

module.exports = connectDB;
