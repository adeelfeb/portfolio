import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  parseWhatsAppChatExport,
  filterMessages,
  aggregateByDay,
  aggregateByAuthor,
  aggregateByHour,
  computeStats,
  getTopWords,
  getTopEmojis,
  getBestWordInsights,
  analyzeRomanUrduSentiment,
} from '../../lib/whatsappChatParser';

const PIE_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#ca8a04', '#64748b'];

const BUBBLE_TINT = {
  0: 'linear-gradient(135deg, #d9fdd3, #b8f0c0)',
  1: 'linear-gradient(135deg, #e8f4ff, #d4e7ff)',
  2: 'linear-gradient(135deg, #fff4e5, #ffe2cc)',
  3: 'linear-gradient(135deg, #f3e8ff, #e9d4ff)',
  4: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  5: 'linear-gradient(135deg, #e0f2fe, #c7e8fd)',
  6: 'linear-gradient(135deg, #f1f5f4, #e2e8e6)',
};

function escapeForRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlighted(text, q) {
  if (!q || !String(q).trim()) {
    return text;
  }
  const needle = String(q).trim();
  try {
    const parts = text.split(new RegExp(`(${escapeForRegExp(needle)})`, 'ig'));
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark
          key={`h-${i}`}
          style={{ background: 'rgba(250, 204, 21, 0.45)', borderRadius: '0.2rem', padding: '0 0.12rem' }}
        >
          {part}
        </mark>
      ) : (
        <span key={`s-${i}`}>{part}</span>
      )
    );
  } catch {
    return text;
  }
}

function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function StatCard({ label, value, hint }) {
  return (
    <div className="wa-stat">
      <div className="wa-stat-label">{label}</div>
      <div className="wa-stat-value">{value}</div>
      {hint && <div className="wa-stat-hint">{hint}</div>}
    </div>
  );
}

async function readChatFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files);
  const direct = names.find((n) => /(^|\/)_chat\.txt$/i.test(n) && !zip.files[n].dir);
  if (direct) {
    return zip.file(direct).async('string');
  }
  for (const n of names) {
    if (zip.files[n].dir) continue;
    if (!/\.txt$/i.test(n)) continue;
    const s = await zip.file(n).async('string');
    const head = s.slice(0, 400);
    if (/\d{1,2}[/.-]\d{1,2}/.test(head) && /:/.test(head)) {
      return s;
    }
  }
  throw new Error(
    'No chat text found in the zip. Export from WhatsApp as “Export chat” and include the resulting _chat.txt, or upload that .txt file directly.'
  );
}

async function loadTextFromFile(file) {
  const name = (file?.name || '').toLowerCase();
  if (name.endsWith('.zip')) {
    return readChatFromZip(file);
  }
  if (name.endsWith('.txt')) {
    return file.text();
  }
  const ab = await file.slice(0, 2).arrayBuffer();
  const u8 = new Uint8Array(ab);
  const looksZip = u8[0] === 0x50 && u8[1] === 0x4b;
  if (looksZip) {
    return readChatFromZip(file);
  }
  return file.text();
}

export default function WhatsAppChatAnalysis() {
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const [author, setAuthor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [dateMode, setDateMode] = useState('range');
  const [specificDate, setSpecificDate] = useState('');
  const [messageView, setMessageView] = useState('chat');
  const [visibleCount, setVisibleCount] = useState(250);

  const handleFile = useCallback(async (e) => {
    const f = e.target?.files?.[0];
    if (!f) return;
    setError(null);
    setLoading(true);
    setFileName(f.name);
    try {
      const text = await loadTextFromFile(f);
      if (!text || text.length < 20) {
        throw new Error('File is empty or too small to be a chat export.');
      }
      if (text.length > 32 * 1024 * 1024) {
        throw new Error('File is larger than 32 MB. For very large exports, split the chat or use a date range in WhatsApp before exporting.');
      }
      const parsed = parseWhatsAppChatExport(text);
      if (parsed.messages.length === 0) {
        throw new Error(
          'No messages were parsed. Use an unencrypted .txt export (or zip containing _chat.txt) in a common date format, or try “Without media” for a smaller file.'
        );
      }
      setMessages(parsed.messages);
      setParticipants(parsed.participants);
      setWarnings(parsed.parseWarnings);
    } catch (err) {
      setError(err?.message || 'Could not read this file.');
      setMessages([]);
      setParticipants([]);
      setWarnings([]);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }, []);

  const filtered = useMemo(
    () =>
      filterMessages(messages, {
        author,
        from: dateMode === 'single' ? specificDate : from,
        to: dateMode === 'single' ? specificDate : to,
        search,
      }),
    [messages, author, from, to, search, specificDate, dateMode]
  );
  const deferredFiltered = useDeferredValue(filtered);
  const isProcessing = loading || deferredFiltered !== filtered;

  const byDay = useMemo(() => aggregateByDay(deferredFiltered), [deferredFiltered]);
  const byAuthor = useMemo(() => aggregateByAuthor(deferredFiltered), [deferredFiltered]);
  const byHour = useMemo(() => aggregateByHour(deferredFiltered), [deferredFiltered]);
  const stats = useMemo(() => computeStats(deferredFiltered), [deferredFiltered]);
  const topWords = useMemo(() => getTopWords(deferredFiltered, { limit: 15 }), [deferredFiltered]);
  const topEmojis = useMemo(() => getTopEmojis(deferredFiltered, { limit: 15 }), [deferredFiltered]);
  const wordInsights = useMemo(
    () =>
      getBestWordInsights(deferredFiltered, {
        from: dateMode === 'range' ? from : '',
        to: dateMode === 'range' ? to : '',
        specificDate: dateMode === 'single' ? specificDate : '',
      }),
    [deferredFiltered, dateMode, from, to, specificDate]
  );
  const sentiment = useMemo(() => analyzeRomanUrduSentiment(deferredFiltered), [deferredFiltered]);

  const chatOrdered = useMemo(
    () => [...deferredFiltered].sort((a, b) => a.ts.getTime() - b.ts.getTime()),
    [deferredFiltered]
  );
  const visibleChat = useMemo(() => chatOrdered.slice(-visibleCount), [chatOrdered, visibleCount]);

  const authorBubbleMeta = useMemo(() => {
    const sorted = [...participants].sort((a, b) => a.localeCompare(b));
    const map = new Map();
    if (sorted.length === 2) {
      const [a, b] = sorted;
      map.set(a, { side: 'left', name: a });
      map.set(b, { side: 'right', name: b });
    } else {
      sorted.forEach((name, i) => {
        map.set(name, { side: i % 2 === 0 ? 'left' : 'right', name });
      });
    }
    return map;
  }, [participants]);

  const authorTintIndex = useMemo(() => {
    const sorted = [...participants].sort((a, b) => a.localeCompare(b));
    const m = new Map();
    sorted.forEach((n, i) => m.set(n, i % Object.keys(BUBBLE_TINT).length));
    return m;
  }, [participants]);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [chatOrdered.length, author, from, to, specificDate, dateMode, search]);
  useEffect(() => {
    setVisibleCount(250);
  }, [author, from, to, specificDate, dateMode, search, messages.length]);

  const pieData = useMemo(
    () => byAuthor.slice(0, 8).map((a) => ({ name: a.name, value: a.count })),
    [byAuthor]
  );

  const resetFilters = useCallback(() => {
    setAuthor('');
    setFrom('');
    setTo('');
    setSearch('');
    setDateMode('range');
    setSpecificDate('');
    setVisibleCount(250);
  }, []);

  const hasData = messages.length > 0;

  return (
    <div className="wa-root">
      <div className="wa-hero">
        <div>
          <h2 className="wa-title">WhatsApp chat analysis</h2>
          <p className="wa-lead">
            Upload a <strong>.txt</strong> export or a <strong>.zip</strong> that contains <code>_chat.txt</code>. Parsing and
            statistics run entirely in your browser—nothing is uploaded to the server.
          </p>
        </div>
        <label className="wa-upload">
          <input type="file" accept=".txt,.zip,application/zip" onChange={handleFile} disabled={loading} />
          <span className="wa-upload-inner">
            {loading ? 'Reading…' : 'Choose .txt or .zip'}
          </span>
        </label>
      </div>

      {fileName && (
        <p className="wa-file-meta">
          <span className="wa-pill">Loaded</span> {fileName}
        </p>
      )}
      {error && (
        <div className="wa-error" role="alert">
          {error}
        </div>
      )}
      {warnings.length > 0 && (
        <ul className="wa-warn">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      {hasData && (
        <>
          <div className="wa-filters">
            <div className="wa-filters-header">
              <h3>Filters</h3>
              <button type="button" className="wa-btn-ghost" onClick={resetFilters}>
                Clear
              </button>
            </div>
            <div className="wa-filters-grid">
              <label className="wa-field">
                <span>Participant</span>
                <select value={author} onChange={(e) => setAuthor(e.target.value)}>
                  <option value="">All</option>
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wa-field">
                <span>Date mode</span>
                <select value={dateMode} onChange={(e) => setDateMode(e.target.value)}>
                  <option value="range">Date range</option>
                  <option value="single">Single date</option>
                </select>
              </label>
              {dateMode === 'single' ? (
                <label className="wa-field">
                  <span>Specific date</span>
                  <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} />
                </label>
              ) : (
                <>
                  <label className="wa-field">
                    <span>From (date)</span>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                  </label>
                  <label className="wa-field">
                    <span>To (date)</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                  </label>
                </>
              )}
              <label className="wa-field wa-field-wide">
                <span>Search in text or name</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keyword…"
                />
              </label>
            </div>
            <p className="wa-filter-note">
              Showing {formatNumber(filtered.length)} of {formatNumber(messages.length)} messages
            </p>
            {isProcessing && <div className="wa-processing">Updating analytics and chat view…</div>}
          </div>

          <div className="wa-stats">
            <StatCard label="Messages" value={formatNumber(stats.total)} />
            <StatCard
              label="Media / placeholders"
              value={formatNumber(stats.media)}
              hint="Includes “media omitted” placeholders"
            />
            <StatCard
              label="Words (text only)"
              value={formatNumber(stats.words)}
              hint={`~${stats.avgWordsPerTextMsg} words per text message`}
            />
            <StatCard label="Avg. messages / day" value={String(stats.avgPerDay)} hint="over visible span" />
            <StatCard
              label="Sentiment score"
              value={`${sentiment.sentimentScore}`}
              hint="(-100 to +100, Roman Urdu lexicon estimate)"
            />
          </div>

          <div className="wa-chat-section">
            <div className="wa-chat-toolbar">
              <div>
                <h4 className="wa-chat-title">Messages</h4>
                {participants.length === 2 && (
                  <p className="wa-chat-pair">
                    {participants.slice().sort((a, b) => a.localeCompare(b)).join(' ↔ ')}
                  </p>
                )}
                {dateMode === 'single' && specificDate && (
                  <p className="wa-chat-hint">
                    Day filter uses your time zone: <strong>{specificDate}</strong> from 12:00 AM through 11:59:59 PM.
                  </p>
                )}
                {chatOrdered.length > 3500 && (
                  <p className="wa-chat-warn" role="status">
                    Large selection ({formatNumber(chatOrdered.length)} messages)—the list may take a moment to render.
                  </p>
                )}
                {chatOrdered.length > visibleCount && (
                  <button
                    type="button"
                    className="wa-load-older"
                    onClick={() => setVisibleCount((prev) => prev + 300)}
                  >
                    Load older messages ({formatNumber(chatOrdered.length - visibleCount)} remaining)
                  </button>
                )}
              </div>
              <div className="wa-chat-mode">
                <button
                  type="button"
                  className={messageView === 'chat' ? 'wa-pill-btn is-on' : 'wa-pill-btn'}
                  onClick={() => setMessageView('chat')}
                >
                  Chat
                </button>
                <button
                  type="button"
                  className={messageView === 'table' ? 'wa-pill-btn is-on' : 'wa-pill-btn'}
                  onClick={() => setMessageView('table')}
                >
                  Table
                </button>
              </div>
            </div>

            {messageView === 'chat' ? (
              <div className="wa-chat-bg" role="log" aria-label="Full conversation, oldest to newest">
                {chatOrdered.length === 0 && <p className="wa-chat-empty">No messages match the current filters.</p>}
                {visibleChat.map((m, idx) => {
                  const meta = authorBubbleMeta.get(m.author) || { side: 'left', name: m.author };
                  const side = meta.side;
                  const idxTint = authorTintIndex.get(m.author) ?? 0;
                  return (
                    <div
                      key={`${m.ts.getTime()}-${m.author}-${idx}`}
                      className={`wa-msg wa-msg--${side}`}
                    >
                      {participants.length > 2 && <span className="wa-msg-label">{m.author}</span>}
                      <div
                        className="wa-bubble"
                        style={{ background: BUBBLE_TINT[idxTint] || BUBBLE_TINT[0] }}
                      >
                        {participants.length === 2 && <span className="wa-bubble-author">{m.author}</span>}
                        <div className="wa-bubble-text">{renderHighlighted(m.body, search)}</div>
                        <div className="wa-bubble-time">{m.ts.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} className="wa-chat-end" />
              </div>
            ) : (
              <div className="wa-table-scroll wa-table--full">
                <table className="wa-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>From</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleChat.map((m, idx) => (
                      <tr key={`t-${m.ts.getTime()}-${idx}`}>
                        <td className="wa-td-time">{m.ts.toLocaleString()}</td>
                        <td className="wa-td-from">{m.author}</td>
                        <td className="wa-td-body">{renderHighlighted(m.body, search)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="wa-table-foot">
              Showing {formatNumber(visibleChat.length)} of {formatNumber(chatOrdered.length)} messages (oldest to newest). Search highlights matches.
            </p>
          </div>

          <div className="wa-charts">
            <div className="wa-chart-card">
              <h4>Best words</h4>
              <div className="wa-best-word-grid">
                <div className="wa-best-word-box">
                  <div className="wa-best-label">Best word (current selection)</div>
                  <div className="wa-best-word">{wordInsights.bestOverall?.word || '—'}</div>
                  <div className="wa-best-meta">{wordInsights.bestOverall?.count || 0} uses</div>
                </div>
                <div className="wa-best-word-box">
                  <div className="wa-best-label">Best word (specific date)</div>
                  <div className="wa-best-word">{wordInsights.bestForSpecificDate?.word || '—'}</div>
                  <div className="wa-best-meta">
                    {wordInsights.bestForSpecificDate?.date || 'No single date selected'} •{' '}
                    {wordInsights.bestForSpecificDate?.count || 0} uses
                  </div>
                </div>
              </div>
              <div className="wa-table-scroll">
                <table className="wa-table wa-table-compact">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Word of day</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wordInsights.perDay.slice(-14).map((row) => (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td>{row.bestWord}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="wa-charts">
            <div className="wa-chart-card">
              <h4>Activity over time</h4>
              <div className="wa-chart-wrap" style={{ minHeight: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={byDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} name="Messages" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="wa-chart-card">
              <h4>Messages by hour of day</h4>
              <div className="wa-chart-wrap" style={{ minHeight: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byHour} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h) => `${h}h`} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} labelFormatter={(h) => `${h}:00`} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="wa-chart-card">
              <h4>Share by participant (top 8)</h4>
              <div className="wa-pie-wrap">
                <div className="wa-chart-wrap" style={{ minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={100}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name.slice(0, 12)}${name.length > 12 ? '…' : ''} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={String(i)} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="wa-author-bars">
                  {byAuthor.slice(0, 10).map((row, i) => (
                    <li key={row.name}>
                      <span className="wa-author-name" title={row.name}>
                        {row.name}
                      </span>
                      <span className="wa-author-track">
                        <i
                          style={{
                            width: `${(row.count / (byAuthor[0]?.count || 1)) * 100}%`,
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </span>
                      <span className="wa-author-count">{formatNumber(row.count)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="wa-charts wa-grid-two">
            <div className="wa-chart-card">
              <h4>Most used words (who used them)</h4>
              <div className="wa-table-scroll">
                <table className="wa-table wa-table-compact">
                  <thead>
                    <tr>
                      <th>Word</th>
                      <th>Total</th>
                      <th>By whom (all)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWords.map((w) => (
                      <tr key={w.word}>
                        <td>{w.word}</td>
                        <td>{w.count}</td>
                        <td className="wa-who-cell">
                          {(w.byAuthors || [])
                            .map((x) => (
                              <span key={x.author} className="wa-who-pill" title={x.author}>
                                {x.author} ({x.count})
                              </span>
                            ))}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="wa-inline-link"
                            onClick={() => setSearch(w.word)}
                          >
                            Show in chat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="wa-chart-card">
              <h4>Most used emojis (export-safe view)</h4>
              <div className="wa-table-scroll">
                <table className="wa-table wa-table-compact">
                  <thead>
                    <tr>
                      <th>Emoji</th>
                      <th>Total</th>
                      <th>By whom (all)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEmojis.map((e, idx) => (
                      <tr key={`${e.emoji}-${idx}`}>
                        <td style={{ fontSize: '1.2rem' }}>{e.emoji}</td>
                        <td>{e.count}</td>
                        <td className="wa-who-cell">
                          {(e.byAuthors || []).map((x) => (
                            <span key={x.author} className="wa-who-pill" title={x.author}>
                              {x.author} ({x.count})
                            </span>
                          ))}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="wa-inline-link"
                            onClick={() => setSearch(e.emoji)}
                          >
                            Show in chat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="wa-table-foot">Emoji parsing preserves Unicode characters directly from export text.</p>
            </div>
          </div>

          <div className="wa-chart-card">
            <h4>Sentiment analysis (Roman Urdu + English)</h4>
            <div className="wa-stats">
              <StatCard label="Positive" value={formatNumber(sentiment.positive)} />
              <StatCard label="Negative" value={formatNumber(sentiment.negative)} />
              <StatCard label="Neutral" value={formatNumber(sentiment.neutral)} />
            </div>
            <div className="wa-table-scroll" style={{ marginTop: '0.8rem' }}>
              <table className="wa-table wa-table-compact">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Positive</th>
                    <th>Negative</th>
                    <th>Neutral</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sentiment.authorBreakdown.slice(0, 12).map((row) => (
                    <tr key={row.author}>
                      <td>{row.author}</td>
                      <td>{row.positive}</td>
                      <td>{row.negative}</td>
                      <td>{row.neutral}</td>
                      <td>{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="wa-table-foot">
              Lexicon-based estimate for Roman Urdu + English transliteration. Treat as directional signal, not exact NLP truth.
            </p>
          </div>

        </>
      )}

      {!hasData && !error && !loading && (
        <div className="wa-empty">
          <p>No file loaded yet. Use WhatsApp → Chat → More → Export chat, then choose “Without media” or “Include media” and upload the resulting archive or <code>_chat.txt</code>.</p>
        </div>
      )}

      <style jsx>{`
        .wa-root {
          display: grid;
          gap: 1.25rem;
        }
        .wa-hero {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
          padding: 1.35rem 1.5rem;
          border-radius: 1.1rem;
          background: linear-gradient(125deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.1));
          border: 1px solid rgba(148, 163, 184, 0.3);
        }
        .wa-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.35rem;
          font-weight: 600;
          color: #0f172a;
        }
        .wa-lead {
          margin: 0;
          max-width: 52ch;
          color: #475569;
          line-height: 1.6;
          font-size: 0.95rem;
        }
        .wa-upload {
          flex-shrink: 0;
          cursor: pointer;
        }
        .wa-upload input {
          position: absolute;
          width: 0;
          height: 0;
          opacity: 0;
        }
        .wa-upload-inner {
          display: inline-block;
          padding: 0.65rem 1.2rem;
          border-radius: 0.75rem;
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .wa-upload:hover .wa-upload-inner {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }
        .wa-file-meta {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }
        .wa-pill {
          display: inline-block;
          margin-right: 0.5rem;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .wa-error {
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          background: rgba(220, 38, 38, 0.1);
          color: #991b1b;
          font-size: 0.9rem;
        }
        .wa-warn {
          margin: 0;
          padding-left: 1.25rem;
          color: #a16207;
          font-size: 0.85rem;
        }
        .wa-filters {
          padding: 1.2rem 1.35rem;
          border-radius: 1.05rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .wa-filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }
        .wa-filters-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
        }
        .wa-btn-ghost {
          border: none;
          background: transparent;
          color: #2563eb;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          text-decoration: underline;
        }
        .wa-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.9rem;
        }
        .wa-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: #64748b;
        }
        .wa-field span {
          font-weight: 500;
        }
        .wa-field input,
        .wa-field select {
          padding: 0.45rem 0.6rem;
          border-radius: 0.5rem;
          border: 1px solid #cbd5e1;
          font-size: 0.9rem;
        }
        .wa-field-wide {
          grid-column: 1 / -1;
        }
        .wa-filter-note {
          margin: 0.75rem 0 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }
        .wa-processing {
          margin-top: 0.55rem;
          font-size: 0.82rem;
          color: #1d4ed8;
          background: rgba(37, 99, 235, 0.08);
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 0.5rem;
          padding: 0.35rem 0.55rem;
          animation: waPulse 1.4s ease-in-out infinite;
        }
        .wa-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.9rem;
        }
        .wa-stat {
          padding: 1rem 1.1rem;
          border-radius: 1rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }
        .wa-stat-label {
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
        }
        .wa-stat-value {
          margin-top: 0.35rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }
        .wa-stat-hint {
          margin-top: 0.35rem;
          font-size: 0.78rem;
          color: #94a3b8;
        }
        .wa-chat-section {
          border-radius: 1.05rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
          padding: 1.1rem 1.2rem 1.2rem;
          display: grid;
          gap: 0.75rem;
        }
        .wa-chat-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .wa-chat-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
        }
        .wa-chat-pair {
          margin: 0.2rem 0 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }
        .wa-chat-hint {
          margin: 0.35rem 0 0 0;
          font-size: 0.8rem;
          color: #64748b;
        }
        .wa-chat-warn {
          margin: 0.4rem 0 0 0;
          font-size: 0.8rem;
          color: #a16207;
        }
        .wa-load-older {
          margin-top: 0.45rem;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #0f172a;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 0.65rem;
          padding: 0.4rem 0.7rem;
          cursor: pointer;
        }
        .wa-load-older:hover {
          background: #f8fafc;
        }
        .wa-chat-mode {
          display: flex;
          gap: 0.35rem;
        }
        .wa-pill-btn {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #334155;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 999px;
          padding: 0.35rem 0.8rem;
          cursor: pointer;
        }
        .wa-pill-btn.is-on {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }
        .wa-chat-bg {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: min(70vh, 640px);
          overflow-y: auto;
          padding: 0.9rem 0.75rem;
          border-radius: 0.75rem;
          background: linear-gradient(180deg, #efeae2 0%, #e4ddd4 100%);
          border: 1px solid rgba(15, 23, 42, 0.08);
          scroll-behavior: smooth;
        }
        .wa-chat-empty {
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
        }
        .wa-msg {
          display: flex;
          flex-direction: column;
          max-width: min(100%, 420px);
          gap: 0.2rem;
        }
        .wa-msg--left {
          align-self: flex-start;
        }
        .wa-msg--right {
          align-self: flex-end;
          text-align: right;
        }
        .wa-msg-label {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 600;
        }
        .wa-bubble {
          position: relative;
          border-radius: 10px;
          padding: 0.45rem 0.6rem 0.35rem;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.06);
        }
        .wa-bubble-author {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.2rem;
        }
        .wa-bubble-text {
          font-size: 0.88rem;
          line-height: 1.5;
          color: #0f172a;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .wa-bubble-time {
          margin-top: 0.25rem;
          font-size: 0.68rem;
          color: #64748b;
          text-align: right;
        }
        .wa-chat-end {
          height: 1px;
        }
        .wa-who-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }
        .wa-who-pill {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.1rem 0.35rem;
          border-radius: 0.4rem;
          background: #f1f5f9;
          color: #334155;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wa-inline-link {
          border: none;
          background: none;
          color: #2563eb;
          font-weight: 600;
          font-size: 0.78rem;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        .wa-table--full {
          max-height: min(70vh, 640px);
        }
        @keyframes waPulse {
          0% { opacity: 0.65; }
          50% { opacity: 1; }
          100% { opacity: 0.65; }
        }
        .wa-charts {
          display: grid;
          gap: 1.1rem;
        }
        .wa-chart-card {
          padding: 1.1rem 1.2rem 1.25rem;
          border-radius: 1.05rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }
        .wa-chart-card h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
        }
        .wa-chart-wrap {
          width: 100%;
        }
        .wa-pie-wrap {
          display: grid;
          gap: 1rem;
        }
        @media (min-width: 900px) {
          .wa-pie-wrap {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: start;
          }
        }
        .wa-author-bars {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.5rem;
        }
        .wa-author-bars li {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 2fr auto;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.82rem;
        }
        .wa-author-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wa-author-track {
          height: 8px;
          border-radius: 99px;
          background: #f1f5f9;
          overflow: hidden;
        }
        .wa-author-track i {
          display: block;
          height: 100%;
          border-radius: 99px;
          max-width: 100%;
        }
        .wa-author-count {
          font-weight: 600;
          color: #334155;
          font-variant-numeric: tabular-nums;
        }
        .wa-grid-two {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .wa-table-compact {
          font-size: 0.78rem;
        }
        .wa-best-word-grid {
          display: grid;
          gap: 0.8rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          margin-bottom: 0.9rem;
        }
        .wa-best-word-box {
          border: 1px solid #e2e8f0;
          border-radius: 0.8rem;
          background: #f8fafc;
          padding: 0.8rem 0.9rem;
        }
        .wa-best-label {
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #64748b;
        }
        .wa-best-word {
          margin-top: 0.3rem;
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }
        .wa-best-meta {
          font-size: 0.78rem;
          color: #64748b;
        }
        .wa-table-card {
          padding: 1.1rem 1.2rem;
          border-radius: 1.05rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }
        .wa-table-card h4 {
          margin: 0 0 0.6rem 0;
          font-size: 0.95rem;
        }
        .wa-table-scroll {
          max-height: 360px;
          overflow: auto;
          border: 1px solid #e2e8f0;
          border-radius: 0.6rem;
        }
        .wa-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }
        .wa-table th,
        .wa-table td {
          text-align: left;
          padding: 0.45rem 0.55rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }
        .wa-table th {
          position: sticky;
          top: 0;
          background: #f8fafc;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #64748b;
        }
        .wa-td-time {
          white-space: nowrap;
          color: #64748b;
          width: 1%;
        }
        .wa-td-from {
          font-weight: 500;
          color: #0f172a;
          width: 18%;
        }
        .wa-td-body {
          word-break: break-word;
          color: #334155;
        }
        .wa-table-foot {
          margin: 0.6rem 0 0 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .wa-empty {
          padding: 2rem 1.25rem;
          border-radius: 1rem;
          border: 1px dashed #cbd5e1;
          color: #64748b;
          line-height: 1.65;
        }
      `}</style>
    </div>
  );
}
