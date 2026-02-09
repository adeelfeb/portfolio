import React, { useState, useEffect, useMemo } from 'react';

const API_ENTRIES = '/api/valentine/contest-entries';
const API_ENTRY_ID = (id) => `/api/valentine/contest-entries/${id}`;
const MESSAGE_PREVIEW_LENGTH = 60;

export default function ContestResultsPanel({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [rankInputs, setRankInputs] = useState({});
  const [modalEntry, setModalEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchEntries(false);
  }, []);

  useEffect(() => {
    if (!modalEntry) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setModalEntry(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalEntry]);

  async function fetchEntries(isReload = false) {
    try {
      if (!isReload) setLoading(true);
      else setReloading(true);
      setError('');
      const res = await fetch(API_ENTRIES, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries(data.data?.entries || []);
        const next = {};
        (data.data?.entries || []).forEach((e) => {
          next[e.id] = e.rank != null ? String(e.rank) : '';
        });
        setRankInputs(next);
      } else {
        setError(data.message || 'Failed to load contest entries');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setError('');
    setTimeout(() => setSuccessMessage(''), 5000);
  }

  const filteredAndSortedEntries = useMemo(() => {
    let list = [...entries];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => (e.message || '').toLowerCase().includes(q));
    }
    if (featuredFilter === 'featured') list = list.filter((e) => e.featured);
    if (featuredFilter === 'not-featured') list = list.filter((e) => !e.featured);
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'createdAt') {
      list.sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return (ta - tb) * order;
      });
    } else if (sortBy === 'rank') {
      list.sort((a, b) => {
        const ra = a.rank != null ? a.rank : 999999;
        const rb = b.rank != null ? b.rank : 999999;
        return (ra - rb) * order;
      });
    } else if (sortBy === 'message') {
      list.sort((a, b) => {
        const ma = (a.message || '').toLowerCase();
        const mb = (b.message || '').toLowerCase();
        return ma.localeCompare(mb) * order;
      });
    }
    return list;
  }, [entries, search, featuredFilter, sortBy, sortOrder]);

  async function handleSetFeatured(entry) {
    if (entry.featured) return;
    setUpdatingId(entry.id);
    setError('');
    try {
      const res = await fetch(API_ENTRY_ID(entry.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ featured: true }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((e) => ({
            ...e,
            featured: e.id === entry.id,
          }))
        );
        showSuccess('Featured message updated. It will appear on the Valentine page.');
      } else {
        setError(data.message || 'Failed to set featured');
      }
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleUnfeature(entry) {
    if (!entry.featured) return;
    setUpdatingId(entry.id);
    setError('');
    try {
      const res = await fetch(API_ENTRY_ID(entry.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ featured: false }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((e) => ({
            ...e,
            featured: e.id === entry.id ? false : e.featured,
          }))
        );
        showSuccess('Message removed from featured.');
      } else {
        setError(data.message || 'Failed to remove featured');
      }
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRankChange(entry, value) {
    const num = value === '' || value === null ? null : Math.max(1, parseInt(value, 10));
    if (Number.isNaN(num) && value !== '') return;
    setRankInputs((prev) => ({ ...prev, [entry.id]: value }));
    setUpdatingId(entry.id);
    setError('');
    try {
      const res = await fetch(API_ENTRY_ID(entry.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rank: num }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, rank: data.data?.rank ?? num } : e))
        );
        setRankInputs((prev) => ({ ...prev, [entry.id]: data.data?.rank != null ? String(data.data.rank) : '' }));
        showSuccess('Rank updated.');
      } else {
        setError(data.message || 'Failed to update rank');
      }
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(entry) {
    if (!confirm(`Delete this contest entry? "${entry.message.slice(0, 50)}${entry.message.length > 50 ? '…' : ''}"`)) return;
    setUpdatingId(entry.id);
    setError('');
    try {
      const res = await fetch(API_ENTRY_ID(entry.id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        setRankInputs((prev) => {
          const next = { ...prev };
          delete next[entry.id];
          return next;
        });
        if (modalEntry?.id === entry.id) setModalEntry(null);
        showSuccess('Contest entry deleted.');
      } else {
        setError(data.message || 'Failed to delete');
      }
    } catch {
      setError('Failed to delete. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  function toggleSort(field) {
    if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(field);
      setSortOrder(field === 'message' ? 'asc' : 'desc');
    }
  }

  return (
    <div className="contest-results">
      <header className="contest-results__header">
        <div className="contest-results__header-row">
          <h2 className="contest-results__title">Contest Results</h2>
          <button
            type="button"
            onClick={() => fetchEntries(true)}
            disabled={loading || reloading}
            className="contest-results__reload"
            aria-label="Reload contest entries"
          >
            {reloading ? (
              <>
                <span className="contest-results__spinner" aria-hidden />
                Reloading…
              </>
            ) : (
              <>
                <span aria-hidden>↻</span>
                Reload
              </>
            )}
          </button>
        </div>
        <p className="contest-results__desc">
          Messages from the Valentine contest. Set <strong>rank</strong> to order, mark one as <strong>featured</strong> for the Valentine page.
        </p>
        <p className="contest-results__link-wrap">
          <a href="/valentine#contest" className="contest-results__link">View Valentine page contest section</a>
        </p>
      </header>

      {error && (
        <div className="contest-results__alert contest-results__alert--error" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="contest-results__alert contest-results__alert--success" role="status">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="contest-results__empty">Loading contest entries…</div>
      ) : entries.length === 0 ? (
        <div className="contest-results__empty">No contest entries yet. Messages will appear here once users submit from the Valentine page.</div>
      ) : (
        <>
          <div className="contest-results__filters">
            <div className="contest-results__filter-group">
              <label htmlFor="contest-search" className="contest-results__filter-label">Search message</label>
              <input
                id="contest-search"
                type="search"
                placeholder="Search in messages…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="contest-results__input contest-results__input--search"
                aria-label="Search in messages"
              />
            </div>
            <div className="contest-results__filter-group">
              <label htmlFor="contest-featured" className="contest-results__filter-label">Featured</label>
              <select
                id="contest-featured"
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="contest-results__input contest-results__select"
                aria-label="Filter by featured"
              >
                <option value="all">All</option>
                <option value="featured">Featured only</option>
                <option value="not-featured">Not featured</option>
              </select>
            </div>
            <div className="contest-results__filter-group">
              <label htmlFor="contest-sort" className="contest-results__filter-label">Sort by</label>
              <select
                id="contest-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="contest-results__input contest-results__select"
                aria-label="Sort by"
              >
                <option value="createdAt">Date</option>
                <option value="rank">Rank</option>
                <option value="message">Message A–Z</option>
              </select>
            </div>
            <div className="contest-results__filter-group">
              <label htmlFor="contest-order" className="contest-results__filter-label">Order</label>
              <select
                id="contest-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="contest-results__input contest-results__select"
                aria-label="Sort order"
              >
                <option value="desc">Newest / Highest first</option>
                <option value="asc">Oldest / Lowest first</option>
              </select>
            </div>
          </div>

          <div className="contest-results__table-wrap">
            <table className="contest-results__table" role="grid">
              <thead>
                <tr>
                  <th scope="col" className="contest-results__th contest-results__th--n">#</th>
                  <th scope="col" className="contest-results__th contest-results__th--rank">
                    <button type="button" className="contest-results__th-btn" onClick={() => toggleSort('rank')} aria-sort={sortBy === 'rank' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                      Rank
                    </button>
                  </th>
                  <th scope="col" className="contest-results__th contest-results__th--message">
                    <button type="button" className="contest-results__th-btn" onClick={() => toggleSort('message')} aria-sort={sortBy === 'message' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                      Message
                    </button>
                  </th>
                  <th scope="col" className="contest-results__th contest-results__th--date">
                    <button type="button" className="contest-results__th-btn" onClick={() => toggleSort('createdAt')} aria-sort={sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                      Date
                    </button>
                  </th>
                  <th scope="col" className="contest-results__th contest-results__th--badge">Featured</th>
                  <th scope="col" className="contest-results__th contest-results__th--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEntries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`contest-results__tr ${entry.featured ? 'contest-results__tr--featured' : ''}`}
                  >
                    <td className="contest-results__td contest-results__td--n">{index + 1}</td>
                    <td className="contest-results__td contest-results__td--rank">
                      <div className="contest-results__rank-cell">
                        <input
                          type="number"
                          min={1}
                          className="contest-results__rank-input"
                          value={rankInputs[entry.id] ?? (entry.rank != null ? String(entry.rank) : '')}
                          onChange={(e) => setRankInputs((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            const saved = entry.rank != null ? String(entry.rank) : '';
                            if (v !== saved) handleRankChange(entry, v);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const v = e.target.value.trim();
                              const saved = entry.rank != null ? String(entry.rank) : '';
                              if (v !== saved) handleRankChange(entry, v);
                            }
                          }}
                          disabled={updatingId === entry.id}
                          placeholder="—"
                          aria-label={`Rank for entry ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="contest-results__btn contest-results__btn--rank"
                          onClick={() => {
                            const v = rankInputs[entry.id] ?? (entry.rank != null ? String(entry.rank) : '');
                            const saved = entry.rank != null ? String(entry.rank) : '';
                            if (v !== saved) handleRankChange(entry, v);
                          }}
                          disabled={updatingId === entry.id}
                          title="Save rank"
                        >
                          {updatingId === entry.id ? '…' : 'Set rank'}
                        </button>
                      </div>
                    </td>
                    <td className="contest-results__td contest-results__td--message">
                      <span className="contest-results__message-preview">
                        {(entry.message || '').length <= MESSAGE_PREVIEW_LENGTH
                          ? entry.message
                          : `${(entry.message || '').slice(0, MESSAGE_PREVIEW_LENGTH)}…`}
                      </span>
                      <button
                        type="button"
                        className="contest-results__view-full"
                        onClick={() => setModalEntry(entry)}
                        aria-label="View full message"
                      >
                        View full
                      </button>
                    </td>
                    <td className="contest-results__td contest-results__td--date">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="contest-results__td contest-results__td--badge">
                      {entry.featured ? (
                        <span className="contest-results__badge contest-results__badge--featured">Featured</span>
                      ) : (
                        <span className="contest-results__badge contest-results__badge--none">—</span>
                      )}
                    </td>
                    <td className="contest-results__td contest-results__td--actions">
                      <div className="contest-results__actions">
                        {entry.featured ? (
                          <button
                            type="button"
                            className="contest-results__btn contest-results__btn--secondary"
                            onClick={() => handleUnfeature(entry)}
                            disabled={updatingId === entry.id}
                            title="Remove from featured"
                          >
                            {updatingId === entry.id ? '…' : 'Remove featured'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="contest-results__btn contest-results__btn--primary"
                            onClick={() => handleSetFeatured(entry)}
                            disabled={updatingId === entry.id}
                            title="Set as featured on Valentine page"
                          >
                            {updatingId === entry.id ? '…' : 'Set featured'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="contest-results__btn contest-results__btn--danger"
                          onClick={() => handleDelete(entry)}
                          disabled={updatingId === entry.id}
                          title="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedEntries.length === 0 && (search || featuredFilter !== 'all') && (
            <p className="contest-results__no-match">No entries match the current filters. Try changing search or featured filter.</p>
          )}
        </>
      )}

      {modalEntry && (
        <div
          className="contest-results__modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contest-modal-title"
          onClick={() => setModalEntry(null)}
        >
          <div
            className="contest-results__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="contest-results__modal-header">
              <h3 id="contest-modal-title" className="contest-results__modal-title">Full message</h3>
              <button
                type="button"
                className="contest-results__modal-close"
                onClick={() => setModalEntry(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="contest-results__modal-body">
              <p className="contest-results__modal-message">{modalEntry.message}</p>
              <p className="contest-results__modal-meta">
                {modalEntry.createdAt && new Date(modalEntry.createdAt).toLocaleString()}
                {modalEntry.featured && <span className="contest-results__badge contest-results__badge--featured contest-results__modal-badge">Featured</span>}
                {modalEntry.rank != null && <span className="contest-results__modal-rank">Rank: {modalEntry.rank}</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .contest-results {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .contest-results__header {
          margin-bottom: 0.25rem;
        }
        .contest-results__header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .contest-results__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .contest-results__reload {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .contest-results__reload:hover:not(:disabled) {
          background: #e2e8f0;
        }
        .contest-results__reload:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .contest-results__spinner {
          display: inline-block;
          width: 0.875rem;
          height: 0.875rem;
          border: 2px solid #94a3b8;
          border-top-color: transparent;
          border-radius: 50%;
          animation: contest-spin 0.7s linear infinite;
        }
        @keyframes contest-spin {
          to { transform: rotate(360deg); }
        }
        .contest-results__desc {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }
        .contest-results__link-wrap {
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .contest-results__link {
          font-size: 0.8125rem;
          color: #be123c;
          text-decoration: none;
        }
        .contest-results__link:hover {
          text-decoration: underline;
        }
        .contest-results__alert {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        .contest-results__alert--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        .contest-results__alert--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .contest-results__empty {
          padding: 1.5rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
        }
        .contest-results__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }
        .contest-results__filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .contest-results__filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .contest-results__input {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          background: #fff;
          min-width: 140px;
        }
        .contest-results__input--search {
          min-width: 200px;
        }
        .contest-results__select {
          cursor: pointer;
        }
        .contest-results__table-wrap {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: #fff;
        }
        .contest-results__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .contest-results__th {
          text-align: left;
          padding: 0.75rem 0.5rem;
          font-weight: 600;
          color: #334155;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .contest-results__th-btn {
          background: none;
          border: none;
          font: inherit;
          color: inherit;
          cursor: pointer;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .contest-results__th-btn:hover {
          color: #0f172a;
          text-decoration: underline;
        }
        .contest-results__th--n { width: 2.5rem; text-align: center; }
        .contest-results__th--rank { min-width: 10rem; }
        .contest-results__th--message { min-width: 180px; }
        .contest-results__th--date { min-width: 140px; }
        .contest-results__th--badge { width: 6rem; }
        .contest-results__th--actions { min-width: 200px; }
        .contest-results__tr {
          border-bottom: 1px solid #f1f5f9;
        }
        .contest-results__tr:last-child {
          border-bottom: none;
        }
        .contest-results__tr--featured {
          background: #fdf2f8;
        }
        .contest-results__td {
          padding: 0.6rem 0.5rem;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
        }
        .contest-results__tr:last-child .contest-results__td {
          border-bottom: none;
        }
        .contest-results__td--n {
          text-align: center;
          color: #64748b;
          font-variant-numeric: tabular-nums;
        }
        .contest-results__rank-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .contest-results__rank-input {
          width: 3.5rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
        }
        .contest-results__btn--rank {
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: #0f172a;
          color: #fff;
          border: 1px solid #0f172a;
          border-radius: 0.375rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .contest-results__btn--rank:hover:not(:disabled) {
          background: #334155;
          border-color: #334155;
        }
        .contest-results__btn--rank:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .contest-results__message-preview {
          color: #334155;
          line-height: 1.4;
          word-break: break-word;
        }
        .contest-results__view-full {
          margin-left: 0.5rem;
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #be123c;
          background: transparent;
          border: 1px solid #fda4af;
          border-radius: 0.25rem;
          cursor: pointer;
        }
        .contest-results__view-full:hover {
          background: #fdf2f8;
        }
        .contest-results__td--date {
          color: #64748b;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .contest-results__badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 0.25rem;
        }
        .contest-results__badge--featured {
          background: #ec4899;
          color: #fff;
        }
        .contest-results__badge--none {
          color: #94a3b8;
        }
        .contest-results__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .contest-results__btn {
          padding: 0.35rem 0.6rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 0.375rem;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .contest-results__btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .contest-results__btn--primary {
          background: #ec4899;
          color: #fff;
          border-color: #db2777;
        }
        .contest-results__btn--primary:hover:not(:disabled) {
          background: #db2777;
        }
        .contest-results__btn--secondary {
          background: #f1f5f9;
          color: #475569;
          border-color: #cbd5e1;
        }
        .contest-results__btn--secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }
        .contest-results__btn--danger {
          background: #fff;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .contest-results__btn--danger:hover:not(:disabled) {
          background: #fef2f2;
        }
        .contest-results__no-match {
          padding: 1rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }
        .contest-results__modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: contest-fadeIn 0.15s ease-out;
        }
        @keyframes contest-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .contest-results__modal {
          background: #fff;
          border-radius: 0.75rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 480px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          animation: contest-slideUp 0.2s ease-out;
        }
        @keyframes contest-slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contest-results__modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .contest-results__modal-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }
        .contest-results__modal-close {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          line-height: 1;
          color: #64748b;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .contest-results__modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .contest-results__modal-body {
          padding: 1.25rem;
          overflow-y: auto;
        }
        .contest-results__modal-message {
          white-space: pre-wrap;
          word-break: break-word;
          color: #334155;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }
        .contest-results__modal-meta {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .contest-results__modal-badge {
          margin-left: 0.25rem;
        }
        .contest-results__modal-rank {
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 640px) {
          .contest-results__filters {
            flex-direction: column;
            align-items: stretch;
          }
          .contest-results__input {
            min-width: 0;
          }
          .contest-results__input--search {
            min-width: 0;
          }
          .contest-results__actions {
            flex-direction: column;
          }
          .contest-results__btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
