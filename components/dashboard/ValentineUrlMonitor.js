import React, { useState, useEffect } from 'react';

function ChartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ChevronDown({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronRight({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function TrendCurves({ visitsByDay, creationsByDay }) {
  const allDates = new Set();
  (visitsByDay || []).forEach((d) => allDates.add(d.date));
  (creationsByDay || []).forEach((d) => allDates.add(d.date));
  const sortedDates = [...allDates].sort();
  const recent = sortedDates.slice(-21);
  const visitMap = new Map((visitsByDay || []).map((d) => [d.date, d.visits]));
  const creationMap = new Map((creationsByDay || []).map((d) => [d.date, d.count]));

  const maxY = Math.max(1, ...recent.map((d) => Math.max(visitMap.get(d) || 0, creationMap.get(d) || 0)));
  const w = 320;
  const h = 72;
  const pad = { t: 4, r: 8, b: 16, l: 8 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const n = recent.length;

  const toPath = (getVal) => {
    const pts = recent.map((d, i) => {
      const v = getVal(d);
      const x = pad.l + (i / Math.max(1, n - 1)) * chartW;
      const y = pad.t + chartH - (maxY > 0 ? (v / maxY) * chartH : 0);
      return `${x},${y}`;
    });
    return `M ${pts.join(' L ')}`;
  };

  const visitsPath = toPath((d) => visitMap.get(d) || 0);
  const creationsPath = toPath((d) => creationMap.get(d) || 0);

  return (
    <div className="monitor-curves-wrap">
      <div className="monitor-curves-legend">
        <span className="monitor-legend-dot" style={{ background: '#e11d48' }} /> Visits
        <span className="monitor-legend-dot" style={{ background: '#0ea5e9', marginLeft: '1rem' }} /> Links created
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="monitor-curves-svg">
        <path d={visitsPath} fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={creationsPath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
      </svg>
      {recent.length > 0 && (
        <div className="monitor-curves-dates">
          <span>{recent[0]}</span>
          <span>{recent[recent.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

function PieChart({ summary }) {
  const links = summary?.totalLinks ?? 0;
  const visits = summary?.totalVisits ?? 0;
  const clicks = summary?.totalButtonClicks ?? 0;
  const replies = summary?.totalReplies ?? 0;
  const total = links + visits + clicks + replies || 1;
  const segments = [
    { v: links, color: '#94a3b8', label: 'Links' },
    { v: visits, color: '#e11d48', label: 'Visits' },
    { v: clicks, color: '#0ea5e9', label: 'Clicks' },
    { v: replies, color: '#10b981', label: 'Replies' },
  ].filter((s) => s.v > 0);

  if (segments.length === 0) {
    return (
      <div className="monitor-pie-wrap">
        <svg viewBox="0 0 80 80" className="monitor-pie-svg">
          <circle cx="40" cy="40" r="32" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="4" />
        </svg>
        <span className="monitor-pie-empty">No data</span>
      </div>
    );
  }

  let a = -90;
  const paths = segments.map((s) => {
    const pct = (s.v / total) * 100;
    const deg = (pct / 100) * 360;
    const rad = (deg * Math.PI) / 180;
    const x1 = 40 + 32 * Math.cos((a * Math.PI) / 180);
    const y1 = 40 + 32 * Math.sin((a * Math.PI) / 180);
    a += deg;
    const x2 = 40 + 32 * Math.cos((a * Math.PI) / 180);
    const y2 = 40 + 32 * Math.sin((a * Math.PI) / 180);
    const large = deg > 180 ? 1 : 0;
    const d = `M 40 40 L ${x1} ${y1} A 32 32 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, color: s.color, label: s.label };
  });

  return (
    <div className="monitor-pie-wrap">
      <svg viewBox="0 0 80 80" className="monitor-pie-svg">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <div className="monitor-pie-legend">
        {segments.map((s, i) => (
          <span key={i} className="monitor-pie-legend-item">
            <span className="monitor-legend-dot" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ValentineUrlMonitor({ user }) {
  const role = (user?.role || '').toLowerCase();
  const hasAccess = role === 'developer' || role === 'superadmin';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    fetchMonitorData();
  }, [hasAccess]);

  async function fetchMonitorData() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/valentine/monitor', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to load monitor data');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!hasAccess) {
    return (
      <div className="monitor-wrap">
        <div className="monitor-access-denied">
          <ChartIcon size={48} />
          <h3>Developer access required</h3>
          <p>This page is only available to users with the developer role.</p>
        </div>
        <style jsx>{`
          .monitor-wrap {
            padding: 1.5rem;
          }
          .monitor-access-denied {
            text-align: center;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #fef7f8 0%, #f8fafc 100%);
            border: 1px dashed rgba(225, 29, 72, 0.3);
            border-radius: 1rem;
            color: #64748b;
          }
          .monitor-access-denied :global(svg) {
            color: #94a3b8;
            margin-bottom: 1rem;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .monitor-access-denied h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #334155;
          }
          .monitor-access-denied p {
            margin: 0;
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="monitor-wrap">
        <div className="monitor-loading">
          <div className="monitor-loading-dots">
            <span /><span /><span />
          </div>
          <p>Loading Valentine monitor…</p>
        </div>
        <style jsx>{`
          .monitor-wrap { padding: 1.5rem; }
          .monitor-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 3rem;
          }
          .monitor-loading-dots {
            display: flex;
            gap: 0.5rem;
          }
          .monitor-loading-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #e11d48;
            animation: monitor-dot 1.2s ease-in-out infinite;
          }
          .monitor-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
          .monitor-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes monitor-dot {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
            40% { transform: scale(1.2); opacity: 1; }
          }
          .monitor-loading p { margin: 0; color: #64748b; }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monitor-wrap">
        <div className="monitor-error" role="alert">{error}</div>
        <style jsx>{`
          .monitor-wrap { padding: 1.5rem; }
          .monitor-error {
            padding: 1rem;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            border-radius: 0.75rem;
          }
        `}</style>
      </div>
    );
  }

  const { items = [], trending = {}, summary = {} } = data || {};
  const fullUrl = (slug) => (typeof window !== 'undefined' ? `${window.location.origin}/valentine/${slug}` : '');

  return (
    <div className="monitor-wrap">
      <header className="monitor-hero">
        <div className="monitor-hero-content">
          <div className="monitor-hero-badge">
            <ChartIcon size={16} />
            <span>Read-only monitoring</span>
          </div>
          <h2 className="monitor-hero-title">Valentine Links Monitor</h2>
          <p className="monitor-hero-desc">
            View all Valentine URL links, their creators, full details, and utilization trends. This page is read-only.
          </p>
        </div>
      </header>

      <div className="monitor-summary">
        <div className="monitor-stat">
          <span className="monitor-stat-value">{summary.totalLinks ?? 0}</span>
          <span className="monitor-stat-label">Links</span>
        </div>
        <div className="monitor-stat">
          <span className="monitor-stat-value">{summary.totalVisits ?? 0}</span>
          <span className="monitor-stat-label">Visits</span>
        </div>
        <div className="monitor-stat">
          <span className="monitor-stat-value">{summary.totalButtonClicks ?? 0}</span>
          <span className="monitor-stat-label">Clicks</span>
        </div>
        <div className="monitor-stat">
          <span className="monitor-stat-value">{summary.totalReplies ?? 0}</span>
          <span className="monitor-stat-label">Replies</span>
        </div>
      </div>

      <p className="monitor-info-note">
        All links shown are active (non-deleted). Deleted links are removed from the database and are not displayed.
      </p>

      <section className="monitor-charts-section">
        <div className="monitor-charts-row">
          <div className="monitor-chart-block">
            <h3 className="monitor-chart-title">Trend (last 21 days)</h3>
            <TrendCurves
              visitsByDay={trending.visitsByDay}
              creationsByDay={trending.creationsByDay}
            />
          </div>
          <div className="monitor-chart-block">
            <h3 className="monitor-chart-title">Distribution</h3>
            <PieChart summary={summary} />
          </div>
        </div>
      </section>

      <section className="monitor-table-section">
        <h3 className="monitor-section-title">All Valentine links (active)</h3>
        <p className="monitor-section-desc">
          Expand a row to see full details. Creator, recipient, theme, content, and analytics.
        </p>

        <div className="monitor-table-wrap">
          <table className="monitor-table">
            <thead>
              <tr>
                <th style={{ width: 32 }} aria-label="Expand" />
                <th>Recipient</th>
                <th>Slug</th>
                <th>Created by</th>
                <th>Created</th>
                <th>Visits</th>
                <th>Clicks</th>
                <th>Replies</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`monitor-row ${isExpanded ? 'monitor-row-expanded' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="monitor-expand-cell">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </td>
                      <td className="monitor-cell-recipient">{item.recipientName}</td>
                      <td className="monitor-cell-slug">
                        <code>{item.slug}</code>
                      </td>
                      <td className="monitor-cell-creator">
                        {item.creator?.name || item.createdByName || '—'}
                        {item.creator?.email && (
                          <span className="monitor-creator-email">{item.creator.email}</span>
                        )}
                      </td>
                      <td className="monitor-cell-date">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })
                          : '—'}
                      </td>
                      <td className="monitor-cell-num">{item.totalVisits ?? 0}</td>
                      <td className="monitor-cell-num">{item.totalButtonClicks ?? 0}</td>
                      <td className="monitor-cell-num">{item.replyCount ?? 0}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="monitor-detail-row">
                        <td colSpan={8} className="monitor-detail-cell">
                          <div className="monitor-detail-grid">
                            <div className="monitor-detail-block">
                              <h4>Link & URL</h4>
                              <p>
                                <strong>URL:</strong>{' '}
                                <a
                                  href={fullUrl(item.slug)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {fullUrl(item.slug)}
                                </a>
                              </p>
                              <p><strong>Recipient:</strong> {item.recipientName}</p>
                              {item.recipientEmail && (
                                <p><strong>Recipient email:</strong> {item.recipientEmail}</p>
                              )}
                            </div>
                            <div className="monitor-detail-block">
                              <h4>Creator</h4>
                              <p><strong>Name:</strong> {item.creator?.name || item.createdByName || '—'}</p>
                              {item.creator?.email && (
                                <p><strong>Email:</strong> {item.creator.email}</p>
                              )}
                              {item.creator?.role && (
                                <p><strong>Role:</strong> {item.creator.role}</p>
                              )}
                              <p><strong>Created:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</p>
                            </div>
                            <div className="monitor-detail-block">
                              <h4>Content</h4>
                              <p><strong>Welcome text:</strong> {item.welcomeText || '—'}</p>
                              <p><strong>Main message:</strong> {item.mainMessage ? (item.mainMessage.slice(0, 200) + (item.mainMessage.length > 200 ? '…' : '')) : '—'}</p>
                              <p><strong>Button text:</strong> {item.buttonText || 'Open'}</p>
                              <p><strong>Theme:</strong> {item.theme} / {item.themeColor}</p>
                              {item.decorations?.length > 0 && (
                                <p><strong>Decorations:</strong> {item.decorations.join(', ')}</p>
                              )}
                            </div>
                            <div className="monitor-detail-block">
                              <h4>Email options</h4>
                              <p><strong>Subject:</strong> {item.emailSubject || '—'}</p>
                              <p><strong>Theme:</strong> {item.emailTheme || '—'}</p>
                              {item.emailBody && (
                                <p><strong>Body:</strong> {item.emailBody.slice(0, 100)}…</p>
                              )}
                            </div>
                            <div className="monitor-detail-block monitor-detail-block-full">
                              <h4>Analytics</h4>
                              <p><strong>Visits:</strong> {item.totalVisits ?? 0} · <strong>Button clicks:</strong> {item.totalButtonClicks ?? 0} · <strong>Replies:</strong> {item.replyCount ?? 0}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="monitor-empty">No Valentine links yet.</div>
        )}
      </section>

      <style jsx>{`
        .monitor-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          padding: 0;
        }

        .monitor-hero {
          padding: 1.75rem 1.5rem;
          background: linear-gradient(145deg, #fef7f8 0%, #fff5f7 50%, #f0f9ff 100%);
          border: 1px solid rgba(225, 29, 72, 0.12);
          border-radius: 1.25rem;
        }
        .monitor-hero-content { max-width: 52ch; }
        .monitor-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          background: rgba(225, 29, 72, 0.12);
          color: #be123c;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          border-radius: 999px;
          margin-bottom: 0.75rem;
        }
        .monitor-hero-badge :global(svg) { flex-shrink: 0; }
        .monitor-hero-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .monitor-hero-desc {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .monitor-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .monitor-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem 0.75rem;
          background: linear-gradient(135deg, #fef7f8 0%, #fce7f3 100%);
          border: 1px solid rgba(225, 29, 72, 0.15);
          border-radius: 0.75rem;
          text-align: center;
          min-height: 4.5rem;
        }
        .monitor-stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: #9d174d;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .monitor-stat-label {
          display: block;
          font-size: 0.8rem;
          margin-top: 0.2rem;
          font-weight: 500;
          color: #831843;
          line-height: 1.2;
        }

        .monitor-info-note {
          margin: 0;
          padding: 0.6rem 0.9rem;
          font-size: 0.8rem;
          color: #64748b;
          background: #f8fafc;
          border-radius: 0.5rem;
          border-left: 3px solid #94a3b8;
        }

        .monitor-charts-section {
          padding: 1rem 1.25rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
        }
        .monitor-charts-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .monitor-chart-block {
          flex: 1;
          min-width: 200px;
        }
        .monitor-chart-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #475569;
        }
        .monitor-curves-wrap {
          padding: 0.25rem 0;
        }
        .monitor-curves-legend {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.35rem;
        }
        .monitor-legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          vertical-align: middle;
          margin-right: 0.35rem;
        }
        .monitor-curves-svg {
          width: 100%;
          max-width: 320px;
          height: 72px;
          display: block;
        }
        .monitor-curves-dates {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        .monitor-pie-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.25rem 0;
        }
        .monitor-pie-svg {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        .monitor-pie-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        .monitor-pie-legend-item {
          display: inline-flex;
          align-items: center;
        }
        .monitor-pie-empty {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-left: 0.5rem;
        }

        .monitor-table-section {
          padding: 1.5rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
        }
        .monitor-section-title {
          margin: 0 0 0.35rem 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e0a12;
        }
        .monitor-section-desc {
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .monitor-table-wrap {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }
        .monitor-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .monitor-table th {
          background: linear-gradient(180deg, #fef7f8 0%, #fdf2f4 100%);
          font-weight: 600;
          color: #831843;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(225, 29, 72, 0.15);
        }
        .monitor-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }
        .monitor-table tbody tr:hover {
          background: #fef7f8;
        }
        .monitor-row-expanded {
          background: #fef7f8 !important;
        }
        .monitor-expand-cell {
          width: 32px;
          color: #9d174d;
        }
        .monitor-cell-recipient { font-weight: 500; }
        .monitor-cell-slug code {
          font-size: 0.8rem;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 0.35rem;
          color: #475569;
        }
        .monitor-cell-creator {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .monitor-creator-email {
          font-size: 0.8rem;
          color: #64748b;
        }
        .monitor-cell-date { font-size: 0.85rem; color: #64748b; }
        .monitor-cell-num {
          font-weight: 600;
          color: #9d174d;
          text-align: right;
        }
        .monitor-detail-row td {
          padding: 0;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }
        .monitor-detail-cell {
          background: #f8fafc !important;
          padding: 1.25rem !important;
        }
        .monitor-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .monitor-detail-block h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #475569;
        }
        .monitor-detail-block p {
          margin: 0 0 0.35rem 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #334155;
        }
        .monitor-detail-block-full { grid-column: 1 / -1; }
        .monitor-detail-block a {
          color: #2563eb;
          word-break: break-all;
        }
        .monitor-detail-block a:hover { text-decoration: underline; }

        .monitor-empty {
          text-align: center;
          padding: 2rem;
          color: #64748b;
          background: #f8fafc;
          border-radius: 0.75rem;
          border: 1px dashed #e2e8f0;
        }

        @media (max-width: 768px) {
          .monitor-summary {
            grid-template-columns: repeat(2, 1fr);
          }
          .monitor-table { font-size: 0.85rem; }
          .monitor-table th, .monitor-table td { padding: 0.6rem 0.75rem; }
        }
        @media (max-width: 640px) {
          .monitor-summary { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
