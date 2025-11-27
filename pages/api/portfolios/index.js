import connectDB from '../../../lib/db';
import authMiddleware from '../../../middlewares/authMiddleware';
import { getAllPortfolios, createPortfolio } from '../../../controllers/portfolioController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;
  await connectDB();

  switch (method) {
    case 'GET':
      // GET doesn't require auth - public access for published portfolios
      return getAllPortfolios(req, res);
    
    case 'POST':
      // POST requires auth
      const user = await authMiddleware(req, res);
      if (!user) return;
      return createPortfolio(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}
