'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Send, Loader2, Mail, Clock, ArrowRight } from 'lucide-react'
import { useRecaptcha } from '../../utils/useRecaptcha'

export default function ContactForm({ showHeading = true }) {
  const { execute: executeRecaptcha, isAvailable: recaptchaAvailable } = useRecaptcha()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectDetails: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (submitStatus) setSubmitStatus(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const recaptchaToken = recaptchaAvailable ? await executeRecaptcha() : null
    if (recaptchaAvailable && !recaptchaToken) {
      setSubmitStatus({ type: 'error', message: 'Security verification failed. Please refresh and try again.' })
      return
    }
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const payload = { ...formData }
      if (recaptchaToken) payload.recaptchaToken = recaptchaToken
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: data.message || 'Thank you! We will get back to you soon.' })
        setFormData({ name: '', email: '', projectDetails: '' })
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Something went wrong. Please try again.' })
      }
    } catch {
      setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="py-14 md:py-20 bg-stone-50 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mb-2">Contact</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Have a project in mind? Let&apos;s discuss how we can help bring your vision to life.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-200 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="projectDetails" className="block text-sm font-medium text-gray-700 mb-2">Project Details</label>
                <textarea
                  id="projectDetails"
                  name="projectDetails"
                  value={formData.projectDetails}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 resize-y"
                  placeholder="Tell us about your project — goals, timeline, budget, or any other details..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Sending...</>
                ) : (
                  <><Send className="w-5 h-5" />Send Message</>
                )}
              </button>

              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg text-sm font-medium ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.message}
                </motion.div>
              )}
            </form>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border border-gray-200 bg-slate-900 text-white p-6 md:p-8 grain-overlay relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6">Why reach out directly?</h3>
              <ul className="space-y-5">
                <li className="flex gap-3">
                  <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Quick response</p>
                    <p className="text-sm text-gray-400 mt-0.5">We typically reply within 24 hours on business days.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">hello@designndev.com</p>
                    <p className="text-sm text-gray-400 mt-0.5">Or use the form — we read every message.</p>
                  </div>
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-3">Prefer Fiverr?</p>
                <a
                  href="https://www.fiverr.com/s/EgQz3ey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Hire us on Fiverr
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
