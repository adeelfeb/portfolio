'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate navbar on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Check if a link is active
  const isActive = (href) => {
    if (typeof window === 'undefined') return false
    const pathname = window.location.pathname
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/tech-stack', label: 'Tech Stack' },
    { href: '/process', label: 'Process' },
    { href: '/blogs', label: 'Blog' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`navbar rounded-2xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white/90 backdrop-blur-sm shadow-md'
        }`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-bold no-underline hover:scale-110 transition-transform duration-300 inline-block"
              >
                <span>
                  <span className="text-blue-600">Design</span>
                  <span className="text-gray-700"> n </span>
                  <span className="text-purple-600">Dev</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative no-underline ${
                      isActive(item.href)
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tablet Navigation - Compact version */}
            <div className="hidden md:block lg:hidden">
              <div className="ml-6 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2 py-2 text-xs font-medium transition-all duration-200 relative no-underline ${
                      isActive(item.href)
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:block">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Quote
              </Link>
            </div>

            {/* CTA Button - Tablet */}
            <div className="hidden md:block lg:hidden">
              <Link
                href="/contact"
                className="px-4 py-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Quote
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
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="block w-full text-center mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Quote
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

