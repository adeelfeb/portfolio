'use client'

import { motion } from 'framer-motion'
import { Code, Zap, Layout, ShoppingCart, Database, ArrowRight, Sparkles, CheckCircle, Globe, Palette, Gauge } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const services = [
  {
    icon: Code,
    title: 'Custom Full-Stack Development',
    description: 'Tailored MERN stack applications — dynamic, data-driven, and built from scratch.',
    accent: 'from-blue-600 to-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50/60',
    iconBg: 'bg-blue-100 text-blue-600',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    features: ['Custom architecture', 'RESTful APIs', 'Admin dashboards'],
    featured: true,
  },
  {
    icon: Zap,
    title: 'Next.js & React Solutions',
    description: 'Blazing-fast SSR apps that rank high on SEO with smooth UX.',
    accent: 'from-purple-600 to-purple-700',
    border: 'border-purple-200',
    bg: 'bg-purple-50/60',
    iconBg: 'bg-purple-100 text-purple-600',
    tags: ['Next.js', 'React', 'SSR', 'SEO'],
    features: ['Server-side rendering', 'Static generation', 'Route optimization'],
  },
  {
    icon: Layout,
    title: 'CMS Development',
    description: 'Flexible WordPress & Webflow sites with custom themes and plugins.',
    accent: 'from-emerald-600 to-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/60',
    iconBg: 'bg-emerald-100 text-emerald-600',
    tags: ['WordPress', 'Webflow', 'Themes'],
    features: ['Custom themes', 'Plugin dev', 'Easy content mgmt'],
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Platforms',
    description: 'Secure, scalable stores with Stripe/PayPal and inventory management.',
    accent: 'from-orange-600 to-orange-700',
    border: 'border-orange-200',
    bg: 'bg-orange-50/60',
    iconBg: 'bg-orange-100 text-orange-600',
    tags: ['Stripe', 'PayPal', 'Inventory'],
    features: ['Payment integration', 'Cart optimization', 'Order dashboards'],
  },
  {
    icon: Database,
    title: 'API Integration & Backend',
    description: 'Node.js backends and custom API integrations for your stack.',
    accent: 'from-indigo-600 to-indigo-700',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50/60',
    iconBg: 'bg-indigo-100 text-indigo-600',
    tags: ['REST APIs', 'Node.js', 'CRM'],
    features: ['Third-party APIs', 'Database design', 'Auth systems'],
  },
]

export default function Services() {
  const featured = services.find((s) => s.featured)
  const rest = services.filter((s) => !s.featured)

  return (
    <section id="services" aria-label="Services" className="py-10 md:py-16 bg-gradient-to-b from-white to-slate-50 relative scroll-mt-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/60 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            What We Do
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Our Services
          </h2>
          <p className="text-base text-gray-500 max-w-2xl">
            End-to-end web development — from concept to production
          </p>
        </motion.div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-10">
                <FeaturedServiceCard service={featured} />
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  Discuss your project
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="relative min-h-[240px] lg:min-h-full overflow-hidden">
                <Image
                  src="/images/women-coding.jpg"
                  alt="Web development team working on code"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex flex-wrap gap-2">
                    {featured.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-white/15 text-xs text-blue-200 border border-white/20 backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rest.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className={`rounded-2xl border ${service.border} ${service.bg} bg-white/80 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
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
      <div className="flex flex-wrap gap-2 mt-4">
        {service.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-1 rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            {tag}
          </span>
        ))}
      </div>
      <ul className="mt-4 space-y-1.5">
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </>
  )
}

function ServiceCard({ service }) {
  const Icon = service.icon
  return (
    <>
      <div className={`w-11 h-11 bg-gradient-to-br ${service.accent} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{service.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {service.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-white text-xs text-gray-600 border border-gray-200">
            {tag}
          </span>
        ))}
      </div>
      <ul className="space-y-1">
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
            <CheckCircle className="w-3 h-3 text-gray-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </>
  )
}
