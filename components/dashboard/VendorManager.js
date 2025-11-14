import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../../styles/AdminDataManager.module.css';

const FULL_ACCESS_ROLES = new Set(['superadmin', 'hr_admin', 'hr']);
const READ_ACCESS_ROLES = new Set([
  'superadmin',
  'hr_admin',
  'hr',
  'admin',
  'base_user',
  'simple_user',
]);

const STATUS_OPTIONS = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'non_compliant', label: 'Non-Compliant' },
  { value: 'needs_review', label: 'Needs Review' },
];

const INITIAL_FORM_STATE = {
  compliance_id: '',
  vendor_id: '',
  license_number: '',
  license_expiry: '',
  insurance_policy: '',
  insurance_expiry: '',
  insurance_coverage: '',
  wcb_number: '',
  status: 'needs_review',
  ai_confidence: '',
  missing_items: '',
  rationale: '',
};

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function hasFullAccess(user) {
  return FULL_ACCESS_ROLES.has(normalizeRole(user?.role));
}

function hasReadAccess(user) {
  return READ_ACCESS_ROLES.has(normalizeRole(user?.role));
}

function formatDateForInput(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function serializeMissingItems(value) {
  if (!Array.isArray(value)) return '';
  return value.join('\n');
}

function parseMissingItems(value) {
  if (!value) return [];
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function preparePayload(formState, { isUpdate = false } = {}) {
  const payload = {};

  Object.entries(formState).forEach(([key, value]) => {
    if (value === '' || value == null) {
      return;
    }
    if (key === 'ai_confidence') {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        payload.ai_confidence = parsed;
      }
      return;
    }
    if (key === 'insurance_coverage') {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        payload.insurance_coverage = parsed;
      }
      return;
    }
    if (key === 'missing_items') {
      payload.missing_items = parseMissingItems(value);
      return;
    }
    if (key === 'license_expiry' || key === 'insurance_expiry') {
      const date = value ? new Date(value) : null;
      if (date && !Number.isNaN(date.getTime())) {
        payload[key] = date.toISOString();
      }
      return;
    }
    payload[key] = typeof value === 'string' ? value.trim() : value;
  });

  if (!isUpdate && !payload.compliance_id) {
    throw new Error('Compliance ID is required');
  }
  if (!isUpdate && !payload.vendor_id) {
    throw new Error('Vendor ID is required');
  }

  return payload;
}

export default function VendorManager({ user }) {
  const canRead = useMemo(() => hasReadAccess(user), [user]);
  const canEdit = useMemo(() => hasFullAccess(user), [user]);

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [editingComplianceId, setEditingComplianceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/vendors?limit=100', {
        method: 'GET',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        const message = payload?.message || 'Failed to load vendor compliance records';
        throw new Error(message);
      }
      const data = payload?.data?.items || [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load vendor compliance records');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    if (!canRead) return;
    loadRecords();
  }, [canRead, loadRecords]);

  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setEditingComplianceId('');
    setStatusMessage('');
    setError('');
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleEdit = useCallback(
    (record) => {
      if (!canEdit) return;
      setEditingComplianceId(record.compliance_id);
      setFormState({
        compliance_id: record.compliance_id || '',
        vendor_id: record.vendor_id || '',
        license_number: record.license_number || '',
        license_expiry: formatDateForInput(record.license_expiry),
        insurance_policy: record.insurance_policy || '',
        insurance_expiry: formatDateForInput(record.insurance_expiry),
        insurance_coverage:
          typeof record.insurance_coverage === 'number' && !Number.isNaN(record.insurance_coverage)
            ? record.insurance_coverage.toString()
            : '',
        wcb_number: record.wcb_number || '',
        status: record.status || 'needs_review',
        ai_confidence:
          typeof record.ai_confidence === 'number' && !Number.isNaN(record.ai_confidence)
            ? record.ai_confidence.toString()
            : '',
        missing_items: serializeMissingItems(record.missing_items),
        rationale: record.rationale || '',
      });
      setStatusMessage('');
      setError('');
    },
    [canEdit]
  );

  const handleDelete = useCallback(
    async (record) => {
      if (!canEdit) return;
      const confirmed =
        typeof window === 'undefined'
          ? true
          : window.confirm(`Delete compliance record ${record.compliance_id}?`);
      if (!confirmed) return;
      setIsSubmitting(true);
      setStatusMessage('');
      setError('');
      try {
        const response = await fetch(
          `/api/vendors/${encodeURIComponent(record.compliance_id)}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Failed to delete compliance record';
          throw new Error(message);
        }
        setStatusMessage(`Deleted compliance record ${record.compliance_id}`);
        await loadRecords();
        if (editingComplianceId === record.compliance_id) {
          resetForm();
        }
      } catch (err) {
        setError(err.message || 'Unable to delete compliance record');
      } finally {
        setIsSubmitting(false);
      }
    },
    [canEdit, editingComplianceId, loadRecords, resetForm]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!canEdit) return;
      setIsSubmitting(true);
      setStatusMessage('');
      setError('');
      try {
        const payload = preparePayload(formState, { isUpdate: Boolean(editingComplianceId) });
        const method = editingComplianceId ? 'PUT' : 'POST';
        const url = editingComplianceId
          ? `/api/vendors/${encodeURIComponent(editingComplianceId)}`
          : '/api/vendors';
        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
          const message =
            data?.message ||
            (editingComplianceId
              ? 'Failed to update compliance record'
              : 'Failed to create compliance record');
          throw new Error(message);
        }
        setStatusMessage(
          editingComplianceId
            ? 'Compliance record updated successfully'
            : 'Compliance record created successfully'
        );
        await loadRecords();
        resetForm();
      } catch (err) {
        setError(err.message || 'Unable to submit compliance record');
      } finally {
        setIsSubmitting(false);
      }
    },
    [canEdit, editingComplianceId, formState, loadRecords, resetForm]
  );

  if (!canRead) {
    return (
      <div className={styles.container}>
        <div className={styles.feedback + ' ' + styles.feedbackError}>
          You do not have permission to view vendor compliance records.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <h2 className={styles.heading}>Vendors</h2>
        </div>
        <div className={styles.headerMeta}>
          {canEdit && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetForm}
              disabled={isSubmitting}
            >
              New Compliance Record
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`${styles.feedback} ${styles.feedbackSuccess}`}>{statusMessage}</div>
      )}
      {error && <div className={`${styles.feedback} ${styles.feedbackError}`}>{error}</div>}

      {canEdit && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.formField}>
              <span>Compliance ID *</span>
              <input
                type="text"
                name="compliance_id"
                value={formState.compliance_id}
                onChange={handleInputChange}
                required={!editingComplianceId}
                disabled={Boolean(editingComplianceId)}
              />
            </label>

            <label className={styles.formField}>
              <span>Vendor ID *</span>
              <input
                type="text"
                name="vendor_id"
                value={formState.vendor_id}
                onChange={handleInputChange}
                required={!editingComplianceId}
                disabled={Boolean(editingComplianceId)}
              />
            </label>

            <label className={styles.formField}>
              <span>License Number</span>
              <input
                type="text"
                name="license_number"
                value={formState.license_number}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>License Expiry</span>
              <input
                type="date"
                name="license_expiry"
                value={formState.license_expiry}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Insurance Policy</span>
              <input
                type="text"
                name="insurance_policy"
                value={formState.insurance_policy}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Insurance Expiry</span>
              <input
                type="date"
                name="insurance_expiry"
                value={formState.insurance_expiry}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Insurance Coverage ($)</span>
              <input
                type="number"
                name="insurance_coverage"
                min="0"
                step="1000"
                value={formState.insurance_coverage}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>WCB Number</span>
              <input
                type="text"
                name="wcb_number"
                value={formState.wcb_number}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Status</span>
              <select name="status" value={formState.status} onChange={handleInputChange}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.formField}>
              <span>AI Confidence (0-100)</span>
              <input
                type="number"
                name="ai_confidence"
                min="0"
                max="100"
                step="0.1"
                value={formState.ai_confidence}
                onChange={handleInputChange}
              />
            </label>
          </div>

          <label className={styles.formField}>
            <span>Missing Items</span>
            <textarea
              name="missing_items"
              rows={3}
              placeholder="Enter one item per line"
              value={formState.missing_items}
              onChange={handleInputChange}
            />
          </label>

          <label className={styles.formField}>
            <span>Rationale</span>
            <textarea
              name="rationale"
              rows={3}
              placeholder="Add AI rationale or notes"
              value={formState.rationale}
              onChange={handleInputChange}
            />
          </label>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {editingComplianceId ? 'Save Changes' : 'Create Compliance Record'}
            </button>
            {editingComplianceId && (
              <button
                type="button"
                onClick={resetForm}
                className={styles.secondaryButton}
                disabled={isSubmitting}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className={styles.listHeader}>
        <button
          type="button"
          onClick={loadRecords}
          className={styles.refreshButton}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>
            Loading compliance records…
          </div>
        ) : records.length === 0 ? (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>
            No compliance records yet.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Compliance ID</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Coverage</th>
                <th>License</th>
                <th>Insurance</th>
                <th>Confidence</th>
                <th>Missing Items</th>
                <th>Created</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.compliance_id}>
                  <td>{record.compliance_id}</td>
                  <td>
                    <div className={styles.tableCellStack}>
                      <strong>{record.vendor_id || '—'}</strong>
                      <span className={styles.subtleText}>{record.wcb_number || 'No WCB'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.badge}>{record.status || 'needs_review'}</span>
                  </td>
                  <td>
                    {typeof record.insurance_coverage === 'number'
                      ? `$${record.insurance_coverage.toLocaleString()}`
                      : '—'}
                  </td>
                  <td>
                    <div className={styles.tableCellStack}>
                      <span>{record.license_number || '—'}</span>
                      <span className={styles.subtleText}>
                        {record.license_expiry ? formatDateTime(record.license_expiry) : '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.tableCellStack}>
                      <span>{record.insurance_policy || '—'}</span>
                      <span className={styles.subtleText}>
                        {record.insurance_expiry ? formatDateTime(record.insurance_expiry) : '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {typeof record.ai_confidence === 'number'
                      ? `${record.ai_confidence.toFixed(1)}%`
                      : '—'}
                  </td>
                  <td>
                    <div className={styles.tableCellStack}>
                      {Array.isArray(record.missing_items) && record.missing_items.length > 0 ? (
                        record.missing_items.map((item) => (
                          <span key={item} className={styles.subtleText}>
                            • {item}
                          </span>
                        ))
                      ) : (
                        <span className={styles.subtleText}>None</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDateTime(record.created_at)}</td>
                  {canEdit && (
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => handleEdit(record)}
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.linkButtonDanger}
                          onClick={() => handleDelete(record)}
                          disabled={isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

