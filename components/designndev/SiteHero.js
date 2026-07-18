'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import TextureOverlay from './TextureOverlay'

export default function SiteHero() {
  return (
    <section className="relative min-h-[min(88vh,750px)] flex items-center justify-start pt-20 pb-20 overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <Image src="/images/coding-workspace.jpg" alt="Web development workspace" fill priority className="object-cover" sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-teal-950/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />
      <TextureOverlay opacity={0.08} className="mix-blend-overlay" />
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-left pt-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-teal-400/30 bg-teal-400/10 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-300 text-xs font-subheading font-medium tracking-wide uppercase">Available for new projects</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight max-w-3xl drop-shadow-lg"
        >
          Your Vision.{' '}
          <span className="text-teal-400">Built & Deployed.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mb-8 font-subheading leading-relaxed"
        >
          Full-stack web development — production sites, clear scope, clean delivery. Specializing in Next.js, MongoDB, and modern API integrations.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link href="/contact" className="btn-fc-primary text-base px-8 py-3.5 no-underline inline-flex items-center gap-2">
            Start Your Project
          </Link>
          <Link href="/portfolio" className="btn-fc-secondary text-base px-8 py-3.5 no-underline inline-flex items-center gap-2">
            View Our Work
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex items-center gap-6 mt-8 text-sm text-gray-400 font-subheading"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span>5.0 on Fiverr</span>
          </div>
          <span className="text-gray-600">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
            <span>50+ projects delivered</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
