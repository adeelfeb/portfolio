'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

export default function Hero() {
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)
  const [shouldLoadVantaScripts, setShouldLoadVantaScripts] = useState(false)

  useEffect(() => {
    let idleId = null
    let timeoutId = null

    const triggerLoad = () => setShouldLoadVantaScripts(true)

    // Load when the hero is near viewport (or immediately if IO unsupported)
    const heroEl = vantaRef.current
    let observer = null
    if (heroEl && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry?.isIntersecting) {
            triggerLoad()
            observer.disconnect()
          }
        },
        { rootMargin: '200px 0px', threshold: 0.01 }
      )
      observer.observe(heroEl)
    } else {
      triggerLoad()
    }

    // Also load during idle time as a fallback
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => triggerLoad(), { timeout: 2500 })
      } else {
        timeoutId = window.setTimeout(() => triggerLoad(), 1200)
      }
    }

    return () => {
      if (observer) observer.disconnect()
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!shouldLoadVantaScripts) return

    // Initialize Vanta effect after scripts are loaded
    const initVanta = () => {
      if (typeof window !== 'undefined' && window.VANTA && vantaRef.current && !vantaEffect.current) {
        // Detect if device is mobile
        const isMobile = window.innerWidth < 768
        
        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: isMobile ? 0.6 : 1.00,
          scaleMobile: 0.6,
          color: 0xffffff,
          size: isMobile ? 0.8 : 1.30,
          backgroundColor: 0x0
        })
      }
    }

    let checkInterval = null
    let safetyTimeout = null

    // Check if scripts are already loaded
    if (typeof window !== 'undefined' && window.VANTA) {
      initVanta()
    } else {
      // Wait for scripts to load with optimized polling
      // Use requestAnimationFrame for better performance
      const checkVanta = () => {
        if (typeof window !== 'undefined' && window.VANTA) {
          initVanta()
          if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
          }
        }
      }
      
      // Use longer interval to reduce CPU usage
      checkInterval = setInterval(checkVanta, 200)

      // Cleanup interval after 5 seconds (reduced from 10)
      safetyTimeout = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
      }, 5000)
    }

    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
      }
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [shouldLoadVantaScripts])

  return (
    <>
      {/* Load Vanta.js scripts with Next.js Script component for optimal performance */}
      {/* Use afterInteractive to load after page becomes interactive, improving initial load */}
      {shouldLoadVantaScripts && (
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            // After Three.js loads, load Vanta Globe
            if (typeof window !== 'undefined' && !window.VANTA) {
              const script = document.createElement('script')
              script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js'
              script.async = true
              script.defer = true
              document.body.appendChild(script)
            }
          }}
        />
      )}

      <section id="home" className="relative min-h-[65vh] flex items-center pt-8 md:pt-12 bg-black overflow-hidden">
        {/* Vanta.js Globe Background */}
        <div ref={vantaRef} className="absolute inset-0 w-full h-full" />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12">
        <div className="relative max-w-4xl">
          <div className="text-left p-5 sm:p-6 md:p-8 lg:p-9 md:backdrop-blur-0 backdrop-blur-sm md:bg-transparent bg-black/20 rounded-2xl md:rounded-none">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-5 leading-tight drop-shadow-lg tracking-tight"
            >
              Your Vision.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Built & Deployed.
              </span>
            </motion.h1>

            {/* Subheadline — precise: web, software, deployments, hosting */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-5 sm:mb-6 leading-relaxed drop-shadow-md"
            >
              <strong className="text-white">Full‑stack website development</strong>, <strong className="text-white">integrations</strong>, <strong className="text-white">fixes</strong>, and <strong className="text-white">ongoing support</strong>.
              {' '}We build and maintain production websites: third‑party integrations, deployment fixes, performance tuning, and automation—clear scope and clean delivery.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start items-start sm:items-center"
            >
              <a
                href="/contact"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#work"
                className="bg-white/10 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base border border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:scale-[1.03] transition-all duration-300 cursor-pointer"
              >
                View Our Work
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

