import React from 'react';

export default function SupportPanel() {
  return (
    <div className="support-panel">
      <div className="support-header">
        <h2>Get Support</h2>
        <p>We are here to help you succeed.</p>
      </div>

      <div className="support-grid">
        <div className="support-card primary">
          <h3>Contact Support</h3>
          <p>Need assistance with your account or have a question? Reach out to our team directly.</p>
          <a href="mailto:support@proofresponse.com" className="support-btn">
            Email Support
          </a>
          <span className="support-meta">Response time: Within 24 hours</span>
        </div>

        <div className="support-card">
          <h3>Documentation</h3>
          <p>Find step-by-step guides and answers to common questions in our help center.</p>
          <button className="support-btn secondary">
            Browse Guides
          </button>
        </div>

        <div className="support-card">
          <h3>Feedback</h3>
          <p>Have a suggestion or found a bug? We'd love to hear from you to improve our platform.</p>
          <a href="mailto:feedback@proofresponse.com?subject=Platform Feedback" className="support-btn secondary">
            Send Feedback
          </a>
        </div>
      </div>

      <style jsx>{`
        .support-panel {
          display: grid;
          gap: 2rem;
        }
        .support-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .support-header p {
          color: #64748b;
        }
        .support-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .support-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }
        .support-card.primary {
          border-color: #3b82f6;
          background: linear-gradient(to bottom right, #eff6ff, #ffffff);
        }
        .support-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }
        .support-card p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }
        .support-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: #2563eb;
          color: white;
          width: 100%;
        }
        .support-btn:hover {
          background: #1d4ed8;
        }
        .support-btn.secondary {
          background: white;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .support-btn.secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
        .support-meta {
          font-size: 0.8rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

