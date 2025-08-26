// backend/src/config/database.js
import { connect } from 'mongoose';
import { info, error as _error } from '../utils/logger.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_TEST_URI;
    if (!uri) throw new Error('MONGODB_URI not defined in .env');

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // Use new URL parser & unified topology
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    info(`Connecting to MongoDB at ${uri}`);
    const conn = await connect(uri, options);

    info(`Mongoose connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log('Database connection error:', error.message);
    if (error.name === 'MongoParseError') {
      _error('Check that your URI includes a valid database name and credentials.');
    }
    process.exit(1);
  }
};

export default connectDB;
