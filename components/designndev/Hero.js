'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative min-h-[65vh] flex items-center pt-8 md:pt-12 bg-slate-950 overflow-hidden grain-overlay"
    >
      <Image
        src="/images/hero-texture.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-center opacity-40 saturate-50"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-14">
        <div className="relative max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium tracking-widest uppercase text-blue-400/90 mb-3"
          >
            Full-stack web development
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-[1.08] tracking-tight"
          >
            Your Vision.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Built & Deployed.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-5 sm:mb-6 leading-relaxed max-w-2xl"
          >
            <strong className="text-white">Full‑stack web development</strong> — production sites, clear scope, clean delivery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-start items-start sm:items-center"
          >
            <a
              href="/contact"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#featured-work"
              className="bg-white/10 text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base border border-white/25 hover:bg-white/20 hover:border-white/40 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            >
              View Our Work
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-4 text-sm text-gray-400"
          >
            50+ five-star reviews on Fiverr
          </motion.p>
        </div>
      </div>
    </section>
  )
}
