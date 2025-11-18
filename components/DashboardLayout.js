import { useState, useEffect } from 'react';

// Category mapping for navigation items
// Marketing team: Web Scraper, Team Insights, Funding Opportunities
// HR team: Candidates, Jobs, Overview, Transcripts, Vendors, City Service Routes, Add Origin
// All users: API Endpoints, Reports, User Management
const getNavCategory = (key) => {
  const marketing = ['scraper', 'team', 'funding'];
  const hr = ['candidates', 'jobs', 'overview', 'transcripts', 'vendors', 'city-service-routes', 'add-origin', 'loxo'];
  const all = ['api-endpoints', 'reports', 'user-management', 'submissions', 'resources', 'support', 'updates', 'activity'];
  
  if (marketing.includes(key)) return 'marketing';
  if (hr.includes(key)) return 'hr';
  return 'all';
};

// Icon mapping for navigation items
const getNavIcon = (key) => {
  const icons = {
    'overview': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    'user-management': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    'jobs': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    'candidates': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        <circle cx="18" cy="7" r="2"></circle>
      </svg>
    ),
    'loxo': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    ),
    'transcripts': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    'vendors': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-4M4 7h4m0 0v12m0-12l-4 4m4-4l4 4m8 0v12m0-12l-4 4m4-4l4 4"></path>
      </svg>
    ),
    'city-service-routes': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    'funding': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    'add-origin': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    ),
    'api-endpoints': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16M4 12h16M4 17h16"></path>
        <circle cx="8" cy="7" r="1"></circle>
        <circle cx="8" cy="12" r="1"></circle>
        <circle cx="8" cy="17" r="1"></circle>
      </svg>
    ),
    'reports': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
    'submissions': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    ),
    'team': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    'scraper': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
    'resources': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    'support': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    'updates': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ),
    'activity': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
  };
  return icons[key] || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
};

export default function DashboardLayout({
  user,
  navItems,
  activeNav,
  onNavSelect,
  onOpenSettings,
  onLogout,
  isLoggingOut,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roleLabel = user?.role ? user.role.replace(/_/g, ' ') : 'User';
  const items = Array.isArray(navItems) ? navItems : [];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setSidebarOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (sidebarOpen && window.innerWidth <= 960) {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        if (sidebar && toggle && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
          setSidebarOpen(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="dashboard-shell">
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand" aria-label="Application" style={{ padding: '0.8rem 0.85rem 0.6rem' }}>
            <div className="brand-mark">TS</div>
            <div className="brand-text">
              <span className="brand-title">TheServer</span>
              <span className="brand-subtitle">{roleLabel}</span>
            </div>
          </div>

          <nav className="nav" aria-label="Primary" style={{ padding: '0 0.85rem' }}>
            <ul className="nav-list">
              {items.map((item) => {
                const isActive = item.key === activeNav;
                const category = getNavCategory(item.key);
                return (
                  <li key={item.key} className="nav-list-item">
                    <button
                      type="button"
                      className={`nav-button nav-button--${category}${isActive ? ' is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        onNavSelect?.(item.key);
                        if (window.innerWidth <= 960) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      <span className="nav-icon">{getNavIcon(item.key)}</span>
                      <span className="nav-label">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="sidebar-bottom" aria-label="Secondary" style={{ padding: '0.6rem 0.85rem 0.85rem' }}>
          <button
            type="button"
            className={`secondary-button secondary-button--settings${activeNav === 'settings' ? ' is-active' : ''}`}
            onClick={() => {
              onOpenSettings?.();
              if (window.innerWidth <= 960) {
                setSidebarOpen(false);
              }
            }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
            </span>
            <span className="nav-label">SETTINGS</span>
          </button>
          <button
            type="button"
            className="secondary-button secondary-button--logout"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span className="nav-label">{isLoggingOut ? 'LOGGING OUT…' : 'LOGOUT'}</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="content-inner">{children}</div>
      </main>

      <style jsx>{`
        .dashboard-shell {
          height: 100vh;
          display: flex;
          background: var(--dashboard-surface, #f8fafc);
          color: var(--dashboard-foreground, #0f172a);
          overflow: hidden;
          position: relative;
        }

        .sidebar-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1001;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 0.75rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
        }

        .sidebar-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .sidebar-toggle:active {
          transform: scale(0.98);
        }

        .hamburger-icon {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 24px;
          height: 18px;
        }

        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background: #0f172a;
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .sidebar {
          width: min(228px, 21vw);
          background: linear-gradient(to bottom, #f8faff, #f1f5f9);
          color: #0f172a;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100%;
          padding: 0;
          border-right: 1px solid rgba(148, 163, 184, 0.15);
          transition: transform 0.3s ease;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
          padding: 0;
          gap: 1.05rem;
          min-height: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .brand-mark {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #38bdf8, #2563eb);
          display: grid;
          place-items: center;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .brand-title {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
        }

        .brand-subtitle {
          font-size: 0.72rem;
          color: rgba(71, 85, 105, 0.8);
          text-transform: capitalize;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0;
          margin: 0;
        }

        .nav-button {
          width: 100%;
          text-align: left;
          padding: 0.75rem 0.9rem;
          border-radius: 16px;
          border: none;
          background: rgba(148, 163, 184, 0.08);
          color: #334155;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        /* Marketing team - Purple/Pink theme */
        .nav-button--marketing {
          background: rgba(147, 51, 234, 0.12);
          color: #7c3aed;
        }

        .nav-button--marketing:hover,
        .nav-button--marketing:focus-visible {
          outline: none;
          background: rgba(147, 51, 234, 0.18);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.15);
          color: #6d28d9;
        }

        .nav-button--marketing.is-active {
          background: linear-gradient(135deg, rgba(192, 132, 252, 0.25), rgba(168, 85, 247, 0.2));
          box-shadow: inset 0 0 0 1px rgba(196, 181, 253, 0.5), 0 2px 8px rgba(168, 85, 247, 0.15);
          color: #6d28d9;
        }

        .nav-button--marketing.is-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: #7c3aed;
          border-radius: 0 4px 4px 0;
        }

        /* HR team - Blue theme */
        .nav-button--hr {
          background: rgba(37, 99, 235, 0.12);
          color: #2563eb;
        }

        .nav-button--hr:hover,
        .nav-button--hr:focus-visible {
          outline: none;
          background: rgba(37, 99, 235, 0.18);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
          color: #1d4ed8;
        }

        .nav-button--hr.is-active {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(59, 130, 246, 0.2));
          box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.5), 0 2px 8px rgba(59, 130, 246, 0.15);
          color: #1d4ed8;
        }

        .nav-button--hr.is-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: #2563eb;
          border-radius: 0 4px 4px 0;
        }

        /* All users - Teal/Green theme */
        .nav-button--all {
          background: rgba(20, 184, 166, 0.12);
          color: #14b8a6;
        }

        .nav-button--all:hover,
        .nav-button--all:focus-visible {
          outline: none;
          background: rgba(20, 184, 166, 0.18);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.15);
          color: #0d9488;
        }

        .nav-button--all.is-active {
          background: linear-gradient(135deg, rgba(94, 234, 212, 0.25), rgba(45, 212, 191, 0.2));
          box-shadow: inset 0 0 0 1px rgba(153, 246, 228, 0.5), 0 2px 8px rgba(45, 212, 191, 0.15);
          color: #0d9488;
        }

        .nav-button--all.is-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: #14b8a6;
          border-radius: 0 4px 4px 0;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          opacity: 0.85;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .nav-button:hover .nav-icon,
        .nav-button.is-active .nav-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .nav-label {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.875rem;
          font-weight: 600;
          transition: color 0.25s ease;
        }

        .nav-button.is-active .nav-label {
          font-weight: 700;
        }

        .sidebar-bottom {
          margin-top: auto;
          display: grid;
          gap: 0.6rem;
          padding: 0;
        }

        .secondary-button {
          width: 100%;
          text-align: left;
          padding: 0.75rem 0.9rem;
          border-radius: 16px;
          border: none;
          background: rgba(148, 163, 184, 0.1);
          color: #475569;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .secondary-button .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          opacity: 0.85;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .secondary-button .nav-label {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.875rem;
          font-weight: 600;
          transition: color 0.25s ease;
        }

        .secondary-button:hover .nav-icon,
        .secondary-button.is-active .nav-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .secondary-button:hover,
        .secondary-button:focus-visible {
          outline: none;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          background: rgba(148, 163, 184, 0.15);
          color: #334155;
        }

        .secondary-button--settings:hover,
        .secondary-button--settings:focus-visible {
          background: rgba(96, 165, 250, 0.15);
          color: #2563eb;
        }

        .secondary-button--settings.is-active {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(59, 130, 246, 0.2));
          box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.5), 0 2px 8px rgba(59, 130, 246, 0.15);
          color: #1d4ed8;
        }

        .secondary-button--settings.is-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: #2563eb;
          border-radius: 0 4px 4px 0;
        }

        .secondary-button--settings.is-active .nav-label {
          font-weight: 700;
        }

        .secondary-button--logout {
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
          box-shadow: inset 0 0 0 1px rgba(254, 202, 202, 0.3);
        }

        .secondary-button--logout:hover,
        .secondary-button--logout:focus-visible {
          background: rgba(239, 68, 68, 0.18);
          box-shadow: inset 0 0 0 1px rgba(254, 202, 202, 0.4), 0 2px 8px rgba(239, 68, 68, 0.15);
          color: #b91c1c;
        }

        .secondary-button--logout:disabled {
          cursor: wait;
          opacity: 0.7;
          transform: none;
        }

        .content {
          flex: 1;
          display: flex;
          min-height: 0;
        }

        .content-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 3rem 2.5rem 3rem;
          overflow-y: auto;
          gap: 2rem;
        }

        @media (max-width: 960px) {
          .sidebar-toggle {
            display: flex;
          }

          .dashboard-shell {
            flex-direction: column;
            height: 100vh;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: min(280px, 85vw);
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
            overflow-y: auto;
            overflow-x: hidden;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar.is-open {
            transform: translateX(0);
          }

          .sidebar-top,
          .sidebar-bottom {
            padding: 1.25rem;
          }

          .sidebar-top {
            padding-top: 1.25rem;
          }

          .nav-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .nav-button {
            padding: 0.7rem 0.85rem;
            font-size: 0.875rem;
          }

          .nav-icon {
            width: 18px;
            height: 18px;
          }

          .secondary-button {
            width: 100%;
            padding: 0.7rem 0.85rem;
            font-size: 0.875rem;
          }

          .secondary-button .nav-icon {
            width: 18px;
            height: 18px;
          }

          .content-inner {
            padding: 2rem 1.5rem 3rem;
            margin-top: 0;
            padding-top: 4.5rem;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            animation: fadeIn 0.3s ease;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .sidebar-toggle {
            top: 0.75rem;
            right: 0.75rem;
            width: 44px;
            height: 44px;
            padding: 0.65rem;
            border-radius: 10px;
          }

          .content-inner {
            padding: 1.5rem 1rem 2rem;
            padding-top: 4rem;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .sidebar {
            width: min(260px, 90vw);
          }

          .nav-button {
            padding: 0.65rem 0.8rem;
            font-size: 0.85rem;
            gap: 0.65rem;
          }

          .nav-icon {
            width: 16px;
            height: 16px;
          }

          .secondary-button {
            padding: 0.65rem 0.8rem;
            font-size: 0.85rem;
            gap: 0.65rem;
          }

          .secondary-button .nav-icon {
            width: 16px;
            height: 16px;
          }

          .brand-mark {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 10px;
          }

          .sidebar-top,
          .sidebar-bottom {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .nav-button {
            padding: 0.6rem 0.75rem;
            font-size: 0.8rem;
            gap: 0.6rem;
          }

          .nav-label {
            font-size: 0.8rem;
          }

          .secondary-button {
            padding: 0.6rem 0.75rem;
            font-size: 0.8rem;
            gap: 0.6rem;
          }

          .secondary-button .nav-label {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}