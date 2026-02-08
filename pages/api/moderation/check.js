import { checkText, getBlockedMessage } from '../../../lib/contentModeration';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';

/**
 * POST body: { text: string } or { texts: string[] }
 * Returns { blocked: boolean, message?: string } (does not reveal which words).
 * Requires auth (used by dashboard forms).
 */
export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  const user = await authMiddleware(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, 'Method not allowed');
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const text = body.text != null ? String(body.text) : null;
  const texts = Array.isArray(body.texts) ? body.texts.map((t) => (t != null ? String(t) : '')) : null;

  if (text !== null) {
    const { blocked } = checkText(text);
    if (blocked) {
      return jsonSuccess(res, 200, 'OK', { blocked: true, message: getBlockedMessage() });
    }
    return jsonSuccess(res, 200, 'OK', { blocked: false });
  }

  if (texts && texts.length > 0) {
    for (let i = 0; i < texts.length; i++) {
      const { blocked } = checkText(texts[i]);
      if (blocked) {
        return jsonSuccess(res, 200, 'OK', { blocked: true, message: getBlockedMessage() });
      }
    }
    return jsonSuccess(res, 200, 'OK', { blocked: false });
  }

  return jsonError(res, 400, 'Provide body.text (string) or body.texts (array of strings)');
}
