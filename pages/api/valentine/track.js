import { trackValentineEvents } from '../../../controllers/valentineController';
import { applyCors } from '../../../utils';
import { requireDB } from '../../../lib/dbHelper';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  return trackValentineEvents(req, res);
}
