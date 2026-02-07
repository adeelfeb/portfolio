import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { applyCors } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';
import { getBackupData, backupDataToExcelBuffer } from '../../../lib/backup';

const ALLOWED_ROLES = ['developer', 'superadmin'];

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!roleMiddleware(ALLOWED_ROLES)(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const format = (req.query.format || 'json').toLowerCase();
  if (format !== 'json' && format !== 'excel') {
    return jsonError(res, 400, 'Invalid format. Use json or excel.');
  }

  try {
    const data = await getBackupData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup-${timestamp}`;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.status(200).send(JSON.stringify(data, null, 2));
    }

    const buffer = await backupDataToExcelBuffer(data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('[Backup export]', err);
    return jsonError(res, 500, 'Export failed', err.message);
  }
}
