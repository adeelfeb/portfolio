import React, { useState, useEffect } from 'react';

export default function CreditRequestsPanel() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fulfillingId, setFulfillingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/valentine/credit-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setList(data.data?.requests || []);
      } else {
        setError(data.message || 'Failed to load credit requests');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFulfill(id) {
    if (!confirm('Mark this request as paid and add credits to the user?')) return;
    setFulfillingId(id);
    setError('');
    try {
      const res = await fetch(`/api/valentine/credit-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.filter((r) => r.id !== id));
      } else {
        setError(data.message || 'Failed to fulfill request');
      }
    } catch (err) {
      setError('Failed to fulfill request. Please try again.');
    } finally {
      setFulfillingId(null);
    }
  }

  const pending = list.filter((r) => r.status === 'pending');
  const others = list.filter((r) => r.status !== 'pending');

  return (
    <div className="credit-requests-panel">
      <header className="credit-requests-header">
        <h2 className="credit-requests-title">Valentine credit requests</h2>
        <p className="credit-requests-desc">
          Users request more credits here. Pricing: 5 credits for $2 USD / Rs 500 PKR (Pakistani Rupees). Mark as paid and add credits after receiving payment.
        </p>
      </header>

      {error && (
        <div className="credit-requests-alert" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="credit-requests-loading">Loading requests…</div>
      ) : list.length === 0 ? (
        <div className="credit-requests-empty">No credit requests yet.</div>
      ) : (
        <div className="credit-requests-list">
          {pending.length > 0 && (
            <section>
              <h3 className="credit-requests-subtitle">Pending</h3>
              <ul className="credit-requests-ul">
                {pending.map((r) => (
                  <li key={r.id} className="credit-requests-card">
                    <div className="credit-requests-card-main">
                      <span className="credit-requests-user">{r.userName || '—'} ({r.userEmail || '—'})</span>
                      <span className="credit-requests-meta">
                        {r.requestedCredits} credits · ${r.amountUsd} USD / Rs {r.amountPkr} PKR
                      </span>
                      {r.message && <p className="credit-requests-msg">{r.message}</p>}
                      <span className="credit-requests-date">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="credit-requests-card-actions">
                      <button
                        type="button"
                        className="credit-requests-btn-fulfill"
                        onClick={() => handleFulfill(r.id)}
                        disabled={fulfillingId === r.id}
                      >
                        {fulfillingId === r.id ? 'Adding…' : 'Mark paid & add credits'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h3 className="credit-requests-subtitle">Processed</h3>
              <ul className="credit-requests-ul">
                {others.map((r) => (
                  <li key={r.id} className="credit-requests-card credit-requests-card-processed">
                    <div className="credit-requests-card-main">
                      <span className="credit-requests-user">{r.userName || '—'} ({r.userEmail || '—'})</span>
                      <span className="credit-requests-meta">
                        {r.requestedCredits} credits · {r.status}
                      </span>
                      <span className="credit-requests-date">
                        {r.processedAt ? new Date(r.processedAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <style jsx>{`
        .credit-requests-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .credit-requests-header {
          margin-bottom: 0.25rem;
        }
        .credit-requests-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
        }
        .credit-requests-desc {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .credit-requests-alert {
          padding: 0.75rem 1rem;
          background: #fef2f2;
          color: #b91c1c;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .credit-requests-loading,
        .credit-requests-empty {
          color: #64748b;
          font-size: 0.95rem;
          padding: 1.5rem;
        }
        .credit-requests-subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 0.5rem 0;
        }
        .credit-requests-ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .credit-requests-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .credit-requests-card-processed {
          opacity: 0.85;
        }
        .credit-requests-card-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        .credit-requests-user {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.95rem;
        }
        .credit-requests-meta {
          font-size: 0.85rem;
          color: #64748b;
        }
        .credit-requests-msg {
          font-size: 0.85rem;
          color: #475569;
          margin: 0.25rem 0 0 0;
          white-space: pre-wrap;
        }
        .credit-requests-date {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        .credit-requests-card-actions {
          flex-shrink: 0;
        }
        .credit-requests-btn-fulfill {
          padding: 0.5rem 1rem;
          background: #059669;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .credit-requests-btn-fulfill:hover:not(:disabled) {
          background: #047857;
        }
        .credit-requests-btn-fulfill:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
