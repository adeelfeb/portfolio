'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import BrowserMockup from './BrowserMockup'

export default function FeaturedWork() {
  const [portfolios, setPortfolios] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPortfolios() {
      try {
        const res = await fetch('/api/portfolios?publishedOnly=true&limit=4')
        const data = await res.json()
        if (data.success) {
          setPortfolios(data.data.portfolios || [])
        }
      } catch {
        setPortfolios([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPortfolios()
  }, [])

  const items = portfolios.length > 0 ? portfolios.slice(0, 4) : FALLBACK_ITEMS

  return (
    <section
      id="featured-work"
      aria-label="Featured work"
      className="py-14 md:py-20 bg-stone-50 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12"
        >
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mb-2">Portfolio</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Selected Projects
            </h2>
            <p className="text-lg text-gray-600 mt-3 max-w-xl">
              Real websites we&apos;ve designed, built, and shipped for clients.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors shrink-0"
          >
            View all work
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {items.map((project, index) => (
              <motion.div
                key={project.id ? String(project.id) : `featured-work-${index}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={index === 0 ? 'md:col-span-2' : ''}
              >
                <Link
                  href={project.isFallback ? '/portfolio' : `/portfolio/${project.slug}`}
                  className="group block"
                >
                  <BrowserMockup
                    src={project.featuredImage}
                    alt={`Screenshot of ${project.title}`}
                    title={project.projectUrl || project.title}
                    className="group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      {project.category && (
                        <p className="text-sm text-gray-500 mt-1">{project.category}</p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const FALLBACK_ITEMS = [
  { id: 'fallback-1', slug: 'portfolio', title: 'Custom Web Applications', category: 'Full-Stack Development', featuredImage: null, isFallback: true },
  { id: 'fallback-2', slug: 'portfolio', title: 'Next.js & React Sites', category: 'Frontend Development', featuredImage: null, isFallback: true },
]
