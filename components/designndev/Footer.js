'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FOOTER_LOGO_CLASS = 'h-8 w-auto sm:h-8 md:h-9 lg:h-9 xl:h-10 object-contain'

function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (honeypot) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email: email.trim(),
          subject: 'Newsletter Subscription',
          message: 'Newsletter subscription request',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data.message || 'Something went wrong.')
        return
      }
      setStatus('success')
      setMessage(data.message || 'Thanks for subscribing.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong.')
    }
  }

  return (
    <div className="mt-5 max-w-sm">
      <p className="font-subheading text-xs tracking-wide text-gray-400 uppercase mb-2">Email updates</p>
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
        <input
          id="footer-newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== 'loading') { setStatus('idle'); setMessage(''); } }}
          placeholder="Your email"
          disabled={status === 'loading'}
          className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
        />
        <input type="text" name="website_url" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0" />
        <button type="submit" disabled={status === 'loading'} className="shrink-0 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-subheading text-white hover:bg-teal-500 transition-colors disabled:opacity-60">
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {message && <p className={`mt-2 text-xs font-subheading ${status === 'error' ? 'text-red-400' : 'text-teal-400'}`} role="status">{message}</p>}
    </div>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <section className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12 lg:justify-between lg:items-start">
            <div className="max-w-md shrink-0">
              <Link href="/" className="inline-flex items-center leading-none no-underline hover:opacity-90">
                <span className="text-lg font-bold tracking-tight text-white">
                  <span className="text-teal-400">Design</span>
                  <span className="text-gray-400"> n </span>
                  <span className="text-purple-400">Dev</span>
                </span>
              </Link>
              <FooterNewsletter />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-10 flex-1 lg:max-w-3xl">
              <div>
                <h4 className="font-subheading font-medium text-gray-400 text-xs tracking-wide uppercase mb-3">Menu</h4>
                <ul className="space-y-2 text-sm font-subheading">
                  <li><Link href="/about-us" className="text-gray-400 hover:text-teal-400 no-underline">About Us</Link></li>
                  <li><Link href="/faq" className="text-gray-400 hover:text-teal-400 no-underline">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-subheading font-medium text-gray-400 text-xs tracking-wide uppercase mb-3">Features</h4>
                <ul className="space-y-2 text-sm font-subheading">
                  <li><Link href="/whatsapp-chat-analysis" className="text-gray-400 hover:text-teal-400 no-underline">Chat Analytics</Link></li>
                  <li><Link href="/valentine" className="text-gray-400 hover:text-teal-400 no-underline">Valentine</Link></li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="font-subheading font-medium text-gray-400 text-xs tracking-wide uppercase mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm font-subheading">
                  <li><Link href="/signup" className="text-gray-400 hover:text-teal-400 no-underline">Sign Up</Link></li>
                  <li><Link href="/login" className="text-gray-400 hover:text-teal-400 no-underline">Sign In</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-teal-400 no-underline">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-3 md:py-4 border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-xs font-subheading">
            &copy; {currentYear} Design n Dev. All rights reserved.
          </p>
        </div>
      </section>
    </footer>
  )
}
