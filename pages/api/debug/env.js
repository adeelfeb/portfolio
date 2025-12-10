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
  
  // Add additional diagnostic info
  const additionalInfo = {
    ...debugInfo,
    recommendations: [],
  };
  
  // Check if email config is missing
  if (!process.env.SMTP2GO_API_KEY && !process.env.SMTP_USERNAME) {
    additionalInfo.recommendations.push(
      'Add SMTP2GO_API_KEY to your .env or .env.local file for email functionality'
    );
  }
  
  if (!process.env.SMTP2GO_FROM_EMAIL && !process.env.SMTP_FROM) {
    additionalInfo.recommendations.push(
      'Add SMTP2GO_FROM_EMAIL to your .env or .env.local file'
    );
  }
  
  return jsonSuccess(res, 200, 'Environment variable debug info', additionalInfo);
}

