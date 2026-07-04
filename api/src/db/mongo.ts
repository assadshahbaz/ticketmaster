import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
};

// Create and export a pooled connection
const connectToMongoDB = async (): Promise<Connection> => {
    try {
        const connection = await mongoose.createConnection(process.env.MONGO_URI as string, mongoOptions).asPromise();
        console.log('Connected to MongoDB with a connection pool');
        return connection;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if connection fails
    }
};

export default connectToMongoDB;
