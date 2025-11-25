import connectDB from '../../../lib/db';
import authMiddleware from '../../../middlewares/authMiddleware';
import { getBlogById, updateBlog, deleteBlog, publishBlog } from '../../../controllers/blogController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method, query } = req;
  if (await applyCors(req, res)) return;
  await connectDB();

  // Extract id from query
  const id = query.id;

  switch (method) {
    case 'GET':
      // GET doesn't require auth - public access
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

