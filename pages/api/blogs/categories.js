import connectDB from '../../../lib/db';
import { getCategories } from '../../../controllers/blogController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;
  await connectDB();

  // Categories endpoint is public
  if (method === 'GET') {
    return getCategories(req, res);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
}

