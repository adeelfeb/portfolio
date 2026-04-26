/**
 * Client-side only: parse plain-text WhatsApp export (_chat.txt).
 * Handles common Android / iOS / desktop formats (English date strings).
 */

const MEDIA_MARKERS = /<(image|video|audio|document|sticker|animated sticker|Media) omitted>/i;
const OMITTED = /omitted|deleted this message|You deleted this message/i;

function padYear(y) {
  const n = parseInt(y, 10);
  if (Number.isNaN(n)) return 2000;
  if (n < 100) return n < 50 ? 2000 + n : 1900 + n;
  return n;
}

function to24h(hour, minute, second, ampm) {
  let h = hour;
  const ap = (ampm || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return { h, m: minute, s: second };
}

/**
 * @param {string} d1
 * @param {string} m1
 * @param {string} y1
 * @param {string} hour
 * @param {string} min
 * @param {string} sec
 * @param {string|undefined} ampm
 */
function buildDate(d1, m1, y1, hour, min, sec, ampm) {
  const d = parseInt(d1, 10);
  const mo = parseInt(m1, 10);
  const y = padYear(y1);
  const hRaw = parseInt(hour, 10);
  const mi = parseInt(min, 10);
  const s = sec != null && sec !== '' ? parseInt(sec, 10) : 0;
  const { h, m, s: sOut } = to24h(hRaw, mi, s, ampm);

  const tryDate = (day, month) => {
    if (!Number.isInteger(day) || !Number.isInteger(month)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(y, month - 1, day, h, m, sOut);
    if (Number.isNaN(date.getTime())) return null;
    // Reject overflowed dates (e.g. month 25 silently rolling into next year)
    if (date.getFullYear() !== y) return null;
    if (date.getMonth() !== month - 1) return null;
    if (date.getDate() !== day) return null;
    return date;
  };

  // Prefer DD/MM; if invalid, fallback to MM/DD to support locale exports.
  // This helps avoid dropping messages when user filters by a date that got parsed incorrectly.
  return tryDate(d, mo) || tryDate(mo, d);
}

const PATTERNS = [
  // [DD/MM/YYYY, HH:MM:SS AM/PM] Name: message
  {
    re: /^\[(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2}):(\d{2})(?:\s*([AP]M))?\]\s*([^:]+):\s*(.*)$/i,
    groups: (m) => ({
      date: buildDate(m[1], m[2], m[3], m[4], m[5], m[6], m[7]),
      author: m[8].trim(),
      body: m[9] || '',
    }),
  },
  // [DD/MM/YYYY, HH:MM AM/PM] Name: message
  {
    re: /^\[(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2})(?:\s*([AP]M))?\]\s*([^:]+):\s*(.*)$/i,
    groups: (m) => ({
      date: buildDate(m[1], m[2], m[3], m[4], m[5], '0', m[6]),
      author: m[7].trim(),
      body: m[8] || '',
    }),
  },
  // DD/MM/YYYY, HH:MM:SS AM/PM - Name: message
  {
    re: /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2}):(\d{2})(?:\s*([AP]M))?\s*[-–—]\s*([^:]+):\s*(.*)$/i,
    groups: (m) => ({
      date: buildDate(m[1], m[2], m[3], m[4], m[5], m[6], m[7]),
      author: m[8].trim(),
      body: m[9] || '',
    }),
  },
  // DD/MM/YYYY, HH:MM AM/PM - Name: message
  {
    re: /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2})(?:\s*([AP]M))?\s*[-–—]\s*([^:]+):\s*(.*)$/i,
    groups: (m) => ({
      date: buildDate(m[1], m[2], m[3], m[4], m[5], '0', m[6]),
      author: m[7].trim(),
      body: m[8] || '',
    }),
  },
  // 24h variants without AM/PM
  {
    re: /^\[(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2}):(\d{2})\]\s*([^:]+):\s*(.*)$/i,
    groups: (m) => ({
      date: buildDate(m[1], m[2], m[3], m[4], m[5], m[6], undefined),
      author: m[7].trim(),
      body: m[8] || '',
    }),
  },
  {
    re: /^\[(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})[,\s]+(\d{1,2}):(\d{2})\]\s*([^:]+):\s*(.*)$/i,
    groups: (m) => ({
      date: buildDate(m[1], m[2], m[3], m[4], m[5], '0', undefined),
      author: m[6].trim(),
      body: m[7] || '',
    }),
  },
];

const LEADING = /^[\s\u200e\u200f\ufeff]*/;
const SYSTEM_LINE =
  /^(?:messages? and calls? are|this chat|you created|you were added|you changed|security code|waiting for|tap to|end-to-encrypted|encryption)/i;

function isLikelyMessageStart(line) {
  const t = line.replace(LEADING, '');
  for (const { re } of PATTERNS) {
    if (re.test(t)) return true;
  }
  return false;
}

/**
 * @param {string} raw
 * @returns {{ messages: { ts: Date; author: string; body: string; isMedia: boolean; isSystem: boolean }[]; participants: string[]; parseWarnings: string[] }}
 */
export function parseWhatsAppChatExport(raw) {
  const text = (raw || '').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  /** @type {{ ts: Date; author: string; body: string }[]} */
  const messages = [];
  const warnings = [];
  let i = 0;
  const participants = new Set();

  const pushContinuation = (extra) => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    last.body = `${last.body}\n${extra}`;
  };

  while (i < lines.length) {
    let line = lines[i];
    const trimmed = line.replace(LEADING, '');

    if (trimmed === '' || SYSTEM_LINE.test(trimmed)) {
      i += 1;
      continue;
    }

    let matched = null;
    for (const p of PATTERNS) {
      const m = trimmed.match(p.re);
      if (m) {
        matched = p.groups(m);
        break;
      }
    }

    if (matched && matched.date) {
      const { date, author, body } = matched;
      const isMedia = MEDIA_MARKERS.test(body) || OMITTED.test(body);
      participants.add(author);
      messages.push({
        ts: date,
        author,
        body: (body || '').trim(),
        isMedia,
        isSystem: false,
      });
      i += 1;
      continue;
    }

    if (isLikelyMessageStart(trimmed)) {
      warnings.push('Skipped line that looked like a message but did not match a known date format (locale or encoding).');
      i += 1;
      continue;
    }

    if (messages.length > 0) {
      pushContinuation(line);
    }
    i += 1;
  }

  const partList = [...participants].sort((a, b) => a.localeCompare(b));
  return { messages, participants: partList, parseWarnings: warnings.slice(0, 5) };
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Start of local calendar day for `YYYY-MM-DD` (avoids UTC parsing issues from `new Date("YYYY-MM-DD")`). */
function ymdToLocalStart(ymd) {
  if (!ymd || !YMD.test(ymd)) return null;
  const [y, mo, d] = ymd.split('-').map((n) => parseInt(n, 10));
  if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) return null;
  return new Date(y, mo - 1, d, 0, 0, 0, 0);
}

/** End of local calendar day for `YYYY-MM-DD`. */
function ymdToLocalEnd(ymd) {
  if (!ymd || !YMD.test(ymd)) return null;
  const [y, mo, d] = ymd.split('-').map((n) => parseInt(n, 10));
  if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) return null;
  return new Date(y, mo - 1, d, 23, 59, 59, 999);
}

function parseFilterDate(s, endOfDay) {
  if (!s) return null;
  const t = String(s).trim();
  if (YMD.test(t)) {
    return endOfDay ? ymdToLocalEnd(t) : ymdToLocalStart(t);
  }
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {object[]} messages
 * @param {{ author: string; from: string; to: string; search: string }} filters
 */
export function filterMessages(messages, filters) {
  const { author, from, to, search } = filters;
  const fromD = parseFilterDate(from, false);
  const toD = parseFilterDate(to, true);
  const q = (search || '').trim().toLowerCase();
  return messages.filter((m) => {
    if (author && m.author !== author) return false;
    if (fromD && m.ts < fromD) return false;
    if (toD && m.ts > toD) return false;
    if (q) {
      const inBody = m.body.toLowerCase().includes(q);
      const inAuth = m.author.toLowerCase().includes(q);
      if (!inBody && !inAuth) return false;
    }
    return true;
  });
}

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * @param {object[]} messages
 */
export function aggregateByDay(messages) {
  const map = new Map();
  for (const m of messages) {
    const k = dayKey(m.ts);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/**
 * @param {object[]} messages
 */
export function aggregateByAuthor(messages) {
  const map = new Map();
  for (const m of messages) {
    map.set(m.author, (map.get(m.author) || 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * @param {object[]} messages
 */
export function aggregateByHour(messages) {
  const arr = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  for (const m of messages) {
    const h = m.ts.getHours();
    arr[h].count += 1;
  }
  return arr;
}

/**
 * @param {object[]} messages
 */
export function computeStats(messages) {
  let words = 0;
  let media = 0;
  let textMessages = 0;
  for (const m of messages) {
    if (m.isMedia) {
      media += 1;
      continue;
    }
    textMessages += 1;
    const partCount = m.body
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0).length;
    words += partCount;
  }
  const n = Math.max(1, messages.length);
  return {
    total: messages.length,
    media,
    textMessages,
    words,
    avgWordsPerTextMsg: textMessages ? Math.round((words / textMessages) * 10) / 10 : 0,
    avgPerDay:
      messages.length > 0
        ? (() => {
            const first = messages[0].ts;
            const last = messages[messages.length - 1].ts;
            const days = Math.max(1, Math.ceil((last - first) / (86400000)) + 1);
            return Math.round((messages.length / days) * 10) / 10;
          })()
        : 0,
  };
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'to', 'of', 'is', 'are', 'and', 'or', 'in', 'on', 'at', 'for', 'from', 'it', 'its', 'this',
  'that', 'with', 'by', 'as', 'be', 'was', 'were', 'am', 'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they',
  'their', 'he', 'she', 'him', 'her', 'them', 'hai', 'haan', 'han', 'h', 'ho', 'hun', 'mai', 'main', 'mein',
  'ka', 'ki', 'ke', 'ko', 'se', 'ne', 'aur', 'ya', 'ye', 'wo', 'woh', 'kya', 'nahi', 'nahin', 'hn', 'ok', 'okay',
  'acha', 'achha', 'sirf', 'bas', 'pls', 'please', 'bro', 'bhai', 'yr', 'yaar', 'lol', 'haha', 'hahaha', 'um',
  'uh', 'aa', 'ooo', 'hmm', 'hmmm',
]);

const POSITIVE_WORDS = new Set([
  'acha', 'achha', 'best', 'great', 'awesome', 'good', 'bohat', 'bohot', 'zabardast', 'love', 'loved', 'lovely',
  'khushi', 'happy', 'shukriya', 'thanks', 'thankyou', 'thank', 'mast', 'sahi', 'perfect', 'amazing', 'wow', 'nice',
  'badiya', 'barya', 'khubsurat', 'super', 'sweet',
]);

const NEGATIVE_WORDS = new Set([
  'bura', 'ghussa', 'gussa', 'naraz', 'sad', 'dukhi', 'tension', 'problem', 'issue', 'masla', 'maslay', 'kharab',
  'bekar', 'bekaar', 'nahi', 'nahin', 'nhi', 'galat', 'hate', 'thak', 'thaka', 'thaki', 'thak gaya', 'sorry',
  'afsoos', 'dard', 'pain', 'cry', 'rona', 'ronaq', 'confused', 'pareshan', 'danger',
]);

const POSITIVE_EMOJIS = new Set(['😀', '😄', '😁', '😊', '😍', '🥰', '😘', '❤️', '💖', '💙', '🎉', '👍', '👏', '✨']);
const NEGATIVE_EMOJIS = new Set(['😞', '😢', '😭', '😔', '😡', '😠', '💔', '👎', '😣', '😖']);

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}]/gu;

function sanitizeToken(token) {
  return token
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^\p{L}\p{N}_'-]+/gu, '')
    .trim();
}

function tokenize(body) {
  return body
    .split(/\s+/)
    .map((t) => sanitizeToken(t))
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

/**
 * @param {object[]} messages
 * @param {{ limit?: number }} [options]
 */
export function getTopWords(messages, options = {}) {
  const limit = options.limit || 20;
  const map = new Map();
  const byAuthor = new Map();

  for (const m of messages) {
    if (m.isMedia || !m.body) continue;
    const words = tokenize(m.body);
    for (const w of words) {
      map.set(w, (map.get(w) || 0) + 1);
      const authorMap = byAuthor.get(w) || new Map();
      authorMap.set(m.author, (authorMap.get(m.author) || 0) + 1);
      byAuthor.set(w, authorMap);
    }
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => {
      const authorMap = byAuthor.get(word) || new Map();
      const byAuthors = [...authorMap.entries()]
        .map(([a, c]) => ({ author: a, count: c }))
        .sort((a, b) => b.count - a.count);
      const topAuthor = byAuthors[0] || { author: '', count: 0 };
      return {
        word,
        count,
        byAuthors,
        topAuthor: topAuthor.author,
        topAuthorCount: topAuthor.count,
      };
    });
}

/**
 * @param {object[]} messages
 * @param {{ limit?: number }} [options]
 */
export function getTopEmojis(messages, options = {}) {
  const limit = options.limit || 20;
  const map = new Map();
  const byAuthor = new Map();
  for (const m of messages) {
    if (!m.body) continue;
    const emojis = m.body.match(EMOJI_REGEX) || [];
    for (const emoji of emojis) {
      map.set(emoji, (map.get(emoji) || 0) + 1);
      const authorMap = byAuthor.get(emoji) || new Map();
      authorMap.set(m.author, (authorMap.get(m.author) || 0) + 1);
      byAuthor.set(emoji, authorMap);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([emoji, count]) => {
      const authorMap = byAuthor.get(emoji) || new Map();
      const byAuthors = [...authorMap.entries()]
        .map(([a, c]) => ({ author: a, count: c }))
        .sort((a, b) => b.count - a.count);
      const topAuthor = byAuthors[0] || { author: '', count: 0 };
      return {
        emoji,
        count,
        byAuthors,
        topAuthor: topAuthor.author,
        topAuthorCount: topAuthor.count,
      };
    });
}

/**
 * @param {object[]} messages
 * @param {{ from?: string, to?: string, specificDate?: string }} [period]
 */
export function getBestWordInsights(messages, period = {}) {
  const topWords = getTopWords(messages, { limit: 1 });
  const bestOverall = topWords[0] || null;

  const perDayMap = new Map();
  for (const m of messages) {
    if (m.isMedia || !m.body) continue;
    const k = dayKey(m.ts);
    const dayList = perDayMap.get(k) || [];
    dayList.push(m);
    perDayMap.set(k, dayList);
  }
  const perDay = [...perDayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, dayMessages]) => {
      const top = getTopWords(dayMessages, { limit: 1 })[0] || null;
      return { date, bestWord: top?.word || '—', count: top?.count || 0 };
    });

  let bestForSpecificDate = null;
  if (period.specificDate) {
    const dateMessages = messages.filter((m) => dayKey(m.ts) === period.specificDate);
    const top = getTopWords(dateMessages, { limit: 1 })[0] || null;
    bestForSpecificDate = {
      date: period.specificDate,
      word: top?.word || '—',
      count: top?.count || 0,
    };
  }

  return { bestOverall, perDay, bestForSpecificDate };
}

/**
 * Simple lexicon-based sentiment estimation for Roman Urdu + English.
 * @param {object[]} messages
 */
export function analyzeRomanUrduSentiment(messages) {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  const byAuthor = new Map();

  for (const m of messages) {
    if (m.isMedia || !m.body) continue;
    const tokens = tokenize(m.body);
    const emojis = m.body.match(EMOJI_REGEX) || [];
    let score = 0;

    for (const t of tokens) {
      if (POSITIVE_WORDS.has(t)) score += 1;
      if (NEGATIVE_WORDS.has(t)) score -= 1;
    }
    for (const e of emojis) {
      if (POSITIVE_EMOJIS.has(e)) score += 1;
      if (NEGATIVE_EMOJIS.has(e)) score -= 1;
    }

    let bucket = 'neutral';
    if (score > 0) {
      positive += 1;
      bucket = 'positive';
    } else if (score < 0) {
      negative += 1;
      bucket = 'negative';
    } else {
      neutral += 1;
    }

    const stats = byAuthor.get(m.author) || { positive: 0, negative: 0, neutral: 0, total: 0 };
    stats[bucket] += 1;
    stats.total += 1;
    byAuthor.set(m.author, stats);
  }

  const total = positive + negative + neutral;
  const sentimentScore = total ? Math.round(((positive - negative) / total) * 100) : 0;

  const authorBreakdown = [...byAuthor.entries()]
    .map(([author, s]) => ({
      author,
      positive: s.positive,
      negative: s.negative,
      neutral: s.neutral,
      total: s.total,
      score: s.total ? Math.round(((s.positive - s.negative) / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    positive,
    negative,
    neutral,
    total,
    sentimentScore,
    authorBreakdown,
  };
}
