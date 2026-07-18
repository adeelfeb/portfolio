'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PartnershipFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [responseMessage, setResponseMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setResponseMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Partnership Inquiry from ${formData.organization || 'Individual'}`,
          message: `Organization: ${formData.organization}\n\n${formData.message}`,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus('error')
        setResponseMessage(data.message || 'Something went wrong.')
        return
      }

      setStatus('success')
      setResponseMessage(data.message || 'Thank you! We will get back to you soon.')
      setFormData({ name: '', email: '', organization: '', message: '' })
    } catch {
      setStatus('error')
      setResponseMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6">
              Partner With Us
            </h2>
            <p className="text-gray-600 text-lg font-subheading mb-8 leading-relaxed">
              Join our mission to create cleaner, healthier communities. We welcome partnerships with municipalities, NGOs, and organizations committed to environmental sustainability.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 font-subheading">Access to real-time environmental data</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 font-subheading">Custom analytics and reporting dashboards</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 font-subheading">API integration with existing systems</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 font-subheading">Community engagement tools and support</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="space-y-5">
                <div>
                  <label htmlFor="partner-name" className="block text-sm font-medium text-gray-700 mb-1.5 font-subheading">
                    Name *
                  </label>
                  <input
                    id="partner-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-subheading focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="partner-email" className="block text-sm font-medium text-gray-700 mb-1.5 font-subheading">
                    Email *
                  </label>
                  <input
                    id="partner-email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-subheading focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="partner-organization" className="block text-sm font-medium text-gray-700 mb-1.5 font-subheading">
                    Organization
                  </label>
                  <input
                    id="partner-organization"
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-subheading focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Your organization"
                  />
                </div>
                <div>
                  <label htmlFor="partner-message" className="block text-sm font-medium text-gray-700 mb-1.5 font-subheading">
                    Message *
                  </label>
                  <textarea
                    id="partner-message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-subheading focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    placeholder="Tell us about your partnership interest..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-fc-primary py-3.5 text-base disabled:opacity-60"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
              {responseMessage && (
                <p className={`mt-4 text-sm text-center font-subheading ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`} role="status">
                  {responseMessage}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
