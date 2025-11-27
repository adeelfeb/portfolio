'use client'

import { motion } from 'framer-motion'
import { Code, Zap, Layout, ShoppingCart, Database } from 'lucide-react'

export default function Services() {
  const services = [
    {
      icon: Code,
      title: 'Custom Full-Stack Development',
      description: 'Get a completely tailored solution built from the ground up. We utilize the power of the MERN Stack (MongoDB, Express, React, Node.js) to create dynamic, data-driven web applications.',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      icon: Zap,
      title: 'Next.js & React Solutions',
      description: 'Speed matters. We build blazing-fast server-side rendered apps using Next.js and React. Perfect for businesses that care about SEO rankings and user experience.',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      icon: Layout,
      title: 'CMS Development (WordPress & Webflow)',
      description: 'Need flexibility? We build robust websites using WordPress and Webflow that allow you to manage your content easily. We offer custom theme development and plugin integrations.',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce Platforms',
      description: 'Launching a store? We build secure, scalable e-commerce platforms with Stripe/PayPal integrations, inventory management, and intuitive user dashboards.',
      gradient: 'from-orange-600 to-red-600',
    },
    {
      icon: Database,
      title: 'API Integration & Backend',
      description: 'We provide Node.js backend development and custom API integrations to ensure your website talks perfectly to your CRM, database, or third-party software.',
      gradient: 'from-indigo-600 to-purple-600',
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive web development solutions tailored to your business needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


