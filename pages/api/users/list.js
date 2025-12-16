import { requireDB } from '../../../lib/dbHelper';
import User from '../../../models/User';
import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { ensureDefaultHrUser } from '../../../lib/defaultUsers';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const sessionUser = await authMiddleware(req, res);
  if (!sessionUser) return;
  if (!roleMiddleware(['admin', 'superadmin', 'hr', 'hr_admin'])(req, res)) return;

  try {
    const db = await requireDB(res);
    if (!db) return;
    await ensureDefaultHrUser();
    const users = await User.find()
      .select('name email role createdAt updatedAt')
      .sort({ createdAt: -1 });

    const normalizedUsers = users.map((userDoc) => ({
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    }));

    return jsonSuccess(res, 200, 'Users fetched', normalizedUsers);
  } catch (error) {
    return jsonError(res, 500, 'Failed to fetch users', error.message);
  }
}


