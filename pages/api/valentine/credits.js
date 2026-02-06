import { getValentineCredits } from '../../../controllers/valentineController';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  const user = await authMiddleware(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
  return getValentineCredits(req, res);
}
