import { debugEnv } from '../../../lib/config';
import { jsonSuccess } from '../../../lib/response';
import { applyCors } from '../../../utils';

/**
 * Debug endpoint to check environment variable loading
 * GET /api/debug/env
 * Only available in development mode
 */
export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'This endpoint is only available in development' });
  }

  const debugInfo = debugEnv();
  return jsonSuccess(res, 200, 'Environment variable debug info', debugInfo);
}

