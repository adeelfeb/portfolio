import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { applyCors } from '../../../utils';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';
import { parseImportFile, applyImport } from '../../../lib/backup';

const ALLOWED_ROLES = ['developer', 'superadmin'];

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!roleMiddleware(ALLOWED_ROLES)(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return jsonError(res, 400, 'Request body must be JSON with format and content.');
  }

  const { format: formatParam, content: base64Content } = body;
  if (!base64Content || typeof base64Content !== 'string') {
    return jsonError(res, 400, 'Missing or invalid "content" (base64-encoded file).');
  }

  let buffer;
  try {
    buffer = Buffer.from(base64Content, 'base64');
  } catch {
    return jsonError(res, 400, 'Invalid base64 content.');
  }
  if (!buffer.length) {
    return jsonError(res, 400, 'File content is empty.');
  }

  const lower = (formatParam || '').toLowerCase();
  let format = 'json';
  if (lower === 'excel' || lower === 'xlsx' || lower === 'xls') format = 'excel';

  try {
    const data = await parseImportFile(buffer, format);
    const results = await applyImport(data);

    const summary = {};
    let totalInserted = 0;
    let totalSkipped = 0;
    for (const [key, r] of Object.entries(results)) {
      summary[key] = { inserted: r.inserted, skipped: r.skipped };
      totalInserted += r.inserted;
      totalSkipped += r.skipped;
    }

    return jsonSuccess(res, 200, 'Import completed.', {
      summary,
      totalInserted,
      totalSkipped,
      details: results,
    });
  } catch (err) {
    console.error('[Backup import]', err);
    return jsonError(res, 500, 'Import failed', err.message);
  }
}
