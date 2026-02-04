import React, { useState, useEffect } from 'react';

const THEMES = [
  { value: 'classic', label: 'Classic' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'blush', label: 'Blush' },
];

const COLORS = [
  { value: 'rose', label: 'Rose' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'blush', label: 'Blush' },
  { value: 'gold', label: 'Gold' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
];

function HeartIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LinkIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EditIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function ValentineUrlManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    welcomeText: "You've got something special",
    mainMessage: '',
    buttonText: 'Open',
    theme: 'classic',
    themeColor: 'rose',
  });

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/valentine', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList(data.data?.valentineUrls || []);
      } else {
        setError(data.message || 'Failed to load');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getFullUrl(slug) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/valentine/${slug}`;
  }

  async function copyLink(slug) {
    const url = getFullUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      setError('Could not copy. Please copy the URL manually.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const url = editingId ? `/api/valentine/${editingId.id}` : '/api/valentine';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchList();
        const emailSent = data.data?.emailSent;
        setSuccessMessage(emailSent ? 'Link saved. Email sent to the recipient.' : 'Link saved.');
        setTimeout(() => setSuccessMessage(''), 5000);
        resetForm();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete this Valentine link for "${item.recipientName}"?`)) return;
    try {
      const res = await fetch(`/api/valentine/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.filter((x) => x.id !== item.id));
      } else {
        setError(data.message || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete');
    }
  }

  function resetForm() {
    setFormData({
      recipientName: '',
      recipientEmail: '',
      welcomeText: "You've got something special",
      mainMessage: '',
      buttonText: 'Open',
      theme: 'classic',
      themeColor: 'rose',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(item) {
    setFormData({
      recipientName: item.recipientName,
      recipientEmail: item.recipientEmail || '',
      welcomeText: item.welcomeText || "You've got something special",
      mainMessage: item.mainMessage || '',
      buttonText: item.buttonText || 'Open',
      theme: item.theme || 'classic',
      themeColor: item.themeColor || 'rose',
    });
    setEditingId({ id: item.id });
    setShowForm(true);
  }

  return (
    <div className="valentine-manager">
      <div className="valentine-header">
        <div>
          <h2>
            <span className="valentine-title-icon"><HeartIcon size={28} /></span>
            Valentine Links
          </h2>
          <p>Create a unique, secure link with a custom message and theme. Only people with the link can see the page.</p>
        </div>
        {!showForm && (
          <button type="button" className="valentine-btn-primary" onClick={() => setShowForm(true)}>
            <HeartIcon size={20} />
            Create New Link
          </button>
        )}
      </div>

      {error && <div className="valentine-alert">{error}</div>}
      {successMessage && <div className="valentine-success">{successMessage}</div>}

      {showForm && (
        <div className="valentine-form-card">
          <h3>{editingId ? 'Edit Valentine Link' : 'Create Valentine Link'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="valentine-form-group">
              <label>Recipient name (for you; used in the URL slug)</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="e.g. Jane"
                required
                disabled={!!editingId}
              />
              {editingId && <span className="valentine-hint">Slug cannot be changed after creation.</span>}
            </div>
            <div className="valentine-form-group">
              <label>Recipient email (optional)</label>
              <input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="e.g. jane@example.com"
              />
              <span className="valentine-hint">If provided, we&apos;ll send the link to this address with themed styling.</span>
            </div>
            <div className="valentine-form-group">
              <label>Welcome text</label>
              <input
                type="text"
                value={formData.welcomeText}
                onChange={(e) => setFormData({ ...formData, welcomeText: e.target.value })}
                placeholder="You've got something special"
                maxLength={200}
              />
            </div>
            <div className="valentine-form-group">
              <label>Main message (shown after they click the button)</label>
              <textarea
                value={formData.mainMessage}
                onChange={(e) => setFormData({ ...formData, mainMessage: e.target.value })}
                placeholder="Your heartfelt message..."
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="valentine-form-group">
              <label>Button text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Open"
                maxLength={50}
              />
            </div>
            <div className="valentine-form-row">
              <div className="valentine-form-group">
                <label>Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                >
                  {THEMES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="valentine-form-group">
                <label>Color</label>
                <select
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                >
                  {COLORS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="valentine-form-actions">
              <button type="button" className="valentine-btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="valentine-btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="valentine-loading">Loading your Valentine links...</div>
      ) : (
        <div className="valentine-list">
          {list.length === 0 && !showForm ? (
            <div className="valentine-empty">
              <HeartIcon size={48} />
              <p>No Valentine links yet. Create one and share the link with someone special.</p>
            </div>
          ) : (
            list.map((item) => (
              <div key={item.id} className="valentine-card">
                <div className="valentine-card-top">
                  <span className="valentine-card-recipient">For: {item.recipientName}</span>
                  <span className="valentine-card-theme">{item.theme} / {item.themeColor}</span>
                  <div className="valentine-card-actions">
                    <button type="button" className="valentine-icon-btn" onClick={() => copyLink(item.slug)} title="Copy link">
                      <CopyIcon size={18} />
                      {copiedSlug === item.slug ? ' Copied!' : ' Copy'}
                    </button>
                    <a href={getFullUrl(item.slug)} target="_blank" rel="noopener noreferrer" className="valentine-icon-btn" title="Open">
                      <LinkIcon size={18} />
                      Open
                    </a>
                    <button type="button" className="valentine-icon-btn" onClick={() => handleEdit(item)} title="Edit">
                      <EditIcon size={18} />
                      Edit
                    </button>
                    <button type="button" className="valentine-icon-btn valentine-delete" onClick={() => handleDelete(item)} title="Delete">
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>
                <div className="valentine-card-url">
                  <code>{getFullUrl(item.slug)}</code>
                </div>
                {item.welcomeText && <p className="valentine-card-preview">Welcome: &ldquo;{item.welcomeText}&rdquo;</p>}
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .valentine-manager {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .valentine-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .valentine-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }
        .valentine-title-icon {
          color: #e11d48;
        }
        .valentine-header p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          max-width: 52ch;
        }
        .valentine-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #e11d48, #be123c);
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
        }
        .valentine-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(225, 29, 72, 0.45);
        }
        .valentine-btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1.1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          cursor: pointer;
        }
        .valentine-btn-secondary:hover {
          background: #e2e8f0;
        }
        .valentine-alert {
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .valentine-success {
          padding: 0.75rem 1rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .valentine-form-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .valentine-form-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.15rem;
          color: #0f172a;
        }
        .valentine-form-group {
          margin-bottom: 1rem;
        }
        .valentine-form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .valentine-form-group input,
        .valentine-form-group textarea,
        .valentine-form-group select {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.95rem;
        }
        .valentine-form-group input:disabled {
          background: #f8fafc;
          color: #64748b;
        }
        .valentine-hint {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        .valentine-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .valentine-form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }
        .valentine-loading {
          color: #64748b;
          padding: 1.5rem;
        }
        .valentine-empty {
          text-align: center;
          padding: 2.5rem;
          background: #fef2f2;
          border: 1px dashed #fecaca;
          border-radius: 1rem;
          color: #64748b;
        }
        .valentine-empty :global(svg) {
          color: #e11d48;
          margin-bottom: 0.75rem;
          opacity: 0.8;
        }
        .valentine-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .valentine-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .valentine-card-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .valentine-card-recipient {
          font-weight: 600;
          color: #0f172a;
        }
        .valentine-card-theme {
          font-size: 0.8rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 0.35rem;
        }
        .valentine-card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-left: auto;
        }
        .valentine-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.65rem;
          font-size: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #475569;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .valentine-icon-btn:hover {
          background: #e2e8f0;
        }
        .valentine-icon-btn.valentine-delete:hover {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .valentine-card-url {
          margin-top: 0.5rem;
        }
        .valentine-card-url code {
          font-size: 0.8rem;
          color: #64748b;
          word-break: break-all;
        }
        .valentine-card-preview {
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
          color: #64748b;
        }
        @media (max-width: 640px) {
          .valentine-form-row {
            grid-template-columns: 1fr;
          }
          .valentine-card-actions {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
