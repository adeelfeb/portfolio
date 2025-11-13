import connectDB from '../../../lib/db';
import User from '../../../models/User';
import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { ensureRole } from '../../../lib/roles';
import { ensureDefaultHrUser } from '../../../lib/defaultUsers';

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  return /.+@.+\..+/.test(value.trim());
}

const MIN_PASSWORD_LENGTH = 6;

export default async function handler(req, res) {
  const { method } = req;
  await connectDB();

  switch (method) {
    case 'GET': {
      try {
        await ensureDefaultHrUser();
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return jsonSuccess(res, 200, 'Ok', { users });
      } catch (err) {
        return jsonError(res, 500, 'Failed to fetch users', err.message);
      }
    }
    case 'POST': {
      try {
        const user = await authMiddleware(req, res);
        if (!user) return;
        if (!roleMiddleware(['admin', 'superadmin', 'hr', 'hr_admin'])(req, res)) return;
        const { name, email, password, role } = req.body || {};
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const trimmedPassword = typeof password === 'string' ? password.trim() : '';
        const normalizedRole =
          typeof role === 'string' && role.trim() ? role.trim().toLowerCase() : 'base_user';

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
          return jsonError(res, 400, 'Name, email, and password are required');
        }
        if (!isValidEmail(trimmedEmail)) {
          return jsonError(res, 400, 'Invalid email format');
        }
        if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
          return jsonError(res, 400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        }

        const exists = await User.findOne({ email: trimmedEmail });
        if (exists) return jsonError(res, 409, 'Email already in use');

        const roleDoc = await ensureRole(
          normalizedRole,
          `Role created via user creation endpoint: ${normalizedRole}`
        );

        const created = await User.create({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          role: roleDoc.name,
          roleRef: roleDoc._id,
        });

        const safe = {
          id: created._id,
          name: created.name,
          email: created.email,
          role: created.role,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
        return jsonSuccess(res, 201, 'User created', { user: safe });
      } catch (err) {
        return jsonError(res, 500, 'Failed to create user', err.message);
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return jsonError(res, 405, `Method ${method} not allowed`);
    }
  }
}

