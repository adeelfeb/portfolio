import { requireDB } from '../../../lib/dbHelper';
import authMiddleware from '../../../middlewares/authMiddleware';
import { getAllBlogs, createBlog } from '../../../controllers/blogController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  switch (method) {
    case 'GET':
      return getAllBlogs(req, res);
    
    case 'POST':
      const user = await authMiddleware(req, res);
      if (!user) return;
      return createBlog(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}














