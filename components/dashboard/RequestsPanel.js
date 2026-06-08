import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, User, Calendar } from 'lucide-react';

export default function RequestsPanel() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/requests', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHelpRequests(data.data.helpRequests || []);
        setContactSubmissions(data.data.contactSubmissions || []);
      } else {
        setError(data.message || 'Failed to load requests');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div className="requests-panel">
      <header className="requests-panel-header">
        <h2 className="requests-panel-title">All requests</h2>
        <p className="requests-panel-desc">
          Help requests from the dashboard and contact form submissions from the website.
        </p>
      </header>

      {error && (
        <div className="requests-panel-alert" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="requests-panel-loading">Loading…</div>
      ) : (
        <>
          {/* Help requests (from dashboard #help) */}
          <section className="requests-panel-section">
            <h3 className="requests-panel-section-title">
              <MessageSquare size={20} />
              Help requests
            </h3>
            {helpRequests.length === 0 ? (
              <p className="requests-panel-empty">No help requests yet.</p>
            ) : (
              <ul className="requests-panel-list">
                {helpRequests.map((r) => (
                  <li key={r.id} className="requests-panel-card requests-panel-card--help">
                    <div className="requests-panel-card-body">
                      <p className="requests-panel-card-message">{r.message}</p>
                      <div className="requests-panel-card-meta">
                        <span className="requests-panel-card-user">
                          <User size={14} />
                          {r.userName} · {r.userEmail}
                        </span>
                        <span className="requests-panel-card-date">
                          <Calendar size={14} />
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Contact form submissions */}
          <section className="requests-panel-section">
            <h3 className="requests-panel-section-title">
              <Mail size={20} />
              Contact form submissions
            </h3>
            {contactSubmissions.length === 0 ? (
              <p className="requests-panel-empty">No contact form submissions yet.</p>
            ) : (
              <ul className="requests-panel-list">
                {contactSubmissions.map((c) => (
                  <li key={c.id} className="requests-panel-card requests-panel-card--contact">
                    <div className="requests-panel-card-body">
                      <div className="requests-panel-card-contact-row">
                        <span className="requests-panel-card-name">
                          <User size={14} />
                          {c.name}
                        </span>
                        <a href={`mailto:${c.email}`} className="requests-panel-card-email">
                          <Mail size={14} />
                          {c.email}
                        </a>
                      </div>
                      {c.projectDetails ? (
                        <p className="requests-panel-card-message">{c.projectDetails}</p>
                      ) : null}
                      <span className="requests-panel-card-date">
                        <Calendar size={14} />
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <style jsx>{`
        .requests-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .requests-panel-header {
          margin-bottom: 0.5rem;
        }
        .requests-panel-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }
        .requests-panel-desc {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
          line-height: 1.5;
        }
        .requests-panel-alert {
          padding: 1rem 1.25rem;
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 0.75rem;
          font-weight: 500;
        }
        .requests-panel-loading {
          padding: 2rem;
          text-align: center;
          color: #64748b;
          font-weight: 500;
        }
        .requests-panel-section {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.5rem 2rem;
        }
        .requests-panel-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 1.25rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .requests-panel-empty {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }
        .requests-panel-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .requests-panel-card {
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .requests-panel-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }
        .requests-panel-card--help {
          border-left: 4px solid #2563eb;
        }
        .requests-panel-card--contact {
          border-left: 4px solid #059669;
        }
        .requests-panel-card-body {
          padding: 1.25rem 1.5rem;
        }
        .requests-panel-card-message {
          color: #334155;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .requests-panel-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: #64748b;
        }
        .requests-panel-card-user,
        .requests-panel-card-date {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .requests-panel-card-contact-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem 1.5rem;
          margin-bottom: 0.75rem;
        }
        .requests-panel-card-name {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          color: #0f172a;
        }
        .requests-panel-card-email {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .requests-panel-card-email:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .requests-panel-section {
            padding: 1.25rem 1.5rem;
          }
          .requests-panel-card-body {
            padding: 1rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
