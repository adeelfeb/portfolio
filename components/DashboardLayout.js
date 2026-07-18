'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const SIDEBAR_COLLAPSE_KEY = 'ix-sidebar-collapsed'

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
    'blogs': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    'portfolios': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
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
    'help': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    'privacy': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M9 12l2 2 4-4"></path>
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
    'valentine-urls': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    ),
    'requests': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    'messages': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    'whatsapp-analysis': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"></path>
        <path d="M7 12v4"></path>
        <path d="M12 7v9"></path>
        <path d="M17 10v6"></path>
      </svg>
    ),
    'settings': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
      </svg>
    ),
  }
  return icons[key] || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  )
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function DashboardLayout({
  user,
  navItems,
  activeNav,
  onNavSelect,
  onOpenSettings,
  onLogout,
  isLoggingOut,
  chatUnreadCount = 0,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const sidebarRef = useRef(null)
  const settingsRef = useRef(null)
  const notifRef = useRef(null)

  const displayName = user?.name || 'User'
  const userRole = (user?.role || '').toLowerCase()
  const items = Array.isArray(navItems) ? navItems : []
  const messagesUnread = typeof chatUnreadCount === 'number' ? chatUnreadCount : 0

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY)
      if (stored !== null) setCollapsed(JSON.parse(stored))
    } catch {}
  }, [])

  // Save collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(collapsed))
    } catch {}
  }, [collapsed])

  // ESC key handling
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        setSettingsOpen(false)
        setNotificationsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Body overflow lock when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  // Click outside handlers
  useEffect(() => {
    const handleClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : data.notifications || [])
      }
    } catch {}
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count || 0)
      }
    } catch {}
  }, [])

  // Poll unread count every 15s
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 15000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (notificationsOpen) {
      setNotifLoading(true)
      fetchNotifications().finally(() => setNotifLoading(false))
    }
  }, [notificationsOpen, fetchNotifications])

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await fetch(`/api/notifications/${notif._id || notif.id}`, { method: 'PUT' })
        setNotifications(prev => prev.map(n => (n._id || n.id) === (notif._id || notif.id) ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch {}
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const toggleCollapse = () => setCollapsed(c => !c)

  return (
    <div className="ix-page">
      {/* TopBar */}
      <header className="ix-topbar">
        <div className="ix-topbar-left">
          {/* Collapse toggle (desktop only) */}
          <button
            className="ix-topbar-collapse"
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="15" y2="6"></line>
                  <line x1="3" y1="18" x2="15" y2="18"></line>
                </>
              )}
            </svg>
          </button>
          {/* Burger menu (mobile only) */}
          <button
            className="ix-topbar-burger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="ix-topbar-center">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="ewLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#ewLogoGrad)" />
              <path d="M12 28C12 28 10 14 24 10C24 10 26 26 12 28Z" fill="white" opacity="0.95" />
              <path d="M18 26C18 26 17 18 26 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
            </svg>
            <span className="font-subheading font-semibold text-sm text-gray-800 hidden sm:block">
              <span className="text-emerald-600">Design</span>
              <span className="text-gray-500"> n </span>
              <span className="text-purple-600">Dev</span>
            </span>
            <span className="text-gray-400 text-xs font-subheading hidden md:inline">|</span>
            <span className="text-gray-500 text-xs font-subheading hidden md:inline capitalize">{displayName}</span>
          </div>
        </div>

        <div className="ix-topbar-right">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              className="ix-notif-trigger"
              onClick={() => { setNotificationsOpen(o => !o); setSettingsOpen(false) }}
              aria-label="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="ix-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            {notificationsOpen && (
              <div className="ix-notif-dropdown">
                <div className="ix-notif-header">
                  <span className="font-subheading font-semibold text-sm text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-subheading">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="ix-notif-list">
                  {notifLoading ? (
                    <div className="ix-notif-empty">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="ix-notif-empty">No notifications</div>
                  ) : (
                    notifications.slice(0, 20).map((notif, i) => (
                      <div
                        key={notif._id || notif.id || i}
                        className={`ix-notif-item ${!notif.read ? 'bg-emerald-50/50' : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'submitted' ? 'bg-blue-100 text-blue-600' :
                          notif.type === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                          notif.type === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-subheading truncate">{notif.message || notif.title || 'Notification'}</p>
                          <p className="text-xs text-gray-400 font-subheading">{formatRelativeTime(notif.createdAt || notif.date)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div ref={settingsRef} className="relative">
            <button
              className="ix-settings-trigger"
              onClick={() => { setSettingsOpen(o => !o); setNotificationsOpen(false) }}
              aria-label="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
            </button>
            {settingsOpen && (
              <div className="ix-settings-dropdown">
                <div className="ix-settings-header">
                  <div className="flex items-center gap-3">
                    <div className="ix-settings-avatar">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-subheading font-semibold text-sm text-gray-800">{displayName}</p>
                      <p className="font-subheading text-xs text-gray-500 capitalize">{userRole.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
                <div className="ix-settings-body">
                  <button className="ix-settings-item" onClick={() => { onOpenSettings?.(); setSettingsOpen(false) }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    My Profile
                  </button>
                  {userRole === 'superadmin' && (
                    <button className="ix-settings-item" onClick={() => { setSettingsOpen(false) }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>
                      System Settings
                    </button>
                  )}
                  <button className="ix-settings-item" onClick={() => setSettingsOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Help & Support
                  </button>
                  <div className="ix-settings-divider"></div>
                  <button className="ix-settings-item ix-settings-item--danger" onClick={() => { onLogout?.(); setSettingsOpen(false) }} disabled={isLoggingOut}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Shell: sidebar + content */}
      <div className={`ix-shell${collapsed ? ' ix-shell--collapsed' : ''}`}>
        {sidebarOpen && <div className="ix-overlay ix-overlay--visible" onClick={() => setSidebarOpen(false)} />}

        {/* Left Sidebar */}
        <aside ref={sidebarRef} className={`ix-sidebar${sidebarOpen ? ' ix-sidebar--open' : ''}${collapsed ? ' ix-sidebar--collapsed' : ''}`}>
          <div className="ix-sidebar-brand">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="ewLogoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#ewLogoGrad2)" />
              <path d="M12 28C12 28 10 14 24 10C24 10 26 26 12 28Z" fill="white" opacity="0.95" />
              <path d="M18 26C18 26 17 18 26 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
            </svg>
            <span className="font-subheading font-semibold text-sm text-gray-800">
              <span className="text-emerald-600">Design</span>
              <span className="text-gray-500"> n </span>
              <span className="text-purple-600">Dev</span>
            </span>
          </div>

          <nav className="ix-sidebar-nav">
            {items.map((item) => {
              const isActive = item.key === activeNav
              return (
                <button
                  key={item.key}
                  className={`ix-nav-btn${isActive ? ' ix-nav-btn--active' : ''}`}
                  onClick={() => {
                    onNavSelect?.(item.key)
                    if (window.innerWidth < 1180) setSidebarOpen(false)
                  }}
                >
                  {getNavIcon(item.key)}
                  <span>{item.label}</span>
                  {item.key === 'messages' && messagesUnread > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {messagesUnread > 99 ? '99+' : messagesUnread}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="ix-sidebar-footer">
            <button
              className={`ix-nav-btn${activeNav === 'settings' ? ' ix-nav-btn--active' : ''}`}
              onClick={() => {
                onOpenSettings?.()
                if (window.innerWidth < 1180) setSidebarOpen(false)
              }}
            >
              {getNavIcon('settings')}
              <span>Settings</span>
            </button>
            <button
              className="ix-nav-btn text-red-600 hover:bg-red-50"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="ix-content">
          <div className="ix-content-scroll">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="ix-bottom-nav">
        <div className="ix-bottom-nav-scroll">
          {items.slice(0, 5).map((item) => {
            const isActive = item.key === activeNav
            return (
              <button
                key={item.key}
                className={`ix-bottom-nav-btn${isActive ? ' ix-bottom-nav-btn--active' : ''}`}
                onClick={() => onNavSelect?.(item.key)}
              >
                {getNavIcon(item.key)}
                <span>{item.label}</span>
              </button>
            )
          })}
          <button
            className="ix-bottom-nav-btn"
            onClick={() => { setSidebarOpen(true) }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
