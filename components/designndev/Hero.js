'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Code } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[65vh] flex items-center justify-center pt-8 md:pt-12 bg-white overflow-hidden">
      {/* Web Development Themed Background */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        {/* Grid pattern like code editor */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Code-like brackets and symbols */}
        <div className="absolute top-20 left-10 text-6xl font-mono text-black/10 transform rotate-12">{"{"}</div>
        <div className="absolute top-40 right-20 text-5xl font-mono text-black/10 transform -rotate-12">{"}"}</div>
        <div className="absolute bottom-32 left-1/4 text-4xl font-mono text-black/10">{"<"}</div>
        <div className="absolute bottom-20 right-1/3 text-4xl font-mono text-black/10">{">"}</div>
        <div className="absolute top-1/3 right-1/4 text-3xl font-mono text-black/10">{"</"}</div>
        {/* Subtle geometric shapes */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 border-2 border-black/5 rounded-lg transform rotate-45" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border-2 border-black/5 rounded-full" />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Code className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Turn Your Vision Into a{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Powerful Digital Reality
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            We provide expert <strong className="text-gray-900">Full-Stack Website Development Services</strong> for ambitious startups and growing businesses. From lightning-fast <strong className="text-blue-600">Next.js</strong> applications to robust <strong className="text-purple-600">MERN Stack</strong> platforms, we build the technology your business needs to scale.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="https://www.fiverr.com/s/EgQz3ey"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://www.fiverr.com/s/EgQz3ey"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              View Our Work
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400/40 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-gray-600/60 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}

