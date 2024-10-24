import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config();

const mongoURI = process.env.MONGO_URI;

const connectMongoDB = async () => {
    try {
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        // Check if already connected
        if (mongoose.connection.readyState >= 1) {
            console.log('Already connected to MongoDB');
            return;
        }

        // Otherwise, connect
        await mongoose.connect(mongoURI, {
        
            serverSelectionTimeoutMS: 20000, // 10 seconds timeout for initial connection
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
export default connectMongoDB;