import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const THEME_STYLES = {
  classic: {
    rose: { bg: 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 40%, #fdf2f8 100%)', primary: '#be123c', secondary: '#e11d48', accent: '#fda4af' },
    crimson: { bg: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)', primary: '#fecaca', secondary: '#fca5a5', accent: '#fef2f2' },
    blush: { bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fce7f3 100%)', primary: '#db2777', secondary: '#ec4899', accent: '#fbcfe8' },
    gold: { bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)', primary: '#b45309', secondary: '#d97706', accent: '#fcd34d' },
    lavender: { bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e9d5ff 100%)', primary: '#6d28d9', secondary: '#7c3aed', accent: '#c4b5fd' },
    coral: { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', primary: '#c2410c', secondary: '#ea580c', accent: '#fdba74' },
  },
  romantic: {
    rose: { bg: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 100%)', primary: '#9d174d', secondary: '#be185d', accent: '#f9a8d4' },
    crimson: { bg: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 40%, #b91c1c 100%)', primary: '#fecaca', secondary: '#fca5a5', accent: '#fef2f2' },
    blush: { bg: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)', primary: '#be185d', secondary: '#ec4899', accent: '#fce7f3' },
    gold: { bg: 'linear-gradient(180deg, #fef9c3 0%, #fde68a 40%, #fcd34d 100%)', primary: '#a16207', secondary: '#ca8a04', accent: '#fef3c7' },
    lavender: { bg: 'linear-gradient(180deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)', primary: '#5b21b6', secondary: '#6d28d9', accent: '#e9d5ff' },
    coral: { bg: 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)', primary: '#c2410c', secondary: '#ea580c', accent: '#ffedd5' },
  },
  minimal: {
    rose: { bg: '#ffffff', primary: '#e11d48', secondary: '#f43f5e', accent: '#ffe4e6' },
    crimson: { bg: '#fafafa', primary: '#b91c1c', secondary: '#dc2626', accent: '#fecaca' },
    blush: { bg: '#fffbff', primary: '#db2777', secondary: '#ec4899', accent: '#fce7f3' },
    gold: { bg: '#fffbeb', primary: '#b45309', secondary: '#d97706', accent: '#fef3c7' },
    lavender: { bg: '#faf5ff', primary: '#6d28d9', secondary: '#7c3aed', accent: '#ede9fe' },
    coral: { bg: '#fff7ed', primary: '#c2410c', secondary: '#ea580c', accent: '#ffedd5' },
  },
  vintage: {
    rose: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 30%, #fef2f2 70%)', primary: '#a16207', secondary: '#b91c1c', accent: '#fef3c7' },
    crimson: { bg: 'linear-gradient(135deg, #292524 0%, #44403c 50%, #57534e 100%)', primary: '#fecaca', secondary: '#fca5a5', accent: '#78716c' },
    blush: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fce7f3 100%)', primary: '#9d174d', secondary: '#be185d', accent: '#fef3c7' },
    gold: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 40%, #fde68a 100%)', primary: '#92400e', secondary: '#b45309', accent: '#fef3c7' },
    lavender: { bg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 50%, #e9d5ff 100%)', primary: '#5b21b6', secondary: '#6d28d9', accent: '#ede9fe' },
    coral: { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', primary: '#9a3412', secondary: '#c2410c', accent: '#ffedd5' },
  },
  blush: {
    rose: { bg: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 50%, #fda4af 100%)', primary: '#be123c', secondary: '#e11d48', accent: '#fef2f2' },
    crimson: { bg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #fca5a5 100%)', primary: '#b91c1c', secondary: '#dc2626', accent: '#fef2f2' },
    blush: { bg: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 50%, #f9a8d4 100%)', primary: '#9d174d', secondary: '#db2777', accent: '#fdf2f8' },
    gold: { bg: 'linear-gradient(135deg, #fefce8 0%, #fef08a 50%, #fde047 100%)', primary: '#a16207', secondary: '#ca8a04', accent: '#fefce8' },
    lavender: { bg: 'linear-gradient(135deg, #f5f3ff 0%, #c4b5fd 50%, #a78bfa 100%)', primary: '#5b21b6', secondary: '#6d28d9', accent: '#f5f3ff' },
    coral: { bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)', primary: '#c2410c', secondary: '#ea580c', accent: '#fff7ed' },
  },
};

function getThemeVars(theme, color) {
  const themeMap = THEME_STYLES[theme] || THEME_STYLES.romantic;
  return themeMap[color] || themeMap.rose;
}

function HeartSvg({ size = 48, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function FlowerSvg({ size = 40, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="2.5" fill={color} fillOpacity="0.25" stroke={color} />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" />
      <ellipse cx="12" cy="8" rx="2" ry="3.5" fill={color} fillOpacity="0.2" stroke={color} />
      <ellipse cx="16" cy="12" rx="3.5" ry="2" fill={color} fillOpacity="0.2" stroke={color} />
      <ellipse cx="12" cy="16" rx="2" ry="3.5" fill={color} fillOpacity="0.2" stroke={color} />
      <ellipse cx="8" cy="12" rx="3.5" ry="2" fill={color} fillOpacity="0.2" stroke={color} />
    </svg>
  );
}

function TeddySvg({ size = 44, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <ellipse cx="12" cy="15" rx="6" ry="5" fill={color} fillOpacity="0.18" stroke={color} />
      <circle cx="9" cy="10" r="2.2" fill={color} fillOpacity="0.22" stroke={color} />
      <circle cx="15" cy="10" r="2.2" fill={color} fillOpacity="0.22" stroke={color} />
      <path d="M9 8c0-.8.4-1.6 1.2-1.8M15 8c0-.8-.4-1.6-1.2-1.8" />
      <path d="M12 5.5c-1.8 0-3 1.2-3 2.8 0 1.2.4 1.8 1 2.2.6.4 1.5.8 2 .8s1.4-.4 2-.8c.6-.4 1-1 1-2.2 0-1.6-1.2-2.8-3-2.8z" />
      <path d="M8 13.5l-.8 1.5M16 13.5l.8 1.5" />
    </svg>
  );
}

function ChocolateSvg({ size = 38, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2L4 8v14h16V8L12 2z" fill={color} fillOpacity="0.2" stroke={color} />
      <path d="M12 2v6M4 8h16M8 14h8M8 18h8" />
      <path d="M12 8v12M8 12h8" />
    </svg>
  );
}

function HeartsSmallSvg({ size = 32, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 5.5c-1-.8-2.5-.3-3 1-.3.8 0 1.8.8 2.5L12 11l2.2-2c.8-.7 1.1-1.7.8-2.5-.5-1.3-2-1.8-3-1z" fill={color} fillOpacity="0.25" stroke={color} />
      <path d="M17 14c-1.2-.5-2.5 0-3.2 1.2-.4.8-.2 1.8.5 2.4L17 19l2.2-1.4c.7-.6.9-1.6.5-2.4C19 14 17.7 13.5 17 14z" fill={color} fillOpacity="0.2" stroke={color} />
      <path d="M7 17c-.8-.3-1.8 0-2.4.7-.5.6-.5 1.5-.2 2.2L7 21l2.2-1.2c.6-.4.8-1.2.6-1.9-.3-.9-1.2-1.3-2-1.1z" fill={color} fillOpacity="0.2" stroke={color} />
    </svg>
  );
}

/** Cute sparkle star for background */
function SparkleSvg({ size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden>
      <path d="M12 2l1.5 4.5L18 8l-3.5 2.5L16 15l-4-2.5L8 15l1.5-4.5L6 8l4.5-1.5L12 2z" fillOpacity="0.4" />
    </svg>
  );
}

/** Tiny heart for ambient background float */
function TinyHeartSvg({ size = 12, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} fillOpacity="0.35" className={className} aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const DECORATION_KEYS = ['flowers', 'teddy', 'chocolate', 'hearts'];
const DECORATION_COMPONENTS = [
  { key: 'flowers', Svg: FlowerSvg },
  { key: 'teddy', Svg: TeddySvg },
  { key: 'chocolate', Svg: ChocolateSvg },
  { key: 'hearts', Svg: HeartsSmallSvg },
];

const DECORATION_POSITIONS = [
  { top: '6%', left: '8%', delay: 0, duration: 5.2 },
  { top: '10%', right: '10%', delay: 0.6, duration: 5.8 },
  { bottom: '12%', left: '6%', delay: 1, duration: 5 },
  { bottom: '18%', right: '8%', delay: 0.4, duration: 5.4 },
  { top: '42%', left: '4%', delay: 1.4, duration: 5.6 },
  { top: '48%', right: '5%', delay: 0.9, duration: 5.2 },
  { bottom: '38%', left: '10%', delay: 0.7, duration: 5.3 },
  { bottom: '32%', right: '6%', delay: 1.6, duration: 5.7 },
];

const FALLING_HEARTS_COUNT = 22;
const TRACK_QUEUE_KEY = 'valentine_track_queue';
const SESSION_ID_KEY = 'valentine_sid';
const FLUSH_INTERVAL_MS = 60000;

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return '';
  }
}

function getQueue() {
  try {
    const raw = localStorage.getItem(TRACK_QUEUE_KEY);
    return Array.isArray(raw ? JSON.parse(raw) : null) ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setQueue(queue) {
  try {
    localStorage.setItem(TRACK_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

function pushTrackEvent(ev) {
  const queue = getQueue();
  queue.push(ev);
  setQueue(queue);
}

/** Send events to the server immediately. On success, remove them from the queue. */
function sendTrackEventsNow(events) {
  if (typeof window === 'undefined' || !events || events.length === 0) return;
  fetch('/api/valentine/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) {
        const queue = getQueue();
        let next = queue;
        for (const ev of events) {
          const idx = next.findIndex((e) => e.slug === ev.slug && e.sessionId === ev.sessionId && e.type === ev.type);
          if (idx >= 0) next = next.slice(0, idx).concat(next.slice(idx + 1));
        }
        setQueue(next);
      }
    })
    .catch(() => {
      // leave in queue for flush on beforeunload / interval
    });
}

function flushTrackQueue(slug, sessionId) {
  if (typeof window === 'undefined' || !slug || !sessionId) return;
  const queue = getQueue();
  const toSend = queue.filter((e) => e.slug === slug && e.sessionId === sessionId);
  if (toSend.length === 0) return;
  const rest = queue.filter((e) => !(e.slug === slug && e.sessionId === sessionId));
  setQueue(rest);
  fetch('/api/valentine/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: toSend }),
    keepalive: true,
  }).catch(() => {
    setQueue([...rest, ...toSend]);
  });
}

export async function getServerSideProps() {
  return { props: {} };
}

export default function ValentinePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [repliesLeft, setRepliesLeft] = useState(5);
  const [replySuccess, setReplySuccess] = useState(false);
  const [runawayPosition, setRunawayPosition] = useState(null);
  const runawayBtnRef = useRef(null);
  const runawayWrapRef = useRef(null);
  const runawayPositionRef = useRef(null);
  const runawayReturnTimerRef = useRef(null);

  useEffect(() => {
    runawayPositionRef.current = runawayPosition;
  }, [runawayPosition]);

  const getRandomNumber = useCallback((num) => Math.floor(Math.random() * (num + 1)), []);

  // Viewport inset (px) — button must stay inside this margin to avoid scrollbars
  const VIEWPORT_INSET = 2;

  const clampRunawayPosition = useCallback((left, top, w, h) => {
    if (typeof window === 'undefined') return { left: 0, top: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxLeft = Math.max(VIEWPORT_INSET, vw - w - VIEWPORT_INSET);
    const maxTop = Math.max(VIEWPORT_INSET, vh - h - VIEWPORT_INSET);
    return {
      left: Math.max(VIEWPORT_INSET, Math.min(maxLeft, left)),
      top: Math.max(VIEWPORT_INSET, Math.min(maxTop, top)),
    };
  }, []);

  const RUNAWAY_RETURN_MS = 3000;

  const scheduleRunawayReturn = useCallback(() => {
    if (runawayReturnTimerRef.current) clearTimeout(runawayReturnTimerRef.current);
    runawayReturnTimerRef.current = setTimeout(() => {
      runawayReturnTimerRef.current = null;
      setRunawayPosition(null);
    }, RUNAWAY_RETURN_MS);
  }, []);

  // Max distance (px) the button "floats" from current position — small drift, not full viewport
  const RUNAWAY_FLOAT_PX = 90;

  // Runaway button: small random offset from current position, clamped to viewport; returns after 3s
  const handleRunawayMove = useCallback(() => {
    if (revealed || typeof window === 'undefined') return;
    const btn = runawayBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const current = runawayPositionRef.current;
    const baseLeft = current ? current.left : rect.left;
    const baseTop = current ? current.top : rect.top;
    // Random offset in [-RUNAWAY_FLOAT_PX, +RUNAWAY_FLOAT_PX] so it only drifts a bit
    const offsetX = (getRandomNumber(RUNAWAY_FLOAT_PX * 2) - RUNAWAY_FLOAT_PX);
    const offsetY = (getRandomNumber(RUNAWAY_FLOAT_PX * 2) - RUNAWAY_FLOAT_PX);
    const { left: newLeft, top: newTop } = clampRunawayPosition(baseLeft + offsetX, baseTop + offsetY, w, h);

    if (current) {
      setRunawayPosition((prev) => (prev ? { ...prev, left: newLeft, top: newTop } : null));
      scheduleRunawayReturn();
    } else {
      const clamped = clampRunawayPosition(rect.left, rect.top, w, h);
      setRunawayPosition({
        left: clamped.left,
        top: clamped.top,
        width: w,
        height: h,
      });
      setTimeout(() => {
        setRunawayPosition({ left: newLeft, top: newTop, width: w, height: h });
        scheduleRunawayReturn();
      }, 50);
    }
  }, [revealed, getRandomNumber, clampRunawayPosition, scheduleRunawayReturn]);

  // Prevent horizontal scrollbar when runaway button is active (fixed position can trigger overflow on some browsers)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const prevOverflowX = body.style.overflowX;
    if (runawayPosition) {
      body.style.overflowX = 'hidden';
    } else {
      body.style.overflowX = prevOverflowX || '';
    }
    return () => {
      body.style.overflowX = prevOverflowX || '';
    };
  }, [runawayPosition]);

  // On viewport resize, re-clamp runaway button so it stays within VIEWPORT_INSET (responsive)
  useEffect(() => {
    if (!runawayPosition || typeof window === 'undefined') return;
    const onResize = () => {
      setRunawayPosition((prev) => {
        if (!prev) return null;
        const c = clampRunawayPosition(prev.left, prev.top, prev.width, prev.height);
        return { ...prev, left: c.left, top: c.top };
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [runawayPosition, clampRunawayPosition]);

  // Clear return timer on unmount or when card is revealed
  useEffect(() => {
    return () => {
      if (runawayReturnTimerRef.current) {
        clearTimeout(runawayReturnTimerRef.current);
        runawayReturnTimerRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (revealed && runawayReturnTimerRef.current) {
      clearTimeout(runawayReturnTimerRef.current);
      runawayReturnTimerRef.current = null;
    }
  }, [revealed]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/valentine/view/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.data?.page) {
          setPage(data.data.page);
        } else {
          setError(data.message || 'This link is invalid or has been removed.');
        }
      } catch (err) {
        if (!cancelled) setError('Something went wrong. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!slug || !page) return;
    const sessionId = getOrCreateSessionId();
    const referrer = (typeof document !== 'undefined' && document.referrer) ? document.referrer.slice(0, 512) : '';
    const userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) ? String(navigator.userAgent).slice(0, 512) : '';
    let accessPayload = {};
    if (typeof window !== 'undefined') {
      try {
        accessPayload = {
          referrer: (document.referrer || '').slice(0, 512),
          origin: (window.location && window.location.origin) ? window.location.origin : '',
          pathname: (window.location && window.location.pathname) ? window.location.pathname : '',
          href: (window.location && window.location.href) ? window.location.href.slice(0, 512) : '',
          language: (navigator.language || '').slice(0, 32),
          languages: (navigator.languages && Array.isArray(navigator.languages)) ? navigator.languages.slice(0, 8).join(',') : '',
          platform: (navigator.platform || '').slice(0, 64),
          screen: typeof screen !== 'undefined' ? `${screen.width || ''}x${screen.height || ''}` : '',
          viewport: typeof window.innerWidth !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
          cookieEnabled: typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : null,
        };
      } catch (_) {}
    }
    const visitEvent = {
      type: 'visit',
      slug,
      sessionId,
      referrer,
      userAgent,
      accessPayload,
      timestamp: new Date().toISOString(),
    };
    pushTrackEvent(visitEvent);
    sendTrackEventsNow([visitEvent]);
    const flush = () => flushTrackQueue(slug, sessionId);
    const onBeforeUnload = () => flush();
    const interval = setInterval(flush, FLUSH_INTERVAL_MS);
    if (typeof window !== 'undefined') window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [slug, page]);

  useEffect(() => {
    if (!revealed || !slug || !page) return;
    const sessionId = getOrCreateSessionId();
    let cancelled = false;
    fetch(`/api/valentine/reply?slug=${encodeURIComponent(slug)}&sessionId=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && data.data) {
          setRepliesLeft(data.data.repliesLeft ?? 5);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [revealed, slug, page]);

  async function sendReply(e) {
    e.preventDefault();
    const msg = replyMessage.trim();
    if (!msg || replySending || repliesLeft < 1) return;
    const sessionId = getOrCreateSessionId();
    setReplySending(true);
    setReplySuccess(false);
    try {
      const res = await fetch('/api/valentine/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sessionId, message: msg.slice(0, page.replyMaxLength || 500) }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReplyMessage('');
        setRepliesLeft(data.data.repliesLeft ?? 0);
        setReplySuccess(true);
        setTimeout(() => setReplySuccess(false), 3000);
      }
    } finally {
      setReplySending(false);
    }
  }

  const decorations = useMemo(() => {
    const raw = page?.decorations;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((d) => DECORATION_KEYS.includes(d));
    }
    return DECORATION_KEYS;
  }, [page?.decorations]);

  const decorationComponents = useMemo(
    () => DECORATION_COMPONENTS.filter((d) => decorations.includes(d.key)),
    [decorations]
  );

  const positionsToShow = useMemo(() => {
    if (decorationComponents.length === 0) return [];
    return DECORATION_POSITIONS.slice(0, 8).map((pos, i) => ({
      ...pos,
      Svg: decorationComponents[i % decorationComponents.length].Svg,
      key: `${decorationComponents[i % decorationComponents.length].key}-${i}`,
      delay: pos.delay + i * 0.15,
      duration: pos.duration,
    }));
  }, [decorationComponents]);

  const fallingHearts = useMemo(() => {
    return Array.from({ length: FALLING_HEARTS_COUNT }, (_, i) => ({
      id: i,
      left: `${(i * 7 + 3) % 100}%`,
      duration: 2.5 + (i % 5) * 0.8,
      delay: i * 0.4,
    }));
  }, []);

  const ambientBg = useMemo(() => {
    const hearts = Array.from({ length: 28 }, (_, i) => ({
      id: `h-${i}`,
      left: `${(i * 11 + 3) % 96}%`,
      top: `${(i * 19 + 4) % 94}%`,
      size: 10 + (i % 5) * 3,
      delay: (i * 0.2) % 4.5,
      duration: 4 + (i % 4) * 0.6,
    }));
    const sparkles = Array.from({ length: 16 }, (_, i) => ({
      id: `s-${i}`,
      left: `${(i * 17 + 5) % 93}%`,
      top: `${(i * 21 + 6) % 91}%`,
      size: 12 + (i % 4) * 5,
      delay: (i * 0.35) % 3.5,
      duration: 3 + (i % 3) * 0.4,
    }));
    return { hearts, sparkles };
  }, []);

  if (loading) {
    return (
      <>
        <Head><title>Loading... | Valentine</title></Head>
        <div className="valentine-page valentine-loading-state">
          <div className="valentine-bg-orb valentine-bg-orb-1" aria-hidden />
          <div className="valentine-bg-orb valentine-bg-orb-2" aria-hidden />
          <div className="valentine-bg-orb valentine-bg-orb-3" aria-hidden />
          <div className="valentine-loading-icon">
            <HeartSvg size={56} color="#be123c" />
          </div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          .valentine-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; position: relative; overflow: hidden; }
          .valentine-loading-state { background: linear-gradient(135deg, #fef2f2 0%, #fce7f3 50%, #fdf2f8 100%); color: #64748b; }
          .valentine-bg-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; pointer-events: none; animation: v-orb-float 8s ease-in-out infinite; }
          .valentine-bg-orb-1 { width: 280px; height: 280px; background: rgba(225, 29, 72, 0.2); top: -80px; left: -60px; animation-delay: 0s; }
          .valentine-bg-orb-2 { width: 220px; height: 220px; background: rgba(253, 164, 175, 0.35); bottom: -40px; right: -40px; animation-delay: -3s; }
          .valentine-bg-orb-3 { width: 180px; height: 180px; background: rgba(251, 207, 232, 0.3); top: 40%; right: 10%; animation-delay: -5s; }
          @keyframes v-orb-float { 0%, 100% { transform: scale(1) translate(0, 0); } 50% { transform: scale(1.08) translate(8px, -10px); } }
          @keyframes v-load-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.85; } }
          .valentine-loading-icon { animation: v-load-pulse 1.2s ease-in-out infinite; position: relative; z-index: 1; }
        `}</style>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <Head><title>Invalid Link | Valentine</title></Head>
        <div className="valentine-page valentine-error-state">
          <div className="valentine-bg-orb valentine-bg-orb-1" aria-hidden />
          <div className="valentine-bg-orb valentine-bg-orb-2" aria-hidden />
          <div className="valentine-bg-orb valentine-bg-orb-3" aria-hidden />
          <div className="valentine-error-icon">
            <HeartSvg size={64} color="#991b1b" />
          </div>
          <h1>This link is not valid</h1>
          <p>{error}</p>
        </div>
        <style jsx>{`
          .valentine-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; position: relative; overflow: hidden; }
          .valentine-error-state { background: linear-gradient(135deg, #fef2f2 0%, #fce7f3 40%, #fdf2f8 100%); color: #991b1b; }
          .valentine-bg-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; pointer-events: none; animation: v-orb-float 8s ease-in-out infinite; }
          .valentine-bg-orb-1 { width: 280px; height: 280px; background: rgba(225, 29, 72, 0.2); top: -80px; left: -60px; animation-delay: 0s; }
          .valentine-bg-orb-2 { width: 220px; height: 220px; background: rgba(253, 164, 175, 0.35); bottom: -40px; right: -40px; animation-delay: -3s; }
          .valentine-bg-orb-3 { width: 180px; height: 180px; background: rgba(251, 207, 232, 0.3); top: 40%; right: 10%; animation-delay: -5s; }
          @keyframes v-orb-float { 0%, 100% { transform: scale(1) translate(0, 0); } 50% { transform: scale(1.08) translate(8px, -10px); } }
          .valentine-error-icon { opacity: 0.8; margin-bottom: 1rem; position: relative; z-index: 1; }
          .valentine-error-state h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; position: relative; z-index: 1; }
          .valentine-error-state p { margin: 0; color: #64748b; position: relative; z-index: 1; }
        `}</style>
      </>
    );
  }

  const vars = getThemeVars(page.theme, page.themeColor);
  const accentColor = vars.primary;
  const isLightButton = accentColor === '#fecaca' || accentColor === '#fca5a5';

  return (
    <>
      <Head>
        <title>For {page.recipientName} | Valentine</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="valentine-page" style={{ background: vars.bg }}>
        <div className="valentine-bg-orb valentine-bg-orb-1" aria-hidden />
        <div className="valentine-bg-orb valentine-bg-orb-2" aria-hidden />
        <div className="valentine-bg-orb valentine-bg-orb-3" aria-hidden />
        <div className="valentine-ambient-layer" aria-hidden>
          {ambientBg.hearts.map(({ id, left, top, size, delay, duration }) => (
            <div
              key={id}
              className="valentine-ambient-heart"
              style={{
                left,
                top,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <TinyHeartSvg size={size} color={accentColor} />
            </div>
          ))}
          {ambientBg.sparkles.map(({ id, left, top, size, delay, duration }) => (
            <div
              key={id}
              className="valentine-ambient-sparkle"
              style={{
                left,
                top,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <SparkleSvg size={size} color={accentColor} />
            </div>
          ))}
        </div>
        <div className="valentine-decorations-layer" aria-hidden>
          {positionsToShow.map(({ key, Svg, delay, duration, ...pos }) => (
            <div
              key={key}
              className="valentine-decoration-item"
              style={{
                ...pos,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <Svg size={44} color={accentColor} />
            </div>
          ))}
        </div>

        {revealed && (
          <div className="valentine-heart-rain" aria-hidden>
            {fallingHearts.map(({ id, left, duration, delay }) => (
              <div
                key={id}
                className="valentine-falling-heart"
                style={{
                  left,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                <HeartSvg size={32} color={accentColor} />
              </div>
            ))}
          </div>
        )}

        <div className={`valentine-card ${revealed ? 'valentine-card-revealed' : ''}`}>
          <div className={`valentine-main-icon ${revealed ? 'valentine-heart-explode' : ''}`}>
            <HeartSvg size={64} color={accentColor} />
          </div>
          <h1 className="valentine-welcome">{page.welcomeText}</h1>
          <p className="valentine-recipient">For {page.recipientName}</p>
          {!revealed ? (
            <div className="valentine-buttons-row">
              <button
                type="button"
                className="valentine-cta"
                style={{ background: accentColor, color: isLightButton ? '#1f2937' : '#fff' }}
                onClick={() => {
                  const sid = getOrCreateSessionId();
                  const buttonClickEvent = {
                    type: 'button_click',
                    slug,
                    sessionId: sid,
                    timestamp: new Date().toISOString(),
                  };
                  pushTrackEvent(buttonClickEvent);
                  sendTrackEventsNow([buttonClickEvent]);
                  setRevealed(true);
                }}
              >
                {page.buttonText}
              </button>
              <div
                ref={runawayWrapRef}
                className="valentine-runaway-wrap"
                aria-hidden
                onMouseEnter={handleRunawayMove}
                onClick={handleRunawayMove}
                role="presentation"
              >
                <span className="valentine-runaway-ghost">{page.buttonTextNo}</span>
                <button
                  ref={runawayBtnRef}
                  type="button"
                  className="valentine-cta valentine-cta-no valentine-cta-runaway"
                  style={{
                    borderColor: vars.secondary,
                    color: vars.primary,
                    userSelect: 'none',
                    pointerEvents: runawayPosition ? 'auto' : 'none',
                    ...(runawayPosition
                      ? {
                          position: 'fixed',
                          left: runawayPosition.left,
                          top: runawayPosition.top,
                          width: runawayPosition.width,
                          height: runawayPosition.height,
                          zIndex: 9999,
                          transition: 'left 0.7s cubic-bezier(0, 0.55, 0.45, 1), top 0.7s cubic-bezier(0, 0.55, 0.45, 1)',
                        }
                      : {}),
                  }}
                  onMouseEnter={handleRunawayMove}
                  onClick={(e) => { e.preventDefault(); handleRunawayMove(); }}
                  disabled
                  aria-disabled="true"
                  tabIndex={-1}
                  title="This button is just for fun — always disabled"
                >
                  {page.buttonTextNo}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="valentine-message" style={{ borderColor: vars.secondary, color: vars.primary }}>
                {page.mainMessage ? (
                  <p className="valentine-message-text">{page.mainMessage}</p>
                ) : (
                  <p className="valentine-message-text">You are loved.</p>
                )}
              </div>
              {repliesLeft > 0 && (
                <form className="valentine-reply-form" onSubmit={sendReply}>
                  <label htmlFor="valentine-reply-input" className="valentine-reply-label">
                    {page.replyPromptLabel || 'Write a message to the sender'}
                  </label>
                  <textarea
                    id="valentine-reply-input"
                    className="valentine-reply-input"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength={page.replyMaxLength || 500}
                    rows={3}
                    disabled={replySending}
                    style={{ borderColor: vars.secondary }}
                  />
                  <p className="valentine-reply-hint">
                    {replyMessage.length}/{page.replyMaxLength || 500} characters · {repliesLeft} of 5 replies left
                  </p>
                  {replySuccess && <p className="valentine-reply-success" role="status">Message sent!</p>}
                  <button
                    type="submit"
                    className="valentine-cta valentine-reply-submit"
                    style={{ background: accentColor, color: isLightButton ? '#1f2937' : '#fff' }}
                    disabled={replySending || !replyMessage.trim()}
                  >
                    {replySending ? 'Sending…' : 'Send'}
                  </button>
                </form>
              )}
              {repliesLeft === 0 && (
                <p className="valentine-reply-limit">You&apos;ve used all 5 replies for this visit. Thanks for your messages!</p>
              )}
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .valentine-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 4vw, 2rem);
          transition: background 0.4s ease;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .valentine-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(72px);
          opacity: 0.4;
          pointer-events: none;
          animation: v-orb-float 10s ease-in-out infinite;
          will-change: transform;
        }
        .valentine-bg-orb-1 {
          width: min(380px, 75vw);
          height: min(380px, 75vw);
          background: rgba(253, 164, 175, 0.5);
          top: -120px;
          left: -100px;
          animation-delay: 0s;
        }
        .valentine-bg-orb-2 {
          width: min(300px, 60vw);
          height: min(300px, 60vw);
          background: rgba(251, 207, 232, 0.45);
          bottom: -80px;
          right: -80px;
          animation-delay: -4s;
        }
        .valentine-bg-orb-3 {
          width: min(220px, 48vw);
          height: min(220px, 48vw);
          background: rgba(253, 242, 248, 0.55);
          top: 32%;
          right: 4%;
          animation-delay: -6s;
        }
        @keyframes v-orb-float {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.4; }
          33% { transform: scale(1.08) translate(15px, -10px); opacity: 0.5; }
          66% { transform: scale(1.04) translate(-8px, 12px); opacity: 0.45; }
        }
        .valentine-ambient-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .valentine-ambient-heart {
          position: absolute;
          opacity: 0.55;
          animation: v-ambient-float 6s ease-in-out infinite;
          will-change: transform;
        }
        .valentine-ambient-heart svg {
          width: 100%;
          height: 100%;
          display: block;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.06));
        }
        .valentine-ambient-sparkle {
          position: absolute;
          opacity: 0.5;
          animation: v-sparkle 3.5s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .valentine-ambient-sparkle svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        @keyframes v-ambient-float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.55; }
          50% { transform: translateY(-14px) rotate(10deg) scale(1.12); opacity: 0.75; }
        }
        @keyframes v-sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.45; }
          50% { transform: scale(1.25) rotate(5deg); opacity: 0.75; }
        }
        .valentine-decorations-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .valentine-decoration-item {
          position: absolute;
          width: clamp(36px, 9vw, 56px);
          height: clamp(36px, 9vw, 56px);
          opacity: 0.72;
          animation: v-float-tilt 5s ease-in-out infinite;
          will-change: transform;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08));
        }
        .valentine-decoration-item svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        @keyframes v-float-tilt {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(-6deg) scale(1.05); }
          50% { transform: translateY(-5px) rotate(6deg) scale(1.08); }
          75% { transform: translateY(-12px) rotate(-4deg) scale(1.04); }
        }
        .valentine-heart-rain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }
        .valentine-falling-heart {
          position: absolute;
          top: -48px;
          opacity: 0.75;
          animation: v-fall linear infinite;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
        }
        .valentine-falling-heart svg {
          width: 32px;
          height: 32px;
          display: block;
        }
        @keyframes v-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.85; }
          100% { transform: translateY(100vh) rotate(180deg); opacity: 0.15; }
        }
        .valentine-card {
          max-width: min(30rem, 92vw);
          width: 100%;
          text-align: center;
          padding: clamp(1.75rem, 5vw, 2.75rem);
          border-radius: 1.75rem;
          box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          position: relative;
          z-index: 1;
          animation: v-card-in 0.55s ease-out, v-tilt-bounce 3.5s ease-in-out 0.7s infinite;
        }
        .valentine-card-revealed {
          animation: v-card-in 0.5s ease-out, v-tilt-bounce 3s ease-in-out 0.6s infinite;
        }
        @keyframes v-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes v-tilt-bounce {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-2deg); }
        }
        .valentine-main-icon {
          margin-bottom: 1.15rem;
          line-height: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: v-heart-soft 2.8s ease-in-out infinite;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
        }
        .valentine-heart-explode {
          animation: v-heart-explode 0.65s ease-out forwards;
        }
        @keyframes v-heart-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes v-heart-explode {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.45); opacity: 0.92; }
          100% { transform: scale(1.25); opacity: 0.96; }
        }
        .valentine-welcome {
          font-size: clamp(1.35rem, 4vw, 1.6rem);
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          letter-spacing: -0.02em;
          line-height: 1.3;
        }
        .valentine-recipient {
          font-size: clamp(0.95rem, 2.5vw, 1.05rem);
          color: #6b7280;
          margin: 0 0 1.5rem 0;
          letter-spacing: 0.01em;
        }
        .valentine-cta {
          padding: 0.875rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }
        .valentine-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
        }
        .valentine-cta:active {
          transform: translateY(0);
        }
        .valentine-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        .valentine-runaway-wrap {
          position: relative;
          display: inline-block;
          user-select: none;
          width: fit-content;
          flex: 0 0 auto;
        }
        .valentine-runaway-ghost {
          display: inline-block;
          padding: 0.875rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          visibility: hidden;
          pointer-events: none;
          white-space: nowrap;
          min-width: 8.5rem;
        }
        .valentine-cta-runaway {
          position: absolute;
          left: 0;
          top: 0;
          right: auto;
          width: auto;
          min-width: 0;
          transition: transform 0.15s ease-out;
          pointer-events: auto;
          box-sizing: border-box;
        }
        .valentine-cta-no {
          background: transparent !important;
          border: 2px solid;
          cursor: not-allowed;
          opacity: 0.75;
          width: 100%;
          max-width: 100%;
          white-space: nowrap;
          padding: 0.875rem 2rem;
          line-height: 1.25;
        }
        .valentine-cta-no:hover {
          transform: none;
          box-shadow: none;
        }
        .valentine-message {
          margin-top: 0.5rem;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 2px solid;
          background: rgba(255, 255, 255, 0.6);
          animation: v-message-in 0.5s ease-out;
        }
        @keyframes v-message-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .valentine-message-text {
          margin: 0;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .valentine-reply-form {
          margin-top: 1.5rem;
          width: 100%;
          text-align: left;
        }
        .valentine-reply-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .valentine-reply-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          min-height: 4rem;
          box-sizing: border-box;
          border: 2px solid;
        }
        .valentine-reply-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
        }
        .valentine-reply-hint {
          margin: 0.35rem 0 0.75rem 0;
          font-size: 0.8rem;
          color: #6b7280;
        }
        .valentine-reply-success {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #059669;
          font-weight: 500;
        }
        .valentine-reply-submit {
          margin-top: 0.25rem;
        }
        .valentine-reply-limit {
          margin: 1.25rem 0 0 0;
          font-size: 0.9rem;
          color: #6b7280;
          font-style: italic;
        }
        @media (max-width: 480px) {
          .valentine-decoration-item { opacity: 0.65; width: clamp(30px, 8vw, 42px); height: clamp(30px, 8vw, 42px); }
          .valentine-falling-heart svg { width: 26px; height: 26px; }
        }
      `}</style>
    </>
  );
}
