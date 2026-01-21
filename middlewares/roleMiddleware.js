import { jsonError } from '../lib/response';

export default function roleMiddleware(allowedRoles = []) {
  const normalized = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res) => {
    if (!req.user) {
      jsonError(res, 401, 'Authentication required');
      return false;
    }
    if (!normalized.length) {
      return true;
    }
    // Grant full access to superadmin and developer roles
    const hasAccess = normalized.includes(req.user.role) || req.user.role === 'superadmin' || req.user.role === 'developer';
    if (!hasAccess) {
      jsonError(res, 403, 'Insufficient role permissions');
      return false;
    }
    return true;
  };
}


