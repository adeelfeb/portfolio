/**
 * API Route Handler Wrapper
 * Provides consistent error handling and database connection management
 * Allows API routes to work even without database connection
 */

import connectDB from '../lib/db';

/**
 * Wraps an API route handler with error handling and optional DB connection
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireDB - Whether DB connection is required (default: false)
 * @param {boolean} options.requireAuth - Whether authentication is required (default: false)
 */
export function withApiHandler(handler, options = {}) {
  const { requireDB = false, requireAuth = false } = options;

  return async (req, res) => {
    try {
      // Try to connect to DB if required, but don't fail if unavailable
      let dbConnected = false;
      if (requireDB) {
        try {
          await connectDB();
          dbConnected = true;
        } catch (dbError) {
          if (dbError.code === 'NO_DB_URI') {
            // Database not configured - return graceful error
            return res.status(503).json({
              success: false,
              message: 'Database connection is not available. Please configure MONGODB_URI.',
              error: 'DATABASE_NOT_CONFIGURED',
            });
          }
          // Other DB errors - return service unavailable
          return res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again later.',
            error: 'DATABASE_CONNECTION_FAILED',
          });
        }
      }

      // Call the actual handler
      return await handler(req, res, { dbConnected });
    } catch (error) {
      // Log error in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('[API Handler Error]:', error);
      }

      // Return error response
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? 'INTERNAL_ERROR' : error.message,
      });
    }
  };
}

/**
 * Safe database connection - returns null if unavailable instead of throwing
 */
export async function safeConnectDB() {
  try {
    return await connectDB();
  } catch (error) {
    if (error.code === 'NO_DB_URI') {
      return null; // Database not configured
    }
    throw error; // Re-throw other errors
  }
}

