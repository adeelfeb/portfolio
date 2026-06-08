'use client'

import { motion } from 'framer-motion'
import { Code, Zap, Layout, ShoppingCart, Database, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    icon: Code,
    title: 'Custom Full-Stack Development',
    description: 'Get a completely tailored solution built from the ground up. We utilize the power of the MERN Stack (MongoDB, Express, React, Node.js) to create dynamic, data-driven web applications.',
    accent: 'from-blue-600 to-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50/60',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    featured: true,
  },
  {
    icon: Zap,
    title: 'Next.js & React Solutions',
    description: 'Speed matters. We build blazing-fast server-side rendered apps using Next.js and React. Perfect for businesses that care about SEO rankings and user experience.',
    accent: 'from-purple-600 to-purple-700',
    border: 'border-purple-200',
    bg: 'bg-purple-50/60',
    tags: ['Next.js', 'React', 'SSR', 'SEO'],
  },
  {
    icon: Layout,
    title: 'CMS Development (WordPress & Webflow)',
    description: 'Need flexibility? We build robust websites using WordPress and Webflow that allow you to manage your content easily. We offer custom theme development and plugin integrations.',
    accent: 'from-emerald-600 to-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/60',
    tags: ['WordPress', 'Webflow', 'Themes'],
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Platforms',
    description: 'Launching a store? We build secure, scalable e-commerce platforms with Stripe/PayPal integrations, inventory management, and intuitive user dashboards.',
    accent: 'from-orange-600 to-orange-700',
    border: 'border-orange-200',
    bg: 'bg-orange-50/60',
    tags: ['Stripe', 'PayPal', 'Inventory'],
  },
  {
    icon: Database,
    title: 'API Integration & Backend',
    description: 'We provide Node.js backend development and custom API integrations to ensure your website talks perfectly to your CRM, database, or third-party software.',
    accent: 'from-indigo-600 to-indigo-700',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50/60',
    tags: ['REST APIs', 'Node.js', 'CRM'],
  },
]

export default function Services() {
  const featured = services.find((s) => s.featured)
  const rest = services.filter((s) => !s.featured)

  return (
    <section id="services" aria-label="Services" className="py-14 md:py-20 bg-stone-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-12"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-blue-600 mb-2">What we do</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Comprehensive web development solutions tailored to your business needs
          </p>
        </motion.div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-5 rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-10">
                <FeaturedServiceCard service={featured} />
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Discuss your project
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 md:p-8 flex flex-col justify-center min-h-[220px] lg:min-h-0">
                <div className="font-mono text-sm space-y-2 text-gray-400">
                  <p><span className="text-purple-400">const</span> <span className="text-blue-300">stack</span> = {'{'}</p>
                  <p className="pl-4">frontend: <span className="text-amber-200">&apos;React&apos;</span>,</p>
                  <p className="pl-4">backend: <span className="text-amber-200">&apos;Node.js&apos;</span>,</p>
                  <p className="pl-4">database: <span className="text-amber-200">&apos;MongoDB&apos;</span>,</p>
                  <p className="pl-4">deploy: <span className="text-emerald-300">&apos;production-ready&apos;</span></p>
                  <p>{'}'}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-white/10 text-xs text-blue-200 border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {rest.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className={`rounded-2xl border ${service.border} ${service.bg} bg-white/80 p-6 hover:shadow-md transition-all`}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedServiceCard({ service }) {
  const Icon = service.icon
  return (
    <>
      <div className={`w-14 h-14 bg-gradient-to-br ${service.accent} rounded-xl flex items-center justify-center mb-5 shadow-md`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
      <p className="text-gray-600 leading-relaxed">{service.description}</p>
      <div className="flex flex-wrap gap-2 mt-5">
        {service.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            {tag}
          </span>
        ))}
      </div>
    </>
  )
}

function ServiceCard({ service }) {
  const Icon = service.icon
  return (
    <>
      <div className={`w-11 h-11 bg-gradient-to-br ${service.accent} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{service.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {service.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-white text-xs text-gray-600 border border-gray-200">
            {tag}
          </span>
        ))}
      </div>
    </>
  )
}
