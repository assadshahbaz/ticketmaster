import mongoose from 'mongoose';
import { env } from '../config/env';

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
};

/** Connect the default mongoose connection; models attach to it directly */
const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, mongoOptions);
    console.log('Connected to MongoDB with a connection pool');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit if connection fails
  }
};

export default connectToMongoDB;
