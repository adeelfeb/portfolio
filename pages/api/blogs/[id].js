import { requireDB } from '../../../lib/dbHelper';
import authMiddleware from '../../../middlewares/authMiddleware';
import { getBlogById, updateBlog, deleteBlog, publishBlog } from '../../../controllers/blogController';
import { getUserFromRequest } from '../../../lib/auth';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method, query } = req;
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  // Extract id from query
  const id = query.id;

  switch (method) {
    case 'GET':
      // GET doesn't require auth, but check if user is authenticated for permission checks
      // This allows authors to view their own drafts
      req.user = await getUserFromRequest(req);
      req.query.id = id;
      return getBlogById(req, res);
    
    case 'PUT':
      const user = await authMiddleware(req, res);
      if (!user) return;
      req.query.id = id;
      return updateBlog(req, res);
    
    case 'DELETE':
      const deleteUser = await authMiddleware(req, res);
      if (!deleteUser) return;
      req.query.id = id;
      return deleteBlog(req, res);
    
    case 'PATCH':
      // PATCH is used for publishing
      const patchUser = await authMiddleware(req, res);
      if (!patchUser) return;
      req.query.id = id;
      if (req.body?.action === 'publish') {
        return publishBlog(req, res);
      }
      return updateBlog(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

