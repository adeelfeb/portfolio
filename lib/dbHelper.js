import connectDB from './db';
import { jsonError } from './response';

/**
 * Helper function to ensure database connection in API routes
 * Returns the connection if successful, or sends an error response and returns null
 * @param {Object} res - Express response object
 * @returns {Promise<Object|null>} - Database connection or null if unavailable
 */
export async function requireDB(res) {
  const dbResult = await connectDB();
  if (!dbResult.success) {
    if (res) {
      jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
    }
    return null;
  }
  return dbResult.connection;
}

/**
 * Helper function to check database connection without sending response
 * Useful for conditional logic
 * @returns {Promise<boolean>} - True if database is available
 */
export async function isDBAvailable() {
  const dbResult = await connectDB();
  return dbResult.success;
}
