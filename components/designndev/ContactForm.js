'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useRecaptcha } from '../../utils/useRecaptcha'

export default function ContactForm({ showHeading = true }) {
  const { execute: executeRecaptcha, isAvailable: recaptchaAvailable } = useRecaptcha()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear status when user starts typing
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: data.message || 'Thank you! We will get back to you soon.' })
        setFormData({ name: '', email: '' })
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Something went wrong. Please try again.' })
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-12 md:py-14 bg-gradient-to-b from-gray-50 to-white scroll-mt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-1">
              Have a project in mind? Let's discuss how we can help bring your vision to life.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-lg w-full min-w-0"
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name Field */}
            <div className="min-w-0">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full min-w-0 max-w-full box-border px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 text-base"
                placeholder="Your name"
              />
            </div>

            {/* Email Field */}
            <div className="min-w-0">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full min-w-0 max-w-full box-border px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 text-base"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-w-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 sm:px-6 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Status Message */}
            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <p className="text-sm font-medium">{submitStatus.message}</p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}
