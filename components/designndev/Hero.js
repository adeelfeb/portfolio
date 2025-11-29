'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Script from 'next/script'

export default function Hero() {
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)

  useEffect(() => {
    // Initialize Vanta effect after scripts are loaded
    const initVanta = () => {
      if (typeof window !== 'undefined' && window.VANTA && vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xffffff,
          size: 1.30,
          backgroundColor: 0x0
        })
      }
    }

    let checkInterval = null

    // Check if scripts are already loaded
    if (typeof window !== 'undefined' && window.VANTA) {
      initVanta()
    } else {
      // Wait for scripts to load
      checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.VANTA) {
          initVanta()
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
        }
      }, 100)

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
      }, 10000)
    }

    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [])

  return (
    <>
      {/* Load Vanta.js scripts with Next.js Script component for optimal performance */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          // After Three.js loads, load Vanta Globe
          if (typeof window !== 'undefined' && !window.VANTA) {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js'
            script.onload = () => {
              // Vanta will be initialized by useEffect when it detects window.VANTA
            }
            document.body.appendChild(script)
          }
        }}
      />

      <section id="home" className="relative min-h-[65vh] flex items-center justify-center pt-8 md:pt-12 bg-black overflow-hidden">
        {/* Vanta.js Globe Background */}
        <div ref={vantaRef} className="absolute inset-0 w-full h-full" />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
          >
            Turn Your Vision Into a{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Digital Reality
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto mb-8 leading-relaxed drop-shadow-md"
          >
            We provide expert <strong className="text-white">Full-Stack Website Development Services</strong> for ambitious startups and growing businesses. From lightning-fast <strong className="text-blue-400">Next.js</strong> applications to robust <strong className="text-purple-400">MERN Stack</strong> platforms, we build the technology your business needs to scale.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
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
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              View Our Work
            </a>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  )
}

