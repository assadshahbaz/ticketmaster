import mongoose from 'mongoose';
import { env } from '../config/env';
import logger from '../config/logger';

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
};

/** Connect the default mongoose connection; models attach to it directly */
const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, mongoOptions);
    logger.info('Connected to MongoDB with a connection pool');
  } catch (err) {
    logger.error({ err }, 'Error connecting to MongoDB');
    process.exit(1); // Exit if connection fails
  }
};

export default connectToMongoDB;
