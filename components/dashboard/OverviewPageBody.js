import UserOverviewTable from './UserOverviewTable';

export default function OverviewPageBody({ currentUser }) {
  const role = (currentUser?.role || '').toLowerCase();

  const goWhatsApp = () => {
    if (typeof window === 'undefined') return;
    window.location.hash = 'whatsapp-analysis';
  };

  return (
    <div className="overview-stack">
      {role === 'developer' && (
        <div className="dev-tool-card" aria-label="New developer tool">
          <div className="dev-tool-copy">
            <span className="dev-tool-badge">New component</span>
            <h3 className="dev-tool-title">WhatsApp chat analysis</h3>
            <p className="dev-tool-desc">
              Upload a WhatsApp <code className="dev-tool-code">.txt</code> or <code className="dev-tool-code">.zip</code> export
              to explore message volume, participants, and time-of-day activity. All processing stays in the browser.
            </p>
          </div>
          <button type="button" className="dev-tool-btn" onClick={goWhatsApp}>
            Open chat analysis
          </button>
        </div>
      )}
      <UserOverviewTable currentUser={currentUser} />
      <style jsx>{`
        .overview-stack {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          width: 100%;
        }
        .dev-tool-card {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.35rem;
          border-radius: 1.05rem;
          background: linear-gradient(120deg, rgba(16, 185, 129, 0.1), rgba(37, 99, 235, 0.1));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
        }
        .dev-tool-copy {
          max-width: 56ch;
        }
        .dev-tool-badge {
          display: inline-block;
          margin-bottom: 0.4rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.18);
          color: #047857;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .dev-tool-title {
          margin: 0 0 0.4rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .dev-tool-desc {
          margin: 0;
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.55;
        }
        .dev-tool-code {
          font-size: 0.85em;
          padding: 0.1rem 0.35rem;
          border-radius: 0.3rem;
          background: rgba(15, 23, 42, 0.06);
        }
        .dev-tool-btn {
          flex-shrink: 0;
          border: none;
          border-radius: 0.7rem;
          padding: 0.65rem 1.1rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          color: #fff;
          background: #059669;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
        }
        .dev-tool-btn:hover {
          background: #047857;
        }
        .dev-tool-btn:focus-visible {
          outline: 2px solid #34d399;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
