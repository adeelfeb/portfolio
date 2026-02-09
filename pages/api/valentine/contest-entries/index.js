import { getContestEntries } from '../../../../controllers/valentineController';
import authMiddleware from '../../../../middlewares/authMiddleware';
import roleMiddleware from '../../../../middlewares/roleMiddleware';
import { applyCors } from '../../../../utils';
import { jsonError } from '../../../../lib/response';
import { requireDB } from '../../../../lib/dbHelper';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!roleMiddleware(['developer', 'superadmin'])(req, res)) return;
  return getContestEntries(req, res);
}
