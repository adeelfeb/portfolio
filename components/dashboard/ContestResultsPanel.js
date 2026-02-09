import React, { useState, useEffect } from 'react';

const API_ENTRIES = '/api/valentine/contest-entries';
const API_ENTRY_ID = (id) => `/api/valentine/contest-entries/${id}`;

export default function ContestResultsPanel({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [rankInputs, setRankInputs] = useState({});

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      setLoading(true);
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
    }
  }

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setError('');
    setTimeout(() => setSuccessMessage(''), 5000);
  }

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

  return (
    <div className="flex flex-col gap-5">
      <header className="mb-1">
        <h2 className="text-xl font-bold text-slate-900 m-0 mb-1">Contest Results</h2>
        <p className="text-sm text-slate-600 m-0 leading-relaxed">
          Messages submitted from the Valentine page contest. Set a <strong>rank</strong> (1, 2, 3…) to order them, and mark one as <strong>featured</strong> so it appears on the Valentine page. When Valentine&apos;s Day arrives (or countdown ends), the featured message is shown; if none is set, a default message is shown.
        </p>
        <p className="mt-2 text-[0.85rem]">
          <a href="/valentine#contest" className="text-rose-700 no-underline hover:underline">View Valentine page contest section</a>
        </p>
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm" role="status">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="py-6 text-center text-slate-500 text-sm">Loading contest entries…</div>
      ) : entries.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-sm">No contest entries yet. Messages will appear here once users submit from the Valentine page.</div>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={`flex flex-wrap items-start justify-between gap-4 p-4 rounded-xl border ${
                entry.featured ? 'border-pink-300 bg-pink-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-slate-700 text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words">
                  {entry.message}
                </div>
                <div className="mt-2 flex items-center gap-2 text-slate-500 text-xs">
                  {entry.createdAt && <span>{new Date(entry.createdAt).toLocaleString()}</span>}
                  {entry.featured && (
                    <span className="px-2 py-0.5 bg-pink-500 text-white rounded-md font-semibold">Featured</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <label htmlFor={`rank-${entry.id}`} className="text-slate-500 text-xs">Rank</label>
                  <input
                    id={`rank-${entry.id}`}
                    type="number"
                    min={1}
                    className="w-14 px-2 py-1 border border-slate-300 rounded-md text-sm"
                    value={rankInputs[entry.id] ?? (entry.rank != null ? String(entry.rank) : '')}
                    onChange={(e) => setRankInputs((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      const current = rankInputs[entry.id] ?? (entry.rank != null ? String(entry.rank) : '');
                      if (v !== current) handleRankChange(entry, v);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    disabled={updatingId === entry.id}
                    placeholder="—"
                  />
                </div>
                {!entry.featured && (
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={() => handleSetFeatured(entry)}
                    disabled={updatingId === entry.id}
                  >
                    {updatingId === entry.id ? 'Updating…' : 'Set as featured'}
                  </button>
                )}
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={() => handleDelete(entry)}
                  disabled={updatingId === entry.id}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
