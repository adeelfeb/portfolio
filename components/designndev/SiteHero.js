'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import TextureOverlay from './TextureOverlay'

export default function SiteHero() {
  return (
    <section className="relative min-h-[min(85vh,720px)] flex items-center justify-start pt-20 pb-20 overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        <Image src="/images/hero-texture.webp" alt="" fill priority className="object-cover" sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-emerald-900/80 to-gray-900/50" />
      <div className="absolute inset-0 bg-gray-900/25" />
      <TextureOverlay opacity={0.1} className="mix-blend-overlay" />
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-left pt-2">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight max-w-3xl drop-shadow-lg"
        >
          Your Vision.{' '}
          <span className="text-emerald-400">Built & Deployed.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-gray-200 text-lg md:text-xl max-w-2xl mb-8 font-subheading leading-relaxed"
        >
          Full-stack web development — production sites, clear scope, clean delivery.
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
      </div>
    </section>
  )
}
