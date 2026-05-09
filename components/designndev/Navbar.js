'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Support both App Router and Pages Router
function useRouterCompat() {
  const [pathname, setPathname] = useState('')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)
      
      // Listen for route changes (works for both App Router and Pages Router)
      const handleRouteChange = () => {
        setPathname(window.location.pathname)
      }
      
      // Listen to popstate for browser back/forward
      window.addEventListener('popstate', handleRouteChange)
      
      // Also listen to pushstate/replacestate
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        handleRouteChange()
      }
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        handleRouteChange()
      }
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])
  
  return { asPath: pathname, pathname }
}

/**
 * Navbar Component
 * 
 * A responsive navigation bar with:
 * - Mobile menu toggle
 * - Smooth animations with Framer Motion
 * - Active link highlighting
 * - Responsive design with tablet view
 */
export default function Navbar() {
  const router = useRouterCompat()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Check if a link is active using Next.js router
  // Only check after component is mounted to avoid hydration mismatch
  const isActive = (href) => {
    if (!isMounted) return false
    const pathname = router.asPath || router.pathname
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/whatsapp-chat-analysis', label: 'Chat Analytics', isZap: true },
    { href: '/blogs', label: 'Blog' },
    { href: '/portfolio', label: 'Portfolio' },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className={`navbar rounded-2xl px-4 sm:px-6 py-2 sm:py-2.5 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white/90 backdrop-blur-sm shadow-md'
        }`}>
          <div className="flex items-center w-full">
            {/* Logo - left */}
            <div className="flex flex-1 justify-start min-w-0">
              <Link 
                href="/" 
                className="text-lg sm:text-xl font-bold no-underline hover:scale-[1.03] transition-transform duration-300 inline-block tracking-tight"
              >
                <span>
                  <span className="text-blue-600">Design</span>
                  <span className="text-gray-700"> n </span>
                  <span className="text-purple-600">Dev</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - centered */}
            <div className="hidden lg:flex flex-1 justify-center">
              <div className="flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-1.5 text-sm font-medium transition-all duration-200 relative no-underline whitespace-nowrap ${
                      isActive(item.href)
                        ? 'text-emerald-700 font-semibold'
                        : item.isZap
                          ? 'text-emerald-700 font-semibold hover:text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100'
                          : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${item.isZap ? 'bg-emerald-500' : 'bg-blue-600'}`}></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tablet Navigation - centered */}
            <div className="hidden md:flex lg:hidden flex-1 justify-center">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2 py-1.5 text-xs font-medium transition-all duration-200 relative no-underline whitespace-nowrap ${
                      isActive(item.href)
                        ? 'text-emerald-700 font-semibold'
                        : item.isZap
                          ? 'text-emerald-700 font-semibold hover:text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100'
                          : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${item.isZap ? 'bg-emerald-500' : 'bg-blue-600'}`}></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Button + Mobile menu - right */}
            <div className="flex flex-1 justify-end items-center gap-2">
            {/* CTA Button - Desktop */}
            <div className="hidden lg:block">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md hover:scale-[1.03] transition-all duration-200 no-underline"
              >
                Contact
              </Link>
            </div>

            {/* CTA Button - Tablet */}
            <div className="hidden md:block lg:hidden">
              <Link
                href="/contact"
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 no-underline"
              >
                Contact
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md rounded-lg shadow-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-all duration-200 rounded-lg no-underline ${
                      isActive(item.href)
                        ? 'text-emerald-700 font-semibold bg-emerald-50'
                        : item.isZap
                          ? 'text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="block w-full text-center mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

