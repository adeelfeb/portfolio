'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, MapPin, Rocket } from 'lucide-react'
import AnimatedTextSection from './AnimatedTextSection'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Animated Text Section */}
      <AnimatedTextSection />

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
              Ready to build?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Let&apos;s discuss your project requirements.
            </p>
            <a
              href="https://www.fiverr.com/s/EgQz3ey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Design n Dev
              </h3>
              <p className="text-gray-400 text-sm">
                Full-Stack Web Development & Next.js Solutions
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/" className="hover:text-white transition-colors cursor-pointer">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/#services" className="hover:text-white transition-colors cursor-pointer">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/#tech-stack" className="hover:text-white transition-colors cursor-pointer">
                    Tech Stack
                  </a>
                </li>
                <li>
                  <a href="/valentine" className="hover:text-white transition-colors cursor-pointer">
                    Valentine
                  </a>
                </li>
                <li>
                  <a href="/whatsapp-chat-analysis" className="hover:text-white transition-colors cursor-pointer">
                    Chat Analytics
                  </a>
                </li>
                <li>
                  <a href="/new-year-resolution" className="hover:text-white transition-colors cursor-pointer">
                    New Year Resolution
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Full-Stack Development</li>
                <li>Next.js Solutions</li>
                <li>CMS Development</li>
                <li>E-Commerce Platforms</li>
                <li>API Integration</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@designndev.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Worldwide</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© {currentYear} Design n Dev. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-500">
              Designed with help from{' '}
              <span className="text-gray-400">Sadia Tariq</span>
              {' — '}
              <a
                href="mailto:sadiaatariq162@gmail.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                sadiaatariq162@gmail.com
              </a>
              {' · '}
              <a
                href="https://github.com/sadiaatariq162-hue"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </footer>
  )
}
