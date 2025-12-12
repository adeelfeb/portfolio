import mongoose from 'mongoose';
import { env } from './config';

// Resolve MongoDB URI with a safe fallback (prevents startup crashes)
// Don't throw on import - only throw when actually trying to connect
const resolvedUri = env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose
 * Uses cached connection in development to prevent multiple connections
 * during hot reloads
 * @returns {Promise<mongoose.Connection>}
 * @throws {Error} If MONGODB_URI is not set or connection fails
 */
async function connectDB() {
  // Check if URI is available - only throw when actually trying to connect
  if (!resolvedUri) {
    const error = new Error('MONGODB_URI environment variable is not set. Database connection unavailable.');
    error.code = 'NO_DB_URI';
    throw error;
  }

  // If already connected, return the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    };

    // Create connection promise with timeout
    cached.promise = mongoose.connect(resolvedUri, opts)
      .then((mongoose) => mongoose)
      .catch((error) => {
        // Reset promise on error to allow retry
        cached.promise = null;
        throw error;
      });
  }

  try {
    // Wait for connection and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
