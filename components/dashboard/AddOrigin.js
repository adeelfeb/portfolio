import { useCallback, useEffect, useMemo, useState } from 'react';

const EMPTY_FORM = {
  origin: '',
  label: '',
  description: '',
};

function sanitizeOrigin(origin = '') {
  return origin.trim();
}

export default function AddOrigin() {
  const [origins, setOrigins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ ...EMPTY_FORM, isActive: true });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const activeCount = useMemo(
    () => origins.filter((origin) => origin.isActive).length,
    [origins]
  );

  const fetchOrigins = useCallback(
    async (options = {}) => {
      const response = await fetch('/api/allowed-origins', {
        signal: options.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to load allowed origins');
      }
      return Array.isArray(payload?.data?.origins) ? payload.data.origins : [];
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchOrigins({ signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) {
          setOrigins(items);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err.name === 'AbortError') return;
        setError(err?.message || 'Unable to load allowed origins');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [fetchOrigins]);

  const refreshOrigins = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const items = await fetchOrigins();
      setOrigins(items);
    } catch (err) {
      setError(err?.message || 'Unable to refresh allowed origins');
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrigins]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedOrigin = sanitizeOrigin(form.origin);
    if (!trimmedOrigin) {
      setMessage({ type: 'error', text: 'Origin URL is required.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/allowed-origins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: trimmedOrigin,
          label: form.label.trim(),
          description: form.description.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to add origin');
      }

      const created = payload?.data?.origin;
      if (created) {
        setOrigins((prev) => [created, ...prev]);
      } else {
        await refreshOrigins();
      }

      setMessage({ type: 'success', text: payload?.message || 'Origin added' });
      setForm(EMPTY_FORM);
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Unable to add origin' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (origin) => {
    setEditingId(origin.id);
    setEditingForm({
      origin: origin.origin || '',
      label: origin.label || '',
      description: origin.description || '',
      isActive: Boolean(origin.isActive),
    });
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingForm({ ...EMPTY_FORM, isActive: true });
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editingId || isSavingEdit) return;

    const trimmedOrigin = sanitizeOrigin(editingForm.origin);
    if (!trimmedOrigin) {
      setMessage({ type: 'error', text: 'Origin URL is required.' });
      return;
    }

    setIsSavingEdit(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/allowed-origins/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: trimmedOrigin,
          label: editingForm.label.trim(),
          description: editingForm.description.trim(),
          isActive: Boolean(editingForm.isActive),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to update origin');
      }

      const updated = payload?.data?.origin;
      if (updated) {
        setOrigins((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        await refreshOrigins();
      }

      setMessage({ type: 'success', text: payload?.message || 'Origin updated' });
      handleCancelEdit();
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Unable to update origin' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (origin) => {
    if (!origin || togglingId) return;

    setTogglingId(origin.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/allowed-origins/${origin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !origin.isActive }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to update origin status');
      }

      const updated = payload?.data?.origin;
      if (updated) {
        setOrigins((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        await refreshOrigins();
      }

      setMessage({ type: 'success', text: payload?.message || 'Origin status updated' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Unable to update origin status' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (origin) => {
    if (!origin || deletingId === origin.id) return;

    const confirmed =
      typeof window === 'undefined'
        ? true
        : window.confirm(`Remove "${origin.origin}" from allowed origins?`);
    if (!confirmed) return;

    setDeletingId(origin.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/allowed-origins/${origin.id}`, {
        method: 'DELETE',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to delete origin');
      }

      setOrigins((prev) => prev.filter((item) => item.id !== origin.id));
      setMessage({ type: 'success', text: payload?.message || 'Origin removed' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Unable to delete origin' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="origins-manager">
      <div className="origins-header">
        <div className="origins-heading">
          <h2>Add Origin</h2>
          <p>Manage which domains are allowed to call protected API routes.</p>
        </div>
        <div className="origins-meta">
          <span className="badge">
            {activeCount} active {activeCount === 1 ? 'origin' : 'origins'}
          </span>
          <button
            type="button"
            className="refresh"
            onClick={refreshOrigins}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <form className="create-form" onSubmit={handleCreate}>
        <div className="field-group">
          <label className="field">
            <span>Origin URL</span>
            <input
              type="url"
              required
              placeholder="https://app.example.com"
              value={form.origin}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, origin: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Label</span>
            <input
              type="text"
              placeholder="Internal name"
              value={form.label}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, label: event.target.value }))
              }
            />
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <textarea
            rows={2}
            placeholder="Optional context for collaborators"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Add Origin'}
          </button>
        </div>
      </form>

      {message && <p className={`message message--${message.type}`}>{message.text}</p>}
      {error && <p className="message message--error">{error}</p>}

      {loading ? (
        <div className="empty-state">Loading allowed origins…</div>
      ) : origins.length === 0 ? (
        <div className="empty-state">
          <p>No allowed origins yet.</p>
          <p>Add a domain above to enable cross-origin access.</p>
        </div>
      ) : (
        <div className="origin-list">
          {origins.map((origin) => {
            const isEditing = editingId === origin.id;
            const isToggling = togglingId === origin.id;
            const isDeleting = deletingId === origin.id;
            return (
              <div
                key={origin.id}
                className={`origin-item ${!origin.isActive ? 'origin-item--inactive' : ''}`}
              >
                {isEditing ? (
                  <form className="origin-edit" onSubmit={handleSaveEdit}>
                    <label className="field">
                      <span>Origin URL</span>
                      <input
                        type="url"
                        required
                        value={editingForm.origin}
                        onChange={(event) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            origin: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Label</span>
                      <input
                        type="text"
                        value={editingForm.label}
                        onChange={(event) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            label: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Description</span>
                      <textarea
                        rows={2}
                        value={editingForm.description}
                        onChange={(event) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={editingForm.isActive}
                        onChange={(event) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            isActive: event.target.checked,
                          }))
                        }
                      />
                      <span>Active</span>
                    </label>
                    <div className="actions actions--inline">
                      <button type="submit" disabled={isSavingEdit}>
                        {isSavingEdit ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={handleCancelEdit} disabled={isSavingEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="origin-summary">
                      <div className="origin-headline">
                        <span className="origin-host">{origin.origin}</span>
                        <span
                          className={`status-chip ${
                            origin.isActive ? 'status-chip--active' : 'status-chip--inactive'
                          }`}
                        >
                          {origin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {origin.label && <span className="origin-label">{origin.label}</span>}
                    </div>
                    {origin.description && (
                      <p className="origin-description">{origin.description}</p>
                    )}
                    <div className="origin-meta">
                      <span>
                        Added {formatDate(origin.createdAt)}
                        {origin.updatedAt && origin.updatedAt !== origin.createdAt
                          ? ` • Updated ${formatDate(origin.updatedAt)}`
                          : ''}
                      </span>
                    </div>
                    <div className="origin-actions">
                      <button type="button" onClick={() => handleStartEdit(origin)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(origin)}
                        disabled={isToggling}
                      >
                        {isToggling
                          ? 'Updating…'
                          : origin.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(origin)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Removing…' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .origins-manager {
          display: grid;
          gap: 1.5rem;
          width: 100%;
          min-width: 0;
        }

        .origins-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .origins-heading {
          display: grid;
          gap: 0.35rem;
          min-width: 0;
        }

        .origins-heading h2 {
          margin: 0;
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .origins-heading p {
          margin: 0;
          color: #475569;
          font-size: 1rem;
          line-height: 1.6;
        }

        .origins-meta {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(37, 99, 235, 0.15);
          color: #1e40af;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .refresh {
          border: none;
          border-radius: 0.75rem;
          padding: 0.65rem 1.25rem;
          background: #ffffff;
          border: 1.5px solid rgba(148, 163, 184, 0.4);
          color: #0f172a;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh:hover:not(:disabled),
        .refresh:focus-visible:not(:disabled) {
          background: #f8fafc;
          border-color: rgba(148, 163, 184, 0.6);
          transform: translateY(-1px);
          outline: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .refresh:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .create-form {
          display: grid;
          gap: 1.25rem;
          padding: 1.75rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 1.25rem;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 0;
        }

        .field-group {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          min-width: 0;
        }

        .field {
          display: grid;
          gap: 0.35rem;
          min-width: 0;
        }

        .field span {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          letter-spacing: 0.01em;
        }

        input,
        textarea {
          width: 100%;
          max-width: 100%;
          border-radius: 0.75rem;
          border: 2px solid rgba(148, 163, 184, 0.3);
          padding: 0.875rem 1.125rem;
          font-size: 0.95rem;
          background: #ffffff;
          color: #1e293b;
          transition: all 0.3s ease;
          box-sizing: border-box;
          min-width: 0;
          font-family: inherit;
        }

        input::placeholder,
        textarea::placeholder {
          color: #94a3b8;
        }

        input:hover:not(:disabled),
        textarea:hover:not(:disabled) {
          border-color: rgba(37, 99, 235, 0.4);
          background: #fefefe;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
          background: #ffffff;
        }

        input:disabled,
        textarea:disabled {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
          opacity: 0.7;
        }

        textarea {
          resize: vertical;
          min-height: 90px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .actions button {
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3), 0 2px 4px -1px rgba(37, 99, 235, 0.2);
        }

        .actions button:hover:not(:disabled),
        .actions button:focus-visible:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4), 0 4px 6px -2px rgba(37, 99, 235, 0.3);
          outline: none;
        }

        .actions button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          transform: none;
          box-shadow: none;
        }

        .message {
          margin: 0;
          font-size: 0.95rem;
          padding: 0.85rem 1rem;
          border-radius: 0.9rem;
          font-weight: 500;
          border: 1px solid transparent;
        }

        .message--success {
          color: #14532d;
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .message--error {
          color: #991b1b;
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .empty-state {
          border: 1px dashed rgba(148, 163, 184, 0.4);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          background: #f8fafc;
          color: #475569;
          display: grid;
          gap: 0.5rem;
          font-weight: 500;
        }

        .origin-list {
          display: grid;
          gap: 1.25rem;
          min-width: 0;
        }

        .origin-item {
          display: grid;
          gap: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 1.25rem;
          padding: 1.5rem;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 0;
        }

        .origin-item--inactive {
          background: #f8fafc;
          opacity: 0.9;
        }

        .origin-summary {
          display: grid;
          gap: 0.35rem;
          min-width: 0;
        }

        .origin-headline {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          align-items: center;
          min-width: 0;
        }

        .origin-host {
          font-weight: 600;
          color: #0f172a;
          word-break: break-word;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid transparent;
        }

        .status-chip--active {
          background: rgba(22, 163, 74, 0.15);
          color: #14532d;
          border-color: rgba(22, 163, 74, 0.3);
        }

        .status-chip--inactive {
          background: rgba(148, 163, 184, 0.15);
          color: #475569;
          border-color: rgba(148, 163, 184, 0.3);
        }

        .origin-label {
          font-size: 0.9rem;
          color: #1d4ed8;
          font-weight: 500;
        }

        .origin-description {
          margin: 0;
          color: #475569;
          line-height: 1.55;
        }

        .origin-meta {
          font-size: 0.82rem;
          color: #64748b;
        }

        .origin-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .origin-actions button {
          border: none;
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .origin-actions button:hover:not(:disabled),
        .origin-actions button:focus-visible:not(:disabled) {
          background: rgba(37, 99, 235, 0.2);
          color: #1e40af;
          outline: none;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }

        .origin-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .origin-actions button:last-child {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .origin-actions button:last-child:hover:not(:disabled),
        .origin-actions button:last-child:focus-visible:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          color: #b91c1c;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
        }

        .origin-edit {
          display: grid;
          gap: 0.75rem;
          min-width: 0;
        }

        .checkbox {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.9rem;
          color: #1e293b;
          cursor: pointer;
        }

        .checkbox input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          accent-color: #2563eb;
          border-radius: 0.375rem;
        }

        .actions--inline {
          justify-content: flex-start;
          gap: 0.75rem;
        }

        .actions--inline button:first-of-type {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3), 0 2px 4px -1px rgba(37, 99, 235, 0.2);
        }

        .actions--inline button:first-of-type:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
        }

        .actions--inline button:last-of-type {
          background: #f1f5f9;
          color: #0f172a;
          border: 1.5px solid rgba(148, 163, 184, 0.3);
        }

        .actions--inline button:last-of-type:hover:not(:disabled) {
          background: #e2e8f0;
          border-color: rgba(148, 163, 184, 0.5);
        }

        @media (max-width: 960px) {
          .field-group {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .origins-manager {
            gap: 1.25rem;
          }

          .origins-heading h2 {
            font-size: 1.5rem;
          }

          .create-form {
            padding: 1.25rem;
            border-radius: 1rem;
          }

          .field-group {
            gap: 1rem;
          }

          input,
          textarea {
            padding: 0.7rem 0.9rem;
            font-size: 16px; /* Prevents zoom on iOS */
          }

          .origin-item {
            padding: 1.25rem;
            border-radius: 1rem;
          }

          .origin-actions {
            flex-direction: column;
            gap: 0.5rem;
          }

          .origin-actions button {
            width: 100%;
            text-align: center;
            padding: 0.65rem;
          }

          .actions {
            flex-direction: column;
          }

          .actions button {
            width: 100%;
          }

          .actions--inline {
            flex-direction: column;
          }

          .actions--inline button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .origins-header {
            flex-direction: column;
          }

          .origins-meta {
            width: 100%;
            justify-content: space-between;
          }

          .create-form {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return value;
  }
}


