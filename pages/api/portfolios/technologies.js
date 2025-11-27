import connectDB from '../../../lib/db';
import { getTechnologies } from '../../../controllers/portfolioController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;
  await connectDB();

  // Technologies endpoint is public
  if (method === 'GET') {
    return getTechnologies(req, res);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
}

