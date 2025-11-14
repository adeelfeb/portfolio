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

const INITIAL_FORM_STATE = {
  transcript_id: '',
  raw_text: '',
  call_start: '',
  call_end: '',
  caller_number: '',
  agent_name: '',
  ai_parse_json: '',
  parse_confidence: '',
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
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatDateForDisplay(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function preparePayload(formState, { isUpdate = false } = {}) {
  const payload = {};
  Object.entries(formState).forEach(([key, value]) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      return;
    }
    if (key === 'parse_confidence') {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        payload.parse_confidence = parsed;
      }
      return;
    }
    if (key === 'call_start' || key === 'call_end') {
      const date = value ? new Date(value) : null;
      if (date && !Number.isNaN(date.getTime())) {
        payload[key] = date.toISOString();
      }
      return;
    }
    payload[key] = typeof value === 'string' ? value.trim() : value;
  });

  if (!isUpdate && !payload.transcript_id) {
    throw new Error('Transcript ID is required');
  }

  return payload;
}

export default function TranscriptManager({ user }) {
  const canRead = useMemo(() => hasReadAccess(user), [user]);
  const canEdit = useMemo(() => hasFullAccess(user), [user]);

  const [transcripts, setTranscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTranscripts = useCallback(async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/transcripts?limit=100', {
        method: 'GET',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        const message = payload?.message || 'Failed to load transcripts';
        throw new Error(message);
      }
      const data = payload?.data?.items || [];
      setTranscripts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load transcripts');
      setTranscripts([]);
    } finally {
      setIsLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    if (!canRead) return;
    loadTranscripts();
  }, [canRead, loadTranscripts]);

  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setEditingId('');
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
    (transcript) => {
      if (!canEdit) return;
      setEditingId(transcript.transcript_id);
      setFormState({
        transcript_id: transcript.transcript_id || '',
        raw_text: transcript.raw_text || '',
        call_start: formatDateForInput(transcript.call_start),
        call_end: formatDateForInput(transcript.call_end),
        caller_number: transcript.caller_number || '',
        agent_name: transcript.agent_name || '',
        ai_parse_json: transcript.ai_parse_json || '',
        parse_confidence:
          typeof transcript.parse_confidence === 'number' && !Number.isNaN(transcript.parse_confidence)
            ? transcript.parse_confidence.toString()
            : '',
      });
      setStatusMessage('');
      setError('');
    },
    [canEdit]
  );

  const handleDelete = useCallback(
    async (transcript) => {
      if (!canEdit) return;
      const confirmed =
        typeof window === 'undefined'
          ? true
          : window.confirm(`Delete transcript ${transcript.transcript_id}?`);
      if (!confirmed) return;
      setIsSubmitting(true);
      setStatusMessage('');
      setError('');
      try {
        const response = await fetch(
          `/api/transcripts/${encodeURIComponent(transcript.transcript_id)}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Failed to delete transcript';
          throw new Error(message);
        }
        setStatusMessage(`Deleted transcript ${transcript.transcript_id}`);
        await loadTranscripts();
        if (editingId === transcript.transcript_id) {
          resetForm();
        }
      } catch (err) {
        setError(err.message || 'Unable to delete transcript');
      } finally {
        setIsSubmitting(false);
      }
    },
    [canEdit, editingId, loadTranscripts, resetForm]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!canEdit) return;
      setIsSubmitting(true);
      setStatusMessage('');
      setError('');
      try {
        const payload = preparePayload(formState, { isUpdate: Boolean(editingId) });
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId
          ? `/api/transcripts/${encodeURIComponent(editingId)}`
          : '/api/transcripts';
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
            (editingId ? 'Failed to update transcript' : 'Failed to create transcript');
          throw new Error(message);
        }
        setStatusMessage(editingId ? 'Transcript updated successfully' : 'Transcript created successfully');
        await loadTranscripts();
        resetForm();
      } catch (err) {
        setError(err.message || 'Unable to submit transcript');
      } finally {
        setIsSubmitting(false);
      }
    },
    [canEdit, editingId, formState, loadTranscripts, resetForm]
  );

  if (!canRead) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Transcripts</h2>
        <div className={styles.feedback + ' ' + styles.feedbackError}>
          You do not have permission to view transcripts.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <h2 className={styles.heading}>Transcripts</h2>
        </div>
        <div className={styles.headerMeta}>
          {canEdit && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetForm}
              disabled={isSubmitting}
            >
              New Transcript
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
              <span>Transcript ID *</span>
              <input
                type="text"
                name="transcript_id"
                value={formState.transcript_id}
                onChange={handleInputChange}
                required={!editingId}
                disabled={Boolean(editingId)}
              />
            </label>

            <label className={styles.formField}>
              <span>Caller Number</span>
              <input
                type="text"
                name="caller_number"
                value={formState.caller_number}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Agent Name</span>
              <input
                type="text"
                name="agent_name"
                value={formState.agent_name}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Parse Confidence (0-1)</span>
              <input
                type="number"
                name="parse_confidence"
                min="0"
                max="1"
                step="0.01"
                value={formState.parse_confidence}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Call Start</span>
              <input
                type="datetime-local"
                name="call_start"
                value={formState.call_start}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.formField}>
              <span>Call End</span>
              <input
                type="datetime-local"
                name="call_end"
                value={formState.call_end}
                onChange={handleInputChange}
              />
            </label>
          </div>

          <label className={styles.formField}>
            <span>Raw Text</span>
            <textarea
              name="raw_text"
              rows={4}
              value={formState.raw_text}
              onChange={handleInputChange}
              placeholder="Paste transcript text…"
            />
          </label>

          <label className={styles.formField}>
            <span>AI Parse JSON</span>
            <textarea
              name="ai_parse_json"
              rows={3}
              value={formState.ai_parse_json}
              onChange={handleInputChange}
              placeholder='Paste JSON string (e.g. {"key":"value"})'
            />
          </label>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {editingId ? 'Save Changes' : 'Create Transcript'}
            </button>
            {editingId && (
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
          onClick={loadTranscripts}
          className={styles.refreshButton}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>Loading transcripts…</div>
        ) : transcripts.length === 0 ? (
          <div className={`${styles.feedback} ${styles.feedbackInfo}`}>No transcripts recorded yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Transcript ID</th>
                <th>Caller</th>
                <th>Agent</th>
                <th>Call Window</th>
                <th>Confidence</th>
                <th>Updated</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transcripts.map((transcript) => (
                <tr key={transcript.transcript_id}>
                  <td>{transcript.transcript_id}</td>
                  <td>{transcript.caller_number || '—'}</td>
                  <td>{transcript.agent_name || '—'}</td>
                  <td>
                    <div className={styles.tableCellStack}>
                      <span>{formatDateForDisplay(transcript.call_start)}</span>
                      <span className={styles.subtleText}>{formatDateForDisplay(transcript.call_end)}</span>
                    </div>
                  </td>
                  <td>
                    {typeof transcript.parse_confidence === 'number'
                      ? transcript.parse_confidence.toFixed(2)
                      : '—'}
                  </td>
                  <td>{formatDateForDisplay(transcript.updated_at || transcript.created_at)}</td>
                  {canEdit && (
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => handleEdit(transcript)}
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.linkButtonDanger}
                          onClick={() => handleDelete(transcript)}
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


