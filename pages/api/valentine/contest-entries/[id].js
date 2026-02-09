import { updateContestEntry, deleteContestEntry } from '../../../../controllers/valentineController';
import authMiddleware from '../../../../middlewares/authMiddleware';
import roleMiddleware from '../../../../middlewares/roleMiddleware';
import { applyCors } from '../../../../utils';
import { jsonError } from '../../../../lib/response';
import { requireDB } from '../../../../lib/dbHelper';

export const config = {
  api: {
    bodyParser: { sizeLimit: '2kb' },
  },
};

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!roleMiddleware(['developer', 'superadmin'])(req, res)) return;

  const id = req.query?.id;
  if (!id) {
    return jsonError(res, 400, 'Entry ID is required');
  }

  switch (req.method) {
    case 'PATCH':
      return updateContestEntry(req, res);
    case 'DELETE':
      return deleteContestEntry(req, res);
    default:
      res.setHeader('Allow', ['PATCH', 'DELETE']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}
