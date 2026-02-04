import { useState, useEffect, useMemo } from 'react';
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
  const themeMap = THEME_STYLES[theme] || THEME_STYLES.classic;
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

const DECORATION_KEYS = ['flowers', 'teddy', 'chocolate', 'hearts'];
const DECORATION_COMPONENTS = [
  { key: 'flowers', Svg: FlowerSvg },
  { key: 'teddy', Svg: TeddySvg },
  { key: 'chocolate', Svg: ChocolateSvg },
  { key: 'hearts', Svg: HeartsSmallSvg },
];

const DECORATION_POSITIONS = [
  { top: '8%', left: '6%', delay: 0, duration: 4 },
  { top: '12%', right: '8%', delay: 0.5, duration: 5 },
  { bottom: '15%', left: '5%', delay: 1, duration: 4.5 },
  { bottom: '20%', right: '6%', delay: 0.3, duration: 5.2 },
  { top: '45%', left: '2%', delay: 1.2, duration: 4.8 },
  { top: '50%', right: '3%', delay: 0.8, duration: 5 },
  { bottom: '40%', left: '8%', delay: 0.6, duration: 4.2 },
  { bottom: '35%', right: '5%', delay: 1.5, duration: 5.5 },
];

const FALLING_HEARTS_COUNT = 18;

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

  if (loading) {
    return (
      <>
        <Head><title>Loading... | Valentine</title></Head>
        <div className="valentine-page valentine-loading-state">
          <div className="valentine-loading-icon">
            <HeartSvg size={56} color="#be123c" />
          </div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          .valentine-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
          .valentine-loading-state { background: #fef2f2; color: #64748b; }
          .valentine-loading-icon { animation: v-load-pulse 1.2s ease-in-out infinite; }
          @keyframes v-load-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.85; } }
        `}</style>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <Head><title>Invalid Link | Valentine</title></Head>
        <div className="valentine-page valentine-error-state">
          <div className="valentine-error-icon">
            <HeartSvg size={64} color="#991b1b" />
          </div>
          <h1>This link is not valid</h1>
          <p>{error}</p>
        </div>
        <style jsx>{`
          .valentine-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
          .valentine-error-state { background: #fef2f2; color: #991b1b; }
          .valentine-error-icon { opacity: 0.8; margin-bottom: 1rem; }
          .valentine-error-state h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; }
          .valentine-error-state p { margin: 0; color: #64748b; }
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
              <Svg size={36} color={accentColor} />
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
                <HeartSvg size={28} color={accentColor} />
              </div>
            ))}
          </div>
        )}

        <div className={`valentine-card ${revealed ? 'valentine-card-revealed' : ''}`}>
          <div className={`valentine-main-icon ${revealed ? 'valentine-heart-explode' : ''}`}>
            <HeartSvg size={56} color={accentColor} />
          </div>
          <h1 className="valentine-welcome">{page.welcomeText}</h1>
          <p className="valentine-recipient">For {page.recipientName}</p>
          {!revealed ? (
            <button
              type="button"
              className="valentine-cta"
              style={{ background: accentColor, color: isLightButton ? '#1f2937' : '#fff' }}
              onClick={() => setRevealed(true)}
            >
              {page.buttonText}
            </button>
          ) : (
            <div className="valentine-message" style={{ borderColor: vars.secondary, color: vars.primary }}>
              {page.mainMessage ? (
                <p className="valentine-message-text">{page.mainMessage}</p>
              ) : (
                <p className="valentine-message-text">You are loved.</p>
              )}
            </div>
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
        .valentine-decorations-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .valentine-decoration-item {
          position: absolute;
          width: clamp(28px, 7vw, 44px);
          height: clamp(28px, 7vw, 44px);
          opacity: 0.6;
          animation: v-float-tilt 4s ease-in-out infinite;
          will-change: transform;
        }
        .valentine-decoration-item svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        @keyframes v-float-tilt {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-8px) rotate(-5deg) scale(1.02); }
          50% { transform: translateY(-4px) rotate(5deg) scale(1.04); }
          75% { transform: translateY(-12px) rotate(-3deg) scale(1.02); }
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
          top: -40px;
          opacity: 0.7;
          animation: v-fall linear infinite;
        }
        .valentine-falling-heart svg {
          width: 28px;
          height: 28px;
          display: block;
        }
        @keyframes v-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(180deg); opacity: 0.2; }
        }
        .valentine-card {
          max-width: min(28rem, 92vw);
          width: 100%;
          text-align: center;
          padding: clamp(1.5rem, 5vw, 2.5rem);
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          position: relative;
          z-index: 1;
          animation: v-card-in 0.5s ease-out, v-tilt-bounce 3s ease-in-out 0.6s infinite;
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
          margin-bottom: 1rem;
          line-height: 1;
          animation: v-heart-soft 2.5s ease-in-out infinite;
        }
        .valentine-heart-explode {
          animation: v-heart-explode 0.6s ease-out forwards;
        }
        @keyframes v-heart-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes v-heart-explode {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.9; }
          100% { transform: scale(1.2); opacity: 0.95; }
        }
        .valentine-welcome {
          font-size: clamp(1.25rem, 4vw, 1.5rem);
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #1f2937;
        }
        .valentine-recipient {
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          color: #6b7280;
          margin: 0 0 1.5rem 0;
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
        @media (max-width: 480px) {
          .valentine-decoration-item { opacity: 0.5; width: clamp(24px, 8vw, 36px); height: clamp(24px, 8vw, 36px); }
          .valentine-falling-heart svg { width: 22px; height: 22px; }
        }
      `}</style>
    </>
  );
}
