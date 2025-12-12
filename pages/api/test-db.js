import connectDB from '../../lib/db';
import mongoose from 'mongoose';
import { applyCors } from '../../utils';

// Define a simple Test schema
const TestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model if it doesn't exist, otherwise use existing model
// This prevents "Cannot overwrite model" errors during hot reloads
const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

/**
 * Example API route demonstrating MongoDB connection with Mongoose
 * Access at: http://localhost:3000/api/test-db
 */
export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      // Try to connect to MongoDB - graceful failure if unavailable
      try {
        await connectDB();
      } catch (dbError) {
        if (dbError.code === 'NO_DB_URI') {
          return res.status(200).json({
            success: false,
            message: 'Database not configured. MONGODB_URI environment variable is not set.',
            error: 'DATABASE_NOT_CONFIGURED',
            timestamp: new Date().toISOString(),
          });
        }
        throw dbError;
      }

      // Create a new test document
      const testDoc = new Test({
        name: `Test Document - ${new Date().toISOString()}`,
      });

      // Save the document to the database
      const savedDoc = await testDoc.save();

      // Return the saved document as JSON
      res.status(200).json({
        success: true,
        message: 'MongoDB connection successful!',
        data: {
          id: savedDoc._id,
          name: savedDoc.name,
          createdAt: savedDoc.createdAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(200).json({
        success: false,
        message: 'Error connecting to MongoDB or saving document',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

