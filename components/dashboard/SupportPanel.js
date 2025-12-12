import React from 'react';
import { FileText, Mail, MessageSquare, Download } from 'lucide-react';

export default function SupportPanel() {
  return (
    <div className="support-panel">
      <div className="support-header">
        <h2>Get Support</h2>
        <p>We are here to help you succeed.</p>
      </div>

      <div className="support-layout">
        {/* Contact Support Section */}
        <div className="support-section">
          <div className="support-card primary">
            <div className="support-icon">
              <Mail size={24} />
            </div>
            <h3>Contact Support</h3>
            <p>Need assistance with your account or have a question? Reach out to our team directly.</p>
            <a href="mailto:support@proofresponse.com" className="support-btn">
              Email Support
            </a>
            <span className="support-meta">Response time: Within 24 hours</span>
          </div>
        </div>

        {/* Documentation Section with PDF */}
        <div className="support-section">
          <div className="support-card documentation">
            <div className="support-icon">
              <FileText size={24} />
            </div>
            <h3>Documentation</h3>
            <p>Find step-by-step guides and answers to common questions in our help center.</p>
            
            <div className="pdf-viewer">
              <div className="pdf-placeholder">
                <FileText size={48} />
                <p>User Guide PDF</p>
                <a href="#" className="pdf-download-btn" onClick={(e) => e.preventDefault()}>
                  <Download size={18} />
                  Download PDF
                </a>
              </div>
            </div>
            
            <button className="support-btn secondary">
              Browse All Guides
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="support-section">
          <div className="support-card feedback">
            <div className="support-icon">
              <MessageSquare size={24} />
            </div>
            <h3>Feedback</h3>
            <p>Have a suggestion or found a bug? We'd love to hear from you to improve our platform.</p>
            <a href="mailto:feedback@proofresponse.com?subject=Platform Feedback" className="support-btn secondary">
              Send Feedback
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .support-panel {
          display: grid;
          gap: 2rem;
        }
        .support-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .support-header p {
          color: #64748b;
          font-size: 1rem;
        }
        .support-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .support-section {
          width: 100%;
        }
        .support-card {
          background: white;
          padding: 2rem;
          border-radius: 1.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
          border: 2px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: flex-start;
          transition: all 0.3s ease;
        }
        .support-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }
        .support-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #eff6ff, #f0f9ff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }
        .support-card.primary {
          border-color: #3b82f6;
          background: linear-gradient(to bottom right, #eff6ff, #ffffff);
        }
        .support-card.primary .support-icon {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1d4ed8;
        }
        .support-card.documentation {
          border-color: #10b981;
          background: linear-gradient(to bottom right, #f0fdf4, #ffffff);
        }
        .support-card.documentation .support-icon {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #059669;
        }
        .support-card.feedback {
          border-color: #8b5cf6;
          background: linear-gradient(to bottom right, #faf5ff, #ffffff);
        }
        .support-card.feedback .support-icon {
          background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
          color: #7c3aed;
        }
        .support-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .support-card p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }
        .pdf-viewer {
          width: 100%;
          margin: 1rem 0;
        }
        .pdf-placeholder {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          padding: 3rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .pdf-placeholder svg {
          color: #64748b;
        }
        .pdf-placeholder p {
          font-weight: 600;
          color: #475569;
          margin: 0;
        }
        .pdf-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }
        .pdf-download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .support-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          width: 100%;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }
        .support-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }
        .support-btn.secondary {
          background: white;
          color: #334155;
          border: 2px solid #cbd5e1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .support-btn.secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .support-meta {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .support-card {
            padding: 1.5rem;
          }
          .pdf-placeholder {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

