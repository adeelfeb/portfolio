import connectDB from '../../../lib/db';
import authMiddleware from '../../../middlewares/authMiddleware';
import { getAllBlogs, createBlog } from '../../../controllers/blogController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;
  await connectDB();

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

