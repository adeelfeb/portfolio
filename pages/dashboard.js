import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/DashboardLayout';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import AddOrigin from '../components/dashboard/AddOrigin';
import UserOverviewTable from '../components/dashboard/UserOverviewTable';
import ApiEndpointsPanel from '../components/dashboard/ApiEndpointsPanel';
import BlogManager from '../components/dashboard/BlogManager';
import PortfolioManager from '../components/dashboard/PortfolioManager';
import NewYearResolutionManager from '../components/dashboard/NewYearResolutionManager';
import SupportPanel from '../components/dashboard/SupportPanel';
import ResourcesPanel from '../components/dashboard/ResourcesPanel';
import { getUserFromRequest } from '../lib/auth';

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user._id?.toString?.() || user.id || null,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'base_user',
    roleRef: user.roleRef?.toString?.() || user.roleRef || null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  };
}

export async function getServerSideProps(context) {
  try {
    const { req } = context;
    const user = await getUserFromRequest(req);

    if (!user) {
      return { redirect: { destination: '/login', permanent: false } };
    }

    const serializedUser = serializeUser(user);
    return { props: { user: serializedUser } };
  } catch (error) {
    // If auth fails (e.g., DB not available), redirect to login
    // This allows the app to work even without backend
    console.error('[Dashboard] Error in getServerSideProps:', error.message);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

const NAVIGATION_BY_ROLE = {
  superadmin: [
    { key: 'overview', label: 'Overview' },
    { key: 'user-management', label: 'User Management' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'portfolios', label: 'Portfolios' },
    { key: 'add-origin', label: 'Add Origin' },
    { key: 'api-endpoints', label: 'API Endpoints' },
  ],
  admin: [
    { key: 'overview', label: 'Overview' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'portfolios', label: 'Portfolios' },
    { key: 'add-origin', label: 'Add Origin' },
    { key: 'api-endpoints', label: 'API Endpoints' },
  ],
  hr: [
    { key: 'overview', label: 'Overview' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'portfolios', label: 'Portfolios' },
    { key: 'add-origin', label: 'Add Origin' },
    { key: 'api-endpoints', label: 'API Endpoints' },
  ],
  hr_admin: [
    { key: 'overview', label: 'Overview' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'portfolios', label: 'Portfolios' },
    { key: 'add-origin', label: 'Add Origin' },
    { key: 'api-endpoints', label: 'API Endpoints' },
  ],
  base_user: [
    { key: 'blogs', label: 'Blogs' },
    { key: 'resolutions', label: 'New Year Resolutions' },
    { key: 'resources', label: 'Resources' },
    { key: 'support', label: 'Support' },
  ],
};

const FALLBACK_NAV = [
  { key: 'overview', label: 'Overview' },
  { key: 'updates', label: 'Updates' },
  { key: 'activity', label: 'Recent Activity' },
];

const SECTION_DESCRIPTORS = {
  overview: {
    body: (user) => {
      const normalizedRole = (user?.role || '').toLowerCase();
      if (normalizedRole === 'base_user') {
        return null;
      }
      return <UserOverviewTable currentUser={user} />;
    },
  },
  resolutions: {
    subtitle: 'Manage and track your New Year resolutions.',
    hideHeader: true,
    body: (user) => <NewYearResolutionManager />,
  },
  resources: {
    subtitle: 'Centralize guidelines, FAQs, and documentation.',
    hideHeader: true,
    body: () => <ResourcesPanel />,
  },
  support: {
    subtitle: 'Get help and contact support.',
    hideHeader: true,
    body: () => <SupportPanel />,
  },
  'user-management': {
    subtitle: 'Manage access, roles, and permissions across your organization.',
    panels: [
      {
        title: 'Team roster',
        description: 'View who is active, pending, or requires action.',
      },
      {
        title: 'Role controls',
        description: 'Assign, update, or revoke roles in a few clicks.',
      },
    ],
    listTitle: 'Administrative shortcuts',
    list: [
      { title: 'Invite a new teammate' },
      { title: 'Review access requests' },
      { title: 'Audit recent changes' },
    ],
  },
  'add-origin': {
    hideHeader: true,
    body: () => <AddOrigin />,
  },
  'api-endpoints': {
    hideHeader: true,
    body: () => <ApiEndpointsPanel />,
  },
  blogs: {
    subtitle: 'Create, manage, and publish SEO-optimized blog posts.',
    hideHeader: true,
    body: (user) => <BlogManager user={user} />,
  },
  portfolios: {
    subtitle: 'Create, manage, and publish portfolio projects with SEO optimization.',
    hideHeader: true,
    body: (user) => <PortfolioManager user={user} />,
  },
  submissions: {
    subtitle: 'Oversee incoming submissions and coordinate reviews.',
    panels: [
      {
        title: 'Awaiting review',
        description: 'Assign reviewers and keep momentum on pending submissions.',
        meta: '4 pending',
      },
      {
        title: 'Completed this week',
        description: 'Celebrate wins and communicate next steps.',
      },
    ],
  },
  team: {
    subtitle: 'Understand how your team is collaborating and contributing.',
    panels: [
      {
        title: 'Engagement',
        description: 'Spot activity spikes and identify opportunities to support.',
      },
      {
        title: 'Highlights',
        description: 'Recognize key contributions and share kudos.',
      },
    ],
  },
  updates: {
    subtitle: 'Catch up on new announcements, releases, and reminders.',
    panels: [
      {
        title: 'Announcements',
        description: 'Organization-wide updates will appear here.',
      },
      {
        title: 'Changelog',
        description: 'Review what changed since you last signed in.',
      },
    ],
  },
  activity: {
    subtitle: 'Follow recent actions taken across your workspace.',
    panels: [
      {
        title: 'Team activity',
        description: 'See who updated records, approved requests, or left notes.',
      },
      {
        title: 'Audit trail',
        description: 'Keep everything compliant with full transparency.',
      },
    ],
  },
};

export default function Dashboard({ user }) {
  const [sessionUser, setSessionUser] = useState(user);
  const normalizedRole = (sessionUser?.role || '').toLowerCase();
  const navItems = NAVIGATION_BY_ROLE[normalizedRole] || FALLBACK_NAV;
  const router = useRouter();

  // Fetch and store token from cookies if not in localStorage
  useEffect(() => {
    const fetchToken = async () => {
      // Only fetch if token is not in localStorage
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.token) {
              localStorage.setItem('token', data.data.token);
            }
          }
        } catch (error) {
          console.error('Failed to fetch token:', error);
        }
      }
    };
    fetchToken();
  }, []);

  const primaryNav = useMemo(() => navItems, [navItems]);
  const initialSection = useMemo(() => {
    return primaryNav[0]?.key || FALLBACK_NAV[0].key;
  }, [primaryNav]);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const resolveSectionKey = useCallback(
    (key) => {
      if (!key) return null;
      const sanitized = `${key}`.trim();
      if (!sanitized) return null;
      const normalized = sanitized.toLowerCase();
      if (normalized === 'settings') {
        return 'settings';
      }
      const match = primaryNav.find((item) => item.key.toLowerCase() === normalized);
      return match?.key || null;
    },
    [primaryNav]
  );

  const updateUrlHash = useCallback((key) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('section')) {
        url.searchParams.delete('section');
      }
      url.hash = key ? key : '';
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(null, '', next);
    } catch {
      const basePath = `${window.location.pathname}${window.location.search}`;
      const hashPart = key ? `#${key}` : '';
      window.history.replaceState(null, '', `${basePath}${hashPart}`);
    }
  }, []);

  const sectionParam = router.query?.section;

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof sectionParam !== 'string') return;
    const resolvedKey = resolveSectionKey(sectionParam);
    if (!resolvedKey) return;
    setActiveSection((prev) => (prev === resolvedKey ? prev : resolvedKey));
    updateUrlHash(resolvedKey);
  }, [router.isReady, sectionParam, resolveSectionKey, updateUrlHash]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const applyHashToState = () => {
      let hashValue = window.location.hash.replace(/^#/, '');
      try {
        hashValue = decodeURIComponent(hashValue);
      } catch {
        // ignore decode errors and fall back to raw hash
      }
      const resolvedKey = resolveSectionKey(hashValue);
      if (!resolvedKey) return;
      setActiveSection((prev) => (prev === resolvedKey ? prev : resolvedKey));
      updateUrlHash(resolvedKey);
    };

    applyHashToState();
    window.addEventListener('hashchange', applyHashToState);
    return () => {
      window.removeEventListener('hashchange', applyHashToState);
    };
  }, [resolveSectionKey, updateUrlHash]);

  const isOverviewSection = activeSection === 'overview' && normalizedRole !== 'base_user';

  useEffect(() => {
    if (!primaryNav.length) return;
    const hasActive = primaryNav.some((item) => item.key === activeSection);
    const isSettings = activeSection === 'settings';
    if (!hasActive && !isSettings) {
      const fallbackKey = primaryNav[0].key;
      setActiveSection(fallbackKey);
      updateUrlHash(fallbackKey);
    }
  }, [primaryNav, activeSection, updateUrlHash]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!router.isReady) return;
    if (!activeSection) return;
    if (typeof sectionParam === 'string') return;
    if (window.location.hash) return;
    updateUrlHash(activeSection);
  }, [activeSection, router.isReady, sectionParam, updateUrlHash]);

  const handleSelectNav = useCallback(
    (key) => {
      setActiveSection(key);
      updateUrlHash(key);
    },
    [updateUrlHash]
  );

  const handleOpenSettings = useCallback(() => {
    setActiveSection('settings');
    updateUrlHash('settings');
  }, [updateUrlHash]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (!confirmed) return;
    }
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      await router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  const resolvedSectionKey =
    normalizedRole === 'base_user' && activeSection === 'overview'
      ? 'applications'
      : activeSection;

  const activeNavItem = primaryNav.find((item) => item.key === activeSection);
  const sectionDescriptor = SECTION_DESCRIPTORS[resolvedSectionKey] || {
    subtitle: 'This area will be available soon.',
    panels: [
      {
        title: 'In progress',
        description: 'Content for this section is being prepared.',
      },
    ],
  };

  const panels = sectionDescriptor.panels || [];
  const list = sectionDescriptor.list || [];
  const hasCustomBody = typeof sectionDescriptor.body === 'function';
  const sectionTitle = activeSection === 'settings' ? 'Settings' : activeNavItem?.label || 'Dashboard';
  const sectionSubtitle =
    activeSection === 'settings'
      ? 'Manage your personal details and keep your account secure.'
      : sectionDescriptor.subtitle;
  const hideHeader = Boolean(sectionDescriptor.hideHeader);

  return (
    <>
      <Head>
        <title>{sectionTitle} | Designndev Resolution list</title>
      </Head>
      <DashboardLayout
        user={sessionUser}
        navItems={primaryNav}
        activeNav={activeSection}
        onNavSelect={handleSelectNav}
        onOpenSettings={handleOpenSettings}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      >
        <div className="disclaimer-banner">
          <div className="disclaimer-content">
            <div className="disclaimer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <div className="disclaimer-text">
              <strong>Privacy & Confidentiality Commitment:</strong> This platform is an <strong>open-source project</strong> designed to help you maintain your New Year resolutions and write blogs for free. We <strong>do not collect, store, or sell your personal information</strong>. Your data privacy and confidentiality are of the <strong>highest importance to us</strong>. Enjoy managing your resolutions and todos with complete peace of mind.
            </div>
          </div>
        </div>
        <section className={`section ${isOverviewSection ? 'section--compact' : ''}`}>
          {!isOverviewSection && !hideHeader && (
            <header className="section-header">
              <h1 className="section-title">{sectionTitle}</h1>
              {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
            </header>
          )}
          <div className={`section-body ${isOverviewSection ? 'section-body--compact' : ''}`}>
            {activeSection === 'settings' ? (
              <SettingsPanel
                user={sessionUser}
                onProfileUpdated={(updated) => updated && setSessionUser(updated)}
              />
            ) : (
              <>
                {panels.length > 0 && (
                  <div className="section-panels">
                    {panels.map((panel) => (
                      <article className="section-card" key={panel.title}>
                        <div className="section-card-header">
                          <h2>{panel.title}</h2>
                          {panel.meta && <span className="section-meta">{panel.meta}</span>}
                        </div>
                        <p>{panel.description}</p>
                      </article>
                    ))}
                  </div>
                )}

                {list.length > 0 && (
                  <div className="section-list-wrap">
                    <h3 className="section-list-title">{sectionDescriptor.listTitle || 'Key actions'}</h3>
                    <ul className="section-list">
                      {list.map((item) => {
                        const id = typeof item === 'string' ? item : item.title;
                        const content = typeof item === 'string' ? { title: item } : item;
                        return (
                          <li key={id} className="section-list-item">
                            <span className="section-list-item-title">{content.title}</span>
                            {content.description && <p>{content.description}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {hasCustomBody && <div className="section-custom">{sectionDescriptor.body(sessionUser)}</div>}

                {panels.length === 0 && list.length === 0 && !hasCustomBody && (
                  <div className="empty-state">
                    <h2>Stay tuned</h2>
                    <p>We’re preparing something great for this section.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div className="promotion-banner">
          <div className="promotion-content">
            <div className="promotion-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="promotion-text">
              <strong>Need a Developer?</strong> I'm a <strong>Software Engineer</strong>, <strong>Website Developer</strong>, <strong>Full Stack Developer</strong>, and <strong>App Developer</strong> ready to help bring your projects, ventures, and ideas to life. Let's accomplish your goals in the coming years with cutting-edge AI and functionality that you can sell and grow with. <strong>Connect with us today!</strong>
            </div>
            <div className="promotion-links">
              <a 
                href="https://www.fiverr.com/s/EgQz3ey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="promotion-link promotion-link--fiverr"
                aria-label="Visit Fiverr Profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.105v2.535h-1.6v-3.64h-.85v-.89h.85v-.74c0-1.19.345-2.09 1.23-2.7.735-.48 1.67-.57 2.52-.57v.9c-.405 0-.795.03-1.14.15-.525.21-.78.75-.78 1.38v.58h1.52v.89zm-5.025 0h-3.6v6.24h1.6v-2.25h1.7c.99 0 1.65-.65 1.65-1.8 0-1.02-.62-2.19-2.35-2.19zm.1 2.7h-1.8v-1.8h1.8c.6 0 .9.35.9.9s-.3.9-.9.9zm-4.125-2.7h-1.6v6.24h1.6v-6.24zm-2.7 0H4.9v.9h1.375v5.34h1.6v-5.34h1.125v-.9zm-3.6 0H.9v.9h1.6v5.34h1.6v-5.34h1.125v-.9z"/>
                </svg>
                <span>Fiverr</span>
              </a>
              <a 
                href="https://www.upwork.com/freelancers/~015f09e4ce1f66527f?p=1804023285153173504" 
                target="_blank" 
                rel="noopener noreferrer"
                className="promotion-link promotion-link--upwork"
                aria-label="Visit Upwork Profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.545-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
                </svg>
                <span>Upwork</span>
              </a>
              <a 
                href="https://wa.me/923099670475" 
                target="_blank" 
                rel="noopener noreferrer"
                className="promotion-link promotion-link--whatsapp"
                aria-label="Contact on WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          .disclaimer-banner {
            position: sticky;
            top: 0;
            z-index: 100;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(59, 130, 246, 0.95));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(96, 165, 250, 0.3);
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
            margin: -2rem -3rem 2rem -3rem;
            padding: 1rem 3rem;
          }

          .disclaimer-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            max-width: 100%;
          }

          .disclaimer-icon {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            margin-top: 0.15rem;
            color: #ffffff;
            opacity: 0.95;
          }

          .disclaimer-text {
            flex: 1;
            color: #ffffff;
            font-size: 0.9rem;
            line-height: 1.6;
            margin: 0;
          }

          .disclaimer-text strong {
            font-weight: 600;
            color: #ffffff;
          }

          .promotion-banner {
            position: sticky;
            bottom: 0;
            z-index: 100;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-top: 1px solid rgba(110, 231, 183, 0.3);
            box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.15);
            margin: 2rem -3rem -2.5rem -3rem;
            padding: 1.25rem 3rem;
          }

          .promotion-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            max-width: 100%;
          }

          .promotion-icon {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            color: #ffffff;
            opacity: 0.95;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.95;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }

          .promotion-text {
            flex: 1;
            color: #ffffff;
            font-size: 0.9rem;
            line-height: 1.6;
            margin: 0;
          }

          .promotion-text strong {
            font-weight: 600;
            color: #ffffff;
          }

          .promotion-links {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-shrink: 0;
          }

          .promotion-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: #ffffff;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
          }

          .promotion-link:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .promotion-link svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }

          .promotion-link span {
            white-space: nowrap;
          }

          .section {
            display: grid;
            gap: 1rem;
            min-height: 100%;
            margin: 0;
            padding: 0;
          }

          .section-header {
            display: grid;
            gap: 0.5rem;
            margin: 0;
            padding: 0;
          }

          .section-title {
            font-size: clamp(1.9rem, 3.5vw, 2.35rem);
            font-weight: 600;
            color: #0f172a;
            margin: 0;
            padding: 0;
          }

          .section-subtitle {
            color: #475569;
            font-size: 1rem;
            line-height: 1.6;
            max-width: 60ch;
            margin: 0;
            padding: 0;
          }

          .section-body {
            display: grid;
            gap: 1.2rem;
            padding-bottom: 0.35rem;
          }

          .section--compact {
            gap: 0;
          }

          .section-body--compact {
            display: flex;
            gap: 0;
            padding-bottom: 0;
            margin-top: 0;
          }

          .section-body--compact > * {
            flex: 1 1 100%;
            min-width: 0;
          }

          .section-panels {
            display: grid;
            gap: 1.25rem;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }

          .section-card {
            border-radius: 1.1rem;
            background: white;
            padding: 1.6rem;
            box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
            display: grid;
            gap: 0.75rem;
          }

          .section-card-header {
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
            justify-content: space-between;
          }

          .section-card h2 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #0f172a;
          }

          .section-card p {
            color: #607089;
            line-height: 1.65;
          }

          .section-meta {
            font-size: 0.82rem;
            font-weight: 600;
            color: #2563eb;
            background: rgba(37, 99, 235, 0.12);
            padding: 0.35rem 0.65rem;
            border-radius: 999px;
          }

          .section-list-wrap {
            display: grid;
            gap: 0.75rem;
            background: white;
            border-radius: 1.1rem;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
            padding: 1.6rem;
          }

          .section-list-title {
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
          }

          .section-list {
            list-style: none;
            display: grid;
            gap: 0.85rem;
            margin: 0;
            padding: 0;
          }

          .section-list-item {
            display: grid;
            gap: 0.3rem;
            padding-left: 0.2rem;
          }

          .section-list-item-title {
            font-weight: 500;
            color: #0f172a;
          }

          .section-list-item p {
            color: #607089;
            line-height: 1.6;
          }

          .section-custom {
            background: white;
            border-radius: 1.1rem;
            padding: 1.6rem;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
          }

          .applications-overview {
            position: relative;
            display: grid;
            gap: 1.75rem;
            padding: 2rem;
            border-radius: 1.25rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(236, 72, 153, 0.1));
            border: 1px solid rgba(148, 163, 184, 0.18);
            overflow: hidden;
          }

          .applications-overview::before {
            content: '';
            position: absolute;
            inset: -40% -20% auto -20%;
            height: 240px;
            background: radial-gradient(circle at top, rgba(37, 99, 235, 0.2), transparent 70%);
            opacity: 0.65;
            pointer-events: none;
          }

          .applications-overview::after {
            content: '';
            position: absolute;
            inset: auto -25% -60% -25%;
            height: 320px;
            background: radial-gradient(circle at bottom, rgba(236, 72, 153, 0.18), transparent 70%);
            opacity: 0.6;
            pointer-events: none;
          }

          .applications-overview > * {
            position: relative;
            z-index: 1;
          }

          .applications-hero {
            display: grid;
            gap: 0.75rem;
            padding: 1.35rem 1.6rem;
            border-radius: 1.1rem;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.26);
            box-shadow: 0 16px 36px rgba(30, 41, 59, 0.16);
          }

          .applications-hero-pill {
            justify-self: flex-start;
            padding: 0.35rem 0.9rem;
            border-radius: 999px;
            background: rgba(37, 99, 235, 0.12);
            color: #1d4ed8;
            font-weight: 600;
            font-size: 0.85rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .applications-hero p {
            margin: 0;
            color: #0f172a;
            line-height: 1.65;
            font-size: 1.05rem;
          }

          .applications-hero strong {
            color: #1d4ed8;
          }

          .applications-metrics {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .applications-metric {
            display: grid;
            gap: 0.4rem;
            padding: 0.95rem 1.1rem;
            border-radius: 1rem;
            background: rgba(15, 23, 42, 0.72);
            color: #e2e8f0;
            box-shadow: 0 20px 42px rgba(15, 23, 42, 0.28);
            border: 1px solid rgba(148, 163, 184, 0.28);
            backdrop-filter: blur(6px);
          }

          .applications-metric-label {
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 600;
            color: rgba(226, 232, 240, 0.75);
          }

          .applications-metric-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #f8fafc;
          }

          .applications-metric-note {
            font-size: 0.9rem;
            opacity: 0.76;
            margin: 0;
          }

          .applications-basic-grid {
            display: grid;
            gap: 1.1rem;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }

          .applications-basic-card {
            position: relative;
            display: grid;
            gap: 0.65rem;
            padding: 1.35rem 1.2rem 1.4rem;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(203, 213, 225, 0.7);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
            overflow: hidden;
          }

          .applications-basic-card::before {
            content: '';
            position: absolute;
            inset: 0;
            opacity: 0.6;
            pointer-events: none;
          }

          .applications-basic-card--focus::before {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), transparent 70%);
          }

          .applications-basic-card--upcoming::before {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), transparent 70%);
          }

          .applications-basic-card--support::before {
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), transparent 70%);
          }

          .applications-basic-icon {
            width: 42px;
            height: 42px;
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.6));
            border: 1px solid rgba(96, 165, 250, 0.6);
            box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25);
          }

          .applications-basic-card--upcoming .applications-basic-icon {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.6));
            border-color: rgba(110, 231, 183, 0.6);
            box-shadow: 0 12px 28px rgba(16, 185, 129, 0.24);
          }

          .applications-basic-card--support .applications-basic-icon {
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(219, 39, 119, 0.6));
            border-color: rgba(251, 191, 185, 0.6);
            box-shadow: 0 12px 28px rgba(236, 72, 153, 0.25);
          }

          .applications-basic-label {
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #475569;
          }

          .applications-basic-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #0f172a;
          }

          .applications-basic-note {
            margin: 0;
            color: #475569;
            line-height: 1.65;
            font-size: 0.95rem;
          }

          .applications-actions {
            display: grid;
            gap: 0.85rem;
            padding: 1.2rem 1.4rem 1.5rem;
            border-radius: 1rem;
            background: rgba(15, 23, 42, 0.85);
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.25);
          }

          .applications-actions h2 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #e2e8f0;
          }

          .applications-actions-list {
            margin: 0;
            padding: 0;
            display: grid;
            gap: 0.6rem;
            list-style: none;
          }

          .applications-actions-list li {
            position: relative;
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
            padding: 0.85rem 1rem;
            border-radius: 0.85rem;
            background: rgba(15, 23, 42, 0.78);
            border: 1px solid rgba(148, 163, 184, 0.35);
            color: #cbd5f5;
          }

          .applications-actions-list li::before {
            content: '';
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: linear-gradient(135deg, #60a5fa, #a855f7);
            margin-top: 0.4rem;
            flex-shrink: 0;
          }

          .applications-actions-list span {
            line-height: 1.55;
          }

          @media (max-width: 720px) {
            .applications-overview {
              padding: 1.4rem;
            }
            .applications-hero {
              padding: 1.1rem 1.2rem;
            }
            .applications-metrics {
              grid-template-columns: 1fr;
            }
            .applications-basic-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .applications-overview {
              padding: 1.1rem;
              border-radius: 1rem;
            }
            .applications-basic-card {
              padding: 1rem 1rem 1.1rem;
            }
            .applications-actions {
              padding: 1rem 1.1rem 1.2rem;
            }
          }

          .empty-state {
            display: grid;
            gap: 0.5rem;
            text-align: center;
            background: white;
            border-radius: 1.1rem;
            padding: 2rem;
            box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
          }

          .empty-state h2 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #0f172a;
          }

          .empty-state p {
            color: #64748b;
          }

          @media (max-width: 960px) {
            .disclaimer-banner {
              margin: 0 -1.5rem 2rem -1.5rem;
              padding: 1rem 1.5rem;
              top: 0;
            }

            .disclaimer-content {
              gap: 0.85rem;
            }

            .disclaimer-icon {
              width: 20px;
              height: 20px;
              margin-top: 0.1rem;
            }

            .disclaimer-text {
              font-size: 0.85rem;
              line-height: 1.55;
            }

            .promotion-banner {
              margin: 2rem -1.5rem -3rem -1.5rem;
              padding: 1rem 1.5rem;
            }

            .promotion-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .promotion-icon {
              width: 24px;
              height: 24px;
            }

            .promotion-text {
              font-size: 0.85rem;
              line-height: 1.55;
            }

            .promotion-links {
              width: 100%;
              justify-content: flex-start;
              gap: 0.75rem;
            }

            .promotion-link {
              flex: 1;
              justify-content: center;
              padding: 0.55rem 0.85rem;
              font-size: 0.8rem;
            }

            .section-title {
              font-size: clamp(1.5rem, 4vw, 1.9rem);
            }
            .section-subtitle {
              font-size: 0.95rem;
              max-width: 100%;
            }
          }

          @media (max-width: 720px) {
            .disclaimer-banner {
              margin: 0 -1.5rem 1.5rem -1.5rem;
              padding: 0.9rem 1.5rem;
            }

            .disclaimer-content {
              gap: 0.75rem;
            }

            .disclaimer-icon {
              width: 18px;
              height: 18px;
              margin-top: 0.05rem;
            }

            .disclaimer-text {
              font-size: 0.8rem;
              line-height: 1.5;
            }

            .promotion-banner {
              margin: 1.5rem -1.5rem -3rem -1.5rem;
              padding: 0.9rem 1.5rem;
            }

            .promotion-content {
              gap: 0.85rem;
            }

            .promotion-icon {
              width: 22px;
              height: 22px;
            }

            .promotion-text {
              font-size: 0.8rem;
              line-height: 1.5;
            }

            .promotion-links {
              gap: 0.65rem;
            }

            .promotion-link {
              padding: 0.5rem 0.75rem;
              font-size: 0.75rem;
            }

            .promotion-link svg {
              width: 16px;
              height: 16px;
            }

            .section {
              gap: 1.5rem;
            }
            .section-body {
              gap: 1.25rem;
              padding-bottom: 0.75rem;
            }

            .section-panels {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .section-card {
              padding: 1.25rem;
            }

            .section-card h2 {
              font-size: 1rem;
            }

            .section-list-wrap {
              padding: 1.25rem;
            }

            .section-list-title {
              font-size: 0.95rem;
            }

            .section-custom {
              padding: 1.25rem;
            }

            .empty-state {
              padding: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .disclaimer-banner {
              margin: 0 -1rem 1.5rem -1rem;
              padding: 0.85rem 1rem;
            }

            .disclaimer-content {
              gap: 0.65rem;
            }

            .disclaimer-icon {
              width: 16px;
              height: 16px;
              margin-top: 0.05rem;
            }

            .disclaimer-text {
              font-size: 0.75rem;
              line-height: 1.45;
            }

            .promotion-banner {
              margin: 1.5rem -1rem -2rem -1rem;
              padding: 0.85rem 1rem;
            }

            .promotion-content {
              flex-direction: column;
              gap: 0.75rem;
            }

            .promotion-icon {
              width: 20px;
              height: 20px;
            }

            .promotion-text {
              font-size: 0.75rem;
              line-height: 1.45;
            }

            .promotion-links {
              width: 100%;
              flex-direction: column;
              gap: 0.6rem;
            }

            .promotion-link {
              width: 100%;
              justify-content: center;
              padding: 0.6rem 0.85rem;
              font-size: 0.75rem;
            }

            .promotion-link svg {
              width: 16px;
              height: 16px;
            }

            .section-header {
              gap: 0.4rem;
            }
            .section-title {
              font-size: 1.5rem;
            }
            .section-subtitle {
              font-size: 0.9rem;
            }
            .section-body {
              gap: 1rem;
            }
            .section-card {
              padding: 1rem;
              border-radius: 0.9rem;
            }
            .section-list-wrap {
              padding: 1rem;
              border-radius: 0.9rem;
            }
            .section-custom {
              padding: 1rem;
              border-radius: 0.9rem;
            }
          }
        `}</style>
      </DashboardLayout>
    </>
  );
}
