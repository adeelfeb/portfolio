import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { deleteRole } from '../../../controllers/roleController';
import { jsonError } from '../../../lib/response';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!roleMiddleware(['admin', 'superadmin', 'developer'])(req, res)) return;
  return deleteRole(req, res);
}


