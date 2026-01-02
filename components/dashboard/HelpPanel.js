import React from 'react';
import { Code, Globe, Smartphone, Rocket, Search, Mail, ExternalLink } from 'lucide-react';

export default function HelpPanel() {
  return (
    <div className="help-panel">
      <div className="help-header">
        <h2>Need Professional Development Services?</h2>
        <p>I'm a Software Engineer, Website Developer, Full Stack Developer, and App Developer ready to help bring your projects, ventures, and ideas to life.</p>
      </div>

      <div className="help-intro">
        <div className="help-intro-card">
          <div className="help-intro-icon">
            <Rocket size={32} />
          </div>
          <div className="help-intro-content">
            <h3>Let's Accomplish Your Goals</h3>
            <p>Let's accomplish your goals in the coming years with cutting-edge AI and functionality that you can sell and grow with. <strong>Connect with us today!</strong></p>
            <div className="help-offer">
              <span className="offer-badge">✨ Special Offer</span>
              <p>Get <strong>discounted prices</strong> and <strong>free guidance</strong> for your project workflow!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="help-services">
        <h3 className="services-title">Our Services</h3>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <Globe size={24} />
            </div>
            <h4>Website Development</h4>
            <p>Custom websites built with modern technologies</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Code size={24} />
            </div>
            <h4>Programming & Software</h4>
            <p>Full-stack software solutions tailored to your needs</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Smartphone size={24} />
            </div>
            <h4>App Development</h4>
            <p>Mobile and web applications for iOS, Android, and web</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Rocket size={24} />
            </div>
            <h4>Deployment</h4>
            <p>Seamless deployment and hosting solutions</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Search size={24} />
            </div>
            <h4>SEO</h4>
            <p>Search engine optimization to boost your visibility</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Mail size={24} />
            </div>
            <h4>Email Marketing</h4>
            <p>Effective email campaigns and automation</p>
          </div>
        </div>
      </div>

      <div className="help-connect">
        <h3 className="connect-title">Connect With Us</h3>
        <div className="connect-links">
          <a 
            href="https://www.fiverr.com/s/EgQz3ey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="connect-link fiverr"
          >
            <div className="link-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.105v2.535h-1.6v-3.64h-.85v-.89h.85v-.74c0-1.19.345-2.09 1.23-2.7.735-.48 1.67-.57 2.52-.57v.9c-.405 0-.795.03-1.14.15-.525.21-.78.75-.78 1.38v.58h1.52v.89zm-5.025 0h-3.6v6.24h1.6v-2.25h1.7c.99 0 1.65-.65 1.65-1.8 0-1.02-.62-2.19-2.35-2.19zm.1 2.7h-1.8v-1.8h1.8c.6 0 .9.35.9.9s-.3.9-.9.9zm-4.125-2.7h-1.6v6.24h1.6v-6.24zm-2.7 0H4.9v.9h1.375v5.34h1.6v-5.34h1.125v-.9zm-3.6 0H.9v.9h1.6v5.34h1.6v-5.34h1.125v-.9z"/>
              </svg>
            </div>
            <div className="link-content">
              <span className="link-label">Fiverr</span>
              <span className="link-meta">View Profile</span>
            </div>
            <ExternalLink size={18} className="link-arrow" />
          </a>
          <a 
            href="https://www.upwork.com/freelancers/~015f09e4ce1f66527f?p=1804023285153173504" 
            target="_blank" 
            rel="noopener noreferrer"
            className="connect-link upwork"
          >
            <div className="link-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.545-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
              </svg>
            </div>
            <div className="link-content">
              <span className="link-label">Upwork</span>
              <span className="link-meta">View Profile</span>
            </div>
            <ExternalLink size={18} className="link-arrow" />
          </a>
          <a 
            href="https://designndev.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="connect-link website"
          >
            <div className="link-icon">
              <Globe size={24} />
            </div>
            <div className="link-content">
              <span className="link-label">Our Website</span>
              <span className="link-meta">designndev.com</span>
            </div>
            <ExternalLink size={18} className="link-arrow" />
          </a>
        </div>
      </div>

      <style jsx>{`
        .help-panel {
          display: grid;
          gap: 2.5rem;
        }
        .help-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        .help-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .help-header p {
          color: #64748b;
          font-size: 1.1rem;
          line-height: 1.7;
        }
        .help-intro {
          margin: 1rem 0;
        }
        .help-intro-card {
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
          border: 2px solid #3b82f6;
          border-radius: 1.5rem;
          padding: 2rem;
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .help-intro-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
        }
        .help-intro-content {
          flex: 1;
        }
        .help-intro-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.75rem 0;
        }
        .help-intro-content p {
          color: #475569;
          font-size: 1rem;
          line-height: 1.7;
          margin: 0 0 1rem 0;
        }
        .help-intro-content strong {
          color: #1d4ed8;
          font-weight: 600;
        }
        .help-offer {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin-top: 1rem;
        }
        .offer-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .help-offer p {
          color: #92400e;
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.6;
        }
        .help-offer strong {
          color: #78350f;
        }
        .help-services {
          margin-top: 1rem;
        }
        .services-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.25rem;
        }
        .service-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.3s ease;
        }
        .service-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
          transform: translateY(-4px);
        }
        .service-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
        }
        .service-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }
        .service-card p {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }
        .help-connect {
          margin-top: 1rem;
        }
        .connect-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }
        .connect-links {
          display: grid;
          gap: 1rem;
        }
        .connect-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 2px solid;
        }
        .connect-link.fiverr {
          background: linear-gradient(135deg, #1dbf73, #19a463);
          border-color: #1dbf73;
          color: white;
        }
        .connect-link.upwork {
          background: linear-gradient(135deg, #14a800, #0d7a00);
          border-color: #14a800;
          color: white;
        }
        .connect-link.website {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: #2563eb;
          color: white;
        }
        .connect-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .link-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .link-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .link-label {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .link-meta {
          font-size: 0.85rem;
          opacity: 0.9;
        }
        .link-arrow {
          opacity: 0.8;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .help-header h2 {
            font-size: 1.75rem;
          }
          .help-intro-card {
            flex-direction: column;
            padding: 1.5rem;
          }
          .help-intro-icon {
            width: 3.5rem;
            height: 3.5rem;
          }
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

